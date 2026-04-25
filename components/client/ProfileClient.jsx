"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { User, Mail, Save, Camera, Loader2, ShieldCheck, ShoppingBag, Sparkles, RefreshCw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/context/ToastContext";
import Image from "next/image";

const AVATAR_STYLES = [
  { id: 'lorelei', name: 'Lorelei (Cute)', style: 'lorelei' },
];

const PRESET_SEEDS = [
  'Lily', 'Oliver', 'Coco', 'Mochi', 'Bao', 'Honey', 'Ginger', 'Berry',
  'Milo', 'Luna', 'Felix', 'Bella', 'Daisy', 'Jasper', 'Maple', 'Pippin',
  'Olive', 'Bear', 'Sunny', 'Cookie', 'Peaches', 'Blueberry', 'Noodle', 'Suji',
  'Kiki', 'Lulu', 'Toto', 'Nana', 'Piku', 'Mimi', 'Fifi', 'Zuzu',
  'Baker', 'Crumb', 'Sugar', 'Butter', 'Cream', 'Toast', 'Pastry', 'Glaze',
  'Muffin', 'Scone', 'Whisk', 'Flour', 'Cocoa', 'Tart', 'Bun', 'Donut'
];

export default function ProfileClient({ session: initialSession }) {
  const { data: session, update } = useSession();
  const { addToast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [formData, setFormData] = useState({
    name: session?.user?.name || initialSession?.user?.name || "",
    email: session?.user?.email || initialSession?.user?.email || "",
    image: session?.user?.image || initialSession?.user?.image || "",
    currentPassword: "",
    newPassword: "",
  });

  const generateAvatarUrl = (style, seedValue) => {
    return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seedValue)}`;
  };

  const selectCharacter = (style, seed) => {
    const newUrl = generateAvatarUrl(style, seed);
    setFormData(prev => ({ ...prev, image: newUrl }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (formData.newPassword) {
      if (!formData.currentPassword) {
        addToast("Please enter your current password to set a new one.", "error");
        setLoading(false);
        return;
      }
      if (formData.newPassword.length < 8) {
        addToast("New password must be at least 8 characters.", "error");
        setLoading(false);
        return;
      }
    }

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          image: formData.image,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      const updatedUser = await res.json();
      
      // Update the next-auth session
      await update({
        ...session,
        user: {
          ...session?.user,
          name: updatedUser.name,
          image: updatedUser.image,
        },
      });

      // Clear password fields on success
      setFormData(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
      }));
      setShowAvatarPicker(false);

      addToast("Profile updated successfully! 🍯", "success");
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header section */}
      <div className="mb-10 text-center sm:text-left">
        <h1 className="text-3xl font-black tracking-tight text-[var(--bakery-text)] sm:text-4xl">
          My <span className="text-amber-600 dark:text-amber-500">Profile</span>
        </h1>
        <p className="mt-2 text-base text-[var(--bakery-text-muted)]">
          Personalize your character and keep your security up to date.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[340px_minmax(0,1fr)]">
        {/* Sidebar/Info Card */}
        <div className="space-y-6">
          <div className="overflow-hidden rounded-[2.5rem] border border-amber-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 shadow-sm shadow-amber-900/5">
            <div className="flex flex-col items-center text-center">
              <div className="relative group mb-5">
                <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-amber-50 dark:border-zinc-800 bg-amber-50 dark:bg-zinc-800 shadow-inner transition-transform group-hover:scale-105">
                  {formData.image ? (
                    <img
                      src={formData.image}
                      alt={formData.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-amber-200">
                      <User size={64} />
                    </div>
                  )}
                </div>
                <button 
                   type="button"
                   className="absolute bottom-1 right-1 rounded-full bg-amber-600 p-2.5 text-white shadow-md transition-all hover:scale-110 hover:bg-amber-700 active:scale-95"
                   onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                   title="Pick an Avatar"
                >
                  <Sparkles size={16} />
                </button>
              </div>
              
              <h2 className="text-xl font-black text-[var(--bakery-text)]">{formData.name || "Bakery Friend"}</h2>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400 mt-1">
                {session?.user?.role || "Customer"}
              </p>
              
              <div className="mt-8 w-full border-t border-amber-50 dark:border-zinc-800 pt-8 space-y-4">
                <div className="flex items-center justify-between text-left">
                  <div className="flex items-center gap-2.5 text-[var(--bakery-text-muted)]">
                    <div className="rounded-full bg-amber-50 dark:bg-amber-900/20 p-1.5">
                      <ShoppingBag size={14} className="text-amber-500" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider">Member Since</span>
                  </div>
                  <span className="text-[11px] font-black text-[var(--bakery-text)]">April 2026</span>
                </div>
                <div className="flex items-center justify-between text-left">
                  <div className="flex items-center gap-2.5 text-[var(--bakery-text-muted)]">
                    <div className="rounded-full bg-emerald-50 dark:bg-emerald-900/20 p-1.5">
                      <ShieldCheck size={14} className="text-emerald-500" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider">Account</span>
                  </div>
                  <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400">Verified</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="rounded-[2rem] border border-amber-200/50 dark:border-amber-900/30 bg-amber-50/50 dark:bg-amber-900/10 p-7 shadow-sm">
             <div className="flex items-center gap-2 mb-3">
               <span className="text-xl">🍯</span>
               <h3 className="text-xs font-black uppercase tracking-widest text-amber-800 dark:text-amber-500 opacity-80">Sweet Rewards</h3>
             </div>
             <p className="text-[13px] font-bold leading-relaxed text-[var(--bakery-text)]">
               You have <span className="text-lg text-amber-700 dark:text-amber-400">450</span> Crumbs points! You're just 50 points away from a <span className="underline decoration-amber-200 dark:decoration-amber-900 underline-offset-4">free croissant</span>.
             </p>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="flex min-w-0 flex-col gap-8">
          {/* Avatar Picker Section - Shows when toggled */}
          {showAvatarPicker && (
            <div className="w-full animate-fade-up overflow-hidden rounded-[2.5rem] border border-amber-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 shadow-xl shadow-amber-900/5">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--bakery-text)] flex items-center gap-2">
                  <Sparkles size={14} className="text-amber-500" />
                  Pick your bakery character
                </h3>
                <button 
                  onClick={() => setShowAvatarPicker(false)}
                  className="text-[10px] font-black uppercase tracking-widest text-amber-600 hover:text-amber-700"
                >
                  Close
                </button>
              </div>
              
              <div className="flex gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {PRESET_SEEDS.map((seed) => {
                  const url = generateAvatarUrl('lorelei', seed);
                  const isSelected = formData.image === url;
                  return (
                    <button
                      key={seed}
                      type="button"
                      onClick={() => selectCharacter('lorelei', seed)}
                      className={`
                        relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl border-2 transition-all p-1
                        ${isSelected
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/40 ring-4 ring-amber-100 dark:ring-amber-900/20 scale-105 z-10 shadow-lg'
                          : 'border-transparent bg-amber-50/40 dark:bg-zinc-800/40 hover:border-amber-200 dark:hover:border-zinc-700 hover:bg-amber-50 dark:hover:bg-zinc-800 hover:scale-105'}
                      `}
                    >
                      <img src={url} alt={seed} className="h-full w-full object-cover" />
                      {isSelected && (
                        <div className="absolute top-1 right-1 bg-amber-500 text-white rounded-full p-1 shadow-md">
                          <Check size={10} strokeWidth={4} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 flex items-center gap-2 text-[#B09080]">
                <RefreshCw size={12} className="animate-spin-slow" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">Scroll sideways to explore all {PRESET_SEEDS.length} characters</span>
              </div>
            </div>
          )}

          <div className="rounded-[2.5rem] border border-amber-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 shadow-xl shadow-amber-900/5 sm:p-10">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Basic Info Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-amber-50 dark:border-zinc-800 pb-4">
                  <div className="h-2 w-2 rounded-full bg-amber-500" />
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--bakery-text)]">General Information</h3>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--bakery-text-muted)] ml-1">Full Name</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500">
                        <User size={18} />
                      </div>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Your name"
                        className="w-full rounded-2xl border-2 border-amber-50 dark:border-zinc-800 bg-amber-50/20 dark:bg-zinc-950 py-4 pl-12 pr-4 text-sm font-bold text-[var(--bakery-text)] outline-none transition-all focus:border-amber-200 focus:bg-white dark:focus:bg-zinc-800 focus:ring-8 focus:ring-amber-50/50 dark:focus:ring-amber-900/10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--bakery-text-muted)] ml-1">Email Address</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-300">
                        <Mail size={18} />
                      </div>
                      <input
                        type="email"
                        value={formData.email}
                        disabled
                        className="w-full cursor-not-allowed rounded-2xl border-2 border-amber-50 dark:border-zinc-800 bg-amber-50/40 dark:bg-zinc-950 py-4 pl-12 pr-4 text-sm font-bold text-[var(--bakery-text-muted)] opacity-70"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Section */}
              <div className="space-y-6 pt-2">
                <div className="flex items-center gap-2 border-b border-amber-50 dark:border-zinc-800 pb-4">
                  <div className="h-2 w-2 rounded-full bg-rose-500" />
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--bakery-text)]">Security & Password</h3>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--bakery-text-muted)] ml-1">Current Password</label>
                    <input
                      type="password"
                      value={formData.currentPassword}
                       onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                      placeholder="••••••••"
                      autoComplete="off"
                      className="w-full rounded-2xl border-2 border-amber-50 dark:border-zinc-800 bg-amber-50/20 dark:bg-zinc-950 py-4 px-5 text-sm font-bold text-[var(--bakery-text)] outline-none transition-all focus:border-rose-100 focus:bg-white dark:focus:bg-zinc-800 focus:ring-8 focus:ring-rose-50/50 dark:focus:ring-rose-900/10"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--bakery-text-muted)] ml-1">New Password</label>
                    <input
                      type="password"
                      value={formData.newPassword}
                       onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      placeholder="Minimum 8 characters"
                      autoComplete="new-password"
                      className="w-full rounded-2xl border-2 border-amber-50 dark:border-zinc-800 bg-amber-50/20 dark:bg-zinc-950 py-4 px-5 text-sm font-bold text-[var(--bakery-text)] outline-none transition-all focus:border-amber-200 focus:bg-white dark:focus:bg-zinc-800 focus:ring-8 focus:ring-amber-50/50 dark:focus:ring-amber-900/10"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-4 pt-6 sm:flex-row">
                <Button
                  type="submit"
                  disabled={loading || (formData.name === (session?.user?.name || initialSession?.user?.name || "") && formData.image === (session?.user?.image || initialSession?.user?.image || "") && !formData.newPassword)}
                  className="h-14 w-full rounded-[1.25rem] bg-amber-600 text-base font-black shadow-lg shadow-amber-600/20 hover:bg-amber-700 active:scale-95 transition-all sm:w-auto sm:px-14 disabled:opacity-50 disabled:grayscale-[0.5]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Baking Changes...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-5 w-5" />
                      Save All Changes
                    </>
                  )}
                </Button>
                 <p className="text-[10px] font-bold text-[var(--bakery-text-muted)] opacity-60 text-center sm:text-left">
                  Your changes will be saved to our bakery oven instantly.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
