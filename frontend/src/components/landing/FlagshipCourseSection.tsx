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
    <section className="relative py-24 px-4 sm:px-6 lg:px-12 bg-transparent border-t border-[#3E2416]/40 overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Flagship Overview */}
          <div className="lg:col-span-6 space-y-6">
            <h2 className="font-['Newsreader',Georgia,serif] text-3xl sm:text-5xl text-[#FEF5E5] font-normal leading-tight">
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
                  className={`p-4 rounded-xl transition-all cursor-pointer border ${selectedMod === idx
                      ? "bg-gradient-to-b from-[#FAF1E6] via-[#F5EBDD] to-[#EEE0CD] border-[#DFCDBB] shadow-md text-[#22120B]"
                      : "bg-[#23120A]/85 border-[#4A2C1D] hover:bg-[#2F190F] text-[#E8DCCF]"
                    }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-mono text-xs font-bold ${selectedMod === idx ? "text-[#5D3B75]" : "text-[#E6CAA4]"}`}>
                      Module {mod.num} // {mod.focus}
                    </span>
                    <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${selectedMod === idx
                        ? "text-[#276A47] bg-[#E8F5E9] border border-[#C8E6C9] font-bold"
                        : "text-[#A89682]"
                      }`}>
                      {selectedMod === idx ? "SELECTED" : "VIEW"}
                    </span>
                  </div>
                  <h4 className={`font-['Newsreader',Georgia,serif] text-[17px] mb-1 ${selectedMod === idx ? "text-[#22120B] font-semibold" : "text-[#FAF0E6]"}`}>
                    {mod.title}
                  </h4>
                  <p className={`text-xs ${selectedMod === idx ? "text-[#5C4538]" : "text-[#A89682]"}`}>{mod.concepts}</p>
                </div>
              ))}
            </div>

            {/* Action Row */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                onClick={onExploreCourses}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#462719] via-[#381E13] to-[#2B150D] hover:brightness-110 text-[#FAF0E6] font-semibold text-sm transition-all active:scale-95 shadow-md border border-[#5A3825] cursor-pointer"
              >
                Inspect Complete Syllabus &amp; Rubrics →
              </button>
              <button
                onClick={onBeginDiagnostic}
                className="px-5 py-3 rounded-xl bg-[#FAF1E6] hover:bg-[#F2E5D5] border border-[#DFCDBB] text-[#22120B] font-medium text-sm transition-all active:scale-95 shadow-sm cursor-pointer"
              >
                Test Diagnostic Baseline
              </button>
            </div>
          </div>

          {/* Right Column: Code & Sandbox Demonstration Preview */}
          <div className="lg:col-span-6">
            <BulgeCard className="rounded-3xl bg-gradient-to-b from-[#FAF1E6] via-[#F5EBDD] to-[#EEE0CD] border border-[#DFCDBB] p-6 sm:p-8 shadow-2xl space-y-4 text-[#22120B]">
              <div className="flex items-center justify-between border-b border-[#DFCDBB] pb-3 text-xs font-mono">
                <span className="text-[#22120B] font-bold">
                  # Module {FLAGSHIP_MODULES[selectedMod].num}: Invariant Suite
                </span>
                <span className="text-[#276A47] bg-[#E8F5E9] border border-[#C8E6C9] px-2.5 py-0.5 rounded-full flex items-center gap-1.5 font-bold shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#276A47] animate-pulse" />
                  Live Sandbox
                </span>
              </div>

              <pre className="p-4 rounded-xl bg-[#160B06] border border-[#3E2416] font-mono text-xs text-[#EDE4D8] leading-relaxed overflow-x-auto shadow-inner">
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

              <div className="pt-3 border-t border-[#DFCDBB] flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-[#5C4538]">
                <div className="flex items-center gap-2">
                  <span>Bayesian Prior P(L):</span>
                  <span className="text-[#276A47] font-bold">0.942 (Mastered)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>Defense Bar:</span>
                  <span className="text-[#5D3B75] font-bold">Oral Viva Passed</span>
                </div>
              </div>
            </BulgeCard>
          </div>
        </div>
      </div>
    </section>
  );
};
