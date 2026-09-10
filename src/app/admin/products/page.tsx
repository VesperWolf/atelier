import Link from "next/link";
import { Plus } from "lucide-react";
import { getProducts } from "@/lib/actions/products";
import { Button } from "@/components/ui/button";
import { ProductsTable } from "./products-table";

export default async function AdminProductsPage() {
  const products = await getProducts();

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-[#121212] font-sans">
            Products
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your product catalog.
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button className="gap-2 bg-[#121212] hover:bg-[#121212]/90">
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      <ProductsTable products={products ?? []} />
    </div>
  );
}
