"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Product, ProductSku, OptionCategory, OptionValue } from "@/types/database";

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (index: number) => void;
  updateQuantity: (index: number, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  getSubtotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item: CartItem) => {
        set((state) => ({
          items: [...state.items, item],
          isOpen: true,
        }));
      },

      removeItem: (index: number) => {
        set((state) => ({
          items: state.items.filter((_, i) => i !== index),
        }));
      },

      updateQuantity: (index: number, quantity: number) => {
        set((state) => ({
          items: state.items.map((item, i) =>
            i === index
              ? {
                  ...item,
                  quantity,
                  totalPrice: item.unitPrice * quantity,
                }
              : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + item.totalPrice, 0);
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: "atelier-artizan-cart",
    }
  )
);

// Quote builder store for admin
interface QuoteBuilderItem {
  product: Product;
  sku?: ProductSku;
  selectedOptions: {
    category: OptionCategory;
    value: OptionValue;
  }[];
  quantity: number;
  unitPrice: number;
  notes: string;
}

interface QuoteBuilderStore {
  items: QuoteBuilderItem[];
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCompany: string;
  notes: string;
  internalNotes: string;
  discountAmount: number;
  taxRate: number;
  addItem: (item: QuoteBuilderItem) => void;
  removeItem: (index: number) => void;
  updateItem: (index: number, updates: Partial<QuoteBuilderItem>) => void;
  setCustomerInfo: (info: Partial<Pick<QuoteBuilderStore, "customerName" | "customerEmail" | "customerPhone" | "customerCompany">>) => void;
  setNotes: (notes: string) => void;
  setInternalNotes: (notes: string) => void;
  setDiscountAmount: (amount: number) => void;
  setTaxRate: (rate: number) => void;
  getSubtotal: () => number;
  getTaxAmount: () => number;
  getTotal: () => number;
  reset: () => void;
}

export const useQuoteBuilderStore = create<QuoteBuilderStore>()((set, get) => ({
  items: [],
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  customerCompany: "",
  notes: "",
  internalNotes: "",
  discountAmount: 0,
  taxRate: 0,

  addItem: (item) => {
    set((state) => ({ items: [...state.items, item] }));
  },

  removeItem: (index) => {
    set((state) => ({
      items: state.items.filter((_, i) => i !== index),
    }));
  },

  updateItem: (index, updates) => {
    set((state) => ({
      items: state.items.map((item, i) =>
        i === index ? { ...item, ...updates } : item
      ),
    }));
  },

  setCustomerInfo: (info) => set(info),
  setNotes: (notes) => set({ notes }),
  setInternalNotes: (internalNotes) => set({ internalNotes }),
  setDiscountAmount: (discountAmount) => set({ discountAmount }),
  setTaxRate: (taxRate) => set({ taxRate }),

  getSubtotal: () => {
    return get().items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );
  },

  getTaxAmount: () => {
    const subtotal = get().getSubtotal();
    const discount = get().discountAmount;
    return (subtotal - discount) * get().taxRate;
  },

  getTotal: () => {
    const subtotal = get().getSubtotal();
    const discount = get().discountAmount;
    const tax = get().getTaxAmount();
    return subtotal - discount + tax;
  },

  reset: () =>
    set({
      items: [],
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      customerCompany: "",
      notes: "",
      internalNotes: "",
      discountAmount: 0,
      taxRate: 0,
    }),
}));
