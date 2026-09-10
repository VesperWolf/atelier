"use client";

import { motion } from "framer-motion";

interface HeritageSectionProps {
  content?: Record<string, unknown>;
}

export default function HeritageSection({ content }: HeritageSectionProps) {
  const heading = (content?.heading as string) ?? "THE HERITAGE COLLECTION";
  const description = (content?.description as string) ?? "At Atelier Artizan, we celebrate the artistry of the past by thoughtfully reinterpreting timeless design elements for modern outdoor living. Our Heritage Collection draws from centuries of craftsmanship, blending historical motifs with contemporary aesthetics. Each piece reflects our dedication to preserving tradition while pushing the boundaries of innovation, resulting in furniture that embodies unparalleled craftsmanship, technical expertise, and creative vision.";
  const ctaText = (content?.cta_text as string) ?? "SHOP HERITAGE";
  const ctaLink = (content?.cta_link as string) ?? "/products";

  return (
    <section id="heritage" className="bg-[#EDEBE9]">
      <div className="mx-auto max-w-[720px] px-6 py-20 text-center lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="font-sans text-[22px] tracking-[0.02em] text-[#121212] sm:text-[26px]">
            {heading}
          </h2>
          <p className="text-justify-mono mt-10 font-mono text-[13px] leading-[2.1] text-[#121212]/65">
            {description}
          </p>
          <a
            href={ctaLink}
            className="mt-12 inline-block font-mono text-[10px] tracking-[0.2em] uppercase text-[#121212]/40 transition-colors duration-300 hover:text-[#121212]"
          >
            {ctaText}
          </a>
        </motion.div>
      </div>
    </section>
  );
}
