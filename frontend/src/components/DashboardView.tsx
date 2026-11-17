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

interface DashboardViewProps {
  user?: User | null;
  onContinueCourse: (slug: string) => void;
  onViewCourseDetails: (slug: string) => void;
  onNavigate: (view: string) => void;
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
  const [certificatesCount, setCertificatesCount] = useState(0);

  const activeSlug = "python-fundamentals";

  useEffect(() => {
    let mounted = true;
    setSessionContext(null);
    setProgression(null);
    setSkillsReport(null);
    setCertificatesCount(0);

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
      setCertificatesCount((certData.certificates || []).length);
    });

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  const activeCourse = courses.find((c) => c.slug === activeSlug) || courses[0];

  // Resolve real active chapter from progression tree (never hardcoded Chapter 3)
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
  const hasCertificate = certificatesCount > 0;

  const topStrength = skillsReport?.strengths[0] || null;
  const topWeakpoint = skillsReport?.weakpoints[0] || null;
  const assessedEntries = [
    ...(skillsReport?.strengths || []),
    ...(skillsReport?.developing || []),
    ...(skillsReport?.weakpoints || []),
  ];

  return (
    <div className="space-y-6" data-purpose="main-dashboard-body">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* LEFT 8-COLUMN CONTENT AREA */}
        <div className="xl:col-span-8 space-y-6">
          {/* HeroCard (Current Course) */}
          <div
            className={`rounded-2xl p-7 relative overflow-hidden border shadow-sm transition-all duration-300 ${
              isLight
                ? "bg-white text-slate-900 border-purple-900/10 shadow-sm"
                : "bg-[#111111] text-white border-white/[0.08] shadow-sm"
            }`}
            data-purpose="hero-current-course"
          >
            <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none select-none flex items-center justify-end overflow-hidden opacity-90 pr-6">
              <div
                className={`absolute w-96 h-96 rounded-full border -right-16 top-6 ${
                  isLight ? "border-amber-500/15" : "border-amber-500/20"
                }`}
              />
              <div className="relative z-10 flex flex-col items-center">
                <svg className="w-32 h-32 opacity-90" fill="none" viewBox="0 0 110 110">
                  <path
                    d="M54.5 12C36.8 12 37.8 19.7 37.8 19.7L37.9 27.6H55v2.4H30.5C21.4 30 15 36.3 15 48.3c0 12.1 7.8 18.2 17 18.2h5.5v-8.5c0-4.8 4.2-9 9-9h17.1c3.8 0 7-3.2 7-7V27.6c0-4.4-4-15.6-16.1-15.6zm-8.8 6.5a2.5 2.5 0 110 5 2.5 2.5 0 010-5z"
                    fill="url(#pythonBlue)"
                  />
                  <path
                    d="M55.5 98c17.7 0 16.7-7.7 16.7-7.7l-.1-7.9H55v-2.4h24.5c9.1 0 15.5-6.3 15.5-18.3 0-12.1-7.8-18.2-17-18.2h-5.5v8.5c0 4.8-4.2 9-9 9H46.4c-3.8 0-7 3.2-7 7v14.4c0 4.4 4 15.6 16.1 15.6zm8.8-6.5a2.5 2.5 0 110-5 2.5 2.5 0 010-5z"
                    fill="url(#pythonYellow)"
                  />
                  <defs>
                    <linearGradient id="pythonBlue" x1="15" y1="12" x2="65" y2="60" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#38BDF8" />
                      <stop offset="1" stopColor="#1D4ED8" />
                    </linearGradient>
                    <linearGradient id="pythonYellow" x1="45" y1="45" x2="95" y2="98" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#FCD34D" />
                      <stop offset="1" stopColor="#D97706" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            <div className="relative z-10 max-w-lg">
              <div
                className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-[11px] font-semibold mb-4 ${
                  isLight
                    ? "bg-purple-100/80 text-purple-900 border border-purple-200"
                    : "bg-white/10 backdrop-blur-md text-slate-300 border border-white/10"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="tracking-wider uppercase">
                  {progression ? "Active Track" : "Flagship Track"}
                </span>
              </div>

              <h2 className={`text-3xl font-extrabold tracking-tight mb-2 font-sans ${isLight ? "text-slate-900" : "text-white"}`}>
                {activeCourse ? activeCourse.title : "Python Fundamentals"}
              </h2>
              <p className={`text-xs font-medium mb-6 ${isLight ? "text-slate-600" : "text-neutral-300"}`}>
                Build real skills{user?.fullName ? `, ${user.fullName.split(" ")[0]}` : ""}. Think deeper. Get certified.
              </p>

              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold mb-6">
                <div className={`px-2.5 py-1 rounded-lg border ${isLight ? "bg-purple-50/80 text-slate-700 border-purple-200/60" : "text-neutral-300 border-white/10"}`}>
                  {completedModules}/{totalModules} Modules
                </div>
                <div className={`px-2.5 py-1 rounded-lg border ${isLight ? "bg-purple-50/80 text-slate-700 border-purple-200/60" : "text-neutral-300 border-white/10"}`}>
                  {completedChapters}/{totalChapters} Chapters
                </div>
                <div className={`px-2.5 py-1 rounded-lg border ${isLight ? "bg-purple-50/80 text-slate-700 border-purple-200/60" : "text-neutral-300 border-white/10"}`}>
                  {completedSections}/{totalSections} Sections
                </div>
              </div>

              {/* Real Progress Bar */}
              <div className="space-y-1.5 mb-7 max-w-sm">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <div
                    className={`w-full rounded-full h-2 overflow-hidden mr-3 ${
                      isLight ? "bg-slate-200/80 border border-slate-300/60" : "bg-slate-800/80 border border-slate-700/60"
                    }`}
                  >
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentComplete}%` }}
                    />
                  </div>
                  <span className={`text-[11px] font-bold shrink-0 ${isLight ? "text-slate-800" : "text-slate-300"}`}>
                    {percentComplete}% <span className={`font-normal ${isLight ? "text-slate-500" : "text-slate-400"}`}>complete</span>
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => (progression ? onContinueCourse(activeSlug) : onViewCourseDetails(activeSlug))}
                  className={`px-5 py-2.5 rounded-[8px] font-bold text-xs flex items-center space-x-2 transition-all shadow-sm active:scale-95 cursor-pointer ${
                    isLight
                      ? "bg-[#5B4DF0] hover:bg-[#4C3DE0] text-white"
                      : "bg-white hover:bg-neutral-100 text-slate-950"
                  }`}
                >
                  <span>{progression ? "Continue with AI" : "Enroll & Start Learning"}</span>
                </button>

                <button
                  onClick={() => onViewCourseDetails(activeSlug)}
                  className={`px-4 py-2.5 rounded-[8px] font-semibold text-xs flex items-center space-x-2 transition-all active:scale-95 cursor-pointer ${
                    isLight
                      ? "bg-purple-100/70 hover:bg-purple-100 text-purple-950 border border-purple-200"
                      : "bg-white/10 hover:bg-white/15 text-white border border-white/15"
                  }`}
                >
                  <span>View Course Details</span>
                </button>
              </div>
            </div>
          </div>

          {/* Current Lesson Card (Strictly Real Active Chapter) */}
          <div
            className={`rounded-2xl p-6 shadow-sm border transition-all duration-300 ${
              isLight ? "bg-white border-purple-900/10 text-slate-900" : "bg-[#111111] border-white/[0.08] text-white"
            }`}
            data-purpose="continue-learning-card"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold">Current Lesson</h3>
              <span className={`text-xs font-semibold ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
                {progression ? "Sequential lock-verified step" : "Not enrolled yet"}
              </span>
            </div>

            {activeLesson ? (
              <div
                className={`flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-[10px] border ${
                  isLight ? "bg-purple-50/50 border-purple-100" : "bg-white/[0.04] border-white/[0.06]"
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2 flex-wrap">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                      {activeLesson.moduleTitle}
                    </span>
                    <span className="text-[10px] text-neutral-500">•</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      {activeLesson.status.replace(/_/g, " ")}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold">{activeLesson.chapterTitle}</h4>
                  <div className="flex items-center space-x-2 pt-1 max-w-xs">
                    <div className={`w-36 rounded-full h-1.5 overflow-hidden ${isLight ? "bg-slate-200" : "bg-white/10"}`}>
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${activeLesson.chapterPct}%` }}
                      />
                    </div>
                    <span className={`text-[10px] font-bold ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                      {activeLesson.sectionsDone}/{activeLesson.sectionsTotal} sections ({activeLesson.chapterPct}%)
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onContinueCourse(activeSlug)}
                  className={`font-bold text-xs px-4 py-2.5 rounded-[8px] flex items-center space-x-1.5 transition-all active:scale-95 cursor-pointer shrink-0 ${
                    isLight
                      ? "bg-[#5B4DF0] hover:bg-[#4C3DE0] text-white"
                      : "bg-white hover:bg-neutral-200 text-neutral-950"
                  }`}
                >
                  <span>Continue</span>
                  <span>→</span>
                </button>
              </div>
            ) : (
              <div
                className={`p-5 rounded-[10px] border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isLight ? "bg-purple-50/40 border-purple-100" : "bg-white/[0.03] border-white/[0.06]"
                }`}
              >
                <div>
                  <h4 className="text-sm font-bold">Ready to start Python Fundamentals?</h4>
                  <p className={`text-xs mt-0.5 ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                    Enroll to unlock Module 01, Lesson 1 and begin building verified progress.
                  </p>
                </div>
                <button
                  onClick={() => onViewCourseDetails(activeSlug)}
                  className="bg-[#5B4DF0] hover:bg-[#4C3DE0] text-white font-bold text-xs px-4 py-2 rounded-[8px] cursor-pointer shrink-0"
                >
                  Open Course Details →
                </button>
              </div>
            )}
          </div>

          {/* Real Backend Progression & Skill Metrics Row (Replaces Fake Streak & Fake Activity) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Progression Milestones (7 cols) */}
            <div
              className={`md:col-span-7 rounded-2xl p-6 shadow-sm border space-y-4 ${
                isLight ? "bg-white border-purple-900/10 text-slate-900" : "bg-[#111111] border-white/[0.08] text-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <h4 className={`text-xs font-bold tracking-wide uppercase ${isLight ? "text-slate-700" : "text-neutral-200"}`}>
                  Live Progression Metrics
                </h4>
                <button
                  onClick={() => onViewCourseDetails(activeSlug)}
                  className={`text-xs font-semibold cursor-pointer ${isLight ? "text-purple-700" : "text-neutral-400 hover:text-white"}`}
                >
                  Full Syllabus →
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className={`p-3 rounded-xl border ${isLight ? "bg-purple-50/50 border-purple-100" : "bg-white/[0.03] border-white/[0.07]"}`}>
                  <div className="text-xl font-black font-mono">{completedSections}</div>
                  <div className={`text-[10px] mt-0.5 ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
                    Sections Done
                  </div>
                </div>
                <div className={`p-3 rounded-xl border ${isLight ? "bg-purple-50/50 border-purple-100" : "bg-white/[0.03] border-white/[0.07]"}`}>
                  <div className="text-xl font-black font-mono">{completedChapters}</div>
                  <div className={`text-[10px] mt-0.5 ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
                    Chapters Clear
                  </div>
                </div>
                <div className={`p-3 rounded-xl border ${isLight ? "bg-purple-50/50 border-purple-100" : "bg-white/[0.03] border-white/[0.07]"}`}>
                  <div className="text-xl font-black font-mono">{practicalsPassed}</div>
                  <div className={`text-[10px] mt-0.5 ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
                    Practicals Passed
                  </div>
                </div>
                <div className={`p-3 rounded-xl border ${isLight ? "bg-purple-50/50 border-purple-100" : "bg-white/[0.03] border-white/[0.07]"}`}>
                  <div className="text-xl font-black font-mono">{certificatesCount}</div>
                  <div className={`text-[10px] mt-0.5 ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
                    Credentials
                  </div>
                </div>
              </div>
            </div>

            {/* Evaluated Skill Profile Summary (5 cols) */}
            <div
              className={`md:col-span-5 rounded-2xl p-6 shadow-sm border flex flex-col justify-between space-y-3 ${
                isLight ? "bg-white border-purple-900/10 text-slate-900" : "bg-[#111111] border-white/[0.08] text-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <h4 className={`text-xs font-bold tracking-wide uppercase ${isLight ? "text-slate-700" : "text-neutral-200"}`}>
                  Rubric Skills Evaluated
                </h4>
                <span className="text-xs font-mono font-bold text-emerald-500">{skillScorePct}%</span>
              </div>

              {assessedEntries.length > 0 ? (
                <div className="space-y-2">
                  {assessedEntries.slice(0, 3).map((entry) => (
                    <div
                      key={entry.skillDimensionId}
                      className={`px-3 py-2 rounded-lg border flex items-center justify-between text-xs ${
                        isLight ? "bg-slate-50 border-slate-200" : "bg-white/[0.03] border-white/[0.07]"
                      }`}
                    >
                      <span className="font-medium truncate pr-2">{entry.skillName}</span>
                      <span
                        className={`font-mono font-bold shrink-0 ${
                          entry.classification === "STRENGTH"
                            ? "text-emerald-400"
                            : entry.classification === "WEAKPOINT"
                            ? "text-amber-400"
                            : "text-sky-400"
                        }`}
                      >
                        {Math.round(entry.compositeScore * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={`text-xs leading-relaxed ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                  No rubric criteria evaluated yet. Study Lesson 1 in the AI Studio to record live
                  mastery and skill dimensions.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT 4-COLUMN WIDGETS */}
        <div className="xl:col-span-4 space-y-6">
          {/* Certification Progress Card (Strictly Backend-Driven) */}
          <div
            className={`rounded-2xl p-6 shadow-sm border flex flex-col gap-5 ${
              isLight ? "bg-white border-purple-900/10 text-slate-900" : "bg-[#111111] border-white/[0.08] text-white"
            }`}
            data-purpose="certification-progress-container"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold">Certification Progress</h3>
              <button
                onClick={() => onNavigate("credentials")}
                className={`text-xs font-semibold cursor-pointer ${
                  isLight ? "text-slate-500 hover:text-purple-700" : "text-neutral-400 hover:text-white"
                }`}
              >
                Credentials →
              </button>
            </div>

            <div
              className={`flex items-center space-x-3.5 p-3 rounded-[10px] border ${
                isLight ? "bg-purple-50/50 border-purple-100" : "bg-white/[0.04] border-white/[0.06]"
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold">Python Fundamentals</h4>
                  <span className="text-[10px] font-semibold text-emerald-500">
                    {hasCertificate ? "Certified" : progression ? "In Progress" : "Not Started"}
                  </span>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <div className={`w-full rounded-full h-1.5 overflow-hidden ${isLight ? "bg-slate-200" : "bg-white/10"}`}>
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentComplete}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold font-mono">{percentComplete}%</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-1 text-xs">
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
                    {allChaptersCompleted && "✓"}
                  </div>
                  <span className="font-semibold">Complete all chapters</span>
                </div>
                <span className="text-[11px] font-mono font-bold text-neutral-400">
                  {completedChapters} / {totalChapters}
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
                    {allPracticalsCompleted && "✓"}
                  </div>
                  <span className="font-medium">Pass module practicals</span>
                </div>
                <span className="text-[11px] font-mono font-bold text-neutral-400">
                  {practicalsPassed} / {totalModules}
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
                    {hasCertificate && "✓"}
                  </div>
                  <span className="font-medium">Earn verified certificate</span>
                </div>
                <span className="text-[11px] font-medium text-neutral-500">
                  {hasCertificate ? "Issued ✓" : "Locked"}
                </span>
              </div>
            </div>
          </div>

          {/* Real AI Rubric Insights */}
          <div
            className={`rounded-2xl p-6 shadow-sm border ${
              isLight ? "bg-white border-purple-900/10 text-slate-900" : "bg-[#111111] border-white/[0.08] text-white"
            }`}
            data-purpose="ai-insights-widget"
          >
            <div className="flex items-center space-x-2 mb-3">
              <h3 className="text-sm font-bold">Rubric Insights</h3>
            </div>
            <div
              className={`p-3.5 rounded-[10px] border text-xs space-y-1.5 ${
                isLight ? "bg-purple-50/60 border-purple-100" : "bg-white/[0.04] border-white/[0.06]"
              }`}
            >
              {topStrength || topWeakpoint ? (
                <>
                  {topStrength && (
                    <p>
                      <strong className="text-emerald-400">Top Strength:</strong>{" "}
                      {topStrength.skillName} ({Math.round(topStrength.compositeScore * 100)}%)
                    </p>
                  )}
                  {topWeakpoint && (
                    <p>
                      <strong className="text-amber-400">Focus Area:</strong>{" "}
                      {topWeakpoint.skillName} ({Math.round(topWeakpoint.compositeScore * 100)}%)
                    </p>
                  )}
                </>
              ) : (
                <p className={isLight ? "text-slate-600" : "text-neutral-300"}>
                  Complete your first Socratic turns and checkpoint in Module 01 to generate
                  personalized rubric insights.
                </p>
              )}
            </div>
          </div>

          {/* Mastery Overview (3 Real Backend Meters — ZERO Demo Data) */}
          <div
            className={`rounded-2xl p-6 shadow-sm border flex flex-col gap-5 ${
              isLight ? "bg-white border-purple-900/10 text-slate-900" : "bg-[#111111] border-white/[0.08] text-white"
            }`}
            data-purpose="mastery-overview-widget"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold">Mastery Overview</h3>
              <button
                onClick={() => onNavigate("progress")}
                className={`text-xs font-semibold cursor-pointer ${
                  isLight ? "text-slate-500 hover:text-purple-700" : "text-neutral-400 hover:text-white"
                }`}
              >
                Details →
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              {[
                { label: "Completion", value: percentComplete, sub: `${completedSections}/${totalSections} sec` },
                { label: "Skill Score", value: skillScorePct, sub: "Rubric + BKT" },
                { label: "Concepts", value: conceptsPct, sub: `${masteredConcepts}/${totalConcepts} mastered` },
              ].map((g) => (
                <div key={g.label} className="flex flex-col items-center">
                  <div className="relative w-16 h-16 flex items-center justify-center mb-2">
                    <svg className="w-16 h-16 meter-circle" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke={isLight ? "rgba(100, 116, 139, 0.15)" : "rgba(255, 255, 255, 0.08)"}
                        strokeWidth="3"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#10B981"
                        strokeDasharray={`${g.value}, 100`}
                        strokeLinecap="round"
                        strokeWidth="3.2"
                      />
                    </svg>
                    <span className="absolute text-xs font-extrabold">{g.value}%</span>
                  </div>
                  <h5 className="text-xs font-bold">{g.label}</h5>
                  <p className={`text-[9px] mt-0.5 ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
                    {g.sub}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
