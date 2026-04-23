'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

function toSlug(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export default function CategoriesManager({ initialCategories = [] }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [editingId, setEditingId] = useState('')
  const [editingName, setEditingName] = useState('')
  const [editingSlug, setEditingSlug] = useState('')
  const [editingDescription, setEditingDescription] = useState('')

  const categories = useMemo(() => (Array.isArray(initialCategories) ? initialCategories : []), [initialCategories])

  const handleCreate = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim() || null,
        }),
      })

      if (!response.ok) {
        let message = 'Unable to create category.'
        try {
          const payload = await response.json()
          message = payload?.error || message
        } catch {
          // Keep fallback message.
        }
        setError(message)
        return
      }

      setName('')
      setSlug('')
      setDescription('')
      router.refresh()
    } catch {
      setError('Network error while creating category.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEdit = (category) => {
    setEditingId(category.id)
    setEditingName(category.name || '')
    setEditingSlug(category.slug || '')
    setEditingDescription(category.description || '')
    setError('')
  }

  const cancelEdit = () => {
    setEditingId('')
    setEditingName('')
    setEditingSlug('')
    setEditingDescription('')
  }

  const submitEdit = async () => {
    setError('')

    try {
      const response = await fetch(`/api/categories/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingName.trim(),
          slug: editingSlug.trim(),
          description: editingDescription.trim() || null,
        }),
      })

      if (!response.ok) {
        let message = 'Unable to update category.'
        try {
          const payload = await response.json()
          message = payload?.error || message
        } catch {
          // Keep fallback message.
        }
        setError(message)
        return
      }

      cancelEdit()
      router.refresh()
    } catch {
      setError('Network error while updating category.')
    }
  }

  const handleDelete = async (categoryId) => {
    const confirmed = window.confirm('Delete this category?')
    if (!confirmed) return

    setError('')

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        let message = 'Unable to delete category.'
        try {
          const payload = await response.json()
          message = payload?.error || message
        } catch {
          // Keep fallback message.
        }
        setError(message)
        return
      }

      if (editingId === categoryId) {
        cancelEdit()
      }

      router.refresh()
    } catch {
      setError('Network error while deleting category.')
    }
  }

  return (
    <div className="space-y-5">
      <form onSubmit={handleCreate} className="space-y-3 rounded-2xl border border-amber-100 bg-white p-5">
        <h2 className="text-lg font-bold text-[#4D321E]">Create Category</h2>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-sm font-semibold text-[#6B4C3B]">Name</span>
            <input
              value={name}
              onChange={(event) => {
                const nextName = event.target.value
                setName(nextName)
                if (!slug) setSlug(toSlug(nextName))
              }}
              required
              className="w-full rounded-xl border border-amber-200 px-3 py-2 text-sm text-[#4D321E] outline-none focus:border-amber-400"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-semibold text-[#6B4C3B]">Slug</span>
            <input
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              required
              pattern="[a-z0-9-]+"
              className="w-full rounded-xl border border-amber-200 px-3 py-2 text-sm text-[#4D321E] outline-none focus:border-amber-400"
            />
          </label>
        </div>

        <label className="space-y-1">
          <span className="text-sm font-semibold text-[#6B4C3B]">Description</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            className="w-full rounded-xl border border-amber-200 px-3 py-2 text-sm text-[#4D321E] outline-none focus:border-amber-400"
          />
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Creating...' : 'Create Category'}
        </button>
      </form>

      {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p> : null}

      <div className="overflow-hidden rounded-2xl border border-amber-100 bg-white">
        {categories.length === 0 ? (
          <div className="p-8 text-center text-sm font-medium text-[#6B4C3B]">No categories yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-amber-50/70 text-xs uppercase tracking-wide text-[#7A5D4B]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Slug</th>
                  <th className="px-4 py-3 font-semibold">Products</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => {
                  const isEditing = editingId === category.id
                  return (
                    <tr key={category.id} className="border-t border-amber-100/80">
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <input
                            value={editingName}
                            onChange={(event) => setEditingName(event.target.value)}
                            className="w-full rounded-lg border border-amber-200 px-2 py-1.5 text-sm outline-none focus:border-amber-400"
                          />
                        ) : (
                          <p className="font-semibold text-[#4D321E]">{category.name}</p>
                        )}
                        {isEditing ? (
                          <textarea
                            value={editingDescription}
                            onChange={(event) => setEditingDescription(event.target.value)}
                            rows={2}
                            className="mt-2 w-full rounded-lg border border-amber-200 px-2 py-1.5 text-xs outline-none focus:border-amber-400"
                          />
                        ) : category.description ? (
                          <p className="mt-1 text-xs text-[#8A6D5E]">{category.description}</p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <input
                            value={editingSlug}
                            onChange={(event) => setEditingSlug(event.target.value)}
                            className="w-full rounded-lg border border-amber-200 px-2 py-1.5 text-sm outline-none focus:border-amber-400"
                          />
                        ) : (
                          <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">{category.slug}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[#6B4C3B]">{category._count?.products ?? 0}</td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={submitEdit}
                              className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={cancelEdit}
                              className="rounded-lg border border-amber-200 px-3 py-1.5 text-xs font-semibold text-[#6B4C3B] hover:bg-amber-50"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openEdit(category)}
                              className="rounded-lg border border-amber-200 px-3 py-1.5 text-xs font-semibold text-[#6B4C3B] hover:bg-amber-50"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(category.id)}
                              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
