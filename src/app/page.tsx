import { getVisiblePageSections } from "@/lib/actions/page-builder";
import { getFeaturedProducts, getProducts } from "@/lib/actions/products";
import { getLatticeStyles } from "@/lib/actions/collections";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import HeroSection from "@/components/landing/hero-section";
import HeritageSection from "@/components/landing/heritage-section";
import LatticeShowcase from "@/components/landing/lattice-showcase";
import CraftsmanshipSection from "@/components/landing/craftsmanship-section";
import MaterialsSection from "@/components/landing/materials-section";
import ProductGridSection from "@/components/landing/product-grid-section";
import ConsultationCTA from "@/components/landing/consultation-cta";
import type { PageSection } from "@/types/database";

const SECTION_COMPONENTS = {
  hero: HeroSection,
  heritage: HeritageSection,
  lattice_showcase: LatticeShowcase,
  craftsmanship: CraftsmanshipSection,
  materials: MaterialsSection,
  product_grid: ProductGridSection,
  cta: ConsultationCTA,
} as const;

export default async function Home() {
  const [sections, latticeStyles] = await Promise.all([
    getVisiblePageSections("homepage"),
    getLatticeStyles(),
  ]);

  const productGridSection = sections.find((s) => s.section_type === "product_grid");
  const featuredOnly = (productGridSection?.content as Record<string, unknown>)?.featured_only !== false;
  const products =
    productGridSection && featuredOnly
      ? await getFeaturedProducts()
      : productGridSection
        ? await getProducts({ isActive: true })
        : [];

  return (
    <>
      <Header />
      <main className="pt-14 lg:pt-16">
        {sections.map((section: PageSection) => {
          const Component = SECTION_COMPONENTS[section.section_type as keyof typeof SECTION_COMPONENTS];
          if (!Component) return null;

          const content = section.content ?? {};
          const key = section.id;

          if (section.section_type === "lattice_showcase") {
            return (
              <Component
                key={key}
                content={content}
                latticeStyles={latticeStyles ?? []}
              />
            );
          }
          if (section.section_type === "product_grid") {
            return (
              <Component
                key={key}
                content={content}
                products={products}
              />
            );
          }
          return <Component key={key} content={content} />;
        })}
      </main>
      <Footer />
    </>
  );
}
