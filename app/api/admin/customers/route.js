import db from "@/lib/db";
import { handleApiError, parsePagination, response, withAdmin } from "@/lib/api-helper";

export const GET = withAdmin(async (request) => {
  const { searchParams } = request.nextUrl;
  const { page, limit, skip } = parsePagination(searchParams, 10);

  try {
    const [customers, total] = await Promise.all([
      db.user.findMany({
        where: { role: "CUSTOMER" },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          createdAt: true,
          _count: { select: { orders: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.user.count({ where: { role: "CUSTOMER" } })
    ]);

    return response({
      data: customers,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return handleApiError(error);
  }
})

