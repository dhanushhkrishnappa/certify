import React, { useRef, useEffect } from "react";
import { gsap, MOTION_EASING, prefersReducedMotion } from "../../motion/motionVocabulary.js";

export const ManifestoSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const section = sectionRef.current;
    const container = containerRef.current;
    if (!section || !container) return;

    const ctx = gsap.context(() => {
      // Pinned scrub timeline transitioning through the 3 phases
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          pin: true,
          start: "top top",
          end: "+=600",
          scrub: 0.3,
          anticipatePin: 1,
        },
      });

      // Phase 1 -> Phase 2: "Learning is not proof." dims, "Understanding is." illuminates
      tl.to(".manifesto-phrase-1", {
        opacity: 0.25,
        scale: 0.95,
        y: -20,
        duration: 1,
        ease: MOTION_EASING.smoothInOut,
      })
        .to(
          ".manifesto-phrase-2",
          {
            opacity: 1,
            scale: 1.05,
            y: 0,
            duration: 1.2,
            ease: MOTION_EASING.smoothInOut,
          },
          "-=0.6"
        )
        // Phase 2 -> Phase 3: "Certify makes that understanding visible."
        .to(".manifesto-phrase-2", {
          opacity: 0.45,
          scale: 0.98,
          duration: 1,
          ease: MOTION_EASING.smoothInOut,
        })
        .to(
          ".manifesto-phrase-3",
          {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: MOTION_EASING.expoOut,
          },
          "-=0.5"
        );
    }, section);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section
      id="manifesto"
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center bg-[#1D0E07] px-6 lg:px-12 py-20 overflow-hidden border-t border-[#3E2416]"
    >
      {/* Background ambient lighting */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full pointer-events-none blur-[140px] opacity-25"
        style={{
          background:
            "radial-gradient(circle, rgba(206, 164, 242, 0.4) 0%, rgba(230, 202, 164, 0.2) 50%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div
        ref={containerRef}
        className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center justify-center space-y-12"
      >
        {/* Phase 1: Learning is not proof */}
        <div className="manifesto-phrase-1 transition-all duration-300">
          <p className="font-['Newsreader',Georgia,serif] text-4xl sm:text-6xl md:text-7xl font-normal text-[#C5B4A5] leading-tight">
            Watching lectures is not proof.
          </p>
        </div>

        {/* Phase 2: Understanding is */}
        <div className="manifesto-phrase-2 opacity-30 transform translate-y-6 transition-all duration-300">
          <p className="font-['Newsreader',Georgia,serif] text-5xl sm:text-7xl md:text-8xl font-normal text-[#FEF5E5] leading-none">
            <span className="italic text-[#E6CAA4]">Understanding</span> is.
          </p>
        </div>

        {/* Phase 3: Certify makes that understanding visible */}
        <div className="manifesto-phrase-3 opacity-20 transform translate-y-8 transition-all duration-300">
          <p className="font-['Newsreader',Georgia,serif] text-2xl sm:text-4xl md:text-5xl font-normal text-[#FAF0E6] max-w-2xl leading-snug">
            Certify captures, challenges, and verifies every atomic concept into an immutable record.
          </p>
        </div>
      </div>
    </section>
  );
};
