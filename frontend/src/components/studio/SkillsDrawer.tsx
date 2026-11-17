import React, { useEffect, useState } from "react";
import { X, TrendingUp, AlertTriangle, Brain, ShieldCheck, Loader2 } from "lucide-react";
import { api } from "../../services/api.js";
import type { SkillsReport } from "../../types/index.js";

interface SkillsDrawerProps {
  courseSlug: string;
  onClose: () => void;
  onJumpToChapter?: (chapterId: string) => void;
}

export const SkillsDrawer: React.FC<SkillsDrawerProps> = ({
  courseSlug,
  onClose,
  onJumpToChapter,
}) => {
  const [report, setReport] = useState<SkillsReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api
      .getSkillsReport(courseSlug)
      .then((res) => {
        if (mounted) setReport(res.report);
      })
      .catch((err: any) => {
        if (mounted) setError(err?.message || "Could not load skill telemetry.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [courseSlug]);

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-lg h-full overflow-y-auto bg-[#0c0c10] border-l border-white/[0.1] p-5 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-violet-400 font-semibold">
              Deterministic Backend Telemetry
            </div>
            <h2 className="text-base font-semibold text-white">
              Performance, Strengths &amp; Weakpoints
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-zinc-400 text-xs gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Computing rubric &amp; BKT profile...
          </div>
        ) : error || !report ? (
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 text-xs text-zinc-400">
            {error || "Enroll and complete sections to generate your rubric-verified skill profile."}
          </div>
        ) : (
          <>
            {/* Overview Stats */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
                <div className="text-[10px] text-zinc-500 uppercase">Progress</div>
                <div className="text-lg font-bold text-white font-mono">
                  {report.overallProgress.percentComplete}%
                </div>
                <div className="text-[10px] text-zinc-400">
                  {report.overallProgress.modulesCompleted}/{report.overallProgress.modulesTotal} Modules
                </div>
              </div>
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
                <div className="text-[10px] text-zinc-500 uppercase">Skill Score</div>
                <div className="text-lg font-bold text-emerald-400 font-mono">
                  {Math.round(report.overallProgress.overallSkillScore * 100)}%
                </div>
                <div className="text-[10px] text-zinc-400">
                  Tier: {report.overallProgress.currentTier}
                </div>
              </div>
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
                <div className="text-[10px] text-zinc-500 uppercase">Focus Guard</div>
                <div className="text-lg font-bold text-violet-300 font-mono">
                  {report.driftSummary.totalDriftEvents}
                </div>
                <div className="text-[10px] text-zinc-400">Topic Redirects</div>
              </div>
            </div>

            {/* Strengths */}
            <section className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                <TrendingUp className="w-3.5 h-3.5" />
                Verified Strengths ({report.strengths.length})
              </div>
              {report.strengths.length === 0 ? (
                <p className="text-xs text-zinc-500">
                  Pass ≥ 2 rubric criteria with ≥ 80% score and 0 misconceptions in a skill domain to establish a verified strength.
                </p>
              ) : (
                report.strengths.map((s) => (
                  <div
                    key={s.skillDimensionId}
                    className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-3 space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-emerald-200">
                      <span>{s.skillName}</span>
                      <span className="font-mono">{Math.round(s.compositeScore * 100)}%</span>
                    </div>
                    <div className="text-[11px] text-zinc-400">{s.evidenceSummary}</div>
                  </div>
                ))
              )}
            </section>

            {/* Weakpoints */}
            <section className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-400">
                <AlertTriangle className="w-3.5 h-3.5" />
                Detected Weakpoints ({report.weakpoints.length})
              </div>
              {report.weakpoints.length === 0 ? (
                <p className="text-xs text-zinc-500">
                  No weakpoints flagged yet. Misconceptions or scores below 65% appear here with targeted remediation links.
                </p>
              ) : (
                report.weakpoints.map((w) => (
                  <div
                    key={w.skillDimensionId}
                    className="rounded-xl border border-rose-500/25 bg-rose-500/5 p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-rose-200">
                      <span>{w.skillName}</span>
                      <span className="font-mono">{Math.round(w.compositeScore * 100)}%</span>
                    </div>
                    <div className="text-[11px] text-zinc-400">{w.evidenceSummary}</div>
                    {w.weakestCriteria.map((wc) => (
                      <div
                        key={wc.criterionId}
                        className="rounded-lg bg-black/30 p-2 text-[11px] text-zinc-300 flex items-start justify-between gap-2"
                      >
                        <div>
                          <div>{wc.statement}</div>
                          {wc.lastMisconception && (
                            <div className="text-[10px] text-rose-400 font-mono mt-0.5">
                              Misconception: {wc.lastMisconception}
                            </div>
                          )}
                        </div>
                        {onJumpToChapter && (
                          <button
                            type="button"
                            onClick={() => {
                              onJumpToChapter(wc.chapterId);
                              onClose();
                            }}
                            className="shrink-0 text-[10px] text-violet-300 hover:underline cursor-pointer"
                          >
                            Review
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ))
              )}
            </section>

            {/* Cognitive Breakdown */}
            <section className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
                <Brain className="w-3.5 h-3.5 text-violet-400" />
                Cognitive Skill Profile
              </div>
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 space-y-2">
                {Object.entries(report.cognitiveBreakdown).map(([level, stat]) => {
                  const pct = stat.score != null ? Math.round(stat.score * 100) : 0;
                  return (
                    <div key={level} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-mono text-zinc-300">{level}</span>
                        <span className="text-zinc-400">
                          {stat.evaluatedCount > 0 ? `${pct}% (${stat.evaluatedCount} criteria)` : "Unassessed"}
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            pct >= 80
                              ? "bg-emerald-400"
                              : pct >= 65
                              ? "bg-violet-400"
                              : stat.evaluatedCount > 0
                              ? "bg-rose-400"
                              : "bg-zinc-700"
                          }`}
                          style={{ width: `${stat.evaluatedCount > 0 ? Math.max(pct, 6) : 0}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* All Developing / Unassessed Dimensions */}
            <section className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300">
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
                Curriculum Skill Dimensions ({report.developing.length + report.unassessed.length} In Progress / Upcoming)
              </div>
              <div className="space-y-1.5">
                {[...report.developing, ...report.unassessed].map((d) => (
                  <div
                    key={d.skillDimensionId}
                    className="rounded-lg border border-white/[0.06] bg-white/[0.015] px-3 py-2 flex items-center justify-between text-xs"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="text-zinc-200 font-medium truncate">{d.skillName}</div>
                      <div className="text-[10px] text-zinc-500">
                        {d.criteriaEvaluated}/{d.criteriaTotal} criteria evaluated
                      </div>
                    </div>
                    <span className="font-mono text-[11px] text-zinc-400 shrink-0">
                      {d.criteriaEvaluated > 0 ? `${Math.round(d.compositeScore * 100)}%` : "Locked"}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};
