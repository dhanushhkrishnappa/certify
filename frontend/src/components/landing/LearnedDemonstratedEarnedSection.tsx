import React, { useState, useEffect, useRef } from "react";
import { SandboxTerminalSvg, VivaChamberWaveformSvg, CryptographicSealSvg } from "../motion/ProofGraphics.js";

interface PhaseData {
  step: number;
  tabLabel: string;
  tabSub: string;
  phaseTag: string;
  headline: string;
  description: string;
  badgeClass: string;
  dotClass: string;
  chips: { text: string; color: string }[];
}

const PHASES: PhaseData[] = [
  {
    step: 0,
    tabLabel: "01 LEARN",
    tabSub: "Socratic AI Dialogue",
    phaseTag: "Phase 01: Socratic AI Exploration",
    headline: "The tutor probes your architectural intuition.",
    description:
      "Instead of spoon-feeding slides, Certify asks probing questions. When you make an assertion, the AI tutor tests whether you understand boundary conditions, memory layouts, and algorithmic trade-offs.",
    badgeClass: "bg-[#EDE2F5] border-[#D5C2E8] text-[#5D3B75]",
    dotClass: "bg-[#5D3B75]",
    chips: [
      { text: "Concept: Python Closures & Free Variables", color: "bg-[#FAF6EE] border-[#DECBB7] text-[#5A3B28]" },
      { text: "Dynamic Socratic Depth", color: "bg-[#EDE2F5] border-[#D5C2E8] text-[#5D3B75]" },
    ],
  },
  {
    step: 1,
    tabLabel: "02 DEMONSTRATE",
    tabSub: "Code Sandbox & Oral Viva",
    phaseTag: "Phase 02: Demonstrable Verification",
    headline: "Test suites run in isolated Python sandboxes, followed by oral defense.",
    description:
      "Your code executes in real execution sandboxes where invariant assertions stress memory allocation and time complexity. Next, the AI Viva Chamber challenges your trade-off decisions in real time.",
    badgeClass: "bg-[#E8F5E9] border-[#C8E6C9] text-[#276A47]",
    dotClass: "bg-[#276A47]",
    chips: [
      { text: "14 Unit Invariants Executed", color: "bg-[#E8F5E9] border-[#C8E6C9] text-[#276A47]" },
      { text: "Oral Viva Chamber: 2 Turns", color: "bg-[#EDE2F5] border-[#D5C2E8] text-[#5D3B75]" },
    ],
  },
  {
    step: 2,
    tabLabel: "03 EARN",
    tabSub: "Verifiable Credential",
    phaseTag: "Phase 03: The Verifiable Credential",
    headline: "A cryptographic qualification dossier that employers can verify.",
    description:
      "Not a flimsy decorative certificate. Certify issues an Ed25519 digitally signed qualification record containing atomic proof of every test case, viva question, and knowledge state.",
    badgeClass: "bg-[#FAF3EA] border-[#DECBB7] text-[#8C5835]",
    dotClass: "bg-[#8C5835]",
    chips: [
      { text: "Ed25519 Digital Signature", color: "bg-[#FAF6EE] border-[#DECBB7] text-[#24130D]" },
      { text: "Instant Public Verification Link", color: "bg-[#E8F5E9] border-[#C8E6C9] text-[#276A47]" },
    ],
  },
];

export const LearnedDemonstratedEarnedSection: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const timerRef = useRef<number | null>(null);

  // Auto-advance every 6s unless user is hovering or interacting
  useEffect(() => {
    if (isPaused) return;

    timerRef.current = window.setInterval(() => {
      setActiveStep((prev) => (prev + 1) % PHASES.length);
    }, 6000);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [isPaused]);

  const current = PHASES[activeStep];

  return (
    <section
      id="how-it-works"
      className="relative bg-[#190C06] py-20 sm:py-28 px-4 sm:px-6 lg:px-12 border-t border-[#3E2416] overflow-hidden"
    >
      {/* Background Radial Ambiance */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] pointer-events-none rounded-full blur-[140px] opacity-20"
        style={{
          background:
            "radial-gradient(circle, rgba(230, 202, 164, 0.35) 0%, rgba(206, 164, 242, 0.25) 50%, transparent 75%)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-6xl mx-auto w-full">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <h2 className="font-['Newsreader',Georgia,serif] text-3xl sm:text-5xl md:text-6xl text-[#FEF5E5] font-normal leading-tight">
            Learn. Demonstrate. Earn.
          </h2>
          <p className="text-[15px] sm:text-[17px] text-[#CFC2B4] mt-3">
            Observe how a concept progresses from active Socratic dialogue into an immutable, verified credential.
          </p>
        </div>

        {/* Stepper Tab Buttons */}
        <div
          className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-12"
          role="tablist"
          aria-label="How Certify Works Steps"
        >
          {PHASES.map((item) => {
            const isSelected = activeStep === item.step;
            return (
              <button
                key={item.step}
                role="tab"
                aria-selected={isSelected}
                onClick={() => {
                  setActiveStep(item.step);
                  setIsPaused(true);
                }}
                className={`flex flex-col items-start px-5 py-3 rounded-2xl transition-all duration-200 text-left border cursor-pointer min-w-[150px] sm:min-w-[190px] ${
                  isSelected
                    ? "bg-gradient-to-b from-[#FAF1E6] via-[#F5EBDD] to-[#EEE0CD] border-[#DFCDBB] text-[#24130D] shadow-lg scale-[1.02]"
                    : "bg-[#28150D]/80 border-[#4E2E1D]/60 text-[#D5C4B1] hover:text-[#FEF5E5] hover:bg-[#341C11]"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-0.5">
                  <span
                    className={`font-mono text-[11.5px] font-bold tracking-wider ${
                      isSelected ? "text-[#5D3B75]" : "text-[#A89682]"
                    }`}
                  >
                    {item.tabLabel}
                  </span>
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5D3B75] animate-pulse" />
                  )}
                </div>
                <span
                  className={`text-[12.5px] font-medium ${
                    isSelected ? "text-[#5C4538]" : "text-[#A89682]"
                  }`}
                >
                  {item.tabSub}
                </span>
              </button>
            );
          })}
        </div>

        {/* Unified Storyboard Stage Card */}
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="w-full max-w-5xl mx-auto rounded-3xl bg-gradient-to-b from-[#FAF1E6] via-[#F5EBDD] to-[#EEE0CD] border border-[#DFCDBB] shadow-2xl p-6 sm:p-10 lg:p-12 text-[#24130D] transition-all duration-300"
        >
          <div
            key={activeStep}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center animate-fade-in"
          >
            {/* Left Column: Phase Information (7 cols on lg) */}
            <div className="lg:col-span-7 space-y-5">
              <div
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border font-mono text-[11.5px] font-bold uppercase tracking-wider shadow-xs ${current.badgeClass}`}
              >
                <span className={`w-2 h-2 rounded-full ${current.dotClass} animate-pulse`} />
                <span>{current.phaseTag}</span>
              </div>

              <h3 className="font-['Newsreader',Georgia,serif] text-2xl sm:text-3xl lg:text-4xl text-[#22120B] leading-tight font-normal">
                {current.headline}
              </h3>

              <p className="text-[15px] sm:text-[16px] text-[#5C4538] leading-relaxed">
                {current.description}
              </p>

              <div className="flex flex-wrap items-center gap-2.5 pt-3">
                {current.chips.map((chip) => (
                  <span
                    key={chip.text}
                    className={`px-3 py-1.5 rounded-xl border font-mono text-xs font-semibold shadow-2xs ${chip.color}`}
                  >
                    {chip.text}
                  </span>
                ))}
              </div>
            </div>

            {/* Right Column: Demonstration Graphic (5 cols on lg) */}
            <div className="lg:col-span-5 flex flex-col justify-center min-h-[260px]">
              {activeStep === 0 && (
                <div className="w-full rounded-2xl bg-[#FAF6EE] border border-[#DECBB7] p-5 font-mono text-[12.5px] space-y-3 shadow-inner">
                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-md bg-[#EDE2F5] text-[#5D3B75] border border-[#D5C2E8] flex items-center justify-center text-[12px] font-bold shrink-0">
                      AI
                    </div>
                    <div className="bg-[#FAF1E6] p-3 rounded-xl border border-[#DFCDBB] text-[#24130D] leading-relaxed shadow-xs">
                      "If the outer function has returned, where does the closure hold the reference to the free variable?"
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 justify-end">
                    <div className="bg-[#FAF1E6] p-3 rounded-xl border border-[#DFCDBB] text-[#24130D] leading-relaxed max-w-[85%] shadow-xs">
                      "Inside the cell object stored in the function's{" "}
                      <code className="text-[#5D3B75] font-bold">__closure__</code> attribute on the heap."
                    </div>
                    <div className="w-6 h-6 rounded-md bg-[#24130D] text-[#FAF0E6] flex items-center justify-center text-[12px] font-bold shrink-0">
                      YOU
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#DECBB7] text-[11px] text-[#276A47] font-semibold">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">check</span> Free Variable Invariant Validated
                    </span>
                    <span className="font-mono text-[#5D3B75] font-bold">P(L) 0.88 → 0.94</span>
                  </div>
                </div>
              )}

              {activeStep === 1 && (
                <div className="w-full space-y-3">
                  <SandboxTerminalSvg />
                  <VivaChamberWaveformSvg />
                </div>
              )}

              {activeStep === 2 && (
                <div className="w-full space-y-3">
                  <CryptographicSealSvg />
                  <div className="p-3.5 rounded-xl bg-[#22130B]/90 border border-[#5A3825]/60 font-mono text-[11px] text-[#A89682] space-y-1.5 shadow-sm">
                    <div className="flex justify-between text-[#FEF5E5]">
                      <span>Public Audit URL:</span>
                      <span className="text-[#DCA86A] truncate">certify.edu/verify/PY-88914</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Oral Viva Defense:</span>
                      <span className="text-emerald-400 font-bold">100% Defended ✓</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
