
import { ReusableCompanySidebar } from "../layout"

export default function CompanyStaffLayout({ children }) {
  return (
    <ReusableCompanySidebar>
        {children}
    </ReusableCompanySidebar>
    )
}