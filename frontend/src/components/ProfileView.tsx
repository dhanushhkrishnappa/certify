import React, { useState } from "react";
import type { User } from "../types/index.js";
import { useTheme } from "../context/ThemeContext.js";

interface ProfileViewProps {
  user?: User | null;
  onNavigateCredentials?: () => void;
  onNavigateCatalog?: () => void;
  onNavigateSettings?: () => void;
  onSelectCourse?: (slug: string) => void;
}

type ProfileTab = "courses" | "credentials" | "about";

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  onNavigateCredentials,
  onNavigateCatalog,
  onNavigateSettings,
  onSelectCourse,
}) => {
  const { isLight } = useTheme();
  const [activeTab, setActiveTab] = useState<ProfileTab>("courses");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const learnerName = user?.fullName || user?.name || "Dhanush K";
  const learnerEmail = user?.email || "dhanushk2204@gmail.com";
  const username = learnerEmail.includes("@") ? learnerEmail.split("@")[0] : "dhanushk";

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleCopyProfileLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
    }
    showToast("Profile link copied to clipboard");
  };

  const courses = [
    {
      slug: "python-fundamentals",
      title: "Python Fundamentals",
      category: "Software Engineering",
      progress: 75,
      completedModules: "6 of 8 modules",
      lastActive: "Today",
      status: "In Progress",
    },
    {
      slug: "web-development-foundations",
      title: "Web Development Foundations",
      category: "Frontend & Full Stack",
      progress: 100,
      completedModules: "12 of 12 modules",
      lastActive: "2 days ago",
      status: "Completed",
    },
  ];

  return (
    <div className="w-full pb-16 font-sans">
      {/* Toast message */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 bg-[#181822] border border-purple-500/30 text-purple-200 rounded-xl text-xs font-medium shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          {toastMessage}
        </div>
      )}

      {/* SINGLE UNIFIED PROFILE CONTAINER (No separate blocks or floating cards) */}
      <div
        className={`rounded-2xl border overflow-hidden shadow-sm transition-all duration-300 ${
          isLight
            ? "bg-white border-purple-900/15 shadow-[0_12px_40px_rgba(76,29,149,0.06)] text-slate-900"
            : "bg-[#0e0e13] border-white/[0.08] text-white"
        }`}
      >
        {/* 1. Profile Cover Banner */}
        <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-gradient-to-r from-[#21093b] via-[#37135f] to-[#1a0833]">
          {/* Subtle decorative mesh overlay */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 40%, rgba(196,181,253,0.5) 0%, transparent 50%), radial-gradient(circle at 80% 60%, rgba(230,202,164,0.4) 0%, transparent 50%)",
            }}
          />

          {/* Quick Action Buttons on Cover */}
          <div className="absolute top-4 right-4 sm:top-5 sm:right-6 flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyProfileLink}
              className="px-3.5 py-1.5 rounded-xl text-xs font-medium bg-black/40 hover:bg-black/60 text-white backdrop-blur-md border border-white/15 transition cursor-pointer flex items-center gap-1.5 shadow-sm"
              title="Share profile"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span>Share</span>
            </button>

            {onNavigateSettings && (
              <button
                type="button"
                onClick={onNavigateSettings}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white text-slate-900 hover:bg-slate-100 transition cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        </div>

        {/* 2. Profile Identity Header */}
        <div className="px-6 sm:px-8 pb-6 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-5">
            {/* Avatar & Basic Info */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-5">
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 shadow-xl shrink-0 bg-neutral-900 border-white dark:border-[#0e0e13]">
                <img
                  src="/user-avatar.jpg"
                  alt={learnerName}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-1 right-2 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-[#0e0e13]" title="Online" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
                    {learnerName}
                  </h1>
                </div>
                <p className={`text-xs sm:text-sm font-mono ${isLight ? "text-purple-900/70" : "text-purple-300/80"}`}>
                  @{username}
                </p>
                <p className={`text-xs sm:text-sm leading-relaxed max-w-xl ${isLight ? "text-slate-600" : "text-neutral-300"}`}>
                  Software Engineer • Focusing on distributed systems, Python architecture, and web engineering.
                </p>
              </div>
            </div>

            {/* Direct CTA */}
            {onNavigateCatalog && (
              <div className="shrink-0 pt-2 sm:pt-0">
                <button
                  type="button"
                  onClick={onNavigateCatalog}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <span>Explore Courses</span>
                  <span className="text-xs">→</span>
                </button>
              </div>
            )}
          </div>

          {/* Metadata Info Row */}
          <div className={`flex flex-wrap items-center gap-x-6 gap-y-2 text-xs pt-3 border-t ${
            isLight ? "border-slate-200 text-slate-600" : "border-white/[0.08] text-neutral-400"
          }`}>
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Bengaluru, India (IST)</span>
            </div>

            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>{learnerEmail}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Member since August 2026</span>
            </div>
          </div>
        </div>

        {/* 3. Inline Stats Strip (Seamlessly embedded in the same card) */}
        <div className={`grid grid-cols-2 sm:grid-cols-4 border-t border-b divide-x ${
          isLight
            ? "bg-slate-50/70 border-slate-200 divide-slate-200"
            : "bg-[#09090e]/80 border-white/[0.08] divide-white/[0.08]"
        }`}>
          <div className="p-4 sm:p-5 text-center sm:text-left">
            <span className={`text-[11px] font-semibold uppercase tracking-wider block ${
              isLight ? "text-slate-500" : "text-neutral-400"
            }`}>
              Enrolled Courses
            </span>
            <span className={`text-xl sm:text-2xl font-bold mt-0.5 block ${
              isLight ? "text-slate-900" : "text-white"
            }`}>
              2
            </span>
          </div>

          <div className="p-4 sm:p-5 text-center sm:text-left">
            <span className={`text-[11px] font-semibold uppercase tracking-wider block ${
              isLight ? "text-slate-500" : "text-neutral-400"
            }`}>
              Certificates Earned
            </span>
            <span className="text-xl sm:text-2xl font-bold text-indigo-500 mt-0.5 block">
              1
            </span>
          </div>

          <div className="p-4 sm:p-5 text-center sm:text-left">
            <span className={`text-[11px] font-semibold uppercase tracking-wider block ${
              isLight ? "text-slate-500" : "text-neutral-400"
            }`}>
              Current Streak
            </span>
            <span className="text-xl sm:text-2xl font-bold text-amber-500 mt-0.5 block flex items-center justify-center sm:justify-start gap-1">
              <span>12</span>
              <span className="text-sm">Days 🔥</span>
            </span>
          </div>

          <div className="p-4 sm:p-5 text-center sm:text-left">
            <span className={`text-[11px] font-semibold uppercase tracking-wider block ${
              isLight ? "text-slate-500" : "text-neutral-400"
            }`}>
              Hours Learned
            </span>
            <span className="text-xl sm:text-2xl font-bold text-emerald-500 mt-0.5 block">
              38 hrs
            </span>
          </div>
        </div>

        {/* 4. Tab Navigation Strip */}
        <div className={`px-6 sm:px-8 border-b flex items-center gap-8 text-xs sm:text-sm font-semibold transition-colors ${
          isLight ? "border-slate-200" : "border-white/[0.08]"
        }`}>
          <button
            type="button"
            onClick={() => setActiveTab("courses")}
            className={`py-3.5 relative transition cursor-pointer ${
              activeTab === "courses"
                ? isLight ? "text-purple-900 font-bold" : "text-white font-bold"
                : isLight ? "text-slate-500 hover:text-slate-800" : "text-neutral-400 hover:text-white"
            }`}
          >
            Courses ({courses.length})
            {activeTab === "courses" && (
              <span className={`absolute bottom-0 left-0 right-0 h-0.5 ${isLight ? "bg-purple-900" : "bg-white"}`} />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("credentials")}
            className={`py-3.5 relative transition cursor-pointer ${
              activeTab === "credentials"
                ? isLight ? "text-purple-900 font-bold" : "text-white font-bold"
                : isLight ? "text-slate-500 hover:text-slate-800" : "text-neutral-400 hover:text-white"
            }`}
          >
            Certificates (1)
            {activeTab === "credentials" && (
              <span className={`absolute bottom-0 left-0 right-0 h-0.5 ${isLight ? "bg-purple-900" : "bg-white"}`} />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("about")}
            className={`py-3.5 relative transition cursor-pointer ${
              activeTab === "about"
                ? isLight ? "text-purple-900 font-bold" : "text-white font-bold"
                : isLight ? "text-slate-500 hover:text-slate-800" : "text-neutral-400 hover:text-white"
            }`}
          >
            About & Skills
            {activeTab === "about" && (
              <span className={`absolute bottom-0 left-0 right-0 h-0.5 ${isLight ? "bg-purple-900" : "bg-white"}`} />
            )}
          </button>
        </div>

        {/* 5. Tab Content Area */}
        <div className="p-6 sm:p-8">
          {/* Courses Tab */}
          {activeTab === "courses" && (
            <div className="space-y-4">
              {courses.map((course) => (
                <div
                  key={course.slug}
                  className={`p-4 sm:p-5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition ${
                    isLight
                      ? "bg-slate-50/70 hover:bg-slate-50 border-slate-200"
                      : "bg-[#14141a]/60 hover:bg-[#14141a] border-white/[0.06]"
                  }`}
                >
                  <div className="space-y-1.5 flex-1 pr-4">
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-mono font-medium ${isLight ? "text-purple-700" : "text-purple-300"}`}>
                        {course.category}
                      </span>
                      <span className="text-neutral-500">•</span>
                      <span className={`text-[11px] font-medium ${
                        course.status === "Completed" ? "text-emerald-500 font-semibold" : isLight ? "text-slate-500" : "text-neutral-400"
                      }`}>
                        {course.status}
                      </span>
                    </div>

                    <h3 className={`text-base font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
                      {course.title}
                    </h3>

                    {/* Progress Bar */}
                    <div className="flex items-center gap-3 pt-1">
                      <div className={`flex-1 h-2 rounded-full overflow-hidden ${isLight ? "bg-slate-200" : "bg-neutral-800"}`}>
                        <div
                          className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full transition-all duration-500"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono font-semibold shrink-0">
                        {course.progress}%
                      </span>
                    </div>

                    <p className={`text-[11px] ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
                      {course.completedModules} • Last studied {course.lastActive}
                    </p>
                  </div>

                  <div className="shrink-0">
                    <button
                      type="button"
                      onClick={() => onSelectCourse?.(course.slug)}
                      className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        course.status === "Completed"
                          ? isLight
                            ? "bg-slate-200 text-slate-800 hover:bg-slate-300"
                            : "bg-white/10 text-white hover:bg-white/15"
                          : "bg-purple-600 hover:bg-purple-500 text-white shadow-sm"
                      }`}
                    >
                      {course.status === "Completed" ? "Review Course" : "Continue Learning"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Credentials Tab */}
          {activeTab === "credentials" && (
            <div className="space-y-4">
              <div
                className={`p-5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isLight ? "bg-slate-50/70 border-slate-200" : "bg-[#14141a]/60 border-white/[0.06]"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-900/30 border border-purple-500/30 flex items-center justify-center shrink-0 text-xl shadow-sm">
                    🎓
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className={`text-base font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
                        Web Development Foundations
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 text-[10px] font-bold">
                        VERIFIED
                      </span>
                    </div>
                    <p className={`text-xs mt-1 ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                      Issued by Certify • Digital Signature Ed25519
                    </p>
                    <p className={`text-[11px] font-mono mt-0.5 ${isLight ? "text-slate-500" : "text-neutral-500"}`}>
                      ID: CERT-2026-WD-8921 • Issued October 2026
                    </p>
                  </div>
                </div>

                {onNavigateCredentials && (
                  <button
                    type="button"
                    onClick={onNavigateCredentials}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition cursor-pointer shrink-0 shadow-sm"
                  >
                    View Credential
                  </button>
                )}
              </div>
            </div>
          )}

          {/* About & Skills Tab */}
          {activeTab === "about" && (
            <div className="space-y-6">
              <div>
                <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${isLight ? "text-purple-900" : "text-neutral-400"}`}>
                  Bio
                </h4>
                <p className={`text-xs sm:text-sm leading-relaxed ${isLight ? "text-slate-700" : "text-neutral-300"}`}>
                  Software engineer interested in systems programming, backend architectures, and modern web application development. Currently completing advanced certifications in Python internals and distributed services.
                </p>
              </div>

              <div>
                <h4 className={`text-xs font-bold uppercase tracking-wider mb-2.5 ${isLight ? "text-purple-900" : "text-neutral-400"}`}>
                  Technical Skills & Technologies
                </h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Python",
                    "TypeScript",
                    "JavaScript",
                    "React",
                    "Node.js",
                    "Docker",
                    "SQL & PostgreSQL",
                    "Git & GitHub",
                    "REST APIs",
                    "Data Structures",
                    "Linux",
                  ].map((skill) => (
                    <span
                      key={skill}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                        isLight
                          ? "bg-slate-100 text-slate-800 border-slate-300"
                          : "bg-white/[0.05] text-neutral-200 border-white/10"
                      }`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
