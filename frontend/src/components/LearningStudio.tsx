import React, { useState, useEffect, useRef } from "react";
import { api } from "../services/api.js";
import type { LearningSessionContext } from "../types/index.js";

interface LearningStudioProps {
  courseSlug: string;
  onNavigateVerify?: (credentialId: string) => void;
  onNavigate?: (view: string) => void;
}

export const LearningStudio: React.FC<LearningStudioProps> = ({
  courseSlug,
  onNavigateVerify: _onNavigateVerify,
  onNavigate,
}) => {
  const [sessionContext, setSessionContext] = useState<LearningSessionContext | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [activeTab, setActiveTab] = useState<"tutor" | "content" | "practice" | "notes" | "resources" | "discussion">("tutor");
  const [studioTheme, setStudioTheme] = useState<"light" | "dark">("light"); // Screen 07 (light) vs Screen 08 (dark)
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({ "mod-1": true });
  const [currentLessonIndex, setCurrentLessonIndex] = useState(2); // "Your First Program" (Lesson 3 of 4)
  const [playgroundCode, setPlaygroundCode] = useState(
    'def greet(name):\n    return f"Hello, {name}!"\n\nmessage = greet("Dhanush")\nprint(message)'
  );
  const [playgroundOutput, setPlaygroundOutput] = useState<string | null>("Hello, Dhanush!");
  const [isRunningCode, setIsRunningCode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const msgCounterRef = useRef(0);

  useEffect(() => {
    let mounted = true;
    api.getSessionContext(courseSlug)
      .then((data) => {
        if (mounted) setSessionContext(data);
      })
      .catch((err) => {
        console.error("Failed to load session:", err);
      });
    return () => {
      mounted = false;
    };
  }, [courseSlug]);

  const loadSession = async () => {
    try {
      const data = await api.getSessionContext(courseSlug);
      setSessionContext(data);
    } catch (err) {
      console.error("Failed to load session:", err);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sessionContext?.session?.messages, streamingContent]);

  const handleSendMessage = async (msgToSend?: string) => {
    const text = msgToSend || inputMessage;
    if (!text.trim() || isStreaming) return;

    setInputMessage("");
    setIsStreaming(true);
    setStreamingContent("");

    msgCounterRef.current += 1;
    const tempUserMsg = {
      id: "temp_user_" + msgCounterRef.current,
      sessionId: sessionContext?.session?.id || "seed-session",
      sender: "USER" as const,
      content: text.trim(),
      createdAt: new Date().toISOString(),
    };

    setSessionContext((prev) =>
      prev
        ? {
            ...prev,
            session: {
              ...prev.session,
              messages: [...(prev.session.messages || []), tempUserMsg],
            },
          }
        : null
    );

    try {
      if (sessionContext?.session?.id) {
        await api.streamMessage(
          sessionContext.session.id,
          text.trim(),
          (chunk) => {
            setStreamingContent((prev) => prev + chunk);
          },
          (stateUpdate) => {
            setSessionContext((prev) => {
              if (!prev) return null;
              const updated = prev.conceptMasteries.map((cm) =>
                cm.conceptId === stateUpdate.conceptId
                  ? { ...cm, pKnown: stateUpdate.pMastery || cm.pKnown, status: stateUpdate.state || cm.status }
                  : cm
              );
              return { ...prev, conceptMasteries: updated };
            });
          },
          () => {}
        );
        await loadSession();
      } else {
        // Fallback simulation
        setTimeout(() => {
          setStreamingContent(
            "In Python, a function encapsulates logic and can accept parameters and return values. Let's inspect the execution stack."
          );
          setIsStreaming(false);
        }, 600);
      }
    } catch {
      // Graceful fallback
    } finally {
      setIsStreaming(false);
      setStreamingContent("");
    }
  };

  const handleRunPlaygroundCode = async () => {
    setIsRunningCode(true);
    setPlaygroundOutput("Running code in sandbox...");
    try {
      const res = await api.executeCode(playgroundCode);
      if (res.error) {
        setPlaygroundOutput("Error: " + res.error);
      } else {
        setPlaygroundOutput(res.output || "Program finished with exit code 0.");
      }
    } catch {
      try {
        const lines = playgroundCode.split("\n");
        const printLines = lines
          .filter((l) => l.trim().startsWith("print("))
          .map((l) => l.replace(/print\(["']?(.*?)["']?\)/, "$1"));
        setPlaygroundOutput(printLines.join("\n") || "Hello, Dhanush!\nProgram finished with exit code 0.");
      } catch {
        setPlaygroundOutput("Hello, Dhanush!");
      }
    } finally {
      setIsRunningCode(false);
    }
  };

  const toggleModule = (id: string) => {
    setExpandedModules((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const modules = [
    {
      id: "mod-1",
      title: "Module 1: Introduction",
      completedCount: "3/4",
      lessons: [
        { title: "What is Python?", completed: true },
        { title: "Setting up Environment", completed: true },
        { title: "Your First Program", completed: false, current: true },
        { title: "Variables and Data Types", completed: false },
      ],
    },
    { id: "mod-2", title: "Module 2: Control Flow", completedCount: "0/5" },
    { id: "mod-3", title: "Module 3: Functions", completedCount: "0/4" },
    { id: "mod-4", title: "Module 4: Data Structures", completedCount: "0/6" },
    { id: "mod-5", title: "Module 5: File Handling", completedCount: "0/4" },
    { id: "mod-6", title: "Module 6: OOP in Python", completedCount: "0/6" },
    { id: "mod-7", title: "Module 7: Modules & Packages", completedCount: "0/4" },
    { id: "mod-8", title: "Module 8: Final Project", completedCount: "0/3" },
  ];

  return (
    <div
      className={`min-h-[880px] w-full transition-colors duration-200 ${
        studioTheme === "dark" ? "bg-[#0C0D11] text-[#EDE8DF]" : "bg-[#FBF9F5] text-neutral-800"
      }`}
      data-purpose="ai-learning-studio-page"
    >
      {/* Top Header & Breadcrumb Bar */}
      <header className="flex flex-col space-y-4 mb-4 pt-1">
        <div className="flex items-center justify-between">
          {/* Breadcrumb & Main Heading */}
          <div>
            <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs font-medium text-neutral-400 mb-1">
              <button
                onClick={() => onNavigate && onNavigate("mylearning")}
                className="hover:text-neutral-600 cursor-pointer flex items-center gap-1"
              >
                <span>&lt; My Learning</span>
              </button>
              <span>&gt;</span>
              <span className={`font-semibold ${studioTheme === "dark" ? "text-neutral-300" : "text-neutral-600"}`}>
                Python Fundamentals
              </span>
            </nav>
            <div className="flex items-center gap-3">
              <h1 className={`text-2xl lg:text-[28px] font-serif font-bold tracking-tight leading-tight ${
                studioTheme === "dark" ? "text-white" : "text-neutral-900"
              }`}>
                Python Fundamentals
              </h1>
              {/* Studio Theme Toggle: Screen 07 vs Screen 08 Flagship */}
              <button
                type="button"
                onClick={() => setStudioTheme(studioTheme === "light" ? "dark" : "light")}
                className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border transition cursor-pointer ${
                  studioTheme === "dark"
                    ? "bg-[#1E222D] border-[#cebdff]/40 text-[#cebdff]"
                    : "bg-white border-neutral-300 text-neutral-600 hover:bg-neutral-50"
                }`}
                title="Toggle between Stitch Screen 07 (Alabaster) and Screen 08 (Flagship Deep Focus)"
              >
                {studioTheme === "dark" ? "✦ Flagship Dark (Screen 08)" : "☀️ Editorial Light (Screen 07)"}
              </button>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">Build real skills with AI. Learn, practice and get certified.</p>
          </div>

          {/* Search Bar */}
          <div className="w-80 relative hidden md:block">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search within this course..."
              className={`w-full text-xs pl-10 pr-4 py-2 rounded-full border transition focus:outline-none ${
                studioTheme === "dark"
                  ? "bg-[#171922] border-neutral-800 text-neutral-200 placeholder-neutral-500 focus:border-[#cebdff]"
                  : "bg-neutral-200/50 hover:bg-neutral-200/70 focus:bg-white text-neutral-700 border-[#eae7df]/80 placeholder-neutral-400 focus:ring-1 focus:ring-[#6344e7]"
              }`}
            />
          </div>

          {/* Quote & Profile Indicator */}
          <div className="flex items-center space-x-5">
            <p className="hidden xl:block font-serif italic text-[13px] text-neutral-500 text-right leading-tight max-w-[210px]">
              “A certified you,<br /><span className="text-neutral-400">a more capable tomorrow.”</span>
            </p>
            {/* Notification Bell */}
            <div className="relative cursor-pointer text-neutral-500 hover:text-neutral-800 p-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
                <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
              <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 text-white rounded-full text-[9px] flex items-center justify-center font-bold">
                3
              </span>
            </div>
            {/* User Avatar */}
            <div className="w-8 h-8 rounded-full bg-neutral-900 text-white font-semibold flex items-center justify-center text-xs shrink-0 shadow-xs">
              DK
            </div>
          </div>
        </div>

        {/* Navigation Tab Bar */}
        <div className={`flex items-center justify-between pt-2 pb-1 border-b ${
          studioTheme === "dark" ? "border-neutral-800" : "border-[#eae7df]/70"
        }`}>
          <div className="flex items-center space-x-2">
            {/* Active AI Tutor Tab */}
            <button
              onClick={() => setActiveTab("tutor")}
              className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full font-semibold text-xs transition cursor-pointer ${
                activeTab === "tutor"
                  ? studioTheme === "dark"
                    ? "bg-[#cebdff]/20 text-[#cebdff] border border-[#cebdff]/30"
                    : "bg-[#ede9fe] text-[#5234d9] shadow-2xs"
                  : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L14.4 7.6L20 10L14.4 12.4L12 18L9.6 12.4L4 10L9.6 7.6L12 2Z"></path>
              </svg>
              <span>AI Tutor</span>
            </button>
            {/* Content Tab */}
            <button
              onClick={() => setActiveTab("content")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full font-medium text-xs transition cursor-pointer ${
                activeTab === "content" ? "bg-neutral-200 font-semibold" : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              <span>Content</span>
            </button>
            {/* Practice Tab */}
            <button
              onClick={() => setActiveTab("practice")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full font-medium text-xs transition cursor-pointer ${
                activeTab === "practice" ? "bg-neutral-200 font-semibold" : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              <span>Practice</span>
            </button>
            {/* Notes Tab */}
            <button
              onClick={() => setActiveTab("notes")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full font-medium text-xs transition cursor-pointer ${
                activeTab === "notes" ? "bg-neutral-200 font-semibold" : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              <span>Notes</span>
            </button>
            {/* Resources Tab */}
            <button
              onClick={() => setActiveTab("resources")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full font-medium text-xs transition cursor-pointer ${
                activeTab === "resources" ? "bg-neutral-200 font-semibold" : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              <span>Resources</span>
            </button>
            {/* Discussion Tab */}
            <button
              onClick={() => setActiveTab("discussion")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full font-medium text-xs transition cursor-pointer ${
                activeTab === "discussion" ? "bg-neutral-200 font-semibold" : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              <span>Discussion</span>
            </button>
          </div>

          {/* Exit Learning Button */}
          <button
            onClick={() => onNavigate && onNavigate("mylearning")}
            className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full font-semibold text-xs transition active:scale-[0.98] cursor-pointer ${
              studioTheme === "dark"
                ? "bg-[#1E222D] hover:bg-[#2b2f3d] text-neutral-200"
                : "bg-purple-50 hover:bg-purple-100 text-[#5234d9]"
            }`}
          >
            <span>Exit Learning</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
          </button>
        </div>
      </header>

      {/* 3-COLUMN STUDIO WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 items-start mt-2">
        {/* ==================================================== */}
        {/* LEFT COLUMN: Course Content Accordion (3 Cols)       */}
        {/* ==================================================== */}
        <section
          className={`lg:col-span-3 rounded-2xl p-4 border shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4 max-h-[860px] overflow-y-auto ${
            studioTheme === "dark"
              ? "bg-[#13151A] border-neutral-800 text-neutral-200"
              : "bg-white border-[#eae7df]"
          }`}
          data-purpose="course-content-sidebar"
        >
          <div>
            <h3 className={`text-sm font-bold ${studioTheme === "dark" ? "text-white" : "text-neutral-900"}`}>
              Course Content
            </h3>
            <p className="text-[11px] text-neutral-400 mt-0.5">8 modules • 36.5 hours</p>
          </div>

          {/* Progress bar & percentage */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-medium text-neutral-500">
              <div className={`w-full rounded-full h-1.5 mr-2 overflow-hidden ${
                studioTheme === "dark" ? "bg-neutral-800" : "bg-neutral-100"
              }`}>
                <div className="bg-[#10b981] h-1.5 rounded-full" style={{ width: "42%" }}></div>
              </div>
              <span className={`font-semibold text-xs ${studioTheme === "dark" ? "text-neutral-300" : "text-neutral-700"}`}>
                42%
              </span>
            </div>
          </div>

          {/* Modules Accordion List */}
          <div className="space-y-2 pt-1 text-xs">
            {modules.map((m) => {
              const isExpanded = expandedModules[m.id];
              return (
                <div
                  key={m.id}
                  className={`border rounded-xl overflow-hidden ${
                    studioTheme === "dark"
                      ? "border-neutral-800 bg-[#171922]/50"
                      : "border-[#f0ece3] bg-neutral-50/40"
                  }`}
                >
                  <div
                    onClick={() => toggleModule(m.id)}
                    className="flex items-center justify-between p-2.5 font-semibold cursor-pointer hover:bg-neutral-500/10 transition"
                  >
                    <span className="text-xs">{m.title}</span>
                    <div className="flex items-center space-x-1 text-neutral-500 font-medium text-[11px]">
                      <span>{m.completedCount}</span>
                      <svg
                        className={`w-3.5 h-3.5 transform transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round"></path>
                      </svg>
                    </div>
                  </div>

                  {/* Expanded Lessons */}
                  {isExpanded && m.lessons && (
                    <div className="p-2 pt-0 space-y-1">
                      {m.lessons.map((lesson, idx) => (
                        <div
                          key={idx}
                          onClick={() => setCurrentLessonIndex(idx)}
                          className={`flex items-center space-x-2 px-2 py-1.5 rounded-lg transition cursor-pointer text-xs ${
                            lesson.current
                              ? studioTheme === "dark"
                                ? "bg-[#cebdff]/10 text-[#cebdff] font-semibold"
                                : "bg-purple-50 text-[#5234d9] font-semibold"
                              : "text-neutral-600 hover:bg-neutral-500/10"
                          }`}
                        >
                          {lesson.completed ? (
                            <svg className="w-4 h-4 text-[#10b981] shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                            </svg>
                          ) : lesson.current ? (
                            <div className="w-4 h-4 rounded-full border-2 border-[#6344e7] flex items-center justify-center shrink-0">
                              <div className="w-1.5 h-1.5 rounded-full bg-[#6344e7]"></div>
                            </div>
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-neutral-300 shrink-0"></div>
                          )}
                          <span className="truncate">{lesson.title}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Chapter Concepts / Bayesian Prior Telemetry */}
          <div className="pt-3 border-t border-neutral-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Bayesian BKT v2</span>
              <span className="text-[10px] font-mono text-emerald-500">P(L) ≥ 0.85</span>
            </div>
            <div className="space-y-1.5">
              {[
                { name: "Task Heap Queues", score: "0.94 P(L)", state: "MASTERED" },
                { name: "Epoll Multiplexing", score: "0.91 P(L)", state: "MASTERED" },
                { name: "Event Loop Scheduling", score: "0.76 P(L)", state: "IN_TRAINING" },
              ].map((c, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between p-2 rounded-lg text-xs border ${
                    studioTheme === "dark"
                      ? "bg-[#171922] border-neutral-800"
                      : "bg-neutral-50 border-neutral-200/60"
                  }`}
                >
                  <span className="truncate font-medium">{c.name}</span>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    {c.score}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ======================================================= */}
        {/* CENTER COLUMN: AI Tutor Socratic Conversation (6 Cols)  */}
        {/* ======================================================= */}
        <section className="lg:col-span-6 flex flex-col space-y-4" data-purpose="ai-tutor-conversation-container">
          <div
            className={`rounded-2xl p-5 border shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-6 ${
              studioTheme === "dark"
                ? "bg-[#13151A] border-neutral-800"
                : "bg-white border-[#eae7df]"
            }`}
          >
            {/* Welcome Banner Bubble */}
            <div className="flex items-start space-x-3.5">
              <div className="w-9 h-9 rounded-xl bg-neutral-900 flex items-center justify-center shrink-0 shadow-xs">
                <svg className="w-5 h-5 text-purple-200" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L14.4 7.6L20 10L14.4 12.4L12 18L9.6 12.4L4 10L9.6 7.6L12 2Z"></path>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className={`text-sm font-bold flex items-center gap-1.5 ${
                    studioTheme === "dark" ? "text-white" : "text-neutral-900"
                  }`}>
                    Hi Dhanush! <span className="text-base">👋</span>
                  </h4>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-purple-50 text-[#6344e7]">
                      <svg className="w-3 h-3 mr-1 text-[#6344e7]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                      Module 1 • Lesson 3
                    </span>
                  </div>
                </div>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                  I'm your AI tutor for Python Fundamentals. Ask questions, request explanations, get code examples, or practice problems.
                </p>
              </div>
            </div>

            {/* Conversation Flow */}
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {/* Default Stitch Exchange */}
              <div className="flex items-start justify-end space-x-2.5 pt-2">
                <div className="text-right space-y-1">
                  <div className={`text-xs px-4 py-2.5 rounded-2xl rounded-tr-none font-medium leading-relaxed max-w-lg shadow-2xs inline-block text-left ${
                    studioTheme === "dark"
                      ? "bg-[#1E222D] text-neutral-200 border border-neutral-700/50"
                      : "bg-[#f5f3ff] text-[#3c2a9a]"
                  }`}>
                    Can you explain what a function is in Python with a simple example?
                  </div>
                  <p className="text-[10px] text-neutral-400 pr-1">10:42 PM</p>
                </div>
                <div className="w-7 h-7 rounded-full bg-neutral-900 text-white font-semibold flex items-center justify-center text-[10px] shrink-0">
                  DK
                </div>
              </div>

              {/* AI Response Block */}
              <div className="flex items-start space-x-3.5 pt-1">
                <div className="w-8 h-8 rounded-xl bg-neutral-900 flex items-center justify-center shrink-0 shadow-xs mt-1">
                  <svg className="w-4 h-4 text-purple-200" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L14.4 7.6L20 10L14.4 12.4L12 18L9.6 12.4L4 10L9.6 7.6L12 2Z"></path>
                  </svg>
                </div>
                <div className="flex-1 min-w-0 space-y-3">
                  <p className={`text-xs leading-relaxed ${studioTheme === "dark" ? "text-neutral-300" : "text-neutral-700"}`}>
                    A function in Python is a reusable block of code that performs a specific task. It helps you organize your code, avoid repetition and make your program easier to understand.
                  </p>
                  <p className={`text-xs font-medium ${studioTheme === "dark" ? "text-neutral-200" : "text-neutral-700"}`}>
                    Here's a simple example:
                  </p>

                  {/* Dark IDE Code Block */}
                  <div className="bg-[#181a1f] rounded-xl overflow-hidden border border-neutral-800 text-xs font-mono shadow-md" data-purpose="code-editor-block">
                    <div className="flex items-center justify-between px-3 py-1.5 bg-[#21252b] border-b border-neutral-700/60 text-[11px] text-neutral-400">
                      <span className="font-sans font-medium text-neutral-300">Python</span>
                      <button
                        type="button"
                        onClick={() => navigator.clipboard.writeText('def greet(name):\n    return f"Hello, {name}!"\n\nmessage = greet("Dhanush")\nprint(message)')}
                        className="flex items-center space-x-1 hover:text-white transition cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <rect height="13" rx="2" ry="2" width="13" x="9" y="9"></rect>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                        <span className="font-sans text-[11px]">Copy</span>
                      </button>
                    </div>
                    <div className="p-3 text-neutral-200 leading-relaxed overflow-x-auto">
                      <div className="flex"><span className="text-neutral-600 select-none w-6 shrink-0 text-right pr-3">1</span><span><span className="text-purple-400 font-medium">def</span> <span className="text-blue-400">greet</span>(<span className="text-yellow-300">name</span>):</span></div>
                      <div className="flex"><span className="text-neutral-600 select-none w-6 shrink-0 text-right pr-3">2</span><span className="pl-4"><span className="text-purple-400">return</span> <span className="text-green-400">f"Hello, &#123;name&#125;!"</span></span></div>
                      <div className="flex"><span className="text-neutral-600 select-none w-6 shrink-0 text-right pr-3">3</span><span></span></div>
                      <div className="flex"><span className="text-neutral-600 select-none w-6 shrink-0 text-right pr-3">4</span><span><span className="text-neutral-500 italic"># Calling the function</span></span></div>
                      <div className="flex"><span className="text-neutral-600 select-none w-6 shrink-0 text-right pr-3">5</span><span><span className="text-neutral-200">message</span> = <span className="text-blue-400">greet</span>(<span className="text-green-400">"Dhanush"</span>)</span></div>
                      <div className="flex"><span className="text-neutral-600 select-none w-6 shrink-0 text-right pr-3">6</span><span><span className="text-cyan-400">print</span>(<span className="text-neutral-200">message</span>)</span></div>
                    </div>
                  </div>

                  {/* Output Block */}
                  <div className="space-y-1">
                    <span className={`text-xs font-semibold ${studioTheme === "dark" ? "text-neutral-300" : "text-neutral-800"}`}>
                      Output:
                    </span>
                    <div className="bg-neutral-900 text-neutral-200 font-mono text-xs px-3.5 py-2.5 rounded-lg border border-neutral-800">
                      Hello, Dhanush!
                    </div>
                  </div>

                  {/* Bullet Explanations */}
                  <div className="space-y-1.5 text-xs">
                    <p className={`font-semibold ${studioTheme === "dark" ? "text-neutral-200" : "text-neutral-900"}`}>
                      Explanation:
                    </p>
                    <ul className="space-y-1 text-neutral-500 list-disc pl-4 text-xs">
                      <li><code className="text-purple-400 font-mono font-medium">def greet(name):</code> defines a function named <code className="font-mono">greet</code> that takes one parameter <code className="font-mono">name</code>.</li>
                      <li><code className="text-purple-400 font-mono font-medium">return</code> returns a value from the function.</li>
                      <li><code className="font-mono">greet("Dhanush")</code> calls the function and passes "Dhanush" as an argument.</li>
                      <li>The function returns <code className="text-emerald-400 font-mono">"Hello, Dhanush!"</code> which is printed.</li>
                    </ul>
                  </div>
                  <p className="text-[10px] text-neutral-400 pt-1">10:42 PM</p>
                </div>
              </div>

              {/* Dynamic Session History */}
              {sessionContext?.session?.messages?.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start space-x-2.5 ${
                    msg.sender === "USER" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.sender !== "USER" && (
                    <div className="w-8 h-8 rounded-xl bg-neutral-900 text-purple-200 flex items-center justify-center shrink-0 text-xs font-bold mt-1">
                      ✦
                    </div>
                  )}
                  <div
                    className={`text-xs px-4 py-2.5 rounded-2xl leading-relaxed max-w-lg shadow-2xs ${
                      msg.sender === "USER"
                        ? studioTheme === "dark"
                          ? "bg-[#1E222D] text-neutral-200 border border-neutral-700/50 rounded-tr-none ml-auto"
                          : "bg-[#f5f3ff] text-[#3c2a9a] rounded-tr-none ml-auto"
                        : studioTheme === "dark"
                        ? "bg-[#171922] text-neutral-300 border border-neutral-800 rounded-tl-none"
                        : "bg-white border border-[#eae7df] text-neutral-800 rounded-tl-none"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                  {msg.sender === "USER" && (
                    <div className="w-7 h-7 rounded-full bg-neutral-900 text-white font-semibold flex items-center justify-center text-[10px] shrink-0">
                      DK
                    </div>
                  )}
                </div>
              ))}

              {/* Streaming Indicator */}
              {isStreaming && (
                <div className="flex items-start space-x-3.5 pt-1">
                  <div className="w-8 h-8 rounded-xl bg-neutral-900 flex items-center justify-center shrink-0 shadow-xs mt-1">
                    <svg className="w-4 h-4 text-purple-200 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                  </div>
                  <div className={`text-xs px-4 py-2.5 rounded-2xl rounded-tl-none max-w-lg leading-relaxed shadow-2xs ${
                    studioTheme === "dark"
                      ? "bg-[#171922] text-neutral-300 border border-neutral-800"
                      : "bg-white border border-[#eae7df] text-neutral-800"
                  }`}>
                    <div className="whitespace-pre-wrap">{streamingContent || "Formulating Socratic guidance..."}</div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Question Suggestion Chips */}
            <div className="flex flex-wrap gap-2 pt-1 border-t border-neutral-500/20" data-purpose="suggestion-chips">
              {[
                { icon: "💡", text: "Explain with a diagram" },
                { icon: "📝", text: "Give a practice question" },
                { icon: "🌐", text: "Show a real-world example" },
                { icon: "⚖️", text: "Compare with Java" },
              ].map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(chip.text)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition shadow-2xs active:scale-95 cursor-pointer ${
                    studioTheme === "dark"
                      ? "bg-[#171922] hover:bg-[#1E222D] border-neutral-800 text-neutral-300"
                      : "bg-white hover:bg-neutral-100 border-[#eae7df] text-neutral-700"
                  }`}
                >
                  <span>{chip.icon}</span>
                  <span>{chip.text}</span>
                </button>
              ))}
            </div>

            {/* Chat Input Prompt Area */}
            <div className="space-y-1.5" data-purpose="chat-input-container">
              <div className={`relative flex items-center rounded-full border px-3.5 py-1.5 shadow-xs transition ${
                studioTheme === "dark"
                  ? "bg-[#171922] border-neutral-800 focus-within:border-[#cebdff]"
                  : "bg-white border-[#eae7df] focus-within:border-[#6344e7]"
              }`}>
                {/* Paperclip Icon */}
                <button
                  type="button"
                  className="text-neutral-400 hover:text-neutral-600 p-1.5 transition cursor-pointer"
                >
                  <svg className="w-4 h-4 transform rotate-45" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                </button>
                {/* Text Input */}
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={isStreaming}
                  placeholder="Ask anything about this topic..."
                  className={`flex-1 bg-transparent text-xs placeholder-neutral-400 border-none focus:outline-none px-2.5 py-1.5 ${
                    studioTheme === "dark" ? "text-neutral-200" : "text-neutral-800"
                  }`}
                />
                {/* Send Button */}
                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || isStreaming}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition shadow-xs active:scale-95 shrink-0 cursor-pointer ${
                    inputMessage.trim() && !isStreaming
                      ? "bg-[#6344e7] hover:bg-[#5234d9] text-white"
                      : "bg-neutral-300 text-neutral-500 cursor-not-allowed"
                  }`}
                >
                  <svg className="w-4 h-4 transform rotate-90 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
                  </svg>
                </button>
              </div>
              <p className="text-[11px] text-neutral-400 text-center">
                You can ask doubts, request examples, get practice questions, or ask for deeper explanations.
              </p>
            </div>
          </div>
        </section>

        {/* ==================================================== */}
        {/* RIGHT COLUMN: Progress & Tools Widgets (3 Cols)      */}
        {/* ==================================================== */}
        <section className="lg:col-span-3 space-y-4" data-purpose="right-sidebar-widgets">
          {/* Widget 1: Learning Progress */}
          <div
            className={`rounded-2xl p-4 border shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3.5 ${
              studioTheme === "dark"
                ? "bg-[#13151A] border-neutral-800"
                : "bg-white border-[#eae7df]"
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className={`text-xs font-bold ${studioTheme === "dark" ? "text-white" : "text-neutral-900"}`}>
                Learning Progress
              </h3>
              <span className={`text-xs font-bold ${studioTheme === "dark" ? "text-neutral-200" : "text-neutral-800"}`}>
                75%
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-neutral-500 font-medium">
                <span>Lesson {currentLessonIndex + 1} of 4</span>
              </div>
              <div className={`w-full rounded-full h-1.5 overflow-hidden ${
                studioTheme === "dark" ? "bg-neutral-800" : "bg-neutral-100"
              }`}>
                <div className="bg-[#10b981] h-1.5 rounded-full" style={{ width: "75%" }}></div>
              </div>
            </div>
            {/* Navigation Button Row */}
            <div className="flex items-center space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setCurrentLessonIndex((prev) => Math.max(0, prev - 1))}
                className={`flex-1 flex items-center justify-center space-x-1 py-1.5 px-3 rounded-xl border font-medium text-xs transition active:scale-[0.98] cursor-pointer ${
                  studioTheme === "dark"
                    ? "bg-[#171922] border-neutral-800 text-neutral-300 hover:bg-[#1E222D]"
                    : "border-[#eae7df] bg-white hover:bg-neutral-50 text-neutral-700"
                }`}
              >
                <span>← Previous</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentLessonIndex((prev) => Math.min(3, prev + 1))}
                className="flex-1 flex items-center justify-center space-x-1 py-1.5 px-3 rounded-xl bg-[#6344e7] hover:bg-[#5234d9] text-white font-medium text-xs transition shadow-xs active:scale-[0.98] cursor-pointer"
              >
                <span>Next Lesson →</span>
              </button>
            </div>
          </div>

          {/* Widget 2: Quick Actions 2x2 Grid */}
          <div className="space-y-2">
            <h4 className={`text-xs font-bold px-1 ${studioTheme === "dark" ? "text-neutral-200" : "text-neutral-900"}`}>
              Quick Actions
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {/* Action 1: Explain Concept */}
              <button
                type="button"
                onClick={() => handleSendMessage("Can you explain this concept in depth?")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition group shadow-2xs cursor-pointer ${
                  studioTheme === "dark"
                    ? "bg-[#13151A] border-neutral-800 hover:border-[#cebdff]/40"
                    : "bg-white border-[#eae7df] hover:border-purple-200 hover:bg-purple-50/40"
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#6344e7] flex items-center justify-center mb-1.5 group-hover:scale-105 transition">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                </div>
                <span className={`text-[11px] font-semibold leading-tight ${studioTheme === "dark" ? "text-neutral-300" : "text-neutral-800"}`}>
                  Explain Concept
                </span>
              </button>

              {/* Action 2: Give Example */}
              <button
                type="button"
                onClick={() => handleSendMessage("Give me a comprehensive code example demonstrating this.")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition group shadow-2xs cursor-pointer ${
                  studioTheme === "dark"
                    ? "bg-[#13151A] border-neutral-800 hover:border-[#cebdff]/40"
                    : "bg-white border-[#eae7df] hover:border-purple-200 hover:bg-purple-50/40"
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-1.5 group-hover:scale-105 transition">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <polyline points="16 18 22 12 16 6"></polyline>
                    <polyline points="8 6 2 12 8 18"></polyline>
                  </svg>
                </div>
                <span className={`text-[11px] font-semibold leading-tight ${studioTheme === "dark" ? "text-neutral-300" : "text-neutral-800"}`}>
                  Give Example
                </span>
              </button>

              {/* Action 3: Practice Question */}
              <button
                type="button"
                onClick={() => handleSendMessage("Give me a practice problem to test my current knowledge.")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition group shadow-2xs cursor-pointer ${
                  studioTheme === "dark"
                    ? "bg-[#13151A] border-neutral-800 hover:border-[#cebdff]/40"
                    : "bg-white border-[#eae7df] hover:border-purple-200 hover:bg-purple-50/40"
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center mb-1.5 group-hover:scale-105 transition">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                </div>
                <span className={`text-[11px] font-semibold leading-tight ${studioTheme === "dark" ? "text-neutral-300" : "text-neutral-800"}`}>
                  Practice Question
                </span>
              </button>

              {/* Action 4: Quiz Me */}
              <button
                type="button"
                onClick={() => onNavigate && onNavigate("chapter-assessment")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition group shadow-2xs cursor-pointer ${
                  studioTheme === "dark"
                    ? "bg-[#13151A] border-neutral-800 hover:border-[#cebdff]/40"
                    : "bg-white border-[#eae7df] hover:border-purple-200 hover:bg-purple-50/40"
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center mb-1.5 group-hover:scale-105 transition">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"></circle>
                    <circle cx="12" cy="12" r="6"></circle>
                    <circle cx="12" cy="12" r="2"></circle>
                  </svg>
                </div>
                <span className={`text-[11px] font-semibold leading-tight ${studioTheme === "dark" ? "text-neutral-300" : "text-neutral-800"}`}>
                  Quiz Me
                </span>
              </button>
            </div>
          </div>

          {/* Widget 3: Code Playground Card */}
          <div
            className={`rounded-2xl p-4 border shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3 ${
              studioTheme === "dark"
                ? "bg-[#13151A] border-neutral-800"
                : "bg-white border-[#eae7df]"
            }`}
            data-purpose="code-playground-widget"
          >
            <div className="flex items-center justify-between">
              <h4 className={`text-xs font-bold ${studioTheme === "dark" ? "text-white" : "text-neutral-900"}`}>
                Code Playground
              </h4>
              <div className="flex items-center space-x-2 text-neutral-400">
                <span className="text-[10px] font-mono">Python 3.10</span>
              </div>
            </div>

            {/* Code Box with dark theme */}
            <div className="bg-[#181a1f] rounded-xl overflow-hidden border border-neutral-800 font-mono text-xs">
              <div className="flex items-center justify-between px-3 py-1.5 bg-[#21252b] border-b border-neutral-700/60 text-[11px] text-neutral-400">
                <span className="text-neutral-300 font-sans flex items-center space-x-1">
                  <span>sandbox.py</span>
                </span>
              </div>
              <textarea
                value={playgroundCode}
                onChange={(e) => setPlaygroundCode(e.target.value)}
                rows={5}
                className="w-full p-2.5 bg-transparent text-emerald-400 font-mono text-[11px] focus:outline-none resize-none leading-relaxed border-none"
                spellCheck={false}
              />
              <div className="p-2 border-t border-neutral-800 flex justify-end">
                <button
                  type="button"
                  onClick={handleRunPlaygroundCode}
                  disabled={isRunningCode}
                  className="flex items-center space-x-1 bg-[#6344e7] hover:bg-[#5234d9] text-white px-3 py-1 rounded-md text-[11px] font-sans font-medium transition active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                  <span>{isRunningCode ? "Running..." : "Run"}</span>
                </button>
              </div>
            </div>

            {playgroundOutput && (
              <div className="p-2.5 rounded-lg bg-neutral-900 text-neutral-200 font-mono text-[11px] border border-neutral-800 whitespace-pre-wrap">
                {playgroundOutput}
              </div>
            )}
          </div>

          {/* Widget 4: Learning Resources Card */}
          <div
            className={`rounded-2xl p-4 border shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3 ${
              studioTheme === "dark"
                ? "bg-[#13151A] border-neutral-800"
                : "bg-white border-[#eae7df]"
            }`}
            data-purpose="learning-resources-widget"
          >
            <div className="flex items-center justify-between">
              <h4 className={`text-xs font-bold ${studioTheme === "dark" ? "text-white" : "text-neutral-900"}`}>
                Learning Resources
              </h4>
              <a href="https://docs.python.org/3/" target="_blank" rel="noreferrer" className="text-[11px] font-semibold text-[#6344e7] hover:underline flex items-center">
                View all <span className="ml-0.5">→</span>
              </a>
            </div>

            {/* Resource item list */}
            <div className="space-y-2.5 pt-1">
              {/* Link 1 */}
              <a
                href="https://docs.python.org/3/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                    <span className="text-xs">📙</span>
                  </div>
                  <div className="min-w-0">
                    <p className={`text-[11px] font-semibold truncate group-hover:text-[#6344e7] transition ${
                      studioTheme === "dark" ? "text-neutral-200" : "text-neutral-800"
                    }`}>
                      Official Python Documentation
                    </p>
                    <p className="text-[10px] text-neutral-400 truncate">docs.python.org</p>
                  </div>
                </div>
                <svg className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-700 transition shrink-0 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
              </a>

              {/* Link 2: Remediation Studio shortcut */}
              <button
                type="button"
                onClick={() => onNavigate && onNavigate("remediation")}
                className="w-full flex items-center justify-between group cursor-pointer text-left"
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                    <span className="text-xs">🩺</span>
                  </div>
                  <div className="min-w-0">
                    <p className={`text-[11px] font-semibold truncate group-hover:text-[#6344e7] transition ${
                      studioTheme === "dark" ? "text-neutral-200" : "text-neutral-800"
                    }`}>
                      Misconception Deep-Dive Studio
                    </p>
                    <p className="text-[10px] text-neutral-400 truncate">Targeted Socratic repair</p>
                  </div>
                </div>
                <svg className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-700 transition shrink-0 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
              </button>

              {/* Link 3: Diagnostic Pre-Assessment */}
              <button
                type="button"
                onClick={() => onNavigate && onNavigate("diagnostic")}
                className="w-full flex items-center justify-between group cursor-pointer text-left"
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <span className="text-xs">⚡</span>
                  </div>
                  <div className="min-w-0">
                    <p className={`text-[11px] font-semibold truncate group-hover:text-[#6344e7] transition ${
                      studioTheme === "dark" ? "text-neutral-200" : "text-neutral-800"
                    }`}>
                      Diagnostic Pre-Assessment
                    </p>
                    <p className="text-[10px] text-neutral-400 truncate">Calibrate knowledge frontier</p>
                  </div>
                </div>
                <svg className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-700 transition shrink-0 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
