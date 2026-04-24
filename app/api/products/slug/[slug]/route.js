import db from "@/lib/db";
import { response, handleApiError } from "@/lib/utils";

// get a single product by slug (storefront)
export async function GET(_request, { params }) {
  try {
    const { slug } = await params;

    const product = await db.product.findUnique({
      where: { slug },
      include: { category: true },
    });

    if (!product) return response({ error: "Product not found" }, 404);
    return response(product);
  } catch (error) {
    return handleApiError(error);
  }
}

