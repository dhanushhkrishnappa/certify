import React, { useRef, useEffect } from "react";
import { gsap, prefersReducedMotion } from "../../motion/motionVocabulary.js";
import BlurText from "./BlurText.js";
import SplitText from "./SplitText.js";

interface ManifestoSectionProps {
  isPreloaderActive?: boolean;
}

export const ManifestoSection: React.FC<ManifestoSectionProps> = ({ isPreloaderActive = false }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleAnimationComplete = () => {
    // BlurText animation complete
  };

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const section = sectionRef.current;
    const container = containerRef.current;
    if (!section || !container) return;

    const ctx = gsap.context(() => {
      // Set explicit initial states: Phrase 1 is centered in crisp focus, Phrases 2 & 3 are hidden
      gsap.set(".manifesto-phrase-1", { opacity: 1, scale: 1, y: 0, filter: "blur(0px)" });
      gsap.set(".manifesto-phrase-2", { opacity: 0, scale: 0.98, y: 0, filter: "blur(0px)" });
      gsap.set(".manifesto-phrase-2 .split-char", { opacity: 0, y: 45 });
      gsap.set(".manifesto-phrase-3", { opacity: 0, scale: 0.96, y: 28, filter: "blur(6px)" });

      // Generous, weighted narrative scroll timeline coordinated with Lenis ticker
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          pin: true,
          start: "top top",
          end: "+=1100",
          scrub: 0.6,
          anticipatePin: 1,
        },
      });

      // Stage 1: Comfortable reading pause on "Watching lectures is not proof."
      tl.to({}, { duration: 0.35 })
        // Stage 2: Phrase 1 gracefully lifts and dissolves
        .to(".manifesto-phrase-1", {
          opacity: 0,
          scale: 0.96,
          y: -36,
          filter: "blur(6px)",
          duration: 0.8,
          ease: "power2.inOut",
        })
        // Stage 3: Phrase 2 ("Understanding is.") blooms into the exact same central focal spot
        .to(
          ".manifesto-phrase-2",
          {
            opacity: 1,
            scale: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.4,
            ease: "power2.out",
          },
          "<0.15"
        )
        // Stage 3b: SplitText character rise animation (staggered letters from start: Understanding -> is.)
        .fromTo(
          ".manifesto-phrase-2 .split-char",
          {
            opacity: 0,
            y: 45,
          },
          {
            opacity: 1,
            y: 0,
            stagger: 0.035,
            duration: 0.85,
            ease: "power3.out",
          },
          "<"
        )
        // Focal resting zone so the user absorbs the core insight
        .to({}, { duration: 0.55 })
        // Stage 4: Phrase 2 gracefully lifts and dissolves completely
        .to(".manifesto-phrase-2", {
          opacity: 0,
          scale: 0.97,
          y: -36,
          filter: "blur(6px)",
          duration: 0.8,
          ease: "power2.inOut",
        })
        // Stage 5: Phrase 3 ("Certify captures...") rises into full brilliance with crisp isolation
        .to(
          ".manifesto-phrase-3",
          {
            opacity: 1,
            scale: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.8,
            ease: "power2.inOut",
          },
          "<0.2"
        )
        // Final resting pause before smooth handoff to next section
        .to({}, { duration: 0.35 });
    }, section);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section
      id="manifesto"
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center bg-transparent px-6 lg:px-12 py-16 sm:py-24 overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div
        className="absolute w-[680px] h-[680px] rounded-full pointer-events-none blur-[140px] opacity-25"
        style={{
          background:
            "radial-gradient(circle, rgba(206, 164, 242, 0.4) 0%, rgba(230, 202, 164, 0.22) 50%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* Central Focal Stage: All 3 phrases occupy the screen's prime focal center */}
      <div
        ref={containerRef}
        className="relative z-10 w-full max-w-5xl xl:max-w-6xl mx-auto min-h-[280px] sm:min-h-[340px] md:min-h-[380px] flex items-center justify-center text-center px-4"
      >
        {/* Phase 1: Watching lectures is not proof */}
        <div className="manifesto-phrase-1 absolute inset-0 flex items-center justify-center will-change-[transform,opacity,filter] opacity-100">
          {!isPreloaderActive && (
            <BlurText
              text="Watching lectures is not proof."
              effect="blur"
              animateBy="words"
              direction="top"
              staggerFrom="start"
              trigger="view"
              delay={200}
              stepDuration={0.35}
              blur={10}
              distance={50}
              onAnimationComplete={handleAnimationComplete}
              className="justify-center font-['Newsreader',Georgia,serif] text-5xl sm:text-7xl md:text-8xl lg:text-[96px] xl:text-[108px] font-normal text-[#FEF5E5] leading-[1.08] tracking-tight text-center"
            />
          )}
        </div>

        {/* Phase 2: Understanding is */}
        <div className="manifesto-phrase-2 absolute inset-0 flex items-center justify-center will-change-[transform,opacity,filter] opacity-0">
          <SplitText
            segments={[
              {
                text: "Understanding",
                className: "italic text-[#E6CAA4] drop-shadow-[0_2px_28px_rgba(230,202,164,0.35)]",
              },
              {
                text: "is.",
                className: "font-normal not-italic text-[#FEF5E5]",
              },
            ]}
            className="font-['Newsreader',Georgia,serif] text-6xl sm:text-8xl md:text-[100px] lg:text-[116px] xl:text-[132px] font-normal leading-none tracking-tight text-center"
            effect="rise"
            splitType="chars"
            delay={50}
            duration={1.25}
            staggerFrom="start"
            hoverEffect="lift"
            trigger="manual"
          />
        </div>

        {/* Phase 3: Certify makes that understanding visible */}
        <div className="manifesto-phrase-3 absolute inset-0 flex items-center justify-center will-change-[transform,opacity,filter] opacity-0">
          <p className="font-['Newsreader',Georgia,serif] text-3xl sm:text-5xl md:text-6xl lg:text-[60px] xl:text-[68px] font-normal text-[#FEF5E5] max-w-3xl lg:max-w-4xl leading-[1.2] tracking-tight">
            Certify captures, challenges, and verifies every atomic concept into an immutable record.
          </p>
        </div>
      </div>
    </section>
  );
};
