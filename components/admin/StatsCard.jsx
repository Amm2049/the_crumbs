export default function StatsCard({ title, value, icon: Icon, trend }) {
  return (
    <article className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-[#7A5D4B]">{title}</p>
        {Icon ? <Icon size={18} className="text-amber-700" /> : null}
      </div>

      <p className="mt-3 text-3xl font-extrabold text-[#4D321E]">{value}</p>

      {trend ? <p className="mt-1 text-xs font-medium text-[#8A6D5E]">{trend}</p> : null}
    </article>
  )
}
