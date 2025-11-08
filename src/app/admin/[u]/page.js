'use client'

import { useEffect, useState,useContext } from 'react'
import { supabase } from '../../../../config/supabaseClient'
import { Spinner } from '@/components/ui/spinner'
import { Bell } from 'lucide-react'
import { DataContext } from './layout'
import { AppSidebar } from '@/components/modules/app-sidebar/app-sidebar'
import {SidebarInset,SidebarProvider,SidebarTrigger,} from "@/components/ui/sidebar"
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/dashboard-header'
import { Button } from '@/components/ui/button'

export default function AdminUserPage() {

    const router = useRouter()
    const params = useParams()
    const {data,setData} = useContext(DataContext)


  return (

    <SidebarProvider   className={'relative'}>
      <AppSidebar data={data.profile} />
      <SidebarInset className={' overflow-hidden h-svh static'}>

        <div className="flex mb-0.5 h-full overflow-hidden flex-col gap-4">
         <div className='flex-col  border-b-8 overflow-hidden h-full flex'>
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
           <div className='md:px-5 flex-col overflow-y-hidden flex-grow p-0.5 flex px-3'>
  
             <h1 className="text-xl font-semibold">Welcome, {data.profile&&data.profile.username}</h1>
             <h2 className="mt-2 text-lg font-medium">Recent Sales</h2>
              
           </div>       
         </div>
        </div>

      </SidebarInset>
    </SidebarProvider>
  )
}
