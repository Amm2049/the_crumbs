"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { LogOut, ShoppingBag, ShoppingCart, User } from "lucide-react";
import { Skeleton } from "@/components/shared/Skeletons";
import useSWR from "swr";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

const fetcher = async (url) => {
  const response = await fetch(url);
  if (!response.ok) return [];
  const payload = await response.json();
  return Array.isArray(payload) ? payload : [];
};

function getNavLinkClass(pathname, href) {
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return [
    "text-sm font-bold transition-all hover:scale-105",
    isActive
      ? "text-amber-700 underline underline-offset-8 decoration-2"
      : "text-[var(--bakery-text-muted)] hover:text-amber-700",
  ].join(" ");
}

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const { data: cartItems } = useSWR(session ? "/api/cart" : null, fetcher, {
    revalidateOnFocus: false,
  });

  const cartCount = cartItems?.reduce((sum, item) => {
    const quantity = Number(item?.quantity);
    return sum + (Number.isFinite(quantity) && quantity > 0 ? quantity : 1);
  }, 0) ?? 0;

  return (
    <nav className="sticky top-0 bg-transparent z-50 dark:border-zinc-800 bg-[#FFFCF2]/95 dark:bg-zinc-950/80 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo Section */}
        <Link href="/" className="group inline-flex items-center gap-2">
          <div className="relative overflow-hidden transition-transform group-hover:rotate-12">
            <Image
              src="/the_crumbs_logo.png"
              alt="The Crumbs Logo"
              width={40}
              height={40}
              className="h-15 w-auto"
              priority
            />
          </div>
          <span className="whitespace-nowrap text-xl font-black tracking-tight text-[var(--bakery-text)] sm:text-2xl">
            The <span className="text-amber-600">Crumbs</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden items-center gap-8 md:flex">
          <Link href="/" className={getNavLinkClass(pathname, "/")}>
            Home
          </Link>
          <Link href="/products" className={getNavLinkClass(pathname, "/products")}>
            Shop
          </Link>
        </div>

        {/* User & Actions Section */}
        <div className="flex items-center gap-3 sm:gap-4">
          {status === "loading" ? (
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-20 rounded-full" />
              <Skeleton className="h-9 w-20 rounded-full" />
            </div>
          ) : session ? (
            <>
              {/* Customer Actions */}
              {session.user.role !== "ADMIN" && (
                <div className="flex items-center gap-1">
                  <Link
                    href="/cart"
                    aria-label="View Cart"
                    className="relative rounded-full p-2.5 text-[var(--bakery-text-muted)] transition-all hover:bg-amber-100/50 hover:text-amber-700 dark:hover:bg-zinc-800"
                  >
                    <ShoppingCart size={20} />
                    {cartCount > 0 && (
                      <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 animate-bounce items-center justify-center rounded-full bg-amber-600 px-1 text-[10px] font-black text-white ring-2 ring-white dark:ring-zinc-900">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    href="/orders"
                    aria-label="View Orders"
                    className="rounded-full p-2.5 text-[var(--bakery-text-muted)] transition-all hover:bg-amber-100/50 hover:text-amber-700 dark:hover:bg-zinc-800"
                  >
                    <ShoppingBag size={20} />
                  </Link>
                </div>
              )}

              {/* Admin Dashboard Link */}
              {session.user.role === "ADMIN" && (
                <Link
                  href="/admin/dashboard"
                  className="rounded-full bg-amber-700 px-4 py-1.5 text-xs font-bold text-white transition-all hover:bg-amber-800"
                >
                  Dashboard
                </Link>
              )}

              {/* Profile Link (Customers Only) */}
              {session.user.role !== "ADMIN" && (
                <Link
                  href="/profile"
                  className="flex items-center gap-2.5 rounded-full border border-amber-100 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-1.5 py-1.5 pr-4 text-[var(--bakery-text-muted)] transition-all hover:bg-amber-50 dark:hover:bg-zinc-800 hover:shadow-md"
                >
                  <div className="h-8 w-8 overflow-hidden rounded-full border-2 border-amber-50 dark:border-zinc-800 bg-amber-50 dark:bg-zinc-800">
                    {session.user.image ? (
                      <Image
                        src={session.user.image}
                        alt={session.user.name || "User"}
                        width={32}
                        height={32}
                        unoptimized
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-amber-300">
                        <User size={16} />
                      </div>
                    )}
                  </div>
                  <span className="hidden text-xs font-black sm:inline">
                    {session.user.name?.split(" ")[0]}
                  </span>
                </Link>
              )}

              {/* Sign Out Button (Customers Only) */}
              {session.user.role !== "ADMIN" && (
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="hidden items-center gap-2 rounded-full border border-rose-100 dark:border-rose-900/30 bg-rose-50/30 dark:bg-rose-900/10 px-4 py-2 text-xs font-black text-rose-700 dark:text-rose-400 transition-all hover:bg-rose-50 dark:hover:bg-rose-900/20 sm:flex"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-black text-[var(--bakery-text-muted)] transition-colors hover:text-amber-700"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-amber-600 px-6 py-2.5 text-sm font-black text-white shadow-lg shadow-amber-600/20 transition-all hover:bg-amber-700 active:scale-95"
              >
                Sign Up
              </Link>
            </div>
          )}

          <div className="ml-1 border-l border-amber-100 pl-3 dark:border-zinc-800">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
