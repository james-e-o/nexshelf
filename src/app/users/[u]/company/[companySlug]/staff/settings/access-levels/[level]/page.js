'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export default function AccessLevelDetailPage({ params }) {
  const { level } = params;

  const [permissions, setPermissions] = useState({
    staff_authority: [
      { key: 'can_view_staff', label: 'View Staff', enabled: true },
      { key: 'can_create_staff', label: 'Create Staff', enabled: true },
      { key: 'can_edit_staff', label: 'Edit Staff', enabled: true },
      { key: 'can_delete_staff', label: 'Delete Staff', enabled: false },
      { key: 'can_assign_roles', label: 'Assign Roles', enabled: true },
      { key: 'can_assign_access_levels', label: 'Assign Access Levels', enabled: false },
    ],
    administrative_authority: [
      { key: 'can_manage_roles', label: 'Manage Roles', enabled: false },
      { key: 'can_manage_access_levels', label: 'Manage Access Levels', enabled: false },
      { key: 'can_view_staff_settings', label: 'View Staff Settings', enabled: true },
      { key: 'can_edit_staff_settings', label: 'Edit Staff Settings', enabled: false },
    ],
    financial_authority: [
      { key: 'can_view_financial_reports', label: 'View Financial Reports', enabled: true },
      { key: 'can_export_financial_reports', label: 'Export Financial Reports', enabled: true },
      { key: 'can_approve_expenses', label: 'Approve Expenses', enabled: false },
    ],
    system_authority: [
      { key: 'can_manage_modules', label: 'Manage Modules', enabled: false },
      { key: 'can_manage_branches', label: 'Manage Branches', enabled: false },
    ],
  });

  const handlePermissionToggle = (category, permissionKey) => {
    setPermissions(prev => ({
      ...prev,
      [category]: prev[category].map(perm =>
        perm.key === permissionKey ? { ...perm, enabled: !perm.enabled } : perm
      ),
    }));
  };

  const renderCategory = (categoryKey, categoryTitle, permissions) => (
    <div key={categoryKey} className="space-y-3">
      <h3 className="font-semibold text-sm text-gray-700 uppercase tracking-wide">
        {categoryTitle}
      </h3>
      <div className="space-y-2 pl-2">
        {permissions.map((perm) => (
          <div key={perm.key} className="flex items-center gap-2">
            <Checkbox
              id={perm.key}
              checked={perm.enabled}
              onCheckedChange={() => handlePermissionToggle(categoryKey, perm.key)}
            />
            <Label htmlFor={perm.key} className="cursor-pointer">
              {perm.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Link href="../access-levels" className="text-blue-600 hover:underline text-sm mb-2 block">
            ← Back to Access Levels
          </Link>
          <h2 className="text-base font-medium tracking-tight">{level} Access Level</h2>
        </div>
      </div>

      <Card className="p-6 space-y-6">
        {renderCategory('staff_authority', 'Staff Authority', permissions.staff_authority)}
        <div className="border-t pt-4" />
        {renderCategory('administrative_authority', 'Administrative Authority', permissions.administrative_authority)}
        <div className="border-t pt-4" />
        {renderCategory('financial_authority', 'Financial Authority', permissions.financial_authority)}
        <div className="border-t pt-4" />
        {renderCategory('system_authority', 'System Authority', permissions.system_authority)}

        <div className="flex gap-2 pt-4 border-t">
          <Button>Save Permissions</Button>
          <Button variant="outline">Cancel</Button>
        </div>
      </Card>
    </div>
  );
}
