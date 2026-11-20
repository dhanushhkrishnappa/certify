import React, { useEffect, useState, useMemo } from "react";
import type {
  User,
  CourseCatalogItem,
  ProgressionTree,
} from "../types/index.js";
import { api } from "../services/api.js";
import { useTheme } from "../context/ThemeContext.js";
import {
  Award,
  Play,
  ArrowRight,
  BookOpen,
  Flame,
  CheckCircle2,
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
}

interface UserActivityData {
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
  totalContributions: number;
  matrix: Array<Array<{ date: string; dateStr: string; count: number; level: number }>>;
}

const cleanTitle = (t?: string | null) => (t ? t.replace(/^\*+\s*/, "").trim() : "");

export const DashboardView: React.FC<DashboardViewProps> = ({
  user: _user,
  onContinueCourse,
  onViewCourseDetails,
  onNavigate,
}) => {
  const { isLight } = useTheme();
  const [courses, setCourses] = useState<CourseCatalogItem[]>([]);
  const [progression, setProgression] = useState<ProgressionTree | null>(null);
  const [certificates, setCertificates] = useState<IssuedCertificate[]>([]);
  const [activityData, setActivityData] = useState<UserActivityData | null>(null);

  const activeSlug = "python-fundamentals";

  useEffect(() => {
    let mounted = true;

    Promise.all([
      api.listCourses().catch(() => ({ courses: [] })),
      api.getProgression(activeSlug).catch(() => null),
      api.getMyCertificates().catch(() => ({ certificates: [] })),
      api.getUserActivity().catch(() => null),
    ]).then(([courseData, progData, certData, actData]) => {
      if (!mounted) return;
      setCourses(courseData.courses || []);
      setProgression(progData?.progression || null);
      setCertificates((certData.certificates as IssuedCertificate[]) || []);
      if (actData) {
        setActivityData(actData);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  const activeCourse = courses.find((c) => c.slug === activeSlug) || courses[0];
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

  const totalChapters = progression?.summary.chaptersTotal ?? activeCourse?.chapterCount ?? 29;
  const completedChapters = progression?.summary.chaptersCompleted ?? 0;
  const percentComplete = progression ? Math.round(progression.summary.percentComplete) : 0;
  const allChaptersCompleted = totalChapters > 0 && completedChapters >= totalChapters;
  const isFullyCertified = hasCertificate || allChaptersCompleted;

  // Real-time matrix fallback while hydrating
  const displayMatrix = useMemo(() => {
    if (activityData?.matrix && activityData.matrix.length > 0) {
      return activityData.matrix;
    }
    return Array.from({ length: 16 }, () =>
      Array.from({ length: 7 }, () => ({
        date: "",
        dateStr: "",
        count: 0,
        level: 0,
      }))
    );
  }, [activityData]);

  const currentStreak = activityData?.currentStreak ?? 0;
  const longestStreak = activityData?.longestStreak ?? 0;
  const totalContributions = activityData?.totalContributions ?? 0;

  return (
    <div className="space-y-6 pb-12" data-purpose="main-dashboard-body">
      {/* ========================================================= */}
      {/* ROW 1: MAIN PYTHON HERO (8 cols) + GITHUB STREAK (4 cols) */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* CARD 1: MAIN PYTHON COURSE CARD (8 COLUMNS) */}
        <section
          aria-label="Active Track Overview"
          className={`xl:col-span-8 rounded-2xl p-7 md:p-9 relative overflow-hidden border transition-all duration-300 flex flex-col justify-between ${
            isLight
              ? "bg-white text-slate-900 border-slate-200/90 shadow-sm"
              : "bg-[#0b0c10] text-white border-white/[0.08] shadow-[0_4px_30px_-4px_rgba(0,0,0,0.7)]"
          }`}
        >
          {/* Background Course Art - Dynamic Theme Adaptation */}
          <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
            <img
              src={isLight ? "/python-card-bg-light.jpg" : "/python-card-bg.jpg"}
              alt=""
              className={`w-full h-full object-cover object-right transition-opacity duration-300 ${
                isLight ? "opacity-95" : "opacity-75"
              }`}
            />
            {/* Gradient Scrim for crisp text contrast on the left */}
            <div
              className={`absolute inset-0 ${
                isLight
                  ? "bg-gradient-to-r from-white via-white/95 via-45% to-transparent"
                  : "bg-gradient-to-r from-[#0b0c10] via-[#0b0c10]/85 via-50% to-transparent"
              }`}
            />
          </div>

          <div className="relative z-10 max-w-xl">
            {/* Title with authentic official Python Logo */}
            <div className="flex items-center space-x-3.5 mb-2.5">
              <svg className="w-8 h-8 shrink-0 drop-shadow-sm" viewBox="0 0 110 110" fill="none">
                <path
                  d="M54.5 12C36.8 12 37.8 19.7 37.8 19.7L37.9 27.6H55v2.4H30.5C21.4 30 15 36.3 15 48.3c0 12.1 7.8 18.2 17 18.2h5.5v-8.5c0-4.8 4.2-9 9-9h17.1c3.8 0 7-3.2 7-7V27.6c0-4.4-4-15.6-16.1-15.6zm-8.8 6.5a2.5 2.5 0 110 5 2.5 2.5 0 010-5z"
                  fill="#387EB8"
                />
                <path
                  d="M55.5 98c17.7 0 16.7-7.7 16.7-7.7l-.1-7.9H55v-2.4h24.5c9.1 0 15.5-6.3 15.5-18.3 0-12.1-7.8-18.2-17-18.2h-5.5v8.5c0 4.8-4.2 9-9 9H46.4c-3.8 0-7 3.2-7 7v14.4c0 4.4 4 15.6 16.1 15.6zm8.8-6.5a2.5 2.5 0 110-5 2.5 2.5 0 010-5z"
                  fill="#FFE873"
                />
              </svg>
              <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight leading-tight">
                CERTIFY – Python Fundamentals
              </h1>
            </div>

            {/* Editorial Description */}
            <p
              className={`text-xs sm:text-sm font-sans leading-relaxed mb-7 max-w-lg ${
                isLight ? "text-slate-700" : "text-neutral-300"
              }`}
            >
              Comprehensive evaluation covering runtime memory topologies, object references, mutable
              data structures, and rigorous algorithmic problem solving under Socratic assessment.
            </p>

            {/* Precision Progress Rail */}
            <div className="space-y-2 mb-8 max-w-lg">
              <div className="flex justify-between items-center text-xs font-mono">
                <span
                  className={`text-[11px] tracking-wider uppercase font-semibold ${
                    isLight ? "text-slate-500" : "text-neutral-400"
                  }`}
                >
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
                    : "bg-black/50 border-white/[0.08]"
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
                className={`px-5 py-2.5 rounded-lg font-semibold text-xs flex items-center space-x-2 transition-all shadow-md active:scale-95 cursor-pointer ${
                  isLight
                    ? "bg-slate-950 hover:bg-slate-800 text-white"
                    : "bg-white hover:bg-neutral-100 text-slate-950 shadow-white/5"
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>
                  {isFullyCertified
                    ? "Launch Socratic AI Sandbox"
                    : progression
                    ? "Continue Socratic Learning"
                    : "Enroll & Start Track"}
                </span>
              </button>

              <button
                onClick={() => onViewCourseDetails(activeSlug)}
                className={`px-4 py-2.5 rounded-lg font-medium text-xs flex items-center space-x-2 transition-all active:scale-95 cursor-pointer border ${
                  isLight
                    ? "bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm"
                    : "bg-white/10 hover:bg-white/15 text-neutral-200 border-white/15 backdrop-blur-sm"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Syllabus & Rubrics</span>
              </button>

              {hasCertificate && (
                <button
                  onClick={() => onNavigate("credentials")}
                  className={`px-4 py-2.5 rounded-lg font-medium text-xs flex items-center space-x-2 transition-all active:scale-95 cursor-pointer border ${
                    isLight
                      ? "bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300 shadow-sm"
                      : "bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30 backdrop-blur-sm"
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>View Issued Certificate</span>
                </button>
              )}
            </div>
          </div>
        </section>

        {/* CARD 2: GITHUB-STYLE STREAK COUNTER (4 COLUMNS - TOP RIGHT) */}
        <section
          aria-label="GitHub-Style Streak and Activity Grid"
          className={`xl:col-span-4 rounded-2xl p-6 sm:p-7 border transition-all duration-300 flex flex-col justify-between ${
            isLight
              ? "bg-white border-slate-200/90 text-slate-900 shadow-sm"
              : "bg-gradient-to-b from-[#111116] to-[#0c0c10] border-white/[0.08] text-white shadow-sm"
          }`}
        >
          <div>
            {/* Header: Flame Icon & Realtime Active Badge */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2.5">
                <div
                  className={`p-2 rounded-lg border ${
                    isLight
                      ? "bg-amber-50 text-amber-600 border-amber-200"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/25"
                  }`}
                >
                  <Flame className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-normal tracking-tight">
                    Daily Study Streak
                  </h3>
                  <p className={`text-[10px] font-mono ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
                    Real-time Socratic Activity
                  </p>
                </div>
              </div>

              <div
                className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                  currentStreak > 0
                    ? isLight
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
                    : isLight
                    ? "bg-slate-100 text-slate-600 border border-slate-200"
                    : "bg-white/[0.05] text-neutral-400 border border-white/10"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    currentStreak > 0 ? "bg-emerald-400 animate-pulse" : "bg-neutral-500"
                  }`}
                />
                <span>{currentStreak > 0 ? "Active" : "Ready"}</span>
              </div>
            </div>

            {/* Streak Numbers Summary (Live Database Telemetry) */}
            <div className="grid grid-cols-3 gap-2 py-3 px-3.5 mb-5 rounded-xl border text-center font-mono">
              <div
                className={`border-r ${isLight ? "border-slate-200" : "border-white/[0.08]"}`}
              >
                <div className="text-xl font-bold text-amber-400">
                  {currentStreak}
                </div>
                <div className={`text-[10px] mt-0.5 ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
                  Day Streak
                </div>
              </div>
              <div
                className={`border-r ${isLight ? "border-slate-200" : "border-white/[0.08]"}`}
              >
                <div className="text-xl font-bold">
                  {longestStreak}
                </div>
                <div className={`text-[10px] mt-0.5 ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
                  Best Streak
                </div>
              </div>
              <div>
                <div className="text-xl font-bold text-emerald-400">
                  {totalContributions}
                </div>
                <div className={`text-[10px] mt-0.5 ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
                  Activities
                </div>
              </div>
            </div>

            {/* GitHub-style Contribution Heatmap Matrix */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono opacity-60">
                <span>Aug</span>
                <span>Sep</span>
                <span>Oct</span>
                <span>Nov</span>
              </div>

              <div className="overflow-x-auto pb-1">
                <div className="flex items-center gap-1 min-w-full justify-between">
                  {displayMatrix.map((week, wIdx) => (
                    <div key={wIdx} className="flex flex-col gap-1">
                      {week.map((cell, dIdx) => {
                        let cellBg = "";
                        if (isLight) {
                          if (cell.level === 0) cellBg = "bg-slate-100 border border-slate-200/60";
                          else if (cell.level === 1) cellBg = "bg-emerald-200 border border-emerald-300";
                          else if (cell.level === 2) cellBg = "bg-emerald-400 border border-emerald-500";
                          else if (cell.level === 3) cellBg = "bg-emerald-500 border border-emerald-600";
                          else cellBg = "bg-emerald-600 shadow-[0_0_4px_rgba(16,185,129,0.3)]";
                        } else {
                          if (cell.level === 0) cellBg = "bg-white/[0.04] border border-white/[0.04]";
                          else if (cell.level === 1) cellBg = "bg-emerald-950/80 border border-emerald-800/40";
                          else if (cell.level === 2) cellBg = "bg-emerald-700/80 border border-emerald-600/50";
                          else if (cell.level === 3) cellBg = "bg-emerald-500 border border-emerald-400/60";
                          else cellBg = "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.4)]";
                        }

                        return (
                          <div
                            key={dIdx}
                            title={
                              cell.dateStr
                                ? `${cell.dateStr}: ${
                                    cell.count > 0 ? `${cell.count} interactions recorded` : "No activity recorded"
                                  }`
                                : "No activity recorded"
                            }
                            className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-[2px] transition-transform hover:scale-125 cursor-pointer ${cellBg}`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Heatmap Legend */}
          <div className="flex items-center justify-between pt-4 mt-3 border-t text-[10px] font-mono opacity-60">
            <span>Last 16 weeks of verified practice</span>
            <div className="flex items-center space-x-1.5">
              <span>Less</span>
              <div
                className={`w-2.5 h-2.5 rounded-[2px] ${
                  isLight ? "bg-slate-100 border border-slate-200" : "bg-white/[0.04] border border-white/[0.04]"
                }`}
              />
              <div
                className={`w-2.5 h-2.5 rounded-[2px] ${
                  isLight ? "bg-emerald-200" : "bg-emerald-950"
                }`}
              />
              <div
                className={`w-2.5 h-2.5 rounded-[2px] ${
                  isLight ? "bg-emerald-400" : "bg-emerald-700"
                }`}
              />
              <div
                className={`w-2.5 h-2.5 rounded-[2px] ${
                  isLight ? "bg-emerald-500" : "bg-emerald-400"
                }`}
              />
              <span>More</span>
            </div>
          </div>
        </section>
      </div>

      {/* ========================================================= */}
      {/* ROW 2: CONTINUE FROM WHERE YOU LEFT OFF (12 cols)         */}
      {/* ========================================================= */}
      <section
        aria-label="Continue From Where You Left Off"
        className={`rounded-2xl p-7 md:p-8 border transition-all duration-300 ${
          isLight
            ? "bg-white border-slate-200/90 text-slate-900 shadow-sm"
            : "bg-gradient-to-b from-[#111116] to-[#0c0c10] border-white/[0.08] text-white shadow-sm"
        }`}
      >
        {isFullyCertified ? (
          /* State 1: Completed Track */
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start space-x-4">
              <div
                className={`p-3.5 rounded-xl border shrink-0 ${
                  isLight
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                }`}
              >
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-emerald-400">
                    Track Completed • Mastered
                  </span>
                  <span className="text-neutral-500">•</span>
                  <span className={`text-[11px] font-mono ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
                    All 29 Chapters Cleared
                  </span>
                </div>
                <h2 className="font-serif text-2xl font-normal tracking-tight">
                  Python Fundamentals & Systems Architecture
                </h2>
                <p
                  className={`text-xs max-w-2xl leading-relaxed ${
                    isLight ? "text-slate-600" : "text-neutral-400"
                  }`}
                >
                  All curriculum modules, conceptual checkpoints, and practical engineering benchmarks
                  have been cleared. Continue practicing in the Socratic AI Sandbox to explore deeper
                  edge-case scenarios.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              <button
                onClick={() => onContinueCourse(activeSlug)}
                className={`font-semibold text-xs px-5 py-2.5 rounded-lg flex items-center space-x-2 transition-all active:scale-95 cursor-pointer shadow-md ${
                  isLight
                    ? "bg-slate-950 hover:bg-slate-800 text-white"
                    : "bg-white hover:bg-neutral-100 text-slate-950"
                }`}
              >
                <span>Launch Socratic Sandbox</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onViewCourseDetails(activeSlug)}
                className={`font-medium text-xs px-4 py-2.5 rounded-lg flex items-center space-x-2 transition-all active:scale-95 cursor-pointer border ${
                  isLight
                    ? "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                    : "bg-white/[0.05] hover:bg-white/[0.09] text-neutral-300 border-white/[0.1]"
                }`}
              >
                <span>Review Syllabus</span>
              </button>
            </div>
          </div>
        ) : activeLesson ? (
          /* State 2: Active Lesson In-Progress */
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 flex-1">
              <div className="flex items-center space-x-2.5 flex-wrap">
                <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-emerald-400">
                  Continue Where You Left Off
                </span>
                <span className="text-neutral-500">•</span>
                <span className={`text-[11px] font-mono font-semibold uppercase tracking-wider ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                  {activeLesson.moduleTitle}
                </span>
                <span className="text-neutral-500">•</span>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-full">
                  {activeLesson.status.replace(/_/g, " ")}
                </span>
              </div>

              <h2 className="font-serif text-2xl font-normal tracking-tight">
                Chapter {activeLesson.chapterOrder}: {activeLesson.chapterTitle}
              </h2>

              <p className={`text-xs max-w-xl ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                Pick up immediately in your interactive Socratic dialogue. Explore technical mechanics,
                trace heap references, and clear this checkpoint.
              </p>

              <div className="flex items-center space-x-3 pt-2 max-w-sm">
                <div
                  className={`w-44 rounded-full h-1.5 overflow-hidden ${
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
              className={`font-semibold text-xs px-6 py-3 rounded-lg flex items-center space-x-2.5 transition-all active:scale-95 cursor-pointer shrink-0 shadow-md ${
                isLight
                  ? "bg-slate-950 hover:bg-slate-800 text-white"
                  : "bg-white hover:bg-neutral-100 text-slate-950"
              }`}
            >
              <span>Resume Lesson</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* State 3: Not Yet Enrolled */
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-semibold mb-1 block">
                Next Up In Curriculum
              </span>
              <h2 className="font-serif text-2xl font-normal tracking-tight">
                Module 01: Python Foundations
              </h2>
              <p className={`text-xs mt-1 max-w-xl ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                Begin with Chapter 1: Python Execution Model, REPL, Scripts & Indentation. Start building intuition from first principles.
              </p>
            </div>
            <button
              onClick={() => onViewCourseDetails(activeSlug)}
              className={`font-semibold text-xs px-5 py-2.5 rounded-lg flex items-center space-x-2 transition-all active:scale-95 cursor-pointer shrink-0 shadow-md ${
                isLight
                  ? "bg-slate-950 hover:bg-slate-800 text-white"
                  : "bg-white hover:bg-neutral-100 text-slate-950"
              }`}
            >
              <span>Start Module 01</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
