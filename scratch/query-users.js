import { PrismaClient } from '../lib/generated/prisma/index.js'
import { PrismaPg } from '@prisma/adapter-pg'
import pkg from 'pg'
import 'dotenv/config'

const { Pool } = pkg
const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const db = new PrismaClient({
  adapter: new PrismaPg(pool),
})

async function main() {
  const users = await db.user.findMany()
  console.log(JSON.stringify(users, null, 2))
}

main()
  .catch(console.error)
  .finally(async () => {
    await db.$disconnect()
    await pool.end()
  })
