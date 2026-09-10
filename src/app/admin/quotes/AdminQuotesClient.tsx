"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search, Eye, MoreHorizontal, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { formatPriceDecimal } from "@/lib/utils";
import { deleteQuote, updateQuoteStatus } from "@/lib/actions/quotes";
import { toast } from "sonner";

const statusConfig: Record<
  string,
  { label: string; className: string }
> = {
  draft: {
    label: "Draft",
    className: "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-50",
  },
  sent: {
    label: "Sent",
    className: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50",
  },
  viewed: {
    label: "Viewed",
    className:
      "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50",
  },
  accepted: {
    label: "Accepted",
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50",
  },
  declined: {
    label: "Declined",
    className: "bg-red-50 text-red-700 border-red-200 hover:bg-red-50",
  },
  expired: {
    label: "Expired",
    className: "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-50",
  },
};

import type { Quote } from "@/types/database";

interface QuoteWithItems extends Quote {
  items?: unknown[];
}

interface AdminQuotesClientProps {
  initialQuotes: QuoteWithItems[];
}

export default function AdminQuotesClient({
  initialQuotes,
}: AdminQuotesClientProps) {
  const [quotes, setQuotes] = useState(initialQuotes);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const filteredQuotes = useMemo(() => {
    return quotes.filter((quote) => {
      const matchesSearch =
        search === "" ||
        quote.quote_number.toLowerCase().includes(search.toLowerCase()) ||
        quote.customer_name.toLowerCase().includes(search.toLowerCase()) ||
        (quote.customer_company ?? "")
          .toLowerCase()
          .includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || quote.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [quotes, search, statusFilter]);

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function handleSend(quoteId: string) {
    startTransition(async () => {
      try {
        await updateQuoteStatus(quoteId, "sent");
        setQuotes((prev) =>
          prev.map((q) =>
            q.id === quoteId ? { ...q, status: "sent" as const } : q
          )
        );
        toast.success("Quote sent to customer");
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to send quote");
      }
    });
  }

  function handleDelete(quoteId: string) {
    startTransition(async () => {
      try {
        await deleteQuote(quoteId);
        setQuotes((prev) => prev.filter((q) => q.id !== quoteId));
        toast.success("Quote deleted");
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to delete quote");
      }
    });
  }

  const itemsCount = (quote: QuoteWithItems) =>
    Array.isArray(quote.items) ? quote.items.length : 0;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-[#121212] font-sans">
            Quotes
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage customer quotes and proposals.
          </p>
        </div>
        <Link href="/admin/quotes/new">
          <Button className="gap-2 bg-[#121212] hover:bg-[#121212]/90">
            <Plus className="h-4 w-4" />
            New Quote
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search quotes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 border-[#E8E3DD]"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 border-[#E8E3DD]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="viewed">Viewed</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="declined">Declined</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-[#E8E3DD] bg-white">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Quote #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Company</TableHead>
              <TableHead className="text-center">Items</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredQuotes.map((quote) => {
              const status = statusConfig[quote.status];
              return (
                <TableRow key={quote.id}>
                  <TableCell className="font-mono text-sm font-medium">
                    {quote.quote_number}
                  </TableCell>
                  <TableCell className="text-sm">
                    {quote.customer_name}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {quote.customer_company || "—"}
                  </TableCell>
                  <TableCell className="text-center text-sm">
                    {itemsCount(quote)}
                  </TableCell>
                  <TableCell className="text-right font-medium text-sm">
                    {formatPriceDecimal(quote.total)}
                  </TableCell>
                  <TableCell>
                    <Badge className={status?.className}>
                      {status?.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(quote.created_at)}
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
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        {quote.status === "draft" && (
                          <DropdownMenuItem
                            onClick={() => handleSend(quote.id)}
                            disabled={isPending}
                          >
                            <Send className="mr-2 h-4 w-4" />
                            Send to Customer
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDelete(quote.id)}
                          disabled={isPending}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
            {filteredQuotes.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-24 text-center text-muted-foreground"
                >
                  No quotes found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
