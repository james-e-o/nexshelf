'use client'
import { useState,useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Store,XIcon } from "lucide-react";
import Image from "next/image"
import { menuX } from "../page";
// import profilePix from '../../public/profilepix2.jpg'
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LandingHeader from "@/components/landing-header";

const Pricing = () => {
     const [dropState, setDropState] = useState(false)
       useEffect(()=>{
         document.onpointerdown = ({target}) => {
           if(dropState&&target.closest('div#drop-box'))return
           else if(dropState) {
             setDropState(!dropState)
           }
         }
       })
  return (
    <div className="relative h-full  overflow-x-clip z-0 overflow-y-scroll">
         <LandingHeader />
          <main className="">
               <div className="md:px-10 sm:px-8 lg:px-12 px-6 py-8 flex bg-blue-100 justify-center">
                    <h1 className="font-Clash text-3xl text-center font-bold ">Pick your perfect plan</h1>
               </div>
               <div className="md:px-10 sm:px-8 lg:px-12 px-6 pt-8 mb-3">
                    <div className="w-full flex justify-center">
                         <Tabs defaultValue="monthly">
                              <TabsList >
                                   <div className="inline-flex rounded-3xl border border-core_grey2 bg-violet-200/80 p-2 gap-3">
                                        <TabsTrigger  value="monthly" className={'h-6 px-4 rounded-3xl'}>Monthly</TabsTrigger>
                                        <TabsTrigger value="annual" className={'h-6 px-4 rounded-3xl'}>Annual</TabsTrigger>
                                   </div>
                              </TabsList>
                         </Tabs>
                    </div>
               </div>
          </main>
    </div>
  )
}

export default Pricing