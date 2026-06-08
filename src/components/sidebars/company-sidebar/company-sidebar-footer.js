
'use client';

import { SidebarFooter } from "@/components/ui/sidebar";
import { CompanySidebarFooterUser } from "./company-sidebar-footer-user";
import { Settings, Users, LayoutDashboard, CreditCard } from "lucide-react";
import { NoCollapsibleButton } from "./company-sidebar";
import { useAccess } from "@/hooks/useAccess";
import { checkFeatureGroupAccess, checkPermission } from "@/lib/feature-permissions";

export default function CompanySidebarFooter({ params, profile }) {
  const { u, companyId } = params;
  const access = useAccess();
  // console.log(access.permissions)

  if (access.isLoading) return null;

  return (
    <SidebarFooter className={'bg-armylight  pb-8 flex-col flex gap-6'} >
      <div className="flex-col flex gap-1">
        {checkPermission('can_view_staff', access.permissions, true, access.isOwner) && (
          <NoCollapsibleButton className={``} url={`/users/${u}/company/${companyId}/staff`} title={'Staff'} icon={Users} active={false} name={'Staff'} badge={'company'}/>
        )}
        {checkFeatureGroupAccess('modules', access.permissions, access.isOwner) && (
          <NoCollapsibleButton className={``} url={`/users/${u}/company/${companyId}/modules-manager`} title={'Modules'} icon={LayoutDashboard} active={false} name={'Modules'}/>
        )}
        {checkFeatureGroupAccess('subscriptions', access.permissions, access.isOwner) && (
          <NoCollapsibleButton className={``} url={`/users/${u}/company/${companyId}/subscriptions`} title={'Subscriptions'} icon={CreditCard} active={false} name={'Subscriptions'}/>
        )}
        {checkPermission('can_view_staff', access.permissions, true, access.isOwner) && (
           <NoCollapsibleButton className={``} url={`/users/${u}/company/${companyId}/settings`} title={'Settings'} icon={Settings} active={false} name={'Settings'} badge={'company'}/>
        )} 
      </div>
      <CompanySidebarFooterUser user={profile} u={u} />
    </SidebarFooter>
  )
}



