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
    badgeClass: "bg-[#382649]/60 border-[#8B5FB0]/40 text-[#CEA4F2]",
    dotClass: "bg-[#CEA4F2]",
    chips: [
      { text: "Interactive Learning", color: "bg-white/5 border-white/12 text-[#FEF5E5]" },
      { text: "Adaptive Practice", color: "bg-[#382649]/60 border-[#8B5FB0]/35 text-[#CEA4F2]" },
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
    badgeClass: "bg-[#0E2818]/60 border-[#10B981]/40 text-[#6EE7B7]",
    dotClass: "bg-[#34D399]",
    chips: [
      { text: "Chapter Assessment", color: "bg-[#0E2818]/60 border-[#10B981]/35 text-[#6EE7B7]" },
      { text: "Practical Demonstration", color: "bg-[#382649]/60 border-[#8B5FB0]/35 text-[#CEA4F2]" },
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
    badgeClass: "bg-white/10 border-white/20 text-[#E6CAA4]",
    dotClass: "bg-[#E6CAA4]",
    chips: [
      { text: "Evidence Collected", color: "bg-white/5 border-white/12 text-[#FEF5E5]" },
      { text: "Credential Issued", color: "bg-[#0E2818]/60 border-[#10B981]/35 text-[#6EE7B7]" },
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
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] pointer-events-none rounded-full blur-[140px] opacity-15"
        style={{
          background:
            "radial-gradient(circle, rgba(206, 164, 242, 0.25) 0%, rgba(255, 255, 255, 0.05) 50%, transparent 75%)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-6xl mx-auto w-full">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <h2 className="font-['Newsreader',Georgia,serif] text-3xl sm:text-5xl md:text-6xl text-[#FEF5E5] font-normal leading-tight">
            Learn. Demonstrate. Earn.
          </h2>
          <p className="text-[15px] sm:text-[17px] text-[#D1D5DB] mt-3">
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
                    ? "bg-gradient-to-b from-[#222228]/95 via-[#18181C]/92 to-[#101013]/95 border-white/25 text-[#FEF5E5] shadow-lg scale-[1.02]"
                    : "bg-[#141418]/70 border-white/10 text-[#A1A1AA] hover:text-[#FEF5E5] hover:bg-[#1E1E24]/80"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-0.5">
                  <span
                    className={`font-mono text-[11.5px] font-bold tracking-wider ${
                      isSelected ? "text-[#CEA4F2]" : "text-[#71717A]"
                    }`}
                  >
                    {item.tabLabel}
                  </span>
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#CEA4F2] animate-pulse" />
                  )}
                </div>
                <span
                  className={`text-[12.5px] font-medium ${
                    isSelected ? "text-[#FEF5E5]" : "text-[#A1A1AA]"
                  }`}
                >
                  {item.tabSub}
                </span>
              </button>
            );
          })}
        </div>

        {/* Unified Storyboard Stage Card - Master Card Surface */}
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="w-full max-w-5xl mx-auto rounded-3xl bg-gradient-to-b from-[#1C1C20]/90 via-[#141416]/88 to-[#0E0E10]/92 border border-white/12 shadow-2xl backdrop-blur-xl p-6 sm:p-10 lg:p-12 text-[#FEF5E5] transition-all duration-300"
        >
          {/* Top Bar of Product Window */}
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] inline-block" />
              </div>
              <span className="text-xs font-mono text-[#9CA3AF] font-medium hidden sm:inline">
                certify-studio // python-fundamentals // module-03
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#D1D5DB]/80 uppercase tracking-wider font-semibold">
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

              <h3 className="font-['Newsreader',Georgia,serif] text-2xl sm:text-3xl lg:text-4xl text-[#FEF5E5] leading-tight font-normal">
                {current.headline}
              </h3>

              <p className="text-[15px] sm:text-[16px] text-[#D1D5DB] leading-relaxed">
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

            {/* Right Column: Interactive Demonstration Product UI (Light Grey / Whitish Inner Mockup) */}
            <div className="lg:col-span-5 flex flex-col justify-center min-h-[260px]">
              {/* STATE 01: LEARN */}
              {activeStep === 0 && (
                <div className="w-full rounded-2xl bg-[#F8F9FA] border border-[#E2E8F0] p-5 font-mono text-[12.5px] space-y-3.5 shadow-xl text-[#111827]">
                  {/* AI Tutor */}
                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-md bg-[#7C3AED] text-white flex items-center justify-center text-[10px] font-bold shrink-0 shadow-xs">
                      AI
                    </div>
                    <div className="bg-[#FFFFFF] p-3 rounded-xl border border-[#E2E8F0] text-[#111827] leading-relaxed shadow-xs flex-1">
                      <span className="text-[10px] font-bold text-[#7C3AED] block uppercase tracking-wider mb-0.5">
                        AI Tutor
                      </span>
                      "Why does this approach work?"
                    </div>
                  </div>

                  {/* Learner Response */}
                  <div className="flex items-start gap-2.5 justify-end">
                    <div className="bg-[#F3F4F6] p-3 rounded-xl border border-[#E5E7EB] text-[#111827] leading-relaxed max-w-[88%] shadow-xs flex-1 text-right">
                      <span className="text-[10px] font-bold text-[#4B5563] block uppercase tracking-wider mb-0.5">
                        You
                      </span>
                      "Because the function keeps access to the value from the outer scope."
                    </div>
                    <div className="w-6 h-6 rounded-md bg-[#18181B] text-white flex items-center justify-center text-[10px] font-bold shrink-0 shadow-xs">
                      YOU
                    </div>
                  </div>

                  {/* AI Feedback */}
                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-md bg-[#7C3AED] text-white flex items-center justify-center text-[11px] font-bold shrink-0 shadow-xs">
                      <span className="material-symbols-outlined text-[13px]">psychology</span>
                    </div>
                    <div className="bg-[#FFFFFF] p-3 rounded-xl border border-[#E2E8F0] text-[#111827] leading-relaxed shadow-xs flex-1">
                      <span className="text-[10px] font-bold text-[#7C3AED] block uppercase tracking-wider mb-0.5">
                        AI Feedback
                      </span>
                      "Good. Now explain what happens when that value changes."
                    </div>
                  </div>

                  {/* Bottom Status */}
                  <div className="flex items-center justify-between pt-2.5 border-t border-[#E2E8F0] text-[11.5px] text-[#15803D] font-semibold">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[15px]">check_circle</span>
                      <span>Understanding explored</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#EDE9FE] text-[#7C3AED] font-mono text-[11px] font-bold border border-[#DDD6FE]">
                      Active Session
                    </span>
                  </div>
                </div>
              )}

              {/* STATE 02: DEMONSTRATE */}
              {activeStep === 1 && (
                <div className="w-full rounded-2xl bg-[#F8F9FA] border border-[#E2E8F0] p-5 font-mono text-[12px] space-y-3.5 shadow-xl text-[#111827]">
                  {/* Chapter Check */}
                  <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#7C3AED]">
                        Chapter Check
                      </span>
                      <span className="text-[11px] text-[#15803D] font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">check</span> Correct
                      </span>
                    </div>
                    <p className="text-[#111827] text-[12.5px] font-semibold">
                      "What does this function return?"
                    </p>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="px-2.5 py-1.5 rounded-lg bg-[#F8F9FA] border border-[#E2E8F0] text-[#4B5563]">
                        A &nbsp; 3
                      </div>
                      <div className="px-2.5 py-1.5 rounded-lg bg-[#DCFCE7] border border-[#86EFAC] text-[#15803D] font-bold flex items-center justify-between">
                        <span>B &nbsp; 4</span>
                        <span>✓</span>
                      </div>
                      <div className="px-2.5 py-1.5 rounded-lg bg-[#F8F9FA] border border-[#E2E8F0] text-[#4B5563]">
                        C &nbsp; 5
                      </div>
                      <div className="px-2.5 py-1.5 rounded-lg bg-[#F8F9FA] border border-[#E2E8F0] text-[#4B5563]">
                        D &nbsp; Error
                      </div>
                    </div>
                  </div>

                  {/* Practical Task */}
                  <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#4B5563]">
                        Practical Task
                      </span>
                      <span className="text-[11px] text-[#15803D] font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">done_all</span> Submission received ✓
                      </span>
                    </div>
                    <p className="text-[#111827] text-[12px] font-medium">
                      "Create a function that handles the given input."
                    </p>
                    <div className="px-3 py-1.5 rounded-lg bg-[#F1F5F9] text-[#0F172A] border border-[#CBD5E1] text-[11px] font-mono flex items-center justify-between">
                      <code>def process_stream(data): ...</code>
                      <span className="text-[#15803D] font-bold">Verified</span>
                    </div>
                  </div>

                  {/* Bottom Status */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0] text-[11.5px] text-[#15803D] font-semibold">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[15px]">check_circle</span>
                      <span>Understanding demonstrated</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC] font-mono text-[11px] font-bold">
                      2/2 Passed ✓
                    </span>
                  </div>
                </div>
              )}

              {/* STATE 03: EARN */}
              {activeStep === 2 && (
                <div className="w-full rounded-2xl bg-[#F8F9FA] border border-[#E2E8F0] p-5 font-mono text-[12px] space-y-3.5 shadow-xl text-[#111827]">
                  {/* Certification Result Checklist */}
                  <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] shadow-xs space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#7C3AED] block">
                      Certification Result
                    </span>
                    <div className="space-y-1.5 text-[11.5px]">
                      <div className="flex items-center justify-between text-[#1F2937]">
                        <span>Learning Progress</span>
                        <span className="text-[#15803D] font-bold">✓</span>
                      </div>
                      <div className="flex items-center justify-between text-[#1F2937]">
                        <span>Chapter Assessments</span>
                        <span className="text-[#15803D] font-bold">✓</span>
                      </div>
                      <div className="flex items-center justify-between text-[#1F2937]">
                        <span>Practical Demonstration</span>
                        <span className="text-[#15803D] font-bold">✓</span>
                      </div>
                      <div className="flex items-center justify-between text-[#1F2937]">
                        <span>Final Assessment</span>
                        <span className="text-[#15803D] font-bold">✓</span>
                      </div>
                    </div>
                  </div>

                  {/* Credential Card Preview */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-[#FFFFFF] to-[#F8F9FA] text-[#111827] border border-[#E2E8F0] space-y-2 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-['Newsreader',Georgia,serif] text-[#111827] font-semibold tracking-wide">
                        CERTIFY
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] text-[#15803D] bg-[#DCFCE7] px-2 py-0.5 rounded-md border border-[#86EFAC] font-bold">
                        <span className="material-symbols-outlined text-[11px]">verified</span> Verified Credential ✓
                      </span>
                    </div>
                    <div>
                      <p className="text-[13.5px] font-['Newsreader',Georgia,serif] text-[#111827] font-semibold">
                        Python Fundamentals
                      </p>
                      <p className="text-[10px] text-[#6B7280] font-mono mt-0.5">
                        Credential ID: <span className="text-[#111827] font-bold">CERT-2026-XXXX</span>
                      </p>
                    </div>
                  </div>

                  {/* Bottom Action */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0] text-[11.5px]">
                    <span className="text-[#15803D] font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px]">check_circle</span>
                      <span>Evidence Collected</span>
                    </span>
                    <button className="text-[#7C3AED] hover:text-[#6D28D9] font-mono text-[11.5px] font-bold flex items-center gap-1 transition-colors cursor-pointer">
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

