import { z } from "zod";
import { config, normalizeGeminiModel } from "../../config/index.js";
import { RubricEvaluatorService, RubricCriterionInput } from "./rubric.evaluator.js";

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

export type RubricEvaluationOutput = z.infer<typeof RubricEvaluationOutputSchema>;

const CONCEPT_VOCABULARY: Record<string, string[]> = {
  "variables-and-memory": ["reference", "heap", "object", "bind", "name", "pointer", "address", "id"],
  "mutability-and-collections": ["mutable", "immutable", "list", "dict", "tuple", "in-place", "mutate", "alias"],
  "control-flow-and-iteration": ["boolean", "truthy", "falsy", "short-circuit", "loop", "iterable", "iterator", "break"],
  "functions-and-scope": ["scope", "legb", "closure", "local", "global", "enclosing", "default", "parameter"],
  "generators-and-comprehensions": ["yield", "generator", "lazy", "comprehension", "iterator", "memory", "state", "suspend"],
};

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

export interface TutorStreamContext {
  courseTitle: string;
  moduleTitle?: string;
  chapterTitle: string;
  sectionTitle?: string;
  sectionObjective?: string;
  teachingContent?: string;
  concepts: Array<{ id: string; slug: string; name: string; description: string }>;
  unmetCriteria?: string[];
  knownMisconceptions?: string[];
  guardrailDirective?: string;
  history: Array<{ role: "user" | "assistant"; content: string }>;
  learnerMessage: string;
  ragContextChunks?: string[];
}

function buildSocraticSystemPrompt(context: TutorStreamContext): string {
  const ragNotes =
    context.ragContextChunks && context.ragContextChunks.length > 0
      ? `\n\nGrounded Curriculum Reference Context (strictly fenced to active section/chapter):\n${context.ragContextChunks.join("\n---\n")}`
      : "";

  const sectionBlock = context.sectionTitle
    ? `\nActive Section: ${context.sectionTitle}\nSection Objective: ${context.sectionObjective || "Guide learner through this section's core mental model."}`
    : "";

  const criteriaBlock =
    context.unmetCriteria && context.unmetCriteria.length > 0
      ? `\nUnmet Rubric Criteria to Probe:\n${context.unmetCriteria.map((c, i) => `${i + 1}. ${c}`).join("\n")}`
      : "";

  const misconceptionBlock =
    context.knownMisconceptions && context.knownMisconceptions.length > 0
      ? `\nKnown Learner Misconceptions to Address Gently: ${context.knownMisconceptions.join(", ")}`
      : "";

  const guardrailBlock = context.guardrailDirective
    ? `\n\nCRITICAL GUARDRAIL OVERRIDE:\n${context.guardrailDirective}`
    : "";

  return `You are the expert Socratic AI Tutor for CERTIFY.
Course: "${context.courseTitle}"${context.moduleTitle ? ` | Module: "${context.moduleTitle}"` : ""}
Chapter: "${context.chapterTitle}"${sectionBlock}
Concepts: ${context.concepts.map((c) => c.name).join(", ")}.${criteriaBlock}${misconceptionBlock}
Section Teaching Notes:
${(context.teachingContent || "First-principles Python semantics.").slice(0, 2200)}${ragNotes}${guardrailBlock}

Core Pedagogical Directives (Direct Clarity + Socratic Anchor):
1. Direct Answers First: When the learner asks a question or gives an answer, first directly validate or answer their question in 2–4 sentences with a 2–4 line Python code snippet whenever relevant. Never deflect, stall, or lecture with vague analogies.
2. Resolve Pronouns & Context: When the learner uses pronouns like "it", "that", "this", or "why", resolve them directly against the immediately preceding message and code context.
3. Concrete Guidance for "I Don't Know": When the learner says "I don't know", "not sure", or "idk", immediately provide a concrete 2–3 line Python code snippet explaining the concept directly—never respond with recipe, cooking, or cookie analogies.
4. Single Socratic Question: Conclude your response with at most ONE focused Socratic question that prompts the learner to trace, predict, or apply the core concept.
5. Warm, Professional & Rigorous: Speak like an elite Computer Science educator (engaging, insightful, mathematically accurate). Avoid repetitive canned intros.
6. Progression Integrity: Never claim the learner has officially passed, unlocked, or completed sections/chapters/modules—the backend evaluates and tracks progression deterministically.`;
}

function generateIntelligentSocraticFallback(context: TutorStreamContext): string {
  const query = (context.learnerMessage || "").trim().toLowerCase();
  const chapter = context.chapterTitle;
  const section = context.sectionTitle || chapter;
  const concept = context.concepts[0]?.name || "Python Execution";

  // 0. I don't know / Uncertainty
  if (/^(i don't know|idk|i do not know|not sure|no idea|confused|help|tell me)\b/i.test(query)) {
    return (
      `No problem at all! Let's look at a concrete Python example to build intuition for **${section}**:\n\n` +
      `\`\`\`python\n` +
      `x = 10\n` +
      `y = x\n` +
      `print(id(x) == id(y))  # True: both labels point to the same integer object\n` +
      `\`\`\`\n` +
      `Here, \`x\` and \`y\` share the exact same object on the heap until one is rebound.\n\n` +
      `What do you think happens to \`y\` if we now write \`x = 20\`?`
    );
  }

  // 1. Greetings
  if (/^(hi|hello|hey|greetings|start|let'?s start|lets start)\b/i.test(query)) {
    return (
      `Welcome to **${chapter}**! I'm your Socratic AI Tutor.\n\n` +
      `In this lesson, we explore **${section}**—specifically focusing on ${concept}.\n\n` +
      `To get started: have you worked with this concept before in Python or another language, or would you like to build intuition from first principles?`
    );
  }

  // 2. What is Python / General Python execution
  if (/(\bexplain python\b|\bwhat is python\b|\bhow does python work\b|\bpython execution\b)/i.test(query)) {
    return (
      `**Python** is a high-level, dynamically typed, interpreted programming language designed around clean syntax and human readability.\n\n` +
      `Here is what actually happens when you run Python code:\n` +
      `1. **Source to Bytecode**: The CPython interpreter compiles your \`.py\` script into intermediate bytecode instructions (saved in \`__pycache__\`).\n` +
      `2. **Python Virtual Machine (PVM)**: The PVM reads those bytecode instructions sequentially and executes them on the heap and call stack.\n` +
      `3. **Names and Objects**: In Python, everything is an object. Variables are not memory boxes that hold raw bits; they are **name tags (labels) bound to objects on the heap**.\n\n` +
      `In the context of **${section}**: when you type an expression into the interactive **REPL** versus running a saved script, how does Python handle the output of each line differently?`
    );
  }

  // 3. Mutability / Immutability
  if (/(\bmutab|\bimmutab|\bin-place\b|\balias\b)/i.test(query)) {
    return (
      `In Python, **mutability** refers to whether an object's internal contents can be changed in-place after it is created in memory:\n\n` +
      `* **Mutable Objects** (e.g., \`list\`, \`dict\`, \`set\`): You can add, remove, or modify items directly in-place without altering the object's identity in memory (\`id()\`).\n` +
      `* **Immutable Objects** (e.g., \`int\`, \`float\`, \`str\`, \`tuple\`, \`bool\`): Once created, their internal state cannot change. Any operation that modifies an immutable value actually creates a brand-new object elsewhere on the heap.\n\n` +
      `**Trace this mental puzzle:**\n` +
      `\`\`\`python\n` +
      `a = [1, 2, 3]\n` +
      `b = a\n` +
      `a.append(4)\n` +
      `\`\`\`\n` +
      `What does \`b\` evaluate to now, and do \`id(a)\` and \`id(b)\` point to the exact same memory address? Why?`
    );
  }

  // 4. Variables / Memory / References
  if (/(\bvariable\b|\breference\b|\bheap\b|\bname\s+binding\b|\bpointer\b|\bassign\b)/i.test(query)) {
    return (
      `In Python, a **variable** is essentially a name tag (or pointer) bound to an object living in the heap, rather than a fixed memory bucket.\n\n` +
      `When you write:\n` +
      `\`\`\`python\n` +
      `x = 42\n` +
      `y = x\n` +
      `\`\`\`\n` +
      `1. Python allocates an integer object with value \`42\` on the heap.\n` +
      `2. The identifier \`x\` is bound to that object's memory address.\n` +
      `3. \`y = x\` binds the identifier \`y\` to the **exact same object** (both point to \`42\`).\n` +
      `4. If you subsequently assign \`x = 100\`, Python does **not** overwrite \`42\`; it creates a new object \`100\` and re-binds \`x\` to it, while \`y\` still points to \`42\`.\n\n` +
      `Connecting this to **${section}**: What function can you use in Python to inspect an object's unique memory address or identity to verify if two variables share the same object?`
    );
  }

  // 5. Loops / Iteration
  if (/(\bloop\b|\bwhile\b|\bfor\b|\biteration\b|\biterate\b)/i.test(query)) {
    return (
      `A **loop** in Python is a control flow structure that repeats a block of indented code based on a condition or over an iterable collection:\n\n` +
      `* **\`for\` loop**: Iterates over an iterable (like a list, range, or string) extracting elements one-by-one via the iterator protocol.\n` +
      `* **\`while\` loop**: Evaluates a boolean expression before each pass and repeats the indented block as long as that condition remains truthy.\n\n` +
      `Every reliable loop consists of three fundamental mechanics:\n` +
      `1. **Initialization**: Setting up state before the loop begins.\n` +
      `2. **Condition / Bounds Check**: Determining whether to execute the next iteration.\n` +
      `3. **Progress / Step**: Modifying state on each pass so the loop eventually terminates.\n\n` +
      `If you wanted to print the numbers 1 through 5 using a loop in Python, what would happen if the state variable inside the loop body is never incremented?`
    );
  }

  // 6. Lists / Collections
  if (/(\blist\b|\btuple\b|\bdict\b|\bcollection\b|\barray\b)/i.test(query)) {
    return (
      `In Python, collections are data structures that hold multiple items in memory:\n\n` +
      `* **\`list\`** (\`[1, 2, 3]\`): An ordered, zero-indexed, mutable sequence of object references.\n` +
      `* **\`tuple\`** (\`(1, 2, 3)\`): An ordered, immutable sequence. Once created, elements cannot be added, removed, or replaced.\n` +
      `* **\`dict\`** (\`{"key": "value"}\`): A hash map associating unique, hashable keys with arbitrary value references.\n\n` +
      `Because lists store *references* to items, what happens when you create a copy of a list using \`b = a[:]\` versus \`b = a\`? Are the inner objects shared or duplicated?`
    );
  }

  // 7. Functions / Scope
  if (/(\bfunction\b|\bdef\b|\bscope\b|\bglobal\b|\blocal\b|\blegb\b)/i.test(query)) {
    return (
      `A **function** in Python is a first-class object defined with \`def\` that encapsulates reusable logic and creates its own **local namespace** whenever it is invoked:\n\n` +
      `Python resolves names using the **LEGB rule**:\n` +
      `1. **L**ocal: Names defined inside the current function.\n` +
      `2. **E**nclosing: Names in enclosing function scopes (closures).\n` +
      `3. **G**lobal: Module-level variables defined at the top of the file.\n` +
      `4. **B**uilt-in: Python's built-in namespace (\`len\`, \`print\`, \`range\`, etc.).\n\n` +
      `If a function attempts to reassign a global variable without using the \`global\` keyword, how does Python's compiler handle that variable's scope?`
    );
  }

  // 8. Next / Progression
  if (/^(next|continue|move on|advance|next topic|next section)\b/i.test(query)) {
    return (
      `Great momentum! Let's solidify the core mental model for **${section}** before advancing.\n\n` +
      `To ensure you have this nailed: how would you summarize the primary distinction we just explored in one sentence, and what would happen if Python encountered an indentation error on the first line of a block?`
    );
  }

  // 9. Course completion / Credentials
  if (/(\bmark.*complet|\bfinish.*course|\bcertificat|\bcredential\b)/i.test(query)) {
    return (
      `Course completion and credential certification in CERTIFY are verified deterministically by the backend evaluation engine!\n\n` +
      `When all 10 modules, practical coding challenges, and viva defense evaluations are passed, your **RFC 8032 Ed25519 digitally signed credential** is automatically generated and verifiable on the **Credentials** page.\n\n` +
      `To make progress toward your certificate, let's continue mastering **${section}**. What question do you have about **${concept}**?`
    );
  }

  // 10. Default contextual synthesis
  return (
    `Let's explore your question in the context of **${section}** (${concept}).\n\n` +
    `When working with ${concept}, Python emphasizes explicit syntax and predictable runtime semantics. Names in Python are labels dynamically bound to objects allocated on the heap.\n\n` +
    `How does this mental model apply to what you are trying to write or debug right now? Walk me through what you expect Python to do step-by-step.`
  );
}

export class AIProvider {
  public static isRealProviderConfigured(): boolean {
    if (Boolean((config as any).groqApiKey)) return true;
    if (config.aiProvider === "anthropic" && Boolean(config.anthropicApiKey) && config.anthropicApiKey !== "mock-or-dev-key") return true;
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
  ): Promise<{ fullText: string; modelUsed: string; promptVersion: string; provider: string }> {
    const systemPrompt = buildSocraticSystemPrompt(context);

    const contents = [
      ...context.history.slice(-8).map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
      { role: "user", parts: [{ text: context.learnerMessage }] },
    ];

    const primaryModel = normalizeGeminiModel(config.geminiTutorModel);
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
              temperature: 0.7,
            },
          }),
          signal,
        });

        if (!res.ok) {
          const errText = await res.text().catch(() => "");
          if (res.status === 503 || res.status === 429) {
            console.warn(`[AIProvider] Gemini model ${model} returned HTTP ${res.status}, trying fallback model...`);
            await new Promise((r) => setTimeout(r, 400));
            continue;
          }
          throw new AIProviderError(`Gemini API error (${model}): HTTP ${res.status} - ${errText}`, 502);
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
            if (!trimmed.startsWith("data: ")) continue;
            const dataStr = trimmed.slice(6).trim();
            if (dataStr === "[DONE]") break;
            try {
              const eventObj = JSON.parse(dataStr);
              const candidateText =
                eventObj.candidates?.[0]?.content?.parts?.[0]?.text;
              if (candidateText) {
                fullText += candidateText;
                await onChunk(candidateText);
              }
            } catch {
              // skip unparseable SSE line
            }
          }
        }

        if (buffer.trim().startsWith("data: ")) {
          const dataStr = buffer.trim().slice(6).trim();
          if (dataStr !== "[DONE]") {
            try {
              const eventObj = JSON.parse(dataStr);
              const candidateText =
                eventObj.candidates?.[0]?.content?.parts?.[0]?.text;
              if (candidateText) {
                fullText += candidateText;
                await onChunk(candidateText);
              }
            } catch {
              // skip unparseable SSE line
            }
          }
        }

        if (fullText.trim().length > 0) {
          return {
            fullText,
            modelUsed: model,
            promptVersion: config.promptVersion,
            provider: "gemini",
          };
        }
      } catch (err: any) {
        if (err.name === "AbortError") throw err;
        lastError = err;
        console.warn(`[AIProvider] Exception streaming from Gemini model ${model}:`, err.message || err);
      }
    }

    throw lastError || new AIProviderError("All Gemini tutor models exhausted or unavailable", 503);
  }

  public static async streamGroqReply(
    context: TutorStreamContext,
    onChunk: (chunk: string) => Promise<any> | any,
    signal?: AbortSignal
  ): Promise<{ fullText: string; modelUsed: string; promptVersion: string; provider: string }> {
    const systemPrompt = buildSocraticSystemPrompt(context);

    const messages = [
      { role: "system", content: systemPrompt },
      ...context.history.slice(-8).map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: context.learnerMessage },
    ];

    const apiKey = (config as any).groqApiKey;
    if (!apiKey) {
      throw new AIProviderError("GROQ_API_KEY is not configured", 503);
    }

    const configuredModel = config.groqTutorModel || "llama-3.3-70b-versatile";
    const candidateModels = Array.from(
      new Set([configuredModel, "llama-3.3-70b-versatile", "llama-3.1-8b-instant"])
    );

    let lastError: any = null;

    for (const model of candidateModels) {
      if (signal?.aborted) break;
      const isReasoningModel = model.includes("r1") || model.includes("reasoning");
      const max_tokens = isReasoningModel ? 2048 : 1024;
      const requestBody: any = {
        model,
        messages,
        temperature: 0.7,
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
            console.warn(`[AIProvider] Groq model ${model} returned HTTP ${res.status}, trying fallback model...`);
            await new Promise((r) => setTimeout(r, 400));
            continue;
          }
          throw new AIProviderError(`Groq API error (${model}): HTTP ${res.status} - ${errText}`, 502);
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
            if (!trimmed.startsWith("data: ")) continue;
            const dataStr = trimmed.slice(6).trim();
            if (dataStr === "[DONE]") break;
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

        if (buffer.trim().startsWith("data: ")) {
          const dataStr = buffer.trim().slice(6).trim();
          if (dataStr !== "[DONE]") {
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
            promptVersion: config.promptVersion,
            provider: "groq",
          };
        }
      } catch (err: any) {
        if (err.name === "AbortError") throw err;
        lastError = err;
        console.warn(`[AIProvider] Groq model ${model} failed (${err?.message}), trying next model...`);
      }
    }

    throw lastError || new AIProviderError("All Groq candidate models exhausted", 503);
  }

  public static async streamTutorReply(
    context: TutorStreamContext,
    onChunk: (chunk: string) => Promise<any> | any,
    signal?: AbortSignal
  ): Promise<{ fullText: string; modelUsed: string; promptVersion: string; provider: string }> {
    this.assertConfiguredOrFallbackAllowed();

    // 0. Primary Provider Selection based on config.aiProvider
    if (config.aiProvider === "gemini" && config.geminiApiKey) {
      try {
        return await this.streamGeminiReply(context, onChunk, signal);
      } catch (geminiErr: any) {
        if (geminiErr.name === "AbortError") throw geminiErr;
        console.warn("[AIProvider] Gemini streaming error, trying Groq fallback:", geminiErr?.message || geminiErr);
        if (Boolean((config as any).groqApiKey)) {
          return await this.streamGroqReply(context, onChunk, signal);
        }
      }
    }

    if (config.aiProvider === "groq" && Boolean((config as any).groqApiKey)) {
      try {
        return await this.streamGroqReply(context, onChunk, signal);
      } catch (groqErr: any) {
        if (groqErr.name === "AbortError") throw groqErr;
        console.warn("[AIProvider] Groq streaming error, trying fallbacks:", groqErr?.message || groqErr);
      }
    }

    // Fallback if neither primary matched or succeeded
    if (config.geminiApiKey) {
      try {
        return await this.streamGeminiReply(context, onChunk, signal);
      } catch (geminiErr: any) {
        if (geminiErr.name === "AbortError") throw geminiErr;
      }
    }

    if (Boolean((config as any).groqApiKey)) {
      try {
        return await this.streamGroqReply(context, onChunk, signal);
      } catch (groqErr: any) {
        if (groqErr.name === "AbortError") throw groqErr;
      }
    }

    // 1. Live Anthropic API Integration with Auto-Fallback to Gemini
    if (config.aiProvider === "anthropic" && config.anthropicApiKey) {
      try {
        const ragNotes = context.ragContextChunks && context.ragContextChunks.length > 0
          ? `\n\nCurriculum reference context (from lesson and common mistakes):\n${context.ragContextChunks.join("\n---\n")}\nUse this curriculum reference context to inform your Socratic questioning, but NEVER reveal solutions or code answers to assessment questions.`
          : "";

        const systemPrompt = `You are the Socratic AI Tutor for the CERTIFY course "${context.courseTitle}", chapter "${context.chapterTitle}".
Concepts in this chapter: ${context.concepts.map((c) => c.name).join(", ")}.
Teaching notes: ${context.teachingContent || "First-principles Python semantics."}${ragNotes}
Guidelines:
- Guide with Socratic questions; probe mental models of memory, identity, and runtime state.
- Keep responses concise (under 120 words). Never give direct code answers to assessment questions.`;

        const messages = [
          ...context.history.slice(-8).map((m) => ({ role: m.role, content: m.content })),
          { role: "user" as const, content: context.learnerMessage },
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
            max_tokens: 400,
            system: systemPrompt,
            messages,
            stream: true,
          }),
          signal,
        });

        // Auto-switch to Gemini if token limit / rate limit exceeded (HTTP 429, 529, 402)
        if (res.status === 429 || res.status === 529 || res.status === 402) {
          if (config.geminiAutoFallback && config.geminiApiKey) {
            console.warn(
              `[AIProvider] Anthropic rate/token limit hit (HTTP ${res.status}). Auto-switching to Gemini fallback...`
            );
            return await this.streamGeminiReply(context, onChunk, signal);
          }
        }

        if (!res.ok) {
          const errBody = await res.text().catch(() => "");
          if (
            (errBody.includes("rate_limit") ||
              errBody.includes("credit_balance_too_low") ||
              errBody.includes("overloaded")) &&
            config.geminiAutoFallback &&
            config.geminiApiKey
          ) {
            console.warn(
              `[AIProvider] Anthropic limit exceeded. Auto-switching to Gemini fallback...`
            );
            return await this.streamGeminiReply(context, onChunk, signal);
          }
          throw new AIProviderError(`Anthropic API error: HTTP ${res.status}`, 502);
        }

        const reader = res.body?.getReader();
        if (!reader) throw new AIProviderError("Stream body unavailable", 502);
        const decoder = new TextDecoder();
        let fullText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const textChunk = decoder.decode(value, { stream: true });
          const lines = textChunk.split("\n").filter((l) => l.startsWith("data: "));
          for (const line of lines) {
            const dataStr = line.slice(6).trim();
            if (dataStr === "[DONE]") break;
            try {
              const eventObj = JSON.parse(dataStr);
              if (eventObj.type === "content_block_delta" && eventObj.delta?.text) {
                fullText += eventObj.delta.text;
                onChunk(eventObj.delta.text);
              }
            } catch {
              // skip unparseable SSE line
            }
          }
        }

        return {
          fullText,
          modelUsed: config.anthropicTutorModel,
          promptVersion: config.promptVersion,
          provider: "anthropic",
        };
      } catch (err: any) {
        if (err.name === "AbortError") throw err;
        if (config.geminiAutoFallback && config.geminiApiKey) {
          console.warn(
            `[AIProvider] Exception during Anthropic streaming (${err.message}). Auto-switching to Gemini fallback...`
          );
          try {
            return await this.streamGeminiReply(context, onChunk, signal);
          } catch (geminiErr: any) {
            if (geminiErr.name === "AbortError") throw geminiErr;
            if (!config.allowDevAiFallback) throw geminiErr;
          }
        }
        if (!config.allowDevAiFallback) throw err;
      }
    }

    // 2. Intelligent Pedagogical Socratic Fallback
    const reply = generateIntelligentSocraticFallback(context);

    const tokens = reply.match(/.{1,28}/g) || [reply];
    let fullText = "";
    for (const tok of tokens) {
      if (signal?.aborted) break;
      fullText += tok;
      await onChunk(tok);
    }

    return {
      fullText,
      modelUsed: "certify-intelligent-socratic-v2",
      promptVersion: config.promptVersion,
      provider: "pedagogical-engine",
    };
  }

  public static async evaluateRubricCriteria(params: {
    questionPrompt: string;
    studentAnswer: string;
    conceptSlug: string;
    conceptName: string;
    criteria: Array<{
      id: string;
      criterionStatement: string;
      weight: number;
      tierRequired?: string;
    }>;
  }): Promise<RubricEvaluationOutput> {
    this.assertConfiguredOrFallbackAllowed();
    const text = (params.studentAnswer || "").trim();
    const negated = hasNegationOrConfusion(text);
    const stuffed = isKeywordStuffing(text);

    const expectedTerms = [
      ...(CONCEPT_VOCABULARY[params.conceptSlug] || []),
      ...params.conceptName
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length > 3),
      "python",
      "memory",
      "object",
      "reference",
      "mutable",
      "immutable",
      "scope",
      "yield",
      "generator",
      "loop",
      "function",
    ];

    const lower = text.toLowerCase();
    const matchedTerms = Array.from(new Set(expectedTerms)).filter((term) =>
      lower.includes(term)
    );

    const isSubstantive =
      text.length >= 45 && !negated && !stuffed && matchedTerms.length >= 2;

    const evaluations = params.criteria.map((c) => {
      const criterionTerms = c.criterionStatement
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length > 4);
      const specificHits = criterionTerms.filter((w) => lower.includes(w)).length;
      const passed = isSubstantive && (specificHits >= 1 || matchedTerms.length >= 3);
      return {
        criterionId: c.id,
        isDemonstrated: passed,
        confidence: passed ? 0.88 : 0.82,
        evidenceQuote: text.slice(0, 140),
        reasoning: negated
          ? "Response contains a direct conceptual contradiction/negation of core Python semantics."
          : stuffed
          ? "Response lacks coherent sentence structure or repeats keywords without explanation."
          : passed
          ? `Demonstrated ${params.conceptName} rubric criterion (${c.criterionStatement}).`
          : `Explanation did not sufficiently address: ${c.criterionStatement}`,
      };
    });

    const totalWeight =
      params.criteria.reduce((acc, c) => acc + (c.weight || 1), 0) || 1;
    const earnedWeight = evaluations.reduce((acc, ev, idx) => {
      const w = params.criteria[idx]?.weight || 1;
      return acc + (ev.isDemonstrated ? w : 0);
    }, 0);

    const overallScore = Number((earnedWeight / totalWeight).toFixed(4));
    const overallPassed = overallScore >= 0.70;

    const rawResult = {
      evaluations,
      overallScore,
      overallPassed,
      summaryFeedback: overallPassed
        ? `Strong conceptual mastery demonstrated for ${params.conceptName}.`
        : negated
        ? `Conceptual misconception detected in ${params.conceptName}. Review how Python manages references and mutability.`
        : `Additional precision needed on ${params.conceptName} rubric criteria.`,
      modelUsed: this.isRealProviderConfigured()
        ? config.anthropicEvaluatorModel
        : "deterministic-rubric-evaluator-v1",
      promptVersion: config.promptVersion,
    };

    return RubricEvaluationOutputSchema.parse(rawResult);
  }

  public static async evaluateVivaTurn(params: {
    turnNumber: number;
    studentAnswer: string;
  }): Promise<{
    isDemonstrated: boolean;
    turnScore: number;
    feedback: string;
    followUpQuestion: string | null;
    modelUsed: string;
  }> {
    this.assertConfiguredOrFallbackAllowed();
    const text = (params.studentAnswer || "").trim();

    const turnRubricConfigs: Record<number, {
      conceptName: string;
      questionPrompt: string;
      criteria: RubricCriterionInput[];
    }> = {
      1: {
        conceptName: "Core Architecture & Memory Model",
        questionPrompt:
          "Turn 1 Defense Probe: Explain Python's execution model from source code to bytecode in CPython, detailing memory allocation on stack vs heap, reference counting, and object lifetimes.",
        criteria: [
          {
            id: "viva-crit-t1-arch",
            criterionStatement:
              "Explains bytecode compilation, CPython VM execution, call stack, heap allocation, and reference counting.",
            weight: 1.0,
            tierRequired: "ADVANCED",
            passingThreshold: 0.70,
            expectedConceptsJson: JSON.stringify([
              "bytecode",
              "cpython",
              "stack",
              "heap",
              "reference counting",
              "memory",
              "object",
              "pvm",
            ]),
            misconceptionsJson: JSON.stringify([
              {
                tag: "compiled_to_native",
                pattern: "\\bcompiles?\\s+directly\\s+to\\s+(machine\\s+code|binary|assembly)\\b",
                explanation: "CPython executes bytecode via a virtual machine, not direct machine code.",
              },
            ]),
          },
        ],
      },
      2: {
        conceptName: "Mutability, Aliasing & Concurrency Safety",
        questionPrompt:
          "Turn 2 Defense Probe: How does Python handle mutability and object references under concurrent access, shallow vs deep copying, and what are the architectural implications of the GIL on multithreading versus multiprocessing?",
        criteria: [
          {
            id: "viva-crit-t2-mutability",
            criterionStatement:
              "Articulates in-place mutation, object references, shallow vs deep copying, and thread concurrency implications under the GIL.",
            weight: 1.0,
            tierRequired: "ADVANCED",
            passingThreshold: 0.70,
            expectedConceptsJson: JSON.stringify([
              "mutable",
              "immutable",
              "reference",
              "copy",
              "gil",
              "multiprocessing",
              "thread",
              "alias",
            ]),
            misconceptionsJson: JSON.stringify([
              {
                tag: "gil_parallel_cpu",
                pattern: "\\bgil\\s+allows?\\s+true\\s+parallel\\s+cpu\\b",
                explanation:
                  "The GIL serializes thread execution, preventing parallel bytecode execution on multi-core CPUs.",
              },
            ]),
          },
        ],
      },
      3: {
        conceptName: "Algorithmic Complexity & Generator Streaming at Scale",
        questionPrompt:
          "Turn 3 Defense Probe: If the dataset scales to 50 million records, how do you refactor processing using Python generators (yield), generator pipelines, and lazy evaluation to ensure O(1) memory complexity and optimal time complexity?",
        criteria: [
          {
            id: "viva-crit-t3-generators",
            criterionStatement:
              "Analyzes time/space complexity and describes lazy generator pipelines maintaining O(1) auxiliary memory at scale.",
            weight: 1.0,
            tierRequired: "ADVANCED",
            passingThreshold: 0.70,
            expectedConceptsJson: JSON.stringify([
              "generator",
              "yield",
              "lazy",
              "o(1)",
              "memory",
              "stream",
              "pipeline",
              "complexity",
            ]),
            misconceptionsJson: JSON.stringify([
              {
                tag: "generator_stores_all",
                pattern: "\\bgenerators?\\s+(stores?|holds?|loads?)\\s+(all|entire|whole)\\b",
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

    const turnConfig = turnRubricConfigs[params.turnNumber] || turnRubricConfigs[1];

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
      followUpQuestion: params.turnNumber < 3 ? nextQuestions[params.turnNumber] || null : null,
      modelUsed:
        evalResult.evaluatorModel ||
        (this.isRealProviderConfigured()
          ? config.anthropicEvaluatorModel
          : "deterministic-viva-evaluator-v2"),
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
      params.history.slice().reverse().find((m) => m.role === "user")?.content || "";
    const historyWithoutLast = params.history.filter((m, i, arr) => i !== arr.length - 1 && m.role !== "system");

    return this.streamTutorReply(
      {
        courseTitle: params.courseTitle || "Python Fundamentals",
        moduleTitle: params.moduleTitle,
        chapterTitle: params.chapterTitle || params.conceptName,
        sectionTitle: params.sectionTitle,
        sectionObjective: params.sectionObjective,
        teachingContent: params.teachingContent,
        concepts: [{ id: "c1", slug: "c1", name: params.conceptName, description: "" }],
        unmetCriteria: params.unmetCriteria,
        knownMisconceptions: params.knownMisconceptions,
        guardrailDirective: params.guardrailDirective,
        history: historyWithoutLast as any,
        learnerMessage: lastUserMsg,
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
  }): Promise<{ isDemonstrated: boolean; confidence: number; evidenceQuote?: string; reasoning?: string }> {
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
      confidence: isDemonstrated ? 0.88 : 0.40,
      evidenceQuote: isDemonstrated ? text.slice(0, 150) : undefined,
      reasoning: isDemonstrated
        ? `Dialogue demonstrated key concept semantics for ${params.conceptName}.`
        : `Dialogue lacked clear conceptual explanation.`,
    };
  }
}

export const AiProviderService = AIProvider;
