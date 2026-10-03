import React, { useEffect, useRef } from "react";
import { useLenis } from "../motion/useLenis.js";
import {
  gsap,
  ScrollTrigger,
  MOTION_EASING,
  prefersReducedMotion,
  isMobileDevice,
} from "../motion/motionVocabulary.js";
import {
  SandboxTerminalSvg,
  VivaChamberWaveformSvg,
  CryptographicSealSvg,
} from "./motion/ProofGraphics.js";

interface LandingPageViewProps {
  onExploreCourses: () => void;
  onBeginDiagnostic: () => void;
  onSignIn: () => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  onExploreCourses,
  onBeginDiagnostic,
  onSignIn,
}) => {
  // Initialize Lenis smooth scroll linked to GSAP ScrollTrigger
  useLenis(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const comparisonPinSectionRef = useRef<HTMLDivElement>(null);
  const comparisonTrackRef = useRef<HTMLDivElement>(null);
  const curriculumRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reducedMotion = prefersReducedMotion();
    const isMobile = isMobileDevice();

    const ctx = gsap.context(() => {
      if (reducedMotion) {
        return;
      }

      // 1. HERO ENTRANCE TIMELINE
      const heroTl = gsap.timeline({
        defaults: { ease: MOTION_EASING.expoOut },
      });

      heroTl
        .fromTo(
          ".hero-pill",
          { opacity: 0, y: -12 },
          { opacity: 1, y: 0, duration: 0.6, clearProps: "all" }
        )
        .fromTo(
          ".hero-headline-line-1",
          { opacity: 0, y: 32 },
          { opacity: 1, y: 0, duration: 0.8, clearProps: "all" },
          "-=0.4"
        )
        .fromTo(
          ".hero-headline-line-2",
          { opacity: 0, y: 32 },
          { opacity: 1, y: 0, duration: 0.8, clearProps: "all" },
          "-=0.65"
        )
        .fromTo(
          ".hero-subtext",
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.7, clearProps: "all" },
          "-=0.55"
        )
        .fromTo(
          ".hero-cta-group",
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.6, clearProps: "all" },
          "-=0.45"
        );

      // 2. 4-SIGNAL PROOF ARCHITECTURE
      gsap.fromTo(
        ".proof-bento-card",
        { opacity: 0, y: 26 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.1,
          duration: 0.75,
          ease: MOTION_EASING.expoOut,
          clearProps: "all",
          scrollTrigger: {
            trigger: ".proof-bento-grid",
            start: "top 88%",
            toggleActions: "play none none none",
          },
        }
      );

      // 3. SELECTIVE PINNED SCROLL-LINKED COMPARISON
      if (comparisonPinSectionRef.current && comparisonTrackRef.current) {
        if (!isMobile) {
          const compareTl = gsap.timeline({
            scrollTrigger: {
              trigger: comparisonPinSectionRef.current,
              pin: true,
              start: "top 14%",
              end: "+=800",
              scrub: 0.8,
              anticipatePin: 1,
            },
          });

          compareTl
            .to(".legacy-card", {
              scale: 0.98,
              opacity: 0.75,
              duration: 1,
            })
            .fromTo(
              ".defensibility-badge",
              { opacity: 0, scale: 0.85, y: 15 },
              { opacity: 1, scale: 1, y: 0, duration: 1.2 },
              "-=0.6"
            )
            .to(
              ".certify-standard-card",
              {
                scale: 1.02,
                boxShadow: "0 20px 40px -15px rgba(230, 202, 164, 0.2)",
                borderColor: "#D9BD91",
                duration: 1.4,
              },
              "-=0.8"
            )
            .fromTo(
              ".certify-check-item",
              { opacity: 0.35, x: -8 },
              { opacity: 1, x: 0, stagger: 0.25, duration: 1 },
              "-=1"
            );
        } else {
          gsap.fromTo(
            [".legacy-card", ".certify-standard-card"],
            { opacity: 0, y: 20 },
            {
              opacity: 1,
              y: 0,
              stagger: 0.15,
              duration: 0.6,
              ease: MOTION_EASING.expoOut,
              clearProps: "all",
              scrollTrigger: {
                trigger: comparisonPinSectionRef.current,
                start: "top 85%",
                toggleActions: "play none none none",
              },
            }
          );
        }
      }

      // 4. FLAGSHIP CURRICULUM & DIAGNOSTIC CARD REVEALS
      if (curriculumRef.current) {
        gsap.fromTo(
          curriculumRef.current,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.75,
            ease: MOTION_EASING.expoOut,
            clearProps: "all",
            scrollTrigger: {
              trigger: curriculumRef.current,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      if (ctaRef.current) {
        gsap.fromTo(
          ctaRef.current,
          { opacity: 0, scale: 0.98 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.7,
            ease: MOTION_EASING.expoOut,
            clearProps: "all",
            scrollTrigger: {
              trigger: ctaRef.current,
              start: "top 88%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 100);
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen font-['Plus_Jakarta_Sans',sans-serif] text-[#EDE4D8] antialiased selection:bg-[#E6CAA4] selection:text-[#2A170E] overflow-x-hidden"
    >
      {/* Fixed Fullscreen Background Image */}
      <div
        className="fixed inset-0 pointer-events-none z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('/hero-students.jpg')` }}
      />
      {/* Warm Espresso/Sepia Ambient Tinted Blend Overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(46, 26, 17, 0.50) 0%, rgba(68, 41, 28, 0.38) 50%, rgba(35, 18, 11, 0.58) 100%), rgba(160, 115, 75, 0.14)",
        }}
      />

      {/* ============================================================== */}
      {/* TOP NAVBAR — Exact Color Palette & Design from Reference Image */}
      {/* ============================================================== */}
      <header className="sticky top-0 z-50 bg-[#351F15] border-b border-[#4E3123]/80 shadow-md">
        <div className="flex justify-between items-center w-full px-6 sm:px-8 lg:px-10 h-16 max-w-[1440px] mx-auto">
          {/* Brand Anchor */}
          <div
            onClick={onExploreCourses}
            className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
          >
            {/* Warm Cream Rounded Logo Square */}
            <div className="w-10 h-10 rounded-xl bg-[#F7E7CE] flex items-center justify-center text-[#351F15] shadow-xs transition-transform duration-200 group-hover:scale-105 active:scale-95">
              <span className="material-symbols-outlined text-[22px] text-[#351F15]">
                school
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[19px] font-['Newsreader',Georgia,serif] font-bold tracking-tight text-[#FEF5E5] leading-none">
                CERTIFY
              </span>
              <span className="text-[8.5px] font-bold tracking-[0.16em] text-[#C7B299] uppercase mt-1">
                LEARN • DEMONSTRATE • EARN
              </span>
            </div>
          </div>

          {/* Center Links (About, How It Works, Courses, Contact) in Editorial Serif */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 font-['Newsreader',Georgia,serif] text-[14.5px] shrink-0">
            <a
              href="#pedagogy"
              className="text-[#E8D8C8] hover:text-[#FEF5E5] font-normal transition-colors whitespace-nowrap"
            >
              About
            </a>
            <a
              href="#pedagogy"
              className="text-[#E8D8C8] hover:text-[#FEF5E5] font-normal transition-colors whitespace-nowrap"
            >
              How It Works
            </a>
            <button
              onClick={onExploreCourses}
              className="text-[#E8D8C8] hover:text-[#FEF5E5] font-normal transition-colors cursor-pointer whitespace-nowrap"
            >
              Courses
            </button>
            <a
              href="#diagnostic"
              className="text-[#E8D8C8] hover:text-[#FEF5E5] font-normal transition-colors whitespace-nowrap"
            >
              Contact
            </a>
          </nav>

          {/* Trailing Actions: Sign In, Register, Begin Diagnostic */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 font-['Newsreader',Georgia,serif]">
            {/* Sign In action */}
            <button
              onClick={onSignIn}
              style={{ padding: "6px 16px", whiteSpace: "nowrap" }}
              className="h-[36px] inline-flex items-center justify-center rounded-[10px] text-[14px] font-normal text-[#F3E7D8] bg-[#2C1910]/45 hover:bg-[#3D2317] border border-[#846146]/80 hover:border-[#A48265] transition-colors cursor-pointer select-none shrink-0"
            >
              Sign In
            </button>

            {/* Register action */}
            <button
              onClick={onSignIn}
              style={{ padding: "6px 16px", whiteSpace: "nowrap" }}
              className="h-[36px] inline-flex items-center justify-center gap-2 rounded-[10px] text-[14px] font-normal text-[#F3E7D8] bg-[#2C1910]/45 hover:bg-[#3D2317] border border-[#846146]/80 hover:border-[#A48265] transition-colors cursor-pointer select-none shrink-0"
            >
              <span>Register</span>
              <span className="text-[13px] leading-none">→</span>
            </button>

            {/* Primary Action Button (Warm Golden Biscuit / Sandstone) */}
            <button
              onClick={onBeginDiagnostic}
              style={{ padding: "6px 18px", whiteSpace: "nowrap" }}
              className="h-[36px] inline-flex items-center justify-center gap-2 rounded-[10px] bg-gradient-to-b from-[#F6E4CB] to-[#ECCAA2] hover:from-[#F8E9D4] hover:to-[#F1D2AC] text-[#28150C] text-[14px] font-medium border border-[#ECCAA1] shadow-xs transition-all duration-150 active:scale-95 cursor-pointer select-none shrink-0"
            >
              <span>Begin Diagnostic</span>
              <span className="text-[13px] font-medium leading-none">→</span>
            </button>
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* MAIN CONTENT CANVAS                                            */}
      {/* ============================================================== */}
      <main className="flex-grow relative z-10">
        {/* HERO SECTION — Matching Exact Image Design */}
        <section
          ref={heroRef}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-7 pb-20 relative"
        >
          {/* Floating Dark Espresso Mocha Card with Decorative Contours */}
          <div
            className="relative flex flex-col items-center text-center max-w-[880px] mx-auto p-8 sm:p-14 md:p-16 rounded-[32px] border border-[#724D36]/60 shadow-2xl shadow-black/60 overflow-hidden"
            style={{
              background:
                "radial-gradient(circle at 78% 22%, rgba(135, 85, 55, 0.45) 0%, rgba(65, 38, 25, 0.96) 52%, rgba(38, 20, 12, 0.99) 100%)",
            }}
          >
            {/* Topographic Curved Line Vectors matching reference image */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden"
              viewBox="0 0 880 580"
              fill="none"
              preserveAspectRatio="none"
            >
              <path
                d="M -40 180 C 140 120, 200 360, 440 260 C 640 180, 760 380, 920 300"
                stroke="#E6CAA4"
                strokeWidth="1"
                strokeOpacity="0.14"
              />
              <path
                d="M -60 420 C 120 340, 220 600, 500 500 C 700 420, 800 620, 940 560"
                stroke="#E6CAA4"
                strokeWidth="1"
                strokeOpacity="0.10"
              />
              <path
                d="M -20 80 C 240 40, 380 200, 920 100"
                stroke="#CEA4F2"
                strokeWidth="1"
                strokeOpacity="0.08"
              />
            </svg>




            {/* Grand Display Headline with Serif Cream & Italic Lavender Accent (4-line cadence matching reference) */}
            <h1 className="relative z-10 font-['Newsreader',Georgia,serif] text-4xl sm:text-6xl md:text-[68px] font-normal tracking-tight text-[#FAF0E6] leading-[1.08] mb-8 max-w-3xl mx-auto">
              <span className="hero-headline-line-1 block">
                Where AI proves
              </span>
              <span className="hero-headline-line-1 block">
                understanding.
              </span>
              <span className="hero-headline-line-2 block italic text-[#CEA4F2] mt-1.5">
                Not passive video
              </span>
              <span className="hero-headline-line-2 block italic text-[#CEA4F2]">
                attendance.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="hero-subtext relative z-10 text-[16px] sm:text-[17.5px] leading-[28px] text-[#CFC2B4] max-w-2xl leading-relaxed mb-9">
              Learn with AI. Prove your skills through real understanding. Earn a credential that reflects what you actually know.
            </p>

            {/* CTA Row */}
            <div className="hero-cta-group relative z-10 flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
              <button
                onClick={onExploreCourses}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#F3DEBE] hover:bg-[#EBD2AF] text-[#301B12] text-[14.5px] font-semibold transition-all duration-200 active:scale-[0.98] shadow-md shadow-black/30 cursor-pointer"
              >
                <span>Explore Engineering Tracks</span>
                <span className="text-[13px] font-bold">→</span>
              </button>
              <button
                onClick={onBeginDiagnostic}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#2D1B13]/80 hover:bg-[#3D251A] border border-[#6D4933]/80 text-[#F9E9D2] text-[14.5px] font-semibold transition-all duration-200 active:scale-[0.98] shadow-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[#F3DEBE] text-[18px]">
                  bolt
                </span>
                <span>Begin 7–Min Diagnostic</span>
              </button>
            </div>
          </div>

          {/* Institutional Endorsement Bar */}
          <div className="mt-16 pt-8 border-t border-[#4E3123]/70 text-center">
            <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#A89682] mb-6">
              Aligned with university computer science curricula and modern software
              engineering bars
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14 opacity-85">
              <div className="flex items-center gap-2 font-mono text-[13px] font-semibold tracking-tight text-[#E2D2BF]">
                <span className="material-symbols-outlined text-[18px] text-[#A89682]">
                  account_balance
                </span>
                Computer Science Core
              </div>
              <div className="flex items-center gap-2 font-mono text-[13px] font-semibold tracking-tight text-[#E2D2BF]">
                <span className="material-symbols-outlined text-[18px] text-[#A89682]">
                  memory
                </span>
                Memory Invariants
              </div>
              <div className="flex items-center gap-2 font-mono text-[13px] font-semibold tracking-tight text-[#E2D2BF]">
                <span className="material-symbols-outlined text-[18px] text-[#A89682]">
                  hub
                </span>
                Algorithmic Complexity
              </div>
              <div className="flex items-center gap-2 font-mono text-[13px] font-semibold tracking-tight text-[#E2D2BF]">
                <span className="material-symbols-outlined text-[18px] text-[#A89682]">
                  shield
                </span>
                Deterministic Grading
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION 2: THE 4-SIGNAL PROOF ARCHITECTURE                      */}
        {/* ============================================================== */}
        <section
          className="max-w-7xl mx-auto px-6 lg:px-10 py-20 border-t border-[#4E3123]/70"
          id="pedagogy"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <h2 className="font-['Newsreader',Georgia,serif] text-3xl md:text-5xl text-[#FAF0E6] font-normal">
                The 4-Signal Proof Architecture
              </h2>
            </div>
            <p className="text-[14px] text-[#CFC2B4] max-w-md mt-4 md:mt-0 leading-relaxed">
              Certify combines multiple forms of assessment to create a trusted record of what you truly know—not just what you can memorize or copy.
            </p>
          </div>

          {/* Bento Grid with Rich SVG Graphics */}
          <div className="proof-bento-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {/* Card 1: Understanding Evidence */}
            <div className="proof-bento-card group relative rounded-2xl bg-[#2E1B13]/90 backdrop-blur-xl border border-[#5A3825]/70 hover:border-[#8D6B4E] p-6 hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full min-h-[380px]">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-[12px] font-bold text-[#A89682]">
                    01
                  </span>

                  <span className="p-2 rounded-xl bg-[#3E2519] border border-[#6D4933] text-[#CEA4F2] transition-transform duration-300 group-hover:scale-110">
                    <span className="material-symbols-outlined text-[20px]">
                      psychology
                    </span>
                  </span>
                </div>

                <h3 className="text-[18px] font-bold text-[#FAF0E6] mb-2">
                  Understanding Evidence
                </h3>

                <p className="text-[13.5px] text-[#CFC2B4] leading-relaxed mb-6">
                  Every interaction, practice session, and assessment builds evidence of
                  what you actually understand.
                </p>
              </div>

              {/* Evidence Trail */}
              <div className="mt-auto rounded-xl bg-[#21120C]/85 border border-[#5A3825] p-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10.5px] font-mono uppercase tracking-[0.18em] text-[#A89682]">
                    Evidence Trail
                  </span>

                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10.5px] font-mono font-medium text-[#CFA4F5]">
                      LIVE
                    </span>
                  </div>
                </div>

                <div className="relative">
                  {/* Connecting line */}
                  <div className="absolute left-[11px] top-3 bottom-3 w-px bg-gradient-to-b from-[#8C6CF5] via-[#C99B72] to-[#E5C892]" />

                  {/* Step 1 */}
                  <div className="relative flex gap-3 mb-3.5">
                    <div className="relative z-10 mt-0.5 w-[22px] h-[22px] rounded-full bg-[#7E5CEF] shadow-[0_0_8px_rgba(126,92,239,0.35)] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[13px] text-white">
                        chat_bubble
                      </span>
                    </div>

                    <div>
                      <div className="text-[12px] font-semibold text-[#FAF0E6] leading-tight">
                        Interaction
                      </div>
                      <div className="text-[11px] text-[#9F9184] leading-tight mt-0.5">
                        Explains reasoning
                      </div>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="relative flex gap-3 mb-3.5">
                    <div className="relative z-10 mt-0.5 w-[22px] h-[22px] rounded-full bg-[#8A6A4D] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[13px] text-[#FAF0E6]">
                        terminal
                      </span>
                    </div>

                    <div>
                      <div className="text-[12px] font-semibold text-[#FAF0E6] leading-tight">
                        Practice
                      </div>
                      <div className="text-[11px] text-[#9F9184] leading-tight mt-0.5">
                        Applies the concept
                      </div>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="relative flex gap-3 mb-3.5">
                    <div className="relative z-10 mt-0.5 w-[22px] h-[22px] rounded-full bg-[#B9855A] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[13px] text-[#21120C]">
                        task_alt
                      </span>
                    </div>

                    <div>
                      <div className="text-[12px] font-semibold text-[#FAF0E6] leading-tight">
                        Assessment
                      </div>
                      <div className="text-[11px] text-[#9F9184] leading-tight mt-0.5">
                        Demonstrates understanding
                      </div>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="relative flex gap-3">
                    <div className="relative z-10 mt-0.5 w-[22px] h-[22px] rounded-full bg-[#D6B579] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[13px] text-[#21120C]">
                        verified
                      </span>
                    </div>

                    <div>
                      <div className="text-[12px] font-semibold text-[#FAF0E6] leading-tight">
                        Evidence
                      </div>
                      <div className="text-[11px] text-[#9F9184] leading-tight mt-0.5">
                        Becomes part of your credential
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Practical Sandboxes */}
            <div className="proof-bento-card group relative rounded-2xl bg-[#2E1B13]/90 backdrop-blur-xl border border-[#5A3825]/70 hover:border-[#8D6B4E] p-6 hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full min-h-[380px]">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-[12px] font-bold text-[#A89682]">02</span>
                  <span className="p-2 rounded-xl bg-[#3E2519] border border-[#6D4933] text-emerald-400 transition-transform duration-200 group-hover:scale-110">
                    <span className="material-symbols-outlined text-[20px]">
                      terminal
                    </span>
                  </span>
                </div>
                <h3 className="text-[18px] font-bold text-[#FAF0E6] mb-2">
                  Practical Sandboxes
                </h3>
                <p className="text-[13.5px] text-[#CFC2B4] leading-relaxed mb-6">
                  Automated test suites and invariant checks executed inside isolated
                  code execution environments with real unit test assertions.
                </p>
              </div>
              <div className="mt-auto">
                <SandboxTerminalSvg />
              </div>
            </div>

            {/* Card 3: Oral Viva Defense */}
            <div className="proof-bento-card group relative rounded-2xl bg-[#2E1B13]/90 backdrop-blur-xl border border-[#5A3825]/70 hover:border-[#8D6B4E] p-6 hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full min-h-[380px]">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-[12px] font-bold text-[#A89682]">03</span>
                  <span className="p-2 rounded-xl bg-[#3E2519] border border-[#6D4933] text-[#CEA4F2] transition-transform duration-200 group-hover:scale-110">
                    <span className="material-symbols-outlined text-[20px]">
                      record_voice_over
                    </span>
                  </span>
                </div>
                <h3 className="text-[18px] font-bold text-[#FAF0E6] mb-2">
                  Oral Viva Defense
                </h3>
                <p className="text-[13.5px] text-[#CFC2B4] leading-relaxed mb-6">
                  AI-conducted multi-turn oral defense probing code invariants, design
                  trade-offs, and failure boundaries with rigorous rubric assessment.
                </p>
              </div>
              <div className="mt-auto">
                <VivaChamberWaveformSvg />
              </div>
            </div>

            {/* Card 4: Cryptographic Proofs */}
            <div className="proof-bento-card group relative rounded-2xl bg-[#2E1B13]/90 backdrop-blur-xl border border-[#5A3825]/70 hover:border-[#8D6B4E] p-6 hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full min-h-[380px]">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-[12px] font-bold text-[#A89682]">04</span>
                  <span className="p-2 rounded-xl bg-[#3E2519] border border-[#6D4933] text-[#F3DEBE] transition-transform duration-200 group-hover:scale-110">
                    <span className="material-symbols-outlined text-[20px]">
                      verified_user
                    </span>
                  </span>
                </div>
                <h3 className="text-[18px] font-bold text-[#FAF0E6] mb-2">
                  Audited Certification
                </h3>
                <p className="text-[13.5px] text-[#CFC2B4] leading-relaxed mb-6">
                  Verifiable credential dossier backed by accumulated chapter-level
                  evidence and deterministic backend tiering rules.
                </p>
              </div>
              <div className="mt-auto">
                <CryptographicSealSvg />
              </div>
            </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 3: PINNED SCROLL-LINKED COMPARATIVE MATRIX             */}
      {/* ============================================================== */}
      <section
        ref={comparisonPinSectionRef}
        className="max-w-7xl mx-auto px-6 lg:px-10 py-20 border-t border-[#4E3123]/70 relative"
        id="defense-standard"
      >
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="font-mono text-[12px] font-semibold text-[#CEA4F2] uppercase tracking-widest mb-2">
            Verification Contrast
          </div>
          <h2 className="font-['Newsreader',Georgia,serif] text-3xl md:text-5xl text-[#FAF0E6] font-normal mb-4">
            The Anatomy of Defensibility
          </h2>
          <p className="text-[16px] text-[#CFC2B4] leading-relaxed">
            Legacy platforms quantify video watch time. Certify measures genuine
            resistance to invariant failure, conceptual probing, and oral defense
            interrogation.
          </p>
        </div>

        {/* Side-by-Side Comparison Matrix */}
        <div
          ref={comparisonTrackRef}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch relative"
        >
          {/* Left: Legacy LMS */}
          <div className="legacy-card rounded-2xl bg-[#23120A]/90 backdrop-blur-xl border border-rose-950/60 p-8 flex flex-col justify-between shadow-md transition-all duration-300">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-rose-950/70 border border-rose-800/40 flex items-center justify-center text-rose-400">
                  <span className="material-symbols-outlined text-[22px]">cancel</span>
                </div>
                <div>
                  <h3 className="text-[20px] font-bold text-[#FAF0E6]">
                    Legacy Video LMS Certificate
                  </h3>
                  <p className="font-mono text-[12px] text-rose-400 font-semibold">
                    Zero Defensibility • Passive Attendance
                  </p>
                </div>
              </div>
              <ul className="space-y-4 text-sm text-[#CFC2B4]">
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span>
                    Self-paced video playback that runs in background tabs without
                    active cognition.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span>
                    Trivial multiple-choice questions easily solved by AI browser
                    extensions.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span>
                    No oral defense or real-time verification of reasoning under
                    pressure.
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right: Certify Protocol */}
          <div className="certify-standard-card rounded-2xl bg-[#341F16]/95 backdrop-blur-xl border border-[#8D6B4E] p-8 flex flex-col justify-between shadow-xl relative transition-all duration-300">
            <div className="defensibility-badge absolute top-4 right-4 px-3 py-1 rounded-full bg-[#3D2519] border border-[#6D4933] text-[#F3DEBE] font-mono text-[11px] font-bold uppercase tracking-wider">
              Certify Standard
            </div>
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#3E2519] border border-[#6D4933] flex items-center justify-center text-[#F3DEBE]">
                  <span className="material-symbols-outlined text-[22px]">
                    verified
                  </span>
                </div>
                <div>
                  <h3 className="text-[20px] font-bold text-[#FAF0E6]">
                    Certify Autonomous Credential
                  </h3>
                  <p className="font-mono text-[12px] text-[#CEA4F2] font-semibold">
                    100% Evidence-Backed • Deterministic Tiering
                  </p>
                </div>
              </div>
              <ul className="space-y-4 text-sm text-[#E2D2BF]">
                <li className="certify-check-item flex items-start gap-2.5">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>
                    Continuous Socratic dialogue probing conceptual mechanics on every
                    chapter.
                  </span>
                </li>
                <li className="certify-check-item flex items-start gap-2.5">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>
                    Automated test suites and invariant validation executed inside
                    real code sandboxes.
                  </span>
                </li>
                <li className="certify-check-item flex items-start gap-2.5">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>
                    Oral viva defense evaluates trade-offs and code architecture before
                    certification.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 4: FLAGSHIP TRACK PREVIEW                               */}
      {/* ============================================================== */}
      <section
        ref={curriculumRef}
        className="max-w-7xl mx-auto px-6 lg:px-10 py-20 border-t border-[#4E3123]/70"
      >
        <div className="rounded-3xl bg-[#2E1B13]/90 backdrop-blur-xl border border-[#5A3825]/70 p-8 md:p-12 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3E2519] border border-[#6D4933] text-[#CEA4F2] font-mono text-xs font-semibold uppercase">
              Flagship Curriculum
            </div>
            <h2 className="font-['Newsreader',Georgia,serif] text-3xl md:text-5xl text-[#FAF0E6] font-normal">
              Python Fundamentals: Deep Architecture
            </h2>
            <p className="text-[15px] text-[#CFC2B4] leading-relaxed">
              From CPython memory models, references, and closures to iterator
              protocols and generator invariants. Master the core mechanics that
              separate senior engineers from syntactic beginners.
            </p>
            <div className="pt-2">
              <button
                onClick={onExploreCourses}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#F3DEBE] hover:bg-[#EBD2AF] text-[#301B12] font-semibold text-sm shadow-sm transition-transform active:scale-95 cursor-pointer"
              >
                <span>Explore Syllabus &amp; Rubrics</span>
                <span className="text-[13px] font-bold">→</span>
              </button>
            </div>
          </div>

          {/* Code / Visual preview box */}
          <div className="w-full lg:max-w-md rounded-2xl bg-[#170D08] text-[#EDE4D8] p-6 font-mono text-xs shadow-2xl border border-[#3E2416]">
            <div className="flex items-center justify-between text-[#A89682] border-b border-[#2C180E] pb-2 mb-3">
              <span className="text-[#F3DEBE] font-bold">
                # Python Memory &amp; Closures
              </span>
              <span className="text-[10px] text-emerald-400">● Live Sandbox</span>
            </div>
            <pre className="text-[#D5C4B1] leading-relaxed overflow-x-auto">
              {`def make_averager():
    series = []
    def averager(new_value):
        # Closure retains free variable in __closure__
        series.append(new_value)
        return sum(series) / len(series)
    return averager

avg = make_averager()
assert avg(10) == 10.0
assert avg(20) == 15.0`}
            </pre>
            <div className="mt-4 pt-3 border-t border-[#2C180E] flex items-center justify-between text-[11px] text-[#A89682]">
              <span>
                P(Mastery): <strong className="text-emerald-400">0.942</strong>
              </span>
              <span className="text-[#CEA4F2]">BKT Converged</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 5: INVITATION / DIAGNOSTIC CALLOUT                      */}
      {/* ============================================================== */}
      <section
        ref={ctaRef}
        className="max-w-7xl mx-auto px-6 lg:px-10 py-20 border-t border-[#4E3123]/70"
        id="diagnostic"
      >
        <div className="rounded-3xl bg-gradient-to-br from-[#382117] via-[#2D1A12] to-[#211109] border border-[#6D4933]/70 p-8 md:p-14 shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl relative z-10 space-y-4">
            <div className="font-mono text-[12px] text-[#CEA4F2] uppercase tracking-widest font-semibold">
              Zero-Stakes Pre-Assessment
            </div>
            <h2 className="font-['Newsreader',Georgia,serif] text-3xl md:text-5xl text-[#FAF0E6] font-normal">
              Calibrate your baseline against our diagnostic engine.
            </h2>
            <p className="text-[16px] text-[#CFC2B4] leading-relaxed">
              Take a quick 7-minute Socratic dialogue session. Observe your real-time
              Bayesian Knowledge curve calibrate to your technical background before
              enrolling.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                onClick={onBeginDiagnostic}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#F3DEBE] hover:bg-[#EBD2AF] text-[#301B12] text-[15px] font-semibold transition-all duration-200 active:scale-[0.98] shadow-md shadow-black/40 cursor-pointer"
              >
                <span>Begin Free 7-Min Diagnostic</span>
                <span className="material-symbols-outlined text-[18px]">bolt</span>
              </button>
              <span className="font-mono text-[13px] text-[#A89682]">
                No password or setup needed
              </span>
            </div>
          </div>
        </div>
      </section>
    </main>

      {/* ============================================================== */ }
  {/* FOOTER                                                         */ }
  {/* ============================================================== */ }
  <footer className="bg-[#1D0E08]/95 backdrop-blur-md border-t border-[#3E2416]">
    <div className="w-full px-6 lg:px-10 py-10 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-[#A89682] text-sm">
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg bg-[#F7E7CE] flex items-center justify-center text-[#301B12]">
          <span className="material-symbols-outlined text-[16px] text-[#301B12]">
            school
          </span>
        </div>
        <span className="text-[16px] font-['Newsreader',Georgia,serif] font-bold text-[#FEF5E5]">
          Certify
        </span>
        <span className="text-[#5A3825]">|</span>
        <span>
          © 2026 Certify Protocol. Deterministic, evidence-backed mastery verification.
        </span>
      </div>
      <div className="flex items-center gap-6">
        <button
          onClick={onExploreCourses}
          className="hover:text-[#FEF5E5] transition cursor-pointer"
        >
          Curriculum Tracks
        </button>
        <a href="#pedagogy" className="hover:text-[#FEF5E5] transition">
          Pedagogy
        </a>
        <a href="#defense-standard" className="hover:text-[#FEF5E5] transition">
          Defense Standard
        </a>
      </div>
    </div>
  </footer>
    </div >
  );
};
