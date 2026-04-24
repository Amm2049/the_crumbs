// get all products
// create a new product - admin only

import db from '@/lib/db'
import {handleGetAll,handlePost,ProductFormat} from '@/lib/api-helper'

export async function GET(request) {
    const { searchParams } = request.nextUrl
    const categoryId = searchParams.get('categoryId')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const takeParam = searchParams.get('take')
    const take = takeParam ? Number.parseInt(takeParam, 10) : undefined

    let resolvedCategoryId = categoryId
    if (!resolvedCategoryId && category) {
        const found = await db.category.findUnique({ where: { slug: category } })
        resolvedCategoryId = found?.id
    }

    return handleGetAll(db.product, {where: {
            isAvailable: true,
            ...(resolvedCategoryId && { categoryId: resolvedCategoryId }),
            ...(search && {
                name: {
                    contains: search,
                    mode: 'insensitive',
                }
            })
        },
        include: {
                category: true,
        },
        orderBy: {
            createdAt: 'desc'
        },
        ...(Number.isFinite(take) && take > 0 ? { take } : {}),
            }
        )   
}

export async function POST(request) {
    const rawData = await request.json();
    const data = ProductFormat(rawData);
    
    return handlePost(db.product,{data},
        ["name", "slug", "price", "categoryId"],
        {
            P2002: 'Product already exists',
        }
    )
}