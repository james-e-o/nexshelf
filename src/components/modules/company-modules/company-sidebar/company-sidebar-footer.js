
import { SidebarFooter } from "@/components/ui/sidebar";
import { NavUser } from "@/components/nav-user";
import { Settings,Users,Link2, SquaresSubtract } from "lucide-react";
import { NoCollapsibleButton,CollapsibleButton } from "./company-sidebar";

export default function CompanySidebarFooter({ params, profile}) {
  const { u, companySlug } = params 
  return (
    <SidebarFooter className={'bg-white pb-8 flex-col flex gap-6'} >
      <div className="flex-col flex gap-1">
        <NoCollapsibleButton className={``} url={`/admin/${u}/company/${companySlug}/staff`} title={'staff'} icon={Users} active={false} name={'Staff'}/>
        <CollapsibleButton caps={'capitalize'} defaultOpen={false} sidebarOpen={true} className={``} title={'Branches'} icon={SquaresSubtract} 
                    items={[
                       {
                            title: "Add Branch", 
                            url: `/admin/${params.u}/company/${params.companySlug}/modules`,
                            className: 'text-white font-semibold hover:bg-army/85 hover:text-white font-WixMade bg-core transition-all  text-xs',
                        },
                    ]}
                    sidebarCollapse={false}
                    />
        <NoCollapsibleButton className={``} url={`/admin/${u}/company/${companySlug}/settings`} title={'settings'} icon={Settings} active={false} name={'Company Settings'}/>
      </div>
      <NavUser user={profile} />
    </SidebarFooter>
  )
}


