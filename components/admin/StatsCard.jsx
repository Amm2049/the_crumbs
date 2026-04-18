/**
 * components/admin/StatsCard.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Reusable Stats Card for the Admin Dashboard
 *
 * HOW TO IMPLEMENT:
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * // Props: title (string), value (string | number), icon? (Lucide icon), trend? (string)
 * export default function StatsCard({ title, value, icon: Icon, trend }) {
 *   return (
 *     <div className="rounded-lg border bg-card p-6 ...">
 *       <div className="flex justify-between items-start">
 *         <p className="text-sm text-muted-foreground">{title}</p>
 *         {Icon && <Icon size={20} className="text-muted-foreground" />}
 *       </div>
 *       <p className="text-3xl font-bold mt-2">{value}</p>
 *       {trend && <p className="text-xs text-muted-foreground mt-1">{trend}</p>}
 *     </div>
 *   )
 * }
 */
