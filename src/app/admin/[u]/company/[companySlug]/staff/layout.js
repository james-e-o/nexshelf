'use client';

import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Users, FileText } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/headers/dashboard-header';

const navigationItems = [
  { title: 'Applications', href: 'applications', icon: FileText },
  { title: 'Active Staff', href: 'active', icon: Users },
];

export default function StaffLayout({ children }) {
  const params = useParams();
  const { u: userId, companySlug } = params;
  const currentPath = params.slug?.[0] || 'applications';

  return (
    <div className="flex flex-col h-full">
      {/* Header with Navigation */}
      <div className="border-b bg-white">
        <Header>
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Staff Management</h2>
              <p className="text-xs text-slate-600">Manage your team and applications</p>
            </div>
          </div>
        </Header>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b bg-slate-50">
        <div className="flex gap-1 px-6 py-3">
          {navigationItems.map((item) => {
            const isActive = currentPath === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={`/admin/${userId}/company/${companySlug}/staff/${item.href}`}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                  isActive
                    ? 'bg-core text-white'
                    : 'text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Icon className="size-4" />
                {item.title}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {children}
      </div>
    </div>
  );
}