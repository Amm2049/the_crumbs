import Link from 'next/link'
import { MapPin, Phone, Clock, Share2, MessageCircle, Globe } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-amber-100 bg-[#FFFDF2] pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-extrabold tracking-tight text-[#4D321E]">The Crumbs</h3>
            <p className="text-sm leading-relaxed text-[#7A5D4B]">
              Artisan cakes, breads, and pastries baked fresh daily in the heart of the city. 
              We believe in honest ingredients and the simple joy of a warm treat.
            </p>
            <div className="flex gap-4 text-[#6B4C3B]">
              <Link href="#" title="Instagram" className="transition-colors hover:text-amber-600">
                <Share2 size={20} />
              </Link>
              <Link href="#" title="Facebook" className="transition-colors hover:text-amber-600">
                <MessageCircle size={20} />
              </Link>
              <Link href="#" title="Twitter" className="transition-colors hover:text-amber-600">
                <Globe size={20} />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-[#4D321E]">Shop</h4>
            <ul className="space-y-2 text-sm text-[#7A5D4B]">
              <li>
                <Link href="/products" className="transition-colors hover:text-amber-700">All Products</Link>
              </li>
              <li>
                <Link href="/products?category=breads" className="transition-colors hover:text-amber-700">Fresh Breads</Link>
              </li>
              <li>
                <Link href="/products?category=cakes" className="transition-colors hover:text-amber-700">Cakes & Desserts</Link>
              </li>
              <li>
                <Link href="/products?category=pastries" className="transition-colors hover:text-amber-700">Pastries</Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-[#4D321E]">Support</h4>
            <ul className="space-y-2 text-sm text-[#7A5D4B]">
              <li>
                <Link href="/orders" className="transition-colors hover:text-amber-700">Track Order</Link>
              </li>
              <li>
                <Link href="/cart" className="transition-colors hover:text-amber-700">Your Cart</Link>
              </li>
              <li>
                <Link href="/login" className="transition-colors hover:text-amber-700">My Account</Link>
              </li>
              <li>
                <Link href="#" className="transition-colors hover:text-amber-700">Privacy Policy</Link>
              </li>
            </ul>
          </div>

          {/* Contact & Hours */}
          <div className="space-y-4">
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-[#4D321E]">Visit Us</h4>
            <ul className="space-y-3 text-sm text-[#7A5D4B]">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="mt-0.5 shrink-0 text-amber-700" />
                <span>123 Baker Street, Flour District<br />Sugar City, SC 54321</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="shrink-0 text-amber-700" />
                <span>(555) 123-4567</span>
              </li>
              <li className="flex items-start gap-3">
                <Clock size={18} className="mt-0.5 shrink-0 text-amber-700" />
                <span>
                  Mon - Fri: 7am - 6pm<br />
                  Sat - Sun: 8am - 4pm
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 border-t border-amber-100 pt-8 text-center">
          <p className="text-xs text-[#8A6D5E]">
            &copy; {currentYear} The Crumbs Artisan Bakery. Crafted with love for pastry lovers.
          </p>
        </div>
      </div>
    </footer>
  )
}
