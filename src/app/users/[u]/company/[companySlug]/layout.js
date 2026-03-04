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
import { RefreshContext, DataContext } from "../../layout"

export const CompanyInfoContext = createContext()

export default function CompanyLayout({ children }) {
  const router = useRouter()
  const params = useParams()
  const { refreshKey } = useContext(RefreshContext)
  const { data } = useContext(DataContext)

  const [info, setInfo] = useState()
  const [modules, setModules] = useState([])  // ← ADD MODULES STATE
  const [branches, setBranches] = useState([])  // ← ADD BRANCHES STATE
  const [currencies, setCurrencies] = useState([])  // ← ADD CURRENCIES STATE
  const [isLoading, setIsLoading] = useState(true)

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

        // Step 2: Fetch company
        const { data: companyData, error: companyError } = await supabase
          .from("companies")
          .select("id, name, slug, owner, currencies")
          .eq("slug", companySlug)
          .single()

        if (companyError || !companyData) {
          toast("Company not found.")
          router.push(`/users/${params.u}`)
          return
        }

        // Step 3: Determine membership (owner OR staff)
        let roleType = null
        let accessLevel = null
        let branchId = null
        let suspended = false
        let role = null

        if (companyData.owner === user.id) {
          roleType = "owner"
          accessLevel = "owner"
        } else {
          const { data: staffData, error: staffError } = await supabase
            .from("staff")
            .select("access_level, branch, status, role")
            .eq("id", user.id)
            .eq("company", companyData.id)
            .single()

          if (staffError || !staffData) {
            console.error("Staff fetch error:", staffError)
            toast("You do not belong to this company.")
            router.push(`/users/${u}`)
            return
          }

          roleType = "staff"
          accessLevel = staffData.access_level || "operator"
          branchId = staffData.branch || null
          suspended = staffData.status === "suspended" || staffData.status === "terminated"
          role = staffData.role || null
        }

        // Step 4: Set company info with access context
        setInfo({
          ...companyData,
          roleType,
          accessLevel,
          branchId,
          suspended,
          role
        })

        // Step 5: Fetch company currencies
        const { data: currenciesArray, error: currenciesError } = await supabase
          .from("currencies")
          .select("name, code, flag")
          .in("code", companyData.currencies || [])

        if (currenciesError) {
          console.error("Failed to fetch currencies:", currenciesError)
          setCurrencies([])
        } else {
          setCurrencies(currenciesArray || [])
        }

        // Step 6: Fetch company modules
        const { data: modulesData, error: modulesError } = await supabase
          .from("company_modules")
          .select("name, mod_key")
          .eq("company", companyData.id)

        if (modulesError) {
          console.error("Company modules fetch error:", modulesError)
          setModules([])
        } else {
          const { data: allModulesData, error: allModulesError } = await supabase
            .from("modules")
            .select("key, companylevel, branchlevel")
            .in("key", modulesData.map(mod => mod.mod_key))

          const transformedModules = modulesData.map(({ mod_key }) => {
            const levels = allModulesData?.find(m => m.key === mod_key) || {}
            return {
              title: capitalizeFirstLetter(mod_key),
              slug: mod_key,
              levels: {
                companylevel: levels.companylevel || false,
                branchlevel: levels.branchlevel || false
              }
            }
          })

          // Module filtering based on access level
          function canAccessModule(module) {
            if (roleType === "owner") return true
            if (accessLevel === "admin") return true
            if (accessLevel === "supervisor")
              return module.levels.branchlevel || module.levels.companylevel
            if (accessLevel === "finance") return module.slug.includes("finance")
            if (accessLevel === "operator") return module.levels.branchlevel
            return false
          }

          setModules(transformedModules.filter(canAccessModule))
        }

        // Step 7: Fetch branches with access filter
        const { data: branchesData, error: branchesError } = await supabase
          .from("branches")
          .select("*")
          .eq("company", companyData.id)

        let allowedBranches = []

        if (branchesError) {
          console.error("Branches fetch error:", branchesError)
        } else if (roleType === "owner" || accessLevel === "admin") {
          // Owners and admins see all branches
          allowedBranches = branchesData
        } else if (branchId) {
          // Staff with assigned branch see only their branch
          allowedBranches = branchesData.filter(b => b.id === branchId)
        } else {
          // Staff without assigned branch see no branches (for now)
          // They can still access the company dashboard, just not branch-specific features
          allowedBranches = []
        }

        setBranches(allowedBranches || [])

      } catch (e) {
        console.error("Company access error:", e)
        toast("Unexpected error occurred.")
        router.push("/accounts/login")
      } finally {
        setIsLoading(false)
      }
    }

    checkAccess()
  }, [companySlug, u, router, refreshKey])

  if (isLoading) {
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
        user: data?.profile,
        roleType: info?.roleType,
        accessLevel: info?.accessLevel,
        branchId: info?.branchId,
        suspended: info?.suspended,
        role: info?.role
      }}
    >
      {children}
    </CompanyInfoContext.Provider>
  )
}



export const ReusableCompanySidebar = ({ children }) => {
  const { info, modules } = useContext(CompanyInfoContext)

  return (
    <SidebarProvider className="relative">
      <AppSidebar company={info} modules={modules} />
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
          <div className="grow overflow-y-auto p-2 md:p-4">
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


