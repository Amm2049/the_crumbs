import db from "@/lib/db";
import { response, handleApiError } from "@/lib/api-helper";

// get a single product by slug (storefront)
export async function GET(_request, { params }) {
  try {
    const { slug } = await params;
    const product = await db.product.findFirst({
      where: { slug, isAvailable: true },
      include: { category: true }
    });
    if (!product) {
      return response({ error: "Product not found" }, 404);
    }
    return response(product);
  } catch (error) {
    return handleApiError(error);
  }
}

