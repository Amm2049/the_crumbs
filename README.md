# 🥐 The Crumbs — Artisanal Bakery E-Commerce Platform

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js_15-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma_ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Auth.js](https://img.shields.io/badge/Auth.js_v5-purple?style=for-the-badge&logo=auth0&logoColor=white)](https://authjs.dev/)
[![Pusher](https://img.shields.io/badge/Pusher_Channels-300D4F?style=for-the-badge&logo=pusher&logoColor=white)](https://pusher.com/)
[![Stripe](https://img.shields.io/badge/Stripe_Payments-635BFF?style=for-the-badge&logo=stripe&logoColor=white)](https://stripe.com/)

**A full-stack artisanal bakery e-commerce web application with customer storefront and real-time admin dashboard.**  
Built with Next.js 15 App Router, PostgreSQL (Neon), Prisma ORM, Auth.js, Pusher Channels, and Stripe.

👉 **[Live Demo: the-crumbs-bice.vercel.app](https://the-crumbs-bice.vercel.app/)**

</div>

---

## 📑 Table of Contents
- [Project Overview](#-project-overview)
- [Key Features](#-key-features)
- [Tech Stack & Architecture](#-tech-stack--architecture)
- [Engineering Highlights](#-engineering-highlights)
- [Demo Credentials](#-demo-credentials)
- [Local Setup & Getting Started](#-local-setup--getting-started)
- [Git Workflow](#-git-workflow)

---

## 🥐 Project Overview

**The Crumbs** is an end-to-end bakery ordering platform built to provide a buttery-smooth customer shopping experience and a live operational dashboard for bakery staff.

- **Theme:** "Honey & Cream" — Warm ambers, creamy whites, and dark mode support.
- **Storefront:** Browse artisanal products, manage cart with optimistic updates, personalized recommendations, Stripe checkout, and track order progress live.
- **Admin Dashboard:** Real-time incoming order alerts with audio chimes, low-stock indicators, product/category management with Cloudinary uploads, and database analytics charts.

---

## 🌟 Key Features

### 🛍️ Customer Experience (Storefront)
- **Product Catalog & Search:** Server-paginated product listing with instant category filtering and search.
- **Optimistic Cart Updates:** Sub-second quantity updates using SWR cache with 400ms server debouncing to prevent UI lag.
- **Smart Recommendations:** Related products on item pages, cart cross-selling, and personalized category recommendations on the home page.
- **Stripe Checkout:** Integrated credit card payments and PromptPay QR codes with server-side validation and stock verification.
- **Live Order Tracking:** Real-time order progress timeline powered by Pusher Channels (`PENDING` → `PROCESSING` → `READY` → `DELIVERED`).
- **Customer Cancellation:** Self-service cancellation for pending orders with automated inventory restocking.

### 🛡️ Admin Management
- **Live Order Center:** Real-time event notifications via Pusher Channels (audio chime, toast alerts, and highlighted new order rows).
- **Interactive Analytics:** Four dashboard charts powered by Recharts using query-optimized PostgreSQL raw queries (`$queryRaw`):
  - Daily Revenue Trends (Area Chart)
  - Order Volume by Status (Stacked Bar Chart)
  - Revenue by Category (Donut Chart)
  - Top 5 Best-Selling Products (Horizontal Bar Chart)
- **Product & Category Management:** Complete CRUD with Cloudinary image uploads, slug auto-generation, and stock monitoring.
- **Customer Directory:** Paginated list of registered customers and account roles.

---

## 🏗️ Tech Stack & Architecture

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | **Next.js 15 (App Router)** | Full-stack framework with React Server Components & API Route Handlers |
| **Styling & UI** | **Tailwind CSS v4 + shadcn/ui** | Design system with dark mode & WCAG 2.1 AA accessibility |
| **Database** | **PostgreSQL (Neon Serverless)** | Relational database with composite indexing |
| **ORM** | **Prisma ORM** | Schema migrations, type-safe queries, and transactions |
| **Authentication** | **Auth.js v5 (NextAuth)** | Email/password (bcrypt) + Google OAuth with JWT session strategy |
| **Real-time Events** | **Pusher Channels** | Managed cloud event broadcasting for live order tracking & admin alerts |
| **Payments** | **Stripe API** | Payment Intents, card processing, and PromptPay QR codes |
| **Media Storage** | **Cloudinary** | Image uploads via `CldUploadWidget` |
| **State & Cache** | **SWR** | Client-side data fetching and optimistic mutations |

---

## 💡 Engineering Highlights

### 1. Debounced Optimistic UI & Race-Condition Prevention
*Challenge:* Rapidly clicking `+` / `-` buttons on cart items can cause out-of-order network responses, resulting in UI jitter or stale server data overwriting the latest user action.  
*Solution:*
- Configured local SWR cache updates with `{ revalidate: false }` for instant 60fps responsiveness.
- Implemented a 400ms debounce buffer per cart item with an incremental `syncVersion` counter so older in-flight requests never bounce back or overwrite newer clicks.

### 2. Real-Time Event Architecture with Pusher Channels
*Implementation:*
- Used **Pusher Channels** (a managed cloud real-time event service) to publish server events directly to client browsers without manual page reloading.
- **Private Channels (`private-user-{userId}`):** Syncs customer order status updates securely.
- **Private Admin Channel (`private-admin`):** Dispatches live order notifications, low-stock warnings, and sound alerts to bakery staff.
- **Public Channel (`products`):** Updates stock availability on the customer catalog live.

### 3. Query-Optimized Analytics via PostgreSQL Raw SQL
- Instead of pulling thousands of records into memory and computing aggregates on the Node.js server, the analytics API executes native PostgreSQL queries (`$queryRaw`) utilizing composite database indexes (`@@index([categoryId, isAvailable])`, `@@index([userId, status, createdAt])`).

### 4. Security & Accessibility Hardening
- **Edge Route Protection:** Role-based route middleware protecting `/admin/*` and customer account pages.
- **Error Masking:** Database and internal runtime stack traces are masked into generic 500 error responses with server-side error logging.
- **WCAG 2.1 AA Compliance:** Accessible modal dialogs (`role="dialog"`, `aria-modal="true"`, `Escape` key listeners) and high-contrast color tokens.

---

## 🔑 Demo Credentials

To test the application without creating a new account:

| Role | Email | Password | Access |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@thecrumbs.com` | `12345678` | Admin Dashboard, Analytics, Product/Category CRUD, Order Management |
| **Customer** | *(Use Google OAuth or register)* | — | Storefront, Cart, Stripe Checkout, Order History |

> **Stripe Test Cards:** Use test card `4242 4242 4242 4242`, any future date (e.g. `12/34`), and CVC `123` at checkout.

---

## 🚀 Local Setup & Getting Started

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/the_crumbs.git
cd the_crumbs
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local` and add your keys:
```bash
cp .env.example .env.local
```

### 3. Database Setup & Seeding
```bash
# Push schema to PostgreSQL database
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Seed initial categories, products, and admin user
node prisma/seed.js
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌿 Git Workflow

This project adheres to **Git Flow**:
- `main` — Production branch (deployed on Vercel).
- `develop` — Active integration branch.
- `feature/*` — Feature branches branched off and merged back into `develop`.
