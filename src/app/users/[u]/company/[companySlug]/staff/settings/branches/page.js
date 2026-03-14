'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

export default function BranchesPage() {
  const [settings, setSettings] = useState({
    admin_branch_scope: 'all_branches',
    supervisor_scope: 'single_branch',
    restrict_cross_branch_data: true,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value,
    }));
  };

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
        <h2 className="text-base font-medium tracking-tight">Branch Policies</h2>
        <p className="text-gray-600 text-sm mt-2">Control how staff interact with branches</p>
      </div>

      <Card className="p-6 space-y-6">
        <div className="grid gap-6">
          <div>
            <Label htmlFor="admin_branch_scope">Admin Branch Scope</Label>
            <Select 
              name="admin_branch_scope" 
              value={settings.admin_branch_scope}
              onChange={handleChange}
            >
              <option value="all_branches">All Branches</option>
              <option value="assigned_branches">Assigned Branches</option>
              <option value="primary_branch">Primary Branch Only</option>
            </Select>
            <p className="text-xs text-gray-500 mt-2">
              Determines which branches admin staff can access
            </p>
          </div>

          <div>
            <Label htmlFor="supervisor_scope">Supervisor Branch Scope</Label>
            <Select 
              name="supervisor_scope" 
              value={settings.supervisor_scope}
              onChange={handleChange}
            >
              <option value="all_branches">All Branches</option>
              <option value="single_branch">Single Branch</option>
              <option value="assigned_branches">Assigned Branches</option>
            </Select>
            <p className="text-xs text-gray-500 mt-2">
              Determines which branches supervisors can access
            </p>
          </div>

          <div className="border-t pt-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>Restrict Cross-branch Data</Label>
                <p className="text-xs text-gray-500 mt-1">
                  Prevent staff from viewing/accessing data outside their assigned branch
                </p>
              </div>
              <Switch
                checked={settings.restrict_cross_branch_data}
                onCheckedChange={() => handleToggle('restrict_cross_branch_data')}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <Button className="bg-core text-white">Save Branch Policies</Button>
          <Button variant="outline">Cancel</Button>
        </div>
      </Card>
    </div>
  );
}
