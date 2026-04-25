import ShopProductsClient from "@/components/client/ShopProductsClient";
import Decorations from "@/components/client/Decorations";

export const metadata = {
  title: "Products | The Crumbs",
};

export default function ProductsPage() {
  return (
    <div className="relative">
      <Decorations />
      <ShopProductsClient />
    </div>
  );
}
