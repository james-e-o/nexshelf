
import { ChevronRight, Factory,Files,LayoutDashboard,Plus, Group,Building2,Rocket } from "lucide-react"
import {  Collapsible,  CollapsibleContent,  CollapsibleTrigger,} from "@/components/ui/collapsible"
import { Sidebar,  SidebarContent,  SidebarFooter,  SidebarHeader,SidebarTrigger,  SidebarRail, SidebarGroup,  SidebarGroupLabel,  SidebarMenu,  SidebarMenuButton,  SidebarMenuItem,  SidebarMenuSub,  SidebarMenuSubButton,  SidebarMenuSubItem,} from "@/components/ui/sidebar"
import { Button,buttonVariants } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";    
import { CollapsibleButton,NoCollapsibleButton } from "./branch-sidebar";

export default function BranchSidebarContent({modules, company}) {
   const params = useParams()   

    return (
    <SidebarContent className={'bg-[white]  text-zinc-100'} >
        <SidebarGroup>
            <SidebarMenu>
                <NoCollapsibleButton className={`capitalize`} url={`/users/${params.u}/company/${params.companySlug}`} title={'Dashboard'} icon={Building2} active={false} name={`${params.companySlug.toUpperCase()} Dashboard`}/>
                {modules&&modules.length>0&&(
                    <CollapsibleButton caps={'capitalize'} defaultOpen={true} sidebarOpen={true} className={``} title={'Business Modules'} icon={Group} 
                    items={[
                      
                        ...modules.map((module) => ({ title: module.title, url: `/users/${params.u}/company/${params.companySlug}/branches/${params.branch}/modules/${module.slug}`}))]}
                        sidebarCollapse={false}
                    />
                )}
               
            </SidebarMenu> 
        </SidebarGroup>
      </SidebarContent>
  )
}
