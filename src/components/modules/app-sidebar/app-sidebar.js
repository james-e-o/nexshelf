"use client"

import  React from "react"
import { ArrowBigDownDash, ChevronRight, AudioWaveform, BookOpen, Bot, Calculator, ChartCandlestick,Files, Command, Factory, FileChartLine, Frame, GalleryVerticalEnd, LayoutDashboard, Map, PieChart, Plus, Settings, Settings2, SquareTerminal,} from "lucide-react"
import { Button,buttonVariants } from "@/components/ui/button";
import Image from "next/image";
import { Avatar,  AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { NavUser } from "@/components/nav-user"
import {  Sidebar,  SidebarContent,  SidebarFooter,  SidebarHeader,SidebarTrigger,  SidebarRail,} from "@/components/ui/sidebar"
import {  Collapsible,  CollapsibleContent,  CollapsibleTrigger,} from "@/components/ui/collapsible"
import {  SidebarGroup,  SidebarGroupLabel,  SidebarMenu,  SidebarMenuButton,  SidebarMenuItem,  SidebarMenuSub,  SidebarMenuSubButton,  SidebarMenuSubItem,} from "@/components/ui/sidebar"
import { useParams } from "next/navigation";


import { useIsMobile } from "@/hooks/use-mobile";
import AppSidebarContent from "./app-sidebar-content";
import AppSidebarFooter from "./app-sidebar-footer";
import { AppSidebarHeader } from "./app-sidebar-header";

export function AppSidebar({ data,...props }) {
   const isMobile = useIsMobile()
   const params = useParams()

  return (
    <Sidebar  className={'bg-white'} collapsible="icon" {...props}>
      <AppSidebarHeader/>
      <AppSidebarContent/>
      <AppSidebarFooter data={data}/>
      <SidebarRail />
    </Sidebar>
  )
}

export const CollapsibleButton = ({title,icon,items,sidebarCollapse }) => {
   const item ={icon}
  return (
    <Collapsible key={title} asChild defaultOpen={true} className="group/collapsible my-0.5" >
        <SidebarMenuItem>
            <CollapsibleTrigger asChild>
            <SidebarMenuButton tooltip={title} className={'text-black font-WixMade'}>
                 {item.icon && <item.icon className='font-bold' />}
                <span className="font-medium text-xs ml-1">{title}</span>
                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
            <SidebarMenuSub>
                {items?.map((subItem) => (
                <SidebarMenuSubItem key={subItem.title}>
                    <SidebarMenuSubButton className={`text-black text-xs`} asChild>
                    <Link href={subItem.url}>
                        <span className="font-medium font-WixMade text-xs ml-1">{subItem.title}</span>
                    </Link>
                    </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                ))}
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
