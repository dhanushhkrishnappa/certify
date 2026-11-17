import React, { useEffect, useState } from "react";
import type { User, ProgressionTree, SkillsReport } from "../types/index.js";
import { useTheme } from "../context/ThemeContext.js";
import { api } from "../services/api.js";

interface ProfileViewProps {
  user?: User | null;
  onNavigateCredentials?: () => void;
  onNavigateCatalog?: () => void;
  onNavigateSettings?: () => void;
  onSelectCourse?: (slug: string) => void;
}

type ProfileTab = "courses" | "credentials" | "about";

interface EarnedCert {
  id: string;
  credentialId: string;
  tier: string;
  compositeScore: number;
  status: string;
  issuedAt: string;
  courseTitle: string;
}

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
  const [isVerified, setIsVerified] = useState(user?.emailVerified ?? false);
  const [isResending, setIsResending] = useState(false);

  const [progression, setProgression] = useState<ProgressionTree | null>(null);
  const [skillsReport, setSkillsReport] = useState<SkillsReport | null>(null);
  const [certificates, setCertificates] = useState<EarnedCert[]>([]);

  useEffect(() => {
    setIsVerified(user?.emailVerified ?? false);
  }, [user?.emailVerified]);

  useEffect(() => {
    let mounted = true;
    setProgression(null);
    setSkillsReport(null);
    setCertificates([]);

    Promise.all([
      api.getProgression("python-fundamentals").catch(() => null),
      api.getSkillsReport("python-fundamentals").catch(() => null),
      api.getMyCertificates().catch(() => ({ certificates: [] })),
    ]).then(([progRes, skillsRes, certRes]) => {
      if (!mounted) return;
      setProgression(progRes?.progression || null);
      setSkillsReport(skillsRes?.report || null);
      setCertificates(certRes.certificates || []);
    });

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  const learnerName = user?.fullName || user?.name || "Learner";
  const learnerEmail = user?.email || "";
  const username = learnerEmail.includes("@") ? learnerEmail.split("@")[0] : "learner";

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleResendVerification = async () => {
    if (!learnerEmail) return;
    setIsResending(true);
    try {
      const res = await api.resendVerification(learnerEmail);
      showToast(res.message || "Verification email dispatched! Please check your inbox.");
    } catch (err: any) {
      showToast(err.message || "Failed to resend verification email.");
    } finally {
      setIsResending(false);
    }
  };

  const handleCopyProfileLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
    }
    showToast("Profile link copied to clipboard");
  };

  const enrolledCourses = progression
    ? [
        {
          slug: progression.course.slug,
          title: progression.course.title,
          category: "Software Engineering",
          progress: Math.round(progression.summary.percentComplete),
          completedModules: `${progression.summary.modulesCompleted} of ${progression.summary.modulesTotal} modules • ${progression.summary.sectionsCompleted}/${progression.summary.sectionsTotal} sections`,
          status: progression.summary.percentComplete >= 100 ? "Completed" : "In Progress",
        },
      ]
    : [];

  const assessedSkills = [
    ...(skillsReport?.strengths || []),
    ...(skillsReport?.developing || []),
  ];

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
    <div className="w-full pb-16 font-sans">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 bg-[#181822] border border-purple-500/30 text-purple-200 rounded-xl text-xs font-medium shadow-2xl flex items-center gap-2">
          {toastMessage}
        </div>
      )}

      {/* Email Verification Pending Alert Banner */}
      {!isVerified && learnerEmail && (
        <div className="mb-6 p-4 sm:p-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-amber-200">
          <div>
            <h4 className="text-sm font-semibold text-amber-100">Email Verification Pending</h4>
            <p className="text-xs text-amber-200/80 mt-0.5">
              Verify <span className="font-mono text-amber-100 font-semibold">{learnerEmail}</span> to enable official credential issuance.
            </p>
          </div>
          <button
            type="button"
            disabled={isResending}
            onClick={handleResendVerification}
            className="px-3.5 py-1.5 rounded-xl text-xs font-medium bg-amber-500/20 hover:bg-amber-500/30 text-amber-100 border border-amber-500/40 transition disabled:opacity-50 cursor-pointer shrink-0"
          >
            {isResending ? "Dispatching..." : "Resend Verification Email"}
          </button>
        </div>
      )}

      {/* SINGLE UNIFIED PROFILE CONTAINER */}
      <div
        className={`rounded-2xl border overflow-hidden shadow-sm transition-all duration-300 ${
          isLight
            ? "bg-white border-purple-900/15 shadow-[0_12px_40px_rgba(76,29,149,0.06)] text-slate-900"
            : "bg-[#0e0e13] border-white/[0.08] text-white"
        }`}
      >
        {/* 1. Profile Cover Banner */}
        <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-gradient-to-r from-[#21093b] via-[#37135f] to-[#1a0833]">
          <div className="absolute top-4 right-4 sm:top-5 sm:right-6 flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyProfileLink}
              className="px-3.5 py-1.5 rounded-xl text-xs font-medium bg-black/40 hover:bg-black/60 text-white backdrop-blur-md border border-white/15 transition cursor-pointer"
            >
              Share
            </button>
            {onNavigateSettings && (
              <button
                type="button"
                onClick={onNavigateSettings}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white text-slate-900 hover:bg-slate-100 transition cursor-pointer"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* 2. Profile Identity Header */}
        <div className="px-6 sm:px-8 pb-6 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-5">
            <div className="flex flex-col sm:flex-row sm:items-end gap-5">
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 shadow-xl shrink-0 bg-neutral-900 border-white dark:border-[#0e0e13]">
                <img
                  src={user?.image || "/user-avatar.jpg"}
                  alt={learnerName}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-1 right-2 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-[#0e0e13]" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
                    {learnerName}
                  </h1>
                  {isVerified ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 rounded-full">
                      ✓ Verified Learner
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2.5 py-0.5 rounded-full">
                      Unverified
                    </span>
                  )}
                </div>
                <p className={`text-xs sm:text-sm font-mono ${isLight ? "text-purple-900/70" : "text-purple-300/80"}`}>
                  @{username}
                </p>
                {(user?.persona || user?.primaryGoal) && (
                  <p className={`text-xs sm:text-sm leading-relaxed max-w-xl ${isLight ? "text-slate-600" : "text-neutral-300"}`}>
                    {[user?.persona, user?.primaryGoal].filter(Boolean).join(" • ")}
                  </p>
                )}
              </div>
            </div>

            {onNavigateCatalog && (
              <div className="shrink-0 pt-2 sm:pt-0">
                <button
                  type="button"
                  onClick={onNavigateCatalog}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white transition cursor-pointer"
                >
                  Explore Courses →
                </button>
              </div>
            )}
          </div>

          {/* Metadata Info Row (Real User Data Only) */}
          <div
            className={`flex flex-wrap items-center gap-x-6 gap-y-2 text-xs pt-3 border-t ${
              isLight ? "border-slate-200 text-slate-600" : "border-white/[0.08] text-neutral-400"
            }`}
          >
            {learnerEmail && <span>{learnerEmail}</span>}
            {user?.dob && <span>Born: {user.dob}</span>}
            {user?.role && <span>Role: {user.role}</span>}
          </div>
        </div>

        {/* 3. Real Backend Stats Strip */}
        <div
          className={`grid grid-cols-2 sm:grid-cols-4 border-t border-b divide-x ${
            isLight
              ? "bg-slate-50/70 border-slate-200 divide-slate-200"
              : "bg-[#09090e]/80 border-white/[0.08] divide-white/[0.08]"
          }`}
        >
          <div className="p-4 sm:p-5 text-center sm:text-left">
            <span className={`text-[11px] font-semibold uppercase tracking-wider block ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
              Enrolled Courses
            </span>
            <span className={`text-xl sm:text-2xl font-bold mt-0.5 block ${isLight ? "text-slate-900" : "text-white"}`}>
              {enrolledCourses.length}
            </span>
          </div>

          <div className="p-4 sm:p-5 text-center sm:text-left">
            <span className={`text-[11px] font-semibold uppercase tracking-wider block ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
              Certificates Earned
            </span>
            <span className="text-xl sm:text-2xl font-bold text-indigo-500 mt-0.5 block">
              {certificates.length}
            </span>
          </div>

          <div className="p-4 sm:p-5 text-center sm:text-left">
            <span className={`text-[11px] font-semibold uppercase tracking-wider block ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
              Sections Completed
            </span>
            <span className="text-xl sm:text-2xl font-bold text-amber-500 mt-0.5 block">
              {progression?.summary.sectionsCompleted ?? 0}
            </span>
          </div>

          <div className="p-4 sm:p-5 text-center sm:text-left">
            <span className={`text-[11px] font-semibold uppercase tracking-wider block ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
              Course Progress
            </span>
            <span className="text-xl sm:text-2xl font-bold text-emerald-500 mt-0.5 block">
              {Math.round(progression?.summary.percentComplete ?? 0)}%
            </span>
          </div>
        </div>

        {/* 4. Tab Navigation Strip */}
        <div
          className={`px-6 sm:px-8 border-b flex items-center gap-8 text-xs sm:text-sm font-semibold ${
            isLight ? "border-slate-200" : "border-white/[0.08]"
          }`}
        >
          <button
            type="button"
            onClick={() => setActiveTab("courses")}
            className={`py-3.5 relative transition cursor-pointer ${
              activeTab === "courses"
                ? isLight
                  ? "text-purple-900 font-bold"
                  : "text-white font-bold"
                : isLight
                ? "text-slate-500 hover:text-slate-800"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Courses ({enrolledCourses.length})
            {activeTab === "courses" && (
              <span className={`absolute bottom-0 left-0 right-0 h-0.5 ${isLight ? "bg-purple-900" : "bg-white"}`} />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("credentials")}
            className={`py-3.5 relative transition cursor-pointer ${
              activeTab === "credentials"
                ? isLight
                  ? "text-purple-900 font-bold"
                  : "text-white font-bold"
                : isLight
                ? "text-slate-500 hover:text-slate-800"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Certificates ({certificates.length})
            {activeTab === "credentials" && (
              <span className={`absolute bottom-0 left-0 right-0 h-0.5 ${isLight ? "bg-purple-900" : "bg-white"}`} />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("about")}
            className={`py-3.5 relative transition cursor-pointer ${
              activeTab === "about"
                ? isLight
                  ? "text-purple-900 font-bold"
                  : "text-white font-bold"
                : isLight
                ? "text-slate-500 hover:text-slate-800"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Verified Skills ({assessedSkills.length})
            {activeTab === "about" && (
              <span className={`absolute bottom-0 left-0 right-0 h-0.5 ${isLight ? "bg-purple-900" : "bg-white"}`} />
            )}
          </button>
        </div>

        {/* 5. Tab Content Area */}
        <div className="p-6 sm:p-8">
          {activeTab === "courses" && (
            <div className="space-y-4">
              {enrolledCourses.length > 0 ? (
                enrolledCourses.map((course) => (
                  <div
                    key={course.slug}
                    className={`p-4 sm:p-5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isLight
                        ? "bg-slate-50/70 border-slate-200"
                        : "bg-[#14141a]/60 border-white/[0.06]"
                    }`}
                  >
                    <div className="space-y-1.5 flex-1 pr-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-mono font-medium ${isLight ? "text-purple-700" : "text-purple-300"}`}>
                          {course.category}
                        </span>
                        <span className="text-neutral-500">•</span>
                        <span className="text-[11px] font-medium text-emerald-500">
                          {course.status}
                        </span>
                      </div>
                      <h3 className="text-base font-bold">{course.title}</h3>
                      <div className="flex items-center gap-3 pt-1">
                        <div className={`flex-1 h-2 rounded-full overflow-hidden ${isLight ? "bg-slate-200" : "bg-neutral-800"}`}>
                          <div
                            className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full transition-all duration-500"
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono font-semibold shrink-0">{course.progress}%</span>
                      </div>
                      <p className={`text-[11px] ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
                        {course.completedModules}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectCourse?.(course.slug)}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-sm cursor-pointer shrink-0"
                    >
                      Continue Learning
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 space-y-3">
                  <p className={`text-xs ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                    You have not enrolled in any courses yet.
                  </p>
                  {onNavigateCatalog && (
                    <button
                      type="button"
                      onClick={onNavigateCatalog}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white cursor-pointer"
                    >
                      Explore Courses →
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "credentials" && (
            <div className="space-y-4">
              {certificates.length > 0 ? (
                certificates.map((cert) => (
                  <div
                    key={cert.id}
                    className={`p-5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isLight ? "bg-slate-50/70 border-slate-200" : "bg-[#14141a]/60 border-white/[0.06]"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold">{cert.courseTitle}</h3>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 text-[10px] font-bold">
                          {cert.status}
                        </span>
                      </div>
                      <p className={`text-xs mt-1 ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                        {cert.tier} Tier • Score {Math.round(cert.compositeScore * 100)}% • Ed25519 Signed
                      </p>
                      <p className={`text-[11px] font-mono mt-0.5 ${isLight ? "text-slate-500" : "text-neutral-500"}`}>
                        ID: {cert.credentialId} • Issued {formatDate(cert.issuedAt)}
                      </p>
                    </div>
                    {onNavigateCredentials && (
                      <button
                        type="button"
                        onClick={onNavigateCredentials}
                        className="px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white cursor-pointer shrink-0"
                      >
                        View Credential
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 space-y-2">
                  <p className={`text-xs ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                    No certificates earned yet. Complete all modules, checkpoints, practical tasks,
                    and the final assessment in Python Fundamentals to earn your first verified credential.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "about" && (
            <div className="space-y-4">
              <h4 className={`text-xs font-bold uppercase tracking-wider ${isLight ? "text-purple-900" : "text-neutral-400"}`}>
                Backend-Verified Skill Dimensions
              </h4>
              {assessedSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {assessedSkills.map((skill) => (
                    <span
                      key={skill.skillDimensionId}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                        skill.classification === "STRENGTH"
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
                          : isLight
                          ? "bg-slate-100 text-slate-800 border-slate-300"
                          : "bg-white/[0.05] text-neutral-200 border-white/10"
                      }`}
                    >
                      {skill.skillName} · {Math.round(skill.compositeScore * 100)}%
                    </span>
                  ))}
                </div>
              ) : (
                <p className={`text-xs ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                  No skills evaluated yet. Your verified skill dimensions will appear here automatically
                  as your rubric criteria are demonstrated in the AI Studio, checkpoints, and practical tasks.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
