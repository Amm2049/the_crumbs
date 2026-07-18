// get all categories
// create a new category - admin only

import db from '@/lib/db'
import { handleGetAll, handlePost, response } from '@/lib/api-helper'
import { auth } from '@/lib/auth'

export async function GET() {
    return handleGetAll(db.category, { orderBy: { name: 'asc' } })
}

export async function POST(request) {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
        return response({ error: 'Forbidden - Admin only' }, 403)
    }

    const data = await request.json();
    return handlePost(db.category, { data }, ["name", "slug"],
        { P2002: 'Category name already exists' }
    )
}
