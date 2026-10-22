import { describe, it, expect } from "vitest";
import { BayesianKnowledgeTracer, CertificationEvaluator } from "./bkt.js";
import { CredentialCryptoService } from "../certificates/crypto.service.js";
import { AIProvider } from "../ai/ai.provider.js";
import { SandboxService } from "../sandbox/sandbox.service.js";

describe("Bayesian Knowledge Tracer (BKT)", () => {
  it("increases mastery probability after a demonstrated observation", () => {
    const prior = 0.15;
    const posterior = BayesianKnowledgeTracer.update(prior, true);
    expect(posterior).toBeGreaterThan(prior);
    expect(posterior).toBeCloseTo(0.7011, 2);
  });

  it("decreases mastery probability after a non-demonstrated observation", () => {
    const prior = 0.70;
    const posterior = BayesianKnowledgeTracer.update(prior, false);
    expect(posterior).toBeLessThan(prior);
  });

  it("asymptotes toward mastery after multiple consecutive correct answers", () => {
    let p = 0.15;
    for (let i = 0; i < 4; i++) {
      p = BayesianKnowledgeTracer.update(p, true);
    }
    expect(p).toBeGreaterThan(0.95);
  });

  it("clamps probabilities strictly within [0.01, 0.99]", () => {
    const high = BayesianKnowledgeTracer.update(0.999, true);
    const low = BayesianKnowledgeTracer.update(0.001, false);
    expect(high).toBeLessThanOrEqual(0.99);
    expect(low).toBeGreaterThanOrEqual(0.01);
  });
});

describe("Deterministic Certification Evaluator", () => {
  it("awards ADVANCED tier when all distinction criteria are satisfied", () => {
    const result = CertificationEvaluator.evaluateCredential({
      chapterMasteryScore: 0.95,
      practicalPerformance: 0.94,
      vivaDefenseScore: 0.92,
      consistencyIndex: 0.90,
      interactionDepthScore: 0.88,
    });

    expect(result.isCertified).toBe(true);
    expect(result.tier).toBe("ADVANCED");
    expect(result.compositeScore).toBeGreaterThanOrEqual(0.92);
  });

  it("awards PROFICIENT tier when solid proficiency criteria are satisfied", () => {
    const result = CertificationEvaluator.evaluateCredential({
      chapterMasteryScore: 0.90,
      practicalPerformance: 0.86,
      vivaDefenseScore: 0.85,
      consistencyIndex: 0.85,
      interactionDepthScore: 0.80,
    });

    expect(result.isCertified).toBe(true);
    expect(result.tier).toBe("PROFICIENT");
    expect(result.compositeScore).toBeGreaterThanOrEqual(0.85);
  });

  it("awards FOUNDATION tier when baseline criteria are satisfied", () => {
    const result = CertificationEvaluator.evaluateCredential({
      chapterMasteryScore: 0.78,
      practicalPerformance: 0.72,
      vivaDefenseScore: 0.70,
      consistencyIndex: 0.72,
      interactionDepthScore: 0.65,
    });

    expect(result.isCertified).toBe(true);
    expect(result.tier).toBe("FOUNDATION");
    expect(result.compositeScore).toBeGreaterThanOrEqual(0.70);
  });

  it("fails certification if chapter mastery is below 0.70 even if other scores are high", () => {
    const result = CertificationEvaluator.evaluateCredential({
      chapterMasteryScore: 0.65,
      practicalPerformance: 0.95,
      vivaDefenseScore: 0.95,
      consistencyIndex: 0.95,
      interactionDepthScore: 0.95,
    });

    expect(result.isCertified).toBe(false);
    expect(result.tier).toBe("NONE");
    expect(result.reasons[0]).toContain("below the 0.70 foundational threshold");
  });
});

describe("Ed25519 Asymmetric Credential Cryptography", () => {
  it("signs a canonical credential payload with Ed25519 and detects payload tampering", () => {
    const payload = {
      credentialId: "CERT-2026-PY-100001",
      enrollmentId: "enroll-123",
      recipientName: "Alice Learner",
      courseSlug: "python-fundamentals",
      courseTitle: "Python Fundamentals",
      courseVersion: 1,
      tier: "PROFICIENT",
      compositeScore: 0.89,
      issuedAt: "2026-10-17T12:00:00.000Z",
      ruleVersion: "2026.1",
    };

    const keyMeta = CredentialCryptoService.getPublicKeyMetadata();
    expect(keyMeta.algorithm).toBe("Ed25519");

    const signatureHex = CredentialCryptoService.signCredential(payload);
    expect(signatureHex.length).toBe(128);

    const isValid = CredentialCryptoService.verifyCredential(payload, signatureHex);
    expect(isValid).toBe(true);

    // Tamper with compositeScore by +0.01 -> must fail Ed25519 signature verification
    const tampered = { ...payload, compositeScore: 0.90 };
    const isTamperedValid = CredentialCryptoService.verifyCredential(tampered, signatureHex);
    expect(isTamperedValid).toBe(false);
  });
});

describe("Structured AI Rubric Evaluator & Anti-Gaming Checks", () => {
  it("passes genuine concept explanations and rejects negated misconceptions or keyword stuffing", async () => {
    const criteria = [
      {
        id: "crit-mem-1",
        criterionStatement: "Explain how Python variables bind names to heap objects via references and mutability.",
        weight: 1.0,
      },
    ];

    const validEval = await AIProvider.evaluateRubricCriteria({
      questionPrompt: "Explain how Python variables work in memory.",
      studentAnswer:
        "In Python, variables are names bound to object references in heap memory rather than raw memory addresses. Mutating a list modifies the object in place, whereas reassigning rebinds the variable name.",
      conceptSlug: "variables-and-memory",
      conceptName: "Variables & Memory References",
      criteria,
    });
    expect(validEval.overallPassed).toBe(true);
    expect(validEval.overallScore).toBeGreaterThanOrEqual(0.75);

    const negatedEval = await AIProvider.evaluateRubricCriteria({
      questionPrompt: "Explain how Python variables work in memory.",
      studentAnswer:
        "In Python, variables are NOT references to objects in heap memory and never bind names to mutable objects.",
      conceptSlug: "variables-and-memory",
      conceptName: "Variables & Memory References",
      criteria,
    });
    expect(negatedEval.overallPassed).toBe(false);
    expect(negatedEval.overallScore).toBeLessThan(0.5);

    const stuffedEval = await AIProvider.evaluateRubricCriteria({
      questionPrompt: "Explain how Python variables work in memory.",
      studentAnswer:
        "pointer pointer reference reference heap heap memory memory pointer reference heap memory",
      conceptSlug: "variables-and-memory",
      conceptName: "Variables & Memory References",
      criteria,
    });
    expect(stuffedEval.overallPassed).toBe(false);
  });
});

describe("Isolated Python Subprocess Sandbox", () => {
  it("executes valid Python 3 code and captures stdout", async () => {
    const res = await SandboxService.executePython("print(21 * 2)");
    expect(res.exitCode).toBe(0);
    expect(res.timedOut).toBe(false);
    expect(res.stdout.trim()).toBe("42");
  });

  it("blocks forbidden modules and file/network access before execution", async () => {
    const res = await SandboxService.executePython("import socket\nprint('hi')");
    expect(res.exitCode).not.toBe(0);
    expect(res.stderr).toContain("SecurityPolicyViolation");
  });

  it("terminates infinite loops within the timeout budget", async () => {
    const res = await SandboxService.executePython("while True:\n    pass", 800);
    expect(res.timedOut).toBe(true);
  });

  it("evaluates practical submissions against deterministic unit tests", async () => {
    const solution = `
def summarize_scores(records):
    out = {}
    for r in records:
        if r.get("active"):
            scores = r.get("scores", [])
            out[r["name"]] = round(sum(scores) / len(scores), 2) if scores else 0.0
    return out
`;
    const evalRes = await SandboxService.evaluatePracticalSubmission(
      solution,
      "practical-summarize-scores"
    );
    expect(evalRes.passed).toBe(true);
    expect(evalRes.testsPassed).toBe(4);
    expect(evalRes.testsRun).toBe(4);
    expect(evalRes.score).toBe(1.0);
  });
});
