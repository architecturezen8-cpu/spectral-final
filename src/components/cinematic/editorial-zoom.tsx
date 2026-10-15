"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useStableViewport } from "./use-stable-viewport";

/**
 * Editorial Zoom — replaces the editorial section.
 *
 * The GOLDEN assassin (user's leap-of-faith photo, background keyed out to a
 * transparent cutout) is displayed. As the user scrolls, the image smoothly
 * zooms into specific regions with text overlays:
 *   - Hood/head: "November 17" (Date)
 *   - Right hand: "9:00 AM to 4:00 PM" (Time)
 *   - Belt: "Grand Mountain Hotel Matale" (Location)
 *
 * Between stages, it zooms back out to the full view. Text has entrance
 * animations (fade + slide) and a glowing backdrop for highlight visibility.
 *
 * The cutout (/images/assassin-golden.webp) has no background, so it blends
 * into the navy page with zero visible edges. Both image layers use the same
 * intrinsic-size <img> inside a shrink-wrap wrapper, so the zoom transform
 * origins are always % of the SUBJECT box on any viewport.
 */

// Subject-box coordinates (fractions) on assassin-golden.webp (1398x1608):
//   Hood/head:   (50%, 88%)  — bottom of the head-down dive
//   Right hand:  (91%, 71%)  — tip of the spread right arm
//   Belt/waist:  (50%, 66%)  — red band across the waist
const KEYFRAMES: Keyframe[] = [
  { p: 0.0, scale: 1.0, x: 0.5, y: 0.5 },
  { p: 0.05, scale: 1.0, x: 0.5, y: 0.5 },

  // Stage 1: Hood → "November 17"
  { p: 0.15, scale: 3.5, x: 0.5, y: 0.88, label: "November 17", subLabel: "Date", labelSide: "left" },
  { p: 0.22, scale: 3.5, x: 0.5, y: 0.88, label: "November 17", subLabel: "Date", labelSide: "left" },

  { p: 0.3, scale: 1.0, x: 0.5, y: 0.5 },

  // Stage 2: Right hand → "9:00 AM to 4:00 PM"
  { p: 0.4, scale: 3.5, x: 0.91, y: 0.71, label: "9:00 AM to 4:00 PM", subLabel: "Time", labelSide: "right" },
  { p: 0.47, scale: 3.5, x: 0.91, y: 0.71, label: "9:00 AM to 4:00 PM", subLabel: "Time", labelSide: "right" },

  { p: 0.55, scale: 1.0, x: 0.5, y: 0.5 },

  // Stage 3: Belt → "Grand Mountain Hotel Matale"
  { p: 0.65, scale: 3.5, x: 0.5, y: 0.66, label: "Grand Mountain Hotel", subLabel: "Location · Matale", labelSide: "left" },
  { p: 0.72, scale: 3.5, x: 0.5, y: 0.66, label: "Grand Mountain Hotel", subLabel: "Location · Matale", labelSide: "left" },

  { p: 0.85, scale: 1.0, x: 0.5, y: 0.5 },
  { p: 1.0, scale: 1.0, x: 0.5, y: 0.5 },
];

const SCROLL_HEIGHT = 5;

const CUTOUT_SRC = "/images/assassin-golden.webp";
const CUTOUT_W = 1398;
const CUTOUT_H = 1608;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function getInterpolated(progress: number) {
  let kf1 = KEYFRAMES[0];
  let kf2 = KEYFRAMES[KEYFRAMES.length - 1];
  for (let i = 0; i < KEYFRAMES.length - 1; i++) {
    if (progress >= KEYFRAMES[i].p && progress <= KEYFRAMES[i + 1].p) {
      kf1 = KEYFRAMES[i];
      kf2 = KEYFRAMES[i + 1];
      break;
    }
  }
  const t = kf2.p === kf1.p ? 0 : (progress - kf1.p) / (kf2.p - kf1.p);
  const easeT = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const scale = lerp(kf1.scale, kf2.scale, easeT);

  return {
    scale,
    x: lerp(kf1.x, kf2.x, easeT),
    y: lerp(kf1.y, kf2.y, easeT),
    label: t < 0.5 ? kf1.label : kf2.label,
    subLabel: t < 0.5 ? kf1.subLabel : kf2.subLabel,
    labelSide: t < 0.5 ? kf1.labelSide : kf2.labelSide,
    // Text opacity: full when zoomed in (scale > 2.5), fades out otherwise
    textOpacity: Math.max(0, Math.min(1, (scale - 2.0) / 1.0)),
  };
}

export function EditorialZoom() {
  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const [currentLabel, setCurrentLabel] = useState<string | undefined>();
  // Stable viewport height — immune to mobile URL-bar show/hide resizes.
  const stableVp = useStableViewport();

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = stableVp.current.h || window.innerHeight;
      const total = Math.max(1, el.offsetHeight - vh);
      const scrolled = Math.max(0, -rect.top);
      const p = Math.max(0, Math.min(1, scrolled / total));
      setProgress(p);
      raf = 0;
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [stableVp]);

  const state = getInterpolated(progress);

  // Track label changes to trigger entrance animations
  useEffect(() => {
    if (state.label !== currentLabel) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentLabel(state.label);
    }
  }, [state.label, currentLabel]);

  return (
    <section
      ref={sectionRef}
      style={{ height: `${SCROLL_HEIGHT * 100}vh` }}
      className="relative w-full bg-[#020514]"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#020514] flex items-center justify-center">
        {/* Background Chinese/Japanese characters — subtle, sparse */}
        <div className="absolute inset-0 pointer-events-none z-0" aria-hidden>
          <span className="absolute top-[15%] left-[8%] font-jp text-white/[0.04] text-[8rem] font-semibold select-none">影</span>
          <span className="absolute top-[60%] left-[15%] font-jp text-white/[0.03] text-[6rem] font-semibold select-none">刃</span>
          <span className="absolute top-[25%] right-[10%] font-jp text-white/[0.04] text-[7rem] font-semibold select-none">魂</span>
          <span className="absolute bottom-[15%] right-[12%] font-jp text-white/[0.03] text-[5rem] font-semibold select-none">道</span>
          <span className="absolute top-[45%] left-[45%] font-jp text-[#c0c8d8]/[0.02] text-[10rem] font-semibold select-none">信</span>
        </div>

        {/* Subtle golden glow touch */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 50%, rgba(230,210,160,0.05) 0%, transparent 50%)",
          }}
          aria-hidden
        />

        {/* LAYER 1: Blurred golden assassin (always visible) — transparent
            cutout, so it blends into the navy background with no edges. */}
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <div
            className="relative"
            style={{
              transform: `scale(${state.scale})`,
              transformOrigin: `${state.x * 100}% ${state.y * 100}%`,
              filter:
                "drop-shadow(0 0 55px rgba(230,210,160,0.16)) drop-shadow(0 0 30px rgba(2,5,20,0.85)) blur(2px) brightness(0.78)",
            }}
          >
            <Image
              src={CUTOUT_SRC}
              alt="Golden assassin diving in a leap of faith"
              width={CUTOUT_W}
              height={CUTOUT_H}
              priority
              quality={90}
              className="max-h-[86vh] max-w-[88vw] w-auto h-auto object-contain select-none"
            />
          </div>
        </div>

        {/* LAYER 2: Sharp assassin (revealed only in the zoomed area).
            Same transform as Layer 1, but with a radial mask centered on the
            zoom target. Only the hood/hand/belt area is sharp; the rest stays
            blurred from Layer 1. Fades in only when zoomed (scale > 2). */}
        {state.scale > 1.8 && (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
            style={{ opacity: Math.min(1, (state.scale - 1.8) / 0.8) }}
          >
            <div
              className="relative"
              style={{
                transform: `scale(${state.scale})`,
                transformOrigin: `${state.x * 100}% ${state.y * 100}%`,
                // Radial mask centered on the zoom target — reveals a
                // circular area of the sharp cutout, fades at the edges.
                WebkitMaskImage: `radial-gradient(circle 15% at ${state.x * 100}% ${state.y * 100}%, black 35%, rgba(0,0,0,0.5) 60%, transparent 85%)`,
                maskImage: `radial-gradient(circle 15% at ${state.x * 100}% ${state.y * 100}%, black 35%, rgba(0,0,0,0.5) 60%, transparent 85%)`,
              }}
            >
              <Image
                src={CUTOUT_SRC}
                alt=""
                width={CUTOUT_W}
                height={CUTOUT_H}
                aria-hidden
                quality={90}
                className="max-h-[86vh] max-w-[88vw] w-auto h-auto object-contain select-none"
              />
            </div>
          </div>
        )}

        {/* Text overlay — with staggered entrance animations + glowing backdrop */}
        {state.label && state.textOpacity > 0.1 && (
          <div
            key={state.label}
            className="absolute top-1/2 -translate-y-1/2 z-20 pointer-events-none"
            style={{
              opacity: state.textOpacity,
              left: state.labelSide === "left" ? "6%" : "auto",
              right: state.labelSide === "right" ? "6%" : "auto",
            }}
          >
            {/* Glowing backdrop for highlight visibility */}
            <div
              className="absolute inset-0 -m-10 rounded-3xl pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(2,5,20,0.92) 0%, rgba(2,5,20,0.5) 50%, transparent 80%)",
                filter: "blur(12px)",
              }}
            />
            <div className="relative flex flex-col gap-3">
              {/* Sub-label (Date/Time/Location) — slides + fades */}
              <span
                className="zoom-sublabel-enter text-[#c0c8d8] font-sans text-[0.6rem] tracking-[0.5em] uppercase"
                style={{ textShadow: "0 0 20px rgba(192,200,216,0.8)" }}
              >
                {state.subLabel}
              </span>
              {/* Main label — slides from side + scales + fades */}
              <span
                className="zoom-label-enter font-serif font-light text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-tight"
                style={{
                  textShadow: "0 0 30px rgba(255,255,255,0.6), 0 0 60px rgba(192,200,216,0.4)",
                }}
              >
                {state.label}
              </span>
              {/* Divider — grows from 0 width */}
              <div
                className="zoom-divider-enter h-px bg-gradient-to-r from-[#c0c8d8] to-transparent mt-2"
                style={{ boxShadow: "0 0 10px rgba(192,200,216,0.6)" }}
              />
            </div>
          </div>
        )}

        {/* Vignette for readability */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 30%, rgba(2,5,20,0.7) 100%)",
          }}
        />

        {/* Navy edge bridges — this section emerges from the hero above and
            dissolves into the creed section below, so the page reads as one
            continuous scene instead of separate blocks */}
        <div className="absolute inset-x-0 top-0 h-[18vh] bg-gradient-to-b from-[#020514] to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-[18vh] bg-gradient-to-t from-[#020514] to-transparent pointer-events-none" />
      </div>
    </section>
  );
}
