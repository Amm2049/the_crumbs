import db from "@/lib/db";
import { response, handleApiError } from "@/lib/api-helper";
import { auth } from "@/lib/auth";

export async function GET(request) {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
        return response({ error: "Forbidden - Admin only" }, 403);
    }

    const { searchParams } = request.nextUrl
    const threshold = Math.min(50, Math.max(1, parseInt(searchParams.get('threshold') ?? "5", 10)))

    try {
        const products = await db.product.findMany({
            where: { stock: { lte: threshold } },
            orderBy: { stock: 'asc' },
            include: { category: { select: { name: true } } }
        })

        return response({
            products,
            threshold, total: products.length
        });
    } catch (error) {
        return handleApiError(error);
    }
}