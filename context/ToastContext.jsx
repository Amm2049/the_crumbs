'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const addToast = useCallback((message, type = 'info') => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, message, type }])

    // Auto-remove after 4 seconds
    setTimeout(() => {
      removeToast(id)
    }, 4000)
  }, [removeToast])

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      
      {/* Toast Container */}
      <div 
        role="region" 
        aria-live="polite" 
        aria-label="Notifications"
        className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`
              pointer-events-auto flex items-center gap-3 min-w-[300px] max-w-md p-4 rounded-2xl shadow-2xl border backdrop-blur-md
              animate-fade-up transition-all duration-300
              ${toast.type === 'error' ? 'bg-red-50/90 dark:bg-red-950/90 border-red-200 dark:border-red-900/50 text-red-800 dark:text-red-200' : 
                toast.type === 'success' ? 'bg-emerald-50/90 dark:bg-emerald-950/90 border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-200' : 
                'bg-amber-50/90 dark:bg-zinc-900/90 border-amber-200 dark:border-zinc-800 text-amber-900 dark:text-amber-100'}
            `}
          >
            <div className="shrink-0" aria-hidden="true">
              {toast.type === 'error' && <AlertCircle size={20} className="text-red-500" />}
              {toast.type === 'success' && <CheckCircle size={20} className="text-emerald-500" />}
              {toast.type === 'info' && <Info size={20} className="text-amber-600" />}
            </div>
            
            <p className="flex-1 text-sm font-medium leading-tight">
              {toast.message}
            </p>

            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              aria-label="Close notification"
              className="shrink-0 rounded-full p-1 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              <X size={16} className="opacity-50" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context
}
