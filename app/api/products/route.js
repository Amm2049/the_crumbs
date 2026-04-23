// get all products
// create a new product - admin only

import db from '@/lib/db'
import {handleGetAll,handlePost,ProductFormat} from '@/lib/api-helper'

export async function GET(request) {
    const { searchParams } = request.nextUrl
    const categoryId = searchParams.get('categoryId')
    const search = searchParams.get('search')

    return handleGetAll(db.product, {where: {
            isAvailable: true,
            ...(categoryId && { categoryId }),
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