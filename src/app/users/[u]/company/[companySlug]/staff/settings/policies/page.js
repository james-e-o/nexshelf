'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export default function PoliciesPage() {
  const [settings, setSettings] = useState({
    // Branch rules
    require_branch_assignment: true,
    allow_multi_branch_staff: true,
    // Visibility rules
    allow_staff_directory_view: true,
    show_inactive_staff: false,
    // Profile rules
    allow_staff_profile_edit: true,
    allow_staff_change_password: true,
  });

  const handleToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <Link href="../" className="text-blue-600 hover:underline text-sm mb-2 block">
          ← Back to Settings
        </Link>
        <h2 className="text-base font-medium tracking-tight">Staff Policies</h2>
        <p className="text-gray-600 text-sm mt-2">Organization rules for staff structure</p>
      </div>

      <Card className="p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Branch Rules</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Require Branch Assignment</Label>
              <Switch
                checked={settings.require_branch_assignment}
                onCheckedChange={() => handleToggle('require_branch_assignment')}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Allow Multi-branch Staff</Label>
              <Switch
                checked={settings.allow_multi_branch_staff}
                onCheckedChange={() => handleToggle('allow_multi_branch_staff')}
              />
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h2 className="text-lg font-semibold mb-4">Visibility Rules</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Allow Staff Directory View</Label>
              <Switch
                checked={settings.allow_staff_directory_view}
                onCheckedChange={() => handleToggle('allow_staff_directory_view')}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Show Inactive Staff</Label>
              <Switch
                checked={settings.show_inactive_staff}
                onCheckedChange={() => handleToggle('show_inactive_staff')}
              />
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h2 className="text-lg font-semibold mb-4">Profile Rules</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Allow Staff Profile Edit</Label>
              <Switch
                checked={settings.allow_staff_profile_edit}
                onCheckedChange={() => handleToggle('allow_staff_profile_edit')}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Allow Staff Change Password</Label>
              <Switch
                checked={settings.allow_staff_change_password}
                onCheckedChange={() => handleToggle('allow_staff_change_password')}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <Button className="bg-core text-white">Save Policies</Button>
          <Button variant="outline">Cancel</Button>
        </div>
      </Card>
    </div>
  );
}
