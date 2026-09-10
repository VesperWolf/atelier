"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getCollections() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("collections")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  if (error) throw error;
  return data;
}

export async function getAllCollections() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("collections")
    .select("*")
    .order("sort_order");

  if (error) throw error;
  return data;
}

export async function getLatticeStyles(collectionId?: string) {
  const supabase = await createServerSupabaseClient();
  let query = supabase.from("lattice_styles").select("*").order("sort_order");

  if (collectionId) {
    query = query.eq("collection_id", collectionId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getAllLatticeStyles() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("lattice_styles")
    .select("*, collection:collections(*)")
    .order("sort_order");

  if (error) throw error;
  return data;
}
