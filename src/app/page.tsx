"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Particles } from "@/components/cinematic/particles";
import { SamuraiButton } from "@/components/cinematic/samurai-button";
import { Reveal } from "@/components/cinematic/reveal";
import { CinematicHero } from "@/components/cinematic/cinematic-hero";
import { EditorialZoom } from "@/components/cinematic/editorial-zoom";

export default function Page() {
  const [scrollY, setScrollY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const leapParallax = Math.min(Math.max(0, scrollY - 1800) * 0.12, 180);

  return (
    <main className="min-h-screen flex flex-col bg-[#020514] relative text-white grain-overlay relative">
      {/* ===== Top Navigation ===== */}
      <nav className="fixed top-0 left-0 right-0 z-50 mix-blend-difference">
        <div className="mx-auto max-w-[1500px] px-6 md:px-10 py-4 flex items-center justify-between">
          <Image
            src="/images/spectral-logo.png"
            alt="Spectral Logo"
            width={180}
            height={100}
            className="h-12 md:h-16 w-auto"
            priority
          />
          <ul className="hidden md:flex items-center gap-9 text-white font-sans text-[0.7rem] tracking-[0.25em] uppercase">
            <li className="link-draw cursor-pointer">Story</li>
            <li className="link-draw cursor-pointer">World</li>
            <li className="link-draw cursor-pointer">Characters</li>
            <li className="link-draw cursor-pointer">Gallery</li>
            <li className="link-draw cursor-pointer">Creed</li>
          </ul>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden text-white flex flex-col gap-1.5 p-2"
            aria-label="Menu"
          >
            <span className="block w-6 h-px bg-current" />
            <span className="block w-6 h-px bg-current" />
            <span className="block w-4 h-px bg-current ml-auto" />
          </button>
        </div>
      </nav>

      {/* ===== 1. CINEMATIC SCROLL-DRIVEN HERO (image sequence) ===== */}
      <CinematicHero />

      {/* ===== 2. EDITORIAL ZOOM (assassin zoom: hoodie, hand, belt) ===== */}
      <EditorialZoom />


      {/* ===== 3. DARK INTERLUDE QUOTE ===== */}
      <section className="relative w-full overflow-hidden bg-[#020514] relative py-32 md:py-44">
        <Particles variant="dark" showBirds showLetters={false} showFeathers density={0.5} />
        {/* Navy edge fades — blend this section into the ones above/below */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#020514] via-transparent to-[#020514]" />

        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <Reveal as="span" className="block text-[#c0c8d8] font-sans text-[0.65rem] tracking-[0.5em] uppercase mb-8">
            教義 · The Creed
          </Reveal>
          <Reveal delay={120} as="blockquote" className="font-serif font-light italic text-white text-2xl sm:text-3xl md:text-5xl leading-[1.25] tracking-tight">
            &ldquo;We work in the dark to serve the light.
            <span className="block mt-4 text-[#c0c8d8] not-italic font-medium" style={{ textShadow: "0 0 30px rgba(251,192,45,0.3)" }}>We are assassins.&rdquo;</span>
          </Reveal>
          <Reveal delay={300} className="mt-10 flex items-center justify-center gap-4">
            <span className="block w-12 h-px bg-[#c0c8d8]/60" />
            <span className="arabic-text text-white/60 text-2xl">الإخفاء</span>
            <span className="block w-12 h-px bg-[#c0c8d8]/60" />
          </Reveal>
        </div>
      </section>

      {/* ===== 4. PLOT AND ROLE (dark, standing assassin) ===== */}
      <section className="relative w-full overflow-hidden bg-[#020514] relative">
        <div className="absolute inset-0">
          <Image
            src="/images/standing-assassin.png"
            alt="Hooded assassin with a falcon on a rocky desert"
            fill
            className="object-cover img-desaturate"
            sizes="100vw"
          />
          {/* Soft navy dim (keeps text readable without a hard black wash) */}
          <div className="absolute inset-0 bg-[#020514]/50" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#020514]/70 via-transparent to-[#020514]/70" />
          {/* Edge bridges — the image emerges from / dissolves back into the
              page background so sections 3 → 4 → 5 read as one continuous
              scene instead of four separate blocks */}
          <div className="absolute inset-x-0 top-0 h-[32vh] bg-gradient-to-b from-[#020514] to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-[28vh] bg-gradient-to-t from-[#020514] to-transparent" />
        </div>

        <Particles variant="dark" showBirds showLetters showFeathers={false} density={0.6} />

        <div className="relative z-10 mx-auto max-w-[1500px] px-6 md:px-10 py-28 md:py-40">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
            <Reveal className="lg:col-span-7">
              <span className="block text-[#c0c8d8] font-sans text-[0.65rem] tracking-[0.5em] uppercase mb-6">
                物語と役割 · القصة
              </span>
              <h2 className="font-serif font-light text-white text-[2.6rem] sm:text-[4rem] md:text-[5.5rem] lg:text-[6.5rem] leading-[0.98] tracking-tight">
                Plot and<br /><em className="text-[#c0c8d8] font-medium" style={{ textShadow: "0 0 30px rgba(251,192,45,0.3)" }}>Role</em>
              </h2>
              <div className="gold-line w-32 mt-8" />
            </Reveal>

            <Reveal delay={150} className="lg:col-span-5 lg:pb-4">
              <p className="font-sans text-white/70 text-sm md:text-base leading-[1.9] tracking-wide">
                Bayek of Siwa — a Medjay whose grief becomes a blade. Through
                the burning cities of Ptolemaic Egypt he forges the brotherhood
                that will outlive empires. The falcon sees what the king cannot.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <SamuraiButton variant="gold">Read the Saga</SamuraiButton>
                <SamuraiButton variant="ghost">Meet Bayek</SamuraiButton>
              </div>
              <div className="mt-10 grid grid-cols-3 gap-4">
                {[
                  { k: "49", l: "BCE · Setting" },
                  { k: "V", l: "Regions" },
                  { k: "∞", l: "Shadows" },
                ].map((s) => (
                  <div key={s.l} className="border-t border-[#c0c8d8]/30 pt-3">
                    <div className="font-serif text-3xl text-[#c0c8d8]">{s.k}</div>
                    <div className="font-sans text-[0.6rem] tracking-[0.25em] uppercase text-white/60 mt-1">{s.l}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===== 5. FINAL CTA (dark) ===== */}
      <section className="relative dark-bg overflow-hidden py-28 md:py-40">
        <Particles variant="dark" showBirds showLetters showFeathers density={0.8} />

        <div className="absolute inset-x-0 top-[12%] flex justify-center pointer-events-none">
          <span className="ghost-text text-[20vw] md:text-[16vw] leading-none whitespace-nowrap">JOIN</span>
        </div>

        <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
          <Reveal as="span" className="block text-[#c0c8d8] font-sans text-[0.65rem] tracking-[0.5em] uppercase mb-6">
            入会 · انضم
          </Reveal>
          <Reveal delay={120} as="h2" className="font-serif font-light text-white text-[2.2rem] sm:text-[3.5rem] md:text-[4.5rem] leading-[1.05] tracking-tight">
            Take the <em className="text-[#c0c8d8] font-medium" style={{ textShadow: "0 0 30px rgba(251,192,45,0.3)" }}>Oath</em>
          </Reveal>
          <Reveal delay={250} className="mt-8">
            <p className="font-sans text-white/60 text-sm md:text-base leading-[1.9] max-w-xl mx-auto">
              The brotherhood awaits those who would walk unseen. Enter your
              mark below and receive the chronicle of the unseen blade.
            </p>
          </Reveal>

          <Reveal delay={400} className="mt-10 max-w-md mx-auto">
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex flex-col sm:flex-row items-stretch gap-3"
            >
              <input
                type="email"
                placeholder="your mark..."
                aria-label="email"
                className="flex-1 bg-transparent border border-white/30 px-5 py-3 font-sans text-sm tracking-wide text-white placeholder:text-white/40 focus:outline-none focus:border-[#c0c8d8] transition-colors"
              />
              <SamuraiButton variant="gold" type="submit">Swear In</SamuraiButton>
            </form>
            <p className="mt-4 font-sans text-[0.6rem] tracking-[0.3em] uppercase text-white/50">
              闇に仕える · نخدم الظلام
            </p>
          </Reveal>
        </div>
      </section>

      {/* ===== FOOTER (sticky bottom) ===== */}
      <footer className="mt-auto bg-[#020514] relative text-white relative overflow-hidden border-t border-[#2a2a2a]">
        <div className="absolute inset-0 opacity-[0.08]">
          <span className="arabic-text absolute top-4 left-8 text-[8rem] text-[#c0c8d8]">الإخفاء</span>
          <span className="tategaki absolute top-4 right-8 text-7xl text-white">暗殺者</span>
        </div>
        <div className="relative z-10 mx-auto max-w-[1500px] px-6 md:px-10 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            <div className="col-span-2">
              <div className="mb-5">
                <Image
                  src="/images/spectral-logo.png"
                  alt="Spectral Logo"
                  width={200}
                  height={111}
                  className="h-12 md:h-14 w-auto"
                />
              </div>
              <p className="font-sans text-xs leading-[1.9] text-white/50 max-w-xs tracking-wide">
                A cinematic editorial tribute to the brotherhood of the unseen
                blade. Designed for those who walk between shadow and gold.
              </p>
            </div>
            <div>
              <h5 className="font-sans text-[0.6rem] tracking-[0.4em] uppercase text-[#c0c8d8] mb-4">Explore</h5>
              <ul className="space-y-2.5 font-sans text-xs text-white/60">
                <li className="link-draw cursor-pointer">Story</li>
                <li className="link-draw cursor-pointer">World</li>
                <li className="link-draw cursor-pointer">Characters</li>
                <li className="link-draw cursor-pointer">Gallery</li>
              </ul>
            </div>
            <div>
              <h5 className="font-sans text-[0.6rem] tracking-[0.4em] uppercase text-[#c0c8d8] mb-4">Brotherhood</h5>
              <ul className="space-y-2.5 font-sans text-xs text-white/60">
                <li className="link-draw cursor-pointer">The Creed</li>
                <li className="link-draw cursor-pointer">Chronicles</li>
                <li className="link-draw cursor-pointer">The Oath</li>
                <li className="link-draw cursor-pointer">Contact</li>
              </ul>
            </div>
          </div>

          <div className="gold-line my-10 opacity-40" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="font-sans text-[0.6rem] tracking-[0.3em] uppercase text-white/40">
              © MMXXVI · Nothing is true · كل شيء مباح
            </p>
            <div className="flex items-center gap-5 font-sans text-[0.6rem] tracking-[0.3em] uppercase text-white/40">
              <span className="link-draw cursor-pointer">Privacy</span>
              <span className="link-draw cursor-pointer">Terms</span>
              <span className="link-draw cursor-pointer">Press</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
