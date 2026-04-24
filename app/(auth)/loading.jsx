export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFFdf2] relative overflow-hidden p-6 transition-colors duration-1000">
      <div className="absolute top-10 left-10 h-28 w-28 rounded-full bg-amber-300 opacity-40 blur-xl" />
      <div className="absolute top-0 right-20 h-32 w-32 rounded-full bg-yellow-200 opacity-50 blur-xl" />
      <div className="absolute -bottom-8 left-40 h-28 w-28 rounded-full bg-orange-200 opacity-40 blur-xl" />

      <div className="w-full max-w-md rounded-[2.5rem] border border-white/50 bg-white p-10 shadow-[0_8px_30px_rgb(251,191,36,0.15)] backdrop-blur-sm">
        <div className="space-y-3 text-center">
          <div className="mx-auto h-8 w-52 rounded-2xl bg-amber-100/70" />
          <div className="mx-auto h-4 w-64 max-w-full rounded bg-amber-100/60" />
        </div>

        <div className="mt-10 space-y-5">
          <div className="h-12 w-full rounded-2xl bg-amber-100/50" />
          <div className="h-12 w-full rounded-2xl bg-amber-100/50" />
          <div className="h-12 w-full rounded-2xl bg-amber-100/60" />
        </div>

        <div className="mt-8 h-4 w-40 rounded bg-amber-100/50" />
      </div>
    </div>
  );
}

