"use server";

import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Product } from "@/types/database";

export async function getProducts(filters?: {
  category?: string;
  collectionId?: string;
  latticeStyleId?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  search?: string;
}) {
  const supabase = await createServerSupabaseClient();
  let query = supabase
    .from("products")
    .select(`
      *,
      collection:collections(*),
      lattice_style:lattice_styles(*),
      images:product_images(*),
      skus:product_skus(*)
    `)
    .order("sort_order")
    .order("created_at", { ascending: false });

  if (filters?.category) query = query.eq("category", filters.category);
  if (filters?.collectionId) query = query.eq("collection_id", filters.collectionId);
  if (filters?.latticeStyleId) query = query.eq("lattice_style_id", filters.latticeStyleId);
  if (filters?.isActive !== undefined) query = query.eq("is_active", filters.isActive);
  if (filters?.isFeatured) query = query.eq("is_featured", true);
  if (filters?.search) query = query.ilike("name", `%${filters.search}%`);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getProductById(id: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      collection:collections(*),
      lattice_style:lattice_styles(*),
      images:product_images(*),
      skus:product_skus(*),
      option_categories:product_option_categories(
        *,
        category:option_categories(
          *,
          values:option_values(*)
        )
      )
    `)
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function getProductBySlug(slug: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      collection:collections(*),
      lattice_style:lattice_styles(*),
      images:product_images(*),
      skus:product_skus(
        *,
        option_values:sku_option_values(
          *,
          option_value:option_values(*)
        )
      ),
      option_categories:product_option_categories(
        *,
        category:option_categories(
          *,
          values:option_values(*)
        )
      )
    `)
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data;
}

export async function createProduct(
  productData: Omit<Product, "id" | "created_at" | "updated_at">
) {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("products")
    .insert(productData)
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/admin/products");
  revalidatePath("/products");
  return data;
}

export async function updateProduct(id: string, productData: Partial<Product>) {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("products")
    .update(productData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  revalidatePath("/products");
  return data;
}

export async function deleteProduct(id: string) {
  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) throw error;
  revalidatePath("/admin/products");
  revalidatePath("/products");
}

export async function toggleProductActive(id: string, isActive: boolean) {
  return updateProduct(id, { is_active: isActive } as Partial<Product>);
}

export async function toggleProductFeatured(id: string, isFeatured: boolean) {
  return updateProduct(id, { is_featured: isFeatured } as Partial<Product>);
}

export async function getProductCount() {
  const supabase = await createServerSupabaseClient();
  const { count, error } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true });

  if (error) throw error;
  return count ?? 0;
}

export async function getActiveSkuCount() {
  const supabase = await createServerSupabaseClient();
  const { count, error } = await supabase
    .from("product_skus")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  if (error) throw error;
  return count ?? 0;
}

export async function getProductsWithOptionCategories() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      collection:collections(*),
      lattice_style:lattice_styles(*),
      images:product_images(*),
      skus:product_skus(*),
      option_categories:product_option_categories(
        *,
        category:option_categories(
          *,
          values:option_values(*)
        )
      )
    `)
    .eq("is_active", true)
    .order("sort_order");

  if (error) throw error;
  return data;
}

export async function getFeaturedProducts() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      collection:collections(*),
      lattice_style:lattice_styles(*),
      images:product_images(*)
    `)
    .eq("is_active", true)
    .eq("is_featured", true)
    .order("sort_order");

  if (error) throw error;
  return data;
}
