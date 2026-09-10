"use client";

import Link from "next/link";

const footerLinks = [
  { href: "/consultation", label: "Book A Consult" },
  { href: "/products", label: "Trade" },
  { href: "/products", label: "Homeowner" },
  { href: "/our-atelier", label: "Our Atelier" },
];

export default function Footer() {
  return (
    <footer className="bg-[#EDEBE9]">
      <div className="border-t border-[#D4D0CB]">
        <div className="mx-auto max-w-[1200px] px-6 py-6 lg:px-10">
          {/* Nav links */}
          <nav className="flex flex-wrap items-center justify-center gap-6 lg:gap-8">
            {footerLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="font-mono text-[12px] text-[#121212]/50 transition-colors duration-300 hover:text-[#121212]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#D4D0CB]">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-3 px-6 py-4 sm:flex-row lg:px-10">
          <p className="font-mono text-[10px] text-[#121212]/25">
            &copy; {new Date().getFullYear()}, Atelier Artizan
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="#"
              className="font-mono text-[10px] text-[#121212]/25 transition-colors duration-300 hover:text-[#121212]/50"
            >
              Refund policy
            </Link>
            <Link
              href="/consultation"
              className="font-mono text-[10px] text-[#121212]/25 transition-colors duration-300 hover:text-[#121212]/50"
            >
              Contact information
            </Link>
            <Link
              href="#"
              className="font-mono text-[10px] text-[#121212]/25 transition-colors duration-300 hover:text-[#121212]/50"
            >
              Privacy policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
