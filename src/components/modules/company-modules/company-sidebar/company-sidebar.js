"use client"

import {useContext} from "react"
import { ArrowBigDownDash, ChevronRight, AudioWaveform, BookOpen, Bot, Calculator, ChartCandlestick,Files, Command, Factory, FileChartLine, Frame, GalleryVerticalEnd, LayoutDashboard, Map, PieChart, Plus, Settings, Settings2, SquareTerminal,} from "lucide-react"
import { Button,buttonVariants } from "@/components/ui/button";
import { DataContext } from "@/app/admin/[u]/layout";
import Link from "next/link";
import {  Sidebar,  SidebarContent,  SidebarFooter,  SidebarHeader,SidebarTrigger,  SidebarRail,} from "@/components/ui/sidebar"
import {  Collapsible,  CollapsibleContent,  CollapsibleTrigger,} from "@/components/ui/collapsible"
import {  SidebarGroup,  SidebarGroupLabel,  SidebarMenu,  SidebarMenuButton,  SidebarMenuItem,  SidebarMenuSub,  SidebarMenuSubButton,  SidebarMenuSubItem,} from "@/components/ui/sidebar"
import { useParams } from "next/navigation";


import { useIsMobile } from "@/hooks/use-mobile";
import CompanySidebarContent from "./company-sidebar-content";
import CompanySidebarFooter from "./company-sidebar-footer";
import { AppSidebarHeader } from "../../app-sidebar/app-sidebar-header";


export function AppSidebar({modules, company,...props }) {
    const isMobile = useIsMobile()
    const params = useParams()
    const {data,setData} = useContext(DataContext)

  return (
    <Sidebar  className={''} collapsible="icon" {...props}>
      <AppSidebarHeader/>
      <CompanySidebarContent modules={modules} company={company} />
      <CompanySidebarFooter params={params} profile={data.profile}/>
      <SidebarRail />
    </Sidebar>
  )
}

export const CollapsibleButton = ({title,icon,items,sidebarCollapse,sidebarOpen,caps,defaultOpen, itemClass}) => {
   const item ={icon}
  return (
    <Collapsible key={title} asChild defaultOpen={defaultOpen} className="group/collapsible my-0.5" >
        <SidebarMenuItem onRequestOpen={sidebarOpen} onRequestCollapse={sidebarCollapse} >
            <CollapsibleTrigger asChild>
        <SidebarMenuButton  tooltip={title} className={`text-black cursor-pointer font-WixMade ${itemClass || ''}`}>
                  {item.icon && <item.icon className='font-bold' />}
                  <span className="font-medium text-xs ml-1">{title}</span>
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
            <SidebarMenuSub>
                {items?.map((subItem) => {
                const subBtnClass = subItem.className || 'text-black text-xs'
                const titleClass = subItem.titleClass || 'font-medium data-[caps=capitalize]:capitalize data-[caps=lowercase]:lowercase data-[caps=uppercase]:uppercase font-WixMade text-xs ml-1'
                return (
                <SidebarMenuSubItem key={subItem.title}>
                  <SidebarMenuSubButton className={subBtnClass} style={subItem.style} asChild>
                    <Link href={subItem.url}>
                      <span data-caps={caps} className={titleClass}>{subItem.title}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                )})}
            </SidebarMenuSub>
            </CollapsibleContent>
        </SidebarMenuItem>
    </Collapsible>
  )
}

export const NoCollapsibleButton = ({name,active,url,icon }) => {
    const item ={icon}
  return (
    <SidebarMenuItem mobileCollapse={true}  key={name} className={'my-0.5'}>
        <SidebarMenuButton asChild isActive={active} className={'text-black border-2 border-transparent hover:border-zinc-100 bg-transparent'} >
            <Link href={url}>
                {item.icon && <item.icon className='font-bold' />}
                <span className="font-medium font-WixMade text-xs ml-1">{name}</span>
            </Link>
        </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
