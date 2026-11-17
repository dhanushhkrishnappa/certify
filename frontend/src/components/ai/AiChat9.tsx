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
   * Minimal, rich matte-black composer pinned cleanly inside the chatbox
   */
  const renderComposer = () => (
    <div className="w-full relative">
      <div className="w-full rounded-2xl bg-[#111113] border border-white/[0.11] focus-within:border-white/30 focus-within:shadow-[0_0_0_3px_rgba(255,255,255,0.05)] transition-all duration-200 px-5 py-3.5 shadow-[0_10px_32px_rgba(0,0,0,0.5)]">
        {/* Active Attachment Badge */}
        {attachment && (
          <div className="flex items-center gap-2 mb-2 px-3 py-1.5 rounded-lg bg-[#19191c] border border-white/[0.12] w-fit text-xs text-zinc-200">
            <FileCode className="w-3.5 h-3.5 text-zinc-400" />
            <span className="font-mono">{attachment.name}</span>
            <span className="text-zinc-500 text-[10px]">({attachment.size})</span>
            <button
              onClick={() => setAttachment(null)}
              className="ml-1 text-zinc-500 hover:text-white transition-colors cursor-pointer"
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
          className="font-chat w-full bg-transparent text-[15px] text-[#f4f4f5] placeholder:text-zinc-500 resize-none outline-none leading-relaxed tracking-[-0.008em] max-h-[160px]"
        />

        <div className="flex items-center justify-between pt-2.5 mt-1.5 border-t border-white/[0.06]">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/[0.06] transition-colors cursor-pointer flex items-center justify-center"
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
                className="w-8 h-8 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-white/10 text-white flex items-center justify-center transition-all cursor-pointer"
                title="Stop generating"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSendPrompt(inputText)}
                disabled={!inputText.trim() && !attachment}
                className="w-8 h-8 rounded-xl bg-white hover:bg-zinc-200 text-black disabled:bg-[#1c1c1f] disabled:text-zinc-600 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center transition-all cursor-pointer shadow-[0_2px_12px_rgba(255,255,255,0.16)]"
                title="Send message"
              >
                <ArrowUp className="w-4 h-4 stroke-[2.2]" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full h-full min-h-0 overflow-hidden bg-[#030304] text-[#f4f4f5] flex flex-col items-center justify-center p-3 sm:p-5 md:p-6 font-chat selection:bg-white/20 selection:text-white relative">
      {/* Subtle Neutral Metallic Sheen on Rich Pitch-Black Canvas */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 65% 40% at 50% 0%, rgba(255, 255, 255, 0.035), transparent 65%)",
        }}
        aria-hidden="true"
      />

      {/* Expanded Bounded Rich-Black Chat Box */}
      <div className="relative z-10 w-full max-w-[1080px] h-full min-h-0 flex flex-col rounded-[22px] border border-white/[0.09] bg-[#09090b] shadow-[0_28px_90px_rgba(0,0,0,0.88),inset_0_1px_0_rgba(255,255,255,0.06)] overflow-hidden">
        {/* Pinned Top Bar inside Box */}
        <header className="w-full px-6 sm:px-8 py-4 border-b border-white/[0.07] bg-[#0c0c0e] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {onExit && (
              <button
                onClick={onExit}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.06] border border-white/[0.09] transition-colors cursor-pointer group shrink-0"
                title="Back to Course Overview"
              >
                <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
                <span>Back</span>
              </button>
            )}

            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-zinc-600 font-light select-none">/</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)] shrink-0" />
              <h2 className="font-chat text-[13.5px] font-medium text-[#f4f4f5] tracking-[-0.012em] truncate">
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
              className="text-xs font-medium text-zinc-400 hover:text-white flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-white/[0.06] transition-colors cursor-pointer shrink-0"
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
          className="flex-1 min-h-0 w-full overflow-y-auto px-6 sm:px-10 py-8 space-y-7 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/[0.12] hover:[&::-webkit-scrollbar-thumb]:bg-white/[0.24]"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <div
                onClick={cycleNextPrompt}
                className="cursor-pointer select-none max-w-2xl"
                title="Click to cycle prompt"
              >
                <h1
                  className={`font-editorial text-3xl sm:text-4xl md:text-[42px] font-normal text-[#f5f5f5] tracking-[-0.02em] transition-all duration-300 leading-[1.2] ${
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
                      <div className="font-chat max-w-[82%] sm:max-w-[70%] rounded-2xl rounded-br-md px-5 py-3 bg-[#17171a] border border-white/[0.1] text-[#f5f5f7] text-[14.5px] leading-[1.6] tracking-[-0.008em] shadow-[0_6px_22px_rgba(0,0,0,0.4)]">
                        {message.attachment && (
                          <div className="flex items-center gap-2 px-3 py-1.5 mb-2 rounded-lg bg-[#0e0e10] border border-white/[0.08] text-xs text-zinc-300">
                            <FileCode className="w-3.5 h-3.5 text-zinc-400" />
                            <span className="truncate font-mono">{message.attachment.name}</span>
                            <span className="text-zinc-500 text-[10px] ml-auto shrink-0">
                              {message.attachment.size}
                            </span>
                          </div>
                        )}
                        <div className="whitespace-pre-wrap">{message.content}</div>
                      </div>
                    ) : (
                      <div className="font-chat w-full px-1 pr-10 text-[15px] text-[#e4e4e7] leading-[1.75] tracking-[-0.009em] relative">
                        <MarkdownRenderer content={message.content} />
                        {streamingMessageId === message.id && (
                          <span className="inline-block w-1.5 h-4 ml-1 align-middle bg-zinc-200 rounded-sm animate-pulse" />
                        )}

                        {message.content && (
                          <button
                            onClick={() => handleCopy(message.id, message.content)}
                            className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-white/[0.07] text-zinc-500 hover:text-white transition-all cursor-pointer"
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

        {/* Pinned Bottom Composer Bar (Always visible & anchored inside the rich black box) */}
        <footer className="w-full px-6 sm:px-8 py-4 border-t border-white/[0.07] bg-[#0b0b0d] shrink-0">
          {renderComposer()}
        </footer>
      </div>
    </div>
  );
};

/**
 * Refined Editorial Markdown & Code Renderer
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
    <div className="space-y-3.5 font-chat font-normal">
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
              className="my-3.5 rounded-xl overflow-hidden border border-white/[0.09] bg-[#050506] shadow-[0_6px_24px_rgba(0,0,0,0.45)]"
            >
              <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.07] bg-[#0d0d0f] text-[11px] text-zinc-400 font-mono">
                <span className="uppercase tracking-wider text-[10px] text-zinc-400">{language}</span>
                <button
                  onClick={() => handleCopyCode(idx, codeBody)}
                  className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
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
              <pre className="p-4 text-[13px] text-[#e4e4e7] font-mono overflow-x-auto leading-[1.65]">
                <code>{codeBody}</code>
              </pre>
            </div>
          );
        }

        // Parse structured markdown blocks (headings, bullet lists, numbered lists, paragraphs)
        const lines = part.split("\n");
        return (
          <div key={idx} className="space-y-2">
            {lines.map((line, lIdx) => {
              const trimmed = line.trim();
              if (!trimmed) return <div key={lIdx} className="h-1" />;

              // Headings (#, ##, ###)
              const h3Match = trimmed.match(/^###\s+(.+)$/);
              if (h3Match) {
                return (
                  <h3
                    key={lIdx}
                    className="font-editorial text-[19px] font-medium text-white tracking-[-0.015em] pt-2 pb-0.5 leading-snug"
                  >
                    {renderFormattedText(h3Match[1])}
                  </h3>
                );
              }
              const h2Match = trimmed.match(/^##\s+(.+)$/);
              if (h2Match) {
                return (
                  <h2
                    key={lIdx}
                    className="font-editorial text-[21px] font-medium text-white tracking-[-0.02em] pt-2 pb-0.5 leading-snug"
                  >
                    {renderFormattedText(h2Match[1])}
                  </h2>
                );
              }
              const h1Match = trimmed.match(/^#\s+(.+)$/);
              if (h1Match) {
                return (
                  <h1
                    key={lIdx}
                    className="font-editorial text-[24px] font-medium text-white tracking-[-0.02em] pt-2 pb-1 leading-snug"
                  >
                    {renderFormattedText(h1Match[1])}
                  </h1>
                );
              }

              // Numbered list item
              const numMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
              if (numMatch) {
                return (
                  <div key={lIdx} className="flex items-start gap-2.5 pl-1">
                    <span className="font-mono text-[12px] text-zinc-400 font-medium mt-[3px] shrink-0 min-w-[18px]">
                      {numMatch[1]}.
                    </span>
                    <p className="flex-1 leading-[1.72]">{renderFormattedText(numMatch[2])}</p>
                  </div>
                );
              }

              // Bullet list item
              const bulletMatch = trimmed.match(/^[-*•]\s+(.+)$/);
              if (bulletMatch) {
                return (
                  <div key={lIdx} className="flex items-start gap-2.5 pl-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 mt-[10px] shrink-0" />
                    <p className="flex-1 leading-[1.72]">{renderFormattedText(bulletMatch[1])}</p>
                  </div>
                );
              }

              // Standard editorial paragraph
              return (
                <p key={lIdx} className="leading-[1.75] text-[#e4e4e7]">
                  {renderFormattedText(line)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

function renderFormattedText(text: string): React.ReactNode {
  const tokens = text.split(/(\*\*.*?\*\*|\*[^*]+?\*|`.*?`)/g);

  return tokens.map((token, i) => {
    if (token.startsWith("**") && token.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-white tracking-[-0.01em]">
          {token.slice(2, -2)}
        </strong>
      );
    }
    if (token.startsWith("*") && token.endsWith("*") && token.length > 2) {
      return (
        <em key={i} className="italic text-zinc-200">
          {token.slice(1, -1)}
        </em>
      );
    }
    if (token.startsWith("`") && token.endsWith("`")) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 rounded-md bg-[#18181b] text-[#f4f4f5] text-[13px] font-mono border border-white/[0.1]"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    return token;
  });
}
