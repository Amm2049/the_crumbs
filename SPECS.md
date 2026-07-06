# 🥐 The Crumbs — Project Specifications

> Reference document for AI assistants. Read this first before writing any code.

---

## 🏗️ Project Overview

**The Crumbs** is a full-stack **bakery e-commerce web app** built as a university full-stack learning project.
It has a customer-facing storefront and an admin management dashboard, all in one Next.js monorepo.

- **Design theme:** "Honey & Cream" — warm ambers, creamy whites, dark zinc for dark mode
- **Style:** Premium, artisanal feel. Glassmorphism, smooth transitions, micro-animations.
- **Dev server:** `npm run dev` at `http://localhost:3000`

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15/16 (App Router) |
| Language | JavaScript (JSX) — no TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Auth | Auth.js v5 (NextAuth) — Credentials + Google OAuth |
| Database | PostgreSQL via Prisma ORM |
| DB Client | Custom output path: `@/lib/generated/prisma` (NOT `@prisma/client`) |
| Images | Cloudinary (browser-side uploads via `CldUploadWidget`) |
| Data fetching | SWR for cart; plain `fetch` in client components for orders/profile |
| Deployment | Vercel + Neon PostgreSQL |

---

## 📁 Project Structure

```
app/
  (client)/           # Storefront pages (Navbar + Footer layout)
    page.jsx          # Home / landing page
    products/         # Product listing + detail pages
    cart/             # Cart & checkout page
    orders/           # Customer order history
    profile/          # Customer profile settings
  (admin)/            # Admin dashboard (sidebar layout)
    admin/
      dashboard/      # Stats + recent orders overview
      products/       # Product CRUD with server-side pagination
      categories/     # Category CRUD
      orders/         # Order management (status updates)
      customers/      # Customer list
  (auth)/             # Login + Register pages
  api/
    auth/             # NextAuth handlers + register endpoint
    products/         # Public product list + single product
    categories/       # Public category list + CRUD
    cart/             # Cart read/write (auth required)
    orders/           # Order list + place order + single order
    admin/            # Admin-only secured endpoints
      products/       # Paginated admin product list
      categories/
      customers/
      dashboard/

components/
  client/             # Storefront components
  admin/              # Admin dashboard components
  shared/             # Reusable (Pagination, etc.)
  ui/                 # shadcn/ui primitives

lib/
  db.js               # Prisma singleton
  auth.js             # Auth.js config (Credentials + Google)
  api-helper.js       # Shared API utilities (handleUpdate, OwnershipCheck, etc.)
  utils.js            # response() and handleApiError() helpers
  generated/prisma/   # Prisma generated client (custom output path)

prisma/
  schema.prisma       # DB schema
  seed.js             # Seed script (admin user + 4 categories + 12 products)
```

---

## 🗄️ Database Schema (Prisma)

### Models

**User** — customers and admins
- `id`, `name`, `email` (unique), `image?`, `password?` (null for OAuth), `role` (CUSTOMER | ADMIN), timestamps

**Category**
- `id`, `name`, `slug` (unique), `description?`, `image?` (Cloudinary URL), `createdAt`
- Has many `Product`

**Product**
- `id`, `name`, `slug` (unique), `description`, `price` (Float), `stock` (Int), `images` (String[]), `isAvailable` (Bool), timestamps
- Belongs to `Category` (onDelete: Restrict)

**Order**
- `id`, `status` (PENDING | PROCESSING | READY | DELIVERED | CANCELLED), `total` (Float, snapshotted), `address?` (delivery address — required at checkout via API), `notes?` (optional special instructions), timestamps
- Belongs to `User`
- Has many `OrderItem`

**OrderItem**
- `id`, `quantity`, `price` (Float, snapshotted at order time)
- Belongs to `Order` (onDelete: Cascade), `Product`

**CartItem**
- `id`, `quantity`, timestamps
- Belongs to `User` (onDelete: Cascade), `Product`
- `@@unique([userId, productId])` — upsert pattern for add-to-cart

### Enums
```
Role:        ADMIN | CUSTOMER
OrderStatus: PENDING | PROCESSING | READY | DELIVERED | CANCELLED
```

---

## 🔐 Authentication

- **Credentials provider** — email + password (bcrypt hashed, cost 10)
- **Google OAuth provider** — added, `password` field is null for OAuth users
- **JWT strategy** — `id` and `role` passed through token → session callbacks
- **Middleware** (`middleware.js`) — protects routes:
  - `/admin/*` → must be ADMIN
  - `/cart`, `/orders/*` → must be logged in
  - `/login`, `/register` → redirects if already logged in
- **Seed admin:** `admin@thecrumbs.com` / `Admin123!`

---

## 🛠️ Key Patterns & Conventions

### API Helpers (`lib/api-helper.js`)
Always use these instead of raw Prisma calls where possible:
- `response(data, status?)` — wraps JSON response
- `handleApiError(error)` — catches Prisma errors, returns appropriate status
- `handleUpdate(id, model, options)` — generic update by ID
- `handleDelete(id, model, constraints?)` — delete with optional constraint check
- `OwnershipCheck(id, model, session, options)` — fetch + verify owner OR admin

### Next.js 15 — `params` is a Promise
Always `await params` in route handlers:
```js
export async function GET(request, { params }) {
  const { id } = await params  // ✅ must await
}
```

### Prisma Import Path
```js
import { PrismaClient } from '@/lib/generated/prisma'  // ✅
// NOT: import { PrismaClient } from '@prisma/client'   // ❌
```

### Auth Check Pattern
```js
const session = await auth()
if (!session) return response({ error: 'Unauthorized' }, 401)
const isAdmin = session.user.role === 'ADMIN'
```

### Pagination Pattern (API)
```js
const page  = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '10', 10)))
const skip  = (page - 1) * limit
// Returns: { data, total, page, totalPages }
return response({ data: items, total, page, totalPages: Math.ceil(total / limit) })
```

### CSS Variables (Design Tokens)
The app uses CSS variables defined in `app/globals.css`:
- `--bakery-text` — primary text color
- `--bakery-text-muted` — secondary/muted text
- `--background` — page background

### Status Badge Colors (used in multiple components)
```js
const statusClasses = {
  PENDING:    'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400',
  PROCESSING: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400',
  READY:      'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-400',
  DELIVERED:  'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
  CANCELLED:  'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
}
```

---

## ✅ Features Completed

| Feature | Files |
|---------|-------|
| Prisma singleton | `lib/db.js` |
| Auth.js (credentials + Google OAuth) | `lib/auth.js`, `app/api/auth/` |
| Route protection middleware | `middleware.js` |
| Full products CRUD API | `app/api/products/`, `app/api/admin/products/` |
| Full categories CRUD API | `app/api/categories/` |
| DB-backed cart (upsert pattern) | `app/api/cart/` |
| Order placement (atomic transaction, stock decrement) | `app/api/orders/route.js` |
| Admin dashboard (stats, charts placeholder) | `app/(admin)/admin/dashboard/` |
| Admin products/categories/orders/customers pages | `app/(admin)/admin/` |
| Cloudinary image uploads | via `CldUploadWidget` in admin forms |
| Customer storefront (home, products, cart, profile) | `app/(client)/` |
| **Order cancellation by customer** | `app/api/orders/[id]/route.js` PATCH handler |
| **Order detail modal** (`OrderDetailModal.jsx`) | `components/client/OrderDetailModal.jsx` |
| **Server-driven pagination on orders page** | `components/client/OrdersClient.jsx` |
| **Compact order cards** (pills preview, two-column layout) | `components/client/OrdersClient.jsx` |
| **#4 Checkout delivery address + special instructions** | `app/(client)/cart/page.jsx`, `app/api/orders/route.js`, `components/admin/OrderModal.jsx`, `components/client/OrderDetailModal.jsx` |
| **#0 Backend product search & pagination** | `app/api/products/route.js`, `components/client/ShopProductsClient.jsx`, `components/client/ProductGrid.jsx` |
| **#1 Admin analytics charts** | `app/api/admin/dashboard/analytics/route.js`, `components/admin/AnalyticsCharts.jsx`, `app/(admin)/admin/dashboard/page.jsx` |
| **#2 Low stock alerts in admin** | `app/api/admin/dashboard/low-stock/route.js`, `components/admin/StockAlertBell.jsx`, `components/admin/StatsCard.jsx`, `components/admin/ProductsTable.jsx` |
| **#3 Real-time order tracking & Admin notifications (Pusher)** | `lib/pusher.js`, `lib/pusher-constants.js`, `lib/pusher-broadcast.js`, `app/api/pusher/auth/route.js`, `hooks/usePusher.js`, `components/client/OrderStatusTimeline.jsx`, `components/client/OrderDetailModal.jsx`, `components/client/OrdersClient.jsx`, `components/admin/AdminNavbar.jsx`, `components/admin/OrdersTable.jsx`, `components/client/ProductGrid.jsx`, `components/client/ShopProductsClient.jsx` |

### Order Cancellation — Key Details
- Customer can only cancel **their own PENDING orders**
- API verifies ownership before allowing status change to `CANCELLED`
- On cancellation: **stock is restored** via `db.$transaction` incrementing each `OrderItem.quantity` back to the product
- Admin can change order to any status freely

### Order Detail Modal — Key Details
- Triggered by clicking any order card on `/orders`
- Shows: full item list with per-item price, line total, order total, status badge
- Cancel button only visible for `PENDING` orders
- On cancel success: re-fetches current page and closes modal automatically
- Props: `order`, `onClose`, `onCancelled`

### Checkout Address + Notes — Key Details
- `Order.address String?` — delivery address, stored as a single text field. Required at checkout: API returns `400` if missing, UI shows inline error before firing the request.
- `Order.notes String?` — optional special instructions (e.g. "ring bell", "leave at door").
- Both fields shown in the **admin `OrderModal`** (📍 Delivery Address + 💬 Special Instructions blocks) and the **customer `OrderDetailModal`**.
- Migration baseline `0_init` + migration `20260630102115_add_address_and_notes_to_order` applied to DB.

### Admin Analytics Charts — Key Details
- High-performance API endpoint at `/api/admin/dashboard/analytics` running query-optimized native PostgreSQL database aggregations via `db.$queryRaw`.
- Renders 4 interactive, responsive SVG charts inside the dashboard utilizing Recharts: **Daily Revenue Trend** (Area), **Orders Volume by Status** (Stacked Bar), **Revenue by Category** (Donut Pie), and **Top 5 Products** (Horizontal Bar).
- Employs standard static imports in server component combined with client mount checks in React components to avoid SSR/hydration mismatches.

### Real-time Order Tracking & Admin Alerts (Pusher) — Key Details
- Integrates server-to-client websockets using **Pusher Channels** for instant status propagation and notifications.
- Subscribes to private user-specific channels (`private-user-{userId}`) to sync both the Orders list dashboard cards and the visual modal timelines in real-time.
- Subscribes to the private admin channel (`private-admin`) in the admin dashboard:
  - **New Order Alert:** plays a dual-tone audio chime, pops up an amber-colored toast alert, and refreshes the Admin Orders table (prepending the new order row with a golden fade highlight animation).
  - **Order Cancellation Alert:** plays a chime, displays a soft-red warning toast, and updates the order status in the Orders table and open modal live without page refresh.
  - **Low Stock warning:** displays an amber toast if any product's stock falls below 5 items upon checkout.
- Subscribes to the public products channel (`products`) on the customer shop page to sync storefront stock counts and availability states instantly across all online visitors.
- Employs secure Form-Data token authorization endpoint at `/api/pusher/auth` validating NextAuth session ownership before channel subscription.
- Features resilient client hook connection monitoring with automatic 15-second background HTTP API polling fallback.

---

## 📋 Features Pending (Current Roadmap)

| # | Feature | Status / Priority |
|---|---------|-------------------|
| #4 | Product recommendations | 🟢 Pending |
| #5 | PromptPay / QR Code payment integration + Slip upload | 🔴 Pending |
| #6 | Performance, code quality and maintenance review | 🟢 Pending |
| #7 | Final overall quality check | 🟢 Pending |

---

## 🌿 Git Workflow (Git Flow)

| Branch | Purpose |
|--------|---------|
| `main` | 🌐 Production — hosted on Vercel. **Never push features directly here.** |
| `develop` | 🧪 Integration branch — all features branch from here and merge back here |
| `feature/*` | Individual feature work — always branched from `develop` |

**Starting a new feature:**
```bash
git checkout develop
git pull
git checkout -b feature/your-feature-name
```

**Merging back:** Open a PR targeting `develop` (not `main`).  
**Deploying:** Merge `develop → main` only when a stable version is ready.

---

## 🧑‍💻 Developer Notes

- The student prefers to **write code themselves** with step-by-step guidance rather than having everything auto-generated. Provide guidance in small, testable chunks.
- Keep explanations **short and clear** — they are learning, not a beginner.
- The project is a **university full-stack learning project** — code quality and understanding matter.
- `npm run dev` is always running during sessions.
- Test API endpoints using the **browser console** (not Postman) since Auth.js uses HTTP-only session cookies.
- **Always update `SPECS.md`** after major features or structural changes.

---

> Last updated: 2026-07-06 — Feature #3 (Real-time order tracking & Admin notifications) fully completed.
