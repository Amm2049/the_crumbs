// get a single product
// Patch - update a product (admin only)
// Delete - delete a product (admin only)

import db from '@/lib/db'
import { handleGetById, handleUpdate, handleDelete, ProductFormat, response } from '@/lib/api-helper'
import { auth } from '@/lib/auth'

export async function GET(request, { params }) {
    const { id } = await params
    console.log(id);

    return handleGetById(id, db.product, { include: { category: true } }, 'Product not found')
}

export async function PATCH(request, { params }) {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
        return response({ error: 'Forbidden - Admin only' }, 403)
    }

    const { id } = await params
    const rawData = await request.json()
    const data = ProductFormat(rawData)

    // In PATCH, usually we don't pass requiredFields as updates can be partial
    return handleUpdate(id, db.product, { data }, [], {
        P2002: "A product with this name or slug already exists",
        P2025: "Product not found"
    })
}

export async function DELETE(request, { params }) {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
        return response({ error: 'Forbidden - Admin only' }, 403)
    }

    const { id } = await params
    const constraints = {
        model: db.orderItem,
        where: { productId: id },
        message: 'Product has active orders and cannot be deleted'
    }
    return handleDelete(id, db.product, constraints, { P2025: 'Product not found' })
}