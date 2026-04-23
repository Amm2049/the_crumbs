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
    const { id } = await params
    const { status } = await request.json()

    return handleUpdate(id, db.order, { data: { status } })
}


