"use client";

import { useState, useMemo, useTransition } from "react";
import {
  Search,
  MoreHorizontal,
  Eye,
  Truck,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { formatPriceDecimal } from "@/lib/utils";
import { updateOrderStatus, updatePaymentStatus } from "@/lib/actions/orders";
import { toast } from "sonner";

const orderStatusConfig: Record<
  string,
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50",
  },
  confirmed: {
    label: "Confirmed",
    className: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50",
  },
  in_production: {
    label: "In Production",
    className:
      "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-50",
  },
  shipped: {
    label: "Shipped",
    className: "bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-50",
  },
  delivered: {
    label: "Delivered",
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-50 text-red-700 border-red-200 hover:bg-red-50",
  },
};

const paymentStatusConfig: Record<
  string,
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50",
  },
  paid: {
    label: "Paid",
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50",
  },
  refunded: {
    label: "Refunded",
    className: "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-50",
  },
};

import type { Order } from "@/types/database";

interface OrderWithItems extends Order {
  items?: Array<{
    id: string;
    quantity: number;
    total_price: number;
    product?: { name?: string };
  }>;
}

interface AdminOrdersClientProps {
  initialOrders: OrderWithItems[];
}

export default function AdminOrdersClient({
  initialOrders,
}: AdminOrdersClientProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [isPending, startTransition] = useTransition();

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        search === "" ||
        order.order_number.toLowerCase().includes(search.toLowerCase()) ||
        order.customer_name.toLowerCase().includes(search.toLowerCase()) ||
        order.customer_email.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  const orderItems = (order: OrderWithItems) =>
    Array.isArray(order.items) ? order.items : [];

  function handleUpdateOrderStatus(orderId: string, newStatus: string) {
    startTransition(async () => {
      try {
        await updateOrderStatus(orderId, newStatus);
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? { ...o, status: newStatus as OrderWithItems["status"] }
              : o
          )
        );
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({
            ...selectedOrder,
            status: newStatus as OrderWithItems["status"],
          });
        }
        setShowStatusDialog(false);
        setSelectedOrder(null);
        toast.success("Order status updated");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to update status");
      }
    });
  }

  function handleUpdatePaymentStatus(orderId: string, newStatus: string) {
    startTransition(async () => {
      try {
        await updatePaymentStatus(orderId, newStatus);
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? { ...o, payment_status: newStatus as OrderWithItems["payment_status"] }
              : o
          )
        );
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({
            ...selectedOrder,
            payment_status: newStatus as OrderWithItems["payment_status"],
          });
        }
        setShowPaymentDialog(false);
        setSelectedOrder(null);
        toast.success("Payment status updated");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to update payment");
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-[#121212] font-sans">
          Orders
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage customer orders and fulfillment.
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 border-[#E8E3DD]"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44 border-[#E8E3DD]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="in_production">In Production</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-[#E8E3DD] bg-white">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Order #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="text-center">Items</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => {
              const items = orderItems(order);
              const status = orderStatusConfig[order.status];
              const payment = paymentStatusConfig[order.payment_status];
              return (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-sm font-medium">
                    {order.order_number}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">
                        {order.customer_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.customer_email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-sm">
                    {items.length}
                  </TableCell>
                  <TableCell className="text-right font-medium text-sm">
                    {formatPriceDecimal(order.total)}
                  </TableCell>
                  <TableCell>
                    <Badge className={status?.className}>
                      {status?.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={payment?.className}>
                      {payment?.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(order.created_at)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowStatusDialog(true);
                          }}
                        >
                          <Truck className="mr-2 h-4 w-4" />
                          Update Status
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowPaymentDialog(true);
                          }}
                        >
                          <Package className="mr-2 h-4 w-4" />
                          Update Payment
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
            {filteredOrders.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-24 text-center text-muted-foreground"
                >
                  No orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Order Detail Dialog */}
      <Dialog
        open={!!selectedOrder && !showStatusDialog && !showPaymentDialog}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-mono">
              {selectedOrder?.order_number}
            </DialogTitle>
            <DialogDescription>
              Order placed on{" "}
              {selectedOrder ? formatDate(selectedOrder.created_at) : ""}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              {/* Customer info */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Customer
                </h4>
                <p className="text-sm font-medium">
                  {selectedOrder.customer_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedOrder.customer_email}
                </p>
                {selectedOrder.customer_phone && (
                  <p className="text-sm text-muted-foreground">
                    {selectedOrder.customer_phone}
                  </p>
                )}
              </div>

              <Separator className="bg-[#E8E3DD]/60" />

              {/* Shipping */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Shipping Address
                </h4>
                <p className="text-sm">
                  {selectedOrder.shipping_address_line1}
                </p>
                {selectedOrder.shipping_address_line2 && (
                  <p className="text-sm">
                    {selectedOrder.shipping_address_line2}
                  </p>
                )}
                <p className="text-sm">
                  {selectedOrder.shipping_city},{" "}
                  {selectedOrder.shipping_state}{" "}
                  {selectedOrder.shipping_zip}
                </p>
              </div>

              <Separator className="bg-[#E8E3DD]/60" />

              {/* Items */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Items
                </h4>
                <div className="space-y-2">
                  {orderItems(selectedOrder).map((item: { id: string; quantity: number; total_price: number; product?: { name?: string } }) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <div>
                        <span className="font-medium">
                          {item.product?.name ?? "Unknown Product"}
                        </span>
                        <span className="text-muted-foreground ml-2">
                          &times;{item.quantity}
                        </span>
                      </div>
                      <span className="font-medium">
                        {formatPriceDecimal(item.total_price)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="bg-[#E8E3DD]/60" />

              {/* Totals */}
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>
                    {formatPriceDecimal(selectedOrder.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>
                    {formatPriceDecimal(selectedOrder.tax_amount)}
                  </span>
                </div>
                {selectedOrder.shipping_amount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>
                      {formatPriceDecimal(selectedOrder.shipping_amount)}
                    </span>
                  </div>
                )}
                <Separator className="bg-[#E8E3DD]/60" />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatPriceDecimal(selectedOrder.total)}</span>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-3">
                <Badge
                  className={orderStatusConfig[selectedOrder.status]?.className}
                >
                  {orderStatusConfig[selectedOrder.status]?.label}
                </Badge>
                <Badge
                  className={
                    paymentStatusConfig[selectedOrder.payment_status]?.className
                  }
                >
                  {paymentStatusConfig[selectedOrder.payment_status]?.label}
                </Badge>
              </div>

              {selectedOrder.notes && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Notes
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedOrder.notes}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Change status for {selectedOrder?.order_number}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="flex flex-wrap gap-2 pt-2">
              {(
                [
                  "pending",
                  "confirmed",
                  "in_production",
                  "shipped",
                  "delivered",
                  "cancelled",
                ] as const
              ).map((status) => (
                <Button
                  key={status}
                  variant="outline"
                  size="sm"
                  className="border-[#E8E3DD]"
                  onClick={() => handleUpdateOrderStatus(selectedOrder.id, status)}
                  disabled={isPending}
                >
                  {orderStatusConfig[status]?.label}
                </Button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Update Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Update Payment Status</DialogTitle>
            <DialogDescription>
              Change payment status for {selectedOrder?.order_number}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="flex flex-wrap gap-2 pt-2">
              {(
                ["pending", "paid", "refunded"] as const
              ).map((status) => (
                <Button
                  key={status}
                  variant="outline"
                  size="sm"
                  className="border-[#E8E3DD]"
                  onClick={() =>
                    handleUpdatePaymentStatus(selectedOrder.id, status)
                  }
                  disabled={isPending}
                >
                  {paymentStatusConfig[status]?.label}
                </Button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
