/**
 * app/(admin)/layout.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Admin Dashboard Layout
 *
 * Wraps all /admin/* pages with a sidebar + top navbar.
 * Double-check auth here as a safety net (middleware.js is the primary guard).
 *
 * HOW TO IMPLEMENT:
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * import { auth } from '@/lib/auth'
 * import { redirect } from 'next/navigation'
 * import Sidebar from '@/components/admin/Sidebar'
 * import AdminNavbar from '@/components/admin/AdminNavbar'
 *
 * export default async function AdminLayout({ children }) {
 *   // Safety net: re-verify admin role on the server
 *   const session = await auth()
 *   if (!session || session.user.role !== 'ADMIN') redirect('/')
 *
 *   return (
 *     <div className="flex h-screen overflow-hidden">
 *       <Sidebar />
 *       <div className="flex flex-col flex-1 overflow-hidden">
 *         <AdminNavbar user={session.user} />
 *         <main className="flex-1 overflow-y-auto p-6">
 *           {children}
 *         </main>
 *       </div>
 *     </div>
 *   )
 * }
 */

export default function AdminLayout({ children }) {
  return <div>{children}</div>
}
