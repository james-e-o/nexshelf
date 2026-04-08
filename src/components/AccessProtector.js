'use client';

import { useRouter } from 'next/navigation';
import { useAccess } from '@/hooks/useAccess';
import { requirePermission } from '@/lib/access-control';
import { checkFeaturePermission } from '@/lib/feature-permissions';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

/**
 * Route protection wrapper component
 * Uses permission-based access control via useAccess hook
 * 
 * Usage - Permission Array:
 * <AccessProtector requiredPermissions={['can_view_staff']}>
 *   <YourProtectedContent />
 * </AccessProtector>
 * 
 * Usage - Feature Key:
 * <AccessProtector requiredFeature="staff_view">
 *   <YourProtectedContent />
 * </AccessProtector>
 */
export default function AccessProtector({
  children,
  requiredFeature = null,
  requiredPermissions = null,
  showMessage = true,
  fallback = null,
}) {
  const router = useRouter();
  const access = useAccess();

  if (access.isLoading) {
    return <div className="p-4">Loading permissions...</div>;
  }

  if (access.error) {
    console.error('Permission error:', access.error);
    return null;
  }

  let hasAccess = false;

  // Check by permissions array
  if (requiredPermissions) {
    hasAccess = Array.isArray(requiredPermissions)
      ? requiredPermissions.every(perm => access.permissions[perm] === true)
      : access.permissions[requiredPermissions] === true;
  }
  // Check by feature key
  else if (requiredFeature) {
    hasAccess = checkFeaturePermission(requiredFeature, access.permissions);
  }

  // Check suspension
  if (access.isAccountSuspended) {
    hasAccess = false;
  }

  // If no access
  if (!hasAccess) {
    if (fallback) return fallback;

    if (!showMessage) return null;

    return (
      <div className="flex items-center justify-center h-full p-4">
        <Card className="p-8 max-w-md text-center">
          <AlertTriangle className="w-12 h-12 text-amber-600 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-neutral-800 mb-2">
            Access Restricted
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            You don't have permission to access this resource.
          </p>
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="w-full"
          >
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  return children;
}
