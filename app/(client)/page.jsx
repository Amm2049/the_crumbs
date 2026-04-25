import { Suspense } from "react";
import HeroSection from "@/components/client/HeroSection";
import Features from "@/components/client/Features";
import CategoryShowcase from "@/components/client/CategoryShowcase";
import FeaturedProducts from "@/components/client/FeaturedProducts";
import Decorations from "@/components/client/Decorations";
import { CategoryShowcaseSkeleton, FeaturedProductsSkeleton } from "@/components/shared/Skeletons";

export const metadata = {
  title: "The Crumbs | Fresh Baked with Love",
  description: "Artisan cakes, breads, pastries, and cookies baked fresh daily.",
};

export default function HomePage() {
  return (
    <div className="relative">
      <Decorations />
      <HeroSection />
      
      {/* Subtle warm background for the rest of the page content */}
      <Features />

      <Suspense fallback={<CategoryShowcaseSkeleton />}>
        <CategoryShowcase />
      </Suspense>

      <Suspense fallback={<FeaturedProductsSkeleton />}>
        <FeaturedProducts />
      </Suspense>
    </div>
  );
}
