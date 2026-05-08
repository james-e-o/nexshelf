'use client'

import { useContext, useMemo } from 'react'
import { CompanyInfoContext } from '../layout'
import { StaffContext } from '@/components/contexts/staff-context'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import Link from 'next/link'
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  TrendingUp,
  ArrowRight,
  BarChart3,
} from 'lucide-react'

export default function StaffDashboard() {
  const { info, user } = useContext(CompanyInfoContext)
  const { staffData, isLoadingStaff } = useContext(StaffContext)

  // Calculate statistics from real data
  const stats = useMemo(() => {
    if (!staffData || staffData.length === 0) {
      return {
        totalStaff: 0,
        activeStaff: 0,
        suspendedStaff: 0,
        pendingInvites: 0,
        newThisMonth: 0,
        byAccessLevel: {},
        byBranch: {},
        recentHires: [],
        recentSuspensions: [],
      }
    }

    const now = new Date()
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const calculated = {
      totalStaff: staffData.length,
      activeStaff: staffData.filter(s => s.status === 'active').length,
      suspendedStaff: staffData.filter(s => s.status === 'suspended').length,
      pendingInvites: staffData.filter(s => s.status === 'pending').length,
      newThisMonth: staffData.filter(s => {
        const hireDate = new Date(s.date_hired)
        return hireDate >= oneMonthAgo
      }).length,
      byAccessLevel: {},
      byBranch: {},
      recentHires: staffData
        .filter(s => s.status !== 'terminated')
        .slice(0, 5),
      recentSuspensions: staffData
        .filter(s => s.status === 'suspended')
        .slice(0, 5),
    }

    // Calculate distributions
    staffData.forEach(staff => {
      // By access level
      const level = staff.access_level || 'Unassigned'
      calculated.byAccessLevel[level] = (calculated.byAccessLevel[level] || 0) + 1

      // By branch
      const branch = staff.branch || 'Main Branch'
      calculated.byBranch[branch] = (calculated.byBranch[branch] || 0) + 1
    })

    return calculated
  }, [staffData])

  // Stat Card Component
  const StatCard = ({ icon: Icon, label, value, color, bgColor }) => (
    <Card className="border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className={`p-3 rounded-lg ${bgColor}`}>
            <Icon className={`size-6 ${color}`} />
          </div>
          <span className="text-xs font-semibold text-gray-500 uppercase">Insight</span>
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-600 mt-1">{label}</p>
        </div>
      </div>
    </Card>
  )

  // Distribution Item Component
  const DistributionItem = ({ label, count, total, percentage }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-700 font-medium">{label}</span>
        <span className="text-gray-900 font-semibold">
          {count} ({percentage}%)
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-core rounded-full h-2 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  )

  // Recent Item Component
  const RecentStaffItem = ({ staff }) => (
    <Link
      href={`/users/${user.handle}/company/${info.slug}/staff/${staff.id}/`}
      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
    >
      <div className="space-y-1">
        <p className="text-sm font-semibold text-gray-900">@{staff.users?.handle}</p>
        <p className="text-xs text-gray-600">{staff.users?.email}</p>
      </div>
      <ArrowRight className="size-4 text-gray-400" />
    </Link>
  )

  return (
    <div className="space-y-5 grow flex flex-col overflow-y-auto">
      {isLoadingStaff ? (
        <div className="flex items-center justify-center h-96">
          <Spinner className="size-8 text-core" spinning={true} />
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          icon={Users}
          label="Total Staff"
          value={stats.totalStaff}
          color="text-core"
          bgColor="bg-core/10"
        />
        <StatCard
          icon={UserCheck}
          label="Active"
          value={stats.activeStaff}
          color="text-green-600"
          bgColor="bg-green-100"
        />
        <StatCard
          icon={UserX}
          label="Suspended"
          value={stats.suspendedStaff}
          color="text-red-600"
          bgColor="bg-red-100"
        />
        <StatCard
          icon={Clock}
          label="Pending Invites"
          value={stats.pendingInvites}
          color="text-army"
          bgColor="bg-army/10"
        />
        <StatCard
          icon={TrendingUp}
          label="New This Month"
          value={stats.newThisMonth}
          color="text-purple-600"
          bgColor="bg-purple-100"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Access Level Distribution */}
        <Card className="border-gray-200 shadow-sm p-6 lg:col-span-1">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="size-5 text-core" />
                <h3 className="text-lg font-bold text-gray-900">By Access Level</h3>
              </div>
              <p className="text-sm text-gray-600">Staff distribution</p>
            </div>

            <div className="space-y-4">
              {Object.entries(stats.byAccessLevel)
                .sort(([, a], [, b]) => b - a)
                .map(([level, count]) => {
                  const percentage =
                    stats.totalStaff > 0 ? Math.round((count / stats.totalStaff) * 100) : 0
                  return (
                    <DistributionItem
                      key={level}
                      label={level}
                      count={count}
                      total={stats.totalStaff}
                      percentage={percentage}
                    />
                  )
                })}
            </div>
          </div>
        </Card>

        {/* Branch Distribution */}
        <Card className="border-gray-200 shadow-sm p-6 lg:col-span-1">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="size-5 text-core" />
                <h3 className="text-lg font-bold text-gray-900">By Branch</h3>
              </div>
              <p className="text-sm text-gray-600">Staff location</p>
            </div>

            <div className="space-y-4">
              {Object.entries(stats.byBranch)
                .sort(([, a], [, b]) => b - a)
                .map(([branch, count]) => {
                  const percentage =
                    stats.totalStaff > 0 ? Math.round((count / stats.totalStaff) * 100) : 0
                  return (
                    <DistributionItem
                      key={branch}
                      label={branch}
                      count={count}
                      total={stats.totalStaff}
                      percentage={percentage}
                    />
                  )
                })}
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="border-gray-200 shadow-sm p-6 lg:col-span-1">
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
              <p className="text-sm text-gray-600">Common tasks</p>
            </div>

            <div className="space-y-3">
              <Link href={`/users/${user.handle}/company/${info.slug}/staff/directory`}>
                <Button className="w-full bg-core hover:bg-core/90 text-white border-0">
                  View Directory
                </Button>
              </Link>
              <Link href={`/users/${user.handle}/company/${info.slug}/staff/new`}>
                <Button variant="outline" className="w-full border-gray-300">
                  Invite Staff
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Hires */}
        <Card className="border-gray-200 shadow-sm p-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-gray-900">Recent Hires</h3>
              <p className="text-sm text-gray-600">
                {stats.recentHires.length > 0
                  ? 'Latest staff added to company'
                  : 'No recent hires'}
              </p>
            </div>

            <div className="space-y-2">
              {stats.recentHires.length > 0 ? (
                stats.recentHires.map((staff) => (
                  <RecentStaffItem key={staff.id} staff={staff} />
                ))
              ) : (
                <p className="text-sm text-gray-500 py-4 text-center">No recent hires</p>
              )}
            </div>

            {stats.recentHires.length > 0 && (
              <Link
                href={`/users/${user.handle}/company/${info.slug}/staff/directory`}
                className="inline-flex items-center gap-2 text-core hover:underline text-sm font-semibold mt-2"
              >
                View All Staff <ArrowRight className="size-3" />
              </Link>
            )}
          </div>
        </Card>

        {/* Recent Suspensions */}
        <Card className="border-gray-200 shadow-sm p-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-gray-900">Suspended Accounts</h3>
              <p className="text-sm text-gray-600">
                {stats.recentSuspensions.length > 0
                  ? 'Recently suspended staff'
                  : 'No suspended staff'}
              </p>
            </div>

            <div className="space-y-2">
              {stats.recentSuspensions.length > 0 ? (
                stats.recentSuspensions.map((staff) => (
                  <div
                    key={staff.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-200"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-gray-900">@{staff.users?.handle}</p>
                      <p className="text-xs text-gray-600">{staff.users?.email}</p>
                    </div>
                    <Link
                      href={`/users/${user.handle}/company/${info.slug}/staff/${staff.id}/`}
                      className="text-red-600 hover:text-red-700"
                    >
                      <ArrowRight className="size-4" />
                    </Link>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 py-4 text-center">
                  No suspended staff members
                </p>
              )}
            </div>
          </div>
        </Card>
      </div>
        </>
      )}
    </div>
  )
}