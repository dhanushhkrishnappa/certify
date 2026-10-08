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
            <h2 className="font-['Newsreader',Georgia,serif] text-2xl sm:text-3xl md:text-4xl text-[#FEF5E5] font-normal leading-tight tracking-tight">
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
                      ? "bg-gradient-to-br from-[#FDFBF7] via-[#F8EFE4] to-[#EFE2D0] border-[#DEC4A7] shadow-[0_24px_54px_-12px_rgba(20,10,5,0.48),0_4px_16px_rgba(20,10,5,0.12),inset_0_1px_0_rgba(255,255,255,0.95)]"
                      : "bg-gradient-to-br from-[#FAF5EE] via-[#F6EDE1] to-[#EFE2D2] border-[#DFCDBA] shadow-[0_24px_50px_-12px_rgba(18,10,5,0.42),0_4px_14px_rgba(20,10,5,0.1),inset_0_1px_0_rgba(255,255,255,0.85)]"
                  } p-5 sm:p-6 lg:p-7 flex flex-col lg:flex-row items-stretch justify-between gap-5 lg:gap-7 overflow-hidden select-none`}
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
                      backgroundColor: "#160C07",
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
                        <span className="font-mono text-xs font-bold tracking-widest text-[#937864]">
                          {card.eyebrow}
                        </span>
                        <span className="h-px w-6 bg-[#CBB5A0]" />
                        <span className="font-mono text-[11px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#EDE2D3] border border-[#D9C4AF] text-[#543825]">
                          {card.phase}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="font-['Newsreader',Georgia,serif] text-2xl sm:text-3xl lg:text-[34px] font-normal leading-[1.2] text-[#24130D]">
                        {card.title}
                      </h3>

                      {/* Body */}
                      <p className="font-['Plus_Jakarta_Sans',sans-serif] text-[14px] sm:text-[15px] lg:text-[16px] text-[#5C4538] leading-relaxed">
                        {card.body}
                      </p>
                    </div>

                    {/* Bottom Tags */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-[#DECBB7]/70">
                      {card.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1.5 rounded-xl text-xs font-medium bg-[#EFE4D6]/90 border border-[#DCCABA] text-[#4A3225] shadow-xs"
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
 * Visual for Card 01: Realistic CERTIFY AI Tutor Interface
 */
const AiTutorVisual: React.FC = () => {
  return (
    <div className="w-full rounded-2xl bg-[#170E08] border border-[#3C2417] p-3.5 sm:p-4 shadow-inner text-[#EDE4D8] flex flex-col justify-between space-y-2.5 h-full max-h-[380px]">
      {/* Visual Window Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-[#362013]">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E08A7C]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#E5B56F]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#82B895]" />
          <span className="font-mono text-[11px] font-semibold text-[#C5B3A1] ml-2">
            AI TUTOR • SOCRATIC DIALOGUE
          </span>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-wider text-[#A58D79] bg-[#2A180E] px-2 py-0.5 rounded-full border border-[#442718]">
          Python Scope Lab
        </span>
      </div>

      {/* Socratic Dialogue Flow */}
      <div className="space-y-2.5 text-xs sm:text-[13px] flex-1 flex flex-col justify-center">
        {/* Turn 1: AI Prompt */}
        <div className="flex items-start gap-2.5">
          <div className="w-6 h-6 rounded-full bg-[#5D3B75]/40 border border-[#8B5FB0]/50 flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-[#CEA4F2] text-[10px] font-mono font-bold">AI</span>
          </div>
          <div className="flex-1 bg-[#23150D] border border-[#422617] rounded-2xl rounded-tl-sm p-3 text-[#F5ECE1] leading-relaxed shadow-xs">
            <div className="font-mono text-[10px] text-[#A58D79] mb-1 uppercase tracking-wider">
              AI Tutor
            </div>
            &ldquo;Why does this approach work?&rdquo;
          </div>
        </div>

        {/* Turn 2: Learner Answer */}
        <div className="flex items-start gap-2.5 pl-6 sm:pl-10">
          <div className="flex-1 bg-[#2D1B11] border border-[#523320] rounded-2xl rounded-tr-sm p-3 text-[#EDE4D8] leading-relaxed shadow-xs">
            <div className="font-mono text-[10px] text-[#CBB5A0] mb-1 uppercase tracking-wider flex items-center justify-between">
              <span>You</span>
              <span className="text-[#82B895]">Demonstrated</span>
            </div>
            &ldquo;Because the function keeps access to the value from the outer scope.&rdquo;
          </div>
          <div className="w-6 h-6 rounded-full bg-[#8C5835]/40 border border-[#C59B27]/50 flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-[#E6CAA4] text-[10px] font-mono font-bold">U</span>
          </div>
        </div>

        {/* Turn 3: AI Follow-up */}
        <div className="hidden sm:flex items-start gap-2.5">
          <div className="w-6 h-6 rounded-full bg-[#5D3B75]/40 border border-[#8B5FB0]/50 flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-[#CEA4F2] text-[10px] font-mono font-bold">AI</span>
          </div>
          <div className="flex-1 bg-[#23150D] border border-[#422617] rounded-2xl rounded-tl-sm p-3 text-[#F5ECE1] leading-relaxed shadow-xs">
            <div className="font-mono text-[10px] text-[#CEA4F2] mb-1 uppercase tracking-wider font-semibold">
              AI Follow-Up
            </div>
            &ldquo;Good. Now explain what changes when that value changes.&rdquo;
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between pt-2.5 border-t border-[#362013] text-xs font-mono">
        <span className="text-[#968270]">Dialogue Status: Active Socratic</span>
        <span className="inline-flex items-center gap-1.5 text-[#34D399] font-medium bg-[#0E2818]/80 border border-[#10B981]/40 px-2.5 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
          Understanding explored ✓
        </span>
      </div>
    </div>
  );
};

/**
 * Visual for Card 02: Integrated Assessment & Practice Interface
 */
const PracticeVisual: React.FC = () => {
  return (
    <div className="w-full rounded-2xl bg-[#170E08] border border-[#3C2417] p-3.5 sm:p-4 shadow-inner text-[#EDE4D8] flex flex-col justify-between space-y-2.5 h-full max-h-[380px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-[#362013]">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E08A7C]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#E5B56F]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#82B895]" />
          <span className="font-mono text-[11px] font-semibold text-[#C5B3A1] ml-2">
            CHAPTER CHECK & PRACTICE LAB
          </span>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-wider text-[#A58D79] bg-[#2A180E] px-2 py-0.5 rounded-full border border-[#442718]">
          Module 3 / Assessment
        </span>
      </div>

      {/* Section A: Chapter Check Question */}
      <div className="bg-[#21140D] border border-[#3D2315] rounded-xl p-3 sm:p-3.5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10.5px] uppercase tracking-wider text-[#CEA4F2] font-semibold">
            CHAPTER CHECK
          </span>
          <span className="text-[11px] font-mono text-[#A89682]">Question 2 of 5</span>
        </div>
        <div className="text-xs sm:text-[13px] text-[#F3E9DC] font-medium">
          &ldquo;What does this function return?&rdquo;
        </div>

        {/* 4 Options Grid */}
        <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
          <div className="px-3 py-2 rounded-lg bg-[#2B1A10] border border-[#482A1A] text-[#B8A492] flex items-center justify-between">
            <span>A &nbsp; 3</span>
          </div>
          <div className="px-3 py-2 rounded-lg bg-[#0F2D1C] border border-[#10B981] text-[#34D399] font-bold flex items-center justify-between shadow-xs">
            <span>B &nbsp; 4</span>
            <span className="text-[#34D399]">✓</span>
          </div>
          <div className="px-3 py-2 rounded-lg bg-[#2B1A10] border border-[#482A1A] text-[#B8A492] flex items-center justify-between">
            <span>C &nbsp; 5</span>
          </div>
          <div className="px-3 py-2 rounded-lg bg-[#2B1A10] border border-[#482A1A] text-[#B8A492] flex items-center justify-between">
            <span>D &nbsp; Error</span>
          </div>
        </div>
      </div>

      {/* Section B: Practical Task */}
      <div className="bg-[#21140D] border border-[#3D2315] rounded-xl p-3 sm:p-3.5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10.5px] uppercase tracking-wider text-[#E5B56F] font-semibold">
            PRACTICAL TASK
          </span>
          <span className="text-[11px] font-mono text-[#34D399]">Submission received ✓</span>
        </div>
        <div className="text-xs sm:text-[13px] text-[#F3E9DC]">
          &ldquo;Create a function that handles the given input.&rdquo;
        </div>
        <div className="p-2.5 rounded-lg bg-[#140B06] border border-[#301B0F] font-mono text-[11px] text-[#CFC2B4] leading-relaxed">
          <code>def filter_valid(records): return [r for r in records if r.status == 200]</code>
        </div>
      </div>

      {/* Bottom Status */}
      <div className="flex items-center justify-between pt-2.5 border-t border-[#362013] text-xs font-mono">
        <span className="text-[#968270]">Unit Validation: Complete</span>
        <span className="inline-flex items-center gap-1.5 text-[#34D399] font-medium bg-[#0E2818]/80 border border-[#10B981]/40 px-2.5 py-0.5 rounded-full">
          Understanding demonstrated ✓
        </span>
      </div>
    </div>
  );
};

/**
 * Visual for Card 03: Premium AI Viva / Defense Interface
 */
const VivaVisual: React.FC = () => {
  return (
    <div className="w-full rounded-2xl bg-[#170E08] border border-[#3C2417] p-3.5 sm:p-4 shadow-inner text-[#EDE4D8] flex flex-col justify-between space-y-2.5 h-full max-h-[380px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-[#362013]">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E08A7C]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#E5B56F]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#82B895]" />
          <span className="font-mono text-[11px] font-semibold text-[#C5B3A1] ml-2">
            AI VIVA CHAMBER • ARCHITECTURAL DEFENSE
          </span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#E6CAA4] bg-[#2E1A10] px-2.5 py-0.5 rounded-full border border-[#48291A]">
          <span>Turn 02 / 04</span>
        </div>
      </div>

      {/* Viva Dialogue */}
      <div className="space-y-2.5 text-xs sm:text-[13px] flex-1 flex flex-col justify-center">
        {/* Examiner Turn */}
        <div className="flex items-start gap-2.5">
          <div className="w-6 h-6 rounded-full bg-[#5D3B75]/40 border border-[#8B5FB0]/50 flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-[#CEA4F2] text-[10px] font-mono font-bold">AI</span>
          </div>
          <div className="flex-1 bg-[#23150D] border border-[#422617] rounded-2xl rounded-tl-sm p-3 text-[#F5ECE1] leading-relaxed shadow-xs">
            <div className="font-mono text-[10px] text-[#CEA4F2] mb-1 uppercase tracking-wider font-semibold">
              AI Examiner
            </div>
            &ldquo;Why did you choose this approach?&rdquo;
          </div>
        </div>

        {/* Candidate Turn */}
        <div className="flex items-start gap-2.5 pl-6 sm:pl-10">
          <div className="flex-1 bg-[#2D1B11] border border-[#523320] rounded-2xl rounded-tr-sm p-3 text-[#EDE4D8] leading-relaxed shadow-xs">
            <div className="font-mono text-[10px] text-[#CBB5A0] mb-1 uppercase tracking-wider">
              You
            </div>
            &ldquo;I chose it because it keeps the implementation simple and avoids unnecessary duplication.&rdquo;
          </div>
          <div className="w-6 h-6 rounded-full bg-[#8C5835]/40 border border-[#C59B27]/50 flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-[#E6CAA4] text-[10px] font-mono font-bold">U</span>
          </div>
        </div>

        {/* Examiner Follow-up */}
        <div className="hidden sm:flex items-start gap-2.5">
          <div className="w-6 h-6 rounded-full bg-[#5D3B75]/40 border border-[#8B5FB0]/50 flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-[#CEA4F2] text-[10px] font-mono font-bold">AI</span>
          </div>
          <div className="flex-1 bg-[#23150D] border border-[#422617] rounded-2xl rounded-tl-sm p-3 text-[#F5ECE1] leading-relaxed shadow-xs">
            <div className="font-mono text-[10px] text-[#CEA4F2] mb-1 uppercase tracking-wider font-semibold">
              AI Follow-Up
            </div>
            &ldquo;What trade-off does that introduce?&rdquo;
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between pt-2.5 border-t border-[#362013] text-xs font-mono">
        <span className="text-[#968270]">Autonomous Oral Probe</span>
        <span className="inline-flex items-center gap-1.5 text-[#34D399] font-medium bg-[#0E2818]/80 border border-[#10B981]/40 px-2.5 py-0.5 rounded-full">
          Reasoning explored ✓
        </span>
      </div>
    </div>
  );
};

/**
 * Visual for Card 04: Premium Credential & Certification Result Interface
 */
const CredentialVisual: React.FC = () => {
  return (
    <div className="w-full rounded-2xl bg-gradient-to-br from-[#1C110A] to-[#120A05] border border-[#52331F] p-3.5 sm:p-4 shadow-2xl text-[#EDE4D8] flex flex-col justify-between space-y-2.5 h-full max-h-[380px] relative overflow-hidden">
      {/* Subtle Warm Champagne Glow */}
      <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-[#E6CAA4]/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-[#3E2516] relative z-10">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E08A7C]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#E5B56F]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#82B895]" />
          <span className="font-mono text-[11px] font-semibold text-[#E6CAA4] ml-2">
            CERTIFICATION RESULT
          </span>
        </div>
        <span className="font-mono text-[10px] font-semibold tracking-wider text-[#34D399] bg-[#0E2818] border border-[#10B981]/40 px-2.5 py-0.5 rounded-full">
          ALL CRITERIA MET
        </span>
      </div>

      {/* Evidence Checklist (4 Validated Pillars) */}
      <div className="bg-[#24150D] border border-[#442817] rounded-xl p-3 sm:p-3.5 space-y-2 relative z-10">
        <div className="font-mono text-[10.5px] uppercase tracking-wider text-[#C5B3A1] font-semibold mb-1">
          Evidence Summary
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#2E1B10] border border-[#4F2F1B]">
            <span className="text-[#DDD2C6]">Learning Progress</span>
            <span className="text-[#34D399] font-bold">✓</span>
          </div>
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#2E1B10] border border-[#4F2F1B]">
            <span className="text-[#DDD2C6]">Chapter Checks</span>
            <span className="text-[#34D399] font-bold">✓</span>
          </div>
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#2E1B10] border border-[#4F2F1B]">
            <span className="text-[#DDD2C6]">Practical Tasks</span>
            <span className="text-[#34D399] font-bold">✓</span>
          </div>
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#2E1B10] border border-[#4F2F1B]">
            <span className="text-[#DDD2C6]">Final Assessment</span>
            <span className="text-[#34D399] font-bold">✓</span>
          </div>
        </div>
      </div>

      {/* Credential Seal Card */}
      <div className="rounded-xl bg-gradient-to-r from-[#FAF5EE] via-[#F6ECE0] to-[#EFE1CF] border border-[#DFCBB5] p-3.5 sm:p-4 text-[#24130D] shadow-md relative z-10 flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#937864]">
              CERTIFY QUALIFICATION
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#E8F5E9] border border-[#A7F3D0] text-[#059669] font-bold">
              Verified Credential ✓
            </span>
          </div>
          <div className="font-['Newsreader',Georgia,serif] text-lg sm:text-xl font-medium text-[#24130D]">
            Python Fundamentals
          </div>
          <div className="font-mono text-[11px] text-[#7A6050]">
            Credential ID: <span className="font-semibold text-[#24130D]">CERT-2026-001842</span>
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
          className="shrink-0 px-3.5 py-2 rounded-xl bg-[#24130D] hover:bg-[#382015] text-[#FDF9F2] text-xs font-semibold tracking-wide transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
        >
          <span>View Credential</span>
          <span className="text-[#E6CAA4]">→</span>
        </a>
      </div>

      {/* Bottom Status */}
      <div className="flex items-center justify-between pt-2.5 border-t border-[#3E2516] text-xs font-mono relative z-10">
        <span className="text-[#A58D79]">Status: Issued & Fully Defensible</span>
        <span className="inline-flex items-center gap-1.5 text-[#34D399] font-medium bg-[#0E2818]/90 border border-[#10B981]/40 px-2.5 py-0.5 rounded-full">
          Verified Credential ✓
        </span>
      </div>
    </div>
  );
};

export default CertifyVerificationStack;
