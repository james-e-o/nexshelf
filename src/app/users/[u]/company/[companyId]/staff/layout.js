'use client';

import { useContext, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { CompanyInfoContext, ReusableCompanySidebar } from '../layout';
import { StaffProvider } from '@/components/contexts/staff-context';
import { Button } from '@/components/ui/button';
import { Plus, List, ChevronLeft, ChartBar } from 'lucide-react';

function StaffLayoutContent({ children }) {
  const { info, user } = useContext(CompanyInfoContext);
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Determine active tab
  const isActive = (path) => pathname.includes(path);
  const isDashboard = pathname.endsWith('/staff');

  return (
    <ReusableCompanySidebar>
      <div className="space-y-4 mx-3 h-full flex-col flex overflow-hidden font-WixMade">
        {/* Header Section with Title and Navigation Buttons */}
        <div className="flex items-center justify-between gap-6">
          {/* Left: Title + Navigation Buttons + Collapse */}
          <div className="flex items-center gap-3">
            <h1 className="text-lg mr-4 font-bold text-slate-700 whitespace-nowrap">Staff Management</h1>
            
            {/* Navigation Buttons */}
            <div className="flex items-center gap-2">
              <Link href={`/users/${user.handle}/company/${info.id}/staff`}>
                <Button 
                  variant="ghost"
                  size="sm"
                  className={`px-3 py-1.5 rounded-full font-medium text-sm gap-1.5 border ${
                    isDashboard
                      ? 'bg-slate-100 text-core border-slate-200'
                      : 'text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <ChartBar className="size-4" />
                  <span className={isCollapsed ? 'hidden' : ''}>Overview</span>
                </Button>
              </Link>

              <Link href={`/users/${user.handle}/company/${info.id}/staff/directory`}>
                <Button 
                  variant="ghost"
                  size="sm"
                  className={`px-3 py-1.5 rounded-full font-medium text-sm gap-1.5 border ${
                    isActive('/directory')
                      ? 'bg-slate-100 text-core border-slate-200'
                      : 'text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <List className="size-4" />
                  <span className={isCollapsed ? 'hidden' : ''}>Directory</span>
                </Button>
              </Link>

              <Link href={`/users/${user.handle}/company/${info.id}/staff/onboarding`}>
                <Button 
                  variant="ghost"
                  size="sm"
                  className={`px-3 py-1.5 rounded-full font-medium text-sm gap-1.5 border ${
                    isActive('/onboarding')
                      ? 'bg-slate-100 text-core border-slate-200'
                      : 'text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Plus className="size-4" />
                  <span className={isCollapsed ? 'hidden' : ''}>Onboarding</span>
                </Button>
              </Link>

              <Link href={`/users/${user.handle}/company/${info.id}/staff/settings`}>
                <Button 
                  variant="ghost"
                  size="sm"
                  className={`px-3 py-1.5 rounded-full font-medium text-sm gap-1.5 border ${
                    isActive('/settings')
                      ? 'bg-slate-100 text-core border-slate-200'
                      : 'text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  ⚙️
                  <span className={isCollapsed ? 'hidden' : ''}>Settings</span>
                </Button>
              </Link>

              {/* Collapse Button for Navigation Items */}
              <button 
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className={`size-5 text-gray-600 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {/* Right: Invite Button */}
          <Link href={`/users/${user.handle}/company/${info.id}/staff/new`}>
            <Button variant="ghost" size="sm" className="bg-army hover:bg-army/90 text-white border-0 rounded-md px-5 gap-1.5">
              <Plus className="size-4" />
              <span>Invite</span>
            </Button>
          </Link>
        </div>

        {/* Description Text */}
        <p className="text-gray-600 text-sm">Manage and view all company staff members</p>

        {/* Page Content */}
        {children}
      </div>
    </ReusableCompanySidebar>
  );
}

export default function StaffLayout({ children }) {
  const { info } = useContext(CompanyInfoContext);

  return (
    <StaffProvider companyId={info?.id}>
      <StaffLayoutContent>{children}</StaffLayoutContent>
    </StaffProvider>
  );
}