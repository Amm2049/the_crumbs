import ProductCard from "@/components/client/ProductCard";
import { apiGet } from "@/lib/api-client";
import ScrollReveal from "./ScrollReveal";

export default async function RecommendedProducts() {
  let recommendedProducts = [];

  try {
    recommendedProducts = await apiGet("/api/products/recommendations", {
      searchParams: { type: "personalized", limit: 5 },
      // Cache: 'no-store' is critical here because recommendations are personalized
      // and dynamic based on user login sessions.
      cache: "no-store",
    });
  } catch (err) {
    console.error("Error loading recommended products:", err);
    recommendedProducts = [];
  }

  if (recommendedProducts.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 mb-10 sm:px-6 lg:px-8 border-t border-amber-100/50 dark:border-zinc-800/50 pt-12">
      <ScrollReveal>
        <div className="mb-10 space-y-1">
          <h2 className="text-3xl font-extrabold text-[var(--bakery-text)]">
            Recommended for You
          </h2>
          <p className="text-sm text-[var(--bakery-text-muted)]">
            Artisanal treats handpicked based on your bakery favorites
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
          {recommendedProducts.map((product, i) => (
            <div
              key={product.id}
              className="animate-fade-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
}
