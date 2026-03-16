import { stripe } from '@/lib/stripe'
import { supabase } from '../../../../config/supabaseClient'

export async function POST(req) {
  try {
    const { priceId, userId, email, planKey } = await req.json()

    if (!priceId || !userId || !email) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Create or retrieve customer from Stripe
    const customers = await stripe.customers.list({
      email: email,
      limit: 1,
    })

    let customerId
    if (customers.data.length > 0) {
      customerId = customers.data[0].id
    } else {
      const customer = await stripe.customers.create({
        email: email,
        metadata: {
          userId: userId,
          planKey: planKey,
        },
      })
      customerId = customer.id
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/users/${userId}/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/users/${userId}/billing?canceled=true`,
      metadata: {
        userId: userId,
        planKey: planKey,
      },
    })

    // Store subscription attempt in Supabase
    await supabase
      .from('subscription_events')
      .insert({
        user_id: userId,
        event_type: 'checkout_session_created',
        plan_key: planKey,
        stripe_session_id: session.id,
        stripe_customer_id: customerId,
        status: 'pending',
      })

    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Checkout error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
