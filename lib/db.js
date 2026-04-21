import { PrismaClient } from '@/lib/generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is required to initialize Prisma.')
}

const pool =
  globalForPrisma.prismaPool ??
  new Pool({
    connectionString,
  })

const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg(pool),
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prismaPool = pool
  globalForPrisma.prisma = db
}

export default db
