"use client";

import Image from "next/image";
import { motion } from "framer-motion";

interface HeroSectionProps {
  content?: Record<string, unknown>;
}

export default function HeroSection({ content }: HeroSectionProps) {
  const heading = (content?.heading as string) ?? "Engineered for the Elements";
  const subheading = (content?.subheading as string) ?? "Built to Last Generations";
  const imageUrl = (content?.image_url as string) ?? "/images/hero-chaise.png";
  const ctaText = (content?.cta_text as string) ?? "Explore Collection";
  const ctaLink = (content?.cta_link as string) ?? "/products";

  return (
    <section className="w-full bg-[#EDEBE9]">
      <div className="relative w-full overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
          className="relative w-full"
        >
          <Image
            src={imageUrl}
            alt="Heritage Collection Chaise Lounger"
            width={2400}
            height={900}
            className="w-full object-cover"
            priority
          />
        </motion.div>
      </div>

      <div className="flex items-center justify-center gap-10 py-7">
        <motion.a
          href={ctaLink}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="font-sans text-[13px] tracking-[0.05em] text-[#121212]/40 transition-colors duration-300 hover:text-[#121212]"
        >
          {ctaText}
        </motion.a>
        <motion.a
          href="#heritage"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75, duration: 0.8 }}
          className="font-sans text-[13px] tracking-[0.05em] text-[#121212]/40 transition-colors duration-300 hover:text-[#121212]"
        >
          Brand Capabilities
        </motion.a>
      </div>
    </section>
  );
}
