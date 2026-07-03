import db from "@/lib/db";
import { response, handleApiError } from "@/lib/api-helper";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return response({ error: "Forbidden - Admin only" }, 403);
  }

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    // 1. Revenue by Day (last 30 days)
    const revenueByDayRaw = await db.$queryRaw`
      SELECT DATE_TRUNC('day', "createdAt") AS date,
             SUM(total) AS revenue
      FROM "Order"
      WHERE status != 'CANCELLED'
        AND "createdAt" >= ${thirtyDaysAgo}
      GROUP BY date
      ORDER BY date ASC
    `;

    // 2. Orders by Day (last 30 days, grouped by status)
    const ordersByDayRaw = await db.$queryRaw`
      SELECT DATE_TRUNC('day', "createdAt") AS date,
             COUNT(*)::int AS total,
             SUM(CASE WHEN status = 'DELIVERED' THEN 1 ELSE 0 END)::int AS delivered,
             SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END)::int AS cancelled,
             SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END)::int AS pending,
             SUM(CASE WHEN status = 'PROCESSING' THEN 1 ELSE 0 END)::int AS processing,
             SUM(CASE WHEN status = 'READY' THEN 1 ELSE 0 END)::int AS ready
      FROM "Order"
      WHERE "createdAt" >= ${thirtyDaysAgo}
      GROUP BY date
      ORDER BY date ASC
    `;

    // 3. Revenue by Category
    const revenueByCategoryRaw = await db.$queryRaw`
      SELECT c.name, SUM(oi.quantity * oi.price) AS revenue
      FROM "Category" c
      JOIN "Product" p ON p."categoryId" = c.id
      JOIN "OrderItem" oi ON oi."productId" = p.id
      JOIN "Order" o ON o.id = oi."orderId"
      WHERE o.status != 'CANCELLED'
      GROUP BY c.name
      ORDER BY revenue DESC
    `;

    // 4. Monthly Revenue (last 12 months)
    const monthlyRevenueRaw = await db.$queryRaw`
      SELECT DATE_TRUNC('month', "createdAt") AS month,
             SUM(total) AS revenue,
             COUNT(*)::int AS orders
      FROM "Order"
      WHERE status != 'CANCELLED'
        AND "createdAt" >= ${twelveMonthsAgo}
      GROUP BY month
      ORDER BY month ASC
    `;

    // 5. Top 5 Products by Quantity
    const topProductsRaw = await db.$queryRaw`
      SELECT p.name,
             SUM(oi.quantity)::int AS quantity,
             SUM(oi.quantity * oi.price) AS revenue
      FROM "Product" p
      JOIN "OrderItem" oi ON oi."productId" = p.id
      JOIN "Order" o ON o.id = oi."orderId"
      WHERE o.status != 'CANCELLED'
      GROUP BY p.name
      ORDER BY quantity DESC
      LIMIT 5
    `;

    // 6. Orders Status distribution (all time)
    const ordersByStatusRaw = await db.$queryRaw`
      SELECT status, COUNT(*)::int AS count
      FROM "Order"
      GROUP BY status
    `;

    // Format helpers to guarantee timezone consistency
    const formatDay = (dateVal) => {
      const d = new Date(dateVal);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
    };

    const formatMonth = (dateVal) => {
      const d = new Date(dateVal);
      return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit', timeZone: 'UTC' });
    };

    // Construct final JSON payloads safely converting decimal/bigint
    const revenueByDay = revenueByDayRaw.map(row => ({
      date: formatDay(row.date),
      revenue: Number(row.revenue ?? 0)
    }));

    const ordersByDay = ordersByDayRaw.map(row => ({
      date: formatDay(row.date),
      total: Number(row.total ?? 0),
      delivered: Number(row.delivered ?? 0),
      cancelled: Number(row.cancelled ?? 0),
      pending: Number(row.pending ?? 0),
      processing: Number(row.processing ?? 0),
      ready: Number(row.ready ?? 0),
    }));

    // format RevenueByCategory -------
    const allCategories = revenueByCategoryRaw.map(row => ({
      name: row.name,
      revenue: Number(row.revenue ?? 0)
    }));
    // If more than 5 categories, group the lower ones as others
    let revenueByCategory = allCategories;
    if (allCategories.length > 5) {
      const top4 = allCategories.slice(0, 4)
      const others = allCategories.slice(4)
      const othersTotal = others.reduce((sum, item) => sum + item.revenue, 0)

      revenueByCategory = [
        ...top4,
        { name: 'Others', revenue: othersTotal }
      ]
    }

    const monthlyRevenue = monthlyRevenueRaw.map(row => ({
      month: formatMonth(row.month),
      revenue: Number(row.revenue ?? 0),
      orders: Number(row.orders ?? 0)
    }));

    const topProducts = topProductsRaw.map(row => ({
      name: row.name,
      quantity: Number(row.quantity ?? 0),
      revenue: Number(row.revenue ?? 0)
    }));

    const ordersByStatus = ordersByStatusRaw.map(row => ({
      status: row.status,
      count: Number(row.count ?? 0)
    }));

    return response({
      revenueByDay,
      ordersByDay,
      revenueByCategory,
      monthlyRevenue,
      topProducts,
      ordersByStatus
    });

  } catch (error) {
    return handleApiError(error);
  }
}
