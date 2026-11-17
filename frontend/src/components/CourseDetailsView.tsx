import React, { useEffect, useState, useCallback, useMemo } from "react";
import { api } from "../services/api.js";
import type {
  CourseDetail,
  User,
  ProgressionTree,
  ModuleProgressionNode,
  ChapterProgressionNode,
  SkillsReport,
} from "../types/index.js";
import { useTheme } from "../context/ThemeContext.js";
import { CheckpointPanel } from "./studio/CheckpointPanel.js";
import { PracticalPanel } from "./studio/PracticalPanel.js";

interface CourseDetailsViewProps {
  courseSlug: string;
  onStartCourse: (slug: string, chapterId?: string) => void;
  onNavigate: (view: string) => void;
  onSelectRelatedCourse?: (slug: string) => void;
  user?: User | null;
}

const cleanTitle = (t?: string | null) => (t ? t.replace(/^\*+\s*/, "").trim() : "");

const SHORT_SECTION_LABEL: Record<string, string> = {
  CONCEPT_INTUITION: "Intuition",
  TECHNICAL_MECHANICS: "Mechanics",
  PITFALLS_AND_DEBUGGING: "Pitfalls",
  CHAPTER_CHECKPOINT: "Checkpoint",
  MODULE_PRACTICAL: "Practical",
};

export const CourseDetailsView: React.FC<CourseDetailsViewProps> = ({
  courseSlug,
  onStartCourse,
  onNavigate,
  onSelectRelatedCourse: _onSelectRelatedCourse,
  user,
}) => {
  const { theme } = useTheme();
  const isLight = theme === "light";

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [progression, setProgression] = useState<ProgressionTree | null>(null);
  const [skillsReport, setSkillsReport] = useState<SkillsReport | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "curriculum" | "projects" | "skills"
  >("overview");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Interactive Assessment Modals hosted right on the Course Details page
  const [checkpointModal, setCheckpointModal] = useState<{
    chapterId: string;
    chapterTitle: string;
  } | null>(null);
  const [practicalModal, setPracticalModal] = useState<{
    moduleId: string;
    moduleTitle: string;
    taskId: string;
    objective: string;
  } | null>(null);
  const [feedbackBanner, setFeedbackBanner] = useState<{
    type: "success" | "info";
    text: string;
  } | null>(null);

  const loadCourseAndProgress = useCallback(async () => {
    setIsLoading(true);
    try {
      const [detailRes, progRes, skillsRes] = await Promise.all([
        api.getCourseBySlug(courseSlug).catch(() => null),
        api.getProgression(courseSlug).catch(() => null),
        api.getSkillsReport(courseSlug).catch(() => null),
      ]);

      if (detailRes?.course) {
        setCourse(detailRes.course);
      }

      if (progRes?.progression) {
        const tree = progRes.progression;
        setProgression(tree);
        setIsEnrolled(true);

        // Expand currently active/in-progress modules automatically (or Module 1 if brand new)
        setExpandedModules((prev) => {
          if (Object.keys(prev).length > 0) return prev;
          const next: Record<string, boolean> = {};
          const activeMod =
            tree.modules.find((m) => m.status === "IN_PROGRESS" || m.status === "UNLOCKED") ||
            tree.modules[0];
          if (activeMod) next[activeMod.id] = true;
          return next;
        });
      } else {
        setProgression(null);
        setIsEnrolled(false);
        if (detailRes?.course?.modules?.length) {
          setExpandedModules((prev) => {
            if (Object.keys(prev).length > 0) return prev;
            return { [detailRes.course.modules[0].id]: true };
          });
        }
      }

      if (skillsRes?.report) {
        setSkillsReport(skillsRes.report);
      } else {
        setSkillsReport(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [courseSlug]);

  // Strict per-user isolation: wipe state immediately whenever user or course changes
  useEffect(() => {
    setProgression(null);
    setSkillsReport(null);
    setIsEnrolled(false);
    setExpandedModules({});
    setCheckpointModal(null);
    setPracticalModal(null);
    setFeedbackBanner(null);
    loadCourseAndProgress();
  }, [courseSlug, user?.id, loadCourseAndProgress]);

  const toggleModule = (modId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [modId]: !prev[modId],
    }));
  };

  // Identify the learner's current active chapter and any ready checkpoint/practical
  const activeContext = useMemo(() => {
    if (!progression) return null;
    for (const mod of progression.modules) {
      for (const ch of mod.chapters) {
        if (
          ch.status === "IN_PROGRESS" ||
          ch.status === "AWAITING_CHECKPOINT" ||
          ch.status === "REMEDIATING" ||
          ch.status === "UNLOCKED"
        ) {
          const checkpointSec = ch.sections.find((s) => s.sectionType === "CHAPTER_CHECKPOINT");
          const practicalSec = ch.sections.find((s) => s.sectionType === "MODULE_PRACTICAL");
          const activeSec =
            ch.sections.find((s) => s.status === "IN_PROGRESS" || s.status === "UNLOCKED") ||
            ch.sections[0];
          return {
            module: mod,
            chapter: ch,
            activeSection: activeSec,
            checkpointReady:
              ch.status === "AWAITING_CHECKPOINT" ||
              ch.status === "REMEDIATING" ||
              (checkpointSec && checkpointSec.status !== "LOCKED" && checkpointSec.status !== "COMPLETED"),
            practicalReady:
              Boolean(practicalSec && practicalSec.status !== "LOCKED" && practicalSec.status !== "COMPLETED"),
            practicalSection: practicalSec || null,
          };
        }
      }
    }
    const lastMod = progression.modules[progression.modules.length - 1];
    const lastCh = lastMod?.chapters[lastMod.chapters.length - 1];
    return lastMod && lastCh
      ? {
          module: lastMod,
          chapter: lastCh,
          activeSection: lastCh.sections[0] || null,
          checkpointReady: false,
          practicalReady: false,
          practicalSection: null,
        }
      : null;
  }, [progression]);

  const totalModulesCount =
    progression?.summary.modulesTotal || course?.modules?.length || 10;
  const totalChaptersCount =
    progression?.summary.chaptersTotal ||
    course?.modules?.reduce((sum, m) => sum + (m.chapters?.length || 0), 0) ||
    29;
  const percentComplete = progression?.summary.percentComplete ?? 0;

  const isCheckpointUnlockedForChapter = (ch: ChapterProgressionNode) => {
    const sec = ch.sections.find((s) => s.sectionType === "CHAPTER_CHECKPOINT");
    if (!sec) return false;
    return (
      sec.status === "UNLOCKED" ||
      sec.status === "IN_PROGRESS" ||
      sec.status === "COMPLETED" ||
      ch.status === "AWAITING_CHECKPOINT" ||
      ch.status === "REMEDIATING" ||
      ch.status === "COMPLETED"
    );
  };

  const getModulePracticalSection = (mod: ModuleProgressionNode) => {
    for (const ch of mod.chapters) {
      const sec = ch.sections.find((s) => s.sectionType === "MODULE_PRACTICAL");
      if (sec) return sec;
    }
    return null;
  };

  const renderStatusPill = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-500 border border-emerald-500/25">
            <span>✓</span> Completed
          </span>
        );
      case "AWAITING_CHECKPOINT":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            Checkpoint Ready
          </span>
        );
      case "REMEDIATING":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            Review Needed
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-500/15 text-violet-400 border border-violet-500/30">
            In Progress
          </span>
        );
      case "UNLOCKED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/15 text-sky-400 border border-sky-500/25">
            Unlocked
          </span>
        );
      default:
        return (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
              isLight
                ? "bg-slate-100 text-slate-500 border-slate-200"
                : "bg-white/[0.04] text-zinc-500 border-white/[0.08]"
            }`}
          >
            Locked
          </span>
        );
    }
  };

  const renderCurriculumSection = () => {
    const modulesToRender = progression?.modules || null;
    const allModulesCount = modulesToRender?.length || course?.modules?.length || 0;
    const allExpanded =
      allModulesCount > 0 &&
      Object.values(expandedModules).filter(Boolean).length >= allModulesCount;

    return (
      <div
        className={`p-6 rounded-[14px] border space-y-4 transition-shadow ${
          isLight
            ? "bg-white border-purple-900/10 text-slate-900 shadow-sm"
            : "bg-[#111111] border-white/[0.08] text-white shadow-xs"
        }`}
        data-purpose="curriculum-section"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className={`font-bold text-base ${isLight ? "text-slate-900" : "text-white"}`}>
              Structured Course Curriculum
            </h3>
            <p className={`text-xs mt-0.5 ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
              {isEnrolled && progression
                ? `${progression.summary.modulesCompleted}/${progression.summary.modulesTotal} modules • ${progression.summary.chaptersCompleted}/${progression.summary.chaptersTotal} chapters • ${progression.summary.sectionsCompleted}/${progression.summary.sectionsTotal} sections completed`
                : `${totalModulesCount} modules • ${totalChaptersCount} chapters • Sequential mastery unlock`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isEnrolled && (
              <span
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                  isLight
                    ? "bg-purple-50 text-purple-800 border-purple-200"
                    : "bg-white/[0.05] text-zinc-300 border-white/10"
                }`}
              >
                {percentComplete}% Complete
              </span>
            )}
            <button
              onClick={() => {
                if (allExpanded) {
                  setExpandedModules({});
                } else {
                  const all: Record<string, boolean> = {};
                  (modulesToRender || course?.modules || []).forEach((m) => {
                    all[m.id] = true;
                  });
                  setExpandedModules(all);
                }
              }}
              className={`text-xs font-semibold transition-colors cursor-pointer ${
                isLight
                  ? "text-purple-700 hover:text-purple-950"
                  : "text-neutral-300 hover:text-white"
              }`}
            >
              {allExpanded ? "Collapse All" : "Expand All"}
            </button>
          </div>
        </div>

        {/* Visual sequential rule notice */}
        <div
          className={`px-3.5 py-2.5 rounded-[10px] border text-[11px] flex items-center gap-2.5 ${
            isLight
              ? "bg-purple-50/70 border-purple-200/70 text-purple-950"
              : "bg-white/[0.03] border-white/[0.08] text-zinc-300"
          }`}
        >
          <svg
            className={`w-4 h-4 shrink-0 ${isLight ? "text-purple-600" : "text-violet-400"}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          <span>
            Modules and lessons unlock sequentially. Complete sections in the AI Studio, pass each
            chapter checkpoint (≥ 70%), and finish each module practical to unlock the next module.
          </span>
        </div>

        {/* Modules List (Live Per-User Progression Tree when enrolled) */}
        <div className="space-y-3 pt-1">
          {modulesToRender && modulesToRender.length > 0 ? (
            modulesToRender.map((mod, idx) => {
              const isOpen = !!expandedModules[mod.id];
              const isModLocked = mod.status === "LOCKED";
              const modPct =
                mod.totalChapters > 0
                  ? Math.round((mod.chaptersCompleted / mod.totalChapters) * 100)
                  : 0;
              const practicalSec = getModulePracticalSection(mod);
              const isPracticalUnlocked =
                Boolean(practicalSec) &&
                practicalSec!.status !== "LOCKED" &&
                !isModLocked;

              return (
                <div
                  key={mod.id || idx}
                  className={`border rounded-[12px] overflow-hidden transition-all duration-200 ${
                    isModLocked
                      ? isLight
                        ? "bg-slate-50/70 border-slate-200/80 opacity-80"
                        : "bg-[#0d0d10] border-white/[0.06] opacity-75"
                      : isLight
                      ? "bg-white border-purple-900/15"
                      : "bg-[#111111] border-white/[0.1]"
                  }`}
                >
                  {/* Module Header Bar */}
                  <button
                    onClick={() => toggleModule(mod.id)}
                    className={`w-full p-4 flex items-center justify-between gap-3 transition-colors text-left cursor-pointer ${
                      isModLocked
                        ? isLight
                          ? "bg-slate-100/60 hover:bg-slate-100 text-slate-600"
                          : "bg-white/[0.015] hover:bg-white/[0.03] text-zinc-400"
                        : isLight
                        ? "bg-purple-50/40 hover:bg-purple-50 text-slate-900"
                        : "bg-white/[0.03] hover:bg-white/[0.06] text-white"
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <span
                        className={`w-7 h-7 rounded-full border font-bold text-xs flex items-center justify-center shrink-0 ${
                          mod.status === "COMPLETED"
                            ? "bg-emerald-500/20 text-emerald-500 border-emerald-500/35"
                            : isModLocked
                            ? isLight
                              ? "bg-slate-200 text-slate-500 border-slate-300"
                              : "bg-white/[0.04] text-zinc-500 border-white/10"
                            : isLight
                            ? "bg-purple-200 text-purple-900 border-purple-300"
                            : "bg-violet-500/20 text-violet-300 border-violet-400/30"
                        }`}
                      >
                        {mod.status === "COMPLETED" ? (
                          "✓"
                        ) : isModLocked ? (
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                          </svg>
                        ) : (
                          mod.sequenceOrder || idx + 1
                        )}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4
                            className={`text-xs font-bold truncate ${
                              isModLocked
                                ? isLight
                                  ? "text-slate-600"
                                  : "text-zinc-400"
                                : isLight
                                ? "text-slate-900"
                                : "text-white"
                            }`}
                          >
                            {mod.title}
                          </h4>
                          {renderStatusPill(mod.status)}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span
                            className={`text-[10px] ${
                              isLight ? "text-slate-500" : "text-neutral-400"
                            }`}
                          >
                            {mod.chaptersCompleted}/{mod.totalChapters} chapters completed
                          </span>
                          {!isModLocked && (
                            <div
                              className={`w-24 h-1.5 rounded-full overflow-hidden ${
                                isLight ? "bg-purple-100" : "bg-white/10"
                              }`}
                            >
                              <div
                                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                                style={{ width: `${modPct}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <svg
                      className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
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

                  {/* Expanded Chapters List */}
                  {isOpen && (
                    <div
                      className={`p-3 space-y-2.5 border-t ${
                        isLight
                          ? "bg-slate-50/70 border-purple-900/10"
                          : "bg-[#0c0c0f] border-white/[0.06]"
                      }`}
                    >
                      {mod.chapters.map((ch) => {
                        const isChLocked = ch.status === "LOCKED" || isModLocked;
                        const checkpointReady = !isChLocked && isCheckpointUnlockedForChapter(ch);
                        const sectionsDone = ch.sections.filter(
                          (s) => s.status === "COMPLETED"
                        ).length;

                        return (
                          <div
                            key={ch.id}
                            className={`p-3.5 rounded-[10px] border transition-colors ${
                              isChLocked
                                ? isLight
                                  ? "bg-slate-100/60 border-slate-200/70 opacity-75"
                                  : "bg-white/[0.015] border-white/[0.05] opacity-65"
                                : isLight
                                ? "bg-white border-purple-900/10 hover:border-purple-300"
                                : "bg-white/[0.03] border-white/[0.08] hover:border-white/[0.16]"
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex items-start space-x-3 min-w-0">
                                <span
                                  className={`w-5 h-5 mt-0.5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                    ch.status === "COMPLETED"
                                      ? "bg-emerald-500/20 text-emerald-500"
                                      : isChLocked
                                      ? isLight
                                        ? "bg-slate-200 text-slate-500"
                                        : "bg-white/[0.06] text-zinc-500"
                                      : isLight
                                      ? "bg-purple-100 text-purple-800"
                                      : "bg-violet-500/20 text-violet-300"
                                  }`}
                                >
                                  {ch.status === "COMPLETED"
                                    ? "✓"
                                    : isChLocked
                                    ? "🔒"
                                    : ch.sequenceOrder}
                                </span>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h5
                                      className={`text-xs font-semibold ${
                                        isChLocked
                                          ? isLight
                                            ? "text-slate-500"
                                            : "text-zinc-400"
                                          : isLight
                                          ? "text-slate-900"
                                          : "text-white"
                                      }`}
                                    >
                                      {cleanTitle(ch.title)}
                                    </h5>
                                    {renderStatusPill(ch.status)}
                                    {typeof ch.checkpointScore === "number" && (
                                      <span className="text-[10px] font-mono text-emerald-400">
                                        Checkpoint: {Math.round(ch.checkpointScore * 100)}%
                                      </span>
                                    )}
                                  </div>

                                  {/* Section Progress Strip */}
                                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                    {ch.sections.map((sec) => {
                                      const secLabel =
                                        SHORT_SECTION_LABEL[sec.sectionType] || sec.title;
                                      const secDone = sec.status === "COMPLETED";
                                      const secActive =
                                        sec.status === "IN_PROGRESS" || sec.status === "UNLOCKED";

                                      return (
                                        <span
                                          key={sec.id}
                                          title={`${sec.sequenceOrder}. ${sec.title} (${sec.status})`}
                                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border ${
                                            secDone
                                              ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/25"
                                              : secActive
                                              ? isLight
                                                ? "bg-purple-100 text-purple-900 border-purple-300"
                                                : "bg-violet-500/20 text-violet-200 border-violet-400/35"
                                              : isLight
                                              ? "bg-slate-100 text-slate-400 border-slate-200"
                                              : "bg-white/[0.03] text-zinc-500 border-white/[0.06]"
                                          }`}
                                        >
                                          <span>
                                            {secDone ? "✓" : secActive ? "●" : "○"}
                                          </span>
                                          <span>
                                            {sec.sequenceOrder}. {secLabel}
                                          </span>
                                        </span>
                                      );
                                    })}
                                    <span
                                      className={`text-[10px] ml-1 ${
                                        isLight ? "text-slate-400" : "text-zinc-500"
                                      }`}
                                    >
                                      ({sectionsDone}/{ch.sections.length})
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Chapter Actions */}
                              <div className="flex items-center gap-2 shrink-0 pl-8 sm:pl-0">
                                {isChLocked ? (
                                  <span
                                    className={`text-[10px] font-medium px-2.5 py-1.5 rounded-lg border ${
                                      isLight
                                        ? "bg-slate-100 text-slate-400 border-slate-200"
                                        : "bg-white/[0.03] text-zinc-500 border-white/[0.06]"
                                    }`}
                                  >
                                    Complete prior lesson
                                  </span>
                                ) : (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => onStartCourse(courseSlug, ch.id)}
                                      className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                                        isLight
                                          ? "bg-[#5B4DF0] hover:bg-[#4D3DE0] text-white"
                                          : "bg-white hover:bg-zinc-200 text-zinc-950"
                                      }`}
                                    >
                                      {ch.status === "COMPLETED"
                                        ? "Review in Studio"
                                        : "Study in Studio"}
                                    </button>
                                    <button
                                      type="button"
                                      disabled={!checkpointReady}
                                      onClick={() =>
                                        setCheckpointModal({
                                          chapterId: ch.id,
                                          chapterTitle: cleanTitle(ch.title),
                                        })
                                      }
                                      title={
                                        checkpointReady
                                          ? "Take rubric-evaluated chapter checkpoint"
                                          : "Complete sections 1–3 in the AI Studio to unlock the checkpoint"
                                      }
                                      className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors ${
                                        checkpointReady
                                          ? ch.status === "COMPLETED"
                                            ? "border-emerald-500/35 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 cursor-pointer"
                                            : "border-amber-400/40 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 cursor-pointer"
                                          : isLight
                                          ? "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed"
                                          : "border-white/[0.08] bg-white/[0.02] text-zinc-500 cursor-not-allowed"
                                      }`}
                                    >
                                      {ch.status === "COMPLETED"
                                        ? "Checkpoint ✓"
                                        : checkpointReady
                                        ? "Take Checkpoint"
                                        : "Checkpoint 🔒"}
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* Module Practical Task Footer Row */}
                      {mod.practicalTaskId && (
                        <div
                          className={`p-3.5 rounded-[10px] border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            mod.practicalPassed
                              ? "border-emerald-500/30 bg-emerald-500/10"
                              : isPracticalUnlocked
                              ? isLight
                                ? "border-purple-300 bg-purple-50"
                                : "border-violet-400/35 bg-violet-500/10"
                              : isLight
                              ? "border-slate-200 bg-slate-100/60 opacity-75"
                              : "border-white/[0.06] bg-white/[0.02] opacity-70"
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400">
                                Module {mod.sequenceOrder} Practical Task
                              </span>
                              {mod.practicalPassed ? (
                                <span className="text-[10px] font-semibold text-emerald-500">
                                  ✓ Passed{" "}
                                  {typeof mod.practicalScore === "number"
                                    ? `(${Math.round(mod.practicalScore * 100)}%)`
                                    : ""}
                                </span>
                              ) : isPracticalUnlocked ? (
                                <span className="text-[10px] font-semibold text-amber-400">
                                  Unlocked & Ready
                                </span>
                              ) : (
                                <span
                                  className={`text-[10px] ${
                                    isLight ? "text-slate-500" : "text-zinc-500"
                                  }`}
                                >
                                  🔒 Pass all chapter checkpoints in Module {mod.sequenceOrder} to
                                  unlock
                                </span>
                              )}
                            </div>
                            <p
                              className={`text-xs font-medium mt-0.5 ${
                                isLight ? "text-slate-800" : "text-zinc-200"
                              }`}
                            >
                              {practicalSec?.title || mod.practicalTaskId}
                            </p>
                          </div>

                          <button
                            type="button"
                            disabled={!isPracticalUnlocked}
                            onClick={() =>
                              setPracticalModal({
                                moduleId: mod.id,
                                moduleTitle: mod.title,
                                taskId: mod.practicalTaskId!,
                                objective:
                                  practicalSec?.objective ||
                                  `Complete the Python practical coding task (${mod.practicalTaskId}) to verify mastery and unlock the next module.`,
                              })
                            }
                            className={`px-3.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors shrink-0 ${
                              isPracticalUnlocked
                                ? "bg-violet-600 hover:bg-violet-500 text-white cursor-pointer"
                                : isLight
                                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                                : "bg-white/[0.05] text-zinc-500 cursor-not-allowed"
                            }`}
                          >
                            {mod.practicalPassed
                              ? "Review Practical"
                              : isPracticalUnlocked
                              ? "Open Practical Task"
                              : "Locked"}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : course?.modules && course.modules.length > 0 ? (
            // Pre-enrollment syllabus preview (not enrolled yet)
            course.modules.map((mod, idx) => {
              const isOpen = !!expandedModules[mod.id];
              return (
                <div
                  key={mod.id || idx}
                  className={`border rounded-[10px] overflow-hidden transition-all duration-200 ${
                    isLight ? "bg-white border-purple-900/15" : "bg-[#111111] border-white/[0.08]"
                  }`}
                >
                  <button
                    onClick={() => toggleModule(mod.id)}
                    className={`w-full p-4 flex items-center justify-between transition-colors text-left cursor-pointer ${
                      isLight
                        ? "bg-purple-50/40 hover:bg-purple-50 text-slate-900"
                        : "bg-white/[0.03] hover:bg-white/[0.06] text-white"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span
                        className={`w-6 h-6 rounded-full border font-bold text-xs flex items-center justify-center shrink-0 ${
                          isLight
                            ? "bg-purple-200 text-purple-900 border-purple-300"
                            : "bg-white/10 text-white border-white/20"
                        }`}
                      >
                        {mod.sequenceOrder || idx + 1}
                      </span>
                      <div>
                        <h4 className={`text-xs font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
                          {mod.title}
                        </h4>
                        <span className={`text-[10px] ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
                          {mod.chapters?.length || 0} chapters •{" "}
                          {idx === 0 ? "Unlocks on enrollment" : "Unlocks sequentially"}
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

                  {isOpen && mod.chapters && mod.chapters.length > 0 && (
                    <div
                      className={`p-3 space-y-2 border-t ${
                        isLight
                          ? "bg-slate-50 border-purple-900/10"
                          : "bg-[#111111] border-white/[0.08]"
                      }`}
                    >
                      {mod.chapters.map((ch) => (
                        <div
                          key={ch.id}
                          className={`p-2.5 rounded-[8px] flex items-center justify-between ${
                            isLight
                              ? "bg-white border border-purple-900/10"
                              : "bg-white/[0.04]"
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <span
                              className={`text-[11px] font-bold ${
                                isLight ? "text-slate-500" : "text-neutral-400"
                              }`}
                            >
                              {ch.sequenceOrder}.
                            </span>
                            <h5
                              className={`text-xs font-semibold ${
                                isLight ? "text-slate-900" : "text-white"
                              }`}
                            >
                              {cleanTitle(ch.title)}
                            </h5>
                          </div>
                          <span
                            className={`text-[10px] ${
                              isLight ? "text-slate-500" : "text-zinc-500"
                            }`}
                          >
                            Enroll to start
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className={`text-center py-6 text-xs ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
              {isLoading ? "Loading structured syllabus..." : "Curriculum data ready."}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSkillsSection = () => {
    if (!isEnrolled || !skillsReport) {
      return (
        <div
          className={`p-6 rounded-[14px] border space-y-4 ${
            isLight
              ? "bg-white border-purple-900/10 text-slate-900 shadow-sm"
              : "bg-[#111111] border-white/[0.08] text-white shadow-xs"
          }`}
        >
          <div>
            <h3 className="font-bold text-base">Skills & Rubric Analytics</h3>
            <p className={`text-xs mt-1 ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
              Enroll and engage in the AI Learning Studio to generate your personal backend-tracked
              rubric evaluations, strengths, weakpoints, and cognitive profile.
            </p>
          </div>
          <button
            onClick={() => onStartCourse(courseSlug)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer ${
              isLight ? "bg-[#5B4DF0] text-white" : "bg-white text-zinc-950"
            }`}
          >
            Enroll & Start Evaluating Skills →
          </button>
        </div>
      );
    }

    const cognitiveLevels = ["RECALL", "EXPLAIN", "APPLY", "DEBUG", "REASON"];

    return (
      <div className="space-y-5" data-purpose="skills-analytics-section">
        {/* Top Summary Bar */}
        <div
          className={`p-6 rounded-[14px] border grid grid-cols-2 sm:grid-cols-4 gap-4 ${
            isLight
              ? "bg-white border-purple-900/10 text-slate-900 shadow-sm"
              : "bg-[#111111] border-white/[0.08] text-white shadow-xs"
          }`}
        >
          <div>
            <div className={`text-[10px] uppercase tracking-wider font-semibold ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
              Overall Skill Score
            </div>
            <div className="text-2xl font-extrabold mt-1">
              {Math.round(skillsReport.overallProgress.overallSkillScore * 100)}%
            </div>
          </div>
          <div>
            <div className={`text-[10px] uppercase tracking-wider font-semibold ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
              Strengths
            </div>
            <div className="text-2xl font-extrabold text-emerald-500 mt-1">
              {skillsReport.strengths.length}
            </div>
          </div>
          <div>
            <div className={`text-[10px] uppercase tracking-wider font-semibold ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
              Developing
            </div>
            <div className="text-2xl font-extrabold text-sky-400 mt-1">
              {skillsReport.developing.length}
            </div>
          </div>
          <div>
            <div className={`text-[10px] uppercase tracking-wider font-semibold ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
              Weakpoints
            </div>
            <div className="text-2xl font-extrabold text-amber-400 mt-1">
              {skillsReport.weakpoints.length}
            </div>
          </div>
        </div>

        {/* Strengths & Weakpoints Two-Column Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Strengths Card */}
          <div
            className={`p-5 rounded-[14px] border space-y-3 ${
              isLight
                ? "bg-white border-purple-900/10 text-slate-900 shadow-sm"
                : "bg-[#111111] border-white/[0.08] text-white shadow-xs"
            }`}
          >
            <h4 className="text-sm font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Strong Skills
            </h4>
            {skillsReport.strengths.length > 0 ? (
              <div className="space-y-2.5">
                {skillsReport.strengths.map((s) => (
                  <div
                    key={s.skillDimensionId}
                    className={`p-3 rounded-[10px] border ${
                      isLight
                        ? "bg-emerald-50/70 border-emerald-200"
                        : "bg-emerald-500/10 border-emerald-500/25"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold">{s.skillName}</span>
                      <span className="text-xs font-mono font-bold text-emerald-500">
                        {Math.round(s.compositeScore * 100)}%
                      </span>
                    </div>
                    <p className={`text-[11px] mt-1 ${isLight ? "text-slate-600" : "text-zinc-300"}`}>
                      {s.evidenceSummary}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className={`text-xs ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                Continue completing Socratic lessons, checkpoints, and practicals to earn verified
                strengths (≥ 75% composite rubric & BKT score).
              </p>
            )}
          </div>

          {/* Weakpoints & Remediation Card */}
          <div
            className={`p-5 rounded-[14px] border space-y-3 ${
              isLight
                ? "bg-white border-purple-900/10 text-slate-900 shadow-sm"
                : "bg-[#111111] border-white/[0.08] text-white shadow-xs"
            }`}
          >
            <h4 className="text-sm font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Weakpoints & Focus Areas
            </h4>
            {skillsReport.weakpoints.length > 0 ? (
              <div className="space-y-2.5">
                {skillsReport.weakpoints.map((w) => (
                  <div
                    key={w.skillDimensionId}
                    className={`p-3 rounded-[10px] border space-y-1.5 ${
                      isLight
                        ? "bg-amber-50/70 border-amber-200"
                        : "bg-amber-500/10 border-amber-500/25"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold">{w.skillName}</span>
                      <span className="text-xs font-mono font-bold text-amber-400">
                        {Math.round(w.compositeScore * 100)}%
                      </span>
                    </div>
                    <p className={`text-[11px] ${isLight ? "text-slate-600" : "text-zinc-300"}`}>
                      {w.evidenceSummary}
                    </p>
                    {w.weakestCriteria.slice(0, 2).map((cr) => (
                      <div
                        key={cr.criterionId}
                        className={`text-[10px] p-2 rounded border ${
                          isLight
                            ? "bg-white border-amber-200/80 text-slate-700"
                            : "bg-black/30 border-white/[0.08] text-zinc-300"
                        }`}
                      >
                        <div className="font-medium">{cr.statement}</div>
                        {cr.lastMisconception && (
                          <div className="text-rose-400 mt-0.5">
                            Misconception: {cr.lastMisconception}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <p className={`text-xs ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                No weakpoints flagged yet. Rubric failures or conceptual misconceptions detected in
                dialogue or checkpoints will automatically appear here with remediation targets.
              </p>
            )}
          </div>
        </div>

        {/* Developing + Cognitive Level Breakdown */}
        <div
          className={`p-6 rounded-[14px] border space-y-4 ${
            isLight
              ? "bg-white border-purple-900/10 text-slate-900 shadow-sm"
              : "bg-[#111111] border-white/[0.08] text-white shadow-xs"
          }`}
        >
          <h4 className="text-sm font-bold">Cognitive Mastery Breakdown</h4>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {cognitiveLevels.map((lvl) => {
              const item = skillsReport.cognitiveBreakdown?.[lvl];
              const pct = item && item.score !== null ? Math.round(item.score * 100) : null;
              return (
                <div
                  key={lvl}
                  className={`p-3 rounded-[10px] border ${
                    isLight
                      ? "bg-purple-50/40 border-purple-900/10"
                      : "bg-white/[0.03] border-white/[0.07]"
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-bold tracking-wider">
                    <span className={isLight ? "text-slate-600" : "text-zinc-400"}>{lvl}</span>
                    <span className="font-mono">
                      {pct !== null ? `${pct}%` : "—"}
                    </span>
                  </div>
                  <div
                    className={`w-full h-1.5 rounded-full overflow-hidden mt-2 ${
                      isLight ? "bg-purple-100" : "bg-white/10"
                    }`}
                  >
                    <div
                      className="h-full bg-violet-500 rounded-full transition-all"
                      style={{ width: `${pct ?? 0}%` }}
                    />
                  </div>
                  <div className={`text-[10px] mt-1.5 ${isLight ? "text-slate-500" : "text-zinc-500"}`}>
                    {item?.evaluatedCount || 0} criteria assessed
                  </div>
                </div>
              );
            })}
          </div>

          {/* Developing & Unassessed Chips */}
          {(skillsReport.developing.length > 0 || skillsReport.unassessed.length > 0) && (
            <div className="pt-3 border-t border-white/[0.08] space-y-2">
              {skillsReport.developing.length > 0 && (
                <div>
                  <div className={`text-[11px] font-semibold mb-1.5 ${isLight ? "text-slate-700" : "text-zinc-300"}`}>
                    Developing Skills
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {skillsReport.developing.map((d) => (
                      <span
                        key={d.skillDimensionId}
                        className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-sky-500/15 text-sky-400 border border-sky-500/25"
                      >
                        {d.skillName} · {Math.round(d.compositeScore * 100)}%
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {skillsReport.unassessed.length > 0 && (
                <div>
                  <div className={`text-[11px] font-semibold mb-1.5 ${isLight ? "text-slate-600" : "text-zinc-400"}`}>
                    Upcoming Skill Dimensions ({skillsReport.unassessed.length})
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {skillsReport.unassessed.map((u) => (
                      <span
                        key={u.skillDimensionId}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-medium border ${
                          isLight
                            ? "bg-slate-100 text-slate-600 border-slate-200"
                            : "bg-white/[0.04] text-zinc-400 border-white/[0.08]"
                        }`}
                      >
                        {u.skillName}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderProjectsSection = () => {
    const mods = progression?.modules || [];
    return (
      <div
        className={`p-6 rounded-[14px] border space-y-4 ${
          isLight
            ? "bg-white border-purple-900/10 text-slate-900 shadow-sm"
            : "bg-[#111111] border-white/[0.08] text-white shadow-xs"
        }`}
      >
        <div>
          <h3 className="font-bold text-base">Module Practical Coding Projects</h3>
          <p className={`text-xs mt-0.5 ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
            Each module concludes with an automated unit-tested Python practical task required to
            unlock the next module.
          </p>
        </div>

        {mods.length === 0 ? (
          <div className="py-6 text-xs text-zinc-400">
            Enroll in Python Fundamentals to unlock your structured practical coding tasks.
          </div>
        ) : (
          <div className="space-y-3">
            {mods.map((mod) => {
              const practicalSec = getModulePracticalSection(mod);
              const unlocked =
                Boolean(practicalSec) &&
                practicalSec!.status !== "LOCKED" &&
                mod.status !== "LOCKED";
              return (
                <div
                  key={mod.id}
                  className={`p-4 rounded-[12px] border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    mod.practicalPassed
                      ? "border-emerald-500/30 bg-emerald-500/10"
                      : unlocked
                      ? isLight
                        ? "border-purple-300 bg-purple-50/70"
                        : "border-violet-400/30 bg-violet-500/10"
                      : isLight
                      ? "border-slate-200 bg-slate-50 opacity-75"
                      : "border-white/[0.06] bg-white/[0.02] opacity-70"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400">
                        Module {mod.sequenceOrder}
                      </span>
                      {mod.practicalPassed ? (
                        <span className="text-[10px] font-semibold text-emerald-500">
                          ✓ Passed
                        </span>
                      ) : unlocked ? (
                        <span className="text-[10px] font-semibold text-amber-400">
                          Ready
                        </span>
                      ) : (
                        <span className="text-[10px] text-zinc-500">🔒 Locked</span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold mt-0.5">{mod.title}</h4>
                    <p className={`text-[11px] mt-0.5 ${isLight ? "text-slate-600" : "text-zinc-400"}`}>
                      {practicalSec?.objective || mod.practicalTaskId}
                    </p>
                  </div>

                  {mod.practicalTaskId && (
                    <button
                      type="button"
                      disabled={!unlocked}
                      onClick={() =>
                        setPracticalModal({
                          moduleId: mod.id,
                          moduleTitle: mod.title,
                          taskId: mod.practicalTaskId!,
                          objective: practicalSec?.objective || mod.practicalTaskId!,
                        })
                      }
                      className={`px-3.5 py-2 rounded-lg text-xs font-semibold shrink-0 ${
                        unlocked
                          ? "bg-violet-600 hover:bg-violet-500 text-white cursor-pointer"
                          : isLight
                          ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                          : "bg-white/[0.05] text-zinc-500 cursor-not-allowed"
                      }`}
                    >
                      {mod.practicalPassed
                        ? "Review Solution"
                        : unlocked
                        ? "Open Practical"
                        : "Locked"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6" data-purpose="course-details-page">
      {/* BEGIN: Breadcrumbs */}
      <nav
        className={`flex items-center space-x-2 text-xs font-medium mb-1 transition-colors duration-300 ${
          isLight ? "text-purple-900/70" : "text-purple-200/70"
        }`}
        aria-label="Breadcrumb"
      >
        <button
          onClick={() => onNavigate("catalog")}
          className={`hover:opacity-100 flex items-center transition-colors cursor-pointer ${
            isLight ? "text-purple-950 hover:text-purple-700" : "hover:text-white"
          }`}
        >
          <svg
            className="w-3.5 h-3.5 mr-1"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            viewBox="0 0 24 24"
          >
            <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Explore Courses</span>
        </button>
        <span className={isLight ? "text-purple-400" : "text-purple-300/40"}>/</span>
        <span className={`font-semibold ${isLight ? "text-purple-950" : "text-white"}`}>
          {course?.title || "Python Fundamentals"}
        </span>
      </nav>
      {/* END: Breadcrumbs */}

      {/* BEGIN: HeaderSection */}
      <div
        className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4"
        data-purpose="course-header-section"
      >
        <div>
          <h1
            className={`text-3xl font-extrabold tracking-tight font-sans transition-colors duration-300 ${
              isLight ? "text-slate-900" : "text-white"
            }`}
          >
            {course?.title || "Python Fundamentals"}
          </h1>
          <p
            className={`text-sm mt-1.5 font-normal max-w-3xl leading-relaxed transition-colors duration-300 ${
              isLight ? "text-slate-700" : "text-purple-200/80"
            }`}
          >
            {course?.summary ||
              "Master Python from first principles. Build real projects, solve problems, and get certified."}
          </p>

          {/* Course Meta Badges */}
          <div
            className={`flex flex-wrap items-center gap-6 mt-3.5 text-xs font-medium ${
              isLight ? "text-slate-700" : "text-purple-200/70"
            }`}
          >
            <div className="flex items-center space-x-1.5">
              <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11h3v6H2v-6zm5-4h3v10H7V7zm5-4h3v14h-3V3z" />
              </svg>
              <span className={`font-semibold ${isLight ? "text-emerald-700" : "text-emerald-300"}`}>
                Beginner
              </span>
            </div>
            <div className="flex items-center space-x-1.5">
              <svg
                className={`w-4 h-4 stroke-[2] ${isLight ? "text-purple-600" : "text-purple-300/60"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>{totalModulesCount} modules</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <svg
                className={`w-4 h-4 stroke-[2] ${isLight ? "text-purple-600" : "text-purple-300/60"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>42 hours</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <svg
                className={`w-4 h-4 stroke-[2] ${isLight ? "text-purple-600" : "text-purple-300/60"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Certification</span>
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
              <path
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <button
            onClick={() => onStartCourse(courseSlug, activeContext?.chapter.id)}
            className={`font-bold px-6 py-2.5 rounded-[8px] text-sm flex items-center space-x-2 shadow-lg transition active:scale-98 cursor-pointer ${
              isLight
                ? "bg-[#5B4DF0] hover:bg-[#4D3DE0] text-white"
                : "bg-white hover:bg-purple-50 text-[#15062B]"
            }`}
          >
            <span>{isEnrolled ? "Continue Learning" : "Enroll Now"}</span>
            <svg
              className="w-4 h-4 stroke-[2]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
      {/* END: HeaderSection */}

      {/* Live Feedback Banner after passing a Checkpoint or Practical */}
      {feedbackBanner && (
        <div
          className={`px-4 py-3 rounded-xl border text-xs font-medium flex items-center justify-between ${
            feedbackBanner.type === "success"
              ? "border-emerald-500/35 bg-emerald-500/15 text-emerald-300"
              : "border-amber-500/35 bg-amber-500/15 text-amber-300"
          }`}
        >
          <span>{feedbackBanner.text}</span>
          <button
            type="button"
            onClick={() => setFeedbackBanner(null)}
            className="text-xs opacity-70 hover:opacity-100 cursor-pointer ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* BEGIN: NavigationTabs */}
      <div
        className={`border-b mb-6 ${isLight ? "border-purple-900/15" : "border-white/10"}`}
        data-purpose="course-tabs"
      >
        <nav
          className={`flex space-x-7 text-xs font-semibold ${
            isLight ? "text-slate-700" : "text-purple-200/70"
          }`}
          aria-label="Course Sections"
        >
          {(
            [
              { id: "overview", label: "Overview" },
              { id: "curriculum", label: "Curriculum & Progress" },
              { id: "skills", label: "Skills & Rubrics" },
              { id: "projects", label: "Practicals" },
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
          {activeTab === "overview" && (
            <>
              {/* BEGIN: HeroBanner */}
              <div
                className={`relative overflow-hidden rounded-[20px] p-8 md:p-10 shadow-lg border transition-all duration-300 ${
                  isLight
                    ? "bg-white text-slate-900 border-purple-900/10 shadow-[0_12px_36px_rgba(76,29,149,0.08)]"
                    : "bg-[#0b0f19] text-white border-neutral-800"
                }`}
                data-purpose="hero-banner"
              >
                <div
                  className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${
                    isLight
                      ? "bg-[radial-gradient(circle_at_60%_50%,rgba(124,58,237,0.06),transparent_60%)]"
                      : "bg-[radial-gradient(circle_at_60%_50%,rgba(37,99,235,0.22),transparent_60%)]"
                  }`}
                />
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex-1 space-y-5">
                    <div
                      className={`space-y-0.5 font-sans text-3xl md:text-4xl font-extrabold tracking-tight leading-tight ${
                        isLight ? "text-slate-900" : "text-neutral-100"
                      }`}
                    >
                      <div>Think</div>
                      <div>Build</div>
                      <div>Solve</div>
                      <div>Grow</div>
                    </div>
                    <p className={`text-xs font-sans tracking-wide ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                      Start your Python journey today. Build real skills. Think deeper. Get certified.
                    </p>
                  </div>

                  <div className="flex items-center space-x-5 shrink-0">
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
                    <div className="font-mono text-[11px] leading-relaxed select-none text-neutral-300 hidden sm:block">
                      <div className="text-indigo-400 font-medium">
                        def <span className="text-yellow-300">learn</span>():
                      </div>
                      <div className="pl-4 text-sky-300">build()</div>
                      <div className="pl-4 text-emerald-400">practice()</div>
                      <div className="pl-4 text-teal-300">get_certified()</div>
                      <div className="pl-4">
                        <span className="text-rose-400">return</span>{" "}
                        <span className="text-amber-300">"Success"</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Structured Curriculum with Real Per-User Locks & Checkpoints */}
              {renderCurriculumSection()}

              {/* Compact Skills Snapshot (Links to full Skills tab) */}
              {isEnrolled && skillsReport && renderSkillsSection()}

              {/* Certification Pathway */}
              <div
                className={`p-6 rounded-[14px] border space-y-4 transition-shadow ${
                  isLight
                    ? "bg-white border-purple-900/10 text-slate-900 shadow-sm"
                    : "bg-[#111111] border-white/[0.08] text-white shadow-xs"
                }`}
                data-purpose="certification-pathway-section"
              >
                <div>
                  <h3 className={`font-bold text-sm ${isLight ? "text-slate-900" : "text-white"}`}>
                    Defensible Certification Pathway
                  </h3>
                  <p className={`text-[11px] ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                    How you earn your verified credential
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                  <div
                    className={`p-3.5 rounded-[10px] border space-y-1.5 ${
                      isLight ? "bg-purple-50/50 border-purple-100" : "bg-white/[0.04] border-white/[0.06]"
                    }`}
                  >
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
                      Tier 1
                    </span>
                    <h4 className="text-xs font-bold">Foundation Credential</h4>
                    <p className={`text-[11px] leading-relaxed ${isLight ? "text-slate-600" : "text-neutral-300"}`}>
                      Consistent section completion, conceptual checkpoints, and foundational rubric criteria.
                    </p>
                  </div>
                  <div
                    className={`p-3.5 rounded-[10px] border space-y-1.5 ${
                      isLight ? "bg-purple-50/50 border-purple-100" : "bg-white/[0.04] border-white/[0.06]"
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-500">
                      Tier 2
                    </span>
                    <h4 className="text-xs font-bold">Proficient Credential</h4>
                    <p className={`text-[11px] leading-relaxed ${isLight ? "text-slate-600" : "text-neutral-300"}`}>
                      Applied problem solving, automated module practicals, and verified Bayesian mastery.
                    </p>
                  </div>
                  <div
                    className={`p-3.5 rounded-[10px] border space-y-1.5 ${
                      isLight ? "bg-purple-50/50 border-purple-100" : "bg-white/[0.04] border-white/[0.06]"
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">
                      Tier 3
                    </span>
                    <h4 className="text-xs font-bold">Advanced Master</h4>
                    <p className={`text-[11px] leading-relaxed ${isLight ? "text-slate-600" : "text-neutral-300"}`}>
                      High-order code demonstration, sandbox execution, and oral AI Viva defense.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "curriculum" && renderCurriculumSection()}
          {activeTab === "skills" && renderSkillsSection()}
          {activeTab === "projects" && renderProjectsSection()}
        </div>
        {/* END: Left 8-Column Area */}

        {/* BEGIN: RightSidebarColumn (4 cols) */}
        <div className="lg:col-span-4 space-y-5" data-purpose="right-sidebar">
          {/* Card 1: Per-User Live Progress Card (or Enroll CTA if not enrolled) */}
          <div
            className={`p-6 rounded-[14px] border transition-shadow ${
              isLight
                ? "bg-white border-purple-900/10 text-slate-900 shadow-sm"
                : "bg-[#111111] border-white/[0.08] text-white shadow-xs"
            }`}
          >
            {isEnrolled && progression ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className={`font-bold text-sm ${isLight ? "text-slate-900" : "text-white"}`}>
                    Your Learning Progress
                  </h3>
                  <span className="text-xs font-mono font-bold text-emerald-500">
                    {percentComplete}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div
                  className={`w-full h-2 rounded-full overflow-hidden ${
                    isLight ? "bg-purple-100" : "bg-white/10"
                  }`}
                >
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, percentComplete))}%` }}
                  />
                </div>

                {/* Deterministic Counters */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div
                    className={`p-2.5 rounded-[10px] border ${
                      isLight
                        ? "bg-purple-50/50 border-purple-100"
                        : "bg-white/[0.03] border-white/[0.07]"
                    }`}
                  >
                    <div className="text-sm font-extrabold font-mono">
                      {progression.summary.modulesCompleted}/{progression.summary.modulesTotal}
                    </div>
                    <div className={`text-[10px] ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                      Modules
                    </div>
                  </div>
                  <div
                    className={`p-2.5 rounded-[10px] border ${
                      isLight
                        ? "bg-purple-50/50 border-purple-100"
                        : "bg-white/[0.03] border-white/[0.07]"
                    }`}
                  >
                    <div className="text-sm font-extrabold font-mono">
                      {progression.summary.chaptersCompleted}/{progression.summary.chaptersTotal}
                    </div>
                    <div className={`text-[10px] ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                      Chapters
                    </div>
                  </div>
                  <div
                    className={`p-2.5 rounded-[10px] border ${
                      isLight
                        ? "bg-purple-50/50 border-purple-100"
                        : "bg-white/[0.03] border-white/[0.07]"
                    }`}
                  >
                    <div className="text-sm font-extrabold font-mono">
                      {progression.summary.sectionsCompleted}/{progression.summary.sectionsTotal}
                    </div>
                    <div className={`text-[10px] ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                      Sections
                    </div>
                  </div>
                </div>

                {/* Active Location Box */}
                {activeContext && (
                  <div
                    className={`p-3 rounded-[10px] border text-xs space-y-1 ${
                      isLight
                        ? "bg-slate-50 border-purple-900/10"
                        : "bg-white/[0.03] border-white/[0.08]"
                    }`}
                  >
                    <div className={`text-[10px] uppercase tracking-wider font-semibold ${isLight ? "text-purple-700" : "text-violet-400"}`}>
                      Current Step
                    </div>
                    <div className="font-semibold leading-snug">
                      {cleanTitle(activeContext.chapter.title)}
                    </div>
                    {activeContext.activeSection && (
                      <div className={`text-[11px] ${isLight ? "text-slate-600" : "text-zinc-400"}`}>
                        Section {activeContext.activeSection.sequenceOrder}:{" "}
                        {activeContext.activeSection.title}
                      </div>
                    )}
                  </div>
                )}

                {/* Primary Studio Launch CTA */}
                <button
                  onClick={() => onStartCourse(courseSlug, activeContext?.chapter.id)}
                  className={`w-full font-bold py-3 rounded-[8px] text-xs flex items-center justify-center space-x-2 shadow-sm transition active:scale-98 cursor-pointer ${
                    isLight
                      ? "bg-[#5B4DF0] hover:bg-[#4D3DE0] text-white"
                      : "bg-white hover:bg-neutral-200 text-neutral-950"
                  }`}
                >
                  <span>Continue in AI Studio</span>
                  <svg className="w-4 h-4 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {/* Contextual Ready Checkpoint / Practical Shortcut */}
                {activeContext?.checkpointReady && (
                  <button
                    type="button"
                    onClick={() =>
                      setCheckpointModal({
                        chapterId: activeContext.chapter.id,
                        chapterTitle: cleanTitle(activeContext.chapter.title),
                      })
                    }
                    className="w-full font-semibold py-2.5 rounded-[8px] text-xs border border-amber-400/40 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 transition cursor-pointer"
                  >
                    Take Ready Chapter Checkpoint →
                  </button>
                )}

                {activeContext?.practicalReady && activeContext.module.practicalTaskId && (
                  <button
                    type="button"
                    onClick={() =>
                      setPracticalModal({
                        moduleId: activeContext.module.id,
                        moduleTitle: activeContext.module.title,
                        taskId: activeContext.module.practicalTaskId!,
                        objective:
                          activeContext.practicalSection?.objective ||
                          activeContext.module.practicalTaskId!,
                      })
                    }
                    className="w-full font-semibold py-2.5 rounded-[8px] text-xs bg-violet-600 hover:bg-violet-500 text-white transition cursor-pointer"
                  >
                    Open Module {activeContext.module.sequenceOrder} Practical →
                  </button>
                )}

                <div
                  className={`pt-2 border-t flex items-center justify-between text-[11px] ${
                    isLight ? "border-purple-900/10 text-slate-600" : "border-white/[0.08] text-zinc-400"
                  }`}
                >
                  <span>
                    Tier: <strong className={isLight ? "text-slate-900" : "text-white"}>{progression.currentTier}</strong>
                  </span>
                  {skillsReport && (
                    <span>
                      Skill Score:{" "}
                      <strong className={isLight ? "text-slate-900" : "text-white"}>
                        {Math.round(skillsReport.overallProgress.overallSkillScore * 100)}%
                      </strong>
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center space-x-2.5 mb-4">
                  <div className="w-7 h-7 rounded-[8px] bg-purple-500/15 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                    <svg className="w-4 h-4 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <h3 className={`font-bold text-sm ${isLight ? "text-slate-900" : "text-white"}`}>
                    Start Your Learning Journey
                  </h3>
                </div>

                <ul className={`space-y-2.5 text-xs mb-6 ${isLight ? "text-slate-700" : "text-neutral-300"}`}>
                  {[
                    "Structured section-by-section progression",
                    "Backend-tracked rubric mastery & skills",
                    "Hands-on Python practical harnesses",
                    "Conceptual checkpoints & AI viva",
                    "Earn a verified certificate",
                  ].map((text, idx) => (
                    <li key={idx} className="flex items-center space-x-2.5">
                      <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          clipRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          fillRule="evenodd"
                        />
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
                  <span>Enroll Now</span>
                  <svg className="w-4 h-4 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* Card 2: Course Instructor */}
          <div
            className={`p-6 rounded-[14px] border transition-shadow ${
              isLight
                ? "bg-white border-purple-900/10 text-slate-900 shadow-sm"
                : "bg-[#111111] border-white/[0.08] text-white shadow-xs"
            }`}
          >
            <h3 className={`font-bold text-xs mb-3.5 uppercase tracking-wide ${isLight ? "text-slate-900" : "text-white"}`}>
              Course Instructor
            </h3>
            <div className="flex items-center space-x-3 mb-3">
              <div
                className={`w-9 h-9 rounded-full border flex items-center justify-center shrink-0 ${
                  isLight
                    ? "bg-purple-100 text-purple-900 border-purple-200"
                    : "bg-white/10 text-white border-white/20"
                }`}
              >
                <span className="text-[9px] font-bold tracking-tight">CERTIFY</span>
              </div>
              <div>
                <h4 className={`text-xs font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
                  CERTIFY Academic Team
                </h4>
                <p className={`text-[11px] ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
                  Industry experts • Experienced educators
                </p>
              </div>
            </div>
            <p className={`text-[11.5px] leading-relaxed ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
              Curated and reviewed by industry professionals and academic experts to ensure
              practical, up-to-date, and job-relevant learning.
            </p>
          </div>

          {/* Card 3: Prerequisites */}
          <div
            className={`p-6 rounded-[14px] border transition-shadow ${
              isLight
                ? "bg-white border-purple-900/10 text-slate-900 shadow-sm"
                : "bg-[#111111] border-white/[0.08] text-white shadow-xs"
            }`}
          >
            <h3 className={`font-bold text-xs mb-3.5 uppercase tracking-wide ${isLight ? "text-slate-900" : "text-white"}`}>
              Prerequisites
            </h3>
            <ul className={`space-y-2 text-xs ${isLight ? "text-slate-700" : "text-neutral-300"}`}>
              {[
                "Basic computer knowledge",
                "No prior programming experience required",
                "Willingness to learn and practice",
              ].map((item, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <svg
                    className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isLight ? "text-slate-400" : "text-neutral-400"}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Card 4: Related Courses (Coming Soon) */}
          <div
            className={`p-6 rounded-[14px] border transition-shadow ${
              isLight
                ? "bg-white border-purple-900/10 text-slate-900 shadow-sm"
                : "bg-[#111111] border-white/[0.08] text-white shadow-xs"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-bold text-xs uppercase tracking-wide ${isLight ? "text-slate-900" : "text-white"}`}>
                Related Courses
              </h3>
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
                <div
                  key={rel.slug}
                  aria-disabled="true"
                  className="w-full flex items-center justify-between space-x-3 text-left opacity-60 cursor-not-allowed select-none"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className={`w-9 h-9 rounded-[8px] ${rel.bg} ${rel.text} flex items-center justify-center shrink-0`}>
                      <svg className="w-4 h-4 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <h4 className={`text-xs font-semibold truncate ${isLight ? "text-slate-800" : "text-zinc-200"}`}>
                        {rel.title}
                      </h4>
                      <p className={`text-[10px] ${isLight ? "text-slate-500" : "text-neutral-500"}`}>
                        {rel.level}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider border ${
                      isLight
                        ? "bg-slate-100 text-slate-500 border-slate-200"
                        : "bg-white/[0.05] text-zinc-400 border-white/10"
                    }`}
                  >
                    Coming Soon
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* END: RightSidebarColumn */}
      </div>

      {/* Rubric-Evaluated Chapter Checkpoint Modal */}
      {checkpointModal && progression?.enrollmentId && (
        <CheckpointPanel
          chapterId={checkpointModal.chapterId}
          chapterTitle={checkpointModal.chapterTitle}
          enrollmentId={progression.enrollmentId}
          onClose={() => setCheckpointModal(null)}
          onCompleted={async (res) => {
            await loadCourseAndProgress();
            if (res?.isPassed) {
              setFeedbackBanner({
                type: "success",
                text: res.progression?.unlockedPractical
                  ? "Checkpoint passed! The Module Practical Task is now unlocked below."
                  : "Checkpoint passed! The next lesson is now unlocked.",
              });
            } else {
              setFeedbackBanner({
                type: "info",
                text: "Checkpoint needs review. Check your weakpoint rubric feedback and retry when ready.",
              });
            }
          }}
        />
      )}

      {/* Module Practical Verification Modal */}
      {practicalModal && progression?.enrollmentId && (
        <PracticalPanel
          enrollmentId={progression.enrollmentId}
          moduleId={practicalModal.moduleId}
          moduleTitle={practicalModal.moduleTitle}
          taskId={practicalModal.taskId}
          objective={practicalModal.objective}
          onClose={() => setPracticalModal(null)}
          onCompleted={async (res) => {
            await loadCourseAndProgress();
            if (res?.passed) {
              setFeedbackBanner({
                type: "success",
                text: "Module practical passed! The next module is now unlocked.",
              });
            }
          }}
        />
      )}
    </div>
  );
};
