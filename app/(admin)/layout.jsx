import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import Sidebar from '@/components/admin/Sidebar'
import AdminNavbar from '@/components/admin/AdminNavbar'
import { ToastProvider } from '@/context/ToastContext'
import { AdminProvider } from '@/context/AdminContext'

export default async function AdminLayout({ children }) {
  const session = await auth()

  if (!session || session.user?.role !== 'ADMIN') {
    redirect('/')
  }

  return (
    <ToastProvider>
      <AdminProvider>
        <div className="flex h-screen overflow-hidden bg-[var(--background)] text-[var(--bakery-text)] transition-colors duration-500">
          {/* Responsive Sidebar */}
          <Sidebar />

          {/* Right side content */}
          <div className="flex flex-1 flex-col overflow-hidden lg:ml-64 transition-all duration-300">
            <AdminNavbar />
            <main className="flex-1 overflow-y-auto p-4 sm:p-6">
              {children}
            </main>
          </div>
        </div>
      </AdminProvider>
    </ToastProvider>
  )
}
