"use client";

import Link from "next/link";

export default function Error({ error, reset }) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-14 text-center sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-[#4D321E]">Couldn’t load your orders</h1>
      <p className="mt-3 text-[#7A5D4B]">Please try again in a moment.</p>

      {error?.message ? (
        <p className="mx-auto mt-4 max-w-xl rounded-xl bg-amber-50 px-4 py-3 text-xs font-semibold text-[#6B4C3B]">
          {error.message}
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
        >
          Try again
        </button>
        <Link
          href="/products"
          className="inline-flex rounded-xl border border-amber-200 bg-white px-5 py-2.5 text-sm font-semibold text-[#6B4C3B] transition-colors hover:bg-amber-50"
        >
          Shop products
        </Link>
      </div>
    </div>
  );
}

