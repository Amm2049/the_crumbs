// get all categories
// create a new category - admin only

import db from '@/lib/db'
import { handleGetAll, handlePost } from '@/lib/api-helper'

export async function GET() {
    return handleGetAll(db.category, { orderBy: { name: 'asc' } })
}

export async function POST(request) {
    const data = await request.json();
    return handlePost(db.category, { data }, ["name", "slug"],
        { P2002: 'Category name already exists' }
    )
}
