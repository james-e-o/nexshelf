
import { ChevronRight, Factory,Files,LayoutDashboard,Plus, Group,Building2,Rocket } from "lucide-react"
import {  Collapsible,  CollapsibleContent,  CollapsibleTrigger,} from "@/components/ui/collapsible"
import { Sidebar,  SidebarContent,  SidebarFooter,  SidebarHeader,SidebarTrigger,  SidebarRail, SidebarGroup,  SidebarGroupLabel,  SidebarMenu,  SidebarMenuButton,  SidebarMenuItem,  SidebarMenuSub,  SidebarMenuSubButton,  SidebarMenuSubItem,} from "@/components/ui/sidebar"
import { Button,buttonVariants } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";    
import { CollapsibleButton,NoCollapsibleButton } from "./company-sidebar";

export default function CompanySidebarContent({modules, company,}) {
   const params = useParams()   

    return (
    <SidebarContent className={'bg-white  text-zinc-100'} >
        <SidebarGroup>
            <SidebarMenu>
                <NoCollapsibleButton className={`capitalize`} url={`/users/${params.u}/company/${params.companySlug}`} title={'Dashboard'} icon={Building2} active={false} name={`${params.companySlug.toUpperCase()} Dashboard`}/>
                {modules&&modules.length>0&&(
                    <CollapsibleButton caps={'capitalize'} defaultOpen={true} sidebarOpen={true} className={``} title={'Business Modules'} icon={Group} 
                    items={[
                      
                        ...modules.filter(module => module.levels?.companylevel).map((module) => ({ title: module.title, url: `/users/${params.u}/company/${params.companySlug}/modules/${module.slug}`}))]}
                        sidebarCollapse={false}
                    />
                )}

                <CollapsibleButton caps={'capitalize'} defaultOpen={true} sidebarOpen={true} className={``} title={'Staff Settings'} icon={Factory} 
                    items={[
                        { title: 'Staff Management', url: `/users/${params.u}/company/${params.companySlug}/staff`},
                        { title: 'Directory', url: `/users/${params.u}/company/${params.companySlug}/staff/directory`},
                        { title: 'Onboarding', url: `/users/${params.u}/company/${params.companySlug}/staff/onboarding`},
                        { title: 'Settings', url: `/users/${params.u}/company/${params.companySlug}/staff/settings`},
                    ]}
                    sidebarCollapse={false}
                />
            </SidebarMenu> 
        </SidebarGroup>
      </SidebarContent>
  )
}
