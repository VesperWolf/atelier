"use server";

import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getSiteSetting(key: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("key", key)
    .maybeSingle();

  if (error) throw error;
  return data?.value ?? null;
}

export async function getAllSiteSettings() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .order("key");

  if (error) throw error;

  const settings: Record<string, Record<string, unknown>> = {};
  data?.forEach((row) => {
    settings[row.key] = row.value;
  });
  return settings;
}

export async function upsertSiteSetting(
  key: string,
  value: Record<string, unknown>
) {
  const supabase = createServiceRoleClient();

  const { data: existing } = await supabase
    .from("site_settings")
    .select("id")
    .eq("key", key)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("site_settings")
      .update({ value })
      .eq("key", key);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("site_settings")
      .insert({ key, value });
    if (error) throw error;
  }

  revalidatePath("/admin/settings");
  revalidatePath("/");
}

export async function deleteSiteSetting(key: string) {
  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("site_settings")
    .delete()
    .eq("key", key);

  if (error) throw error;
  revalidatePath("/admin/settings");
}
