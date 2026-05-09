'use client';

import supabase from "@/config/supabaseClient";

/**
 * Client-side version - Check if a module is enabled for a company
 * @param {string} companyId - The company ID
 * @param {string} moduleName - The module key (e.g., 'products_enabled', 'invoices_enabled')
 * @returns {Promise<boolean>} - True if module is enabled, false otherwise
 */
export async function isModuleEnabledClient(companyId, moduleName) {
  if (!companyId || !moduleName) return false;

  try {
   
    const now = new Date().toISOString();

    // Step 1: Get active subscription
    const { data: subscription, error: subError } = await supabase
      .from('company_subscriptions')
      .select('plan_key')
      .eq('company', companyId)
      .in('status', ['active', 'trialing'])
      .maybeSingle();

    console.log('🔎 [CLIENT] Company Subscriptions Query:', {
      companyId,
      subscription,
      subError,
      subscriptionKeys: subscription ? Object.keys(subscription) : null,
      subscriptionData: subscription ? JSON.stringify(subscription) : null
    });

    if (subError) {
      console.error(`[CLIENT] Subscription fetch failed:`, subError);
      return false;
    }

    if (!subscription?.plan_key) {
      console.log('[CLIENT] No subscription found');
      return false;
    }

    // Normalize module names to match plan_module_enabled.module values
    const normalizedModuleName = moduleName
      .toString()
      .trim()
      .toLowerCase()
      .replace(/_enabled$/, '');

    // Step 2: Check specific module access for this plan
    const { data: enabledEntry, error: enabledError } = await supabase
      .from('plan_module_enabled')
      .select('enabled')
      .eq('plan', subscription.plan_key)
      .eq('module', normalizedModuleName)
      .maybeSingle();

    console.log('🔎 [CLIENT] Plan module enabled lookup:', {
      plan: subscription.plan_key,
      module: normalizedModuleName,
      enabledEntry,
      enabledError,
    });

    if (enabledError) {
      console.error(`[CLIENT] Module enabled lookup error:`, enabledError);
      return false;
    }

    const result = enabledEntry?.enabled === true;
    console.log('✅ [CLIENT] Result:', result);
    return result;

  } catch (err) {
    console.error(`[CLIENT] Error checking module access:`, err);
    return false;
  }
}
 