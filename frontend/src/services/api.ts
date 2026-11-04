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
  Certificate,
  PublicVerification,
} from "../types/index.js";

const API_BASE = "http://localhost:5000/api/v1";

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
   * Sign in with email & password via Better Auth.
   * Stores the returned session token in localStorage so Bearer-token
   * API calls to /api/v1/* continue to work.
   */
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const result = await authClient.signIn.email({ email, password });

    if (result.error) {
      throw new Error(result.error.message || "Login failed");
    }

    // Better Auth returns the session token in the response
    const token = (result.data as any)?.token ?? "";
    if (token) {
      localStorage.setItem("certify_token", token);
    }

    const baUser = result.data?.user as any;
    const user: User = {
      id: baUser.id,
      email: baUser.email,
      fullName: baUser.fullName ?? baUser.name ?? email,
      name: baUser.fullName ?? baUser.name ?? email,
      role: baUser.role ?? "STUDENT",
    };

    return { user, token };
  },

  /**
   * Register a new account via Better Auth.
   * `fullName` is passed as an additional field.
   */
  async register(
    email: string,
    password: string,
    fullName: string
  ): Promise<{ user: User; token: string }> {
    const result = await authClient.signUp.email({
      email,
      password,
      name: fullName,       // Better Auth `name` field
      // @ts-ignore — additional field declared in backend auth config
      fullName,
    });

    if (result.error) {
      throw new Error(result.error.message || "Registration failed");
    }

    const token = (result.data as any)?.token ?? "";
    if (token) {
      localStorage.setItem("certify_token", token);
    }

    const baUser = result.data?.user as any;
    const user: User = {
      id: baUser.id,
      email: baUser.email,
      fullName: baUser.fullName ?? fullName,
      name: baUser.fullName ?? fullName,
      role: baUser.role ?? "STUDENT",
    };

    return { user, token };
  },

  /**
   * Sign out the current session via Better Auth.
   */
  async logout(): Promise<void> {
    await authClient.signOut();
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

  async advanceChapter(sessionId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/sessions/${sessionId}/advance`, {
      method: "POST",
      headers: getHeaders(),
      credentials: "include",
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to advance chapter");
    }
    return res.json();
  },

  // ─── SSE Streaming Tutor ─────────────────────────────────────────────────

  async streamMessage(
    sessionId: string,
    content: string,
    onToken: (chunk: string) => void,
    onStateUpdate: (update: any) => void,
    onDone: (messageId: string) => void
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
    });

    if (!response.ok) {
      throw new Error("Failed to send message to tutor");
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
          } else if (eventType === "state_update") {
            onStateUpdate(parsed);
          } else if (eventType === "done") {
            onDone(parsed.messageId);
          }
        } catch {
          // ignore parse errors on stream chunks
        }
      }
    }
  },

  // ─── Assessments ──────────────────────────────────────────────────────────

  async getChapterQuestions(chapterId: string): Promise<{ questions: Question[] }> {
    const res = await fetch(`${API_BASE}/assessments/chapters/${chapterId}`, {
      headers: getHeaders(),
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to load questions");
    return res.json();
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
    if (!res.ok) throw new Error("Failed to submit chapter assessment");
    return res.json();
  },

  async conductVivaTurn(
    enrollmentId: string,
    questionId: string,
    studentAnswer: string,
    turnNumber: number
  ): Promise<any> {
    const res = await fetch(`${API_BASE}/assessments/final/viva`, {
      method: "POST",
      headers: getHeaders(),
      credentials: "include",
      body: JSON.stringify({ enrollmentId, questionId, studentAnswer, turnNumber }),
    });
    if (!res.ok) throw new Error("Failed to process viva defense turn");
    return res.json();
  },

  // ─── Certificates ─────────────────────────────────────────────────────────

  async issueCertificate(
    enrollmentId: string
  ): Promise<{ certificate: Certificate; verificationUrl: string }> {
    const res = await fetch(`${API_BASE}/certificates/issue`, {
      method: "POST",
      headers: getHeaders(),
      credentials: "include",
      body: JSON.stringify({ enrollmentId }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Requirements not met for certificate");
    }
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
