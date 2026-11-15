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
          <h2 className="font-sans font-bold text-3xl sm:text-5xl md:text-6xl text-[#FEF5E5] font-normal leading-tight">
            How the Socratic AI Tutor Probes Your Code
          </h2>
          <p className="text-[15px] sm:text-[17px] text-[#CFC2B4] mt-3">
            Certify doesn't accept rote keyword answers. It challenges edge cases, inspects your reasoning, and logs verified evidence.
          </p>
        </div>

        {/* Studio Shell Card */}
        <BulgeCard
          className="rounded-3xl bg-gradient-to-b from-[#18181D]/90 via-[#121215]/88 to-[#0B0B0E]/95 border border-white/[0.06] shadow-[0_24px_60px_-12px_rgba(0,0,0,0.95)] backdrop-blur-2xl overflow-hidden text-[#FEF5E5]"
          maxTilt={4}
          highlightColor="rgba(255, 255, 255, 0.05)"
        >
          {/* Top Bar of Studio */}
          <div className="px-6 py-4 bg-[#141418]/90 border-b border-white/[0.05] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#EF4444] inline-block" />
                <span className="w-3 h-3 rounded-full bg-[#F59E0B] inline-block" />
                <span className="w-3 h-3 rounded-full bg-[#10B981] inline-block" />
              </div>
              <span className="text-xs font-mono text-[#9CA3AF] font-medium hidden sm:inline">
                certify-studio // python-fundamentals // module-03
              </span>
            </div>

            {/* Step navigation tabs */}
            <div className="flex items-center gap-2">
              {DEMO_STEPS.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => setCurrentStepIdx(idx)}
                  className={`px-3 py-1 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                    currentStepIdx === idx
                      ? "bg-white/[0.08] text-[#FEF5E5] border border-white/[0.08] font-bold shadow-xs"
                      : "bg-white/[0.02] text-[#A1A1AA] hover:text-[#FEF5E5] border border-white/[0.04]"
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
                <div className="w-9 h-9 rounded-xl bg-[#7C3AED] text-white flex items-center justify-center shadow-xs shrink-0">
                  <span className="material-symbols-outlined text-[20px]">
                    psychology
                  </span>
                </div>
                <div className="flex-1 rounded-2xl bg-[#141418]/90 border border-white/[0.06] p-5 shadow-lg text-[#FEF5E5]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[12px] font-mono font-bold text-[#CEA4F2]">
                      Socratic AI Tutor
                    </span>
                    <span className="text-[10.5px] font-mono text-[#9CA3AF]">
                      {isTyping ? "Synthesizing..." : "Delivered"}
                    </span>
                  </div>
                  <p className="text-[14.5px] text-[#FEF5E5] leading-relaxed">
                    {displayedText}
                    {isTyping && <span className="inline-block w-1.5 h-4 ml-1 bg-[#CEA4F2] animate-pulse" />}
                  </p>
                </div>
              </div>

              {/* Learner Response Bubble */}
              <div className="flex items-start gap-4 justify-end">
                <div className="flex-1 max-w-xl rounded-2xl bg-[#1A1A22]/90 border border-[#7C3AED]/25 p-5 shadow-lg text-[#FEF5E5]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[12px] font-mono font-bold text-[#E6CAA4]">
                      Candidate Rationale
                    </span>
                    <span className="text-[10.5px] font-mono text-[#34D399] font-bold">
                      Demonstrated
                    </span>
                  </div>
                  <p className="text-[14px] text-[#FEF5E5] leading-relaxed">
                    {currentStep.learnerResponse}
                  </p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-[#26262E] flex items-center justify-center text-white font-bold text-sm shadow-xs shrink-0 border border-white/[0.06]">
                  U
                </div>
              </div>

              {/* Evaluation Feedback */}
              <div className="p-4 rounded-xl bg-[#141418]/90 border border-white/[0.06] flex items-start gap-3 text-[#FEF5E5]">
                <span className="material-symbols-outlined text-[#34D399] text-[20px] mt-0.5 shrink-0">
                  verified
                </span>
                <div className="text-xs text-[#D1D5DB] leading-relaxed">
                  <strong className="text-[#FEF5E5] block mb-0.5 font-bold">
                    Pedagogical Evaluation:
                  </strong>
                  {currentStep.tutorEvaluation}
                </div>
              </div>
            </div>

            {/* Right 4 cols: Concept Mastery Ledger */}
            <div className="lg:col-span-4 rounded-2xl bg-[#141418]/90 border border-white/[0.06] p-5 flex flex-col justify-between space-y-6 text-[#FEF5E5] shadow-xl">
              <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.06]">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#A1A1AA]">
                    Mastery Ledger
                  </span>
                  <span className="text-xs font-mono font-bold text-[#CEA4F2]">
                    {currentStep.status}
                  </span>
                </div>

                {/* Progress Dial Bar */}
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-[#A1A1AA]">Bayesian Knowledge P(L)</span>
                    <span className="text-[#34D399] font-bold">
                      {currentStep.masteryScore}%
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/[0.08] overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#7C3AED] via-[#3B82F6] to-[#10B981] transition-all duration-700 ease-out"
                      style={{ width: `${currentStep.masteryScore}%` }}
                    />
                  </div>
                </div>

                {/* Concept Checklist */}
                <div className="space-y-3 font-mono text-[11.5px]">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] shadow-xs">
                    <span className="text-[#FEF5E5] font-medium">Heap Cell Allocation</span>
                    <span className="text-[#34D399] font-bold">✓ PASS</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] shadow-xs">
                    <span className="text-[#FEF5E5] font-medium">__closure__ Invariants</span>
                    <span className="text-[#34D399] font-bold">
                      {currentStepIdx >= 1 ? "✓ PASS" : "PROBING"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] shadow-xs">
                    <span className="text-[#FEF5E5] font-medium">Bytecode Scope Rules</span>
                    <span className="text-[#34D399] font-bold">
                      {currentStepIdx >= 2 ? "✓ PASS" : "PENDING"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Step Forward Call to Action */}
              <div className="pt-4 border-t border-white/[0.06]">
                <button
                  onClick={() => setCurrentStepIdx((prev) => (prev + 1) % DEMO_STEPS.length)}
                  className="w-full py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white text-xs font-mono font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer border border-white/[0.06] shadow-xs"
                >
                  <span>Advance Dialogue State</span>
                  <span className="text-white">→</span>
                </button>
              </div>
            </div>
          </div>
        </BulgeCard>
      </div>
    </section>
  );
};
