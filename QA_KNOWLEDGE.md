# 🧠 The Crumbs — QA & Backend Engineering Knowledge Base

This reference guide summarizes the key backend engineering and security patterns learned and resolved during the audit of **The Crumbs** codebase.

---

## 1. Concurrency & Stock Reservation Guards (Race Conditions)
*   **The Issue:** Checking stock in memory (`if (quantity > stock)`) followed by a separate decrement update is vulnerable to race conditions. Under concurrent load, multiple users can pass the check before any decrement completes, driving inventory negative.
*   **The Fix:** Enforce limits at the database query level using atomic transactions with a concurrency filter:
    ```javascript
    const updated = await tx.product.updateMany({
        where: {
            id: item.productId,
            stock: { gte: item.quantity } // Enforces database-level constraint
        },
        data: { stock: { decrement: item.quantity } }
    });
    if (updated.count === 0) throw new Error("Out of stock");
    ```

## 2. Stripe Payment & Order Cancellation Conflicts
*   **The Issue:** There is a narrow window after a customer is charged by Stripe but before the webhook arrives where the order remains `PENDING`. If the customer cancels during this window, the stock is returned and the order is marked `CANCELLED`. When the webhook eventually arrives, it skips paid processing because the order is no longer pending—leaving the customer charged for a cancelled order.
*   **The Fix:** Retrieve PaymentIntent status directly from the Stripe API before executing cancellations. Reject cancellation if the charge has already succeeded:
    ```javascript
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (pi.status === 'succeeded') {
        return response({ error: 'Order already paid. Cancellation not possible.' }, 400);
    }
    ```

## 3. Transaction Deadlocks on Deleted Products
*   **The Issue:** Loop queries that update items during order cancellation (`tx.product.update(...)`) will throw a `RecordNotFound` error and roll back the entire transaction if an admin has deleted the product in the meantime.
*   **The Fix:** Use `updateMany` instead of `update`. `updateMany` will silently succeed (updating 0 rows) even if the product was deleted, preventing the transaction from deadlock-failing:
    ```javascript
    await tx.product.updateMany({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } }
    });
    ```

## 4. Google OAuth & Null Password Vulnerabilities
*   **The Issue:** OAuth users registered via Google have their password field set to `null` in the database. Passing `null` to `bcrypt.compare(currentPassword, user.password)` causes a server-side runtime crash (500).
*   **The Fix:** Always guard local password comparisons to verify a password hash actually exists in the user profile:
    ```javascript
    if (!user.password) {
        return response({ error: "Google OAuth accounts cannot change passwords here" }, 400);
    }
    ```

## 5. UI Interactivity During Checkout Transactions
*   **The Issue:** While an order creation `POST` request is in-flight, leaving the cart page interactive allows users to modify quantities or recommendations, causing database serialization errors and stale layout states.
*   **The Fix:** Lock the interface using a full-screen blurred loading backdrop during checkout execution to prevent concurrent actions or double-clicks.

## 6. Next.js Server Components Local API Fetching
*   **The Issue:** Having Server Components fetch data from their own local `/api/*` routes over HTTP adds network roundtrip overhead and potential cold starts.
*   **The Fix:** Query the database directly inside Server Components using the Prisma client, keeping fetches purely local to the server.
