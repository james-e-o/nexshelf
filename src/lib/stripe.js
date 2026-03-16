import Stripe from 'stripe'

// Initialize Stripe with test/dummy keys
// Replace with real keys from environment variables when ready
export const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY || 'sk_test_51234567890abcdefghijklmnopqrstuvwxyz',
  {
    apiVersion: '2023-10-16',
  }
)

// Publish-able key for client-side
export const stripePublishableKey = 
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 
  'pk_test_51234567890abcdefghijklmnopqrstuvwxyz'
