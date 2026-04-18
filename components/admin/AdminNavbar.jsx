/**
 * components/admin/AdminNavbar.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Admin Top Navigation Bar  (Client Component)
 *
 * Shows the page title, current admin user name, and a sign-out button.
 *
 * HOW TO IMPLEMENT:
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * 'use client'
 *
 * import { signOut } from 'next-auth/react'
 * import { Button } from '@/components/ui/button'
 * import { LogOut } from 'lucide-react'
 *
 * // Props: user = { name, email, image }
 * export default function AdminNavbar({ user }) {
 *   return (
 *     <header className="h-16 border-b flex items-center justify-between px-6">
 *       <h1 className="font-semibold text-lg">...</h1>
 *       <div className="flex items-center gap-4">
 *         <span>{user.name}</span>
 *         <Button variant="ghost" onClick={() => signOut({ callbackUrl: '/login' })}>
 *           <LogOut size={16} />
 *           Sign Out
 *         </Button>
 *       </div>
 *     </header>
 *   )
 * }
 */
