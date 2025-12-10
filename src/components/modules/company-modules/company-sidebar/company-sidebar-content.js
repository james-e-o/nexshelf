
import { ChevronRight, Factory,Files,LayoutDashboard,Plus, Group,Rocket } from "lucide-react"
import {  Collapsible,  CollapsibleContent,  CollapsibleTrigger,} from "@/components/ui/collapsible"
import { Sidebar,  SidebarContent,  SidebarFooter,  SidebarHeader,SidebarTrigger,  SidebarRail, SidebarGroup,  SidebarGroupLabel,  SidebarMenu,  SidebarMenuButton,  SidebarMenuItem,  SidebarMenuSub,  SidebarMenuSubButton,  SidebarMenuSubItem,} from "@/components/ui/sidebar"
import { Button,buttonVariants } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";    
import { CollapsibleButton,NoCollapsibleButton } from "./company-sidebar";

export default function CompanySidebarContent({modules, company}) {
   const params = useParams()   

    return (
    <SidebarContent className={'bg-[white]  text-zinc-100'} >
        <SidebarGroup>
            <SidebarMenu>
                <NoCollapsibleButton className={`capitalize`} url={`/admin/${params.u}/company/${params.companySlug}`} title={'Dashboard'} icon={LayoutDashboard} active={false} name={`${params.companySlug} Dashboard`}/>
                {modules&&modules.length>0&&(
                    <CollapsibleButton caps={'capitalize'} defaultOpen={true} sidebarOpen={true} className={``} title={'Business Modules'} icon={Group} 
                    items={[
                        {
                            title: "Manage Modules", 
                            url: `/admin/${params.u}/company/${params.companySlug}/modules-manager`,
                            className: 'text-white font-semibold hover:bg-army/85 hover:text-white font-WixMade bg-core/70 transition-all  text-xs',
                        },
                        {
                            title: "Accounting", 
                            url: `/admin/${params.u}/company/${params.companySlug}/accounting`,
                            // className: 'text-white font-semibold hover:bg-army/85 hover:text-white font-WixMade bg-core transition-all  text-xs',
                        },
                        ...modules.map((module) => ({ title: module.title, url: `/admin/${params.u}/company/${params.companySlug}/${module.slug}`}))]}
                        sidebarCollapse={false}
                    />
                )}
               
            </SidebarMenu> 
        </SidebarGroup>
      </SidebarContent>
  )
}