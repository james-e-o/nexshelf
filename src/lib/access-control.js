/**
 * Access Control Helper Functions
 * Works with useAccess() hook for permission-based access control
 * 
 * Usage in layouts:
 * 
 * 'use client'
 * import { useRouter } from 'next/navigation'
 * import { useAccess } from '@/hooks/useAccess'
 * import { requirePermission } from '@/lib/access-control'
 * 
 * export default function ProtectedLayout({ children }) {
 *   const router = useRouter()
 *   const access = useAccess()
 *   
 *   // Check access and redirect if denied
 *   requirePermission(access, 'can_view_staff', router, {
 *     redirectUrl: '/users/[u]/company/[companySlug]'
 *   })
 *   
 *   return children
 * }
 */

import { toast } from 'sonner';

/**
 * Check if user has required permission(s)
 * @param {Object} accessData - Result from useAccess() hook
 * @param {string|string[]} requiredPermissions - Single permission key or array
 * @param {Object} router - Optional Next.js useRouter() instance for redirect
 * @param {Object} options - Optional { toastMessage, redirectUrl, silent }
 * @returns {boolean}
 */
export function requirePermission(accessData, requiredPermissions, router = null, options = {}) {
  const { toastMessage = true, redirectUrl = null, silent = false } = options;

  // Owner bypasses all checks
  if (accessData.isOwner) {
    return true;
  }

  // Check suspension first
  if (accessData.isAccountSuspended) {
    if (!silent && toastMessage) {
      toast.error('Your account has been suspended');
    }
    if (router && redirectUrl) {
      router.push(redirectUrl);
    } else if (router) {
      router.push('/');
    }
    return false;
  }

  // Check loading state
  if (accessData.isLoading) {
    return false; // Deny while loading
  }

  // Get required permissions array
  const permsToCheck = Array.isArray(requiredPermissions) 
    ? requiredPermissions 
    : [requiredPermissions];

  // Check if user has ALL required permissions
  const hasAccess = permsToCheck.every(perm => accessData.permissions[perm] === true);

  if (!hasAccess) {
    if (!silent && toastMessage) {
      toast.error(`You don't have permission to access this resource`);
    }
    if (router && redirectUrl) {
      router.push(redirectUrl);
    } else if (router) {
      router.back();
    }
  }

  return hasAccess;
}

/**
 * Check if user has ANY of the required permissions
 * @param {Object} accessData - Result from useAccess() hook
 * @param {string[]} permissionKeys - Array of permission keys
 * @returns {boolean}
 */
export function hasAnyPermission(accessData, permissionKeys) {
  // Owner bypasses all checks
  if (accessData.isOwner) return true;

  if (accessData.isAccountSuspended) return false;
  if (!Array.isArray(permissionKeys)) return false;

  return permissionKeys.some(perm => accessData.permissions[perm] === true);
}

/**
 * Check if user has ALL required permissions
 * @param {Object} accessData - Result from useAccess() hook
 * @param {string[]} permissionKeys - Array of permission keys
 * @returns {boolean}
 */
export function hasAllPermissions(accessData, permissionKeys) {
  // Owner bypasses all checks
  if (accessData.isOwner) return true;

  if (accessData.isAccountSuspended) return false;
  if (!Array.isArray(permissionKeys)) return false;

  return permissionKeys.every(perm => accessData.permissions[perm] === true);
}

/**
 * Check single permission
 * @param {Object} accessData - Result from useAccess() hook
 * @param {string} permissionKey - Single permission key
 * @returns {boolean}
 */
export function hasPermission(accessData, permissionKey) {
  // Owner bypasses all checks
  if (accessData.isOwner) return true;

  if (accessData.isAccountSuspended) return false;
  return accessData.permissions[permissionKey] === true;
}
