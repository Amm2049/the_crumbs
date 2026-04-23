import { PrismaClient } from '../lib/generated/prisma/index.js'
import { PrismaPg } from '@prisma/adapter-pg'
import pkg from 'pg'
import 'dotenv/config'
import bcrypt from 'bcryptjs'

const { Pool } = pkg

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const db = new PrismaClient({
  adapter: new PrismaPg(pool),
})

async function main() {
  console.log('Starting refined database seed...')

  const adminPassword = await bcrypt.hash('Admin123!', 10)

  await db.user.upsert({
    where: { email: 'admin@thecrumbs.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@thecrumbs.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  })

  const categoriesData = [
    {
      name: 'Breads',
      slug: 'breads',
      description: 'Artisan loaves, crusty baguettes, and wholesome whole grains.',
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Cakes',
      slug: 'cakes',
      description: 'Handcrafted cakes made with premium ingredients for your special moments.',
      image: 'https://images.unsplash.com/photo-1535141192574-5d4897c12636?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Pastries',
      slug: 'pastries',
      description: 'Buttery, flaky French pastries baked to golden perfection.',
      image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Cookies',
      slug: 'cookies',
      description: 'Chewy, crunchy, and chocolatey delights for every sweet tooth.',
      image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=800&auto=format&fit=crop',
    },
  ]

  const categories = {}

  for (const cat of categoriesData) {
    const created = await db.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    })
    categories[cat.slug] = created.id
  }

  const products = [
    {
      name: 'Artisan Sourdough',
      slug: 'artisan-sourdough',
      price: 8.5,
      stock: 20,
      cat: 'breads',
      img: 'https://images.unsplash.com/photo-1585478259715-876a6a81fc08?q=80&w=1000&auto=format&fit=crop',
    },
    {
      name: 'French Baguette',
      slug: 'french-baguette',
      price: 4.0,
      stock: 30,
      cat: 'breads',
      img: 'https://images.unsplash.com/photo-1597079910443-60c43fc4f729?q=80&w=1000&auto=format&fit=crop',
    },
    {
      name: 'Whole Grain Loaf',
      slug: 'whole-grain-loaf',
      price: 6.5,
      stock: 15,
      cat: 'breads',
      img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1000&auto=format&fit=crop',
    },
    {
      name: 'Chocolate Ganache',
      slug: 'chocolate-ganache',
      price: 35.0,
      stock: 5,
      cat: 'cakes',
      img: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1000&auto=format&fit=crop',
    },
    {
      name: 'Red Velvet Dream',
      slug: 'red-velvet-dream',
      price: 32.0,
      stock: 8,
      cat: 'cakes',
      img: 'https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?q=80&w=1000&auto=format&fit=crop',
    },
    {
      name: 'Lemon Drizzle',
      slug: 'lemon-drizzle',
      price: 28.0,
      stock: 10,
      cat: 'cakes',
      img: 'https://images.unsplash.com/photo-1519869325930-281384150729?q=80&w=1000&auto=format&fit=crop',
    },
    {
      name: 'Butter Croissant',
      slug: 'butter-croissant',
      price: 4.5,
      stock: 40,
      cat: 'pastries',
      img: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=1000&auto=format&fit=crop',
    },
    {
      name: 'Pain au Chocolat',
      slug: 'pain-au-chocolat',
      price: 5.0,
      stock: 25,
      cat: 'pastries',
      img: 'https://images.unsplash.com/photo-1626082900201-8f5352c79a95?q=80&w=1000&auto=format&fit=crop',
    },
    {
      name: 'Almond Danish',
      slug: 'almond-danish',
      price: 5.5,
      stock: 20,
      cat: 'pastries',
      img: 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?q=80&w=1000&auto=format&fit=crop',
    },
    {
      name: 'Double Choco Chip',
      slug: 'double-choco-chip',
      price: 3.0,
      stock: 100,
      cat: 'cookies',
      img: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=1000&auto=format&fit=crop',
    },
    {
      name: 'Oatmeal Raisin',
      slug: 'oatmeal-raisin',
      price: 3.0,
      stock: 50,
      cat: 'cookies',
      img: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=1000&auto=format&fit=crop',
    },
    {
      name: 'Macaron Box',
      slug: 'macaron-box',
      price: 18.0,
      stock: 15,
      cat: 'cookies',
      img: 'https://images.unsplash.com/photo-1569864358642-9d1619702661?q=80&w=1000&auto=format&fit=crop',
    },
  ]

  for (const product of products) {
    await db.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        price: product.price,
        stock: product.stock,
        categoryId: categories[product.cat],
        images: [product.img],
        isAvailable: true,
      },
      create: {
        name: product.name,
        slug: product.slug,
        description: `Our famous ${product.name}, baked fresh every morning with the finest ingredients.`,
        price: product.price,
        stock: product.stock,
        categoryId: categories[product.cat],
        images: [product.img],
        isAvailable: true,
      },
    })
  }

  console.log('Seed complete with storefront sample data.')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
    await pool.end()
  })
