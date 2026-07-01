// get all products
// create a new product - admin only

import db from '@/lib/db'
import { handleGetAll, handlePost, ProductFormat, response, handleApiError } from '@/lib/api-helper'

export async function GET(request) {
    const { searchParams } = request.nextUrl
    const categoryId = searchParams.get('categoryId')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const takeParam = searchParams.get('take')
    const take = takeParam ? Number.parseInt(takeParam, 10) : undefined

    const pageParam = searchParams.get('page')
    const limitParam = searchParams.get('limit')

    let resolvedCategoryId = categoryId
    if (!resolvedCategoryId && category) {
        const found = await db.category.findUnique({ where: { slug: category } })
        resolvedCategoryId = found?.id
    }

    // Common Query Filter
    const where = {
        isAvailable: true,
        ...(resolvedCategoryId && { categoryId: resolvedCategoryId }),
        ...(search && {
            name: {
                contains: search,
                mode: 'insensitive'
            }
        })
    }

    // If pagination is requested (storefront shop)
    if (pageParam || limitParam) {
        const page = Math.max(1, parseInt(pageParam ?? '1', 10))
        const limit = Math.min(100, Math.max(1, parseInt(limitParam ?? '15', 10)))
        const skip = (page - 1) * limit

        try {
            const [products, total] = await Promise.all([
                db.product.findMany({
                    where,
                    include: { category: true },
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: limit,
                }),
                db.product.count({ where })
            ])

            return response({
                data: products,
                total,
                page,
                totalPages: Math.ceil(total / limit)
            })
        } catch (error) {
            return handleApiError(error)
        }
    }



    return handleGetAll(db.product, {
        where,
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

    return handlePost(db.product, { data },
        ["name", "slug", "price", "categoryId"],
        {
            P2002: 'Product already exists',
        }
    )
}