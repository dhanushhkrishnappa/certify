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
  BayesianCurveSvg,
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

      // ====================================================================
      // 1. HERO ENTRANCE TIMELINE (Staggered Typography & Mask Reveals)
      // ====================================================================
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
        )
        .fromTo(
          ".hero-stat-card",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, stagger: 0.07, duration: 0.6, clearProps: "all" },
          "-=0.35"
        );

      // ====================================================================
      // 2. 4-SIGNAL PROOF ARCHITECTURE (Scroll-triggered Bento Cards)
      // ====================================================================
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

      // ====================================================================
      // 3. SELECTIVE PINNED SCROLL-LINKED COMPARISON
      // ====================================================================
      if (comparisonPinSectionRef.current && comparisonTrackRef.current) {
        if (!isMobile) {
          // Pinned narrative comparison scrub on desktop
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
            // Phase 1: Subtle focus on Legacy card
            .to(".legacy-card", {
              scale: 0.98,
              opacity: 0.75,
              duration: 1,
            })
            // Phase 2: Highlight Central Invariant Proof Scale
            .fromTo(
              ".defensibility-badge",
              { opacity: 0, scale: 0.85, y: 15 },
              { opacity: 1, scale: 1, y: 0, duration: 1.2 },
              "-=0.6"
            )
            // Phase 3: Illuminate Certify Standard Card with active elevation
            .to(
              ".certify-standard-card",
              {
                scale: 1.02,
                boxShadow: "0 20px 40px -15px rgba(91, 77, 240, 0.2)",
                borderColor: "#818CF8",
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
          // Mobile Fallback: No pinning, no scroll hijacking, simple entrance triggers
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

      // ====================================================================
      // 4. FLAGSHIP CURRICULUM & DIAGNOSTIC CARD REVEALS
      // ====================================================================
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

      // Settle ScrollTrigger layout after fonts and hero load
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
      className="relative min-h-screen font-['Plus_Jakarta_Sans',sans-serif] text-slate-800 antialiased selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden"
    >
      {/* Fixed Fullscreen Background Image */}
      <div
        className="fixed inset-0 pointer-events-none -z-20 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('/hero-students.jpg')` }}
      />
      {/* Light Brown Editorial Tinted Blend Overlay */}
      <div
        className="fixed inset-0 pointer-events-none -z-10"
        style={{
          background:
            "linear-gradient(140deg, rgba(115, 78, 48, 0.40) 0%, rgba(184, 138, 98, 0.28) 50%, rgba(92, 60, 36, 0.44) 100%), rgba(248, 246, 242, 0.22)",
        }}
      />

      {/* ============================================================== */}
      {/* TOP NAVBAR — Editorial Precision & Balanced Alignments          */}
      {/* ============================================================== */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-stone-200/80 shadow-xs">
        <div className="flex justify-between items-center w-full px-6 lg:px-10 h-16 max-w-7xl mx-auto">
          {/* Brand Anchor */}
          <div
            onClick={onExploreCourses}
            className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
          >
            <div className="w-9 h-9 rounded-xl bg-[#5B4DF0] shadow-sm shadow-indigo-500/20 flex items-center justify-center text-white transition-transform duration-200 group-hover:scale-105 active:scale-95">
              <span className="material-symbols-outlined text-xl">school</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[18px] font-bold tracking-tight text-slate-900 leading-none">
                CERTIFY
              </span>
              <span className="text-[9.5px] font-bold tracking-widest text-slate-400 uppercase mt-0.5">
                Learn • Demonstrate • Earn
              </span>
            </div>
          </div>

          {/* Center Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={onExploreCourses}
              className="text-slate-600 hover:text-slate-900 text-[14px] font-medium transition-colors cursor-pointer"
            >
              Curated Tracks
            </button>
            <a
              href="#pedagogy"
              className="text-slate-600 hover:text-slate-900 text-[14px] font-medium transition-colors"
            >
              Pedagogical Engine
            </a>
            <a
              href="#defense-standard"
              className="text-slate-600 hover:text-slate-900 text-[14px] font-medium transition-colors"
            >
              Defense Standard
            </a>
            <button
              onClick={onExploreCourses}
              className="text-slate-600 hover:text-slate-900 text-[14px] font-medium transition-colors cursor-pointer"
            >
              Certifications
            </button>
          </nav>

          {/* Trailing Actions */}
          <div className="flex items-center gap-3">
            {/* Active Status Chip */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>3 Active Certifications</span>
            </div>

            {/* Sign In action */}
            <button
              onClick={onSignIn}
              className="px-3.5 py-2 rounded-xl text-[14px] font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100/70 transition-colors cursor-pointer"
            >
              Sign In
            </button>

            {/* Primary Action Button */}
            <button
              onClick={onBeginDiagnostic}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5B4DF0] hover:bg-[#4C3DE0] text-white text-[13.5px] font-semibold shadow-sm shadow-indigo-500/25 transition-transform duration-150 active:scale-95 cursor-pointer"
            >
              <span>Begin Diagnostic</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* MAIN CONTENT CANVAS                                            */}
      {/* ============================================================== */}
      <main className="flex-grow relative z-10">
        {/* HERO SECTION */}
        <section
          ref={heroRef}
          className="max-w-7xl mx-auto px-6 lg:px-10 pt-12 sm:pt-16 pb-20 relative"
        >
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto bg-white/95 backdrop-blur-xl p-8 sm:p-14 rounded-3xl border border-stone-200/90 shadow-2xl shadow-stone-900/10">
            {/* Eyebrow Pill */}
            <div className="hero-pill inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 shadow-xs mb-8">
              <span className="w-2 h-2 rounded-full bg-[#5B4DF0] animate-pulse"></span>
              <span className="font-mono text-[11px] font-semibold tracking-wider uppercase text-[#5B4DF0]">
                THE DEFENSIBLE CREDENTIAL PROTOCOL • ZERO PASSIVE COMPLETION
              </span>
            </div>

            {/* Grand Display Headline with Staggered Lines */}
            <h1 className="font-['Newsreader',Georgia,serif] text-4xl sm:text-6xl md:text-7xl font-normal tracking-tight text-slate-900 leading-[1.08] mb-6">
              <span className="hero-headline-line-1 block">
                Where AI proves understanding.
              </span>
              <span className="hero-headline-line-2 block italic text-[#5B4DF0] mt-1">
                Not passive video attendance.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="hero-subtext text-[17px] sm:text-[19px] leading-[28px] text-slate-600 max-w-2xl leading-relaxed mb-10">
              Certify replaces multiple-choice quizzes with live Socratic dialogues,
              code invariant proofs, and high-stakes oral viva defenses under continuous
              Bayesian Knowledge Tracing.
            </p>

            {/* CTA Row */}
            <div className="hero-cta-group flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
              <button
                onClick={onExploreCourses}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-[#5B4DF0] hover:bg-[#4C3DE0] text-white text-[15px] font-semibold transition-all duration-200 active:scale-[0.98] shadow-md shadow-indigo-500/25 cursor-pointer"
              >
                <span>Explore Engineering Tracks</span>
                <span className="material-symbols-outlined text-[18px]">east</span>
              </button>
              <button
                onClick={onBeginDiagnostic}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-800 text-[15px] font-semibold transition-all duration-200 active:scale-[0.98] shadow-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[#5B4DF0] text-[18px]">
                  bolt
                </span>
                <span>Begin 7-Min Diagnostic</span>
              </button>
            </div>

            {/* Metric Badges Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mt-14 pt-10 border-t border-slate-200/80">
              <div className="hero-stat-card text-left p-4 rounded-xl bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-xs">
                <div className="font-mono text-[12px] font-medium text-slate-500 mb-1">
                  Defense P(L) Floor
                </div>
                <div className="text-[26px] font-bold text-slate-900 font-serif">0.920</div>
                <div className="text-[12px] font-semibold text-emerald-600 mt-0.5">
                  Bayesian confidence min
                </div>
              </div>
              <div className="hero-stat-card text-left p-4 rounded-xl bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-xs">
                <div className="font-mono text-[12px] font-medium text-slate-500 mb-1">
                  Invariant Tests
                </div>
                <div className="text-[26px] font-bold text-slate-900 font-serif">10,000+</div>
                <div className="text-[12px] font-semibold text-indigo-600 mt-0.5">
                  Simulated per candidate
                </div>
              </div>
              <div className="hero-stat-card text-left p-4 rounded-xl bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-xs">
                <div className="font-mono text-[12px] font-medium text-slate-500 mb-1">
                  Pass Rate Floor
                </div>
                <div className="text-[26px] font-bold text-slate-900 font-serif">11.4%</div>
                <div className="text-[12px] font-semibold text-amber-600 mt-0.5">
                  Defensible selectivity
                </div>
              </div>
              <div className="hero-stat-card text-left p-4 rounded-xl bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-xs">
                <div className="font-mono text-[12px] font-medium text-slate-500 mb-1">
                  Attestation Standard
                </div>
                <div className="text-[26px] font-bold text-slate-900 font-serif">Ed25519</div>
                <div className="text-[12px] font-semibold text-slate-500 mt-0.5">
                  Cryptographic proofs
                </div>
              </div>
            </div>
          </div>

          {/* Institutional Endorsement Bar */}
          <div className="mt-16 pt-8 border-t border-slate-200/80 text-center">
            <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-6">
              Aligned with university computer science curricula and modern software
              engineering bars
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14 opacity-80">
              <div className="flex items-center gap-2 font-mono text-[13px] font-semibold tracking-tight text-slate-700">
                <span className="material-symbols-outlined text-[18px] text-slate-400">
                  account_balance
                </span>
                Computer Science Core
              </div>
              <div className="flex items-center gap-2 font-mono text-[13px] font-semibold tracking-tight text-slate-700">
                <span className="material-symbols-outlined text-[18px] text-slate-400">
                  memory
                </span>
                Memory Invariants
              </div>
              <div className="flex items-center gap-2 font-mono text-[13px] font-semibold tracking-tight text-slate-700">
                <span className="material-symbols-outlined text-[18px] text-slate-400">
                  hub
                </span>
                Algorithmic Complexity
              </div>
              <div className="flex items-center gap-2 font-mono text-[13px] font-semibold tracking-tight text-slate-700">
                <span className="material-symbols-outlined text-[18px] text-slate-400">
                  shield
                </span>
                Deterministic Grading
              </div>
              <div className="flex items-center gap-2 font-mono text-[13px] font-semibold tracking-tight text-slate-700">
                <span className="material-symbols-outlined text-[18px] text-slate-400">
                  lan
                </span>
                Python Standards
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION 2: THE 4-SIGNAL PROOF ARCHITECTURE                      */}
        {/* ============================================================== */}
        <section
          className="max-w-7xl mx-auto px-6 lg:px-10 py-20 border-t border-slate-200/80"
          id="pedagogy"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <div className="font-mono text-[12px] font-semibold text-[#5B4DF0] uppercase tracking-widest mb-2">
                Defensibility Engine
              </div>
              <h2 className="font-['Newsreader',Georgia,serif] text-3xl md:text-5xl text-slate-900 font-normal">
                The 4-Signal Proof Architecture
              </h2>
            </div>
            <p className="text-[14px] text-slate-600 max-w-md mt-4 md:mt-0 leading-relaxed">
              Certify synthesizes multimodal verification into an immutable
              mathematical record that cannot be gamed by surface memorization or large
              language model copying.
            </p>
          </div>

          {/* Bento Grid with Rich SVG Graphics */}
          <div className="proof-bento-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Socratic Tracing */}
            <div className="proof-bento-card group relative rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/80 p-6 hover:border-indigo-300 hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-[12px] font-bold text-slate-400">01</span>
                  <span className="p-2 rounded-xl bg-indigo-50 border border-indigo-100 text-[#5B4DF0] transition-transform duration-200 group-hover:scale-110">
                    <span className="material-symbols-outlined text-[20px]">
                      psychology
                    </span>
                  </span>
                </div>
                <h3 className="text-[18px] font-bold text-slate-900 mb-2">
                  Socratic Tracing
                </h3>
                <p className="text-[13.5px] text-slate-600 leading-relaxed mb-6">
                  Continuous Bayesian Knowledge Tracing updating prior mastery P(L) on
                  every exchange. Adapts cognitive pressure to probe deep conceptual
                  mechanics.
                </p>
              </div>
              {/* Interactive Bayesian Curve SVG */}
              <BayesianCurveSvg />
            </div>

            {/* Card 2: Practical Sandboxes */}
            <div className="proof-bento-card group relative rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/80 p-6 hover:border-indigo-300 hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-[12px] font-bold text-slate-400">02</span>
                  <span className="p-2 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 transition-transform duration-200 group-hover:scale-110">
                    <span className="material-symbols-outlined text-[20px]">
                      terminal
                    </span>
                  </span>
                </div>
                <h3 className="text-[18px] font-bold text-slate-900 mb-2">
                  Practical Sandboxes
                </h3>
                <p className="text-[13.5px] text-slate-600 leading-relaxed mb-6">
                  Automated test suites and invariant checks executed inside isolated
                  code execution environments with real unit test assertions.
                </p>
              </div>
              {/* Interactive Code Sandbox SVG & Runner */}
              <SandboxTerminalSvg />
            </div>

            {/* Card 3: Oral Viva Defense */}
            <div className="proof-bento-card group relative rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/80 p-6 hover:border-indigo-300 hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-[12px] font-bold text-slate-400">03</span>
                  <span className="p-2 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 transition-transform duration-200 group-hover:scale-110">
                    <span className="material-symbols-outlined text-[20px]">
                      record_voice_over
                    </span>
                  </span>
                </div>
                <h3 className="text-[18px] font-bold text-slate-900 mb-2">
                  Oral Viva Defense
                </h3>
                <p className="text-[13.5px] text-slate-600 leading-relaxed mb-6">
                  AI-conducted multi-turn oral defense probing code invariants, design
                  trade-offs, and failure boundaries with rigorous rubric assessment.
                </p>
              </div>
              {/* Animated Socratic Waveform SVG */}
              <VivaChamberWaveformSvg />
            </div>

            {/* Card 4: Cryptographic Proofs */}
            <div className="proof-bento-card group relative rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/80 p-6 hover:border-indigo-300 hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-[12px] font-bold text-slate-400">04</span>
                  <span className="p-2 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 transition-transform duration-200 group-hover:scale-110">
                    <span className="material-symbols-outlined text-[20px]">
                      verified_user
                    </span>
                  </span>
                </div>
                <h3 className="text-[18px] font-bold text-slate-900 mb-2">
                  Audited Certification
                </h3>
                <p className="text-[13.5px] text-slate-600 leading-relaxed mb-6">
                  Verifiable credential dossier backed by accumulated chapter-level
                  evidence and deterministic backend tiering rules.
                </p>
              </div>
              {/* Ed25519 Cryptographic Attestation Seal SVG */}
              <CryptographicSealSvg />
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION 3: PINNED SCROLL-LINKED COMPARATIVE MATRIX             */}
        {/* ============================================================== */}
        <section
          ref={comparisonPinSectionRef}
          className="max-w-7xl mx-auto px-6 lg:px-10 py-20 border-t border-slate-200/80 relative"
          id="defense-standard"
        >
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="font-mono text-[12px] font-semibold text-[#5B4DF0] uppercase tracking-widest mb-2">
              Verification Contrast
            </div>
            <h2 className="font-['Newsreader',Georgia,serif] text-3xl md:text-5xl text-slate-900 font-normal mb-4">
              The Anatomy of Defensibility
            </h2>
            <p className="text-[16px] text-slate-600 leading-relaxed">
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
            <div className="legacy-card rounded-2xl bg-white/85 backdrop-blur-md border border-rose-200/80 p-8 flex flex-col justify-between shadow-xs transition-all duration-300">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500">
                    <span className="material-symbols-outlined text-[22px]">cancel</span>
                  </div>
                  <div>
                    <h3 className="text-[20px] font-bold text-slate-900">
                      Legacy Video LMS Certificate
                    </h3>
                    <p className="font-mono text-[12px] text-rose-600 font-semibold">
                      Zero Defensibility • Passive Attendance
                    </p>
                  </div>
                </div>
                <ul className="space-y-4 text-sm text-slate-600">
                  <li className="flex items-start gap-2.5">
                    <span className="text-rose-500 font-bold">✕</span>
                    <span>
                      Self-paced video playback that runs in background tabs without
                      active cognition.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-rose-500 font-bold">✕</span>
                    <span>
                      Trivial multiple-choice questions easily solved by AI browser
                      extensions.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-rose-500 font-bold">✕</span>
                    <span>
                      No oral defense or real-time verification of reasoning under
                      pressure.
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right: Certify Protocol */}
            <div className="certify-standard-card rounded-2xl bg-white/95 backdrop-blur-md border border-indigo-200/90 p-8 flex flex-col justify-between shadow-sm relative transition-all duration-300">
              <div className="defensibility-badge absolute top-4 right-4 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-[#5B4DF0] font-mono text-[11px] font-bold uppercase tracking-wider">
                Certify Standard
              </div>
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-[#5B4DF0]">
                    <span className="material-symbols-outlined text-[22px]">
                      verified
                    </span>
                  </div>
                  <div>
                    <h3 className="text-[20px] font-bold text-slate-900">
                      Certify Autonomous Credential
                    </h3>
                    <p className="font-mono text-[12px] text-[#5B4DF0] font-semibold">
                      100% Evidence-Backed • Deterministic Tiering
                    </p>
                  </div>
                </div>
                <ul className="space-y-4 text-sm text-slate-600">
                  <li className="certify-check-item flex items-start gap-2.5">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>
                      Continuous Socratic dialogue probing conceptual mechanics on every
                      chapter.
                    </span>
                  </li>
                  <li className="certify-check-item flex items-start gap-2.5">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>
                      Automated test suites and invariant validation executed inside
                      real code sandboxes.
                    </span>
                  </li>
                  <li className="certify-check-item flex items-start gap-2.5">
                    <span className="text-emerald-600 font-bold">✓</span>
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
          className="max-w-7xl mx-auto px-6 lg:px-10 py-20 border-t border-slate-200/80"
        >
          <div className="rounded-3xl bg-white/90 backdrop-blur-md border border-slate-200/80 p-8 md:p-12 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="space-y-4 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-[#5B4DF0] font-mono text-xs font-semibold uppercase">
                Flagship Curriculum
              </div>
              <h2 className="font-['Newsreader',Georgia,serif] text-3xl md:text-5xl text-slate-900 font-normal">
                Python Fundamentals: Deep Architecture
              </h2>
              <p className="text-[15px] text-slate-600 leading-relaxed">
                From CPython memory models, references, and closures to iterator
                protocols and generator invariants. Master the core mechanics that
                separate senior engineers from syntactic beginners.
              </p>
              <div className="pt-2">
                <button
                  onClick={onExploreCourses}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#5B4DF0] hover:bg-[#4C3DE0] text-white font-semibold text-sm shadow-sm transition-transform active:scale-95 cursor-pointer"
                >
                  <span>Explore Syllabus &amp; Rubrics</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>

            {/* Code / Visual preview box */}
            <div className="w-full lg:max-w-md rounded-2xl bg-[#13151A] text-slate-200 p-6 font-mono text-xs shadow-xl border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2 mb-3">
                <span className="text-amber-400 font-bold">
                  # Python Memory &amp; Closures
                </span>
                <span className="text-[10px] text-emerald-400">● Live Sandbox</span>
              </div>
              <pre className="text-slate-300 leading-relaxed overflow-x-auto">
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
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span>
                  P(Mastery): <strong className="text-emerald-400">0.942</strong>
                </span>
                <span className="text-[#5B4DF0]">BKT Converged</span>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION 5: INVITATION / DIAGNOSTIC CALLOUT                      */}
        {/* ============================================================== */}
        <section
          ref={ctaRef}
          className="max-w-7xl mx-auto px-6 lg:px-10 py-20 border-t border-slate-200/80"
          id="diagnostic"
        >
          <div className="rounded-3xl bg-gradient-to-br from-white via-white to-[#F3F1EC] border border-indigo-200/70 p-8 md:p-14 shadow-sm relative overflow-hidden">
            <div className="max-w-2xl relative z-10 space-y-4">
              <div className="font-mono text-[12px] text-[#5B4DF0] uppercase tracking-widest font-semibold">
                Zero-Stakes Pre-Assessment
              </div>
              <h2 className="font-['Newsreader',Georgia,serif] text-3xl md:text-5xl text-slate-900 font-normal">
                Calibrate your baseline against our diagnostic engine.
              </h2>
              <p className="text-[16px] text-slate-600 leading-relaxed">
                Take a quick 7-minute Socratic dialogue session. Observe your real-time
                Bayesian Knowledge curve calibrate to your technical background before
                enrolling.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <button
                  onClick={onBeginDiagnostic}
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#5B4DF0] hover:bg-[#4C3DE0] text-white text-[15px] font-semibold transition-all duration-200 active:scale-[0.98] shadow-md shadow-indigo-500/25 cursor-pointer"
                >
                  <span>Begin Free 7-Min Diagnostic</span>
                  <span className="material-symbols-outlined text-[18px]">bolt</span>
                </button>
                <span className="font-mono text-[13px] text-slate-500">
                  No password or setup needed
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ============================================================== */}
      {/* FOOTER                                                         */}
      {/* ============================================================== */}
      <footer className="bg-white/80 backdrop-blur-md border-t border-slate-200/80">
        <div className="w-full px-6 lg:px-10 py-10 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-sm">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-lg bg-[#5B4DF0] flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-[14px]">school</span>
            </div>
            <span className="text-[16px] font-bold text-slate-900">Certify</span>
            <span className="text-slate-400">|</span>
            <span>
              © 2026 Certify Protocol. Deterministic, evidence-backed mastery verification.
            </span>
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={onExploreCourses}
              className="hover:text-slate-900 transition cursor-pointer"
            >
              Curriculum Tracks
            </button>
            <a href="#pedagogy" className="hover:text-slate-900 transition">
              Pedagogy
            </a>
            <a href="#defense-standard" className="hover:text-slate-900 transition">
              Defense Standard
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
