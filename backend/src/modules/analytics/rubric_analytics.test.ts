import { describe, it, expect } from "vitest";
import { RubricEvaluatorService } from "../ai/rubric.evaluator.js";

describe("Hybrid Rubric Evaluator (Per-Criterion Precision & Anti-Gaming)", () => {
  const m05Criteria = [
    {
      id: "crit-m05-1",
      criterionStatement: "Uses specific exception types in try/except blocks instead of bare except.",
      weight: 0.6,
      tierRequired: "EASY",
      cognitiveLevel: "DEBUG",
      passingThreshold: 0.70,
      expectedConceptsJson: JSON.stringify(["specific", "exception", "try", "except", "bare", "valueerror"]),
      misconceptionsJson: JSON.stringify([]),
    },
    {
      id: "crit-m05-2",
      criterionStatement: "Explains the difference between EAFP and LBYL defensive patterns.",
      weight: 0.4,
      tierRequired: "MEDIUM",
      cognitiveLevel: "EXPLAIN",
      passingThreshold: 0.70,
      expectedConceptsJson: JSON.stringify(["eafp", "lbyl", "ask", "forgiveness", "permission"]),
      misconceptionsJson: JSON.stringify([]),
    },
  ];

  const m01MutCriteria = [
    {
      id: "crit-m01-mut",
      criterionStatement: "Predicts aliasing effects when two names point to the same mutable object.",
      weight: 1.0,
      tierRequired: "MEDIUM",
      cognitiveLevel: "REASON",
      passingThreshold: 0.70,
      expectedConceptsJson: JSON.stringify(["aliasing", "mutable", "reference", "list", "object"]),
      misconceptionsJson: JSON.stringify([
        {
          tag: "LIST_IMMUTABLE_CONFUSION",
          pattern: "\\blists?\\s+(are|is)\\s+immutable\\b",
          explanation: "Python lists are mutable.",
        },
      ]),
    },
  ];

  it("evaluates Module 05 exception responses against Module 05 rubric criteria (not old hardcoded heap/yield list)", async () => {
    const res = await RubricEvaluatorService.evaluateResponse({
      conceptName: "Exception Handling & EAFP",
      learnerText:
        "In Python we catch specific exception classes like ValueError inside try/except rather than using a bare except clause, following EAFP (easier to ask forgiveness than permission) over LBYL.",
      criteria: m05Criteria,
      mode: "CHECKPOINT",
    });

    expect(res.overallPassed).toBe(true);
    expect(res.weightedScore).toBeGreaterThanOrEqual(0.70);
    expect(res.hasCriticalMisconception).toBe(false);
    expect(res.criteriaResults.length).toBe(2);
    expect(res.criteriaResults[0].verdict).toBe("DEMONSTRATED");
    expect(res.criteriaResults[1].verdict).toBe("DEMONSTRATED");
  });

  it("flags conceptual misconceptions deterministically even on long answers", async () => {
    const res = await RubricEvaluatorService.evaluateResponse({
      conceptName: "Variables & Mutability",
      learnerText:
        "In Python lists are immutable so when two variables reference the same list object, modifying one never affects the other variable.",
      criteria: m01MutCriteria,
      mode: "CHECKPOINT",
    });

    expect(res.overallPassed).toBe(false);
    expect(res.hasCriticalMisconception).toBe(true);
    expect(res.criteriaResults[0].verdict).toBe("MISCONCEPTION");
    expect(res.criteriaResults[0].misconceptionTag).toBe("LIST_IMMUTABLE_CONFUSION");
  });

  it("rejects trivial greetings and keyword stuffing", async () => {
    const res = await RubricEvaluatorService.evaluateResponse({
      conceptName: "Exception Handling",
      learnerText: "try try try except except except try except",
      criteria: m05Criteria,
      mode: "CHECKPOINT",
    });

    expect(res.overallPassed).toBe(false);
    expect(res.weightedScore).toBeLessThan(0.30);
  });
});
