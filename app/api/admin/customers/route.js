import db from "@/lib/db";
import { auth } from "@/lib/auth";
import { handleApiError, response } from "@/lib/api-helper";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return response({ error: "Forbidden - Admin only" }, 403);
  }

  try {
    const customers = await db.user.findMany({
      where: { role: "CUSTOMER" },
      include: { _count: { select: { orders: true } } },
      orderBy: { createdAt: "desc" },
    });

    return response(customers);
  } catch (error) {
    return handleApiError(error);
  }
}

