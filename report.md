# Backend Architecture Comparison Report

This report compares the current backend implementation of **The Crumbs** with the initial logic outlined in `TASKS.md` (Phases 1–7). The current implementation has evolved significantly to prioritize **security, performance, and maintainability**.

---

## 1. Core Architecture Changes

### A. Libraries (`/lib`)

| Library | `TASKS.md` Logic | Optimized Logic |
| :--- | :--- | :--- |
| **`utils.js`** | Basic utility file. | Now contains the global `response` and `handleApiError` helpers, providing a unified response format for the entire app. |
| **`api-helper.js`** | Not present (Manual CRUD). | **New Central Hub**: Contains high-level wrappers (`handleGetAll`, `handlePost`, `handleUpdate`, `handleDelete`, `handleUpsert`, `OwnershipCheck`). This is the "brain" of the current API. |

### B. Middleware (`middleware.js`)

*   **Initial**: Handled basic route protection for `/admin` and `/cart`.
*   **Optimized**: 
    *   **Backend Authorization**: Now intercepts `/api` routes to block unauthorized or forbidden requests (like Admins trying to access Carts) before they reach the route handler.
    *   **Method-Based Security**: Automatically blocks `POST/PATCH/DELETE` on product/category routes for non-admins.
    *   **Cleaner Routes**: By handling the "logged-in" check centrally, individual routes no longer need `if (!session)` logic.

---

## 2. API Endpoint Breakdown

### 🟢 Auth & User Management
*   **`api/auth/register`**: 
    *   *Initial*: Manual bcrypt hashing and `NextResponse.json` error handling.
    *   *Optimized*: Uses centralized `handleApiError` to handle duplicate emails (P2002) and uses the `response` helper for consistent status codes.

### 🟡 Categories API
*   **`api/categories`**: 
    *   *Initial*: Repetitive manual database calls.
    *   *Optimized*: Fully transitioned to `handleGetAll` and `handlePost`.
*   **`api/categories/[id]`**:
    *   *Initial*: Manual ID checks and product count checks for deletion.
    *   *Optimized*: Uses `handleGetById`, `handleUpdate`, and `handleDelete` with a `constraints` object to safely prevent deleting categories that still have products.

### 🔴 Products API
*   **`api/products`**:
    *   *Initial*: Complex manual query building for search/filter.
    *   *Optimized*: Uses `handleGetAll` with a streamlined dynamic `where` object and automated `ProductFormat` to handle numeric types (prices).
*   **`api/products/[id]`**:
    *   *Initial*: Basic CRUD.
    *   *Optimized*: Uses `handleDelete` with order item constraints to prevent breaking historical order data.

### 🔵 Cart API (Highly Optimized)
*   **`api/cart`**:
    *   *Initial*: Basic GET/POST.
    *   *Optimized*: Uses **`handleUpsert`** for the "Add or Increment" quantity logic, significantly reducing code complexity.
*   **`api/cart/[id]`**:
    *   *Initial*: Manual ownership checks with `401 Unauthorized`.
    *   *Optimized*: Uses **`OwnershipCheck`** which returns `404 Not Found` for unauthorized users, hiding the existence of other users' cart items.

### 📦 Orders API (Most Complex)
*   **`api/orders`**:
    *   *Initial*: Basic creation.
    *   *Optimized*: Implements a **Prisma `$transaction`** where stock validation happens **inside** the atomic block. This is a critical fix for data integrity.
*   **`api/orders/[id]`**:
    *   *Initial*: Two separate DB hits (Check ownership → Fetch data).
    *   *Optimized*: Single-query optimization using the updated `OwnershipCheck` with `include` options.

---

## 3. Summary of Improvements

1.  **Security**: Moving from "Authorized vs Unauthorized" (401/403) to "Resource exists vs Resource doesn't exist" (404) for better privacy.
2.  **Stability**: Use of transactions for orders prevents inventory desync.
3.  **Scalability**: Adding a new API route now takes minutes instead of hours because 90% of the logic is handled by the `api-helper.js` library.
