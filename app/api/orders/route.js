import db from "@/lib/db";
import { auth } from "@/lib/auth";
import { handleGetAll, handleApiError, response } from "@/lib/api-helper";

export async function GET() {
    const session = await auth();
    const isAdmin = session.user.role === 'ADMIN';

    return handleGetAll(db.order, {
        where: isAdmin ? {} : { userId: session.user.id },
        include: {
            user: { select: { name: true, email: true } },
            items: { include: { product: { select: { name: true, images: true } } } },
        },
        orderBy: { createdAt: 'desc' },
    });
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

