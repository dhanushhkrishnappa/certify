import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  Check,
  ArrowUp,
  Square,
  Copy,
  CheckCheck,
  RotateCcw,
  FileCode,
  X,
  ArrowLeft,
  Plus,
} from "lucide-react";
import type { User } from "../../types/index.js";

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  badge?: string;
  description: string;
  context: string;
  speed: string;
  cost: string;
}

export type ReasoningEffort = "brief" | "balanced" | "detailed";

export interface ChatAttachment {
  name: string;
  size: string;
  content?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
  attachment?: ChatAttachment;
}

export const CHAT_MODELS: AIModel[] = [
  {
    id: "auto",
    name: "Auto",
    provider: "Northwind AI",
    badge: "Recommended",
    description: "Dynamically routes each request to the optimal model based on prompt complexity, context depth, and cost constraints.",
    context: "128K tokens",
    speed: "Adaptive",
    cost: "2 credits per turn",
  },
  {
    id: "atlas",
    name: "Atlas",
    provider: "Meridian Labs",
    description: "The strongest general model. Best for multi-step work that spans several files.",
    context: "200K tokens",
    speed: "Standard",
    cost: "4 credits per turn",
  },
  {
    id: "atlas-long",
    name: "Atlas Long",
    provider: "Meridian Labs",
    badge: "1M context",
    description: "Extended context model for massive codebases, complex trace logs, and long documents.",
    context: "1M tokens",
    speed: "Deep",
    cost: "6 credits per turn",
  },
  {
    id: "quill",
    name: "Quill",
    provider: "Meridian Labs",
    description: "Lightweight, ultra-fast model tuned for rapid code syntax fixes and quick explanations.",
    context: "64K tokens",
    speed: "Fast",
    cost: "1 credit per turn",
  },
  {
    id: "ember",
    name: "Ember",
    provider: "Orbital",
    description: "Balanced frontier model specializing in algorithmic reasoning and edge-case testing.",
    context: "128K tokens",
    speed: "Fast",
    cost: "2 credits per turn",
  },
  {
    id: "wren",
    name: "Wren",
    provider: "Orbital",
    badge: "On device",
    description: "Runs locally in-browser or on-device for zero-latency, private offline coding assistance.",
    context: "32K tokens",
    speed: "Ultra Fast",
    cost: "Free (local)",
  },
];

const ROTATING_PROMPT_TEMPLATES = [
  "What concept are we mastering today",
  "What architectural puzzle are we solving",
  "Where shall we begin our deep dive",
  "Ready to explore runtime invariants",
  "What would you like to explore from first principles",
  "Ready to test your intuition",
  "What challenge shall we tackle together",
  "What question is on your mind",
  "What systems trade-off are we analyzing",
  "Ready to build and verify your knowledge",
  "Which mental model shall we unpack",
  "Ready to explore edge cases and failure modes",
  "What implementation detail shall we dissect",
  "Ready to test your problem-solving skills",
];

export interface AiChat9Props {
  initialTitle?: string;
  courseTitle?: string;
  courseSlug?: string;
  user?: User | null;
  initialMessages?: ChatMessage[];
  onExit?: () => void;
  onNewChat?: () => void;
  onSendMessage?: (message: string, model: AIModel, effort: ReasoningEffort) => Promise<string | void>;
  onStreamMessage?: (
    message: string,
    history: Array<{ role: "user" | "assistant"; content: string }>,
    onToken: (chunk: string) => void,
    signal?: AbortSignal
  ) => Promise<void>;
}

export const AiChat9: React.FC<AiChat9Props> = ({
  courseTitle = "Python Fundamentals",
  courseSlug: _courseSlug = "python-fundamentals",
  user,
  initialMessages = [],
  onExit,
  onNewChat,
  onSendMessage,
  onStreamMessage,
}) => {
  const [selectedModel] = useState<AIModel>(CHAT_MODELS[1]); // Atlas
  const [reasoningEffort] = useState<ReasoningEffort>("balanced");

  // Initialize with clean empty messages by default so the centered welcome screen appears
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);

  // Sync messages whenever initialMessages updates (e.g. when session finishes loading or user switches)
  useEffect(() => {
    setMessages(initialMessages || []);
  }, [initialMessages]);
  const [inputText, setInputText] = useState("");
  const [attachment, setAttachment] = useState<ChatAttachment | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [promptIndex, setPromptIndex] = useState(0);
  const [fadeState, setFadeState] = useState<"visible" | "fading">("visible");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Resolved user display name
  const resolvedFirstName = useMemo(() => {
    if (user?.fullName) return user.fullName.trim().split(" ")[0];
    if (user?.name) return user.name.trim().split(" ")[0];
    const cached = localStorage.getItem("certify_user");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        const n = parsed.fullName || parsed.name;
        if (n) return n.trim().split(" ")[0];
      } catch {}
    }
    return "Learner";
  }, [user]);

  // Rotate greeting sentence every 4s
  const cycleNextPrompt = useCallback(() => {
    setFadeState("fading");
    setTimeout(() => {
      setPromptIndex((prev) => (prev + 1) % ROTATING_PROMPT_TEMPLATES.length);
      setFadeState("visible");
    }, 250);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      cycleNextPrompt();
    }, 4000);
    return () => clearInterval(timer);
  }, [cycleNextPrompt]);

  const currentGreeting = useMemo(() => {
    const template = ROTATING_PROMPT_TEMPLATES[promptIndex];
    return `${template}, ${resolvedFirstName}?`;
  }, [promptIndex, resolvedFirstName]);

  // Scroll smoothly inside the bounded chat viewport whenever messages update
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el && messages.length > 0) {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: streamingMessageId ? "auto" : "smooth",
      });
    }
  }, [messages, streamingMessageId]);

  // Auto-resize textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
    setStreamingMessageId(null);
  };

  const handleSendPrompt = async (promptToSend: string, customAttachment?: ChatAttachment | null) => {
    const text = promptToSend.trim();
    const fileAttach = customAttachment !== undefined ? customAttachment : attachment;
    if ((!text && !fileAttach) || isGenerating) return;

    const userMessageId = `user-${Date.now()}`;
    const userMessage: ChatMessage = {
      id: userMessageId,
      role: "user",
      content: text,
      attachment: fileAttach || undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setAttachment(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    const assistantMessageId = `asst-${Date.now()}`;
    const newAssistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
    };

    setMessages((prev) => [...prev, newAssistantMessage]);
    setIsGenerating(true);
    setStreamingMessageId(assistantMessageId);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    let hasStreamedToken = false;

    // 1. Try real-time streaming from backend Socratic LLM + pgvector RAG
    if (onStreamMessage) {
      try {
        let accumulated = "";
        const historyForStream = messages.map((m) => ({ role: m.role, content: m.content }));
        await onStreamMessage(
          text,
          historyForStream,
          (chunk: string) => {
            if (abortController.signal.aborted) return;
            hasStreamedToken = true;
            accumulated += chunk;
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantMessageId ? { ...m, content: accumulated } : m))
            );
          },
          abortController.signal
        );
      } catch (err: any) {
        console.warn("[AiChat9] Live streaming error:", err?.message || err);
      }
    } else if (onSendMessage) {
      try {
        const reply = await onSendMessage(text, selectedModel, reasoningEffort);
        if (reply) {
          hasStreamedToken = true;
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantMessageId ? { ...m, content: reply } : m))
          );
        }
      } catch (err: any) {
        console.warn("[AiChat9] onSendMessage error:", err?.message || err);
      }
    }

    // 2. If stream was unreachable or failed:
    if (!hasStreamedToken && !abortController.signal.aborted) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessageId
            ? {
                ...m,
                content:
                  "⚠️ Unable to reach the Socratic AI tutor. Please verify your connection or refresh the page.",
              }
            : m
        )
      );
    }

    setIsGenerating(false);
    setStreamingMessageId(null);
    abortControllerRef.current = null;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendPrompt(inputText);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeStr =
      file.size < 1024
        ? `${file.size} B`
        : file.size < 1024 * 1024
        ? `${(file.size / 1024).toFixed(1)} KB`
        : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

    setAttachment({
      name: file.name,
      size: sizeStr,
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /**
   * Minimal, rich obsidian-plum composer pinned cleanly inside the chatbox
   */
  const renderComposer = () => (
    <div className="w-full relative">
      <div className="w-full rounded-2xl bg-[#161224] border border-violet-300/[0.14] focus-within:border-violet-400/55 focus-within:shadow-[0_0_0_3px_rgba(139,92,246,0.12)] transition-all duration-200 px-3.5 py-2.5 shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
        {/* Active Attachment Badge */}
        {attachment && (
          <div className="flex items-center gap-2 mb-2 px-3 py-1.5 rounded-lg bg-[#1e1831] border border-violet-300/20 w-fit text-xs text-violet-100">
            <FileCode className="w-3.5 h-3.5 text-violet-300" />
            <span className="font-mono">{attachment.name}</span>
            <span className="text-violet-300/60 text-[10px]">({attachment.size})</span>
            <button
              onClick={() => setAttachment(null)}
              className="ml-1 text-violet-300/60 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Textarea + Inline Action Row */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={inputText}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder={`Ask your Socratic tutor about ${courseTitle}...`}
          className="w-full bg-transparent text-sm text-[#f6f3ec] placeholder:text-[#8c84a8] resize-none outline-none leading-relaxed max-h-[160px]"
        />

        <div className="flex items-center justify-between pt-2 mt-1 border-t border-white/[0.06]">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 text-[#9d95ba] hover:text-[#f6f3ec] rounded-lg hover:bg-violet-400/10 transition-colors cursor-pointer flex items-center justify-center"
              title="Attach code or files"
            >
              <Plus className="w-4 h-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>

          <div className="flex items-center gap-2">
            {isGenerating ? (
              <button
                type="button"
                onClick={handleStopGeneration}
                className="w-8 h-8 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/30 text-rose-200 flex items-center justify-center transition-all cursor-pointer"
                title="Stop generating"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSendPrompt(inputText)}
                disabled={!inputText.trim() && !attachment}
                className="w-8 h-8 rounded-xl bg-violet-500 hover:bg-violet-400 text-white disabled:bg-[#231d36] disabled:text-[#665e82] disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center transition-all cursor-pointer shadow-[0_4px_16px_rgba(139,92,246,0.38)]"
                title="Send message"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full h-full min-h-0 overflow-hidden bg-[#08060f] text-[#f4f2f8] flex flex-col items-center justify-center p-3 sm:p-5 md:p-6 font-sans selection:bg-violet-500/30 selection:text-white relative">
      {/* Subtle Rich Obsidian-Plum Ambient Backdrop */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 45% at 50% 0%, rgba(124, 58, 237, 0.14), transparent 65%), radial-gradient(ellipse 55% 45% at 88% 100%, rgba(76, 29, 149, 0.12), transparent 60%)",
        }}
        aria-hidden="true"
      />

      {/* Bounded Professional Minimal Chat Box */}
      <div className="relative z-10 w-full max-w-4xl h-full min-h-0 flex flex-col rounded-[22px] border border-violet-300/[0.13] bg-[#100d1a]/95 backdrop-blur-xl shadow-[0_24px_80px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.05)] overflow-hidden">
        {/* Pinned Top Bar inside Box */}
        <header className="w-full px-4 sm:px-6 py-3.5 border-b border-white/[0.07] bg-white/[0.015] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {onExit && (
              <button
                onClick={onExit}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#cfc8e6] hover:text-white hover:bg-violet-400/10 border border-white/[0.09] transition-colors cursor-pointer group shrink-0"
                title="Back to Course Overview"
              >
                <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
                <span>Back</span>
              </button>
            )}

            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-violet-300/30 font-light select-none">/</span>
              <span className="w-2 h-2 rounded-full bg-violet-400 shadow-[0_0_10px_rgba(167,139,250,0.8)] shrink-0" />
              <h2 className="text-sm font-semibold text-[#f6f3ec] tracking-tight truncate">
                {courseTitle}
              </h2>
            </div>
          </div>

          {messages.length > 0 && (
            <button
              onClick={() => {
                setMessages([]);
                if (onNewChat) onNewChat();
              }}
              className="text-xs text-[#9c94b8] hover:text-[#f6f3ec] flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-violet-400/10 transition-colors cursor-pointer shrink-0"
              title="Start new thread"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>New Chat</span>
            </button>
          )}
        </header>

        {/* Scrollable Message Stream Area (Previous chats scroll up cleanly inside this box) */}
        <main
          ref={scrollContainerRef}
          className="flex-1 min-h-0 w-full overflow-y-auto px-4 sm:px-7 py-6 space-y-6 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-violet-300/20 hover:[&::-webkit-scrollbar-thumb]:bg-violet-300/35"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <div
                onClick={cycleNextPrompt}
                className="cursor-pointer select-none max-w-xl"
                title="Click to cycle prompt"
              >
                <h1
                  className={`text-2xl sm:text-3xl md:text-[34px] font-sans font-bold text-[#f6f3ec] tracking-tight transition-all duration-300 leading-snug ${
                    fadeState === "visible" ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"
                  }`}
                >
                  {currentGreeting}
                </h1>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => {
                const isUser = message.role === "user";
                return (
                  <div
                    key={message.id}
                    className={`flex w-full group ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    {isUser ? (
                      <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl rounded-br-md px-4 py-3 bg-gradient-to-br from-[#2a1d4a] to-[#1e1538] border border-violet-400/25 text-[#f6f3ec] text-sm leading-relaxed shadow-[0_6px_22px_rgba(76,29,149,0.22)]">
                        {message.attachment && (
                          <div className="flex items-center gap-2 px-2.5 py-1.5 mb-2 rounded-lg bg-[#140e26]/80 border border-violet-300/20 text-xs text-violet-100">
                            <FileCode className="w-3.5 h-3.5 text-violet-300" />
                            <span className="truncate font-mono">{message.attachment.name}</span>
                            <span className="text-violet-300/60 text-[10px] ml-auto shrink-0">
                              {message.attachment.size}
                            </span>
                          </div>
                        )}
                        <div className="whitespace-pre-wrap">{message.content}</div>
                      </div>
                    ) : (
                      <div className="w-full text-sm text-[#e8e4f2] leading-relaxed relative pr-8">
                        <MarkdownRenderer content={message.content} />
                        {streamingMessageId === message.id && (
                          <span className="inline-block w-1.5 h-4 ml-1 align-middle bg-violet-400 rounded-xs animate-pulse" />
                        )}

                        {message.content && (
                          <button
                            onClick={() => handleCopy(message.id, message.content)}
                            className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-violet-400/10 text-[#8b83a8] hover:text-[#f6f3ec] transition-all cursor-pointer"
                            title="Copy text"
                          >
                            {copiedId === message.id ? (
                              <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </main>

        {/* Pinned Bottom Composer Bar (Always visible & anchored inside the box) */}
        <footer className="w-full px-4 sm:px-6 pb-4 pt-3 border-t border-white/[0.06] bg-[#0d0a16]/90 shrink-0">
          {renderComposer()}
        </footer>
      </div>
    </div>
  );
};

/**
 * Intelligent Markdown & Code block renderer
 */
const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  const [copiedCodeIdx, setCopiedCodeIdx] = useState<number | null>(null);

  const handleCopyCode = (idx: number, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeIdx(idx);
    setTimeout(() => setCopiedCodeIdx(null), 1800);
  };

  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-3 font-normal">
      {parts.map((part, idx) => {
        if (part.startsWith("```") && part.endsWith("```")) {
          const lines = part.slice(3, -3).trim().split("\n");
          let language = "code";
          let codeBody = part.slice(3, -3).trim();

          if (lines[0] && !lines[0].includes(" ") && lines.length > 1) {
            language = lines[0].trim();
            codeBody = lines.slice(1).join("\n");
          }

          return (
            <div
              key={idx}
              className="my-3 rounded-xl overflow-hidden border border-violet-300/[0.14] bg-[#0b0913] shadow-sm"
            >
              <div className="flex items-center justify-between px-3.5 py-1.5 border-b border-violet-300/[0.1] bg-[#141022] text-[11px] text-[#a79fc4] font-mono">
                <span>{language}</span>
                <button
                  onClick={() => handleCopyCode(idx, codeBody)}
                  className="flex items-center gap-1 hover:text-[#f6f3ec] transition-colors cursor-pointer"
                >
                  {copiedCodeIdx === idx ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3.5 text-xs text-[#ece8f6] font-mono overflow-x-auto leading-relaxed">
                <code>{codeBody}</code>
              </pre>
            </div>
          );
        }

        return (
          <div key={idx} className="whitespace-pre-wrap leading-relaxed">
            {renderFormattedText(part)}
          </div>
        );
      })}
    </div>
  );
};

function renderFormattedText(text: string): React.ReactNode {
  const tokens = text.split(/(\*\*.*?\*\*|`.*?`)/g);

  return tokens.map((token, i) => {
    if (token.startsWith("**") && token.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-[#ffffff]">
          {token.slice(2, -2)}
        </strong>
      );
    }
    if (token.startsWith("`") && token.endsWith("`")) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 rounded-md bg-violet-500/15 text-violet-200 text-xs font-mono border border-violet-400/25"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    return token;
  });
}
