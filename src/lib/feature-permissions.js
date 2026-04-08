/**
 * Feature to Permission Key Mapping
 * 
 * This configures which permission keys are required for each feature/action.
 * Add new features here without modifying hooks or components.
 * 
 * Usage:
 * import { checkFeaturePermission } from '@/lib/feature-permissions';
 * const hasAccess = checkFeaturePermission('staff_create', permissions);
 */

// Maps features/actions to required permission keys
export const FEATURE_PERMISSIONS = {
  // Staff Management
  staff_view: ['can_view_staff'],
  staff_create: ['can_create_staff'],
  staff_edit: ['can_edit_staff'],
  staff_delete: ['can_delete_staff'],
  staff_manage_permissions: ['can_manage_staff_permissions'],
  staff_view_all: ['can_view_staff'],
  
  // Modules
  modules_view: ['can_view_modules'],
  modules_create: ['can_create_modules'],
  modules_edit: ['can_edit_modules'],
  modules_delete: ['can_delete_modules'],
  
  // Subscriptions & Billing
  subscriptions_view: ['can_view_subscriptions'],
  subscriptions_manage: ['can_manage_subscriptions'],
  billing_view: ['can_view_billing'],
  billing_manage: ['can_manage_billing'],
  
  // Company Settings
  company_settings_view: ['can_view_company_settings'],
  company_settings_manage: ['can_manage_company_settings'],
  
  // Reports & Analytics
  reports_view: ['can_view_reports'],
  reports_export: ['can_export_reports'],
  
  // Inventory
  inventory_view: ['can_view_inventory'],
  inventory_manage: ['can_manage_inventory'],
  
  // Orders
  orders_view: ['can_view_orders'],
  orders_create: ['can_create_orders'],
  orders_manage: ['can_manage_orders'],
  
  // Products
  products_view: ['can_view_products'],
  products_create: ['can_create_products'],
  products_edit: ['can_edit_products'],
  products_delete: ['can_delete_products'],
};

// Group permissions by module/feature area
export const FEATURE_GROUPS = {
  staff: [
    'can_view_staff',
    'can_create_staff',
    'can_edit_staff',
    'can_delete_staff',
    'can_manage_staff_permissions',
  ],
  modules: [
    'can_view_modules',
    'can_create_modules',
    'can_edit_modules',
    'can_delete_modules',
  ],
  subscriptions: [
    'can_view_subscriptions',
    'can_manage_subscriptions',
  ],
  billing: [
    'can_view_billing',
    'can_manage_billing',
  ],
  settings: [
    'can_view_company_settings',
    'can_manage_company_settings',
  ],
  reports: [
    'can_view_reports',
    'can_export_reports',
  ],
  inventory: [
    'can_view_inventory',
    'can_manage_inventory',
  ],
  orders: [
    'can_view_orders',
    'can_create_orders',
    'can_manage_orders',
  ],
  products: [
    'can_view_products',
    'can_create_products',
    'can_edit_products',
    'can_delete_products',
  ],
};

/**
 * Check if user has permission for a specific feature
 * @param {string} featureKey - Feature key from FEATURE_PERMISSIONS
 * @param {Object} permissions - Permissions object from useAccess()
 * @param {boolean} isOwner - Whether user is owner (optional - overrides all checks)
 * @returns {boolean}
 */
export function checkFeaturePermission(featureKey, permissions, isOwner = false) {
  // Owner bypasses all checks
  if (isOwner) return true;
  
  if (!featureKey || !permissions) return false;
  
  const requiredKeys = FEATURE_PERMISSIONS[featureKey];
  if (!requiredKeys) {
    console.warn(`Feature "${featureKey}" not defined in FEATURE_PERMISSIONS`);
    return false;
  }
  
  // User must have ALL required permissions
  return requiredKeys.every(key => permissions[key] === true);
}

/**
 * Check if user has ANY permission from a group
 * @param {string} groupKey - Group key from FEATURE_GROUPS
 * @param {Object} permissions - Permissions object from useAccess()
 * @param {boolean} isOwner - Whether user is owner (optional - overrides all checks)
 * @returns {boolean}
 */
export function checkFeatureGroupAccess(groupKey, permissions, isOwner = false) {
  // Owner bypasses all checks
  if (isOwner) return true;
  
  if (!groupKey || !permissions) return false;
  
  const groupPerms = FEATURE_GROUPS[groupKey];
  if (!groupPerms) {
    console.warn(`Feature group "${groupKey}" not defined in FEATURE_GROUPS`);
    return false;
  }
  
  // User must have at least ONE permission in the group
  return groupPerms.some(key => permissions[key] === true);
}

/**
 * Check if user has multiple permissions
 * @param {string[]} featureKeys - Array of feature keys
 * @param {Object} permissions - Permissions object from useAccess()
 * @param {boolean} requireAll - If true, user must have ALL (default). If false, ANY.
 * @param {boolean} isOwner - Whether user is owner (optional - overrides all checks)
 * @returns {boolean}
 */
export function checkMultipleFeatures(featureKeys, permissions, requireAll = true, isOwner = false) {
  // Owner bypasses all checks
  if (isOwner) return true;
  
  if (!Array.isArray(featureKeys) || !permissions) return false;
  
  const results = featureKeys.map(key => checkFeaturePermission(key, permissions, isOwner));
  
  return requireAll ? results.every(r => r) : results.some(r => r);
}

/**
 * Check if user has a specific permission key directly
 * @param {string|string[]} permissionKeys - Single permission key or array of keys
 * @param {Object} permissions - Permissions object from useAccess()
 * @param {boolean} requireAll - If true, user must have ALL (default). If false, ANY.
 * @param {boolean} isOwner - Whether user is owner (optional - overrides all checks)
 * @returns {boolean}
 */
export function checkPermission(permissionKeys, permissions, requireAll = true, isOwner = false) {
  // Owner bypasses all checks
  if (isOwner) return true;
  
  if (!permissions) return false;
  
  const keysToCheck = Array.isArray(permissionKeys) ? permissionKeys : [permissionKeys];
  
  return requireAll 
    ? keysToCheck.every(key => permissions[key] === true)
    : keysToCheck.some(key => permissions[key] === true);
}
