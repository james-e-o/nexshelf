
import { SidebarFooter } from "@/components/ui/sidebar";
import { NavUser } from "@/components/nav-user";
import { Settings } from "lucide-react";
import { NoCollapsibleButton } from "./company-sidebar";

export default function CompanySidebarFooter({ params, profile}) {
  const { u, companySlug } = params 
  return (
    <SidebarFooter className={'bg-white pb-8 flex-col flex gap-6'} >
      <NoCollapsibleButton className={``} url={`/admin/${u}/company/${companySlug}/settings`} title={'My Models'} icon={Settings} active={false} name={'Company Settings'}/>

      <NavUser user={profile} />
    </SidebarFooter>
  )
}


