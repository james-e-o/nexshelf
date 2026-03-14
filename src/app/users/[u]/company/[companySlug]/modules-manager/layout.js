import { ReusableCompanySidebar } from "../layout"

export default function ModulesManagerLayout ({children}){
    
    return(
        <ReusableCompanySidebar>
            {children}
        </ReusableCompanySidebar>
    )
}