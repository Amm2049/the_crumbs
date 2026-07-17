import db from '@/lib/db'
import { auth } from '@/lib/auth'
import { response, handleApiError } from '@/lib/api-helper'

export async function GET(request) {
    const { searchParams } = request.nextUrl
    const type = searchParams.get('type') // 'related' | 'cart' | 'personalized'
    const productId = searchParams.get('productId')
    const cartItemsParam = searchParams.get('cartItems') // comma-separated ids
    const limitParam = searchParams.get('limit')
    const limit = limitParam ? parseInt(limitParam, 10) : 4

    const excludeIds = []
    if (productId) excludeIds.push(productId)
    if (cartItemsParam) {
        cartItemsParam.split(',').forEach(id => {
            const cleanId = id.trim()
            if (cleanId) excludeIds.push(cleanId)
        })
    }

    try {
        let products = []

        if (type === 'related' && productId) {
            // Category-based recommendations for Product Detail page
            const currentProduct = await db.product.findUnique({
                where: { id: productId },
                select: { categoryId: true }
            })

            if (currentProduct) {
                products = await db.product.findMany({
                    where: {
                        categoryId: currentProduct.categoryId,
                        id: { notIn: excludeIds },
                        isAvailable: true,
                        stock: { gt: 0 }
                    },
                    include: { category: true },
                    orderBy: { createdAt: 'desc' },
                    take: limit
                })
            }

            // Fallback to top-selling products if same-category count is less than requested limit
            if (products.length < limit) {
                const popular = await getPopularProducts({
                    excludeIds: [...excludeIds, ...products.map(p => p.id)],
                    limit: limit - products.length
                })
                products = [...products, ...popular]
            }

        } else if (type === 'cart') {
            // Cart page cross-selling: show top-selling items excluding anything already in cart
            products = await getPopularProducts({
                excludeIds,
                limit
            })

        } else if (type === 'personalized') {
            // Home page: Personalized recommendations based on customer purchase history
            const session = await auth()

            if (session?.user?.id) {
                // Fetch recent user orders and determine their favorite category
                const userOrders = await db.order.findMany({
                    where: { userId: session.user.id },
                    include: {
                        items: {
                            include: {
                                product: {
                                    select: { categoryId: true }
                                }
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 10
                })

                const categoryCounts = {}
                userOrders.forEach(order => {
                    order.items.forEach(item => {
                        const catId = item.product?.categoryId
                        if (catId) {
                            categoryCounts[catId] = (categoryCounts[catId] || 0) + item.quantity
                        }
                    })
                })

                const sortedCategories = Object.keys(categoryCounts).sort((a, b) => categoryCounts[b] - categoryCounts[a])
                const favoriteCategoryId = sortedCategories[0]

                if (favoriteCategoryId) {
                    // Fetch products from their favorite category that are in-stock and not excluded
                    products = await db.product.findMany({
                        where: {
                            categoryId: favoriteCategoryId,
                            id: { notIn: excludeIds },
                            isAvailable: true,
                            stock: { gt: 0 }
                        },
                        include: { category: true },
                        orderBy: { createdAt: 'desc' },
                        take: limit
                    })
                }

                // If still short of limit, supplement with overall popular items
                if (products.length < limit) {
                    const popular = await getPopularProducts({
                        excludeIds: [...excludeIds, ...products.map(p => p.id)],
                        limit: limit - products.length
                    })
                    products = [...products, ...popular]
                }
            } else {
                // Guest / Anonymous user: show overall popular items
                products = await getPopularProducts({
                    excludeIds,
                    limit
                })
            }

        } else {
            // Default fallback: overall popular items
            products = await getPopularProducts({
                excludeIds,
                limit
            })
        }

        return response(products)
    } catch (error) {
        return handleApiError(error)
    }
}

/**
 * Query database to find the top-selling products.
 * Falls back to newest products if order history is empty.
 */
async function getPopularProducts({ excludeIds = [], limit = 4 }) {
    try {
        // Group order items by product to sum quantity sold
        const popularItems = await db.orderItem.groupBy({
            by: ['productId'],
            _sum: {
                quantity: true
            },
            where: {
                product: {
                    isAvailable: true,
                    stock: { gt: 0 },
                    id: { notIn: excludeIds }
                }
            },
            orderBy: {
                _sum: {
                    quantity: 'desc'
                }
            },
            take: limit
        })

        const popularProductIds = popularItems.map(item => item.productId)

        let products = []
        if (popularProductIds.length > 0) {
            products = await db.product.findMany({
                where: {
                    id: { in: popularProductIds }
                },
                include: { category: true }
            })

            // Sort products to match the aggregated order
            products.sort((a, b) => popularProductIds.indexOf(a.id) - popularProductIds.indexOf(b.id))
        }

        // If not enough products, supplement with newest available items
        if (products.length < limit) {
            const remainingLimit = limit - products.length
            const currentExcluded = [...excludeIds, ...products.map(p => p.id)]
            const newestProducts = await db.product.findMany({
                where: {
                    id: { notIn: currentExcluded },
                    isAvailable: true,
                    stock: { gt: 0 }
                },
                include: { category: true },
                orderBy: { createdAt: 'desc' },
                take: remainingLimit
            })
            products = [...products, ...newestProducts]
        }

        return products
    } catch (error) {
        console.error('Error fetching popular products:', error)
        // Fallback directly to newest available items in case of DB grouping error
        return db.product.findMany({
            where: {
                id: { notIn: excludeIds },
                isAvailable: true,
                stock: { gt: 0 }
            },
            include: { category: true },
            orderBy: { createdAt: 'desc' },
            take: limit
        })
    }
}
