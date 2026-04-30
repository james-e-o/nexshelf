"use client"

import { useEffect, useState, useContext } from "react"
import { useRouter, useParams, usePathname } from "next/navigation"
import Link from "next/link"
import supabase from "@/config/supabaseClient"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import { CompanyInfoContext, ReusableCompanySidebar } from "../layout"

export default function SubscriptionsLayout({ children }) {
  const router = useRouter()
  const params = useParams()
  const companyCtx = useContext(CompanyInfoContext)
  
  const [plans, setPlans] = useState([])
  const [currentPlan, setCurrentPlan] = useState(null)
  const [currentSubscription, setCurrentSubscription] = useState(null)
  const [previousSubscriptions, setPreviousSubscriptions] = useState([])
  const [billingPeriod, setBillingPeriod] = useState("monthly")
  const [isLoading, setIsLoading] = useState(true)

  const { u, companySlug } = params
  const info = companyCtx?.info
  const accessLevelScope = info?.accessLevelScope

  // Only fetch subscription-specific data
  useEffect(() => {
    async function fetchSubscriptionData() {
      try {
        if (!info?.company_id) {
          console.warn("SubscriptionsLayout - No company_id in context")
          return
        }

        // Fetch current active or trialing subscription
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from("company_subscriptions")
          .select("*, plan:core_plans!fk_plan(*)")
          .eq("company", info.company_id)
          .in("status", ["active", "trialing"])
          .single()

        if (subscriptionError && subscriptionError.code !== "PGRST116") {
          console.error("SubscriptionsLayout - Error fetching subscription:", subscriptionError)
        }

        // Fetch previous subscriptions (expired, paused, etc.)
        const { data: previousData, error: previousError } = await supabase
          .from("company_subscriptions")
          .select("*, plan:core_plans!fk_plan(*)")
          .eq("company", info.company_id)
          .in("status", ["expired", "paused", "past_due", "canceled"])
          .order("end_date", { ascending: false })

        if (previousError) {
          console.error("SubscriptionsLayout - Error fetching previous subscriptions:", previousError)
        }

        // Fetch all plans except trial
        const { data: plansData, error: plansError } = await supabase
          .from("core_plans")
          .select("*")
          .neq("key", "trial")
          .order("created_at", { ascending: true })

        if (plansError) throw plansError

        // Fetch all pricing
        const { data: pricingData, error: pricingError } = await supabase
          .from("core_plan_pricing")
          .select("*")

        if (pricingError) throw pricingError

        // Combine plans with their pricing
        const combinedPlans = plansData.map((plan) => {
          try {
            const monthlyPrice = pricingData.find((p) => {
              return Number(p.plan_id) === Number(plan.id) && p.interval === "monthly"
            })

            const annualPrice = pricingData.find((p) => {
              return Number(p.plan_id) === Number(plan.id) && p.interval === "yearly"
            })

            // Safely parse features
            let parsedFeatures = []
            if (plan.features) {
              try {
                parsedFeatures = Array.isArray(plan.features) 
                  ? plan.features 
                  : JSON.parse(plan.features)
              } catch (e) {
                parsedFeatures = []
              }
            }

            return {
              key: plan.key,
              title: plan.title,
              description: plan.description,
              features: parsedFeatures,
              badge: plan.badge || "",
              highlight: plan.highlight || false,
              ctaLabel: plan.ctaLabel || "Get started",
              disabled: plan.disabled || false,
              footerNote: plan.footer_note || "",
              monthlyPrice: monthlyPrice?.cost ?? 0,
              monthlyOriginalPrice: monthlyPrice?.base_price ?? 0,
              annualPrice: annualPrice?.cost ?? 0,
              annualOriginalPrice: annualPrice?.base_price ?? 0,
            }
          } catch (err) {
            console.error(`SubscriptionsLayout - Error processing plan ${plan.key}:`, err)
            return {
              key: plan.key,
              title: plan.title,
              description: plan.description,
              features: [],
              badge: plan.badge || "",
              highlight: plan.highlight || false,
              ctaLabel: plan.ctaLabel || "Get started",
              disabled: plan.disabled || false,
            }
          }
        })

        setPlans(combinedPlans)
        setCurrentSubscription(subscriptionData || null)
        setPreviousSubscriptions(previousData || [])

        // If subscription exists, find and set the current plan
        if (subscriptionData && subscriptionData.plan_id) {
          const currentPlanData = combinedPlans.find(
            (p) => p.key === subscriptionData.plan_id || Number(p.id) === subscriptionData.plan_id
          )
          if (currentPlanData) {
            setCurrentPlan(currentPlanData)
          }
        }
      } catch (err) {
        console.error("SubscriptionsLayout - Error fetching subscription data:", err)
        toast.error("Failed to load subscription data. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    if (info?.company_id) {
      fetchSubscriptionData()
    }
  }, [info?.company_id])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner className="size-8 text-army" spinning={true} />
      </div>
    )
  }

  if (!info) {
    return null
  }

  const isBranchLevel = accessLevelScope === "branch"

  // If branch-level user, show restricted message
  if (isBranchLevel) {
    return (
      <div className="min-h-screen font-WixMade bg-white p-6">
        <div className="mt-12">
          <div className="border border-blue-200 bg-blue-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-blue-900 mb-2">Subscription Management</h2>
            <p className="text-slate-700 mb-2">
              You have branch-level access to <strong>{info?.name}</strong>. Subscription management is handled by company-level administrators.
            </p>
            <p className="text-slate-600 text-sm mb-4">
              Contact your company administrator or finance team to upgrade, downgrade, or manage subscription plans.
            </p>
            <Button
              onClick={() => router.push(`/users/${u}/company/${companySlug}`)}
              className="w-full"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // For company-level users, use the reusable sidebar from parent layout
  return (
    <SubscriptionPageContent plans={plans} currentPlan={currentPlan} currentSubscription={currentSubscription} previousSubscriptions={previousSubscriptions} billingPeriod={billingPeriod} setBillingPeriod={setBillingPeriod}>
      {children}
    </SubscriptionPageContent>
  )
}

// Subscription-specific page layout using the shared sidebar
export const SubscriptionPageContent = ({ children, plans, currentPlan, currentSubscription, previousSubscriptions, billingPeriod, setBillingPeriod }) => {
  const params = useParams()
  const pathname = usePathname()
  const { u, companySlug } = params

  const baseUrl = `/users/${u}/company/${companySlug}/subscriptions`

  const isActive = (path) => {
    if (path === "overview") {
      return pathname === baseUrl
    }
    return pathname.includes(`/subscriptions/${path}`)
  }

  // Provide subscription data via context that was populated in parent
  const contextValue = useContext(CompanyInfoContext)
  const enhancedContext = {
    ...contextValue,
    plans,
    currentPlan,
    currentSubscription,
    previousSubscriptions,
    billingPeriod,
    setBillingPeriod,
  }

  return (
    <CompanyInfoContext.Provider value={enhancedContext}>
      <ReusableCompanySidebar>
        <div className="px-6 py-4 flex flex-col grow">
          {/* Page Title */}
          <div className="px-2 py-4">
            <h1 className="text-lg font-semibold text-army">Subscription management</h1>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200 px-2">
            <div className="flex gap-8">
              <Link
                href={baseUrl}
                className={`pb-3 font-medium text-sm transition-colors whitespace-nowrap ${
                  isActive("overview")
                    ? "border-b-2 border-core text-core"
                    : "text-gray-600 hover:text-gray-900 border-b-2 border-transparent"
                }`}
              >
                Overview
              </Link>
              <Link
                href={`${baseUrl}/plans`}
                className={`pb-3 font-medium text-sm transition-colors whitespace-nowrap ${
                  isActive("plans")
                    ? "border-b-2 border-core text-core"
                    : "text-gray-600 hover:text-gray-900 border-b-2 border-transparent"
                }`}
              >
                Plans
              </Link>
              <Link
                href={`${baseUrl}/invoices`}
                className={`pb-3 font-medium text-sm transition-colors whitespace-nowrap ${
                  isActive("invoices")
                    ? "border-b-2 border-core text-core"
                    : "text-gray-600 hover:text-gray-900 border-b-2 border-transparent"
                }`}
              >
                Invoices
              </Link>
              <Link
                href={`${baseUrl}/payments`}
                className={`pb-3 font-medium text-sm transition-colors whitespace-nowrap ${
                  isActive("payments")
                    ? "border-b-2 border-core text-core"
                    : "text-gray-600 hover:text-gray-900 border-b-2 border-transparent"
                }`}
              >
                Payment Details
              </Link>
              <Link
                href={`${baseUrl}/billing`}
                className={`pb-3 font-medium text-sm transition-colors whitespace-nowrap ${
                  isActive("billing")
                    ? "border-b-2 border-core text-core"
                    : "text-gray-600 hover:text-gray-900 border-b-2 border-transparent"
                }`}
              >
                Billing Address
              </Link>
            </div>
          </div>

          <div className="grow overflow-y-auto p-2 md:p-4">
            {children}
          </div>
        </div>
      </ReusableCompanySidebar>
    </CompanyInfoContext.Provider>
  )
}
