import { prisma } from "../../shared/prisma.js";
import { PYTHON_MODULE_TAXONOMY } from "../progression/curriculum.taxonomy.js";

export type DriftClassification =
  | "ON_TOPIC_ACTIVE"
  | "PREREQUISITE_RECALL"
  | "FUTURE_TOPIC_AHEAD"
  | "SKIP_ATTEMPT"
  | "OFF_TOPIC";

export interface DriftCheckResult {
  classification: DriftClassification;
  isDrifting: boolean;
  detectedTargetModuleOrder?: number;
  detectedTargetModuleSlug?: string;
  detectedTargetModuleTitle?: string;
  matchedTerms: string[];
  guardrailDirective?: string;
  deterministicReply?: string;
}

const SKIP_INTENT_PATTERNS = [
  /\b(skip|jump|fast[\s-]?forward|bypass|move\s+directly|go\s+straight|advance\s+me)\b.*\b(module|chapter|lesson|section|next|topic|last|end|course|oop|regex|test|file|class|function|loop)\b/i,
  /\b(unlock|open)\s+(module|chapter|lesson|topic|course|next)\b/i,
  /\bignore\s+(all\s+)?previous\s+instructions\b/i,
  /\bmark\s+(this\s+|my\s+)?(module|chapter|section|lesson|course|me)\s+(as\s+)?(complete|completed|passed|mastered)\b/i,
  /\bgive\s+me\s+(100%|full\s+marks|mastery|the\s+certificate)\b/i,
];

const OFF_TOPIC_PATTERNS = [
  /\b(weather|stock\s+price|bitcoin|crypto|recipe\s+for|cook\s+pasta|football\s+score|movie\s+recommendation|write\s+me\s+a\s+poem\s+about\s+love|horoscope)\b/i,
];

// Terms that are strong indicators of a specific future module (avoiding generic words like "error" or "function" when used casually)
const FUTURE_MODULE_STRONG_MARKERS: Record<number, { title: string; slug: string; markers: RegExp[] }> = {
  2: {
    title: "Module 02 – Decision Making",
    slug: "decision-making",
    markers: [/\bmatch\s+case\b/i, /\bshort[\s-]?circuit/i, /\bguard\s+clause/i, /\bternary\s+operator/i],
  },
  3: {
    title: "Module 03 – Iteration and Problem Solving",
    slug: "iteration-and-problem-solving",
    markers: [
      /\bwhile\s+loop\b/i,
      /\bfor\s+loop\b/i,
      /\blist\s+comprehension/i,
      /\benumerate\s*\(/i,
      /\bloop\s+invariant/i,
      /\bwhat\s+(is|are)\s+(a\s+)?loops?\b/i,
      /\bbreak\s+and\s+continue\b/i,
      /\b(break|continue)\s+statements?\b/i,
      /\binfinite\s+loops?\b/i,
    ],
  },
  4: {
    title: "Module 04 – Functions and Modular Programming",
    slug: "functions-and-modular-programming",
    markers: [
      /\blegb\b/i,
      /\bclosure\b/i,
      /\b\*args\b/i,
      /\b\*\*kwargs\b/i,
      /\blambda\b/i,
      /\bmutable\s+default/i,
      /\brecursion\b/i,
      /\bglobal\s+variables?\b/i,
      /\blocal\s+variables?\b/i,
      /\bglobal\s+keyword\b/i,
    ],
  },
  5: {
    title: "Module 05 – Exceptions and Debugging",
    slug: "exceptions-and-debugging",
    markers: [/\btry\s*\/\s*except\b/i, /\btry[\s-]+except\b/i, /\beafp\b/i, /\blbyl\b/i, /\bcustom\s+exception/i, /\bpdb\b/i],
  },
  6: {
    title: "Module 06 – Libraries and Python Ecosystem",
    slug: "libraries-and-python-ecosystem",
    markers: [/\bvirtualenv\b/i, /\bvenv\b/i, /\bpip\s+install/i, /\brequirements\.txt/i, /\b__name__\s*==\s*['"]__main__['"]/i],
  },
  7: {
    title: "Module 07 – Unit Testing and Code Quality",
    slug: "unit-testing-and-code-quality",
    markers: [/\bpytest\b/i, /\bunittest\b/i, /\btdd\b/i, /\bmocking\b/i, /\bparametrize\b/i, /\btest\s+fixture/i],
  },
  8: {
    title: "Module 08 – File Handling and Data Processing",
    slug: "file-handling-and-data-processing",
    markers: [/\bcontext\s+manager\b/i, /\bwith\s+open\s*\(/i, /\bcsv\.reader/i, /\bjson\.load/i, /\byield\b/i, /\bgenerator\b/i],
  },
  9: {
    title: "Module 09 – Regular Expressions",
    slug: "regular-expressions",
    markers: [/\bregex\b/i, /\bregular\s+expression/i, /\bre\.search/i, /\bre\.findall/i, /\bre\.compile/i, /\blookahead\b/i, /\bcapture\s+group/i],
  },
  10: {
    title: "Module 10 – Object-Oriented Programming",
    slug: "object-oriented-programming",
    markers: [/\b__init__\b/i, /\boop\b/i, /\bobject[\s-]+oriented\b/i, /\binheritance\b/i, /\bpolymorphism\b/i, /\bmetaclass/i, /\b@property\b/i, /\bdunder\s+method/i, /\bclass\s+[A-Z]\w*/],
  },
};

export class DriftService {
  /**
   * Deterministically classifies learner intent against the active module/chapter/section scope.
   * Zero LLM dependency -> immune to prompt injection and topic-skipping jailbreaks.
   */
  public static classifyMessage(params: {
    message: string;
    activeModuleOrder: number;
    activeModuleTitle: string;
    activeChapterTitle: string;
    activeSectionTitle: string;
    activeSectionObjective: string;
    activeConceptName: string;
  }): DriftCheckResult {
    const text = (params.message || "").trim();
    const lower = text.toLowerCase();

    // 1. Check explicit skip / progression-bypass / prompt-injection attempts
    for (const re of SKIP_INTENT_PATTERNS) {
      if (re.test(text)) {
        return {
          classification: "SKIP_ATTEMPT",
          isDrifting: true,
          matchedTerms: [text.match(re)?.[0] || "skip"],
          deterministicReply:
            `Progression in CERTIFY is strictly structured and verified step-by-step on the backend, so we can't skip ahead directly.\n\n` +
            `You are currently on **${params.activeModuleTitle} → ${params.activeChapterTitle} → ${params.activeSectionTitle}**.\n\n` +
            `**Current Objective:** ${params.activeSectionObjective}\n\n` +
            `Let's finish this section together first—once you pass the conceptual checkpoint, the next chapter unlocks automatically. What's your take on **${params.activeConceptName}** so far?`,
        };
      }
    }

    // 2. Check active module keyword overlap (if strongly on-topic for current module, allow!)
    const activeTax = PYTHON_MODULE_TAXONOMY[params.activeModuleOrder];
    const activeHits = (activeTax?.keywords || []).filter((kw) => lower.includes(kw.toLowerCase()));

    // 3. Check future modules (strictly > activeModuleOrder)
    for (let order = params.activeModuleOrder + 1; order <= 10; order++) {
      const futureSpec = FUTURE_MODULE_STRONG_MARKERS[order];
      if (!futureSpec) continue;

      const hits: string[] = [];
      for (const re of futureSpec.markers) {
        const m = text.match(re);
        if (m) hits.push(m[0]);
      }

      // If learner asks explicitly about a future module topic without addressing the current module
      if (hits.length > 0 && activeHits.length === 0) {
        return {
          classification: "FUTURE_TOPIC_AHEAD",
          isDrifting: true,
          detectedTargetModuleOrder: order,
          detectedTargetModuleSlug: futureSpec.slug,
          detectedTargetModuleTitle: futureSpec.title,
          matchedTerms: hits,
          guardrailDirective:
            `STRICT SCOPE GUARDRAIL ACTIVATED: The learner asked about "${hits.join(", ")}", which belongs to ${futureSpec.title} (LOCKED — future module #${order}). ` +
            `You MUST NOT teach or explain ${futureSpec.title} syntax or concepts yet. ` +
            `In 1 warm sentence, acknowledge their curiosity and let them know "${futureSpec.title}" will unlock automatically once earlier modules are mastered. ` +
            `Then IMMEDIATELY pivot back to the active section "${params.activeSectionTitle}" (${params.activeConceptName}) with a focused Socratic question aligned to: ${params.activeSectionObjective}.`,
        };
      }
    }

    // 4. Check non-Python off-topic requests
    for (const re of OFF_TOPIC_PATTERNS) {
      if (re.test(text)) {
        return {
          classification: "OFF_TOPIC",
          isDrifting: true,
          matchedTerms: [text.match(re)?.[0] || "off-topic"],
          guardrailDirective:
            `STRICT SCOPE GUARDRAIL ACTIVATED: The learner's message is off-topic from Python Fundamentals. ` +
            `Politely redirect in 1 sentence back to "${params.activeSectionTitle}" (${params.activeConceptName}) and ask a concise Socratic question on: ${params.activeSectionObjective}.`,
        };
      }
    }

    // 5. Check prerequisite recall (references an earlier completed module < activeModuleOrder)
    for (let order = 1; order < params.activeModuleOrder; order++) {
      const prevSpec = FUTURE_MODULE_STRONG_MARKERS[order];
      if (!prevSpec) continue;
      const prevHit = prevSpec.markers.some((re) => re.test(text));
      if (prevHit && activeHits.length === 0) {
        return {
          classification: "PREREQUISITE_RECALL",
          isDrifting: false,
          detectedTargetModuleOrder: order,
          detectedTargetModuleSlug: prevSpec.slug,
          detectedTargetModuleTitle: prevSpec.title,
          matchedTerms: [],
        };
      }
    }

    return {
      classification: "ON_TOPIC_ACTIVE",
      isDrifting: false,
      matchedTerms: activeHits,
    };
  }

  /**
   * Persists a TopicDriftEvent audit row whenever a learner tries to skip or drift off-scope.
   */
  public static async logDriftEvent(params: {
    sessionId: string;
    enrollmentId: string;
    activeChapterId: string;
    activeSectionId?: string | null;
    driftResult: DriftCheckResult;
    learnerMessage: string;
  }): Promise<void> {
    if (!params.driftResult.isDrifting) return;
    try {
      await prisma.topicDriftEvent.create({
        data: {
          sessionId: params.sessionId,
          enrollmentId: params.enrollmentId,
          activeChapterId: params.activeChapterId,
          activeSectionId: params.activeSectionId || null,
          driftType: params.driftResult.classification,
          detectedTargetSlug: params.driftResult.detectedTargetModuleSlug || null,
          learnerMessage: params.learnerMessage.slice(0, 500),
        },
      });
    } catch (err: any) {
      console.warn("[DriftService] Failed to log drift event:", err?.message || err);
    }
  }
}
