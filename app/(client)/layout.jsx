/**
 * app/(client)/layout.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Client Storefront Layout
 *
 * Wraps all public storefront pages with:
 *   - <Navbar />     → sticky top navigation
 *   - {children}     → page content
 *   - <Footer />     → bottom footer
 *
 * This is a Server Component by default — don't add 'use client'.
 * The Navbar/Footer components may need to be client components if they
 * use hooks (useSession, etc.).
 *
 * HOW TO IMPLEMENT:
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * import Navbar from '@/components/client/Navbar'
 * import Footer from '@/components/client/Footer'
 *
 * export default function ClientLayout({ children }) {
 *   return (
 *     <div className="min-h-screen flex flex-col">
 *       <Navbar />
 *       <main className="flex-1">
 *         {children}
 *       </main>
 *       <Footer />
 *     </div>
 *   )
 * }
 */

import Footer from '@/components/client/Footer'
import Navbar from '@/components/client/Navbar'

export default function ClientLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
