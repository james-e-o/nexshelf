'use client'

import { useContext } from 'react'
import { CompanyInfoContext } from '../../layout'
import { StaffTable } from '@/components/staff-table'

export default function StaffDirectory() {
  const { info, user } = useContext(CompanyInfoContext)

  // Sample staff data - replace with your actual API call
  const staffList = []

  return (
    <StaffTable 
      staffList={staffList}
      userId={user?.handle}
      companySlug={info?.slug}
    />
  )
}
