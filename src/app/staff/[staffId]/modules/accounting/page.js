'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

/**
 * Staff Accounting Module
 * 
 * Company-wide module for staff who are accountants
 * Can view/edit company-level accounting but NOT company settings
 */
export default function StaffAccountingPage() {
  const params = useParams();
  const { staffId } = params;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Link href={`/staff/${staffId}/modules`} className="text-core text-sm mb-4 inline-block hover:underline">
            ← Back to Modules
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Accounting</h1>
          <p className="text-xs text-gray-600">Company-wide accounting and financial reports</p>
        </div>
      </div>

      {/* TODO: Import and use company-wide accounting component */}
      {/* <AccountingModule /> */}

      <div className="border-dashed border-2 border-gray-300 rounded-lg p-8 text-center">
        <p className="text-sm text-gray-600">Accounting module coming soon...</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-xs text-blue-900">
          <strong>Permissions:</strong> You have access to company-wide accounting data only. You cannot modify company settings or billing information.
        </p>
      </div>
    </div>
  );
}
