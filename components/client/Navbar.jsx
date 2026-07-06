"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { LogOut, ShoppingBag, ShoppingCart, User, Menu, X, Home, Store, LayoutDashboard } from "lucide-react";
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
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data: cartItems } = useSWR(session ? "/api/cart" : null, fetcher, {
    revalidateOnFocus: false,
  });

  const cartCount = cartItems?.reduce((sum, item) => {
    const quantity = Number(item?.quantity);
    return sum + (Number.isFinite(quantity) && quantity > 0 ? quantity : 1);
  }, 0) ?? 0;

  // Close drawer when route changes
  const [prevPathname, setPrevPathname] = useState(pathname)
  if (pathname !== prevPathname) {
    setPrevPathname(pathname)
    setDrawerOpen(false)
  }

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  return (
    <>
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
            <span className="hidden whitespace-nowrap text-xl font-black tracking-tight text-[var(--bakery-text)] sm:inline sm:text-2xl">
              The <span className="text-amber-600">Crumbs</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
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
                    aria-label="My Profile"
                    className={[
                      "transition-all hover:shadow-md text-[var(--bakery-text-muted)]",
                      // Mobile: bare circle, no pill chrome
                      "flex items-center justify-center rounded-full ring-2 ring-amber-100 dark:ring-zinc-700 hover:ring-amber-300 dark:hover:ring-amber-700",
                      // sm+: full pill with name
                      "sm:gap-2.5 sm:border sm:border-amber-100 sm:dark:border-zinc-700 sm:bg-white sm:dark:bg-zinc-900 sm:px-1.5 sm:py-1.5 sm:pr-4 sm:hover:bg-amber-50 sm:dark:hover:bg-zinc-800 sm:ring-0 sm:hover:ring-0",
                    ].join(" ")}
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
                        <div className="flex h-full w-full items-center justify-center text-amber-600 dark:text-amber-400">
                          <User size={16} />
                        </div>
                      )}
                    </div>
                    <span className="hidden text-xs font-black sm:inline">
                      {session.user.name?.split(" ")[0]}
                    </span>
                  </Link>
                )}

                {/* Sign Out Button — desktop only */}
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
              <div className="flex items-center gap-1 sm:gap-2">
                <Link
                  href="/login"
                  className="px-2 py-2 text-xs font-black text-[var(--bakery-text-muted)] transition-colors hover:text-amber-700 sm:px-4 sm:text-sm"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="rounded-full bg-amber-600 px-4 py-2 text-xs font-black text-white shadow-lg shadow-amber-600/20 transition-all hover:bg-amber-700 active:scale-95 sm:px-6 sm:py-2.5 sm:text-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}

            <div className="ml-1 border-l border-amber-100 pl-3 dark:border-zinc-800">
              <ThemeToggle />
            </div>

            {/* Hamburger — mobile only */}
            <button
              id="mobile-menu-toggle"
              type="button"
              aria-label={drawerOpen ? "Close menu" : "Open menu"}
              onClick={() => setDrawerOpen((v) => !v)}
              className="flex items-center justify-center rounded-full p-2 text-[var(--bakery-text-muted)] transition-all hover:bg-amber-100/60 hover:text-amber-700 dark:hover:bg-zinc-800 md:hidden"
            >
              {drawerOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile Drawer ── */}
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={() => setDrawerOpen(false)}
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer panel */}
      <aside
        id="mobile-drawer"
        aria-label="Mobile navigation menu"
        className={`fixed right-0 top-0 z-50 h-full w-72 max-w-[85vw] bg-[#FFFCF2] dark:bg-zinc-950 shadow-2xl transition-transform duration-300 ease-in-out md:hidden flex flex-col ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex h-16 items-center justify-between border-b border-amber-100 dark:border-zinc-800 px-5">
          <span className="text-base font-black tracking-tight text-[var(--bakery-text)]">
            Menu
          </span>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
            className="rounded-full p-1.5 text-[var(--bakery-text-muted)] hover:bg-amber-100/60 hover:text-amber-700 dark:hover:bg-zinc-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer body */}
        <div className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">

          {/* Nav links */}
          <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-[var(--bakery-text-muted)]">
            Navigate
          </p>
          <Link
            href="/"
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all ${
              pathname === "/"
                ? "bg-amber-50 dark:bg-amber-900/20 text-amber-700"
                : "text-[var(--bakery-text-muted)] hover:bg-amber-50/60 dark:hover:bg-zinc-800 hover:text-amber-700"
            }`}
          >
            <Home size={17} />
            Home
          </Link>
          <Link
            href="/products"
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all ${
              pathname.startsWith("/products")
                ? "bg-amber-50 dark:bg-amber-900/20 text-amber-700"
                : "text-[var(--bakery-text-muted)] hover:bg-amber-50/60 dark:hover:bg-zinc-800 hover:text-amber-700"
            }`}
          >
            <Store size={17} />
            Shop
          </Link>

          {/* Authenticated user section */}
          {session && (
            <>
              <div className="my-3 border-t border-amber-100 dark:border-zinc-800" />

              {/* User info */}
              <div className="flex items-center gap-3 rounded-xl bg-amber-50/60 dark:bg-zinc-900 px-3 py-3 mb-1">
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-amber-100 dark:border-zinc-700 bg-amber-50 dark:bg-zinc-800">
                  {session.user.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      width={40}
                      height={40}
                      unoptimized
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-amber-300">
                      <User size={18} />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-[var(--bakery-text)]">
                    {session.user.name || "User"}
                  </p>
                  <p className="truncate text-[11px] text-[var(--bakery-text-muted)]">
                    {session.user.email}
                  </p>
                </div>
              </div>

              <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-[var(--bakery-text-muted)]">
                Account
              </p>

              {session.user.role === "ADMIN" ? (
                <Link
                  href="/admin/dashboard"
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all ${
                    pathname.startsWith("/admin")
                      ? "bg-amber-50 dark:bg-amber-900/20 text-amber-700"
                      : "text-[var(--bakery-text-muted)] hover:bg-amber-50/60 dark:hover:bg-zinc-800 hover:text-amber-700"
                  }`}
                >
                  <LayoutDashboard size={17} />
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/profile"
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all ${
                      pathname.startsWith("/profile")
                        ? "bg-amber-50 dark:bg-amber-900/20 text-amber-700"
                        : "text-[var(--bakery-text-muted)] hover:bg-amber-50/60 dark:hover:bg-zinc-800 hover:text-amber-700"
                    }`}
                  >
                    <User size={17} />
                    My Profile
                  </Link>
                  <Link
                    href="/orders"
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all ${
                      pathname.startsWith("/orders")
                        ? "bg-amber-50 dark:bg-amber-900/20 text-amber-700"
                        : "text-[var(--bakery-text-muted)] hover:bg-amber-50/60 dark:hover:bg-zinc-800 hover:text-amber-700"
                    }`}
                  >
                    <ShoppingBag size={17} />
                    My Orders
                  </Link>
                </>
              )}
            </>
          )}
        </div>

        {/* Drawer footer — Sign Out pinned at bottom */}
        {session && session.user.role !== "ADMIN" && (
          <div className="border-t border-amber-100 dark:border-zinc-800 p-4">
            <button
              id="mobile-signout-btn"
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-100 dark:border-rose-900/30 bg-rose-50/40 dark:bg-rose-900/10 px-4 py-3 text-sm font-black text-rose-700 dark:text-rose-400 transition-all hover:bg-rose-50 dark:hover:bg-rose-900/20 active:scale-95"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        )}

        {/* Guest footer */}
        {!session && status !== "loading" && (
          <div className="border-t border-amber-100 dark:border-zinc-800 p-4 flex flex-col gap-2">
            <Link
              href="/login"
              className="flex w-full items-center justify-center rounded-xl border border-amber-200 dark:border-zinc-700 px-4 py-2.5 text-sm font-black text-[var(--bakery-text-muted)] transition-all hover:bg-amber-50 dark:hover:bg-zinc-800"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="flex w-full items-center justify-center rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-amber-600/20 transition-all hover:bg-amber-700 active:scale-95"
            >
              Sign Up
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
