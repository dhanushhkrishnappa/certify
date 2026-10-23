import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, prefersReducedMotion } from "./motionVocabulary.js";

/**
 * useLenis
 * Initializes buttery-smooth scrolling with Lenis and binds it to GSAP ScrollTrigger
 * on the exact same ticker loop with lagSmoothing(0) to eliminate all jitter and stutter.
 */
export const useLenis = (enabled: boolean = true) => {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // If disabled or user prefers reduced motion, rely on standard native browser scrolling
    if (!enabled || prefersReducedMotion()) {
      return;
    }

    const lenis = new Lenis({
      autoRaf: false,
      duration: 1.0,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Expo Out
      smoothWheel: true,
      touchMultiplier: 1.0,
      infinite: false,
    });

    lenisRef.current = lenis;
    if (typeof window !== "undefined") {
      (window as any).__lenis = lenis;
    }

    // Synchronize Lenis scroll with GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);

    // Drive Lenis directly via GSAP's ticker so both RAF loops are 100% synchronous
    const updateLenis = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateLenis);
    // lagSmoothing(0) ensures ScrollTrigger pins and scrubs track the ticker synchronously without frame lag
    gsap.ticker.lagSmoothing(0);

    // Ensure ScrollTrigger calculates correct heights after layout paint
    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 150);

    // Smooth anchor navigation without hijacking or abrupt jumping
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest("a");
      if (!target) return;
      const href = target.getAttribute("href");
      if (href && href.startsWith("#") && href.length > 1) {
        const el = document.querySelector(href);
        if (el) {
          e.preventDefault();
          lenis.scrollTo(el as HTMLElement, {
            offset: -76,
            duration: 1.0,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          });
        }
      }
    };

    document.addEventListener("click", handleAnchorClick);

    return () => {
      clearTimeout(refreshTimer);
      document.removeEventListener("click", handleAnchorClick);
      gsap.ticker.remove(updateLenis);
      lenis.destroy();
      lenisRef.current = null;
      if (typeof window !== "undefined") {
        delete (window as any).__lenis;
      }
      ScrollTrigger.refresh();
    };
  }, [enabled]);

  return lenisRef;
};
