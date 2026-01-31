'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';
import { Settings2, Plus, List, Palette } from 'lucide-react';

/**
 * Branch Modules Layout
 * 
 * Provides navigation for branch-scoped modules
 * Uses reusable ModuleLayout from components
 */
export default function BranchModulesLayout({ children }) {
  const params = useParams();
  const { staffId, branchId } = params;
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigationItems = [
    { label: 'Products', href: 'products', icon: List },
    { label: 'Create Product', href: 'products/create', icon: Plus },
    { label: 'Collections', href: 'products/collections', icon: Palette },
    { label: 'Settings', href: 'settings', icon: Settings2 },
  ];

  return (
    <div className="w-full flex-col font-WixMade flex px-1 h-full overflow-hidden">
      {/* Sidebar Navigation */}
      <header className="bg-white border-gray-200 transition-all py-1 items-center duration-300 flex">
        <div className="text-base ml-2 mr-5">
          <h2 className="font-bold text-gray-800">Branch Modules</h2>
        </div>
        <nav className="flex gap-1.5 overflow-y-auto">
          {navigationItems.map((item) => (
            <Link
              key={item.label}
              href={`/staff/${staffId}/branches/${branchId}/modules/${item.href}`}
            >
              <Button variant="ghost" className="h-7">
                <span className="text-xl">
                  <item.icon className="text-army font-extrabold" />
                </span>
                {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
              </Button>
            </Link>
          ))}
        </nav>
        <div className="">
          <Button onClick={() => setSidebarOpen(!sidebarOpen)} variant="icon">
            {sidebarOpen ? '◀' : '▶'}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
