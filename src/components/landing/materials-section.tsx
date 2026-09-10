"use client";

import { motion } from "framer-motion";

interface MaterialsSectionProps {
  content?: Record<string, unknown>;
}

const finishes = [
  { name: "Matte Black", hex: "#1A1A1A" },
  { name: "Satin White", hex: "#F5F5F0" },
  { name: "Brushed Bronze", hex: "#8C6B3E" },
  { name: "Antique Brass", hex: "#B8956A" },
  { name: "Pewter", hex: "#8F9196" },
  { name: "Graphite", hex: "#3D3D3D" },
  { name: "Warm Silver", hex: "#C0B8A8" },
  { name: "Oil Rubbed Bronze", hex: "#4A3728" },
  { name: "Champagne Gold", hex: "#D4AF7A" },
  { name: "Forest Green", hex: "#2D4A3E" },
];

export default function MaterialsSection({ content }: MaterialsSectionProps) {
  const heading = (content?.heading as string) ?? "OUR METALWORK & FINISHES";
  const description = (content?.description as string) ?? "All frames in the Heritage Collection feature a solid carbon steel frame that meets ASTM material and welding standards with a Rockwell hardness rating of B66 or greater. Each frame undergoes a boutique hot-dip galvanizing process to provide unparalleled corrosion protection and is then finished with an architectural-rated powder coat.";

  return (
    <section className="bg-[#EDEBE9]">
      <div className="mx-auto max-w-[1200px] px-6 py-24 lg:px-10 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-sans text-3xl tracking-tight text-[#121212] sm:text-4xl">
            {heading}
          </h2>
          <p className="mt-6 max-w-2xl font-mono text-sm leading-[2] text-[#121212]/50">
            {description}
          </p>
        </motion.div>

        {/* Powder coat swatches */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12"
        >
          <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#121212]/40">
            10 Powder Coat Finishes
          </p>
          <div className="mt-6 flex flex-wrap gap-6">
            {finishes.map((finish) => (
              <div key={finish.name} className="group flex flex-col items-center gap-2">
                <div
                  className="h-12 w-12 rounded-full border border-[#E0DCD7] transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: finish.hex }}
                />
                <span className="font-mono text-[9px] tracking-[0.1em] uppercase text-[#121212]/40">
                  {finish.name}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Textiles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-20 border-t border-[#E0DCD7] pt-16"
        >
          <h3 className="font-sans text-2xl tracking-tight text-[#121212]">
            TEXTILES
          </h3>
          <p className="mt-6 max-w-2xl font-mono text-sm leading-[2] text-[#121212]/50">
            We currently offer 16 fabric options: 11 from our Sunbrella collection
            and 5 from our Perennials collection. To ensure superior quality and
            durability, we&apos;ve chosen Sunbrella and Perennials Fabrics for their proven
            resilience and luxurious feel, with designs inspired by the Heritage
            Collection aesthetic.
          </p>
          <div className="mt-8 flex gap-8">
            <div className="font-mono text-xs">
              <span className="text-[#121212]/40">Sunbrella</span>
              <span className="ml-2 text-[#121212]">11 options</span>
            </div>
            <div className="font-mono text-xs">
              <span className="text-[#121212]/40">Perennials</span>
              <span className="ml-2 text-[#121212]">5 options</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
