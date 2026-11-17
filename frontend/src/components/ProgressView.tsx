import React, { useEffect, useState, useMemo } from "react";
import type { User, ProgressionTree, SkillsReport } from "../types/index.js";
import { useTheme } from "../context/ThemeContext.js";
import { api } from "../services/api.js";

interface ProgressViewProps {
  user?: User | null;
  onNavigateToStudio?: () => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({ user, onNavigateToStudio }) => {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const [progression, setProgression] = useState<ProgressionTree | null>(null);
  const [skillsReport, setSkillsReport] = useState<SkillsReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    setProgression(null);
    setSkillsReport(null);

    Promise.all([
      api.getProgression("python-fundamentals").catch(() => null),
      api.getSkillsReport("python-fundamentals").catch(() => null),
    ])
      .then(([progRes, skillsRes]) => {
        if (!mounted) return;
        setProgression(progRes?.progression || null);
        setSkillsReport(skillsRes?.report || null);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  // Compute real mean BKT P(L) across all concepts in the learner's progression tree
  const meanPL = useMemo(() => {
    if (!progression) return 0;
    const allConcepts = progression.modules.flatMap((m) =>
      m.chapters.flatMap((c) => c.concepts || [])
    );
    if (allConcepts.length === 0) return 0;
    const sum = allConcepts.reduce((acc, cn) => acc + (cn.pMastery ?? 0), 0);
    return Number((sum / allConcepts.length).toFixed(3));
  }, [progression]);

  const activeModule = useMemo(() => {
    if (!progression) return null;
    return (
      progression.modules.find((m) => m.status === "IN_PROGRESS" || m.status === "UNLOCKED") ||
      progression.modules[0] ||
      null
    );
  }, [progression]);

  const percentComplete = progression?.summary.percentComplete ?? 0;
  const modulesCompleted = progression?.summary.modulesCompleted ?? 0;
  const modulesTotal = progression?.summary.modulesTotal ?? 10;

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Overview Card */}
      <div
        className={`rounded-2xl p-6 border shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-300 ${
          isLight
            ? "bg-white border-purple-900/10 shadow-[0_8px_30px_rgba(76,29,149,0.06)] text-slate-900"
            : "bg-[#111111] border-white/[0.08] text-white"
        }`}
      >
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/40 border border-indigo-800/40 text-indigo-300 text-xs font-semibold">
            <span>✦</span>
            <span>Flagship Track: Python Fundamentals</span>
          </div>
          <h2
            className={`text-2xl font-sans font-bold tracking-tight transition-colors duration-300 ${
              isLight ? "text-slate-900" : "text-white"
            }`}
          >
            Overall Curriculum Completion: {percentComplete}%
          </h2>
          <p
            className={`text-xs max-w-xl leading-relaxed transition-colors duration-300 ${
              isLight ? "text-slate-600" : "text-neutral-300"
            }`}
          >
            {progression
              ? `${progression.summary.sectionsCompleted} of ${progression.summary.sectionsTotal} sections and ${progression.summary.chaptersCompleted} of ${progression.summary.chaptersTotal} chapters completed. Bayesian Knowledge Tracing and rubric criteria update automatically as you study.`
              : "Enroll in Python Fundamentals to start tracking your live section progress, rubric evaluations, and Bayesian Knowledge Tracing mastery."}
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div
            className={`text-center p-4 rounded-xl border w-28 ${
              isLight ? "bg-purple-50/50 border-purple-100" : "bg-white/[0.04] border-white/[0.06]"
            }`}
          >
            <div className="text-2xl font-bold text-indigo-500">
              {modulesCompleted} / {modulesTotal}
            </div>
            <div className={`text-[10px] uppercase font-bold mt-0.5 ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
              Modules Clear
            </div>
          </div>
          <div
            className={`text-center p-4 rounded-xl border w-28 ${
              isLight ? "bg-purple-50/50 border-purple-100" : "bg-white/[0.04] border-white/[0.06]"
            }`}
          >
            <div className="text-2xl font-bold text-emerald-500">
              {progression ? meanPL.toFixed(3) : "0.000"}
            </div>
            <div className={`text-[10px] uppercase font-bold mt-0.5 ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
              Mean P(L)
            </div>
          </div>
          {skillsReport && (
            <div
              className={`text-center p-4 rounded-xl border w-28 ${
                isLight ? "bg-purple-50/50 border-purple-100" : "bg-white/[0.04] border-white/[0.06]"
              }`}
            >
              <div className="text-2xl font-bold text-violet-400">
                {Math.round(skillsReport.overallProgress.overallSkillScore * 100)}%
              </div>
              <div className={`text-[10px] uppercase font-bold mt-0.5 ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
                Skill Score
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Real Module Breakdown Grid */}
      <div className="space-y-3">
        <h3 className={`text-base font-bold transition-colors duration-300 ${isLight ? "text-slate-900" : "text-white"}`}>
          Module Knowledge States
        </h3>

        {isLoading ? (
          <div
            className={`rounded-xl p-8 border text-center text-xs ${
              isLight ? "bg-white border-purple-900/10 text-slate-500" : "bg-[#111111] border-white/[0.08] text-neutral-400"
            }`}
          >
            Loading live module telemetry...
          </div>
        ) : progression && progression.modules.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {progression.modules.map((mod) => {
              const totalSec = mod.chapters.reduce((s, c) => s + c.sections.length, 0);
              const doneSec = mod.chapters.reduce(
                (s, c) => s + c.sections.filter((sec) => sec.status === "COMPLETED").length,
                0
              );
              const modPct = totalSec > 0 ? Math.round((doneSec / totalSec) * 100) : 0;
              const modConcepts = mod.chapters.flatMap((c) => c.concepts || []);
              const statusLabel =
                mod.status === "COMPLETED"
                  ? "Mastered"
                  : mod.status === "IN_PROGRESS"
                  ? "In Progress"
                  : mod.status === "UNLOCKED"
                  ? "Unlocked"
                  : "Locked";

              return (
                <div
                  key={mod.id}
                  className={`rounded-xl p-5 border shadow-sm space-y-3 transition-all duration-300 ${
                    mod.status === "LOCKED" ? "opacity-70" : ""
                  } ${
                    isLight
                      ? "bg-white border-purple-900/10 shadow-[0_8px_30px_rgba(76,29,149,0.06)] text-slate-900"
                      : "bg-[#111111] border-white/[0.08] text-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-mono font-bold ${isLight ? "text-purple-700" : "text-neutral-400"}`}>
                      M{String(mod.sequenceOrder).padStart(2, "0")}
                    </span>
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                        mod.status === "COMPLETED"
                          ? "bg-emerald-950/40 text-emerald-400 border border-emerald-800/40"
                          : mod.status === "IN_PROGRESS"
                          ? "bg-amber-950/40 text-amber-400 border border-amber-800/40"
                          : mod.status === "UNLOCKED"
                          ? "bg-sky-950/40 text-sky-300 border border-sky-800/40"
                          : "bg-white/[0.06] text-neutral-400 border border-white/[0.06]"
                      }`}
                    >
                      {statusLabel}
                    </span>
                  </div>

                  <div>
                    <h4 className={`text-sm font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
                      {mod.title}
                    </h4>
                    <div className="flex items-center gap-3 mt-2">
                      <div className={`flex-1 h-2 rounded-full overflow-hidden ${isLight ? "bg-purple-100" : "bg-white/[0.08]"}`}>
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            mod.status === "COMPLETED"
                              ? "bg-emerald-500"
                              : mod.status === "IN_PROGRESS" || mod.status === "UNLOCKED"
                              ? "bg-[#5B4DF0]"
                              : "bg-neutral-600"
                          }`}
                          style={{ width: `${modPct}%` }}
                        />
                      </div>
                      <span className={`text-xs font-mono font-semibold ${isLight ? "text-slate-600" : "text-neutral-300"}`}>
                        {modPct}%
                      </span>
                    </div>
                    <p className={`text-[11px] mt-1 ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
                      {mod.chaptersCompleted}/{mod.totalChapters} chapters • {doneSec}/{totalSec} sections
                      {mod.practicalPassed ? " • Practical Passed ✓" : ""}
                    </p>
                  </div>

                  {modConcepts.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {modConcepts.slice(0, 4).map((cn) => (
                        <span
                          key={cn.id}
                          className={`text-[10px] px-2 py-0.5 rounded border ${
                            isLight
                              ? "bg-purple-100/60 text-purple-900 border-purple-200"
                              : "bg-white/[0.06] text-neutral-300 border-white/[0.06]"
                          }`}
                        >
                          {cn.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div
            className={`rounded-xl p-8 border text-center space-y-2 ${
              isLight ? "bg-white border-purple-900/10 text-slate-900" : "bg-[#111111] border-white/[0.08] text-white"
            }`}
          >
            <h4 className="text-sm font-bold">Not Enrolled Yet</h4>
            <p className={`text-xs ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
              Enroll in Python Fundamentals to unlock Module 01 and begin recording Bayesian mastery progress.
            </p>
          </div>
        )}
      </div>

      {onNavigateToStudio && activeModule && (
        <div
          className={`p-4 border rounded-xl flex items-center justify-between gap-4 transition-all duration-300 ${
            isLight
              ? "bg-white border-purple-900/10 shadow-sm text-slate-900"
              : "bg-[#111111] border-white/[0.08] text-white"
          }`}
        >
          <div>
            <h4 className={`text-xs font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
              Continue Active Module
            </h4>
            <p className={`text-[11px] ${isLight ? "text-slate-600" : "text-neutral-300"}`}>
              {activeModule.title} ({activeModule.chaptersCompleted}/{activeModule.totalChapters} chapters completed)
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
