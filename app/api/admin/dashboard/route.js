import db from "@/lib/db";
import { response, handleApiError } from "@/lib/utils";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return response({ error: "Forbidden - Admin only" }, 403);
  }

  try {
    const [ordersCount, productsCount, customersCount, revenueResult, recentOrders] =
      await Promise.all([
        db.order.count(),
        db.product.count(),
        db.user.count({ where: { role: "CUSTOMER" } }),
        db.order.aggregate({ _sum: { total: true } }),
        db.order.findMany({
          take: 8,
          orderBy: { createdAt: "desc" },
          include: {
            user: { select: { name: true, email: true } },
            items: { include: { product: { select: { name: true, images: true, category: { select: { name: true } } } } } },
          },
        }),
      ]);

    return response({
      totalOrders: ordersCount,
      totalProducts: productsCount,
      totalCustomers: customersCount,
      totalRevenue: Number(revenueResult?._sum?.total ?? 0),
      recentOrders,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

