import db from "@/lib/db";
import { response, handleApiError } from "@/lib/api-helper";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return response({ error: "Forbidden - Admin only" }, 403);
  }

  try {
    const [ordersCount, productsCount, customersCount, revenueResult, recentOrders, lowStockCount] =
      await Promise.all([
        db.order.count(),
        db.product.count(),
        db.user.count({ where: { role: "CUSTOMER" } }),
        db.order.aggregate({ _sum: { total: true } }),
        db.order.findMany({
          take: 8,
          orderBy: { createdAt: "desc" },
          include: {
            user: { select: { name: true, email: true, image: true } },
            items: { include: { product: { select: { name: true, images: true, category: { select: { name: true } } } } } },
          },
        }),
        db.product.count({ where: { stock: { lte: 5 } } })
      ]);

    return response({
      totalOrders: ordersCount,
      totalProducts: productsCount,
      totalCustomers: customersCount,
      totalRevenue: Number(revenueResult?._sum?.total ?? 0),
      recentOrders,
      lowStockCount
    });
  } catch (error) {
    return handleApiError(error);
  }
}

