'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Package, Zap, DollarSign } from 'lucide-react';

/**
 * Staff Branch Dashboard
 * 
 * Shows:
 * - Branch overview
 * - Accessible modules
 * - Quick actions
 */
export default function StaffBranchPage() {
  const params = useParams();
  const { staffId, branchId } = params;
  const [branchData, setBranchData] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBranchData = async () => {
      try {
        // TODO: Fetch branch data and staff's accessible modules
        // Example:
        // const response = await fetch(`/api/staff/${staffId}/branches/${branchId}`);
        // const data = await response.json();
        // setBranchData(data.branch);
        // setModules(data.modules);

        // Mock data
        setBranchData({
          id: branchId,
          name: 'Lagos Branch',
          slug: branchId,
        });

        setModules([
          { id: 'products', name: 'Products', slug: 'products', icon: Package },
          { id: 'inventory', name: 'Inventory', slug: 'inventory', icon: Zap },
          { id: 'sales', name: 'Sales', slug: 'sales', icon: DollarSign },
        ]);
      } catch (error) {
        console.error('Error loading branch data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBranchData();
  }, [staffId, branchId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-sm text-gray-600">Loading branch...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <Link href={`/staff/${staffId}/branches`} className="text-core text-sm mb-4 inline-block hover:underline">
          ← Back to Branches
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">{branchData?.name}</h1>
        <p className="text-sm text-gray-600 mt-1">Branch ID: {branchData?.id}</p>
      </div>

      {/* Accessible Modules */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Accessible Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <Link
                key={mod.id}
                href={`/staff/${staffId}/branches/${branchId}/modules/${mod.slug}`}
              >
                <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow bg-white cursor-pointer">
                  <Icon className="h-8 w-8 text-core mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900">{mod.name}</h3>
                  <Button variant="ghost" className="mt-4 text-core text-xs">
                    Open →
                  </Button>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Company-wide Modules Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-xs text-blue-900">
          <strong>Note:</strong> You also have access to company-wide modules like Accounting. Visit the <Link href={`/staff/${staffId}/modules`} className="text-core underline">company modules</Link> section to access them.
        </p>
      </div>
    </div>
  );
}
