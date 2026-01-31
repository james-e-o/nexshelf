'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

/**
 * Staff Branches Page
 * 
 * Displays branches accessible to the staff member
 * - Supervisors see all branches
 * - Regular staff see assigned branches only
 */
export default function StaffBranchesPage() {
  const params = useParams();
  const router = useRouter();
  const { staffId } = params;
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        // TODO: Fetch branches from API based on staff permissions
        // Example:
        // const response = await fetch(`/api/staff/${staffId}/branches`);
        // const data = await response.json();
        // setBranches(data);

        // Mock data for now
        const mockBranches = [
          { id: 'branch-1', name: 'Lagos Branch', slug: 'lagos-1' },
          { id: 'branch-2', name: 'Abuja Branch', slug: 'abuja-1' },
        ];
        setBranches(mockBranches);
      } catch (error) {
        console.error('Error fetching branches:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, [staffId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-sm text-gray-600">Loading branches...</p>
      </div>
    );
  }

  if (branches.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4">No branches assigned</p>
          <Link href={`/staff/${staffId}`}>
            <Button variant="outline">Go Back</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Select Branch</h1>
      <p className="text-sm text-gray-600 mb-8">Choose a branch to access modules</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {branches.map((branch) => (
          <Link
            key={branch.id}
            href={`/staff/${staffId}/branches/${branch.slug}`}
          >
            <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer bg-white">
              <h2 className="text-lg font-semibold text-gray-900">{branch.name}</h2>
              <p className="text-xs text-gray-500 mt-1">{branch.id}</p>
              <Button variant="ghost" className="mt-4 text-core">
                Access Branch →
              </Button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
