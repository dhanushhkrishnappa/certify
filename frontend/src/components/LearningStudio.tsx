import { useState, useEffect } from "react";
import { AiChat9, type AIModel, type ReasoningEffort } from "./ai/AiChat9.js";
import { api } from "../services/api.js";
import { API_BASE } from "../constants/api.js";
import type { User, LearningSessionContext } from "../types/index.js";

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

  // Fetch session context from backend if available
  useEffect(() => {
    let mounted = true;
    api.getSessionContext(courseSlug)
      .then((data) => {
        if (mounted) setSessionContext(data);
      })
      .catch((err) => {
        // Fallback silently to local high-fidelity intelligence
        console.info("Using local Socratic session:", err?.message || err);
      });
    return () => {
      mounted = false;
    };
  }, [courseSlug]);

  const courseDisplayName =
    sessionContext?.course?.title ||
    COURSE_DISPLAY_NAMES[courseSlug] ||
    courseSlug
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  const currentChapterTitle = sessionContext?.session?.chapter?.title || courseDisplayName;

  const handleExit = () => {
    if (onNavigate) {
      onNavigate("course-details");
    }
  };

  const handleSendMessage = async (
    message: string,
    _model: AIModel,
    _effort: ReasoningEffort
  ): Promise<string | void> => {
    // If real backend session exists, attempt to stream/send to backend
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
    <div className="w-full min-h-screen bg-[#09090b] text-[#f4f4f5] flex flex-col">
      <AiChat9
        initialTitle={currentChapterTitle}
        courseTitle={courseDisplayName}
        courseSlug={courseSlug}
        user={user}
        onExit={handleExit}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
};
