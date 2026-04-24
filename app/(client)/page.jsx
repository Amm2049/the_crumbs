import { Suspense } from "react";
import HeroSection from "@/components/client/HeroSection";
import Features from "@/components/client/Features";
import CategoryShowcase from "@/components/client/CategoryShowcase";
import FeaturedProducts from "@/components/client/FeaturedProducts";
import { CategoryShowcaseSkeleton, FeaturedProductsSkeleton } from "@/components/shared/Skeletons";

export const metadata = {
  title: "The Crumbs | Fresh Baked with Love",
  description: "Artisan cakes, breads, pastries, and cookies baked fresh daily.",
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <Features />

      <Suspense fallback={<CategoryShowcaseSkeleton />}>
        <CategoryShowcase />
      </Suspense>

      <Suspense fallback={<FeaturedProductsSkeleton />}>
        <FeaturedProducts />
      </Suspense>
    </>
  );
}
