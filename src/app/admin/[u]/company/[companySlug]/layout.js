"use client"

import { useEffect, useState, createContext ,useContext} from "react"
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
 
  const [isLoading, setIsLoading] = useState(true)
  const { u, companySlug } = params

  // -------------------------------
  // DIRECT ACCESS CHECK INSIDE LAYOUT
  // -------------------------------
  useEffect(() => {
    async function checkAccess() {
      try {
        // Step 1: Get authenticated user
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
          toast("Please log in to continue.")
          router.push("/accounts/login")
          return
        }

        // Step 2: Fetch the company
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

        // Step 3: Check ownership
        if (companyData.owner !== user.id) {
          toast("Access denied. You do not belong to this company.")
          router.push("/accounts/login")
          return
        }

        // SUCCESS → company is valid
        setInfo(companyData)

      } catch (e) {
        console.error("Company access error:", e)
        toast("Unexpected error occurred.")
        router.push("/accounts/login")
      } finally {
        setIsLoading(false)
      }
    }

    checkAccess()
  }, [companySlug,u, router,refreshKey])

  // -------------------------------
  // LOADING UI
  // -------------------------------
  if (isLoading) {
    return (
      <div className='overflow-hidden flex text-core justify-center items-center h-full'>
        <Spinner className='size-8 text-army' spinning={true} />
        {/* <p className=" ml-1 text-[11px] text-army">loading company data</p> */}
      </div>
    )
  }

  // -------------------------------
  // NO ACCESS (redirect already happened)
  // -------------------------------
  if (!info) return null

  // -------------------------------
  // MAIN LAYOUT
  // CONTEXT NOW RECEIVES COMPANY DATA
  // -------------------------------
  return (
   
     <CompanyInfoContext.Provider value={{ info, setInfo }}>
      <SidebarProvider className="relative">
        <AppSidebar company={info&&info} />

        <SidebarInset className="h-svh overflow-hidden static">
          <div className="flex flex-col h-full">

            {/* HEADER */}
            <div className="h-12 border-b">
              <CompanyHeader>
                <div className="flex">
                  <Button variant='ghost' size='icon' className='relative ml-3'>
                   <Bell className='h-5 w-5'/>
                   <span className='absolute -top-0.5 -right-0.5 text-[9px] bg-red-600 translate-x-[-48.8%] translate-y-[48.9%] text-white font-semibold flex items-center justify-center size-3.5 rounded-full'>3</span>
                 </Button>
                </div>
              </CompanyHeader>
            </div>

            {/* CONTENT */}
            <div className="flex-grow overflow-y-auto p-2 md:p-4">
              {children}
            </div>

          </div>
        </SidebarInset>
      </SidebarProvider>
      </CompanyInfoContext.Provider>
    
  )
}
