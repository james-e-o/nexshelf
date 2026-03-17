"use client"

import { useEffect, useState, createContext, useContext } from "react"
import { useRouter, useParams } from "next/navigation"
import { supabase } from "../../../../../../config/supabaseClient"
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
  const { data } = useContext(DataContext)

  const [info, setInfo] = useState()
  const [modules, setModules] = useState([])  // ← ADD MODULES STATE
  const [branches, setBranches] = useState([])  // ← ADD BRANCHES STATE
  const [currencies, setCurrencies] = useState([])  // ← ADD CURRENCIES STATE
  const [accessLevels, setAccessLevels] = useState([])  // ← ADD ACCESS LEVELS STATE
  const [isLoading, setIsLoading] = useState(true)
  const [hasActiveSubscription, setHasActiveSubscription] = useState(true)
  const [noSubscriptionMessage, setNoSubscriptionMessage] = useState(false)

  const { u, companySlug } = params

  function capitalizeFirstLetter(string) {
    if (typeof string !== 'string' || string.length === 0) {
      return string; // Handle non-string or empty input
    }
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  useEffect(() => {
    async function checkAccess() {
      try {
        // Step 1: Auth user
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
          toast("Please log in to continue.")
          router.push("/accounts/login")
          return
        }

        // Step 2: Check if user is owner or staff of this company
        const { data: companiesLiteData, error: companiesLiteError } = await supabase
          .from("companies_lite")
          .select("company_id, name, slug, owner, currencies")
          .eq("slug", companySlug)
          .single()

        if (companiesLiteError || !companiesLiteData) {
          toast("Company not found.")
          router.push(`/users/${params.u}`)
          return
        }

        let accessLevel = null
        let branchId = null
        let suspended = false
        let accessLevelScope = null // 'company' or 'branch'

        // Step 3a: Fetch ALL access levels once (will be used for scope lookup AND display)
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

        // Check if user is owner
        if (companiesLiteData.owner === user.id) {
          accessLevel = "owner"
          accessLevelScope = "company" // Owners have company-wide access
        } else {
          // Check if user is staff of this company
          const { data: staffLiteData, error: staffError } = await supabase
            .from("staff_lite")
            .select("access_level, branch, status")
            .eq("staff_id", user.id)
            .eq("company", companiesLiteData.company_id)
            .single()

          if (staffError || !staffLiteData) {
            console.error("Staff fetch error:", staffError)
            toast("You do not belong to this company.")
            router.push(`/users/${u}`)
            return
          }

          accessLevel = staffLiteData.access_level 
          suspended = staffLiteData.status === "suspended"

          // Look up access level scope from already-fetched data (no additional query)
          const accessLevelRecord = accessLevelsData?.find(al => al.key === staffLiteData.access_level)
          accessLevelScope = accessLevelRecord?.access  

          console.log("Determined access level:", accessLevel)
          console.log("Determined access level scope:", accessLevelScope)
          // Only restrict branchId if they have 'branch' access scope
          if (accessLevelScope === "branch") {
            branchId = staffLiteData.branch 
          } else if (accessLevelScope === "company") {
            // Company-level staff can see all branches, no restriction
            branchId = null
          }
        }

        // Step 3b: Set company info with access context
        setInfo({
          ...companiesLiteData,
          id: companiesLiteData.company_id,
          accessLevel,
          accessLevelScope, // New property to track scope
          branchId,
          suspended
        })

        // Step 3c: Check for active company subscription
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from("company_subscriptions")
          .select("*")
          .eq("company_id", companiesLiteData.company_id)
          .eq("status", "active")
          .single()

        if (subscriptionError && subscriptionError.code !== "PGRST116") {
          // PGRST116 means no rows found - that's expected
          console.error("Subscription fetch error:", subscriptionError)
        }

        // TODO: Remove this for testing - always allow access
        setHasActiveSubscription(true)
        const hasSubscription = true

        // If no active subscription:
        // - Company-level staff/owner -> redirect to subscriptions page
        // - Branch-level staff -> show "no subscription" message
        if (!hasSubscription) {
          if (accessLevelScope === "company") {
            // Owner or company-level staff (finance, admin_manager) -> redirect to subscriptions
            console.log("No active subscription found, redirecting company-level staff to subscriptions")
            router.push(`/users/${u}/company/${companySlug}/subscriptions`)
            return
          } else if (accessLevelScope === "branch") {
            // Branch-level staff -> show message
            console.log("Branch-level staff accessing company with no subscription")
            setNoSubscriptionMessage(true)
            setIsLoading(false)
            return
          }
        }

        // Step 4: Fetch company currencies
        const { data: currenciesArray, error: currenciesError } = await supabase
          .from("currencies")
          .select("name, code, flag")
          .in("code", companiesLiteData.currencies || [])

        if (currenciesError) {
          console.error("Failed to fetch currencies:", currenciesError)
          setCurrencies([])
        } else {
          setCurrencies(currenciesArray || [])
        }

        // Step 5: Fetch company modules
        // const { data: modulesData, error: modulesError } = await supabase
        //   .from("company_modules")
        //   .select("name, mod_key")
        //   .eq("company", companiesLiteData.company_id)

        // if (modulesError) {
        //   console.error("Company modules fetch error:", modulesError)
        //   setModules([])
        // } else {
        //   const { data: allModulesData, error: allModulesError } = await supabase
        //     .from("modules")
        //     .select("key, companylevel, branchlevel")
        //     .in("key", modulesData.map(mod => mod.mod_key))

        //   const transformedModules = modulesData.map(({ mod_key }) => {
        //     const levels = allModulesData?.find(m => m.key === mod_key) || {}
        //     return {
        //       title: capitalizeFirstLetter(mod_key),
        //       slug: mod_key,
        //       levels: {
        //         companylevel: levels.companylevel || false,
        //         branchlevel: levels.branchlevel || false
        //       }
        //     }
        //   })

        //   // Module filtering based on access level
        //   function canAccessModule(module) {
        //     if (accessLevel === "owner") return true
        //     if (accessLevel === "admin") return true
        //     if (accessLevel === "supervisor")
        //       return module.levels.branchlevel || module.levels.companylevel
        //     if (accessLevel === "finance") return module.slug.includes("finance")
        //     if (accessLevel === "operator") return module.levels.branchlevel
        //     return false
        //   }

        //   setModules(transformedModules.filter(canAccessModule))
        // }

        // // Step 6: Fetch branches with access filter
        // console.log("BRANCHES FETCH DEBUG:", { 
        //   accessLevelScope, 
        //   branchId, 
        //   company_id: companiesLiteData.company_id 
        // })
        
        const { data: branchesData, error: branchesError } = await supabase
          .from("branches_lite")
          .select("*")
          .eq("company", companiesLiteData.company_id)
       
        let allowedBranches = []
        
        if (branchesError) {
          console.error("Branches fetch error:", branchesError)
        } else if (accessLevelScope === "company") {
          // Company-level staff (owner, finance, admin_manager) see all branches
          console.log("COMPANY-LEVEL: showing all branches")
          allowedBranches = branchesData
        } else if (accessLevelScope === "branch") {
          // Branch-level staff see only their assigned branch
          if (branchId && branchesData) {
            allowedBranches = branchesData.filter(b => b.id === branchId)
          } else {
            console.log("No branch ID assigned to branch-level staff")
          }
        } 
        
        console.log(branchesData, allowedBranches)
        setBranches(allowedBranches || [])

        // Access levels already fetched in Step 3a and set in state
      
      } catch (err) {
        console.error("Error during access check:", err)  
        toast("Failed to fetch company data.")
        router.push(`/users/${u}`)
      } finally {
        setIsLoading(false)
      }
    }

    checkAccess()
  }, [companySlug, u, router])

  if (isLoading) {
    return (
      <div className='overflow-hidden flex text-core justify-center items-center h-full'>
        <Spinner className='size-8 text-army' spinning={true} />
      </div>
    )
  }

  if (noSubscriptionMessage) {
    return (
      <div className='min-h-screen bg-linear-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4'>
        <div className='bg-white rounded-lg shadow-lg p-8 max-w-md text-center'>
          <div className='mb-4'>
            <div className='inline-flex items-center justify-center h-16 w-16 rounded-full bg-amber-100'>
              <svg className='h-8 w-8 text-amber-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 9v2m0 4v2m0-6a4 4 0 110-8 4 4 0 010 8z' />
              </svg>
            </div>
          </div>
          <h1 className='text-2xl font-bold text-core mb-2'>No Active Subscription</h1>
          <p className='text-slate-600 mb-6'>
            Your company does not have a current running subscription, or the subscription has expired.
          </p>
          <p className='text-slate-700 font-medium mb-6'>
            Please contact your Company Administrator to set up or renew a subscription.
          </p>
          <Button
            onClick={() => router.push(`/users/${u}`)}
            variant='outline'
            className='w-full border-slate-300 hover:bg-slate-50'
          >
            Back to Dashboard
          </Button>
        </div>
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
        suspended: info?.suspended
      }}
    >
      {children}
    </CompanyInfoContext.Provider>
  )
}



export const ReusableCompanySidebar = ({ children }) => {
  const { info, modules, branches } = useContext(CompanyInfoContext)

  return (
    <SidebarProvider className="relative">
      <AppSidebar 
        company={info} 
        branches={branches}
      // modules={modules}
       />
      <SidebarInset className="h-svh overflow-hidden static">
        <div className="flex flex-col h-full">
          <div className="h-12 border-b">
            <CompanyHeader>
              <div className="flex">
                <Button variant="ghost" size="icon" className="relative ml-3">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-0.5 -right-0.5 text-[9px] bg-red-600 translate-x-[-48.8%] translate-y-[48.9%] text-white font-semibold flex items-center justify-center size-3.5 rounded-full">3</span>
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


