import Link from "next/link";

import CategoryFilter from "@/components/client/CategoryFilter";
import ProductGrid from "@/components/client/ProductGrid";
import db from "@/lib/db";

export const metadata = {
  title: "Products | The Crumbs",
};

export default async function ProductsPage({ searchParams }) {
  const params = await searchParams;

  const category =
    typeof params.category === "string"
      ? params.category
      : Array.isArray(params.category)
        ? params.category[0]
        : "";

  const search =
    typeof params.search === "string"
      ? params.search
      : Array.isArray(params.search)
        ? params.search[0]
        : "";

  const where = {
    isAvailable: true,
    ...(category ? { category: { slug: category } } : {}),
    ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
  };

  let products = [];
  let categories = [];

  try {
    [products, categories] = await Promise.all([
      db.product.findMany({
        where,
        include: { category: true },
        orderBy: { createdAt: "desc" },
      }),
      db.category.findMany({ orderBy: { name: "asc" } }),
    ]);
  } catch {
    products = [];
    categories = [];
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-extrabold text-[#4D321E]">Our Products</h1>

        <form className="flex flex-col gap-2 sm:flex-row" method="GET">
          <input
            name="search"
            defaultValue={search}
            placeholder="Search by product name"
            className="w-full rounded-xl border border-amber-200 bg-white px-4 py-2 text-sm text-[#4D321E] outline-none transition-colors focus:border-amber-400"
          />
          {category ? (
            <input type="hidden" name="category" value={category} />
          ) : null}
          <button
            type="submit"
            className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
          >
            Search
          </button>
          {search || category ? (
            <Link
              href="/products"
              className="rounded-xl border border-amber-200 px-4 py-2 text-center text-sm font-semibold text-[#6B4C3B] transition-colors hover:bg-amber-50"
            >
              Clear
            </Link>
          ) : null}
        </form>
      </div>

      <CategoryFilter categories={categories} />
      <ProductGrid products={products} />
    </div>
  );
}
