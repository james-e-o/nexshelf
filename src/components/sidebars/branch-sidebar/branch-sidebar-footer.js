
import { SidebarFooter } from "@/components/ui/sidebar";
import { NavUser } from "@/components/nav-user";
import { Settings,Users,Link2, SquaresSubtract,LayoutDashboard } from "lucide-react";
import { NoCollapsibleButton,CollapsibleButton } from "./branch-sidebar";

export default function BranchSidebarFooter({ params, profile}) {
  const { u, companySlug,branch } = params 
  return (
    <SidebarFooter className={'bg-white pb-8 flex-col flex gap-6'} >
      <div className="flex-col flex gap-1">
        <NoCollapsibleButton className={``} url={`/admin/${u}/company/${companySlug}/branches/${branch}/staff`} title={'Staff'} icon={Users} active={false} name={'Staff'} badge={'branch'}/>
        <NoCollapsibleButton className={``} url={`/admin/${u}/company/${companySlug}/branches/${branch}/modules-manager`} title={'Modules'} icon={LayoutDashboard} active={false} name={'Modules'} badge={'branch'}/>
        <NoCollapsibleButton className={``} url={`/admin/${u}/company/${companySlug}/branches/${branch}/settings`} title={'Settings'} icon={Settings} active={false} name={'Settings'} badge={'branch'}/>
      </div>
      <NavUser user={profile} />
    </SidebarFooter>
  )
}


