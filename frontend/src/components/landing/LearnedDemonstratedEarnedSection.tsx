import React, { useState, useEffect, useRef } from "react";

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
    tabLabel: "01  LEARN",
    tabSub: "AI-Guided Learning",
    phaseTag: "PHASE 01: AI-GUIDED LEARNING",
    headline: "Learn through conversation, not just content.",
    description:
      "Your AI tutor explains concepts, asks questions, and adapts to your understanding as you learn.",
    badgeClass: "bg-[#EDE2F5] border-[#D5C2E8] text-[#5D3B75]",
    dotClass: "bg-[#5D3B75]",
    chips: [
      { text: "Interactive Learning", color: "bg-[#FAF6EE] border-[#DECBB7] text-[#5A3B28]" },
      { text: "Adaptive Practice", color: "bg-[#EDE2F5] border-[#D5C2E8] text-[#5D3B75]" },
    ],
  },
  {
    step: 1,
    tabLabel: "02  DEMONSTRATE",
    tabSub: "Show Your Understanding",
    phaseTag: "PHASE 02: DEMONSTRATE UNDERSTANDING",
    headline: "Put what you learned into practice.",
    description:
      "Chapter checks, practical tasks, and guided questions show that you can apply what you’ve learned—not just remember it.",
    badgeClass: "bg-[#E8F5E9] border-[#C8E6C9] text-[#276A47]",
    dotClass: "bg-[#276A47]",
    chips: [
      { text: "Chapter Assessment", color: "bg-[#E8F5E9] border-[#C8E6C9] text-[#276A47]" },
      { text: "Practical Demonstration", color: "bg-[#EDE2F5] border-[#D5C2E8] text-[#5D3B75]" },
    ],
  },
  {
    step: 2,
    tabLabel: "03  EARN",
    tabSub: "Verified Credential",
    phaseTag: "PHASE 03: YOUR CREDENTIAL",
    headline: "Your learning becomes a credential.",
    description:
      "Your course progress, assessments, and demonstrations come together as evidence of what you’ve learned.",
    badgeClass: "bg-[#FAF3EA] border-[#DECBB7] text-[#8C5835]",
    dotClass: "bg-[#8C5835]",
    chips: [
      { text: "Evidence Collected", color: "bg-[#FAF6EE] border-[#DECBB7] text-[#24130D]" },
      { text: "Credential Issued", color: "bg-[#E8F5E9] border-[#C8E6C9] text-[#276A47]" },
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
      className="relative bg-transparent py-16 sm:py-24 px-4 sm:px-6 lg:px-12 overflow-hidden"
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
            See how CERTIFY turns interactive learning and demonstrated understanding into a verifiable credential.
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
          {/* Top Bar of Product Window */}
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-[#DFCDBB]/80">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E07A5F]/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#F4A261]/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#81B29A]/80 inline-block" />
              </div>
              <span className="text-xs font-mono text-[#7A6050] font-medium hidden sm:inline">
                certify-studio // python-fundamentals // module-03
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#8C705F] uppercase tracking-wider font-semibold">
              Live Studio Preview
            </span>
          </div>

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

            {/* Right Column: Interactive Demonstration Product UI (5 cols on lg) */}
            <div className="lg:col-span-5 flex flex-col justify-center min-h-[260px]">
              {/* STATE 01: LEARN */}
              {activeStep === 0 && (
                <div className="w-full rounded-2xl bg-[#FAF6EE] border border-[#DECBB7] p-5 font-mono text-[12.5px] space-y-3.5 shadow-inner">
                  {/* AI Tutor */}
                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-md bg-[#EDE2F5] text-[#5D3B75] border border-[#D5C2E8] flex items-center justify-center text-[11px] font-bold shrink-0">
                      AI
                    </div>
                    <div className="bg-[#FAF1E6] p-3 rounded-xl border border-[#DFCDBB] text-[#24130D] leading-relaxed shadow-xs flex-1">
                      <span className="text-[10px] font-bold text-[#5D3B75] block uppercase tracking-wider mb-0.5">
                        AI Tutor
                      </span>
                      "Why does this approach work?"
                    </div>
                  </div>

                  {/* Learner Response */}
                  <div className="flex items-start gap-2.5 justify-end">
                    <div className="bg-[#FAF1E6] p-3 rounded-xl border border-[#DFCDBB] text-[#24130D] leading-relaxed max-w-[88%] shadow-xs flex-1 text-right">
                      <span className="text-[10px] font-bold text-[#8C5835] block uppercase tracking-wider mb-0.5">
                        You
                      </span>
                      "Because the function keeps access to the value from the outer scope."
                    </div>
                    <div className="w-6 h-6 rounded-md bg-[#24130D] text-[#FAF0E6] flex items-center justify-center text-[11px] font-bold shrink-0">
                      YOU
                    </div>
                  </div>

                  {/* AI Feedback */}
                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-md bg-[#EDE2F5] text-[#5D3B75] border border-[#D5C2E8] flex items-center justify-center text-[11px] font-bold shrink-0">
                      <span className="material-symbols-outlined text-[13px]">psychology</span>
                    </div>
                    <div className="bg-[#FAF1E6] p-3 rounded-xl border border-[#DFCDBB] text-[#24130D] leading-relaxed shadow-xs flex-1">
                      <span className="text-[10px] font-bold text-[#5D3B75] block uppercase tracking-wider mb-0.5">
                        AI Feedback
                      </span>
                      "Good. Now explain what happens when that value changes."
                    </div>
                  </div>

                  {/* Bottom Status */}
                  <div className="flex items-center justify-between pt-2.5 border-t border-[#DECBB7] text-[11.5px] text-[#276A47] font-semibold">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[15px]">check_circle</span>
                      <span>Understanding explored</span>
                    </span>
                    <span className="text-[#5D3B75] font-mono text-[11px] font-bold">Active Session</span>
                  </div>
                </div>
              )}

              {/* STATE 02: DEMONSTRATE */}
              {activeStep === 1 && (
                <div className="w-full rounded-2xl bg-[#FAF6EE] border border-[#DECBB7] p-5 font-mono text-[12px] space-y-3.5 shadow-inner">
                  {/* Chapter Check */}
                  <div className="p-3.5 rounded-xl bg-[#FAF1E6] border border-[#DFCDBB] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#5D3B75]">
                        Chapter Check
                      </span>
                      <span className="text-[11px] text-[#276A47] font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">check</span> Correct
                      </span>
                    </div>
                    <p className="text-[#24130D] text-[12.5px] font-medium">
                      "What does this function return?"
                    </p>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="px-2.5 py-1.5 rounded-lg bg-[#FAF6EE] border border-[#DECBB7] text-[#7A6050]">
                        A &nbsp; 3
                      </div>
                      <div className="px-2.5 py-1.5 rounded-lg bg-[#E8F5E9] border border-[#A7D7B5] text-[#276A47] font-bold flex items-center justify-between">
                        <span>B &nbsp; 4</span>
                        <span>✓</span>
                      </div>
                      <div className="px-2.5 py-1.5 rounded-lg bg-[#FAF6EE] border border-[#DECBB7] text-[#7A6050]">
                        C &nbsp; 5
                      </div>
                      <div className="px-2.5 py-1.5 rounded-lg bg-[#FAF6EE] border border-[#DECBB7] text-[#7A6050]">
                        D &nbsp; Error
                      </div>
                    </div>
                  </div>

                  {/* Practical Task */}
                  <div className="p-3.5 rounded-xl bg-[#FAF1E6] border border-[#DFCDBB] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C5835]">
                        Practical Task
                      </span>
                      <span className="text-[11px] text-[#276A47] font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">done_all</span> Submission received ✓
                      </span>
                    </div>
                    <p className="text-[#24130D] text-[12px]">
                      "Create a function that handles the given input."
                    </p>
                    <div className="px-3 py-1.5 rounded-lg bg-[#24130D] text-[#FAF0E6] text-[11px] flex items-center justify-between">
                      <code>def process_stream(data): ...</code>
                      <span className="text-[#A7D7B5]">Verified</span>
                    </div>
                  </div>

                  {/* Bottom Status */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#DECBB7] text-[11.5px] text-[#276A47] font-semibold">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[15px]">check_circle</span>
                      <span>Understanding demonstrated</span>
                    </span>
                    <span className="text-[#276A47] font-mono text-[11px] font-bold">2/2 Passed ✓</span>
                  </div>
                </div>
              )}

              {/* STATE 03: EARN */}
              {activeStep === 2 && (
                <div className="w-full rounded-2xl bg-[#FAF6EE] border border-[#DECBB7] p-5 font-mono text-[12px] space-y-3.5 shadow-inner">
                  {/* Certification Result Checklist */}
                  <div className="p-3.5 rounded-xl bg-[#FAF1E6] border border-[#DFCDBB] space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#5D3B75] block">
                      Certification Result
                    </span>
                    <div className="space-y-1.5 text-[11.5px]">
                      <div className="flex items-center justify-between text-[#24130D]">
                        <span>Learning Progress</span>
                        <span className="text-[#276A47] font-bold">✓</span>
                      </div>
                      <div className="flex items-center justify-between text-[#24130D]">
                        <span>Chapter Assessments</span>
                        <span className="text-[#276A47] font-bold">✓</span>
                      </div>
                      <div className="flex items-center justify-between text-[#24130D]">
                        <span>Practical Demonstration</span>
                        <span className="text-[#276A47] font-bold">✓</span>
                      </div>
                      <div className="flex items-center justify-between text-[#24130D]">
                        <span>Final Assessment</span>
                        <span className="text-[#276A47] font-bold">✓</span>
                      </div>
                    </div>
                  </div>

                  {/* Credential Card Preview */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-[#24130D] via-[#2F1A11] to-[#1C0E08] text-[#FAF0E6] border border-[#5A3825]/70 space-y-2 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-['Newsreader',Georgia,serif] text-[#E8CCA6] font-normal tracking-wide">
                        CERTIFY
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] text-[#A7D7B5] bg-[#276A47]/30 px-2 py-0.5 rounded-md border border-[#276A47]/40 font-semibold">
                        <span className="material-symbols-outlined text-[11px]">verified</span> Verified Credential ✓
                      </span>
                    </div>
                    <div>
                      <p className="text-[13.5px] font-['Newsreader',Georgia,serif] text-[#FEF5E5] font-normal">
                        Python Fundamentals
                      </p>
                      <p className="text-[10px] text-[#B5A191] font-mono mt-0.5">
                        Credential ID: <span className="text-[#E8CCA6]">CERT-2026-XXXX</span>
                      </p>
                    </div>
                  </div>

                  {/* Bottom Action */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#DECBB7] text-[11.5px]">
                    <span className="text-[#276A47] font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px]">check_circle</span>
                      <span>Evidence Collected</span>
                    </span>
                    <button className="text-[#5D3B75] hover:text-[#24130D] font-mono text-[11.5px] font-bold flex items-center gap-1 transition-colors cursor-pointer">
                      <span>View Credential</span>
                      <span>→</span>
                    </button>
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
