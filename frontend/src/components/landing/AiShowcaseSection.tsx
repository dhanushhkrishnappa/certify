import React, { useState, useEffect } from "react";
import { BulgeCard } from "./webgl/BulgeCard.js";

interface StepData {
  id: number;
  label: string;
  badge: string;
  aiMessage: string;
  learnerResponse: string;
  tutorEvaluation: string;
  conceptDelta: string;
  status: "Socratic Probe" | "Hypothesis" | "Refinement" | "Mastery Verified";
  masteryScore: number;
}

const DEMO_STEPS: StepData[] = [
  {
    id: 1,
    label: "01. Socratic Probe",
    badge: "AI Socratic Inquiry",
    aiMessage:
      "Welcome to Module 3: Closures and Free Variables. Consider a function returning an inner helper. When the outer function exits and its frame is popped from the call stack, why does the inner helper still read the outer variables?",
    learnerResponse:
      "Because the inner helper copies all variables into its local dictionary when defined?",
    tutorEvaluation:
      "Good initial intuition, but let's probe deeper. If it made a shallow copy, modifying a mutable free variable like a list from either function wouldn't reflect changes. How does Python solve this without copies?",
    conceptDelta: "Diagnostic Baseline Registered",
    status: "Socratic Probe",
    masteryScore: 48,
  },
  {
    id: 2,
    label: "02. Probing Edge Cases",
    badge: "Misconception Diagnosed",
    aiMessage:
      "Notice: When Python compiles the nested function, it identifies variables that are referenced but not assigned locally as free variables. Where are they actually bound?",
    learnerResponse:
      "It creates cell objects that hold references on the heap, and both functions reference the same cell!",
    tutorEvaluation:
      "Precisely. Python wraps the free variable in a cell object located in __closure__. Now, what happens if we assign to that variable without the 'nonlocal' keyword?",
    conceptDelta: "Misconception Remediated (+24% understanding)",
    status: "Refinement",
    masteryScore: 78,
  },
  {
    id: 3,
    label: "03. Invariant Mastery",
    badge: "Mastery Proof Converged",
    aiMessage:
      "Exact. Python flags it as a local variable at compile-time, triggering UnboundLocalError before assignment. You've defended both the memory model and the compiler scope semantics.",
    learnerResponse:
      "So 'nonlocal' explicitly instructs the bytecode compiler to bind the name to the enclosing cell rather than allocating a local register.",
    tutorEvaluation:
      "Architectural understanding verified across both memory layout and bytecode binding. 14 unit invariant tests passed in sandbox. Mastered!",
    conceptDelta: "Concept Mastered: P(L) >= 0.942 ✓",
    status: "Mastery Verified",
    masteryScore: 96,
  },
];

export const AiShowcaseSection: React.FC = () => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const currentStep = DEMO_STEPS[currentStepIdx];

  // Typing animation effect whenever step changes
  useEffect(() => {
    const fullText = currentStep.aiMessage;
    let charIdx = 0;
    let cancelled = false;

    const timer = setInterval(() => {
      if (cancelled) return;
      charIdx += 2;
      if (charIdx >= fullText.length) {
        setDisplayedText(fullText);
        setIsTyping(false);
        clearInterval(timer);
      } else {
        setDisplayedText(fullText.slice(0, charIdx));
        setIsTyping(true);
      }
    }, 18);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [currentStep.aiMessage]);

  return (
    <section className="relative py-20 sm:py-24 px-4 sm:px-6 lg:px-12 bg-transparent overflow-hidden">
      {/* Background radial glow */}
      <div
        className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] pointer-events-none rounded-full blur-[140px] opacity-20"
        style={{
          background: "radial-gradient(circle, #CEA4F2 0%, #E6CAA4 50%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="font-['Newsreader',Georgia,serif] text-3xl sm:text-5xl md:text-6xl text-[#FEF5E5] font-normal leading-tight">
            How the Socratic AI Tutor Probes Your Code
          </h2>
          <p className="text-[15px] sm:text-[17px] text-[#CFC2B4] mt-3">
            Certify doesn't accept rote keyword answers. It challenges edge cases, inspects your reasoning, and logs verified evidence.
          </p>
        </div>

        {/* Studio Shell Card */}
        <BulgeCard
          className="rounded-3xl bg-gradient-to-b from-[#FAF1E6] via-[#F5EBDD] to-[#EEE0CD] border border-[#DFCDBB] shadow-2xl backdrop-blur-2xl overflow-hidden text-[#24130D]"
          maxTilt={4}
          highlightColor="rgba(255, 255, 255, 0.4)"
        >
          {/* Top Bar of Studio */}
          <div className="px-6 py-4 bg-[#EDE0CD] border-b border-[#DECBB7] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              </div>
              <span className="text-xs font-mono text-[#6C5243] font-medium hidden sm:inline">
                certify-studio // python-fundamentals // module-03
              </span>
            </div>

            {/* Step navigation tabs */}
            <div className="flex items-center gap-2">
              {DEMO_STEPS.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => setCurrentStepIdx(idx)}
                  className={`px-3 py-1 rounded-xl text-xs font-mono transition-all cursor-pointer ${currentStepIdx === idx
                      ? "bg-[#24130D] text-[#FAF2E8] font-bold shadow-xs"
                      : "bg-[#FAF5EE] text-[#5C4538] hover:text-[#24130D] border border-[#DECBB7]"
                    }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Studio Body */}
          <div className="p-6 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left 8 cols: Dialogue Pane */}
            <div className="lg:col-span-8 space-y-6">
              {/* AI Message Bubble */}
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl bg-[#EDE2F5] border border-[#D5C2E8] flex items-center justify-center text-[#5D3B75] shadow-xs shrink-0">
                  <span className="material-symbols-outlined text-[20px]">
                    psychology
                  </span>
                </div>
                <div className="flex-1 rounded-2xl bg-[#FAF5EE] border border-[#DECBB7] p-5 shadow-2xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[12px] font-mono font-bold text-[#5D3B75]">
                      Socratic AI Tutor
                    </span>
                    <span className="text-[10.5px] font-mono text-[#7A6050]">
                      {isTyping ? "Synthesizing..." : "Delivered"}
                    </span>
                  </div>
                  <p className="text-[14.5px] text-[#24130D] leading-relaxed">
                    {displayedText}
                    {isTyping && <span className="inline-block w-1.5 h-4 ml-1 bg-[#5D3B75] animate-pulse" />}
                  </p>
                </div>
              </div>

              {/* Learner Response Bubble */}
              <div className="flex items-start gap-4 justify-end">
                <div className="flex-1 max-w-xl rounded-2xl bg-[#EFE3D2] border border-[#DECBB7] p-5 shadow-2xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[12px] font-mono font-bold text-[#7A5230]">
                      Candidate Rationale
                    </span>
                    <span className="text-[10.5px] font-mono text-[#7A6050]">
                      Demonstrated
                    </span>
                  </div>
                  <p className="text-[14px] text-[#24130D] leading-relaxed">
                    {currentStep.learnerResponse}
                  </p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-[#24130D] flex items-center justify-center text-[#FAF0E6] font-bold text-sm shadow-xs shrink-0">
                  U
                </div>
              </div>

              {/* Evaluation Feedback */}
              <div className="p-4 rounded-xl bg-[#FAF5EE] border border-[#DECBB7] flex items-start gap-3">
                <span className="material-symbols-outlined text-emerald-700 text-[20px] mt-0.5 shrink-0">
                  verified
                </span>
                <div className="text-xs text-[#5C4538] leading-relaxed">
                  <strong className="text-[#24130D] block mb-0.5">
                    Pedagogical Evaluation:
                  </strong>
                  {currentStep.tutorEvaluation}
                </div>
              </div>
            </div>

            {/* Right 4 cols: Concept Mastery Ledger */}
            <div className="lg:col-span-4 rounded-2xl bg-[#EFE3D2] border border-[#DECBB7] p-5 flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#DECBB7]">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#6C5243]">
                    Mastery Ledger
                  </span>
                  <span className="text-xs font-mono font-bold text-[#5D3B75]">
                    {currentStep.status}
                  </span>
                </div>

                {/* Progress Dial Bar */}
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-[#5C4538]">Bayesian Knowledge P(L)</span>
                    <span className="text-emerald-700 font-bold">
                      {currentStep.masteryScore}%
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[#DECBB7] overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#5D3B75] via-[#DCA86A] to-emerald-600 transition-all duration-700 ease-out"
                      style={{ width: `${currentStep.masteryScore}%` }}
                    />
                  </div>
                </div>

                {/* Concept Checklist */}
                <div className="space-y-3 font-mono text-[11.5px]">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF5EE] border border-[#DECBB7]">
                    <span className="text-[#24130D]">Heap Cell Allocation</span>
                    <span className="text-emerald-700 font-bold">✓ PASS</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF5EE] border border-[#DECBB7]">
                    <span className="text-[#24130D]">__closure__ Invariants</span>
                    <span className="text-emerald-700 font-bold">
                      {currentStepIdx >= 1 ? "✓ PASS" : "PROBING"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF5EE] border border-[#DECBB7]">
                    <span className="text-[#24130D]">Bytecode Scope Rules</span>
                    <span className="text-emerald-700 font-bold">
                      {currentStepIdx >= 2 ? "✓ PASS" : "PENDING"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Step Forward Call to Action */}
              <div className="pt-4 border-t border-[#DECBB7]">
                <button
                  onClick={() => setCurrentStepIdx((prev) => (prev + 1) % DEMO_STEPS.length)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-b from-[#462719] via-[#381E13] to-[#2B150D] hover:from-[#542F1E] hover:to-[#381D12] text-[#FAF2E8] text-xs font-mono font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer border border-[#643D28] shadow-xs"
                >
                  <span>Advance Dialogue State</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>
        </BulgeCard>
      </div>
    </section>
  );
};
