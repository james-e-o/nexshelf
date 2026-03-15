
import { ChevronRight, Factory,Files,LayoutDashboard,Plus, Group,Building2,Rocket, SquareStack } from "lucide-react"
import {  Collapsible,  CollapsibleContent,  CollapsibleTrigger,} from "@/components/ui/collapsible"
import { Sidebar,  SidebarContent,  SidebarFooter,  SidebarHeader,SidebarTrigger,  SidebarRail, SidebarGroup,  SidebarGroupLabel,  SidebarMenu,  SidebarMenuButton,  SidebarMenuItem,  SidebarMenuSub,  SidebarMenuSubButton,  SidebarMenuSubItem,} from "@/components/ui/sidebar"
import { Button,buttonVariants } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";    
import { CollapsibleButton,NoCollapsibleButton } from "./company-sidebar";

export default function CompanySidebarContent({modules, branches, company,}) {
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

                <CollapsibleButton caps={'capitalize'} defaultOpen={true} sidebarOpen={true} className={``} title={'Branches'} icon={SquareStack} 
                    items={[

                        
                        //  ...branches.filter(branch => branch.company === company?.company_id).map((branch) => ({ title: branch.name, url: `/users/${params.u}/company/${params.companySlug}/branches/${branch.branch_id}`}))
                        ...branches.map((branch) => ({ title: branch.name, url: `/users/${params.u}/company/${params.companySlug}/branches/${branch.slug}`})),
                        { title: 'All Branches', url: `/users/${params.u}/company/${params.companySlug}/branches`},
                    ]}
                    sidebarCollapse={false}
                />
            </SidebarMenu> 
        </SidebarGroup>
      </SidebarContent>
  )
}
