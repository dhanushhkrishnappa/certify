import React from "react";
import type { User } from "../types/index.js";
import { useTheme } from "../context/ThemeContext.js";

interface ProgressViewProps {
  user?: User | null;
  onNavigateToStudio?: () => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({ user: _user, onNavigateToStudio }) => {
  const { theme } = useTheme();
  const isLight = theme === "light";

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Overview Card */}
      <div className={`rounded-2xl p-6 border shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-300 ${
        isLight
          ? "bg-white border-purple-900/10 shadow-[0_8px_30px_rgba(76,29,149,0.06)] text-slate-900"
          : "bg-[#111111] border-white/[0.08] text-white"
      }`}>
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/40 border border-indigo-800/40 text-indigo-300 text-xs font-semibold">
            <span>✦</span>
            <span>Flagship Track: Python Fundamentals</span>
          </div>
          <h2 className={`text-2xl font-serif font-bold transition-colors duration-300 ${
            isLight ? "text-slate-900" : "text-white"
          }`}>
            Overall Curriculum Mastery: 78.4%
          </h2>
          <p className={`text-xs max-w-xl leading-relaxed transition-colors duration-300 ${
            isLight ? "text-slate-600" : "text-neutral-300"
          }`}>
            Continuous Bayesian Knowledge Tracing updates in real-time as you formulate answers in the Socratic AI Studio, run unit tests in the code sandbox, and defend solutions.
          </p>
        </div>

        <div className="flex items-center gap-6 shrink-0">
          <div className={`text-center p-4 rounded-xl border w-28 ${
            isLight ? "bg-purple-50/50 border-purple-100" : "bg-white/[0.04] border-white/[0.06]"
          }`}>
            <div className="text-2xl font-bold text-indigo-500">6 / 8</div>
            <div className={`text-[10px] uppercase font-bold mt-0.5 ${isLight ? "text-slate-500" : "text-neutral-400"}`}>Modules Clear</div>
          </div>
          <div className={`text-center p-4 rounded-xl border w-28 ${
            isLight ? "bg-purple-50/50 border-purple-100" : "bg-white/[0.04] border-white/[0.06]"
          }`}>
            <div className="text-2xl font-bold text-emerald-500">0.892</div>
            <div className={`text-[10px] uppercase font-bold mt-0.5 ${isLight ? "text-slate-500" : "text-neutral-400"}`}>Mean P(L)</div>
          </div>
        </div>
      </div>

      {/* Module Breakdown Grid */}
      <div className="space-y-3">
        <h3 className={`text-base font-bold transition-colors duration-300 ${isLight ? "text-slate-900" : "text-white"}`}>Module Knowledge States</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              id: "M1",
              title: "Variables, Types & Memory Model",
              status: "Mastered",
              pL: 0.94,
              color: "emerald",
              concepts: ["Value reassignment", "Identity vs equality", "Primitive mutability"],
            },
            {
              id: "M2",
              title: "Control Flow & Socratic Logic",
              status: "Mastered",
              pL: 0.91,
              color: "emerald",
              concepts: ["Nested conditionals", "Short-circuit evaluation", "Truthiness"],
            },
            {
              id: "M3",
              title: "Functions, Scope & Recursion",
              status: "Mastered",
              pL: 0.88,
              color: "emerald",
              concepts: ["LEGB scope rule", "Default mutable args", "Recursion limits"],
            },
            {
              id: "M4",
              title: "Data Structures: Lists & Dicts",
              status: "Review / Remediated",
              pL: 0.82,
              color: "indigo",
              concepts: ["In-place mutation", "Dict comprehension", "Time complexity"],
            },
            {
              id: "M5",
              title: "File I/O & Exception Handling",
              status: "In Progress",
              pL: 0.65,
              color: "amber",
              concepts: ["Context managers", "Custom exceptions", "Resource cleanup"],
            },
            {
              id: "M6",
              title: "Object-Oriented Architecture",
              status: "In Progress",
              pL: 0.58,
              color: "amber",
              concepts: ["Dunder methods", "Class invariants", "Multiple inheritance"],
            },
            {
              id: "M7",
              title: "Modules, Packages & Testing",
              status: "Locked",
              pL: 0.0,
              color: "slate",
              concepts: ["Pytest fixtures", "Parametrization", "Mocking boundaries"],
            },
            {
              id: "M8",
              title: "Final Practical Implementation",
              status: "Locked",
              pL: 0.0,
              color: "slate",
              concepts: ["End-to-end project", "Integration test suite", "Oral defense prep"],
            },
          ].map((mod) => (
            <div key={mod.id} className={`rounded-xl p-5 border shadow-sm space-y-3 transition-all duration-300 ${
              isLight
                ? "bg-white border-purple-900/10 shadow-[0_8px_30px_rgba(76,29,149,0.06)] text-slate-900"
                : "bg-[#111111] border-white/[0.08] text-white"
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-mono font-bold ${isLight ? "text-purple-700" : "text-neutral-400"}`}>{mod.id}</span>
                <span
                  className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                    mod.status === "Mastered"
                      ? "bg-emerald-950/40 text-emerald-400 border border-emerald-800/40"
                      : mod.status === "In Progress"
                      ? "bg-amber-950/40 text-amber-400 border border-amber-800/40"
                      : mod.status === "Review / Remediated"
                      ? "bg-indigo-950/40 text-indigo-300 border border-indigo-800/40"
                      : "bg-white/[0.06] text-neutral-400 border border-white/[0.06]"
                  }`}
                >
                  {mod.status}
                </span>
              </div>

              <div>
                <h4 className={`text-sm font-bold transition-colors duration-300 ${isLight ? "text-slate-900" : "text-white"}`}>{mod.title}</h4>
                <div className="flex items-center gap-3 mt-2">
                  <div className={`flex-1 h-2 rounded-full overflow-hidden ${
                    isLight ? "bg-purple-100" : "bg-white/[0.08]"
                  }`}>
                    <div
                      className={`h-full rounded-full ${
                        mod.status === "Mastered"
                          ? "bg-emerald-500"
                          : mod.status === "In Progress"
                          ? "bg-amber-500"
                          : mod.status === "Review / Remediated"
                          ? "bg-[#5B4DF0]"
                          : "bg-neutral-600"
                      }`}
                      style={{ width: `${mod.pL * 100}%` }}
                    />
                  </div>
                  <span className={`text-xs font-mono font-semibold ${isLight ? "text-slate-600" : "text-neutral-300"}`}>
                    {(mod.pL * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {mod.concepts.map((c) => (
                  <span
                    key={c}
                    className={`text-[10px] px-2 py-0.5 rounded border transition-colors duration-300 ${
                      isLight
                        ? "bg-purple-100/60 text-purple-900 border-purple-200"
                        : "bg-white/[0.06] text-neutral-300 border-white/[0.06]"
                    }`}
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {onNavigateToStudio && (
        <div className={`p-4 border rounded-xl flex items-center justify-between gap-4 transition-all duration-300 ${
          isLight
            ? "bg-white border-purple-900/10 shadow-sm text-slate-900"
            : "bg-[#111111] border-white/[0.08] text-white"
        }`}>
          <div>
            <h4 className={`text-xs font-bold ${isLight ? "text-slate-900" : "text-white"}`}>Continue Active Module</h4>
            <p className={`text-[11px] ${isLight ? "text-slate-600" : "text-neutral-300"}`}>
              Module 5: File I/O & Exception Handling has 2 pending interactive code challenges.
            </p>
          </div>
          <button
            onClick={onNavigateToStudio}
            className="px-4 py-2 bg-[#5B4DF0] hover:bg-[#4C3DE0] text-white text-xs font-semibold rounded-lg shadow-sm transition shrink-0 cursor-pointer"
          >
            Launch Studio →
          </button>
        </div>
      )}
    </div>
  );
};
