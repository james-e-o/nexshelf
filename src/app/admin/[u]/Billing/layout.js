'use client'

import { useEffect, useState,useContext } from 'react'
import { supabase } from '../../../../../config/supabaseClient'
import { Spinner } from '@/components/ui/spinner'
import { ArrowLeft, ArrowRight, Bell, TriangleAlert, Check,X } from 'lucide-react'
import Link from 'next/link'
import { DataContext } from '../layout'
import { AppSidebar } from '@/components/sidebars/app-sidebar/app-sidebar'
import {SidebarInset,SidebarProvider,SidebarTrigger,} from "@/components/ui/sidebar"
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/headers/dashboard-header'
import { Button } from '@/components/ui/button'
import {Field,FieldDescription,FieldGroup,FieldLabel,FieldSeparator,} from "@/components/ui/field"
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Tabs,TabsTrigger,TabsList,TabsContent } from "@/components/ui/tabs"
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select"

export default function BillingLayout({ children }) {

        const {data,setData} = useContext(DataContext)
     

        useEffect(() => {
            const fetchCompanies = async () => {
                const { data: companies, error } = await supabase
                    .from("companies")
                    .select("id, name, slug")
                    .eq("owner", data.profile.id);

                if (error) {
                    console.error("Error fetching companies:", error);
                    setData(prev => ({ ...prev, companies: [] }));
                } else {
                    setData(prev => ({ ...prev, companies }));
                }
            };

            if (data.profile) {
                fetchCompanies();
            }
        }, [data.profile, setData]);

  return (
    
        <SidebarProvider className={'relative'}>
          <AppSidebar />
          <SidebarInset className={'overflow-hidden h-svh static'}>
    
            <div className="flex h-full overflow-hidden flex-col">
                <div className='flex-col overflow-hidden h-full flex'>
                    <div className='h-12'>
                        <Header>
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
                    <div className='flex-col overflow-y-auto grow p-8 flex px-8' style={{background: 'linear-gradient(to bottom right, #f8fafc, #f1f5f9)'}}>   
                        {children}
                    </div>       
                </div>
            </div>
        </SidebarInset>
    </SidebarProvider>
  )
}
