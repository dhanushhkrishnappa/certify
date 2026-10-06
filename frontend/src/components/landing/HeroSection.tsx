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
    }, heroContainerRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={heroContainerRef}
      className="relative flex flex-col justify-center pt-24 sm:pt-32 pb-14 sm:pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
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
          className="relative p-8 sm:p-12 md:p-14 lg:p-[72px] rounded-[32px] sm:rounded-[42px] bg-gradient-to-b from-[#F8F0E5] via-[#F5EBDD] to-[#EEE0CD] border border-[#DECBB7] shadow-[0_26px_75px_-15px_rgba(15,7,3,0.55),0_10px_28px_rgba(20,10,5,0.25)] overflow-hidden"
          highlightColor="rgba(255, 255, 255, 0.4)"
        >
          {/* Subtle Ambient Radial Warmth */}
          <div
            className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_50%_15%,rgba(255,255,255,0.7)_0%,rgba(245,235,221,0.5)_60%,rgba(235,220,202,0.85)_100%)]"
            aria-hidden="true"
          />

          {/* Topographic Fine Vector Overlay (Warm Champagne / Sand curves) */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden opacity-55"
            viewBox="0 0 900 600"
            fill="none"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M -40 220 C 180 160, 360 250, 580 200 C 740 160, 840 220, 960 190"
              stroke="#DEC5A7"
              strokeWidth="1.2"
            />
            <path
              d="M -40 480 C 220 430, 420 530, 680 470 C 820 440, 880 510, 960 480"
              stroke="#DEC5A7"
              strokeWidth="1"
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
              className="drop-shadow-[0_2px_10px_rgba(220,168,106,0.6)]"
            >
              <path
                d="M12 0 C12 7, 7 12, 0 12 C7 12, 12 17, 12 24 C12 17, 17 12, 24 12 C17 12, 12 7, 12 0 Z"
                fill="#DCA86A"
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
              className="drop-shadow-[0_2px_10px_rgba(220,168,106,0.6)]"
            >
              <path
                d="M12 0 C12 7, 7 12, 0 12 C7 12, 12 17, 12 24 C12 17, 17 12, 24 12 C17 12, 12 7, 12 0 Z"
                fill="#DCA86A"
              />
            </svg>
          </div>

          {/* Grand Headline */}
          <h1 className="relative z-10 font-['Newsreader',Georgia,serif] text-4xl sm:text-5xl md:text-[68px] lg:text-[74px] font-normal tracking-tight text-[#22120B] leading-[1.05] mb-6 max-w-3xl mx-auto pt-1">
            <span className="hero-headline-word block">Where AI proves</span>
            <span className="hero-headline-word block font-medium text-[#22120B]">
              understanding.
            </span>
            <span className="hero-headline-word italic text-[#5E3B75] block mt-1 sm:mt-2 font-normal">
              Not passive video attendance.
            </span>
          </h1>

          {/* Subtext */}
          <p className="relative z-10 hero-subtext text-[15px] sm:text-[17.5px] leading-[28px] text-[#5C4538] max-w-xl mx-auto mb-8 font-normal">
            Learn with AI. Build real understanding. Earn a credential that proves it.
          </p>

          {/* Action CTAs */}
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-lg mx-auto">
            {/* Primary Action Button (Deep Espresso with Warm Amber Bolt) */}
            <button
              ref={primaryCtaRef}
              onClick={onBeginDiagnostic}
              className="hero-cta-btn w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-b from-[#462719] via-[#381E13] to-[#2B150D] hover:from-[#542F1E] hover:to-[#381D12] text-[#FAF0E6] text-[15px] font-semibold border border-[#643D28] shadow-[0_12px_28px_-6px_rgba(35,17,10,0.5)] transition-all duration-200 active:scale-95 cursor-pointer group"
            >
              <span className="magnetic-content flex items-center gap-2">
                <span className="material-symbols-outlined text-[19px] text-[#E8CCA6]">
                  bolt
                </span>
                <span>Begin 7–Min Diagnostic</span>
                <span className="text-[14px] font-bold group-hover:translate-x-0.5 transition-transform">
                  →
                </span>
              </span>
            </button>

            {/* Secondary Action Button (Warm Parchment / Cream with Espresso Text) */}
            <button
              ref={secondaryCtaRef}
              onClick={onExploreCourses}
              className="hero-cta-btn w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-[#FAF2E8]/85 hover:bg-[#F3E5D4] border border-[#C9B39B] hover:border-[#AC9278] text-[#28150C] text-[15px] font-medium transition-all duration-200 active:scale-95 cursor-pointer shadow-xs group"
            >
              <span className="magnetic-content flex items-center gap-2">
                <span>Explore Curriculum</span>
                <span className="text-[13px] text-[#6E5445] group-hover:translate-x-0.5 transition-transform">
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
