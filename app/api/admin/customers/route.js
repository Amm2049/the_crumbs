import db from "@/lib/db";
import { auth } from "@/lib/auth";
import { handleGetAll, response } from "@/lib/api-helper";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return response({ error: "Forbidden - Admin only" }, 403);
  }

  return handleGetAll(db.user, {
    where: { role: "CUSTOMER" },
    include: { _count: { select: { orders: true } } },
    orderBy: { createdAt: "desc" },
  });
}

