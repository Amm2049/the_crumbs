export default function StatsCard({ title, value, icon: Icon, trend }) {
  return (
    <article className="group relative overflow-hidden rounded-3xl border border-amber-50 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xl shadow-amber-900/5 transition-all hover:border-amber-200 dark:hover:border-zinc-700">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--bakery-text-muted)]">{title}</p>
          <p className="mt-1 text-3xl font-black text-[var(--bakery-text)]">{value}</p>
        </div>
        
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 dark:bg-zinc-800 text-amber-600 dark:text-amber-500 transition-colors group-hover:bg-amber-500 dark:group-hover:bg-amber-600 group-hover:text-white">
          {Icon && <Icon size={24} />}
        </div>
      </div>

      {trend && (
        <p className="mt-4 flex items-center gap-1.5 text-[10px] font-bold text-amber-700 dark:text-amber-500">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30 text-[8px]">↑</span>
          {trend}
        </p>
      )}

      {/* Decorative background circle */}
      <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-amber-50/30 dark:bg-amber-900/10 transition-transform group-hover:scale-110" />
    </article>
  )
}
