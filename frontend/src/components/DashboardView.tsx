import React, { useEffect, useState, useMemo } from "react";
import type {
  User,
  CourseCatalogItem,
  LearningSessionContext,
  ProgressionTree,
  SkillsReport,
} from "../types/index.js";
import { api } from "../services/api.js";
import { useTheme } from "../context/ThemeContext.js";
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  Terminal,
  ArrowRight,
  BookOpen,
  ExternalLink,
  Check,
  TrendingUp,
  Cpu,
  Copy,
  CheckCheck,
  Sparkles,
} from "lucide-react";

interface DashboardViewProps {
  user?: User | null;
  onContinueCourse: (slug: string) => void;
  onViewCourseDetails: (slug: string) => void;
  onNavigate: (view: string) => void;
}

interface IssuedCertificate {
  id: string;
  credentialId: string;
  tier: string;
  compositeScore: number;
  status: string;
  issuedAt: string;
  evidenceSummary?: string;
  signatureHash?: string;
  recipientName: string;
}

const cleanTitle = (t?: string | null) => (t ? t.replace(/^\*+\s*/, "").trim() : "");

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  onContinueCourse,
  onViewCourseDetails,
  onNavigate,
}) => {
  const { isLight } = useTheme();
  const [courses, setCourses] = useState<CourseCatalogItem[]>([]);
  const [sessionContext, setSessionContext] = useState<LearningSessionContext | null>(null);
  const [progression, setProgression] = useState<ProgressionTree | null>(null);
  const [skillsReport, setSkillsReport] = useState<SkillsReport | null>(null);
  const [certificates, setCertificates] = useState<IssuedCertificate[]>([]);
  const [copiedCertId, setCopiedCertId] = useState(false);

  const activeSlug = "python-fundamentals";

  useEffect(() => {
    let mounted = true;
    setSessionContext(null);
    setProgression(null);
    setSkillsReport(null);
    setCertificates([]);

    Promise.all([
      api.listCourses().catch(() => ({ courses: [] })),
      api.getSessionContext(activeSlug).catch(() => null),
      api.getProgression(activeSlug).catch(() => null),
      api.getSkillsReport(activeSlug).catch(() => null),
      api.getMyCertificates().catch(() => ({ certificates: [] })),
    ]).then(([courseData, sessionData, progData, skillsData, certData]) => {
      if (!mounted) return;
      setCourses(courseData.courses || []);
      setSessionContext(sessionData);
      setProgression(progData?.progression || null);
      setSkillsReport(skillsData?.report || null);
      setCertificates((certData.certificates as IssuedCertificate[]) || []);
    });

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  const activeCourse = courses.find((c) => c.slug === activeSlug) || courses[0];
  const primaryCertificate = certificates[0] || null;
  const hasCertificate = certificates.length > 0;

  // Resolve active chapter from progression tree
  const activeLesson = useMemo(() => {
    if (!progression) return null;
    for (const mod of progression.modules) {
      for (const ch of mod.chapters) {
        if (
          ch.status === "IN_PROGRESS" ||
          ch.status === "AWAITING_CHECKPOINT" ||
          ch.status === "REMEDIATING" ||
          ch.status === "UNLOCKED"
        ) {
          const totalSec = ch.sections.length;
          const doneSec = ch.sections.filter((s) => s.status === "COMPLETED").length;
          return {
            moduleTitle: mod.title,
            chapterTitle: cleanTitle(ch.title),
            chapterOrder: ch.sequenceOrder,
            status: ch.status,
            sectionsDone: doneSec,
            sectionsTotal: totalSec,
            chapterPct: totalSec > 0 ? Math.round((doneSec / totalSec) * 100) : 0,
          };
        }
      }
    }
    return null;
  }, [progression]);

  // Telemetry computations
  const totalModules = progression?.summary.modulesTotal ?? activeCourse?.moduleCount ?? 10;
  const completedModules = progression?.summary.modulesCompleted ?? 0;
  const totalChapters = progression?.summary.chaptersTotal ?? activeCourse?.chapterCount ?? 29;
  const completedChapters = progression?.summary.chaptersCompleted ?? 0;
  const totalSections = progression?.summary.sectionsTotal ?? 126;
  const completedSections = progression?.summary.sectionsCompleted ?? 0;
  const practicalsPassed = progression
    ? progression.modules.filter((m) => m.practicalPassed).length
    : 0;

  const conceptMasteries = sessionContext?.conceptMasteries || [];
  const totalConcepts = conceptMasteries.length || 33;
  const masteredConcepts = conceptMasteries.filter(
    (c) => c.status === "ADVANCED" || (c.pMastery ?? c.pKnown ?? 0) >= 0.85
  ).length;

  const percentComplete = progression ? Math.round(progression.summary.percentComplete) : 0;
  const skillScorePct = skillsReport
    ? Math.round(skillsReport.overallProgress.overallSkillScore * 100)
    : 0;
  const conceptsPct = totalConcepts > 0 ? Math.round((masteredConcepts / totalConcepts) * 100) : 0;

  const allChaptersCompleted = totalChapters > 0 && completedChapters >= totalChapters;
  const allPracticalsCompleted = totalModules > 0 && practicalsPassed >= totalModules;
  const isFullyCertified = hasCertificate || (allChaptersCompleted && allPracticalsCompleted);

  const topStrength = skillsReport?.strengths[0] || null;
  const topWeakpoint = skillsReport?.weakpoints[0] || null;
  const assessedEntries = [
    ...(skillsReport?.strengths || []),
    ...(skillsReport?.developing || []),
    ...(skillsReport?.weakpoints || []),
  ];

  const handleCopyCredentialId = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedCertId(true);
    setTimeout(() => setCopiedCertId(false), 2000);
  };

  const learnerDisplayName = user?.fullName || user?.name || "Learner";

  return (
    <div className="space-y-6 pb-12" data-purpose="main-dashboard-body">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* ========================================================= */}
        {/* LEFT 8-COLUMN CONTENT AREA                                */}
        {/* ========================================================= */}
        <div className="xl:col-span-8 space-y-6">
          {/* HERO TRACK CARD */}
          <section
            aria-label="Active Track Overview"
            className={`rounded-2xl p-7 md:p-8 relative overflow-hidden border transition-all duration-300 ${
              isLight
                ? "bg-white text-slate-900 border-slate-200/90 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.06)]"
                : "bg-gradient-to-b from-[#111116] to-[#0c0c10] text-white border-white/[0.08] shadow-[0_4px_24px_-4px_rgba(0,0,0,0.6)]"
            }`}
          >
            {/* Subtle Architectural Geometry Background (No noisy blobs) */}
            <div
              className={`absolute top-0 right-0 w-80 h-full pointer-events-none select-none opacity-[0.035] ${
                isLight ? "invert" : ""
              }`}
            >
              <svg className="w-full h-full" viewBox="0 0 200 200" fill="none">
                <circle cx="160" cy="40" r="120" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
                <circle cx="160" cy="40" r="80" stroke="currentColor" strokeWidth="1" />
                <circle cx="160" cy="40" r="40" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
                <path d="M40 40 L160 40 L160 160" stroke="currentColor" strokeWidth="1" strokeDasharray="6 6" />
              </svg>
            </div>

            <div className="relative z-10">
              {/* Header Meta Strip */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div
                  className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-[11px] font-mono tracking-wider uppercase font-semibold ${
                    isFullyCertified
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
                      : isLight
                      ? "bg-indigo-50 text-indigo-700 border border-indigo-200/80"
                      : "bg-white/[0.06] text-slate-300 border border-white/[0.1]"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isFullyCertified ? "bg-emerald-400" : "bg-emerald-400 animate-pulse"
                    }`}
                  />
                  <span>
                    {isFullyCertified
                      ? "Accreditation Conferred • Advanced Tier"
                      : progression
                      ? "Active Qualification Track"
                      : "Flagship Curriculum"}
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-[11px] font-mono opacity-60">
                  <span className={isLight ? "text-slate-600" : "text-neutral-400"}>STANDARD: RFC 8032</span>
                  <span>•</span>
                  <span className={isLight ? "text-slate-600" : "text-neutral-400"}>ED25519</span>
                </div>
              </div>

              {/* Title & Editorial Description */}
              <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight mb-2.5 leading-tight">
                {activeCourse?.title || "Python Fundamentals & Runtime Architecture"}
              </h1>
              <p
                className={`text-xs sm:text-sm max-w-2xl font-sans leading-relaxed mb-6 ${
                  isLight ? "text-slate-600" : "text-neutral-300/90"
                }`}
              >
                Comprehensive evaluation covering runtime memory topologies, object references, mutable
                data structures, and rigorous algorithmic problem solving under Socratic assessment.
              </p>

              {/* Curriculum Telemetry Badges */}
              <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono mb-6">
                <div
                  className={`px-3 py-1.5 rounded-lg border ${
                    isLight
                      ? "bg-slate-50 text-slate-700 border-slate-200"
                      : "bg-white/[0.03] text-neutral-300 border-white/[0.08]"
                  }`}
                >
                  <span className="font-semibold">{completedModules}</span>
                  <span className="opacity-50">/{totalModules}</span> Modules
                </div>
                <div
                  className={`px-3 py-1.5 rounded-lg border ${
                    isLight
                      ? "bg-slate-50 text-slate-700 border-slate-200"
                      : "bg-white/[0.03] text-neutral-300 border-white/[0.08]"
                  }`}
                >
                  <span className="font-semibold">{completedChapters}</span>
                  <span className="opacity-50">/{totalChapters}</span> Chapters
                </div>
                <div
                  className={`px-3 py-1.5 rounded-lg border ${
                    isLight
                      ? "bg-slate-50 text-slate-700 border-slate-200"
                      : "bg-white/[0.03] text-neutral-300 border-white/[0.08]"
                  }`}
                >
                  <span className="font-semibold">{completedSections}</span>
                  <span className="opacity-50">/{totalSections}</span> Sections
                </div>
                <div
                  className={`px-3 py-1.5 rounded-lg border ${
                    isLight
                      ? "bg-slate-50 text-slate-700 border-slate-200"
                      : "bg-white/[0.03] text-neutral-300 border-white/[0.08]"
                  }`}
                >
                  <span className="font-semibold">{practicalsPassed}</span>
                  <span className="opacity-50">/{totalModules}</span> Practicals
                </div>
              </div>

              {/* Precision Progress Rail */}
              <div className="space-y-2 mb-7 max-w-xl">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className={`text-[11px] tracking-wider uppercase font-semibold ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
                    Curriculum Progression
                  </span>
                  <span className="font-bold text-emerald-400">
                    {percentComplete}%{" "}
                    <span className={`font-normal text-[11px] ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
                      {percentComplete === 100 ? "Fulfilled" : "Completed"}
                    </span>
                  </span>
                </div>
                <div
                  className={`w-full rounded-full h-2 overflow-hidden border ${
                    isLight
                      ? "bg-slate-100 border-slate-200"
                      : "bg-black/40 border-white/[0.06]"
                  }`}
                >
                  <div
                    className="bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 h-full rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${percentComplete}%` }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => onContinueCourse(activeSlug)}
                  className={`px-5 py-2.5 rounded-lg font-semibold text-xs flex items-center space-x-2 transition-all shadow-sm active:scale-98 cursor-pointer ${
                    isLight
                      ? "bg-slate-950 hover:bg-slate-800 text-white"
                      : "bg-white hover:bg-neutral-100 text-slate-950"
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>
                    {isFullyCertified
                      ? "Launch Socratic AI Sandbox"
                      : progression
                      ? "Continue Socratic Learning"
                      : "Enroll & Start Track"}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-70" />
                </button>

                <button
                  onClick={() => onViewCourseDetails(activeSlug)}
                  className={`px-4 py-2.5 rounded-lg font-medium text-xs flex items-center space-x-2 transition-all active:scale-98 cursor-pointer border ${
                    isLight
                      ? "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
                      : "bg-white/[0.05] hover:bg-white/[0.09] text-neutral-200 border-white/[0.12]"
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 opacity-70" />
                  <span>Syllabus & Rubrics</span>
                </button>

                {hasCertificate && (
                  <button
                    onClick={() => onNavigate("credentials")}
                    className={`px-4 py-2.5 rounded-lg font-medium text-xs flex items-center space-x-2 transition-all active:scale-98 cursor-pointer border ${
                      isLight
                        ? "bg-amber-50/80 hover:bg-amber-100/80 text-amber-900 border-amber-300"
                        : "bg-amber-500/10 hover:bg-amber-500/15 text-amber-300 border-amber-500/25"
                    }`}
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>View Issued Certificate</span>
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* ACTIVE MISSION CONTROL / FOCUS STATION */}
          <section
            aria-label="Current Mission Station"
            className={`rounded-2xl p-6 sm:p-7 border transition-all duration-300 ${
              isLight
                ? "bg-white border-slate-200/90 text-slate-900 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.06)]"
                : "bg-gradient-to-b from-[#111116] to-[#0c0c10] border-white/[0.08] text-white shadow-[0_4px_24px_-4px_rgba(0,0,0,0.6)]"
            }`}
          >
            {isFullyCertified ? (
              /* State 1: Fully Cleared & Certified */
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-start space-x-4">
                  <div
                    className={`p-3 rounded-xl border shrink-0 ${
                      isLight
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                    }`}
                  >
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-emerald-400">
                        Qualification Complete • Mastered
                      </span>
                      <span className="text-neutral-500">•</span>
                      <span className="text-[11px] font-mono text-neutral-400">126/126 Sections</span>
                    </div>
                    <h3 className="font-serif text-xl font-normal tracking-tight">
                      Python Fundamentals Accreditation Earned
                    </h3>
                    <p
                      className={`text-xs max-w-xl leading-relaxed ${
                        isLight ? "text-slate-600" : "text-neutral-400"
                      }`}
                    >
                      All 10 modules, 29 chapters, and practical engineering tasks have been verified.
                      Your credential is cryptographically anchored. You can continue practicing in the AI
                      sandbox or inspect your verified docket.
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <button
                    onClick={() => onContinueCourse(activeSlug)}
                    className={`font-semibold text-xs px-4 py-2.5 rounded-lg flex items-center space-x-2 transition-all active:scale-98 cursor-pointer ${
                      isLight
                        ? "bg-slate-950 hover:bg-slate-800 text-white"
                        : "bg-white hover:bg-neutral-100 text-slate-950"
                    }`}
                  >
                    <span>Practice Session</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onNavigate("credentials")}
                    className={`font-medium text-xs px-4 py-2.5 rounded-lg flex items-center space-x-1.5 transition-all active:scale-98 cursor-pointer border ${
                      isLight
                        ? "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                        : "bg-white/[0.05] hover:bg-white/[0.09] text-neutral-300 border-white/[0.1]"
                    }`}
                  >
                    <span>Inspect</span>
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </button>
                </div>
              </div>
            ) : activeLesson ? (
              /* State 2: Active Chapter In-Progress */
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center space-x-2.5 flex-wrap">
                    <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-neutral-400">
                      {activeLesson.moduleTitle}
                    </span>
                    <span className="text-neutral-500">•</span>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-full">
                      {activeLesson.status.replace(/_/g, " ")}
                    </span>
                  </div>

                  <h3 className="font-serif text-xl font-normal tracking-tight">
                    {activeLesson.chapterTitle}
                  </h3>

                  <div className="flex items-center space-x-3 pt-1 max-w-sm">
                    <div
                      className={`w-40 rounded-full h-1.5 overflow-hidden ${
                        isLight ? "bg-slate-200" : "bg-white/10"
                      }`}
                    >
                      <div
                        className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${activeLesson.chapterPct}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-mono text-neutral-400">
                      {activeLesson.sectionsDone}/{activeLesson.sectionsTotal} sections ({activeLesson.chapterPct}%)
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onContinueCourse(activeSlug)}
                  className={`font-semibold text-xs px-5 py-2.5 rounded-lg flex items-center space-x-2 transition-all active:scale-98 cursor-pointer shrink-0 ${
                    isLight
                      ? "bg-slate-950 hover:bg-slate-800 text-white"
                      : "bg-white hover:bg-neutral-100 text-slate-950"
                  }`}
                >
                  <span>Resume Lesson</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              /* State 3: Not Enrolled */
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-serif text-lg font-normal tracking-tight">
                    Ready to begin Python Fundamentals?
                  </h3>
                  <p className={`text-xs mt-1 ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                    Enroll to unlock Module 01, Lesson 1 and begin building verified Socratic mastery.
                  </p>
                </div>
                <button
                  onClick={() => onViewCourseDetails(activeSlug)}
                  className={`font-semibold text-xs px-4 py-2.5 rounded-lg flex items-center space-x-2 transition-all active:scale-98 cursor-pointer shrink-0 ${
                    isLight
                      ? "bg-slate-950 hover:bg-slate-800 text-white"
                      : "bg-white hover:bg-neutral-100 text-slate-950"
                  }`}
                >
                  <span>Open Syllabus</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </section>

          {/* TELEMETRY & MASTERY GRID (4 STAT TILES) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Tile 1: Sections */}
            <div
              className={`p-5 rounded-2xl border transition-all duration-200 ${
                isLight
                  ? "bg-white border-slate-200/90 shadow-sm"
                  : "bg-gradient-to-b from-[#111116] to-[#0c0c10] border-white/[0.08] shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                  Curriculum
                </span>
                <BookOpen className="w-4 h-4 text-neutral-400" />
              </div>
              <div className="text-2xl font-mono font-bold tracking-tight mb-1">
                {completedSections}
                <span className="text-xs font-normal opacity-50 ml-1">/{totalSections}</span>
              </div>
              <p className={`text-[11px] ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
                Sections Cleared ({percentComplete}%)
              </p>
            </div>

            {/* Tile 2: Demonstrated Mastery */}
            <div
              className={`p-5 rounded-2xl border transition-all duration-200 ${
                isLight
                  ? "bg-white border-slate-200/90 shadow-sm"
                  : "bg-gradient-to-b from-[#111116] to-[#0c0c10] border-white/[0.08] shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                  Mastery
                </span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-mono font-bold tracking-tight text-emerald-400 mb-1">
                {skillScorePct}%
              </div>
              <p className={`text-[11px] ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
                BKT Composite Score
              </p>
            </div>

            {/* Tile 3: Practicals Passed */}
            <div
              className={`p-5 rounded-2xl border transition-all duration-200 ${
                isLight
                  ? "bg-white border-slate-200/90 shadow-sm"
                  : "bg-gradient-to-b from-[#111116] to-[#0c0c10] border-white/[0.08] shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                  Practicals
                </span>
                <Cpu className="w-4 h-4 text-neutral-400" />
              </div>
              <div className="text-2xl font-mono font-bold tracking-tight mb-1">
                {practicalsPassed}
                <span className="text-xs font-normal opacity-50 ml-1">/{totalModules}</span>
              </div>
              <p className={`text-[11px] ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
                Zero-Defect Benchmarks
              </p>
            </div>

            {/* Tile 4: Credentials */}
            <div
              className={`p-5 rounded-2xl border transition-all duration-200 ${
                isLight
                  ? "bg-white border-slate-200/90 shadow-sm"
                  : "bg-gradient-to-b from-[#111116] to-[#0c0c10] border-white/[0.08] shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                  Credentials
                </span>
                <Award className={`w-4 h-4 ${hasCertificate ? (isLight ? "text-amber-600" : "text-amber-400") : "text-neutral-400"}`} />
              </div>
              <div
                className={`text-2xl font-mono font-bold tracking-tight mb-1 ${
                  hasCertificate ? (isLight ? "text-amber-700" : "text-amber-400") : ""
                }`}
              >
                {certificates.length}
                <span className="text-xs font-normal opacity-60 ml-1">
                  {hasCertificate ? "Issued" : "Pending"}
                </span>
              </div>
              <p className={`text-[11px] ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
                {hasCertificate ? "RFC 8032 Ed25519" : "Requires 100% Progress"}
              </p>
            </div>
          </div>

          {/* EVALUATED RUBRIC COMPETENCIES BREAKDOWN */}
          <section
            aria-label="Rubric Competencies"
            className={`rounded-2xl p-6 sm:p-7 border transition-all duration-300 ${
              isLight
                ? "bg-white border-slate-200/90 text-slate-900 shadow-sm"
                : "bg-gradient-to-b from-[#111116] to-[#0c0c10] border-white/[0.08] text-white shadow-sm"
            }`}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-serif text-lg font-normal tracking-tight">
                  Evaluated Cognitive Competencies
                </h3>
                <p className={`text-xs ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
                  Socratic rubric assessments across Python core engineering dimensions
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {skillScorePct}%
                </span>
                <span className="text-[10px] font-mono uppercase opacity-50">Overall</span>
              </div>
            </div>

            {assessedEntries.length > 0 ? (
              <div className="space-y-3.5">
                {assessedEntries.slice(0, 4).map((entry) => {
                  const scorePct = Math.round(entry.compositeScore * 100);
                  const isStrength = entry.classification === "STRENGTH";
                  const isDeveloping = entry.classification === "DEVELOPING";

                  return (
                    <div
                      key={entry.skillDimensionId}
                      className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                        isLight
                          ? "bg-slate-50/70 border-slate-200/80"
                          : "bg-white/[0.025] border-white/[0.06]"
                      }`}
                    >
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center space-x-2.5 mb-1.5">
                          <span className={`font-medium truncate ${isLight ? "text-slate-800" : "text-neutral-200"}`}>
                            {entry.skillName}
                          </span>
                          <span
                            className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full border ${
                              isStrength
                                ? isLight
                                  ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                                : isDeveloping
                                ? isLight
                                  ? "bg-sky-100 text-sky-800 border-sky-300"
                                  : "bg-sky-500/10 text-sky-400 border-sky-500/25"
                                : isLight
                                ? "bg-amber-100 text-amber-800 border-amber-300"
                                : "bg-amber-500/10 text-amber-400 border-amber-500/25"
                            }`}
                          >
                            {entry.classification}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div
                          className={`w-full rounded-full h-1.5 overflow-hidden ${
                            isLight ? "bg-slate-200" : "bg-white/10"
                          }`}
                        >
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isStrength
                                ? isLight ? "bg-emerald-600" : "bg-emerald-400"
                                : isDeveloping
                                ? isLight ? "bg-sky-600" : "bg-sky-400"
                                : isLight ? "bg-amber-600" : "bg-amber-400"
                            }`}
                            style={{ width: `${scorePct}%` }}
                          />
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`font-mono font-bold text-xs ${isLight ? "text-slate-900" : "text-white"}`}>
                          {scorePct}%
                        </span>
                        <div className="text-[10px] text-neutral-400">Demonstrated</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                className={`p-6 rounded-xl border text-center text-xs ${
                  isLight
                    ? "bg-slate-50 border-slate-200 text-slate-600"
                    : "bg-white/[0.02] border-white/[0.06] text-neutral-400"
                }`}
              >
                <Sparkles className="w-5 h-5 mx-auto mb-2 opacity-50" />
                <p className="font-medium">Continuous Rubric Assessment Active</p>
                <p className="text-[11px] mt-1 max-w-md mx-auto opacity-75">
                  As you interact with the Socratic AI Tutor in Module 01, your responses are evaluated
                  across eight core cognitive dimensions.
                </p>
              </div>
            )}
          </section>
        </div>

        {/* ========================================================= */}
        {/* RIGHT 4-COLUMN WIDGETS                                    */}
        {/* ========================================================= */}
        <div className="xl:col-span-4 space-y-6">
          {/* CREDENTIAL DOCKET OR CERTIFICATION LADDER */}
          <section
            aria-label="Certification Status"
            className={`rounded-2xl p-6 sm:p-7 border transition-all duration-300 ${
              hasCertificate
                ? isLight
                  ? "bg-gradient-to-b from-amber-50/40 to-white border-amber-300/80 shadow-sm text-slate-900"
                  : "bg-gradient-to-b from-[#161411] to-[#0d0c0a] border-amber-500/25 shadow-sm text-white"
                : isLight
                ? "bg-white border-slate-200/90 shadow-sm text-slate-900"
                : "bg-gradient-to-b from-[#111116] to-[#0c0c10] border-white/[0.08] shadow-sm text-white"
            }`}
          >
            {hasCertificate && primaryCertificate ? (
              /* State A: Verifiable Credential Showcase */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div
                    className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider uppercase font-semibold ${
                      isLight
                        ? "bg-amber-100 text-amber-900 border border-amber-300"
                        : "bg-amber-500/10 text-amber-300 border border-amber-500/30"
                    }`}
                  >
                    <Award className="w-3 h-3" />
                    <span>Conferred Credential</span>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-semibold flex items-center space-x-1 ${
                      isLight ? "text-emerald-700" : "text-emerald-400"
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>VERIFIED</span>
                  </span>
                </div>

                <div>
                  <h3 className="font-serif text-lg font-normal tracking-tight">
                    Python Fundamentals & Runtime Architecture
                  </h3>
                  <p className={`text-xs mt-0.5 ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                    Awarded to <span className={`font-semibold ${isLight ? "text-slate-900" : "text-neutral-200"}`}>{primaryCertificate.recipientName || learnerDisplayName}</span>
                  </p>
                </div>

                {/* Credential Data Badge */}
                <div
                  className={`p-3.5 rounded-xl border text-xs font-mono space-y-2 ${
                    isLight
                      ? "bg-white border-amber-200"
                      : "bg-black/30 border-amber-500/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={isLight ? "text-slate-500 text-[11px]" : "text-neutral-400 text-[11px]"}>CREDENTIAL ID</span>
                    <button
                      onClick={(e) => handleCopyCredentialId(e, primaryCertificate.credentialId)}
                      className={`text-[11px] font-bold flex items-center space-x-1 cursor-pointer ${
                        isLight ? "text-amber-800 hover:text-amber-900" : "text-amber-300 hover:text-amber-200"
                      }`}
                      title="Copy Credential ID"
                    >
                      <span>{primaryCertificate.credentialId}</span>
                      {copiedCertId ? (
                        <CheckCheck className={`w-3 h-3 ${isLight ? "text-emerald-600" : "text-emerald-400"}`} />
                      ) : (
                        <Copy className="w-3 h-3 opacity-60" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className={isLight ? "text-slate-500" : "text-neutral-400"}>TIER / GRADE</span>
                    <span className={`font-bold ${isLight ? "text-emerald-700" : "text-emerald-400"}`}>
                      {primaryCertificate.tier} (
                      {Math.round(primaryCertificate.compositeScore * 100)}%)
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className={isLight ? "text-slate-500" : "text-neutral-400"}>SIGNATURE</span>
                    <span className={isLight ? "text-slate-700" : "text-neutral-300"} title={primaryCertificate.signatureHash}>
                      RFC 8032 Ed25519
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onNavigate("credentials")}
                  className={`w-full py-2.5 rounded-lg font-semibold text-xs flex items-center justify-center space-x-2 transition-all active:scale-98 cursor-pointer ${
                    isLight
                      ? "bg-slate-950 hover:bg-slate-800 text-white"
                      : "bg-white hover:bg-neutral-100 text-slate-950"
                  }`}
                >
                  <span>Inspect Official Certificate</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              /* State B: Qualification Milestone Ladder */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-base font-normal tracking-tight">
                    Certification Progress
                  </h3>
                  <button
                    onClick={() => onNavigate("credentials")}
                    className={`text-xs font-mono font-semibold cursor-pointer ${
                      isLight ? "text-indigo-600 hover:underline" : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    View All →
                  </button>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-neutral-400 text-[11px]">Overall Requirements</span>
                    <span className="font-bold text-emerald-400">{percentComplete}%</span>
                  </div>
                  <div
                    className={`w-full rounded-full h-1.5 overflow-hidden ${
                      isLight ? "bg-slate-200" : "bg-white/10"
                    }`}
                  >
                    <div
                      className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentComplete}%` }}
                    />
                  </div>
                </div>

                {/* Milestones Checklist */}
                <div className="space-y-3 pt-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                          allChaptersCompleted
                            ? "bg-emerald-500 text-white"
                            : isLight
                            ? "border border-slate-300"
                            : "border border-white/20"
                        }`}
                      >
                        {allChaptersCompleted && <Check className="w-2.5 h-2.5" />}
                      </div>
                      <span className="font-medium">Complete 29 Chapters</span>
                    </div>
                    <span className="font-mono text-[11px] text-neutral-400">
                      {completedChapters}/{totalChapters}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                          allPracticalsCompleted
                            ? "bg-emerald-500 text-white"
                            : isLight
                            ? "border border-slate-300"
                            : "border border-white/20"
                        }`}
                      >
                        {allPracticalsCompleted && <Check className="w-2.5 h-2.5" />}
                      </div>
                      <span className="font-medium">Pass 10 Practicals</span>
                    </div>
                    <span className="font-mono text-[11px] text-neutral-400">
                      {practicalsPassed}/{totalModules}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                          hasCertificate
                            ? "bg-emerald-500 text-white"
                            : isLight
                            ? "border border-slate-300"
                            : "border border-white/20"
                        }`}
                      >
                        {hasCertificate && <Check className="w-2.5 h-2.5" />}
                      </div>
                      <span className="font-medium">Cryptographic Seal</span>
                    </div>
                    <span className="font-mono text-[11px] text-neutral-400">
                      {hasCertificate ? "Issued ✓" : "Pending"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* MASTERY OVERVIEW (3 REFINED SVG RING METERS) */}
          <section
            aria-label="Mastery Overview Meters"
            className={`rounded-2xl p-6 sm:p-7 border transition-all duration-300 ${
              isLight
                ? "bg-white border-slate-200/90 text-slate-900 shadow-sm"
                : "bg-gradient-to-b from-[#111116] to-[#0c0c10] border-white/[0.08] text-white shadow-sm"
            }`}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-serif text-base font-normal tracking-tight">
                Mastery Diagnostics
              </h3>
              <button
                onClick={() => onNavigate("progress")}
                className={`text-xs font-mono font-semibold cursor-pointer ${
                  isLight ? "text-indigo-600 hover:underline" : "text-neutral-400 hover:text-white"
                }`}
              >
                Telemetry →
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                {
                  label: "Completion",
                  value: percentComplete,
                  sub: `${completedSections}/${totalSections} sec`,
                  color: "#10B981",
                },
                {
                  label: "Skill Score",
                  value: skillScorePct,
                  sub: "Rubric + BKT",
                  color: "#10B981",
                },
                {
                  label: "Concepts",
                  value: conceptsPct,
                  sub: `${masteredConcepts}/${totalConcepts}`,
                  color: "#10B981",
                },
              ].map((g) => (
                <div key={g.label} className="flex flex-col items-center">
                  <div className="relative w-16 h-16 flex items-center justify-center mb-2">
                    <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke={isLight ? "rgba(100, 116, 139, 0.15)" : "rgba(255, 255, 255, 0.08)"}
                        strokeWidth="2.5"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke={g.color}
                        strokeDasharray={`${g.value}, 100`}
                        strokeLinecap="round"
                        strokeWidth="2.6"
                      />
                    </svg>
                    <span className="absolute text-xs font-mono font-bold">{g.value}%</span>
                  </div>
                  <h4 className="text-xs font-semibold">{g.label}</h4>
                  <p className={`text-[10px] font-mono mt-0.5 ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
                    {g.sub}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* QUALITATIVE RUBRIC DIAGNOSTICS */}
          <section
            aria-label="Cognitive Diagnostics"
            className={`rounded-2xl p-6 sm:p-7 border transition-all duration-300 ${
              isLight
                ? "bg-white border-slate-200/90 text-slate-900 shadow-sm"
                : "bg-gradient-to-b from-[#111116] to-[#0c0c10] border-white/[0.08] text-white shadow-sm"
            }`}
          >
            <h3 className="font-serif text-base font-normal tracking-tight mb-3">
              Cognitive Insights
            </h3>

            <div
              className={`p-4 rounded-xl border text-xs space-y-3 ${
                isLight ? "bg-slate-50 border-slate-200" : "bg-white/[0.03] border-white/[0.06]"
              }`}
            >
              {topStrength ? (
                <div>
                  <div className={`flex items-center space-x-2 font-mono text-[11px] font-semibold mb-1 ${isLight ? "text-emerald-700" : "text-emerald-400"}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>TOP STRENGTH</span>
                  </div>
                  <p className={`font-medium ${isLight ? "text-slate-900" : "text-neutral-200"}`}>{topStrength.skillName}</p>
                  <p className={`text-[11px] mt-0.5 ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                    Demonstrated {Math.round(topStrength.compositeScore * 100)}% mastery across interactive traces
                    and conceptual checkpoints.
                  </p>
                </div>
              ) : null}

              {topWeakpoint ? (
                <div className={`pt-2 border-t ${isLight ? "border-slate-200" : "border-white/[0.06]"}`}>
                  <div className={`flex items-center space-x-2 font-mono text-[11px] font-semibold mb-1 ${isLight ? "text-amber-700" : "text-amber-400"}`}>
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>RECOMMENDED FOCUS</span>
                  </div>
                  <p className={`font-medium ${isLight ? "text-slate-900" : "text-neutral-200"}`}>{topWeakpoint.skillName}</p>
                  <p className={`text-[11px] mt-0.5 ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                    Composite score at {Math.round(topWeakpoint.compositeScore * 100)}%. Revisit with the Socratic
                    tutor to solidify mental models.
                  </p>
                </div>
              ) : null}

              {!topStrength && !topWeakpoint && (
                <p className={`leading-relaxed ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                  Dialogue with the Socratic tutor in the AI Studio to generate real-time cognitive rubric
                  telemetry and strength diagnostics.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
