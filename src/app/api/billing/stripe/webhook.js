import { stripe } from '@/lib/stripe'
import { supabase } from '../../../../config/supabaseClient'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_secret'

export async function POST(req) {
  try {
    const body = await req.text()
    const sig = req.headers.get('stripe-signature')

    let event

    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return new Response(`Webhook Error: ${err.message}`, { status: 400 })
    }

    // Handle different event types
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(event.data.object)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionCanceled(event.data.object)
        break

      case 'invoice.payment_succeeded':
        await handleInvoicePaid(event.data.object)
        break

      case 'invoice.payment_failed':
        await handleInvoiceFailed(event.data.object)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(`Webhook Error: ${error.message}`, { status: 500 })
  }
}

async function handleSubscriptionChange(subscription) {
  const { customer, id, status, items } = subscription
  const priceId = items.data[0]?.price.id

  // Store subscription in Supabase
  await supabase.from('subscriptions').upsert(
    {
      stripe_subscription_id: id,
      stripe_customer_id: customer,
      stripe_price_id: priceId,
      status: status,
      current_period_start: new Date(subscription.current_period_start * 1000),
      current_period_end: new Date(subscription.current_period_end * 1000),
      updated_at: new Date(),
    },
    { onConflict: 'stripe_subscription_id' }
  )

  console.log(`Subscription ${status}: ${id}`)
}

async function handleSubscriptionCanceled(subscription) {
  // Update subscription status in Supabase
  await supabase
    .from('subscriptions')
    .update({ status: 'canceled', updated_at: new Date() })
    .eq('stripe_subscription_id', subscription.id)

  console.log(`Subscription canceled: ${subscription.id}`)
}

async function handleInvoicePaid(invoice) {
  // Record payment in Supabase
  await supabase.from('invoice_logs').insert({
    stripe_invoice_id: invoice.id,
    stripe_customer_id: invoice.customer,
    amount: invoice.amount_paid / 100, // Convert from cents
    currency: invoice.currency,
    status: 'paid',
    paid_at: new Date(invoice.paid_date * 1000),
  })

  console.log(`Invoice paid: ${invoice.id}`)
}

async function handleInvoiceFailed(invoice) {
  // Record failed payment in Supabase
  await supabase.from('invoice_logs').insert({
    stripe_invoice_id: invoice.id,
    stripe_customer_id: invoice.customer,
    amount: invoice.amount_due / 100,
    currency: invoice.currency,
    status: 'failed',
    failed_at: new Date(),
  })

  console.log(`Invoice failed: ${invoice.id}`)
}
