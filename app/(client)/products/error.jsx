"use client";

import Link from "next/link";

export default function Error({ error, reset }) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-amber-200 bg-amber-50/60 p-8">
        <h1 className="text-2xl font-extrabold text-[#4D321E]">Couldn’t load products</h1>
        <p className="mt-2 text-sm text-[#6B4C3B]">
          Please try again. If it keeps happening, go back and reload.
        </p>

        {error?.message ? (
          <p className="mt-4 rounded-xl bg-white/70 px-4 py-3 text-xs font-semibold text-[#6B4C3B]">
            {error.message}
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex rounded-xl border border-amber-200 bg-white px-5 py-2.5 text-sm font-semibold text-[#6B4C3B] transition-colors hover:bg-amber-50"
          >
            Back home
          </Link>
        </div>
      </div>
    </div>
  );
}

