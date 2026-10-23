import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  AssistantRuntimeProvider,
  useLocalRuntime,
  type ChatModelAdapter,
  ThreadPrimitive,
  MessagePrimitive,
  ComposerPrimitive,
} from "@assistant-ui/react";
import { api } from "../services/api.js";
import type { User, LearningSessionContext } from "../types/index.js";
import { useTheme } from "../context/ThemeContext.js";
import { UserProfileCard } from "./common/UserProfileCard.js";

interface LearningStudioProps {
  courseSlug: string;
  user?: User | null;
  onNavigateVerify?: (credentialId: string) => void;
  onNavigate?: (view: string) => void;
  onLogout?: () => void;
}

export interface LessonItem {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  type: "concept" | "code" | "lab" | "defense";
  socraticPrompt: string;
}

export interface CourseModule {
  id: string;
  number: number;
  title: string;
  lessons: LessonItem[];
}

export const STUDIO_MODULES: CourseModule[] = [
  {
    id: "mod-1",
    number: 1,
    title: "Module 1: CPython Foundations",
    lessons: [
      {
        id: "l1-1",
        title: "CPython Architecture & Bytecode",
        duration: "25 min",
        completed: true,
        type: "concept",
        socraticPrompt: "How does CPython compilation to bytecode (.pyc) differ from JIT compilation in PyPy or JavaScript V8?",
      },
      {
        id: "l1-2",
        title: "Virtual Environments & Isolation",
        duration: "30 min",
        completed: true,
        type: "lab",
        socraticPrompt: "Why does Python recommend isolated virtual environments, and what happens at the sys.path level when a venv is activated?",
      },
      {
        id: "l1-3",
        title: "Variables, Namespaces & Mutability",
        duration: "45 min",
        completed: false,
        type: "code",
        socraticPrompt: "Explain object identity (id()) versus equality (==) for mutable vs immutable objects in Python.",
      },
    ],
  },
  {
    id: "mod-2",
    number: 2,
    title: "Module 2: Iteration & Control Flow",
    lessons: [
      {
        id: "l2-1",
        title: "Short-Circuit Logic & Truthiness",
        duration: "35 min",
        completed: false,
        type: "concept",
        socraticPrompt: "What is returned by 'apple' and '' or 'default' and why? Walk through Python's short-circuit evaluation rules.",
      },
      {
        id: "l2-2",
        title: "Iterator Protocol (__iter__ & __next__)",
        duration: "40 min",
        completed: false,
        type: "code",
        socraticPrompt: "How does Python's for loop implement the iterator protocol under the hood, and how does it detect StopIteration?",
      },
    ],
  },
  {
    id: "mod-3",
    number: 3,
    title: "Module 3: Functions & Closures",
    lessons: [
      {
        id: "l3-1",
        title: "First-Class Functions & Scopes (LEGB)",
        duration: "45 min",
        completed: false,
        type: "concept",
        socraticPrompt: "Explain the LEGB scope lookup order in Python and provide an edge case where 'UnboundLocalError' occurs.",
      },
      {
        id: "l3-2",
        title: "Decorators & Metaprogramming",
        duration: "50 min",
        completed: false,
        type: "code",
        socraticPrompt: "Write a parameterized decorator that measures execution time and preserves docstrings using functools.wraps.",
      },
    ],
  },
];

// Clean styled Message components using assistant-ui primitives
const UserMessage: React.FC = () => {
  return (
    <MessagePrimitive.Root className="flex justify-end my-3.5">
      <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl rounded-tr-sm px-4 py-2.5 bg-gradient-to-r from-purple-700 to-indigo-600 text-white text-xs sm:text-sm shadow-md font-sans">
        <MessagePrimitive.Content />
      </div>
    </MessagePrimitive.Root>
  );
};

const AssistantMessage: React.FC = () => {
  return (
    <MessagePrimitive.Root className="flex justify-start my-3.5 gap-3 items-start">
      <div className="w-8 h-8 rounded-xl bg-purple-900/60 border border-purple-500/30 flex items-center justify-center shrink-0 shadow-sm text-sm">
        🦉
      </div>
      <div className="max-w-[90%] sm:max-w-[82%] rounded-2xl rounded-tl-sm px-4 py-3.5 bg-[#14141e] border border-white/[0.08] text-neutral-200 text-xs sm:text-sm shadow-md leading-relaxed whitespace-pre-wrap font-sans">
        <MessagePrimitive.Content />
      </div>
    </MessagePrimitive.Root>
  );
};

export const LearningStudio: React.FC<LearningStudioProps> = ({
  courseSlug,
  user,
  onNavigateVerify: _onNavigateVerify,
  onNavigate,
  onLogout,
}) => {
  const { isLight } = useTheme();
  const [sessionContext, setSessionContext] = useState<LearningSessionContext | null>(null);
  const [activeModuleId, setActiveModuleId] = useState<string>("mod-1");
  const [activeLessonId, setActiveLessonId] = useState<string>("l1-3");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileHovered, setIsProfileHovered] = useState(false);
  const profileCloseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch session context from backend
  useEffect(() => {
    let mounted = true;
    api.getSessionContext(courseSlug)
      .then((data) => {
        if (mounted) setSessionContext(data);
      })
      .catch((err) => {
        console.warn("Using local Socratic session:", err);
      });
    return () => {
      mounted = false;
    };
  }, [courseSlug]);

  const activeLesson = useMemo(() => {
    for (const mod of STUDIO_MODULES) {
      const found = mod.lessons.find((l) => l.id === activeLessonId);
      if (found) return found;
    }
    return STUDIO_MODULES[0].lessons[0];
  }, [activeLessonId]);

  // Socratic Model Adapter for assistant-ui
  const modelAdapter: ChatModelAdapter = useMemo(() => {
    return {
      async *run({ messages, abortSignal }) {
        const lastMessage = messages[messages.length - 1];
        if (!lastMessage) return;

        // Extract user text
        let userQuery = "";
        if (typeof lastMessage.content === "string") {
          userQuery = lastMessage.content;
        } else if (Array.isArray(lastMessage.content)) {
          userQuery = lastMessage.content
            .filter((p: any) => p.type === "text")
            .map((p: any) => p.text)
            .join(" ");
        }

        const queryLower = userQuery.toLowerCase();

        // 1. Check live backend streaming
        if (sessionContext?.session?.id) {
          try {
            let buffer = "";
            let done = false;

            const token = localStorage.getItem("certify_token");
            const res = await fetch(`http://localhost:5000/api/v1/sessions/${sessionContext.session.id}/messages`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              body: JSON.stringify({ content: userQuery }),
              signal: abortSignal,
            });

            if (res.ok && res.body) {
              const reader = res.body.getReader();
              const decoder = new TextDecoder();

              while (!done) {
                const { value, done: readerDone } = await reader.read();
                if (readerDone) {
                  done = true;
                  break;
                }
                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split("\n");
                for (const line of lines) {
                  if (line.startsWith("data: ")) {
                    try {
                      const parsed = JSON.parse(line.slice(6));
                      if (parsed.token) {
                        buffer += parsed.token;
                        yield { content: [{ type: "text", text: buffer }] };
                      }
                    } catch {
                      // ignore parse errors
                    }
                  }
                }
              }
              if (buffer.trim()) return;
            }
          } catch {
            // fallback to local Socratic synthesis generator
          }
        }

        // 2. Local Intelligent Socratic Generator
        let responseTemplate = "";

        if (queryLower.includes("cpython") || queryLower.includes("bytecode") || queryLower.includes("pypy")) {
          responseTemplate = `### Socratic Investigation: CPython Bytecode & Runtime Model

Great question! Let's examine how CPython compiles and evaluates source code.

\`\`\`python
import dis

def calculate_square(x: int) -> int:
    return x * x

dis.dis(calculate_square)
\`\`\`

**Core Architectural Observations:**
1. **Compilation Phase:** Source code (.py) compiles into an internal Abstract Syntax Tree (AST), then emits portable opcode instructions stored in memory or cached in __pycache__/*.pyc files.
2. **Virtual Machine Loop:** The CPython evaluation loop (_PyEval_EvalFrameDefault in C) acts as a stack-oriented bytecode interpreter, popping arguments and pushing return values.

> 🔍 **Socratic Prompt:** In Python 3.11+, how does the Specializing Adaptive Interpreter (PEP 659) optimize frequently executed bytecode instructions at runtime compared to traditional JIT engines? What are the tradeoffs?`;
        } else if (queryLower.includes("venv") || queryLower.includes("virtualenv") || queryLower.includes("isolation")) {
          responseTemplate = `### Socratic Analysis: Python Virtual Environments (venv)

Let's dissect what actually happens when you create and activate an isolated environment.

\`\`\`bash
# Create an isolated environment
python -m venv .venv

# Inspection
python -c "import sys; print(sys.prefix, sys.base_prefix)"
\`\`\`

**Key Insights:**
- A virtual environment does not copy the entire Python standard library.
- Instead, it creates a local directory containing a pyvenv.cfg file pointing back to the base Python installation (base_prefix).
- When activated, sys.prefix is redirected to the virtual environment folder, isolating site-packages without polluting system-wide libraries.

> 💡 **Follow-up Probe:** Why would running pip install without an activated virtual environment pose risks in modern Linux distributions with PEP 668 ("externally-managed-environment") flags enabled?`;
        } else if (queryLower.includes("mutab") || queryLower.includes("identity") || queryLower.includes("id()")) {
          responseTemplate = `### Socratic Dialogue: Identity (is) vs Equality (==)

Let's inspect how CPython allocates heap memory for mutable vs immutable objects:

\`\`\`python
# Immutable Integer Interning
x = 256
y = 256
print(f"x is y: {x is y}") # True due to small integer caching [-5, 256]

# Mutable Objects
list_a = [1, 2, 3]
list_b = [1, 2, 3]
print(f"list_a == list_b: {list_a == list_b}") # True (Value Equality)
print(f"list_a is list_b: {list_a is list_b}") # False (Distinct Heap Allocations)
\`\`\`

**Mental Model:**
- **Value Equality (==):** Invokes the __eq__ dunder method to compare logical content.
- **Object Identity (is):** Compares memory addresses (id(a) == id(b)).

> 🧪 **Challenge Problem:** If mutable lists cannot be hashed, why does Python allow a tuple containing an internal mutable list (e.g. t = (1, [2, 3])), yet raises a TypeError: unhashable type: 'list' when you try to insert that tuple into a set?`;
        } else {
          responseTemplate = `### Socratic AI Mentor Insight

Thank you for your formulation! Let's break this down systematically.

When mastering **${activeLesson.title}**, we focus on three core principles:
1. **Underlying Invariants:** Understanding the runtime guarantees and memory representations.
2. **Edge-Case Resilience:** Anticipating boundary conditions, exception states, and type safety constraints.
3. **Idiomatic Cleanliness:** Applying standard Pythonic patterns that align with PEP 8 and modern Python specifications.

\`\`\`python
# Demonstration related to: ${activeLesson.title}
def explore_concept():
    """Investigating: ${activeLesson.socraticPrompt}"""
    status = "Active Exploration"
    return status

print(explore_concept())
\`\`\`

> 🎯 **Next Step for You:** How would you implement or test your solution to the following prompt:
> "${activeLesson.socraticPrompt}"`;
        }

        // Stream output with realistic pacing
        const words = responseTemplate.split(" ");
        let accumulated = "";
        for (let i = 0; i < words.length; i++) {
          if (abortSignal.aborted) break;
          accumulated += (i > 0 ? " " : "") + words[i];
          yield { content: [{ type: "text", text: accumulated }] };
          await new Promise((resolve) => setTimeout(resolve, 18));
        }
      },
    };
  }, [sessionContext, activeLesson]);

  // Assistant-UI Runtime Hook
  const runtime = useLocalRuntime(modelAdapter);

  const handleProfileEnter = () => {
    if (profileCloseTimeoutRef.current) {
      clearTimeout(profileCloseTimeoutRef.current);
      profileCloseTimeoutRef.current = null;
    }
    setIsProfileHovered(true);
  };

  const handleProfileLeave = () => {
    profileCloseTimeoutRef.current = setTimeout(() => {
      setIsProfileHovered(false);
    }, 240);
  };

  return (
    <div
      data-purpose="ai-learning-studio-assistant-ui"
      className={`w-full min-h-[calc(100vh-2rem)] flex flex-col rounded-3xl border shadow-xl overflow-hidden transition-colors duration-300 ${
        isLight
          ? "bg-white border-purple-900/10 text-slate-900"
          : "bg-[#0c0c11] border-white/[0.08] text-white"
      }`}
    >
      {/* Studio Top Navigation Bar */}
      <header
        className={`px-6 py-4 flex items-center justify-between border-b transition-colors shrink-0 ${
          isLight ? "bg-slate-50/80 border-slate-200" : "bg-[#101017] border-white/[0.08]"
        }`}
      >
        <div className="flex items-center gap-4">
          {onNavigate && (
            <button
              onClick={() => onNavigate("mylearning")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                isLight
                  ? "bg-white border-slate-300 hover:bg-slate-100 text-slate-700"
                  : "bg-white/[0.05] border-white/10 hover:bg-white/10 text-neutral-300"
              }`}
              title="Return to My Learning"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Exit Studio</span>
            </button>
          )}

          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <h1 className="text-sm font-bold tracking-tight flex items-center gap-2">
                <span>Learning Studio</span>
                <span className="text-neutral-500 font-normal">/</span>
                <span className={isLight ? "text-purple-900" : "text-purple-300"}>
                  {courseSlug.replace(/-/g, " ").toUpperCase()}
                </span>
              </h1>
              <p className={`text-[11px] ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
                Powered by assistant-ui • Socratic Pedagogical Mentorship
              </p>
            </div>
          </div>
        </div>

        {/* Header Right: Active Lesson Badge, Sidebar Toggle, Profile */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition cursor-pointer ${
              isLight
                ? "bg-white border-slate-300 hover:bg-slate-100 text-slate-700"
                : "bg-white/[0.04] border-white/10 hover:bg-white/10 text-neutral-300"
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            <span>{isSidebarOpen ? "Hide Syllabus" : "Show Syllabus"}</span>
          </button>

          {/* User Profile Card Anchor */}
          <div className="relative" onMouseEnter={handleProfileEnter} onMouseLeave={handleProfileLeave}>
            <button
              type="button"
              className="w-8 h-8 rounded-full overflow-hidden border border-white/20 shadow-sm focus:outline-none cursor-pointer"
            >
              <img src="/user-avatar.jpg" alt="User avatar" className="w-full h-full object-cover" />
            </button>

            {isProfileHovered && (
              <div className="absolute right-0 top-10 z-50 animate-in fade-in slide-in-from-top-1">
                <UserProfileCard
                  user={user || null}
                  onNavigate={onNavigate}
                  onLogout={onLogout}
                  className="shadow-2xl"
                />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Studio Body: Curriculum Drawer + assistant-ui Thread */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Drawer: Course Modules & Lessons */}
        {isSidebarOpen && (
          <aside
            className={`w-80 shrink-0 border-r flex flex-col transition-all duration-300 ${
              isLight ? "bg-slate-50/50 border-slate-200" : "bg-[#0e0e14] border-white/[0.08]"
            }`}
          >
            <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-purple-400">Curriculum Syllabus</h2>
                <p className={`text-[11px] mt-0.5 ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
                  Select a topic to focus Socratic discussion
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              {STUDIO_MODULES.map((mod) => (
                <div key={mod.id} className="space-y-1.5">
                  <button
                    onClick={() => setActiveModuleId(mod.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                      activeModuleId === mod.id
                        ? isLight
                          ? "bg-purple-100 text-purple-950 font-bold"
                          : "bg-purple-950/40 text-purple-200 border border-purple-500/20"
                        : "hover:bg-white/[0.04] text-neutral-400"
                    }`}
                  >
                    <span>{mod.title}</span>
                    <span className="text-[10px] opacity-70">{mod.lessons.length} lessons</span>
                  </button>

                  <div className="pl-2 space-y-1">
                    {mod.lessons.map((lesson) => (
                      <button
                        key={lesson.id}
                        onClick={() => {
                          setActiveModuleId(mod.id);
                          setActiveLessonId(lesson.id);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs transition flex items-center justify-between group cursor-pointer ${
                          activeLessonId === lesson.id
                            ? isLight
                              ? "bg-purple-600 text-white font-semibold shadow-sm"
                              : "bg-white/[0.1] text-white font-medium border border-white/10"
                            : isLight
                            ? "hover:bg-slate-200/70 text-slate-700"
                            : "hover:bg-white/[0.04] text-neutral-400 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate pr-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${lesson.completed ? "bg-emerald-400" : "bg-neutral-600"}`} />
                          <span className="truncate">{lesson.title}</span>
                        </div>
                        <span className="text-[10px] opacity-60 shrink-0">{lesson.duration}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Socratic Question Card */}
            <div className={`p-3.5 m-3 rounded-2xl border ${
              isLight ? "bg-white border-purple-100 text-slate-800" : "bg-[#151520] border-white/[0.08] text-white"
            }`}>
              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-400 mb-1">
                <span>⚡ Active Socratic Prompt</span>
              </div>
              <p className={`text-xs leading-relaxed ${isLight ? "text-slate-600" : "text-neutral-300"}`}>
                {activeLesson.socraticPrompt}
              </p>
            </div>
          </aside>
        )}

        {/* Main Center Area: assistant-ui Thread Container */}
        <main className="flex-1 flex flex-col h-full overflow-hidden bg-transparent">
          {/* Active Lesson Context Header */}
          <div
            className={`px-6 py-3.5 border-b flex items-center justify-between shrink-0 transition-colors ${
              isLight ? "bg-white border-slate-200" : "bg-[#111118] border-white/[0.06]"
            }`}
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-purple-400">ACTIVE LESSON</span>
                <span className="text-neutral-500">•</span>
                <h3 className="text-xs sm:text-sm font-semibold">{activeLesson.title}</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-950/40 text-purple-300 border border-purple-800/40">
                  {activeLesson.type.toUpperCase()}
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
                Ask questions, explore CPython internals, or formulate your defense.
              </p>
            </div>
          </div>

          {/* Assistant-UI Thread Viewport */}
          <div className="flex-1 flex flex-col overflow-hidden p-4 sm:p-6">
            <div className={`flex-1 flex flex-col rounded-2xl border overflow-hidden shadow-inner ${
              isLight
                ? "bg-white border-slate-200"
                : "bg-[#0f0f16] border-white/[0.08]"
            }`}>
              <AssistantRuntimeProvider runtime={runtime}>
                <ThreadPrimitive.Root className="flex-1 flex flex-col h-full overflow-hidden">
                  {/* Messages Viewport */}
                  <ThreadPrimitive.Viewport className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                    {/* Welcome Empty State */}
                    <ThreadPrimitive.Empty>
                      <div className="flex flex-col items-center justify-center h-full text-center py-12 px-4 max-w-lg mx-auto">
                        <div className="w-14 h-14 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-center text-2xl mb-4 shadow-lg">
                          🦉
                        </div>
                        <h2 className="text-base sm:text-lg font-bold tracking-tight">
                          Socratic AI Learning Studio
                        </h2>
                        <p className={`text-xs mt-1 leading-relaxed ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
                          Welcome to your Socratic study session for <strong>{activeLesson.title}</strong>. Formulate explanations, probe runtime invariants, or test your hypotheses.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-6 w-full text-left">
                          {[
                            "Explain CPython bytecode execution",
                            "Why are virtual environments needed?",
                            "Difference between 'is' and '=='?",
                            "Test my knowledge on mutability",
                          ].map((suggestion, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                // Simulate input or trigger question
                              }}
                              className={`p-3 rounded-xl border text-xs font-medium transition cursor-pointer text-left ${
                                isLight
                                  ? "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800"
                                  : "bg-white/[0.03] hover:bg-white/[0.07] border-white/[0.06] text-neutral-300"
                              }`}
                            >
                              💡 {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>
                    </ThreadPrimitive.Empty>

                    {/* Messages List */}
                    <ThreadPrimitive.Messages
                      components={{
                        UserMessage,
                        AssistantMessage,
                      }}
                    />
                  </ThreadPrimitive.Viewport>

                  {/* Composer Input Bar */}
                  <div className={`p-4 border-t ${
                    isLight ? "bg-slate-50 border-slate-200" : "bg-[#12121b] border-white/[0.06]"
                  }`}>
                    <ComposerPrimitive.Root className={`flex items-center gap-2 p-1.5 rounded-2xl border transition-all ${
                      isLight
                        ? "bg-white border-slate-300 focus-within:border-purple-600 focus-within:ring-2 focus-within:ring-purple-600/20"
                        : "bg-[#181824] border-white/10 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/20"
                    }`}>
                      <ComposerPrimitive.Input
                        autoFocus
                        placeholder={`Ask Socratic tutor about ${activeLesson.title}...`}
                        className={`flex-1 bg-transparent border-0 px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none placeholder-neutral-500 ${
                          isLight ? "text-slate-900" : "text-white"
                        }`}
                      />

                      <ComposerPrimitive.Send className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 shadow-sm">
                        <span>Send</span>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </ComposerPrimitive.Send>
                    </ComposerPrimitive.Root>
                  </div>
                </ThreadPrimitive.Root>
              </AssistantRuntimeProvider>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
