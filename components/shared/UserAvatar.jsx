'use client'

import { useState } from 'react'
import { User } from 'lucide-react'

export default function UserAvatar({ src, name, sizeClass = 'h-10 w-10 text-xs', className = '' }) {
  const [error, setError] = useState(false)

  const initials = name
    ? name.trim().charAt(0).toUpperCase()
    : ''

  if (src && !error) {
    return (
      <div className={`relative shrink-0 overflow-hidden rounded-full ring-2 ring-white dark:ring-zinc-700 shadow-sm ${sizeClass} ${className}`}>
        <img
          src={src}
          alt={name || 'Avatar'}
          className="h-full w-full object-cover"
          onError={() => setError(true)}
        />
      </div>
    )
  }

  return (
    <div
      className={`
        flex shrink-0 items-center justify-center rounded-full bg-amber-50 dark:bg-zinc-800 font-black
        text-amber-700 dark:text-amber-400 ring-2 ring-white dark:ring-zinc-700 shadow-sm
        ${sizeClass} ${className}
      `}
    >
      {initials || <User className="opacity-60" style={{ width: '40%', height: '40%' }} />}
    </div>
  )
}
