"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types/database";

const productGradients: Record<string, string> = {
  "heritage-dining-chair": "from-[#8C6B3E] via-[#5C4528] to-[#121212]",
  "heritage-lounge-chair": "from-[#3B4D6E] via-[#2A3650] to-[#121212]",
  "heritage-dining-table": "from-[#8A8A8A] via-[#6B6B6B] to-[#3D3D3D]",
  "heritage-ottoman": "from-[#2D4A3E] via-[#1E3329] to-[#121212]",
  "heritage-sofa": "from-[#4A3728] via-[#32251B] to-[#121212]",
  "heritage-side-table": "from-[#8F9196] via-[#5F6164] to-[#121212]",
};

interface ProductWithRelations extends Product {
  collection?: { id: string; name: string };
  lattice_style?: { id: string; name: string };
  images?: { id: string; url: string; is_primary: boolean; sort_order: number }[];
}

interface ProductGridSectionProps {
  content?: Record<string, unknown>;
  products?: ProductWithRelations[];
}

export default function ProductGridSection({ content, products = [] }: ProductGridSectionProps) {
  const heading = (content?.heading as string) ?? "Our Collection";
  const showPrices = (content?.show_prices as boolean) ?? true;
  const displayProducts = products.slice(0, 6);

  const getPrimaryImage = (product: ProductWithRelations) => {
    const imgs = product.images ?? [];
    const primary = imgs.find((i) => i.is_primary) ?? imgs[0];
    return primary?.url;
  };

  return (
    <section className="bg-[#EDEBE9]">
      {heading && (
        <div className="mx-auto max-w-[720px] px-6 pt-12 text-center">
          <h2 className="font-sans text-[22px] tracking-[0.02em] text-[#121212] sm:text-[26px]">
            {heading}
          </h2>
        </div>
      )}
      {/* Wide product banner using real image */}
      <div className="w-full overflow-hidden">
        <Image
          src="/images/hero-chaise.png"
          alt="Heritage Collection"
          width={2400}
          height={600}
          className="w-full object-cover opacity-80"
        />
      </div>

      {/* Product grid */}
      <div
        className="mx-auto grid max-w-[1100px] grid-cols-1 gap-3 px-6 py-4 md:grid-cols-2 lg:grid-cols-3 lg:px-8"
      >
        {displayProducts.length > 0
          ? displayProducts.map((product, i) => {
              const imgUrl = getPrimaryImage(product);
              const gradient = productGradients[product.slug] ?? "from-[#6B6B6B] to-[#121212]";
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                >
                  <Link href={`/products/${product.slug}`} className="group block">
                    <div className="relative aspect-[4/5] w-full overflow-hidden transition-opacity duration-500 group-hover:opacity-90">
                      {imgUrl ? (
                        <Image
                          src={imgUrl}
                          alt={product.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className={`absolute inset-0 bg-gradient-to-b ${gradient}`} />
                      )}
                    </div>
                    <p className="mt-3 font-sans text-sm text-[#121212]">{product.name}</p>
                    {showPrices && (
                      <p className="mt-1 text-sm text-[#121212]/60">From {formatPrice(product.base_price)}</p>
                    )}
                  </Link>
                </motion.div>
              );
            })
          : [
              "from-[#2a2520] to-[#1a1714]",
              "from-[#d0ccc6] to-[#b8b4ae]",
              "from-[#b0aaa4] to-[#9a9490]",
            ].slice(0, 3).map((gradient, i) => (
              <motion.a
                key={i}
                href="/products"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group block"
              >
                <div
                  className={`aspect-[4/5] w-full bg-gradient-to-b ${gradient} transition-opacity duration-500 group-hover:opacity-90`}
                />
              </motion.a>
            ))}
      </div>
    </section>
  );
}
