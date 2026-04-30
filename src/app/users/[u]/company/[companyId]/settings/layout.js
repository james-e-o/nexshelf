import { ReusableCompanySidebar } from "../layout"

export default function CompanySettingsLayout ({children}){
    
    return(
        <ReusableCompanySidebar>
            {children}
        </ReusableCompanySidebar>
    )
}