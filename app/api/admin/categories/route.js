import db from "@/lib/db";
import { auth } from "@/lib/auth";
import { handleGetAll, response } from "@/lib/api-helper";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return response({ error: "Forbidden - Admin only" }, 403);
  }

  return handleGetAll(db.category, {
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });
}

