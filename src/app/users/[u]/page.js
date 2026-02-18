'use client'

import { useEffect, useState,useContext } from 'react'       
import { supabase } from '../../../../config/supabaseClient'
import { Spinner } from '@/components/ui/spinner'
import { Bell } from 'lucide-react'
import { DataContext } from './layout'
import { AppSidebar } from '@/components/sidebars/app-sidebar/app-sidebar'
import {SidebarInset,SidebarProvider,SidebarTrigger,} from "@/components/ui/sidebar"
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/headers/dashboard-header'
import { Button } from '@/components/ui/button'
import { FileSearch, Factory} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { AlertCircleIcon, CheckCircle2Icon, PopcornIcon } from "lucide-react"
import {  Alert,  AlertDescription,  AlertTitle,} from "@/components/ui/alert"

export default function AdminUserPage() {

    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const params = useParams()
    const {data,setData} = useContext(DataContext)

    useEffect(()=>{
      async function fetchCompany(){
        setIsLoading(true)
        const { data: companies, error: companyError } = await supabase
                  .from('companies')
                  .select('id, name, slug')
                  .eq('owner', data.profile.id)
        
                if (companyError) {
                  console.error('Company fetch error:', companyError)
                  toast('Unable to load your companies. Please try again later.')
                  setData(prev => ({ ...prev, companies: [] }))
                  setIsLoading(false )
                  return
                }
        
                if (!companies || companies.length === 0) {
                  setData(prev => ({ ...prev, companies: [] }))
                  setIsLoading(false )
                  return
                }
        
                // ✅ Save both profile and companies together
                setData(prev => ({
                  ...prev,
                  companies,
                }))
                setIsLoading(false)
          }
          fetchCompany()
    },[])
    // const companies = [...data?.companies]


  return (

    <SidebarProvider   className={'relative '}>
      <AppSidebar />
      <SidebarInset className={' overflow-hidden h-svh static'}>

        <div className="flex mb-0.5 h-full overflow-hidden flex-col gap-4">
         <div className='flex-col  border-b overflow-hidden h-full flex'>
           <div className='h-12'>
             <Header >
               <div className="flex">
                 <div className='md:flex gap-2 hidden mr-1 items-center '>
                
                 </div>
                 <Button variant='ghost' size='icon' className='relative ml-3'>
                   <Bell className='h-5 w-5'/>
                   <span className='absolute -top-0.5 -right-0.5 text-[9px] bg-red-600 translate-x-[-48.8%] translate-y-[48.9%] text-white font-semibold flex items-center justify-center size-3.5 rounded-full'>3</span>
                 </Button>
               </div>
             </Header>
           </div>
           <div className='flex-col overflow-y-hidden grow  flex'>
              <div className='md:px-4 pt-2 md:pt-4 p-0.5 px-1 h-full overflow-y-auto'>
                
                  <div>
                    <h1 className="text-xl font-semibold">Welcome, {data.profile&&data.profile.username}</h1>
                    {/* <h2 className="mt-2 text-lg font-medium">Recent Sales</h2> */}
                  </div>
                  <div className='mt-4'>
                     {isLoading?
                      <div className='overflow-hidden flex justify-start items-center h-full'>
                        Loading data<Spinner className='size-4 ml-2 text-core' spinning={true} />
                      </div>
                      :
                     data && data.profile &&!data.companies?.length && data.profile?
                      <div className=' bg-armylight rounded-2xl px-5 py-7 text-center'>
                        <div className="flex flex-col items-center gap-4">
                          
                          <div className="p-4 rounded-full bg-white">
                            <Factory className="size-5 text-muted-foreground" />
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground">
                              No Companies yet created
                            </h3>
                          </div>
                          <Link href={`/users/${params.u}/new-company`}><Button className='mt-2 h-8 hover:bg-core/90 text-xs bg-core'>Create Company</Button></Link>
                        </div>
                      </div>:""
                      }
                  </div>
              </div>
              
           </div>       
         </div>
        </div>

      </SidebarInset>
    </SidebarProvider>
  )
}
