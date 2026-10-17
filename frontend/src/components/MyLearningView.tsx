import React, { useState, useEffect } from "react";
import { api } from "../services/api.js";
import type { User, CourseCatalogItem, LearningSessionContext } from "../types/index.js";

interface MyLearningViewProps {
  user: User | null;
  onContinueCourse: (slug: string) => void;
  onViewCourseDetails: (slug: string) => void;
  onNavigate: (view: string) => void;
}

export const MyLearningView: React.FC<MyLearningViewProps> = ({
  user: _user,
  onContinueCourse,
  onViewCourseDetails,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<"in-progress" | "completed" | "skills" | "certificates">("in-progress");
  const [sessionContext, setSessionContext] = useState<LearningSessionContext | null>(null);
  const [_courses, setCourses] = useState<CourseCatalogItem[]>([]);
  const [calendarMonth] = useState("September 2026");

  const activeSlug = "python-fundamentals";

  useEffect(() => {
    let mounted = true;
    Promise.all([
      api.getSessionContext(activeSlug).catch(() => null),
      api.listCourses().catch(() => ({ courses: [] })),
    ]).then(([sess, courseRes]) => {
      if (mounted) {
        if (sess) setSessionContext(sess);
        if (courseRes?.courses) setCourses(courseRes.courses);
      }
    });
    return () => { mounted = false; };
  }, [activeSlug]);

  const activeTitle = sessionContext?.course?.title || "Python Fundamentals";
  const progressPercent = 42;

  return (
    <div className="space-y-6 max-w-[1600px] w-full mx-auto" data-purpose="my-learning-page">
      {/* Content Two-Column Grid: (Main Learning Track + Right Stats Widgets) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        {/* Left 8-Column Block */}
        <div className="lg:col-span-8 space-y-7">
          {/* Hero Keep Going Card */}
          <section
            className="relative overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_80%_40%,#1f274a_0%,#111420_50%,#0c0e17_100%)] text-white p-7 shadow-lg border border-slate-800"
            data-purpose="current-focus-hero-card"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10">
              {/* Left Column: Title, Progress, CTA */}
              <div className="md:col-span-7 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[10px] tracking-widest font-bold uppercase text-zinc-400">
                    KEEP GOING
                  </span>
                  <h2 className="text-2xl font-bold tracking-tight text-white mt-2">
                    {activeTitle}
                  </h2>
                  <p className="text-xs text-zinc-300 mt-1 font-normal">
                    Turn your learning into a verified, demonstrative capstone.
                  </p>
                </div>

                <div className="space-y-4 pt-1">
                  {/* Progress Bar */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/50">
                      <div
                        className="h-full bg-[#1ddbb2] rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-medium text-zinc-300 whitespace-nowrap">
                      {progressPercent}% complete
                    </span>
                  </div>

                  {/* Continue Learning Pill Button */}
                  <div>
                    <button
                      onClick={() => onContinueCourse(activeSlug)}
                      className="inline-flex items-center gap-2 bg-white text-zinc-900 px-5 py-2 rounded-full text-xs font-bold hover:bg-zinc-100 transition-all shadow-sm active:scale-98 cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5 fill-black" viewBox="0 0 24 24">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                      </svg>
                      <span>Continue Learning</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Visual and Quote Badge */}
              <div className="md:col-span-5 flex flex-col justify-between items-end text-right">
                <div className="w-full">
                  <p className="text-xs italic text-zinc-300 font-serif leading-relaxed">
                    “ Projects build proof. Proof earns opportunity. ”
                  </p>
                </div>

                {/* 3D Holographic Isometric Data Graphic Representation */}
                <div className="relative w-full h-28 flex items-center justify-center my-1">
                  <div className="relative w-28 h-20">
                    <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full"></div>
                    <svg className="w-full h-full drop-shadow-[0_10px_15px_rgba(30,144,255,0.4)]" viewBox="0 0 200 160">
                      <polygon fill="#141c30" points="100,20 180,65 100,110 20,65" stroke="#37528e" strokeWidth="1.5"></polygon>
                      <polygon fill="#0d1222" points="20,65 100,110 100,135 20,90" stroke="#25355e" strokeWidth="1.5"></polygon>
                      <polygon fill="#19233f" points="180,65 100,110 100,135 180,90" stroke="#2b3e6e" strokeWidth="1.5"></polygon>
                      <polygon fill="#1a274c" points="135,45 175,68 135,90 95,68" stroke="#5078d4" strokeWidth="1.5"></polygon>
                      <polygon fill="#101a35" points="95,68 135,90 135,110 95,88" stroke="#334f8e" strokeWidth="1.5"></polygon>
                      <polygon fill="#203060" points="175,68 135,90 135,110 175,88" stroke="#3e60ac" strokeWidth="1.5"></polygon>
                      <line stroke="#38bdf8" strokeLinecap="round" strokeWidth="3" x1="120" x2="120" y1="65" y2="48"></line>
                      <line stroke="#38bdf8" strokeLinecap="round" strokeWidth="3" x1="135" x2="135" y1="60" y2="38"></line>
                      <line stroke="#38bdf8" strokeLinecap="round" strokeWidth="3" x1="150" x2="150" y1="58" y2="44"></line>
                      <circle cx="65" cy="85" fill="none" r="14" stroke="#22d3ee" strokeDasharray="3 3" strokeWidth="2"></circle>
                      <circle cx="65" cy="85" fill="#0ea5e9" opacity="0.6" r="7"></circle>
                    </svg>
                  </div>
                </div>

                <div className="text-[10px] text-zinc-400 tracking-wider">
                  Learn. Practice. Demonstrate. Get Certified.
                </div>
              </div>
            </div>
          </section>

          {/* In Progress Tabs and Active Course Card */}
          <section className="space-y-4" data-purpose="course-status-filters-and-list">
            {/* Filter Pills */}
            <div className="flex items-center gap-6 text-xs border-b border-white/10 pb-1">
              <button
                onClick={() => setActiveTab("in-progress")}
                className={`flex items-center gap-1.5 pb-1 transition-colors cursor-pointer ${
                  activeTab === "in-progress"
                    ? "font-bold text-white border-b-2 border-white"
                    : "text-purple-200/70 font-medium hover:text-white"
                }`}
              >
                <span>In Progress</span>
                <span className="w-4 h-4 rounded-full bg-white/20 text-white text-[10px] flex items-center justify-center font-bold">
                  1
                </span>
              </button>
              <button
                onClick={() => setActiveTab("completed")}
                className={`transition-colors cursor-pointer pb-1 ${
                  activeTab === "completed"
                    ? "font-bold text-white border-b-2 border-white"
                    : "text-purple-200/70 font-medium hover:text-white"
                }`}
              >
                Completed
              </button>
              <button
                onClick={() => setActiveTab("skills")}
                className={`transition-colors cursor-pointer pb-1 ${
                  activeTab === "skills"
                    ? "font-bold text-white border-b-2 border-white"
                    : "text-purple-200/70 font-medium hover:text-white"
                }`}
              >
                Skills
              </button>
              <button
                onClick={() => setActiveTab("certificates")}
                className={`transition-colors cursor-pointer pb-1 ${
                  activeTab === "certificates"
                    ? "font-bold text-white border-b-2 border-white"
                    : "text-purple-200/70 font-medium hover:text-white"
                }`}
              >
                Certificates
              </button>
            </div>

            {/* In Progress Active Course Card */}
            <div className="bg-[#111111] rounded-2xl border border-white/[0.08] p-5 shadow-xs hover:shadow-sm transition-shadow">
              <div className="flex flex-col md:flex-row items-center gap-5">
                {/* Left Visual/Thumbnail (Computer Monitor with Python & Data Chart) */}
                <div className="w-full md:w-48 h-32 bg-[#0d0f17] rounded-xl shrink-0 relative overflow-hidden flex items-center justify-center border border-white/10">
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/20 to-transparent"></div>
                  <div className="relative flex items-center justify-center">
                    <svg className="w-20 h-16 text-blue-400" fill="none" viewBox="0 0 100 80">
                      <rect fill="#1b2133" height="58" rx="4" stroke="#334155" strokeWidth="2" width="90" x="5" y="5"></rect>
                      <path d="M40 63 L60 63 L65 72 L35 72 Z" fill="#2d3748"></path>
                      <rect fill="#38bdf8" height="16" rx="1" width="6" x="14" y="38"></rect>
                      <rect fill="#38bdf8" height="26" rx="1" width="6" x="23" y="28"></rect>
                      <rect fill="#60a5fa" height="34" rx="1" width="6" x="32" y="20"></rect>
                      <path d="M68 22 C62 22 62 25 62 25 L62 28 L72 28 L72 30 L58 30 C55 30 54 33 54 36 L54 41 C54 44 57 44 57 44 L60 44 L60 41 C60 39 62 39 64 39 L74 39 C76 39 78 37 78 35 L78 28 C78 24 73 22 68 22 Z" fill="#3b82f6"></path>
                      <path d="M64 52 C70 52 70 49 70 49 L70 46 L60 46 L60 44 L74 44 C77 44 78 41 78 38 L78 33 C78 30 75 30 75 30 L72 30 L72 33 C72 35 70 35 68 35 L58 35 C56 35 54 37 54 39 L54 46 C54 50 59 52 64 52 Z" fill="#fbbf24"></path>
                    </svg>
                  </div>
                </div>

                {/* Middle Content Details */}
                <div className="flex-1 w-full flex flex-col justify-between space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      {/* Certified Track Partner Badge */}
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="font-black text-xs tracking-wider text-sky-400 font-mono">CERTIFY</span>
                        <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-tight">ACADEMIC MASTERY</span>
                      </div>
                      <h3 className="text-base font-bold text-white">
                        {activeTitle}
                      </h3>
                      <p className="text-xs text-neutral-400 mt-0.5 font-normal">
                        Build and deploy real-world algorithms, architectures and verified solutions.
                      </p>
                    </div>

                    {/* 3 dots / menu */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onViewCourseDetails(activeSlug)}
                        className="text-xs font-semibold text-neutral-300 hover:text-white cursor-pointer"
                      >
                        Overview →
                      </button>
                    </div>
                  </div>

                  {/* Metadata Badges: Level, Modules, Duration */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-400 font-medium">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M18 20V10M12 20V4M6 20v-6"></path>
                      </svg>
                      Foundational / Intermediate
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <rect height="16" rx="2" width="18" x="3" y="4"></rect>
                        <line x1="3" x2="21" y1="10" y2="10"></line>
                      </svg>
                      8 modules
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                      36.5 hours
                    </span>

                    {/* Continue Learning Pill */}
                    <div className="ml-auto">
                      <button
                        onClick={() => onContinueCourse(activeSlug)}
                        className="bg-white hover:bg-neutral-200 text-neutral-950 font-semibold text-xs px-4 py-1.5 rounded-full inline-flex items-center gap-1.5 transition-colors cursor-pointer active:scale-98"
                      >
                        <span>Continue Learning</span>
                        <span className="text-sm">→</span>
                      </button>
                    </div>
                  </div>

                  {/* Bottom Progress Bar Indicator */}
                  <div className="flex items-center gap-3 pt-1">
                    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-[#1ddbb2] rounded-full" style={{ width: `${progressPercent}%` }}></div>
                    </div>
                    <span className="text-[11px] font-medium text-neutral-400">{progressPercent}% complete</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Recommended Learning Path Grid */}
          <section className="space-y-3 pt-2" data-purpose="recommended-courses-section">
            <div>
              <h3 className="text-base font-bold text-white">More from your learning path</h3>
              <p className="text-xs text-neutral-400 mt-0.5">Continue exploring recommended courses to strengthen your skills.</p>
            </div>

            {/* 4 Courses Horizontal Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Python Fundamentals */}
              <article className="bg-[#111111] rounded-xl border border-white/[0.08] p-3.5 flex flex-col justify-between shadow-xs hover:shadow transition-shadow group">
                <div>
                  <div className="w-full h-24 bg-[#14161f] rounded-lg relative overflow-hidden flex items-center justify-center">
                    <button className="absolute top-2 right-2 text-neutral-400 hover:text-white transition-colors cursor-pointer">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                      </svg>
                    </button>
                    <div className="w-12 h-12 relative flex items-center justify-center">
                      <svg className="w-10 h-10" viewBox="0 0 128 128">
                        <path d="M63.5 16.5c-26 0-24.5 11.2-24.5 11.2l.1 11.6h24.8v3.5H30.8S16.5 41.2 16.5 67.2c0 26.1 12.5 25.1 12.5 25.1h7.5v-10.5s-.4-12.5 12.3-12.5h24.5s11.9.2 11.9-11.6V30.3s1.7-13.8-21.7-13.8zm-13.2 7.3a4.2 4.2 0 1 1 0 8.4 4.2 4.2 0 0 1 0-8.4z" fill="#3776AB"></path>
                        <path d="M64.5 111.5c26 0 24.5-11.2 24.5-11.2l-.1-11.6H64.1v-3.5h33.1s14.3 1.6 14.3-24.4c0-26.1-12.5-25.1-12.5-25.1h-7.5v10.5s.4 12.5-12.3 12.5H54.7s-11.9-.2-11.9 11.6v27.4s-1.7 13.7 21.7 13.7zm13.2-7.3a4.2 4.2 0 1 1 0-8.4 4.2 4.2 0 0 1 0 8.4z" fill="#FFD43B"></path>
                      </svg>
                    </div>
                  </div>
                  <div className="mt-3">
                    <h4 className="text-xs font-bold text-white leading-snug">Python Fundamentals</h4>
                    <div className="mt-2.5 space-y-1 text-[11px] text-neutral-400 font-medium">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3 h-3 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M18 20V10M12 20V4M6 20v-6"></path>
                        </svg>
                        <span>Beginner</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3 h-3 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <rect height="16" rx="2" width="18" x="3" y="4"></rect>
                        </svg>
                        <span>8 modules</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3 h-3 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 16 14"></polyline>
                        </svg>
                        <span>24 hours</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-2">
                  <button
                    onClick={() => onViewCourseDetails("python-fundamentals")}
                    className="w-full bg-white/10 hover:bg-white/15 text-white border border-white/10 text-xs font-bold py-1.5 rounded-full inline-flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>Start Learning</span>
                    <span className="text-xs">→</span>
                  </button>
                </div>
              </article>

              {/* Card 2: Web Development Foundations */}
              <article className="bg-[#111111] rounded-xl border border-white/[0.08] p-3.5 flex flex-col justify-between shadow-xs hover:shadow transition-shadow group">
                <div>
                  <div className="w-full h-24 bg-[#14161f] rounded-lg relative overflow-hidden flex items-center justify-center">
                    <button className="absolute top-2 right-2 text-neutral-400 hover:text-white transition-colors cursor-pointer">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                      </svg>
                    </button>
                    <div className="flex items-center gap-1.5">
                      <span className="w-6 h-7 bg-orange-600 rounded text-white text-[9px] font-black flex items-center justify-center shadow-xs">5</span>
                      <span className="w-6 h-7 bg-blue-600 rounded text-white text-[9px] font-black flex items-center justify-center shadow-xs">3</span>
                      <span className="w-6 h-7 bg-yellow-500 rounded text-black text-[9px] font-black flex items-center justify-center shadow-xs">JS</span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <h4 className="text-xs font-bold text-white leading-snug">Web Development Foundations</h4>
                    <div className="mt-2.5 space-y-1 text-[11px] text-neutral-400 font-medium">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3 h-3 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M18 20V10M12 20V4M6 20v-6"></path>
                        </svg>
                        <span>Beginner</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3 h-3 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <rect height="16" rx="2" width="18" x="3" y="4"></rect>
                        </svg>
                        <span>12 modules</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3 h-3 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        <span>48 hours</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-2">
                  <button
                    onClick={() => onNavigate("catalog")}
                    className="w-full bg-white/10 hover:bg-white/15 text-white border border-white/10 text-xs font-bold py-1.5 rounded-full inline-flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>Start Learning</span>
                    <span className="text-xs">→</span>
                  </button>
                </div>
              </article>

              {/* Card 3: Generative AI for Developers */}
              <article className="bg-[#111111] rounded-xl border border-white/[0.08] p-3.5 flex flex-col justify-between shadow-xs hover:shadow transition-shadow group">
                <div>
                  <div className="w-full h-24 bg-[#14161f] rounded-lg relative overflow-hidden flex items-center justify-center">
                    <button className="absolute top-2 right-2 text-neutral-400 hover:text-white transition-colors cursor-pointer">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                      </svg>
                    </button>
                    <div className="relative flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-purple-500/30 blur-md absolute"></div>
                      <svg className="w-9 h-9 text-indigo-400" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04"></path>
                        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04"></path>
                      </svg>
                    </div>
                  </div>
                  <div className="mt-3">
                    <h4 className="text-xs font-bold text-white leading-snug">Generative AI for Developers</h4>
                    <div className="mt-2.5 space-y-1 text-[11px] text-neutral-400 font-medium">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3 h-3 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M18 20V10M12 20V4M6 20v-6"></path>
                        </svg>
                        <span>Intermediate</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3 h-3 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <rect height="16" rx="2" width="18" x="3" y="4"></rect>
                        </svg>
                        <span>10 modules</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3 h-3 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        <span>40 hours</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-2">
                  <button
                    onClick={() => onNavigate("catalog")}
                    className="w-full bg-white/10 hover:bg-white/15 text-white border border-white/10 text-xs font-bold py-1.5 rounded-full inline-flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>Start Learning</span>
                    <span className="text-xs">→</span>
                  </button>
                </div>
              </article>

              {/* Card 4: Databases & SQL */}
              <article className="bg-[#111111] rounded-xl border border-white/[0.08] p-3.5 flex flex-col justify-between shadow-xs hover:shadow transition-shadow group">
                <div>
                  <div className="w-full h-24 bg-[#14161f] rounded-lg relative overflow-hidden flex items-center justify-center">
                    <button className="absolute top-2 right-2 text-neutral-400 hover:text-white transition-colors cursor-pointer">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                      </svg>
                    </button>
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-8 h-3.5 rounded-full border border-sky-400 bg-sky-950/70 shadow-[0_0_8px_rgba(56,189,248,0.5)]"></div>
                      <div className="w-8 h-3.5 rounded-full border border-sky-400/80 bg-sky-950/70"></div>
                      <div className="w-8 h-3.5 rounded-full border border-sky-400/60 bg-sky-950/70"></div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <h4 className="text-xs font-bold text-white leading-snug">Databases &amp; SQL</h4>
                    <div className="mt-2.5 space-y-1 text-[11px] text-neutral-400 font-medium">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3 h-3 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M18 20V10M12 20V4M6 20v-6"></path>
                        </svg>
                        <span>Beginner</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3 h-3 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <rect height="16" rx="2" width="18" x="3" y="4"></rect>
                        </svg>
                        <span>8 modules</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3 h-3 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        <span>32 hours</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-2">
                  <button
                    onClick={() => onNavigate("catalog")}
                    className="w-full bg-white/10 hover:bg-white/15 text-white border border-white/10 text-xs font-bold py-1.5 rounded-full inline-flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>Start Learning</span>
                    <span className="text-xs">→</span>
                  </button>
                </div>
              </article>
            </div>
          </section>
        </div>

        {/* Right 4-Column Block: Calendar & Stats Widgets */}
        <div className="lg:col-span-4 space-y-5">
          {/* Calendar Widget */}
          <div className="bg-[#111111] rounded-2xl border border-white/[0.08] p-5 shadow-xs" data-purpose="calendar-widget">
            {/* Month Header with Arrows */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white">{calendarMonth}</h3>
              <div className="flex items-center gap-2 text-neutral-400">
                <button aria-label="Previous Month" className="hover:text-white transition-colors p-1 cursor-pointer">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </button>
                <button aria-label="Next Month" className="hover:text-white transition-colors p-1 cursor-pointer">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </div>
            </div>

            {/* Calendar Days Header */}
            <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-neutral-400 mb-2">
              <span>Mo</span>
              <span>Tu</span>
              <span>We</span>
              <span>Th</span>
              <span>Fr</span>
              <span>Sa</span>
              <span>Su</span>
            </div>

            {/* Calendar Dates Grid */}
            <div className="grid grid-cols-7 text-center text-xs text-neutral-300 gap-y-2 font-medium">
              <span className="text-transparent pointer-events-none">0</span>
              <span className="py-1">1</span>
              <span className="py-1">2</span>
              <span className="py-1">3</span>
              <span className="py-1">4</span>
              <span className="py-1">5</span>
              <span className="py-1">6</span>
              <span className="py-1">7</span>
              <span className="py-1">8</span>
              <span className="py-1">9</span>
              <span className="py-1">10</span>
              <span className="py-1">11</span>
              <span className="py-1">12</span>
              <span className="py-1">13</span>
              <span className="py-1">14</span>
              <span className="py-1">15</span>
              <span className="py-1">16</span>
              <span className="py-1">17</span>
              <span className="py-1">18</span>
              <span className="py-1">19</span>
              <span className="py-1">20</span>
              <span className="py-1">21</span>
              <span className="py-1">22</span>
              <div className="flex items-center justify-center">
                <span className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center font-bold text-xs shadow-xs">
                  23
                </span>
              </div>
              <span className="py-1">24</span>
              <span className="py-1">25</span>
              <span className="py-1">26</span>
              <span className="py-1">27</span>
              <span className="py-1">28</span>
              <span className="py-1">29</span>
              <span className="py-1">30</span>
            </div>

            {/* Calendar Legend */}
            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/[0.08] text-[11px] text-neutral-400 font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-white"></span>
                <span>Learning day</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-white/20"></span>
                <span>Has activity</span>
              </div>
            </div>
          </div>

          {/* Last 4 Weeks Stats Widget */}
          <div className="bg-[#111111] rounded-2xl border border-white/[0.08] p-5 shadow-xs" data-purpose="metrics-summary-widget">
            <h3 className="text-xs font-bold text-white mb-4">Last 4 weeks</h3>
            <div className="grid grid-cols-3 gap-2 text-left">
              <div>
                <div className="text-xl font-bold text-white tracking-tight">12</div>
                <div className="text-[11px] text-neutral-400 leading-tight mt-1">Learning days</div>
              </div>
              <div>
                <div className="text-xl font-bold text-white tracking-tight">8</div>
                <div className="text-[11px] text-neutral-400 leading-tight mt-1">Modules completed</div>
              </div>
              <div>
                <div className="text-xl font-bold text-white tracking-tight">14.6</div>
                <div className="text-[11px] text-neutral-400 leading-tight mt-1">Hours learned</div>
              </div>
            </div>
          </div>

          {/* Daily Goal Progress Widget */}
          <div className="bg-[#111111] rounded-2xl border border-white/[0.08] p-5 shadow-xs" data-purpose="daily-goal-widget">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-white">Daily Goal</h3>
              <button
                type="button"
                onClick={() => alert("Goal settings configured in user profile.")}
                className="text-xs text-neutral-400 hover:text-white font-semibold transition-colors cursor-pointer"
              >
                Edit
              </button>
            </div>
            <div className="flex items-center gap-4">
              {/* Circular Arc Indicator: 1/3 Complete */}
              <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
                <svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.08)"
                    strokeWidth="3.5"
                  ></path>
                  <path
                    className="text-[#1ddbb2]"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeDasharray="33, 100"
                    strokeLinecap="round"
                    strokeWidth="3.5"
                  ></path>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                  1/3
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Keep going!</h4>
                <p className="text-[11px] text-neutral-400 leading-relaxed mt-0.5">
                  Complete 3 learning activities today.
                </p>
              </div>
            </div>
          </div>

          {/* Inspirational Quote Banner Card */}
          <div
            className="rounded-2xl border border-white/[0.08] p-6 shadow-xs bg-[#111111]"
            data-purpose="inspirational-quote-card"
          >
            <div className="flex gap-3">
              <span className="text-3xl text-neutral-500 font-serif leading-none select-none">“</span>
              <div>
                <p className="text-sm font-serif italic text-neutral-200 leading-relaxed">
                  Small steps every day create extraordinary results.
                </p>
                <div className="w-8 h-0.5 bg-neutral-600 mt-3 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
