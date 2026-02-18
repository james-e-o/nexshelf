"use client"

import { useContext ,useEffect} from "react"
import { useParams,useRouter } from "next/navigation"
import { CompanyInfoContext } from "./layout"
import { RefreshContext } from "../../layout"
import { ReusableCompanySidebar } from "./layout"

export default function CompanyPage() {
  const { info } = useContext(CompanyInfoContext)
  const router = useRouter()
  const params = useParams()
  const { u, companySlug } = params
  const { refreshKey ,setRefreshKey} = useContext(RefreshContext)

  useEffect(()=>{
    setRefreshKey(prev => prev + 1);
  },[u,companySlug])

  return (

      <ReusableCompanySidebar >      
        <div className="p-1 font-WixMade">
          <h1 className="text-xl font-bold">
            Welcome to {info?.name || "Company"}
          </h1>
          <p>Company ID: {info?.id}</p>
        </div>
      </ReusableCompanySidebar>
  )
}
