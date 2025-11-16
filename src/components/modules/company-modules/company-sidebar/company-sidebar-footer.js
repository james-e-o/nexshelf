
import { SidebarFooter } from "@/components/ui/sidebar";
import { NavUser } from "@/components/nav-user";
import { Settings,Users,Link2, SquaresSubtract } from "lucide-react";
import { NoCollapsibleButton } from "./company-sidebar";

export default function CompanySidebarFooter({ params, profile}) {
  const { u, companySlug } = params 
  return (
    <SidebarFooter className={'bg-white pb-8 flex-col flex gap-6'} >
      <div className="flex-col flex gap-1">
        <NoCollapsibleButton className={``} url={`/admin/${u}/company/${companySlug}/staff`} title={'staff'} icon={Users} active={false} name={'Staff'}/>
        <NoCollapsibleButton className={``} url={`/admin/${u}/company/${companySlug}/branch`} title={'branch'} icon={SquaresSubtract} active={false} name={'Branch'}/>
        <NoCollapsibleButton className={``} url={`/admin/${u}/company/${companySlug}/settings`} title={'settings'} icon={Settings} active={false} name={'Company Settings'}/>
      </div>
      <NavUser user={profile} />
    </SidebarFooter>
  )
}


