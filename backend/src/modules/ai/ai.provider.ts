import { z } from "zod";
import { config, normalizeGeminiModel as configNormalizeGeminiModel } from "../../config/index.js";
import { RubricEvaluatorService, type RubricCriterionInput } from "./rubric.evaluator.js";

const VALID_GEMINI_MODELS = new Set([
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash",
]);

export function normalizeGeminiModel(
  rawModel: string | undefined,
  fallback = "gemini-2.5-flash"
): string {
  if (typeof configNormalizeGeminiModel === "function" && rawModel) {
    const res = configNormalizeGeminiModel(rawModel);
    if (VALID_GEMINI_MODELS.has(res)) return res;
  }
  if (!rawModel) return fallback;
  const trimmed = rawModel.trim();
  if (VALID_GEMINI_MODELS.has(trimmed)) return trimmed;
  if (trimmed.includes("lite")) return "gemini-2.5-flash-lite";
  if (trimmed.includes("pro")) return "gemini-2.5-pro";
  return fallback;
}

export class AIProviderError extends Error {
  public readonly statusCode: number;
  constructor(message: string, statusCode = 503) {
    super(message);
    this.name = "AIProviderError";
    this.statusCode = statusCode;
  }
}

export const RubricEvaluationOutputSchema = z.object({
  evaluations: z.array(
    z.object({
      criterionId: z.string(),
      isDemonstrated: z.boolean(),
      confidence: z.number().min(0).max(1),
      evidenceQuote: z.string(),
      reasoning: z.string(),
    })
  ),
  overallScore: z.number().min(0).max(1),
  overallPassed: z.boolean(),
  summaryFeedback: z.string(),
  modelUsed: z.string(),
  promptVersion: z.string(),
});

const NEGATION_PATTERNS = [
  /\bvariables?\s+are\s+not\s+(references?|pointers?|bound)\b/i,
  /\bnever\s+(binds?|references?|mutates?|yields?)\b/i,
  /\blists?\s+are\s+immutable\b/i,
  /\btuples?\s+are\s+mutable\b/i,
  /\bgenerators?\s+eagerly\s+evaluate\b/i,
  /\bnot\s+stored\s+in\s+heap\b/i,
];

export function hasNegationOrConfusion(text: string): boolean {
  return NEGATION_PATTERNS.some((re) => re.test(text));
}

export function isKeywordStuffing(text: string): boolean {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  if (words.length < 6) return true;
  const uniqueRatio = new Set(words).size / words.length;
  return uniqueRatio < 0.42;
}

export interface ProgressionTransitionNotice {
  type: "SECTION_ADVANCED" | "CHECKPOINT_UNLOCKED" | "PRACTICAL_UNLOCKED" | "CHAPTER_COMPLETED";
  fromSectionTitle?: string;
  toSectionTitle?: string;
  toSectionObjective?: string;
  message: string;
}

export interface TutorStreamContext {
  courseTitle: string;
  moduleTitle?: string;
  moduleOrder?: number;
  chapterTitle: string;
  sectionTitle?: string;
  sectionType?: string;
  sectionObjective?: string;
  sectionOrder?: number;
  totalSections?: number;
  conceptName?: string;
  concepts?: Array<{ id: string; slug: string; name: string; description: string }>;
  teachingContent?: string;
  ragContextChunks?: string[];
  currentMastery?: number;
  tier?: string;
  turnNumber?: number;
  lastTutorQuestion?: string | null;
  previousTutorQuestions?: string[];
  targetCriterion?: {
    code: string | null;
    statement: string;
    cognitiveLevel: string;
  } | null;
  justDemonstratedCriteria?: string[];
  unmetCriteria?: string[];
  demonstratedCriteria?: string[];
  knownMisconceptions?: string[];
  detectedMisconception?: string | null;
  progressionTransition?: ProgressionTransitionNotice | null;
  guardrailDirective?: string;
  driftWarning?: {
    driftType: string;
    targetModuleTitle?: string | null;
    message: string;
  } | null;
  userMessage?: string;
  learnerMessage?: string;
  history: Array<{ role: "user" | "assistant"; content: string }>;
}

/**
 * Extracts questions already asked by the assistant in recent turns
 * so the Pedagogical Director never repeats the same question.
 */
export function extractPreviousTutorQuestions(
  history: Array<{ role: "user" | "assistant"; content: string }>
): string[] {
  const assistantTurns = (history || []).filter((m) => m.role === "assistant").slice(-6);
  const questions: string[] = [];

  for (const turn of assistantTurns) {
    const matches = (turn.content || "").match(/[^.!?\n]{12,}\?/g);
    if (matches) {
      for (const q of matches) {
        const cleaned = q.replace(/^\s*[-*>\d.]+\s*/, "").trim();
        if (cleaned.length >= 15 && !questions.includes(cleaned)) {
          questions.push(cleaned);
        }
      }
    }
  }
  return questions.slice(-6);
}

interface ParsedCurriculumBlock {
  headingNumber: number | null;
  headingTitle: string;
  prose: string;
  codeBlock: string | null;
  socraticGuidance: string | null;
}

function parseCurriculumBlocks(
  teachingContent: string,
  ragContextChunks: string[]
): ParsedCurriculumBlock[] {
  const combinedSources = [teachingContent, ...(ragContextChunks || [])]
    .filter(Boolean)
    .join("\n\n");
  const rawSections = combinedSources.split(/\n(?=##\s+)/g);
  const blocks: ParsedCurriculumBlock[] = [];
  const seenTitles = new Set<string>();

  for (const raw of rawSections) {
    const trimmed = raw.trim();
    if (!trimmed || trimmed.startsWith("## Lesson Metadata") || trimmed.startsWith("# ")) continue;

    const lines = trimmed.split("\n");
    const headerLine = lines[0].replace(/^##\s+/, "").trim();
    if (!headerLine || seenTitles.has(headerLine.toLowerCase())) continue;
    seenTitles.add(headerLine.toLowerCase());

    const numMatch = headerLine.match(/^(\d+)\.\s*(.+)$/);
    const headingNumber = numMatch ? parseInt(numMatch[1], 10) : null;
    const headingTitle = numMatch ? numMatch[2].trim() : headerLine;

    const bodyText = lines.slice(1).join("\n").trim();
    const codeMatch = bodyText.match(/```(?:python)?\n([\s\S]*?)```/);
    const codeBlock = codeMatch ? codeMatch[1].trim() : null;

    const guidanceMatch = bodyText.match(/Tutor Socratic Guidance:\*?\s*(.+)$/im);
    const socraticGuidance = guidanceMatch ? guidanceMatch[1].replace(/^Ask:\s*/i, "").trim() : null;

    const prose = bodyText
      .replace(/```[\s\S]*?```/g, "")
      .replace(/-\s*\*\*Tutor Socratic Guidance:\*\*.*$/gim, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    if (prose.length > 20 || codeBlock) {
      blocks.push({
        headingNumber,
        headingTitle,
        prose,
        codeBlock,
        socraticGuidance,
      });
    }
  }

  return blocks;
}

/**
 * Stateful Pedagogical Response & Progression Director System Prompt
 */
export function buildSocraticSystemPrompt(context: TutorStreamContext): string {
  const conceptName =
    context.conceptName ||
    context.concepts?.map((c) => c.name).join(", ") ||
    context.chapterTitle;

  const previousQuestions =
    context.previousTutorQuestions && context.previousTutorQuestions.length > 0
      ? context.previousTutorQuestions
      : extractPreviousTutorQuestions(context.history || []);

  const ragChunks = context.ragContextChunks || [];
  const ragBlock =
    ragChunks.length > 0
      ? ragChunks
          .map((chunk, idx) => `[Curriculum Source #${idx + 1}]:\n${chunk}`)
          .join("\n\n")
      : "Use the Active Section Teaching Notes below.";

  const unmetList =
    context.unmetCriteria && context.unmetCriteria.length > 0
      ? context.unmetCriteria.map((c, i) => `  ${i + 1}. ${c}`).join("\n")
      : "  - All primary criteria demonstrated! Verify edge-case mastery or guide learner to the Chapter Checkpoint.";

  const demonstratedList =
    context.demonstratedCriteria && context.demonstratedCriteria.length > 0
      ? context.demonstratedCriteria.map((c) => `  - [DEMONSTRATED] ${c}`).join("\n")
      : "  - None demonstrated yet in this chapter.";

  const justDemonstratedBanner =
    context.justDemonstratedCriteria && context.justDemonstratedCriteria.length > 0
      ? `\nLEARNER JUST DEMONSTRATED ON THIS TURN:\n${context.justDemonstratedCriteria
          .map((c) => `  - ✅ ${c}`)
          .join("\n")}\nExplicitly acknowledge and validate this achievement in your opening sentence!`
      : "";

  const targetCriterionDirective = context.targetCriterion
    ? `\nPRIMARY TARGET RUBRIC CRITERION FOR THIS TURN:\n- [${context.targetCriterion.code || "RUBRIC"} | Cognitive Level: ${context.targetCriterion.cognitiveLevel}]: "${context.targetCriterion.statement}"\nYour Socratic follow-up probe at the end of this message MUST directly test or scaffold this criterion.`
    : "";

  const transitionDirective = context.progressionTransition
    ? `\nCRITICAL PROGRESSION TRANSITION JUST OCCURRED ON THIS TURN (${context.progressionTransition.type}):
- ${context.progressionTransition.message}
${
  context.progressionTransition.toSectionTitle
    ? `- Newly Active Section: "${context.progressionTransition.toSectionTitle}" (Objective: ${context.progressionTransition.toSectionObjective})`
    : ""
}
- You MUST explicitly congratulate the learner on completing the previous step, announce this transition clearly, and ${
        context.progressionTransition.type === "CHECKPOINT_UNLOCKED"
          ? 'invite them to click the **"Take Chapter Checkpoint"** button in the studio bar above to unlock the next chapter (or answer any final review question they have).'
          : "introduce the new section with a concrete example and an opening Socratic question for the new section!"
      }`
    : "";

  const misconceptionText =
    context.detectedMisconception ||
    (context.knownMisconceptions && context.knownMisconceptions.length > 0
      ? context.knownMisconceptions.join("; ")
      : null);

  const misconceptionDirective = misconceptionText
    ? `\nMISCONCEPTION TO ADDRESS GENTLY:\n- "${misconceptionText}"\n- Gently pinpoint why this assumption breaks in Python, show a 3-line counter-example proving what actually happens at runtime, and ask them to predict the output.`
    : "";

  const driftDirective = context.driftWarning
    ? `\nCURRICULUM BOUNDARY REDIRECT (${context.driftWarning.driftType}):\n- ${context.driftWarning.message}\n- Give a 1-sentence high-level acknowledgment, explain that it is unlocked in ${
        context.driftWarning.targetModuleTitle || "a subsequent module"
      }, and pivot back to "${context.sectionTitle || context.chapterTitle}".`
    : context.guardrailDirective
    ? `\nCRITICAL GUARDRAIL OVERRIDE:\n${context.guardrailDirective}`
    : "";

  const antiRepetitionBlock =
    previousQuestions.length > 0
      ? `\nANTI-REPETITION MEMORY (STRICTLY FORBIDDEN TO REPEAT THESE QUESTIONS):
You have ALREADY asked the learner these questions in recent turns:
${previousQuestions.map((q, i) => `  ${i + 1}. "${q}"`).join("\n")}
DO NOT ask any of these questions again, and DO NOT repeat the same introductory overview. Move the dialogue forward!`
      : "";

  const masteryPct = ((context.currentMastery ?? 0.25) * 100).toFixed(1);

  return `You are the CERTIFY Socratic AI Engineering Tutor and Pedagogical Director for "${context.courseTitle}".

ACTIVE CURRICULUM POSITION:
- Module ${context.moduleOrder ?? 1}: ${context.moduleTitle || "Core Module"}
- Chapter: ${context.chapterTitle}
- Active Section (${context.sectionOrder ?? 1} of ${context.totalSections ?? 4}): ${context.sectionTitle || "1. Core Intuition & Mental Model"} (${context.sectionType || "CONCEPT_INTUITION"})
- Section Objective: ${context.sectionObjective || "Build first-principles conceptual mastery."}
- Target Concept: ${conceptName}
- Learner BKT Mastery Probability: ${masteryPct}% (Tier: ${context.tier || "EASY"})
- Most Recent Tutor Question Learner Is Responding To: ${context.lastTutorQuestion ? `"${context.lastTutorQuestion}"` : "None (Initial / Open Query)"}

RUBRIC MASTERY LEDGER FOR THIS CONCEPT:
Demonstrated Criteria:
${demonstratedList}
Remaining Unmet Criteria:
${unmetList}
${justDemonstratedBanner}${targetCriterionDirective}${transitionDirective}${misconceptionDirective}${driftDirective}${antiRepetitionBlock}

MANDATORY 3-PART RESPONSE STRUCTURE (FOLLOW EVERY TURN):
1. **Direct Validation or Clear Explanation (No Vague Meta-Intros)**:
   - NEVER start with robotic filler like "Let's examine your question in the context of..." or repeat the chapter title twice.
   - If the learner answered your previous question, state clearly whether their answer is right, partially right, or hits a misconception, and explain the exact "why" in 2–3 crisp sentences.
   - If the learner asked a direct question (e.g., "what is mutability?", "explain python", "how does a loop work?"), answer it directly and clearly from first principles using the Active Section Teaching Notes & Retrieved Curriculum Chunks below.
   - If the learner says "I don't know" or "not sure", immediately provide a concrete 2–4 line Python example explaining the concept directly (never use cooking or recipe analogies).
2. **Concrete Python Code & Runtime Trace**:
   - Include a concise, runnable 3–7 line \`\`\`python\`\`\` snippet from the curriculum notes below (choose a fresh example not already repeated in recent turns) and trace what happens in memory / execution step by step.
3. **Progression Callout OR Single Targeted Socratic Probe**:
   - End with ONE bolded Socratic question (**Your Turn:** ...) that specifically scaffolds the Primary Target Rubric Criterion (or announces the newly unlocked Section / Chapter Checkpoint).
   - Keep your total response focused, scannable, and under 240 words.

ACTIVE SECTION TEACHING NOTES:
${(context.teachingContent || "First-principles Python semantics.").slice(0, 2600)}

RETRIEVED SECTION-SCOPED RAG CURRICULUM CHUNKS:
${ragBlock}`;
}

/**
 * Dynamic Curriculum-Driven Pedagogical Fallback Engine
 *
 * Parses the active chapter's 20 authored markdown sections and retrieved RAG chunks,
 * rotates examples across turn numbers, checks anti-repetition history, and announces
 * live section/checkpoint progression transitions.
 */
export function generateIntelligentSocraticFallback(context: TutorStreamContext): string {
  const userText = (context.userMessage ?? context.learnerMessage ?? "").trim();
  const qLower = userText.toLowerCase();
  const concept =
    context.conceptName ||
    context.concepts?.[0]?.name ||
    context.chapterTitle;
  const sectionTitle = (context.sectionTitle || "Core Intuition").replace(/^\d+\.\s*/, "");
  const previousQuestions =
    context.previousTutorQuestions && context.previousTutorQuestions.length > 0
      ? context.previousTutorQuestions
      : extractPreviousTutorQuestions(context.history || []);

  // 1. Handle Curriculum Drift Redirect
  if (context.driftWarning) {
    return `### Curriculum Roadmap Notice\n\n${context.driftWarning.message}\n\nRight now, we are focused on **${context.chapterTitle}** — specifically **${sectionTitle}** (${context.sectionObjective || concept}).\n\n**Your Turn:** ${
      context.targetCriterion
        ? `Focusing on our current objective (${context.targetCriterion.statement}), how would you explain how Python handles this at runtime?`
        : `How would you trace the behavior of **${concept}** in a short Python snippet?`
    }`;
  }

  // 2. Parse actual authored curriculum blocks from teachingContent + ragContextChunks
  const blocks = parseCurriculumBlocks(
    context.teachingContent || "",
    context.ragContextChunks || []
  );
  const assistantTurnCount = (context.history || []).filter(
    (m) => m.role === "assistant"
  ).length;

  const queryTokens = qLower
    .replace(/[^a-z0-9_]+/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3);

  let selectedBlock: ParsedCurriculumBlock | null = null;
  let bestScore = -1;

  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    const hay = `${b.headingTitle} ${b.prose} ${b.codeBlock || ""}`.toLowerCase();
    let score = 0;
    for (const tok of queryTokens) {
      if (b.headingTitle.toLowerCase().includes(tok)) score += 4;
      else if (hay.includes(tok)) score += 1.5;
    }
    const alreadyShown = (context.history || [])
      .slice(-4)
      .some(
        (m) =>
          m.role === "assistant" &&
          ((b.codeBlock && m.content.includes(b.codeBlock.slice(0, 40))) ||
            m.content.includes(b.headingTitle))
      );
    if (alreadyShown) score -= 5;

    if (score > bestScore) {
      bestScore = score;
      selectedBlock = b;
    }
  }

  if (!selectedBlock && blocks.length > 0) {
    selectedBlock = blocks[assistantTurnCount % blocks.length];
  }

  // 3. Build Part 1: Direct Validation / Achievement / Misconception Feedback + Concept Explanation
  const parts: string[] = [];

  if (context.detectedMisconception) {
    parts.push(
      `**Let's pause and test that assumption:** ${context.detectedMisconception}\n\nIn Python, keeping track of exact runtime types, object references, and block structure prevents subtle bugs.`
    );
  } else if (context.justDemonstratedCriteria && context.justDemonstratedCriteria.length > 0) {
    parts.push(
      `✅ **Rubric Criterion Demonstrated:** You accurately addressed *${context.justDemonstratedCriteria[0]}*! Your current concept mastery is now **${Math.round(
        (context.currentMastery ?? 0.35) * 100
      )}%**.`
    );
  } else if (
    context.lastTutorQuestion &&
    userText.length >= 4 &&
    !/^(hi|hello|hey)\b/i.test(userText)
  ) {
    parts.push(
      `Good observation on **${concept}**. Let's connect what you wrote directly to how Python executes **${sectionTitle}**.`
    );
  }

  if (selectedBlock) {
    parts.push(`### ${selectedBlock.headingTitle} (${concept})\n\n${selectedBlock.prose}`);
  } else {
    parts.push(
      `### ${sectionTitle}: ${concept}\n\n${
        context.sectionObjective ||
        `In Python, ${concept} governs how the interpreter evaluates expressions, manages object state on the heap, and enforces clean execution flow.`
      }`
    );
  }

  // 4. Build Part 2: Concrete Python Code & Runtime Trace from the curriculum
  const codeBlockWithExample =
    selectedBlock?.codeBlock ||
    blocks.find(
      (b, idx) =>
        b.codeBlock && idx >= (assistantTurnCount % Math.max(1, blocks.length))
    )?.codeBlock ||
    blocks.find((b) => b.codeBlock)?.codeBlock ||
    `# Runtime trace for ${concept}\nx = [10, 20]\ny = x\nprint(id(x) == id(y))  # True: both names reference the same list object`;

  if (codeBlockWithExample) {
    parts.push(`\`\`\`python\n${codeBlockWithExample}\n\`\`\``);
  }

  // 5. Build Part 3: Progression Transition Banner OR Fresh Non-Repetitive Socratic Probe
  if (context.progressionTransition) {
    if (context.progressionTransition.type === "CHECKPOINT_UNLOCKED") {
      parts.push(
        `🎯 **Milestone Reached — Chapter Checkpoint Unlocked!**\n${context.progressionTransition.message}\n\nClick **"Take Chapter Checkpoint"** in the progression bar at the top of the studio to verify your mastery and unlock the next stage, or ask me any question you'd like to review first!`
      );
      return parts.join("\n\n");
    }

    parts.push(
      `🚀 **Section Completed! Advancing to ${
        context.progressionTransition.toSectionTitle || "Next Section"
      }**\n*Objective:* ${
        context.progressionTransition.toSectionObjective || context.sectionObjective
      }`
    );
  }

  const candidateProbes: string[] = [];

  if (selectedBlock?.socraticGuidance) {
    candidateProbes.push(
      selectedBlock.socraticGuidance.replace(/^["'*]+|["'*]+$/g, "")
    );
  }

  for (const b of blocks) {
    if (b.socraticGuidance) {
      const cleaned = b.socraticGuidance.replace(/^["'*]+|["'*]+$/g, "");
      if (!candidateProbes.includes(cleaned)) candidateProbes.push(cleaned);
    }
  }

  if (context.targetCriterion) {
    const stmt = context.targetCriterion.statement;
    candidateProbes.push(
      `To demonstrate mastery of **${
        context.targetCriterion.code || "our active criterion"
      }** (*${stmt}*), how would you explain what happens in Python step by step using the code example above?`,
      `Focusing on *${stmt}*, what outcome or error would Python produce if we violated this rule in a real script, and why?`,
      `Looking at the example above, how does it illustrate *${stmt}* at runtime?`
    );
  } else if (context.unmetCriteria && context.unmetCriteria.length > 0) {
    const stmt = context.unmetCriteria[0];
    candidateProbes.push(
      `Focusing on *${stmt}*, how would you trace what Python does at runtime in the snippet above?`,
      `What edge case or error could occur around *${stmt}*, and how does Python handle it?`
    );
  }

  candidateProbes.push(
    `Looking at the code snippet above for **${concept}**, what happens at each step when the Python interpreter executes it, and what is the final output?`,
    `What is the single most common bug beginners run into with **${concept}**, and how would you prevent it in production code?`,
    `If a teammate asked you to summarize the core rule of **${sectionTitle}** in two sentences with an example, how would you state it?`
  );

  const chosenProbe =
    candidateProbes.find(
      (p) =>
        !previousQuestions.some((prev) =>
          prev.toLowerCase().includes(p.slice(0, 28).toLowerCase())
        )
    ) || candidateProbes[assistantTurnCount % candidateProbes.length];

  parts.push(`**Your Turn:** ${chosenProbe}`);

  return parts.join("\n\n");
}

export class AIProvider {
  public static isRealProviderConfigured(): boolean {
    if (Boolean((config as any).groqApiKey)) return true;
    if (
      config.aiProvider === "anthropic" &&
      Boolean(config.anthropicApiKey) &&
      config.anthropicApiKey !== "mock-or-dev-key"
    )
      return true;
    if (config.aiProvider === "openai" && Boolean(config.openaiApiKey)) return true;
    if (config.aiProvider === "gemini" && Boolean(config.geminiApiKey)) return true;
    if (config.geminiAutoFallback && Boolean(config.geminiApiKey)) return true;
    return false;
  }

  public static assertConfiguredOrFallbackAllowed(): void {
    if (!this.isRealProviderConfigured()) {
      if (config.nodeEnv === "production" || !config.allowDevAiFallback) {
        throw new AIProviderError(
          "AI provider is not configured. External provider key required in production.",
          503
        );
      }
    }
  }

  public static async streamGeminiReply(
    context: TutorStreamContext,
    onChunk: (chunk: string) => Promise<any> | any,
    signal?: AbortSignal
  ): Promise<{
    fullText: string;
    modelUsed: string;
    model: string;
    promptVersion: string;
    provider: string;
  }> {
    const systemPrompt = buildSocraticSystemPrompt(context);
    const userMessage = context.userMessage ?? context.learnerMessage ?? "";

    const contents = [
      ...(context.history || []).slice(-12).map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
      { role: "user", parts: [{ text: userMessage }] },
    ];

    const primaryModel = normalizeGeminiModel(
      config.geminiTutorModel || (config as any).geminiModel
    );
    const candidateModels = Array.from(
      new Set([primaryModel, "gemini-2.5-flash", "gemini-2.0-flash"])
    );

    let lastError: any = null;

    for (const model of candidateModels) {
      if (signal?.aborted) break;
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${config.geminiApiKey}&alt=sse`;

      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: systemPrompt }],
            },
            contents,
            generationConfig: {
              maxOutputTokens: 1200,
              temperature: 0.35,
            },
          }),
          signal,
        });

        if (!res.ok) {
          const errText = await res.text().catch(() => "");
          if (res.status === 503 || res.status === 429) {
            await new Promise((r) => setTimeout(r, 300));
            continue;
          }
          throw new AIProviderError(
            `Gemini API error (${model}): HTTP ${res.status} - ${errText}`,
            502
          );
        }

        const reader = res.body?.getReader();
        if (!reader) throw new AIProviderError("Gemini stream body unavailable", 502);
        const decoder = new TextDecoder();
        let fullText = "";
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const dataStr = trimmed.slice(5).trim();
            if (!dataStr || dataStr === "[DONE]") continue;
            try {
              const eventObj = JSON.parse(dataStr);
              const candidateText =
                eventObj.candidates?.[0]?.content?.parts?.[0]?.text;
              if (candidateText) {
                fullText += candidateText;
                await onChunk(candidateText);
              }
            } catch {
              // skip partial SSE line
            }
          }
        }

        if (fullText.trim().length > 0) {
          return {
            fullText,
            modelUsed: model,
            model,
            promptVersion: config.promptVersion || "2026.2",
            provider: "gemini",
          };
        }
      } catch (err: any) {
        if (err.name === "AbortError") throw err;
        lastError = err;
      }
    }

    throw (
      lastError ||
      new AIProviderError("All Gemini tutor models exhausted or unavailable", 503)
    );
  }

  public static async streamGroqReply(
    context: TutorStreamContext,
    onChunk: (chunk: string) => Promise<any> | any,
    signal?: AbortSignal
  ): Promise<{
    fullText: string;
    modelUsed: string;
    model: string;
    promptVersion: string;
    provider: string;
  }> {
    const systemPrompt = buildSocraticSystemPrompt(context);
    const userMessage = context.userMessage ?? context.learnerMessage ?? "";

    const messages = [
      { role: "system", content: systemPrompt },
      ...(context.history || []).slice(-12).map((m) => ({
        role: m.role,
        content: m.content,
      })),
      { role: "user", content: userMessage },
    ];

    const apiKey = (config as any).groqApiKey;
    if (!apiKey) {
      throw new AIProviderError("GROQ_API_KEY is not configured", 503);
    }

    const configuredModel =
      config.groqTutorModel || (config as any).groqModel || "llama-3.3-70b-versatile";
    const candidateModels = Array.from(
      new Set([configuredModel, "llama-3.3-70b-versatile", "llama-3.1-8b-instant"])
    );

    let lastError: any = null;

    for (const model of candidateModels) {
      if (signal?.aborted) break;
      const isReasoningModel =
        model.includes("r1") || model.includes("reasoning");
      const max_tokens = isReasoningModel ? 2048 : 1024;
      const requestBody: any = {
        model,
        messages,
        temperature: 0.35,
        max_tokens,
        stream: true,
      };
      if (isReasoningModel) {
        requestBody.reasoning_effort = "low";
      }

      try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(requestBody),
          signal,
        });

        if (!res.ok) {
          const errText = await res.text().catch(() => "");
          if (res.status === 503 || res.status === 429) {
            await new Promise((r) => setTimeout(r, 300));
            continue;
          }
          throw new AIProviderError(
            `Groq API error (${model}): HTTP ${res.status} - ${errText}`,
            502
          );
        }

        const reader = res.body?.getReader();
        if (!reader) throw new AIProviderError("Groq stream body unavailable", 502);
        const decoder = new TextDecoder();
        let fullText = "";
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const dataStr = trimmed.slice(5).trim();
            if (!dataStr || dataStr === "[DONE]") continue;
            try {
              const eventObj = JSON.parse(dataStr);
              const delta = eventObj.choices?.[0]?.delta?.content;
              if (delta) {
                fullText += delta;
                await onChunk(delta);
              }
            } catch {
              // skip
            }
          }
        }

        if (fullText.trim().length > 0) {
          return {
            fullText,
            modelUsed: model,
            model,
            promptVersion: config.promptVersion || "2026.2",
            provider: "groq",
          };
        }
      } catch (err: any) {
        if (err.name === "AbortError") throw err;
        lastError = err;
      }
    }

    throw lastError || new AIProviderError("All Groq candidate models exhausted", 503);
  }

  public static async streamTutorReply(
    context: TutorStreamContext,
    onChunk: (chunk: string) => Promise<any> | any,
    signal?: AbortSignal
  ): Promise<{
    fullText: string;
    modelUsed: string;
    model: string;
    promptVersion: string;
    provider: string;
  }> {
    this.assertConfiguredOrFallbackAllowed();

    // 1. Anthropic Primary with Auto-Fallback to Gemini (verified by ai.fallback.test.ts)
    if (config.aiProvider === "anthropic" && config.anthropicApiKey) {
      try {
        const systemPrompt = buildSocraticSystemPrompt(context);
        const userMessage = context.userMessage ?? context.learnerMessage ?? "";
        const messages = [
          ...(context.history || []).slice(-8).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          { role: "user" as const, content: userMessage },
        ];

        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": config.anthropicApiKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: config.anthropicTutorModel,
            max_tokens: 800,
            system: systemPrompt,
            messages,
            stream: true,
          }),
          signal,
        });

        if (res.status === 429 || res.status === 529 || res.status === 402) {
          if (config.geminiAutoFallback && config.geminiApiKey) {
            const gemRes = await this.streamGeminiReply(context, onChunk, signal);
            return { ...gemRes, model: gemRes.modelUsed };
          }
        }

        if (!res.ok) {
          if (config.geminiAutoFallback && config.geminiApiKey) {
            const gemRes = await this.streamGeminiReply(context, onChunk, signal);
            return { ...gemRes, model: gemRes.modelUsed };
          }
          throw new AIProviderError(`Anthropic HTTP ${res.status}`, 502);
        }
      } catch (err: any) {
        if (err.name === "AbortError") throw err;
        if (config.geminiAutoFallback && config.geminiApiKey) {
          try {
            const gemRes = await this.streamGeminiReply(context, onChunk, signal);
            return { ...gemRes, model: gemRes.modelUsed };
          } catch {}
        }
      }
    }

    // 2. Gemini Primary
    if (config.aiProvider === "gemini" && config.geminiApiKey) {
      try {
        const gemRes = await this.streamGeminiReply(context, onChunk, signal);
        return { ...gemRes, model: gemRes.modelUsed };
      } catch (geminiErr: any) {
        if (geminiErr.name === "AbortError") throw geminiErr;
        if (Boolean((config as any).groqApiKey)) {
          try {
            const groqRes = await this.streamGroqReply(context, onChunk, signal);
            return { ...groqRes, model: groqRes.modelUsed };
          } catch {}
        }
      }
    }

    // 3. Groq Primary
    if (config.aiProvider === "groq" && Boolean((config as any).groqApiKey)) {
      try {
        const groqRes = await this.streamGroqReply(context, onChunk, signal);
        return { ...groqRes, model: groqRes.modelUsed };
      } catch (groqErr: any) {
        if (groqErr.name === "AbortError") throw groqErr;
        if (config.geminiApiKey) {
          try {
            const gemRes = await this.streamGeminiReply(context, onChunk, signal);
            return { ...gemRes, model: gemRes.modelUsed };
          } catch {}
        }
      }
    }

    // 4. Secondary cross-provider attempts
    if (config.geminiApiKey) {
      try {
        const gemRes = await this.streamGeminiReply(context, onChunk, signal);
        return { ...gemRes, model: gemRes.modelUsed };
      } catch (e: any) {
        if (e.name === "AbortError") throw e;
      }
    }

    if (Boolean((config as any).groqApiKey)) {
      try {
        const groqRes = await this.streamGroqReply(context, onChunk, signal);
        return { ...groqRes, model: groqRes.modelUsed };
      } catch (e: any) {
        if (e.name === "AbortError") throw e;
      }
    }

    // 5. Dynamic Curriculum-Driven Pedagogical Fallback Engine
    const simulated = generateIntelligentSocraticFallback(context);
    const words = simulated.split(/(?=[ \n])/);
    let accumulated = "";
    for (const word of words) {
      if (signal?.aborted) break;
      accumulated += word;
      await onChunk(word);
    }

    return {
      fullText: accumulated,
      modelUsed: "socratic-curriculum-engine-v3",
      model: "socratic-curriculum-engine-v3",
      promptVersion: config.promptVersion || "2026.2",
      provider: "curriculum-director-fallback",
    };
  }

  public static async evaluateVivaTurn(params: {
    turnNumber: number;
    studentAnswer: string;
    courseTitle?: string;
    questionPrompt?: string;
  }): Promise<{
    isDemonstrated: boolean;
    turnScore: number;
    feedback: string;
    followUpQuestion: string;
    modelUsed: string;
  }> {
    const res = await this.evaluateVivaDefense({
      turnNumber: params.turnNumber,
      studentAnswer: params.studentAnswer,
      questionPrompt: params.questionPrompt,
    });
    return {
      isDemonstrated: res.isDemonstrated,
      turnScore: res.turnScore,
      feedback: res.feedback,
      followUpQuestion:
        res.followUpQuestion ||
        "Oral Viva Defense Complete. Your 3-turn defense has been recorded and evaluated for your final composite credential.",
      modelUsed: res.modelUsed,
    };
  }

  public static async evaluateVivaDefense(params: {
    turnNumber: number;
    studentAnswer: string;
    questionPrompt?: string;
  }): Promise<{
    isDemonstrated: boolean;
    turnScore: number;
    feedback: string;
    followUpQuestion: string | null;
    modelUsed: string;
  }> {
    const text = (params.studentAnswer || "").trim();

    const turnRubricConfigs: Record<
      number,
      {
        conceptName: string;
        questionPrompt: string;
        criteria: RubricCriterionInput[];
      }
    > = {
      1: {
        conceptName: "Execution Model, Object References & Mutability",
        questionPrompt:
          params.questionPrompt ||
          "Explain how Python binds variable names to heap objects and how mutable vs. immutable objects behave under aliasing and function argument passing.",
        criteria: [
          {
            id: "viva-t1-c1",
            criterionCode: "VIVA-T1-C1",
            criterionStatement:
              "Explains that Python variables bind names to heap object references (pointers/id) rather than raw value boxes.",
            weight: 0.5,
            tierRequired: "MEDIUM",
            cognitiveLevel: "EXPLAIN",
            passingThreshold: 0.7,
            expectedConceptsJson: JSON.stringify([
              "reference",
              "heap",
              "object",
              "bind",
              "id",
              "memory",
              "pointer",
            ]),
            misconceptionsJson: JSON.stringify([
              {
                tag: "variables_are_raw_boxes",
                pattern:
                  "\\bvariables?\\s+are\\s+not\\s+(references?|pointers?|bound)\\b",
                explanation:
                  "Variables in Python are references bound to objects on the heap.",
              },
            ]),
          },
          {
            id: "viva-t1-c2",
            criterionCode: "VIVA-T1-C2",
            criterionStatement:
              "Distinguishes mutable collections (list, dict, set) mutated in-place from immutable objects (int, str, tuple).",
            weight: 0.5,
            tierRequired: "MEDIUM",
            cognitiveLevel: "REASON",
            passingThreshold: 0.7,
            expectedConceptsJson: JSON.stringify([
              "mutable",
              "immutable",
              "list",
              "dict",
              "tuple",
              "alias",
              "in-place",
            ]),
            misconceptionsJson: JSON.stringify([
              {
                tag: "lists_immutable",
                pattern: "\\blists?\\s+(are|is)\\s+immutable\\b",
                explanation: "Lists in Python are mutable.",
              },
            ]),
          },
        ],
      },
      2: {
        conceptName: "Side-Effect Isolation, LEGB Scope & Exception Resilience",
        questionPrompt:
          params.questionPrompt ||
          "How would your implementation behave if a caller mutated one of the input dictionary's score lists concurrently, and how do you isolate side effects and handle invalid data safely?",
        criteria: [
          {
            id: "viva-t2-c1",
            criterionCode: "VIVA-T2-C1",
            criterionStatement:
              "Explains defensive copying (shallow vs deep copy) or pure functions to prevent caller mutation side effects.",
            weight: 0.5,
            tierRequired: "HARD",
            cognitiveLevel: "DEBUG",
            passingThreshold: 0.7,
            expectedConceptsJson: JSON.stringify([
              "copy",
              "deepcopy",
              "mutate",
              "side",
              "pure",
              "reference",
              "alias",
              "new",
            ]),
            misconceptionsJson: JSON.stringify([]),
          },
          {
            id: "viva-t2-c2",
            criterionCode: "VIVA-T2-C2",
            criterionStatement:
              "Applies specific exception handling (try/except ValueError/TypeError) or scope isolation.",
            weight: 0.5,
            tierRequired: "HARD",
            cognitiveLevel: "APPLY",
            passingThreshold: 0.7,
            expectedConceptsJson: JSON.stringify([
              "try",
              "except",
              "exception",
              "valueerror",
              "typeerror",
              "scope",
              "validate",
            ]),
            misconceptionsJson: JSON.stringify([]),
          },
        ],
      },
      3: {
        conceptName: "Lazy Evaluation, Generators & O(1) Memory Streaming",
        questionPrompt:
          params.questionPrompt ||
          "If the input dataset scaled to 50 million records, how would you refactor your solution using Python generators (yield) to keep memory complexity at O(1)?",
        criteria: [
          {
            id: "viva-t3-c1",
            criterionCode: "VIVA-T3-C1",
            criterionStatement:
              "Explains how yield suspends generator frame state and produces items lazily on demand via the iterator protocol.",
            weight: 0.5,
            tierRequired: "HARD",
            cognitiveLevel: "EXPLAIN",
            passingThreshold: 0.7,
            expectedConceptsJson: JSON.stringify([
              "yield",
              "generator",
              "lazy",
              "iterator",
              "next",
              "suspend",
              "state",
            ]),
            misconceptionsJson: JSON.stringify([
              {
                tag: "generators_eager",
                pattern: "\\bgenerators?\\s+eagerly\\s+evaluate\\b",
                explanation: "Generators evaluate lazily one item at a time.",
              },
            ]),
          },
          {
            id: "viva-t3-c2",
            criterionCode: "VIVA-T3-C2",
            criterionStatement:
              "Contrasts O(1) streaming memory footprint with O(N) eager list materialization in RAM.",
            weight: 0.5,
            tierRequired: "HARD",
            cognitiveLevel: "REASON",
            passingThreshold: 0.7,
            expectedConceptsJson: JSON.stringify([
              "memory",
              "o(1)",
              "ram",
              "list",
              "stream",
              "pipeline",
              "complexity",
            ]),
            misconceptionsJson: JSON.stringify([
              {
                tag: "generator_stores_all",
                pattern:
                  "\\bgenerators?\\s+(stores?|holds?|loads?)\\s+(all|entire|whole)\\b",
                explanation:
                  "Generators evaluate on demand and maintain O(1) memory without materializing the dataset.",
              },
            ]),
          },
        ],
      },
    };

    const nextQuestions: Record<number, string> = {
      1: "Turn 2 Defense Probe: How would your implementation behave if a caller mutated one of the input dictionary's score lists concurrently, and how would you prevent unintended side effects?",
      2: "Turn 3 Defense Probe: If the input dataset scaled to 50 million records, how would you refactor your solution using Python generators (`yield`) to keep memory complexity at O(1)?",
    };

    const turnConfig =
      turnRubricConfigs[params.turnNumber] || turnRubricConfigs[1];

    const evalResult = await RubricEvaluatorService.evaluateResponse({
      conceptName: turnConfig.conceptName,
      questionPrompt: turnConfig.questionPrompt,
      learnerText: text,
      criteria: turnConfig.criteria,
      mode: "CHECKPOINT",
    });

    const isDemonstrated = evalResult.overallPassed;
    const turnScore = evalResult.weightedScore;

    return {
      isDemonstrated,
      turnScore: Number(turnScore.toFixed(4)),
      feedback:
        evalResult.overallSummary ||
        (isDemonstrated
          ? `Turn ${params.turnNumber} defense verified with clear Python runtime reasoning.`
          : `Turn ${params.turnNumber} response lacked specific runtime trade-off analysis or contained a conceptual error.`),
      followUpQuestion:
        params.turnNumber < 3 ? nextQuestions[params.turnNumber] || null : null,
      modelUsed: evalResult.evaluatorModel || "deterministic-viva-evaluator-v2",
    };
  }

  public static async generateSocraticStream(params: {
    courseTitle?: string;
    moduleTitle?: string;
    chapterTitle?: string;
    sectionTitle?: string;
    sectionObjective?: string;
    teachingContent?: string;
    conceptName: string;
    unmetCriteria?: string[];
    knownMisconceptions?: string[];
    guardrailDirective?: string;
    history: Array<{ role: "user" | "assistant" | "system"; content: string }>;
    onChunk: (chunk: string) => Promise<any> | any;
    signal?: AbortSignal;
    ragContextChunks?: string[];
  }): Promise<{ fullText: string; modelUsed: string }> {
    const lastUserMsg =
      params.history
        .slice()
        .reverse()
        .find((m) => m.role === "user")?.content || "";
    const historyWithoutLast = params.history.filter(
      (m, i, arr) => i !== arr.length - 1 && m.role !== "system"
    );

    return this.streamTutorReply(
      {
        courseTitle: params.courseTitle || "Python Fundamentals",
        moduleTitle: params.moduleTitle,
        chapterTitle: params.chapterTitle || params.conceptName,
        sectionTitle: params.sectionTitle,
        sectionObjective: params.sectionObjective,
        teachingContent: params.teachingContent,
        conceptName: params.conceptName,
        concepts: [
          { id: "c1", slug: "c1", name: params.conceptName, description: "" },
        ],
        unmetCriteria: params.unmetCriteria,
        knownMisconceptions: params.knownMisconceptions,
        guardrailDirective: params.guardrailDirective,
        history: historyWithoutLast as any,
        learnerMessage: lastUserMsg,
        userMessage: lastUserMsg,
        ragContextChunks: params.ragContextChunks,
      },
      params.onChunk,
      params.signal
    );
  }

  public static async evaluateSocraticDemonstration(params: {
    teachingContent?: string;
    conceptName: string;
    userDialogue: string;
    rubricStatements: string[];
  }): Promise<{
    isDemonstrated: boolean;
    confidence: number;
    evidenceQuote?: string;
    reasoning?: string;
  }> {
    const text = (params.userDialogue || "").trim();
    const negated = hasNegationOrConfusion(text);
    const stuffed = isKeywordStuffing(text);

    const lower = text.toLowerCase();
    const isDemonstrated =
      text.length >= 35 &&
      !negated &&
      !stuffed &&
      (lower.includes("reference") ||
        lower.includes("pointer") ||
        lower.includes("mutable") ||
        lower.includes("immutable") ||
        lower.includes("heap") ||
        lower.includes("closure") ||
        lower.includes("scope") ||
        lower.includes("yield") ||
        lower.includes("generator"));

    return {
      isDemonstrated,
      confidence: isDemonstrated ? 0.88 : 0.4,
      evidenceQuote: isDemonstrated ? text.slice(0, 150) : undefined,
      reasoning: isDemonstrated
        ? `Dialogue demonstrated key concept semantics for ${params.conceptName}.`
        : `Dialogue lacked clear conceptual explanation.`,
    };
  }
}

export const AiProviderService = AIProvider;
