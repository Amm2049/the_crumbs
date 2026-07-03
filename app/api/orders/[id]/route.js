import { auth } from '@/lib/auth'
import db from '@/lib/db'
import { handleUpdate, OwnershipCheck, response } from '@/lib/api-helper'

export async function GET(request, { params }) {
    const session = await auth()
    const { id } = await params

    const check = await OwnershipCheck(id, db.order, session, {
        include: {
            user: { select: { name: true, email: true } },
            items: { include: { product: { select: { name: true, images: true } } } },
        }
    })

    if (check.error) return check.error
    return response(check.data)
}

export async function PATCH(request, { params }) {

    // authorization
    const session = await auth()
    if (!session) return response({ error: "Unauthorized" }, 401)

    // get order informations
    const { id } = await params
    const { status } = await request.json()

    // Fetch order first to check status
    const order = await db.order.findUnique({ where: { id } })
    if (!order) return response({ error: "Not Found" }, 404)

    // Terminal order check: CANCELLED and DELIVERED orders cannot be modified
    if (order.status === 'CANCELLED' || order.status === 'DELIVERED') {
        return response({ error: "Cannot modify completed or cancelled orders" }, 400)
    }

    const isAdmin = session.user.role === 'ADMIN'

    // Customers can only cancel their own PENDING orders
    if (!isAdmin) {
        if (order.userId !== session.user.id)
            return response({ error: "Not Found" }, 404)
        if (status !== 'CANCELLED')
            return response({ error: 'Customers may only cancel orders' }, 403)
        if (order.status !== 'PENDING')
            return response({ error: 'Only pending orders can be cancelled' }, 400)
    }

    // If transitioning to CANCELLED, restore stock (works for both admin and customer cancels)
    if (status === 'CANCELLED') {
        const items = await db.orderItem.findMany({ where: { orderId: id } })
        await db.$transaction(
            items.map(item => db.product.update({
                where: { id: item.productId },
                data: { stock: { increment: item.quantity } }
            }))
        )
    }

    return handleUpdate(id, db.order, { data: { status } })
}


