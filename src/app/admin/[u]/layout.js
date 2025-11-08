'use client'
import { useEffect,useState,createContext } from "react"
import {SidebarInset,SidebarProvider,SidebarTrigger,} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/modules/app-sidebar/app-sidebar"
import { Spinner } from '@/components/ui/spinner'
import { redirect,useParams,useRouter } from 'next/navigation'
import { supabase } from "../../../../config/supabaseClient"
// import { createClient } from "@/utils/supabase/client"
// import { supabase } from "../../../../config/supabaseClient"

export const DataContext = createContext()





const PageLayout =  ({children}) => {
    const params = useParams()
    const router = useRouter()
    const [isLoading,setIsLoading] = useState(true)
    const [data,setData] = useState({profile:null})
    
    useEffect(() => {
        async function ValidateUser() {

            const { data: { user } } =  await supabase.auth.getUser()
        
            if (!user) {
                setIsLoading(false)
                router.push('/accounts/login')
            }

            const userID = user?.id
                  

            const { data: profile, error: profileError } = await supabase
            .from('admins')
            .select('*')
            .eq('id', userID)
            .single()

            if (!profile || profileError) {
                 setData(prev=>({...prev,profile:null}))
                alert('No profile found for this user, try reoading this page')
                setIsLoading(false)
                router.push('/accounts/login')
            }
            
            console.log(user,profile)
            
            
            // Compare the logged-in user's handle to the route param
            if (params.u !== profile.handle) {
                console.warn(`Unauthorized access attempt by ${profile.handle}`)
                setIsLoading(false)
                router.push(`/admin/${profile.handle}`) // redirect them to *their own* admin page
            }

            setData(prev=>({...prev,profile}))
            setIsLoading(false)

        }

        ValidateUser()
    }, [params.u,router,supabase])

    
        
    if (isLoading || !data.profile) return  <div className='overflow-hidden flex justify-center items-center h-full'>
      <Spinner className={'size-8 text-core'} spinning={true}/>
    </div>
    
    // ✅ Authorized — now you can safely load their data


  return (
        <DataContext.Provider value={{data,setData}}>
            {children}
        </DataContext.Provider>
  )
}

export default PageLayout
