'use client'

import { useContext } from 'react'
import { CompanyInfoContext } from '../../layout'
import { StaffContext } from '@/components/contexts/staff-context'
import { StaffTable } from '@/components/staff-table'
import { Spinner } from '@/components/ui/spinner'

export default function StaffDirectory() {
  const { info, user } = useContext(CompanyInfoContext)
  const { staffData, isLoadingStaff } = useContext(StaffContext)

  if (isLoadingStaff) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner className="size-8 text-core" spinning={true} />
      </div>
    )
  }

  return (
    <StaffTable 
      staffList={staffData}
      userId={user?.handle}
      companySlug={info?.slug}
    />
  )
}
