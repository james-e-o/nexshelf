"use client"

import { useEffect, useState, useContext } from "react"
import { useRouter, useParams, usePathname } from "next/navigation"
import Link from "next/link"
import { supabase } from "../../../../../../../config/supabaseClient"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/sidebars/company-sidebar/company-sidebar"
import CompanyHeader from "@/components/headers/company-dashboard-header"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CompanyInfoContext } from "../layout"

export default function SubscriptionsLayout({ children }) {
  const router = useRouter()
  const params = useParams()
  
  const [info, setInfo] = useState()
  const [accessLevels, setAccessLevels] = useState([])
  const [branches, setBranches] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [plans, setPlans] = useState([])
  const [currentPlan, setCurrentPlan] = useState(null)
  const [currentSubscription, setCurrentSubscription] = useState(null)
  const [previousSubscriptions, setPreviousSubscriptions] = useState([])
  const [billingPeriod, setBillingPeriod] = useState("monthly")

  const { u, companySlug } = params

  useEffect(() => {
    async function loadSubscriptionData() {
      try {
        console.log("SubscriptionsLayout - Loading data...")

        // Step 1: Auth user
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
          toast("Please log in to continue.")
          router.push("/accounts/login")
          return
        }

        console.log("SubscriptionsLayout - User authenticated:", user.id)

        // Step 2: Check if user is owner or staff of this company
        const { data: companiesLiteData, error: companiesLiteError } = await supabase
          .from("companies_lite")
          .select("company_id, name, slug, owner, currencies")
          .eq("slug", companySlug)
          .single()

        if (companiesLiteError || !companiesLiteData) {
          console.error("SubscriptionsLayout - Company not found:", companiesLiteError)
          toast("Company not found.")
          router.push(`/users/${u}`)
          return
        }

        console.log("SubscriptionsLayout - Company loaded:", companiesLiteData)

        let accessLevel = null
        let branchId = null
        let accessLevelScope = null

        // Step 3a: Fetch ALL access levels
        const { data: accessLevelsData, error: accessLevelsError } = await supabase
          .from("access_level")
          .select("*")
          .order("level_number", { descending: false })

        if (accessLevelsError) {
          console.error("SubscriptionsLayout - Access levels fetch error:", accessLevelsError)
          setIsLoading(false)
          return
        }

        console.log("SubscriptionsLayout - Access levels loaded:", accessLevelsData)
        setAccessLevels(accessLevelsData || [])

        // Check if user is owner
        if (companiesLiteData.owner === user.id) {
          accessLevel = "owner"
          accessLevelScope = "company"
          console.log("SubscriptionsLayout - User is owner, access level scope: company")
        } else {
          // Check if user is staff of this company
          const { data: staffLiteData, error: staffError } = await supabase
            .from("staff_lite")
            .select("access_level, branch, status")
            .eq("staff_id", user.id)
            .eq("company", companiesLiteData.company_id)
            .single()

          if (staffError || !staffLiteData) {
            console.error("SubscriptionsLayout - Staff fetch error:", staffError)
            toast("You do not belong to this company.")
            router.push(`/users/${u}`)
            return
          }

          console.log("SubscriptionsLayout - Staff data loaded:", staffLiteData)

          accessLevel = staffLiteData.access_level

          // Look up access level scope
          const accessLevelRecord = accessLevelsData?.find(al => al.key === staffLiteData.access_level)
          accessLevelScope = accessLevelRecord?.access

          if (accessLevelScope === "branch") {
            branchId = staffLiteData.branch
          }

          console.log("SubscriptionsLayout - User is staff, access level scope:", accessLevelScope)
        }

        // Set company info with access context
        const infoData = {
          ...companiesLiteData,
          id: companiesLiteData.company_id,
          accessLevel,
          accessLevelScope,
          branchId
        }

        console.log("SubscriptionsLayout - Setting info:", infoData)
        setInfo(infoData)

        // Fetch branches for sidebar
        const { data: branchesData } = await supabase
          .from("branches_lite")
          .select("*")
          .eq("company", companiesLiteData.company_id)

        let allowedBranches = []
        if (accessLevelScope === "company") {
          allowedBranches = branchesData || []
        } else if (accessLevelScope === "branch" && branchId) {
          allowedBranches = branchesData?.filter(b => b.id === branchId) || []
        }

        setBranches(allowedBranches)
        setIsLoading(false)
      } catch (err) {
        console.error("SubscriptionsLayout - Error loading subscription data:", err)
        toast("Failed to load data.")
        router.push(`/users/${u}`)
      }
    }

    loadSubscriptionData()
  }, [companySlug, u, router])

  // Fetch subscription and plans data
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
          .select("*, core_plans(*)")
          .eq("company", info.company_id)
          .in("status", ["active", "trialing"])
          .single()

        if (subscriptionError && subscriptionError.code !== "PGRST116") {
          console.error("SubscriptionsLayout - Error fetching subscription:", subscriptionError)
        }

        // Fetch previous subscriptions (expired, paused, etc.)
        const { data: previousData, error: previousError } = await supabase
          .from("company_subscriptions")
          .select("*, core_plans(*)")
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
    console.log("SubscriptionsLayout - No info, returning null")
    return null
  }

  // console.log("SubscriptionsLayout - Rendering with info:", info)

  // Get access level scope to differentiate view
  const accessLevelScope = info?.accessLevelScope
  const isCompanyLevel = accessLevelScope === "company"
  const isBranchLevel = accessLevelScope === "branch"

  return (
    <CompanyInfoContext.Provider
      value={{
        info,
        accessLevels,
        branches,
        accessLevel: info?.accessLevel,
        accessLevelScope: info?.accessLevelScope,
        branchId: info?.branchId,
        plans,
        currentPlan,
        currentSubscription,
        previousSubscriptions,
        billingPeriod,
        setBillingPeriod,
        isCompanyLevel,
        isBranchLevel
      }}
    >
      {isBranchLevel ? (
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
                onClick={() => router.push(`/users/${params.u}/company/${params.companySlug}`)}
                className="w-full"
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <ReusableSubscriptionsSidebar children={children}/>
      )}
    </CompanyInfoContext.Provider>
  )
}

// ReusableSubscriptionsSidebar - same pattern as company page
export const ReusableSubscriptionsSidebar = ({ children }) => {
  const { info, branches } = useContext(CompanyInfoContext)
  const pathname = usePathname()
  const params = useParams()
  const { u, companySlug } = params

  const baseUrl = `/users/${u}/company/${companySlug}/subscriptions`

  const isActive = (path) => {
    if (path === "overview") {
      return pathname === baseUrl
    }
    return pathname.includes(`/subscriptions/${path}`)
  }

  return (
    <SidebarProvider className="relative font-WixMade">
      <AppSidebar company={info} branches={branches} />
      <SidebarInset className="h-svh overflow-hidden static">
        <div className="flex flex-col h-full">
          <div className="h-12 border-b">
            <CompanyHeader>
              <div className="flex">
                <Button variant="ghost" size="icon" className="relative ml-3">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-0.5 -right-0.5 text-[9px] bg-red-600 translate-x-[-48.8%] translate-y-[48.9%] text-white font-semibold flex items-center justify-center size-3.5 rounded-full">
                    3
                  </span>
                </Button>
              </div>
            </CompanyHeader>
          </div>

          <div className="px-6 py-4 flex flex-col grow ">
              {/* Page Title */}
              <div className="px-2   py-4">
                <h1 className="text-lg font-semibold text-army">Subscription management</h1>
              </div>

              {/* Navigation Tabs */}
              <div className="border-b  border-gray-200 px-2">
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

        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
