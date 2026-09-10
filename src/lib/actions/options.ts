"use server";

import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { OptionCategory, OptionValue } from "@/types/database";

export async function getOptionCategories() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("option_categories")
    .select("*")
    .order("sort_order");

  if (error) throw error;
  return data;
}

export async function getOptionCategoriesWithValues() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("option_categories")
    .select("*, values:option_values(*)")
    .order("sort_order");

  if (error) throw error;
  return data;
}

export async function getOptionValues(categoryId?: string) {
  const supabase = await createServerSupabaseClient();
  let query = supabase.from("option_values").select("*").order("sort_order");

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function createOptionCategory(
  data: Omit<OptionCategory, "id" | "created_at">
) {
  const supabase = createServiceRoleClient();
  const { data: result, error } = await supabase
    .from("option_categories")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/admin/options");
  return result;
}

export async function updateOptionCategory(
  id: string,
  data: Partial<OptionCategory>
) {
  const supabase = createServiceRoleClient();
  const { data: result, error } = await supabase
    .from("option_categories")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/admin/options");
  return result;
}

export async function deleteOptionCategory(id: string) {
  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("option_categories")
    .delete()
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/admin/options");
}

export async function createOptionValue(
  data: Omit<OptionValue, "id" | "created_at">
) {
  const supabase = createServiceRoleClient();
  const { data: result, error } = await supabase
    .from("option_values")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/admin/options");
  return result;
}

export async function updateOptionValue(
  id: string,
  data: Partial<OptionValue>
) {
  const supabase = createServiceRoleClient();
  const { data: result, error } = await supabase
    .from("option_values")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/admin/options");
  return result;
}

export async function deleteOptionValue(id: string) {
  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("option_values")
    .delete()
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/admin/options");
}

export async function getProductOptionCategories(productId?: string) {
  const supabase = await createServerSupabaseClient();
  let query = supabase
    .from("product_option_categories")
    .select("*, category:option_categories(*, values:option_values(*))");
  if (productId) {
    query = query.eq("product_id", productId);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function assignOptionCategoryToProduct(
  productId: string,
  categoryId: string,
  isRequired: boolean = true
) {
  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("product_option_categories")
    .insert({ product_id: productId, category_id: categoryId, is_required: isRequired });

  if (error) throw error;
  revalidatePath(`/admin/products/${productId}`);
}

export async function removeOptionCategoryFromProduct(
  productId: string,
  categoryId: string
) {
  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("product_option_categories")
    .delete()
    .eq("product_id", productId)
    .eq("category_id", categoryId);

  if (error) throw error;
  revalidatePath(`/admin/products/${productId}`);
}
