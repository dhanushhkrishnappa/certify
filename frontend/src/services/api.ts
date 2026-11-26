/**
 * Certify API client.
 *
 * Authentication is now handled by Better Auth via `authClient`.
 * All non-auth API calls to /api/v1/* remain the same and use the
 * session token stored in localStorage (set after Better Auth login).
 */
import { authClient } from "../lib/authClient.js";
import type {
  User,
  CourseCatalogItem,
  CourseDetail,
  LearningSessionContext,
  Question,
  PublicVerification,
} from "../types/index.js";
import { API_BASE, API_ORIGIN } from "../constants/api.js";

export { API_BASE, API_ORIGIN };

function getHeaders(): HeadersInit {
  const token = localStorage.getItem("certify_token");
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // ─── Auth (Better Auth) ──────────────────────────────────────────────────

  /**
   * Sign in with email & password via the Certify Auth API.
   * Stores the returned session token and user in localStorage.
   */
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email: email.trim(), password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Invalid email or password");
    }

    if (data.token) {
      localStorage.setItem("certify_token", data.token);
    }
    if (data.user) {
      localStorage.setItem("certify_user", JSON.stringify(data.user));
    }

    return { user: data.user, token: data.token };
  },

  /**
   * Register a new account via the Certify Auth API.
   * Dispatches email verification and initializes user profile.
   */
  async register(
    email: string,
    password: string,
    fullName: string,
    extraFields?: {
      dob?: string;
      persona?: string;
      primaryGoal?: string;
      image?: string;
    }
  ): Promise<{ message: string; email: string; user?: User; token?: string }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        fullName,
        ...extraFields,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Registration failed");
    }

    if (data.token) {
      localStorage.setItem("certify_token", data.token);
    }

    return data;
  },

  /**
   * Request resending the email verification link.
   */
  async resendVerification(email?: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/auth/resend-verification`, {
      method: "POST",
      headers: getHeaders(),
      credentials: "include",
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to resend verification email");
    }

    return data;
  },

  /**
   * Verify an email address with a 6-digit OTP code.
   */
  async verifyOtp(email: string, otp: string): Promise<{ message: string; emailVerified: boolean; user?: User; token?: string }> {
    const res = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Invalid verification code");
    }

    if (data.token) {
      localStorage.setItem("certify_token", data.token);
    }

    return data;
  },

  /**
   * Request resending a fresh 6-digit OTP verification code.
   */
  async resendOtp(email: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/auth/resend-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to resend verification code");
    }

    return data;
  },

  /**
   * Request a 6-digit password reset code sent to email.
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to process password reset request");
    }

    return data;
  },

  /**
   * Validate the 6-digit reset OTP before allowing new password entry.
   */
  async verifyResetOtp(email: string, otp: string): Promise<{ valid: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/auth/verify-reset-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Invalid verification code");
    }

    return data;
  },

  /**
   * Reset password using the 6-digit OTP code received via email.
   */
  async resetPassword(
    email: string,
    otp: string,
    newPassword: string
  ): Promise<{ message: string; success: boolean }> {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, newPassword }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to reset password");
    }

    return data;
  },

  /**
   * Sign out the current session.
   */
  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        headers: getHeaders(),
        credentials: "include",
      });
      await authClient.signOut().catch(() => {});
    } catch {}
    localStorage.removeItem("certify_token");
    localStorage.removeItem("certify_user");
  },

  /**
   * Get the current authenticated user.
   * Falls back to the /api/v1/auth/me shim (which proxies Better Auth session).
   */
  async getMe(): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/auth/me`, { headers: getHeaders(), credentials: "include" });
    if (!res.ok) throw new Error("Failed to load user profile");
    return res.json();
  },

  // ─── Courses ──────────────────────────────────────────────────────────────

  async listCourses(): Promise<{ courses: CourseCatalogItem[] }> {
    const res = await fetch(`${API_BASE}/courses`);
    if (!res.ok) throw new Error("Failed to load courses");
    return res.json();
  },

  async getCourseBySlug(slug: string): Promise<{ course: CourseDetail }> {
    const res = await fetch(`${API_BASE}/courses/${slug}`);
    if (!res.ok) throw new Error("Failed to load course details");
    return res.json();
  },

  async enrollCourse(slug: string): Promise<{ message: string; enrollmentId: string }> {
    const res = await fetch(`${API_BASE}/courses/${slug}/enroll`, {
      method: "POST",
      headers: getHeaders(),
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to enroll in course");
    return res.json();
  },

  // ─── Sessions ─────────────────────────────────────────────────────────────

  async getSessionContext(slug: string): Promise<LearningSessionContext> {
    const res = await fetch(`${API_BASE}/courses/${slug}/session`, {
      headers: getHeaders(),
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to load session context");
    return res.json();
  },

  async startSession(slug: string, chapterId?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/courses/${slug}/sessions`, {
      method: "POST",
      headers: getHeaders(),
      credentials: "include",
      body: JSON.stringify({ chapterId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to start learning session");
    }
    return res.json();
  },

  async getProgression(slug: string): Promise<{ progression: import("../types/index.js").ProgressionTree }> {
    const res = await fetch(`${API_BASE}/courses/${slug}/progression`, {
      headers: getHeaders(),
      credentials: "include",
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to load course progression");
    }
    return res.json();
  },

  async getSkillsReport(slug: string): Promise<{ report: import("../types/index.js").SkillsReport }> {
    const res = await fetch(`${API_BASE}/courses/${slug}/skills-report`, {
      headers: getHeaders(),
      credentials: "include",
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to load skills report");
    }
    return res.json();
  },

  async advanceSection(sessionId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/sessions/${sessionId}/sections/advance`, {
      method: "POST",
      headers: getHeaders(),
      credentials: "include",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || data.error || "Section requirements not yet satisfied");
    }
    return data;
  },

  async advanceChapter(sessionId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/sessions/${sessionId}/advance`, {
      method: "POST",
      headers: getHeaders(),
      credentials: "include",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || data.error || "Failed to advance chapter");
    }
    return data;
  },

  // ─── SSE Streaming Tutor ─────────────────────────────────────────────────

  async streamMessage(
    sessionId: string,
    content: string,
    onToken: (chunk: string) => void,
    onStateUpdate?: (update: any) => void,
    onDone?: (messageId: string) => void,
    signal?: AbortSignal,
    extraCallbacks?: {
      onRubricUpdate?: (update: any) => void;
      onSectionStatus?: (status: any) => void;
      onDriftRedirect?: (drift: any) => void;
    }
  ): Promise<void> {
    const token = localStorage.getItem("certify_token");
    const response = await fetch(`${API_BASE}/sessions/${sessionId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: "include",
      body: JSON.stringify({ content }),
      signal,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || err.error || "Failed to send message to tutor");
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("Streaming not supported");

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split("\n\n");
      buffer = events.pop() || "";

      for (const eventBlock of events) {
        if (!eventBlock.trim()) continue;
        const lines = eventBlock.split("\n");
        let eventType = "message";
        let dataStr = "";

        for (const line of lines) {
          if (line.startsWith("event: ")) {
            eventType = line.replace("event: ", "").trim();
          } else if (line.startsWith("data: ")) {
            dataStr = line.replace("data: ", "").trim();
          }
        }

        try {
          const parsed = JSON.parse(dataStr);
          if (eventType === "token" && parsed.chunk) {
            onToken(parsed.chunk);
          } else if (eventType === "state_update" && onStateUpdate) {
            onStateUpdate(parsed);
          } else if (eventType === "rubric_update" && extraCallbacks?.onRubricUpdate) {
            extraCallbacks.onRubricUpdate(parsed);
          } else if (eventType === "section_status" && extraCallbacks?.onSectionStatus) {
            extraCallbacks.onSectionStatus(parsed);
          } else if (eventType === "drift_redirect" && extraCallbacks?.onDriftRedirect) {
            extraCallbacks.onDriftRedirect(parsed);
          } else if (eventType === "done" && onDone) {
            onDone(parsed.messageId);
          }
        } catch {
          // ignore parse errors on stream chunks
        }
      }
    }
  },

  /**
   * Public / Guest Socratic stream for course exploration without requiring login
   */
  async streamCourseChat(
    slug: string,
    content: string,
    history: Array<{ role: string; content: string }>,
    onToken: (chunk: string) => void,
    signal?: AbortSignal
  ): Promise<void> {
    const response = await fetch(`${API_BASE}/courses/${slug}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: content, content, history }),
      signal,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || "Failed to stream course dialogue");
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("Streaming not supported");

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split("\n\n");
      buffer = events.pop() || "";

      for (const eventBlock of events) {
        if (!eventBlock.trim()) continue;
        const lines = eventBlock.split("\n");
        let eventType = "message";
        let dataStr = "";

        for (const line of lines) {
          if (line.startsWith("event: ")) {
            eventType = line.replace("event: ", "").trim();
          } else if (line.startsWith("data: ")) {
            dataStr = line.replace("data: ", "").trim();
          }
        }

        try {
          const parsed = JSON.parse(dataStr);
          if (eventType === "token" && parsed.chunk) {
            onToken(parsed.chunk);
          }
        } catch {
          // ignore parse errors
        }
      }
    }
  },

  // ─── Assessments ──────────────────────────────────────────────────────────

  async getChapterQuestions(chapterId: string, enrollmentId?: string): Promise<{ questions: Question[]; chapter?: any }> {
    const qs = enrollmentId ? `?enrollmentId=${encodeURIComponent(enrollmentId)}` : "";
    const res = await fetch(`${API_BASE}/assessments/chapters/${chapterId}${qs}`, {
      headers: getHeaders(),
      credentials: "include",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || data.error || "Failed to load questions");
    return data;
  },

  async submitChapterAssessment(
    chapterId: string,
    enrollmentId: string,
    answers: any[]
  ): Promise<any> {
    const res = await fetch(`${API_BASE}/assessments/chapters/${chapterId}/submit`, {
      method: "POST",
      headers: getHeaders(),
      credentials: "include",
      body: JSON.stringify({ enrollmentId, answers }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || data.error || "Failed to submit chapter assessment");
    return data;
  },

  async submitPractical(
    enrollmentId: string,
    taskId: string,
    code: string,
    moduleId?: string
  ): Promise<any> {
    const res = await fetch(`${API_BASE}/assessments/practical/submit`, {
      method: "POST",
      headers: getHeaders(),
      credentials: "include",
      body: JSON.stringify({ enrollmentId, taskId, code, moduleId }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || data.error || "Failed to submit practical task");
    return data;
  },

  // ─── Certificates ─────────────────────────────────────────────────────────

  async getMyCertificates(): Promise<{
    certificates: Array<{
      id: string;
      credentialId: string;
      tier: string;
      compositeScore: number;
      status: string;
      issuedAt: string;
      evidenceSummary?: string;
      signatureHash?: string;
      recipientName: string;
      courseSlug: string;
      courseTitle: string;
      courseVersion?: string;
    }>;
  }> {
    const res = await fetch(`${API_BASE}/certificates/mine`, {
      headers: getHeaders(),
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to load learner certificates");
    return res.json();
  },

  async getUserActivity(): Promise<{
    currentStreak: number;
    longestStreak: number;
    totalActiveDays: number;
    totalContributions: number;
    matrix: Array<Array<{ date: string; dateStr: string; count: number; level: number }>>;
  }> {
    const res = await fetch(`${API_BASE}/auth/activity`, {
      headers: getHeaders(),
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to load user activity");
    return res.json();
  },

  async verifyPublicCredential(credentialId: string): Promise<PublicVerification> {
    const res = await fetch(`${API_BASE}/certificates/${credentialId}/verify`);
    if (!res.ok) throw new Error("Credential not found");
    return res.json();
  },

  // ─── Code Execution ───────────────────────────────────────────────────────

  async executeCode(
    code: string,
    language: string = "python"
  ): Promise<{ output: string; status: "success" | "error"; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/execute`, {
        method: "POST",
        headers: getHeaders(),
        credentials: "include",
        body: JSON.stringify({ code, language }),
      });
      if (res.ok) {
        return res.json();
      }
      const data = await res.json().catch(() => ({}));
      return {
        output:
          data.error ||
          `Execution unavailable (HTTP ${res.status}): Sandboxed runtime gated pending container deployment.`,
        status: "error",
        error: data.error || "Sandbox runtime unavailable",
      };
    } catch (err: any) {
      return {
        output: `Execution service network error: ${err.message}`,
        status: "error",
        error: err.message,
      };
    }
  },
};
