"use client";

import { useEffect, useState } from "react";

interface CountdownProps {
  target: number;
}

function pad(n: number) {
  return String(Math.max(0, Math.floor(n))).padStart(2, "0");
}

// Chinese numerals for the watermark background of each cell
const JP_LABELS = ["日", "時", "分", "秒"];

/**
 * Countdown to a target time. Styled like the samurai button (cinematic white
 * with blade-clip corners + gold accent stripe). Each cell has a faint, large
 * Chinese/Japanese character watermark in the background.
 */
export function Countdown({ target }: CountdownProps) {
  // Start with the target diff from a fixed reference (not Date.now()) to
  // avoid hydration mismatch (server vs client time differ). Update to the
  // real value after mount.
  const [remaining, setRemaining] = useState(() => {
    // Compute once on the client after mount; on server, return a placeholder.
    return 0;
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    setRemaining(target - Date.now());
    const id = setInterval(() => setRemaining(target - Date.now()), 1000);
    return () => clearInterval(id);
  }, [target]);

  const totalSeconds = Math.max(0, Math.floor(remaining / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const cells = [
    { v: pad(days), l: "Days" },
    { v: pad(hours), l: "Hours" },
    { v: pad(minutes), l: "Min" },
    { v: pad(seconds), l: "Sec" },
  ];

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-white/50 font-sans text-[0.5rem] sm:text-[0.55rem] tracking-[0.4em] uppercase">
        Launches Nov 17 · 9:00 AM
      </span>
      <div className="flex items-stretch gap-2 sm:gap-2.5">
        {cells.map((c, i) => (
          <div
            key={c.l}
            className="relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-white to-[#e8e8e8] text-black
              w-[50px] h-[60px] sm:w-[62px] sm:h-[72px]"
            style={{
              clipPath:
                "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
            }}
          >
            {/* gold accent stripe on left */}
            <span
              className="absolute top-0 left-0 w-[2px] h-full"
              style={{ background: "linear-gradient(180deg, #c0c8d8 0%, #8090a8 100%)" }}
            />
            {/* Chinese/Japanese character watermark */}
            <span
              className="pointer-events-none absolute inset-0 flex items-center justify-center font-jp text-black/[0.06] text-4xl sm:text-5xl font-semibold select-none"
              aria-hidden
            >
              {JP_LABELS[i]}
            </span>
            <span className="relative font-serif text-xl sm:text-2xl font-semibold leading-none tabular-nums">
              {c.v}
            </span>
            <span className="relative mt-1 font-sans text-[0.45rem] sm:text-[0.5rem] tracking-[0.25em] uppercase text-black/60">
              {c.l}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
