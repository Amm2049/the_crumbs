# 💳 Stripe Payment Flow Overview — The Crumbs

To build a robust payment system supporting **Credit Cards** and **PromptPay**, we utilize Stripe's **Payment Intents API** combined with **Stripe Elements** (specifically the **Payment Element**).

This document explains the conceptual flow, lifecycle, and security model of how Stripe interacts with our Next.js backend and client storefront.

---

## 🔄 End-to-End Sequence Diagram

The following diagram illustrates how the checkout flow proceeds from order creation to payment authorization and database updates via Stripe Webhooks:

```mermaid
sequenceDiagram
    autonumber
    actor Customer as 🧑‍🍳 Customer
    participant Frontend as 💻 Storefront Client
    participant Backend as ⚙️ Next.js Backend
    participant DB as 🗄️ PostgreSQL (Prisma)
    participant Stripe as 💳 Stripe API
    participant Webhook as 🔌 Stripe Webhook Handler

    %% 1. Order Creation
    Customer->>Frontend: Enter delivery address & click "Place Order"
    Frontend->>Backend: POST /api/orders {address, notes}
    Backend->>DB: Write Order (status: PENDING), decrement product stock
    Backend-->>Frontend: Return order data (e.g., Order #101)
    Frontend->>Frontend: Redirect to /checkout/101/pay

    %% 2. Initiating Payment
    Frontend->>Backend: POST /api/payment/create-intent {orderId: "101"}
    Backend->>DB: Fetch order & recalculate true total price
    Backend->>Stripe: stripe.paymentIntents.create({amount, currency: 'thb', ...})
    Stripe-->>Backend: Return PaymentIntent clientSecret & ID
    Backend->>DB: Update order to store stripePaymentIntentId
    Backend-->>Frontend: Return clientSecret & publishableKey

    %% 3. Rendering Form & Processing Payment
    Frontend->>Frontend: Load Stripe Elements Provider & mount Payment Element
    Customer->>Frontend: Select Card or PromptPay & click "Pay Now"
    Frontend->>Stripe: Confirm payment with clientSecret (via confirmPayment)
    
    alt If Credit Card (synchronous/immediate success)
        Stripe-->>Frontend: Success callback
        Frontend->>Frontend: Redirect to /checkout/success?orderId=101
    else If PromptPay (asynchronous QR display/redirect)
        Stripe->>Customer: Display PromptPay QR code
        Customer->>Customer: Scan and approve in mobile banking app
        Stripe-->>Frontend: Redirect to /checkout/success?orderId=101
    end

    %% 4. Webhook updates database asynchronously
    Note over Stripe, Webhook: Payment completed successfully
    Stripe->>Webhook: POST /api/payment/webhook (payment_intent.succeeded)
    Webhook->>Webhook: Verify signature using STRIPE_WEBHOOK_SECRET
    Webhook->>DB: Look up Order by stripePaymentIntentId (idempotency check)
    Webhook->>DB: Update Order status: PENDING -> PROCESSING
    Webhook->>Backend: Trigger Pusher Broadcast (status-changed)
    Backend-->>Frontend: Push status update to Orders UI (real-time reload)
    Webhook-->>Stripe: Respond 200 OK
```

---

## 🛠️ How Stripe Works: Key Concepts

### 1. The PaymentIntent
A **PaymentIntent** is a Stripe object created on the server that represents your intent to collect a payment from a customer. It tracks the payment lifecycle from initiation to success:
* **Amount**: Set in the smallest currency unit. In Thai Baht (THB), this is the **Satang** (e.g., ฿25.50 must be represented as `2550`).
* **Metadata**: We store `{ orderId: order.id }` in the PaymentIntent. This allows our webhook handler to identify which order was paid without having to ask the client.
* **Client Secret**: A secure key returned to the frontend. It allows Stripe Elements to mount the payment interface and collect details securely without exposing your main secret key.

### 2. Stripe Elements & Payment Element
**Stripe Elements** are pre-built UI components. The **Payment Element** is a unified component that displays payment methods dynamically:
* In Thailand, enabling `automatic_payment_methods: { enabled: true }` in the PaymentIntent will display **Credit/Debit Cards** and **PromptPay** side-by-side depending on what you configured in the Stripe Dashboard.
* Stripe hosts the sensitive fields (like card numbers), keeping your servers entirely out of PCI compliance scope.

### 3. Webhooks & Asynchronous Processing
* **Why do we need webhooks?** For payment methods like PromptPay, the customer must open their banking app, scan a QR code, and complete the transfer. This takes time (seconds or minutes). The customer might also close the checkout tab.
* **How it works:** Once the customer transfers the money, Stripe's bank detects the payment and fires an HTTP POST request (webhook) to `/api/payment/webhook`.
* **Idempotency:** Webhooks may be retried by Stripe if they fail to receive a timely response. Our code must check the database first: if the order is already marked as `PROCESSING`, we ignore the webhook event to avoid double-processing (e.g., sending multiple Pusher chimes or updating stock twice).

### 4. Webhook Signature Verification
To prevent malicious actors from spoofing payment success events, Stripe signs every webhook payload.
* We read the raw request payload (as text, not JSON) and the `stripe-signature` header.
* We verify it using our server-side `STRIPE_WEBHOOK_SECRET` and Stripe SDK's verification library. If signature verification fails, we reject the request immediately with a `400` code.
