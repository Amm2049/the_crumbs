import db from "@/lib/db";
import { auth } from "@/lib/auth";
import { handleApiError, response } from "@/lib/api-helper";
import { broadcast } from "@/lib/pusher-broadcast"

export async function GET(request) {
    const session = await auth();
    if (!session) {
        return response({ error: "Unauthorized" }, 401);
    }
    const isAdmin = session.user.role === 'ADMIN';
    const { searchParams } = request.nextUrl;
    const requestedStatus = searchParams.get('status');
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '10', 10)));
    const skip = (page - 1) * limit;

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
                    user: { select: { name: true, email: true, image: true } },
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

export async function POST(request) {
    const session = await auth();
    const userId = session.user.id;

    let address = '';
    let notes = '';
    try {
        const body = await request.json();
        address = body.address?.trim() ?? '';
        notes = body.notes?.trim() ?? '';
    } catch {
        // body may be empty — will be caught by address validation below
    }

    if (!address) {
        return response({ error: 'Delivery address is required' }, 400);
    }

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
                // Validate quantity is positive (#14)
                if (!Number.isInteger(item.quantity) || item.quantity < 1) {
                    throw new Error(`STOCK_ERROR:${item.product.name}`);
                }

                if (!item.product.isAvailable || item.quantity > item.product.stock) {
                    throw new Error(`STOCK_ERROR:${item.product.name}`);
                }

                total += item.quantity * item.product.price;
                orderItemsData.push({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.product.price,
                });

                // Atomic stock deduction with concurrency guard (#13)
                // The WHERE clause ensures stock >= quantity at the DB level,
                // preventing concurrent purchases from driving stock negative.
                const updated = await tx.product.updateMany({
                    where: {
                        id: item.productId,
                        stock: { gte: item.quantity }
                    },
                    data: { stock: { decrement: item.quantity } },
                });

                // If no rows were updated, another transaction grabbed the stock first
                if (updated.count === 0) {
                    throw new Error(`STOCK_ERROR:${item.product.name}`);
                }
            }

            // Create the order
            const newOrder = await tx.order.create({
                data: {
                    userId,
                    total,
                    address,
                    notes: notes || null,
                    items: { create: orderItemsData },
                },
                include: {
                    items: { include: { product: true } }
                }
            });

            // Clear user cart
            await tx.cartItem.deleteMany({ where: { userId } });

            return newOrder;
        }, {
            maxWait: 10000, // 10s max wait to acquire a connection
            timeout: 20000  // 20s max execution time
        });

        // --- Broadcast Real-time Updates ---
        // 1. Broadcast new order to admins (No longer needed because already broadcasted when webhook succed)
        // const customerName = session.user.name || 'Customer'
        // broadcast.newOrder(order.id, customerName, order.total)

        // 2. Broadcast stock updates and low-stock alerts
        if (order.items) {
            for (const item of order.items) {
                const product = item.product
                if (product) {
                    // Update storefront stock listings
                    broadcast.stockChanged(product.id, product.stock, product.isAvailable)
                    // Alert admins if stock drops below 5 items
                    if (product.stock < 5) {
                        broadcast.lowStockAlert(product.id, product.name, product.stock)
                    }
                }
            }
        }

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

