import React, { useState, useEffect, useRef } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "../../motion/motionVocabulary.js";

interface CardContent {
  id: string;
  eyebrow: string;
  phase: string;
  title: string;
  body: string;
  tags: string[];
}

const CARDS: CardContent[] = [
  {
    id: "card-01",
    eyebrow: "01  LEARN",
    phase: "AI-GUIDED LEARNING",
    title: "Learn through conversation, not just content.",
    body: "Your AI tutor explains concepts, asks questions, and adapts to your understanding as you learn.",
    tags: ["Interactive Learning", "Adaptive Practice"],
  },
  {
    id: "card-02",
    eyebrow: "02  DEMONSTRATE",
    phase: "ASSESSMENT & PRACTICE",
    title: "Put what you learn into practice.",
    body: "Chapter checks and practical tasks show that you can apply what you’ve learned—not just remember it.",
    tags: ["Chapter Assessment", "Practical Practice"],
  },
  {
    id: "card-03",
    eyebrow: "03  DEFEND",
    phase: "AI VIVA / DEFENSE",
    title: "Explain what you know, in your own words.",
    body: "Where applicable, CERTIFY uses an AI-led viva to probe your reasoning, challenge your answers, and explore how well you understand your work.",
    tags: ["AI Viva", "Reasoning"],
  },
  {
    id: "card-04",
    eyebrow: "04  EARN",
    phase: "EVIDENCE & CREDENTIAL",
    title: "Your learning becomes a verifiable credential.",
    body: "Your learning, assessments, demonstrations, and final results come together as evidence behind your credential.",
    tags: ["Evidence Collected", "Verified Credential"],
  },
];

export const CertifyVerificationStack: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [cardProgress, setCardProgress] = useState(0);

  // React Bits Scroll Stack parameters
  const peek = 18; // Pixels covered cards slide up to peek
  const scaleStep = 0.05; // Scale decrement per covered step
  const maxBlur = 3; // Blur on covered cards in pixels
  const maxDim = 0.22; // Dimming opacity on covered cards
  const depth = 3; // Maximum visible peeking layers

  useEffect(() => {
    const isReduced = prefersReducedMotion();
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Coordinated pinning with Lenis global ticker
      ScrollTrigger.create({
        trigger: sectionRef.current,
        pin: true,
        start: "top top",
        end: "+=2600",
        scrub: isReduced ? false : 0.6,
        anticipatePin: 1,
        onUpdate: (self) => {
          const raw = self.progress; // 0.0 to 1.0

          // Retain cards centered while cards 1 -> 2 -> 3 -> 4 appear (0.0 to 0.82)
          // Hold card 4 in center from 0.82 to 1.0
          // At 1.0, pin releases seamlessly and continuing scroll smoothly moves cards up
          const stackEnd = 0.82;

          let targetCard = 0;
          if (raw <= stackEnd) {
            targetCard = (raw / stackEnd) * 3.0;
          } else {
            targetCard = 3.0;
          }

          setCardProgress(targetCard);
        },
      });
    }, sectionRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="verification-scroll-stack"
      data-testid="certify-verification-stack"
      className="relative w-full h-screen bg-transparent select-none overflow-hidden"
    >
      {/* Pinned Stage: Centered in viewport, safe from top navbar */}
      <div className="h-screen w-full flex flex-col items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-4">
        <div className="w-full max-w-[1240px] mx-auto flex flex-col items-center justify-center">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto px-4 shrink-0 mb-3 sm:mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#EDE2F5]/40 border border-[#D5C2E8]/40 text-[#CEA4F2] text-[11px] font-mono font-semibold uppercase tracking-wider mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#CEA4F2]" />
              Continuous Verification Loop
            </div>
            <h2 className="font-sans font-bold text-2xl sm:text-3xl md:text-4xl text-[#FEF5E5] font-normal leading-tight tracking-tight">
              How CERTIFY turns learning into proof.
            </h2>
            <p className="text-[13px] sm:text-[14px] text-[#CFC2B4] mt-1 max-w-2xl mx-auto leading-relaxed">
              From AI-guided learning to a verifiable credential, every stage adds evidence of what you understand.
            </p>
          </div>

          {/* Stack Deck Area (Centered in Viewport) */}
          <div
            className="relative w-full flex items-center justify-center h-[58vh] sm:h-[54vh] min-h-[460px] sm:min-h-[430px] max-h-[550px] sm:max-h-[510px]"
            style={{ perspective: "1400px" }}
          >
            {CARDS.map((card, index) => {
              const delta = index - cardProgress;
              let translateY = 0;
              let translateZ = 0;
              let scale = 1;
              let blur = 0;
              let dimOpacity = 0;
              let opacity = 1;
              let zIndex = 10;

              if (delta <= 0) {
                // Active front card or covered peeking card
                const k = Math.min(-delta, depth);
                scale = 1 - k * scaleStep;
                translateY = -k * peek;
                translateZ = -k * 40;
                blur = k > 0.1 ? Math.min(k * 1.5, maxBlur) : 0;
                dimOpacity = k > 0.1 ? Math.min(k * 0.12, maxDim) : 0;
                opacity = Math.max(0.4, 1 - k * 0.16);
                zIndex = 10 + index;
              } else if (delta < 1) {
                // Card sliding up from below into the center
                translateY = delta * 115; // in vh
                scale = 1;
                translateZ = 0;
                blur = 0;
                dimOpacity = 0;
                opacity = Math.min(1, Math.max(0, 1 - (delta - 0.45) * 3));
                zIndex = 20 + index;
              } else {
                // Card waiting below off-screen
                translateY = 120; // in vh
                scale = 1;
                translateZ = 0;
                blur = 0;
                dimOpacity = 0;
                opacity = 0;
                zIndex = 20 + index;
              }

              const isCard4 = index === 3;

              return (
                <div
                  key={card.id}
                  data-testid={`scroll-stack-card-${index + 1}`}
                  className={`absolute w-[95vw] max-w-[1140px] h-[56vh] sm:h-[52vh] min-h-[450px] sm:min-h-[430px] max-h-[530px] sm:max-h-[500px] rounded-[24px] border ${
                    isCard4
                      ? "bg-gradient-to-br from-[#1A1A1F]/95 via-[#131317]/92 to-[#0C0C0F]/96 border-white/[0.08] shadow-[0_28px_60px_-12px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.04)]"
                      : "bg-gradient-to-br from-[#18181D]/92 via-[#121215]/90 to-[#0B0B0E]/95 border-white/[0.06] shadow-[0_24px_50px_-12px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.03)]"
                  } backdrop-blur-xl p-5 sm:p-6 lg:p-7 flex flex-col lg:flex-row items-stretch justify-between gap-5 lg:gap-7 overflow-hidden select-none`}
                  style={{
                    transform: `translate3d(0, ${translateY}${delta < 1 && delta > 0 ? "vh" : "px"}, ${translateZ}px) scale(${scale})`,
                    filter: blur > 0 ? `blur(${blur}px)` : "none",
                    opacity,
                    zIndex,
                    willChange: "transform, filter",
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    transformOrigin: "center top",
                  }}
                >
                  {/* Dimming overlay on covered cards */}
                  <div
                    className="absolute inset-0 rounded-[24px] pointer-events-none transition-opacity duration-150"
                    style={{
                      backgroundColor: "#000000",
                      opacity: dimOpacity,
                      zIndex: 30,
                    }}
                    aria-hidden="true"
                  />

                  {/* LEFT: TEXT CONTENT (~46%) */}
                  <div className="w-full lg:w-[46%] flex flex-col justify-between space-y-4 lg:space-y-6 z-10 shrink-0">
                    <div className="space-y-3">
                      {/* Eyebrow & Phase Badge */}
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold tracking-widest text-[#E6CAA4]">
                          {card.eyebrow}
                        </span>
                        <span className="h-px w-6 bg-white/[0.12]" />
                        <span className="font-mono text-[11px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full border bg-[#382649]/60 border-[#8B5FB0]/40 text-[#CEA4F2]">
                          {card.phase}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="font-sans font-bold text-2xl sm:text-3xl lg:text-[34px] font-normal leading-[1.2] text-[#FEF5E5]">
                        {card.title}
                      </h3>

                      {/* Body */}
                      <p className="font-['Plus_Jakarta_Sans',sans-serif] text-[14px] sm:text-[15px] lg:text-[16px] text-[#D1D5DB] leading-relaxed">
                        {card.body}
                      </p>
                    </div>

                    {/* Bottom Tags */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-white/[0.06]">
                      {card.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1.5 rounded-xl text-xs font-medium bg-white/[0.04] border border-white/[0.06] text-[#F3F4F6] shadow-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* RIGHT: REALISTIC PRODUCT VISUAL (~54%) */}
                  <div className="w-full lg:w-[54%] flex items-center justify-center z-10">
                    {index === 0 && <AiTutorVisual />}
                    {index === 1 && <PracticeVisual />}
                    {index === 2 && <VivaVisual />}
                    {index === 3 && <CredentialVisual />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

/**
 * Visual for Card 01: CERTIFY AI Tutor Socratic Dialogue Interface (Dark Glass)
 */
const AiTutorVisual: React.FC = () => {
  return (
    <div className="w-full rounded-2xl bg-gradient-to-b from-[#141418]/95 via-[#0F0F13]/92 to-[#09090C]/96 border border-white/[0.06] p-4 sm:p-5 shadow-[0_20px_48px_-10px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.03)] text-[#FEF5E5] flex flex-col justify-between space-y-3 h-full max-h-[380px]">
      {/* Visual Window Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#EF4444]/80" />
          <span className="w-2 h-2 rounded-full bg-[#F59E0B]/80" />
          <span className="w-2 h-2 rounded-full bg-[#10B981]/80" />
          <span className="font-mono text-[11px] font-semibold text-[#CFC2B4] ml-2 tracking-wider">
            AI TUTOR • SOCRATIC DIALOGUE
          </span>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-wider text-[#A1A1AA] bg-white/[0.04] px-2.5 py-0.5 rounded-full border border-white/[0.06]">
          Python Scope Lab
        </span>
      </div>

      {/* Socratic Dialogue Flow */}
      <div className="space-y-3 text-xs sm:text-[13px] flex-1 flex flex-col justify-center">
        {/* Turn 1: AI Prompt */}
        <div className="flex items-start gap-2.5">
          <div className="w-6 h-6 rounded-full bg-[#382649]/60 border border-[#8B5FB0]/40 flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-[#CEA4F2] text-[10px] font-mono font-bold">AI</span>
          </div>
          <div className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-2xl rounded-tl-sm p-3 text-[#FEF5E5] leading-relaxed shadow-xs">
            <div className="font-mono text-[10px] text-[#CEA4F2] mb-1 uppercase tracking-wider font-bold">
              AI Tutor
            </div>
            &ldquo;Why does this approach work?&rdquo;
          </div>
        </div>

        {/* Turn 2: Learner Answer */}
        <div className="flex items-start gap-2.5 pl-6 sm:pl-10">
          <div className="flex-1 bg-[#1A1A22]/90 border border-[#7C3AED]/25 rounded-2xl rounded-tr-sm p-3 text-[#FEF5E5] leading-relaxed shadow-xs">
            <div className="font-mono text-[10px] text-[#A1A1AA] mb-1 uppercase tracking-wider flex items-center justify-between font-semibold">
              <span>You</span>
              <span className="text-[#34D399] font-bold">Demonstrated</span>
            </div>
            &ldquo;Because the function keeps access to the value from the outer scope.&rdquo;
          </div>
          <div className="w-6 h-6 rounded-full bg-white/10 text-white flex items-center justify-center shrink-0 mt-0.5 border border-white/[0.08]">
            <span className="text-[10px] font-mono font-bold">U</span>
          </div>
        </div>

        {/* Turn 3: AI Follow-up */}
        <div className="hidden sm:flex items-start gap-2.5">
          <div className="w-6 h-6 rounded-full bg-[#382649]/60 border border-[#8B5FB0]/40 flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-[#CEA4F2] text-[10px] font-mono font-bold">AI</span>
          </div>
          <div className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-2xl rounded-tl-sm p-3 text-[#FEF5E5] leading-relaxed shadow-xs">
            <div className="font-mono text-[10px] text-[#CEA4F2] mb-1 uppercase tracking-wider font-bold">
              AI Follow-Up
            </div>
            &ldquo;Good. Now explain what changes when that value changes.&rdquo;
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between pt-2.5 border-t border-white/[0.06] text-xs font-mono">
        <span className="text-[#9CA3AF]">Dialogue Status: Active Socratic</span>
        <span className="inline-flex items-center gap-1.5 text-[#34D399] font-medium bg-[#052E16]/40 border border-[#16A34A]/30 px-2.5 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
          Understanding explored ✓
        </span>
      </div>
    </div>
  );
};

/**
 * Visual for Card 02: Assessment & Practice Interface (Dark Glass)
 */
const PracticeVisual: React.FC = () => {
  return (
    <div className="w-full rounded-2xl bg-gradient-to-b from-[#141418]/95 via-[#0F0F13]/92 to-[#09090C]/96 border border-white/[0.06] p-4 sm:p-5 shadow-[0_20px_48px_-10px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.03)] text-[#FEF5E5] flex flex-col justify-between space-y-3 h-full max-h-[380px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#EF4444]/80" />
          <span className="w-2 h-2 rounded-full bg-[#F59E0B]/80" />
          <span className="w-2 h-2 rounded-full bg-[#10B981]/80" />
          <span className="font-mono text-[11px] font-semibold text-[#CFC2B4] ml-2 tracking-wider">
            CHAPTER CHECK & PRACTICE LAB
          </span>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-wider text-[#A1A1AA] bg-white/[0.04] px-2.5 py-0.5 rounded-full border border-white/[0.06]">
          Module 3 / Assessment
        </span>
      </div>

      {/* Section A: Chapter Check Question */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 sm:p-3.5 space-y-2 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10.5px] uppercase tracking-wider text-[#CEA4F2] font-bold">
            CHAPTER CHECK
          </span>
          <span className="text-[11px] font-mono text-[#9CA3AF]">Question 2 of 5</span>
        </div>
        <div className="text-xs sm:text-[13px] text-[#FEF5E5] font-medium">
          &ldquo;What does this function return?&rdquo;
        </div>

        {/* 4 Options Grid */}
        <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
          <div className="px-3 py-2 rounded-lg bg-black/40 border border-white/[0.06] text-[#A1A1AA] flex items-center justify-between">
            <span>A &nbsp; 3</span>
          </div>
          <div className="px-3 py-2 rounded-lg bg-[#052E16]/50 border border-[#16A34A]/40 text-[#34D399] font-bold flex items-center justify-between shadow-xs">
            <span>B &nbsp; 4</span>
            <span className="text-[#34D399]">✓</span>
          </div>
          <div className="px-3 py-2 rounded-lg bg-black/40 border border-white/[0.06] text-[#A1A1AA] flex items-center justify-between">
            <span>C &nbsp; 5</span>
          </div>
          <div className="px-3 py-2 rounded-lg bg-black/40 border border-white/[0.06] text-[#A1A1AA] flex items-center justify-between">
            <span>D &nbsp; Error</span>
          </div>
        </div>
      </div>

      {/* Section B: Practical Task */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 sm:p-3.5 space-y-2 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10.5px] uppercase tracking-wider text-[#E6CAA4] font-bold">
            PRACTICAL TASK
          </span>
          <span className="text-[11px] font-mono text-[#34D399] font-semibold">Submission received ✓</span>
        </div>
        <div className="text-xs sm:text-[13px] text-[#D1D5DB]">
          &ldquo;Create a function that handles the given input.&rdquo;
        </div>
        <div className="p-2.5 rounded-lg bg-[#0A0A0D] border border-white/[0.06] font-mono text-[11px] text-[#A7F3D0] leading-relaxed">
          <code>def filter_valid(records): return [r for r in records if r.status == 200]</code>
        </div>
      </div>

      {/* Bottom Status */}
      <div className="flex items-center justify-between pt-2.5 border-t border-white/[0.06] text-xs font-mono">
        <span className="text-[#9CA3AF]">Unit Validation: Complete</span>
        <span className="inline-flex items-center gap-1.5 text-[#34D399] font-medium bg-[#052E16]/40 border border-[#16A34A]/30 px-2.5 py-0.5 rounded-full">
          Understanding demonstrated ✓
        </span>
      </div>
    </div>
  );
};

/**
 * Visual for Card 03: AI Viva / Defense Interface (Dark Glass)
 */
const VivaVisual: React.FC = () => {
  return (
    <div className="w-full rounded-2xl bg-gradient-to-b from-[#141418]/95 via-[#0F0F13]/92 to-[#09090C]/96 border border-white/[0.06] p-4 sm:p-5 shadow-[0_20px_48px_-10px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.03)] text-[#FEF5E5] flex flex-col justify-between space-y-3 h-full max-h-[380px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#EF4444]/80" />
          <span className="w-2 h-2 rounded-full bg-[#F59E0B]/80" />
          <span className="w-2 h-2 rounded-full bg-[#10B981]/80" />
          <span className="font-mono text-[11px] font-semibold text-[#CFC2B4] ml-2 tracking-wider">
            AI VIVA CHAMBER • ARCHITECTURAL DEFENSE
          </span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#A1A1AA] bg-white/[0.04] px-2.5 py-0.5 rounded-full border border-white/[0.06]">
          <span>Turn 02 / 04</span>
        </div>
      </div>

      {/* Viva Dialogue */}
      <div className="space-y-3 text-xs sm:text-[13px] flex-1 flex flex-col justify-center">
        {/* Examiner Turn */}
        <div className="flex items-start gap-2.5">
          <div className="w-6 h-6 rounded-full bg-[#382649]/60 border border-[#8B5FB0]/40 flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-[#CEA4F2] text-[10px] font-mono font-bold">AI</span>
          </div>
          <div className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-2xl rounded-tl-sm p-3 text-[#FEF5E5] leading-relaxed shadow-xs">
            <div className="font-mono text-[10px] text-[#CEA4F2] mb-1 uppercase tracking-wider font-bold">
              AI Examiner
            </div>
            &ldquo;Why did you choose this approach?&rdquo;
          </div>
        </div>

        {/* Candidate Turn */}
        <div className="flex items-start gap-2.5 pl-6 sm:pl-10">
          <div className="flex-1 bg-[#1A1A22]/90 border border-[#7C3AED]/25 rounded-2xl rounded-tr-sm p-3 text-[#FEF5E5] leading-relaxed shadow-xs">
            <div className="font-mono text-[10px] text-[#A1A1AA] mb-1 uppercase tracking-wider font-semibold">
              You
            </div>
            &ldquo;I chose it because it keeps the implementation simple and avoids unnecessary duplication.&rdquo;
          </div>
          <div className="w-6 h-6 rounded-full bg-white/10 text-white flex items-center justify-center shrink-0 mt-0.5 border border-white/[0.08]">
            <span className="text-[10px] font-mono font-bold">U</span>
          </div>
        </div>

        {/* Examiner Follow-up */}
        <div className="hidden sm:flex items-start gap-2.5">
          <div className="w-6 h-6 rounded-full bg-[#382649]/60 border border-[#8B5FB0]/40 flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-[#CEA4F2] text-[10px] font-mono font-bold">AI</span>
          </div>
          <div className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-2xl rounded-tl-sm p-3 text-[#FEF5E5] leading-relaxed shadow-xs">
            <div className="font-mono text-[10px] text-[#CEA4F2] mb-1 uppercase tracking-wider font-bold">
              AI Follow-Up
            </div>
            &ldquo;What trade-off does that introduce?&rdquo;
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between pt-2.5 border-t border-white/[0.06] text-xs font-mono">
        <span className="text-[#9CA3AF]">Autonomous Oral Probe</span>
        <span className="inline-flex items-center gap-1.5 text-[#34D399] font-medium bg-[#052E16]/40 border border-[#16A34A]/30 px-2.5 py-0.5 rounded-full">
          Reasoning explored ✓
        </span>
      </div>
    </div>
  );
};

/**
 * Visual for Card 04: Credential & Certification Result Interface (Dark Glass)
 */
const CredentialVisual: React.FC = () => {
  return (
    <div className="w-full rounded-2xl bg-gradient-to-b from-[#141418]/95 via-[#0F0F13]/92 to-[#09090C]/96 border border-white/[0.06] p-4 sm:p-5 shadow-[0_20px_48px_-10px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.03)] text-[#FEF5E5] flex flex-col justify-between space-y-3 h-full max-h-[380px] relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] relative z-10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#EF4444]/80" />
          <span className="w-2 h-2 rounded-full bg-[#F59E0B]/80" />
          <span className="w-2 h-2 rounded-full bg-[#10B981]/80" />
          <span className="font-mono text-[11px] font-semibold text-[#FEF5E5] ml-2 tracking-wider">
            CERTIFICATION RESULT
          </span>
        </div>
        <span className="font-mono text-[10px] font-semibold tracking-wider text-[#34D399] bg-[#052E16]/50 border border-[#16A34A]/40 px-2.5 py-0.5 rounded-full">
          ALL CRITERIA MET
        </span>
      </div>

      {/* Evidence Checklist (4 Validated Pillars) */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 sm:p-3.5 space-y-2 relative z-10 shadow-xs">
        <div className="font-mono text-[10.5px] uppercase tracking-wider text-[#A1A1AA] font-semibold mb-1">
          Evidence Summary
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs font-medium">
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/[0.06]">
            <span className="text-[#E2E8F0]">Learning Progress</span>
            <span className="text-[#34D399] font-bold">✓</span>
          </div>
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/[0.06]">
            <span className="text-[#E2E8F0]">Chapter Checks</span>
            <span className="text-[#34D399] font-bold">✓</span>
          </div>
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/[0.06]">
            <span className="text-[#E2E8F0]">Practical Tasks</span>
            <span className="text-[#34D399] font-bold">✓</span>
          </div>
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/[0.06]">
            <span className="text-[#E2E8F0]">Final Assessment</span>
            <span className="text-[#34D399] font-bold">✓</span>
          </div>
        </div>
      </div>

      {/* Credential Seal Card */}
      <div className="rounded-xl bg-gradient-to-r from-[#1C1C22] via-[#141418] to-[#0F0F12] border border-white/[0.08] p-3.5 sm:p-4 text-[#FEF5E5] shadow-lg relative z-10 flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#E6CAA4]">
              CERTIFY QUALIFICATION
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#052E16]/50 border border-[#16A34A]/40 text-[#34D399] font-bold">
              Verified Credential ✓
            </span>
          </div>
          <div className="font-sans font-bold text-lg sm:text-xl font-medium text-[#FEF5E5]">
            Python Fundamentals
          </div>
          <div className="font-mono text-[11px] text-[#A1A1AA]">
            Credential ID: <span className="font-semibold text-[#FEF5E5]">CERT-2026-001842</span>
          </div>
        </div>

        <a
          href="/credentials"
          onClick={(e) => {
            e.preventDefault();
            if (typeof window !== "undefined" && (window as any).__certifyNavigate) {
              (window as any).__certifyNavigate("credentials");
            }
          }}
          className="shrink-0 px-3.5 py-2 rounded-xl bg-white hover:bg-[#F3F4F6] text-[#0A0A0C] text-xs font-semibold tracking-wide transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
        >
          <span>View Credential</span>
          <span className="text-[#0A0A0C] font-bold">→</span>
        </a>
      </div>

      {/* Bottom Status */}
      <div className="flex items-center justify-between pt-2.5 border-t border-white/[0.06] text-xs font-mono relative z-10">
        <span className="text-[#9CA3AF]">Status: Issued & Fully Defensible</span>
        <span className="inline-flex items-center gap-1.5 text-[#34D399] font-medium bg-[#052E16]/40 border border-[#16A34A]/30 px-2.5 py-0.5 rounded-full">
          Verified Credential ✓
        </span>
      </div>
    </div>
  );
};

export default CertifyVerificationStack;
