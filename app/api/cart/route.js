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
        return NextResponse.json({ error: "Product not available" }, { status: 400 });
    }
    if (quantity > product.stock) {
        return NextResponse.json({ error: "Insufficient stock" }, { status: 400 });
    }

    return handleUpsert(db.cartItem, {
        where: { userId_productId: { userId, productId } },
        create: { userId, productId, quantity },
        update: { quantity: { increment: quantity } },
    });
}

