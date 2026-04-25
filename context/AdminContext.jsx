'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

const AdminContext = createContext({
  isSidebarOpen: false,
  setSidebarOpen: () => {},
  toggleSidebar: () => {},
})

export function AdminProvider({ children }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  // Close sidebar automatically when navigating on mobile
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  const toggleSidebar = () => setSidebarOpen((prev) => !prev)

  return (
    <AdminContext.Provider value={{ isSidebarOpen, setSidebarOpen, toggleSidebar }}>
      {children}
    </AdminContext.Provider>
  )
}

export const useAdmin = () => useContext(AdminContext)
