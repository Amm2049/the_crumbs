/**
 * components/client/HeroSection.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Landing Page Hero Banner — Server Component (no interactivity needed)
 *
 * HOW TO IMPLEMENT:
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * import Link from 'next/link'
 * import { Button } from '@/components/ui/button'
 *
 * export default function HeroSection() {
 *   return (
 *     <section className="relative bg-gradient-to-r from-amber-50 to-orange-100 py-20 px-4">
 *       <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
 *         <div>
 *           <h1 className="text-5xl font-bold leading-tight">
 *             Fresh Baked<br />with Love 🥐
 *           </h1>
 *           <p className="text-lg text-muted-foreground mt-4">
 *             Artisan cakes, breads, pastries and cookies baked fresh every day.
 *           </p>
 *           <div className="flex gap-4 mt-8">
 *             <Link href="/products">
 *               <Button size="lg">Shop Now</Button>
 *             </Link>
 *             <Link href="/register">
 *               <Button variant="outline" size="lg">Create Account</Button>
 *             </Link>
 *           </div>
 *         </div>
 *         {/* Hero image — use next/image with a bakery photo from Cloudinary or public folder *\/}
 *         <div className="hidden md:block">
 *           {/* <Image src="..." alt="Fresh pastries" width={500} height={400} className="rounded-2xl" /> *\/}
 *         </div>
 *       </div>
 *     </section>
 *   )
 * }
 */
