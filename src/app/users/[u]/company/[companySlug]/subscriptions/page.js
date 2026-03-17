"use client"

import { useState, useContext } from "react"
import { useRouter, useParams } from "next/navigation"
import { CompanyInfoContext } from "../layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, ArrowRight } from "lucide-react"
import { toast } from "sonner"

export default function SubscriptionPage() {
  const router = useRouter()
  const params = useParams()
  const { info } = useContext(CompanyInfoContext)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const { u, companySlug } = params

  const plans = [
    {
      id: "starter",
      name: "Starter",
      price: "$0",
      period: "/month",
      description: "Perfect for getting started",
      popular: false,
      features: [
        "Up to 5 staff members",
        "1 branch",
        "Basic inventory tracking",
        "Sales reporting",
        "Email support"
      ],
      cta: "Get Started"
    },
    {
      id: "professional",
      name: "Professional",
      price: "$99",
      period: "/month",
      description: "Best for growing businesses",
      popular: true,
      features: [
        "Up to 50 staff members",
        "Unlimited branches",
        "Advanced inventory management",
        "Multi-branch reporting",
        "Purchase orders",
        "Supplier management",
        "Priority support"
      ],
      cta: "Start Free Trial"
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large organizations",
      popular: false,
      features: [
        "Unlimited staff members",
        "Unlimited branches",
        "Advanced analytics",
        "API access",
        "Custom integrations",
        "Dedicated account manager",
        "24/7 phone support",
        "Custom workflows"
      ],
      cta: "Contact Sales"
    }
  ]

  const handleSelectPlan = async (planId) => {
    setSelectedPlan(planId)
    setIsLoading(true)

    try {
      // TODO: Integrate with Stripe checkout or subscription API
      toast.success(`Redirecting to ${planId} plan setup...`)
      
      // Simulate delay before redirect
      setTimeout(() => {
        // This will eventually call an API to create subscription
        router.push(`/users/${u}/company/${companySlug}`)
      }, 1500)
    } catch (error) {
      console.error("Error selecting plan:", error)
      toast.error("Failed to select plan. Please try again.")
      setSelectedPlan(null)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-semibold text-army mb-2">Choose Your Plan</h1>
          <p className="text-lg text-slate-600">
            {info?.name ? `Set up a subscription for ${info.name}` : "Select a subscription plan"}
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center bg-white rounded-lg border border-slate-200 p-1">
            <button className="px-4 py-2 rounded text-sm font-medium text-slate-600">Annual</button>
            <button className="px-4 py-2 rounded text-sm font-medium bg-core text-white">Monthly</button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative transition-all ${
                plan.popular
                  ? "border-2 border-core shadow-2xl md:scale-105"
                  : "border border-slate-200 hover:border-slate-300"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-linear-to-r from-core to-army text-white px-4 py-1 rounded-full text-xs font-semibold">
                    MOST POPULAR
                  </span>
                </div>
              )}

              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Pricing */}
                <div className="space-y-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-core">{plan.price}</span>
                    <span className="text-slate-600">{plan.period}</span>
                  </div>
                  {plan.id === "starter" && (
                    <p className="text-sm text-slate-500">Always free, no credit card required</p>
                  )}
                </div>

                {/* Features List */}
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <Check className="h-5 w-5 shrink-0 text-army" />
                      <span className="text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={isLoading && selectedPlan === plan.id}
                  className={`w-full py-6 text-base font-semibold transition-all ${
                    plan.popular
                      ? "bg-linear-to-r from-core to-army hover:shadow-lg text-white border-0"
                      : "border border-slate-300 hover:bg-slate-50"
                  }`}
                  variant={plan.popular ? "default" : "outline"}
                >
                  {isLoading && selectedPlan === plan.id ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                      Processing...
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      {plan.cta}
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-lg border border-slate-200 p-8">
          <h2 className="text-2xl font-bold text-core mb-6">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Can I change plans later?</h3>
              <p className="text-slate-600">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">What payment methods do you accept?</h3>
              <p className="text-slate-600">
                We accept all major credit cards, including Visa, Mastercard, and American Express through Stripe.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Is there a free trial?</h3>
              <p className="text-slate-600">
                Yes, Professional and Enterprise plans come with a 14-day free trial. No credit card required to start.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">What if I need more features?</h3>
              <p className="text-slate-600">
                Contact our sales team for custom solutions. We can customize any plan to meet your specific needs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
