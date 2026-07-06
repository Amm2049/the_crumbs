# 🥐 Stripe Payment Element Step-by-Step Implementation Guide

Follow this guide step-by-step to integrate Stripe card payments and PromptPay QR payments. 

---

## 🛠️ Step 1: Install Stripe SDKs
Run this command in your project root terminal to install Stripe's official client and server SDKs:
```bash
npm install stripe @stripe/stripe-js @stripe/react-stripe-js
```

---

## 🔑 Step 2: Configure Environment Variables
Open your [.env](file:///d:/RSU/FullStack/the-crumbs/.env) file and add your Stripe API keys (obtainable from your Stripe Dashboard):
```env
# ────────────────────────────────────────────────
# STRIPE PAYMENTS (Credit Cards & PromptPay)
# ────────────────────────────────────────────────
STRIPE_SECRET_KEY="sk_test_your_secret_key"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_publishable_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_signing_secret"
```

---

## 📂 Step 3: Centralize Currency Formatting
To support THB dynamically and ensure easy currency switching in the future, create a configuration file and a utility formatter helper.

### 1. Create [lib/config.js](file:///d:/RSU/FullStack/the-crumbs/lib/config.js)
```javascript
export const APP_CONFIG = {
  currency: {
    code: 'THB',
    symbol: '฿',
    locale: 'th-TH',
    stripeFactor: 100, // Converts amount to satang (e.g. ฿25.50 -> 2550 satang)
  }
};
```

### 2. Update [lib/utils.js](file:///d:/RSU/FullStack/the-crumbs/lib/utils.js)
Import `APP_CONFIG` and append the format function at the bottom:
```javascript
import { APP_CONFIG } from './config';

// Add this formatting helper function:
export function formatCurrency(amount) {
  return new Intl.NumberFormat(APP_CONFIG.currency.locale, {
    style: 'currency',
    currency: APP_CONFIG.currency.code,
  }).format(amount);
}
```

---

## 🗄️ Step 4: Update Database Schema
Update the database to track Stripe transaction IDs.

### 1. Modify [prisma/schema.prisma](file:///d:/RSU/FullStack/the-crumbs/prisma/schema.prisma)
Add `stripePaymentIntentId` to the `Order` model:
```prisma
model Order {
  id                    String      @id @default(cuid())
  status                OrderStatus @default(PENDING)
  total                 Float       
  address               String?     
  notes                 String?     
  stripePaymentIntentId String?     @unique // 👈 Add this field
  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt

  userId                String
  user                  User        @relation(fields: [userId], references: [id])
  items                 OrderItem[]
}
```

### 2. Run Database Migration
Execute this command in your terminal to apply the schema updates:
```bash
npx prisma migrate dev --name add_stripe_payment_intent
```

---

## ⚙️ Step 5: Implement Backend API Routes

### 1. Create [app/api/payment/create-intent/route.js](file:///d:/RSU/FullStack/the-crumbs/app/api/payment/create-intent/route.js)
This API route takes an `orderId`, verifies the order total server-side, and initiates the Stripe Payment Intent:
```javascript
import Stripe from 'stripe';
import { auth } from '@/lib/auth';
import db from '@/lib/db';
import { APP_CONFIG } from '@/lib/config';
import { response } from '@/lib/api-helper';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const session = await auth();
    if (!session) return response({ error: 'Unauthorized' }, 401);

    const { orderId } = await request.json();
    if (!orderId) return response({ error: 'Missing orderId' }, 400);

    // Fetch order to verify
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { items: true }
    });

    if (!order) return response({ error: 'Order not found' }, 404);
    
    // Safety guard: only pending orders can request payment
    if (order.status !== 'PENDING') {
      return response({ error: 'Order is not in pending state' }, 400);
    }

    // Ensure user owns this order
    if (order.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return response({ error: 'Forbidden' }, 403);
    }

    // Server-side recalculation of the amount (satangs/cents)
    const amountInCents = Math.round(order.total * APP_CONFIG.currency.stripeFactor);

    // Minimum check for Stripe THB transactions (10 THB minimum)
    if (amountInCents < 1000) {
      return response({ error: 'Stripe requires a minimum total of ฿10.00' }, 400);
    }

    let paymentIntent;

    // If order already has a payment intent, retrieve it to avoid duplicates
    if (order.stripePaymentIntentId) {
      try {
        paymentIntent = await stripe.paymentIntents.retrieve(order.stripePaymentIntentId);
        
        // If amount changed or intent is canceled, recreate. Else update.
        if (paymentIntent.amount !== amountInCents || paymentIntent.status === 'canceled') {
          paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: APP_CONFIG.currency.code.toLowerCase(),
            automatic_payment_methods: { enabled: true },
            metadata: { orderId: order.id }
          });
        }
      } catch {
        // Fallback: create a new one if retrieval fails
        paymentIntent = await stripe.paymentIntents.create({
          amount: amountInCents,
          currency: APP_CONFIG.currency.code.toLowerCase(),
          automatic_payment_methods: { enabled: true },
          metadata: { orderId: order.id }
        });
      }
    } else {
      // Create new intent
      paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: APP_CONFIG.currency.code.toLowerCase(),
        automatic_payment_methods: { enabled: true },
        metadata: { orderId: order.id }
      });
    }

    // Keep Prisma database updated with Stripe Intent ID
    await db.order.update({
      where: { id: orderId },
      data: { stripePaymentIntentId: paymentIntent.id }
    });

    return response({
      clientSecret: paymentIntent.client_secret,
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    });

  } catch (error) {
    console.error('[Create Payment Intent API Error]:', error);
    return response({ error: error.message || 'Internal Server Error' }, 500);
  }
}
```

### 2. Create [app/api/payment/webhook/route.js](file:///d:/RSU/FullStack/the-crumbs/app/api/payment/webhook/route.js)
This processes the Stripe webhook asynchronously. It reads the **raw body** to verify signatures and update the order status inside a transaction:
```javascript
import Stripe from 'stripe';
import db from '@/lib/db';
import { broadcast } from '@/lib/pusher-broadcast';
import { response } from '@/lib/api-helper';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  const body = await request.text(); // 👈 Critical: Must read raw text for signature check
  const sig = request.headers.get('stripe-signature');

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return response({ error: 'Signature verification failed' }, 400);
  }

  // Handle the succeeded event
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const orderId = paymentIntent.metadata.orderId;

    if (!orderId) {
      console.warn('[Stripe Webhook]: No orderId in metadata.');
      return response({ received: true });
    }

    try {
      // 1. Transaction to update order idempotently
      const updatedOrder = await db.$transaction(async (tx) => {
        const order = await tx.order.findUnique({
          where: { id: orderId }
        });

        if (!order) throw new Error('ORDER_NOT_FOUND');
        
        // Idempotency: skip if already processed
        if (order.status !== 'PENDING') {
          return order;
        }

        // Update status to PROCESSING (payment confirmed)
        return await tx.order.update({
          where: { id: orderId },
          data: { status: 'PROCESSING' },
          include: { user: { select: { name: true } } }
        });
      });

      // 2. Broadcast live status updates
      if (updatedOrder && updatedOrder.status === 'PROCESSING') {
        broadcast.orderStatusChanged(
          updatedOrder.userId,
          updatedOrder.id,
          updatedOrder.status,
          updatedOrder.updatedAt.toISOString()
        );
        
        // Refresh admin dashboard table
        const customerName = updatedOrder.user?.name || 'Customer';
        broadcast.newOrder(updatedOrder.id, customerName, updatedOrder.total);
      }

      console.log(`[Stripe Webhook]: Successfully processed Order #${orderId}`);
    } catch (err) {
      console.error('[Stripe Webhook Processing Error]:', err.message);
      return response({ error: 'Processing error' }, 500);
    }
  }

  return response({ received: true });
}
```

---

## 🎨 Step 6: Create Frontend UI Components

### 1. Create [components/client/StripePaymentForm.jsx](file:///d:/RSU/FullStack/the-crumbs/components/client/StripePaymentForm.jsx)
This component loads the UI inputs and handles submitting details directly to Stripe:
```javascript
'use client'

import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { ShoppingBag } from 'lucide-react';

export default function StripePaymentForm({ orderId }) {
  const stripe = useStripe();
  const elements = useElements();
  
  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setIsLoading(true);
    setErrorMessage(null);

    // Triggers confirmation of card or redirection for QR/PromptPay code
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success?orderId=${orderId}`,
      },
    });

    if (error) {
      setErrorMessage(error.message);
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-2xl border border-amber-50 dark:border-zinc-800 bg-amber-50/10 dark:bg-zinc-850/40 p-4">
        <PaymentElement />
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold animate-shake">
          {errorMessage}
        </div>
      )}

      <button
        disabled={isLoading || !stripe || !elements}
        className="w-full flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 py-4 text-base font-black tracking-wide text-white shadow-xl shadow-amber-200 dark:shadow-amber-900/20 transition-all duration-300 hover:scale-[1.02] hover:brightness-110 active:scale-[0.98] disabled:bg-zinc-300 disabled:text-zinc-500 disabled:scale-100 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-[2.5px] border-white/30 border-t-white" />
            <span>Processing Payment...</span>
          </>
        ) : (
          <>
            <ShoppingBag size={18} />
            <span>Pay & Complete Order</span>
          </>
        )}
      </button>
    </form>
  );
}
```

### 2. Create [app/(client)/checkout/[id]/pay/page.jsx](file:///d:/RSU/FullStack/the-crumbs/app/\(client\)/checkout/\[id\]/pay/page.jsx)
This page displays the checkout screen, requests the clientSecret, and initializes Stripe Elements:
```javascript
'use client'

import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import StripePaymentForm from '@/components/client/StripePaymentForm';
import { formatCurrency } from '@/lib/utils';

export default function PayPage() {
  const router = useRouter();
  const { id: orderId } = useParams();

  const [clientSecret, setClientSecret] = useState(null);
  const [stripePromise, setStripePromise] = useState(null);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initCheckout() {
      try {
        // 1. Fetch Order Details from DB
        const orderRes = await fetch(`/api/orders/${orderId}`);
        if (!orderRes.ok) throw new Error('Order not found');
        const orderData = await orderRes.json();
        setOrder(orderData);

        if (orderData.status !== 'PENDING') {
          router.push('/orders');
          return;
        }

        // 2. Fetch Payment Client Secret from Backend
        const paymentRes = await fetch('/api/payment/create-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId }),
        });

        const data = await paymentRes.json();
        if (!paymentRes.ok) throw new Error(data.error || 'Failed to initialize payment');

        setClientSecret(data.clientSecret);
        setStripePromise(loadStripe(data.publishableKey));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (orderId) initCheckout();
  }, [orderId, router]);

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-amber-200 border-t-amber-600" />
        <p className="mt-4 text-sm font-bold text-[var(--bakery-text-muted)]">Loading Secure Checkout...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-md text-center py-20 px-6">
        <h2 className="text-2xl font-black text-red-500 mb-4">Error</h2>
        <p className="text-sm text-[var(--bakery-text-muted)] mb-8">{error || 'Unable to load payment details.'}</p>
        <Link href="/orders" className="inline-flex rounded-xl bg-amber-500 text-white font-bold py-3 px-6 hover:bg-amber-600 transition-colors">
          Return to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <Link href="/cart" className="mb-6 flex w-fit items-center gap-1 text-xs font-black uppercase tracking-widest text-amber-600 hover:text-amber-700">
        <ChevronLeft size={14} />
        Back to Cart
      </Link>

      <h1 className="text-3xl font-extrabold text-[var(--bakery-text)] mb-8">Secure Checkout</h1>

      <div className="grid gap-8 md:grid-cols-[1.2fr_1fr]">
        {/* Left Side: Stripe Payment Element Form */}
        <div className="rounded-[2rem] border border-amber-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xl">
          <h2 className="text-lg font-bold text-[var(--bakery-text)] mb-4">Payment Method</h2>
          {clientSecret && stripePromise ? (
            <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
              <StripePaymentForm orderId={orderId} />
            </Elements>
          ) : (
            <p className="text-xs text-red-500">Failed to load payment options.</p>
          )}
        </div>

        {/* Right Side: Order details breakdown */}
        <div className="rounded-[2rem] border border-amber-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 h-fit shadow-xl">
          <h2 className="text-lg font-bold text-[var(--bakery-text)] mb-4">Order Summary</h2>
          <div className="space-y-4">
            <div className="flex justify-between text-xs text-[var(--bakery-text-muted)]">
              <span>Order ID</span>
              <span className="font-bold text-[var(--bakery-text)]">#{orderId.slice(0, 8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between text-xs text-[var(--bakery-text-muted)]">
              <span>Delivery Address</span>
              <span className="font-bold text-[var(--bakery-text)] text-right max-w-[150px] truncate">{order.address}</span>
            </div>
            <div className="border-t border-amber-50 dark:border-zinc-800 pt-4 flex justify-between items-center">
              <span className="text-sm font-bold text-[var(--bakery-text)]">Total Amount</span>
              <span className="text-2xl font-black text-amber-600 dark:text-amber-500">{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 3. Create [app/(client)/checkout/success/page.jsx](file:///d:/RSU/FullStack/the-crumbs/app/\(client\)/checkout/success/page.jsx)
This page handles Stripe return URL params and displays a success state:
```javascript
'use client'

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/orders');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="flex h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 text-green-500 animate-bounce">
        <CheckCircle size={64} />
      </div>
      <h1 className="text-3xl font-extrabold text-[var(--bakery-text)] mb-3">Order Paid Successfully!</h1>
      <p className="text-sm text-[var(--bakery-text-muted)] max-w-sm mb-8">
        Thank you for your order {orderId ? `(#${orderId.slice(0, 8).toUpperCase()})` : ''}! We've received your payment, and our bakers are preparing your items.
      </p>

      <p className="text-xs text-zinc-400 mb-4">
        Redirecting you to your Order History in <span className="font-bold text-amber-500">{countdown}</span> seconds...
      </p>
      
      <Link href="/orders" className="text-sm font-bold text-amber-600 hover:text-amber-700 underline decoration-2">
        Go to Orders Now
      </Link>
    </div>
  );
}
```

---

## 🔄 Step 7: Connect Checkout Pages and Refactor UI Formatting

### 1. Update Checkout Redirect in [app/(client)/cart/page.jsx](file:///d:/RSU/FullStack/the-crumbs/app/\(client\)/cart/page.jsx)
Find the `handleConfirmOrder` function around line 64:
```javascript
// Replace this line:
// router.push('/orders')

// With this line:
router.push(`/checkout/${order.id}/pay`)
```

### 2. Add "Pay Now" Button in [components/client/OrdersClient.jsx](file:///d:/RSU/FullStack/the-crumbs/components/client/OrdersClient.jsx)
Under the card listing logic, check if an order's status is `PENDING`. If so, show a small action button linking to payment:
```javascript
{order.status === 'PENDING' && (
  <Link
    href={`/checkout/${order.id}/pay`}
    className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-amber-500 py-2.5 text-xs font-bold text-white hover:bg-amber-600 transition-colors"
  >
    💳 Complete Payment
  </Link>
)}
```

### 3. Replace Hardcoded Currency Symbols
Look through files matching product prices and format them. 
For example, in [ProductCard.jsx](file:///d:/RSU/FullStack/the-crumbs/components/client/ProductCard.jsx):
```javascript
// Import at top:
import { formatCurrency } from '@/lib/utils';

// Replace:
// <span>${product.price}</span>
// With:
<span>{formatCurrency(product.price)}</span>
```
Do the same for the rest of your storefront pages (orders detail, cart item rows, etc.) using `formatCurrency(value)`.
