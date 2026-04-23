import 'dotenv/config'
import db from '../lib/db.js'
import bcrypt from 'bcryptjs'

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
  