import Link from "next/link";
import ProductCard from "@/components/client/ProductCard";
import { apiGet } from "@/lib/api-client";
import ScrollReveal from "./ScrollReveal";

export default async function FeaturedProducts() {
  let featuredProducts = [];

  try {
    featuredProducts = await apiGet("/api/products", {
      searchParams: { take: 4 },
      next: { revalidate: 60 },
    });
  } catch {
    featuredProducts = [];
  }

  if (featuredProducts.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 mb-10 sm:px-6 lg:px-8">
      <ScrollReveal>
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-3xl font-extrabold text-[#4D321E]">
              Fresh Today
            </h2>
            <p className="text-sm text-[#7A5D4B]">Our best sellers, baked just hours ago</p>
          </div>
          <Link
            href="/products"
            className="text-sm font-semibold text-amber-700 hover:text-amber-800 whitespace-nowrap"
          >
            Shop All Products
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {featuredProducts.map((product, i) => (
            <div key={product.id} className={`animate-fade-up`} style={{ animationDelay: `${i * 100}ms` }}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
}
