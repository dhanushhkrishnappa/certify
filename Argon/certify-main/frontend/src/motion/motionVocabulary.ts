import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Ensure GSAP plugins are registered safely once
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * CERTIFY MOTION VOCABULARY
 * Single, unified easing and timing vocabulary across GSAP, CSS, and Motion.
 */
export const MOTION_EASING = {
  // Primary brand ease: Crisp, editorial, decisive acceleration with smooth natural settling
  expoOut: "power4.out",
  // Narrative scrolls & smooth transitions
  smoothInOut: "power3.inOut",
  // Snappy tactile feedback
  tactileOut: "power2.out",
  // CSS cubic-bezier equivalents
  cssExpoOut: "cubic-bezier(0.16, 1, 0.3, 1)",
  cssSmoothInOut: "cubic-bezier(0.65, 0, 0.35, 1)",
  // Framer Motion spring presets
  springTactile: {
    type: "spring" as const,
    stiffness: 380,
    damping: 30,
    mass: 0.8,
  },
  springGentle: {
    type: "spring" as const,
    stiffness: 220,
    damping: 24,
  },
};

/**
 * Check if the user has requested reduced motion.
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

/**
 * Check if device is a mobile or narrow viewport where expensive effects should be disabled.
 */
export const isMobileDevice = (): boolean => {
  if (typeof window === "undefined") return false;
  return (
    window.innerWidth < 768 ||
    window.matchMedia("(hover: none) and (pointer: coarse)").matches
  );
};

export { gsap, ScrollTrigger };
