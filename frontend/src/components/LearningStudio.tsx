import { useState, useEffect, useCallback } from "react";
import { AiChat9, type AIModel, type ReasoningEffort, type ChatMessage } from "./ai/AiChat9.js";
import { CurriculumRail } from "./studio/CurriculumRail.js";
import { SectionStepper } from "./studio/SectionStepper.js";
import { CheckpointPanel } from "./studio/CheckpointPanel.js";
import { PracticalPanel } from "./studio/PracticalPanel.js";
import { SkillsDrawer } from "./studio/SkillsDrawer.js";
import { api } from "../services/api.js";
import { API_BASE } from "../constants/api.js";
import type {
  User,
  LearningSessionContext,
  ProgressionTree,
  ChapterProgressionNode,
  ModuleProgressionNode,
} from "../types/index.js";

interface LearningStudioProps {
  courseSlug: string;
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

export const LearningStudio: React.FC<LearningStudioProps> = ({
  courseSlug,
  user,
  onNavigate,
}) => {
  const [sessionContext, setSessionContext] = useState<LearningSessionContext | null>(null);
  const [progression, setProgression] = useState<ProgressionTree | null>(null);
  const [initialMessages, setInitialMessages] = useState<ChatMessage[]>([]);
  const [lockedNotice, setLockedNotice] = useState<string | null>(null);
  const [driftBanner, setDriftBanner] = useState<{
    classification: string;
    targetModuleTitle?: string | null;
  } | null>(null);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [showCheckpoint, setShowCheckpoint] = useState(false);
  const [showPractical, setShowPractical] = useState(false);
  const [showSkillsDrawer, setShowSkillsDrawer] = useState(false);

  const refreshProgression = useCallback(async () => {
    try {
      const res = await api.getProgression(courseSlug);
      if (res?.progression) {
        setProgression(res.progression);
      }
    } catch {
      // Guest / unenrolled user
    }
  }, [courseSlug]);

  const loadSessionAndProgression = useCallback(async () => {
    try {
      const [sessData, progRes] = await Promise.all([
        api.getSessionContext(courseSlug),
        api.getProgression(courseSlug).catch(() => null),
      ]);

      setSessionContext(sessData);
      if (progRes?.progression) {
        setProgression(progRes.progression);
      }

      if (sessData.session?.messages && sessData.session.messages.length > 0) {
        setInitialMessages(
          sessData.session.messages.map((m: any) => ({
            id: m.id,
            role: m.role as "user" | "assistant",
            content: m.content,
            timestamp: m.createdAt,
          }))
        );
      } else if (!sessData.session) {
        const started = await api.startSession(courseSlug);
        if (started?.session) {
          setSessionContext((prev) =>
            prev ? { ...prev, session: started.session } : { ...sessData, session: started.session }
          );
          if (started.session.messages?.length > 0) {
            setInitialMessages(
              started.session.messages.map((m: any) => ({
                id: m.id,
                role: m.role as "user" | "assistant",
                content: m.content,
                timestamp: m.createdAt,
              }))
            );
          }
          await refreshProgression();
        }
      }
    } catch (err: any) {
      console.info("[LearningStudio] Guest preview or unenrolled mode:", err?.message || err);
    }
  }, [courseSlug, refreshProgression]);

  useEffect(() => {
    loadSessionAndProgression();
  }, [loadSessionAndProgression]);

  const courseDisplayName =
    sessionContext?.course?.title ||
    COURSE_DISPLAY_NAMES[courseSlug] ||
    courseSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const activeChapterId = sessionContext?.session?.chapter?.id || progression?.currentChapterId || null;

  // Locate active Module, Chapter, and Section nodes from backend progression tree
  let activeModule: ModuleProgressionNode | null = null;
  let activeChapter: ChapterProgressionNode | null = null;
  if (progression && activeChapterId) {
    for (const m of progression.modules) {
      const ch = m.chapters.find((c) => c.id === activeChapterId);
      if (ch) {
        activeModule = m;
        activeChapter = ch;
        break;
      }
    }
  }

  const activeSectionId = (sessionContext?.session as any)?.currentSectionId || null;
  const activeSection = activeChapter
    ? activeChapter.sections.find((s) => s.id === activeSectionId) ||
      activeChapter.sections.find((s) => s.sequenceOrder === activeChapter!.currentSectionOrder) ||
      activeChapter.sections[0] ||
      null
    : null;

  const currentChapterTitle =
    activeChapter?.title?.replace(/^\*\*\s*/, "") ||
    sessionContext?.session?.chapter?.title?.replace(/^\*\*\s*/, "") ||
    courseDisplayName;

  const handleSelectChapter = async (
    chapter: ChapterProgressionNode,
    mod: ModuleProgressionNode
  ) => {
    setLockedNotice(null);
    if (mod.status === "LOCKED" || chapter.status === "LOCKED") {
      setLockedNotice(
        `"${chapter.title.replace(/^\*\*\s*/, "")}" is locked. Complete previous lessons, checkpoints, and module practicals first.`
      );
      return;
    }

    try {
      const started = await api.startSession(courseSlug, chapter.id);
      if (started?.session) {
        setSessionContext((prev) =>
          prev ? { ...prev, session: started.session } : prev
        );
        setInitialMessages(
          (started.session.messages || []).map((m: any) => ({
            id: m.id,
            role: m.role as "user" | "assistant",
            content: m.content,
            timestamp: m.createdAt,
          }))
        );
        setDriftBanner(null);
        await refreshProgression();
      }
    } catch (err: any) {
      setLockedNotice(err?.message || "This chapter is currently locked.");
    }
  };

  const handleJumpToChapterById = async (chapterId: string) => {
    if (!progression) return;
    for (const m of progression.modules) {
      const ch = m.chapters.find((c) => c.id === chapterId);
      if (ch) {
        await handleSelectChapter(ch, m);
        return;
      }
    }
  };

  const handleAdvanceSection = async () => {
    const sid = sessionContext?.session?.id;
    if (!sid || isAdvancing) return;
    setIsAdvancing(true);
    setLockedNotice(null);
    try {
      const res = await api.advanceSection(sid);
      await loadSessionAndProgression();
      if (res?.nextSection?.sectionType === "CHAPTER_CHECKPOINT") {
        setShowCheckpoint(true);
      } else if (res?.nextSection?.sectionType === "MODULE_PRACTICAL") {
        setShowPractical(true);
      }
    } catch (err: any) {
      setLockedNotice(err?.message || "Complete this section's requirement before advancing.");
    } finally {
      setIsAdvancing(false);
    }
  };

  const handleAdvanceChapter = async () => {
    const sid = sessionContext?.session?.id;
    if (!sid || isAdvancing) return;
    setIsAdvancing(true);
    setLockedNotice(null);
    try {
      const res = await api.advanceChapter(sid);
      if (res?.session) {
        await loadSessionAndProgression();
      } else if (res?.completedCourse) {
        await refreshProgression();
        setShowSkillsDrawer(true);
      }
    } catch (err: any) {
      setLockedNotice(err?.message || "Complete all chapter requirements before advancing.");
    } finally {
      setIsAdvancing(false);
    }
  };

  const handleExit = () => {
    if (onNavigate) onNavigate("course-details");
  };

  const handleStreamMessage = async (
    message: string,
    history: Array<{ role: "user" | "assistant"; content: string }>,
    onToken: (chunk: string) => void,
    signal?: AbortSignal
  ) => {
    setDriftBanner(null);
    let activeSessionId = sessionContext?.session?.id;

    if (!activeSessionId && user) {
      try {
        const started = await api.startSession(courseSlug);
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
        }
      } catch (err) {
        console.warn("[LearningStudio] Could not start backend session:", err);
      }
    }

    if (activeSessionId) {
      await api.streamMessage(
        activeSessionId,
        message,
        onToken,
        () => {
          refreshProgression();
        },
        () => {
          refreshProgression();
        },
        signal,
        {
          onRubricUpdate: () => {
            refreshProgression();
          },
          onSectionStatus: () => {
            refreshProgression();
          },
          onDriftRedirect: (drift) => {
            setDriftBanner(drift);
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
        // Handled by stream
      }
    }
  };

  const enrollmentId = sessionContext?.enrollment?.id || progression?.enrollmentId || "";

  return (
    <div className="w-full min-h-screen bg-[#09090b] text-[#f4f4f5] flex">
      {/* Left Structured Curriculum Lock Rail */}
      <CurriculumRail
        progression={progression}
        activeChapterId={activeChapterId}
        onSelectChapter={handleSelectChapter}
        lockedNotice={lockedNotice}
      />

      {/* Right Main Studio Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {!progression && (
          <div className="border-b border-amber-500/25 bg-amber-500/10 px-4 py-2 text-xs text-amber-200 flex items-center justify-between">
            <span>
              <strong>Preview Mode (Module 01 · Lesson 01):</strong> Sign in and enroll to track verified progress, pass checkpoints, and unlock Modules 02–10.
            </span>
          </div>
        )}

        <SectionStepper
          activeModule={activeModule}
          activeChapter={activeChapter}
          activeSection={activeSection}
          driftBanner={driftBanner}
          isAdvancing={isAdvancing}
          onAdvanceSection={handleAdvanceSection}
          onOpenCheckpoint={() => setShowCheckpoint(true)}
          onOpenPractical={() => setShowPractical(true)}
          onOpenSkillsDrawer={() => setShowSkillsDrawer(true)}
          onAdvanceChapter={handleAdvanceChapter}
        />

        <div className="flex-1 min-h-0">
          <AiChat9
            key={sessionContext?.session?.id || "guest-preview"}
            initialTitle={currentChapterTitle}
            courseTitle={courseDisplayName}
            courseSlug={courseSlug}
            user={user}
            initialMessages={initialMessages}
            onExit={handleExit}
            onSendMessage={handleSendMessage}
            onStreamMessage={handleStreamMessage}
          />
        </div>
      </div>

      {/* Conceptual Checkpoint Modal */}
      {showCheckpoint && activeChapter && enrollmentId && (
        <CheckpointPanel
          chapterId={activeChapter.id}
          chapterTitle={activeChapter.title}
          enrollmentId={enrollmentId}
          onClose={() => setShowCheckpoint(false)}
          onCompleted={async (res) => {
            await loadSessionAndProgression();
            if (res?.progressionOutcome?.unlockedPractical) {
              setShowCheckpoint(false);
              setShowPractical(true);
            }
          }}
        />
      )}

      {/* Module Practical Coding Panel */}
      {showPractical && activeModule && enrollmentId && (
        <PracticalPanel
          enrollmentId={enrollmentId}
          moduleId={activeModule.id}
          moduleTitle={activeModule.title}
          taskId={activeModule.practicalTaskId || "practical-m01-normalize-inventory"}
          objective={
            activeSection?.sectionType === "MODULE_PRACTICAL"
              ? activeSection.objective
              : `Pass the practical verification harness for ${activeModule.title} to unlock the next module.`
          }
          onClose={() => setShowPractical(false)}
          onCompleted={async () => {
            await loadSessionAndProgression();
          }}
        />
      )}

      {/* Deterministic Strengths, Weakpoints & Cognitive Skills Drawer */}
      {showSkillsDrawer && (
        <SkillsDrawer
          courseSlug={courseSlug}
          onClose={() => setShowSkillsDrawer(false)}
          onJumpToChapter={handleJumpToChapterById}
        />
      )}
    </div>
  );
};
