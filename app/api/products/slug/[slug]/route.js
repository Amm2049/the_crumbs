import db from "@/lib/db";
import { handleGetById } from "@/lib/api-helper";

// get a single product by slug (storefront)
export async function GET(_request, { params }) {
  const { slug } = await params;
  return handleGetById(slug, db.product, { where: { slug }, include: { category: true } }, "Product not found");
}

