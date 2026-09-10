"use client";

import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { formatPrice } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function CartDrawer() {
  const isOpen = useCartStore((s) => s.isOpen);
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const getItemCount = useCartStore((s) => s.getItemCount);
  const closeCart = useCartStore((s) => s.closeCart);
  const openCart = useCartStore((s) => s.openCart);

  const itemCount = getItemCount();
  const subtotal = getSubtotal();

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => (open ? openCart() : closeCart())}
    >
      <SheetContent
        side="right"
        className="flex w-full flex-col border-l-[#121212]/10 bg-[#EDEBE9] sm:max-w-md"
      >
        <SheetHeader>
          <SheetTitle className="font-sans text-xl tracking-wide text-[#121212]">
            Your Cart
          </SheetTitle>
          <SheetDescription className="text-sm text-[#121212]/50">
            {itemCount === 0
              ? "Your cart is empty"
              : `${itemCount} ${itemCount === 1 ? "item" : "items"} in your cart`}
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          /* Empty state */
          <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#EDEBE9]">
              <ShoppingBag
                className="h-8 w-8 text-[#121212]"
                strokeWidth={1.5}
              />
            </div>
            <div>
              <p className="font-sans text-lg text-[#121212]">
                Nothing here yet
              </p>
              <p className="mt-1 text-sm text-[#121212]/50">
                Explore our Heritage Collection to find your perfect piece.
              </p>
            </div>
            <Button
              variant="accent"
              size="lg"
              className="rounded-none tracking-[0.1em] uppercase"
              asChild
              onClick={closeCart}
            >
              <Link href="/products">Browse Products</Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Cart items */}
            <div className="flex-1 overflow-y-auto py-4">
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="group rounded-lg bg-white p-4">
                    <div className="flex gap-4">
                      {/* Placeholder thumbnail */}
                      <div className="h-20 w-20 shrink-0 rounded-md bg-gradient-to-br from-[#121212]/20 to-[#121212]/10" />

                      <div className="flex-1 min-w-0">
                        <h4 className="font-sans text-sm font-medium text-[#121212] truncate">
                          {item.product.name}
                        </h4>

                        {/* Selected options */}
                        {item.selectedOptions.length > 0 && (
                          <div className="mt-1 space-y-0.5">
                            {item.selectedOptions.map((opt, i) => (
                              <p
                                key={i}
                                className="text-xs text-[#121212]/50"
                              >
                                {opt.category.name}: {opt.value.name}
                              </p>
                            ))}
                          </div>
                        )}

                        <p className="mt-2 text-sm font-medium text-[#121212]">
                          {formatPrice(item.unitPrice)}
                        </p>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeItem(index)}
                        className="h-fit p-1 text-[#121212]/30 transition-colors hover:text-destructive"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Quantity controls */}
                    <div className="mt-3 flex items-center gap-3">
                      <button
                        onClick={() =>
                          updateQuantity(
                            index,
                            Math.max(1, item.quantity - 1)
                          )
                        }
                        className="flex h-7 w-7 items-center justify-center rounded border border-[#E8E3DD] text-[#121212]/60 transition-colors hover:border-[#121212] hover:text-[#121212]"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="min-w-[1.5rem] text-center text-sm font-medium text-[#121212]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(index, item.quantity + 1)
                        }
                        className="flex h-7 w-7 items-center justify-center rounded border border-[#E8E3DD] text-[#121212]/60 transition-colors hover:border-[#121212] hover:text-[#121212]"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                      <span className="ml-auto text-sm font-medium text-[#121212]">
                        {formatPrice(item.totalPrice)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-[#E8E3DD] pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#121212]/60">Subtotal</span>
                <span className="font-sans text-lg font-medium text-[#121212]">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <p className="mt-1 text-xs text-[#121212]/40">
                Shipping &amp; taxes calculated at checkout
              </p>

              <Separator className="my-4 bg-[#E8E3DD]" />

              <div className="space-y-3">
                <Button
                  variant="default"
                  size="lg"
                  className="w-full rounded-none tracking-[0.1em] uppercase"
                  asChild
                  onClick={closeCart}
                >
                  <Link href="/checkout">Proceed to Checkout</Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full rounded-none tracking-[0.1em] uppercase"
                  asChild
                  onClick={closeCart}
                >
                  <Link href="/consultation">Request Quote</Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
