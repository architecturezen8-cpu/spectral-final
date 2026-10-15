"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import type Lenis from "lenis";
import { SequencePlayer } from "./sequence-player";
import { Countdown } from "./countdown";
import { useSmoothScroll } from "./use-smooth-scroll";

/**
 * Frames are served from the jsDelivr CDN (backed by the GitHub repo) to avoid
 * bandwidth issues on the app server. Repo:
 *   https://github.com/architecturezen8-cpu/spectral
 *
 * Folder structure (repo @main):
 *   images/desktop/ac dek_0.webp  … ac dek_362.webp   → 363 frames, 1920x1080
 *   images/mobile/ac mobie_0.webp … ac mobie_349.webp → 350 frames, 1080x1920
 * NOTE: the spaces in the filenames must stay URL-encoded as %20.
 */
const CDN_BASE = "https://cdn.jsdelivr.net/gh/architecturezen8-cpu/spectral@main/images";

const DESKTOP_FRAMES = 363;
const MOBILE_FRAMES = 350;
// Scroll track length (in viewport heights). Desktop gets a slightly longer
// cinematic run; mobile keeps the original pacing.
const SCROLL_HEIGHT_DESKTOP = 3.5;
const SCROLL_HEIGHT_MOBILE = 3;
const COUNTDOWN_TARGET = new Date("2026-11-17T09:00:00+05:30").getTime();

function desktopUrl(i: number) {
  return `${CDN_BASE}/desktop/ac%20dek_${i}.webp`;
}
function mobileUrl(i: number) {
  return `${CDN_BASE}/mobile/ac%20mobie_${i}.webp`;
}

/**
 * Cinematic scroll-driven hero (dark navy theme) — IMAGE SEQUENCE version.
 *
 * Flow:
 *  1. PRELOADER: full-page loader while all 250 frames download. Logo at top,
 *     progress bar far below (big gap between them).
 *  2. INTRO: preloader fades out → WELCOME (fade-in + shine) + Ready To
 *     Explore (serif) + scroll cue. The intro STAYS centered and fades as the
 *     video plays behind it (does not move up).
 *  3. PLAYBACK: scroll → video fades in behind the text, intro fades out.
 *  4. END: at the last frame, hold for 3s. Only Countdown (no Explore button).
 */
export function CinematicHero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [heroInView, setHeroInView] = useState(true);
  const [framesLoaded, setFramesLoaded] = useState(0);
  const [allLoaded, setAllLoaded] = useState(false);
  const [preloaded, setPreloaded] = useState(false);
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Device detection for the intro backdrop image (same breakpoint as the
  // sequence player).
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Cinematic still shown behind the WELCOME text until the user scrolls.
  // (v3 = Syndicate flag still — desktop dek / mobile portrait, lossless WebP.)
  const introImageUrl = isMobile
    ? "/images/intro-mobile-v3.webp"
    : "/images/intro-desktop-v3.webp";

  useSmoothScroll((l) => {
    setLenis(l);
  });

  useEffect(() => {
    if (preloaded && lenis) {
      lenis.start();
    }
  }, [preloaded, lenis]);

  // Track whether the hero section is still in the viewport. When the user
  // scrolls past it, hide the fixed overlays (WELCOME + Countdown) so they
  // don't linger over the next section. Uses a tight threshold so the
  // countdown disappears as soon as the hero's bottom passes the viewport.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => setHeroInView(e.isIntersecting));
      },
      { threshold: 0, rootMargin: "0px 0px -100% 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const [preloadUrls, setPreloadUrls] = useState<string[]>([]);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    const count = isMobile ? MOBILE_FRAMES : DESKTOP_FRAMES;
    const url = isMobile ? mobileUrl : desktopUrl;
    const urls: string[] = [];
    for (let i = 0; i < count; i++) urls.push(url(i));
    urls.push("/images/hero-mask.png");
    urls.push(isMobile ? "/images/intro-mobile-v3.webp" : "/images/intro-desktop-v3.webp");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreloadUrls(urls);
  }, []);

  const onProgress = useCallback((p: number) => setProgress(p), []);

  // Intro (backdrop + text): stays centered, smoothly fades out while the
  // video fades in underneath (gone by ~20% scroll). Does NOT move up — just
  // opacity fade. Hidden when hero is out of view.
  const introOpacity = (preloaded && heroInView) ? Math.max(0, 1 - progress * 5) : 0;
  // Countdown: ONLY shows at the very end (progress > 0.97, i.e. the SPECTRAL
  // frame is reached). Not sticky throughout the scroll.
  const countdownOpacity = heroInView ? Math.min(1, Math.max(0, (progress - 0.97) * 20)) : 0;

  return (
    <div ref={sectionRef} className="relative w-full bg-[#020514]">
      {/* Preloader — shows until all frames are downloaded.
          Big gap between logo and progress bar. */}
      {!preloaded && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#020514]">
          <div className="relative mb-8" style={{ animation: "preloader-pulse 2s ease-in-out infinite" }}>
            <Image
              src="/images/spectral-logo.png"
              alt="Spectral"
              width={240}
              height={133}
              className="w-auto h-20 md:h-28"
            />
          </div>
          <div className="w-56 h-px bg-white/10 overflow-hidden">
            <div
              className="h-full bg-[#c0c8d8] transition-all duration-300 ease-out"
              style={{ width: `${preloadUrls.length > 0 ? Math.round((framesLoaded / preloadUrls.length) * 100) : 0}%` }}
            />
          </div>
          <span className="mt-5 text-white/50 font-sans text-[0.6rem] tracking-[0.4em] uppercase">
            Loading · {preloadUrls.length > 0 ? Math.round((framesLoaded / preloadUrls.length) * 100) : 0}%
          </span>
        </div>
      )}

      {/* Hidden image preloader — loads all frames, signals when done */}
      {!preloaded && preloadUrls.length > 0 && (
        <div className="hidden">
          {preloadUrls.map((url, i) => (
            <img
              key={i}
              src={url}
              onLoad={() => {
                setFramesLoaded((c) => {
                  const next = c + 1;
                  if (next >= preloadUrls.length) {
                    setAllLoaded(true);
                  }
                  return next;
                });
              }}
              onError={() => {
                setFramesLoaded((c) => {
                  const next = c + 1;
                  if (next >= preloadUrls.length) {
                    setAllLoaded(true);
                  }
                  return next;
                });
              }}
              alt=""
            />
          ))}
        </div>
      )}

      {/* Fade-out overlay when all frames loaded → then set preloaded */}
      {allLoaded && !preloaded && (
        <div
          className="fixed inset-0 z-[100] bg-[#020514] pointer-events-none"
          style={{ animation: "preloader-fade 1s ease forwards" }}
          onAnimationEnd={() => setPreloaded(true)}
        />
      )}

      {/* The responsive sequence — masked to hero torn-edge, smooth playback,
          end-frame lock. Only "ready" after the preloader completes. */}
      <SequencePlayer
        desktopFrames={DESKTOP_FRAMES}
        mobileFrames={MOBILE_FRAMES}
        desktopUrl={desktopUrl}
        mobileUrl={mobileUrl}
        scrollHeight={isMobile ? SCROLL_HEIGHT_MOBILE : SCROLL_HEIGHT_DESKTOP}
        maskUrl="/images/hero-mask.png"
        onProgress={onProgress}
        ready={preloaded}
      />

      {/* INTRO overlay — cinematic backdrop still + WELCOME + Ready To
          Explore + scroll cue. FIXED so it stays centered in the viewport
          during scroll; the whole layer fades out smoothly as the video
          fades in underneath. */}
      <div
        className="pointer-events-none fixed top-0 left-0 right-0 h-screen z-30 flex flex-col justify-center items-center text-center px-6"
        style={{ opacity: introOpacity }}
      >
        {preloaded && (
          <>
            {/* Backdrop still — fades away on scroll revealing the frames.
                Gradients: dim for text contrast + vignette + blend the edges
                into the page background (#020514). */}
            <div className="absolute inset-0 overflow-hidden" aria-hidden>
              <Image
                src={introImageUrl}
                alt=""
                fill
                priority
                sizes="100vw"
                className="object-cover backdrop-enter"
              />
              <div className="absolute inset-0 bg-black/25" />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(ellipse at center, transparent 30%, rgba(2,5,20,0.55) 100%)",
                }}
              />
              <div className="absolute inset-x-0 top-0 h-[18vh] bg-gradient-to-b from-[#020514]/80 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 h-[38vh] bg-gradient-to-t from-[#020514] via-[#020514]/70 to-transparent" />
            </div>

            {/* Text content — above the backdrop */}
            <div className="relative z-10 flex flex-col items-center">
              {/* WELCOME — large serif, fade-in + shine sweep */}
              <div style={{ filter: "drop-shadow(0 0 50px rgba(192,200,216,0.3))" }}>
                <h1 className="welcome-fade shine-text font-serif font-light text-[3.5rem] sm:text-[5.5rem] md:text-[7.5rem] lg:text-[9rem] leading-[0.95] tracking-[0.08em]">
                  WELCOME
                </h1>
              </div>

              {/* Silver divider */}
              <div className="my-6 w-24 h-px bg-gradient-to-r from-transparent via-[#c0c8d8] to-transparent divider-enter" />

              {/* Ready To Explore — same serif font as WELCOME, caps, upright */}
              <p className="subtitle-enter font-serif font-light text-white/80 text-xl sm:text-2xl md:text-3xl tracking-[0.15em]">
                READY TO EXPLORE ?
              </p>

              {/* Scroll cue */}
              <div className="mt-14 flex flex-col items-center gap-3 scroll-cue" style={{ animationDelay: "2.5s" }}>
                <span className="font-serif text-white/50 text-[0.6rem] tracking-[0.4em] uppercase">
                  Scroll
                </span>
                <svg width="22" height="34" viewBox="0 0 22 34" fill="none" aria-hidden>
                  <rect x="1" y="1" width="20" height="32" rx="10" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
                  <circle cx="11" cy="10" r="2" fill="#c0c8d8">
                    <animate attributeName="cy" values="8;18;8" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
                  </circle>
                </svg>
              </div>
            </div>
          </>
        )}
      </div>

      {/* End-state — ONLY Countdown (no Explore button).
          FIXED so it stays in the viewport when the SPECTRAL frame shows,
          sitting right BELOW the title card (the end card drifts up to make
          room). Hidden when the user scrolls past the hero section. */}
      <div
        className="fixed left-0 right-0 z-30 flex flex-col items-center
          bottom-[1.5vh] sm:bottom-[2vh]"
        style={{
          opacity: countdownOpacity,
          pointerEvents: countdownOpacity > 0.5 ? "auto" : "none",
        }}
      >
        <Countdown target={COUNTDOWN_TARGET} />
      </div>

      {/* Top vignette for nav readability */}
      <div className="absolute top-0 left-0 right-0 h-[20vh] bg-gradient-to-b from-[#020514]/70 to-transparent z-20 pointer-events-none" />
    </div>
  );
}
