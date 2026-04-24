'use client'

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

export default function HeroSection() {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 py-8">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 grid items-center gap-10 md:grid-cols-2 text-center md:text-left">
        <div className="animate-fade-up">
          <p className="mb-3 ml-1 text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
            Fresh Daily
          </p>
          <h1 className="text-4xl font-black leading-tight text-[#4D321E] sm:text-5xl lg:text-6xl">
            Fresh bakery classics baked for your table
          </h1>
          <p className="mt-4 max-w-xl mx-auto md:mx-0 text-base text-[#7A5D4B] sm:text-lg">
            Browse cakes, breads, pastries, and cookies made in small batches
            and ready for pickup or delivery.
          </p>

          <div className="mt-8 flex flex-wrap justify-center md:justify-start gap-3">
            <Link href="/products">
              <Button
                size="lg"
                className="bg-amber-500 text-white hover:bg-amber-600 rounded-full h-12 px-8"
              >
                Shop Products
              </Button>
            </Link>

            {!isAuthenticated && (
              <Link href="/register">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-amber-300 bg-white/70 hover:bg-amber-50 rounded-full h-12 px-8"
                >
                  Create Account
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div className="relative flex justify-center md:justify-end leading-none animate-zoom-in delay-500">
          <Image
            src="/hero_honey_pastries_1777019767557.png"
            alt="Signature Honey Pastries"
            width={600}
            height={600}
            priority
            className="h-auto w-full max-w-[450px] mix-blend-multiply"
          />
        </div>
      </div>
    </section>
  );
}
