import { describe, it, expect } from "vitest";
import { BayesianKnowledgeTracer, CertificationEvaluator } from "./bkt.js";

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
      chapterMasteryScore: 0.65, // Below minimum 0.70 gate
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
