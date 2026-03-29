import { supabase } from "../../config/supabaseClient"
import { toast } from "sonner"

/**
 * Start a free trial for a company
 * Checks if company already has an active trial
 * Creates a new trial subscription that lasts 7 days
 */
export async function startFreeTrial(companyId, userId) {
  try {
    if (!companyId || !userId) {
      throw new Error("Company ID and User ID are required")
    }

    const { data, error } = await supabase.rpc("start_free_trial", {
      p_company_id: companyId,
      p_subscribed_by_id: userId,
    })

    if (error) {
      console.error("RPC error:", error)
      throw error
    }

    if (!data?.success) {
     switch (data.code) {
        case "TRIAL_ALREADY_ACTIVE":
            toast.error("Your company already has an active free trial")
            break

        case "TRIAL_ALREADY_USED":
            toast.error("You have already used your free trial")
            break

        case "ACTIVE_SUBSCRIPTION_EXISTS":
            toast.error("You already have an active subscription")
            break

        case "NO_TRIAL_PLAN":
            toast.error("Free trial is not available at the moment")
            break

        default:
            toast.error(data?.error || "Failed to start free trial")
        }
      return { success: false, error: data?.error }
    }

    toast.success("Free trial started successfully! Enjoy your trial 🎉")

    return {
      success: true,
      subscriptionId: data.subscription_id,
    }
  } catch (err) {
    console.error("Error starting free trial:", err)
    toast.error(err.message || "Failed to start free trial. Please try again.")
    return { success: false, error: err.message }
  }
}




/**
 * Get subscriptions for a company
 */
export async function getCompanySubscriptions(companyId) {
  try {
    const { data, error } = await supabase
      .from("company_subscriptions")
      .select(
        `
        *,
        plan:plan_id (
          id,
          key,
          title,
          description,
          features,
          renewable
        )
      `
      )
      .eq("company", companyId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching subscriptions:", error)
      throw error
    }

    if (!data) return { current: null, history: [] }

    // 🎯 Extract current (active OR trialing OR past_due)
    const current = data.find((sub) =>
      ["active", "trialing", "past_due"].includes(sub.status)
    )

    // 🎯 Everything else = history
    const history = data.filter(
      (sub) => !["active", "trialing", "past_due"].includes(sub.status)
    )

    return {
      current: current || null,
      history,
      all: data, // optional
    }
  } catch (err) {
    console.error("Error getting subscriptions:", err)
    return { current: null, history: [], all: [] }
  }
}

/**
 * Upgrade subscription to a new plan
 */
export async function upgradePlan(companyId, planId, billingPeriod = "monthly") {
  try {
    if (!companyId || !planId) {
      throw new Error("Company ID and Plan ID are required")
    }

    // Fetch plan pricing
    const { data: pricingData, error: pricingError } = await supabase
      .from("core_plan_pricing")
      .select("*")
      .eq("plan_id", planId)
      .eq("interval", billingPeriod === "annual" ? "yearly" : "monthly")
      .single()

    if (pricingError) {
      throw new Error("Plan pricing not found")
    }

    // Calculate end date based on billing period
    const startDate = new Date()
    const endDate = new Date(startDate)
    if (billingPeriod === "annual") {
      endDate.setFullYear(endDate.getFullYear() + 1)
    } else {
      endDate.setMonth(endDate.getMonth() + 1)
    }

    // Create new subscription
    const { data, error } = await supabase
      .from("company_subscriptions")
      .insert({
        company: companyId,
        plan_id: planId,
        status: "active",
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        trial: false,
        amount: pricingData.cost,
        currency: "USD",
        auto_renew: true,
        next_billing_date: endDate.toISOString(),
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    toast.success("Subscription upgraded successfully!")
    return { success: true, subscription: data }
  } catch (err) {
    console.error("Error upgrading plan:", err)
    toast.error(err.message || "Failed to upgrade plan. Please try again.")
    return { success: false, error: err.message }
  }
}

/**
 * Cancel active subscription
 */
export async function cancelSubscription(subscriptionId) {
  try {
    const { data, error } = await supabase
      .from("company_subscriptions")
      .update({
        status: "canceled",
        canceled_at: new Date().toISOString(),
        auto_renew: false,
      })
      .eq("id", subscriptionId)
      .select()
      .single()

    if (error) {
      throw error
    }

    toast.success("Subscription canceled successfully")
    return { success: true, subscription: data }
  } catch (err) {
    console.error("Error canceling subscription:", err)
    toast.error(err.message || "Failed to cancel subscription. Please try again.")
    return { success: false, error: err.message }
  }
}
