# Permission System Implementation Guide

## Quick Overview

The new 3-layer permission resolution system has been implemented. Here's what was created:

### New Files Created
1. **`src/lib/feature-permissions.js`** - Feature to permission key mappings
2. **`src/hooks/useAccess.js`** - Universal permission hook with 3-layer resolution
3. **Updated `src/lib/access-control.js`** - New permission helper functions
4. **Updated `src/components/AccessProtector.js`** - Supports both old & new systems

### How It Works (3 Layers)

```
Layer 1: Role Defaults
  └─ Fetched from access_level_permissions table
  
Layer 2: User-Specific Overrides
  └─ Fetched from staff_permission_overrides table
  └─ Takes precedence over role defaults
  
Layer 3: Suspension Check
  └─ If staff.suspended = true → all permissions false
```

---

## Usage Examples

### 1. Protecting Layouts (Route-Level Protection)

**Location:** `src/app/users/[u]/company/[companySlug]/staff/layout.js`

```javascript
'use client';

import { useRouter } from 'next/navigation';
import { useAccess } from '@/hooks/useAccess';
import { requirePermission } from '@/lib/access-control';

export default function StaffLayout({ children }) {
  const router = useRouter();
  const access = useAccess();

  // Protect entire section with permission check
  requirePermission(access, 'can_view_staff', router, {
    redirectUrl: '/users/[u]/company/[companySlug]',
  });

  if (access.isLoading) return <div>Loading...</div>;

  return <div>{children}</div>;
}
```

### 2. Conditional UI Elements (Show/Hide Based on Permissions)

**Example: Button Visibility**

```javascript
'use client';

import { useAccess } from '@/hooks/useAccess';
import { checkFeaturePermission } from '@/lib/feature-permissions';
import { Button } from '@/components/ui/button';

export default function StaffActions() {
  const access = useAccess();

  return (
    <div className="flex gap-2">
      {/* Check single permission */}
      {access.permissions.can_view_staff && (
        <Button>View Staff</Button>
      )}

      {/* Check multiple permissions (ALL required) */}
      {access.hasAllPermissions(['can_edit_staff', 'can_create_staff']) && (
        <Button>Manage Staff</Button>
      )}

      {/* Check feature (uses feature mapping) */}
      {checkFeaturePermission('staff_manage_all', access.permissions) && (
        <Button variant="destructive">Admin Staff Tools</Button>
      )}

      {/* Check ANY permission */}
      {access.hasAnyPermission(['can_view_reports', 'can_export_reports']) && (
        <Button>Reports</Button>
      )}
    </div>
  );
}
```

### 3. Using AccessProtector Component

**Protecting a Page with New System:**

```javascript
import AccessProtector from '@/components/AccessProtector';
import StaffPage from './staff-content';

export default function StaffPageWrapper() {
  return (
    <AccessProtector requiredFeature="staff_view">
      <StaffPage />
    </AccessProtector>
  );
}
```

**Protecting with Specific Permissions:**

```javascript
import AccessProtector from '@/components/AccessProtector';

export default function StaffEditPage() {
  return (
    <AccessProtector requiredPermissions={['can_edit_staff', 'can_view_staff']}>
      <StaffEditForm />
    </AccessProtector>
  );
}
```

---

## Adding New Features

### Step 1: Add Permission Keys to Database

Add entries to `permission_keys` table:

```sql
INSERT INTO permission_keys (permission_key, name, description, permission_group)
VALUES 
  ('can_view_reports', 'View Reports', 'View company reports', 'reporting'),
  ('can_export_reports', 'Export Reports', 'Export reports to CSV', 'reporting'),
  ('can_view_dashboard', 'View Dashboard', 'Access main dashboard', 'dashboard');
```

### Step 2: Update Feature Mapping

Edit `src/lib/feature-permissions.js`:

```javascript
export const FEATURE_PERMISSIONS = {
  // ... existing features ...
  
  // NEW: Reports feature
  reports_view: ['can_view_reports'],
  reports_export: ['can_view_reports', 'can_export_reports'],
  reports_manage: ['can_view_reports', 'can_export_reports'],
};

export const FEATURE_GROUPS = {
  // ... existing groups ...
  
  // NEW: Reports group
  reports: [
    'can_view_reports',
    'can_export_reports',
  ],
};
```

### Step 3: Use in Your Component/Page

```javascript
'use client';

import { useAccess } from '@/hooks/useAccess';
import { checkFeaturePermission } from '@/lib/feature-permissions';

export default function ReportsPage() {
  const access = useAccess();

  if (access.isLoading) return <div>Loading...</div>;

  if (!checkFeaturePermission('reports_view', access.permissions)) {
    return <div>You dont have access to view reports</div>;
  }

  return (
    <div>
      <h1>Reports</h1>
      
      {/* Show export button only if user has export permission */}
      {access.permissions.can_export_reports && (
        <button>Export to CSV</button>
      )}
    </div>
  );
}
```

---

## Permission Override Examples

### Manual Override: Grant Exception

```javascript
// Temporarily grant John delete access to staff
const override = {
  company_id: 'xyz-123',
  staff_id: 'john-456',
  permission_key: 'can_delete_staff',
  allowed: true,
};

// Insert via Supabase
const { error } = await supabase
  .from('staff_permission_overrides')
  .insert([override]);
```

### Revoking Override: Return to Role Default

```javascript
// Remove override, John reverts to his role's default
const { error } = await supabase
  .from('staff_permission_overrides')
  .delete()
  .eq('staff_id', 'john-456')
  .eq('permission_key', 'can_delete_staff')
  .eq('company_id', 'xyz-123');
```

---

## Hook Methods Reference

### useAccess() Returns

```javascript
const access = useAccess();

// ✓ Permissions object (from DB)
access.permissions = {
  can_view_staff: true,
  can_edit_staff: true,
  can_delete_staff: false,
  // ... all other permissions
}

// ✓ Metadata
access.isAccountSuspended = false;  // Is account suspended?
access.isLoading = false;            // Still loading permissions?
access.error = null;                 // Any error?

// ✓ Role/scope info
access.accessLevel = 'manager';      // Role from context
access.accessLevelScope = 'company'; // 'company' or 'branch'
access.branchId = null;              // Branch ID if scoped

// ✓ Helper methods
access.hasPermission('can_view_staff');              // Single check
access.hasAnyPermission(['perm1', 'perm2']);        // ANY of list
access.hasAllPermissions(['perm1', 'perm2']);       // ALL of list

// ✓ Scope helpers
access.isCompanyLevel;  // accessLevelScope === 'company'
access.isBranchLevel;   // accessLevelScope === 'branch'
```

---

## Helper Functions Reference

### From `lib/access-control.js`

```javascript
import { 
  requirePermission,      // Protect routes
  hasPermission,          // Single permission check
  hasAnyPermission,       // Check ANY permission
  hasAllPermissions,      // Check ALL permissions
} from '@/lib/access-control';

// Protect route
requirePermission(access, 'can_view_staff', router, {
  redirectUrl: '/users/[u]/company/[companySlug]',
  toastMessage: true,
  silent: false,
});

// Check permission
if (hasPermission(access, 'can_edit_staff')) { /* ... */ }

// Check multiple
if (hasAnyPermission(access, ['perm1', 'perm2'])) { /* ... */ }
if (hasAllPermissions(access, ['perm1', 'perm2'])) { /* ... */ }
```

### From `lib/feature-permissions.js`

```javascript
import { 
  checkFeaturePermission,     // Check feature requirement
  checkFeatureGroupAccess,    // Check group (ANY in group)
  checkMultipleFeatures,      // Check multiple features
} from '@/lib/feature-permissions';

// Check feature
checkFeaturePermission('staff_create', permissions);

// Check group (e.g., staff group)
checkFeatureGroupAccess('staff', permissions);

// Check multiple features
checkMultipleFeatures(['staff_view', 'staff_create'], permissions, true); // require ALL
checkMultipleFeatures(['staff_view', 'staff_create'], permissions, false); // require ANY
```

---

## Migration Path (How to Update Existing Code)

### OLD Way (Current - Still Works)
```javascript
import { useCompanyAccess } from '@/hooks/useCompanyAccess';

const { canAccessStaff, canAccessModules } = useCompanyAccess();

if (canAccessStaff) { /* ... */ }
```

### NEW Way (Recommended)
```javascript
import { useAccess } from '@/hooks/useAccess';
import { checkFeaturePermission } from '@/lib/feature-permissions';

const access = useAccess();

if (checkFeaturePermission('staff_view', access.permissions)) { /* ... */ }
// OR
if (access.permissions.can_view_staff) { /* ... */ }
```

**You can migrate gradually** - both systems work together. Use the new system for new features and migrate old features as you update them.

---

## Best Practices

### 1. ✓ Use Feature Keys for Route Protection
```javascript
// DO: Protect entire routes
requirePermission(access, 'can_view_staff', router);
```

### 2. ✓ Check Permissions Before Rendering
```javascript
// DO: Check permission before showing UI
{access.permissions.can_edit_staff && <EditButton />}
```

### 3. ✓ Use Feature Mappings for Complex Logic
```javascript
// DO: Use feature mappings when action requires multiple permissions
if (checkFeaturePermission('staff_manage_all', access.permissions)) {
  // User can view, create, and edit staff
}
```

### 4. ✗ Don't Hardcode Permission Logic
```javascript
// DON'T: Avoid hardcoding
if (access.accessLevel === 'owner') { /* ... */ }
```

### 5. ✓ Always Handle Loading State
```javascript
// DO: Check loading
if (access.isLoading) return <Spinner />;
if (access.error) return <ErrorMessage />;
```

---

## Testing Permission Changes

### In Database

```sql
-- Check what permissions a role has
SELECT * FROM access_level_permissions 
WHERE access_level_key = 'manager';

-- Check overrides for a staff member
SELECT * FROM staff_permission_overrides 
WHERE staff_id = 'john-123' AND company_id = 'xyz-456';

-- Check final resolved state (role + overrides)
WITH role_perms AS (
  SELECT permission_key, allowed
  FROM access_level_permissions
  WHERE access_level_key = 'manager'
),
override_perms AS (
  SELECT permission_key, allowed
  FROM staff_permission_overrides
  WHERE staff_id = 'john-123' AND company_id = 'xyz-456'
)
SELECT 
  COALESCE(o.permission_key, r.permission_key) as permission_key,
  COALESCE(o.allowed, r.allowed) as allowed
FROM role_perms r
FULL OUTER JOIN override_perms o USING (permission_key);
```

---

## Troubleshooting

### Issue: Permissions Always False

**Cause:** Staff member is suspended or role has no permissions defined

```javascript
// Check in component
console.log('Suspended:', access.isAccountSuspended);
console.log('Permissions:', access.permissions);
console.log('Error:', access.error);
```

### Issue: Permissions Not Updating After Override

**Solution:** Override table might not have unique constraint or foreign key reference incorrect table

```sql
-- Verify constraint exists
CONSTRAINT unique_staff_override UNIQUE (company_id, staff_id, permission_key)
```

### Issue: useAccess() Throws Error

**Cause:** Hook must be used inside CompanyInfoContext provider

```javascript
// This will error - make sure you're inside the layout
export default function ChildComponent() {
  const access = useAccess(); // ✓ OK
}

// This will error - can't use in components outside context
export default function OutsideComponent() {
  const access = useAccess(); // ✗ Error!
}
```

---

## Next Steps

1. **Update Permission Keys Table** - Ensure all your permission_key entries are in the database
2. **Test useAccess() Hook** - Use in a simple component first
3. **Add Feature Mappings** - Update `feature-permissions.js` for your features
4. **Migrate Routes** - Gradually update layouts and pages to use new system
5. **Test Overrides** - Create test overrides in database and verify they take precedence

