import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "./motionVocabulary.js";

interface ParallaxOptions {
  speed?: number; // e.g. -50 for lag behind, 50 for move faster
  direction?: "vertical" | "horizontal";
  start?: string;
  end?: string;
  trigger?: string | HTMLElement | null;
}

/**
 * useParallax
 * Smooth scroll-linked parallax displacement using GSAP ScrollTrigger.
 */
export const useParallax = <T extends HTMLElement = HTMLDivElement>(
  options: ParallaxOptions = {}
) => {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    const {
      speed = -60,
      direction = "vertical",
      start = "top bottom",
      end = "bottom top",
      trigger = el,
    } = options;

    const ctx = gsap.context(() => {
      const prop = direction === "vertical" ? "yPercent" : "xPercent";

      gsap.fromTo(
        el,
        { [prop]: -speed / 2 },
        {
          [prop]: speed / 2,
          ease: "none",
          scrollTrigger: {
            trigger: trigger || el,
            start,
            end,
            scrub: true,
          },
        }
      );
    }, el);

    return () => {
      ctx.revert();
    };
  }, [options]);

  return ref;
};
