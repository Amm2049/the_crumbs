# 🥐 The Crumbs — Project Deep Dive

This document provides a detailed breakdown of every directory and key file in **The Crumbs** bakery project. Use this as a reference guide for development and onboarding.

---

## 🏗️ Core Architecture

The project is built on **Next.js 16 (App Router)**. It follows a "Monolith" structure where the frontend, backend (API), and database schema all live in one repository.

- **Frontend**: React 19 + Tailwind CSS 4 + shadcn/ui.
- **Backend**: Next.js Route Handlers (serving JSON API).
- **Database**: PostgreSQL with Prisma ORM (local) Vercel Neon (global).
- **Authentication**: NextAuth.js v5 (Beta) for session management.

---

## 📁 Directory & File Breakdown

### 📍 Root Directory
*   **`middleware.js`**: The security gatekeeper. Redirects unauthenticated users away from `/admin` and protected client routes.
*   **`package.json`**: Project dependencies and scripts (`npm run dev`, `build`, etc.).
*   **`next.config.mjs`**: Next.js configuration (Cloudinary image domains, etc.).

### 📍 `app/` (Routing & Pages)
The `app` directory uses **Route Groups** (folders in parentheses) to organize code without affecting the URL structure.

#### `app/(client)` — The Storefront
*   **`layout.jsx`**: Global storefront wrapper (Navbar, Footer, Cart Sidebar).
*   **`page.jsx`**: The Landing/Home page with Featured Products.
*   **`products/`**: Product listing and individual product detail pages.
*   **`cart/`**: Checkout and cart management page.
*   **`orders/`**: Customer order history.
*   **`profile/`**: Customer settings.

#### `app/(admin)` — The Management Dashboard
*   **`layout.jsx`**: Sidebar-based layout for the admin area.
*   **`admin/dashboard/`**: Sales charts and overview statistics.
*   **`admin/products/`**: Inventory management with **Server-side Pagination**.
*   **`admin/categories/`**: Manage bakery categories (Cakes, Cookies, etc.).
*   **`admin/orders/`**: Manage customer orders and update status (Pending -> Ready).
*   **`admin/customers/`**: View registered users and their activity.

#### `app/api/` — Backend Endpoints
*   **`api/products/`**, **`api/categories/`**: Data fetching for the storefront.
*   **`api/admin/`**: Secured endpoints for dashboard management.
*   **`api/cart/`**: Syncs the shopping cart with the database for logged-in users.
*   **`api/orders/`**: Handles order creation and status tracking.

---

## ⚡ Data Flow & SWR

We use **SWR (Stale-While-Revalidate)** for client-side data management to ensure the UI feels fast and stays in sync with the server.

### 1. Where SWR is used
*   **`useCart` hook**: This is the heart of the shopping experience. It fetches `/api/cart` and provides the `cartItems` to the entire app.
*   **`Navbar`**: Uses the cart data from SWR to show the real-time "Basket Count" badge.

### 2. Optimistic UI
To make the app feel "instant," we use **Optimistic Updates** in the cart.
*   **How it works**: When a user clicks "Add to Basket," SWR updates the local UI state *before* the server responds.
*   **Rollback**: If the server request fails (e.g., network error), SWR automatically rolls back the UI to the previous state using `rollbackOnError: true`.
*   **Location**: Found in `hooks/useCart.js` inside the `mutate` calls for `addToCart`, `updateQuantity`, and `removeItem`.

---

## 📄 Pagination Handling

The project implements a robust **Server-Side Pagination** system for large datasets (like Products and Orders).

### 1. The API Layer
The backend endpoints (`app/api/admin/products/route.js`) accept `page` and `limit` query parameters.
*   It uses Prisma's `skip` and `take` to fetch only the required chunk of data.
*   It returns the current page, total items, and `totalPages` for the UI to use.

### 2. The Frontend Layer
*   Admin pages use **URL-based pagination**.
*   When a user clicks "Next Page," the URL updates (e.g., `/admin/products?page=2`).
*   Next.js catches this change in the `searchParams` prop of the Page component, re-fetches the data on the server, and sends the new HTML to the browser.

---

## 🌟 Key Project Features Summary

-   **Artisanal Storefront**: A premium "Honey & Cream" aesthetic with interactive product cards and galleries.
-   **Live Basket**: Real-time synchronization between the local UI and the database.
-   **Admin Suite**: Full control over inventory, categories, and order status with a unified management interface.
-   **Role-Based Security**: Automatic protection for admin routes; customers can't access the dashboard.
-   **Cloudinary Integration**: Dynamic image hosting and optimization for all bakery products.
-   **Order Snapshots**: Historical orders preserve the price at the time of purchase, even if the store prices change later.

---

> [!TIP]
> **Developer Workflow:** If you need to add a new management page, copy the pattern in `app/(admin)/admin/products`. It handles server-side data fetching, pagination, and includes a reusable table component.
