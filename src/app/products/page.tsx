import type { Metadata } from "next";
import { getProducts } from "@/lib/actions/products";
import { getLatticeStyles } from "@/lib/actions/collections";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ProductCatalog from "./product-catalog";

export const metadata: Metadata = {
  title: "Heritage Collection",
  description:
    "Explore the Heritage Collection — handmade luxury outdoor furniture crafted from carbon steel with signature lattice patterns.",
};

export default async function ProductsPage() {
  const [products, latticeStyles] = await Promise.all([
    getProducts({ isActive: true }),
    getLatticeStyles(),
  ]);

  return (
    <div className="min-h-screen bg-[#EDEBE9]">
      <Header />

      {/* Hero banner */}
      <section className="bg-[#121212] px-6 pt-32 pb-16 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <p className="text-xs tracking-[0.3em] uppercase text-[#EDEBE9]/80">
            Heritage Collection
          </p>
          <h1 className="mt-4 font-sans text-4xl tracking-tight text-white md:text-5xl lg:text-6xl">
            Our Collection
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/60">
            Each piece in the Heritage Collection is hand-welded from 11-gauge
            carbon steel by our master craftsmen, finished with your choice of
            powder coat, and upholstered in premium outdoor fabrics. Built to
            become heirlooms.
          </p>
        </div>
      </section>

      {/* Catalog with client-side filtering */}
      <ProductCatalog products={products ?? []} latticeStyles={latticeStyles ?? []} />

      <Footer />
    </div>
  );
}
