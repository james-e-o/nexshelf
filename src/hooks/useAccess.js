'use client';

import { useContext, useEffect, useState } from 'react';
import { CompanyInfoContext } from '@/app/users/[u]/company/[companySlug]/layout';
import supabase from '@/config/supabaseClient';


export function useAccess() {
  const context = useContext(CompanyInfoContext);

  if (!context) {
    throw new Error('useAccess must be used within CompanyInfoContext provider');
  }

  const { accessLevel, accessLevelScope, branchId, suspended, staff_id, company_id } = context;

  const [permissions, setPermissions] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function resolvePermissions() {
      try {
        setIsLoading(true);
        setError(null);

        // OWNER CHECK: Owner overrides everything - no need to fetch anything
        if (accessLevel === 'owner') {
          setPermissions({}); // Empty object - all checks will pass via accessLevel === 'owner'
          return;
        }

        // STAGE 1: Fetch role defaults from access_level_permissions
        const { data: roleDefaults, error: roleError } = await supabase
          .from('access_level_permissions')
          .select('permission_key, allowed')
          .eq('access_level_key', accessLevel);

        if (roleError) throw new Error(`Role defaults error: ${roleError.message}`);

        // Create base permission object from role defaults
        const basePermissions = {};
        (roleDefaults || []).forEach(({ permission_key, allowed }) => {
          basePermissions[permission_key] = allowed;
        });

        // STAGE 2: Fetch user-specific overrides from staff_permission_overrides
        let overridePermissions = {};
        
        // Only fetch overrides if we have staff_id and company_id
        if (staff_id && company_id) {
          const { data: overrides, error: overrideError } = await supabase
            .from('staff_permission_overrides')
            .select('permission_key, allowed')
            .eq('staff_id', staff_id)
            .eq('company_id', company_id);

          if (overrideError) throw new Error(`Overrides error: ${overrideError.message}`);

          // Build override map
          (overrides || []).forEach(({ permission_key, allowed }) => {
            overridePermissions[permission_key] = allowed;
          });
        }

        // MERGE: Overrides take precedence over role defaults
        const resolvedPermissions = {
          ...basePermissions,
          ...overridePermissions,
        };

        // STAGE 3: Check suspension status
        // If account is suspended, deny all permissions
        if (suspended === true) {
          Object.keys(resolvedPermissions).forEach(key => {
            resolvedPermissions[key] = false;
          });
        }

        setPermissions(resolvedPermissions);
      } catch (err) {
        console.error('Error resolving permissions:', err);
        setError(err.message);
        setPermissions({}); // Return empty on error (deny all)
      } finally {
        setIsLoading(false);
      }
    }

    if (accessLevel) {
      resolvePermissions();
    }
  }, [accessLevel, staff_id, company_id, suspended]);

  return {
    // Resolved permissions object
    permissions,

    // Metadata
    isAccountSuspended: suspended === true,
    isOwner: accessLevel === 'owner',
    isLoading,
    error,

    // Role/scope info (raw values for custom checks)
    accessLevel,
    accessLevelScope,
    branchId,

    // Helper: Check if user has ANY permission from multiple keys
    hasAnyPermission: (permissionKeys = []) => {
      if (accessLevel === 'owner') return true; // Owner has all permissions
      if (suspended) return false;
      if (!Array.isArray(permissionKeys)) return false;
      return permissionKeys.some(key => permissions[key] === true);
    },

    // Helper: Check if user has ALL permissions from array
    hasAllPermissions: (permissionKeys = []) => {
      if (accessLevel === 'owner') return true; // Owner has all permissions
      if (suspended) return false;
      if (!Array.isArray(permissionKeys)) return false;
      return permissionKeys.every(key => permissions[key] === true);
    },

    // Helper: Check single permission
    hasPermission: (permissionKey) => {
      if (accessLevel === 'owner') return true; // Owner has all permissions
      if (suspended) return false;
      return permissions[permissionKey] === true;
    },

    // Helper: Check access scope
    isCompanyLevel: accessLevelScope === 'company',
    isBranchLevel: accessLevelScope === 'branch',
  };
}







// // src/app/users/[u]/company/[companySlug]/staff/layout.js
// 'use client';

// import { useAccess } from '@/hooks/useAccess';
// import CompanyStaffView from './company-view';
// import BranchStaffView from './branch-view';

// export default function StaffLayout({ children }) {
//   const access = useAccess();

//   if (access.isLoading) return <div>Loading...</div>;

//   // Layer 1: Check permission (capability)
//   if (!access.permissions.can_view_staff) {
//     return <div>No access</div>;
//   }

//   // Layer 2: Use SCOPE to decide VIEW
//   if (access.isCompanyLevel) {
//     return <CompanyStaffView>{children}</CompanyStaffView>;
//   }

//   // Different view for branch-level users
//   return <BranchStaffView>{children}</BranchStaffView>;
// }



// src/app/users/[u]/company/[companySlug]/staff/page.js





// 'use client';

// import { useAccess } from '@/hooks/useAccess';
// import { Button } from '@/components/ui/button';

// export default function StaffPage() {
//   const access = useAccess();

//   return (
//     <div>
//       <h1>Staff Directory</h1>

//       {/* Layer 1: PERMISSION controls button visibility */}
//       {access.permissions.can_create_staff && (
//         <Button onClick={handleCreate}>
//           Create Staff
//         </Button>
//       )}

//       {access.permissions.can_edit_staff && (
//         <Button onClick={handleEdit}>
//           Edit Staff
//         </Button>
//       )}

//       {access.permissions.can_delete_staff && (
//         <Button variant="destructive" onClick={handleDelete}>
//           Delete Staff
//         </Button>
//       )}

//       {/* Layer 3: Access level for optional logic */}
//       {access.accessLevel === 'owner' && (
//         <AdvancedManagementPanel />
//       )}

//       {/* Layer 2: Render different content based on scope */}
//       {access.isCompanyLevel ? (
//         <AllStaffData />
//       ) : (
//         <BranchStaffOnly />
//       )}
//     </div>
//   );
// }