"use client";

import { useEffect, useMemo, useState } from "react";

/**
 * Cinematic background layer: birds, feathers, dust, faint Arabic & Japanese
 * letters drifting across a section. Designed to sit behind content with low
 * opacity so text blends with the background for a cinematic vibe.
 *
 * IMPORTANT: All positions/sizes are generated with Math.random(), which
 * produces different values on server vs client → hydration mismatch. To fix
 * this, particles are only rendered AFTER mount (client-only). The server
 * renders nothing; the client renders the particles once mounted.
 */

type Variant = "light" | "dark";

interface ParticlesProps {
  variant?: Variant;
  density?: number;
  showBirds?: boolean;
  showLetters?: boolean;
  showFeathers?: boolean;
  className?: string;
}

const ARABIC_CHARS = ["ق", "ص", "د", "ح", "م", "ع", "ف", "ر", "س", "ت", "ن", "و", "ه", "ل", "ا"];
const JP_CHARS = ["影", "信", "念", "闇", "鷹", "刃", "魂", "道", "空", "命", "血", "風", "静", "骨", "謎"];

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function Particles({
  variant = "light",
  density = 1,
  showBirds = true,
  showLetters = true,
  showFeathers = true,
  className = "",
}: ParticlesProps) {
  const isLight = variant === "light";
  const fg = isLight ? "2, 5, 20" : "240, 240, 240";
  const gold = "192, 200, 216";

  // Render particles only after mount (client-only) to avoid hydration
  // mismatch caused by Math.random() producing different values on server
  // vs client.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const birds = useMemo(() => {
    if (!showBirds) return [];
    return Array.from({ length: 6 }).map((_, i) => ({
      id: i,
      top: `${rand(5, 70)}%`,
      left: `${rand(-10, 95)}%`,
      scale: rand(0.5, 1.2),
      duration: rand(18, 34),
      delay: rand(0, 20),
      opacity: rand(0.12, 0.3),
    }));
  }, [showBirds]);

  const feathers = useMemo(() => {
    if (!showFeathers) return [];
    return Array.from({ length: 10 }).map((_, i) => ({
      id: i,
      left: `${rand(0, 100)}%`,
      duration: rand(14, 28),
      delay: rand(0, 25),
      scale: rand(0.5, 1.1),
      rotate: rand(0, 360),
    }));
  }, [showFeathers]);

  const dust = useMemo(() => {
    return Array.from({ length: Math.floor(24 * density) }).map((_, i) => ({
      id: i,
      top: `${rand(0, 100)}%`,
      left: `${rand(0, 100)}%`,
      size: rand(1, 3),
      duration: rand(6, 14),
      delay: rand(0, 10),
      isGold: Math.random() > 0.7,
    }));
  }, [density]);

  const letters = useMemo(() => {
    if (!showLetters) return [];
    const items: Array<{
      id: number;
      char: string;
      top: string;
      left: string;
      size: number;
      rotate: number;
      isAr: boolean;
      opacity: number;
    }> = [];
    // Arabic
    for (let i = 0; i < 5; i++) {
      items.push({
        id: i,
        char: ARABIC_CHARS[Math.floor(Math.random() * ARABIC_CHARS.length)],
        top: `${rand(8, 85)}%`,
        left: `${rand(2, 95)}%`,
        size: rand(28, 64),
        rotate: rand(-12, 12),
        isAr: true,
        opacity: rand(0.05, 0.14),
      });
    }
    // Japanese
    for (let i = 0; i < 5; i++) {
      items.push({
        id: 100 + i,
        char: JP_CHARS[Math.floor(Math.random() * JP_CHARS.length)],
        top: `${rand(8, 85)}%`,
        left: `${rand(2, 95)}%`,
        size: rand(32, 72),
        rotate: rand(-15, 15),
        isAr: false,
        opacity: rand(0.05, 0.16),
      });
    }
    return items;
  }, [showLetters]);

  // Render nothing on the server; render particles only after mount (client).
  if (!mounted) {
    return <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden />;
  }

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      {/* Floating letters — Arabic + Japanese */}
      {letters.map((l) => (
        <span
          key={l.id}
          className={`absolute select-none ${l.isAr ? "arabic-text" : ""}`}
          style={{
            top: l.top,
            left: l.left,
            fontSize: `${l.size}px`,
            opacity: l.opacity,
            color: l.isAr ? `rgba(${gold}, 1)` : `rgba(${fg}, 1)`,
            transform: `rotate(${l.rotate}deg)`,
            fontFamily: l.isAr ? "var(--font-ar)" : "var(--font-jp)",
            fontWeight: 500,
            mixBlendMode: isLight ? "multiply" : "screen",
          }}
        >
          {l.char}
        </span>
      ))}

      {/* Soaring birds (silhouette) */}
      {birds.map((b) => (
        <svg
          key={`bird-${b.id}`}
          className="bird-fly"
          width={36 * b.scale}
          height={18 * b.scale}
          viewBox="0 0 36 18"
          style={{
            top: b.top,
            left: b.left,
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`,
            opacity: b.opacity,
            color: `rgba(${fg}, 1)`,
          }}
        >
          <path
            d="M2 12 Q8 4 14 9 Q18 12 22 9 Q28 4 34 12"
            stroke="currentColor"
            strokeWidth="1.4"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ))}

      {/* Falling feathers */}
      {feathers.map((f) => (
        <svg
          key={`feather-${f.id}`}
          className="feather"
          width={14 * f.scale}
          height={26 * f.scale}
          viewBox="0 0 14 26"
          style={{
            left: f.left,
            top: "-30px",
            animationDuration: `${f.duration}s`,
            animationDelay: `${f.delay}s`,
            transform: `rotate(${f.rotate}deg)`,
            opacity: 0.18,
          }}
        >
          <path
            d="M7 1 Q12 8 11 16 Q10 22 7 25 Q4 22 3 16 Q2 8 7 1 Z"
            fill={`rgba(${gold}, 0.6)`}
            stroke={`rgba(${fg}, 0.4)`}
            strokeWidth="0.5"
          />
          <line x1="7" y1="3" x2="7" y2="24" stroke={`rgba(${fg}, 0.3)`} strokeWidth="0.4" />
        </svg>
      ))}

      {/* Dust motes */}
      {dust.map((d) => (
        <span
          key={`dust-${d.id}`}
          className="dust rounded-full"
          style={{
            top: d.top,
            left: d.left,
            width: `${d.size}px`,
            height: `${d.size}px`,
            background: d.isGold ? `rgba(${gold}, 0.5)` : `rgba(${fg}, 0.35)`,
            animationDuration: `${d.duration}s`,
            animationDelay: `${d.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
