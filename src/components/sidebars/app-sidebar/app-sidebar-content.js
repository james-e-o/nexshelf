
import { ChevronRight, Factory,Files,LayoutDashboard,Plus, Receipt, Rocket } from "lucide-react"
import {  Collapsible,  CollapsibleContent,  CollapsibleTrigger,} from "@/components/ui/collapsible"
import { Sidebar,  SidebarContent,  SidebarFooter,  SidebarHeader,SidebarTrigger,  SidebarRail, SidebarGroup,  SidebarGroupLabel,  SidebarMenu,  SidebarMenuButton,  SidebarMenuItem,  SidebarMenuSub,  SidebarMenuSubButton,  SidebarMenuSubItem,} from "@/components/ui/sidebar"
import { Button,buttonVariants } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";    
import { CollapsibleButton,NoCollapsibleButton } from "./app-sidebar";

export default function AppSidebarContent({ profile,companies}) {
   const params = useParams()   
    return (
    <SidebarContent className={'bg-[white] text-zinc-100'} >
        <SidebarGroup>
            <Link href={`/admin/${params.u}/new-company`} className="no-underline">
            <SidebarMenuButton tooltip={'new company'} size="lg" className=" hover:from-core/90 hover:to-army/90 mt-3 h-10 cursor-pointer bg-linear-to-r from-core to-60% to-army">
                <div className="bg-transparent scale-125 flex aspect-square size-8 items-center justify-center rounded-lg">
                    <Rocket className="size-4 text-white font-bold" />
                </div>
                <div className="grid flex-1 text-left text-[13px] leading-tight">
                    <span className="truncate text-white font-medium">Launch New Company</span>
                </div>
            </SidebarMenuButton>
            </Link>
        </SidebarGroup>
        <SidebarGroup>
            <SidebarMenu>
                <NoCollapsibleButton className={``} url={`/admin/${params.u}`} title={'Dashboard'} icon={LayoutDashboard} active={false} name={'Dashboard'}/>
                {companies&&companies.length>0&&(
                    <CollapsibleButton caps={'uppercase'} sidebarOpen={true} className={``} title={'Companies'} icon={Factory} 
                        items={companies.map((company)=>({title:company.name,url:`/admin/${params.u}/company/${company.slug}`}))}
                        sidebarCollapse={false}
                    />
                )}
                <NoCollapsibleButton className={``} url={`/admin/${params.u}`} title={'Reports'} icon={Files} active={false} name={'Reports'}/>
                <NoCollapsibleButton className={``} url={`/admin/${params.u}/billing`} title={'Billing'} icon={Receipt} active={false} name={'Billing & Plans'}/>
               
            </SidebarMenu> 
        </SidebarGroup>
      </SidebarContent>
  )
}