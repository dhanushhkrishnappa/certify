import { useEffect, useRef } from "react";
import { gsap, isMobileDevice, prefersReducedMotion } from "./motionVocabulary.js";

interface MagneticOptions {
  strength?: number;
  textStrength?: number;
  radius?: number;
}

/**
 * useMagnetic
 * Gives interactive buttons/anchors an organic magnetic attraction when pointer hovers nearby.
 * Fully disabled on touch devices and for prefers-reduced-motion.
 */
export const useMagnetic = <T extends HTMLElement = HTMLButtonElement>(
  options: MagneticOptions = {}
) => {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || isMobileDevice() || prefersReducedMotion()) return;

    const { strength = 0.35, textStrength = 0.18 } = options;

    let bounds: DOMRect;

    const handleMouseEnter = () => {
      bounds = el.getBoundingClientRect();
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!bounds) bounds = el.getBoundingClientRect();
      const centerX = bounds.left + bounds.width / 2;
      const centerY = bounds.top + bounds.height / 2;
      const deltaX = (e.clientX - centerX) * strength;
      const deltaY = (e.clientY - centerY) * strength;

      gsap.to(el, {
        x: deltaX,
        y: deltaY,
        duration: 0.3,
        ease: "power2.out",
        overwrite: "auto",
      });

      const child = el.querySelector(".magnetic-content") || el.firstElementChild;
      if (child) {
        gsap.to(child, {
          x: deltaX * textStrength,
          y: deltaY * textStrength,
          duration: 0.3,
          ease: "power2.out",
          overwrite: "auto",
        });
      }
    };

    const handleMouseLeave = () => {
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.7,
        ease: "elastic.out(1, 0.4)",
        overwrite: "auto",
      });

      const child = el.querySelector(".magnetic-content") || el.firstElementChild;
      if (child) {
        gsap.to(child, {
          x: 0,
          y: 0,
          duration: 0.7,
          ease: "elastic.out(1, 0.4)",
          overwrite: "auto",
        });
      }
    };

    el.addEventListener("mouseenter", handleMouseEnter);
    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      el.removeEventListener("mouseenter", handleMouseEnter);
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
      gsap.killTweensOf(el);
    };
  }, [options]);

  return ref;
};
