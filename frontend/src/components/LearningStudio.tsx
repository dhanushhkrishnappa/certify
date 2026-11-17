import { useState, useEffect, useCallback } from "react";
import { AiChat9, type AIModel, type ReasoningEffort, type ChatMessage } from "./ai/AiChat9.js";
import { api } from "../services/api.js";
import { API_BASE } from "../constants/api.js";
import type { User, LearningSessionContext } from "../types/index.js";

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

export const LearningStudio: React.FC<LearningStudioProps> = ({
  courseSlug,
  initialChapterId,
  user,
  onNavigate,
}) => {
  const [sessionContext, setSessionContext] = useState<LearningSessionContext | null>(null);
  const [initialMessages, setInitialMessages] = useState<ChatMessage[]>([]);

  const mapMessages = (msgs: any[] | undefined): ChatMessage[] =>
    (msgs || []).map((m: any) => ({
      id: m.id,
      role: m.role as "user" | "assistant",
      content: m.content,
      timestamp: m.createdAt,
    }));

  // Fetch isolated per-user session context and restore conversation history from backend
  useEffect(() => {
    let mounted = true;
    setSessionContext(null);
    setInitialMessages([]);

    api
      .getSessionContext(courseSlug)
      .then(async (data) => {
        if (!mounted) return;
        setSessionContext(data);

        // If the learner selected a specific unlocked chapter from Course Details,
        // switch the active backend session to that chapter (strictly lock-verified by backend).
        if (initialChapterId && data.session?.chapter?.id !== initialChapterId) {
          try {
            const started = await api.startSession(courseSlug, initialChapterId);
            if (mounted && started?.session) {
              setSessionContext((prev) =>
                prev
                  ? { ...prev, session: started.session }
                  : { ...data, session: started.session }
              );
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
          // If learner is enrolled but no active session exists, start one cleanly
          try {
            const started = await api.startSession(courseSlug, initialChapterId || undefined);
            if (mounted && started?.session) {
              setSessionContext((prev) =>
                prev
                  ? { ...prev, session: started.session }
                  : { ...data, session: started.session }
              );
              setInitialMessages(mapMessages(started.session.messages));
            }
          } catch (startErr) {
            console.info("Using local Socratic session start:", startErr);
          }
        }
      })
      .catch((err) => {
        console.info("Using local Socratic session:", err?.message || err);
      });

    return () => {
      mounted = false;
    };
  }, [courseSlug, initialChapterId, user?.id]);

  const courseDisplayName =
    sessionContext?.course?.title ||
    COURSE_DISPLAY_NAMES[courseSlug] ||
    courseSlug
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  const currentChapterTitle =
    cleanTitle(sessionContext?.session?.chapter?.title) || courseDisplayName;

  const handleExit = () => {
    if (onNavigate) {
      onNavigate("course-details");
    }
  };

  // Start a clean backend session on the currently active unlocked chapter when clicking "New Chat"
  const handleNewChat = useCallback(async () => {
    const activeChapterId = sessionContext?.session?.chapter?.id || initialChapterId || undefined;
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
      }
    } catch (err) {
      console.warn("[LearningStudio] Could not reset backend session:", err);
    }
  }, [courseSlug, courseDisplayName, initialChapterId, sessionContext?.session?.chapter?.id]);

  /**
   * Real-time Socratic Tutor Streaming with Hard-Fenced Scoped RAG & Backend Progression Tracking
   */
  const handleStreamMessage = async (
    message: string,
    history: Array<{ role: "user" | "assistant"; content: string }>,
    onToken: (chunk: string) => void,
    signal?: AbortSignal
  ) => {
    let activeSessionId = sessionContext?.session?.id;

    if (!activeSessionId) {
      // Just-in-time session creation if not already established
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
        (stateUpdate) => {
          console.info("[LearningStudio] Concept mastery update:", stateUpdate);
        },
        (messageId) => {
          console.info("[LearningStudio] Assistant turn finished:", messageId);
        },
        signal
      );
    } else {
      // Guest / unauthenticated fallback: directly stream from public Socratic course chat
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

  return (
    <div className="w-full h-full min-h-0 overflow-hidden bg-[#030304] text-[#f5f5f7] flex flex-col">
      <AiChat9
        initialTitle={currentChapterTitle}
        courseTitle={courseDisplayName}
        courseSlug={courseSlug}
        user={user}
        initialMessages={initialMessages}
        onExit={handleExit}
        onNewChat={handleNewChat}
        onSendMessage={handleSendMessage}
        onStreamMessage={handleStreamMessage}
      />
    </div>
  );
};
