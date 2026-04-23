"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { LogOut, ShoppingCart, User } from "lucide-react";
import useSWR from "swr";

const fetcher = async (url) => {
  const response = await fetch(url);
  // Keep navbar stable even when cart API is not ready yet.
  if (!response.ok) return [];

  const payload = await response.json();
  return Array.isArray(payload) ? payload : [];
};

function getNavLinkClass(pathname, href) {
  // Root route needs an exact match; other links can match nested paths.
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return [
    "text-sm font-semibold transition-colors",
    isActive ? "text-amber-700" : "text-[#6B4C3B] hover:text-amber-700",
  ].join(" ");
}

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Only fetch cart data for authenticated users.
  const { data: cartItems } = useSWR(session ? "/api/cart" : null, fetcher, {
    revalidateOnFocus: false,
  });

  // Show total quantity, not just number of cart rows.
  const cartCount =
    cartItems?.reduce((sum, item) => {
      const quantity = Number(item?.quantity);
      return sum + (Number.isFinite(quantity) && quantity > 0 ? quantity : 1);
    }, 0) ?? 0;

  return (
    <nav className="sticky top-0 z-50 border-b border-amber-100 bg-[#FFFDF2]/95 backdrop-blur">
      <div className="mx-auto  flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center gap-1">
          <Image
            src="/the-crumbs-logo.png"
            alt="The Crumbs"
            width={420}
            height={120}
            priority
            className="h-14 w-auto sm:h-16"
          />
          <span className="whitespace-nowrap text-lg font-extrabold tracking-tight text-[#5C3A21] sm:text-xl">
            The Crumbs
          </span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <Link href="/" className={getNavLinkClass(pathname, "/")}>
            Home
          </Link>
          <Link
            href="/products"
            className={getNavLinkClass(pathname, "/products")}
          >
            Shop
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Auth-aware actions */}
          {session ? (
            <>
              <Link
                href="/cart"
                aria-label="Cart"
                className="relative rounded-full p-2 text-[#6B4C3B] hover:bg-amber-100/80 hover:text-amber-700"
              >
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </Link>

              <Link
                href="/orders"
                aria-label="My orders"
                className="rounded-full p-2 text-[#6B4C3B] hover:bg-amber-100/80 hover:text-amber-700"
              >
                <User size={20} />
              </Link>

              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="inline-flex items-center gap-1 rounded-full border border-amber-200 px-3 py-1.5 text-xs font-semibold text-[#6B4C3B] transition-colors hover:bg-amber-100/80 hover:text-amber-700 sm:text-sm"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>

              {session.user.role === "ADMIN" && (
                <Link
                  href="/admin/dashboard"
                  className="hidden items-center gap-1 rounded-full bg-amber-700 px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-amber-800 sm:inline-flex sm:text-sm"
                >
                  Dashboard
                </Link>
              )}
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full px-3 py-1.5 text-xs font-semibold text-[#6B4C3B] transition-colors hover:bg-amber-100/80 hover:text-amber-700 sm:text-sm"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-amber-600 sm:text-sm"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
