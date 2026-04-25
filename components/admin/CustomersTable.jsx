'use client'

import { Mail, Calendar, Hash, Image as ImageIcon } from 'lucide-react'

function formatDate(value) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value))
}

export default function CustomersTable({ customers = [] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-baseline gap-2">
          <h2 className="text-xl font-black text-[var(--bakery-text)]">Registered Customers</h2>
          <span className="text-xs font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest">({customers.length} total)</span>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-amber-50 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl shadow-amber-900/5">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-amber-50/40 dark:bg-zinc-800/50 text-[10px] font-black uppercase tracking-[0.15em] text-[var(--bakery-text-muted)]">
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Contact Info</th>
                <th className="px-6 py-4">Joined Date</th>
                <th className="px-6 py-4 text-center">Total Orders</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-50 dark:divide-zinc-800">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-20 text-center text-[var(--bakery-text-muted)] font-bold">No customers found.</td>
                </tr>
              ) : (
                customers.map((user) => (
                  <tr key={user.id} className="group transition-colors hover:bg-amber-50/20 dark:hover:bg-zinc-800/30">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-amber-50 dark:bg-zinc-800 text-amber-600 dark:text-amber-400 font-black text-xs ring-2 ring-white dark:ring-zinc-700 shadow-sm">
                          {user.image ? (
                            <img src={user.image} alt={user.name} className="h-full w-full object-cover" />
                          ) : (
                            user.name?.charAt(0).toUpperCase() || '?'
                          )}
                        </div>
                        <div>
                          <p className="font-black text-[var(--bakery-text)]">{user.name || 'Anonymous'}</p>
                          <p className="text-[10px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-wider">ID: {user.id.slice(-6).toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-[var(--bakery-text-muted)]">
                        <Mail size={14} className="opacity-40" />
                        <span className="text-xs font-semibold">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-[var(--bakery-text-muted)]">
                        <Calendar size={14} className="opacity-40" />
                        <span className="text-xs font-medium">{formatDate(user.createdAt)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex h-7 min-w-[32px] items-center justify-center rounded-full bg-amber-50 dark:bg-amber-900/30 px-2 text-[11px] font-black text-amber-800 dark:text-amber-400 ring-1 ring-amber-100 dark:ring-amber-900/40">
                        {user._count?.orders ?? 0}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
