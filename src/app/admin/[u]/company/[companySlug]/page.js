"use client"
import { Spinner } from "@/components/ui/spinner"
import useCompanyAccess from "@/hooks/use-companyAccess"

export default function CompanyPage() {
  const { company, isLoading } = useCompanyAccess()

  if (isLoading) return <p className="p-1 flex items-center"><Spinner className={'size-4 mr-2'} spinning={isLoading}/>Loading company data...</p>

  if (!company) return null // Redirect already handled in hook

  return (
    <div className="p-1 font-WixMade">
      <h1 className="text-xl font-bold">Welcome to {company.name}</h1>
      <p>Company ID: {company.id}</p>
    </div>
  )
}

