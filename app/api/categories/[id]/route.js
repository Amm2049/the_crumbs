// get a single category
// update a category - admin only
// delete a category - admin only

import db from '@/lib/db'
import { handleGetById, handleUpdate, handleDelete, response } from '@/lib/api-helper'
import { auth } from '@/lib/auth'

export async function GET(request, { params }) {
    const { id } = await params
    return handleGetById(id, db.category, {
        include: {
            products: { where: { isAvailable: true }, orderBy: { createdAt: 'desc' }, take: 8 },
        }
    }, 'Category not found')
}

export async function PATCH(request, { params }) {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
        return response({ error: 'Forbidden - Admin only' }, 403)
    }

    const { id } = await params
    const data = await request.json()

    return handleUpdate(id, db.category, { data }, [], {
        P2002: 'Category name or slug already exists',
        P2025: 'Category not found'
    })
}

export async function DELETE(request, { params }) {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
        return response({ error: 'Forbidden - Admin only' }, 403)
    }

    const { id } = await params
    const constraints = {
        model: db.product,
        where: { categoryId: id },
        message: "Cannot delete category with existing products"
    }
    return handleDelete(id, db.category, constraints, { P2025: "Category not found" })
}