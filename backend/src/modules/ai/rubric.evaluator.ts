import { z } from "zod";
import { prisma } from "../../shared/prisma.js";
import { config } from "../../config/index.js";
import { BayesianKnowledgeTracer } from "../mastery/bkt.js";
import { hasNegationOrConfusion, isKeywordStuffing } from "./ai.provider.js";

export const CriterionVerdictSchema = z.object({
  criterionId: z.string(),
  verdict: z.enum(["DEMONSTRATED", "PARTIAL", "MISSING", "MISCONCEPTION"]),
  score: z.number().min(0).max(1),
  confidence: z.number().min(0).max(1),
  evidenceQuote: z.string().max(300).default(""),
  misconceptionTag: z.string().nullable().default(null),
  reasoning: z.string().max(500).default(""),
});

export const RubricBatchEvaluationSchema = z.object({
  criteriaResults: z.array(CriterionVerdictSchema),
  overallSummary: z.string().max(600).default(""),
});

export type CriterionVerdict = z.infer<typeof CriterionVerdictSchema>;

export interface RubricCriterionInput {
  id: string;
  criterionStatement: string;
  weight: number;
  tierRequired: string;
  cognitiveLevel?: string;
  passingThreshold?: number;
  expectedConceptsJson?: string | null;
  misconceptionsJson?: string | null;
}

export interface HybridEvaluationResult {
  criteriaResults: CriterionVerdict[];
  weightedScore: number;
  overallPassed: boolean;
  hasCriticalMisconception: boolean;
  overallSummary: string;
  evaluatorModel: string;
}

/**
 * Deterministic Stage-1 Pre-Checks + Offline Rubric Fallback.
 * Evaluates against each criterion's own expectedConceptsJson & misconceptionsJson
 * instead of a hardcoded global keyword list.
 */
function deterministicEvaluateCriteria(params: {
  learnerText: string;
  criteria: RubricCriterionInput[];
}): CriterionVerdict[] {
  const text = (params.learnerText || "").trim();
  const lower = text.toLowerCase();
  const globalNegation = hasNegationOrConfusion(text);
  const stuffed = text.length < 18 || isKeywordStuffing(text);

  return params.criteria.map((crit) => {
    // 1. Check criterion-specific misconception patterns
    let detectedMisconception: string | null = null;
    if (crit.misconceptionsJson) {
      try {
        const patterns: Array<{ tag: string; pattern: string; explanation: string }> =
          JSON.parse(crit.misconceptionsJson);
        for (const p of patterns) {
          if (new RegExp(p.pattern, "i").test(text)) {
            detectedMisconception = p.tag;
            break;
          }
        }
      } catch {
        // ignore malformed json
      }
    }

    if (detectedMisconception || globalNegation) {
      return {
        criterionId: crit.id,
        verdict: "MISCONCEPTION",
        score: 0.15,
        confidence: 0.90,
        evidenceQuote: text.slice(0, 200),
        misconceptionTag: detectedMisconception || "CORE_SEMANTIC_NEGATION",
        reasoning: `Response contained a conceptual contradiction against: "${crit.criterionStatement}".`,
      };
    }

    if (stuffed) {
      return {
        criterionId: crit.id,
        verdict: "MISSING",
        score: 0.10,
        confidence: 0.85,
        evidenceQuote: text.slice(0, 120),
        misconceptionTag: null,
        reasoning: "Response was too brief or repetitive to verify conceptual understanding.",
      };
    }

    // 2. Semantic signal coverage from criterion's own expected concepts + statement words
    let expectedTerms: string[] = [];
    if (crit.expectedConceptsJson) {
      try {
        expectedTerms = JSON.parse(crit.expectedConceptsJson);
      } catch {
        expectedTerms = [];
      }
    }
    if (expectedTerms.length === 0) {
      expectedTerms = crit.criterionStatement
        .toLowerCase()
        .replace(/[^a-z0-9_+#/\s-]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length >= 4);
    }

    const uniqueExpected = Array.from(new Set(expectedTerms));
    const hits = uniqueExpected.filter((t) => lower.includes(t.toLowerCase()));
    const coverage = uniqueExpected.length > 0 ? hits.length / Math.min(uniqueExpected.length, 4) : 0;

    if (text.length >= 35 && (hits.length >= 2 || coverage >= 0.5)) {
      const score = Number(Math.min(0.95, 0.72 + coverage * 0.2).toFixed(3));
      return {
        criterionId: crit.id,
        verdict: "DEMONSTRATED",
        score,
        confidence: 0.84,
        evidenceQuote: text.slice(0, 200),
        misconceptionTag: null,
        reasoning: `Demonstrated rubric criterion with relevant concepts (${hits.slice(0, 4).join(", ")}).`,
      };
    }

    if (hits.length === 1 && text.length >= 25) {
      return {
        criterionId: crit.id,
        verdict: "PARTIAL",
        score: 0.45,
        confidence: 0.75,
        evidenceQuote: text.slice(0, 200),
        misconceptionTag: null,
        reasoning: `Partially touched on "${hits[0]}", but needs deeper explanation of: "${crit.criterionStatement}".`,
      };
    }

    return {
      criterionId: crit.id,
      verdict: "MISSING",
      score: 0.15,
      confidence: 0.80,
      evidenceQuote: text.slice(0, 140),
      misconceptionTag: null,
      reasoning: `Did not yet address: "${crit.criterionStatement}".`,
    };
  });
}

async function callStructuredLLMEvaluator(params: {
  conceptName: string;
  questionPrompt?: string;
  learnerText: string;
  criteria: RubricCriterionInput[];
}): Promise<{ parsed: z.infer<typeof RubricBatchEvaluationSchema>; model: string } | null> {
  // Never call live external LLM APIs during unit tests unless explicitly opted in
  if (config.nodeEnv === "test" && process.env.RUN_LIVE_EVAL_TESTS !== "true") {
    return null;
  }

  const criteriaSpec = params.criteria
    .map(
      (c, i) =>
        `${i + 1}. criterionId="${c.id}" | cognitiveLevel="${c.cognitiveLevel || "EXPLAIN"}" | tier="${c.tierRequired}" | statement="${c.criterionStatement}"`
    )
    .join("\n");

  const systemPrompt = `You are a strict, objective Python Engineering Rubric Evaluator for CERTIFY.
Evaluate the learner's response ONLY against the provided rubric criteria.
Return STRICT JSON matching this exact schema:
{
  "criteriaResults": [
    {
      "criterionId": "<exact criterionId from list>",
      "verdict": "DEMONSTRATED" | "PARTIAL" | "MISSING" | "MISCONCEPTION",
      "score": <number 0.0 to 1.0>,
      "confidence": <number 0.0 to 1.0>,
      "evidenceQuote": "<short verbatim quote from learner text or empty string>",
      "misconceptionTag": "<UPPER_SNAKE_CASE tag if verdict is MISCONCEPTION, else null>",
      "reasoning": "<1-2 concise sentences explaining why>"
    }
  ],
  "overallSummary": "<1-2 concise sentences summarizing strengths and gaps>"
}
Rules:
- Reject keyword stuffing, vague hand-waving, or greetings ("hi", "ok", "yes") as MISSING (score <= 0.15).
- If the learner states something factually false about Python semantics, mark MISCONCEPTION (score <= 0.20) with a descriptive UPPER_SNAKE_CASE misconceptionTag.
- Only mark DEMONSTRATED (score >= 0.75) when the learner shows genuine conceptual or practical understanding of that specific criterion.
- Output ONLY valid JSON with no markdown fences.`;

  const userPrompt = `Concept: ${params.conceptName}
${params.questionPrompt ? `Prompt/Question: ${params.questionPrompt}\n` : ""}Learner Response:
"""
${params.learnerText.slice(0, 2500)}
"""

Rubric Criteria to Evaluate:
${criteriaSpec}`;

  // 1. Primary: Gemini fast evaluator (`gemini-3-flash-preview`) with JSON MIME mode
  const geminiKey = process.env.GEMINI_API_KEY || config.geminiApiKey;
  if (geminiKey) {
    try {
      const model = config.geminiEvaluatorModel || "gemini-3-flash-preview";
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: [{ role: "user", parts: [{ text: userPrompt }] }],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 700,
              responseMimeType: "application/json",
            },
          }),
        }
      );

      if (res.ok) {
        const data: any = await res.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const cleaned = rawText.replace(/^```json\s*|\s*```$/g, "").trim();
        const parsed = RubricBatchEvaluationSchema.safeParse(JSON.parse(cleaned));
        if (parsed.success && parsed.data.criteriaResults.length > 0) {
          return { parsed: parsed.data, model };
        }
      }
    } catch (err: any) {
      console.warn("[RubricEvaluator] Gemini structured eval error:", err?.message || err);
    }
  }

  // 2. Fallback: Groq fast evaluator
  const groqKey = process.env.GROQ_API_KEY || (config as any).groqApiKey;
  if (groqKey) {
    try {
      const model = (config as any).groqEvaluatorModel || "openai/gpt-oss-120b";
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.1,
          max_tokens: 700,
          response_format: { type: "json_object" },
        }),
      });

      if (res.ok) {
        const data: any = await res.json();
        const rawText = data?.choices?.[0]?.message?.content || "";
        const parsed = RubricBatchEvaluationSchema.safeParse(JSON.parse(rawText));
        if (parsed.success && parsed.data.criteriaResults.length > 0) {
          return { parsed: parsed.data, model };
        }
      }
    } catch (err: any) {
      console.warn("[RubricEvaluator] Groq structured eval error:", err?.message || err);
    }
  }

  return null;
}

export class RubricEvaluatorService {
  /**
   * 3-Stage Hybrid Rubric Evaluation:
   *  Stage 1: Deterministic anti-gaming & misconception pre-checks
   *  Stage 2: Strict Zod-validated LLM per-criterion evidence extraction
   *  Stage 3: Pure deterministic backend weighted score computation
   */
  public static async evaluateResponse(params: {
    conceptName: string;
    questionPrompt?: string;
    learnerText: string;
    criteria: RubricCriterionInput[];
    mode: "DIALOGUE" | "CHECKPOINT";
  }): Promise<HybridEvaluationResult> {
    if (params.criteria.length === 0) {
      return {
        criteriaResults: [],
        weightedScore: 0,
        overallPassed: false,
        hasCriticalMisconception: false,
        overallSummary: "No rubric criteria configured.",
        evaluatorModel: "none",
      };
    }

    const text = (params.learnerText || "").trim();

    // Stage 1: Hard deterministic pre-checks (always enforced, LLM cannot override)
    const preCheckResults = deterministicEvaluateCriteria({
      learnerText: text,
      criteria: params.criteria,
    });

    const isTrivialMessage = text.length < 18 || isKeywordStuffing(text);
    const preCheckMap = new Map(preCheckResults.map((r) => [r.criterionId, r]));

    let finalResults: CriterionVerdict[] = preCheckResults;
    let overallSummary = "";
    let evaluatorModel = "deterministic-rubric-v2";

    // Stage 2: Call structured LLM judge for substantive learner messages
    if (!isTrivialMessage) {
      const llmEval = await callStructuredLLMEvaluator({
        conceptName: params.conceptName,
        questionPrompt: params.questionPrompt,
        learnerText: text,
        criteria: params.criteria,
      });

      if (llmEval) {
        evaluatorModel = llmEval.model;
        overallSummary = llmEval.parsed.overallSummary;
        const llmById = new Map(llmEval.parsed.criteriaResults.map((r) => [r.criterionId, r]));

        // Merge Stage 1 hard misconception overrides with Stage 2 LLM evidence
        finalResults = params.criteria.map((crit) => {
          const pre = preCheckMap.get(crit.id)!;
          if (pre.verdict === "MISCONCEPTION") {
            return pre; // Deterministic misconception detector always wins
          }
          return llmById.get(crit.id) || pre;
        });
      }
    }

    // Stage 3: Pure deterministic backend weighted score math
    let totalWeight = 0;
    let earnedWeight = 0;
    let hasCriticalMisconception = false;

    const critWeightMap = new Map(params.criteria.map((c) => [c.id, c.weight || 1.0]));

    for (const res of finalResults) {
      const w = critWeightMap.get(res.criterionId) || 1.0;
      totalWeight += w;
      earnedWeight += w * res.score;
      if (res.verdict === "MISCONCEPTION") {
        hasCriticalMisconception = true;
      }
    }

    const weightedScore = totalWeight > 0 ? Number((earnedWeight / totalWeight).toFixed(4)) : 0;
    const overallPassed = weightedScore >= 0.70 && !hasCriticalMisconception;

    if (!overallSummary) {
      const demoCount = finalResults.filter((r) => r.verdict === "DEMONSTRATED").length;
      overallSummary = hasCriticalMisconception
        ? `Conceptual misconception detected in ${params.conceptName}. Targeted remediation recommended.`
        : overallPassed
        ? `Demonstrated ${demoCount}/${finalResults.length} rubric criteria for ${params.conceptName}.`
        : `Addressed ${demoCount}/${finalResults.length} rubric criteria (${Math.round(weightedScore * 100)}%). Review unmet criteria before advancing.`;
    }

    return {
      criteriaResults: finalResults,
      weightedScore,
      overallPassed,
      hasCriticalMisconception,
      overallSummary,
      evaluatorModel,
    };
  }

  /**
   * Atomically persists per-criterion RubricCriterionMastery, ConceptMastery (BKT positive + negative),
   * and MasteryEvidence audit records. Pure deterministic backend math.
   */
  public static async persistEvaluationResults(params: {
    enrollmentId: string;
    conceptId: string;
    sectionId?: string | null;
    evidenceType: "DIALOGUE_PROBE" | "CHAPTER_ASSESSMENT" | "PRACTICAL_TASK" | "VIVA";
    evaluation: HybridEvaluationResult;
    criteria: RubricCriterionInput[];
    capDialogueMastery?: boolean;
  }): Promise<{
    conceptPMastery: number;
    conceptState: string;
    updatedCriteria: Array<{
      criterionId: string;
      status: string;
      pCriterion: number;
      verdict: string;
      score: number;
      misconceptionTag: string | null;
    }>;
  }> {
    const now = new Date();
    const critThresholdMap = new Map(
      params.criteria.map((c) => [c.id, c.passingThreshold ?? 0.70])
    );

    const updatedCriteria: Array<{
      criterionId: string;
      status: string;
      pCriterion: number;
      verdict: string;
      score: number;
      misconceptionTag: string | null;
    }> = [];

    // Ensure ConceptMastery row exists (prevents FK crash on null id)
    let conceptMastery = await prisma.conceptMastery.findUnique({
      where: {
        enrollmentId_conceptId: {
          enrollmentId: params.enrollmentId,
          conceptId: params.conceptId,
        },
      },
    });

    if (!conceptMastery) {
      conceptMastery = await prisma.conceptMastery.create({
        data: {
          enrollmentId: params.enrollmentId,
          conceptId: params.conceptId,
          pMastery: 0.15,
          confidence: 0.2,
          state: "UNENCOUNTERED",
        },
      });
    }

    // 1. Pre-fetch all existing RubricCriterionMastery records in a single query (F-14 batching)
    const targetCriterionIds = params.evaluation.criteriaResults
      .filter((res) => !(params.evidenceType === "DIALOGUE_PROBE" && res.verdict === "MISSING"))
      .map((res) => res.criterionId);

    const existingMasteries = await prisma.rubricCriterionMastery.findMany({
      where: {
        enrollmentId: params.enrollmentId,
        rubricCriterionId: { in: targetCriterionIds },
      },
    });
    const existingMap = new Map(existingMasteries.map((m) => [m.rubricCriterionId, m]));

    const criterionOperations: Array<{
      res: typeof params.evaluation.criteriaResults[0];
      isPositive: boolean;
      nextP: number;
      nextStatus: string;
      bestScore: number;
      demoCount: number;
      failCount: number;
      miscCount: number;
      misconceptionTag: string | null;
      lastEvidenceQuote: string | null;
    }> = [];

    for (const res of params.evaluation.criteriaResults) {
      const threshold = critThresholdMap.get(res.criterionId) ?? 0.70;
      const isPositive =
        res.verdict === "DEMONSTRATED" && res.score >= threshold && res.confidence >= 0.70;
      const isNegative =
        res.verdict === "MISCONCEPTION" ||
        (params.evidenceType === "CHAPTER_ASSESSMENT" && res.verdict === "MISSING");

      if (params.evidenceType === "DIALOGUE_PROBE" && res.verdict === "MISSING") {
        continue;
      }

      const existing = existingMap.get(res.criterionId);

      const prevP = existing?.pCriterion ?? 0.15;
      let nextP = prevP;
      if (isPositive) {
        nextP = BayesianKnowledgeTracer.update(prevP, true);
        if (params.capDialogueMastery && params.evidenceType === "DIALOGUE_PROBE") {
          nextP = Math.min(nextP, 0.78);
        }
      } else if (isNegative) {
        nextP = BayesianKnowledgeTracer.update(prevP, false);
      }

      const demoCount = (existing?.demonstratedCount || 0) + (isPositive ? 1 : 0);
      const failCount = (existing?.failedCount || 0) + (isNegative ? 1 : 0);
      const miscCount =
        (existing?.misconceptionCount || 0) + (res.verdict === "MISCONCEPTION" ? 1 : 0);
      const bestScore = Math.max(existing?.bestScore || 0, res.score);

      let nextStatus = existing?.status || "ATTEMPTED";
      if (res.verdict === "MISCONCEPTION") {
        nextStatus = "ATTEMPTED";
      } else if (nextP >= 0.85 && demoCount >= 2 && params.evidenceType !== "DIALOGUE_PROBE") {
        nextStatus = "MASTERED";
      } else if (nextP >= 0.70 && demoCount >= 1) {
        nextStatus = "DEMONSTRATED";
      } else if (res.verdict === "PARTIAL" || bestScore >= 0.4) {
        nextStatus = "PARTIAL";
      } else {
        nextStatus = "ATTEMPTED";
      }

      const misconceptionTag =
        res.verdict === "MISCONCEPTION"
          ? res.misconceptionTag || "CONCEPTUAL_ERROR"
          : isPositive
          ? null
          : existing?.lastMisconception || null;

      criterionOperations.push({
        res,
        isPositive,
        nextP,
        nextStatus,
        bestScore,
        demoCount,
        failCount,
        miscCount,
        misconceptionTag,
        lastEvidenceQuote: res.evidenceQuote || existing?.lastEvidenceQuote || null,
      });

      updatedCriteria.push({
        criterionId: res.criterionId,
        status: nextStatus,
        pCriterion: nextP,
        verdict: res.verdict,
        score: res.score,
        misconceptionTag,
      });
    }

    // 2. Compute Concept-Level BKT
    let nextConceptP = conceptMastery.pMastery;
    let nextState = conceptMastery.state;
    let remediationDelta = 0;

    const shouldUpdateConceptBkt =
      params.evidenceType === "CHAPTER_ASSESSMENT" ||
      params.evaluation.overallPassed ||
      params.evaluation.hasCriticalMisconception;

    if (shouldUpdateConceptBkt) {
      const obs = params.evaluation.overallPassed && !params.evaluation.hasCriticalMisconception;
      nextConceptP = BayesianKnowledgeTracer.update(conceptMastery.pMastery, obs);

      if (params.capDialogueMastery && params.evidenceType === "DIALOGUE_PROBE" && obs) {
        nextConceptP = Math.min(nextConceptP, 0.78);
      }

      if (params.evaluation.hasCriticalMisconception || (!obs && nextConceptP < 0.60)) {
        nextState = "NEEDS_REMEDIATION";
        remediationDelta = 1;
      } else if (nextConceptP >= 0.90) {
        nextState = "ADVANCED";
      } else if (nextConceptP >= 0.85) {
        nextState = "MASTERED";
      } else {
        nextState = "LEARNING";
      }
    }

    // 3. Execute all writes atomically in a single Prisma transaction (F-14)
    await prisma.$transaction(async (tx) => {
      for (const op of criterionOperations) {
        await tx.rubricCriterionMastery.upsert({
          where: {
            enrollmentId_rubricCriterionId: {
              enrollmentId: params.enrollmentId,
              rubricCriterionId: op.res.criterionId,
            },
          },
          update: {
            status: op.nextStatus,
            pCriterion: op.nextP,
            bestScore: op.bestScore,
            latestScore: op.res.score,
            demonstratedCount: op.demoCount,
            failedCount: op.failCount,
            misconceptionCount: op.miscCount,
            lastMisconception: op.misconceptionTag,
            lastEvidenceQuote: op.lastEvidenceQuote,
            lastEvaluatedAt: now,
          },
          create: {
            enrollmentId: params.enrollmentId,
            rubricCriterionId: op.res.criterionId,
            status: op.nextStatus,
            pCriterion: op.nextP,
            bestScore: op.bestScore,
            latestScore: op.res.score,
            demonstratedCount: op.demoCount,
            failedCount: op.failCount,
            misconceptionCount: op.miscCount,
            lastMisconception: op.misconceptionTag,
            lastEvidenceQuote: op.lastEvidenceQuote,
            lastEvaluatedAt: now,
          },
        });

        await tx.masteryEvidence.create({
          data: {
            conceptMasteryId: conceptMastery.id,
            rubricCriterionId: op.res.criterionId,
            sectionId: params.sectionId || null,
            evidenceType: params.evidenceType,
            isDemonstrated: op.isPositive,
            score: op.res.score,
            confidence: op.res.confidence,
            misconceptionTag: op.res.misconceptionTag || null,
            evidenceQuote: op.res.evidenceQuote || null,
            evaluatorReasoning: op.res.reasoning || null,
          },
        });
      }

      if (shouldUpdateConceptBkt) {
        await tx.conceptMastery.update({
          where: { id: conceptMastery.id },
          data: {
            pMastery: nextConceptP,
            confidence: Math.min((conceptMastery.confidence || 0.2) + 0.12, 0.96),
            state: nextState,
            remediationCycles: { increment: remediationDelta },
            lastAssessedAt: now,
          },
        });
      }
    });

    return {
      conceptPMastery: nextConceptP,
      conceptState: nextState,
      updatedCriteria,
    };
  }
}
