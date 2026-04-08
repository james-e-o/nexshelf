'use client'

import { useContext } from 'react'       
import { DataContext } from './layout'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Factory } from 'lucide-react'
import Link from 'next/link'
import { Spinner } from '@/components/ui/spinner'
import UserSidebarLayout from '@/components/user-sidebar-layout'

function UserDashboardContent() {
  const params = useParams()
  const { data } = useContext(DataContext)


  return (
    <div>
      <div>
        <h1 className="text-xl font-semibold">Welcome, {data.profile?.username}</h1>
      </div>
      <div className='mt-4'>
        {data?.companiesLoading ? (
          <div className='flex items-center justify-center h-64 gap-2'>
            <span className='text-gray-600'>Loading companies</span>
            <Spinner className='size-4 text-core' spinning={true} />
          </div>
        ) : data?.companies?.length > 0 ? (
          <div className='space-y-4'>
            {data.companies.map((company, index) => (
              <Link key={company.id || company.slug || index} href={`/users/${params.u}/company/${company.slug}`}>
                <div className='p-4 rounded-lg border border-gray-200 hover:border-core hover:shadow-md transition-all cursor-pointer'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <h3 className='font-medium'>{company.name}</h3>
                      <p className='text-xs text-gray-500 mt-1'>{company.slug}</p>
                    </div>
                    {company.badge && (
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        company.badge === 'owner' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {company.badge.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className='bg-armylight rounded-2xl px-5 py-7 text-center'>
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-white">
                <Factory className="size-5 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  No Companies yet created
                </h3>
              </div>
              <Link href={`/users/${params.u}/new-company`}>
                <Button className='mt-2 h-8 hover:bg-core/90 text-xs bg-core'>
                  Create Company
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AdminUserPage() {
  return (
    <UserSidebarLayout>
      <UserDashboardContent />
    </UserSidebarLayout>
  )
}
