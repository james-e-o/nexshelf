

import { AppSidebar } from "@/components/modules/company-modules/company-sidebar/company-sidebar";
import {SidebarInset,SidebarProvider,SidebarTrigger,} from "@/components/ui/sidebar"
import Header from "@/components/dashboard-header";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import CompanyHeader from "@/components/modules/company-modules/company-dashboard-header";

export default function CompanyLayout( {children}) {
  return (
     <SidebarProvider   className={'relative'}>
        <AppSidebar />
        <SidebarInset className={' overflow-hidden h-svh static'}>


            <div className="flex mb-0.5 h-full overflow-hidden flex-col gap-4">
                <div className='flex-col  border-b-8 overflow-hidden h-full flex'>
                    <div className='h-12'>
                        <CompanyHeader >
                        <div className="flex">
                            <div className='md:flex gap-2 hidden mr-1 items-center '>
                        
                            </div>
                            <Button variant='ghost' size='icon' className='relative ml-3'>
                            <Bell className='h-5 w-5'/>
                            <span className='absolute -top-0.5 -right-0.5 text-[9px] bg-red-600 translate-x-[-48.8%] translate-y-[48.9%] text-white font-semibold flex items-center justify-center size-3.5 rounded-full'>3</span>
                            </Button>
                        </div>
                        </CompanyHeader>
                    </div>
                    <div className='flex-col overflow-y-hidden flex-grow  flex'>
                        <div className='md:px-4 pt-2 md:pt-4 p-0.5 px-1 h-full overflow-y-auto'>
                            {children}
                      </div>
                    </div>
                </div>
            </div>


        </SidebarInset>
     </SidebarProvider>
  );
}