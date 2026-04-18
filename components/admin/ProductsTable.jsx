/**
 * components/admin/ProductsTable.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Products Data Table for the Admin Panel  (Client Component)
 *
 * Displays products with edit/delete actions.
 *
 * HOW TO IMPLEMENT:
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * 'use client'
 *
 * import Link from 'next/link'
 * import { useRouter } from 'next/navigation'
 * import { Button } from '@/components/ui/button'
 * import { Pencil, Trash2 } from 'lucide-react'
 *
 * // Props: products (array of products with category included)
 * export default function ProductsTable({ products }) {
 *   const router = useRouter()
 *
 *   const handleDelete = async (id) => {
 *     // 1. Confirm with window.confirm() or a shadcn/ui AlertDialog
 *     // 2. DELETE /api/products/:id
 *     // 3. If successful: router.refresh() to re-fetch the page data
 *     // 4. If error: show toast notification
 *   }
 *
 *   // Table columns:
 *   //   Image (first image from images array, or placeholder)
 *   //   Name
 *   //   Category
 *   //   Price ($XX.XX)
 *   //   Stock
 *   //   Status (Available / Hidden badge)
 *   //   Actions (Edit button → /admin/products/:id/edit, Delete button)
 * }
 */
