"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { LatticeStyle } from "@/types/database";

const defaultLattices = [
  { name: "ARTIZAN", description: "Our signature diamond lattice brings timeless elegance and sophistication to our Heritage collection. The diamond motif, woven throughout our brand, symbolizes strength and resilience; all core qualities we proudly embrace.", href: "/products?lattice=artizan", imageGradient: "from-[#3a3530] to-[#252220]" },
  { name: "CAPRI", description: "Inspired by the iconic chair silhouettes found along the coasts and in the gardens of Italy, our Capri style draws from the renowned woven lattices of Mario Papperzini. Capri honors this distinguished legacy while infusing a classic aesthetic with a modern twist.", href: "/products?lattice=capri", imageGradient: "from-[#c0bbb5] to-[#a8a39d]" },
  { name: "MONACO", description: "Paying homage to Monaco's vibrant racing heritage, our Monaco style features a hand-woven pattern that elegantly echoes the iconic Checkered Flag. Each piece captures the spirit of classic European motorsport, blending timeless craftsmanship with a nod to the sophistication and prestige of the Grand Prix.", href: "/products?lattice=monaco", imageGradient: "from-[#b8b3ad] to-[#9a9590]" },
];

function LatticeIcon({ type }: { type: string }) {
  const size = 18;
  if (type === "ARTIZAN") {
    return (
      <svg width={size} height={size} viewBox="0 0 18 18" fill="none" className="text-[#121212]/25">
        <path d="M9 1L17 9L9 17L1 9Z" stroke="currentColor" strokeWidth="0.8" />
        <path d="M9 4L14 9L9 14L4 9Z" stroke="currentColor" strokeWidth="0.6" />
        <path d="M9 7L11 9L9 11L7 9Z" stroke="currentColor" strokeWidth="0.5" />
      </svg>
    );
  }
  if (type === "CAPRI") {
    return (
      <svg width={size} height={size} viewBox="0 0 18 18" fill="none" className="text-[#121212]/25">
        {[0, 4.5, 9, 13.5].map((x) =>
          [0, 4.5, 9, 13.5].map((y) => (
            <rect key={`${x}-${y}`} x={x} y={y} width="3.5" height="3.5" stroke="currentColor" strokeWidth="0.6" />
          ))
        )}
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" className="text-[#121212]/25">
      {[0, 6, 12].map((x) =>
        [0, 6, 12].map((y) => (
          <rect
            key={`${x}-${y}`}
            x={x + 0.5}
            y={y + 0.5}
            width="5"
            height="5"
            fill={(Math.floor(x / 6) + Math.floor(y / 6)) % 2 === 0 ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="0.5"
          />
        ))
      )}
    </svg>
  );
}

interface LatticeShowcaseProps {
  content?: Record<string, unknown>;
  latticeStyles?: LatticeStyle[];
}

export default function LatticeShowcase({ content, latticeStyles }: LatticeShowcaseProps) {
  const heading = (content?.heading as string) ?? "OUR LATTICES";
  const lattices = latticeStyles && latticeStyles.length > 0
    ? latticeStyles.map((ls) => ({
        name: ls.name.toUpperCase(),
        description: ls.description ?? defaultLattices.find((d) => d.name === ls.name.toUpperCase())?.description ?? "",
        href: `/products?lattice=${ls.slug}`,
        imageUrl: ls.image_url,
        imageGradient: defaultLattices.find((d) => d.name === ls.name.toUpperCase())?.imageGradient ?? "from-[#6B6B6B] to-[#121212]",
      }))
    : defaultLattices.map((d) => ({ ...d, imageUrl: null }));

  return (
    <section className="bg-[#EDEBE9]">
      <div className="mx-auto max-w-[720px] px-6 pt-8 text-center">
        <h2 className="font-sans text-[22px] tracking-[0.02em] text-[#121212] sm:text-[26px]">
          {heading}
        </h2>
        <p className="mx-auto mt-4 max-w-[460px] font-mono text-[13px] leading-[2] text-[#121212]/45">
          We have meticulously crafted three lattice styles: Artizan, Capri, and Monaco for our Heritage Collection.
        </p>
      </div>

      {/* Product photos — replace gradients with real images */}
      <div className="mx-auto mt-10 grid max-w-[1100px] grid-cols-1 gap-3 px-6 md:grid-cols-3 lg:px-8">
        {lattices.map((lattice, i) => (
          <motion.div
            key={lattice.name}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
          >
            {lattice.imageUrl ? (
              <Image
                src={lattice.imageUrl}
                alt={lattice.name}
                width={400}
                height={533}
                className="aspect-[3/4] w-full object-cover"
                unoptimized
              />
            ) : (
              <div className={`aspect-[3/4] w-full bg-gradient-to-b ${lattice.imageGradient}`} />
            )}
          </motion.div>
        ))}
      </div>

      {/* Descriptions */}
      <div className="mx-auto mt-8 grid max-w-[1100px] grid-cols-1 gap-8 px-6 pb-16 md:grid-cols-3 lg:gap-10 lg:px-8">
        {lattices.map((lattice) => (
          <div key={lattice.name + "-text"}>
            <div className="flex items-center gap-2.5">
              <h3 className="font-sans text-[13px] tracking-[0.08em] text-[#121212]">
                {lattice.name}
              </h3>
              <LatticeIcon type={lattice.name} />
            </div>
            <p className="text-justify-mono mt-4 font-mono text-[11.5px] leading-[2.1] text-[#121212]/50">
              {lattice.description}
            </p>
            <a
              href={lattice.href}
              className="mt-5 inline-block font-mono text-[10px] tracking-[0.2em] uppercase text-[#121212]/35 transition-colors duration-300 hover:text-[#121212]"
            >
              SHOP {lattice.name}
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
