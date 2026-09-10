"use server";

import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Order } from "@/types/database";

export async function getOrders(filters?: { status?: string; search?: string }) {
  const supabase = await createServerSupabaseClient();
  let query = supabase
    .from("orders")
    .select(`
      *,
      items:order_items(
        *,
        product:products(*),
        sku:product_skus(*),
        options:order_item_options(
          *,
          option_value:option_values(*)
        )
      )
    `)
    .order("created_at", { ascending: false });

  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.search) {
    query = query.or(
      `customer_name.ilike.%${filters.search}%,customer_email.ilike.%${filters.search}%,order_number.ilike.%${filters.search}%`
    );
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getOrderById(id: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      customer:customers(*),
      items:order_items(
        *,
        product:products(*),
        sku:product_skus(*),
        options:order_item_options(
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

export async function createOrder(
  orderData: Omit<Order, "id" | "created_at" | "updated_at">,
  items: {
    product_id: string;
    sku_id?: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    option_value_ids?: string[];
  }[]
) {
  const supabase = createServiceRoleClient();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert(orderData)
    .select()
    .single();

  if (orderError) throw orderError;

  for (const item of items) {
    const { data: orderItem, error: itemError } = await supabase
      .from("order_items")
      .insert({
        order_id: order.id,
        product_id: item.product_id,
        sku_id: item.sku_id ?? null,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
      })
      .select()
      .single();

    if (itemError) throw itemError;

    if (item.option_value_ids && item.option_value_ids.length > 0) {
      const optionInserts = item.option_value_ids.map((ovId) => ({
        order_item_id: orderItem.id,
        option_value_id: ovId,
        price_modifier: 0,
      }));
      await supabase.from("order_item_options").insert(optionInserts);
    }
  }

  revalidatePath("/admin/orders");
  return order;
}

export async function updateOrderStatus(id: string, status: string) {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/admin/orders");
  return data;
}

export async function updatePaymentStatus(id: string, paymentStatus: string) {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("orders")
    .update({ payment_status: paymentStatus })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/admin/orders");
  return data;
}

export async function getRecentOrderCount() {
  const supabase = await createServerSupabaseClient();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { count, error } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .gte("created_at", thirtyDaysAgo.toISOString());

  if (error) throw error;
  return count ?? 0;
}
