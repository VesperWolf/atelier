import { getProducts } from "@/lib/actions/products";
import {
  getOptionCategoriesWithValues,
  getProductOptionCategories,
} from "@/lib/actions/options";
import type { Product, OptionCategory, OptionValue } from "@/types/database";
import AdminQuoteBuilderClient from "./AdminQuoteBuilderClient";

type ProductOptionCategoryLink = {
  product_id: string;
  category_id: string;
  is_required: boolean;
  category?: OptionCategory & { values?: OptionValue[] };
};

export default async function AdminQuoteBuilderPage() {
  const [products, optionCategoriesWithValues, productOptionCategories] =
    await Promise.all([
      getProducts({ isActive: true }),
      getOptionCategoriesWithValues(),
      getProductOptionCategories(),
    ]);

  return (
    <AdminQuoteBuilderClient
      products={products as Product[]}
      optionCategoriesWithValues={optionCategoriesWithValues}
      productOptionCategories={productOptionCategories as ProductOptionCategoryLink[]}
    />
  );
}
