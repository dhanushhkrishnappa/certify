import { useEffect, useRef } from "react";
import { gsap, MOTION_EASING, prefersReducedMotion } from "./motionVocabulary.js";

type TextRevealMode = "words" | "lines" | "fadeUp" | "blurToSharp";

interface TextRevealOptions {
  mode?: TextRevealMode;
  stagger?: number;
  duration?: number;
  delay?: number;
  start?: string;
  ease?: string;
  trigger?: string | HTMLElement | null;
}

/**
 * useTextReveal
 * Reusable hook to animate text reveals using GSAP ScrollTrigger.
 * Splits text into spans safely or applies blur-to-sharp / line reveal.
 */
export const useTextReveal = <T extends HTMLElement = HTMLHeadingElement>(
  options: TextRevealOptions = {}
) => {
  const textRef = useRef<T>(null);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      el.style.opacity = "1";
      el.style.filter = "none";
      el.style.transform = "none";
      return;
    }

    const {
      mode = "words",
      stagger = 0.04,
      duration = 0.8,
      delay = 0,
      start = "top 85%",
      ease = MOTION_EASING.expoOut,
      trigger = el,
    } = options;

    const ctx = gsap.context(() => {
      if (mode === "blurToSharp") {
        gsap.fromTo(
          el,
          { opacity: 0, filter: "blur(12px)", y: 16 },
          {
            opacity: 1,
            filter: "blur(0px)",
            y: 0,
            duration,
            delay,
            ease,
            clearProps: "all",
            scrollTrigger: {
              trigger: trigger || el,
              start,
              toggleActions: "play none none none",
            },
          }
        );
      } else if (mode === "fadeUp") {
        gsap.fromTo(
          el,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration,
            delay,
            ease,
            clearProps: "all",
            scrollTrigger: {
              trigger: trigger || el,
              start,
              toggleActions: "play none none none",
            },
          }
        );
      } else {
        // Words split mode
        const originalText = el.innerText;
        const words = originalText.trim().split(/\s+/);
        el.innerHTML = words
          .map(
            (w) =>
              `<span class="inline-block overflow-hidden pb-1"><span class="reveal-word inline-block">${w}&nbsp;</span></span>`
          )
          .join("");

        const wordSpans = el.querySelectorAll(".reveal-word");

        gsap.fromTo(
          wordSpans,
          { opacity: 0, y: "110%" },
          {
            opacity: 1,
            y: "0%",
            duration,
            delay,
            stagger,
            ease,
            clearProps: "transform,opacity",
            scrollTrigger: {
              trigger: trigger || el,
              start,
              toggleActions: "play none none none",
            },
          }
        );
      }
    }, el);

    return () => {
      ctx.revert();
    };
  }, [options]);

  return textRef;
};
