"use client";

export default function Error({ error, reset }) {
  return (
    <div className="rounded-3xl border border-amber-200 bg-amber-50/60 p-8">
      <h1 className="text-2xl font-extrabold text-[#4D321E]">Admin page failed to load</h1>
      <p className="mt-2 text-sm text-[#6B4C3B]">Please try again.</p>

      {error?.message ? (
        <p className="mt-4 rounded-xl bg-white/70 px-4 py-3 text-xs font-semibold text-[#6B4C3B]">
          {error.message}
        </p>
      ) : null}

      <div className="mt-6">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

