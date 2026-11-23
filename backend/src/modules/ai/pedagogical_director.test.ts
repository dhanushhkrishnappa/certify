import { describe, it, expect } from "vitest";
import {
  buildSocraticSystemPrompt,
  generateIntelligentSocraticFallback,
  extractPreviousTutorQuestions,
} from "./ai.provider.js";
import { RubricEvaluatorService } from "./rubric.evaluator.js";
import { RAGService } from "./rag.service.js";

describe("Stateful Pedagogical Director, Anti-Repetition Engine & Context-Aware Rubric Grader", () => {
  const sampleTeachingContent = `
## 1. What is this concept?
The Python execution model describes how the Python interpreter reads your source code, checks its grammar, and executes instructions step by step.

## 6. Technical explanation
When you run \`python3 app.py\`, CPython parses the file into an Abstract Syntax Tree (AST), compiles it to bytecode, and executes that bytecode on the Python Virtual Machine (PVM). Indentation (4 spaces per level) is syntactically significant.

## 8. Simple example
\`\`\`python
print("Step 1: Starting setup")
if True:
    print("Step 2: Inside an indented block (4 spaces)")
print("Step 3: Back at top level")
\`\`\`

## 13. Common mistakes
Mixing tabs and spaces, indenting a line unexpectedly at top level (\`IndentationError\`), or forgetting quotes around text (\`SyntaxError\`).
`;

  const sampleRagChunks = [
    `## Mistake 1: Treating Variables as Fixed Boxes (\`b = a\` copies data)
- **Actual Behaviour:** Prints \`[1, 2, 3]\` because both \`a\` and \`b\` reference the same list object on the heap.
\`\`\`python
a = [1, 2]
b = a
b.append(3)
print(a)  # [1, 2, 3]
\`\`\`
- **Tutor Socratic Guidance:** Ask: "If \`id(a)\` and \`id(b)\` print the exact same number, how many list objects exist in memory?"`,
  ];

  it("extracts previous assistant questions and forbids repeating them across consecutive turns", () => {
    const history: Array<{ role: "user" | "assistant"; content: string }> = [];

    // Turn 1: Learner asks "explain python"
    const reply1 = generateIntelligentSocraticFallback({
      courseTitle: "Python Fundamentals",
      moduleTitle: "Module 01: Python Foundations",
      moduleOrder: 1,
      chapterTitle: "Python Execution, Interactive Mode, Scripts & Indentation",
      sectionTitle: "1. Core Intuition & Mental Model",
      sectionObjective: "Build an accurate mental model of the Python interpreter.",
      conceptName: "Python Execution Model, REPL, Scripts & Indentation",
      teachingContent: sampleTeachingContent,
      ragContextChunks: sampleRagChunks,
      targetCriterion: {
        code: "M01-EXECUTION-R01",
        statement: "Distinguishes REPL interactive execution from running a saved .py script.",
        cognitiveLevel: "EXPLAIN",
      },
      userMessage: "explain python",
      history,
    });

    expect(reply1).not.toContain("Let's examine your question in the context of");
    expect(reply1).toContain("```python");
    expect(reply1).toContain("**Your Turn:**");

    history.push({ role: "user", content: "explain python" });
    history.push({ role: "assistant", content: reply1 });

    // Turn 2: Learner asks "what is mutability?"
    const prevQs = extractPreviousTutorQuestions(history);
    expect(prevQs.length).toBeGreaterThanOrEqual(1);

    const reply2 = generateIntelligentSocraticFallback({
      courseTitle: "Python Fundamentals",
      moduleTitle: "Module 01: Python Foundations",
      moduleOrder: 1,
      chapterTitle: "Python Execution, Interactive Mode, Scripts & Indentation",
      sectionTitle: "1. Core Intuition & Mental Model",
      sectionObjective: "Build an accurate mental model of the Python interpreter.",
      conceptName: "Python Execution Model, REPL, Scripts & Indentation",
      teachingContent: sampleTeachingContent,
      ragContextChunks: sampleRagChunks,
      previousTutorQuestions: prevQs,
      targetCriterion: {
        code: "M01-EXECUTION-R02",
        statement: "Explains how 4-space indentation defines code blocks and triggers IndentationError when mismatched.",
        cognitiveLevel: "DEBUG",
      },
      userMessage: "what is mutability?",
      history,
    });

    expect(reply2).not.toBe(reply1);
    const q1 = prevQs[0];
    expect(reply2).not.toContain(q1);
  });

  it("announces section advancement and checkpoint unlock transitions inline on the exact turn they occur", () => {
    const checkpointReply = generateIntelligentSocraticFallback({
      courseTitle: "Python Fundamentals",
      chapterTitle: "Variables, Object References & Mutability",
      sectionTitle: "4. Conceptual Checkpoint",
      conceptName: "Variables & Object References",
      teachingContent: sampleTeachingContent,
      ragContextChunks: sampleRagChunks,
      justDemonstratedCriteria: [
        "Predicts aliasing effects when two names point to the same mutable object.",
      ],
      progressionTransition: {
        type: "CHECKPOINT_UNLOCKED",
        fromSectionTitle: "3. Common Pitfalls & Debugging",
        toSectionTitle: "4. Conceptual Checkpoint",
        message: "All guided sections complete! Conceptual Checkpoint is now unlocked.",
      },
      userMessage: "Because a and b reference the same list on the heap, mutating b also changes a.",
      history: [],
    });

    expect(checkpointReply).toContain("Rubric Criterion Demonstrated");
    expect(checkpointReply).toContain("Chapter Checkpoint Unlocked");
    expect(checkpointReply).toContain("Take Chapter Checkpoint");
  });

  it("credits concise learner dialogue answers when evaluated in context of the tutor's last question", async () => {
    const criteria = [
      {
        id: "crit-mut-1",
        criterionCode: "M01-VAR-R01",
        criterionStatement:
          "Predicts that rebinding an immutable int variable leaves aliased variables pointing to the original integer object.",
        weight: 1.0,
        tierRequired: "EASY",
        cognitiveLevel: "REASON",
        passingThreshold: 0.7,
        expectedConceptsJson: JSON.stringify([
          "immutable",
          "int",
          "rebind",
          "original",
          "object",
          "reference",
        ]),
        misconceptionsJson: JSON.stringify([]),
      },
    ];

    const evalRes = await RubricEvaluatorService.evaluateResponse({
      conceptName: "Variables & Object References",
      lastTutorQuestion:
        "After x = 42 and y = x, if we rebind x = 100 on an immutable int object, what does y evaluate to and why?",
      learnerText: "y is still 42 because ints are immutable and y references the original object.",
      criteria,
      mode: "DIALOGUE",
    });

    expect(evalRes.overallPassed).toBe(true);
    expect(evalRes.weightedScore).toBeGreaterThanOrEqual(0.7);
    expect(evalRes.criteriaResults[0].verdict).toBe("DEMONSTRATED");
  });

  it("builds OR-weighted PostgreSQL tsquery strings without failing on conversational sentences", () => {
    const tsq = RAGService.buildOrTsQuery(
      "Can you explain how Python tracks mutability when I pass a list?",
      "Variables and Object References"
    );

    expect(tsq).toContain("python");
    expect(tsq).toContain("mutability");
    expect(tsq).toContain("list");
    expect(tsq).toContain(" | ");
  });
});
