"use server";

import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { PageSection } from "@/types/database";

export async function getPageSections(pageSlug: string = "homepage") {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("page_sections")
    .select("*")
    .eq("page_slug", pageSlug)
    .order("display_order");

  if (error) throw error;
  return data;
}

export async function getVisiblePageSections(pageSlug: string = "homepage") {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("page_sections")
    .select("*")
    .eq("page_slug", pageSlug)
    .eq("is_visible", true)
    .order("display_order");

  if (error) throw error;
  return data;
}

export async function createSection(
  data: Omit<PageSection, "id" | "created_at" | "updated_at">
) {
  const supabase = createServiceRoleClient();
  const { data: result, error } = await supabase
    .from("page_sections")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/admin/page-builder");
  revalidatePath("/");
  return result;
}

export async function updateSection(
  id: string,
  data: Partial<PageSection>
) {
  const supabase = createServiceRoleClient();
  const { data: result, error } = await supabase
    .from("page_sections")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/admin/page-builder");
  revalidatePath("/");
  return result;
}

export async function deleteSection(id: string) {
  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("page_sections")
    .delete()
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/admin/page-builder");
  revalidatePath("/");
}

export async function reorderSections(
  sectionIds: string[]
) {
  const supabase = createServiceRoleClient();

  const updates = sectionIds.map((id, index) =>
    supabase
      .from("page_sections")
      .update({ display_order: index })
      .eq("id", id)
  );

  await Promise.all(updates);
  revalidatePath("/admin/page-builder");
  revalidatePath("/");
}

export async function toggleSectionVisibility(id: string, isVisible: boolean) {
  return updateSection(id, { is_visible: isVisible } as Partial<PageSection>);
}
