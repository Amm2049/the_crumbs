import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-amber-100 bg-[#FFFDF2] py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 text-center sm:px-6 md:flex-row md:items-center md:justify-between md:text-left lg:px-8">
        <div>
          <p className="text-base font-extrabold tracking-tight text-[#5C3A21]">The Crumbs</p>
          <p className="text-sm text-[#8A6D5E]">Fresh baked with love, every day.</p>
        </div>

        <div className="flex items-center justify-center gap-6 text-sm font-semibold text-[#6B4C3B] md:justify-start">
          <Link href="/products" className="transition-colors hover:text-amber-700">
            Shop
          </Link>
          <Link href="/orders" className="transition-colors hover:text-amber-700">
            My Orders
          </Link>
          <Link href="/cart" className="transition-colors hover:text-amber-700">
            Cart
          </Link>
        </div>

        <p className="text-xs text-[#8A6D5E]">{currentYear} The Crumbs. All rights reserved.</p>
      </div>
    </footer>
  )
}
