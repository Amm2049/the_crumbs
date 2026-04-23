import Link from "next/link";

import HeroSection from "@/components/client/HeroSection";
import ProductCard from "@/components/client/ProductCard";
import db from "@/lib/db";

export const metadata = {
  title: "The Crumbs Fresh Baked with Love",
  description:
    "Artisan cakes, breads, pastries, and cookies baked fresh daily.",
};

export default async function HomePage() {
  let featuredProducts = [];
  let categories = [];

  try {
    [featuredProducts, categories] = await Promise.all([
      db.product.findMany({
        where: { isAvailable: true },
        include: { category: true },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      db.category.findMany({ orderBy: { name: "asc" } }),
    ]);
  } catch {
    featuredProducts = [];
    categories = [];
  }

  return (
    <>
      <HeroSection />

      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-[#4D321E]">
            Browse by Category
          </h2>
          <Link
            href="/products"
            className="text-sm font-semibold text-amber-700 hover:text-amber-800"
          >
            View All
          </Link>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.length > 0 ? (
            categories.map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${category.slug}`}
                className="rounded-full border border-amber-200 bg-white px-4 py-2 text-sm font-semibold text-[#6B4C3B] transition-colors hover:border-amber-300 hover:text-amber-700"
              >
                {category.name}
              </Link>
            ))
          ) : (
            <p className="text-sm text-[#8A6D5E]">
              Categories will appear once they are added.
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-[#4D321E]">
            Fresh Today
          </h2>
          <Link
            href="/products"
            className="text-sm font-semibold text-amber-700 hover:text-amber-800"
          >
            Shop All Products
          </Link>
        </div>

        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/60 p-12 text-center">
            <p className="font-semibold text-[#6B4C3B]">
              No featured products available yet.
            </p>
          </div>
        )}
      </section>
    </>
  );
}
