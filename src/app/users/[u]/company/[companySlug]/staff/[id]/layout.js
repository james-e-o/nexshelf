'use client'

import { useContext, useState, useEffect } from 'react'
import { CompanyInfoContext } from '../../layout'
import { supabase } from '../../../../../../../../config/supabaseClient'
import { useParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Spinner } from '@/components/ui/spinner'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import StaffOverview from './page'
import PermissionsTab from './permissions/page'
import SecurityTab from './security/page'

export default function StaffDetailLayout() {
  const params = useParams()
  const router = useRouter()
  const { info, user: currentUser } = useContext(CompanyInfoContext)
  const [staffData, setStaffData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        const { data, error } = await supabase
          .from('staff')
          .select(`
            *,
            users:user_id (id, handle, username, email)
          `)
          .eq('id', params.id)
          .eq('company_id', info.id)
          .single()

        if (error) throw error

        setStaffData(data)
      } catch (err) {
        console.error('Error fetching staff:', err)
      } finally {
        setIsLoading(false)
      }
    }

    if (info?.id && params.id) {
      fetchStaffData()
    }
  }, [info?.id, params.id])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="size-8 text-core" spinning={true} />
      </div>
    )
  }

  if (!staffData) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <p className="text-gray-600">Staff member not found</p>
        <Link
          href={`/users/${currentUser.handle}/company/${info.slug}/staff/directory`}
          className="text-core hover:underline text-sm"
        >
          Back to Directory
        </Link>
      </div>
    )
  }

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green/10 text-green border-green/20',
      pending: 'bg-army/10 text-army border-army/20',
      suspended: 'bg-red-500/10 text-red-500 border-red-500/20',
      terminated: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    }
    return colors[status] || colors.active
  }

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Link
          href={`/users/${currentUser.handle}/company/${info.slug}/staff/directory`}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft className="size-5" />
          Back to Directory
        </Link>
      </div>

      {/* Staff Info Card */}
      <Card className="border-gray-200 shadow-sm p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                @{staffData.users?.handle}
              </h1>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                  staffData.status
                )}`}
              >
                {staffData.status}
              </span>
            </div>
            <p className="text-gray-600">{staffData.users?.email}</p>
          </div>
          <div className="text-right text-sm text-gray-600">
            <p className="font-semibold text-gray-900">Role: {staffData.role || 'Staff'}</p>
            <p>Access Level: {staffData.access_level || 'Basic'}</p>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-white data-[state=active]:text-core data-[state=active]:shadow-sm"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="permissions"
            className="data-[state=active]:bg-white data-[state=active]:text-core data-[state=active]:shadow-sm"
          >
            Permissions
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="data-[state=active]:bg-white data-[state=active]:text-core data-[state=active]:shadow-sm"
          >
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <StaffOverview staffData={staffData} setStaffData={setStaffData} />
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <PermissionsTab staffData={staffData} setStaffData={setStaffData} />
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <SecurityTab
            staffData={staffData}
            setStaffData={setStaffData}
            isOwner={currentUser.id === info.owner}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
