# 🥐 The Crumbs — Feature Roadmap

Check off what you want to build next. Features are grouped by priority.

---

## 🔴 High Priority — Core Usability

- [x] **#1 — Order Cancellation by Customer** ✅ Done
  - Cancel button shown in Order Detail Modal, only for `PENDING` orders
  - Ownership verified server-side before allowing cancellation
  - Restores product stock via DB transaction on cancellation

- [x] **#2 — Customer Order Detail Page** ✅ Done
  - Clicking any order card opens `OrderDetailModal` with full receipt
  - Shows all items, quantities, price per item, and line totals
  - Status badge displayed — timeline visualization can be added later

- [ ] **#3 — Email Notifications (Resend)**
  - Order confirmation email sent to customer on checkout
  - Status update email when admin changes order status (e.g. "Your order is Ready!")

- [x] **#4 — Checkout Delivery Address / Notes** ✅ Done
  - Required delivery address text input added to cart/checkout page (inline error if empty)
  - Optional special instructions textarea for notes like "ring bell", "leave at door"
  - `Order.address` + `Order.notes` added via DB migration (`20260630102115`)
  - Address + notes displayed in both admin `OrderModal` and customer `OrderDetailModal`

- [ ] **#5 — Product Search Bar on Storefront**
  - Search input in the shop/products page
  - Calls existing `?search=` query param on the products API
  - Debounced input — no button needed

---

## 🟡 Medium Priority — Better UX

- [ ] **#6 — Product Reviews & Ratings**
  - Customers can leave a star rating + comment on products they've ordered
  - Average rating shown on product cards and detail page
  - New DB models: `Review` (userId, productId, rating, comment)

- [ ] **#7 — Wishlist / Favorites**
  - Heart icon on product cards to save for later
  - Dedicated wishlist page under customer profile
  - New DB model: `Wishlist` (userId, productId)

- [ ] **#8 — Discount / Coupon Codes**
  - Admin creates coupon codes (% off or flat amount, expiry date)
  - Customer enters code at checkout, total is recalculated
  - New DB model: `Coupon` (code, type, value, expiresAt, usageLimit)

- [ ] **#9 — Admin Analytics Charts**
  - Revenue over time (line chart)
  - Top 5 best-selling products (bar chart)
  - Orders by status breakdown (pie/donut chart)
  - Uses `recharts` library

- [ ] **#10 — Low Stock Alerts in Admin**
  - Products with `stock < 5` are highlighted with a warning badge
  - Summary card on dashboard: "X products low on stock"

---

## 🟢 Nice to Have — Polish & Completeness

- [ ] **#11 — Real-time Order Status for Customer**
  - Status timeline displayed visually on the order detail page
  - Auto-refreshes using polling or SWR revalidation

- [ ] **#12 — Product Recommendations**
  - "You might also like…" section on product detail page
  - Shows other products from the same category

- [ ] **#13 — Sitewide Announcement Banner**
  - Admin sets a message (e.g. "Free delivery today!" or "Closed Monday")
  - Displayed at the top of the storefront
  - New DB model: `Announcement` (message, isActive)

- [ ] **#14 — Customer Profile Editing**
  - Edit name, phone number, and avatar from the profile page
  - Avatar uploaded to Cloudinary (same flow as product images)

- [ ] **#15 — PWA Support**
  - Add `manifest.json` and app icons
  - Users can "Add to Home Screen" on mobile
  - Works offline for browsing (cached pages)

---

> Pick any feature above and tell me — I'll implement it end-to-end.
