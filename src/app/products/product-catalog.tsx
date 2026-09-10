"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ProductImageRow {
  id: string;
  url: string;
  is_primary: boolean;
  sort_order: number;
}

interface ProductWithRelations {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  base_price: number;
  category: string;
  collection?: { id: string; name: string };
  lattice_style?: { id: string; name: string } | null;
  images?: ProductImageRow[] | null;
}

interface LatticeStyleRow {
  id: string;
  name: string;
  slug: string;
}

interface ProductCatalogProps {
  products: ProductWithRelations[];
  latticeStyles: LatticeStyleRow[];
}

const productGradients: Record<string, string> = {
  "heritage-dining-chair": "from-[#8C6B3E] via-[#5C4528] to-[#121212]",
  "heritage-lounge-chair": "from-[#3B4D6E] via-[#2A3650] to-[#121212]",
  "heritage-dining-table": "from-[#8A8A8A] via-[#6B6B6B] to-[#3D3D3D]",
  "heritage-ottoman": "from-[#2D4A3E] via-[#1E3329] to-[#121212]",
  "heritage-sofa": "from-[#4A3728] via-[#32251B] to-[#121212]",
  "heritage-side-table": "from-[#8F9196] via-[#5F6164] to-[#121212]",
};

function getLatticeStyleName(product: ProductWithRelations): string {
  return product.lattice_style?.name ?? "";
}

function getPrimaryImage(product: ProductWithRelations): string | null {
  const imgs = product.images ?? [];
  const primary = imgs.find((i) => i.is_primary) ?? imgs[0];
  return primary?.url ?? null;
}

export default function ProductCatalog({ products, latticeStyles }: ProductCatalogProps) {
  const [category, setCategory] = useState<string>("All");
  const [latticeStyle, setLatticeStyle] = useState<string>("All");

  const productCategories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category).filter(Boolean));
    return ["All", ...Array.from(cats).sort()];
  }, [products]);

  const latticeStyleFilters = useMemo(() => {
    const names = latticeStyles.map((ls) => ls.name).filter(Boolean);
    return ["All", ...names];
  }, [latticeStyles]);

  const filtered = useMemo(
    () =>
      products.filter((p) => {
        const matchCat = category === "All" || p.category === category;
        const matchLat =
          latticeStyle === "All" || getLatticeStyleName(p) === latticeStyle;
        return matchCat && matchLat;
      }),
    [products, category, latticeStyle]
  );

  return (
    <section className="px-6 py-16 lg:px-12">
      <div className="mx-auto max-w-[1400px]">
        {/* Filter bar */}
        <div className="flex flex-col gap-6 border-b border-[#E8E3DD] pb-8 md:flex-row md:items-center md:justify-between">
          {/* Category filters */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-2 text-xs tracking-[0.15em] uppercase text-[#121212]/40">
              Category
            </span>
            {productCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-xs tracking-wide transition-all duration-300",
                  category === cat
                    ? "border-[#121212] bg-[#121212] text-white"
                    : "border-[#E8E3DD] text-[#121212]/60 hover:border-[#121212]/40 hover:text-[#121212]"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Lattice style filters */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-2 text-xs tracking-[0.15em] uppercase text-[#121212]/40">
              Lattice
            </span>
            {latticeStyleFilters.map((style) => (
              <button
                key={style}
                onClick={() => setLatticeStyle(style)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-xs tracking-wide transition-all duration-300",
                  latticeStyle === style
                    ? "border-[#121212] bg-[#121212] text-white"
                    : "border-[#E8E3DD] text-[#121212]/60 hover:border-[#121212]/40 hover:text-[#121212]"
                )}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <p className="mt-6 text-xs tracking-wide text-[#121212]/40">
          Showing {filtered.length} {filtered.length === 1 ? "piece" : "pieces"}
        </p>

        {/* Product grid */}
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((product) => {
              const imgUrl = getPrimaryImage(product);
              const gradient =
                productGradients[product.slug] ??
                "from-[#6B6B6B] to-[#121212]";
              const latticeName = getLatticeStyleName(product);
              return (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    href={`/products/${product.slug}`}
                    className="group block"
                  >
                    {/* Image */}
                    <div className="relative aspect-[4/5] overflow-hidden rounded-lg">
                      {imgUrl ? (
                        <Image
                          src={imgUrl}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          unoptimized
                        />
                      ) : (
                        <div
                          className={cn(
                            "absolute inset-0 bg-gradient-to-br transition-transform duration-700 group-hover:scale-105",
                            gradient
                          )}
                        />
                      )}
                      {/* Lattice badge */}
                      {latticeName && (
                        <Badge
                          variant="outline"
                          className="absolute left-4 top-4 border-white/20 bg-black/30 text-white backdrop-blur-sm"
                        >
                          {latticeName} Lattice
                        </Badge>
                      )}
                      {/* Hover overlay */}
                      <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                        <div className="flex w-full items-center justify-between p-6">
                          <span className="text-xs tracking-[0.15em] uppercase text-white/80">
                            Configure
                          </span>
                          <ArrowRight className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="mt-4 space-y-1">
                      <p className="text-xs tracking-[0.15em] uppercase text-[#121212]/60">
                        Heritage &middot; {latticeName || "—"}
                      </p>
                      <h3 className="font-sans text-lg text-[#121212] transition-colors group-hover:text-[#121212]/80">
                        {product.name}
                      </h3>
                      <p className="text-sm text-[#121212]/50 line-clamp-2">
                        {product.short_description ?? ""}
                      </p>
                      <p className="pt-1 text-base font-medium text-[#121212]">
                        From {formatPrice(product.base_price)}
                      </p>
                    </div>

                    {/* CTA */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 w-full rounded-none border-[#121212] tracking-[0.1em] uppercase transition-colors group-hover:border-[#121212] group-hover:bg-[#121212] group-hover:text-white"
                    >
                      Configure
                    </Button>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="font-sans text-xl text-[#121212]/60">
              No pieces match your filters
            </p>
            <p className="mt-2 text-sm text-[#121212]/40">
              Try adjusting your category or lattice style selection.
            </p>
            <Button
              variant="outline"
              className="mt-6 rounded-none tracking-[0.1em] uppercase"
              onClick={() => {
                setCategory("All");
                setLatticeStyle("All");
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
