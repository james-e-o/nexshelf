
import { ChevronRight, Factory,Files,LayoutDashboard,Plus, Group,Rocket } from "lucide-react"
import {  Collapsible,  CollapsibleContent,  CollapsibleTrigger,} from "@/components/ui/collapsible"
import { Sidebar,  SidebarContent,  SidebarFooter,  SidebarHeader,SidebarTrigger,  SidebarRail, SidebarGroup,  SidebarGroupLabel,  SidebarMenu,  SidebarMenuButton,  SidebarMenuItem,  SidebarMenuSub,  SidebarMenuSubButton,  SidebarMenuSubItem,} from "@/components/ui/sidebar"
import { Button,buttonVariants } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";    
import { CollapsibleButton,NoCollapsibleButton } from "./company-sidebar";

export default function CompanySidebarContent({ company}) {
   const params = useParams()   

 const companyModules = [
        { title: "Orders", slug: "orders" },
        { title: "Customers", slug: "customers" },
        { title: "Sales", slug: "sales" },
        { title: "Products", slug: "products" },
        { title: "Inventory", slug: "inventory" },
];


    return (
    <SidebarContent className={'bg-[white] text-zinc-100'} >
        <SidebarGroup>
            <SidebarMenu>
                <NoCollapsibleButton className={`capitalize`} url={`/admin/${params.u}/company/${params.companySlug}`} title={'Dashboard'} icon={LayoutDashboard} active={false} name={`${params.companySlug} Dashboard`}/>
                {/* {companies&&companies.length>0&&( */}
                    <CollapsibleButton caps={'capitalize'} sidebarOpen={true} className={``} title={'Business Modules'} icon={Group} 
                        items={companyModules.map((module) => ({ title: module.title, url: `/admin/${params.u}/company/${params.companySlug}/${module.slug}`}))}
                        sidebarCollapse={false}
                    />
                {/* )} */}
                <NoCollapsibleButton className={``} url={`/admin/${params.u}`} title={'Reports'} icon={Files} active={false} name={'Company Reports'}/>
               
            </SidebarMenu> 
        </SidebarGroup>
      </SidebarContent>
  )
}