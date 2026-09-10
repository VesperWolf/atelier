"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/consultation", label: "Book A Consult" },
  { href: "/products", label: "Trade" },
  { href: "/products", label: "Homeowner" },
  { href: "/our-atelier", label: "Our Atelier" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const itemCount = useCartStore((s) => s.getItemCount());
  const toggleCart = useCartStore((s) => s.toggleCart);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          scrolled
            ? "bg-[#EDEBE9]/95 backdrop-blur-sm"
            : "bg-transparent"
        )}
      >
        <div className="relative mx-auto flex h-14 max-w-[1400px] items-center justify-between px-5 lg:h-16">
          {/* Left: A mark */}
          <Link href="/" className="relative z-10">
            <span
              className={cn(
                "font-sans text-xl font-light transition-colors duration-500",
                scrolled ? "text-[#121212]" : "text-[#121212]/70"
              )}
            >
              A
            </span>
          </Link>

          {/* Center: Brand name */}
          <Link
            href="/"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <span
              className={cn(
                "font-sans text-[13px] tracking-[0.35em] uppercase transition-colors duration-500",
                scrolled ? "text-[#121212]" : "text-[#121212]/70"
              )}
            >
              Atelier Artizan
            </span>
          </Link>

          {/* Right: Cart + Menu */}
          <div className="relative z-10 flex items-center gap-3">
            <button
              onClick={toggleCart}
              aria-label="Shopping cart"
              className="relative p-1.5 text-[#121212]/50 transition-colors duration-300 hover:text-[#121212]"
            >
              <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center bg-[#121212] text-[7px] font-bold text-[#F3F3F3]">
                  {itemCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="p-1.5 text-[#121212]/50 transition-colors duration-300 hover:text-[#121212] lg:hidden"
            >
              <Menu className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] bg-[#EDEBE9]">
          <div className="flex h-14 items-center justify-between px-5">
            <span className="font-sans text-xl font-light text-[#121212]">A</span>
            <button
              onClick={() => setMobileOpen(false)}
              className="p-1.5 text-[#121212]"
            >
              <X className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
          <nav className="flex flex-col items-center pt-20 gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="font-mono text-sm tracking-[0.15em] text-[#121212]/60 transition-colors hover:text-[#121212]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
