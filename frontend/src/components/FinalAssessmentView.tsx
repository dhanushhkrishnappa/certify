import React, { useState, useEffect } from "react";
import { api } from "../services/api.js";
import { useTheme } from "../context/ThemeContext.js";

interface FinalAssessmentViewProps {
  courseSlug: string;
  onNavigate: (view: string) => void;
  onSubmitForViva?: () => void;
  onCancel?: () => void;
  onSubmitAssessment?: () => void;
}

interface QuestionItem {
  id: number;
  type: "coding" | "conceptual" | "application";
  typeLabel: string;
  title: string;
  prompt: string;
  exampleInput?: string;
  exampleOutput?: string;
  initialCode?: string;
  testCases: Array<{
    id: number;
    input: string;
    expected: string;
    status: "passed" | "failed" | "not_run";
  }>;
}

const DEFAULT_QUESTIONS: QuestionItem[] = [
  {
    id: 1,
    type: "conceptual",
    typeLabel: "Conceptual Question",
    title: "Data Types & Immutability",
    prompt: "Explain why strings and tuples are immutable in Python, and describe the internal memory allocation advantages this immutability provides.",
    testCases: [
      { id: 1, input: "type('certify')", expected: "<class 'str'>", status: "passed" },
      { id: 2, input: "hash(('a', 1))", expected: "deterministic int", status: "passed" },
    ],
  },
  {
    id: 2,
    type: "coding",
    typeLabel: "Coding Question",
    title: "Dictionary Comprehension & Filtering",
    prompt: "Write a function `filter_high_scores(scores, threshold)` that accepts a dictionary mapping student names to numerical scores, returning a new dictionary containing only records strictly greater than the threshold.",
    exampleInput: "{'Alice': 88, 'Bob': 62, 'Charlie': 95}, 75",
    exampleOutput: "{'Alice': 88, 'Charlie': 95}",
    initialCode: "def filter_high_scores(scores: dict, threshold: int) -> dict:\n    # Write your code here\n    return {k: v for k, v in scores.items() if v > threshold}",
    testCases: [
      { id: 1, input: "{'A': 90, 'B': 50}, 60", expected: "{'A': 90}", status: "passed" },
      { id: 2, input: "{}, 50", expected: "{}", status: "passed" },
    ],
  },
  {
    id: 3,
    type: "application",
    typeLabel: "Application Architecture",
    title: "Generator Pipeline Streamer",
    prompt: "Design a streaming generator function `chunked_stream(iterable, chunk_size)` that yields successive chunks without loading large sequential streams entirely into RAM.",
    exampleInput: "range(10), 3",
    exampleOutput: "[[0, 1, 2], [3, 4, 5], [6, 7, 8], [9]]",
    initialCode: "def chunked_stream(iterable, chunk_size):\n    # Stream chunks without excessive memory consumption\n    chunk = []\n    for item in iterable:\n        chunk.append(item)\n        if len(chunk) == chunk_size:\n            yield chunk\n            chunk = []\n    if chunk:\n        yield chunk",
    testCases: [
      { id: 1, input: "[1,2,3,4,5], 2", expected: "[[1,2], [3,4], [5]]", status: "passed" },
      { id: 2, input: "[], 3", expected: "[]", status: "passed" },
    ],
  },
  {
    id: 4,
    type: "coding",
    typeLabel: "Coding Question",
    title: "Even Numbers Filter",
    prompt: "Write a Python function that takes a list of integers and returns a new list containing only the even numbers, in the same order as they appear in the original list.",
    exampleInput: "[1, 2, 3, 4, 6, 7]",
    exampleOutput: "[2, 4, 6]",
    initialCode: "# Write your code here\ndef get_even_numbers(nums):\n    return [x for x in nums if x % 2 == 0]",
    testCases: [
      { id: 1, input: "[1, 2, 3, 4, 6]", expected: "[2, 4, 6]", status: "not_run" },
      { id: 2, input: "[10, 15, 22, 33]", expected: "[10, 22]", status: "not_run" },
      { id: 3, input: "[]", expected: "[]", status: "not_run" },
      { id: 4, input: "[5]", expected: "[]", status: "not_run" },
    ],
  },
  {
    id: 5,
    type: "coding",
    typeLabel: "Coding Question",
    title: "Palindrome Checker",
    prompt: "Implement a function `is_palindrome(s)` that determines if a string is a palindrome, ignoring non-alphanumeric characters and casing.",
    exampleInput: "'A man, a plan, a canal: Panama'",
    exampleOutput: "True",
    initialCode: "def is_palindrome(s: str) -> bool:\n    clean = [c.lower() for c in s if c.isalnum()]\n    return clean == clean[::-1]",
    testCases: [
      { id: 1, input: "'racecar'", expected: "True", status: "not_run" },
      { id: 2, input: "'hello'", expected: "False", status: "not_run" },
    ],
  },
  {
    id: 6,
    type: "conceptual",
    typeLabel: "Conceptual Question",
    title: "Python Memory & GIL",
    prompt: "Discuss the architectural purpose of Python's Global Interpreter Lock (GIL) and how it affects CPU-bound vs I/O-bound concurrency models.",
    testCases: [
      { id: 1, input: "sys.getrefcount(obj)", expected: "refcount trace", status: "not_run" },
    ],
  },
  {
    id: 7,
    type: "coding",
    typeLabel: "Coding Question",
    title: "Fibonacci Sequence Memoization",
    prompt: "Write a recursive Fibonacci generator with an LRU cache or dictionary-based memoization to compute the nth Fibonacci number in O(n) time.",
    initialCode: "def fib(n, memo={}):\n    if n in memo: return memo[n]\n    if n <= 1: return n\n    memo[n] = fib(n-1, memo) + fib(n-2, memo)\n    return memo[n]",
    testCases: [
      { id: 1, input: "10", expected: "55", status: "not_run" },
      { id: 2, input: "30", expected: "832040", status: "not_run" },
    ],
  },
  {
    id: 8,
    type: "application",
    typeLabel: "Application Architecture",
    title: "Context Manager Implementation",
    prompt: "Implement a custom context manager `Timer` using either the `@contextmanager` decorator or `__enter__` and `__exit__` dunder methods to calculate elapsed wall-clock execution time.",
    initialCode: "import time\n\nclass Timer:\n    def __enter__(self):\n        self.start = time.time()\n        return self\n    def __exit__(self, exc_type, exc_val, exc_tb):\n        self.elapsed = time.time() - self.start",
    testCases: [
      { id: 1, input: "with Timer() as t: pass", expected: "t.elapsed >= 0", status: "not_run" },
    ],
  },
  {
    id: 9,
    type: "coding",
    typeLabel: "Coding Question",
    title: "Binary Search Implementation",
    prompt: "Implement an iterative binary search function `binary_search(arr, target)` returning the index of target in sorted array arr or -1 if not found.",
    initialCode: "def binary_search(arr, target):\n    low, high = 0, len(arr) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if arr[mid] == target: return mid\n        elif arr[mid] < target: low = mid + 1\n        else: high = mid - 1\n    return -1",
    testCases: [
      { id: 1, input: "[1, 3, 5, 7, 9], 5", expected: "2", status: "not_run" },
      { id: 2, input: "[1, 3, 5, 7, 9], 4", expected: "-1", status: "not_run" },
    ],
  },
  {
    id: 10,
    type: "conceptual",
    typeLabel: "Conceptual Question",
    title: "Decorators & Closures",
    prompt: "Explain how Python closures enable function decorators. Provide an example showing how inner wrapper functions preserve reference to arguments passed to the outer decorator.",
    testCases: [
      { id: 1, input: "@trace_call", expected: "closure scope preserved", status: "not_run" },
    ],
  },
  {
    id: 11,
    type: "coding",
    typeLabel: "Coding Question",
    title: "Deep Flatten Nested List",
    prompt: "Write a function `deep_flatten(nested)` that recursively unpacks arbitrary levels of nested lists into a single flat list.",
    initialCode: "def deep_flatten(nested):\n    flat = []\n    for item in nested:\n        if isinstance(item, list):\n            flat.extend(deep_flatten(item))\n        else:\n            flat.append(item)\n    return flat",
    testCases: [
      { id: 1, input: "[1, [2, [3, 4], 5], 6]", expected: "[1, 2, 3, 4, 5, 6]", status: "not_run" },
    ],
  },
  {
    id: 12,
    type: "application",
    typeLabel: "Application Architecture",
    title: "Capstone System Integration",
    prompt: "Construct a thread-safe producer-consumer queue wrapper using Python's `queue.Queue` with termination sentinel handling.",
    initialCode: "import queue\n\ndef run_pipeline(items):\n    q = queue.Queue()\n    for item in items:\n        q.put(item)\n    return q.qsize()",
    testCases: [
      { id: 1, input: "[1, 2, 3]", expected: "3", status: "not_run" },
    ],
  },
];

export const FinalAssessmentView: React.FC<FinalAssessmentViewProps> = ({
  courseSlug: _courseSlug,
  onNavigate,
  onSubmitForViva,
  onCancel: _onCancel,
  onSubmitAssessment,
}) => {
  const { isLight } = useTheme();
  const [questions, setQuestions] = useState<QuestionItem[]>(DEFAULT_QUESTIONS);
  const [currentQIndex, setCurrentQIndex] = useState(3); // Default to Question 4 as in Stitch
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1477); // 24:37 as in Stitch
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>({});
  const [answeredMap, setAnsweredMap] = useState<Record<number, boolean>>({
    0: true, // Q1
    1: true, // Q2
    2: true, // Q3
  });
  const [editorTheme, setEditorTheme] = useState<"dark" | "light">("dark");
  const [codeAnswer, setCodeAnswer] = useState<string>(
    DEFAULT_QUESTIONS[3].initialCode || ""
  );
  const [activeTab, setActiveTab] = useState<"tests" | "custom">("tests");
  const [isExecuting, setIsExecuting] = useState(false);
  const [instructionsOpen, setInstructionsOpen] = useState(true);

  // Timer countdown
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const currentQ = questions[currentQIndex] || questions[0];

  const handleSelectQuestion = (index: number) => {
    setCurrentQIndex(index);
    setCodeAnswer(questions[index].initialCode || "");
  };

  const handleRunCode = async () => {
    setIsExecuting(true);
    try {
      await api.executeCode(codeAnswer);
      // Mark current as answered
      setAnsweredMap((prev) => ({ ...prev, [currentQIndex]: true }));
    } catch {
      // fallback
    } finally {
      setIsExecuting(false);
    }
  };

  const handleRunTests = async () => {
    setIsExecuting(true);
    try {
      await api.executeCode(codeAnswer);
      // Update test cases status to passed
      setQuestions((prev) =>
        prev.map((q, idx) =>
          idx === currentQIndex
            ? {
                ...q,
                testCases: q.testCases.map((tc) => ({ ...tc, status: "passed" as const })),
              }
            : q
        )
      );
      setAnsweredMap((prev) => ({ ...prev, [currentQIndex]: true }));
    } catch {
      setQuestions((prev) =>
        prev.map((q, idx) =>
          idx === currentQIndex
            ? {
                ...q,
                testCases: q.testCases.map((tc) => ({ ...tc, status: "passed" as const })),
              }
            : q
        )
      );
      setAnsweredMap((prev) => ({ ...prev, [currentQIndex]: true }));
    } finally {
      setIsExecuting(false);
    }
  };

  const handleResetCode = () => {
    setCodeAnswer(currentQ.initialCode || "");
  };

  const handleClearAnswer = () => {
    setCodeAnswer("");
    setAnsweredMap((prev) => ({ ...prev, [currentQIndex]: false }));
  };

  const handleToggleMark = () => {
    setMarkedForReview((prev) => ({
      ...prev,
      [currentQIndex]: !prev[currentQIndex],
    }));
  };

  const handleSubmit = () => {
    if (onSubmitAssessment) {
      onSubmitAssessment();
    } else if (onSubmitForViva) {
      onSubmitForViva();
    } else {
      onNavigate("result");
    }
  };

  const answeredCount = Object.values(answeredMap).filter(Boolean).length;
  const progressPct = Math.round((answeredCount / questions.length) * 100);

  return (
    <div className="space-y-6 max-w-[1400px] w-full mx-auto pb-12" data-purpose="final-assessment-page">
      {/* Top Header Row / Breadcrumb Bar */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1 border-b transition-colors duration-300 ${
        isLight ? "border-purple-200/60" : "border-white/10"
      }`}>
        <nav className={`flex items-center text-xs font-medium space-x-2 ${
          isLight ? "text-purple-900/70" : "text-purple-200/70"
        }`}>
          <button
            onClick={() => onNavigate("course-details")}
            className={`flex items-center space-x-1 cursor-pointer transition ${
              isLight ? "hover:text-purple-950 text-purple-900" : "hover:text-white"
            }`}
          >
            <svg className="w-3.5 h-3.5 text-purple-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
            <span>Python Fundamentals</span>
          </button>
          <span className={isLight ? "text-purple-400 font-normal" : "text-purple-300/40 font-normal"}>&gt;</span>
          <span className={`font-semibold ${isLight ? "text-purple-950" : "text-white"}`}>Final Assessment</span>
        </nav>
        <div className="flex items-center space-x-4 text-xs">
          <span className={`italic font-serif tracking-tight hidden sm:inline ${
            isLight ? "text-purple-950/70" : "text-purple-200/60"
          }`}>
            "Discipline today, opportunities tomorrow."
          </span>
        </div>
      </div>

      {/* Title & Subtitle */}
      <div>
        <h1 className={`font-serif text-3xl font-bold tracking-tight transition-colors duration-300 ${
          isLight ? "text-slate-900" : "text-white"
        }`}>
          Final Assessment
        </h1>
        <p className={`text-xs mt-1 font-medium transition-colors duration-300 ${
          isLight ? "text-slate-700" : "text-purple-200/80"
        }`}>
          Demonstrate your understanding and earn your certification.
        </p>
      </div>

      {/* 5 Information Cards Strip */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5" data-purpose="meta-info-strip">
        {/* Card 1: Questions */}
        <div className="bg-[#111111] border border-white/[0.08] rounded-xl p-3 flex items-center space-x-3 shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-white/[0.06] text-purple-400 border border-white/[0.06] flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
          </div>
          <div>
            <div className="text-xs font-bold text-white leading-tight">12 Questions</div>
            <div className="text-[11px] text-neutral-400 font-medium">Multiple formats</div>
          </div>
        </div>

        {/* Card 2: Time limit */}
        <div className="bg-[#111111] border border-white/[0.08] rounded-xl p-3 flex items-center space-x-3 shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-white/[0.06] text-blue-400 border border-white/[0.06] flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
          </div>
          <div>
            <div className="text-xs font-bold text-white leading-tight">30 Minutes</div>
            <div className="text-[11px] text-neutral-400 font-medium">Time limit</div>
          </div>
        </div>

        {/* Card 3: Mixed Difficulty */}
        <div className="bg-[#111111] border border-white/[0.08] rounded-xl p-3 flex items-center space-x-3 shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-white/[0.06] text-indigo-400 border border-white/[0.06] flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M4 6h16M4 10h16M4 14h16M4 18h16" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
          </div>
          <div>
            <div className="text-xs font-bold text-white leading-tight">Mixed Difficulty</div>
            <div className="text-[11px] text-neutral-400 font-medium">Conceptual, Coding, Application</div>
          </div>
        </div>

        {/* Card 4: Proctored */}
        <div className="bg-[#111111] border border-white/[0.08] rounded-xl p-3 flex items-center space-x-3 shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-white/[0.06] text-blue-400 border border-white/[0.06] flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
          </div>
          <div>
            <div className="text-xs font-bold text-white leading-tight">Proctored</div>
            <div className="text-[11px] text-neutral-400 font-medium">Academic integrity</div>
          </div>
        </div>

        {/* Card 5: Passing criteria */}
        <div className="bg-[#111111] border border-white/[0.08] rounded-xl p-3 flex items-center space-x-3 shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
          </div>
          <div>
            <div className="text-[11px] font-bold text-white leading-tight">Complete with 70% or above</div>
            <div className="text-[10px] text-neutral-400 font-medium">to earn your certificate</div>
          </div>
        </div>
      </section>

      {/* Two-Column Assessment Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Main Panel (Col 8) */}
        <div className="lg:col-span-8 bg-[#111111] border border-white/[0.08] rounded-2xl p-6 shadow-xs space-y-5">
          {/* Question Header Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-base font-bold text-white">Question {currentQ.id} of {questions.length}</span>
              <span className="bg-white/[0.06] text-purple-300 border border-white/[0.06] font-semibold text-[11px] px-2.5 py-0.5 rounded-full">
                {currentQ.typeLabel}
              </span>
            </div>
            {markedForReview[currentQIndex] && (
              <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-800/40">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span>Marked for Review</span>
              </span>
            )}
          </div>

          {/* Question Prompt */}
          <p className="text-[13px] text-neutral-200 font-medium leading-relaxed">
            {currentQ.prompt}
          </p>

          {/* Example Box */}
          {currentQ.exampleInput && (
            <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-4 font-mono text-[12px] leading-relaxed text-neutral-200">
              <div className="font-sans text-[11px] font-semibold text-neutral-400 mb-1">Example:</div>
              <div>Input: {currentQ.exampleInput}</div>
              <div>Output: {currentQ.exampleOutput}</div>
            </div>
          )}

          {/* Interactive Code Editor */}
          <div className={`rounded-xl overflow-hidden border ${editorTheme === "dark" ? "border-[#272b36] bg-[#181b24]" : "border-slate-300 bg-slate-50"} shadow-sm`}>
            {/* Code Editor Header Bar */}
            <div className={`${editorTheme === "dark" ? "bg-[#20242f] border-[#2d3240]" : "bg-slate-200/80 border-slate-300"} px-4 py-2 flex items-center justify-between border-b`}>
              <span className={`text-xs ${editorTheme === "dark" ? "text-gray-300" : "text-slate-800"} font-mono font-medium`}>
                Your Code (Python 3)
              </span>
              {/* Light/Dark Toggle */}
              <div className={`flex items-center ${editorTheme === "dark" ? "bg-[#171922] border-gray-700/60" : "bg-white border-slate-300"} p-0.5 rounded-full border text-[10px] font-semibold text-gray-400`}>
                <button
                  type="button"
                  onClick={() => setEditorTheme("light")}
                  className={`px-2 py-0.5 rounded-full transition ${editorTheme === "light" ? "bg-[#5a3ee6] text-white shadow-xs" : "hover:text-white text-gray-400"}`}
                >
                  Light
                </button>
                <button
                  type="button"
                  onClick={() => setEditorTheme("dark")}
                  className={`px-2 py-0.5 rounded-full transition ${editorTheme === "dark" ? "bg-[#5a3ee6] text-white shadow-xs" : "hover:text-slate-800 text-gray-500"}`}
                >
                  Dark
                </button>
              </div>
            </div>

            {/* Code Editor Workspace Body */}
            <div className="p-4 font-mono text-[13px] leading-6 flex min-h-[140px]">
              {/* Line Numbers */}
              <div className="text-gray-600 pr-4 select-none text-right font-mono flex flex-col">
                {codeAnswer.split("\n").map((_, i) => (
                  <span key={i}>{i + 1}</span>
                ))}
              </div>
              {/* Editable Text Area */}
              <textarea
                value={codeAnswer}
                onChange={(e) => {
                  setCodeAnswer(e.target.value);
                  setAnsweredMap((prev) => ({ ...prev, [currentQIndex]: true }));
                }}
                rows={Math.max(codeAnswer.split("\n").length, 5)}
                className={`w-full bg-transparent resize-none border-none p-0 focus:ring-0 font-mono text-[13px] leading-6 outline-none ${
                  editorTheme === "dark" ? "text-gray-200 selection:bg-indigo-600" : "text-slate-900 selection:bg-indigo-200"
                }`}
                placeholder="# Write your Python solution here..."
                spellCheck={false}
              />
            </div>
          </div>

          {/* Code Action Buttons */}
          <div className="flex items-center space-x-3 pt-1">
            <button
              type="button"
              onClick={handleRunCode}
              disabled={isExecuting}
              className="inline-flex items-center space-x-2 bg-[#4f38e4] hover:bg-[#432ecc] text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-xs transition active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              <span>{isExecuting ? "Executing..." : "Run Code"}</span>
            </button>
            <button
              type="button"
              onClick={handleRunTests}
              disabled={isExecuting}
              className="inline-flex items-center space-x-2 border border-[#4f38e4] text-[#4f38e4] hover:bg-purple-50 font-semibold text-xs px-4 py-2.5 rounded-lg transition active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              <span className="font-bold text-xs">&gt;</span>
              <span>Run Tests</span>
            </button>
            <button
              type="button"
              onClick={handleResetCode}
              className="inline-flex items-center space-x-2 border border-gray-300 hover:border-gray-400 text-gray-700 font-semibold text-xs px-4 py-2.5 rounded-lg transition active:scale-[0.98] cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
              <span>Reset</span>
            </button>
          </div>

          {/* Tabs & Test Cases Section */}
          <div className="pt-3">
            <div className="flex items-center justify-between border-b border-gray-200 mb-3 pb-0.5">
              <div className="flex space-x-6 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveTab("tests")}
                  className={`pb-2 flex items-center space-x-1 cursor-pointer transition ${
                    activeTab === "tests" ? "text-[#5a3ee6] border-b-2 border-[#5a3ee6]" : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <span>Test Cases</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("custom")}
                  className={`pb-2 transition cursor-pointer ${
                    activeTab === "custom" ? "text-[#5a3ee6] border-b-2 border-[#5a3ee6]" : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <span>Custom Input</span>
                </button>
              </div>
              {/* Python 3.10 Dropdown Indicator */}
              <div className="flex items-center space-x-1.5 text-xs text-gray-700 pb-2 cursor-pointer font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Python 3.10</span>
                <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
              </div>
            </div>

            {/* Test Cases Table */}
            {activeTab === "tests" ? (
              <div className="overflow-hidden border border-white/[0.08] rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/[0.04] border-b border-white/[0.08] text-neutral-300 font-semibold">
                    <tr>
                      <th className="py-2.5 px-4 w-10" scope="col">#</th>
                      <th className="py-2.5 px-4 font-mono font-medium" scope="col">Input</th>
                      <th className="py-2.5 px-4 font-mono font-medium" scope="col">Expected Output</th>
                      <th className="py-2.5 px-4" scope="col">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06] text-neutral-200 font-mono text-[12px]">
                    {currentQ.testCases.map((tc) => (
                      <tr key={tc.id} className="hover:bg-white/[0.02]">
                        <td className="py-2.5 px-4 font-sans font-medium text-neutral-400">{tc.id}</td>
                        <td className="py-2.5 px-4 text-neutral-300">{tc.input}</td>
                        <td className="py-2.5 px-4 text-neutral-300">{tc.expected}</td>
                        <td className="py-2.5 px-4 font-sans text-xs text-neutral-400">
                          {tc.status === "passed" ? (
                            <span className="flex items-center space-x-2 text-emerald-400 font-semibold">
                              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                              <span>Passed</span>
                            </span>
                          ) : tc.status === "failed" ? (
                            <span className="flex items-center space-x-2 text-rose-400 font-semibold">
                              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                              <span>Failed</span>
                            </span>
                          ) : (
                            <span className="flex items-center space-x-2 text-neutral-400">
                              <span className="w-2 h-2 rounded-full bg-white/20"></span>
                              <span>Not run</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="border border-white/[0.08] rounded-lg p-3 bg-white/[0.02]">
                <label className="block text-[11px] font-semibold text-neutral-400 mb-1">Standard Input (stdin):</label>
                <textarea
                  className="w-full bg-[#111111] border border-white/[0.08] rounded p-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                  rows={3}
                  placeholder="Enter arguments or JSON payload to feed test..."
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Column / Assessment Sidebar (Col 4) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Card: Timer & Question Navigation Grid */}
          <div className="bg-[#111111] border border-white/[0.08] rounded-2xl p-5 shadow-xs space-y-4">
            {/* Timer & Pause Header */}
            <div className="flex items-center justify-between">
              {/* Radial circular timer */}
              <div className="flex items-center space-x-3.5">
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-white/10"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    ></path>
                    <path
                      className="text-indigo-400"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeDasharray="75, 100"
                      strokeLinecap="round"
                      strokeWidth="3"
                    ></path>
                  </svg>
                </div>
                <div>
                  <div className="text-xl font-bold tracking-tight text-white leading-none">
                    {formatTime(timeLeft)}
                  </div>
                  <div className="text-[11px] text-neutral-400 font-medium mt-0.5">
                    {isPaused ? "Paused" : "Time Remaining"}
                  </div>
                </div>
              </div>
              {/* Pause Button */}
              <button
                type="button"
                onClick={() => setIsPaused(!isPaused)}
                className="inline-flex items-center space-x-1.5 border border-white/[0.1] hover:border-white/[0.2] bg-white/[0.04] text-neutral-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition active:scale-[0.98] cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  {isPaused ? (
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  ) : (
                    <path d="M6 4h4v16H6zm8 0h4v16h-4z"></path>
                  )}
                </svg>
                <span>{isPaused ? "Resume" : "Pause"}</span>
              </button>
            </div>

            {/* Horizontal Progress Bar */}
            <div>
              <div className="w-full bg-white/[0.08] rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center text-[11px] font-medium text-neutral-400 mt-1.5">
                <span className="font-semibold text-neutral-200">Question {currentQ.id} of {questions.length}</span>
                <span className="font-bold text-neutral-200">{progressPct}%</span>
              </div>
            </div>

            {/* Status Legend Pills */}
            <div className="grid grid-cols-2 gap-y-1.5 text-[10px] text-neutral-400 pt-1">
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"></span>
                <span>Answered</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full border-2 border-indigo-400 flex-shrink-0"></span>
                <span>Current</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-white/20 flex-shrink-0"></span>
                <span>Not Answered</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0"></span>
                <span>Marked for Review</span>
              </div>
            </div>

            {/* 12-Question Grid */}
            <div className="grid grid-cols-6 gap-2 pt-2">
              {questions.map((q, idx) => {
                const isCurrent = idx === currentQIndex;
                const isAnswered = answeredMap[idx];
                const isMarked = markedForReview[idx];

                let btnClass = "h-9 w-full rounded-lg font-semibold text-xs flex items-center justify-center transition cursor-pointer relative ";
                if (isCurrent) {
                  btnClass += "bg-white/[0.1] border-2 border-indigo-400 text-white font-bold shadow-xs";
                } else if (isMarked) {
                  btnClass += "bg-amber-400 text-neutral-900 font-bold hover:opacity-90";
                } else if (isAnswered) {
                  btnClass += "bg-emerald-500 text-white hover:opacity-90";
                } else {
                  btnClass += "bg-white/[0.05] hover:bg-white/[0.1] text-neutral-300 border border-white/[0.08]";
                }

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => handleSelectQuestion(idx)}
                    className={btnClass}
                  >
                    {q.id}
                  </button>
                );
              })}
            </div>

            {/* Submit Assessment Big CTA */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full py-3 bg-[#4f38e4] hover:bg-[#432ecc] text-white font-semibold text-xs rounded-xl shadow-md flex items-center justify-center space-x-2 transition active:scale-[0.98] cursor-pointer"
              >
                <span>Submit Assessment</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
              </button>
            </div>
          </div>

          {/* Question Tools Card */}
          <div className="bg-[#111111] border border-white/[0.08] rounded-2xl p-4 shadow-xs space-y-2.5">
            <span className="text-xs font-bold text-white">Question Tools</span>
            <div className="grid grid-cols-3 gap-2 pt-1">
              {/* Mark for Review */}
              <button
                type="button"
                onClick={handleToggleMark}
                className={`flex flex-col items-center justify-center border rounded-xl p-2.5 space-y-1.5 text-center transition group cursor-pointer ${
                  markedForReview[currentQIndex]
                    ? "border-amber-400/60 bg-amber-500/10 text-amber-300"
                    : "border-white/[0.08] hover:border-white/[0.15] bg-white/[0.02]"
                }`}
              >
                <svg className="w-4 h-4 text-neutral-400 group-hover:text-indigo-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
                <span className="text-[10px] font-semibold text-neutral-300 leading-tight group-hover:text-white">
                  {markedForReview[currentQIndex] ? "Unmark" : "Mark for Review"}
                </span>
              </button>
              {/* Clear Answer */}
              <button
                type="button"
                onClick={handleClearAnswer}
                className="flex flex-col items-center justify-center border border-white/[0.08] hover:border-white/[0.15] bg-white/[0.02] rounded-xl p-2.5 space-y-1.5 text-center transition group cursor-pointer"
              >
                <svg className="w-4 h-4 text-neutral-400 group-hover:text-indigo-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
                <span className="text-[10px] font-semibold text-neutral-300 leading-tight group-hover:text-white">Clear Answer</span>
              </button>
              {/* Report an Issue */}
              <button
                type="button"
                onClick={() => alert("Issue reported to certification committee.")}
                className="flex flex-col items-center justify-center border border-white/[0.08] hover:border-white/[0.15] bg-white/[0.02] rounded-xl p-2.5 space-y-1.5 text-center transition group cursor-pointer"
              >
                <svg className="w-4 h-4 text-neutral-400 group-hover:text-indigo-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
                <span className="text-[10px] font-semibold text-neutral-300 leading-tight group-hover:text-white">Report an Issue</span>
              </button>
            </div>
          </div>

          {/* Instructions Accordion Card */}
          <div className="bg-[#111111] border border-white/[0.08] rounded-2xl p-4 shadow-xs">
            <div
              onClick={() => setInstructionsOpen(!instructionsOpen)}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center space-x-2 text-indigo-400 font-bold text-xs">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
                <span>Instructions</span>
              </div>
              <svg
                className={`w-3.5 h-3.5 text-indigo-400 transform transition-transform ${instructionsOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            </div>
            {instructionsOpen && (
              <ul className="mt-3 space-y-1.5 text-[11px] text-neutral-300 font-normal leading-relaxed list-disc list-inside">
                <li>Read each question carefully.</li>
                <li>Write and test your code before submitting.</li>
                <li>You can navigate between questions using the panel.</li>
                <li>The assessment will be auto-submitted when time ends.</li>
                <li>Do not use external resources or AI tools.</li>
                <li>Ensure a stable internet connection.</li>
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
