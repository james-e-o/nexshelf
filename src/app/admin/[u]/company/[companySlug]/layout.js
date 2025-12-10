"use client"

import { useEffect, useState, createContext, useContext } from "react"
import { useRouter, useParams } from "next/navigation"
import { supabase } from "../../../../../../config/supabaseClient"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import { AppSidebar } from "@/components/modules/company-modules/company-sidebar/company-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import CompanyHeader from "@/components/modules/company-modules/company-dashboard-header"
import { Button } from "@/components/ui/button"
import { Bell } from "lucide-react"
import { RefreshContext } from "../../layout"

export const CompanyInfoContext = createContext()

export default function CompanyLayout({ children }) {
  const router = useRouter()
  const params = useParams()
  const { refreshKey } = useContext(RefreshContext)

  const [info, setInfo] = useState()
  const [modules, setModules] = useState([])  // ← ADD MODULES STATE
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
          .select("id, name, slug, owner")
          .eq("slug", params.companySlug)
          .single()

        if (companyError || !companyData) {
          toast("Company not found.")
          router.push(`/admin/${params.u}`)
          return
        }

        // Step 3: Ownership check
        if (companyData.owner !== user.id) {
          toast("Access denied. You do not belong to this company.")
          router.push("/accounts/login")
          return
        }

        // SUCCESS → set company info
        setInfo(companyData)

        // --------------------------------------------
        // Step 4: Fetch company modules (YOUR REQUEST)
        // --------------------------------------------
        const { data: modulesData, error: modulesError } = await supabase
          .from("company_modules")
          .select("name, mod_key")
          .eq("company", companyData.id)

        if (modulesError) {
          console.error("Module fetch error:", modulesError)
        } else {
          // Convert DB → UI format
          const transformedModules = modulesData.map(({ name, mod_key }) => ({
            title:capitalizeFirstLetter(mod_key),
            slug: mod_key,
          }))
          setModules(transformedModules)
        }

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
    <CompanyInfoContext.Provider value={{ info, setInfo, modules }}>
      <SidebarProvider className="relative">
        <AppSidebar company={info} modules={modules} /> {/* ← PASS MODULES IF NEEDED */}

        <SidebarInset className="h-svh overflow-hidden static">
          <div className="flex flex-col h-full">

            <div className="h-12 border-b">
              <CompanyHeader>
                <div className="flex">
                  <Button variant='ghost' size='icon' className='relative ml-3'>
                    <Bell className='h-5 w-5' />
                    <span className='absolute -top-0.5 -right-0.5 text-[9px] bg-red-600 translate-x-[-48.8%] translate-y-[48.9%] text-white font-semibold flex items-center justify-center size-3.5 rounded-full'>3</span>
                  </Button>
                </div>
              </CompanyHeader>
            </div>

            <div className="grow overflow-y-auto p-2 md:p-4">
              {children}
            </div>

          </div>
        </SidebarInset>
      </SidebarProvider>
    </CompanyInfoContext.Provider>
  )
}
