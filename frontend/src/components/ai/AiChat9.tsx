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
  onSendMessage,
  onStreamMessage,
}) => {
  const [selectedModel] = useState<AIModel>(CHAT_MODELS[1]); // Atlas
  const [reasoningEffort] = useState<ReasoningEffort>("balanced");

  // Initialize with clean empty messages by default so the centered welcome screen appears
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);

  // Sync messages whenever initialMessages updates (e.g. when session finishes loading from backend)
  useEffect(() => {
    if (initialMessages && initialMessages.length > 0) {
      setMessages(initialMessages);
    }
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
    return "Dhanush";
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

  // Auto-scroll on new message
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
   * Reusable ReactBits Chat Composer
   */
  const renderComposer = (isCentered: boolean) => (
    <div className="w-full relative">
      {/* Input Box Card */}
      <div
        className={`w-full rounded-2xl bg-[#121214] border border-zinc-800/90 focus-within:border-zinc-700 transition-colors p-3.5 ${
          isCentered ? "shadow-2xl sm:p-4" : "shadow-xl"
        }`}
      >
        {/* Active Attachment Badge */}
        {attachment && (
          <div className="flex items-center gap-2 mb-2 px-3 py-1.5 rounded-lg bg-zinc-900/90 border border-zinc-800 w-fit text-xs text-zinc-300">
            <FileCode className="w-3.5 h-3.5 text-zinc-400" />
            <span className="font-mono">{attachment.name}</span>
            <span className="text-zinc-500 text-[10px]">({attachment.size})</span>
            <button
              onClick={() => setAttachment(null)}
              className="ml-1 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          rows={isCentered ? 2 : 1}
          value={inputText}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder={`Ask your Socratic tutor about ${courseTitle}...`}
          className="w-full bg-transparent text-sm sm:text-base text-zinc-100 placeholder:text-zinc-500 resize-none outline-none leading-relaxed"
        />

        {/* Bottom Toolbar inside Composer */}
        <div className="flex items-center justify-between pt-2.5 mt-1 border-t border-zinc-800/40">
          <div className="flex items-center gap-1.5">
            {/* Attachment Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 text-zinc-400 hover:text-zinc-200 rounded-md hover:bg-zinc-800/60 transition-colors cursor-pointer flex items-center justify-center"
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

          {/* Right Controls: Send / Stop Button */}
          <div className="flex items-center gap-2">
            {isGenerating ? (
              <button
                type="button"
                onClick={handleStopGeneration}
                className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center justify-center transition-all cursor-pointer shadow-sm"
                title="Stop generating"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSendPrompt(inputText)}
                disabled={!inputText.trim() && !attachment}
                className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all cursor-pointer shadow-sm"
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
    <div className="w-full min-h-screen bg-[#09090b] text-[#f4f4f5] flex flex-col font-sans selection:bg-zinc-800 selection:text-white">
      {/* Top Header Bar: Clean Back button + Course Name on Left; Clean right without redundant pills */}
      <header className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-5 pb-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          {onExit && (
            <button
              onClick={onExit}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/80 border border-zinc-800 transition-colors cursor-pointer group"
              title="Back to Course Overview"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
              <span>Back</span>
            </button>
          )}

          {/* Course Name displayed at top left directly to the right of back button */}
          <div className="flex items-center gap-2">
            <span className="text-zinc-600 font-light select-none">/</span>
            <h2 className="text-sm font-semibold text-zinc-100 tracking-tight">
              {courseTitle}
            </h2>
          </div>
        </div>

        {/* Top Right: Clean reset action */}
        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-zinc-900 transition-colors cursor-pointer"
            title="Start new thread"
          >
            <RotateCcw className="w-3 h-3" />
            <span>New Chat</span>
          </button>
        )}
      </header>

      {/* Main Content: Either Centered Welcome with Rotating Texts OR Full Expanded Chat */}
      {messages.length === 0 ? (
        /* Centered Welcome Display */
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-3xl mx-auto px-4 -mt-10 sm:-mt-14">
          {/* Dynamic Rotating Headline with User's Name at the end */}
          <div
            onClick={cycleNextPrompt}
            className="mb-8 text-center cursor-pointer select-none"
            title="Click to cycle prompt"
          >
            <h1
              className={`text-2xl sm:text-3xl md:text-[36px] font-sans font-bold text-zinc-100 tracking-tight transition-all duration-300 leading-snug ${
                fadeState === "visible" ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"
              }`}
            >
              {currentGreeting}
            </h1>
          </div>

          {/* Centered Composer Card */}
          {renderComposer(true)}
        </div>
      ) : (
        /* Expanded Full-Window Conversation Stream */
        <>
          <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 overflow-y-auto py-6 space-y-6">
            {messages.map((message) => {
              const isUser = message.role === "user";
              return (
                <div
                  key={message.id}
                  className={`flex w-full group ${isUser ? "justify-end" : "justify-start"}`}
                >
                  {isUser ? (
                    // User Message Bubble
                    <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 bg-[#1c1c20] border border-zinc-800/70 text-zinc-100 text-sm leading-relaxed shadow-sm">
                      {message.attachment && (
                        <div className="flex items-center gap-2 px-2.5 py-1.5 mb-2 rounded-lg bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-300">
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
                    // Assistant Message
                    <div className="w-full text-sm text-zinc-200 leading-relaxed relative pr-8">
                      <MarkdownRenderer content={message.content} />
                      {streamingMessageId === message.id && (
                        <span className="inline-block w-1.5 h-4 ml-1 align-middle bg-zinc-400 animate-pulse" />
                      )}

                      {message.content && (
                        <button
                          onClick={() => handleCopy(message.id, message.content)}
                          className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-200 transition-all cursor-pointer"
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
          </main>

          {/* Bottom Docked Composer */}
          <footer className="w-full max-w-4xl mx-auto px-4 sm:px-6 pb-6 pt-2 shrink-0 relative">
            {renderComposer(false)}
          </footer>
        </>
      )}
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
              className="my-3 rounded-xl overflow-hidden border border-zinc-800 bg-[#121215]"
            >
              <div className="flex items-center justify-between px-3.5 py-1.5 border-b border-zinc-800/80 bg-zinc-900/60 text-[11px] text-zinc-400 font-mono">
                <span>{language}</span>
                <button
                  onClick={() => handleCopyCode(idx, codeBody)}
                  className="flex items-center gap-1 hover:text-zinc-200 transition-colors cursor-pointer"
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
              <pre className="p-3.5 text-xs text-zinc-200 font-mono overflow-x-auto leading-relaxed">
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
        <strong key={i} className="font-semibold text-zinc-100">
          {token.slice(2, -2)}
        </strong>
      );
    }
    if (token.startsWith("`") && token.endsWith("`")) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-200 text-xs font-mono border border-zinc-700/40"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    return token;
  });
}
