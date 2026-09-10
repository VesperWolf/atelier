"use server";

import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { ProductSku } from "@/types/database";

export async function getSkusForProduct(productId: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("product_skus")
    .select(`
      *,
      option_values:sku_option_values(
        *,
        option_value:option_values(
          *,
          category:option_categories(*)
        )
      )
    `)
    .eq("product_id", productId)
    .order("created_at");

  if (error) throw error;
  return data;
}

export async function createSku(
  skuData: Omit<ProductSku, "id" | "created_at" | "updated_at">,
  optionValueIds?: string[]
) {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("product_skus")
    .insert(skuData)
    .select()
    .single();

  if (error) throw error;

  if (optionValueIds && optionValueIds.length > 0) {
    const mappings = optionValueIds.map((valueId) => ({
      sku_id: data.id,
      option_value_id: valueId,
    }));
    const { error: mappingError } = await supabase
      .from("sku_option_values")
      .insert(mappings);
    if (mappingError) throw mappingError;
  }

  revalidatePath(`/admin/products/${skuData.product_id}`);
  return data;
}

export async function updateSku(id: string, skuData: Partial<ProductSku>) {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("product_skus")
    .update(skuData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/admin/products");
  return data;
}

export async function deleteSku(id: string, productId: string) {
  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("product_skus").delete().eq("id", id);

  if (error) throw error;
  revalidatePath(`/admin/products/${productId}`);
}

export async function assignOptionValuesToSku(
  skuId: string,
  optionValueIds: string[]
) {
  const supabase = createServiceRoleClient();

  await supabase.from("sku_option_values").delete().eq("sku_id", skuId);

  if (optionValueIds.length > 0) {
    const mappings = optionValueIds.map((valueId) => ({
      sku_id: skuId,
      option_value_id: valueId,
    }));
    const { error } = await supabase
      .from("sku_option_values")
      .insert(mappings);
    if (error) throw error;
  }
}
