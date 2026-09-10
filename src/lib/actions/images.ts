"use server";

import { createServiceRoleClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function uploadProductImage(
  productId: string,
  formData: FormData
) {
  const file = formData.get("file") as File;
  if (!file) throw new Error("No file provided");

  const supabase = createServiceRoleClient();

  const fileExt = file.name.split(".").pop();
  const fileName = `${productId}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage
    .from("product-images")
    .getPublicUrl(fileName);

  const existingImages = await supabase
    .from("product_images")
    .select("id")
    .eq("product_id", productId);

  const isPrimary = !existingImages.data || existingImages.data.length === 0;
  const sortOrder = existingImages.data?.length ?? 0;

  const { data, error } = await supabase
    .from("product_images")
    .insert({
      product_id: productId,
      url: urlData.publicUrl,
      alt_text: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
      is_primary: isPrimary,
      sort_order: sortOrder,
    })
    .select()
    .single();

  if (error) throw error;

  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/products");
  return data;
}

export async function deleteProductImage(imageId: string, productId: string) {
  const supabase = createServiceRoleClient();

  const { data: image } = await supabase
    .from("product_images")
    .select("url, is_primary")
    .eq("id", imageId)
    .single();

  if (image?.url) {
    const path = image.url.split("/product-images/").pop();
    if (path) {
      await supabase.storage.from("product-images").remove([path]);
    }
  }

  const { error } = await supabase
    .from("product_images")
    .delete()
    .eq("id", imageId);

  if (error) throw error;

  if (image?.is_primary) {
    const { data: remaining } = await supabase
      .from("product_images")
      .select("id")
      .eq("product_id", productId)
      .order("sort_order")
      .limit(1);

    if (remaining && remaining.length > 0) {
      await supabase
        .from("product_images")
        .update({ is_primary: true })
        .eq("id", remaining[0].id);
    }
  }

  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/products");
}

export async function setPrimaryImage(imageId: string, productId: string) {
  const supabase = createServiceRoleClient();

  await supabase
    .from("product_images")
    .update({ is_primary: false })
    .eq("product_id", productId);

  const { error } = await supabase
    .from("product_images")
    .update({ is_primary: true })
    .eq("id", imageId);

  if (error) throw error;

  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/products");
}

export async function reorderImages(
  productId: string,
  imageIds: string[]
) {
  const supabase = createServiceRoleClient();

  const updates = imageIds.map((id, index) =>
    supabase
      .from("product_images")
      .update({ sort_order: index })
      .eq("id", id)
  );

  await Promise.all(updates);
  revalidatePath(`/admin/products/${productId}`);
}

export async function updateImageAltText(imageId: string, altText: string, productId: string) {
  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("product_images")
    .update({ alt_text: altText })
    .eq("id", imageId);

  if (error) throw error;
  revalidatePath(`/admin/products/${productId}`);
}

export async function uploadSiteAsset(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) throw new Error("No file provided");

  const supabase = createServiceRoleClient();
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("site-assets")
    .upload(fileName, file, { cacheControl: "3600", upsert: false });

  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage
    .from("site-assets")
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}
