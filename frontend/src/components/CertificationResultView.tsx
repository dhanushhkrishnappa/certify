import React, { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext.js";
import { api } from "../services/api.js";
import type { ProgressionTree, SkillsReport } from "../types/index.js";

interface CertificationResultViewProps {
  courseSlug: string;
  onNavigate: (view: string) => void;
  onViewCredential?: (credId: string) => void;
  onReturnDashboard?: () => void;
}

export const CertificationResultView: React.FC<CertificationResultViewProps> = ({
  courseSlug,
  onNavigate,
  onViewCredential,
  onReturnDashboard,
}) => {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const [progression, setProgression] = useState<ProgressionTree | null>(null);
  const [skillsReport, setSkillsReport] = useState<SkillsReport | null>(null);
  const [certificate, setCertificate] = useState<{
    credentialId: string;
    tier: string;
    compositeScore: number;
    issuedAt: string;
    courseTitle: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    Promise.all([
      api.getProgression(courseSlug).catch(() => null),
      api.getSkillsReport(courseSlug).catch(() => null),
      api.getMyCertificates().catch(() => ({ certificates: [] })),
    ])
      .then(([progRes, skillsRes, certRes]) => {
        if (!mounted) return;
        setProgression(progRes?.progression || null);
        setSkillsReport(skillsRes?.report || null);
        const match = (certRes.certificates || []).find((c) => c.courseSlug === courseSlug) || null;
        setCertificate(match);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [courseSlug]);

  if (isLoading) {
    return (
      <div className="py-16 text-center text-xs text-neutral-400">
        Loading your verified certification result...
      </div>
    );
  }

  if (!certificate) {
    const pct = progression ? Math.round(progression.summary.percentComplete) : 0;
    const modsDone = progression?.summary.modulesCompleted ?? 0;
    const modsTotal = progression?.summary.modulesTotal ?? 10;
    const chDone = progression?.summary.chaptersCompleted ?? 0;
    const chTotal = progression?.summary.chaptersTotal ?? 29;
    const pracDone = progression
      ? progression.modules.filter((m) => m.practicalPassed).length
      : 0;

    return (
      <div className="max-w-2xl mx-auto py-12 space-y-6">
        <div
          className={`p-8 rounded-2xl border space-y-5 ${
            isLight
              ? "bg-white border-purple-900/10 text-slate-900 shadow-sm"
              : "bg-[#111111] border-white/[0.08] text-white"
          }`}
        >
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
              Certification Not Yet Earned
            </span>
            <h1 className="text-2xl font-bold mt-1">
              {progression?.course.title || "Python Fundamentals"}
            </h1>
            <p className={`text-xs mt-1 leading-relaxed ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
              Your verified credential will be issued automatically once all course requirements are
              completed and verified on the backend.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span>Overall Course Progress</span>
              <span className="font-mono">{pct}%</span>
            </div>
            <div className={`w-full h-2 rounded-full overflow-hidden ${isLight ? "bg-purple-100" : "bg-white/10"}`}>
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className={`p-3 rounded-xl border ${isLight ? "bg-purple-50/50 border-purple-100" : "bg-white/[0.03] border-white/[0.07]"}`}>
              <div className="text-base font-bold font-mono">{modsDone}/{modsTotal}</div>
              <div className="text-[10px] text-neutral-400 mt-0.5">Modules</div>
            </div>
            <div className={`p-3 rounded-xl border ${isLight ? "bg-purple-50/50 border-purple-100" : "bg-white/[0.03] border-white/[0.07]"}`}>
              <div className="text-base font-bold font-mono">{chDone}/{chTotal}</div>
              <div className="text-[10px] text-neutral-400 mt-0.5">Chapters</div>
            </div>
            <div className={`p-3 rounded-xl border ${isLight ? "bg-purple-50/50 border-purple-100" : "bg-white/[0.03] border-white/[0.07]"}`}>
              <div className="text-base font-bold font-mono">{pracDone}/{modsTotal}</div>
              <div className="text-[10px] text-neutral-400 mt-0.5">Practicals</div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate("course-details")}
              className="px-5 py-2.5 rounded-lg bg-[#5B4DF0] hover:bg-[#4C3DE0] text-white text-xs font-semibold cursor-pointer"
            >
              Return to Course Progress →
            </button>
            {onReturnDashboard && (
              <button
                onClick={onReturnDashboard}
                className={`px-4 py-2.5 rounded-lg text-xs font-semibold border cursor-pointer ${
                  isLight ? "border-slate-300 text-slate-700" : "border-white/15 text-neutral-300"
                }`}
              >
                Dashboard
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">
      <div
        className={`p-8 rounded-2xl border space-y-5 ${
          isLight
            ? "bg-white border-purple-900/10 text-slate-900 shadow-sm"
            : "bg-[#111111] border-white/[0.08] text-white"
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
              ✓ Certified • {certificate.tier} Tier
            </span>
            <h1 className="text-2xl font-bold mt-2">{certificate.courseTitle}</h1>
            <p className="text-xs font-mono text-neutral-400 mt-1">
              Credential ID: {certificate.credentialId}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black font-mono text-emerald-400">
              {Math.round(certificate.compositeScore * 100)}%
            </div>
            <div className="text-[10px] uppercase tracking-wider text-neutral-400">
              Composite Score
            </div>
          </div>
        </div>

        {skillsReport && (
          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className={`p-3 rounded-xl border ${isLight ? "bg-purple-50/50 border-purple-100" : "bg-white/[0.03] border-white/[0.07]"}`}>
              <div className="text-base font-bold text-emerald-400">{skillsReport.strengths.length}</div>
              <div className="text-[10px] text-neutral-400">Strong Skills</div>
            </div>
            <div className={`p-3 rounded-xl border ${isLight ? "bg-purple-50/50 border-purple-100" : "bg-white/[0.03] border-white/[0.07]"}`}>
              <div className="text-base font-bold font-mono">
                {Math.round(skillsReport.overallProgress.overallSkillScore * 100)}%
              </div>
              <div className="text-[10px] text-neutral-400">Skill Score</div>
            </div>
            <div className={`p-3 rounded-xl border ${isLight ? "bg-purple-50/50 border-purple-100" : "bg-white/[0.03] border-white/[0.07]"}`}>
              <div className="text-base font-bold font-mono">
                {skillsReport.overallProgress.modulesCompleted}/{skillsReport.overallProgress.modulesTotal}
              </div>
              <div className="text-[10px] text-neutral-400">Modules Cleared</div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={() =>
              onViewCredential
                ? onViewCredential(certificate.credentialId)
                : onNavigate("credential-details")
            }
            className="px-5 py-2.5 rounded-lg bg-[#5B4DF0] hover:bg-[#4C3DE0] text-white text-xs font-semibold cursor-pointer"
          >
            View Official Certificate →
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(certificate.credentialId);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className={`px-4 py-2.5 rounded-lg text-xs font-semibold border cursor-pointer ${
              isLight ? "border-slate-300 text-slate-700" : "border-white/15 text-neutral-300"
            }`}
          >
            {copied ? "Copied!" : "Copy Credential ID"}
          </button>
        </div>
      </div>
    </div>
  );
};
