"use client";

import { motion } from "framer-motion";

interface CraftsmanshipSectionProps {
  content?: Record<string, unknown>;
}

export default function CraftsmanshipSection({ content }: CraftsmanshipSectionProps) {
  const heading = (content?.heading as string) ?? "THE ARTIZANS BEHIND HERITAGE";
  const description = (content?.description as string) ?? "At the heart of our Heritage Collection lies the dedication and expertise of our artisans. Each piece of furniture is brought to life by a team of skilled craftsmen, engineers, designers, and visionaries—individuals who share a passion for creating timeless, high-quality outdoor furniture. Drawing from generations of experience across multiple industries, our team takes pride in blending tradition with modern innovation, ensuring every piece is not only beautiful but crafted to last. Discover more about the artistry, techniques, and craftsmanship behind each design.";

  return (
    <section className="bg-[#EDEBE9]">
      <div className="mx-auto h-px max-w-[720px] bg-[#D4D0CB]" />
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
            href="/our-atelier"
            className="mt-12 inline-block font-mono text-[10px] tracking-[0.2em] uppercase text-[#121212]/40 transition-colors duration-300 hover:text-[#121212]"
          >
            OUR ATELIER
          </a>
        </motion.div>
      </div>
    </section>
  );
}
