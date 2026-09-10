"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface ConsultationCTAProps {
  content?: Record<string, unknown>;
}

export default function ConsultationCTA({ content }: ConsultationCTAProps) {
  const heading = (content?.heading as string) ?? "Let's Create Something Extraordinary";
  const description = (content?.description as string) ?? "Every Atelier Artizan piece begins with a conversation. Whether you're furnishing a private residence, a commercial space, or a hospitality project, our team is ready to bring your vision to life.";
  const buttonText = (content?.button_text as string) ?? "Book a Consultation";
  const buttonLink = (content?.button_link as string) ?? "/consultation";

  return (
    <section className="bg-[#121212]">
      <div className="mx-auto max-w-[1200px] px-6 py-24 text-center lg:px-10 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="font-mono text-[10px] tracking-[0.4em] uppercase text-white/50">
            Begin Your Story
          </p>
          <h2 className="mx-auto mt-6 max-w-2xl font-sans text-3xl tracking-tight text-white sm:text-4xl md:text-5xl">
            {heading}
          </h2>
          <p className="mx-auto mt-6 max-w-lg font-mono text-sm leading-[2] text-white/60">
            {description}
          </p>
          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href={buttonLink}
              className="inline-flex h-12 items-center justify-center bg-white px-10 font-mono text-[10px] tracking-[0.25em] uppercase text-[#121212] transition-opacity duration-300 hover:opacity-90"
            >
              {buttonText}
            </Link>
            <Link
              href="/products"
              className="inline-flex h-12 items-center justify-center border border-white/15 px-10 font-mono text-[10px] tracking-[0.25em] uppercase text-white/50 transition-colors duration-300 hover:border-white/30 hover:text-white"
            >
              Explore Collection
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
