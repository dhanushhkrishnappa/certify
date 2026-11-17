import React, { useState, useEffect, useMemo } from "react";
import { api } from "../services/api.js";
import type {
  User,
  LearningSessionContext,
  ProgressionTree,
  SkillsReport,
} from "../types/index.js";
import { useTheme } from "../context/ThemeContext.js";

interface MyLearningViewProps {
  user: User | null;
  onContinueCourse: (slug: string) => void;
  onViewCourseDetails: (slug: string) => void;
  onNavigate: (view: string) => void;
}

interface EarnedCert {
  id: string;
  credentialId: string;
  tier: string;
  compositeScore: number;
  status: string;
  issuedAt: string;
  courseTitle: string;
}

export const MyLearningView: React.FC<MyLearningViewProps> = ({
  user,
  onContinueCourse,
  onViewCourseDetails,
  onNavigate,
}) => {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const [activeTab, setActiveTab] = useState<"in-progress" | "completed" | "skills" | "certificates">("in-progress");
  const [sessionContext, setSessionContext] = useState<LearningSessionContext | null>(null);
  const [progression, setProgression] = useState<ProgressionTree | null>(null);
  const [skillsReport, setSkillsReport] = useState<SkillsReport | null>(null);
  const [certificates, setCertificates] = useState<EarnedCert[]>([]);

  const activeSlug = "python-fundamentals";

  useEffect(() => {
    let mounted = true;
    setSessionContext(null);
    setProgression(null);
    setSkillsReport(null);
    setCertificates([]);

    Promise.all([
      api.getSessionContext(activeSlug).catch(() => null),
      api.getProgression(activeSlug).catch(() => null),
      api.getSkillsReport(activeSlug).catch(() => null),
      api.getMyCertificates().catch(() => ({ certificates: [] })),
    ]).then(([sess, progRes, skillsRes, certRes]) => {
      if (!mounted) return;
      if (sess) setSessionContext(sess);
      if (progRes?.progression) setProgression(progRes.progression);
      if (skillsRes?.report) setSkillsReport(skillsRes.report);
      setCertificates(certRes.certificates || []);
    });

    return () => {
      mounted = false;
    };
  }, [activeSlug, user?.id]);

  // Real dynamic current month calendar (never hardcoded September 2026)
  const calendarInfo = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const today = now.getDate();
    const monthLabel = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    const firstDay = new Date(year, month, 1).getDay(); // 0=Sun..6=Sat
    const leadingBlanks = (firstDay + 6) % 7; // Mon=0..Sun=6
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { monthLabel, today, leadingBlanks, daysInMonth };
  }, []);

  const activeTitle = progression?.course.title || sessionContext?.course?.title || "Python Fundamentals";
  const progressPercent = progression ? Math.round(progression.summary.percentComplete) : 0;
  const isCompletedCourse = Boolean(progression && progression.summary.percentComplete >= 100);
  const isInProgressCourse = Boolean(progression && !isCompletedCourse);

  const assessedSkills = [
    ...(skillsReport?.strengths || []),
    ...(skillsReport?.developing || []),
    ...(skillsReport?.weakpoints || []),
  ];

  return (
    <div className="space-y-6 max-w-[1600px] w-full mx-auto" data-purpose="my-learning-page">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        {/* Left 8-Column Block */}
        <div className="lg:col-span-8 space-y-7">
          {/* Hero Keep Going Card */}
          <section
            className={`relative overflow-hidden rounded-2xl p-7 shadow-lg border transition-all duration-300 ${
              isLight
                ? "bg-white text-slate-900 border-purple-900/10 shadow-[0_12px_36px_rgba(76,29,149,0.08)]"
                : "bg-[radial-gradient(circle_at_80%_40%,#1f274a_0%,#111420_50%,#0c0e17_100%)] text-white border-slate-800"
            }`}
            data-purpose="current-focus-hero-card"
          >
            <div className="space-y-4">
              <div>
                <span className={`text-[10px] tracking-widest font-bold uppercase ${isLight ? "text-purple-700" : "text-zinc-400"}`}>
                  {progression ? "ACTIVE TRACK" : "GET STARTED"}
                </span>
                <h2 className={`text-2xl font-bold tracking-tight mt-1 ${isLight ? "text-slate-900" : "text-white"}`}>
                  {activeTitle}
                </h2>
                <p className={`text-xs mt-1 ${isLight ? "text-slate-600" : "text-zinc-300"}`}>
                  {progression
                    ? `${progression.summary.modulesCompleted}/${progression.summary.modulesTotal} modules • ${progression.summary.chaptersCompleted}/${progression.summary.chaptersTotal} chapters • ${progression.summary.sectionsCompleted}/${progression.summary.sectionsTotal} sections completed`
                    : "Enroll in Python Fundamentals to track live module, chapter, and rubric progress."}
                </p>
              </div>

              <div className="space-y-4 pt-1 max-w-lg">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex-1 h-2 rounded-full overflow-hidden border ${
                      isLight ? "bg-purple-100 border-purple-200/60" : "bg-slate-800/80 border-slate-700/50"
                    }`}
                  >
                    <div
                      className="h-full bg-[#1ddbb2] rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <span className={`text-xs font-medium whitespace-nowrap ${isLight ? "text-slate-600" : "text-zinc-300"}`}>
                    {progressPercent}% complete
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() =>
                      progression ? onContinueCourse(activeSlug) : onViewCourseDetails(activeSlug)
                    }
                    className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition-all shadow-sm cursor-pointer ${
                      isLight
                        ? "bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
                        : "bg-white text-zinc-900 hover:bg-zinc-100"
                    }`}
                  >
                    <span>{progression ? "Continue Learning" : "Enroll & Start"}</span>
                  </button>
                  <button
                    onClick={() => onViewCourseDetails(activeSlug)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold border transition cursor-pointer ${
                      isLight
                        ? "border-purple-200 text-purple-900 hover:bg-purple-50"
                        : "border-white/15 text-zinc-200 hover:bg-white/10"
                    }`}
                  >
                    View Curriculum Progress →
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Working Status Filter Tabs */}
          <section className="space-y-4">
            <div className={`flex items-center gap-6 text-xs border-b pb-1 ${isLight ? "border-purple-900/15" : "border-white/10"}`}>
              {(
                [
                  { id: "in-progress", label: "In Progress", count: isInProgressCourse ? 1 : 0 },
                  { id: "completed", label: "Completed", count: isCompletedCourse ? 1 : 0 },
                  { id: "skills", label: "Skills", count: assessedSkills.length },
                  { id: "certificates", label: "Certificates", count: certificates.length },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 pb-2 transition-colors cursor-pointer ${
                    activeTab === tab.id
                      ? isLight
                        ? "font-bold text-purple-950 border-b-2 border-purple-900"
                        : "font-bold text-white border-b-2 border-white"
                      : isLight
                      ? "text-slate-700 font-medium hover:text-purple-950"
                      : "text-purple-200/70 font-medium hover:text-white"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                      isLight ? "bg-purple-200 text-purple-900" : "bg-white/20 text-white"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {activeTab === "in-progress" && (
              isInProgressCourse && progression ? (
                <div
                  className={`rounded-2xl border p-5 space-y-3 ${
                    isLight ? "bg-white border-purple-900/10 text-slate-900 shadow-sm" : "bg-[#111111] border-white/[0.08] text-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-400">
                        CERTIFY • {progression.currentTier} TIER
                      </span>
                      <h3 className="text-base font-bold mt-0.5">{activeTitle}</h3>
                      <p className={`text-xs mt-1 ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                        {progression.summary.modulesCompleted}/{progression.summary.modulesTotal} modules •{" "}
                        {progression.summary.chaptersCompleted}/{progression.summary.chaptersTotal} chapters
                      </p>
                    </div>
                    <button
                      onClick={() => onViewCourseDetails(activeSlug)}
                      className={`text-xs font-semibold cursor-pointer ${isLight ? "text-purple-700" : "text-neutral-300 hover:text-white"}`}
                    >
                      Overview →
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${isLight ? "bg-purple-100" : "bg-white/10"}`}>
                      <div className="h-full bg-[#1ddbb2] rounded-full" style={{ width: `${progressPercent}%` }} />
                    </div>
                    <span className="text-[11px] font-mono font-semibold">{progressPercent}%</span>
                  </div>
                </div>
              ) : (
                <div className={`rounded-2xl border p-8 text-center text-xs ${isLight ? "bg-white border-purple-900/10 text-slate-600" : "bg-[#111111] border-white/[0.08] text-neutral-400"}`}>
                  No courses currently in progress. Open Python Fundamentals from Explore Courses to enroll.
                </div>
              )
            )}

            {activeTab === "completed" && (
              isCompletedCourse ? (
                <div className={`rounded-2xl border p-5 ${isLight ? "bg-white border-purple-900/10" : "bg-[#111111] border-white/[0.08]"}`}>
                  <h3 className="text-sm font-bold">{activeTitle} — 100% Completed ✓</h3>
                </div>
              ) : (
                <div className={`rounded-2xl border p-8 text-center text-xs ${isLight ? "bg-white border-purple-900/10 text-slate-600" : "bg-[#111111] border-white/[0.08] text-neutral-400"}`}>
                  No completed courses yet. Finish all 10 modules and practicals in Python Fundamentals to complete the track.
                </div>
              )
            )}

            {activeTab === "skills" && (
              assessedSkills.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {assessedSkills.map((sk) => (
                    <div
                      key={sk.skillDimensionId}
                      className={`p-4 rounded-xl border space-y-1 ${
                        isLight ? "bg-white border-purple-900/10" : "bg-[#111111] border-white/[0.08]"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span>{sk.skillName}</span>
                        <span className="font-mono text-emerald-400">{Math.round(sk.compositeScore * 100)}%</span>
                      </div>
                      <p className={`text-[11px] ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                        {sk.evidenceSummary}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`rounded-2xl border p-8 text-center text-xs ${isLight ? "bg-white border-purple-900/10 text-slate-600" : "bg-[#111111] border-white/[0.08] text-neutral-400"}`}>
                  No skill dimensions assessed yet. Engage in the AI Studio and pass checkpoints to populate your skill profile.
                </div>
              )
            )}

            {activeTab === "certificates" && (
              certificates.length > 0 ? (
                <div className="space-y-3">
                  {certificates.map((cert) => (
                    <div
                      key={cert.id}
                      className={`p-4 rounded-xl border flex items-center justify-between ${
                        isLight ? "bg-white border-purple-900/10" : "bg-[#111111] border-white/[0.08]"
                      }`}
                    >
                      <div>
                        <h4 className="text-sm font-bold">{cert.courseTitle}</h4>
                        <p className="text-[11px] font-mono text-neutral-400">
                          {cert.credentialId} • {cert.tier}
                        </p>
                      </div>
                      <button
                        onClick={() => onNavigate("credentials")}
                        className="px-3 py-1.5 rounded-lg bg-[#5B4DF0] text-white text-xs font-semibold cursor-pointer"
                      >
                        View →
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`rounded-2xl border p-8 text-center text-xs ${isLight ? "bg-white border-purple-900/10 text-slate-600" : "bg-[#111111] border-white/[0.08] text-neutral-400"}`}>
                  No certificates earned yet. Complete Python Fundamentals to unlock your verified credential.
                </div>
              )
            )}
          </section>

          {/* Upcoming Tracks (Consistent Coming Soon Lock) */}
          <section className="space-y-3 pt-2">
            <div>
              <h3 className={`text-base font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
                Upcoming Learning Tracks
              </h3>
              <p className={`text-xs mt-0.5 ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                Python Fundamentals is live today. Additional tracks are coming soon.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { title: "Web Development Foundations", level: "Beginner", modules: "12 modules" },
                { title: "Generative AI for Developers", level: "Intermediate", modules: "10 modules" },
                { title: "Databases & SQL", level: "Beginner", modules: "8 modules" },
              ].map((track) => (
                <article
                  key={track.title}
                  className={`rounded-xl border p-4 flex flex-col justify-between opacity-70 select-none ${
                    isLight ? "bg-white border-purple-900/10 text-slate-900" : "bg-[#111111] border-white/[0.08] text-white"
                  }`}
                >
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-white/[0.06] text-zinc-400 border border-white/10 mb-2">
                      Coming Soon
                    </span>
                    <h4 className="text-xs font-bold leading-snug">{track.title}</h4>
                    <p className={`text-[11px] mt-1 ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
                      {track.level} • {track.modules}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>

        {/* Right 4-Column Block: Real Calendar & Real Progression Stats */}
        <div className="lg:col-span-4 space-y-5">
          {/* Dynamic Current Month Calendar */}
          <div
            className={`rounded-2xl border p-5 ${
              isLight ? "bg-white border-purple-900/10 text-slate-900 shadow-sm" : "bg-[#111111] border-white/[0.08] text-white"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold">{calendarInfo.monthLabel}</h3>
            </div>
            <div className={`grid grid-cols-7 text-center text-[11px] font-semibold mb-2 ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
              <span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span><span>Su</span>
            </div>
            <div className={`grid grid-cols-7 text-center text-xs gap-y-2 font-medium ${isLight ? "text-slate-700" : "text-neutral-300"}`}>
              {Array.from({ length: calendarInfo.leadingBlanks }).map((_, i) => (
                <span key={`blank-${i}`} className="text-transparent pointer-events-none">0</span>
              ))}
              {Array.from({ length: calendarInfo.daysInMonth }).map((_, idx) => {
                const day = idx + 1;
                const isToday = day === calendarInfo.today;
                return (
                  <div key={day} className="flex items-center justify-center">
                    <span
                      className={
                        isToday
                          ? `w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                              isLight ? "bg-[#5B4DF0] text-white" : "bg-white text-black"
                            }`
                          : "py-1"
                      }
                    >
                      {day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Real Backend Progress Summary Widget */}
          <div
            className={`rounded-2xl border p-5 ${
              isLight ? "bg-white border-purple-900/10 text-slate-900 shadow-sm" : "bg-[#111111] border-white/[0.08] text-white"
            }`}
          >
            <h3 className="text-xs font-bold mb-4 uppercase tracking-wider">Verified Progress</h3>
            <div className="grid grid-cols-3 gap-2 text-left">
              <div>
                <div className="text-xl font-bold tracking-tight font-mono">
                  {progression?.summary.modulesCompleted ?? 0}
                </div>
                <div className={`text-[11px] leading-tight mt-1 ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                  Modules done
                </div>
              </div>
              <div>
                <div className="text-xl font-bold tracking-tight font-mono">
                  {progression?.summary.chaptersCompleted ?? 0}
                </div>
                <div className={`text-[11px] leading-tight mt-1 ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                  Chapters done
                </div>
              </div>
              <div>
                <div className="text-xl font-bold tracking-tight font-mono">
                  {progression?.summary.sectionsCompleted ?? 0}
                </div>
                <div className={`text-[11px] leading-tight mt-1 ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                  Sections done
                </div>
              </div>
            </div>
          </div>

          {/* Real Chapter Completion Ring */}
          <div
            className={`rounded-2xl border p-5 ${
              isLight ? "bg-white border-purple-900/10 text-slate-900 shadow-sm" : "bg-[#111111] border-white/[0.08] text-white"
            }`}
          >
            <h3 className="text-xs font-bold mb-3 uppercase tracking-wider">Course Milestone</h3>
            <div className="flex items-center gap-4">
              <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
                <svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={isLight ? "rgba(124, 58, 237, 0.12)" : "rgba(255, 255, 255, 0.08)"}
                    strokeWidth="3.5"
                  />
                  <path
                    className="text-[#1ddbb2]"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeDasharray={`${progressPercent}, 100`}
                    strokeLinecap="round"
                    strokeWidth="3.5"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-[11px] font-bold font-mono">
                  {progressPercent}%
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold">
                  {progression ? `${progression.summary.chaptersCompleted}/${progression.summary.chaptersTotal} Chapters` : "Ready to Begin"}
                </h4>
                <p className={`text-[11px] leading-relaxed mt-0.5 ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                  {progression
                    ? "Complete sections in the AI Studio and pass checkpoints to unlock the next chapter."
                    : "Enroll in Python Fundamentals to start tracking milestones."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
