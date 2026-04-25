import db from "@/lib/db";
import { auth } from "@/lib/auth";
import { handleGetAll, handleUpsert } from "@/lib/api-helper";

export async function GET() {
    const session = await auth();

    return handleGetAll(db.cartItem, {
        where: { userId: session.user.id },
        include: { product: true }
    });
}

export async function POST(request) {
    const session = await auth();

    const { productId, quantity } = await request.json();
    const userId = session.user.id;

    const product = await db.product.findUnique({ where: { id: productId } });
    if (!product || !product.isAvailable) {
        return response({ error: "Product not available" }, 400);
    }

    // Check if item already in cart
    const existingItem = await db.cartItem.findUnique({
        where: { userId_productId: { userId, productId } }
    });

    const currentQuantity = existingItem?.quantity || 0;
    const totalRequested = currentQuantity + quantity;

    if (totalRequested > product.stock) {
        const remaining = product.stock - currentQuantity;
        return response({ 
            error: remaining > 0 
                ? `Only ${remaining} more available (you have ${currentQuantity} in cart)` 
                : `You already have the maximum available stock (${currentQuantity}) in your cart` 
        }, 400);
    }

    return handleUpsert(db.cartItem, {
        where: { userId_productId: { userId, productId } },
        create: { userId, productId, quantity },
        update: { quantity: { increment: quantity } },
    });
}

