'use client';

import { useParams } from 'next/navigation';

/**
 * Staff Branch Products Page
 * 
 * Reuses ProductsList component from @/components/modules/products
 * This is a branch-scoped module
 */
export default function StaffBranchProductsPage() {
  const params = useParams();
  const { branchId } = params;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <p className="text-xs text-gray-600">Manage products for branch: {branchId}</p>
      </div>

      {/* TODO: Import and use ProductsList component */}
      {/* <ProductsList branchId={branchId} /> */}

      <div className="border-dashed border-2 border-gray-300 rounded-lg p-8 text-center">
        <p className="text-sm text-gray-600">Products module coming soon...</p>
      </div>
    </div>
  );
}
