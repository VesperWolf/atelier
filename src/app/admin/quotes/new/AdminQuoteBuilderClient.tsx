"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Search,
  Plus,
  X,
  Minus,
  Save,
  Send,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPrice, formatPriceDecimal, generateQuoteNumber } from "@/lib/utils";
import { useQuoteBuilderStore } from "@/lib/store";
import { createQuote } from "@/lib/actions/quotes";
import type { Product, OptionCategory, OptionValue } from "@/types/database";
import { toast } from "sonner";

interface ProductOptionCategoryLink {
  product_id: string;
  category_id: string;
  is_required: boolean;
  category?: OptionCategory & { values?: OptionValue[] };
}

interface AdminQuoteBuilderClientProps {
  products: Product[];
  optionCategoriesWithValues: unknown[];
  productOptionCategories: ProductOptionCategoryLink[];
}

export default function AdminQuoteBuilderClient({
  products,
  productOptionCategories,
}: AdminQuoteBuilderClientProps) {
  const store = useQuoteBuilderStore();

  const [productSearch, setProductSearch] = useState("");
  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, { category: OptionCategory; value: OptionValue }>
  >({});
  const [itemQuantity, setItemQuantity] = useState(1);
  const [showProductList, setShowProductList] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const filteredProducts = useMemo(() => {
    if (!productSearch) return products.filter((p) => p.is_active);
    return products.filter(
      (p) =>
        p.is_active &&
        (p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
          p.category.toLowerCase().includes(productSearch.toLowerCase()))
    );
  }, [products, productSearch]);

  const productOptionCategoriesForProduct = useMemo(() => {
    if (!selectedProduct) return [];
    const links = productOptionCategories.filter(
      (poc) => poc.product_id === selectedProduct.id
    );
    return links
      .map((link) => {
        const category = link.category;
        const values = (category?.values ?? []).filter(
          (ov: OptionValue) => ov.is_active
        ) as OptionValue[];
        return category
          ? {
              category: category as OptionCategory,
              values,
              isRequired: link.is_required,
            }
          : null;
      })
      .filter(Boolean) as {
      category: OptionCategory;
      values: OptionValue[];
      isRequired: boolean;
    }[];
  }, [selectedProduct, productOptionCategories]);

  function calculateItemPrice() {
    if (!selectedProduct) return 0;
    let price = selectedProduct.base_price;
    Object.values(selectedOptions).forEach(({ value }) => {
      if (value.price_modifier_type === "fixed") {
        price += value.price_modifier;
      } else {
        price += (selectedProduct.base_price * value.price_modifier) / 100;
      }
    });
    return price;
  }

  function handleSelectProduct(product: Product) {
    setSelectedProduct(product);
    setSelectedOptions({});
    setItemQuantity(1);
    setShowProductList(false);
    setProductSearch("");
  }

  function handleAddToQuote() {
    if (!selectedProduct) return;
    const unitPrice = calculateItemPrice();
    store.addItem({
      product: selectedProduct,
      selectedOptions: Object.values(selectedOptions),
      quantity: itemQuantity,
      unitPrice,
      notes: "",
    });
    setSelectedProduct(null);
    setSelectedOptions({});
    setItemQuantity(1);
  }

  function handleSaveDraft() {
    startTransition(async () => {
      try {
        const quoteNumber = generateQuoteNumber();
        const subtotal = store.getSubtotal();
        const discount = store.discountAmount;
        const taxAmount = (subtotal - discount) * store.taxRate;
        const total = subtotal - discount + taxAmount;

        await createQuote(
          {
            quote_number: quoteNumber,
            customer_id: null,
            customer_name: store.customerName,
            customer_email: store.customerEmail,
            customer_phone: store.customerPhone || null,
            customer_company: store.customerCompany || null,
            status: "draft",
            subtotal,
            tax_rate: store.taxRate,
            tax_amount: taxAmount,
            discount_amount: discount,
            total,
            notes: store.notes || null,
            internal_notes: store.internalNotes || null,
            valid_until: null,
            sent_at: null,
            viewed_at: null,
            accepted_at: null,
          },
          store.items.map((item) => ({
            product_id: item.product.id,
            sku_id: item.sku?.id,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            total_price: item.unitPrice * item.quantity,
            notes: item.notes || undefined,
            option_value_ids: item.selectedOptions.map((o) => o.value.id),
          }))
        );
        store.reset();
        toast.success(`Quote ${quoteNumber} saved as draft`);
        router.push("/admin/quotes");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to save quote");
      }
    });
  }

  function handleSendQuote() {
    startTransition(async () => {
      try {
        const quoteNumber = generateQuoteNumber();
        const subtotal = store.getSubtotal();
        const discount = store.discountAmount;
        const taxAmount = (subtotal - discount) * store.taxRate;
        const total = subtotal - discount + taxAmount;

        await createQuote(
          {
            quote_number: quoteNumber,
            customer_id: null,
            customer_name: store.customerName,
            customer_email: store.customerEmail,
            customer_phone: store.customerPhone || null,
            customer_company: store.customerCompany || null,
            status: "sent",
            subtotal,
            tax_rate: store.taxRate,
            tax_amount: taxAmount,
            discount_amount: discount,
            total,
            notes: store.notes || null,
            internal_notes: store.internalNotes || null,
            valid_until: null,
            sent_at: new Date().toISOString(),
            viewed_at: null,
            accepted_at: null,
          },
          store.items.map((item) => ({
            product_id: item.product.id,
            sku_id: item.sku?.id,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            total_price: item.unitPrice * item.quantity,
            notes: item.notes || undefined,
            option_value_ids: item.selectedOptions.map((o) => o.value.id),
          }))
        );
        store.reset();
        toast.success(`Quote ${quoteNumber} sent to ${store.customerEmail}`);
        router.push("/admin/quotes");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to send quote");
      }
    });
  }

  const subtotal = store.getSubtotal();
  const taxAmount = store.getTaxAmount();
  const total = store.getTotal();

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/quotes">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-[#121212] font-sans">
              New Quote
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Build a custom quote for a customer.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="gap-2 border-[#E8E3DD]"
            onClick={handleSaveDraft}
            disabled={isPending || store.items.length === 0}
          >
            <Save className="h-4 w-4" />
            Save as Draft
          </Button>
          <Button
            className="gap-2 bg-[#121212] hover:bg-[#121212]/90"
            onClick={handleSendQuote}
            disabled={
              isPending ||
              store.items.length === 0 ||
              !store.customerEmail ||
              !store.customerName
            }
          >
            <Send className="h-4 w-4" />
            Send Quote
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Left section - Product selector */}
        <div className="lg:col-span-3 space-y-6">
          {/* Product search */}
          <Card className="border-[#E8E3DD]">
            <CardHeader>
              <CardTitle className="text-base font-semibold font-sans">
                Add Products
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={productSearch}
                  onChange={(e) => {
                    setProductSearch(e.target.value);
                    setShowProductList(true);
                  }}
                  onFocus={() => setShowProductList(true)}
                  className="pl-9 border-[#E8E3DD]"
                />
              </div>

              {/* Product dropdown list */}
              {showProductList && !selectedProduct && (
                <div className="rounded-lg border border-[#E8E3DD] max-h-64 overflow-y-auto">
                  {filteredProducts.map((product) => (
                    <button
                      key={product.id}
                      className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-[#EDEBE9] transition-colors border-b border-[#E8E3DD] last:border-b-0"
                      onClick={() => handleSelectProduct(product)}
                    >
                      <div>
                        <p className="text-sm font-medium text-[#121212]">
                          {product.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {product.category}
                        </p>
                      </div>
                      <span className="text-sm font-medium text-[#121212]">
                        {formatPrice(product.base_price)}
                      </span>
                    </button>
                  ))}
                  {filteredProducts.length === 0 && (
                    <p className="px-4 py-3 text-sm text-muted-foreground">
                      No products found.
                    </p>
                  )}
                </div>
              )}

              {/* Selected product configurator */}
              {selectedProduct && (
                <div className="space-y-4 rounded-lg border border-[#121212]/30 bg-[#121212]/5 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-[#121212]">
                        {selectedProduct.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Base: {formatPrice(selectedProduct.base_price)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => {
                        setSelectedProduct(null);
                        setSelectedOptions({});
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Option selectors */}
                  {productOptionCategoriesForProduct.map(
                    ({ category, values }) => (
                      <div key={category.id} className="space-y-1.5">
                        <Label className="text-xs font-medium">
                          {category.name}
                        </Label>
                        <Select
                          value={selectedOptions[category.id]?.value?.id ?? ""}
                          onValueChange={(valId) => {
                            const value = values.find((v) => v.id === valId);
                            if (value) {
                              setSelectedOptions({
                                ...selectedOptions,
                                [category.id]: { category, value },
                              });
                            }
                          }}
                        >
                          <SelectTrigger className="border-[#E8E3DD] bg-white">
                            <SelectValue
                              placeholder={`Select ${category.name}`}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {values.map((val) => (
                              <SelectItem key={val.id} value={val.id}>
                                <span className="flex items-center gap-2">
                                  {val.color_hex && (
                                    <span
                                      className="inline-block h-3 w-3 rounded-full border border-gray-200"
                                      style={{
                                        backgroundColor: val.color_hex,
                                      }}
                                    />
                                  )}
                                  {val.name}
                                  {val.price_modifier > 0 &&
                                    ` (+${formatPrice(val.price_modifier)})`}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )
                  )}

                  {/* Quantity & add */}
                  <div className="flex items-end gap-3 pt-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Quantity</Label>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 border-[#E8E3DD]"
                          onClick={() =>
                            setItemQuantity(Math.max(1, itemQuantity - 1))
                          }
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </Button>
                        <Input
                          type="number"
                          min={1}
                          value={itemQuantity}
                          onChange={(e) =>
                            setItemQuantity(
                              Math.max(1, parseInt(e.target.value) || 1)
                            )
                          }
                          className="w-16 text-center border-[#E8E3DD]"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 border-[#E8E3DD]"
                          onClick={() => setItemQuantity(itemQuantity + 1)}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex-1 text-right">
                      <p className="text-xs text-muted-foreground">Unit price</p>
                      <p className="text-lg font-semibold text-[#121212]">
                        {formatPriceDecimal(calculateItemPrice())}
                      </p>
                    </div>
                    <Button
                      onClick={handleAddToQuote}
                      className="gap-2 bg-[#121212] hover:bg-[#121212]/90"
                    >
                      <Plus className="h-4 w-4" />
                      Add to Quote
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer info */}
          <Card className="border-[#E8E3DD]">
            <CardHeader>
              <CardTitle className="text-base font-semibold font-sans">
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="customer_name">Name *</Label>
                  <Input
                    id="customer_name"
                    value={store.customerName}
                    onChange={(e) =>
                      store.setCustomerInfo({ customerName: e.target.value })
                    }
                    placeholder="Full name"
                    className="border-[#E8E3DD]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer_email">Email *</Label>
                  <Input
                    id="customer_email"
                    type="email"
                    value={store.customerEmail}
                    onChange={(e) =>
                      store.setCustomerInfo({ customerEmail: e.target.value })
                    }
                    placeholder="email@example.com"
                    className="border-[#E8E3DD]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer_phone">Phone</Label>
                  <Input
                    id="customer_phone"
                    value={store.customerPhone}
                    onChange={(e) =>
                      store.setCustomerInfo({ customerPhone: e.target.value })
                    }
                    placeholder="(555) 555-0123"
                    className="border-[#E8E3DD]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer_company">Company</Label>
                  <Input
                    id="customer_company"
                    value={store.customerCompany}
                    onChange={(e) =>
                      store.setCustomerInfo({
                        customerCompany: e.target.value,
                      })
                    }
                    placeholder="Company name"
                    className="border-[#E8E3DD]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="border-[#E8E3DD]">
            <CardHeader>
              <CardTitle className="text-base font-semibold font-sans">
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes">Customer-Facing Notes</Label>
                <Textarea
                  id="notes"
                  value={store.notes}
                  onChange={(e) => store.setNotes(e.target.value)}
                  placeholder="Notes visible to the customer..."
                  rows={3}
                  className="border-[#E8E3DD]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="internal_notes">Internal Notes</Label>
                <Textarea
                  id="internal_notes"
                  value={store.internalNotes}
                  onChange={(e) => store.setInternalNotes(e.target.value)}
                  placeholder="Internal notes (not visible to customer)..."
                  rows={3}
                  className="border-[#E8E3DD] bg-[#EDEBE9]/50"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right section - Quote summary */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-[#E8E3DD] sticky top-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold font-sans">
                  Quote Summary
                </CardTitle>
                <Badge
                  variant="secondary"
                  className="bg-[#EDEBE9] text-muted-foreground"
                >
                  {store.items.length} item{store.items.length !== 1 ? "s" : ""}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Line items */}
              {store.items.length > 0 ? (
                <div className="space-y-3">
                  {store.items.map((item, index) => (
                    <div
                      key={index}
                      className="rounded-lg border border-[#E8E3DD] p-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#121212] truncate">
                            {item.product.name}
                          </p>
                          {item.selectedOptions.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {item.selectedOptions.map((opt) => (
                                <Badge
                                  key={opt.category.id}
                                  variant="secondary"
                                  className="text-[10px] bg-[#EDEBE9]"
                                >
                                  {opt.value.name}
                                </Badge>
                              ))}
                            </div>
                          )}
                          <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Qty: {item.quantity}</span>
                            <span>&times;</span>
                            <span>{formatPriceDecimal(item.unitPrice)}</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 ml-2">
                          <p className="text-sm font-semibold text-[#121212] whitespace-nowrap">
                            {formatPriceDecimal(
                              item.unitPrice * item.quantity
                            )}
                          </p>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-destructive"
                            onClick={() => store.removeItem(index)}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <ShoppingBag className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No items added yet.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Search and add products from the left.
                  </p>
                </div>
              )}

              {store.items.length > 0 && (
                <>
                  <Separator className="bg-[#E8E3DD]/60" />

                  {/* Discount */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Discount ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      value={store.discountAmount || ""}
                      onChange={(e) =>
                        store.setDiscountAmount(
                          parseFloat(e.target.value) || 0
                        )
                      }
                      placeholder="0.00"
                      className="border-[#E8E3DD]"
                    />
                  </div>

                  {/* Tax rate */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Tax Rate (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      max={100}
                      value={
                        store.taxRate ? (store.taxRate * 100).toFixed(2) : ""
                      }
                      onChange={(e) =>
                        store.setTaxRate(
                          (parseFloat(e.target.value) || 0) / 100
                        )
                      }
                      placeholder="0.00"
                      className="border-[#E8E3DD]"
                    />
                  </div>

                  <Separator className="bg-[#E8E3DD]/60" />

                  {/* Totals */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">
                        {formatPriceDecimal(subtotal)}
                      </span>
                    </div>
                    {store.discountAmount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Discount</span>
                        <span className="font-medium text-red-600">
                          -{formatPriceDecimal(store.discountAmount)}
                        </span>
                      </div>
                    )}
                    {store.taxRate > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Tax ({(store.taxRate * 100).toFixed(2)}%)
                        </span>
                        <span className="font-medium">
                          {formatPriceDecimal(taxAmount)}
                        </span>
                      </div>
                    )}
                    <Separator className="bg-[#E8E3DD]/60" />
                    <div className="flex justify-between">
                      <span className="font-semibold text-[#121212]">
                        Total
                      </span>
                      <span className="text-xl font-bold text-[#121212]">
                        {formatPriceDecimal(total)}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
