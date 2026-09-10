"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPrice } from "@/lib/utils";
import { deleteProduct } from "@/lib/actions/products";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { ProductImage } from "@/types/database";

type ProductWithRelations = {
  id: string;
  name: string;
  slug: string;
  category: string;
  base_price: number;
  is_active: boolean;
  images?: ProductImage[] | null;
  lattice_style?: { name: string } | null;
  skus?: unknown[];
};

interface ProductsTableProps {
  products: ProductWithRelations[];
}

function getPrimaryImage(images: ProductImage[] | null | undefined) {
  if (!images || images.length === 0) return null;
  const primary = images.find((img) => img.is_primary);
  return primary ?? images[0];
}

export function ProductsTable({ products }: ProductsTableProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const categories = useMemo(() => {
    const cats = [...new Set(products.map((p) => p.category))];
    return cats.filter(Boolean).sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        search === "" ||
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.slug.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        categoryFilter === "all" || product.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, categoryFilter]);

  function handleDelete(id: string) {
    startTransition(async () => {
      try {
        await deleteProduct(id);
        toast.success("Product deleted");
        router.refresh();
      } catch {
        toast.error("Failed to delete product");
      }
    });
  }

  return (
    <>
      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 border-[#E8E3DD]"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-44 border-[#E8E3DD]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-[#E8E3DD] bg-white">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-16">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Lattice Style</TableHead>
              <TableHead className="text-right">Base Price</TableHead>
              <TableHead>SKUs</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => {
              const primaryImage = getPrimaryImage(product.images ?? null);
              const skuCount = product.skus?.length ?? 0;
              return (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-[#EDEBE9]">
                      {primaryImage?.url ? (
                        <Image
                          src={primaryImage.url}
                          alt={primaryImage.alt_text ?? product.name}
                          width={40}
                          height={40}
                          className="h-10 w-10 object-cover"
                          unoptimized
                        />
                      ) : (
                        <ImageIcon className="h-4 w-4 text-[#8A8578]" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="font-medium text-[#121212] hover:text-[#121212] transition-colors"
                    >
                      {product.name}
                    </Link>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {product.slug}
                    </p>
                  </TableCell>
                  <TableCell className="text-sm">
                    {product.category}
                  </TableCell>
                  <TableCell className="text-sm">
                    {product.lattice_style?.name ?? "—"}
                  </TableCell>
                  <TableCell className="text-right font-medium text-sm">
                    {formatPrice(product.base_price)}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {skuCount} SKU{skuCount !== 1 ? "s" : ""}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        product.is_active
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                          : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-50"
                      }
                    >
                      {product.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/products/${product.id}`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          disabled={isPending}
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
            {filteredProducts.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-24 text-center text-muted-foreground"
                >
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
