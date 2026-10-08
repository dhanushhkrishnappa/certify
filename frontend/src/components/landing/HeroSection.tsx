import React, { useRef, useEffect } from "react";
import { gsap, MOTION_EASING, prefersReducedMotion } from "../../motion/motionVocabulary.js";
import { useMagnetic } from "../../motion/useMagnetic.js";
import { BulgeCard } from "./webgl/BulgeCard.js";

interface HeroSectionProps {
  onExploreCourses: () => void;
  onBeginDiagnostic: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreCourses,
  onBeginDiagnostic,
}) => {
  const heroContainerRef = useRef<HTMLDivElement>(null);
  const primaryCtaRef = useMagnetic<HTMLButtonElement>({ strength: 0.32 });
  const secondaryCtaRef = useMagnetic<HTMLButtonElement>({ strength: 0.22 });

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      // Hero content staggered entrance timeline
      const tl = gsap.timeline({
        defaults: { ease: MOTION_EASING.expoOut },
      });

      tl.fromTo(
        ".hero-headline-word",
        { opacity: 0, y: 44, rotateX: -15 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          stagger: 0.08,
          duration: 0.9,
        },
        "-=0.5"
      )
        .fromTo(
          ".hero-subtext",
          { opacity: 0, y: 22 },
          { opacity: 1, y: 0, duration: 0.8 },
          "-=0.6"
        )
        .fromTo(
          ".hero-cta-btn",
          { opacity: 0, y: 18, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, stagger: 0.12, duration: 0.7 },
          "-=0.55"
        );

      // Smooth receding transition as hero box scrolls towards Manifesto
      gsap.to(".hero-central-card", {
        scrollTrigger: {
          trigger: heroContainerRef.current,
          start: "center center",
          end: "bottom 20%",
          scrub: 0.6,
        },
        opacity: 0,
        scale: 0.94,
        y: -40,
        ease: "power1.out",
      });
    }, heroContainerRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={heroContainerRef}
      className="relative min-h-[92vh] sm:min-h-[96vh] flex flex-col justify-center pt-24 sm:pt-28 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >


      {/* Ambient Top Light Beam */}
      <div
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[340px] pointer-events-none z-0 rounded-full blur-[110px]"
        style={{
          background:
            "radial-gradient(circle, rgba(230, 202, 164, 0.14) 0%, rgba(206, 164, 242, 0.10) 45%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* Seamless transitional light gradient into Manifesto */}
      <div
        className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[700px] h-[160px] pointer-events-none z-0 rounded-full blur-[100px] opacity-35"
        style={{
          background:
            "radial-gradient(circle, rgba(230, 202, 164, 0.22) 0%, rgba(206, 164, 242, 0.12) 45%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* Central Hero Experience Container */}
      <div className="hero-central-card relative z-10 max-w-[1000px] mx-auto w-full text-center">
        <BulgeCard
          className="relative p-8 sm:p-12 md:p-14 lg:p-[72px] rounded-[32px] sm:rounded-[42px] bg-gradient-to-b from-[#1C1C20]/90 via-[#141417]/88 to-[#0E0E11]/92 border border-white/12 shadow-[0_28px_80px_-15px_rgba(0,0,0,0.8),0_10px_28px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl overflow-hidden"
          highlightColor="rgba(255, 255, 255, 0.12)"
        >
          {/* Subtle Ambient Radial Highlight */}
          <div
            className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_50%_15%,rgba(206,164,242,0.10)_0%,rgba(20,20,24,0.30)_60%,rgba(10,10,12,0.75)_100%)]"
            aria-hidden="true"
          />

          {/* Topographic Fine Vector Overlay */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden opacity-30"
            viewBox="0 0 900 600"
            fill="none"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M -40 220 C 180 160, 360 250, 580 200 C 740 160, 840 220, 960 190"
              stroke="#FFFFFF"
              strokeWidth="1.2"
              opacity="0.18"
            />
            <path
              d="M -40 480 C 220 430, 420 530, 680 470 C 820 440, 880 510, 960 480"
              stroke="#CEA4F2"
              strokeWidth="1"
              opacity="0.22"
            />
          </svg>

          {/* Sparkle 1: Upper Left Champagne Gold 4-Pointed Flare Star */}
          <div
            className="absolute top-[22%] left-[6%] sm:left-[7%] pointer-events-none z-10 transition-transform duration-300"
            aria-hidden="true"
          >
            <svg
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="none"
              className="drop-shadow-[0_2px_10px_rgba(230,202,164,0.4)]"
            >
              <path
                d="M12 0 C12 7, 7 12, 0 12 C7 12, 12 17, 12 24 C12 17, 17 12, 24 12 C17 12, 12 7, 12 0 Z"
                fill="#E6CAA4"
              />
            </svg>
          </div>

          {/* Sparkle 2: Lower Right Champagne Gold 4-Pointed Flare Star */}
          <div
            className="absolute bottom-[24%] right-[6%] sm:right-[7%] pointer-events-none z-10 transition-transform duration-300"
            aria-hidden="true"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              className="drop-shadow-[0_2px_10px_rgba(230,202,164,0.4)]"
            >
              <path
                d="M12 0 C12 7, 7 12, 0 12 C7 12, 12 17, 12 24 C12 17, 17 12, 24 12 C17 12, 12 7, 12 0 Z"
                fill="#E6CAA4"
              />
            </svg>
          </div>

          {/* Grand Headline */}
          <h1 className="relative z-10 font-['Newsreader',Georgia,serif] text-4xl sm:text-5xl md:text-[68px] lg:text-[74px] font-normal tracking-tight text-[#FEF5E5] leading-[1.05] mb-6 max-w-3xl mx-auto pt-1">
            <span className="hero-headline-word block">Where AI proves</span>
            <span className="hero-headline-word block font-medium text-[#FEF5E5]">
              understanding.
            </span>
            <span className="hero-headline-word italic text-[#CEA4F2] block mt-1 sm:mt-2 font-normal drop-shadow-[0_2px_20px_rgba(206,164,242,0.25)]">
              Not passive video attendance.
            </span>
          </h1>

          {/* Subtext */}
          <p className="relative z-10 hero-subtext text-[15px] sm:text-[17.5px] leading-[28px] text-[#CFC2B4] max-w-xl mx-auto mb-8 font-normal">
            Learn with AI. Build real understanding. Earn a credential that proves it.
          </p>

          {/* Action CTAs */}
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-lg mx-auto">
            {/* Primary Action Button */}
            <button
              ref={primaryCtaRef}
              onClick={onBeginDiagnostic}
              className="hero-cta-btn w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-b from-[#2A2A30] via-[#1E1E22] to-[#141416] hover:from-[#34343A] hover:to-[#222226] text-[#FEF5E5] text-[15px] font-semibold border border-white/16 shadow-[0_12px_28px_-6px_rgba(0,0,0,0.6)] transition-all duration-200 active:scale-95 cursor-pointer group"
            >
              <span className="magnetic-content flex items-center gap-2">
                <span className="material-symbols-outlined text-[19px] text-[#E6CAA4]">
                  bolt
                </span>
                <span>Begin 7–Min Diagnostic</span>
                <span className="text-[14px] font-bold group-hover:translate-x-0.5 transition-transform text-[#E6CAA4]">
                  →
                </span>
              </span>
            </button>

            {/* Secondary Action Button */}
            <button
              ref={secondaryCtaRef}
              onClick={onExploreCourses}
              className="hero-cta-btn w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-white/6 hover:bg-white/12 border border-white/14 hover:border-white/24 text-[#FEF5E5] text-[15px] font-medium transition-all duration-200 active:scale-95 cursor-pointer shadow-xs group"
            >
              <span className="magnetic-content flex items-center gap-2">
                <span>Explore Curriculum</span>
                <span className="text-[13px] text-[#E6CAA4] group-hover:translate-x-0.5 transition-transform">
                  →
                </span>
              </span>
            </button>
          </div>
        </BulgeCard>
      </div>
    </section>
  );
};
