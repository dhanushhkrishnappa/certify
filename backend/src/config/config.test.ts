import { describe, it, expect } from "vitest";
import { RETIRED_MODELS, validateModelIdentifier, config } from "./index.js";

describe("AI Model Identifier Configuration & Validation", () => {
  it("explicitly rejects known retired Claude model identifiers", () => {
    const retiredList = [
      "claude-3-5-sonnet-20241022",
      "claude-3-5-haiku-20241022",
      "claude-3-7-sonnet",
      "claude-3-sonnet-20240229",
      "claude-3-opus-20240229",
      "claude-2.1",
      "claude-2.0",
      "claude-instant-1.2",
    ];

    for (const retiredModel of retiredList) {
      expect(RETIRED_MODELS.has(retiredModel)).toBe(true);
      expect(() => validateModelIdentifier(retiredModel, "tutor")).toThrow(
        /is retired and cannot be used/
      );
    }
  });

  it("accepts currently supported and account-accessible models", () => {
    expect(validateModelIdentifier("claude-sonnet-4-6", "tutor")).toBe("claude-sonnet-4-6");
    expect(validateModelIdentifier("claude-haiku-4-5-20251001", "evaluator")).toBe(
      "claude-haiku-4-5-20251001"
    );
  });

  it("verifies the active runtime config defaults to supported models and is NOT retired", () => {
    expect(RETIRED_MODELS.has(config.anthropicTutorModel)).toBe(false);
    expect(RETIRED_MODELS.has(config.anthropicEvaluatorModel)).toBe(false);

    expect(config.anthropicTutorModel).toBe("claude-sonnet-4-6");
    expect(config.anthropicEvaluatorModel).toBe("claude-haiku-4-5-20251001");
  });
});
