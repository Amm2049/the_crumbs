import db from "@/lib/db";
import { auth } from "@/lib/auth";
import { handleApiError, response } from "@/lib/api-helper";

export async function GET(request) {
    const session = await auth();
    const isAdmin = session.user.role === 'ADMIN';
    const { searchParams } = request.nextUrl;
    const requestedStatus = searchParams.get('status');
    const page  = Math.max(1, parseInt(searchParams.get('page')  ?? '1',  10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '10', 10)));
    const skip  = (page - 1) * limit;

    const year = searchParams.get('year');
    const month = searchParams.get('month'); // 1-12
    const day = searchParams.get('day');

    const where = {
        ...(isAdmin ? {} : { userId: session.user.id }),
        ...(requestedStatus ? { status: requestedStatus } : {}),
    };

    // Date Filtering Logic
    if (year || month) {
        const y = year ? parseInt(year) : new Date().getFullYear();
        let startDate, endDate;

        if (month && day) {
            const m = parseInt(month) - 1;
            const d = parseInt(day);
            startDate = new Date(y, m, d);
            endDate = new Date(y, m, d + 1);
        } else if (month) {
            const m = parseInt(month) - 1;
            startDate = new Date(y, m, 1);
            endDate = new Date(y, m + 1, 1);
        } else {
            // Year only
            startDate = new Date(y, 0, 1);
            endDate = new Date(y + 1, 0, 1);
        }

        where.createdAt = {
            gte: startDate,
            lt: endDate,
        };
    }

    try {
        const [orders, total] = await Promise.all([
            db.order.findMany({
                where,
                include: {
                    user: { select: { name: true, email: true } },
                    items: { include: { product: { select: { name: true, images: true, category: { select: { name: true } } } } } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            db.order.count({ where }),
        ]);

        return response({ data: orders, total, page, totalPages: Math.ceil(total / limit) });
    } catch (error) {
        return handleApiError(error);
    }
}

export async function POST() {
    const session = await auth();
    const userId = session.user.id;

    try {
        const order = await db.$transaction(async (tx) => {
            // Fetch cart items inside transaction
            const cartItems = await tx.cartItem.findMany({
                where: { userId },
                include: { product: true },
            });

            if (cartItems.length === 0) {
                throw new Error('CART_EMPTY');
            }

            // validate the availability of products and calculate the total amount
            let total = 0;
            const orderItemsData = [];

            for (const item of cartItems) {
                if (!item.product.isAvailable || item.quantity > item.product.stock) {
                    throw new Error(`STOCK_ERROR:${item.product.name}`);
                }

                total += item.quantity * item.product.price;
                orderItemsData.push({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.product.price,
                });

                // stock will be deducted after order is created
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } },
                });
            }

            // Create the order
            const newOrder = await tx.order.create({
                data: {
                    userId,
                    total,
                    items: { create: orderItemsData },
                },
            });

            // Clear user cart
            await tx.cartItem.deleteMany({ where: { userId } });

            return newOrder;
        });

        return response(order, 201);
    } catch (error) {
        if (error.message === 'CART_EMPTY') {
            return response({ error: 'Cart is empty' }, 400);
        }
        if (error.message.startsWith('STOCK_ERROR:')) {
            const productName = error.message.split(':')[1];
            return response({ error: `Product "${productName}" is unavailable or out of stock` }, 400);
        }
        return handleApiError(error);
    }
}

