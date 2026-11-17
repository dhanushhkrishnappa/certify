export interface SkillDimensionSpec {
  slug: string;
  name: string;
  description: string;
  displayOrder: number;
}

export const PYTHON_SKILL_DIMENSIONS: SkillDimensionSpec[] = [
  {
    slug: "execution-and-memory",
    name: "Execution Model & Memory Semantics",
    description: "REPL vs script execution, indentation scoping, object references, heap identity, and mutability.",
    displayOrder: 1,
  },
  {
    slug: "control-flow-and-logic",
    name: "Boolean Logic, Branching & Iteration",
    description: "Short-circuit evaluation, guard clauses, loop invariants, termination, and state updates.",
    displayOrder: 2,
  },
  {
    slug: "data-structures",
    name: "Collections, Hashing & Data Transformation",
    description: "Choosing between list, tuple, dict, and set; hashability invariants; comprehensions and slicing.",
    displayOrder: 3,
  },
  {
    slug: "modularity-and-functions",
    name: "Functions, Scope & Python Ecosystem",
    description: "LEGB scope resolution, pure functions, mutable default pitfalls, standard library, and packaging.",
    displayOrder: 4,
  },
  {
    slug: "debugging-and-resilience",
    name: "Exception Handling & Systematic Debugging",
    description: "Specific exception catching, EAFP vs LBYL, traceback analysis, and defensive boundaries.",
    displayOrder: 5,
  },
  {
    slug: "testing-and-quality",
    name: "Unit Testing & Code Quality",
    description: "pytest test design, Arrange-Act-Assert, edge-case coverage, parametrization, and refactoring.",
    displayOrder: 6,
  },
  {
    slug: "file-io-and-text-parsing",
    name: "File I/O, Streaming & Regular Expressions",
    description: "Context managers (with), CSV/JSON streaming, encoding safety, regex anchors, and capture groups.",
    displayOrder: 7,
  },
  {
    slug: "oop-architecture",
    name: "Object-Oriented Design & Encapsulation",
    description: "Classes, __init__, properties, dunder protocols, invariant enforcement, and composition vs inheritance.",
    displayOrder: 8,
  },
];

export interface ModuleTaxonomySpec {
  order: number;
  slug: string;
  practicalTaskId: string;
  practicalDescription: string;
  primarySkillSlug: string;
  secondarySkillSlugs: string[];
  keywords: string[];
}

export const PYTHON_MODULE_TAXONOMY: Record<number, ModuleTaxonomySpec> = {
  1: {
    order: 1,
    slug: "python-foundations",
    practicalTaskId: "practical-m01-normalize-inventory",
    practicalDescription: "Write `normalize_inventory(items)` to normalize stripped lowercase keys and integer quantities without mutating the caller's input list or dicts.",
    primarySkillSlug: "execution-and-memory",
    secondarySkillSlugs: ["data-structures"],
    keywords: [
      "repl", "script", "interpreter", "indentation", "indentationerror", "syntaxerror",
      "variable", "reference", "heap", "object", "id()", "mutability", "mutable", "immutable",
      "aliasing", "copy", "int", "float", "str", "input", "f-string", "modulo", "floor division",
      "list", "tuple", "dict", "dictionary", "set", "hashable", "typeerror"
    ],
  },
  2: {
    order: 2,
    slug: "decision-making",
    practicalTaskId: "practical-m02-classify-ticket",
    practicalDescription: "Write `classify_ticket(age, is_student)` returning 'child', 'student', 'senior', or 'adult' using clean non-overlapping conditional branches.",
    primarySkillSlug: "control-flow-and-logic",
    secondarySkillSlugs: [],
    keywords: [
      "if", "elif", "else", "boolean", "truthy", "falsy", "short-circuit", "and", "or", "not",
      "match", "case", "guard clause", "comparison", "chained comparison", "ternary"
    ],
  },
  3: {
    order: 3,
    slug: "iteration-and-problem-solving",
    practicalTaskId: "practical-m03-filter-active",
    practicalDescription: "Write `filter_active(records)` returning uppercase names of active records with score >= threshold using clean iteration or comprehension.",
    primarySkillSlug: "control-flow-and-logic",
    secondarySkillSlugs: ["data-structures"],
    keywords: [
      "for loop", "while loop", "iterable", "iterator", "range", "enumerate", "zip",
      "break", "continue", "infinite loop", "accumulator", "comprehension", "list comprehension",
      "nested loop", "loop invariant"
    ],
  },
  4: {
    order: 4,
    slug: "functions-and-modular-programming",
    practicalTaskId: "practical-m04-moving-average",
    practicalDescription: "Write `moving_average(values, window)` returning rounded rolling averages with clean validation and no mutable default argument bugs.",
    primarySkillSlug: "modularity-and-functions",
    secondarySkillSlugs: ["execution-and-memory"],
    keywords: [
      "def", "function", "parameter", "argument", "return", "none", "legb", "scope",
      "local", "global", "enclosing", "closure", "default argument", "mutable default",
      "*args", "**kwargs", "lambda", "pure function", "side effect", "docstring"
    ],
  },
  5: {
    order: 5,
    slug: "exceptions-and-debugging",
    practicalTaskId: "practical-m05-safe-parse-records",
    practicalDescription: "Write `safe_parse_records(raw_lines)` parsing valid records while safely collecting malformed entries via specific exception handling.",
    primarySkillSlug: "debugging-and-resilience",
    secondarySkillSlugs: [],
    keywords: [
      "try", "except", "finally", "raise", "exception", "valueerror", "keyerror",
      "zerodivisionerror", "traceback", "stack trace", "eafp", "lbyl", "custom exception",
      "breakpoint", "pdb", "bare except", "debugging"
    ],
  },
  6: {
    order: 6,
    slug: "libraries-and-python-ecosystem",
    practicalTaskId: "practical-m06-stats-summary",
    practicalDescription: "Write `stats_summary(numbers)` using Python standard library utilities to return count, mean, median, and min/max safely.",
    primarySkillSlug: "modularity-and-functions",
    secondarySkillSlugs: [],
    keywords: [
      "import", "module", "package", "pip", "venv", "virtual environment", "requirements.txt",
      "stdlib", "standard library", "statistics", "math", "datetime", "collections",
      "__name__", "__main__", "circular import", "api", "requests"
    ],
  },
  7: {
    order: 7,
    slug: "unit-testing-and-code-quality",
    practicalTaskId: "practical-m07-tdd-discount",
    practicalDescription: "Write `apply_discount(price, percent)` handling boundary conditions (0%, 100%, invalid negative or >100% values raising ValueError).",
    primarySkillSlug: "testing-and-quality",
    secondarySkillSlugs: ["debugging-and-resilience"],
    keywords: [
      "pytest", "unittest", "assert", "assertion", "tdd", "test driven", "unit test",
      "edge case", "fixture", "parametrize", "mock", "mocking", "coverage",
      "arrange act assert", "regression", "flake8", "ruff", "type hint"
    ],
  },
  8: {
    order: 8,
    slug: "file-handling-and-data-processing",
    practicalTaskId: "practical-m08-stream-filter",
    practicalDescription: "Write `stream_filter(lines, prefix)` lazily filtering and normalizing lines with O(1) extra memory via generator or clean iteration.",
    primarySkillSlug: "file-io-and-text-parsing",
    secondarySkillSlugs: ["data-structures"],
    keywords: [
      "with open", "context manager", "file handle", "csv", "json", "utf-8", "encoding",
      "readline", "readlines", "streaming", "generator", "yield", "pathlib", "io",
      "filedescriptor", "buffering"
    ],
  },
  9: {
    order: 9,
    slug: "regular-expressions",
    practicalTaskId: "practical-m09-extract-codes",
    practicalDescription: "Write `extract_codes(text)` using Python `re` to extract normalized structured tokens matching exact boundary rules.",
    primarySkillSlug: "file-io-and-text-parsing",
    secondarySkillSlugs: [],
    keywords: [
      "regex", "regular expression", "re.search", "re.match", "re.findall", "re.sub",
      "re.compile", "raw string", "capture group", "non-capturing", "lookahead",
      "lookbehind", "quantifier", "greedy", "lazy", "anchor", "character class", "backtracking"
    ],
  },
  10: {
    order: 10,
    slug: "object-oriented-programming",
    practicalTaskId: "practical-m10-gradebook-class",
    practicalDescription: "Implement class `GradeBook` with `__init__`, `add_score(student, score)`, `average(student)`, validation invariants, and `__repr__`.",
    primarySkillSlug: "oop-architecture",
    secondarySkillSlugs: ["modularity-and-functions"],
    keywords: [
      "class", "object oriented", "oop", "__init__", "self", "instance", "attribute",
      "method", "@property", "setter", "encapsulation", "inheritance", "super()",
      "polymorphism", "composition", "dunder", "__str__", "__repr__", "__eq__",
      "classmethod", "staticmethod", "metaclass", "dataclass"
    ],
  },
};

export interface SlicedLessonSection {
  sectionType:
    | "CONCEPT_INTUITION"
    | "TECHNICAL_MECHANICS"
    | "PITFALLS_AND_DEBUGGING"
    | "CHAPTER_CHECKPOINT"
    | "MODULE_PRACTICAL";
  title: string;
  objective: string;
  sequenceOrder: number;
  content: string;
  minTurns: number;
  requiredForAdvance: boolean;
}

/**
 * Deterministically slices a 20-heading authored lesson markdown document into
 * 4 ordered pedagogical sections (plus optional 5th MODULE_PRACTICAL capstone).
 */
export function sliceLessonIntoSections(params: {
  lessonMarkdown: string;
  chapterTitle: string;
  conceptName: string;
  isFinalChapterOfModule: boolean;
  practicalTask?: { taskId: string; description: string } | null;
}): SlicedLessonSection[] {
  const { lessonMarkdown, chapterTitle, conceptName, isFinalChapterOfModule, practicalTask } = params;

  const headingBlocks = new Map<number, string>();
  const rawParts = lessonMarkdown.split(/\n(?=##\s+\d+\.)/g);

  for (const part of rawParts) {
    const match = part.match(/^##\s+(\d+)\./);
    if (match) {
      const num = parseInt(match[1], 10);
      headingBlocks.set(num, part.trim());
    }
  }

  const collectRange = (start: number, end: number, fallback: string): string => {
    const chunks: string[] = [];
    for (let i = start; i <= end; i++) {
      const block = headingBlocks.get(i);
      if (block) chunks.push(block);
    }
    return chunks.length > 0 ? chunks.join("\n\n") : fallback;
  };

  const sections: SlicedLessonSection[] = [
    {
      sectionType: "CONCEPT_INTUITION",
      title: "1. Core Intuition & Mental Model",
      objective: `Build an accurate first-principles mental model of ${conceptName} (why it exists, what problem it solves, and the intuitive analogy) before writing complex syntax.`,
      sequenceOrder: 1,
      content: collectRange(1, 5, lessonMarkdown.slice(0, 1200)),
      minTurns: 1,
      requiredForAdvance: true,
    },
    {
      sectionType: "TECHNICAL_MECHANICS",
      title: "2. Technical Mechanics & Execution Trace",
      objective: `Trace step-by-step how Python executes ${conceptName}, predicting runtime state, memory/identity behavior, and expected outputs.`,
      sequenceOrder: 2,
      content: collectRange(6, 12, lessonMarkdown.slice(0, 1800)),
      minTurns: 1,
      requiredForAdvance: true,
    },
    {
      sectionType: "PITFALLS_AND_DEBUGGING",
      title: "3. Common Pitfalls & Debugging",
      objective: `Identify common mistakes, distinguish incorrect vs. correct patterns, and systematically debug errors related to ${conceptName}.`,
      sequenceOrder: 3,
      content: collectRange(13, 17, `Common pitfalls, edge cases, and debugging strategies for ${chapterTitle}.`),
      minTurns: 1,
      requiredForAdvance: true,
    },
    {
      sectionType: "CHAPTER_CHECKPOINT",
      title: "4. Conceptual Checkpoint",
      objective: `Pass the structured rubric-evaluated checkpoint assessment for ${chapterTitle} (score >= 70% with zero unresolved core misconceptions) to unlock the next chapter.`,
      sequenceOrder: 4,
      content: collectRange(18, 20, `Review summary and pass the chapter verification checkpoint for ${chapterTitle}.`),
      minTurns: 0,
      requiredForAdvance: true,
    },
  ];

  if (isFinalChapterOfModule && practicalTask) {
    sections.push({
      sectionType: "MODULE_PRACTICAL",
      title: "5. Module Practical Coding Verification",
      objective: `Implement and pass the deterministic unit test harness for ${practicalTask.taskId} to complete this module and unlock the next module.`,
      sequenceOrder: 5,
      content: `### Module Practical Task: \`${practicalTask.taskId}\`\n\n${practicalTask.description}\n\nYour solution is evaluated deterministically against hidden and edge-case unit tests. Passing (>= 80% tests passed) unlocks the next module.`,
      minTurns: 0,
      requiredForAdvance: true,
    });
  }

  return sections;
}

/**
 * Deterministically derives cognitive taxonomy level, skill dimensions,
 * and misconception detectors for a rubric criterion statement.
 */
export function deriveCriterionTaxonomy(params: {
  moduleOrder: number;
  conceptSlug: string;
  statement: string;
  tierRequired: string;
  indexInConcept: number;
}): {
  criterionCode: string;
  cognitiveLevel: "RECALL" | "EXPLAIN" | "APPLY" | "DEBUG" | "REASON";
  skillSlugs: string[];
  expectedConcepts: string[];
  misconceptions: Array<{ tag: string; pattern: string; explanation: string }>;
} {
  const lower = params.statement.toLowerCase();

  let cognitiveLevel: "RECALL" | "EXPLAIN" | "APPLY" | "DEBUG" | "REASON" = "EXPLAIN";
  if (/\b(debug|diagnos|fix|error|bug|traceback|exception|trap|pitfall|avoid)\b/.test(lower)) {
    cognitiveLevel = "DEBUG";
  } else if (/\b(predict|why|reason|compare|contrast|trade-?off|complexity|hash|cannot|immutable|aliasing)\b/.test(lower)) {
    cognitiveLevel = "REASON";
  } else if (/\b(write|apply|implement|convert|use|select|build|construct|filter|parse|extract)\b/.test(lower)) {
    cognitiveLevel = "APPLY";
  } else if (/\b(define|list|identify|name|recall)\b/.test(lower)) {
    cognitiveLevel = "RECALL";
  }

  const modTax = PYTHON_MODULE_TAXONOMY[params.moduleOrder] || PYTHON_MODULE_TAXONOMY[1];
  const skillSet = new Set<string>([modTax.primarySkillSlug]);
  if (/\b(list|tuple|dict|set|collection|hash|comprehension)\b/.test(lower)) {
    skillSet.add("data-structures");
  }
  if (/\b(mutable|immutable|reference|memory|heap|alias|id\(|indent|repl)\b/.test(lower)) {
    skillSet.add("execution-and-memory");
  }
  if (/\b(exception|error|try|except|traceback|debug|raise)\b/.test(lower)) {
    skillSet.add("debugging-and-resilience");
  }
  if (/\b(test|pytest|assert|edge case|mock)\b/.test(lower)) {
    skillSet.add("testing-and-quality");
  }

  // Extract significant semantic terms from statement (>= 4 chars, excluding stop words)
  const stopWords = new Set([
    "that", "this", "with", "from", "into", "when", "where", "which", "while",
    "rather", "than", "without", "between", "using", "their", "about", "accurately",
    "appropriately", "correctly", "clearly", "explains", "distinguishes", "articulates",
    "predicts", "applies", "selects", "demonstrates", "mastery", "core", "concepts"
  ]);
  const expectedConcepts = Array.from(
    new Set(
      lower
        .replace(/[^a-z0-9_+#/\s-]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length >= 3 && !stopWords.has(w))
    )
  ).slice(0, 12);

  const misconceptions: Array<{ tag: string; pattern: string; explanation: string }> = [];
  if (lower.includes("mutab") || lower.includes("alias") || lower.includes("reference")) {
    misconceptions.push(
      {
        tag: "LIST_IMMUTABLE_CONFUSION",
        pattern: "\\blists?\\s+(are|is)\\s+immutable\\b",
        explanation: "Python lists are mutable; tuples and strings are immutable.",
      },
      {
        tag: "TUPLE_MUTABLE_CONFUSION",
        pattern: "\\btuples?\\s+(are|is)\\s+mutable\\b",
        explanation: "Python tuples are immutable sequences.",
      },
      {
        tag: "VALUE_COPY_CONFUSION",
        pattern: "\\bvariables?\\s+(are\\s+not|aren't)\\s+(references?|pointers?|bound)\\b",
        explanation: "Python variables bind names to heap object references, not raw memory boxes.",
      }
    );
  }
  if (lower.includes("indent")) {
    misconceptions.push({
      tag: "BRACES_FOR_BLOCKS",
      pattern: "\\b(curly\\s+braces?|indentation\\s+is\\s+optional)\\b",
      explanation: "Python defines code blocks strictly through indentation, not curly braces.",
    });
  }
  if (lower.includes("dict") && lower.includes("key")) {
    misconceptions.push({
      tag: "MUTABLE_DICT_KEY",
      pattern: "\\blists?\\s+can\\s+(be|serve\\s+as)\\s+(a\\s+)?dict(ionary)?\\s+keys?\\b",
      explanation: "Mutable lists are unhashable and raise TypeError when used as dictionary keys.",
    });
  }
  if (lower.includes("default") || lower.includes("scope")) {
    misconceptions.push({
      tag: "MUTABLE_DEFAULT_PER_CALL",
      pattern: "\\bdefault\\s+arguments?\\s+(are|is)\\s+(re)?created\\s+(every|each)\\s+call\\b",
      explanation: "Default arguments are evaluated once at function definition time (`def`), not per call.",
    });
  }

  const modNum = String(params.moduleOrder).padStart(2, "0");
  const idxNum = String(params.indexInConcept + 1).padStart(2, "0");
  const shortSlug = params.conceptSlug.slice(0, 10).toUpperCase().replace(/[^A-Z0-9]/g, "");

  return {
    criterionCode: `M${modNum}-${shortSlug}-R${idxNum}`,
    cognitiveLevel,
    skillSlugs: Array.from(skillSet),
    expectedConcepts,
    misconceptions,
  };
}
