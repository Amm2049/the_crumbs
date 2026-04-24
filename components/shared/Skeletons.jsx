export function Skeleton({ className, ...props }) {
  return (
    <div
      className={["animate-pulse rounded-md bg-amber-100/60", className].join(" ")}
      {...props}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-3xl border border-amber-100 bg-white">
      <div className="aspect-square w-full rounded-t-3xl bg-amber-50">
        <Skeleton className="h-full w-full rounded-none rounded-t-3xl" />
      </div>
      <div className="space-y-1.5 p-5">
        <div className="flex justify-between">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-4 w-12" />
        </div>
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-full" />
      </div>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 py-8">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 grid items-center gap-10 md:grid-cols-2">
        <div className="space-y-4 text-center md:text-left">
          <Skeleton className="mx-auto md:mx-0 h-4 w-24" />
          <div className="space-y-2">
            <Skeleton className="mx-auto md:mx-0 h-10 w-full sm:h-12" />
            <Skeleton className="mx-auto md:mx-0 h-10 w-4/5 sm:h-12" />
          </div>
          <div className="mt-4 space-y-2">
            <Skeleton className="mx-auto md:mx-0 h-4 w-full max-w-md" />
            <Skeleton className="mx-auto md:mx-0 h-4 w-4/5 max-w-md" />
          </div>
          <div className="mt-8 flex flex-wrap justify-center md:justify-start gap-3">
            <Skeleton className="h-12 w-36 rounded-full" />
            <Skeleton className="h-12 w-36 rounded-full" />
          </div>
        </div>
        <div className="flex justify-center md:justify-end">
          <Skeleton className="h-64 w-64 rounded-full sm:h-80 sm:w-80 md:h-[450px] md:w-[450px]" />
        </div>
      </div>
    </section>
  );
}

export function CategoryFilterSkeleton() {
  return (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-9 w-24 rounded-full" />
      ))}
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Skeleton className="h-5 w-28" />

      <div className="mt-4 grid gap-8 lg:grid-cols-2">
        <div className="space-y-3">
          <Skeleton className="aspect-square w-full rounded-3xl" />
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square w-full rounded-xl" />
            ))}
          </div>
        </div>

        <div className="space-y-4 rounded-3xl border border-amber-100 bg-white p-6 sm:p-8">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-9 w-2/3" />
          <Skeleton className="h-8 w-32" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-4/5" />
          </div>
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-11 w-40 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function CartSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Skeleton className="mb-8 h-9 w-48" />

      <div className="grid gap-8 lg:grid-cols-[1fr_350px] items-start">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-3xl border border-amber-100 bg-white p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Skeleton className="h-20 w-20 shrink-0 rounded-2xl" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-5 w-48 max-w-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-28 rounded-xl" />
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-9 w-9 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-3xl border border-amber-100 bg-white p-6 shadow-sm">
          <Skeleton className="h-7 w-36 mb-6" />
          <div className="space-y-4">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-12" />
            </div>
            <div className="pt-4 border-t border-amber-50 flex justify-between items-center">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
          <Skeleton className="mt-8 h-12 w-full rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function OrdersSkeleton() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-4 px-4 py-8 sm:px-6 lg:px-8">
      <Skeleton className="h-9 w-48" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-amber-100 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <div className="mt-4 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
          </div>
          <div className="mt-4 border-t border-amber-100 pt-3 text-right">
            <Skeleton className="ml-auto h-3 w-12" />
            <Skeleton className="ml-auto mt-1 h-6 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function AdminDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-9 w-44" />
        <Skeleton className="mt-1 h-4 w-72" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-amber-100 bg-white p-5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-3 h-8 w-20" />
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <Skeleton className="h-7 w-40" />
        <div className="rounded-2xl border border-amber-100 bg-white p-5">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function FeaturesSkeleton() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <Skeleton className="mx-auto h-8 w-64" />
        <Skeleton className="mx-auto mt-2 h-4 w-48" />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-3xl border border-amber-100/50 bg-white p-5">
            <Skeleton className="mb-4 h-12 w-12 rounded-2xl" />
            <Skeleton className="h-6 w-32" />
            <div className="mt-2 space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function CategoryShowcaseSkeleton() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <Skeleton className="mx-auto h-9 w-64" />
        <Skeleton className="mx-auto mt-2 h-4 w-48" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-72 w-full rounded-3xl" />
        ))}
      </div>
      <div className="mt-12 flex justify-center">
        <Skeleton className="h-12 w-48 rounded-2xl" />
      </div>
    </section>
  );
}

export function FeaturedProductsSkeleton() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-60" />
        </div>
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}
