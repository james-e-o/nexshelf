# Stripe Integration Guide

This directory contains a complete Stripe billing integration for Nexshelf Pro.

## 📁 Folder Structure

```
/api/billing/
├── stripe/
│   ├── checkout.js      # Creates Stripe checkout sessions
│   ├── portal.js        # Customer billing portal access
│   └── webhook.js       # Stripe webhook event handler
└── [basestack/]         # Future: Another payment processor
```

## 🔑 Environment Setup

Create these environment variables in `.env.local`:

```env
# Stripe Keys (get from https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY

# Webhook Secret (from Stripe Dashboard > Webhooks)
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET

# Base URL for redirects
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## 📚 Configuration Files

### `/lib/stripe.js`
- Initializes Stripe client
- Uses test keys by default (with dummy values)
- Replace with real keys when ready

### `/lib/pricing-plans.js`
- Defines all subscription plans (Free, Pro, Enterprise)
- Maps to Stripe Product/Price IDs
- Features and pricing per plan

## 🎯 Current Features

✅ **3 Pricing Plans**: Free, Pro (popular), Enterprise  
✅ **Checkout Integration**: Creates Stripe checkout sessions  
✅ **Billing Portal**: Customers can manage their subscriptions  
✅ **Webhook Handling**: Tracks subscription events  
✅ **Supabase Integration**: Stores subscription data  
✅ **Modern UI**: Responsive pricing cards with your brand colors

## 🚀 Getting Started (Dummy/Test Mode)

The integration uses dummy Stripe test keys by default. To test:

1. Visit `/users/[u]/billing`
2. Click "Start Free Trial" on Pro/Enterprise plans
3. You'll see error messages (expected - using dummy keys)

## 🔧 To Use Real Stripe

1. **Create Stripe Account**: https://stripe.com
2. **Get API Keys**: Dashboard > API Keys > Copy Secret and Publishable keys
3. **Create Products**: 
   - Dashboard > Products > New Product
   - Create 3 products: Free, Pro, Enterprise
   - Note the Price IDs (price_xxx)
4. **Update `/lib/pricing-plans.js`**:
   ```javascript
   pro: {
     // ...
     stripePriceId: 'price_actual_id_from_stripe', // Replace dummy
   }
   ```
5. **Set Environment Variables** in `.env.local`
6. **Setup Webhook**:
   - Dashboard > Developers > Webhooks > Add endpoint
   - URL: `https://yourdomain.com/api/billing/stripe/webhook`
   - Select events: subscription, invoice
   - Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

## 📊 Supabase Tables Required

```sql
-- Subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  stripe_price_id TEXT,
  status TEXT,
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Subscription events table
CREATE TABLE subscription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users,
  event_type TEXT,
  plan_key TEXT,
  stripe_session_id TEXT,
  stripe_customer_id TEXT,
  status TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Invoice logs table
CREATE TABLE invoice_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_invoice_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  amount DECIMAL(10,2),
  currency TEXT,
  status TEXT,
  paid_at TIMESTAMP,
  failed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔄 API Endpoints

### POST `/api/billing/stripe/checkout`
**Creates a checkout session**

Request:
```json
{
  "priceId": "price_xxx",
  "userId": "user-uuid",
  "email": "user@example.com",
  "planKey": "pro"
}
```

Response:
```json
{
  "sessionId": "cs_xxx",
  "url": "https://checkout.stripe.com/..."
}
```

### POST `/api/billing/stripe/portal`
**Creates a billing portal session**

Request:
```json
{
  "userId": "user-uuid",
  "email": "user@example.com"
}
```

Response:
```json
{
  "url": "https://billing.stripe.com/..."
}
```

### POST `/api/billing/stripe/webhook`
**Webhook endpoint for Stripe events**

Handles:
- `customer.subscription.created/updated` → Updates subscriptions table
- `customer.subscription.deleted` → Marks as canceled
- `invoice.payment_succeeded` → Logs successful payment
- `invoice.payment_failed` → Logs failed payment

## 🎨 UI Components

### `PricingCard`
Located at `/components/billing/pricing-card.js`

Displays:
- Plan name & description
- Price (or "Custom" for Enterprise)
- Feature list with checkmarks
- CTA button
- Popular badge (for Pro plan)

Uses your brand colors:
- `bg-core` for primary
- `text-army` for accents
- `bg-armylight` for backgrounds

## 🔒 Security Notes

- Secret keys NEVER exposed in frontend
- Test keys have rate limits
- Webhooks verify Stripe signature
- Supabase RLS should restrict access to user's own data
- Use HTTPS in production

## 📝 Future Enhancements

- [ ] Separate `basestack/` folder for alternative payment processor
- [ ] Invoicing system
- [ ] Usage-based pricing
- [ ] Proration handling
- [ ] Dunning management
- [ ] Multiple payment methods

## 🐛 Troubleshooting

**"No Stripe customer found"**: User hasn't made a purchase yet  
**"Webhook Error: No matching signature"**: Check webhook secret  
**"SESSION_INVALID"**: Price ID doesn't exist in Stripe  
**"Missing Supabase tables"**: Run SQL setup queries above

---

**Last Updated**: March 16, 2026  
**Status**: Ready for Test Mode (Dummy Keys)
