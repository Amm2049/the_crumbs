import { HeroSkeleton, FeaturesSkeleton, CategoryShowcaseSkeleton, FeaturedProductsSkeleton } from "@/components/shared/Skeletons";

export default function Loading() {
  return (
    <div className="space-y-4 pb-14">
      <HeroSkeleton />
      <FeaturesSkeleton />
      <CategoryShowcaseSkeleton />
      <FeaturedProductsSkeleton />
    </div>
  );
}

