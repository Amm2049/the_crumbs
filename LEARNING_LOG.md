# The Crumbs — Learning Log

### 📅 April 20, 2026

- **Client vs. Server Components:** Wrapped Auth.js `SessionProvider` in `'use client'` because Next.js 15 defaults to Server Components (which can't use React Context/hooks).
- **Prisma Fix:** Changed `provider = "prisma-client"` to `"prisma-client-js"` in `schema.prisma` and ran `npx prisma generate` to fix a Next.js compilation crash.
- **Tailwind `@apply`:** Extracted long strings of Tailwind utility classes into reusable custom classes (e.g., `.bakery-input`) inside `globals.css` using the `@apply` directive.
- **Tailwind v4 Strictness:** In Tailwind v4, the `!important` modifier must go after the state prefix: `focus:!border-red-500` (not `!focus:`).
- **Custom Fonts:** Used `next/font/google` to globally inject the `Quicksand` font to match our rounded bakery aesthetic instead of the default `Geist` font.
- **React Animations:** Used a React `useEffect` boolean (`isMounted`) to conditionally swap Tailwind coordinates (`translate-y-8` to `translate-y-0`) for a smooth page-load entrance.
- **React Hook Form:** Optimized performance by replacing traditional `onChange` state logic with `react-hook-form`'s uncontrolled `register()` and `handleSubmit()` pipeline.

### April 21, 2026

- **Responsive Client Shell:** Implemented and connected `Navbar`, `Footer`, and `(client)` layout so shared UI renders consistently across storefront pages.
- **SWR in Navbar:** Used `useSWR` for lightweight client-side cart-count fetching and kept navigation state session-aware (`login/register` vs `orders/logout`).
- **Storefront UI Expansion:** Added reusable components (`HeroSection`, `CategoryFilter`, `ProductGrid`, `ProductCard`, `AddToCartButton`, `CartItemRow`) and wired them into home/products/product-detail/cart/orders pages.
- **Admin Frame Setup:** Added admin sidebar + admin layout structure to support dashboard navigation and future phase work.
- **Prisma 7 Constructor Change:** Learned that Prisma's `engine type "client"` now requires `adapter` or `accelerateUrl`; fixed by initializing Prisma with `PrismaPg + pg Pool` in `lib/db.js`.
- **Dependency Alignment:** Added `@prisma/adapter-pg` and `pg` to match Prisma 7 runtime requirements and eliminate startup constructor errors.
- **Dev Server Process Management:** Confirmed that duplicate `next dev` processes can force port fallback; terminating the old PID restores normal startup on port `3000`.

### April 22, 2026

- **Refined Database Seeding**: Successfully implemented a high-fidelity seed script using professional **Unsplash images** and detailed metadata for all products and categories.
- **Prisma 7 Seed Configuration**: Resolved seeding issues by explicitly configuring the `seed` command in `prisma.config.ts` to use `node ./prisma/seed.js`.
- **Smart Admin Redirection**: Optimized the login flow to automatically redirect Admins to the dashboard while keeping Customers on the storefront using `window.location.href`.
- **Admin UX Toggle**: Added a "Dashboard" shortcut to the main Navbar for admins and a "View Storefront" link to the Admin Sidebar to allow seamless switching between management and shopping modes.
