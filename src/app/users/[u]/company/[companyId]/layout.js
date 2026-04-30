"use client"

import { useEffect, useState, createContext, useContext } from "react"
import { useRouter, useParams, usePathname } from "next/navigation"
import supabase from "@/config/supabaseClient"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import { AppSidebar } from "@/components/sidebars/company-sidebar/company-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import CompanyHeader from "@/components/headers/company-dashboard-header"
import { Button } from "@/components/ui/button"
import { Bell } from "lucide-react"
import { DataContext } from "../../layout"

export const CompanyInfoContext = createContext()

export default function CompanyLayout({ children }) {
  const router = useRouter()
  const params = useParams()
  const pathname = usePathname()
  const { data } = useContext(DataContext)

  const [info, setInfo] = useState()
  const [modules, setModules] = useState([])
  const [branches, setBranches] = useState([])
  const [currencies, setCurrencies] = useState([])
  const [accessLevels, setAccessLevels] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [subscriptionVerified, setSubscriptionVerified] = useState(false)
  const [hasSubscription, setHasSubscription] = useState(null)

  const { u, companyId } = params

  function capitalizeFirstLetter(string) {
    if (typeof string !== 'string' || string.length === 0) {
      return string
    }
    return string.charAt(0).toUpperCase() + string.slice(1)
  }

  useEffect(() => {
    // Safety timeout: prevent infinite spinner on back navigation
    const timeout = setTimeout(() => {
      console.warn("Company layout loading timeout - forcing state reset")
      setIsLoading(false)
      setIsRedirecting(false)
      setSubscriptionVerified(true)
    }, 7000)

    async function checkAccess() {
      let redirectHappened = false

      try {
        // Step 1: Auth user
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
          toast("Please log in to continue.")
          router.push("/accounts/login")
          return
        }

        // Step 2: Get company
        const { data: companiesLiteData, error: companiesLiteError } = await supabase
          .from("companies_lite")
          .select("company_id, name, slug, owner, currencies")
          .eq("company_id", companyId)
          .single()

        if (companiesLiteError || !companiesLiteData) {
          toast("Company not found.")
          router.push(`/users/${params.u}`)
          return
        }

        let accessLevel = null
        let branchId = null
        let suspended = false
        let accessLevelScope = null

        // Step 3a: Access levels
        const { data: accessLevelsData, error: accessLevelsError } = await supabase
          .from("access_level")
          .select("*")
          .order("level_number", { descending: false })

        if (accessLevelsError) {
          console.error("Access levels fetch error:", accessLevelsError)
          toast("Could not load access levels.")
          router.push(`/users/${u}`)
          return
        }

        setAccessLevels(accessLevelsData || [])

        // Owner or staff check
        if (companiesLiteData.owner === user.id) {
          accessLevel = "owner"
          accessLevelScope = "company"
        } else {
          const { data: staffLiteData, error: staffError } = await supabase
            .from("staff_lite")
            .select("access_level, branch, status")
            .eq("staff_id", user.id)
            .eq("company", companiesLiteData.company_id)
            .single()

          if (staffError || !staffLiteData) {
            toast("You do not belong to this company.")
            router.push(`/users/${u}`)
            return
          }

          accessLevel = staffLiteData.access_level
          suspended = staffLiteData.status === "suspended"

          const accessLevelRecord = accessLevelsData?.find(al => al.key === staffLiteData.access_level)
          accessLevelScope = accessLevelRecord?.access

          if (accessLevelScope === "branch") {
            branchId = staffLiteData.branch
          }
        }

        // ──────────────────────────────────────────────────────────────
        // SUBSCRIPTION GATEKEEPER (moved early)
        // ──────────────────────────────────────────────────────────────
        const { data: subscriptions, error } = await supabase
          .from("company_subscriptions")
          .select("id, status, end_date, grace_period_end")
          .eq("company", companiesLiteData.company_id)

        if (error) {
          console.error("Subscription fetch error:", error)
        }

        const allSubscriptions = subscriptions || []

        // 🎯 Define allowed statuses
        const allowedStatuses = ["active", "trialing", "past_due"]

        // 🎯 Filter manually
        const validSubscriptions = allSubscriptions.filter((sub) =>
          allowedStatuses.includes(sub.status)
        )

        // ❗ Must be EXACTLY ONE
        const hasValidSubscription = validSubscriptions.length === 1

        // Extra safety: ensure status is truly valid
        const currentSubscription = hasValidSubscription
          ? validSubscriptions[0]
          : null

        setHasSubscription(!!currentSubscription)
        setSubscriptionVerified(true)

        // Check pathname inside effect, not in dependencies
        if (!currentSubscription && !pathname?.includes("/subscriptions")) {
          console.log("Invalid subscription state → redirecting")
          redirectHappened = true
          setIsRedirecting(true)
          router.push(`/users/${u}/company/${companyId}/subscriptions`)
        }

        // ──────────────────────────────────────────────────────────────
        // Only continue if we have subscription OR we are already on subscriptions page
        // ──────────────────────────────────────────────────────────────
        if (!redirectHappened) {
          // Set company info
          setInfo({
            ...companiesLiteData,
            id: companiesLiteData.company_id,
            accessLevel,
            accessLevelScope,
            branchId,
            suspended,
            staff_id: user.id,
            company_id: companiesLiteData.company_id,
          })

          // Currencies
          const { data: currenciesArray } = await supabase
            .from("currencies")
            .select("name, code, flag")
            .in("code", companiesLiteData.currencies || [])

          setCurrencies(currenciesArray || [])

          // Branches (with access filtering)
          const { data: branchesData } = await supabase
            .from("branches_lite")
            .select("*")
            .eq("company", companiesLiteData.company_id)

          let allowedBranches = []
          if (accessLevelScope === "company") {
            allowedBranches = branchesData || []
          } else if (accessLevelScope === "branch" && branchId) {
            allowedBranches = branchesData?.filter(b => b.id === branchId) || []
          }

          setBranches(allowedBranches)
        }

      } catch (err) {
        console.error("Error during access check:", err)
        toast("Failed to fetch company data.")
        setSubscriptionVerified(true) // Mark as verified even on error
        router.push(`/users/${u}`)
      } finally {
        // Only stop loading if we are NOT redirecting
        if (!redirectHappened) {
          setIsLoading(false)
          setIsRedirecting(false)
        }
        // Ensure subscription is marked as verified
        setSubscriptionVerified(true)
        // Always clear timeout
        clearTimeout(timeout)
        // If redirectHappened = true → spinner stays until navigation completes
      }
    }

    checkAccess()

    // Cleanup: clear timeout on unmount
    return () => clearTimeout(timeout)
  }, [companyId, u])

  // ──────────────────────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────────────────────
  // If subscription not yet verified, show spinner
  if (!subscriptionVerified) {
    return (
      <div className='overflow-hidden flex text-core justify-center items-center h-full'>
        <Spinner className='size-8 text-army' spinning={true} />
      </div>
    )
  }

  // If no subscription and not on subscriptions page, show spinner while redirecting
  if (!hasSubscription && !pathname?.includes("/subscriptions")) {
    return (
      <div className='overflow-hidden flex text-core justify-center items-center h-full'>
        <Spinner className='size-8 text-army' spinning={true} />
      </div>
    )
  }

  if (isLoading || isRedirecting) {
    return (
      <div className='overflow-hidden flex text-core justify-center items-center h-full'>
        <Spinner className='size-8 text-army' spinning={true} />
      </div>
    )
  }

  if (!info) return null

  return (
    <CompanyInfoContext.Provider
      value={{
        info,
        setInfo,
        modules,
        branches,
        currencies,
        accessLevels,
        user: data?.profile,
        accessLevel: info?.accessLevel,
        accessLevelScope: info?.accessLevelScope,
        branchId: info?.branchId,
        suspended: info?.suspended,
        staff_id: info?.staff_id,
        company_id: info?.company_id,
      }}
    >
      {children}
    </CompanyInfoContext.Provider>
  )
}

// ReusableCompanySidebar remains exactly the same
export const ReusableCompanySidebar = ({ children }) => {
  const { info, modules, branches, accessLevel, accessLevelScope, branchId, suspended } = useContext(CompanyInfoContext)

  return (
    <SidebarProvider className="relative">
      <AppSidebar 
        company={info} 
        branches={branches}
        accessLevel={accessLevel}
        accessLevelScope={accessLevelScope}
        branchId={branchId}
        suspended={suspended}
      />
      <SidebarInset className="h-svh overflow-hidden static">
        <div className="flex flex-col h-full">
          <div className="h-12 border-b">
            <CompanyHeader>
              <div className="flex">
                <Button variant="ghost" size="icon" className="relative ml-3">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-0.5 -right-0.5 text-[9px] bg-red-600 translate-x-[-48.8%] translate-y-[48.9%] text-white font-semibold flex items-center justify-center size-3.5 rounded-full">
                    3
                  </span>
                </Button>
              </div>
            </CompanyHeader>
          </div>
          <div className="grow overflow-y-hidden p-2 md:p-4">
            {info?.suspended ? (
              <div className="p-4 text-center text-red-600 font-bold">
                Your access has been suspended. You cannot access modules or branches.
              </div>
            ) : (
              children
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

