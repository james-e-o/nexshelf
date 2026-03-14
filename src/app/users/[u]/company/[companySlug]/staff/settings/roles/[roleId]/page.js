'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export default function RoleDetailPage() {
  const params = useParams();
  const { roleId } = params;
  
  const capitalizeId = (str) => {
    if (!str) return '';
    return str
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  const [formData, setFormData] = useState({
    name: 'Cashier',
    description: 'Handles customer sales transactions',
    active: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Link href="../roles" className="text-blue-600 hover:underline text-sm mb-2 block">
            ← Back to Roles
          </Link>
          <h2 className="text-base font-medium tracking-tight">{capitalizeId(roleId)}</h2>
        </div>
      </div>

      <Card className="p-6 space-y-6">
        <div className="grid gap-4">
          <div>
            <Label htmlFor="name">Role Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Cashier"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the role's responsibilities..."
              className="mt-1"
              rows={3}
            />
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="active"
              name="active"
              checked={formData.active}
              onCheckedChange={(checked) =>
                setFormData(prev => ({ ...prev, active: checked }))
              }
            />
            <Label htmlFor="active">Active</Label>
          </div>
        </div>

        <div className="flex gap-2">
          <Button className="bg-core text-white">Save Changes</Button>
          <Button variant="outline">Cancel</Button>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Module Access</h2>
        <p className="text-gray-600 mb-4">
          Configure which modules this role can access
        </p>
        <Link href={`/users/[u]/company/[companySlug]/staff/settings/roles/${roleId}/modules`}>
          <Button variant="outline">Manage Module Access</Button>
        </Link>
      </Card>
    </div>
  );
}
