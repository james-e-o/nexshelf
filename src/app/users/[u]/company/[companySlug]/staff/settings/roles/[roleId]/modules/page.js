'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export default function ModuleAccessPage() {
  const params = useParams();
  const { roleId } = params;
  
  const capitalizeId = (str) => {
    if (!str) return '';
    return str
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  const [modules, setModules] = useState([
    { key: 'sales', label: 'Sales', enabled: true },
    { key: 'customers', label: 'Customers', enabled: true },
    { key: 'purchases', label: 'Purchases', enabled: false },
    { key: 'inventory', label: 'Inventory', enabled: false },
    { key: 'accounting', label: 'Accounting', enabled: false },
  ]);

  const handleModuleToggle = (moduleKey) => {
    setModules(prev =>
      prev.map(mod =>
        mod.key === moduleKey ? { ...mod, enabled: !mod.enabled } : mod
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Link href="../" className="text-blue-600 hover:underline text-sm mb-2 block">
            ← Back to Role
          </Link>
          <h2 className="text-base font-medium tracking-tight">{capitalizeId(roleId)} - Module Access</h2>
        </div>
      </div>

      <Card className="p-6 space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-4">Available Modules</h2>
          <p className="text-gray-600 mb-6">
            Select which modules this role can access
          </p>
        </div>

        <div className="space-y-3">
          {modules.map((module) => (
            <div key={module.key} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
              <Checkbox
                id={module.key}
                checked={module.enabled}
                onCheckedChange={() => handleModuleToggle(module.key)}
                className="bg-white border-gray-300 [&[data-state=checked]]:bg-army [&[data-state=checked]]:border-army [&[data-state=checked]]:text-white"
              />
              <Label
                htmlFor={module.key}
                className="cursor-pointer flex-1 font-medium"
              >
                {module.label}
              </Label>
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-4">
          <Button className="bg-core text-white">Save Module Access</Button>
          <Button variant="outline">Cancel</Button>
        </div>
      </Card>
    </div>
  );
}
