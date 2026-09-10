import { notFound } from "next/navigation";
import { getProductById } from "@/lib/actions/products";
import { getAllCollections, getAllLatticeStyles } from "@/lib/actions/collections";
import { getOptionCategoriesWithValues } from "@/lib/actions/options";
import { ProductEditor } from "./product-editor";
import type {
  Product,
  ProductImage,
  ProductSku,
  Collection,
  LatticeStyle,
  OptionCategory,
  OptionValue,
} from "@/types/database";

interface OptionCategoryWithValues extends OptionCategory {
  values?: OptionValue[];
}

interface ProductWithRelations extends Product {
  images?: ProductImage[];
  skus?: ProductSku[];
  option_categories?: Array<{ category_id: string }>;
}

export default async function AdminProductEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const isNew = id === "new";

  const [collections, latticeStyles, optionCategories] = await Promise.all([
    getAllCollections(),
    getAllLatticeStyles(),
    getOptionCategoriesWithValues(),
  ]);

  let product: ProductWithRelations | null = null;
  if (!isNew) {
    try {
      product = await getProductById(id);
    } catch {
      notFound();
    }
  }

  const assignedCategoryIds =
    product?.option_categories?.map((oc) => oc.category_id) ?? [];

  return (
    <ProductEditor
      productId={id}
      product={product}
      collections={collections}
      latticeStyles={latticeStyles}
      optionCategories={optionCategories}
      initialAssignedCategoryIds={assignedCategoryIds}
    />
  );
}
