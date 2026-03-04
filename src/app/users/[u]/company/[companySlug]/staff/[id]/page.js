'use client'

import { useContext, useState, useEffect } from 'react'
import { CompanyInfoContext } from '../../layout'
import { supabase } from '../../../../../../../../config/supabaseClient'
import { Card } from '@/components/ui/card'

export default function StaffOverview({ staffData, setStaffData }) {
  const { info } = useContext(CompanyInfoContext)

  if (!staffData) {
    return <p className="text-gray-600">Staff member not found</p>
  }

  const InfoSection = ({ title, children }) => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
  )

  const InfoField = ({ label, value }) => (
    <div className="space-y-1">
      <p className="text-sm text-gray-600 font-medium">{label}</p>
      <p className="text-gray-900">{value || 'N/A'}</p>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <Card className="border-gray-200 shadow-sm p-6">
        <InfoSection title="Personal Information">
          <InfoField label="Username" value={`@${staffData.users?.handle}`} />
          <InfoField label="Email" value={staffData.users?.email} />
          <InfoField label="User ID" value={staffData.user_id} />
        </InfoSection>
      </Card>

      {/* Employment Information */}
      <Card className="border-gray-200 shadow-sm p-6">
        <InfoSection title="Employment Information">
          <InfoField label="Status" value={staffData.status} />
          <InfoField label="Role" value={staffData.role || 'Staff'} />
          <InfoField label="Access Level" value={staffData.access_level || 'Basic'} />
          <InfoField label="Branch" value={staffData.branch || 'N/A'} />
        </InfoSection>
      </Card>

      {/* Timeline */}
      <Card className="border-gray-200 shadow-sm p-6">
        <InfoSection title="Timeline">
          <InfoField
            label="Date Added"
            value={new Date(staffData.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          />
          <InfoField
            label="Last Updated"
            value={new Date(staffData.updated_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          />
        </InfoSection>
      </Card>
    </div>
  )
}
