'use client'

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { Star, Clock3, ShoppingBag } from "lucide-react";
import { Skeleton } from "@/components/shared/Skeletons";

export default function HeroSection() {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50/60 to-rose-50 dark:from-zinc-900 dark:via-zinc-900/80 dark:to-zinc-950 transition-colors duration-500">
      {/* Radial warm glow — stays in-theme, adds depth */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 70% 50%, rgba(251,191,36,0.13) 0%, transparent 70%), radial-gradient(ellipse 40% 40% at 10% 20%, rgba(253,186,116,0.12) 0%, transparent 60%)",
        }}
      />

      {/* Main content */}
      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 grid items-center gap-10 md:grid-cols-2 py-16 sm:py-20 lg:py-24 text-center md:text-left">

        {/* ── Left: text ── */}
        <div className="animate-fade-up">

          {/* Pill badge */}
          <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800/50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400 mb-5 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            Fresh Daily
          </span>

          <h1 className="text-3xl font-black leading-[1.1] text-[var(--bakery-text)] sm:text-5xl lg:text-6xl">
            Artisanal{" "}
            <span className="relative inline-block text-amber-600 dark:text-amber-500">
              <span className="relative z-10">treasures</span>
              {/* Warm underline squiggle */}
              <svg
                aria-hidden="true"
                className="absolute -bottom-1.5 left-0 w-full"
                viewBox="0 0 200 12"
                preserveAspectRatio="none"
              >
                <path
                  d="M0 8 Q25 2 50 8 Q75 14 100 8 Q125 2 150 8 Q175 14 200 8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </span>{" "}
            for your table
          </h1>

          <p className="mt-6 max-w-md mx-auto md:mx-0 text-base text-[var(--bakery-text-muted)] sm:text-lg leading-relaxed">
            From golden crusts to honey-glazed delights. Our small-batch bakery
            brings the warmth of the oven straight to your home.
          </p>

          {/* CTA buttons */}
          <div className="mt-8 flex flex-wrap justify-center md:justify-start gap-3">
            <Link href="/products">
              <Button
                id="hero-shop-btn"
                size="lg"
                className="bg-amber-600 text-white hover:bg-amber-700 active:scale-95 rounded-full h-12 px-8 shadow-md shadow-amber-500/30 transition-all hover:shadow-lg"
              >
                <ShoppingBag size={18} className="mr-2" />
                Explore Shop
              </Button>
            </Link>

            {status === "loading" ? (
              <Skeleton className="h-12 w-36 rounded-full" />
            ) : (
              !isAuthenticated && (
                <Link href="/register">
                  <Button
                    id="hero-register-btn"
                    size="lg"
                    variant="outline"
                    className="border-2 border-amber-200 dark:border-zinc-700 bg-white/40 dark:bg-zinc-800/40 backdrop-blur-sm hover:bg-amber-50 dark:hover:bg-zinc-800 active:scale-95 rounded-full h-12 px-8 transition-all text-[var(--bakery-text)]"
                  >
                    Join the Club
                  </Button>
                </Link>
              )
            )}
          </div>

          {/* Social proof row */}
          <div className="mt-8 flex flex-wrap justify-center md:justify-start gap-3">
            <div className="flex items-center gap-1.5 rounded-full bg-white/80 dark:bg-zinc-800/80 border border-amber-100 dark:border-zinc-700 px-3.5 py-1.5 text-xs font-semibold text-[var(--bakery-text)] shadow-sm">
              <Star size={12} className="fill-amber-400 text-amber-400" />
              <span>4.9 Rating</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-white/80 dark:bg-zinc-800/80 border border-amber-100 dark:border-zinc-700 px-3.5 py-1.5 text-xs font-semibold text-[var(--bakery-text)] shadow-sm">
              <Clock3 size={12} className="text-amber-500" />
              <span>Same-day delivery</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-white/80 dark:bg-zinc-800/80 border border-amber-100 dark:border-zinc-700 px-3.5 py-1.5 text-xs font-semibold text-[var(--bakery-text)] shadow-sm">
              <span>🧁</span>
              <span>500+ happy customers</span>
            </div>
          </div>
        </div>

        {/* ── Right: isolated bakery image (no background) + glass badges ── */}
        <div className="relative flex items-center justify-center md:justify-end animate-zoom-in delay-300 md:flex">

          {/* Soft ambient glow */}
          <div
            aria-hidden="true"
            className="absolute inset-0 m-auto h-[400px] w-[400px] rounded-full bg-amber-100/70 blur-3xl"
          />

          {/* Bakery image — mix-blend-multiply dissolves the white bg */}
          <Image
            src="/test.png"
            alt="Artisan Bakery Selection"
            width={560}
            height={560}
            priority
            className="relative z-10 h-auto w-full max-w-[480px] mix-blend-multiply dark:mix-blend-normal dark:brightness-110"
          />


          {/* Glass badge 1 — Top Left */}
          <div className="absolute top-[10%] left-10 lg:left-15 z-20 flex items-center gap-2 rounded-2xl bg-white/60 dark:bg-zinc-800/60 backdrop-blur-md border border-white/80 dark:border-zinc-700/50 px-3 py-2 lg:px-4 lg:py-2.5 shadow-lg animate-float-around-1 transition-transform hover:scale-105 scale-90 lg:scale-100 cursor-default">
            <span className="text-base leading-none">🍯</span>
            <div>
              <p className="text-[9px] lg:text-[10px] font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-400 leading-none">Special</p>
              <p className="text-[11px] lg:text-xs font-black text-[var(--bakery-text)] leading-tight mt-0.5">Honey Glazed</p>
            </div>
          </div>

          {/* Glass badge 2 — Mid Right */}
          <div className="absolute top-[45%] right-0 lg:-right-15 z-20 flex items-center gap-2 rounded-2xl bg-white/60 dark:bg-zinc-800/60 backdrop-blur-md border border-white/80 dark:border-zinc-700/50 px-3 py-2 lg:px-4 lg:py-2.5 shadow-lg animate-float-around-2 delay-200 transition-transform hover:scale-105 scale-90 lg:scale-100 cursor-default">
            <span className="text-base leading-none">⭐</span>
            <div>
              <p className="text-[9px] lg:text-[10px] font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-400 leading-none">Rating</p>
              <p className="text-[11px] lg:text-xs font-black text-[var(--bakery-text)] leading-tight mt-0.5">4.9 / 5.0</p>
            </div>
          </div>

          {/* Glass badge 3 — Bottom Right */}
          <div className="absolute top-[80%] right-20 lg:right-10 z-20 flex items-center gap-2 rounded-2xl bg-white/60 dark:bg-zinc-800/60 backdrop-blur-md border border-white/80 dark:border-zinc-700/50 px-3 py-2 lg:px-4 lg:py-2.5 shadow-lg animate-float-around-3 delay-400 transition-transform hover:scale-105 scale-90 lg:scale-100 cursor-default">
            <span className="text-base leading-none">✨</span>
            <div>
              <p className="text-[9px] lg:text-[10px] font-semibold uppercase tracking-widest text-rose-600 dark:text-rose-400 leading-none">Craft</p>
              <p className="text-[11px] lg:text-xs font-black text-[var(--bakery-text)] leading-tight mt-0.5">Artisanal</p>
            </div>
          </div>

          {/* Glass badge 4 — Top Right */}
          <div className="absolute top-[12%] right-5 lg:-right-2 z-20 flex items-center gap-2 rounded-2xl bg-white/60 dark:bg-zinc-800/60 backdrop-blur-md border border-white/80 dark:border-zinc-700/50 px-3 py-2 lg:px-4 lg:py-2.5 shadow-lg animate-float-around-1 delay-600 transition-transform hover:scale-105 scale-90 lg:scale-100 cursor-default">
            <span className="text-base leading-none">🥖</span>
            <div>
              <p className="text-[9px] lg:text-[10px] font-semibold uppercase tracking-widest text-orange-700 dark:text-orange-400 leading-none">Baked</p>
              <p className="text-[11px] lg:text-xs font-black text-[var(--bakery-text)] leading-tight mt-0.5">Fresh Daily</p>
            </div>
          </div>

          {/* Glass badge 5 — Mid Left */}
          <div className="absolute top-[40%] -left-2 lg:-left-2 z-20 flex items-center gap-2 rounded-2xl bg-white/60 dark:bg-zinc-800/60 backdrop-blur-md border border-white/80 dark:border-zinc-700/50 px-3 py-2 lg:px-4 lg:py-2.5 shadow-lg animate-float-around-2 delay-800 transition-transform hover:scale-105 scale-90 lg:scale-100 cursor-default">
            <span className="text-base leading-none">🥐</span>
            <div>
              <p className="text-[9px] lg:text-[10px] font-semibold uppercase tracking-widest text-amber-800 dark:text-amber-400 leading-none">Process</p>
              <p className="text-[11px] lg:text-xs font-black text-[var(--bakery-text)] leading-tight mt-0.5">Handmade</p>
            </div>
          </div>

          {/* Glass badge 6 — Bottom Left */}
          <div className="absolute top-[75%] left-5 lg:left-12 z-20 flex items-center gap-2 rounded-2xl bg-white/60 dark:bg-zinc-800/60 backdrop-blur-md border border-white/80 dark:border-zinc-700/50 px-3 py-2 lg:px-4 lg:py-2.5 shadow-lg animate-float-around-3 delay-1000 transition-transform hover:scale-105 scale-90 lg:scale-100 cursor-default">
            <span className="text-base leading-none">🌿</span>
            <div>
              <p className="text-[9px] lg:text-[10px] font-semibold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 leading-none">Quality</p>
              <p className="text-[11px] lg:text-xs font-black text-[var(--bakery-text)] leading-tight mt-0.5">100% Organic</p>
            </div>
          </div>
        </div>
      </div>

      {/* Wave divider — smooth transition to the next section */}
      <div aria-hidden="true" className="relative -mb-px">
        <svg
          viewBox="0 0 1440 56"
          xmlns="http://www.w3.org/2000/svg"
          className="block w-full"
          preserveAspectRatio="none"
        >
          <path
            d="M0 28 C240 56 480 0 720 28 C960 56 1200 0 1440 28 L1440 56 L0 56 Z"
            fill="var(--background)"
            stroke="var(--background)"
            strokeWidth="40"
          />
        </svg>
      </div>
    </section>
  );
}
