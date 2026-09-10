import Link from "next/link";
import {
  Package,
  Tag,
  FileText,
  ShoppingBag,
  Calendar,
  Plus,
  ArrowRight,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getProductCount, getActiveSkuCount } from "@/lib/actions/products";
import { getPendingQuoteCount, getQuotes } from "@/lib/actions/quotes";
import { getRecentOrderCount, getOrders } from "@/lib/actions/orders";
import {
  getUpcomingConsultationCount,
  getConsultations,
} from "@/lib/actions/consultations";
import { formatDistanceToNow } from "date-fns";

type RecentItem = {
  type: "order" | "quote" | "consultation";
  id: string;
  title: string;
  created_at: string;
  href: string;
};

async function getRecentItems(): Promise<RecentItem[]> {
  const [orders, quotes, consultations] = await Promise.all([
    getOrders(),
    getQuotes(),
    getConsultations(),
  ]);

  const items: RecentItem[] = [
    ...orders.slice(0, 5).map((o) => ({
      type: "order" as const,
      id: o.id,
      title: o.order_number ?? `Order ${o.id.slice(0, 8)}`,
      created_at: o.created_at,
      href: `/admin/orders/${o.id}`,
    })),
    ...quotes.slice(0, 5).map((q) => ({
      type: "quote" as const,
      id: q.id,
      title: q.quote_number ?? `Quote ${q.id.slice(0, 8)}`,
      created_at: q.created_at,
      href: `/admin/quotes/${q.id}`,
    })),
    ...consultations.slice(0, 5).map((c) => ({
      type: "consultation" as const,
      id: c.id,
      title: c.customer_name ?? "Consultation",
      created_at: c.created_at,
      href: `/admin/consultations/${c.id}`,
    })),
  ];

  items.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  return items.slice(0, 5);
}

const activityIcons = {
  order: ShoppingBag,
  quote: FileText,
  consultation: Calendar,
};

export default async function AdminDashboard() {
  const [totalProducts, activeSkus, pendingQuotes, recentOrders, upcomingConsultations, recentItems] =
    await Promise.all([
      getProductCount(),
      getActiveSkuCount(),
      getPendingQuoteCount(),
      getRecentOrderCount(),
      getUpcomingConsultationCount(),
      getRecentItems(),
    ]);

  const statCards = [
    {
      label: "Total Products",
      value: totalProducts,
      icon: Package,
      href: "/admin/products",
      color: "text-[#121212]",
      bgColor: "bg-[#EDEBE9]",
    },
    {
      label: "Active SKUs",
      value: activeSkus,
      icon: Tag,
      href: "/admin/products",
      color: "text-[#121212]",
      bgColor: "bg-[#121212]/10",
    },
    {
      label: "Pending Quotes",
      value: pendingQuotes,
      icon: FileText,
      href: "/admin/quotes",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Recent Orders",
      value: recentOrders,
      icon: ShoppingBag,
      href: "/admin/orders",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      label: "Upcoming Consultations",
      value: upcomingConsultations,
      icon: Calendar,
      href: "/admin/consultations",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-[#121212] font-sans">
          Dashboard
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of your store activity and key metrics.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer border-[#E8E3DD]">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bgColor}`}
                    >
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="mt-3">
                    <p className="text-2xl font-bold text-[#121212]">
                      {stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {stat.label}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent items */}
        <Card className="lg:col-span-2 border-[#E8E3DD]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold font-sans">
              Recent Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              {recentItems.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">
                  No recent orders, quotes, or consultations yet.
                </p>
              ) : (
                recentItems.map((item, index) => {
                  const Icon = activityIcons[item.type];
                  return (
                    <div key={`${item.type}-${item.id}`}>
                      <Link
                        href={item.href}
                        className="flex items-start gap-3 py-3 hover:bg-[#EDEBE9]/50 rounded-lg -mx-2 px-2 transition-colors"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EDEBE9]">
                          <Icon className="h-3.5 w-3.5 text-[#121212]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[#121212]">{item.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(item.created_at), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      </Link>
                      {index < recentItems.length - 1 && (
                        <Separator className="bg-[#E8E3DD]/60" />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick actions */}
        <Card className="border-[#E8E3DD]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold font-sans">
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/products/new" className="block">
              <Button
                variant="outline"
                className="w-full justify-start gap-2 h-11 border-[#E8E3DD] hover:bg-[#EDEBE9] hover:border-[#121212]/30"
              >
                <Plus className="h-4 w-4 text-[#121212]" />
                New Product
              </Button>
            </Link>
            <Link href="/admin/quotes/new" className="block">
              <Button
                variant="outline"
                className="w-full justify-start gap-2 h-11 border-[#E8E3DD] hover:bg-[#EDEBE9] hover:border-[#121212]/30"
              >
                <Plus className="h-4 w-4 text-[#121212]" />
                New Quote
              </Button>
            </Link>
            <Link href="/admin/orders" className="block">
              <Button
                variant="outline"
                className="w-full justify-start gap-2 h-11 border-[#E8E3DD] hover:bg-[#EDEBE9] hover:border-[#121212]/30"
              >
                <ShoppingBag className="h-4 w-4 text-[#121212]" />
                View Orders
              </Button>
            </Link>
            <Separator className="bg-[#E8E3DD]/60" />
            <Link href="/admin/consultations" className="block">
              <Button
                variant="outline"
                className="w-full justify-start gap-2 h-11 border-[#E8E3DD] hover:bg-[#EDEBE9] hover:border-[#121212]/30"
              >
                <Calendar className="h-4 w-4 text-[#121212]" />
                View Consultations
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
