import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
const teamMembers = [
  { name: "Matt Sullivan", role: "Chief Executive Officer", bio: "A visionary leader with decades of experience in luxury manufacturing, Matt founded Atelier Artizan to redefine outdoor living.", initials: "MS" },
  { name: "Ben Harrington", role: "Chief Strategy Officer", bio: "Ben architects the strategic direction of the brand, ensuring every decision aligns with our commitment to enduring quality.", initials: "BH" },
  { name: "Alex Whitmore", role: "Chief Business Executive Officer", bio: "Alex oversees operational excellence across every facet of the business, from supply chain to client delivery.", initials: "AW" },
  { name: "Scott Callahan", role: "Chief Marketing Officer", bio: "Scott crafts the narrative of Atelier Artizan, translating our artisanal ethos into a brand experience that resonates globally.", initials: "SC" },
  { name: "Sophia Navarro", role: "Director of Private Client Relationships", bio: "Sophia cultivates meaningful partnerships with designers, architects, and discerning private clients worldwide.", initials: "SN" },
];
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Our Atelier",
  description:
    "Discover the story, people, and processes behind Atelier Artizan — a Design House crafting handmade luxury outdoor furniture.",
};

export default function OurAtelierPage() {
  return (
    <div className="min-h-screen bg-[#EDEBE9]">
      <Header />

      {/* Hero */}
      <section className="relative bg-[#121212] px-6 pt-32 pb-24 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <p className="text-xs tracking-[0.3em] uppercase text-white/80 animate-fade-in">
            Est. 2024
          </p>
          <h1 className="mt-6 font-sans text-5xl tracking-tight text-[#EDEBE9] md:text-6xl lg:text-7xl animate-fade-up">
            Our Atelier
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#EDEBE9]/50 animate-fade-up">
            A Design House crafting handmade luxury outdoor furniture.
            Vertically integrated, U.S.-based, and uncompromising in the pursuit
            of heirloom quality.
          </p>
        </div>
        {/* Decorative gradient overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#EDEBE9] to-transparent" />
      </section>

      {/* About section */}
      <section className="px-6 py-24 lg:px-12">
        <div className="mx-auto grid max-w-[1400px] gap-16 lg:grid-cols-2">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-[#121212]/70">
              About
            </p>
            <h2 className="mt-4 font-sans text-3xl tracking-tight text-[#121212] md:text-4xl">
              Where Craft
              <br />
              Meets Purpose
            </h2>
          </div>
          <div className="space-y-6">
            <p className="text-base leading-relaxed text-[#121212]/70">
              Atelier Artizan was founded on a singular conviction: that outdoor
              furniture should be as thoughtfully crafted as the spaces it
              inhabits. We are not a factory. We are a design house — a
              collective of metalworkers, textile artisans, and design thinkers
              united by a shared obsession with material integrity.
            </p>
            <p className="text-base leading-relaxed text-[#121212]/70">
              Every piece begins as raw 11-gauge carbon steel, hand-welded by
              our master fabricators into frames that bear our signature lattice
              patterns. Each weld is inspected, each joint tested, each surface
              prepared for a powder coat finish that will endure decades of sun,
              rain, and salt air without compromise.
            </p>
            <p className="text-base leading-relaxed text-[#121212]/70">
              We partner exclusively with Sunbrella and Perennials — the two
              names synonymous with performance textiles — because our clients
              deserve fabrics engineered for beauty and resilience in equal
              measure.
            </p>
          </div>
        </div>
      </section>

      {/* Origin story */}
      <section className="bg-[#121212] px-6 py-24 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs tracking-[0.3em] uppercase text-white/80">
              Origin Story
            </p>
            <h2 className="mt-6 font-sans text-3xl tracking-tight text-[#EDEBE9] md:text-4xl">
              Born from a Gap in the Market
            </h2>
            <Separator className="mx-auto my-8 w-16 bg-[#121212]" />
            <p className="text-base leading-relaxed text-[#EDEBE9]/50">
              The idea for Atelier Artizan emerged from a simple observation:
              the outdoor furniture market was split between mass-produced pieces
              that sacrificed quality and ultra-premium brands that were
              inaccessible to all but the wealthiest buyers. There was no design
              house that married artisan-level craft with direct-to-consumer
              accessibility — no brand that treated outdoor furniture with the
              same reverence as fine indoor furnishings.
            </p>
            <p className="mt-6 text-base leading-relaxed text-[#EDEBE9]/50">
              We set out to change that. By vertically integrating our
              manufacturing — owning the metalwork, the finishing, and the
              upholstery processes under one roof — we eliminated the
              middlemen and the markups. The result is furniture with the soul
              of bespoke craftsmanship at a fraction of the traditional luxury
              price point.
            </p>
          </div>
        </div>
      </section>

      {/* Team */}
      <section id="team" className="px-6 py-24 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <div className="text-center">
            <p className="text-xs tracking-[0.3em] uppercase text-[#121212]/70">
              Leadership
            </p>
            <h2 className="mt-4 font-sans text-3xl tracking-tight text-[#121212] md:text-4xl">
              The People Behind the Pieces
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[#121212]/50">
              A curated team of industry veterans, creative minds, and
              operational leaders driving the Atelier Artizan vision forward.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {teamMembers.map((member) => (
              <div
                key={member.name}
                className="group rounded-lg border border-[#E8E3DD] bg-white p-6 transition-all duration-300 hover:border-[#121212]/30 hover:shadow-lg"
              >
                {/* Avatar placeholder */}
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#525252] to-[#121212]">
                  <span className="font-sans text-lg text-white">
                    {member.initials}
                  </span>
                </div>
                <h3 className="mt-4 font-sans text-lg text-[#121212]">
                  {member.name}
                </h3>
                <p className="text-xs tracking-wide text-[#121212]/70">
                  {member.role}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-[#121212]/50">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Processes */}
      <section id="processes" className="bg-[#EDEBE9] px-6 py-24 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <div className="text-center">
            <p className="text-xs tracking-[0.3em] uppercase text-[#121212]/70">
              Craftsmanship
            </p>
            <h2 className="mt-4 font-sans text-3xl tracking-tight text-[#121212] md:text-4xl">
              Our Processes
            </h2>
          </div>

          <div className="mt-16 grid gap-12 md:grid-cols-3">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#121212]/30 bg-white">
                <span className="font-sans text-xl text-[#121212]">01</span>
              </div>
              <h3 className="mt-6 font-sans text-xl text-[#121212]">
                Design &amp; Engineering
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[#121212]/60">
                Every piece begins in our design studio, where form meets
                function. Our engineers model each frame in 3D, stress-testing
                joints and optimizing weight distribution before a single piece
                of steel is cut.
              </p>
            </div>
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#121212]/30 bg-white">
                <span className="font-sans text-xl text-[#121212]">02</span>
              </div>
              <h3 className="mt-6 font-sans text-xl text-[#121212]">
                Fabrication &amp; Welding
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[#121212]/60">
                Raw 11-gauge carbon steel is cut, bent, and hand-welded by
                master fabricators. Our signature lattice patterns — Artizan,
                Capri, and Monaco — are created through a proprietary jig
                system that ensures sub-millimeter precision.
              </p>
            </div>
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#121212]/30 bg-white">
                <span className="font-sans text-xl text-[#121212]">03</span>
              </div>
              <h3 className="mt-6 font-sans text-xl text-[#121212]">
                Finishing &amp; Upholstery
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[#121212]/60">
                Frames undergo a multi-stage preparation before receiving their
                powder coat finish — cured at 400°F for a ceramic-like
                hardness. Cushions are then tailored from your chosen fabric
                around high-resilience foam cores with Dacron wrapping.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Metalwork & Finishes */}
      <section className="px-6 py-24 lg:px-12">
        <div className="mx-auto grid max-w-[1400px] gap-16 lg:grid-cols-2">
          <div>
            {/* Gradient placeholder for metalwork image */}
            <div className="aspect-[4/3] overflow-hidden rounded-lg bg-gradient-to-br from-[#6B6B6B] via-[#404040] to-[#121212]" />
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-xs tracking-[0.3em] uppercase text-[#121212]/70">
              Materials
            </p>
            <h2 className="mt-4 font-sans text-3xl tracking-tight text-[#121212] md:text-4xl">
              Metalwork &amp; Finishes
            </h2>
            <p className="mt-6 text-base leading-relaxed text-[#121212]/70">
              We work exclusively with 11-gauge carbon steel — chosen for its
              exceptional strength-to-weight ratio and welding characteristics.
              Each frame is hand-welded using MIG and TIG techniques appropriate
              to the joint, then ground and polished to a seamless finish.
            </p>
            <p className="mt-4 text-base leading-relaxed text-[#121212]/70">
              Our powder coating process begins with a phosphate pre-treatment
              for corrosion resistance, followed by electrostatic application of
              the chosen finish, and curing at 400°F. The result is a
              ceramic-hard surface that resists UV degradation, salt spray, and
              impact — warranted for a lifetime of outdoor use.
            </p>
            <p className="mt-4 text-base leading-relaxed text-[#121212]/70">
              Choose from 10 curated finishes, from classic Matte Black to warm
              grays, each selected to complement the natural aesthetic of outdoor
              environments.
            </p>
          </div>
        </div>
      </section>

      {/* Textiles */}
      <section className="bg-[#121212] px-6 py-24 lg:px-12">
        <div className="mx-auto grid max-w-[1400px] gap-16 lg:grid-cols-2">
          <div className="flex flex-col justify-center">
            <p className="text-xs tracking-[0.3em] uppercase text-white/80">
              Textiles
            </p>
            <h2 className="mt-4 font-sans text-3xl tracking-tight text-[#EDEBE9] md:text-4xl">
              Sunbrella &amp; Perennials
            </h2>
            <p className="mt-6 text-base leading-relaxed text-[#EDEBE9]/50">
              We partner with the two most respected names in performance
              textiles. Sunbrella fabrics — solution-dyed acrylic woven for
              exceptional UV resistance, water repellency, and colorfastness —
              form our core offering of 11 curated colorways.
            </p>
            <p className="mt-4 text-base leading-relaxed text-[#EDEBE9]/50">
              For clients seeking the ultimate in luxury, our Perennials
              collection offers 5 premium weaves renowned for their hand, depth
              of color, and unmatched durability. Every Perennials fabric is
              independently tested to withstand 5,000+ hours of UV exposure
              and is bleach-cleanable for effortless maintenance.
            </p>
            <div className="mt-8">
              <Button
                variant="outline"
                size="lg"
                className="rounded-none border-[#121212] tracking-[0.1em] uppercase text-[#121212] hover:bg-[#121212] hover:text-white"
                asChild
              >
                <Link href="/products">Explore the Collection</Link>
              </Button>
            </div>
          </div>
          <div>
            {/* Gradient placeholder for textiles image */}
            <div className="aspect-[4/3] overflow-hidden rounded-lg bg-gradient-to-br from-[#EDEBE9] via-[#9E9E9E] to-[#525252]" />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 lg:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-sans text-3xl tracking-tight text-[#121212] md:text-4xl">
            Ready to Begin?
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[#121212]/50">
            Whether you&apos;re furnishing a private residence, a boutique
            hotel, or a commercial terrace, our design consultants are here to
            help you realize your vision.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button
              size="xl"
              className="rounded-none bg-[#121212] tracking-[0.15em] uppercase text-white hover:bg-[#2a2a2a]"
              asChild
            >
              <Link href="/consultation">Book a Consultation</Link>
            </Button>
            <Button
              variant="outline"
              size="xl"
              className="rounded-none border-[#121212] tracking-[0.15em] uppercase"
              asChild
            >
              <Link href="/products">Browse Collection</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
