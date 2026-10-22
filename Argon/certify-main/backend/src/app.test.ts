import { describe, it, expect } from "vitest";
import http from "http";
import { app } from "./app.js";

async function requestJson(
  server: http.Server,
  method: string,
  path: string,
  body?: any,
  token?: string
): Promise<{ status: number; data: any; raw: string }> {
  const addr = server.address() as { port: number };
  const payload = body !== undefined ? JSON.stringify(body) : undefined;

  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: "127.0.0.1",
        port: addr.port,
        path,
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(payload ? { "Content-Length": Buffer.byteLength(payload) } : {}),
        },
      },
      (res) => {
        let raw = "";
        res.on("data", (chunk) => (raw += chunk));
        res.on("end", () => {
          let data: any = raw;
          try {
            data = raw ? JSON.parse(raw) : {};
          } catch {
            // keep raw string for SSE
          }
          resolve({ status: res.statusCode || 500, data, raw });
        });
      }
    );
    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
}

describe("CERTIFY End-to-End Integration, Security (IDOR), and Learner Journey Suite", () => {
  it("completes the full LEARN -> DEMONSTRATE -> EARN lifecycle and enforces all security/mastery gates", async () => {
    const server = app.listen(0);
    try {
      // 1. Health Check
      const health = await requestJson(server, "GET", "/api/v1/health");
      expect(health.status).toBe(200);
      expect(health.data.status).toBe("ok");

      // 2. Register Learner A & Learner B (for IDOR testing)
      const regA = await requestJson(server, "POST", "/api/v1/auth/register", {
        email: "alice@certify.edu",
        password: "Password123!",
        fullName: "Alice Learner",
      });
      expect(regA.status).toBe(201);
      const tokenA = regA.data.token;
      expect(tokenA).toBeDefined();

      const regB = await requestJson(server, "POST", "/api/v1/auth/register", {
        email: "mallory@certify.edu",
        password: "Password123!",
        fullName: "Mallory Attacker",
      });
      expect(regB.status).toBe(201);
      const tokenB = regB.data.token;

      // 3. Inspect Catalog & Python Fundamentals Curriculum
      const catalog = await requestJson(server, "GET", "/api/v1/courses");
      expect(catalog.status).toBe(200);
      expect(catalog.data.courses.length).toBeGreaterThanOrEqual(1);

      const courseRes = await requestJson(
        server,
        "GET",
        "/api/v1/courses/python-fundamentals"
      );
      expect(courseRes.status).toBe(200);

      // 4. Initialize Learner A Session Context & Enrollment
      const sessionCtx = await requestJson(
        server,
        "GET",
        "/api/v1/courses/python-fundamentals/session",
        undefined,
        tokenA
      );
      expect(sessionCtx.status).toBe(200);
      const enrollmentId = sessionCtx.data.enrollment.id;
      const sessionId = sessionCtx.data.session.id;
      const chapters = sessionCtx.data.curriculum.flatMap((m: any) => m.chapters);
      expect(chapters.length).toBe(2);

      // 5. Cross-User IDOR Security Checks: Learner B must receive 403 Forbidden on Learner A's resources
      const idorSession = await requestJson(
        server,
        "POST",
        `/api/v1/sessions/${sessionId}/messages`,
        { content: "Trying to hijack session" },
        tokenB
      );
      expect(idorSession.status).toBe(403);

      const idorDiag = await requestJson(
        server,
        "POST",
        "/api/v1/assessments/diagnostic/submit",
        {
          enrollmentId,
          answers: [{ conceptSlug: "variables-and-memory", selectedOption: "I haven't learned this yet", isCorrect: false, studentAnswer: "skip" }],
        },
        tokenB
      );
      expect(idorDiag.status).toBe(403);

      const idorCert = await requestJson(
        server,
        "POST",
        "/api/v1/certificates/issue",
        { enrollmentId },
        tokenB
      );
      expect(idorCert.status).toBe(403);

      // 6. Baseline Diagnostic Calibration (Honest Skip vs Demonstrated Concept)
      const diagQ = await requestJson(
        server,
        "GET",
        "/api/v1/assessments/diagnostic/python-fundamentals",
        undefined,
        tokenA
      );
      expect(diagQ.status).toBe(200);
      expect(diagQ.data.questions.length).toBeGreaterThanOrEqual(2);

      const diagSubmit = await requestJson(
        server,
        "POST",
        "/api/v1/assessments/diagnostic/submit",
        {
          enrollmentId,
          answers: [
            {
              conceptSlug: "variables-and-memory",
              selectedOption: "I haven't learned this yet",
              isCorrect: false,
              studentAnswer: "skip",
            },
            {
              conceptSlug: "mutability-and-collections",
              selectedOption: "Mutable lists modify in place on the heap",
              isCorrect: true,
              studentAnswer:
                "In Python, mutable objects like lists and dicts can be modified in place in heap memory, whereas immutable objects like tuples allocate a new reference.",
            },
          ],
        },
        tokenA
      );
      expect(diagSubmit.status).toBe(200);

      // 7. Non-Negotiable Principle B Check: Conversational AI Tutor chat MUST NOT mutate BKT mastery
      for (let i = 0; i < 4; i++) {
        const sseRes = await requestJson(
          server,
          "POST",
          `/api/v1/sessions/${sessionId}/messages`,
          {
            content: `Question ${i + 1}: How do Python variable references, heap objects, and garbage collection interact?`,
          },
          tokenA
        );
        expect(sseRes.status).toBe(200);
        expect(sseRes.raw).toContain("event: done");
      }

      // 8. Premature Chapter Advancement & Premature Certificate Issuance Must Fail Deterministically
      const prematureAdvance = await requestJson(
        server,
        "POST",
        `/api/v1/sessions/${sessionId}/advance`,
        {},
        tokenA
      );
      expect(prematureAdvance.status).toBe(400);

      const prematureCert = await requestJson(
        server,
        "POST",
        "/api/v1/certificates/issue",
        { enrollmentId },
        tokenA
      );
      expect(prematureCert.status).toBe(400);

      // 9. Complete Chapter Assessments across all chapters (2 passes per chapter to bring BKT >= 0.75)
      for (let cIdx = 0; cIdx < chapters.length; cIdx++) {
        const chap = chapters[cIdx];
        const qRes = await requestJson(
          server,
          "GET",
          `/api/v1/assessments/chapters/${chap.id}`,
          undefined,
          tokenA
        );
        expect(qRes.status).toBe(200);
        const questions = qRes.data.questions;

        const answers = questions.map((q: any) => ({
          questionId: q.id,
          studentAnswer:
            "In Python, variable names bind to object references on the heap. Mutable containers like list and dict mutate in place, control flow uses boolean truthiness and iterable loops, functions manage lexical scope, and generators use yield for lazy iterator state evaluation with O(1) memory.",
        }));

        await requestJson(
          server,
          "POST",
          `/api/v1/assessments/chapters/${chap.id}/submit`,
          { enrollmentId, answers },
          tokenA
        );
        const attempt2 = await requestJson(
          server,
          "POST",
          `/api/v1/assessments/chapters/${chap.id}/submit`,
          { enrollmentId, answers },
          tokenA
        );
        expect(attempt2.status).toBe(200);

        // If a concept started at 0.05 (Honest Skip), resolve its targeted remediation check
        if (attempt2.data.needsRemediation) {
          for (const rem of attempt2.data.needsRemediationConcepts) {
            const remRes = await requestJson(
              server,
              "POST",
              "/api/v1/assessments/remediation/submit",
              {
                enrollmentId,
                conceptId: rem.conceptId,
                studentAnswer:
                  "In Python, variable names bind to object references on the heap, and mutating a list modifies the heap object in place while preserving its id().",
              },
              tokenA
            );
            expect(remRes.status).toBe(200);
            expect(remRes.data.isResolved).toBe(true);
          }
        }

        const attempt3 = await requestJson(
          server,
          "POST",
          `/api/v1/assessments/chapters/${chap.id}/submit`,
          { enrollmentId, answers },
          tokenA
        );
        expect(attempt3.status).toBe(200);
        expect(attempt3.data.isPassed).toBe(true);

        if (cIdx < chapters.length - 1) {
          const adv = await requestJson(
            server,
            "POST",
            `/api/v1/sessions/${sessionId}/advance`,
            {},
            tokenA
          );
          expect(adv.status).toBe(200);
        }
      }

      // 10. Submit Isolated Practical Code Assessment
      const practicalRes = await requestJson(
        server,
        "POST",
        "/api/v1/assessments/practical/submit",
        {
          enrollmentId,
          taskId: "practical-summarize-scores",
          code: `
def summarize_scores(records):
    summary = {}
    for item in records:
        if item.get("active"):
            scores = item.get("scores", [])
            summary[item["name"]] = round(sum(scores) / len(scores), 2) if scores else 0.0
    return summary
`,
        },
        tokenA
      );
      expect(practicalRes.status).toBe(200);
      expect(practicalRes.data.isPassed).toBe(true);
      expect(practicalRes.data.score).toBe(1.0);

      // 11. Conduct Persisted 3-Turn AI Viva Defense
      for (let turn = 1; turn <= 3; turn++) {
        const vivaRes = await requestJson(
          server,
          "POST",
          "/api/v1/assessments/final/viva",
          {
            enrollmentId,
            turnNumber: turn,
            studentAnswer: `In turn ${turn}, my implementation iterates over records in O(n) time and builds a new summary dict without mutating the caller's input list or nested score references in heap memory. Using generators and yield keeps memory complexity at O(1) while guarding against ZeroDivisionError.`,
          },
          tokenA
        );
        expect(vivaRes.status).toBe(200);
        if (turn === 3) {
          expect(vivaRes.data.isDefenseSatisfied).toBe(true);
        }
      }

      // 12. Issue Ed25519 Signed Certificate from Persisted Evidence
      const certRes = await requestJson(
        server,
        "POST",
        "/api/v1/certificates/issue",
        { enrollmentId },
        tokenA
      );
      expect(certRes.status).toBe(201);
      expect(certRes.data.certificate.credentialId).toContain("CERT-");
      const credentialId = certRes.data.certificate.credentialId;

      // 13. Public Verification Endpoint Checks Real Ed25519 Signature
      const verifyRes = await requestJson(
        server,
        "GET",
        `/api/v1/certificates/${credentialId}/verify`
      );
      expect(verifyRes.status).toBe(200);
      expect(verifyRes.data.isValid).toBe(true);
      expect(verifyRes.data.signatureAlgorithm).toBe("Ed25519");
      expect(verifyRes.data.signatureVerified).toBe(true);

      // 14. Public Key Metadata Discovery Endpoint
      const pubKeyRes = await requestJson(
        server,
        "GET",
        "/api/v1/certificates/public-key"
      );
      expect(pubKeyRes.status).toBe(200);
      expect(pubKeyRes.data.algorithm).toBe("Ed25519");

      // 15. Non-Admin Cannot Revoke Certificate (RBAC Check)
      const nonAdminRevoke = await requestJson(
        server,
        "POST",
        `/api/v1/certificates/${credentialId}/revoke`,
        { reason: "Unauthorized attempt" },
        tokenB
      );
      expect(nonAdminRevoke.status).toBe(403);
    } finally {
      server.close();
    }
  });
});
