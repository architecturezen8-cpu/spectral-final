"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Global smooth scrolling via Lenis.
 *
 * Always initializes Lenis on mount and calls `onReady` with the instance.
 * The caller can then `stop()` / `start()` it (e.g. to pause during a
 * preloader or an end-frame lock).
 */
export function useSmoothScroll(onReady?: (lenis: Lenis) => void) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.2,
    });

    // Start paused — the caller will start it when ready
    lenis.stop();

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    if (onReady) onReady(lenis);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);
}
