"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Palette,
  FileText,
  ShoppingBag,
  Calendar,
  LayoutGrid,
  Settings,
  ExternalLink,
  PanelLeftClose,
  PanelLeft,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useState, useTransition } from "react";
import { signOut } from "@/lib/actions/auth";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/options", label: "Options", icon: Palette },
  { href: "/admin/page-builder", label: "Page Builder", icon: LayoutGrid },
  { href: "/admin/quotes", label: "Quotes", icon: FileText },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/consultations", label: "Consultations", icon: Calendar },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [isSigningOut, startSignOut] = useTransition();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  function handleSignOut() {
    startSignOut(async () => {
      await signOut();
    });
  }

  return (
    <div className="flex h-screen bg-[#EDEBE9] font-sans">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col border-r border-[#E8E3DD] bg-white transition-all duration-200",
          collapsed ? "w-16" : "w-60"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-[#E8E3DD] px-4">
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-[0.15em] text-[#121212]">
                ATELIER ARTIZAN
              </span>
              <span className="text-[10px] tracking-widest text-muted-foreground uppercase">
                Admin
              </span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 text-muted-foreground hover:text-foreground",
              collapsed && "mx-auto"
            )}
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-[#EDEBE9] text-[#121212]"
                    : "text-muted-foreground hover:bg-[#EDEBE9]/60 hover:text-[#121212]",
                  collapsed && "justify-center px-2"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0",
                    active && "text-[#121212]"
                  )}
                />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-[#E8E3DD] p-2 space-y-1">
          <Link
            href="/"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-[#EDEBE9]/60 hover:text-[#121212] transition-colors",
              collapsed && "justify-center px-2"
            )}
          >
            <ExternalLink className="h-4 w-4 shrink-0" />
            {!collapsed && <span>View Storefront</span>}
          </Link>
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-red-50 hover:text-red-700 transition-colors",
              collapsed && "justify-center px-2"
            )}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{isSigningOut ? "Signing out..." : "Sign Out"}</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 items-center justify-between border-b border-[#E8E3DD] bg-white px-6">
          <h1 className="text-lg font-semibold tracking-wide text-[#121212] font-sans">
            Admin Panel
          </h1>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-[#8A8578] hover:text-[#121212] transition-colors flex items-center gap-1.5"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Storefront
            </Link>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-[#121212] flex items-center justify-center text-white text-xs font-semibold">
                AA
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
