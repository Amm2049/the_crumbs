/**
 * lib/db.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Prisma Client Singleton
 *
 * WHY A SINGLETON?
 *   In development, Next.js hot-reloads modules on every file change.
 *   Without this pattern, each reload creates a NEW PrismaClient instance,
 *   quickly exhausting the database connection pool.
 *   The fix: store the instance on the `global` object so it survives reloads.
 *   In production, there's no hot-reload, so we always create a fresh instance.
 *
 * NOTE — Import path:
 *   The Prisma client is generated to `lib/generated/prisma/` (see schema.prisma).
 *   Import it from '@/lib/generated/prisma', NOT from '@prisma/client'.
 *
 * HOW TO IMPLEMENT:
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * STEP 1 — Import PrismaClient
 *   import { PrismaClient } from '@/lib/generated/prisma'
 *
 * STEP 2 — Create the singleton
 *   const globalForPrisma = globalThis
 *
 *   const db = globalForPrisma.prisma ?? new PrismaClient()
 *
 *   if (process.env.NODE_ENV !== 'production') {
 *     globalForPrisma.prisma = db
 *   }
 *
 * STEP 3 — Export
 *   export default db
 *
 * USAGE (in any server-side file):
 *   import db from '@/lib/db'
 *   const products = await db.product.findMany()
 */
