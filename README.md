# 🥐 The Crumbs — Artisanal Bakery E-Commerce Platform

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js_15-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma_ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Auth.js](https://img.shields.io/badge/Auth.js_v5-purple?style=for-the-badge&logo=auth0&logoColor=white)](https://authjs.dev/)
[![Pusher](https://img.shields.io/badge/Pusher_WebSockets-300D4F?style=for-the-badge&logo=pusher&logoColor=white)](https://pusher.com/)
[![Stripe](https://img.shields.io/badge/Stripe_Payments-635BFF?style=for-the-badge&logo=stripe&logoColor=white)](https://stripe.com/)

**A modern, full-stack artisanal bakery e-commerce platform and real-time management dashboard.**  
Featuring sub-second optimistic cart mutations, live WebSocket order tracking, intelligent product recommendations, and high-performance database analytics.

[🌐 Live Demo](https://the-crumbs.vercel.app) • [📖 Architecture & Docs](#-engineering-highlights) • [🚀 Quickstart](#-getting-started)

</div>

---

## 🌟 Key Highlights & Features

### 🛍️ Customer Experience (Storefront)
- **Fluid Product Discovery:** Fast server-paginated product catalog with instant category filtering, real-time stock status sync, and debounced search.
- **Debounced Optimistic Cart (60fps):** Sub-second local cart updates powered by SWR with debounced server synchronization and incremental version counters to eliminate network race conditions.
- **Intelligent Recommendation Engine:** Dynamic cross-selling in the cart, related category items on product pages, and personalized favorite recommendations for logged-in customers.
- **Stripe & PromptPay Payments:** Seamless payment flows supporting Credit Cards and PromptPay QR codes with webhook verification and atomic inventory decrements.
- **Live Order Progress Timeline:** Real-time visual timeline connected to private Pusher WebSocket channels for live order status updates without page refreshes.
- **Customer Self-Service:** Customer-initiated order cancellation with automated inventory restocking for pending orders.

### 🛡️ Admin Operations & Analytics
- **Live Order Dispatch Center:** Dedicated admin dashboard subscribing to private admin WebSocket channels — triggers audio chimes, toast notifications, and gold-highlighted row prepends on incoming orders.
- **High-Performance Analytics:** Native PostgreSQL database aggregations (`$queryRaw`) rendering interactive Recharts visualizations:
  - *Daily Revenue Trends* (Area Chart)
  - *Order Volume by Status* (Stacked Bar)
  - *Revenue by Category* (Donut Chart)
  - *Top 5 Best-Selling Products* (Horizontal Bar)
- **Full Inventory & Category Management:** Complete CRUD with Cloudinary image uploads, stock threshold monitoring, and automated low-stock warnings.
- **Customer Directory:** Paginated overview of registered customers, purchase history totals, and account roles.

---

## 🏗️ Tech Stack & Architecture

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | **Next.js 15 (App Router)** | Full-stack React framework with Server Components & Route Handlers |
| **Styling & UI** | **Tailwind CSS v4 + shadcn/ui** | Custom "Honey & Cream" design system with dark mode & WCAG 2.1 AA accessibility |
| **Database** | **PostgreSQL (Neon Serverless)** | Relational database with composite indexing for query optimization |
| **ORM** | **Prisma ORM** | Type-safe database queries, schema migrations, and transaction management |
| **Authentication** | **Auth.js v5 (NextAuth)** | Email/password (bcrypt) + Google OAuth with JWT session strategies & Edge proxy guards |
| **Real-time WebSockets**| **Pusher Channels** | Event-driven server-to-client updates for stock, order alerts, and status changes |
| **Payments** | **Stripe API** | Payment Intents, webhook signature verification, and idempotency checks |
| **Media Hosting** | **Cloudinary** | Optimized asset storage with direct browser uploads via `CldUploadWidget` |
| **State Management** | **SWR** | Stale-While-Revalidate caching for client-side data fetching and optimistic mutations |

---

## 💡 Engineering Highlights

### 1. Zero-Jank Optimistic UI & Race-Condition Protection
*Problem:* Rapidly clicking quantity controls (`+` / `-`) or adding multiple items in quick succession can cause network responses to arrive out of order, resulting in UI jitter and stale cache overwrites.  
*Solution:*
- Configured local SWR cache mutations with `{ revalidate: false }` for instantaneous 60fps responsiveness.
- Implemented a 400ms debounce buffer per cart item with an incremental `syncVersion` tracker, guaranteeing that older delayed network responses never overwrite newer optimistic user interactions.

### 2. Event-Driven Real-Time Ecosystem (WebSockets)
- Subscribes customers to private channels (`private-user-{userId}`) to track order status transitions (`PENDING` → `PROCESSING` → `READY` → `DELIVERED`).
- Broadcasts inventory availability updates to public storefront channels (`products`) whenever purchases or cancellations occur.
- Pushes administrative events (`new-order`, `order-cancelled`, `low-stock`) to private admin channels with audio feedback and animated table updates.

### 3. Query-Optimized Analytics via Native SQL Aggregations
- Rather than loading entire datasets into memory on the Node.js layer, the analytics dashboard executes optimized PostgreSQL native queries (`$queryRaw`) with composite database indexes (`@@index([categoryId, isAvailable])`, `@@index([userId, status, createdAt])`).

### 4. Enterprise Security & WCAG 2.1 AA Accessibility
- **Edge Route Protection:** Custom proxy routing layer validating role-based authorization for administrative endpoints and customer account routes.
- **Error Masking:** Database and internal runtime stack traces are masked into generic 500 error responses with server-side correlation logs.
- **Accessibility:** All interactive modals feature ARIA dialog specifications (`role="dialog"`, `aria-modal="true"`, `Escape` key dismissals), screen-reader live regions (`aria-live="polite"`), and high-contrast dark mode support.

---

## 🔑 Demo Credentials

To test the application without creating a new account, use the pre-configured credentials below:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@thecrumbs.com` | `Admin123!` | Full Admin Dashboard, Analytics, Product/Category CRUD, Order Management |
| **Customer** | *(Use Google OAuth or Register a new account)* | — | Storefront, Cart, Checkout, Order Tracking, Profile |

> **Stripe Test Mode:** Use standard test card numbers (e.g., `4242 4242 4242 4242`, any future expiration date, CVC: `123`) on the checkout page.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.18+ or 20+
- A PostgreSQL database instance (local or hosted on Neon / Supabase)
- Pusher, Cloudinary, and Stripe developer accounts

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/the-crumbs.git
cd the-crumbs
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local` and provide your credentials:
```bash
cp .env.example .env.local
```

### 3. Database Setup & Seeding
```bash
# Push schema to database
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Seed sample categories, products, and admin account
node prisma/seed.js
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the storefront.

---

## 🌿 Git Flow & Branching Strategy

This project follows standard **Git Flow** conventions:
- `main` — Production-ready deployment branch (hosted on Vercel).
- `develop` — Core integration branch. All feature branches originate from here.
- `feature/*` — Isolated feature branches merged back into `develop` via pull requests.

---

## 📄 License
This project is open source and available under the [MIT License](LICENSE).
