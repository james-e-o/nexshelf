"use client"

import { useContext, useState } from "react"
import { CompanyInfoContext } from "../layout"
import { Button } from "@/components/ui/button"
import { useRouter, useParams } from "next/navigation"
import { Spinner } from "@/components/ui/spinner"
import { startFreeTrial } from "@/lib/subscription-service"
import { supabase } from "../../../../../../../config/supabaseClient"
import { toast } from "sonner"

const getStatusColor = (status) => {
  const colors = {
    active: "bg-green-50 border-green-200 text-green-900",
    trialing: "bg-blue-50 border-blue-200 text-blue-900",
    paused: "bg-yellow-50 border-yellow-200 text-yellow-900",
    past_due: "bg-red-50 border-red-200 text-red-900",
    expired: "bg-gray-50 border-gray-200 text-gray-900",
    canceled: "bg-gray-50 border-gray-200 text-gray-900",
  }
  return colors[status] || "bg-gray-50 border-gray-200 text-gray-900"
}

const getStatusBadgeColor = (status) => {
  const colors = {
    active: "bg-green-100 text-green-800",
    trialing: "bg-blue-100 text-blue-800",
    paused: "bg-yellow-100 text-yellow-800",
    past_due: "bg-red-100 text-red-800",
    expired: "bg-gray-100 text-gray-800",
    canceled: "bg-gray-100 text-gray-800",
  }
  return colors[status] || "bg-gray-100 text-gray-800"
}

export default function SubscriptionOverviewPage() {
  const router = useRouter()
  const params = useParams()
  const context = useContext(CompanyInfoContext)
  const { info, currentPlan, currentSubscription, previousSubscriptions, isLoading, plans } = context || {}
  const { u, companySlug } = params
  const [trialLoading, setTrialLoading] = useState(false)

  const handleStartFreeTrial = async () => {
    setTrialLoading(true)

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        toast.error("Please log in to start a free trial")
        setTrialLoading(false)
        return
      }

      const result = await startFreeTrial(info?.company_id || info?.id, user.id)

      if (result.success) {
        toast.success("Free trial started! Redirecting...")
        setTimeout(() => {
          router.push(`/users/${u}/company/${companySlug}`)
        }, 1500)
      } else {
        setTrialLoading(false)
      }
    } catch (error) {
      console.error("Error starting free trial:", error)
      toast.error("Failed to start free trial. Please try again.")
      setTrialLoading(false)
    }
  }

  // Get plan title from subscription data
  const getCurrentPlanTitle = () => {
    if (currentSubscription?.core_plans?.title) {
      return currentSubscription.core_plans.title
    }
    return currentPlan?.title || "Unknown Plan"
  }

  // Format date
  const formatDate = (date) => {
    if (!date) return "N/A"
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner className="size-8 text-core" spinning={true} />
        </div>
      ) : (
        <>
          {/* If there's an active or trialing subscription, show Current Plan */}
          {currentSubscription ? (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Current Plan Card */}
              <div className="border border-gray-200 rounded-lg p-6 shadow-md">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase">Current Plan</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(currentSubscription.status)}`}>
                    {currentSubscription.status === "trialing" ? "On Trial" : currentSubscription.status.charAt(0).toUpperCase() + currentSubscription.status.slice(1)}
                  </span>
                </div>
                
                {/* Plan Title and Description */}
                <div className="mb-6">
                  <p className="text-2xl font-bold text-slate-900">{getCurrentPlanTitle()}</p>
                  <p className="text-xs text-gray-500 mt-1">{currentPlan?.description || "Active subscription"}</p>
                </div>

                {/* Two Column Layout - Left: Amount, Right: Trial Info */}
                <div className="grid grid-cols-2 gap-6 mb-6 pb-6 border-b border-gray-100">
                  {/* Left: Current Amount */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Amount</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-slate-900">
                        ${currentSubscription.amount || "0"}
                      </span>
                      <span className="text-xs text-gray-600">/{currentSubscription.auto_renew ? "mo" : "once"}</span>
                    </div>
                  </div>

                  {/* Right: Trial Status (if trialing) */}
                  {currentSubscription.status === "trialing" && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Free Trial</p>
                      <p className="text-xs text-slate-900 leading-relaxed">
                        <span className="font-medium">{formatDate(currentSubscription.trial_start)}</span><br/>
                        <span className="text-gray-600">to</span><br/>
                        <span className="font-medium">{formatDate(currentSubscription.trial_end)}</span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Bottom: Next Payment / Trial Ends */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                    {currentSubscription.status === "trialing" ? "Trial Ends" : "Next Payment"}
                  </p>
                  <p className="text-sm font-medium text-slate-900">
                    {formatDate(currentSubscription.status === "trialing" ? currentSubscription.trial_end : currentSubscription.next_billing_date)}
                  </p>
                </div>
              </div>

              {/* Actions Card */}
              <div className="border border-gray-200 rounded-lg p-6 shadow-md">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">Actions</h3>
                <div className="space-y-3">
                  <Button
                    onClick={() => router.push(`/users/${u}/company/${companySlug}/subscriptions/plans`)}
                    className="w-full bg-core text-white hover:bg-core/90"
                  >
                    Upgrade Plan
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/users/${u}/company/${companySlug}/subscriptions/payments`)}
                    className="w-full"
                  >
                    Manage Payment Method
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/users/${u}/company/${companySlug}/subscriptions/billing`)}
                    className="w-full"
                  >
                    Update Billing Address
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* No Active Subscription - Side by Side Layout */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* No Active Subscription Message */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 shadow-md">
                  <p className="text-blue-900 font-semibold">No subscriptions currently active</p>
                  <p className="text-blue-700 text-sm mt-2">
                    Start a subscription to unlock all features and get premium support.
                  </p>
                </div>

                {/* Actions Card - for getting a subscription */}
                <div className="border border-gray-200 rounded-lg p-6 shadow-md">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">Actions</h3>
                  <div className="space-y-3">
                    <Button
                      onClick={() => router.push(`/users/${u}/company/${companySlug}/subscriptions/plans`)}
                      className="w-full bg-core text-white hover:bg-core/90"
                    >
                      Upgrade Plan
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => router.push(`/users/${u}/company/${companySlug}/subscriptions/billing`)}
                      className="w-full"
                    >
                      Update Billing Address
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleStartFreeTrial}
                      disabled={trialLoading}
                      className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {trialLoading ? (
                        <span className="inline-flex items-center gap-2">
                          <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                          Starting...
                        </span>
                      ) : (
                        "Start Free Trial"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Previous Subscriptions - Always Show */}
          <div className="border border-gray-200 rounded-lg p-6 shadow-md">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">Previous Subscriptions</h3>
            {previousSubscriptions && previousSubscriptions.length > 0 ? (
              <div className="space-y-3">
                {previousSubscriptions.map((sub) => (
                  <div key={sub.id} className="py-4 border-b last:border-b-0">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-slate-900">
                        {sub.core_plans?.title || "Unknown Plan"}
                      </p>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadgeColor(sub.status)}`}>
                        {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {sub.status === "expired" ? "Expired on" : sub.status === "paused" ? "Paused on" : "Ended on"}{" "}
                      {formatDate(sub.end_date)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg p-8 bg-gray-50 text-center">
                <p className="text-gray-500 text-sm">No previous subscriptions</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}