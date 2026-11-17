import React, { useEffect, useState } from "react";
import type { User, ProgressionTree } from "../types/index.js";
import { useTheme } from "../context/ThemeContext.js";
import { api } from "../services/api.js";

interface CredentialsListViewProps {
  user?: User | null;
  onNavigate: (view: string) => void;
  onViewCredential: (credId: string) => void;
}

interface EarnedCertificateItem {
  id: string;
  credentialId: string;
  tier: string;
  compositeScore: number;
  status: string;
  issuedAt: string;
  recipientName: string;
  courseSlug: string;
  courseTitle: string;
}

export const CredentialsListView: React.FC<CredentialsListViewProps> = ({
  user,
  onNavigate,
  onViewCredential,
}) => {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const [filter, setFilter] = useState<"earned" | "in-progress">("earned");
  const [earnedCredentials, setEarnedCredentials] = useState<EarnedCertificateItem[]>([]);
  const [pythonProgression, setPythonProgression] = useState<ProgressionTree | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    setEarnedCredentials([]);
    setPythonProgression(null);

    Promise.all([
      api.getMyCertificates().catch(() => ({ certificates: [] })),
      api.getProgression("python-fundamentals").catch(() => null),
    ])
      .then(([certRes, progRes]) => {
        if (!mounted) return;
        setEarnedCredentials(certRes.certificates || []);
        setPythonProgression(progRes?.progression || null);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  const hasPythonCert = earnedCredentials.some((c) => c.courseSlug === "python-fundamentals");
  const inProgressTracks =
    pythonProgression && !hasPythonCert ? [pythonProgression] : [];

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-6" data-purpose="credentials-list-page">
      {/* Filter Tabs */}
      <section data-purpose="page-title-and-tabs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter("earned")}
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs transition-colors cursor-pointer ${
              filter === "earned"
                ? isLight
                  ? "bg-purple-600 text-white shadow-md font-bold"
                  : "bg-white text-[#15062B] shadow-md font-bold"
                : isLight
                ? "text-purple-950/70 hover:text-purple-950 hover:bg-white/40 font-medium"
                : "text-purple-200/80 hover:text-white hover:bg-white/10 font-medium"
            }`}
          >
            Earned
            <span
              className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                filter === "earned"
                  ? isLight
                    ? "bg-white text-purple-700"
                    : "bg-[#15062B] text-white"
                  : "bg-white/20 text-purple-200"
              }`}
            >
              {earnedCredentials.length}
            </span>
          </button>

          <button
            onClick={() => setFilter("in-progress")}
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs transition-colors cursor-pointer ${
              filter === "in-progress"
                ? isLight
                  ? "bg-purple-600 text-white shadow-md font-bold"
                  : "bg-white text-[#15062B] shadow-md font-bold"
                : isLight
                ? "text-purple-950/70 hover:text-purple-950 hover:bg-white/40 font-medium"
                : "text-purple-200/80 hover:text-white hover:bg-white/10 font-medium"
            }`}
          >
            In Progress
            <span
              className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                filter === "in-progress"
                  ? isLight
                    ? "bg-white text-purple-700"
                    : "bg-[#15062B] text-white"
                  : "bg-white/20 text-purple-200"
              }`}
            >
              {inProgressTracks.length}
            </span>
          </button>
        </div>
      </section>

      {/* Main Grid: 8 cols credentials + 4 cols right summary */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-7 items-start">
        {/* Left Column (8 cols) */}
        <div className="xl:col-span-8 space-y-5">
          {isLoading ? (
            <div
              className={`rounded-[14px] p-8 border text-center text-xs ${
                isLight
                  ? "bg-white border-purple-900/10 text-slate-500"
                  : "bg-[#111111] border-white/[0.08] text-neutral-400"
              }`}
            >
              Loading your verified credential ledger...
            </div>
          ) : filter === "earned" ? (
            earnedCredentials.length > 0 ? (
              earnedCredentials.map((cred) => (
                <article
                  key={cred.id}
                  className={`rounded-[14px] p-6 border transition-all space-y-4 ${
                    isLight
                      ? "bg-white border-purple-900/10 shadow-[0_8px_30px_rgba(76,29,149,0.06)] text-slate-900 hover:border-purple-300"
                      : "bg-[#111111] border-white/[0.08] shadow-xs hover:border-white/20 text-white"
                  }`}
                  data-purpose="credential-card"
                >
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="relative w-full sm:w-52 h-36 rounded-[10px] bg-gradient-to-br from-neutral-900 via-neutral-950 to-[#18112e] flex items-center justify-center shrink-0 overflow-hidden shadow-inner p-3 border border-white/[0.06]">
                      <span className="absolute top-2.5 left-2.5 bg-emerald-950/60 text-emerald-400 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wider border border-emerald-800/40">
                        {cred.status}
                      </span>
                      <div className="text-center text-white">
                        <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-amber-300">
                          CERTIFY
                        </span>
                        <h4 className="text-xs font-bold font-sans text-white mt-1">
                          {cred.courseTitle}
                        </h4>
                        <span className="text-[9px] text-neutral-400 font-mono mt-1 block">
                          {cred.credentialId}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h2
                            className={`text-lg font-bold tracking-tight font-sans ${
                              isLight ? "text-slate-900" : "text-white"
                            }`}
                          >
                            {cred.courseTitle}
                          </h2>
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-800/40 shrink-0">
                            ✓ Verified Active
                          </span>
                        </div>

                        <p className={`text-xs font-semibold ${isLight ? "text-purple-700" : "text-indigo-400"}`}>
                          {cred.tier} Tier • Composite Score {Math.round(cred.compositeScore * 100)}%
                        </p>
                        <p className={`text-[11px] mt-0.5 ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
                          Issued on {formatDate(cred.issuedAt)}
                        </p>
                      </div>

                      <div className={`pt-2 border-t flex items-center gap-3 ${isLight ? "border-purple-100" : "border-white/[0.08]"}`}>
                        <button
                          onClick={() => onViewCredential(cred.credentialId)}
                          className="bg-[#5B4DF0] hover:bg-[#4C3DE0] text-white px-4 py-1.5 rounded-[8px] text-xs font-semibold shadow-xs transition active:scale-98 cursor-pointer"
                        >
                          View Certificate →
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div
                className={`rounded-[14px] p-10 border text-center space-y-3 ${
                  isLight
                    ? "bg-white border-purple-900/10 text-slate-900 shadow-sm"
                    : "bg-[#111111] border-white/[0.08] text-white"
                }`}
              >
                <div className="w-12 h-12 mx-auto rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold">No Credentials Earned Yet</h3>
                <p className={`text-xs max-w-md mx-auto leading-relaxed ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                  Certificates are issued strictly upon completing all curriculum modules, passing
                  chapter checkpoints and practical tasks, and clearing the final evaluation.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => onNavigate("course-details")}
                    className="bg-[#5B4DF0] hover:bg-[#4C3DE0] text-white px-5 py-2 rounded-[8px] text-xs font-semibold cursor-pointer transition"
                  >
                    Continue Python Fundamentals →
                  </button>
                </div>
              </div>
            )
          ) : inProgressTracks.length > 0 ? (
            inProgressTracks.map((track) => (
              <article
                key={track.enrollmentId}
                className={`rounded-[14px] p-6 border space-y-4 ${
                  isLight
                    ? "bg-white border-purple-900/10 text-slate-900 shadow-sm"
                    : "bg-[#111111] border-white/[0.08] text-white"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                      Certification In Progress
                    </span>
                    <h2 className="text-lg font-bold mt-0.5">{track.course.title}</h2>
                    <p className={`text-xs mt-1 ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                      {track.summary.modulesCompleted}/{track.summary.modulesTotal} modules •{" "}
                      {track.summary.chaptersCompleted}/{track.summary.chaptersTotal} chapters •{" "}
                      {track.summary.sectionsCompleted}/{track.summary.sectionsTotal} sections completed
                    </p>
                  </div>
                  <span className="font-mono text-sm font-bold text-emerald-500">
                    {Math.round(track.summary.percentComplete)}%
                  </span>
                </div>

                <div className={`w-full h-2 rounded-full overflow-hidden ${isLight ? "bg-purple-100" : "bg-white/10"}`}>
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, track.summary.percentComplete))}%` }}
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className={`text-[11px] ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
                    Complete all {track.summary.modulesTotal} modules and practicals to unlock your credential.
                  </span>
                  <button
                    onClick={() => onNavigate("course-details")}
                    className="bg-[#5B4DF0] hover:bg-[#4C3DE0] text-white px-4 py-1.5 rounded-[8px] text-xs font-semibold cursor-pointer transition"
                  >
                    View Progress →
                  </button>
                </div>
              </article>
            ))
          ) : (
            <div
              className={`rounded-[14px] p-10 border text-center space-y-3 ${
                isLight
                  ? "bg-white border-purple-900/10 text-slate-900 shadow-sm"
                  : "bg-[#111111] border-white/[0.08] text-white"
              }`}
            >
              <h3 className="text-base font-bold">No Active Certification Tracks</h3>
              <p className={`text-xs max-w-md mx-auto ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                Enroll in Python Fundamentals to start tracking your progress toward an Ed25519 verified credential.
              </p>
              <button
                onClick={() => onNavigate("catalog")}
                className="bg-[#5B4DF0] hover:bg-[#4C3DE0] text-white px-5 py-2 rounded-[8px] text-xs font-semibold cursor-pointer transition"
              >
                Explore Courses →
              </button>
            </div>
          )}
        </div>

        {/* Right Column (4 cols): Real Ledger Summary */}
        <aside className="xl:col-span-4 space-y-5">
          <div
            className={`rounded-[14px] p-5 border space-y-4 transition-all duration-300 ${
              isLight
                ? "bg-white border-purple-900/10 shadow-[0_8px_30px_rgba(76,29,149,0.06)] text-slate-900"
                : "bg-[#111111] border-white/[0.08] shadow-xs text-white"
            }`}
          >
            <h3 className={`text-xs font-bold tracking-wide uppercase ${isLight ? "text-slate-900" : "text-white"}`}>
              Credential Ledger
            </h3>
            <div className="space-y-3 text-xs">
              <div
                className={`p-3 rounded-[8px] border space-y-1 ${
                  isLight ? "bg-purple-50/50 border-purple-100" : "bg-white/[0.04] border-white/[0.06]"
                }`}
              >
                <span className={`text-[10px] uppercase font-bold ${isLight ? "text-purple-700" : "text-neutral-400"}`}>
                  Total Earned
                </span>
                <p className={`text-lg font-bold font-sans ${isLight ? "text-slate-900" : "text-white"}`}>
                  {earnedCredentials.length}{" "}
                  {earnedCredentials.length === 1 ? "Verified Credential" : "Verified Credentials"}
                </p>
              </div>

              <div
                className={`p-3 rounded-[8px] border space-y-1 ${
                  isLight ? "bg-purple-50/50 border-purple-100" : "bg-white/[0.04] border-white/[0.06]"
                }`}
              >
                <span className={`text-[10px] uppercase font-bold ${isLight ? "text-purple-700" : "text-neutral-400"}`}>
                  Integrity Policy
                </span>
                <p className="text-xs font-semibold text-emerald-500">
                  100% Deterministic Evidence Backed
                </p>
                <p className={`text-[11px] leading-relaxed ${isLight ? "text-slate-600" : "text-neutral-300"}`}>
                  Certificates are cryptographically signed with Ed25519 only after all required
                  modules, checkpoints, practicals, and final assessments are verified on the backend.
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigate("catalog")}
              className="w-full bg-[#5B4DF0] hover:bg-[#4C3DE0] text-white rounded-[8px] py-2 px-3 text-xs font-semibold transition cursor-pointer"
            >
              Explore Courses →
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};
