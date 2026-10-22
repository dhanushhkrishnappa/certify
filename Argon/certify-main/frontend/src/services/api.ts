import type {
  User,
  CourseCatalogItem,
  CourseDetail,
  LearningSessionContext,
  Question,
  Certificate,
  PublicVerification,
} from "../types/index.js";

const API_BASE =
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_BASE_URL) ||
  "http://localhost:5000/api/v1";

function getHeaders(): HeadersInit {
  const token = localStorage.getItem("certify_token");
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Login failed");
    }
    return res.json();
  },

  async register(email: string, password: string, fullName: string): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, fullName }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Registration failed");
    }
    return res.json();
  },

  async getMe(): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/auth/me`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to load user profile");
    return res.json();
  },

  // Courses
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

  async enrollCourse(slug: string): Promise<{ message: string; enrollmentId: string; courseSlug: string }> {
    const res = await fetch(`${API_BASE}/courses/${slug}/enroll`, {
      method: "POST",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to enroll in course");
    return res.json();
  },

  // Sessions & Remediation
  async getSessionContext(slug: string): Promise<LearningSessionContext> {
    const res = await fetch(`${API_BASE}/courses/${slug}/session`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to load session context");
    return res.json();
  },

  async advanceChapter(sessionId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/sessions/${sessionId}/advance`, {
      method: "POST",
      headers: getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to advance chapter");
    }
    return res.json();
  },

  async getRemediationPlan(sessionId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/sessions/${sessionId}/remediation`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to load remediation plan");
    return res.json();
  },

  // Stream message via SSE
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
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || "Failed to send message to tutor");
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
          // ignore parsing error on stream chunk
        }
      }
    }
  },

  // Diagnostic, Chapter, Remediation, Practical & Viva Assessments
  async getDiagnosticQuestions(slug: string): Promise<any> {
    const res = await fetch(`${API_BASE}/assessments/diagnostic/${slug}`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to load diagnostic questions");
    return res.json();
  },

  async submitDiagnostic(enrollmentId: string, answers: any[]): Promise<any> {
    const res = await fetch(`${API_BASE}/assessments/diagnostic/submit`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ enrollmentId, answers }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to submit diagnostic");
    }
    return res.json();
  },

  async getChapterQuestions(chapterId: string): Promise<{ questions: Question[] }> {
    const res = await fetch(`${API_BASE}/assessments/chapters/${chapterId}`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to load questions");
    return res.json();
  },

  async submitChapterAssessment(chapterId: string, enrollmentId: string, answers: any[]): Promise<any> {
    const res = await fetch(`${API_BASE}/assessments/chapters/${chapterId}/submit`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ enrollmentId, answers }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to submit chapter assessment");
    }
    return res.json();
  },

  async submitRemediationCheck(
    enrollmentId: string,
    conceptId: string,
    studentAnswer: string
  ): Promise<any> {
    const res = await fetch(`${API_BASE}/assessments/remediation/submit`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ enrollmentId, conceptId, studentAnswer }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to submit remediation check");
    }
    return res.json();
  },

  async submitPracticalAssessment(
    enrollmentId: string,
    code: string,
    taskId: string = "python-lru-capstone"
  ): Promise<any> {
    const res = await fetch(`${API_BASE}/assessments/practical/submit`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ enrollmentId, code, taskId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to submit practical code assessment");
    }
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
      body: JSON.stringify({ enrollmentId, questionId, studentAnswer, turnNumber }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to process viva defense turn");
    }
    return res.json();
  },

  // Certificates & Verification
  async issueCertificate(enrollmentId: string): Promise<{ certificate: Certificate; verificationUrl: string }> {
    const res = await fetch(`${API_BASE}/certificates/issue`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ enrollmentId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Requirements not met for certificate");
    }
    return res.json();
  },

  async listMyCredentials(): Promise<{ credentials: any[] }> {
    const res = await fetch(`${API_BASE}/certificates/mine`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to load credentials");
    return res.json();
  },

  async verifyPublicCredential(credentialId: string): Promise<PublicVerification> {
    const res = await fetch(`${API_BASE}/certificates/${encodeURIComponent(credentialId)}/verify`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Credential not found in verification registry");
    }
    return res.json();
  },

  async getPublicKey(): Promise<{ algorithm: string; publicKeyPem: string; keyFingerprint: string }> {
    const res = await fetch(`${API_BASE}/certificates/public-key`);
    if (!res.ok) throw new Error("Failed to fetch public verification key");
    return res.json();
  },

  // Isolated Code Execution Sandbox (NO fake client-side success fallback!)
  async executeCode(
    code: string,
    language: string = "python"
  ): Promise<{ output: string; status: "success" | "error"; error?: string; durationMs?: number }> {
    const res = await fetch(`${API_BASE}/execute`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ code, language }),
    });
    const data = await res.json().catch(() => ({
      status: "error",
      output: "Failed to parse sandbox response",
    }));
    if (!res.ok) {
      return {
        status: "error",
        output: data.output || data.error || `Sandbox HTTP ${res.status} error`,
        error: data.error,
      };
    }
    return data;
  },
};
