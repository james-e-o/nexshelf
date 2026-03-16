// Stripe Pricing Plans Configuration
// Format: Stripe Product IDs mapped to plan details
// When using real Stripe, these will be your actual product IDs from Stripe Dashboard

export const PRICING_PLANS = {
  free: {
    name: 'Free',
    description: 'Perfect for getting started',
    price: 0,
    currency: 'USD',
    billingPeriod: 'month',
    features: [
      'Up to 5 users',
      '1 company',
      'Basic reporting',
      'Email support',
      'Core features only',
    ],
    stripeProductId: 'prod_free', // Dummy ID - replace with real Stripe product ID
    stripePriceId: 'price_free', // Dummy ID
    cta: 'Get Started',
  },
  pro: {
    name: 'Pro',
    description: 'For growing businesses',
    price: 99,
    currency: 'USD',
    billingPeriod: 'month',
    features: [
      'Up to 50 users',
      'Unlimited companies',
      'Advanced reporting',
      'Priority email support',
      'All core features',
      'Custom branding',
      'API access',
    ],
    stripeProductId: 'prod_pro', // Dummy ID - replace with real Stripe product ID
    stripePriceId: 'price_pro_monthly', // Dummy ID
    cta: 'Start Free Trial',
    popular: true,
  },
  enterprise: {
    name: 'Enterprise',
    description: 'For large organizations',
    price: null, // Custom pricing
    currency: 'USD',
    billingPeriod: 'year',
    features: [
      'Unlimited users',
      'Unlimited companies',
      'Custom reporting',
      'Dedicated support',
      'All Pro features',
      'Advanced security',
      'SSO & SAML',
      'Custom integrations',
    ],
    stripeProductId: 'prod_enterprise', // Dummy ID - replace with real Stripe product ID
    stripePriceId: 'price_enterprise', // Dummy ID
    cta: 'Contact Sales',
  },
}

export const PLAN_KEYS = Object.keys(PRICING_PLANS)

export function getPlanByKey(key) {
  return PRICING_PLANS[key]
}

export function getAllPlans() {
  return Object.entries(PRICING_PLANS).map(([key, plan]) => ({
    key,
    ...plan,
  }))
}
