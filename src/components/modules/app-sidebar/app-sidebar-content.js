
import { ChevronRight, Factory,Files,LayoutDashboard,Plus, Rocket } from "lucide-react"
import {  Collapsible,  CollapsibleContent,  CollapsibleTrigger,} from "@/components/ui/collapsible"
import { Sidebar,  SidebarContent,  SidebarFooter,  SidebarHeader,SidebarTrigger,  SidebarRail, SidebarGroup,  SidebarGroupLabel,  SidebarMenu,  SidebarMenuButton,  SidebarMenuItem,  SidebarMenuSub,  SidebarMenuSubButton,  SidebarMenuSubItem,} from "@/components/ui/sidebar"
import { Button,buttonVariants } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";    
import { CollapsibleButton,NoCollapsibleButton } from "./app-sidebar";

export default function AppSidebarContent() {
   const params = useParams()   
    return (
    <SidebarContent className={'bg-[white] text-zinc-100'} >
        <SidebarGroup>
            <Link href={`/admin/${params.u}/new-company`} className="no-underline">
            <SidebarMenuButton tooltip={'Journal a trade'} size="lg" className=" hover:bg-core/90 h-10 cursor-pointer bg-core ">
                <div className="bg-transparent scale-125 flex aspect-square size-8 items-center justify-center rounded-lg">
                    <Rocket className="size-4 text-white font-bold" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate text-white font-medium">Launch New Company</span>
                </div>
            </SidebarMenuButton>
            </Link>
        </SidebarGroup>
        <SidebarGroup>
            <SidebarMenu>
                <NoCollapsibleButton className={``} url={`/admin/${params.u}`} title={'Dashboard'} icon={LayoutDashboard} active={false} name={'Dashboard'}/>
                
                <CollapsibleButton className={``} title={'Companies'} icon={Factory} items={[
                  {title:'company A',url:`/admin/${params.u}/companyA`},
                  {title:'company B',url:`/admin/${params.u}/companyB`},
                  {title:'company c',url:`/admin/${params.u}/companyC`},
                ]}/>
                <NoCollapsibleButton className={``} url={`/admin/${params.u}`} title={'Reports'} icon={Files} active={false} name={'Reports'}/>
               
            </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
  )
}