import { stripe } from '@/lib/stripe'
import { supabase } from '../../../../config/supabaseClient'

export async function POST(req) {
  try {
    const { userId, email } = await req.json()

    if (!email || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing email or userId' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Find Stripe customer by email
    const customers = await stripe.customers.list({
      email: email,
      limit: 1,
    })

    if (customers.data.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No Stripe customer found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const customerId = customers.data[0].id

    // Create billing portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/users/${userId}/billing`,
    })

    // Log portal access in Supabase
    await supabase.from('subscription_events').insert({
      user_id: userId,
      event_type: 'billing_portal_accessed',
      stripe_customer_id: customerId,
      status: 'success',
    })

    return new Response(
      JSON.stringify({ url: portalSession.url }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Portal session error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
