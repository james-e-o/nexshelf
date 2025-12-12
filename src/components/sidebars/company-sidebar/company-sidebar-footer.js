
import { SidebarFooter } from "@/components/ui/sidebar";
import { NavUser } from "@/components/nav-user";
import { Settings,Users,Link2, SquaresSubtract,LayoutDashboard } from "lucide-react";
import { NoCollapsibleButton,CollapsibleButton } from "./company-sidebar";

export default function CompanySidebarFooter({ params, profile}) {
  const { u, companySlug } = params 
  return (
    <SidebarFooter className={'bg-white pb-8 flex-col flex gap-6'} >
      <div className="flex-col flex gap-1">
        <NoCollapsibleButton className={``} url={`/admin/${u}/company/${companySlug}/staff`} title={'Staff'} icon={Users} active={false} name={'Staff'}/>
        <NoCollapsibleButton className={``} url={`/admin/${u}/company/${companySlug}/modules-manager`} title={'Modules'} icon={LayoutDashboard} active={false} name={'Modules'}/>
        <NoCollapsibleButton className={``} url={`/admin/${u}/company/${companySlug}/branches`} title={'Branches'} icon={SquaresSubtract} active={false} name={'Branches'}/>
        <NoCollapsibleButton className={``} url={`/admin/${u}/company/${companySlug}/settings`} title={'Settings'} icon={Settings} active={false} name={'Settings'}/>
      </div>
      <NavUser user={profile} />
    </SidebarFooter>
  )
}


