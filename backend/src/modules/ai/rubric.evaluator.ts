import { config } from "../../config/index.js";
import { prisma } from "../../shared/prisma.js";
import { BKTService, MasteryState } from "../mastery/bkt.js";
import { normalizeGeminiModel } from "./ai.provider.js";

export type CriterionVerdict = "DEMONSTRATED" | "PARTIAL" | "MISSING" | "MISCONCEPTION";

export interface CriterionEvaluationItem {
  criterionId: string;
  criterionCode: string | null;
  verdict: CriterionVerdict;
  score: number; // 0.0 to 1.0
  confidence: number;
  evidenceQuote: string;
  misconceptionTag: string | null;
  reasoning: string;
}

export interface HybridEvaluationResult {
  criteriaResults: CriterionEvaluationItem[];
  weightedScore: number;
  overallPassed: boolean;
  hasCriticalMisconception: boolean;
  overallSummary: string;
  nextTargetedProbe: string;
  evaluatorModel: string;
}

export interface RubricCriterionInput {
  id: string;
  criterionCode?: string | null;
  criterionStatement: string;
  weight: number;
  tierRequired: string;
  cognitiveLevel?: string;
  passingThreshold?: number;
  expectedConceptsJson?: string | null;
  misconceptionsJson?: string | null;
}

/**
 * 2-Stage Hybrid Rubric & Misconception Evaluator
 *
 * Stage 1: Deterministic AST / Regex / Misconception Trap & Keyword Signal Pre-Check
 *          (Context-aware: correlates concise learner answers with the tutor's last question!)
 * Stage 2: Structured JSON Schema LLM Rubric Grader (Gemini 2.5 Flash / Groq Llama 3.3 70B)
 *          with deterministic Stage-1 fallback when external APIs are offline.
 */
export class RubricEvaluatorService {
  /**
   * Evaluates a learner's dialogue turn or checkpoint answer against all criteria for the concept.
   */
  public static async evaluateResponse(params: {
    conceptName: string;
    questionPrompt?: string;
    lastTutorQuestion?: string | null;
    learnerText: string;
    criteria: RubricCriterionInput[];
    mode: "DIALOGUE" | "CHECKPOINT";
  }): Promise<HybridEvaluationResult> {
    const {
      conceptName,
      questionPrompt = `Demonstrate mastery of ${conceptName}`,
      lastTutorQuestion,
      learnerText,
      criteria,
      mode,
    } = params;
    const text = learnerText.trim();
    const lower = text.toLowerCase();

    // 1. Detect pure greetings / meta-commands vs. genuine technical answers
    const isPureGreetingOrCommand =
      /^(hi|hello|hey|yo|ok|okay|thanks|thank you|next|skip|move on|continue|help|\?+)$/i.test(
        text
      );
    const hasTechnicalSignal =
      /`[^`]+`|\b(def|return|print|list|dict|tuple|set|int|float|str|bool|if|elif|else|for|while|try|except|class|self|import|id|type|len|range|true|false|none|error|mutable|immutable|reference|heap|indent|loop|function|variable|object|memory|slice|index|key|value)\b|[=\[\]{}()<>+\-*/:]/i.test(
        text
      ) || /\b\d+\b/.test(text);

    const isTrivialMessage =
      isPureGreetingOrCommand ||
      (mode === "CHECKPOINT"
        ? text.length < 15 || this.isKeywordStuffing(text)
        : (text.length < 6 && !hasTechnicalSignal) || this.isKeywordStuffing(text));

    // Stage 1: Deterministic per-criterion signal & misconception scan
    const stage1Results: CriterionEvaluationItem[] = criteria.map((crit) => {
      if (isTrivialMessage) {
        return {
          criterionId: crit.id,
          criterionCode: crit.criterionCode || null,
          verdict: "MISSING",
          score: 0.05,
          confidence: 0.95,
          evidenceQuote: text.slice(0, 80),
          misconceptionTag: null,
          reasoning:
            "Response is a greeting, command, or too brief to demonstrate conceptual understanding.",
        };
      }

      // Check deterministic misconception patterns first
      const misconceptions = this.parseMisconceptions(crit.misconceptionsJson);
      for (const m of misconceptions) {
        try {
          const regex = new RegExp(m.pattern, "i");
          if (regex.test(text)) {
            return {
              criterionId: crit.id,
              criterionCode: crit.criterionCode || null,
              verdict: "MISCONCEPTION",
              score: 0.1,
              confidence: 0.92,
              evidenceQuote: text.slice(0, 140),
              misconceptionTag: m.tag,
              reasoning: `Detected conceptual misconception (${m.tag}): ${m.explanation}`,
            };
          }
        } catch {
          // Ignore malformed regex
        }
      }

      const expectedTerms = this.parseExpectedConcepts(
        crit.expectedConceptsJson,
        crit.criterionStatement
      );
      const uniqueExpected = Array.from(new Set(expectedTerms));

      // Match tokens directly in learner text
      const learnerHits = uniqueExpected.filter((t) => lower.includes(t.toLowerCase()));

      // In DIALOGUE mode, if the tutor asked a targeted question about this criterion,
      // check whether the tutor's question established the criterion context and the learner supplied the answer!
      const tutorQuestionContext = (lastTutorQuestion || questionPrompt || "").toLowerCase();
      const questionContextHits =
        mode === "DIALOGUE"
          ? uniqueExpected.filter((t) => tutorQuestionContext.includes(t.toLowerCase()))
          : [];

      const combinedHits = Array.from(new Set([...learnerHits, ...questionContextHits]));
      const learnerCoverage =
        uniqueExpected.length > 0 ? learnerHits.length / uniqueExpected.length : 0;
      const contextualCoverage =
        uniqueExpected.length > 0 ? combinedHits.length / uniqueExpected.length : 0;

      const hasReasoningConnective =
        /\b(because|since|therefore|means|points?\s+to|references?|mutat|immutab|raises?|returns?|evaluates?|prints?|outputs?|creates?|binds?|heap|memory|same\s+object|new\s+object)\b/i.test(
          text
        );

      let verdict: CriterionVerdict = "MISSING";
      let score = 0.15;
      let reasoning = `Did not yet address: ${crit.criterionStatement}`;

      if (
        (text.length >= 30 && (learnerHits.length >= 2 || learnerCoverage >= 0.45)) ||
        (mode === "DIALOGUE" &&
          text.length >= 12 &&
          hasTechnicalSignal &&
          learnerHits.length >= 1 &&
          (hasReasoningConnective || contextualCoverage >= 0.45))
      ) {
        verdict = "DEMONSTRATED";
        score = Math.min(0.95, Number((0.74 + learnerCoverage * 0.22).toFixed(2)));
        reasoning = `Accurately explained key mechanics (${
          learnerHits.slice(0, 4).join(", ") || "verified answer to tutor probe"
        }) satisfying criterion.`;
      } else if (
        learnerHits.length >= 1 ||
        (mode === "DIALOGUE" && hasTechnicalSignal && questionContextHits.length >= 2 && text.length >= 8)
      ) {
        verdict = "PARTIAL";
        score = 0.52;
        reasoning = `Partially addressed (${
          learnerHits.concat(questionContextHits).slice(0, 3).join(", ")
        }), but needs a deeper causal explanation or trace.`;
      }

      return {
        criterionId: crit.id,
        criterionCode: crit.criterionCode || null,
        verdict,
        score,
        confidence: 0.78,
        evidenceQuote: text.slice(0, 140),
        misconceptionTag: null,
        reasoning,
      };
    });

    // If trivial message, skip Stage 2 LLM call to save latency and tokens
    if (isTrivialMessage || criteria.length === 0) {
      return this.compileFinalResult(stage1Results, criteria, "stage1-deterministic");
    }

    // Stage 2: Structured LLM Rubric Evaluation (Gemini or Groq)
    try {
      const llmEval = await this.runStage2LlmEvaluation({
        conceptName,
        questionPrompt: lastTutorQuestion
          ? `${questionPrompt}\nMost Recent Tutor Probe: "${lastTutorQuestion}"`
          : questionPrompt,
        learnerText: text,
        criteria,
        stage1Results,
      });
      if (llmEval) {
        return llmEval;
      }
    } catch (err: any) {
      console.warn(
        "[RubricEvaluator] Stage 2 LLM fallback to Stage 1 deterministic:",
        err?.message || err
      );
    }

    return this.compileFinalResult(stage1Results, criteria, "stage1-deterministic");
  }

  private static async runStage2LlmEvaluation(params: {
    conceptName: string;
    questionPrompt?: string;
    learnerText: string;
    criteria: RubricCriterionInput[];
    stage1Results: CriterionEvaluationItem[];
  }): Promise<HybridEvaluationResult | null> {
    const { conceptName, questionPrompt, learnerText, criteria, stage1Results } = params;

    const criteriaBlock = criteria
      .map(
        (c, idx) =>
          `${idx + 1}. id="${c.id}" code="${c.criterionCode || `R${idx + 1}`}" weight=${c.weight} level=${c.cognitiveLevel || "EXPLAIN"}: "${c.criterionStatement}"`
      )
      .join("\n");

    const systemPrompt = `You are the CERTIFY Psychometric Rubric Evaluator for Python Engineering.
Evaluate the learner's response strictly against each listed rubric criterion.
IMPORTANT:
- If the learner is answering the "Most Recent Tutor Probe", evaluate their answer in the context of that probe.
- Credit concise, technically accurate answers (e.g., predicting exact variable output, naming the right exception, or explaining object reference behavior) as DEMONSTRATED (score >= 0.75) for the criterion being probed.
- If the learner states a factual Python falsehood (e.g., "lists are immutable", "tuples can be modified in place", "b = a copies a list", "default arguments reset every call"), mark verdict="MISCONCEPTION" and score <= 0.15.
- Return ONLY valid JSON matching this schema:
{
  "criteriaResults": [
    {
      "criterionId": "string",
      "verdict": "DEMONSTRATED" | "PARTIAL" | "MISSING" | "MISCONCEPTION",
      "score": number (0.0 to 1.0),
      "confidence": number (0.0 to 1.0),
      "evidenceQuote": "exact substring from learner response",
      "misconceptionTag": "string or null",
      "reasoning": "1 concise sentence explaining why"
    }
  ],
  "overallSummary": "1-2 sentence diagnostic summary",
  "nextTargetedProbe": "1 Socratic follow-up question targeting the highest-weight unmet criterion"
}`;

    const userPrompt = `Concept: ${conceptName}
Context / Question Prompt: ${questionPrompt}
Rubric Criteria:
${criteriaBlock}

Learner Response:
"""
${learnerText}
"""`;

    if (config.geminiApiKey && (config.aiProvider === "gemini" || !config.groqApiKey)) {
      return await this.evaluateWithGemini(systemPrompt, userPrompt, criteria, stage1Results);
    }

    if (config.groqApiKey) {
      return await this.evaluateWithGroq(systemPrompt, userPrompt, criteria, stage1Results);
    }

    return null;
  }

  private static async evaluateWithGemini(
    systemPrompt: string,
    userPrompt: string,
    criteria: RubricCriterionInput[],
    stage1Results: CriterionEvaluationItem[]
  ): Promise<HybridEvaluationResult | null> {
    const model = normalizeGeminiModel(config.geminiEvaluatorModel, "gemini-2.5-flash");
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.geminiApiKey}`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: {
          temperature: 0.0,
          maxOutputTokens: 900,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!res.ok) return null;
    const data = (await res.json()) as any;
    const rawJson = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawJson) return null;

    return this.parseAndMergeLlmJson(rawJson, criteria, stage1Results, model);
  }

  private static async evaluateWithGroq(
    systemPrompt: string,
    userPrompt: string,
    criteria: RubricCriterionInput[],
    stage1Results: CriterionEvaluationItem[]
  ): Promise<HybridEvaluationResult | null> {
    const rawGroqModel = (config as any).groqEvaluatorModel || config.groqModel || "llama-3.3-70b-versatile";
    const model = rawGroqModel.includes("gpt-oss") ? "llama-3.3-70b-versatile" : rawGroqModel;

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.groqApiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.0,
        max_tokens: 900,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) return null;
    const data = (await res.json()) as any;
    const rawJson = data?.choices?.[0]?.message?.content;
    if (!rawJson) return null;

    return this.parseAndMergeLlmJson(rawJson, criteria, stage1Results, model);
  }

  private static parseAndMergeLlmJson(
    rawJson: string,
    criteria: RubricCriterionInput[],
    stage1Results: CriterionEvaluationItem[],
    modelName: string
  ): HybridEvaluationResult | null {
    try {
      const parsed = JSON.parse(rawJson);
      const llmItems: any[] = Array.isArray(parsed.criteriaResults) ? parsed.criteriaResults : [];

      const merged: CriterionEvaluationItem[] = criteria.map((crit, idx) => {
        const s1 = stage1Results[idx];
        // Never allow LLM to override a deterministic Stage-1 MISCONCEPTION catch
        if (s1 && s1.verdict === "MISCONCEPTION") {
          return s1;
        }

        const found =
          llmItems.find((item) => item.criterionId === crit.id) || llmItems[idx];
        if (!found) return s1;

        const verdict: CriterionVerdict = [
          "DEMONSTRATED",
          "PARTIAL",
          "MISSING",
          "MISCONCEPTION",
        ].includes(found.verdict)
          ? found.verdict
          : s1.verdict;

        const rawScore =
          typeof found.score === "number"
            ? Math.max(0, Math.min(1, found.score))
            : s1.score;

        return {
          criterionId: crit.id,
          criterionCode: crit.criterionCode || null,
          verdict,
          score: Number(rawScore.toFixed(2)),
          confidence:
            typeof found.confidence === "number" ? found.confidence : 0.85,
          evidenceQuote: String(found.evidenceQuote || s1.evidenceQuote).slice(
            0,
            180
          ),
          misconceptionTag:
            found.misconceptionTag ||
            (verdict === "MISCONCEPTION" ? "CONCEPTUAL_MISCONCEPTION" : null),
          reasoning: String(found.reasoning || s1.reasoning).slice(0, 280),
        };
      });

      return this.compileFinalResult(
        merged,
        criteria,
        modelName,
        parsed.overallSummary,
        parsed.nextTargetedProbe
      );
    } catch {
      return null;
    }
  }

  private static compileFinalResult(
    items: CriterionEvaluationItem[],
    criteria: RubricCriterionInput[],
    evaluatorModel: string,
    customSummary?: string,
    customProbe?: string
  ): HybridEvaluationResult {
    let weightedSum = 0;
    let weightTotal = 0;
    let hasCriticalMisconception = false;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const weight = criteria[i]?.weight ?? 0.5;
      weightedSum += item.score * weight;
      weightTotal += weight;
      if (item.verdict === "MISCONCEPTION") {
        hasCriticalMisconception = true;
      }
    }

    const weightedScore =
      weightTotal > 0 ? Number((weightedSum / weightTotal).toFixed(4)) : 0;

    const unmet = items.find((it) => it.verdict !== "DEMONSTRATED");
    const unmetCrit = criteria.find((c) => c.id === unmet?.criterionId);

    const overallSummary =
      customSummary ||
      (hasCriticalMisconception
        ? `Conceptual misconception detected: ${
            items.find((i) => i.verdict === "MISCONCEPTION")?.reasoning
          }`
        : weightedScore >= 0.7
        ? "Strong rubric alignment demonstrated across core criteria."
        : `Partial understanding shown (${Math.round(
            weightedScore * 100
          )}%). Focus next on: ${
            unmetCrit?.criterionStatement || "deeper runtime mechanics"
          }.`);

    const nextTargetedProbe =
      customProbe ||
      (unmetCrit
        ? `Can you trace how Python handles this in practice: ${unmetCrit.criterionStatement}?`
        : "How would you verify this behavior with a concrete Python edge case?");

    return {
      criteriaResults: items,
      weightedScore,
      overallPassed: weightedScore >= 0.70 && !hasCriticalMisconception,
      hasCriticalMisconception,
      overallSummary,
      nextTargetedProbe,
      evaluatorModel,
    };
  }

  /**
   * Persists per-criterion mastery rows AND updates ConceptMastery via BKT
   * (supporting BOTH positive and negative evidence!).
   */
  public static async persistEvaluationResults(params: {
    enrollmentId: string;
    conceptId: string;
    sectionId?: string | null;
    evidenceType: "DIALOGUE_PROBE" | "CHAPTER_ASSESSMENT";
    evaluation: HybridEvaluationResult;
    criteria: RubricCriterionInput[];
    capDialogueMastery?: boolean;
  }): Promise<{
    conceptPMastery: number;
    conceptState: MasteryState;
    demonstratedCriteriaCount: number;
    totalCriteriaCount: number;
    newlyDemonstratedStatements: string[];
  }> {
    const {
      enrollmentId,
      conceptId,
      sectionId,
      evidenceType,
      evaluation,
      criteria,
      capDialogueMastery = false,
    } = params;

    const newlyDemonstratedStatements: string[] = [];

    // 1. Upsert each RubricCriterionMastery row
    for (const item of evaluation.criteriaResults) {
      const existing = await prisma.rubricCriterionMastery.findUnique({
        where: {
          enrollmentId_rubricCriterionId: {
            enrollmentId,
            rubricCriterionId: item.criterionId,
          },
        },
      });

      const prevP = existing?.pCriterion ?? 0.15;
      const isCorrectSignal =
        item.verdict === "DEMONSTRATED"
          ? true
          : item.verdict === "MISCONCEPTION"
          ? false
          : null;

      let nextP = prevP;
      if (isCorrectSignal === true) {
        nextP = BKTService.updateMastery(prevP, true, {
          pT: 0.22,
          pS: 0.08,
          pG: 0.15,
        });
      } else if (isCorrectSignal === false) {
        nextP = BKTService.updateMastery(prevP, false, {
          pT: 0.05,
          pS: 0.08,
          pG: 0.15,
        });
      } else if (item.verdict === "PARTIAL") {
        nextP = Number(Math.min(0.68, Math.max(prevP, (prevP + item.score) / 2)).toFixed(4));
      }

      const bestScore = Math.max(existing?.bestScore ?? 0, item.score);
      const demCount =
        (existing?.demonstratedCount ?? 0) +
        (item.verdict === "DEMONSTRATED" ? 1 : 0);
      const failCount =
        (existing?.failedCount ?? 0) +
        (item.verdict === "MISSING" || item.verdict === "MISCONCEPTION" ? 1 : 0);
      const miscCount =
        (existing?.misconceptionCount ?? 0) +
        (item.verdict === "MISCONCEPTION" ? 1 : 0);

      let status = "ATTEMPTED";
      if (nextP >= 0.85 && demCount >= 2) status = "MASTERED";
      else if (item.verdict === "DEMONSTRATED" || bestScore >= 0.7) {
        status = "DEMONSTRATED";
        if (existing?.status !== "DEMONSTRATED" && existing?.status !== "MASTERED") {
          const matchedCrit = criteria.find((c) => c.id === item.criterionId);
          if (matchedCrit) {
            newlyDemonstratedStatements.push(matchedCrit.criterionStatement);
          }
        }
      } else if (item.verdict === "PARTIAL" || bestScore >= 0.45) {
        status = "PARTIAL";
      }

      await prisma.rubricCriterionMastery.upsert({
        where: {
          enrollmentId_rubricCriterionId: {
            enrollmentId,
            rubricCriterionId: item.criterionId,
          },
        },
        update: {
          status,
          pCriterion: nextP,
          latestScore: item.score,
          bestScore,
          demonstratedCount: demCount,
          failedCount: failCount,
          misconceptionCount: miscCount,
          lastMisconception:
            item.verdict === "MISCONCEPTION"
              ? item.misconceptionTag || item.reasoning
              : existing?.lastMisconception,
          lastEvidenceQuote: item.evidenceQuote,
          lastEvaluatedAt: new Date(),
        },
        create: {
          enrollmentId,
          rubricCriterionId: item.criterionId,
          status,
          pCriterion: nextP,
          latestScore: item.score,
          bestScore: item.score,
          demonstratedCount: item.verdict === "DEMONSTRATED" ? 1 : 0,
          failedCount:
            item.verdict === "MISSING" || item.verdict === "MISCONCEPTION" ? 1 : 0,
          misconceptionCount: item.verdict === "MISCONCEPTION" ? 1 : 0,
          lastMisconception:
            item.verdict === "MISCONCEPTION"
              ? item.misconceptionTag || item.reasoning
              : null,
          lastEvidenceQuote: item.evidenceQuote,
          lastEvaluatedAt: new Date(),
        },
      });
    }

    // 2. Update ConceptMastery (both positive AND negative BKT updates!)
    let cm = await prisma.conceptMastery.findUnique({
      where: {
        enrollmentId_conceptId: {
          enrollmentId,
          conceptId,
        },
      },
    });

    const currentP = cm?.pMastery ?? 0.15;
    let newP = currentP;

    if (evaluation.hasCriticalMisconception) {
      // Negative BKT update when learner expresses a misconception
      newP = BKTService.updateMastery(currentP, false, {
        pT: 0.05,
        pS: 0.1,
        pG: 0.15,
      });
    } else if (evaluation.weightedScore >= 0.7) {
      // Positive BKT update when rubric score >= 0.70
      newP = BKTService.updateMastery(currentP, true, {
        pT: evidenceType === "CHAPTER_ASSESSMENT" ? 0.25 : 0.18,
        pS: 0.08,
        pG: 0.15,
      });
      if (capDialogueMastery) {
        // Socratic dialogue alone caps at 0.84; formal checkpoint assessment unlocks >= 0.85
        newP = Math.min(newP, 0.84);
      }
    } else if (evidenceType === "CHAPTER_ASSESSMENT" && evaluation.weightedScore < 0.5) {
      // Failed formal checkpoint lowers BKT mastery
      newP = BKTService.updateMastery(currentP, false, {
        pT: 0.05,
        pS: 0.1,
        pG: 0.15,
      });
    }

    const newState = BKTService.determineState(newP, true);

    cm = await prisma.conceptMastery.upsert({
      where: {
        enrollmentId_conceptId: {
          enrollmentId,
          conceptId,
        },
      },
      update: {
        pMastery: newP,
        state: newState,
        lastAssessedAt: new Date(),
      },
      create: {
        enrollmentId,
        conceptId,
        pMastery: newP,
        state: newState,
        lastAssessedAt: new Date(),
      },
    });

    await prisma.masteryEvidence.create({
      data: {
        conceptMasteryId: cm.id,
        sectionId: sectionId || null,
        evidenceType,
        isDemonstrated:
          evaluation.weightedScore >= 0.7 && !evaluation.hasCriticalMisconception,
        confidence: evaluation.weightedScore,
        score: evaluation.weightedScore,
        misconceptionTag: evaluation.hasCriticalMisconception
          ? evaluation.criteriaResults.find((r) => r.verdict === "MISCONCEPTION")
              ?.misconceptionTag || "MISCONCEPTION"
          : null,
        evidenceQuote: evaluation.overallSummary.slice(0, 280),
      },
    });

    // Compute total demonstrated criteria for this concept
    const allCritMasteries = await prisma.rubricCriterionMastery.findMany({
      where: {
        enrollmentId,
        rubricCriterionId: { in: criteria.map((c) => c.id) },
      },
    });
    const demonstratedCount = allCritMasteries.filter(
      (m) => m.status === "DEMONSTRATED" || m.status === "MASTERED" || m.bestScore >= 0.7
    ).length;

    return {
      conceptPMastery: newP,
      conceptState: newState,
      demonstratedCriteriaCount: demonstratedCount,
      totalCriteriaCount: criteria.length,
      newlyDemonstratedStatements,
    };
  }

  private static isKeywordStuffing(text: string): boolean {
    const words = text.toLowerCase().split(/\s+/).filter(Boolean);
    if (words.length < 6) return false;
    const unique = new Set(words);
    return unique.size / words.length < 0.35;
  }

  private static parseExpectedConcepts(
    jsonStr: string | null | undefined,
    statement: string
  ): string[] {
    if (jsonStr) {
      try {
        const parsed = JSON.parse(jsonStr);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return statement
      .toLowerCase()
      .replace(/[^a-z0-9_\s-]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 4);
  }

  private static parseMisconceptions(
    jsonStr: string | null | undefined
  ): Array<{ tag: string; pattern: string; explanation: string }> {
    if (!jsonStr) return [];
    try {
      const parsed = JSON.parse(jsonStr);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
}
