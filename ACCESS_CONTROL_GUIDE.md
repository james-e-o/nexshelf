# Access Control System Documentation

This document explains how to use the access control system throughout the application.

## Overview

The access control system provides:
1. `useCompanyAccess()` - Custom hook for checking user permissions
2. `access-control.js` - Helper functions for protecting routes
3. `AccessProtector` - Component wrapper for route protection

## Components & Files

### 1. `useCompanyAccess()` Hook
**Location**: `src/hooks/useCompanyAccess.js`

Returns an object with the following properties:

```javascript
{
  // Role checks
  isOwner: boolean,
  isCompanyLevel: boolean,
  isBranchLevel: boolean,
  isAccountSuspended: boolean,
  
  // Feature access
  canAccessStaff: boolean,
  canAccessSubscriptions: boolean,
  canAccessModules: boolean,
  canAccessSettings: boolean,
  hasCompanyLevelAccess: boolean,
  
  // Raw values
  accessLevel: string,
  accessLevelScope: string,
  branchId: string,
  
  // Helper methods
  checkPermission(requiredAccessLevels), // Custom permission check
  hasAccessScope(requiredScope), // Check specific scope
}
```

### 2. Access Control Helpers
**Location**: `src/lib/access-control.js`

#### `requireCompanyAccess(access, feature, router)`
Check access to a specific feature and optionally redirect

```javascript
import { useCompanyAccess } from '@/hooks/useCompanyAccess';
import { requireCompanyAccess } from '@/lib/access-control';
import { useRouter } from 'next/navigation';

export default function Layout({ children }) {
  const router = useRouter();
  const access = useCompanyAccess();
  
  // Will show toast and redirect if no access
  requireCompanyAccess(access, 'staff', router);
  
  return children;
}
```

#### `checkAccessLevel(access, requiredLevel)`
Check if user has specific access level(s)

```javascript
const canManageStaff = checkAccessLevel(access, ['owner', 'manager']);
```

#### `checkAccessScope(access, requiredScope)`
Check if user has specific access scope

```javascript
const isCompanyLevel = checkAccessScope(access, 'company');
```

#### `createAccessValidator(permissionMap)`
Create a custom permission validator for complex rules

```javascript
const validator = createAccessValidator({
  owner: ['staff', 'subscriptions', 'modules'],
  manager: ['staff'],
  'company-user': ['staff', 'modules'],
  supervisor: [], // No company-level access
});

const canAccess = validator(access, 'staff'); // true or false
```

### 3. AccessProtector Component
**Location**: `src/components/AccessProtector.js`

Wrapper component that protects routes and shows restricted message

```javascript
import AccessProtector from '@/components/AccessProtector';

export default function StaffPage() {
  return (
    <AccessProtector requiredFeature="staff">
      <YourStaffContent />
    </AccessProtector>
  );
}
```

Options:
- `requiredFeature`: 'staff' | 'subscriptions' | 'modules' | 'settings' | 'company-level'
- `showMessage`: Show restricted message (default: true)
- `fallback`: Custom component to show instead of default message

## Usage Examples

### Example 1: Protect in Layout with Redirect
```javascript
// src/app/users/[u]/company/[companySlug]/staff/layout.js
'use client';

import { useRouter } from 'next/navigation';
import { useCompanyAccess } from '@/hooks/useCompanyAccess';
import { requireCompanyAccess } from '@/lib/access-control';

export default function StaffLayout({ children }) {
  const router = useRouter();
  const access = useCompanyAccess();
  
  // Protect the entire staff section
  requireCompanyAccess(access, 'staff', router);
  
  return <div>{children}</div>;
}
```

### Example 2: Conditional Button Visibility
```javascript
'use client';

import { Button } from '@/components/ui/button';
import { useCompanyAccess } from '@/hooks/useCompanyAccess';

export default function Dashboard() {
  const { canAccessStaff, canAccessSubscriptions, isOwner } = useCompanyAccess();
  
  return (
    <div className="space-y-4">
      {canAccessStaff && (
        <Button onClick={() => router.push('/staff')}>
          Manage Staff
        </Button>
      )}
      
      {canAccessSubscriptions && (
        <Button onClick={() => router.push('/subscriptions')}>
          Billing
        </Button>
      )}
      
      {isOwner && (
        <Button onClick={() => router.push('/company-settings')}>
          Company Settings
        </Button>
      )}
    </div>
  );
}
```

### Example 3: Complex Custom Logic
```javascript
'use client';

import { useCompanyAccess } from '@/hooks/useCompanyAccess';
import { checkAccessLevel, checkAccessScope } from '@/lib/access-control';

export default function AdvancedComponent() {
  const access = useCompanyAccess();
  
  // Multiple level check
  const isManager = checkAccessLevel(access, ['owner', 'manager']);
  
  // Scope check
  const canViewAllBranches = checkAccessScope(access, 'company');
  
  // Custom logic with multiple conditions
  const canEditStaffRoles = access.isOwner || 
    (checkAccessLevel(access, 'manager') && canViewAllBranches);
  
  if (access.isAccountSuspended) {
    return <div>Your account is suspended</div>;
  }
  
  return (
    <div>
      {canEditStaffRoles && <StaffRoleManager />}
    </div>
  );
}
```

### Example 4: Subscriptions Layout Protection
```javascript
// src/app/users/[u]/company/[companySlug]/subscriptions/layout.js
'use client';

import { useRouter } from 'next/navigation';
import { useCompanyAccess } from '@/hooks/useCompanyAccess';
import { requireCompanyAccess } from '@/lib/access-control';

export default function SubscriptionsLayout({ children }) {
  const router = useRouter();
  const access = useCompanyAccess();
  
  // Only owners can access subscriptions
  requireCompanyAccess(access, 'subscriptions', router);
  
  return (
    <div>
      {children}
    </div>
  );
}
```

## Feature Access Levels

| Feature | Owner | Company-Level Staff | Branch-Level Staff |
|---------|-------|--------------------|--------------------|
| Staff | ✅ | ✅ | ❌ |
| Subscriptions | ✅ | ❌ | ❌ |
| Modules | ✅ | ✅ | ❌ |
| Settings | ✅ | ✅ | ❌ |
| Branch-Level Operations | ✅ | ✅ | ✅ (assigned branch only) |

## Migration Guide

### From Inline Access Logic
**Before:**
```javascript
const canAccessStaff = accessLevel === 'owner' || accessLevelScope === 'company'
```

**After:**
```javascript
const { canAccessStaff } = useCompanyAccess();
```

### From Props Drilling
**Before:**
```javascript
<AppSidebar 
  accessLevel={accessLevel}
  accessLevelScope={accessLevelScope}
  suspended={suspended}
/>
```

**After:**
```javascript
// Inside AppSidebar, just use the hook:
const { canAccessStaff } = useCompanyAccess();
```

## Best Practices

1. **Use hooks in components** - Always use `useCompanyAccess()` instead of passing props
2. **Protect at layout level** - Use `requireCompanyAccess()` in layout files
3. **Show clear messages** - Use `AccessProtector` to show why access is denied
4. **Check for suspension** - Always consider `isAccountSuspended` in access decisions
5. **Keep permissions centralized** - Use helper functions, don't duplicate access logic

## Troubleshooting

### "useCompanyAccess must be used within CompanyInfoContext provider"
Make sure the component is inside `CompanyLayout` which provides `CompanyInfoContext`.

### Access checks not working
- Verify `CompanyInfoContext` is properly set up in the layout
- Check that `accessLevel` and `accessLevelScope` are being set correctly
- Use browser DevTools to inspect the context value

### Custom permissions not working
Review your `createAccessValidator` mapping - ensure all access levels are covered.
