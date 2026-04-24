import db from "@/lib/db";
import { auth } from "@/lib/auth";
import { handleApiError, response } from "@/lib/api-helper";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return response({ error: "Forbidden - Admin only" }, 403);
  }

  try {
    const categories = await db.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: "asc" },
    });
    return response(categories);
  } catch (error) {
    return handleApiError(error);
  }
}

