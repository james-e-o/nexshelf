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

    // Step 2: Check specific module
    const { data: restriction, error: resError } = await supabase
      .from('plan_module_restrictions')
      .select('value_boolean')
      .eq('plan', subscription.plan_key)
      .eq('usage_key', moduleName)
      .maybeSingle();

    console.log('🔎 [CLIENT] Restriction:', { restriction, resError });

    if (resError) {
      console.error(`[CLIENT] Module restrictions error:`, resError);
      return false;
    }

    const result = restriction?.value_boolean === true;
    console.log('✅ [CLIENT] Result:', result);
    return result;

  } catch (err) {
    console.error(`[CLIENT] Error checking module access:`, err);
    return false;
  }
}
 