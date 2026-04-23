import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto px-8 grid max-w-7xl items-center gap-10 md:grid-cols-2">
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
            Fresh Daily
          </p>
          <h1 className="text-4xl font-extrabold leading-tight text-[#4D321E] sm:text-5xl">
            Fresh bakery classics baked for your table
          </h1>
          <p className="mt-4 max-w-xl text-base text-[#7A5D4B] sm:text-lg">
            Browse cakes, breads, pastries, and cookies made in small batches
            and ready for pickup or delivery.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/products">
              <Button
                size="lg"
                className="bg-amber-500 text-white hover:bg-amber-600"
              >
                Shop Products
              </Button>
            </Link>
            <Link href="/register">
              <Button
                size="lg"
                variant="outline"
                className="border-amber-300 bg-white/70 hover:bg-amber-50"
              >
                Create Account
              </Button>
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="rounded-3xl border border-amber-200/80 bg-white/70 p-6 shadow-[0_20px_60px_rgba(217,119,6,0.15)] backdrop-blur-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">
              Featured Today
            </p>
            <ul className="mt-4 space-y-3 text-sm text-[#6B4C3B] sm:text-base">
              <li>- Brown Butter Cookies</li>
              <li>- Chocolate Ganache Cake</li>
              <li>- Sourdough Country Loaf</li>
              <li>- Cinnamon Morning Rolls</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
