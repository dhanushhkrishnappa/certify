import { useEffect, useRef } from "react";
import { gsap, MOTION_EASING, prefersReducedMotion } from "./motionVocabulary.js";

interface ScrollRevealOptions {
  y?: number;
  x?: number;
  opacity?: number;
  scale?: number;
  duration?: number;
  delay?: number;
  stagger?: number;
  start?: string;
  ease?: string;
  trigger?: string | HTMLElement | null;
  toggleActions?: string;
  scrub?: boolean | number;
}

/**
 * useScrollReveal
 * Attaches a GSAP ScrollTrigger reveal animation to the referenced element or child selector.
 * Respects prefers-reduced-motion with an instant reveal.
 */
export const useScrollReveal = <T extends HTMLElement = HTMLDivElement>(
  options: ScrollRevealOptions = {}
) => {
  const elementRef = useRef<T>(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      gsap.set(el, { opacity: 1, y: 0, x: 0, scale: 1 });
      return;
    }

    const {
      y = 28,
      x = 0,
      opacity = 0,
      scale = 1,
      duration = 0.75,
      delay = 0,
      stagger = 0,
      start = "top 88%",
      ease = MOTION_EASING.expoOut,
      trigger = el,
      toggleActions = "play none none none",
      scrub = false,
    } = options;

    const ctx = gsap.context(() => {
      const targets = el.children.length > 0 && stagger > 0 ? el.children : el;

      gsap.fromTo(
        targets,
        { opacity, y, x, scale },
        {
          opacity: 1,
          y: 0,
          x: 0,
          scale: 1,
          duration,
          delay,
          stagger: stagger > 0 ? stagger : undefined,
          ease,
          clearProps: scrub ? "" : "transform,opacity",
          scrollTrigger: {
            trigger: trigger || el,
            start,
            toggleActions: scrub ? undefined : toggleActions,
            scrub,
          },
        }
      );
    }, el);

    return () => {
      ctx.revert();
    };
  }, [options]);

  return elementRef;
};
