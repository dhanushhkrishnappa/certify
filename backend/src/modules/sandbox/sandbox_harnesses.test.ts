import { describe, it, expect } from "vitest";
import { SandboxService } from "./sandbox.service.js";

describe("SandboxService Generalized Practical Evaluation Harnesses", () => {
  it("evaluates practical-m01-normalize-inventory with valid learner code", async () => {
    const code = `
def normalize_inventory(items):
    out = {}
    for item in items:
        name = item.get("name", "").strip().lower()
        qty = int(item.get("qty", 0))
        out[name] = qty
    return out
`;
    const result = await SandboxService.evaluatePracticalSubmission(code, "practical-m01-normalize-inventory");
    expect(result.status).toBe("PASSED");
    expect(result.passed).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(0.7);
    expect(result.testsPassed).toBe(result.testsRun);
  });

  it("evaluates practical-m02-classify-ticket with valid learner code", async () => {
    const code = `
def classify_ticket(age, is_student):
    if age < 12:
        return 'child'
    if 12 <= age <= 25 and is_student:
        return 'student'
    if age >= 65:
        return 'senior'
    return 'adult'
`;
    const result = await SandboxService.evaluatePracticalSubmission(code, "practical-m02-classify-ticket");
    expect(result.status).toBe("PASSED");
    expect(result.passed).toBe(true);
    expect(result.testsPassed).toBe(4);
  });

  it("evaluates practical-m04-moving-average with valid learner code", async () => {
    const code = `
def moving_average(numbers, k):
    if k <= 0 or k > len(numbers):
        return []
    result = []
    for i in range(len(numbers) - k + 1):
        window = numbers[i:i + k]
        result.append(sum(window) / k)
    return result
`;
    const result = await SandboxService.evaluatePracticalSubmission(code, "practical-m04-moving-average");
    expect(result.status).toBe("PASSED");
    expect(result.passed).toBe(true);
    expect(result.testsPassed).toBe(4);
  });

  it("evaluates practical-m08-stream-filter with generator yielding records", async () => {
    const code = `
def stream_high_scores(records, threshold):
    for r in records:
        if r.get("score", 0) >= threshold:
            yield r.get("name", "")
`;
    const result = await SandboxService.evaluatePracticalSubmission(code, "practical-m08-stream-filter");
    expect(result.status).toBe("PASSED");
    expect(result.passed).toBe(true);
    expect(result.testsPassed).toBe(4);
  });

  it("evaluates practical-m10-gradebook-class with GradeBook class", async () => {
    const code = `
class GradeBook:
    def __init__(self):
        self.scores = {}

    def add_score(self, name, score):
        if not (0 <= score <= 100):
            raise ValueError(f"Score must be between 0 and 100, got {score}")
        self.scores[name] = score

    def average(self):
        if not self.scores:
            return 0.0
        return sum(self.scores.values()) / len(self.scores)
`;
    const result = await SandboxService.evaluatePracticalSubmission(code, "practical-m10-gradebook-class");
    expect(result.status).toBe("PASSED");
    expect(result.passed).toBe(true);
    expect(result.testsPassed).toBe(4);
  });

  it("maintains backward compatibility with practical-summarize-scores", async () => {
    const code = `
def summarize_scores(records):
    res = {}
    for r in records:
        if r.get("active", False):
            scores = r.get("scores", [])
            avg = round(sum(scores) / len(scores), 2) if scores else 0.0
            res[r["name"]] = avg
    return res
`;
    const result = await SandboxService.evaluatePracticalSubmission(code, "practical-summarize-scores");
    expect(result.status).toBe("PASSED");
    expect(result.passed).toBe(true);
    expect(result.testsPassed).toBe(4);
  });

  it("fails closed on security policy violations (e.g. forbidden imports)", async () => {
    const code = `import subprocess; print('attack')`;
    const result = await SandboxService.evaluatePracticalSubmission(code, "practical-m01-normalize-inventory");
    expect(result.status).toBe("ERROR");
    expect(result.passed).toBe(false);
    expect(result.testResults[0].details).toContain("SecurityPolicyViolation");
  });

  it("reports failed status when learner code has runtime or logic errors", async () => {
    const code = `
def normalize_inventory(items):
    return {"wrong": 123}
`;
    const result = await SandboxService.evaluatePracticalSubmission(code, "practical-m01-normalize-inventory");
    expect(result.status).toBe("FAILED");
    expect(result.passed).toBe(false);
    expect(result.score).toBeLessThan(0.7);
  });
});
