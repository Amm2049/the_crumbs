import { PrismaClient } from '@/lib/generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL

if (!connectionString) {
  throw new Error('A valid database connection string (DATABASE_URL or POSTGRES_PRISMA_URL) is required to initialize Prisma.')
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