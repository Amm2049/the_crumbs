import db from "@/lib/db";
import { auth } from "@/lib/auth";
import { handleApiError, response } from "@/lib/api-helper";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return response({ error: "Forbidden - Admin only" }, 403);
  }

  try {
    const products = await db.product.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });
    return response(products);
  } catch (error) {
    return handleApiError(error);
  }
}

