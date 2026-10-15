"use client";

import { useEffect, useRef } from "react";

/**
 * Returns a ref holding a STABLE viewport size { w, h }.
 *
 * Mobile browsers fire a `resize` event when the URL bar hides/shows, which
 * makes `window.innerHeight` jump by ~60-100px in the middle of a scroll.
 * Any scroll math based on it stutters — for the image sequence a progress
 * jump means frames visibly skip or PLAY BACKWARDS.
 *
 * We only re-measure when the viewport WIDTH actually changes (rotation,
 * real window resize) — never on URL-bar show/hide.
 */
export function useStableViewport() {
  const stableRef = useRef({ w: 0, h: 0 });

  useEffect(() => {
    const measure = () => {
      const { w } = stableRef.current;
      if (w === 0 || Math.abs(window.innerWidth - w) > 1) {
        stableRef.current = { w: window.innerWidth, h: window.innerHeight };
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return stableRef;
}
