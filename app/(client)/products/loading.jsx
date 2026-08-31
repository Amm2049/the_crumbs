import { ProductCardSkeleton, CategoryFilterSkeleton, Skeleton } from "@/components/shared/Skeletons";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* Header & Search Section Skeleton */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-10 w-56 rounded-xl sm:h-12" />
          <Skeleton className="h-5 w-72 rounded-lg" />
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row lg:max-w-md">
          <Skeleton className="h-12 w-full rounded-2xl" />
        </div>
      </div>

      {/* Category Filter Skeleton */}
      <CategoryFilterSkeleton />

      {/* Product Grid Skeleton */}
      <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

