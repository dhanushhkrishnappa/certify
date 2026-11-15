import React, { useEffect, useState } from "react";
import { api } from "../services/api.js";
import type { CourseDetail, User } from "../types/index.js";
import { useTheme } from "../context/ThemeContext.js";

interface CourseDetailsViewProps {
  courseSlug: string;
  onStartCourse: (slug: string) => void;
  onNavigate: (view: string) => void;
  onSelectRelatedCourse?: (slug: string) => void;
  user?: User | null;
}

export const CourseDetailsView: React.FC<CourseDetailsViewProps> = ({
  courseSlug,
  onStartCourse,
  onNavigate,
  onSelectRelatedCourse,
  user: _user,
}) => {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "curriculum" | "projects" | "skills" | "reviews" | "faq"
  >("overview");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [currentChapterOrder, setCurrentChapterOrder] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    Promise.all([
      api.getCourseBySlug(courseSlug).catch(() => null),
      api.getSessionContext(courseSlug).catch(() => null),
    ]).then(([detailRes, sessionRes]) => {
      if (mounted) {
        if (detailRes?.course) {
          setCourse(detailRes.course);
          // Expand first 2 modules by default
          const initialExpanded: Record<string, boolean> = {};
          detailRes.course.modules?.slice(0, 2).forEach((m) => {
            initialExpanded[m.id] = true;
          });
          setExpandedModules(initialExpanded);
        }
        if (sessionRes?.session) {
          setIsEnrolled(true);
          setCurrentChapterOrder(sessionRes.session.chapter?.sequenceOrder || 1);
        }
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, [courseSlug]);

  const toggleModule = (modId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [modId]: !prev[modId],
    }));
  };

  const totalModulesCount = course?.modules?.length || 8;
  const totalChaptersCount = course?.modules?.reduce((sum, m) => sum + (m.chapters?.length || 0), 0) || 9;

  return (
    <div className="space-y-6" data-purpose="course-details-page">
      {/* BEGIN: Breadcrumbs */}
      <nav className={`flex items-center space-x-2 text-xs font-medium mb-1 transition-colors duration-300 ${
        isLight ? "text-purple-900/70" : "text-purple-200/70"
      }`} aria-label="Breadcrumb">
        <button
          onClick={() => onNavigate("catalog")}
          className={`hover:opacity-100 flex items-center transition-colors cursor-pointer ${
            isLight ? "text-purple-950 hover:text-purple-700" : "hover:text-white"
          }`}
        >
          <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Explore Courses</span>
        </button>
        <span className={isLight ? "text-purple-400" : "text-purple-300/40"}>/</span>
        <span className={`font-semibold ${isLight ? "text-purple-950" : "text-white"}`}>{course?.title || "Python Fundamentals"}</span>
      </nav>
      {/* END: Breadcrumbs */}

      {/* BEGIN: HeaderSection */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4" data-purpose="course-header-section">
        <div>
          <h1 className={`text-3xl font-extrabold tracking-tight font-sans transition-colors duration-300 ${
            isLight ? "text-slate-900" : "text-white"
          }`}>
            {course?.title || "Python Fundamentals"}
          </h1>
          <p className={`text-sm mt-1.5 font-normal max-w-3xl leading-relaxed transition-colors duration-300 ${
            isLight ? "text-slate-700" : "text-purple-200/80"
          }`}>
            {course?.summary || "Master Python from first principles. Build real projects, solve problems, and get certified."}
          </p>

          {/* Course Meta Badges */}
          <div className={`flex flex-wrap items-center gap-6 mt-3.5 text-xs font-medium ${
            isLight ? "text-slate-700" : "text-purple-200/70"
          }`}>
            <div className="flex items-center space-x-1.5">
              <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11h3v6H2v-6zm5-4h3v10H7V7zm5-4h3v14h-3V3z" />
              </svg>
              <span className={`font-semibold ${isLight ? "text-emerald-700" : "text-emerald-300"}`}>Beginner</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <svg className={`w-4 h-4 stroke-[2] ${isLight ? "text-purple-600" : "text-purple-300/60"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>{totalModulesCount} modules</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <svg className={`w-4 h-4 stroke-[2] ${isLight ? "text-purple-600" : "text-purple-300/60"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>36.5 hours</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <svg className={`w-4 h-4 stroke-[2] ${isLight ? "text-purple-600" : "text-purple-300/60"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Certification</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <svg className={`w-4 h-4 stroke-[2] ${isLight ? "text-purple-600" : "text-purple-300/60"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>12K+ learners</span>
            </div>
          </div>
        </div>

        {/* Top Right Actions */}
        <div className="flex items-center space-x-2.5 shrink-0 self-start md:self-auto">
          <button
            onClick={() => setIsBookmarked(!isBookmarked)}
            aria-label="Bookmark course"
            className={`w-11 h-11 border rounded-[8px] flex items-center justify-center transition-colors cursor-pointer ${
              isBookmarked
                ? "border-red-400 bg-red-500/20 text-red-400"
                : isLight
                ? "border-purple-900/15 text-slate-700 hover:text-red-600 hover:border-red-300 hover:bg-white/80 bg-white"
                : "border-white/20 text-purple-200 hover:text-red-400 hover:border-red-300 hover:bg-white/10"
            }`}
          >
            <svg
              className="w-5 h-5 stroke-[1.8]"
              fill={isBookmarked ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <button
            onClick={() => onStartCourse(courseSlug)}
            className={`font-bold px-6 py-2.5 rounded-[8px] text-sm flex items-center space-x-2 shadow-lg transition active:scale-98 cursor-pointer ${
              isLight
                ? "bg-[#5B4DF0] hover:bg-[#4D3DE0] text-white"
                : "bg-white hover:bg-purple-50 text-[#15062B]"
            }`}
          >
            <span>{isEnrolled ? "Continue Learning" : "Enroll Now"}</span>
            <svg className="w-4 h-4 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
      {/* END: HeaderSection */}

      {/* BEGIN: NavigationTabs */}
      <div className={`border-b mb-6 ${isLight ? "border-purple-900/15" : "border-white/10"}`} data-purpose="course-tabs">
        <nav className={`flex space-x-7 text-xs font-semibold ${isLight ? "text-slate-700" : "text-purple-200/70"}`} aria-label="Course Sections">
          {(
            [
              { id: "overview", label: "Overview" },
              { id: "curriculum", label: "Curriculum" },
              { id: "projects", label: "Projects" },
              { id: "skills", label: "Skills" },
              { id: "reviews", label: "Reviews" },
              { id: "faq", label: "FAQ" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 transition-colors cursor-pointer text-xs ${
                activeTab === tab.id
                  ? isLight
                    ? "border-b-2 border-purple-900 text-purple-950 font-bold"
                    : "border-b-2 border-purple-400 text-white font-bold"
                  : isLight
                  ? "hover:text-purple-950 font-medium"
                  : "hover:text-white font-medium"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      {/* END: NavigationTabs */}

      {/* BEGIN: Dual-Column Layout (8 cols left : 4 cols right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* LEFT 8-COLUMN CONTENT AREA */}
        <div className="lg:col-span-8 space-y-6">
          {/* BEGIN: HeroBanner - Canonical 20px surface */}
          <div
            className={`relative overflow-hidden rounded-[20px] p-8 md:p-10 shadow-lg border transition-all duration-300 ${
              isLight
                ? "bg-white text-slate-900 border-purple-900/10 shadow-[0_12px_36px_rgba(76,29,149,0.08)]"
                : "bg-[#0b0f19] text-white border-neutral-800"
            }`}
            data-purpose="hero-banner"
          >
            {/* Subtle Radial Gradient Glow */}
            <div className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${
              isLight
                ? "bg-[radial-gradient(circle_at_60%_50%,rgba(124,58,237,0.06),transparent_60%)]"
                : "bg-[radial-gradient(circle_at_60%_50%,rgba(37,99,235,0.22),transparent_60%)]"
            }`}></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Left: Punchy Text Stack & Preview Button */}
              <div className="flex-1 space-y-5">
                <div className={`space-y-0.5 font-sans text-3xl md:text-4xl font-extrabold tracking-tight leading-tight transition-colors duration-300 ${
                  isLight ? "text-slate-900" : "text-neutral-100"
                }`}>
                  <div>Think</div>
                  <div>Build</div>
                  <div>Solve</div>
                  <div>Grow</div>
                </div>
                <p className={`text-xs font-sans tracking-wide transition-colors duration-300 ${
                  isLight ? "text-slate-600" : "text-neutral-400"
                }`}>
                  Start your Python journey today. Build real skills. Think deeper. Get certified.
                </p>
                <div>
                  <button
                    onClick={() => onStartCourse(courseSlug)}
                    className={`inline-flex items-center space-x-3 px-4 py-2 rounded-full font-medium shadow transition-colors text-xs active:scale-98 cursor-pointer ${
                      isLight
                        ? "bg-purple-50 text-purple-900 hover:bg-purple-100 border border-purple-200"
                        : "bg-white text-neutral-900 hover:bg-neutral-100"
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center pl-0.5 ${
                      isLight ? "bg-[#7C3AED] text-white" : "bg-neutral-900 text-white"
                    }`}>
                      <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="font-bold leading-none">Watch Preview</span>
                      <span className={`text-[10px] mt-0.5 ${isLight ? "text-purple-600" : "text-neutral-500"}`}>2 min</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Right: Python 3D Logo & Code Terminal */}
              <div className="flex items-center space-x-5 shrink-0">
                {/* 3D Python Logo Mockup SVG */}
                <div className="w-28 h-28 relative flex items-center justify-center filter drop-shadow-[0_12px_24px_rgba(48,105,152,0.45)]">
                  <svg className="w-28 h-28" fill="none" viewBox="0 0 110 110">
                    <path
                      d="M53.5 12C33.7 12 34.6 20.6 34.6 20.6L34.7 29.5H54V32.2H26.3C16.8 32.2 12 38.3 12 52.8C12 67.3 19.3 67.8 19.3 67.8H25.3V59.4C25.3 49.6 33.7 49.6 33.7 49.6H53.5C62.4 49.6 62.4 41.6 62.4 41.6V20.8C62.4 12 53.5 12 53.5 12ZM41.8 17.6C44.4 17.6 46.5 19.7 46.5 22.3C46.5 24.9 44.4 27 41.8 27C39.2 27 37.1 24.9 37.1 22.3C37.1 19.7 39.2 17.6 41.8 17.6Z"
                      fill="url(#py-blue-grad)"
                    />
                    <path
                      d="M56.5 98C76.3 98 75.4 89.4 75.4 89.4L75.3 80.5H56V77.8H83.7C93.2 77.8 98 71.7 98 57.2C98 42.7 90.7 42.2 90.7 42.2H84.7V50.6C84.7 60.4 76.3 60.4 76.3 60.4H56.5C47.6 60.4 47.6 68.4 47.6 68.4V89.2C47.6 98 56.5 98 56.5 98ZM68.2 92.4C65.6 92.4 63.5 90.3 63.5 87.7C63.5 85.1 65.6 83 68.2 83C70.8 83 72.9 85.1 72.9 87.7C72.9 90.3 70.8 92.4 68.2 92.4Z"
                      fill="url(#py-yellow-grad)"
                    />
                    <defs>
                      <linearGradient id="py-blue-grad" x1="12" y1="12" x2="62.4" y2="67.8" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#4B8BBE" />
                        <stop offset="1" stopColor="#306998" />
                      </linearGradient>
                      <linearGradient id="py-yellow-grad" x1="98" y1="98" x2="47.6" y2="42.2" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#FFE873" />
                        <stop offset="1" stopColor="#FFD43B" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                {/* Python Code Display */}
                <div className="font-mono text-[11px] leading-relaxed select-none text-neutral-300 hidden sm:block">
                  <div className="text-indigo-400 font-medium">def <span className="text-yellow-300">learn</span>():</div>
                  <div className="pl-4 text-sky-300">build()</div>
                  <div className="pl-4 text-emerald-400">practice()</div>
                  <div className="pl-4 text-teal-300">get_certified()</div>
                  <div className="pl-4"><span className="text-rose-400">return</span> <span className="text-amber-300">"Success"</span></div>
                </div>
              </div>
            </div>
          </div>
          {/* END: DarkHeroBanner */}

          {/* BEGIN: FourValueProps - Canonical 14px cards, 10px wells */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5" data-purpose="features-grid">
            <div className={`p-4 rounded-[14px] border flex flex-col justify-between transition-shadow ${
              isLight ? "bg-white border-purple-900/10 text-slate-900 shadow-sm" : "bg-[#111111] border-white/[0.08] text-white shadow-xs"
            }`}>
              <div className="w-8 h-8 rounded-[10px] bg-purple-500/15 border border-purple-500/20 text-purple-300 flex items-center justify-center mb-3">
                <svg className="w-4 h-4 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <h4 className={`text-xs font-bold ${isLight ? "text-slate-900" : "text-white"}`}>Structured Learning</h4>
                <p className={`text-[11px] mt-0.5 ${isLight ? "text-slate-600" : "text-neutral-400"}`}>Step-by-step curriculum</p>
              </div>
            </div>

            <div className={`p-4 rounded-[14px] border flex flex-col justify-between transition-shadow ${
              isLight ? "bg-white border-purple-900/10 text-slate-900 shadow-sm" : "bg-[#111111] border-white/[0.08] text-white shadow-xs"
            }`}>
              <div className="w-8 h-8 rounded-[10px] bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                <svg className="w-4 h-4 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <h4 className={`text-xs font-bold ${isLight ? "text-slate-900" : "text-white"}`}>Hands-on Practice</h4>
                <p className={`text-[11px] mt-0.5 ${isLight ? "text-slate-600" : "text-neutral-400"}`}>Code, build, and apply</p>
              </div>
            </div>

            <div className={`p-4 rounded-[14px] border flex flex-col justify-between transition-shadow ${
              isLight ? "bg-white border-purple-900/10 text-slate-900 shadow-sm" : "bg-[#111111] border-white/[0.08] text-white shadow-xs"
            }`}>
              <div className="w-8 h-8 rounded-[10px] bg-rose-500/15 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-3">
                <svg className="w-4 h-4 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9" />
                  <circle cx="12" cy="12" r="5" />
                  <circle cx="12" cy="12" r="1" />
                </svg>
              </div>
              <div>
                <h4 className={`text-xs font-bold ${isLight ? "text-slate-900" : "text-white"}`}>Real-world Projects</h4>
                <p className={`text-[11px] mt-0.5 ${isLight ? "text-slate-600" : "text-neutral-400"}`}>Build a portfolio</p>
              </div>
            </div>

            <div className={`p-4 rounded-[14px] border flex flex-col justify-between transition-shadow ${
              isLight ? "bg-white border-purple-900/10 text-slate-900 shadow-sm" : "bg-[#111111] border-white/[0.08] text-white shadow-xs"
            }`}>
              <div className="w-8 h-8 rounded-[10px] bg-amber-500/15 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
                <svg className="w-4 h-4 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <h4 className={`text-xs font-bold ${isLight ? "text-slate-900" : "text-white"}`}>Earn a Certificate</h4>
                <p className={`text-[11px] mt-0.5 ${isLight ? "text-slate-600" : "text-neutral-400"}`}>Showcase your skills</p>
              </div>
            </div>
          </div>
          {/* END: FourValueProps */}

          {/* BEGIN: DualLearningSkillsRow - Canonical 14px cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Card 1: What You'll Learn */}
            <div className={`p-6 rounded-[14px] border transition-shadow ${
              isLight ? "bg-white border-purple-900/10 text-slate-900 shadow-sm" : "bg-[#111111] border-white/[0.08] text-white shadow-xs"
            }`} data-purpose="what-you-will-learn">
              <div className="flex items-center space-x-2.5 mb-4">
                <div className="text-purple-500">
                  <svg className="w-5 h-5 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3 className={`font-bold text-sm ${isLight ? "text-slate-900" : "text-white"}`}>What You'll Learn</h3>
              </div>
              <ul className={`space-y-2.5 text-xs ${isLight ? "text-slate-700" : "text-neutral-300"}`}>
                {[
                  "Understand Python syntax and core concepts",
                  "Work with variables, data types, and operators",
                  "Write and organize code using modular functions",
                  "Handle real-world data using lists, tuples, dictionaries",
                  "Work with file I/O, persistence and exceptions",
                  "Object-oriented programming in Python",
                  "Defend programming decisions during AI oral viva",
                  "Solve programming problems with defensible evidence",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start space-x-2.5">
                    <svg className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path clipRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" fillRule="evenodd" />
                    </svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Card 2: Skills You'll Gain */}
            <div className={`p-6 rounded-[14px] border flex flex-col justify-between transition-shadow ${
              isLight ? "bg-white border-purple-900/10 text-slate-900 shadow-sm" : "bg-[#111111] border-white/[0.08] text-white shadow-xs"
            }`} data-purpose="skills-gained">
              <div>
                <div className="flex items-center space-x-2.5 mb-4">
                  <div className="text-purple-500">
                    <svg className="w-5 h-5 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h3 className={`font-bold text-sm ${isLight ? "text-slate-900" : "text-white"}`}>Skills You'll Gain</h3>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {[
                    "Python Programming",
                    "Problem Solving",
                    "OOP Architecture",
                    "Data Structures",
                    "File Handling",
                    "Exception Handling",
                    "Debugging & Profiling",
                    "Code Organization",
                    "Empirical Demonstration",
                    "Analytical Defense",
                  ].map((skill, idx) => (
                    <span key={idx} className={`px-3 py-1.5 font-medium text-xs rounded-full border ${
                      isLight
                        ? "bg-purple-50 text-purple-950 border-purple-200"
                        : "bg-white/[0.06] text-neutral-200 border-white/10"
                    }`}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Course Version Indicator */}
              <div className={`pt-4 border-t flex items-center justify-between text-[11px] ${
                isLight ? "border-purple-900/10 text-slate-600" : "border-white/[0.08] text-neutral-400"
              }`}>
                <span>Curriculum Version: <strong className={isLight ? "text-slate-900 font-semibold" : "text-white font-semibold"}>{course?.version || "1.0.0"}</strong></span>
                <span>Deterministic Verification</span>
              </div>
            </div>
          </div>
          {/* END: DualLearningSkillsRow */}

          {/* BEGIN: CourseCurriculumAccordion - Real Backend Course Syllabus */}
          <div className={`p-6 rounded-[14px] border space-y-4 transition-shadow ${
            isLight ? "bg-white border-purple-900/10 text-slate-900 shadow-sm" : "bg-[#111111] border-white/[0.08] text-white shadow-xs"
          }`} data-purpose="curriculum-section">
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`font-bold text-base ${isLight ? "text-slate-900" : "text-white"}`}>Course Curriculum</h3>
                <p className={`text-xs mt-0.5 ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                  {totalModulesCount} modules • {totalChaptersCount} chapters • Socratic AI Learning Studio
                </p>
              </div>
              <button
                onClick={() => {
                  const allOpen = Object.keys(expandedModules).length === (course?.modules?.length || 0);
                  if (allOpen) {
                    setExpandedModules({});
                  } else {
                    const all: Record<string, boolean> = {};
                    course?.modules?.forEach((m) => { all[m.id] = true; });
                    setExpandedModules(all);
                  }
                }}
                className={`text-xs font-semibold transition-colors cursor-pointer ${
                  isLight ? "text-purple-700 hover:text-purple-950" : "text-neutral-300 hover:text-white"
                }`}
              >
                {Object.keys(expandedModules).length === (course?.modules?.length || 0) ? "Collapse All" : "Expand All"}
              </button>
            </div>

            {/* Modules List */}
            <div className="space-y-3 pt-2">
              {course?.modules && course.modules.length > 0 ? (
                course.modules.map((mod, idx) => {
                  const isOpen = !!expandedModules[mod.id];
                  return (
                    <div
                      key={mod.id || idx}
                      className={`border rounded-[10px] overflow-hidden transition-all duration-200 ${
                        isLight ? "bg-white border-purple-900/15" : "bg-[#111111] border-white/[0.08]"
                      }`}
                    >
                      {/* Module Header Bar */}
                      <button
                        onClick={() => toggleModule(mod.id)}
                        className={`w-full p-4 flex items-center justify-between transition-colors text-left cursor-pointer ${
                          isLight ? "bg-purple-50/40 hover:bg-purple-50 text-slate-900" : "bg-white/[0.03] hover:bg-white/[0.06] text-white"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className={`w-6 h-6 rounded-full border font-bold text-xs flex items-center justify-center shrink-0 ${
                            isLight ? "bg-purple-200 text-purple-900 border-purple-300" : "bg-white/10 text-white border-white/20"
                          }`}>
                            {mod.sequenceOrder || idx + 1}
                          </span>
                          <div>
                            <h4 className={`text-xs font-bold ${isLight ? "text-slate-900" : "text-white"}`}>{mod.title}</h4>
                            <span className={`text-[10px] ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
                              {mod.chapters?.length || 0} chapters
                            </span>
                          </div>
                        </div>

                        <svg
                          className={`w-4 h-4 transition-transform duration-200 ${
                            isLight ? "text-slate-500" : "text-neutral-400"
                          } ${isOpen ? "rotate-180" : ""}`}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>

                      {/* Chapters Dropdown */}
                      {isOpen && mod.chapters && mod.chapters.length > 0 && (
                        <div className={`p-3 space-y-2 border-t ${
                          isLight ? "bg-slate-50 border-purple-900/10" : "bg-[#111111] border-white/[0.08]"
                        }`}>
                          {mod.chapters.map((ch) => (
                            <div
                              key={ch.id}
                              className={`p-2.5 rounded-[8px] flex items-center justify-between transition-colors ${
                                isLight ? "bg-white border border-purple-900/10 hover:bg-purple-50/40" : "bg-white/[0.04] hover:bg-white/[0.07]"
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <span className={`text-[11px] font-bold ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
                                  {ch.sequenceOrder}.
                                </span>
                                <div>
                                  <h5 className={`text-xs font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>{ch.title}</h5>
                                  {ch.concepts && ch.concepts.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-1">
                                      {ch.concepts.map((concept) => (
                                        <span
                                          key={concept.id}
                                          className={`text-[9px] font-medium px-2 py-0.5 rounded border ${
                                            isLight
                                              ? "bg-purple-50 text-purple-900 border-purple-200"
                                              : "bg-white/[0.06] text-neutral-300 border-white/10"
                                          }`}
                                        >
                                          {concept.name}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center space-x-2 shrink-0">
                                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                  Oral Viva
                                </span>
                                <span className="text-[9px] font-bold text-purple-700 bg-purple-500/15 px-2 py-0.5 rounded-full border border-purple-500/25">
                                  Lab Demo
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className={`text-center py-6 text-xs ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
                  {isLoading ? "Loading curriculum syllabus..." : "Curriculum data ready."}
                </div>
              )}
            </div>
          </div>
          {/* END: CourseCurriculumAccordion */}

          {/* BEGIN: Assessment & Certification Pathway Section */}
          <div className={`p-6 rounded-[14px] border space-y-4 transition-shadow ${
            isLight ? "bg-white border-purple-900/10 text-slate-900 shadow-sm" : "bg-[#111111] border-white/[0.08] text-white shadow-xs"
          }`} data-purpose="certification-pathway-section">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-[10px] bg-amber-500/15 border border-amber-500/20 text-amber-500 flex items-center justify-center">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2a5 5 0 015 5c0 1.95-.97 3.69-2.45 4.54L16 20l-4-2-4 2 1.45-8.46A4.992 4.992 0 017 7a5 5 0 015-5zm0 2a3 3 0 100 6 3 3 0 000-6z" />
                </svg>
              </div>
              <div>
                <h3 className={`font-bold text-sm ${isLight ? "text-slate-900" : "text-white"}`}>Defensible Certification Pathway</h3>
                <p className={`text-[11px] ${isLight ? "text-slate-600" : "text-neutral-400"}`}>How you earn your verified credential</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className={`p-3.5 rounded-[10px] border space-y-1.5 ${
                isLight ? "bg-purple-50/50 border-purple-100" : "bg-white/[0.04] border-white/[0.06]"
              }`}>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                  isLight ? "text-slate-500" : "text-neutral-400"
                }`}>Tier 1</span>
                <h4 className={`text-xs font-bold ${isLight ? "text-slate-900" : "text-white"}`}>Foundation Credential</h4>
                <p className={`text-[11px] leading-relaxed ${isLight ? "text-slate-600" : "text-neutral-300"}`}>
                  Consistent chapter completion, formative assessments, and conceptual knowledge checks.
                </p>
              </div>

              <div className={`p-3.5 rounded-[10px] border space-y-1.5 ${
                isLight ? "bg-purple-50/50 border-purple-100" : "bg-white/[0.04] border-white/[0.06]"
              }`}>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">Tier 2</span>
                <h4 className={`text-xs font-bold ${isLight ? "text-slate-900" : "text-white"}`}>Proficient Credential</h4>
                <p className={`text-[11px] leading-relaxed ${isLight ? "text-slate-600" : "text-neutral-300"}`}>
                  Applied problem solving, code invariant verification, and verified Bayesian mastery metrics.
                </p>
              </div>

              <div className={`p-3.5 rounded-[10px] border space-y-1.5 ${
                isLight ? "bg-purple-50/50 border-purple-100" : "bg-white/[0.04] border-white/[0.06]"
              }`}>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Tier 3</span>
                <h4 className={`text-xs font-bold ${isLight ? "text-slate-900" : "text-white"}`}>Advanced Master</h4>
                <p className={`text-[11px] leading-relaxed ${isLight ? "text-slate-600" : "text-neutral-300"}`}>
                  High-order code demonstration, sandbox execution, and oral AI Viva defense with transcript.
                </p>
              </div>
            </div>

            <div className={`p-3 rounded-[10px] border flex items-center space-x-3 text-xs ${
              isLight ? "bg-rose-50 border-rose-200 text-slate-700" : "bg-rose-500/10 border-rose-500/20 text-neutral-200"
            }`}>
              <span className={`font-bold shrink-0 ${isLight ? "text-rose-600" : "text-rose-400"}`}>Evidence Rule:</span>
              <span>
                Certificates are issued with a <strong>Unique Credential ID</strong> and database-backed verification. Every badge represents recorded empirical demonstration.
              </span>
            </div>
          </div>
          {/* END: Assessment & Certification Pathway Section */}
        </div>
        {/* END: Left 8-Column Area */}

        {/* BEGIN: RightSidebarColumn (4 cols) */}
        <div className="lg:col-span-4 space-y-5" data-purpose="right-sidebar">
          {/* Card 1: Start Your Learning Journey - Canonical 14px card */}
          <div className={`p-6 rounded-[14px] border transition-shadow ${
            isLight ? "bg-white border-purple-900/10 text-slate-900 shadow-sm" : "bg-[#111111] border-white/[0.08] text-white shadow-xs"
          }`}>
            <div className="flex items-center space-x-2.5 mb-4">
              <div className="w-7 h-7 rounded-[8px] bg-purple-500/15 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                <svg className="w-4 h-4 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className={`font-bold text-sm ${isLight ? "text-slate-900" : "text-white"}`}>Start Your Learning Journey</h3>
            </div>

            <ul className={`space-y-2.5 text-xs mb-6 ${isLight ? "text-slate-700" : "text-neutral-300"}`}>
              {[
                "Learn at your own pace",
                "AI-powered personalized learning",
                "Hands-on practice and projects",
                "Assessments and AI viva",
                "Earn a verified certificate",
              ].map((text, idx) => (
                <li key={idx} className="flex items-center space-x-2.5">
                  <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path clipRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" fillRule="evenodd" />
                  </svg>
                  <span>{text}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => onStartCourse(courseSlug)}
              className={`w-full font-bold py-3 rounded-[8px] text-xs flex items-center justify-center space-x-2 shadow-sm transition active:scale-98 cursor-pointer ${
                isLight
                  ? "bg-[#5B4DF0] hover:bg-[#4D3DE0] text-white"
                  : "bg-white hover:bg-neutral-200 text-neutral-950"
              }`}
            >
              <span>{isEnrolled ? "Continue Learning" : "Enroll Now"}</span>
              <svg className="w-4 h-4 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {isEnrolled && currentChapterOrder && (
              <p className={`text-[11px] text-center py-1.5 px-2 rounded mt-2.5 font-medium border ${
                isLight ? "text-emerald-700 bg-emerald-50 border-emerald-200" : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
              }`}>
                You are enrolled • Pick up Chapter {currentChapterOrder}
              </p>
            )}

            <p className={`text-[11px] text-center mt-3 font-normal ${
              isLight ? "text-slate-500" : "text-neutral-400"
            }`}>
              Join 12,000+ learners advancing their careers
            </p>
          </div>

          {/* Card 2: Course Instructor - Canonical 14px card */}
          <div className={`p-6 rounded-[14px] border transition-shadow ${
            isLight ? "bg-white border-purple-900/10 text-slate-900 shadow-sm" : "bg-[#111111] border-white/[0.08] text-white shadow-xs"
          }`}>
            <h3 className={`font-bold text-xs mb-3.5 uppercase tracking-wide ${
              isLight ? "text-slate-900" : "text-white"
            }`}>Course Instructor</h3>
            <div className="flex items-center space-x-3 mb-3">
              <div className={`w-9 h-9 rounded-full border flex items-center justify-center shrink-0 ${
                isLight ? "bg-purple-100 text-purple-900 border-purple-200" : "bg-white/10 text-white border-white/20"
              }`}>
                <span className="text-[9px] font-bold tracking-tight">CERTIFY</span>
              </div>
              <div>
                <h4 className={`text-xs font-bold ${isLight ? "text-slate-900" : "text-white"}`}>CERTIFY Academic Team</h4>
                <p className={`text-[11px] ${isLight ? "text-slate-500" : "text-neutral-400"}`}>Industry experts • Experienced educators</p>
              </div>
            </div>
            <p className={`text-[11.5px] leading-relaxed ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
              Curated and reviewed by industry professionals and academic experts to ensure practical, up-to-date, and job-relevant learning.
            </p>
          </div>

          {/* Card 3: Prerequisites - Canonical 14px card */}
          <div className={`p-6 rounded-[14px] border transition-shadow ${
            isLight ? "bg-white border-purple-900/10 text-slate-900 shadow-sm" : "bg-[#111111] border-white/[0.08] text-white shadow-xs"
          }`}>
            <h3 className={`font-bold text-xs mb-3.5 uppercase tracking-wide ${
              isLight ? "text-slate-900" : "text-white"
            }`}>Prerequisites</h3>
            <ul className={`space-y-2 text-xs ${isLight ? "text-slate-700" : "text-neutral-300"}`}>
              {[
                "Basic computer knowledge",
                "No prior programming experience required",
                "Willingness to learn and practice",
              ].map((item, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <svg className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isLight ? "text-slate-400" : "text-neutral-400"}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Card 4: Related Courses - Canonical 14px card */}
          <div className={`p-6 rounded-[14px] border transition-shadow ${
            isLight ? "bg-white border-purple-900/10 text-slate-900 shadow-sm" : "bg-[#111111] border-white/[0.08] text-white shadow-xs"
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-bold text-xs uppercase tracking-wide ${isLight ? "text-slate-900" : "text-white"}`}>Related Courses</h3>
              <button
                onClick={() => onNavigate("catalog")}
                className={`text-[11px] font-semibold flex items-center transition-colors cursor-pointer ${
                  isLight ? "text-purple-700 hover:text-purple-950" : "text-neutral-400 hover:text-white"
                }`}
              >
                <span>View all</span>
                <span className="ml-1">→</span>
              </button>
            </div>

            <div className="space-y-3.5">
              {[
                {
                  slug: "data-structures-problem-solving",
                  title: "Data Structures & Problem Solving",
                  level: "Intermediate",
                  bg: "bg-purple-500/15 border border-purple-500/20",
                  text: "text-purple-400",
                },
                {
                  slug: "web-development-foundations",
                  title: "Web Development Foundations",
                  level: "Beginner",
                  bg: "bg-indigo-500/15 border border-indigo-500/20",
                  text: "text-indigo-400",
                },
                {
                  slug: "databases-sql",
                  title: "Databases & SQL",
                  level: "Beginner",
                  bg: "bg-emerald-500/15 border border-emerald-500/20",
                  text: "text-emerald-500",
                },
              ].map((rel) => (
                <button
                  key={rel.slug}
                  onClick={() => onSelectRelatedCourse ? onSelectRelatedCourse(rel.slug) : onNavigate("catalog")}
                  className="w-full flex items-center space-x-3 group text-left cursor-pointer"
                >
                  <div className={`w-9 h-9 rounded-[8px] ${rel.bg} ${rel.text} flex items-center justify-center shrink-0`}>
                    <svg className="w-4 h-4 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <h4 className={`text-xs font-semibold transition-colors ${
                      isLight ? "text-slate-900 group-hover:text-purple-700" : "text-white group-hover:text-neutral-300"
                    }`}>
                      {rel.title}
                    </h4>
                    <p className={`text-[10px] ${isLight ? "text-slate-500" : "text-neutral-400"}`}>{rel.level}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
        {/* END: RightSidebarColumn */}
      </div>
    </div>
  );
};
