import { PrismaClient } from '../lib/generated/prisma/index.js';
import { PrismaPg } from '@prisma/adapter-pg';
import pkg from 'pg';
const { Pool } = pkg;

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  try {
    const users = await prisma.user.findMany({
      select: { email: true, role: true, name: true }
    });
    console.log('--- Available Users for Testing ---');
    console.log(users);
  } catch (error) {
    console.error('Failed to fetch users:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
