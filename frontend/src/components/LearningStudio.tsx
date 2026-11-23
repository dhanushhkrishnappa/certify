import React, { useState, useEffect, useCallback } from "react";
import {
  CheckCircle2,
  Lock,
  Sparkles,
  Code2,
  ArrowRight,
  ChevronRight,
  Award,
} from "lucide-react";
import { AiChat9, type AIModel, type ReasoningEffort, type ChatMessage } from "./ai/AiChat9.js";
import { CheckpointPanel } from "./studio/CheckpointPanel.js";
import { PracticalPanel } from "./studio/PracticalPanel.js";
import { api } from "../services/api.js";
import { API_BASE } from "../constants/api.js";
import type {
  User,
  LearningSessionContext,
  SessionProgressionSnapshot,
} from "../types/index.js";

interface LearningStudioProps {
  courseSlug: string;
  initialChapterId?: string | null;
  user?: User | null;
  onNavigateVerify?: (credentialId: string) => void;
  onNavigate?: (view: string) => void;
  onLogout?: () => void;
}

const COURSE_DISPLAY_NAMES: Record<string, string> = {
  "python-fundamentals": "Python Fundamentals",
  "web-development-foundations": "Web Development Foundations",
  "data-structures-problem-solving": "Data Structures & Problem Solving",
  "generative-ai-developers": "Generative AI for Developers",
  "databases-sql": "Databases & SQL",
  "devops-cloud-essentials": "DevOps & Cloud Essentials",
};

const cleanTitle = (t?: string | null) => (t ? t.replace(/^\*+\s*/, "").trim() : "");

const SECTION_SHORT_LABELS: Record<string, string> = {
  CONCEPT_INTUITION: "S1 · Intuition",
  TECHNICAL_MECHANICS: "S2 · Mechanics",
  PITFALLS_AND_DEBUGGING: "S3 · Pitfalls",
  CHAPTER_CHECKPOINT: "S4 · Checkpoint",
  MODULE_PRACTICAL: "S5 · Practical Lab",
};

export const LearningStudio: React.FC<LearningStudioProps> = ({
  courseSlug,
  initialChapterId,
  user,
  onNavigate,
}) => {
  const [sessionContext, setSessionContext] = useState<LearningSessionContext | null>(null);
  const [progressionSnapshot, setProgressionSnapshot] =
    useState<SessionProgressionSnapshot | null>(null);
  const [initialMessages, setInitialMessages] = useState<ChatMessage[]>([]);
  const [showCheckpointModal, setShowCheckpointModal] = useState(false);
  const [showPracticalModal, setShowPracticalModal] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [transitionToast, setTransitionToast] = useState<string | null>(null);

  const mapMessages = (msgs: any[] | undefined): ChatMessage[] =>
    (msgs || []).map((m: any) => ({
      id: m.id,
      role: (m.role || (m.sender === "LEARNER" ? "user" : "assistant")) as "user" | "assistant",
      content: m.content,
      timestamp: m.createdAt,
    }));

  // Fetch isolated per-user session context and restore conversation history + live progression state
  const refreshSessionAndProgression = useCallback(
    async (targetChapterId?: string | null) => {
      try {
        const data = await api.getSessionContext(courseSlug);
        setSessionContext(data);
        if (data.progressionSnapshot) {
          setProgressionSnapshot(data.progressionSnapshot);
        }

        if (targetChapterId && data.session?.chapter?.id !== targetChapterId) {
          try {
            const started = await api.startSession(courseSlug, targetChapterId);
            if (started?.session) {
              setSessionContext((prev) =>
                prev
                  ? { ...prev, session: started.session }
                  : { ...data, session: started.session }
              );
              if (started.progressionSnapshot) {
                setProgressionSnapshot(started.progressionSnapshot);
              }
              setInitialMessages(mapMessages(started.session.messages));
              return;
            }
          } catch (switchErr) {
            console.warn("[LearningStudio] Chapter switch blocked or failed:", switchErr);
          }
        }

        if (data.session?.messages && data.session.messages.length > 0) {
          setInitialMessages(mapMessages(data.session.messages));
        } else if (!data.session) {
          const started = await api.startSession(
            courseSlug,
            targetChapterId || undefined
          );
          if (started?.session) {
            setSessionContext((prev) =>
              prev
                ? { ...prev, session: started.session }
                : { ...data, session: started.session }
            );
            if (started.progressionSnapshot) {
              setProgressionSnapshot(started.progressionSnapshot);
            }
            setInitialMessages(mapMessages(started.session.messages));
          }
        }
      } catch (err: any) {
        console.info("Using local Socratic session:", err?.message || err);
      }
    },
    [courseSlug]
  );

  useEffect(() => {
    setSessionContext(null);
    setProgressionSnapshot(null);
    setInitialMessages([]);
    refreshSessionAndProgression(initialChapterId);
  }, [courseSlug, initialChapterId, user?.id, refreshSessionAndProgression]);

  const courseDisplayName =
    sessionContext?.course?.title ||
    COURSE_DISPLAY_NAMES[courseSlug] ||
    courseSlug
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  const currentChapterTitle =
    progressionSnapshot?.chapterTitle ||
    cleanTitle(sessionContext?.session?.chapter?.title) ||
    courseDisplayName;

  const handleExit = () => {
    if (onNavigate) {
      onNavigate("course-details");
    }
  };

  // Start a clean backend session on the currently active unlocked chapter when clicking "Reset Thread"
  const handleNewChat = useCallback(async () => {
    const activeChapterId =
      progressionSnapshot?.chapterId ||
      sessionContext?.session?.chapter?.id ||
      initialChapterId ||
      undefined;
    try {
      const started = await api.startSession(courseSlug, activeChapterId);
      if (started?.session) {
        setSessionContext((prev) =>
          prev
            ? { ...prev, session: started.session }
            : {
                course: { id: "", slug: courseSlug, title: courseDisplayName },
                enrollment: { id: "", currentTier: "EASY", status: "ACTIVE" },
                session: started.session,
                conceptMasteries: [],
                curriculum: [],
              }
        );
        if (started.progressionSnapshot) {
          setProgressionSnapshot(started.progressionSnapshot);
        }
        setInitialMessages(mapMessages(started.session.messages));
      }
    } catch (err) {
      console.warn("[LearningStudio] Could not reset backend session:", err);
    }
  }, [
    courseSlug,
    courseDisplayName,
    initialChapterId,
    progressionSnapshot?.chapterId,
    sessionContext?.session?.chapter?.id,
  ]);

  // Manually advance from current section (S1->S2->S3) when readyToAdvance is true
  const handleAdvanceSection = async () => {
    const activeSessionId = sessionContext?.session?.id;
    if (!activeSessionId || isAdvancing) return;
    setIsAdvancing(true);
    try {
      await api.advanceSection(activeSessionId);
      await refreshSessionAndProgression();
      setTransitionToast("Advanced to the next section!");
      setTimeout(() => setTransitionToast(null), 3500);
    } catch (err: any) {
      console.warn("[LearningStudio] Section advance error:", err?.message);
    } finally {
      setIsAdvancing(false);
    }
  };

  // Smoothly transition to the next unlocked Chapter or Module right inside LearningStudio
  const handleAdvanceToNextChapter = async () => {
    const activeSessionId = sessionContext?.session?.id;
    const nextChap = progressionSnapshot?.nextChapter;
    if (isAdvancing) return;
    setIsAdvancing(true);
    try {
      if (nextChap?.id) {
        const started = await api.startSession(courseSlug, nextChap.id);
        if (started?.session) {
          setSessionContext((prev) =>
            prev ? { ...prev, session: started.session } : prev
          );
          if (started.progressionSnapshot) {
            setProgressionSnapshot(started.progressionSnapshot);
          }
          setInitialMessages(mapMessages(started.session.messages));
          setTransitionToast(
            nextChap.isNextModule
              ? `Unlocked & started Module ${nextChap.moduleOrder}: ${nextChap.title}!`
              : `Moved to Chapter: ${nextChap.title}!`
          );
          setTimeout(() => setTransitionToast(null), 4000);
          return;
        }
      }

      if (activeSessionId) {
        const advanced = await api.advanceChapter(activeSessionId);
        if (advanced?.session) {
          setSessionContext((prev) =>
            prev ? { ...prev, session: advanced.session } : prev
          );
          if (advanced.progressionSnapshot) {
            setProgressionSnapshot(advanced.progressionSnapshot);
          }
          setInitialMessages(mapMessages(advanced.session.messages));
          setTransitionToast(`Advanced to ${advanced.session.chapter?.title}!`);
          setTimeout(() => setTransitionToast(null), 4000);
        }
      }
    } catch (err: any) {
      console.warn("[LearningStudio] Next chapter transition failed:", err?.message);
    } finally {
      setIsAdvancing(false);
    }
  };

  /**
   * Real-time Socratic Tutor Streaming with Hard-Fenced Scoped RAG & Live Section Progression Updates
   */
  const handleStreamMessage = async (
    message: string,
    history: Array<{ role: "user" | "assistant"; content: string }>,
    onToken: (chunk: string) => void,
    signal?: AbortSignal
  ) => {
    let activeSessionId = sessionContext?.session?.id;

    if (!activeSessionId) {
      try {
        const started = await api.startSession(courseSlug, initialChapterId || undefined);
        if (started?.session?.id) {
          activeSessionId = started.session.id;
          setSessionContext((prev) =>
            prev
              ? { ...prev, session: started.session }
              : {
                  course: { id: "", slug: courseSlug, title: courseDisplayName },
                  enrollment: { id: "", currentTier: "EASY", status: "ACTIVE" },
                  session: started.session,
                  conceptMasteries: [],
                  curriculum: [],
                }
          );
          if (started.progressionSnapshot) {
            setProgressionSnapshot(started.progressionSnapshot);
          }
        }
      } catch (err) {
        console.warn("[LearningStudio] Could not start backend session, falling back to course chat:", err);
      }
    }

    if (activeSessionId) {
      await api.streamMessage(
        activeSessionId,
        message,
        onToken,
        (_stateUpdate) => {
          // Handled via section_status & progressionSnapshot
        },
        (_messageId) => {
          // Turn completed
        },
        signal,
        {
          onRubricUpdate: (rubricUpdate) => {
            if (
              Array.isArray(rubricUpdate?.newlyDemonstratedStatements) &&
              rubricUpdate.newlyDemonstratedStatements.length > 0
            ) {
              setTransitionToast(
                `Rubric Criterion Demonstrated (${rubricUpdate.demonstratedCriteriaCount}/${rubricUpdate.totalCriteriaCount})`
              );
              setTimeout(() => setTransitionToast(null), 3500);
            }
          },
          onSectionStatus: (statusPayload) => {
            if (statusPayload?.progressionSnapshot) {
              setProgressionSnapshot(statusPayload.progressionSnapshot);
            }
            if (statusPayload?.progressionTransition?.message) {
              setTransitionToast(statusPayload.progressionTransition.message);
              setTimeout(() => setTransitionToast(null), 4000);
            }
          },
          onDriftRedirect: (drift) => {
            if (drift?.message) {
              setTransitionToast(drift.message);
              setTimeout(() => setTransitionToast(null), 4000);
            }
          },
        }
      );
    } else {
      await api.streamCourseChat(courseSlug, message, history, onToken, signal);
    }
  };

  const handleSendMessage = async (
    message: string,
    _model: AIModel,
    _effort: ReasoningEffort
  ): Promise<string | void> => {
    if (sessionContext?.session?.id) {
      try {
        const token = localStorage.getItem("certify_token");
        const res = await fetch(
          `${API_BASE}/sessions/${sessionContext.session.id}/messages`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ content: message }),
          }
        );

        if (res.ok) {
          const data = await res.json().catch(() => null);
          if (data?.content) return data.content;
        }
      } catch {
        // Handled by local fallback
      }
    }
  };

  /**
   * Top Progression Stepper Bar inside the Studio Chat Box
   */
  const renderProgressionBar = () => {
    if (!progressionSnapshot) return null;

    const {
      moduleOrder,
      moduleTitle,
      chapterOrder,
      chapterTitle,
      sections,
      activeSection,
      demonstratedCriteriaCount,
      totalCriteriaCount,
      checkpointUnlocked,
      practicalUnlocked,
    } = progressionSnapshot;

    return (
      <div className="w-full px-6 sm:px-8 py-2.5 border-b border-white/[0.07] bg-[#0e0e11] flex flex-wrap items-center justify-between gap-2.5 shrink-0">
        {/* Left: Module & Chapter Badge + Section Stepper Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/[0.08] text-[11px] font-mono text-zinc-300">
            M{String(moduleOrder).padStart(2, "0")} · C{String(chapterOrder).padStart(2, "0")}
          </span>
          <span className="text-xs text-zinc-400 hidden md:inline truncate max-w-[180px]" title={moduleTitle}>
            {moduleTitle}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600 hidden md:inline" />

          {/* Section Stepper */}
          <div className="flex items-center gap-1 flex-wrap">
            {sections.map((sec) => {
              const isCurrent = activeSection?.id === sec.id;
              const isCompleted = sec.status === "COMPLETED";
              const isLocked = sec.status === "LOCKED";
              const shortLabel =
                SECTION_SHORT_LABELS[sec.sectionType] ||
                `S${sec.sequenceOrder} · ${sec.title.replace(/^\d+\.\s*/, "")}`;

              const handleStepClick = () => {
                if (sec.sectionType === "CHAPTER_CHECKPOINT" && checkpointUnlocked) {
                  setShowCheckpointModal(true);
                } else if (sec.sectionType === "MODULE_PRACTICAL" && practicalUnlocked) {
                  setShowPracticalModal(true);
                }
              };

              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={handleStepClick}
                  disabled={
                    isLocked &&
                    !(sec.sectionType === "CHAPTER_CHECKPOINT" && checkpointUnlocked) &&
                    !(sec.sectionType === "MODULE_PRACTICAL" && practicalUnlocked)
                  }
                  title={`${sec.title}: ${sec.objective}`}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                    isCompleted
                      ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 cursor-pointer"
                      : isCurrent
                      ? "bg-violet-500/20 text-violet-200 border border-violet-400/50 shadow-[0_0_12px_rgba(139,92,246,0.2)]"
                      : !isLocked
                      ? "bg-white/[0.05] text-zinc-300 border border-white/[0.1] hover:bg-white/[0.09] cursor-pointer"
                      : "bg-white/[0.02] text-zinc-600 border border-white/[0.04] cursor-not-allowed"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  ) : isLocked ? (
                    <Lock className="w-2.5 h-2.5 text-zinc-600 shrink-0" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
                  )}
                  <span>{shortLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Rubric Mastery Counter + Quick Checkpoint/Practical Triggers */}
        <div className="flex items-center gap-2">
          {totalCriteriaCount > 0 && (
            <div
              className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[11px] text-zinc-300 font-mono flex items-center gap-1.5"
              title={`Demonstrated ${demonstratedCriteriaCount} of ${totalCriteriaCount} rubric criteria for ${chapterTitle}`}
            >
              <Sparkles className="w-3 h-3 text-violet-400" />
              <span>
                Rubrics: {demonstratedCriteriaCount}/{totalCriteriaCount}
              </span>
            </div>
          )}

          {checkpointUnlocked && (
            <button
              type="button"
              onClick={() => setShowCheckpointModal(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 border border-violet-400/40 text-violet-200 text-[11px] font-semibold transition-colors cursor-pointer"
            >
              <Award className="w-3 h-3 text-violet-300" />
              <span>
                {progressionSnapshot.chapterStatus === "COMPLETED"
                  ? "Review Checkpoint"
                  : "Take Checkpoint"}
              </span>
            </button>
          )}

          {practicalUnlocked && progressionSnapshot.practicalTaskId && (
            <button
              type="button"
              onClick={() => setShowPracticalModal(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 text-[11px] font-semibold transition-colors cursor-pointer"
            >
              <Code2 className="w-3 h-3 text-emerald-300" />
              <span>
                {progressionSnapshot.practicalPassed ? "Practical Passed" : "Practical Lab"}
              </span>
            </button>
          )}
        </div>
      </div>
    );
  };

  /**
   * Bottom Contextual Progression Action Banner right above the Composer
   * Appears when:
   * - A transition toast is active
   * - Active section is ready to advance manually (S1->S2->S3)
   * - S4 Chapter Checkpoint is unlocked and awaiting submission
   * - S5 Module Practical is unlocked and awaiting completion
   * - Chapter / Module is completed and Next Chapter / Next Module is unlocked!
   */
  const renderProgressionActionBanner = () => {
    if (!progressionSnapshot) return null;

    const {
      chapterStatus,
      chapterTitle,
      activeSection,
      checkpointUnlocked,
      practicalUnlocked,
      practicalPassed,
      practicalTaskId,
      nextChapter,
    } = progressionSnapshot;

    // 1. Next Chapter or Next Module is Unlocked and Current Chapter is Completed!
    if (
      chapterStatus === "COMPLETED" &&
      (!practicalTaskId || !practicalUnlocked || practicalPassed) &&
      nextChapter?.isUnlocked
    ) {
      return (
        <div className="w-full px-6 sm:px-8 py-2.5 bg-emerald-500/10 border-t border-emerald-500/30 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>{chapterTitle}</strong> complete! Ready to move on to{" "}
              <strong>
                {nextChapter.isNextModule
                  ? `Module ${nextChapter.moduleOrder}: ${nextChapter.title}`
                  : nextChapter.title}
              </strong>
              .
            </span>
          </div>
          <button
            type="button"
            onClick={handleAdvanceToNextChapter}
            disabled={isAdvancing}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-zinc-950 font-semibold text-xs transition-all cursor-pointer shrink-0 shadow-sm"
          >
            <span>
              {nextChapter.isNextModule
                ? `Start Module ${nextChapter.moduleOrder}`
                : "Continue to Next Chapter"}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      );
    }

    // 2. Module Practical Task (S5) is Unlocked on the Final Chapter of the Module
    if (chapterStatus === "COMPLETED" && practicalUnlocked && !practicalPassed && practicalTaskId) {
      return (
        <div className="w-full px-6 sm:px-8 py-2.5 bg-violet-500/12 border-t border-violet-500/30 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-violet-200">
            <Code2 className="w-4 h-4 text-violet-400 shrink-0" />
            <span>
              <strong>Chapter Checkpoint Passed!</strong> Complete the{" "}
              <strong>Module Practical Verification ({practicalTaskId})</strong> to unlock the next module.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowPracticalModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-violet-500 hover:bg-violet-400 text-white font-semibold text-xs transition-all cursor-pointer shrink-0"
          >
            <span>Launch Practical Lab</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      );
    }

    // 3. Chapter Conceptual Checkpoint (S4) is Unlocked
    if (checkpointUnlocked && chapterStatus !== "COMPLETED") {
      return (
        <div className="w-full px-6 sm:px-8 py-2.5 bg-violet-500/12 border-t border-violet-500/30 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-violet-200">
            <Award className="w-4 h-4 text-violet-400 shrink-0" />
            <span>
              All guided sections complete for <strong>{chapterTitle}</strong>! Take the{" "}
              <strong>Conceptual Checkpoint</strong> to unlock the next stage.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowCheckpointModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs transition-all cursor-pointer shrink-0"
          >
            <span>Take Chapter Checkpoint</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      );
    }

    // 4. Current section is ready to advance manually or toast notification is active
    if (
      activeSection &&
      activeSection.readyToAdvance &&
      activeSection.sequenceOrder < 3 &&
      activeSection.status !== "COMPLETED"
    ) {
      return (
        <div className="w-full px-6 sm:px-8 py-2 bg-white/[0.03] border-t border-white/[0.08] flex items-center justify-between gap-3 shrink-0">
          <span className="text-xs text-zinc-300">
            Section objective satisfied for <strong>{activeSection.title}</strong>.
          </span>
          <button
            type="button"
            onClick={handleAdvanceSection}
            disabled={isAdvancing}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-medium cursor-pointer"
          >
            <span>Next Section</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      );
    }

    if (transitionToast) {
      return (
        <div className="w-full px-6 sm:px-8 py-2 bg-emerald-500/10 border-t border-emerald-500/25 flex items-center justify-between text-xs text-emerald-200 shrink-0">
          <span>{transitionToast}</span>
          <button
            type="button"
            onClick={() => setTransitionToast(null)}
            className="text-emerald-300/70 hover:text-white text-[11px] cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="w-full h-full min-h-0 overflow-hidden bg-[#030304] text-[#f5f5f7] flex flex-col">
      <AiChat9
        initialTitle={currentChapterTitle}
        courseTitle={courseDisplayName}
        courseSlug={courseSlug}
        user={user}
        initialMessages={initialMessages}
        progressionBar={renderProgressionBar()}
        progressionActionBanner={renderProgressionActionBanner()}
        onExit={handleExit}
        onNewChat={handleNewChat}
        onSendMessage={handleSendMessage}
        onStreamMessage={handleStreamMessage}
      />

      {/* In-Studio Conceptual Checkpoint Modal (Section 4) */}
      {showCheckpointModal && progressionSnapshot && (
        <CheckpointPanel
          chapterId={progressionSnapshot.chapterId}
          chapterTitle={progressionSnapshot.chapterTitle}
          enrollmentId={progressionSnapshot.enrollmentId}
          onClose={() => setShowCheckpointModal(false)}
          onCompleted={async (res) => {
            await refreshSessionAndProgression();
            if (res?.isPassed) {
              setTransitionToast(res.message || "Checkpoint passed! Next stage unlocked.");
            }
          }}
        />
      )}

      {/* In-Studio Module Practical Coding Verification Modal (Section 5) */}
      {showPracticalModal &&
        progressionSnapshot &&
        progressionSnapshot.practicalTaskId && (
          <PracticalPanel
            enrollmentId={progressionSnapshot.enrollmentId}
            moduleId={progressionSnapshot.moduleId}
            moduleTitle={progressionSnapshot.moduleTitle}
            taskId={progressionSnapshot.practicalTaskId}
            objective={`Pass the deterministic unit test suite for ${progressionSnapshot.practicalTaskId} to complete ${progressionSnapshot.moduleTitle} and unlock the next module.`}
            onClose={() => setShowPracticalModal(false)}
            onCompleted={async (res) => {
              await refreshSessionAndProgression();
              if (res?.passed) {
                setTransitionToast("Module Practical Passed! Next Module Unlocked.");
              }
            }}
          />
        )}
    </div>
  );
};
