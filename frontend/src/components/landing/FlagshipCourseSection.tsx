import React, { useState } from "react";
import { BulgeCard } from "./webgl/BulgeCard.js";

interface ModuleInfo {
  num: string;
  title: string;
  concepts: string;
  focus: string;
}

const FLAGSHIP_MODULES: ModuleInfo[] = [
  {
    num: "01",
    title: "CPython Memory Layout & References",
    concepts: "PyObject header, reference counting, id(), and mutability traps",
    focus: "Memory Invariants",
  },
  {
    num: "02",
    title: "Scope Rules, Bytecode & Closures",
    concepts: "LEGB resolution, LOAD_DEREF bytecode, free variables, and cell objects",
    focus: "Compiler Invariants",
  },
  {
    num: "03",
    title: "Iterators, Generators & Frame Lifecycles",
    concepts: "Iterator protocol, yield execution frames, O(1) streaming invariants",
    focus: "Runtime Lifecycles",
  },
  {
    num: "04",
    title: "Metaprogramming & Descriptor Protocols",
    concepts: "__get__, __set__, method binding, dynamic attribute lookups",
    focus: "Object Model",
  },
];

interface FlagshipCourseSectionProps {
  onExploreCourses: () => void;
  onBeginDiagnostic: () => void;
}

export const FlagshipCourseSection: React.FC<FlagshipCourseSectionProps> = ({
  onExploreCourses,
  onBeginDiagnostic,
}) => {
  const [selectedMod, setSelectedMod] = useState(0);

  return (
    <section className="relative py-20 sm:py-24 px-4 sm:px-6 lg:px-12 bg-transparent overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Flagship Overview */}
          <div className="lg:col-span-6 space-y-6">
            <h2 className="font-sans font-bold text-3xl sm:text-5xl text-[#FEF5E5] font-normal leading-tight">
              Python Fundamentals: Deep Architecture
            </h2>

            <p className="text-[15px] sm:text-[16px] text-[#CFC2B4] leading-relaxed">
              From CPython heap models and bytecode emission to generator frames and descriptor protocols. Master the internal mechanics that separate senior systems engineers from syntactic beginners.
            </p>

            {/* Interactive Module Accordion / Picker */}
            <div className="space-y-3 pt-2">
              {FLAGSHIP_MODULES.map((mod, idx) => (
                <div
                  key={mod.num}
                  onClick={() => setSelectedMod(idx)}
                  className={`p-4 rounded-xl transition-all cursor-pointer border ${
                    selectedMod === idx
                      ? "bg-gradient-to-b from-[#222228]/95 via-[#18181C]/92 to-[#101013]/95 border-white/[0.08] shadow-md text-[#FEF5E5]"
                      : "bg-[#141418]/70 border-white/[0.04] hover:bg-[#1C1C22]/80 text-[#A1A1AA]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`font-mono text-xs font-bold ${
                        selectedMod === idx ? "text-[#CEA4F2]" : "text-[#D1D5DB]"
                      }`}
                    >
                      Module {mod.num} // {mod.focus}
                    </span>
                    <span
                      className={`text-xs font-mono px-2 py-0.5 rounded-full ${
                        selectedMod === idx
                          ? "text-[#34D399] bg-[#0E2818]/60 border border-[#10B981]/40 font-bold"
                          : "text-[#71717A]"
                      }`}
                    >
                      {selectedMod === idx ? "SELECTED" : "VIEW"}
                    </span>
                  </div>
                  <h4
                    className={`font-sans font-bold text-[17px] mb-1 ${
                      selectedMod === idx ? "text-[#FEF5E5] font-semibold" : "text-[#FEF5E5]/80"
                    }`}
                  >
                    {mod.title}
                  </h4>
                  <p className="text-xs text-[#9CA3AF]">{mod.concepts}</p>
                </div>
              ))}
            </div>

            {/* Action Row */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                onClick={onExploreCourses}
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-[#FEF5E5] font-semibold text-sm transition-all active:scale-95 shadow-md border border-white/15 cursor-pointer flex items-center gap-2"
              >
                <span>Inspect Complete Syllabus &amp; Rubrics</span>
                <span className="text-[#E6CAA4]">→</span>
              </button>
              <button
                onClick={onBeginDiagnostic}
                className="px-5 py-3 rounded-xl bg-[#141418]/80 hover:bg-[#1E1E24] border border-white/[0.06] text-[#D1D5DB] font-medium text-sm transition-all active:scale-95 shadow-sm cursor-pointer"
              >
                Test Diagnostic Baseline
              </button>
            </div>
          </div>

          {/* Right Column: Code & Sandbox Demonstration Preview */}
          <div className="lg:col-span-6">
            <BulgeCard className="rounded-3xl bg-gradient-to-b from-[#18181D]/90 via-[#121215]/88 to-[#0B0B0E]/95 border border-white/[0.06] backdrop-blur-xl p-6 sm:p-8 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.95)] space-y-4 text-[#FEF5E5]">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 text-xs font-mono">
                <span className="text-[#FEF5E5] font-bold">
                  # Module {FLAGSHIP_MODULES[selectedMod].num}: Invariant Suite
                </span>
                <span className="text-[#15803D] bg-[#DCFCE7] border border-[#86EFAC] px-2.5 py-0.5 rounded-full flex items-center gap-1.5 font-bold shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#15803D] animate-pulse" />
                  Live Sandbox
                </span>
              </div>

              {/* Code Sandbox Terminal */}
              <pre className="p-4 rounded-xl bg-[#0D0D11] border border-white/[0.06] font-mono text-xs text-[#E2E8F0] leading-relaxed overflow-x-auto shadow-inner">
                {`def make_averager():
    series = []
    def averager(new_value):
        # Closure retains free variable in __closure__
        series.append(new_value)
        return sum(series) / len(series)
    return averager

avg = make_averager()
assert avg(10) == 10.0
assert avg(20) == 15.0

# Memory Invariant Check:
assert len(avg.__closure__) == 1
assert isinstance(avg.__closure__[0].cell_contents, list)`}
              </pre>

              <div className="pt-3 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-[#D1D5DB]">
                <div className="flex items-center gap-2">
                  <span>Bayesian Prior P(L):</span>
                  <span className="text-[#34D399] font-bold">0.942 (Mastered)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>Defense Bar:</span>
                  <span className="text-[#CEA4F2] font-bold">Oral Viva Passed</span>
                </div>
              </div>
            </BulgeCard>
          </div>
        </div>
      </div>
    </section>
  );
};
