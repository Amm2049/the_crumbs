import { HeroSkeleton, ProductCardSkeleton, FeaturesSkeleton, CategoryShowcaseSkeleton } from "@/components/shared/Skeletons";

export default function Loading() {
  return (
    <div className="space-y-4 pb-14">
      <HeroSkeleton />
      <FeaturesSkeleton />
      <CategoryShowcaseSkeleton />
      
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="h-8 w-40 animate-pulse rounded-lg bg-amber-100/70" />
          <div className="h-4 w-28 animate-pulse rounded-lg bg-amber-100/60" />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </section>
    </div>
  );
}

