'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen, Zap, Users } from 'lucide-react';

/**
 * Staff Company-wide Modules Page
 * 
 * Shows modules accessible at company level:
 * - Accounting (if staff is accountant)
 * - HR (if staff is HR)
 * - Analytics (if staff has access)
 */
export default function StaffModulesPage() {
  const params = useParams();
  const { staffId } = params;
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        // TODO: Fetch company-level modules based on staff permissions
        // Example:
        // const response = await fetch(`/api/staff/${staffId}/modules`);
        // const data = await response.json();
        // setModules(data);

        // Mock data - these are company-scoped modules
        setModules([
          {
            id: 'accounting',
            name: 'Accounting',
            description: 'Manage company-wide accounting and financial reports',
            slug: 'accounting',
            icon: BookOpen,
          },
          {
            id: 'hr',
            name: 'Human Resources',
            description: 'Manage staff and company HR',
            slug: 'hr',
            icon: Users,
          },
        ]);
      } catch (error) {
        console.error('Error fetching modules:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, [staffId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-sm text-gray-600">Loading modules...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Company-wide Modules</h1>
        <p className="text-sm text-gray-600 mt-1">Access company-level functionality</p>
      </div>

      {/* Modules Grid */}
      {modules.length === 0 ? (
        <div className="text-center py-12 border border-dashed rounded-lg">
          <p className="text-sm text-gray-600">No company-wide modules available</p>
          <Link href={`/staff/${staffId}/branches`} className="mt-4 inline-block">
            <Button variant="outline">Back to Branches</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <Link key={mod.id} href={`/staff/${staffId}/modules/${mod.slug}`}>
                <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow bg-white cursor-pointer">
                  <Icon className="h-8 w-8 text-core mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900">{mod.name}</h3>
                  <p className="text-xs text-gray-600 mt-2">{mod.description}</p>
                  <Button variant="ghost" className="mt-4 text-core text-xs">
                    Open →
                  </Button>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-8">
        <p className="text-xs text-amber-900">
          <strong>Note:</strong> Company-wide modules are separate from branch-specific modules. Your access is determined by your role and permissions.
        </p>
      </div>
    </div>
  );
}
