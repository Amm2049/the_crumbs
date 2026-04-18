# The Crumbs — Step-by-Step Implementation Checklist

> Follow this checklist **in order**. Each step builds on the previous one.
> Test each step before moving to the next. Never skip ahead.

**Tech Stack:** Next.js 15 · Auth.js v5 · Prisma ORM · PostgreSQL · shadcn/ui · Tailwind CSS

---

## 🔵 PHASE 1 — Foundation

> These files have no dependencies. Start here — everything else imports from them.

---

### Step 1 — `lib/db.js` · Prisma Client Singleton

**What it does:**
Creates a single shared Prisma database client that is reused across the entire app.
In Next.js development mode, files are hot-reloaded on every change, which would normally
create a new `PrismaClient` on each reload and quickly exhaust your database connection pool.
The fix is to store the client on the `global` object so it survives hot-reloads.
In production there is no hot-reloading, so a fresh client is always created.

- [ ] Implement the Prisma singleton

```js
import { PrismaClient } from '@/lib/generated/prisma'

const globalForPrisma = globalThis

const db = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}

export default db
```

> ⚠️ **Import path:** Always use `@/lib/generated/prisma` — NOT `@prisma/client`.
> This project uses a custom output path set in `schema.prisma`.

**✅ Test:** No direct test yet — verified when auth works in Step 3.

---

### Step 2 — `lib/auth.js` · Auth.js Configuration

**What it does:**
Configures the entire authentication system using Auth.js v5 (NextAuth).
Sets up a **Credentials provider** that accepts email + password login.
The `authorize()` function is the gatekeeper — it looks up the user in the DB,
compares the submitted password against the stored bcrypt hash, and returns the
user object if valid (or `null` to reject).

The **JWT callbacks** are crucial — they pass `id` and `role` through the token chain:
```
authorize() → jwt({ token, user }) → session({ session, token })
```
Without them, `session.user.id` and `session.user.role` would be `undefined`
everywhere in the app.

- [ ] Implement NextAuth with Credentials provider

```js
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import db from '@/lib/db'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const user = await db.user.findUnique({
          where: { email: credentials.email },
        })
        if (!user) return null
        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) return null
        return { id: user.id, name: user.name, email: user.email, role: user.role }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id
      session.user.role = token.role
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
})
```

**✅ Test:** No direct test yet — verified after Step 3.

---

### Step 3 — `app/api/auth/[...nextauth]/route.js` · Mount Auth Handlers

**What it does:**
This is the entry point for ALL Auth.js HTTP traffic. Auth.js handles many internal
routes automatically (sign in, sign out, session checking, CSRF tokens, etc.).
The `[...nextauth]` catch-all route file intercepts any request to `/api/auth/*`
and passes it to Auth.js's built-in handlers. This file is always just 2 lines.

- [ ] Mount Auth.js handlers

```js
import { handlers } from '@/lib/auth'
export const { GET, POST } = handlers
```

**✅ Test:** Start the dev server and visit:
```
http://localhost:3000/api/auth/providers
```
→ Should return JSON showing the `credentials` provider. If you get an error, check `lib/auth.js`.

---

### Step 4 — `middleware.js` · Route Protection

**What it does:**
Runs on every incoming request **before** the page or API handler executes.
Acts as the security layer for the entire app — decides who can go where:
- `/admin/*` → must be logged in AND have `role === 'ADMIN'`
- `/cart`, `/orders` → must be logged in (any role)
- `/login`, `/register` → redirects already-logged-in users to home (no reason to see these)

The `config.matcher` is critical — it limits which paths trigger the middleware.
Without it, middleware would run on every CSS file, image, and font request, which is wasteful and can break things.

- [ ] Implement route protection logic

```js
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { nextUrl } = req
  const session = req.auth
  const isLoggedIn = !!session
  const isAdmin = session?.user?.role === 'ADMIN'
  const path = nextUrl.pathname

  if (path.startsWith('/admin')) {
    if (!isLoggedIn) return NextResponse.redirect(new URL('/login', nextUrl))
    if (!isAdmin) return NextResponse.redirect(new URL('/', nextUrl))
  }

  if (path === '/cart' || path.startsWith('/orders')) {
    if (!isLoggedIn) return NextResponse.redirect(new URL('/login', nextUrl))
  }

  if ((path === '/login' || path === '/register') && isLoggedIn) {
    return NextResponse.redirect(new URL('/', nextUrl))
  }
})

export const config = {
  matcher: ['/admin/:path*', '/cart', '/orders/:path*', '/login', '/register'],
}
```

**✅ Test:**
- Go to `http://localhost:3000/admin/dashboard` while logged out → should redirect to `/login`
- Go to `http://localhost:3000/cart` while logged out → should redirect to `/login`

---

## 🟢 PHASE 2 — Auth API

> The register endpoint is the only custom auth route. Login is handled automatically by Auth.js.

---

### Step 5 — `app/api/auth/register/route.js` · User Registration

**What it does:**
Creates a new customer account. This is a plain POST endpoint — it validates the
input, checks there's no existing account with that email, hashes the password
with bcrypt (cost factor 10), and creates the user in the database.

**Why hash passwords?** Passwords must NEVER be stored as plain text. If the database
is ever compromised, hashed passwords cannot be reversed. bcrypt adds a random "salt"
automatically, so two identical passwords produce different hashes.

- [ ] Implement the register endpoint

```js
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import db from '@/lib/db'

export async function POST(request) {
  try {
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await db.user.create({
      data: { name, email, password: hashedPassword },
    })

    return NextResponse.json(
      { id: user.id, name: user.name, email: user.email },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

**✅ Test with Thunder Client (VS Code extension) or Postman:**
```
POST http://localhost:3000/api/auth/register
Body: { "name": "Test User", "email": "test@test.com", "password": "password123" }
→ Expect: 201 Created with user object (no password field!)

POST again with same email
→ Expect: 409 Conflict
```

---

## 🟢 PHASE 3 — Categories API

> Categories must be created BEFORE products — products require a `categoryId` foreign key.

---

### Step 6 — `app/api/categories/route.js` · List & Create Categories

**What it does:**
- `GET` — Returns all categories, sorted alphabetically. Public — no login required.
  Used in the storefront filter and admin dashboard.
- `POST` — Creates a new category. Admin only. Used in the admin categories management page.

The admin check pattern (`session.user.role !== 'ADMIN'`) is repeated in every
write endpoint. This is your authorization layer at the API level — even if someone
bypasses the UI, they can't create/edit/delete data without being an admin.

- [ ] Implement GET all + POST create

```js
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import db from '@/lib/db'

export async function GET() {
  const categories = await db.category.findMany({ orderBy: { name: 'asc' } })
  return NextResponse.json(categories)
}

export async function POST(request) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { name, slug } = await request.json()
  if (!name || !slug) {
    return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 })
  }

  const category = await db.category.create({ data: { name, slug } })
  return NextResponse.json(category, { status: 201 })
}
```

---

### Step 7 — `app/api/categories/[id]/route.js` · Single Category Operations

**What it does:**
- `GET` — Returns a single category by ID.
- `PATCH` — Updates a category's name or slug. Admin only.
- `DELETE` — Deletes a category. Admin only. Includes a safety check: refuses to
  delete a category that still has products assigned to it (would violate the
  foreign key constraint and leave orphaned products).

> ⚠️ **Next.js 15 change:** `params` is now a **Promise** and must be awaited.
> Always write `const { id } = await params` — not `params.id`.

- [ ] Implement GET one + PATCH + DELETE

```js
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import db from '@/lib/db'

export async function GET(request, { params }) {
  const { id } = await params
  const category = await db.category.findUnique({ where: { id } })
  if (!category) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(category)
}

export async function PATCH(request, { params }) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const data = await request.json()
  const category = await db.category.update({ where: { id }, data })
  return NextResponse.json(category)
}

export async function DELETE(request, { params }) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const products = await db.product.count({ where: { categoryId: id } })
  if (products > 0) {
    return NextResponse.json(
      { error: 'Cannot delete category with existing products' },
      { status: 409 }
    )
  }

  await db.category.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
```

**✅ Test:**
```
GET http://localhost:3000/api/categories
→ [] (empty until seeded in Phase 5)
```

---

## 🟢 PHASE 4 — Products API

---

### Step 8 — `app/api/products/route.js` · List & Create Products

**What it does:**
- `GET` — Lists all available products. Public. Supports optional query string filters:
  - `?categoryId=xxx` — filter by category
  - `?search=xxx` — fuzzy search by name (case-insensitive)
  Always includes the related `category` object since the UI needs the category name.
- `POST` — Creates a new product. Admin only. Requires `name`, `slug`, `price`, and `categoryId`.

- [ ] Implement GET list + POST create

```js
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import db from '@/lib/db'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const categoryId = searchParams.get('categoryId')
  const search = searchParams.get('search')

  const products = await db.product.findMany({
    where: {
      isAvailable: true,
      ...(categoryId && { categoryId }),
      ...(search && { name: { contains: search, mode: 'insensitive' } }),
    },
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(products)
}

export async function POST(request) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { name, slug, description, price, stock, images, categoryId } = await request.json()

  if (!name || !slug || !price || !categoryId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const product = await db.product.create({
    data: { name, slug, description, price, stock, images, categoryId },
  })

  return NextResponse.json(product, { status: 201 })
}
```

---

### Step 9 — `app/api/products/[id]/route.js` · Single Product Operations

**What it does:**
- `GET` — Returns a single product with its category. Public.
  Used in the product detail page (`/products/[slug]`).
- `PATCH` — Partial update of any product field. Admin only.
  Used in the admin edit product page.
- `DELETE` — Removes the product. Admin only.

- [ ] Implement GET one + PATCH + DELETE

```js
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import db from '@/lib/db'

export async function GET(request, { params }) {
  const { id } = await params
  const product = await db.product.findUnique({
    where: { id },
    include: { category: true },
  })
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(product)
}

export async function PATCH(request, { params }) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const data = await request.json()
  const product = await db.product.update({ where: { id }, data })
  return NextResponse.json(product)
}

export async function DELETE(request, { params }) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  await db.product.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
```

**✅ Test:**
```
GET http://localhost:3000/api/products
→ [] (empty until seeded)
```

---

## 🟢 PHASE 5 — Seed the Database

---

### Step 10 — `prisma/seed.js` · Populate Initial Data

**What it does:**
Populates the database with starter data so you have something to work with
during development. Creates:
- 1 admin user (for testing the admin dashboard)
- 4 product categories (Bread, Cakes, Cookies, Pastries)
- 12 products (3 per category)

Uses `upsert()` instead of `create()` so the script is idempotent — you can
run it multiple times without creating duplicates. This is important because
you may need to re-seed during development.

- [ ] Write the seed script

```js
import { PrismaClient } from '@/lib/generated/prisma'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

async function main() {
  // Admin user
  const hashedPassword = await bcrypt.hash('Admin123!', 10)
  await db.user.upsert({
    where: { email: 'admin@thecrumbs.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@thecrumbs.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  // Categories
  const categoriesData = [
    { name: 'Bread', slug: 'bread' },
    { name: 'Cakes', slug: 'cakes' },
    { name: 'Cookies', slug: 'cookies' },
    { name: 'Pastries', slug: 'pastries' },
  ]

  const categories = {}
  for (const cat of categoriesData) {
    const created = await db.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    })
    categories[cat.slug] = created.id
  }

  // 12 products across 4 categories
  const products = [
    { name: 'Sourdough Loaf',        slug: 'sourdough-loaf',        price: 8.99,  stock: 20, categoryId: categories['bread'] },
    { name: 'Whole Wheat Loaf',       slug: 'whole-wheat-loaf',       price: 6.99,  stock: 15, categoryId: categories['bread'] },
    { name: 'Baguette',               slug: 'baguette',               price: 3.99,  stock: 30, categoryId: categories['bread'] },
    { name: 'Chocolate Cake',         slug: 'chocolate-cake',         price: 24.99, stock: 10, categoryId: categories['cakes'] },
    { name: 'Vanilla Birthday Cake',  slug: 'vanilla-birthday-cake',  price: 29.99, stock: 8,  categoryId: categories['cakes'] },
    { name: 'Carrot Cake',            slug: 'carrot-cake',            price: 22.99, stock: 12, categoryId: categories['cakes'] },
    { name: 'Chocolate Chip Cookies', slug: 'chocolate-chip-cookies', price: 9.99,  stock: 50, categoryId: categories['cookies'] },
    { name: 'Oatmeal Raisin Cookies', slug: 'oatmeal-raisin-cookies', price: 8.99,  stock: 40, categoryId: categories['cookies'] },
    { name: 'Macarons Box',           slug: 'macarons-box',           price: 14.99, stock: 25, categoryId: categories['cookies'] },
    { name: 'Croissant',              slug: 'croissant',              price: 3.49,  stock: 35, categoryId: categories['pastries'] },
    { name: 'Cinnamon Roll',          slug: 'cinnamon-roll',          price: 4.99,  stock: 20, categoryId: categories['pastries'] },
    { name: 'Almond Danish',          slug: 'almond-danish',          price: 4.49,  stock: 18, categoryId: categories['pastries'] },
  ]

  for (const product of products) {
    await db.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: { ...product, description: `Fresh ${product.name} baked daily.`, images: [] },
    })
  }

  console.log('✅ Seed complete')
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
```

- [ ] Run the seed: `npx prisma db seed`

**✅ Test:**
```
GET http://localhost:3000/api/products    → 12 products
GET http://localhost:3000/api/categories → 4 categories
```

**Admin credentials (from seed):**
- Email: `admin@thecrumbs.com`
- Password: `Admin123!`

---

## 🟢 PHASE 6 — Cart API

---

### Step 11 — `app/api/cart/route.js` · View & Add to Cart

**What it does:**
- `GET` — Returns all cart items for the currently logged-in user,
  including product details (name, price, images, stock). Used to render the cart page.
- `POST` — Adds a product to the cart. The key operation here is `db.cartItem.upsert()`:
  - If the product is **not yet in the cart** → creates a new `CartItem`
  - If the product is **already in the cart** → increments the quantity
  This handles both "Add to Cart" and "Add More" in a single query using the
  `@@unique([userId, productId])` constraint defined in `schema.prisma`.

- [ ] Implement GET cart + POST add/update item

```js
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import db from '@/lib/db'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const cartItems = await db.cartItem.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        select: { id: true, name: true, price: true, images: true, stock: true, isAvailable: true },
      },
    },
  })

  return NextResponse.json(cartItems)
}

export async function POST(request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { productId, quantity } = await request.json()
  const userId = session.user.id

  const product = await db.product.findUnique({ where: { id: productId } })
  if (!product || !product.isAvailable) {
    return NextResponse.json({ error: 'Product not available' }, { status: 400 })
  }
  if (quantity > product.stock) {
    return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 })
  }

  const cartItem = await db.cartItem.upsert({
    where: { userId_productId: { userId, productId } },
    create: { userId, productId, quantity },
    update: { quantity: { increment: quantity } },
  })

  return NextResponse.json(cartItem, { status: 201 })
}
```

---

### Step 12 — `app/api/cart/[id]/route.js` · Update & Remove Cart Item

**What it does:**
- `PATCH` — Updates the quantity of a specific cart item (e.g. user changes "2" to "5").
  Always verifies that `cartItem.userId === session.user.id` before allowing the
  update — this prevents users from modifying each other's carts.
- `DELETE` — Removes a single cart item. Same ownership check applies.

- [ ] Implement PATCH quantity + DELETE item

```js
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import db from '@/lib/db'

export async function PATCH(request, { params }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { quantity } = await request.json()

  const cartItem = await db.cartItem.findUnique({ where: { id } })
  if (!cartItem || cartItem.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const updated = await db.cartItem.update({ where: { id }, data: { quantity } })
  return NextResponse.json(updated)
}

export async function DELETE(request, { params }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const cartItem = await db.cartItem.findUnique({ where: { id } })
  if (!cartItem || cartItem.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await db.cartItem.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
```

---

## 🟢 PHASE 7 — Orders API

---

### Step 13 — `app/api/orders/route.js` · List & Place Orders

**What it does:**
- `GET` — Fetches orders depending on the caller's role:
  - **Admin** → sees ALL orders from all users (with user info and items)
  - **Customer** → sees only their own orders
  Sorted newest-first. Used in both the admin orders table and the customer order history page.

- `POST` — Places a new order from the user's current cart. This is the most complex
  endpoint in the app. It uses `db.$transaction()` to run multiple DB operations as
  a single atomic unit — meaning if ANY step fails, ALL steps are automatically rolled back:
  1. Validate cart is not empty and all items are in stock
  2. Calculate the total price
  3. Create the `Order` record with nested `OrderItem` records
  4. Decrement stock for each purchased product
  5. Clear the user's cart

  This guarantees the database is never left in an inconsistent state
  (e.g. order created but cart not cleared, or stock decremented but order never saved).

- [ ] Implement GET orders + POST place order

```js
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import db from '@/lib/db'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const isAdmin = session.user.role === 'ADMIN'

  const orders = await db.order.findMany({
    where: isAdmin ? {} : { userId: session.user.id },
    include: {
      user: { select: { name: true, email: true } },
      items: { include: { product: { select: { name: true, images: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(orders)
}

export async function POST() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = session.user.id

  const cartItems = await db.cartItem.findMany({
    where: { userId },
    include: { product: true },
  })

  if (cartItems.length === 0) {
    return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
  }

  for (const item of cartItems) {
    if (!item.product.isAvailable || item.quantity > item.product.stock) {
      return NextResponse.json(
        { error: `Product "${item.product.name}" is unavailable or out of stock` },
        { status: 400 }
      )
    }
  }

  const total = cartItems.reduce(
    (sum, item) => sum + item.quantity * item.product.price.toNumber(),
    0
  )

  const order = await db.$transaction(async (tx) => {
    // 1. Create the order with all items
    const newOrder = await tx.order.create({
      data: {
        userId,
        total,
        items: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
          })),
        },
      },
    })

    // 2. Decrement stock for each product
    for (const item of cartItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      })
    }

    // 3. Clear the cart
    await tx.cartItem.deleteMany({ where: { userId } })

    return newOrder
  })

  return NextResponse.json(order, { status: 201 })
}
```

---

### Step 14 — `app/api/orders/[id]/route.js` · Single Order Operations

**What it does:**
- `GET` — Returns a single order with full details (user info + all items + product names).
  Customers can only view their own orders — if a customer tries to access another
  user's order ID, they get a 403 Forbidden response.
- `PATCH` — Updates the order status (e.g. `PENDING → PROCESSING → SHIPPED → DELIVERED`).
  Admin only. Used in the admin orders management page.

- [ ] Implement GET one + PATCH status

```js
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import db from '@/lib/db'

export async function GET(request, { params }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const order = await db.order.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true } },
      items: { include: { product: { select: { name: true, images: true } } } },
    },
  })

  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (session.user.role !== 'ADMIN' && order.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return NextResponse.json(order)
}

export async function PATCH(request, { params }) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const { status } = await request.json()
  const order = await db.order.update({ where: { id }, data: { status } })
  return NextResponse.json(order)
}
```

**✅ Test (requires seeded data + a logged-in session with items in cart):**
```
POST http://localhost:3000/api/orders → 201 with new order
GET  http://localhost:3000/api/orders → list of orders
```

---

## 🎨 PHASE 8 — Frontend: Auth Pages

> Now that all APIs work, start building the UI. Always use `'use client'` on components
> that use hooks (useState, useSession, react-hook-form, etc.).

---

### Step 15 — `components/shared/SessionProvider.jsx` + `app/layout.js`

**What it does:**
Auth.js's `useSession()` hook (used in the Navbar and other client components) requires
a `<SessionProvider>` context wrapper somewhere above it in the component tree.
However, `app/layout.js` is a **Server Component** and cannot use `'use client'` providers directly.

The solution is to create a thin wrapper component that is marked `'use client'`,
then import it inside the server layout. This is the standard Next.js pattern.

- [ ] Create `components/shared/SessionProvider.jsx`

```jsx
'use client'
import { SessionProvider } from 'next-auth/react'

export default function NextAuthProvider({ children }) {
  return <SessionProvider>{children}</SessionProvider>
}
```

- [ ] Update `app/layout.js` to wrap `{children}` with `<NextAuthProvider>`

```jsx
import NextAuthProvider from '@/components/shared/SessionProvider'

// Inside the <body>:
<NextAuthProvider>{children}</NextAuthProvider>
```

---

### Step 16 — `app/(auth)/login/page.jsx` · Login Page

**What it does:**
A form that calls `signIn('credentials', { email, password, redirectTo: '/' })`
from `next-auth/react`. Auth.js handles the session creation automatically.
The `redirectTo` option sends users to the homepage on successful login.
If login fails, Auth.js throws a `CredentialsSignin` error — catch it and
show a friendly "Invalid email or password" message.

- [ ] Implement login form with `react-hook-form` + `signIn()`

---

### Step 17 — `app/(auth)/register/page.jsx` · Register Page

**What it does:**
A form that POSTs to `/api/auth/register` (Step 5). On success, immediately
calls `signIn('credentials', ...)` to auto-login the new user — so they don't
have to fill in the login form right after registering.

- [ ] Implement register form — POST to `/api/auth/register`, then auto-login

---

## 🎨 PHASE 9 — Frontend: Layouts

---

### Step 18 — `components/client/Navbar.jsx`

**What it does:**
The top navigation bar for the storefront. Uses `useSession()` to conditionally render:
- **Logged out:** Login + Register buttons
- **Logged in:** User name, cart icon with item count, logout button

Must be a Client Component (`'use client'`) because it uses `useSession()`.

- [ ] Build Navbar using `useSession()` from `next-auth/react`

---

### Step 19 — `components/client/Footer.jsx`

**What it does:**
Simple branded footer with bakery name, tagline, and navigation links.
No interactivity needed — can be a Server Component.

- [ ] Build simple Footer component

---

### Step 20 — `app/(client)/layout.jsx`

**What it does:**
The shared layout for all storefront pages (`/`, `/products`, `/cart`, `/orders`).
Wraps the page content with `<Navbar />` at the top and `<Footer />` at the bottom.
The parentheses in `(client)` mean this folder is a Route Group — it doesn't
add any URL prefix, it just shares this layout.

- [ ] Implement with `<Navbar />` + `<main>{children}</main>` + `<Footer />`

---

### Step 21 — `components/admin/Sidebar.jsx`

**What it does:**
The admin navigation sidebar with links to Dashboard, Products, Orders, Categories,
and Customers. Highlights the active route using `usePathname()` from `next/navigation`.
Must be a Client Component for `usePathname()`.

- [ ] Build Sidebar with navigation links and active state

---

### Step 22 — `app/(admin)/layout.jsx`

**What it does:**
Layout wrapper for all admin pages (`/admin/*`). Shows the Sidebar alongside
the page content in a flex/grid layout. Can optionally re-check the session
server-side here as a second layer of protection (middleware is the first).

- [ ] Implement with `<Sidebar />` + `<main>{children}</main>`

---

## 🎨 PHASE 10 — Storefront Pages

> Build in this order — each component depends on the one above it.

| Order | File | What It Does |
|---|---|---|
| 1 | `components/client/ProductCard.jsx` | Single product card — image, name, price, Add to Cart button |
| 2 | `components/client/ProductGrid.jsx` | Renders a grid of `<ProductCard />` components |
| 3 | `components/client/HeroSection.jsx` | Large banner at the top of the homepage |
| 4 | `app/(client)/page.jsx` | Home page — fetches featured products, renders HeroSection + ProductGrid |
| 5 | `components/client/CategoryFilter.jsx` | Category pill buttons to filter products by category |
| 6 | `app/(client)/products/page.jsx` | Products listing page with CategoryFilter + ProductGrid |
| 7 | `components/client/AddToCartButton.jsx` | "Add to Cart" button that POSTs to `/api/cart` |
| 8 | `app/(client)/products/[slug]/page.jsx` | Product detail page — full description, images, AddToCartButton |
| 9 | `components/client/CartItemRow.jsx` | Single row in the cart — product info, quantity controls, remove button |
| 10 | `app/(client)/cart/page.jsx` | Cart page — list of CartItemRows + order total + Place Order button |
| 11 | `app/(client)/orders/page.jsx` | Customer order history — table of past orders with status badges |

- [ ] `components/client/ProductCard.jsx`
- [ ] `components/client/ProductGrid.jsx`
- [ ] `components/client/HeroSection.jsx`
- [ ] `app/(client)/page.jsx`
- [ ] `components/client/CategoryFilter.jsx`
- [ ] `app/(client)/products/page.jsx`
- [ ] `components/client/AddToCartButton.jsx`
- [ ] `app/(client)/products/[slug]/page.jsx`
- [ ] `components/client/CartItemRow.jsx`
- [ ] `app/(client)/cart/page.jsx`
- [ ] `app/(client)/orders/page.jsx`

---

## 🎨 PHASE 11 — Admin Dashboard

> All admin pages are server-rendered and protected by both middleware (Phase 1) and layout (Phase 9).

| Order | File | What It Does |
|---|---|---|
| 1 | `components/admin/StatsCard.jsx` | Metric card (total orders, revenue, etc.) for the dashboard |
| 2 | `components/admin/OrdersTable.jsx` | Table of orders with status badges and action buttons |
| 3 | `app/(admin)/admin/dashboard/page.jsx` | Overview dashboard — stats, recent orders |
| 4 | `components/admin/ProductsTable.jsx` | Table of all products with edit/delete buttons |
| 5 | `app/(admin)/admin/products/page.jsx` | List all products — uses ProductsTable |
| 6 | `components/admin/ProductForm.jsx` | Shared form for creating and editing products (react-hook-form) |
| 7 | `app/(admin)/admin/products/new/page.jsx` | Create new product page — uses ProductForm |
| 8 | `app/(admin)/admin/products/[id]/edit/page.jsx` | Edit product page — prefills ProductForm with existing data |
| 9 | `app/(admin)/admin/orders/page.jsx` | All orders management — update status dropdown per order |
| 10 | `app/(admin)/admin/categories/page.jsx` | Manage categories — create, rename, delete |
| 11 | `app/(admin)/admin/customers/page.jsx` | View all registered customers |

- [ ] `components/admin/StatsCard.jsx`
- [ ] `components/admin/OrdersTable.jsx`
- [ ] `app/(admin)/admin/dashboard/page.jsx`
- [ ] `components/admin/ProductsTable.jsx`
- [ ] `app/(admin)/admin/products/page.jsx`
- [ ] `components/admin/ProductForm.jsx`
- [ ] `app/(admin)/admin/products/new/page.jsx`
- [ ] `app/(admin)/admin/products/[id]/edit/page.jsx`
- [ ] `app/(admin)/admin/orders/page.jsx`
- [ ] `app/(admin)/admin/categories/page.jsx`
- [ ] `app/(admin)/admin/customers/page.jsx`

---

## 📌 Quick Reference

### All API Endpoints

| Method | URL | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create account |
| POST | `/api/auth/signin` | Public | Login (Auth.js) |
| GET | `/api/products` | Public | List products |
| POST | `/api/products` | Admin | Create product |
| GET | `/api/products/:id` | Public | Get product |
| PATCH | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Delete product |
| GET | `/api/categories` | Public | List categories |
| POST | `/api/categories` | Admin | Create category |
| PATCH | `/api/categories/:id` | Admin | Update category |
| DELETE | `/api/categories/:id` | Admin | Delete category |
| GET | `/api/cart` | User | Get my cart |
| POST | `/api/cart` | User | Add to cart |
| PATCH | `/api/cart/:id` | User | Update quantity |
| DELETE | `/api/cart/:id` | User | Remove item |
| GET | `/api/orders` | User/Admin | Get orders |
| POST | `/api/orders` | User | Place order |
| GET | `/api/orders/:id` | User/Admin | Get order |
| PATCH | `/api/orders/:id` | Admin | Update status |

### Key Gotchas

| # | Rule |
|---|---|
| 1 | Prisma import: `@/lib/generated/prisma` — NOT `@prisma/client` |
| 2 | `params` in Next.js 15 is a Promise — always `const { id } = await params` |
| 3 | `useSession()` needs `<SessionProvider>` wrapper in `app/layout.js` |
| 4 | Orders use `db.$transaction()` — all steps succeed or all rollback |
| 5 | Always verify `cartItem.userId === session.user.id` before any cart mutation |
| 6 | Never return `user.password` in any API response |
| 7 | Server Components cannot use hooks — add `'use client'` for useState, useSession, etc. |
