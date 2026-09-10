import { getOrders } from "@/lib/actions/orders";
import type { Order } from "@/types/database";
import AdminOrdersClient from "./AdminOrdersClient";

export default async function AdminOrdersPage() {
  const orders = await getOrders();
  return (
    <AdminOrdersClient
      initialOrders={
        orders as (Order & {
          items?: Array<{
            id: string;
            quantity: number;
            total_price: number;
            product?: { name?: string };
          }>;
        })[]
      }
    />
  );
}
