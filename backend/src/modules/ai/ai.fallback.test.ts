import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AIProvider } from "./ai.provider.js";
import { config } from "../../config/index.js";

describe("AIProvider Auto-Fallback to Gemini", () => {
  const originalAnthropicKey = config.anthropicApiKey;
  const originalGeminiKey = config.geminiApiKey;
  const originalAutoFallback = config.geminiAutoFallback;
  const originalProvider = config.aiProvider;

  beforeEach(() => {
    config.aiProvider = "anthropic";
    config.anthropicApiKey = "sk-ant-test-key";
    config.geminiApiKey = "test-gemini-key";
    config.geminiAutoFallback = true;
  });

  afterEach(() => {
    config.anthropicApiKey = originalAnthropicKey;
    config.geminiApiKey = originalGeminiKey;
    config.geminiAutoFallback = originalAutoFallback;
    config.aiProvider = originalProvider;
    vi.restoreAllMocks();
  });

  it("automatically fails over to Gemini when Anthropic returns 429 rate/token limit", async () => {
    const streamGeminiSpy = vi.spyOn(AIProvider, "streamGeminiReply").mockResolvedValue({
      fullText: "Socratic response generated seamlessly via Gemini fallback",
      modelUsed: "gemini-2.5-flash",
      promptVersion: config.promptVersion,
      provider: "gemini",
    });

    // Mock global fetch to return 429 Too Many Requests for Anthropic
    const globalFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      text: async () => JSON.stringify({ error: { message: "Rate limit / token quota exceeded" } }),
    });
    vi.stubGlobal("fetch", globalFetch);

    const chunks: string[] = [];
    const result = await AIProvider.streamTutorReply(
      {
        courseTitle: "Python Fundamentals",
        chapterTitle: "Variables and Memory",
        concepts: [{ id: "c1", slug: "c1", name: "Variables", description: "Memory" }],
        history: [],
        learnerMessage: "How does Python bind variables to memory?",
      },
      (chunk) => chunks.push(chunk)
    );

    expect(streamGeminiSpy).toHaveBeenCalledTimes(1);
    expect(result.provider).toBe("gemini");
    expect(result.modelUsed).toBe("gemini-2.5-flash");
    expect(result.fullText).toContain("Gemini fallback");
  });

  it("allows direct Gemini provider mode when configured", async () => {
    config.aiProvider = "gemini";
    const streamGeminiSpy = vi.spyOn(AIProvider, "streamGeminiReply").mockResolvedValue({
      fullText: "Direct Gemini response",
      modelUsed: "gemini-2.5-flash",
      promptVersion: config.promptVersion,
      provider: "gemini",
    });

    const result = await AIProvider.streamTutorReply(
      {
        courseTitle: "Python Fundamentals",
        chapterTitle: "Control Flow",
        concepts: [{ id: "c2", slug: "c2", name: "Loops", description: "Iteration" }],
        history: [],
        learnerMessage: "What is an iterator?",
      },
      () => {}
    );

    expect(streamGeminiSpy).toHaveBeenCalledTimes(1);
    expect(result.provider).toBe("gemini");
  });
});
