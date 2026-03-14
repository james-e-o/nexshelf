'use client';

import Link from 'next/link';
import { supabase } from '../../../../../../../../../config/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function RolesPage() {
  // Placeholder data - will be replaced with actual data fetching
  const roles = [
    { id: 'cashier', name: 'Cashier', description: 'Handles customer sales transactions', active: true },
    { id: 'purchasing-officer', name: 'Purchasing Officer', description: 'Manages purchase orders', active: true },
    { id: 'warehouse-clerk', name: 'Warehouse Clerk', description: 'Manages inventory and stock', active: true },
    { id: 'store-manager', name: 'Store Manager', description: 'Oversees store operations', active: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-base font-medium tracking-tight">Roles</h2>
          <p className="text-gray-600 text-sm mt-2">Create and manage job roles</p>
        </div>
        <Button>+ Create Role</Button>
      </div>

      <div className="space-y-3">
        {roles.map((role) => (
          <Link key={role.id} href={`roles/${role.id}`}>
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-base text-core">{role.name}</h3>
                    <Badge variant={role.active ? 'default' : 'secondary'}>
                      {role.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{role.description}</p>
                </div>
                <span className="text-gray-400">→</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
