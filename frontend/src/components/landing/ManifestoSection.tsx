import React, { useRef, useEffect } from "react";
import { gsap, prefersReducedMotion } from "../../motion/motionVocabulary.js";

export const ManifestoSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const section = sectionRef.current;
    const container = containerRef.current;
    if (!section || !container) return;

    const ctx = gsap.context(() => {
      // Set explicit initial states without CSS transition delays
      gsap.set(".manifesto-phrase-1", { opacity: 1, scale: 1, y: 0 });
      gsap.set(".manifesto-phrase-2", { opacity: 0.55, scale: 0.98, y: 10 });
      gsap.set(".manifesto-phrase-3", { opacity: 0.48, scale: 0.98, y: 14 });

      // Pinned scrub timeline: responsive, smooth, and calibrated for natural wheel/touchpad scroll
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          pin: true,
          start: "top top",
          end: "+=380",
          scrub: 0.4,
          anticipatePin: 1,
        },
      });

      // Step 1: Smoothly shift focus from Phrase 1 to Phrase 2 (both remain clearly legible)
      tl.to(".manifesto-phrase-1", {
        opacity: 0.42,
        scale: 0.97,
        y: -8,
        duration: 0.8,
        ease: "power1.inOut",
      })
        .to(
          ".manifesto-phrase-2",
          {
            opacity: 1,
            scale: 1.03,
            y: 0,
            duration: 0.8,
            ease: "power1.inOut",
          },
          "<"
        )
        .to(
          ".manifesto-phrase-3",
          {
            opacity: 0.58,
            y: 7,
            duration: 0.8,
            ease: "power1.inOut",
          },
          "<"
        )
        // Brief focal resting zone for Phrase 2
        .to({}, { duration: 0.25 })
        // Step 2: Smoothly shift focus from Phrase 2 to Phrase 3
        .to(".manifesto-phrase-2", {
          opacity: 0.42,
          scale: 0.97,
          y: -8,
          duration: 0.8,
          ease: "power1.inOut",
        })
        .to(
          ".manifesto-phrase-3",
          {
            opacity: 1,
            scale: 1.02,
            y: 0,
            duration: 0.8,
            ease: "power1.inOut",
          },
          "<"
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
      className="relative min-h-screen flex items-center justify-center bg-transparent px-6 lg:px-12 py-20 overflow-hidden border-t border-[#3E2416]/40"
    >
      {/* Background ambient lighting */}
      <div
        className="absolute w-[640px] h-[640px] rounded-full pointer-events-none blur-[140px] opacity-25"
        style={{
          background:
            "radial-gradient(circle, rgba(206, 164, 242, 0.4) 0%, rgba(230, 202, 164, 0.22) 50%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div
        ref={containerRef}
        className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center justify-center space-y-10 sm:space-y-12"
      >
        {/* Phase 1: Learning is not proof */}
        <div className="manifesto-phrase-1 will-change-[transform,opacity]">
          <p className="font-['Newsreader',Georgia,serif] text-4xl sm:text-6xl md:text-7xl font-normal text-[#FEF5E5] leading-tight tracking-tight">
            Watching lectures is not proof.
          </p>
        </div>

        {/* Phase 2: Understanding is */}
        <div className="manifesto-phrase-2 will-change-[transform,opacity]">
          <p className="font-['Newsreader',Georgia,serif] text-5xl sm:text-7xl md:text-8xl font-normal text-[#FEF5E5] leading-none tracking-tight">
            <span className="italic text-[#E6CAA4] drop-shadow-[0_2px_24px_rgba(230,202,164,0.3)]">
              Understanding
            </span>{" "}
            is.
          </p>
        </div>

        {/* Phase 3: Certify makes that understanding visible */}
        <div className="manifesto-phrase-3 will-change-[transform,opacity]">
          <p className="font-['Newsreader',Georgia,serif] text-2xl sm:text-4xl md:text-5xl font-normal text-[#FEF5E5] max-w-2xl leading-snug tracking-tight">
            Certify captures, challenges, and verifies every atomic concept into an immutable record.
          </p>
        </div>
      </div>
    </section>
  );
};

