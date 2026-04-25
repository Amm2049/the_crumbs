'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useToast } from '@/context/ToastContext'
import { User, Mail, Save, Loader2, Camera, Sparkles, RefreshCw, Check } from 'lucide-react'

const AVATAR_STYLES = [
  { id: 'lorelei', name: 'Lorelei (Cute)', style: 'lorelei' },
]

// Expanded list of 48 seeds for a huge variety of Lorelei characters
const PRESET_SEEDS = [
  'Lily', 'Oliver', 'Coco', 'Mochi', 'Bao', 'Honey', 'Ginger', 'Berry',
  'Milo', 'Luna', 'Felix', 'Bella', 'Daisy', 'Jasper', 'Maple', 'Pippin',
  'Olive', 'Bear', 'Sunny', 'Cookie', 'Peaches', 'Blueberry', 'Noodle', 'Suji',
  'Kiki', 'Lulu', 'Toto', 'Nana', 'Piku', 'Mimi', 'Fifi', 'Zuzu',
  'Baker', 'Crumb', 'Sugar', 'Butter', 'Cream', 'Toast', 'Pastry', 'Glaze',
  'Muffin', 'Scone', 'Whisk', 'Flour', 'Cocoa', 'Tart', 'Bun', 'Donut'
]

export default function AdminProfilePage() {
  const { data: session, update: updateSession } = useSession()
  const { addToast } = useToast()

  const [name, setName] = useState(session?.user?.name || '')
  const [image, setImage] = useState(session?.user?.image || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [activeStyle, setActiveStyle] = useState('lorelei')

  const generateAvatarUrl = (style, seedValue) => {
    return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seedValue)}`
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (newPassword) {
      if (!currentPassword) {
        addToast("Please enter your current password to set a new one.", "error");
        setIsSubmitting(false);
        return;
      }
      if (newPassword.length < 8) {
        addToast("New password must be at least 8 characters.", "error");
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, image, currentPassword, newPassword }),
      })

      if (!res.ok) throw new Error('Failed to update')

      const updatedUser = await res.json()

      // Update session so Navbar reflects changes
      await updateSession({ name: updatedUser.name, image: updatedUser.image })

      setCurrentPassword('')
      setNewPassword('')

      addToast('Profile updated! ✨', 'success')
    } catch (err) {
      addToast('Error updating profile.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectStyle = (style) => {
    setActiveStyle(style)
    // Keep the current character if possible, or just stay on the same seed
  }

  const selectCharacter = (style, seed) => {
    const newUrl = generateAvatarUrl(style, seed)
    setImage(newUrl)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 animate-fade-in pb-10 sm:pb-20">
      <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 px-1">
        <h1 className="text-2xl sm:text-3xl font-black text-[var(--bakery-text)]">Account Settings</h1>
        <span className="text-[10px] sm:text-xs font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest">Admin Profile</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
        {/* Left: Form & Info */}
        <div className="lg:col-span-5 flex flex-col">
          <form onSubmit={handleUpdateProfile} className="h-full rounded-3xl border border-amber-50 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-xl shadow-amber-900/5 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex flex-col items-center gap-6">
                <div className="relative group">
                  <div className="h-24 w-24 sm:h-28 sm:w-28 overflow-hidden rounded-full border-4 border-white dark:border-zinc-800 bg-amber-50 dark:bg-zinc-800 shadow-inner ring-8 ring-amber-100/30 transition-transform duration-500 group-hover:scale-110">
                    {image ? (
                      <img src={image} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-amber-200">
                        <User size={40} />
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-amber-500 text-white shadow-lg border-4 border-white">
                    <Sparkles size={14} />
                  </div>
                </div>
                <div className="text-center space-y-1">
                  <p className="text-base sm:text-lg font-black text-[var(--bakery-text)] tracking-tight">{name || 'Your Name'}</p>
                  <p className="text-[9px] sm:text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-[0.2em] opacity-80">Profile Preview</p>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-amber-50 dark:border-zinc-800">
                <label className="block space-y-2">
                  <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--bakery-text-muted)]">
                    <User size={12} className="text-amber-500" />
                    Display Name
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-2xl border-2 border-amber-50 dark:border-zinc-800 bg-amber-50/20 dark:bg-zinc-800/50 px-4 py-3 text-sm font-bold text-[var(--bakery-text)] outline-none transition-all focus:border-amber-400 focus:bg-white dark:focus:bg-zinc-800"
                    placeholder="Enter your name"
                    required
                  />
                </label>

                <label className="block space-y-2 opacity-60">
                  <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--bakery-text-muted)]">
                    <Mail size={12} className="text-amber-500" />
                    Email Address
                  </span>
                  <input
                    type="email"
                    value={session?.user?.email || ''}
                    disabled
                    className="w-full rounded-2xl border-2 border-amber-50 dark:border-zinc-800 bg-amber-50/10 dark:bg-zinc-800/30 px-4 py-3 text-sm font-bold text-[var(--bakery-text)] outline-none"
                  />
                </label>
              </div>

              <div className="space-y-4 pt-6 border-t border-amber-50 dark:border-zinc-800">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-2 w-2 rounded-full bg-rose-500" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--bakery-text)]">Security & Password</h3>
                </div>
                
                <label className="block space-y-2">
                  <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--bakery-text-muted)]">
                    Current Password
                  </span>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full rounded-2xl border-2 border-amber-50 dark:border-zinc-800 bg-amber-50/20 dark:bg-zinc-800/50 px-4 py-3 text-sm font-bold text-[var(--bakery-text)] outline-none transition-all focus:border-rose-100 dark:focus:border-rose-900/50 focus:bg-white dark:focus:bg-zinc-800"
                    placeholder="••••••••"
                    autoComplete="off"
                  />
                </label>

                <label className="block space-y-2">
                  <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--bakery-text-muted)]">
                    New Password
                  </span>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-2xl border-2 border-amber-50 dark:border-zinc-800 bg-amber-50/20 dark:bg-zinc-800/50 px-4 py-3 text-sm font-bold text-[var(--bakery-text)] outline-none transition-all focus:border-amber-400 focus:bg-white dark:focus:bg-zinc-800"
                    placeholder="Minimum 8 characters"
                    autoComplete="new-password"
                  />
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 py-4 text-sm font-black text-white shadow-lg shadow-amber-500/30 transition-all hover:bg-amber-600 active:scale-[0.98] disabled:opacity-50 mt-8 sm:mt-6"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              Save Changes
            </button>
          </form>
        </div>

        {/* Right: Horizontal-Only Gallery */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="h-full rounded-3xl border border-amber-50 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-xl shadow-amber-900/5 flex flex-col">
            <div className="mb-6">
              <h2 className="text-xs font-black uppercase tracking-widest text-[var(--bakery-text-muted)] flex items-center gap-2">
                <Sparkles size={14} className="text-amber-500" />
                Pick a character you love
              </h2>
            </div>

            {/* The actual scrollable area */}
            <div className="flex-1 min-h-[350px] sm:min-h-0 relative group/gallery">
              <div className="absolute inset-0 flex flex-col flex-wrap gap-3 sm:gap-4 overflow-x-auto overflow-y-hidden pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden px-2">
                {PRESET_SEEDS.map((seed) => {
                  const url = generateAvatarUrl(activeStyle, seed)
                  const isSelected = image === url
                  return (
                    <button
                      key={seed}
                      type="button"
                      onClick={() => selectCharacter(activeStyle, seed)}
                      className={`
                        relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 overflow-hidden rounded-2xl border-2 transition-all p-1
                        ${isSelected
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/30 ring-4 ring-amber-100 dark:ring-amber-900/40 scale-105 z-20 shadow-lg'
                          : 'border-transparent bg-amber-50/40 dark:bg-zinc-800/50 hover:border-amber-200 dark:hover:border-amber-900/60 hover:bg-amber-50 dark:hover:bg-zinc-800 hover:scale-105'}
                      `}
                    >
                      <img src={url} alt={seed} className="h-full w-full object-cover" />
                      {isSelected && (
                        <div className="absolute top-1 right-1 bg-amber-500 text-white rounded-full p-1 shadow-md">
                          <Check size={10} strokeWidth={4} />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-amber-50 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[#B09080] dark:text-[#8A6D5E]">
                <RefreshCw size={12} className="animate-spin-slow" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">Scroll sideways to explore</span>
              </div>
              <p className="text-[9px] font-black text-[#B09080] dark:text-[#8A6D5E] uppercase tracking-[0.2em]">
                {PRESET_SEEDS.length} Lorelei Characters
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
