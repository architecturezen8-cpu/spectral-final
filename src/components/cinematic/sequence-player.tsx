"use client";

import { useEffect, useRef, useState } from "react";
import { useStableViewport } from "./use-stable-viewport";

interface SequencePlayerProps {
  desktopFrames: number;
  mobileFrames: number;
  desktopUrl: (i: number) => string;
  mobileUrl: (i: number) => string;
  scrollHeight?: number;
  maskUrl: string;
  className?: string;
  onProgress?: (p: number) => void;
  /** Called when all frames are preloaded */
  onReady?: () => void;
  /** How long (ms) the last frame stays pinned once first reached. This is a
   * VISUAL hold only — the page scroll is never frozen. */
  lockDuration?: number;
  /** Whether to start in a "ready" state (preloader done). When false, the
   * canvas stays hidden until true. */
  ready?: boolean;
}

/**
 * Scroll-driven, SMOOTH image-sequence player.
 *
 * - currentFrame lerps toward the scroll-mapped targetFrame every RAF tick.
 * - The video finishes at VIDEO_END_RATIO of the scroll track; the rest of
 *   the track holds the last frame, so the SPECTRAL title card + countdown
 *   stay up while the user keeps scrolling into the next section.
 * - VISUAL-ONLY end hold: when the last frame is first reached it is pinned
 *   for `lockDuration` ms. The scroll is NEVER frozen (no lenis.stop/start) —
 *   freezing + restarting Lenis used to fight the native touch scroller on
 *   mobile and yank the page (and the frames) BACKWARDS.
 * - Scroll progress is computed against a STABLE viewport height so mobile
 *   URL-bar show/hide can't make the frames skip or rewind.
 * - Near the end the card drifts up slightly (with a matching overscan zoom)
 *   so the countdown sits clearly BELOW the SPECTRAL title.
 * - Video fade-in at the start; bottom blends into the page background.
 */

// Fraction of the scroll track over which the video plays. The remaining
// track is a "hold zone" for the last frame + countdown.
const VIDEO_END_RATIO = 0.85;
// End-card upward drift (fraction of canvas height) + matching overscan zoom.
const END_LIFT = 0.06;
const END_ZOOM = 0.07;

export function SequencePlayer({
  desktopFrames,
  mobileFrames,
  desktopUrl,
  mobileUrl,
  scrollHeight = 3,
  maskUrl,
  className = "",
  onProgress,
  onReady,
  lockDuration = 3000,
  ready = true,
}: SequencePlayerProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef(0);
  const targetFrameRef = useRef(0);
  const rafRef = useRef<number>(0);
  const lockedUntilRef = useRef(0);
  const reachedEndRef = useRef(false);
  const [loaded, setLoaded] = useState(0);
  const [allLoaded, setAllLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState<null | boolean>(null);
  const [videoOpacity, setVideoOpacity] = useState(0);

  // Stable viewport height — immune to mobile URL-bar show/hide resizes.
  const stableVp = useStableViewport();

  const frameCount = isMobile ? mobileFrames : desktopFrames;
  const frameUrl = isMobile ? mobileUrl : desktopUrl;
  const CW = isMobile ? 1080 : 1920;
  const CH = isMobile ? 1920 : 1080;

  // Detect mobile vs desktop
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Preload frames
  useEffect(() => {
    if (isMobile === null) return;
    setAllLoaded(false);
    setLoaded(0);
    currentFrameRef.current = 0;
    targetFrameRef.current = 0;
    reachedEndRef.current = false;

    let cancelled = false;
    const imgs: HTMLImageElement[] = [];
    let count = 0;

    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      img.src = frameUrl(i);
      img.onload = img.onerror = () => {
        if (cancelled) return;
        count++;
        setLoaded(count);
        if (count >= frameCount) {
          setAllLoaded(true);
          if (onReady) onReady();
        }
      };
      imgs[i] = img;
    }
    imagesRef.current = imgs;

    return () => {
      cancelled = true;
    };
  }, [isMobile, frameCount, frameUrl]);

  const drawFrame = (index: number) => {
    const canvas = canvasRef.current;
    const img = imagesRef.current[Math.round(index)];
    if (!canvas || !img || !img.complete || img.naturalWidth === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Gentle end-card drift: over the last ~6% of frames the card eases up
    // (with a matching slight zoom so no edge is ever exposed) — this frees
    // the bottom of the screen so the countdown sits BELOW the SPECTRAL
    // title instead of on top of it.
    const p = Math.min(1, Math.max(0, index / (frameCount - 1)));
    const liftT = p < 0.94 ? 0 : (p - 0.94) / 0.06;
    const eased = liftT * liftT * (3 - 2 * liftT); // smoothstep
    const lift = eased * canvas.height * END_LIFT;
    const zoom = 1 + eased * END_ZOOM;

    const scale =
      Math.max(
        canvas.width / img.naturalWidth,
        canvas.height / img.naturalHeight
      ) * zoom;
    const w = img.naturalWidth * scale;
    const h = img.naturalHeight * scale;
    ctx.drawImage(
      img,
      (canvas.width - w) / 2,
      (canvas.height - h) / 2 - lift,
      w,
      h
    );
  };

  // Smooth playback loop
  useEffect(() => {
    if (!allLoaded || !ready) return;

    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(64, now - last) / 1000;
      last = now;

      const target = targetFrameRef.current;
      const current = currentFrameRef.current;
      const diff = target - current;

      if (Math.abs(diff) > 0.01) {
        // Slower, smoother catch-up: 12% of the remaining distance per tick,
        // with a minimum of 14 frames/sec so it always moves. This plays
        // through every frame like a slow, cinematic video.
        const proportional = diff * 0.12;
        const minSpeed = 14 * dt;
        const step = Math.sign(diff) * Math.max(Math.abs(proportional), Math.min(minSpeed, Math.abs(diff)));
        let next: number;
        if (Math.abs(diff) <= Math.abs(step)) {
          next = target;
        } else {
          next = current + step;
        }
        currentFrameRef.current = next;
        drawFrame(next);

        if (onProgress) onProgress(next / (frameCount - 1));
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    const onScroll = () => {
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const vh = stableVp.current.h || window.innerHeight;
      const total = Math.max(1, section.offsetHeight - vh);
      const scrolled = Math.max(0, -rect.top);
      // Track progress over the whole hero scroll (0..1)
      const trackProgress = Math.min(1, scrolled / total);
      // Video progress: the video finishes BEFORE the track ends, then the
      // last frame holds while the user keeps scrolling. No scroll freezing
      // anywhere — so nothing can ever yank the frames backwards.
      const videoProgress = Math.min(1, trackProgress / VIDEO_END_RATIO);

      // Visual-only end hold: the first time the video reaches its last
      // frame, pin the FRAME for `lockDuration` ms. If the user scrubs back
      // up, release immediately so playback always feels responsive.
      if (videoProgress >= 0.999 && !reachedEndRef.current) {
        reachedEndRef.current = true;
        lockedUntilRef.current = Date.now() + lockDuration;
      }
      if (videoProgress < 0.96) {
        reachedEndRef.current = false;
      }
      const holding = reachedEndRef.current && Date.now() < lockedUntilRef.current;

      targetFrameRef.current = Math.floor(
        (holding ? 1 : videoProgress) * (frameCount - 1)
      );

      // Delayed cross-fade: the intro backdrop sits on top, so the video only
      // starts appearing at ~7% video progress and is fully visible by ~24%
      // — as the intro layer (gone by ~20%) fades away on top of it.
      setVideoOpacity(Math.max(0, Math.min(1, (videoProgress - 0.07) / 0.165)));
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [allLoaded, ready, frameCount, lockDuration, onProgress, stableVp]);

  // Draw first frame once loaded + size canvas
  useEffect(() => {
    if (allLoaded && ready) {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = CW;
        canvas.height = CH;
      }
      drawFrame(0);
    }
  }, [allLoaded, ready, CW, CH]);

  const maskStyle: React.CSSProperties = {
    WebkitMaskImage: `url(${maskUrl})`,
    maskImage: `url(${maskUrl})`,
    WebkitMaskSize: "cover",
    maskSize: "cover",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
    maskPosition: "center",
    WebkitMaskMode: "luminance",
    maskMode: "luminance",
  };

  return (
    <section
      ref={sectionRef}
      style={{ height: `${scrollHeight * 100}vh` }}
      className="relative w-full bg-[#020514]"
    >
      <div className={`sticky top-0 h-screen w-full overflow-hidden bg-[#020514] ${className}`}>
        {/* Soft gold ambient at the bottom — blends torn edge into black */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[30vh] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 100%, rgba(251,192,45,0.08) 0%, rgba(251,192,45,0.02) 35%, transparent 70%)",
          }}
          aria-hidden
        />

        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full transition-opacity duration-700"
          style={{ ...maskStyle, opacity: ready ? videoOpacity : 0 }}
        />

        {/* Bottom gradient overlay — blends canvas into the page background */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[22vh] pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, #020514 0%, rgba(2,5,20,0.6) 40%, transparent 100%)",
          }}
          aria-hidden
        />

        {/* Loader (only if frames not yet loaded) */}
        {!allLoaded && ready && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#020514] z-20">
            <div className="w-48 h-px bg-white/10 overflow-hidden">
              <div
                className="h-full bg-[#c0c8d8] transition-all duration-300"
                style={{ width: `${(loaded / frameCount) * 100}%` }}
              />
            </div>
            <span className="mt-4 text-white/60 font-sans text-[0.6rem] tracking-[0.4em] uppercase">
              Loading sequence · {Math.round((loaded / frameCount) * 100)}%
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
