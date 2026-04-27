// get a single product
// Patch - update a product (admin only)
// Delete - delete a product (admin only)

import db from '@/lib/db'
import { handleGetById, handleUpdate, handleDelete, ProductFormat } from '@/lib/api-helper'

export async function GET(request, { params }) {
    const { id } = await params
    console.log(id);

    return handleGetById(id, db.product, { include: { category: true } }, 'Product not found')
}

export async function PATCH(request, { params }) {
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
    const { id } = await params
    const constraints = {
        model: db.orderItem,
        where: { productId: id },
        message: 'Product has active orders and cannot be deleted'
    }
    return handleDelete(id, db.product, constraints, { P2025: 'Product not found' })
}