"use server";

import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Quote, QuoteItem, QuoteItemOption } from "@/types/database";

export async function getQuotes(filters?: { status?: string; search?: string }) {
  const supabase = await createServerSupabaseClient();
  let query = supabase
    .from("quotes")
    .select(`
      *,
      items:quote_items(
        *,
        product:products(*),
        sku:product_skus(*)
      )
    `)
    .order("created_at", { ascending: false });

  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.search) {
    query = query.or(
      `customer_name.ilike.%${filters.search}%,customer_email.ilike.%${filters.search}%,quote_number.ilike.%${filters.search}%`
    );
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getQuoteById(id: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("quotes")
    .select(`
      *,
      customer:customers(*),
      items:quote_items(
        *,
        product:products(*),
        sku:product_skus(*),
        options:quote_item_options(
          *,
          option_value:option_values(*)
        )
      )
    `)
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createQuote(
  quoteData: Omit<Quote, "id" | "created_at" | "updated_at">,
  items: {
    product_id: string;
    sku_id?: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    notes?: string;
    option_value_ids?: string[];
  }[]
) {
  const supabase = createServiceRoleClient();

  const { data: quote, error: quoteError } = await supabase
    .from("quotes")
    .insert(quoteData)
    .select()
    .single();

  if (quoteError) throw quoteError;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const { data: quoteItem, error: itemError } = await supabase
      .from("quote_items")
      .insert({
        quote_id: quote.id,
        product_id: item.product_id,
        sku_id: item.sku_id ?? null,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        notes: item.notes ?? null,
        sort_order: i,
      })
      .select()
      .single();

    if (itemError) throw itemError;

    if (item.option_value_ids && item.option_value_ids.length > 0) {
      const optionInserts = item.option_value_ids.map((ovId) => ({
        quote_item_id: quoteItem.id,
        option_value_id: ovId,
        price_modifier: 0,
      }));
      await supabase.from("quote_item_options").insert(optionInserts);
    }
  }

  revalidatePath("/admin/quotes");
  return quote;
}

export async function updateQuoteStatus(id: string, status: string) {
  const supabase = createServiceRoleClient();
  const updateData: Record<string, unknown> = { status };

  if (status === "sent") updateData.sent_at = new Date().toISOString();
  if (status === "viewed") updateData.viewed_at = new Date().toISOString();
  if (status === "accepted") updateData.accepted_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("quotes")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/admin/quotes");
  return data;
}

export async function deleteQuote(id: string) {
  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("quotes").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/quotes");
}

export async function getPendingQuoteCount() {
  const supabase = await createServerSupabaseClient();
  const { count, error } = await supabase
    .from("quotes")
    .select("*", { count: "exact", head: true })
    .in("status", ["draft", "sent"]);

  if (error) throw error;
  return count ?? 0;
}
