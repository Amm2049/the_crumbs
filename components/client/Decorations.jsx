'use client'

import { Wheat, Coffee, Cake, CakeSlice, Donut, Cherry } from 'lucide-react'

// Custom Croissant SVG path for that artisanal feel
const CroissantIcon = ({ size = 24, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M3 14c.5-2 1.5-4 3.5-5.5s4.5-2 7-1.5 4.5 2.5 5 4.5" />
    <path d="M4.5 17c1-2.5 3-4.5 5.5-5s5 .5 6.5 2.5" />
    <path d="M7 19c1.5-2 3.5-3 5.5-2.5s3.5 1.5 4 3.5" />
    <path d="M2 12c.5-4 3-7 6.5-8s7.5 1 10 4.5c1.5 2 2 4.5 1.5 7" />
  </svg>
)

export default function Decorations() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden select-none z-0">
      {/* Soft Blobs */}
      <div className="absolute top-[5%] -left-20 h-96 w-96 rounded-full bg-amber-100/30 blur-3xl" />
      <div className="absolute top-[35%] -right-20 h-96 w-96 rounded-full bg-orange-100/20 blur-3xl" />
      <div className="absolute bottom-[20%] left-1/4 h-80 w-80 rounded-full bg-rose-100/10 blur-3xl" />
      <div className="absolute top-[70%] left-[-10%] h-64 w-64 rounded-full bg-amber-200/10 blur-3xl" />

      {/* Floating Bakery Elements */}
      
      {/* Croissants */}
      <div className="absolute top-[8%] left-[4%] text-amber-300/40 animate-float">
        <CroissantIcon size={52} className="rotate-12" />
      </div>
      <div className="absolute bottom-[15%] right-[6%] text-amber-300/30 animate-sway delay-500">
        <CroissantIcon size={44} className="-rotate-45" />
      </div>

      {/* Cakes */}
      <div className="absolute top-[22%] right-[5%] text-rose-300/30 animate-float-slow delay-300">
        <Cake size={48} className="-rotate-6" />
      </div>
      <div className="absolute top-[55%] left-[2%] text-amber-200/40 animate-float delay-1000">
        <CakeSlice size={36} className="rotate-12" />
      </div>

      {/* Donuts */}
      <div className="absolute top-[45%] right-[12%] text-orange-200/30 animate-sway">
        <Donut size={40} />
      </div>
      <div className="absolute bottom-[40%] left-[5%] text-amber-200/30 animate-float-slow">
        <Donut size={32} className="rotate-45" />
      </div>

      {/* Other Treats */}
      <div className="absolute top-[65%] right-[3%] text-rose-200/30 animate-float delay-200">
        <Cherry size={28} />
      </div>
      <div className="absolute top-[35%] left-[12%] text-amber-200/20 animate-soft-rotate">
        <Wheat size={44} />
      </div>
      <div className="absolute bottom-[8%] left-[15%] text-orange-200/30 animate-sway delay-700">
        <Coffee size={40} className="rotate-12" />
      </div>
      <div className="absolute top-[85%] right-[15%] text-amber-200/20 animate-float-slow delay-400">
        <Wheat size={52} className="-rotate-12" />
      </div>

      {/* Floating Sparkle/Magic */}
      <div className="absolute top-[50%] left-[45%] text-amber-300/10 animate-soft-rotate">
        <div className="h-2 w-2 rounded-full bg-current" />
      </div>
      <div className="absolute top-[20%] left-[25%] text-amber-300/10 animate-float">
        <div className="h-1.5 w-1.5 rounded-full bg-current" />
      </div>
    </div>
  )
}
