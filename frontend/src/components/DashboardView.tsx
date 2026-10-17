import React, { useEffect, useState } from "react";
import type { User, CourseCatalogItem, LearningSessionContext } from "../types/index.js";
import { api } from "../services/api.js";
import { SpotlightCard } from "./common/SpotlightCard.js";

interface DashboardViewProps {
  user?: User | null;
  onContinueCourse: (slug: string) => void;
  onViewCourseDetails: (slug: string) => void;
  onNavigate: (view: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  onContinueCourse,
  onViewCourseDetails,
  onNavigate,
}) => {
  const [courses, setCourses] = useState<CourseCatalogItem[]>([]);
  const [sessionContext, setSessionContext] = useState<LearningSessionContext | null>(null);

  const activeSlug = "python-fundamentals";

  useEffect(() => {
    let mounted = true;
    Promise.all([
      api.listCourses().catch(() => ({ courses: [] })),
      api.getSessionContext(activeSlug).catch(() => null),
    ]).then(([courseData, sessionData]) => {
      if (mounted) {
        setCourses(courseData.courses || []);
        setSessionContext(sessionData);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  const activeCourse = courses.find((c) => c.slug === activeSlug) || courses[0];
  const currentChapter = sessionContext?.session?.chapter;

  // Real Backend-Derived Evidence:
  const totalModules = sessionContext?.curriculum?.length || activeCourse?.moduleCount || 8;
  const totalChapters = sessionContext?.curriculum
    ? sessionContext.curriculum.reduce((sum, m) => sum + m.chapters.length, 0)
    : activeCourse?.chapterCount || 9;
  const conceptMasteries = sessionContext?.conceptMasteries || [];
  const totalConcepts = conceptMasteries.length || 10;
  const masteredConcepts = conceptMasteries.filter((c) => c.status === "ADVANCED" || (c.pMastery ?? c.pKnown ?? 0) >= 0.85).length;
  // BKT Average probability of mastery across active concepts (real backend evidence)
  const averageMastery = conceptMasteries.length > 0
    ? Math.round((conceptMasteries.reduce((sum, c) => sum + (c.pMastery ?? c.pKnown ?? 0), 0) / conceptMasteries.length) * 100)
    : 42;

  const currentChapterOrder = currentChapter?.sequenceOrder || 3;

  return (
    <div className="space-y-6" data-purpose="main-dashboard-body">
      {/* Main Grid Workspace */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* LEFT 8-COLUMN CONTENT AREA */}
        <div className="xl:col-span-8 space-y-6">
          {/* BEGIN: HeroCard (Current Course) - Canonical Stitch Geometry: 20px surface */}
          <SpotlightCard
            theme="dark"
            spotlightColor="#ffffff"
            intensity={0.02}
            borderGlow={0.18}
            className="hero-glow-bg text-white rounded-[20px] p-7 relative overflow-hidden shadow-xl border border-white/[0.08] bg-[#111111]"
            data-purpose="hero-current-course"
          >
            {/* Background Python Graphic & Orbit Line */}
            <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none select-none flex items-center justify-end overflow-hidden opacity-90 pr-6">
              <div className="absolute w-96 h-96 rounded-full border border-amber-500/20 shadow-[0_0_80px_rgba(245,158,11,0.15)] -right-16 top-6"></div>
              <div className="relative z-10 flex flex-col items-center">
                <svg
                  className="w-32 h-32 drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)]"
                  fill="none"
                  viewBox="0 0 110 110"
                >
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
              {/* Pill: Current Course */}
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-semibold text-slate-300 border border-white/10 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="tracking-wider uppercase">Current Track</span>
              </div>

              {/* Headline */}
              <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2 font-sans">
                {activeCourse ? activeCourse.title : "Python Fundamentals"}
              </h2>
              <p className="text-xs text-neutral-300 font-medium mb-6">
                Build real skills{user?.fullName ? `, ${user.fullName.split(" ")[0]}` : ""}. Think deeper. Get certified.
              </p>

              {/* Metadata Badges: Backend-Derived Course Dimensions */}
              <div
                className="flex flex-wrap items-center gap-4 text-xs font-semibold text-neutral-300 mb-6"
                data-metric-type="backend-derived"
              >
                <div className="flex items-center space-x-1.5">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>{totalModules} Modules</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>{totalChapters} Chapters</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>{totalConcepts} Concepts</span>
                </div>
              </div>

              {/* Progress Bar: Real Backend BKT Mastery Average */}
              <div className="space-y-1.5 mb-7 max-w-sm" data-metric-type="backend-derived">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden border border-slate-700/60 mr-3">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500" style={{ width: `${averageMastery}%` }}></div>
                  </div>
                  <span className="text-[11px] font-bold text-slate-300 shrink-0">
                    {averageMastery}% <span className="text-slate-400 font-normal">complete</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => onContinueCourse(activeSlug)}
                  className="bg-white hover:bg-neutral-100 text-slate-950 px-5 py-2.5 rounded-[8px] font-bold text-xs flex items-center space-x-2 transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <span className="w-4 h-4 rounded-full bg-slate-950 flex items-center justify-center text-white">
                    <svg className="w-2.5 h-2.5 fill-current ml-0.5" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                  <span>Continue with AI</span>
                </button>

                <button
                  onClick={() => onViewCourseDetails(activeSlug)}
                  className="bg-white/10 hover:bg-white/15 text-white border border-white/15 px-4 py-2.5 rounded-[8px] font-semibold text-xs flex items-center space-x-2 transition-all active:scale-95 cursor-pointer"
                >
                  <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>View Course Details</span>
                </button>
              </div>
            </div>

            {/* Hero Quote Overlay (Right Lower) */}
            <div className="absolute right-12 bottom-6 text-right hidden md:block">
              <p className="text-[9px] font-medium tracking-wide text-slate-400 mt-2 leading-tight">
                Learn.<br />Practice.<br />Demonstrate.<br />Get Certified.
              </p>
            </div>
          </SpotlightCard>
          {/* END: HeroCard */}

          {/* BEGIN: MyLearning (Continue Lesson) - Canonical 14px card, 10px well, 8px thumbnail */}
          <SpotlightCard
            theme="dark"
            spotlightColor="#ffffff"
            intensity={0.02}
            borderGlow={0.30}
            className="bg-[#111111] rounded-[14px] p-6 shadow-sm border border-white/[0.08]"
            data-purpose="continue-learning-card"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">My Learning</h3>
              <span className="text-xs font-semibold text-neutral-400">Pick up where you left off</span>
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-3.5 bg-white/[0.04] rounded-[10px] border border-white/[0.06]">
              {/* Thumbnail & Info */}
              <div className="flex items-center space-x-4">
                <div className="w-24 h-18 sm:w-28 sm:h-20 rounded-[8px] overflow-hidden bg-black shrink-0 relative shadow-sm border border-white/10">
                  <div className="w-full h-full bg-gradient-to-br from-emerald-950 via-slate-900 to-black p-2 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full border border-emerald-500/40 flex items-center justify-center shadow-inner">
                      <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                      </svg>
                    </div>
                    <div
                      className="absolute inset-0 bg-repeat opacity-15"
                      style={{ backgroundImage: "repeating-linear-gradient(0deg, #10B981, #10B981 1px, transparent 1px, transparent 4px)" }}
                    ></div>
                  </div>
                </div>

                {/* Lesson Content Details: Backend Session Chapter */}
                <div className="space-y-1">
                  <div className="flex items-center space-x-2" data-metric-type="backend-derived">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                      {currentChapter ? `Chapter ${currentChapter.sequenceOrder}` : "Chapter 3"}
                    </span>
                    <span className="text-[10px] text-neutral-600">•</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      In Progress
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">
                    {currentChapter ? currentChapter.title : "Functions and Modular Code"}
                  </h4>
                  <p className="text-xs text-neutral-400 max-w-md line-clamp-1">
                    Learn how to write reusable, clean and efficient functions in Python.
                  </p>
                  <div className="flex items-center space-x-2 pt-1 max-w-xs" data-metric-type="demo-telemetry">
                    <div className="w-36 bg-white/10 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: "33%" }}></div>
                    </div>
                    <span className="text-[10px] font-bold text-neutral-400" title="Temporary UI estimate">33%</span>
                  </div>
                </div>
              </div>

              {/* Action Button & Duration */}
              <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto shrink-0 gap-2">
                <button
                  onClick={() => onContinueCourse(activeSlug)}
                  className="bg-white hover:bg-neutral-200 text-neutral-950 font-bold text-xs px-4 py-2.5 rounded-[8px] flex items-center space-x-1.5 transition-colors active:scale-95 shadow-xs cursor-pointer"
                >
                  <span>Continue</span>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <span
                  className="text-[11px] font-medium text-neutral-400 flex items-center gap-1"
                  data-metric-type="demo-telemetry"
                  title="Estimated duration (UI demo data)"
                >
                  <svg className="w-3 h-3 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  12 min left
                </span>
              </div>
            </div>
          </SpotlightCard>
          {/* END: MyLearning */}

          {/* BEGIN: MiddleRowWidgets (Streak & Motivational Quote) - Canonical 14px cards */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5" data-purpose="streak-and-quote-row">
            {/* Learning Streak Card (7 cols) - Temporary UI/Demo Telemetry */}
            <SpotlightCard
              theme="dark"
              spotlightColor="#ffffff"
              intensity={0.02}
              borderGlow={0.30}
              className="md:col-span-7 bg-[#111111] rounded-[14px] p-5 shadow-sm border border-white/[0.08] flex flex-col justify-between"
              data-purpose="learning-streak-card"
              data-metric-type="demo-telemetry"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <h4 className="text-xs font-bold text-neutral-200 tracking-wide uppercase">Learning Streak</h4>
                  <span className="text-[9px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded font-medium">Demo Data</span>
                </div>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-11 h-11 rounded-[10px] bg-orange-500/15 border border-orange-500/20 flex items-center justify-center text-orange-400 shadow-inner">
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                      <path d="M12 23c6.075 0 11-4.925 11-11 0-4.005-2.146-7.51-5.361-9.404a.75.75 0 00-1.127.768c.451 2.348-.124 4.542-1.636 5.864-1.157-2.617-2.73-4.636-4.996-6.108a.75.75 0 00-1.168.647C8.423 7.64 6.84 10.99 7.02 14.12 5.875 12.89 5.3 11.23 5.42 9.53a.75.75 0 00-1.294-.524C2.164 11.272 1 13.992 1 17c0 3.314 2.686 6 6 6h5z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-white leading-none">12</div>
                    <span className="text-[11px] font-semibold text-neutral-400">days in a row</span>
                  </div>
                </div>

                {/* Streak Contribution Matrix */}
                <div className="flex-1 max-w-[210px]" data-purpose="contribution-graph">
                  <div className="grid grid-cols-7 text-[9px] font-bold text-neutral-400 text-center mb-1">
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                    <span>Sun</span>
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {/* Row 1 */}
                    <div className="w-2.5 h-2.5 rounded-xs bg-white/[0.08] mx-auto"></div>
                    <div className="w-2.5 h-2.5 rounded-xs bg-white/[0.08] mx-auto"></div>
                    <div className="w-2.5 h-2.5 rounded-xs bg-white/[0.08] mx-auto"></div>
                    <div className="w-2.5 h-2.5 rounded-xs bg-emerald-400 mx-auto"></div>
                    <div className="w-2.5 h-2.5 rounded-xs bg-emerald-500 mx-auto"></div>
                    <div className="w-2.5 h-2.5 rounded-xs bg-white/[0.08] mx-auto"></div>
                    <div className="w-2.5 h-2.5 rounded-xs bg-emerald-500 mx-auto"></div>
                    {/* Row 2 */}
                    <div className="w-2.5 h-2.5 rounded-xs bg-white/[0.08] mx-auto"></div>
                    <div className="w-2.5 h-2.5 rounded-xs bg-white/[0.08] mx-auto"></div>
                    <div className="w-2.5 h-2.5 rounded-xs bg-emerald-300 mx-auto"></div>
                    <div className="w-2.5 h-2.5 rounded-xs bg-emerald-500 mx-auto"></div>
                    <div className="w-2.5 h-2.5 rounded-xs bg-emerald-500 mx-auto"></div>
                    <div className="w-2.5 h-2.5 rounded-xs bg-emerald-400 mx-auto"></div>
                    <div className="w-2.5 h-2.5 rounded-xs bg-emerald-500 mx-auto"></div>
                    {/* Row 3 */}
                    <div className="w-2.5 h-2.5 rounded-xs bg-white/[0.08] mx-auto"></div>
                    <div className="w-2.5 h-2.5 rounded-xs bg-white/[0.08] mx-auto"></div>
                    <div className="w-2.5 h-2.5 rounded-xs bg-white/[0.08] mx-auto"></div>
                    <div className="w-2.5 h-2.5 rounded-xs bg-emerald-400 mx-auto"></div>
                    <div className="w-2.5 h-2.5 rounded-xs bg-white/[0.08] mx-auto"></div>
                    <div className="w-2.5 h-2.5 rounded-xs bg-emerald-500 mx-auto"></div>
                    <div className="w-2.5 h-2.5 rounded-xs bg-emerald-600 mx-auto"></div>
                    {/* Row 4 (Current) */}
                    <div className="w-2.5 h-2.5 rounded-xs bg-white/[0.08] mx-auto"></div>
                    <div className="w-2.5 h-2.5 rounded-xs bg-white/[0.08] mx-auto"></div>
                    <div className="w-2.5 h-2.5 rounded-xs bg-emerald-400 mx-auto"></div>
                    <div className="w-2.5 h-2.5 rounded-xs bg-white/[0.08] mx-auto"></div>
                    <div className="w-2.5 h-2.5 rounded-xs bg-emerald-500 mx-auto"></div>
                    <div className="w-2.5 h-2.5 rounded-xs bg-emerald-500 mx-auto"></div>
                    <div className="w-2.5 h-2.5 rounded-xs bg-emerald-500 mx-auto ring-1 ring-emerald-400 ring-offset-1 ring-offset-[#111111]"></div>
                  </div>
                </div>
              </div>
            </SpotlightCard>

            {/* Quote Card (5 cols) - Canonical 14px card */}
            <SpotlightCard
              theme="dark"
              spotlightColor="#ffffff"
              intensity={0.02}
              borderGlow={0.30}
              className="md:col-span-5 bg-[#111111] rounded-[14px] p-5 shadow-sm border border-white/[0.08] flex items-center justify-center text-center relative overflow-hidden"
              data-purpose="inspirational-quote-card"
            >
              <div className="p-2">
                <p className="font-serif italic text-base sm:text-lg text-neutral-200 leading-relaxed font-normal">
                  “Small steps every day create extraordinary results.”
                </p>
              </div>
            </SpotlightCard>
          </div>
          {/* END: MiddleRowWidgets */}

          {/* BEGIN: BottomSplitWidgets (Recent Activity & Next Up) - Canonical 14px cards */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5" data-purpose="bottom-activity-and-challenge-row">
            {/* Recent Activity (7 cols) - Temporary UI/Demo Feed */}
            <SpotlightCard
              theme="dark"
              spotlightColor="#ffffff"
              intensity={0.02}
              borderGlow={0.30}
              className="md:col-span-7 bg-[#111111] rounded-[14px] p-5 shadow-sm border border-white/[0.08]"
              data-purpose="recent-activity-list"
              data-metric-type="demo-telemetry"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <h4 className="text-xs font-bold text-neutral-200 tracking-wide uppercase">Recent Activity</h4>
                  <span className="text-[9px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded font-medium">Demo Data</span>
                </div>
                <button
                  onClick={() => onNavigate("mylearning")}
                  className="text-xs font-semibold text-neutral-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                >
                  View all <span>→</span>
                </button>
              </div>

              <div className="space-y-3">
                {/* Item 1 */}
                <div className="flex items-center justify-between p-2 rounded-[8px] hover:bg-white/[0.04] transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-[8px] bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white leading-tight">
                        Completed: <span className="font-medium text-neutral-300">Loops and Iteration Quiz</span>
                      </p>
                      <span className="text-[10px] text-neutral-500">2 hours ago</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-[6px] shrink-0">
                    +12 mastery
                  </span>
                </div>

                {/* Item 2 */}
                <div className="flex items-center justify-between p-2 rounded-[8px] hover:bg-white/[0.04] transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-[8px] bg-indigo-500/15 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white leading-tight">
                        Practiced: <span className="font-medium text-neutral-300">List Manipulation (Hands-on)</span>
                      </p>
                      <span className="text-[10px] text-neutral-500">5 hours ago</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-[6px] shrink-0">
                    +8 mastery
                  </span>
                </div>

                {/* Item 3 */}
                <div className="flex items-center justify-between p-2 rounded-[8px] hover:bg-white/[0.04] transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-[8px] bg-amber-500/15 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white leading-tight">
                        Explored: <span className="font-medium text-neutral-300">File Handling in Python</span>
                      </p>
                      <span className="text-[10px] text-neutral-500">1 day ago</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-[6px] shrink-0">
                    +6 mastery
                  </span>
                </div>
              </div>
            </SpotlightCard>

            {/* Next Up: Practical Demonstration (Pedagogical Step) - Canonical 14px card */}
            <SpotlightCard
              theme="dark"
              spotlightColor="#ffffff"
              intensity={0.02}
              borderGlow={0.30}
              className="md:col-span-5 bg-[#111111] rounded-[14px] p-5 border border-white/[0.08] shadow-sm flex flex-col justify-between"
              data-purpose="next-up-challenge"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-white tracking-wide uppercase">Next Requirement</span>
                  <span className="text-[9px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">
                    Code Challenge
                  </span>
                </div>
                <div className="flex items-start space-x-3.5 mb-3">
                  <div className="w-10 h-10 rounded-[10px] bg-rose-500/15 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" />
                      <circle cx="12" cy="12" r="6" />
                      <circle cx="12" cy="12" r="2" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-white">Hands-on Code Demonstration</h4>
                    <p className="text-[11px] text-neutral-300 mt-1 leading-snug">
                      Apply {currentChapter ? currentChapter.title : "modular programming"} in a sandbox to establish defensible empirical evidence.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onContinueCourse(activeSlug)}
                className="w-full bg-[#E95945] hover:bg-[#D84B38] text-white font-bold text-xs py-2.5 px-4 rounded-[8px] shadow-md transition-colors flex items-center justify-center space-x-1.5 active:scale-98 cursor-pointer"
              >
                <span>Continue Code Challenge</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </SpotlightCard>
          </div>
          {/* END: BottomSplitWidgets */}
        </div>
        {/* END: Left 8-Column */}

        {/* RIGHT 4-COLUMN WIDGETS */}
        <div className="xl:col-span-4 space-y-6">
          {/* BEGIN: CertificationProgressCard - Canonical 14px card, 10px wells */}
          <SpotlightCard
            theme="dark"
            spotlightColor="#ffffff"
            intensity={0.02}
            borderGlow={0.30}
            className="bg-[#111111] rounded-[14px] p-6 shadow-sm border border-white/[0.08] space-y-5"
            data-purpose="certification-progress-container"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-white">Certification Progress</h3>
              <button
                onClick={() => onNavigate("credentials")}
                className="text-xs font-semibold text-neutral-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
              >
                View all <span>→</span>
              </button>
            </div>

            {/* Medal Badge & Course Quick Status: Real Backend Evidence */}
            <div
              className="flex items-center space-x-3.5 p-3 rounded-[10px] bg-white/[0.04] border border-white/[0.06]"
              data-metric-type="backend-derived"
            >
              <div className="w-12 h-12 rounded-[10px] bg-gradient-to-br from-amber-950 via-slate-900 to-amber-700 flex items-center justify-center shadow-sm shrink-0">
                <svg className="w-6 h-6 text-amber-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2a5 5 0 015 5c0 1.95-.97 3.69-2.45 4.54L16 20l-4-2-4 2 1.45-8.46A4.992 4.992 0 017 7a5 5 0 015-5zm0 2a3 3 0 100 6 3 3 0 000-6z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-extrabold text-white">Python Fundamentals</h4>
                <span className="text-[10px] font-semibold text-amber-400">In Progress</span>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${averageMastery}%` }}></div>
                  </div>
                  <span className="text-[10px] font-bold text-neutral-300">{averageMastery}%</span>
                </div>
              </div>
            </div>

            {/* Checklist Items: Backend Derived Progress Status */}
            <div className="space-y-3 pt-1 text-xs" data-metric-type="backend-derived">
              <div className="flex items-center justify-between text-neutral-200">
                <div className="flex items-center space-x-2.5">
                  <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="font-semibold text-white">Complete all chapters</span>
                </div>
                <span className="text-[11px] font-bold text-neutral-400">{currentChapterOrder} / {totalChapters}</span>
              </div>

              <div className="flex items-center justify-between text-neutral-300">
                <div className="flex items-center space-x-2.5">
                  <div className="w-4 h-4 rounded-full border border-white/20 shrink-0"></div>
                  <span className="font-medium text-neutral-400">Pass final assessment</span>
                </div>
                <span className="text-[11px] font-medium text-neutral-500">Not started</span>
              </div>

              <div className="flex items-center justify-between text-neutral-300">
                <div className="flex items-center space-x-2.5">
                  <div className="w-4 h-4 rounded-full border border-white/20 shrink-0"></div>
                  <span className="font-medium text-neutral-400">Earn your certificate</span>
                </div>
                <span className="text-[11px] font-medium text-neutral-500">Not started</span>
              </div>
            </div>

            {/* Motivation Callout Card */}
            <div className="p-3.5 bg-rose-500/10 rounded-[10px] border border-rose-500/20 flex items-center space-x-3">
              <div className="w-8 h-8 rounded-[8px] bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.458 14.96 14.96 0 01.06-.312m4.699 2.71c.103.021.207.041.312.06a15.09 15.09 0 002.448-2.458 14.96 14.96 0 00-.06-.312" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <h5 className="text-xs font-bold text-white">You're on your way!</h5>
                <p className="text-[10px] text-neutral-300">Keep learning to unlock your certification.</p>
              </div>
            </div>
          </SpotlightCard>
          {/* END: CertificationProgressCard */}

          {/* BEGIN: AIInsightsCard - Canonical 14px card, 10px well */}
          <SpotlightCard
            theme="dark"
            spotlightColor="#ffffff"
            intensity={0.02}
            borderGlow={0.30}
            className="bg-[#111111] rounded-[14px] p-6 shadow-sm border border-white/[0.08]"
            data-purpose="ai-insights-widget"
          >
            <div className="flex items-center space-x-2 mb-3">
              <h3 className="text-sm font-bold text-white">AI Insights</h3>
              <span className="text-[9px] font-bold uppercase tracking-wider text-purple-300 bg-purple-500/20 border border-purple-500/30 px-2 py-0.5 rounded-full">
                Beta
              </span>
            </div>
            <div className="flex items-start space-x-3.5 bg-white/[0.04] p-3 rounded-[10px] border border-white/[0.06]">
              <div className="w-8 h-8 rounded-[8px] bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
                </svg>
              </div>
              <div>
                <h4 className="text-xs font-bold text-white leading-snug">You're making steady progress!</h4>
                <p className="text-[11px] text-neutral-300 mt-1 leading-relaxed">
                  Your conceptual understanding is strong. Focus a bit more on hands-on practice.
                </p>
              </div>
            </div>
          </SpotlightCard>
          {/* END: AIInsightsCard */}

          {/* BEGIN: MasteryOverviewCard - Canonical 14px card */}
          <SpotlightCard
            theme="dark"
            spotlightColor="#ffffff"
            intensity={0.02}
            borderGlow={0.30}
            className="bg-[#111111] rounded-[14px] p-6 shadow-sm border border-white/[0.08] space-y-5"
            data-purpose="mastery-overview-widget"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-white">Mastery Overview</h3>
              <button
                onClick={() => onNavigate("mylearning")}
                className="text-xs font-semibold text-neutral-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
              >
                View details <span>→</span>
              </button>
            </div>

            {/* 3 Radial Progress Meters */}
            <div className="grid grid-cols-3 gap-2 text-center pt-2">
              {/* Gauge 1: Understanding - REAL BACKEND EVIDENCE (Bayesian Knowledge Tracing average) */}
              <div className="flex flex-col items-center" data-metric-type="backend-derived">
                <div className="relative w-16 h-16 flex items-center justify-center mb-2">
                  <svg className="w-16 h-16 meter-circle" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.08)"
                      strokeWidth="3"
                    />
                    <path
                      className="text-emerald-500"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#10B981"
                      strokeDasharray={`${averageMastery}, 100`}
                      strokeLinecap="round"
                      strokeWidth="3.2"
                    />
                  </svg>
                  <span className="absolute text-xs font-extrabold text-white">{averageMastery}%</span>
                </div>
                <h5 className="text-xs font-bold text-white">Understanding</h5>
                <p className="text-[9px] text-neutral-400 mt-0.5">{masteredConcepts} of {totalConcepts} mastered</p>
                <span className="text-[8px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1 py-0.2 rounded mt-1">Real Evidence</span>
              </div>

              {/* Gauge 2: Application 62% - TEMPORARY UI/DEMO DATA */}
              <div className="flex flex-col items-center" data-metric-type="demo-telemetry">
                <div className="relative w-16 h-16 flex items-center justify-center mb-2">
                  <svg className="w-16 h-16 meter-circle" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.08)"
                      strokeWidth="3"
                    />
                    <path
                      className="text-emerald-500"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#10B981"
                      strokeDasharray="62, 100"
                      strokeLinecap="round"
                      strokeWidth="3.2"
                    />
                  </svg>
                  <span className="absolute text-xs font-extrabold text-white">62%</span>
                </div>
                <h5 className="text-xs font-bold text-white">Application</h5>
                <p className="text-[9px] text-neutral-400 mt-0.5">Practice problem solving</p>
                <span className="text-[8px] font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1 py-0.2 rounded mt-1">Demo Data</span>
              </div>

              {/* Gauge 3: Consistency 85% - TEMPORARY UI/DEMO DATA */}
              <div className="flex flex-col items-center" data-metric-type="demo-telemetry">
                <div className="relative w-16 h-16 flex items-center justify-center mb-2">
                  <svg className="w-16 h-16 meter-circle" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.08)"
                      strokeWidth="3"
                    />
                    <path
                      className="text-emerald-500"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#10B981"
                      strokeDasharray="85, 100"
                      strokeLinecap="round"
                      strokeWidth="3.2"
                    />
                  </svg>
                  <span className="absolute text-xs font-extrabold text-white">85%</span>
                </div>
                <h5 className="text-xs font-bold text-white">Consistency</h5>
                <p className="text-[9px] text-neutral-400 mt-0.5">Great learning habits</p>
                <span className="text-[8px] font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1 py-0.2 rounded mt-1">Demo Data</span>
              </div>
            </div>

            {/* Bottom Banner: Earn a verifiable certificate */}
            <div className="bg-white/[0.04] border border-white/[0.06] text-white rounded-[10px] p-3.5 flex items-center justify-between shadow-md relative overflow-hidden">
              <div className="flex items-center space-x-3 z-10">
                <div className="w-12 h-9 rounded-[6px] bg-black/40 border border-amber-400/40 p-1 flex items-center justify-center shrink-0">
                  <div className="w-full h-full bg-[#111111] border border-dashed border-amber-300/30 rounded-[4px] flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                  </div>
                </div>
                <div>
                  <h5 className="text-xs font-bold text-neutral-100 leading-tight">Earn a verifiable certificate</h5>
                  <p className="text-[10px] text-neutral-400">Demonstrate your skills. Stand out globally.</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate("credentials")}
                aria-label="Learn more about certificates"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors shrink-0 z-10 active:scale-95 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </SpotlightCard>
          {/* END: MasteryOverviewCard */}
        </div>
        {/* END: Right 4-Column */}
      </div>
    </div>
  );
};
