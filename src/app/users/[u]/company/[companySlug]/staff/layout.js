'use client';

import { useContext } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { CompanyInfoContext, ReusableCompanySidebar } from '../layout';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function StaffLayout({ children }) {
  const { info, user } = useContext(CompanyInfoContext);
  const pathname = usePathname();

  // Determine active tab
  const isActive = (path) => pathname.includes(path);
  const isDashboard = pathname.endsWith('/staff');

  return (
    <ReusableCompanySidebar>
      <div className="space-y-5 mx-3 font-WixMade">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-slate-700">Staff Management</h1>
          <p className="text-gray-600 text-sm">Manage and view all company staff members</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-3 border-b border-gray-200 pb-4">
          <div className="inline-flex gap-2 bg-gray-100 rounded-lg p-1">
            <Link href={`/users/${user.handle}/company/${info.slug}/staff`}>
              <Button 
                variant="ghost"
                className={`px-4 py-1 rounded-md font-medium shadow-sm border ${
                  isDashboard
                    ? 'bg-white text-core border-gray-200 hover:bg-white'
                    : 'text-gray-600 hover:text-core hover:bg-gray-50'
                }`}
              >
                Dashboard
              </Button>
            </Link>
            <Link href={`/users/${user.handle}/company/${info.slug}/staff/directory`}>
              <Button 
                variant="ghost"
                className={`px-4 py-1 rounded-md font-medium shadow-sm border ${
                  isActive('/directory')
                    ? 'bg-white text-core border-gray-200 hover:bg-white'
                    : 'text-gray-600 hover:text-core hover:bg-gray-50'
                }`}
              >
                Staff Directory
              </Button>
            </Link>
            <Link href={`/users/${user.handle}/company/${info.slug}/staff/onboarding`}>
              <Button 
                variant="ghost"
                className={`px-4 py-1 rounded-md font-medium shadow-sm border ${
                  isActive('/onboarding')
                    ? 'bg-white text-core border-gray-200 hover:bg-white'
                    : 'text-gray-600 hover:text-core hover:bg-gray-50'
                }`}
              >
                Onboarding
              </Button>
            </Link>
            <Link href={`/users/${user.handle}/company/${info.slug}/staff/settings`}>
              <Button 
                variant="ghost"
                className={`px-4 py-1 rounded-md font-medium shadow-sm border ${
                  isActive('/settings')
                    ? 'bg-white text-core border-gray-200 hover:bg-white'
                    : 'text-gray-600 hover:text-core hover:bg-gray-50'
                }`}
              >
                Settings
              </Button>
            </Link>
          </div>
          
          <div className="ml-auto flex gap-2">
            <Link href={`/users/${user.handle}/company/${info.slug}/staff/new`}>
              <Button variant="ghost" size="sm" className="bg-army px-6 hover:bg-army/90 text-white border-0">
                <Plus className="size-4" /> <span className="ml-2">Invite Staff</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Page Content */}
        {children}
      </div>
    </ReusableCompanySidebar>
  );
}