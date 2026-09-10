"use server";

import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Consultation } from "@/types/database";

export async function getConsultations(filters?: {
  status?: string;
  search?: string;
}) {
  const supabase = await createServerSupabaseClient();
  let query = supabase
    .from("consultations")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.search) {
    query = query.or(
      `customer_name.ilike.%${filters.search}%,customer_email.ilike.%${filters.search}%`
    );
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getConsultationById(id: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("consultations")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function submitConsultation(
  data: Omit<Consultation, "id" | "created_at" | "updated_at" | "status" | "internal_notes">
) {
  const supabase = await createServerSupabaseClient();
  const { data: result, error } = await supabase
    .from("consultations")
    .insert({ ...data, status: "pending" })
    .select()
    .single();

  if (error) throw error;
  return result;
}

export async function updateConsultationStatus(id: string, status: string) {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("consultations")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/admin/consultations");
  return data;
}

export async function addConsultationNotes(id: string, notes: string) {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("consultations")
    .update({ internal_notes: notes })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/admin/consultations");
  return data;
}

export async function getUpcomingConsultationCount() {
  const supabase = await createServerSupabaseClient();
  const { count, error } = await supabase
    .from("consultations")
    .select("*", { count: "exact", head: true })
    .in("status", ["pending", "confirmed"]);

  if (error) throw error;
  return count ?? 0;
}

export async function getConsultationStatusCounts() {
  const supabase = await createServerSupabaseClient();

  const [pending, confirmed, completed] = await Promise.all([
    supabase
      .from("consultations")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("consultations")
      .select("*", { count: "exact", head: true })
      .eq("status", "confirmed"),
    supabase
      .from("consultations")
      .select("*", { count: "exact", head: true })
      .eq("status", "completed"),
  ]);

  return {
    pending: pending.count ?? 0,
    confirmed: confirmed.count ?? 0,
    completed: completed.count ?? 0,
  };
}
