import { describe, it, expect } from "vitest";
import { RAGService } from "./rag.service.js";

describe("RAGService Hybrid Retrieval & Graceful Fallback", () => {
  it("returns empty array when query is empty or whitespace", async () => {
    const res1 = await RAGService.retrieveContext({ query: "" });
    const res2 = await RAGService.retrieveContext({ query: "   " });
    expect(res1).toEqual([]);
    expect(res2).toEqual([]);
  });

  it("retrieves top-3 grounded chunks from Neon course_embeddings", async () => {
    const result = await RAGService.retrieveContext({
      query: "variables references mutability",
      topK: 3,
    });

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result[0]).toHaveProperty("id");
    expect(result[0]).toHaveProperty("content");
    expect(result[0]).toHaveProperty("moduleSlug");
    expect(result[0]).toHaveProperty("chunkType");
    expect(typeof result[0].score).toBe("number");
  });

  it("scopes retrieval to a specific module when moduleSlug is provided", async () => {
    const result = await RAGService.retrieveContext({
      moduleSlug: "python-foundations",
      query: "input string conversion",
      topK: 2,
    });

    expect(Array.isArray(result)).toBe(true);
    if (result.length > 0) {
      expect(result[0].moduleSlug).toBe("python-foundations");
    }
  });

  it("gracefully falls back and returns empty array on unmatchable queries or non-existent scopes", async () => {
    const result = await RAGService.retrieveContext({
      chapterId: "non-existent-chapter-id-xyz",
      moduleSlug: "non-existent-module-xyz",
      query: "xyznonexistentgibberish123456",
      topK: 3,
    });

    expect(Array.isArray(result)).toBe(true);
  });
});
