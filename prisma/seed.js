/**
 * prisma/seed.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Database Seed Script
 * Run with: npx prisma db seed
 * (requires "prisma": { "seed": "node prisma/seed.js" } in package.json)
 *
 * This script creates:
 *   - 1 Admin user
 *   - 4 Product categories
 *   - 12 Sample products (3 per category)
 *
 * HOW TO IMPLEMENT:
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * STEP 1 — Imports
 *   import { PrismaClient } from '@/lib/generated/prisma'
 *   import bcrypt from 'bcryptjs'
 *
 *   NOTE: For a plain Node.js script you may need a relative import instead:
 *   import { PrismaClient } from '../lib/generated/prisma/index.js'
 *
 *   const db = new PrismaClient()
 *
 * STEP 2 — Main seed function (async)
 *   async function main() {
 *
 *     // ── Admin User ──────────────────────────────────────────────────────
 *     // Hash the password with bcrypt (saltRounds = 10 is standard)
 *     // Use db.user.upsert() so re-running the seed doesn't create duplicates
 *     // Credentials: email = 'admin@thecrumbs.com', password = 'Admin123!'
 *
 *     // ── Categories ──────────────────────────────────────────────────────
 *     // Create 4 categories using db.category.createMany()
 *     // Suggested categories: Cakes, Breads, Pastries, Cookies
 *     // Use skipDuplicates: true to avoid errors on re-run
 *     // Each category needs: name, slug, description
 *
 *     // ── Products ────────────────────────────────────────────────────────
 *     // For each category, create 3 products using db.product.createMany()
 *     // Each product needs: name, slug, description, price, stock, categoryId
 *     // Leave images as [] for now (Cloudinary links added via admin UI)
 *     // Use skipDuplicates: true
 *   }
 *
 * STEP 3 — Run and handle errors
 *   main()
 *     .catch((e) => {
 *       console.error(e)
 *       process.exit(1)
 *     })
 *     .finally(async () => {
 *       await db.$disconnect()
 *     })
 */
