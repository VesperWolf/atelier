"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, ShoppingBag, FileText, Check } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { formatPrice, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import type {
  OptionCategory,
  OptionValue,
  ProductImage,
  ProductSku,
} from "@/types/database";

interface ProductOptionCategoryRow {
  category: OptionCategory & { values?: OptionValue[] };
}

interface ProductWithDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  base_price: number;
  dimensions_width: number | null;
  dimensions_depth: number | null;
  dimensions_height: number | null;
  weight_lbs: number | null;
  material_details: string | null;
  care_instructions: string | null;
  lead_time_days: number;
  collection?: { name: string };
  lattice_style?: { name: string } | null;
  images?: ProductImage[];
  option_categories?: ProductOptionCategoryRow[];
}

const productGradients: Record<string, string> = {
  "heritage-dining-chair": "from-[#8C6B3E] via-[#5C4528] to-[#121212]",
  "heritage-lounge-chair": "from-[#3B4D6E] via-[#2A3650] to-[#121212]",
  "heritage-dining-table": "from-[#8A8A8A] via-[#6B6B6B] to-[#3D3D3D]",
  "heritage-ottoman": "from-[#2D4A3E] via-[#1E3329] to-[#121212]",
  "heritage-sofa": "from-[#4A3728] via-[#32251B] to-[#121212]",
  "heritage-side-table": "from-[#8F9196] via-[#5F6164] to-[#121212]",
};

function getLatticeStyleName(product: ProductWithDetail): string {
  return product.lattice_style?.name ?? "";
}

function getPrimaryImage(product: ProductWithDetail): ProductImage | null {
  const imgs = product.images ?? [];
  const primary = imgs.find((i) => i.is_primary) ?? imgs[0];
  return primary ?? null;
}

function getSortedImages(product: ProductWithDetail): ProductImage[] {
  const imgs = product.images ?? [];
  return [...imgs].sort((a, b) => a.sort_order - b.sort_order);
}

interface ProductDetailClientProps {
  product: ProductWithDetail;
}

export default function ProductDetailClient({
  product,
}: ProductDetailClientProps) {
  const addItem = useCartStore((s) => s.addItem);
  const optionCats = product.option_categories ?? [];
  const sortedOptionCats = [...optionCats].sort(
    (a, b) => (a.category?.sort_order ?? 0) - (b.category?.sort_order ?? 0)
  );
  const initialSelections = useMemo(() => {
    const map: Record<string, OptionValue> = {};
    for (const oc of sortedOptionCats) {
      const values = oc.category?.values ?? [];
      const first = values.find((v) => v.is_active) ?? values[0];
      if (first) map[oc.category.id] = first;
    }
    return map;
  }, [sortedOptionCats]);

  const [selectedOptions, setSelectedOptions] =
    useState<Record<string, OptionValue>>(initialSelections);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity] = useState(1);

  const calculatedPrice = useMemo(() => {
    let total = product.base_price;
    for (const val of Object.values(selectedOptions)) {
      total += val?.price_modifier ?? 0;
    }
    return total;
  }, [product.base_price, selectedOptions]);

  const gradient =
    productGradients[product.slug] ?? "from-[#6B6B6B] to-[#121212]";
  const primaryImage = getPrimaryImage(product);
  const allImages = getSortedImages(product);
  const mainImage = allImages[selectedImageIndex] ?? primaryImage;
  const latticeName = getLatticeStyleName(product);

  const handleAddToCart = () => {
    const selectedOptionsList = Object.entries(selectedOptions)
      .filter(([, v]) => v)
      .map(([catId, value]) => {
        const oc = optionCats.find((o) => o.category?.id === catId);
        return {
          category: oc!.category as OptionCategory,
          value,
        };
      });
    addItem({
      product: product as any,
      selectedOptions: selectedOptionsList,
      quantity,
      unitPrice: calculatedPrice,
      totalPrice: calculatedPrice * quantity,
    });
  };

  const lightColors = ["#F5F5F0", "#C0B8A8", "#D4AF7A", "#8F9196", "#FAFAF5", "#E5DCCE", "#F0EDE5", "#E8E0D5", "#F5F2ED", "#B8B4AF", "#D5D0C8"];

  return (
    <div className="min-h-screen bg-[#EDEBE9]">
      <Header />

      {/* Dark top spacer for the header */}
      <div className="bg-[#121212] px-6 pb-4 pt-24 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <nav className="flex items-center gap-2 text-xs text-[#EDEBE9]/40">
            <Link
              href="/products"
              className="transition-colors hover:text-[#EDEBE9]/70"
            >
              Collection
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-[#EDEBE9]/70">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Product detail */}
      <section className="px-6 py-12 lg:px-12">
        <div className="mx-auto grid max-w-[1400px] gap-12 lg:grid-cols-2">
          {/* Left – Image area */}
          <div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="relative aspect-square overflow-hidden rounded-lg"
            >
              {mainImage?.url ? (
                <Image
                  src={mainImage.url}
                  alt={mainImage.alt_text ?? product.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div
                  className={cn(
                    "absolute inset-0 bg-gradient-to-br",
                    gradient
                  )}
                />
              )}
            </motion.div>
            {/* Thumbnail gallery */}
            {allImages.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3">
                {allImages.map((img, i) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setSelectedImageIndex(i)}
                    className={cn(
                      "relative aspect-square overflow-hidden rounded-md transition-opacity hover:opacity-100",
                      i === selectedImageIndex ? "opacity-100 ring-2 ring-[#121212]" : "opacity-60"
                    )}
                  >
                    <Image
                      src={img.url}
                      alt={img.alt_text ?? product.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </button>
                ))}
              </div>
            )}
            {allImages.length <= 1 && allImages.length > 0 && (
              <div className="mt-4 grid grid-cols-4 gap-3">
                <div
                  className={cn(
                    "aspect-square overflow-hidden rounded-md bg-gradient-to-br ring-2 ring-[#121212]",
                    gradient
                  )}
                />
              </div>
            )}
            {allImages.length === 0 && (
              <div className="mt-4 grid grid-cols-4 gap-3">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={cn(
                      "aspect-square overflow-hidden rounded-md bg-gradient-to-br opacity-60 transition-opacity hover:opacity-100",
                      i === 0 && "opacity-100 ring-2 ring-[#121212]",
                      gradient
                    )}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right – Product info & configurator */}
          <div>
            {latticeName && (
              <Badge
                variant="outline"
                className="border-[#121212]/30 text-[#121212]"
              >
                Heritage &middot; {latticeName} Lattice
              </Badge>
            )}

            <h1 className="mt-4 font-sans text-3xl tracking-tight text-[#121212] md:text-4xl">
              {product.name}
            </h1>

            <p className="mt-2 text-sm leading-relaxed text-[#121212]/60">
              {product.description ?? ""}
            </p>

            <div className="mt-6 flex items-baseline gap-3">
              <span className="font-sans text-3xl font-medium text-[#121212]">
                {formatPrice(calculatedPrice)}
              </span>
              {calculatedPrice > product.base_price && (
                <span className="text-sm text-[#121212]/40 line-through">
                  {formatPrice(product.base_price)}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-[#121212]/40">
              Base price {formatPrice(product.base_price)} + selected options
            </p>

            <Separator className="my-8 bg-[#E8E3DD]" />

            {/* CONFIGURATOR */}
            <div className="space-y-8">
              {sortedOptionCats.map((oc, stepIndex) => {
                const cat = oc.category;
                if (!cat) return null;
                const values = (cat.values ?? []).filter((v) => v.is_active);
                const selected = selectedOptions[cat.id];
                const isColorSwatch = values.some((v) => v.color_hex);
                return (
                  <div key={cat.id}>
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-medium tracking-[0.15em] uppercase text-[#121212]">
                        Step {stepIndex + 1} — {cat.name}
                      </h3>
                      <span className="text-xs text-[#121212]">
                        {selected?.name ?? "—"}
                        {selected && selected.price_modifier > 0 && (
                          <> (+{formatPrice(selected.price_modifier)})</>
                        )}
                      </span>
                    </div>

                    {isColorSwatch ? (
                      <div
                        className={cn(
                          "mt-4 grid gap-2",
                          values.length <= 10 ? "grid-cols-5" : "grid-cols-6"
                        )}
                      >
                        {values.map((val) => (
                          <button
                            key={val.id}
                            type="button"
                            onClick={() =>
                              setSelectedOptions((prev) => ({
                                ...prev,
                                [cat.id]: val,
                              }))
                            }
                            className="group flex flex-col items-center gap-1.5"
                            title={val.name}
                          >
                            <div
                              className={cn(
                                "relative h-9 w-full rounded border-2 transition-all duration-200",
                                selected?.id === val.id
                                  ? "scale-105 border-[#121212]"
                                  : "border-transparent hover:border-[#E8E3DD]"
                              )}
                              style={{
                                backgroundColor: val.color_hex ?? "#ccc",
                              }}
                            >
                              {selected?.id === val.id && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <Check
                                    className={cn(
                                      "h-3.5 w-3.5",
                                      lightColors.includes(val.color_hex ?? "")
                                        ? "text-[#121212]"
                                        : "text-white"
                                    )}
                                    strokeWidth={2.5}
                                  />
                                </div>
                              )}
                            </div>
                            <span className="line-clamp-2 text-center text-[9px] leading-tight text-[#121212]/50">
                              {val.name}
                            </span>
                            {val.price_modifier > 0 && (
                              <span className="text-[9px] text-[#121212]/70">
                                +{formatPrice(val.price_modifier)}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {values.map((val) => (
                          <button
                            key={val.id}
                            type="button"
                            onClick={() =>
                              setSelectedOptions((prev) => ({
                                ...prev,
                                [cat.id]: val,
                              }))
                            }
                            className={cn(
                              "rounded border px-3 py-1.5 text-xs transition-all",
                              selected?.id === val.id
                                ? "border-[#121212] bg-[#121212] text-white"
                                : "border-[#E8E3DD] text-[#121212]/70 hover:border-[#121212]/40"
                            )}
                          >
                            {val.name}
                            {val.price_modifier > 0 &&
                              ` (+${formatPrice(val.price_modifier)})`}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <Separator className="my-8 bg-[#E8E3DD]" />

            <div className="space-y-3">
              <Button
                size="xl"
                className="w-full rounded-none bg-[#121212] tracking-[0.15em] uppercase text-white hover:bg-[#2a2a2a]"
                onClick={handleAddToCart}
              >
                <ShoppingBag className="mr-2 h-4 w-4" strokeWidth={1.5} />
                Add to Cart — {formatPrice(calculatedPrice)}
              </Button>
              <Button
                variant="outline"
                size="xl"
                className="w-full rounded-none border-[#121212] tracking-[0.15em] uppercase"
                asChild
              >
                <Link href="/consultation">
                  <FileText className="mr-2 h-4 w-4" strokeWidth={1.5} />
                  Request Quote
                </Link>
              </Button>
            </div>

            <p className="mt-4 text-center text-xs text-[#121212]/40">
              Lead time: {product.lead_time_days} days &middot; Free white-glove
              delivery
            </p>
          </div>
        </div>
      </section>

      {/* Product details tabs */}
      <section className="border-t border-[#E8E3DD] px-6 py-16 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <Tabs defaultValue="specifications" className="w-full">
            <TabsList className="w-full justify-start gap-0 rounded-none border-b border-[#E8E3DD] bg-transparent p-0">
              <TabsTrigger
                value="specifications"
                className="rounded-none border-b-2 border-transparent px-6 py-3 text-xs tracking-[0.1em] uppercase data-[state=active]:border-[#121212] data-[state=active]:bg-transparent data-[state=active]:text-[#121212] data-[state=active]:shadow-none"
              >
                Specifications
              </TabsTrigger>
              <TabsTrigger
                value="care"
                className="rounded-none border-b-2 border-transparent px-6 py-3 text-xs tracking-[0.1em] uppercase data-[state=active]:border-[#121212] data-[state=active]:bg-transparent data-[state=active]:text-[#121212] data-[state=active]:shadow-none"
              >
                Care Instructions
              </TabsTrigger>
              <TabsTrigger
                value="lead-time"
                className="rounded-none border-b-2 border-transparent px-6 py-3 text-xs tracking-[0.1em] uppercase data-[state=active]:border-[#121212] data-[state=active]:bg-transparent data-[state=active]:text-[#121212] data-[state=active]:shadow-none"
              >
                Lead Time
              </TabsTrigger>
            </TabsList>

            <TabsContent value="specifications" className="pt-8">
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <h4 className="text-xs font-medium tracking-[0.15em] uppercase text-[#121212]">
                    Dimensions
                  </h4>
                  <dl className="mt-4 space-y-3">
                    <div className="flex justify-between">
                      <dt className="text-sm text-[#121212]/60">Width</dt>
                      <dd className="text-sm font-medium text-[#121212]">
                        {product.dimensions_width ?? "—"}&quot;
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-[#121212]/60">Depth</dt>
                      <dd className="text-sm font-medium text-[#121212]">
                        {product.dimensions_depth ?? "—"}&quot;
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-[#121212]/60">Height</dt>
                      <dd className="text-sm font-medium text-[#121212]">
                        {product.dimensions_height ?? "—"}&quot;
                      </dd>
                    </div>
                  </dl>
                </div>
                <div>
                  <h4 className="text-xs font-medium tracking-[0.15em] uppercase text-[#121212]">
                    Weight
                  </h4>
                  <p className="mt-4 text-sm text-[#121212]">
                    {product.weight_lbs ?? "—"} lbs
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-medium tracking-[0.15em] uppercase text-[#121212]">
                    Materials
                  </h4>
                  <p className="mt-4 text-sm leading-relaxed text-[#121212]/70">
                    {product.material_details ?? "—"}
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="care" className="pt-8">
              <div className="max-w-2xl">
                <p className="text-sm leading-relaxed text-[#121212]/70">
                  {product.care_instructions ?? "—"}
                </p>
                <div className="mt-8 space-y-4">
                  <h4 className="text-xs font-medium tracking-[0.15em] uppercase text-[#121212]">
                    General Guidelines
                  </h4>
                  <ul className="space-y-2 text-sm text-[#121212]/70">
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#121212]" />
                      Rinse with clean water periodically to prevent buildup of
                      dirt and pollen.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#121212]" />
                      For powder-coated frames, avoid abrasive cleaners or steel
                      wool.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#121212]" />
                      All fabrics are solution-dyed acrylic rated for 1,000+
                      hours of UV exposure.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#121212]" />
                      Store cushions indoors during extended periods of
                      non-use or harsh winter conditions.
                    </li>
                  </ul>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="lead-time" className="pt-8">
              <div className="max-w-2xl">
                <div className="rounded-lg border border-[#E8E3DD] bg-white p-6">
                  <h4 className="font-sans text-lg text-[#121212]">
                    Made to Order
                  </h4>
                  <p className="mt-2 text-sm leading-relaxed text-[#121212]/60">
                    Every piece in the Heritage Collection is handcrafted to your
                    specifications. Current estimated lead time for the{" "}
                    {product.name} is{" "}
                    <strong className="text-[#121212]">
                      {product.lead_time_days} days
                    </strong>{" "}
                    from order confirmation.
                  </p>
                  <Separator className="my-4 bg-[#E8E3DD]" />
                  <div className="space-y-3 text-sm text-[#121212]/60">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-[#121212]" />
                      <span>Order confirmation &amp; deposit — Day 1</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-[#121212]/60" />
                      <span>Frame fabrication &amp; welding — Weeks 1–3</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-[#121212]/40" />
                      <span>Powder coating &amp; curing — Weeks 3–4</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-[#121212]/30" />
                      <span>
                        Upholstery &amp; quality inspection — Weeks 4–5
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-[#121212]/20" />
                      <span>White-glove delivery — Week 6</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  );
}
