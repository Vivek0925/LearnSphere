import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Bot,
  User,
  Sparkles,
  Trash2,
  Copy,
  Check,
  BookOpen,
  FileQuestion,
  TrendingUp,
  Lightbulb,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { chatbotService } from "../services";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { Paperclip, X, FileText } from "lucide-react";

// Markdown-like renderer for AI responses
function MessageContent({ text }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-1.5 text-sm leading-relaxed">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />;
        // Bold **text**
        const parts = line.split(/(\*\*.*?\*\*)/g);
        const rendered = parts.map((p, j) =>
          p.startsWith("**") && p.endsWith("**") ? (
            <strong
              key={j}
              className="font-semibold"
              style={{ color: "var(--color-text)" }}
            >
              {p.slice(2, -2)}
            </strong>
          ) : (
            p
          ),
        );
        // Bullet points
        if (line.trim().startsWith("- ") || line.trim().startsWith("• ")) {
          return (
            <div key={i} className="flex items-start gap-2 ml-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2 flex-shrink-0" />
              <span>
                {rendered.map((p, j) =>
                  typeof p === "string" ? p.replace(/^[-•]\s*/, "") : p,
                )}
              </span>
            </div>
          );
        }
        // Code blocks `code`
        if (line.trim().startsWith("`") && line.trim().endsWith("`")) {
          return (
            <code
              key={i}
              className="block px-3 py-2 rounded-lg text-xs font-mono"
              style={{
                background: "var(--color-surface-2)",
                color: "var(--color-primary)",
                border: "1px solid var(--color-border)",
              }}
            >
              {line.trim().slice(1, -1)}
            </code>
          );
        }
        // Numbered list
        if (/^\d+\.\s/.test(line.trim())) {
          return (
            <div key={i} className="flex items-start gap-2 ml-2">
              <span className="text-xs font-bold text-primary-400 mt-0.5 w-4 flex-shrink-0">
                {line.trim().match(/^(\d+)\./)?.[1]}.
              </span>
              <span>
                {rendered.map((p, j) =>
                  typeof p === "string" ? p.replace(/^\d+\.\s*/, "") : p,
                )}
              </span>
            </div>
          );
        }
        // Headings ###
        if (line.startsWith("### ")) {
          return (
            <p
              key={i}
              className="font-bold text-base mt-2"
              style={{ color: "var(--color-text)" }}
            >
              {line.slice(4)}
            </p>
          );
        }
        if (line.startsWith("## ")) {
          return (
            <p
              key={i}
              className="font-bold text-lg mt-3"
              style={{ color: "var(--color-text)" }}
            >
              {line.slice(3)}
            </p>
          );
        }
        return <p key={i}>{rendered}</p>;
      })}
    </div>
  );
}

const SUGGESTED_PROMPTS = [
  { icon: BookOpen, label: "Explain AVL trees", color: "#6366f1" },
  {
    icon: FileQuestion,
    label: "Most important OS topics for exam?",
    color: "#10b981",
  },
  {
    icon: TrendingUp,
    label: "Difference between TCP and UDP",
    color: "#f59e0b",
  },
  { icon: Lightbulb, label: "Explain deadlock with example", color: "#ec4899" },
  {
    icon: BookOpen,
    label: "What is database normalization?",
    color: "#3b82f6",
  },
  { icon: Lightbulb, label: "Quick sort vs merge sort", color: "#8b5cf6" },
];

const FREE_MODELS = [
  { id: "google/gemma-2-9b-it:free", label: "Gemma 2 (Best Tutor)" },
  { id: "microsoft/phi-3-mini-128k-instruct:free", label: "Phi-3 Mini (Fast)" },
  { id: "qwen/qwen-2-7b-instruct:free", label: "Qwen 2 (Reasoning)" },
];

export default function ChatbotPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      text: `Hi ${user?.name?.split(" ")[0] || "there"}! 👋 I'm your LearnSphere AI tutor.\n\n How can i Help You`,
      time: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(
    "google/gemma-2-9b-it:free",
  );
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const textareaRef = useRef(null);
  const [attachedFile, setAttachedFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 160) + "px";
    }
  }, [input]);

  const getHistory = () =>
    messages
      .filter((m) => m.id !== 1)
      .map((m) => ({ role: m.role, content: m.text }));

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg && !attachedFile) return;
    if (loading) return;
    setInput("");
    setShowModelPicker(false);

    // Build user message bubble
    const userMsg = {
      id: Date.now(),
      role: "user",
      text: msg,
      fileName: attachedFile?.name || null,
      time: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);

    const fileToSend = attachedFile;
    setAttachedFile(null);
    setLoading(true);

    try {
      const res = await chatbotService.sendMessage(
        msg,
        getHistory(),
        fileToSend,
      );
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          text: res.data.response,
          model: res.data.model,
          wasPDF: res.data.wasPDF,
          time: new Date(),
        },
      ]);
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Connection failed. Check OPENROUTER_API_KEY in backend .env";
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          text: `⚠️ ${errorMsg}`,
          isError: true,
          time: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  };

  const copyMessage = async (id, text) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        role: "assistant",
        text: "Chat cleared! What would you like to learn about?",
        time: new Date(),
      },
    ]);
    toast.success("Chat cleared");
  };

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="flex flex-col h-full min-h-0 animate-fade-in">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-4 flex-shrink-0"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700
                       flex items-center justify-center shadow-lg"
            style={{ boxShadow: "0 8px 24px rgba(111,97,255,0.3)" }}
          >
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h1
              className="text-xl font-bold"
              style={{ color: "var(--color-text)" }}
            >
              AI Tutor
            </h1>
            <div className="flex items-center gap-1.5"></div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Model Picker */}
          <div className="relative">
            <button
              onClick={() => setShowModelPicker((s) => !s)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all"
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text-muted)",
              }}
            >
              <Bot size={13} />
              <span className="hidden sm:block max-w-[140px] truncate">
                {FREE_MODELS.find((m) => m.id === selectedModel)?.label ||
                  "Select model"}
              </span>
              <ChevronDown
                size={13}
                className={`transition-transform ${showModelPicker ? "rotate-180" : ""}`}
              />
            </button>

            <AnimatePresence>
              {showModelPicker && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-64 rounded-2xl z-50 overflow-hidden"
                  style={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    boxShadow: "var(--shadow-glass)",
                  }}
                >
                  <div className="p-2">
                    <p
                      className="text-xs font-semibold px-2 py-1.5 mb-1"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      Free Models (OpenRouter)
                    </p>
                    {FREE_MODELS.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => {
                          setSelectedModel(model.id);
                          setShowModelPicker(false);
                        }}
                        className="w-full text-left px-3 py-2.5 rounded-xl text-xs transition-all
                                   hover:bg-[var(--color-surface-2)] flex items-center justify-between"
                        style={{
                          color:
                            selectedModel === model.id
                              ? "var(--color-primary)"
                              : "var(--color-text)",
                        }}
                      >
                        {model.label}
                        {selectedModel === model.id && (
                          <Check size={12} className="text-primary-400" />
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Clear chat */}
          <button
            onClick={clearChat}
            className="p-2.5 rounded-xl transition-all hover:bg-red-500/10 hover:text-red-400"
            style={{
              color: "var(--color-text-muted)",
              border: "1px solid var(--color-border)",
              background: "var(--color-surface)",
            }}
            title="Clear chat"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </motion.div>

      {/* ── Chat card ── */}
      <div className="flex-1 flex flex-col min-h-0 card overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 scroll-smooth">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"} group`}
            >
              {/* Avatar */}
              <div
                className={`w-9 h-9 rounded-2xl flex-shrink-0 flex items-center justify-center
                              font-bold text-sm shadow-md ${
                                msg.role === "user"
                                  ? "bg-gradient-to-br from-primary-400 to-primary-600 text-white"
                                  : "bg-gradient-to-br from-primary-500 to-primary-700 text-white"
                              }`}
              >
                {msg.role === "user" ? (
                  user?.name?.[0]?.toUpperCase() || <User size={16} />
                ) : (
                  <Sparkles size={16} />
                )}
              </div>

              {/* Bubble + meta */}
              <div
                className={`flex flex-col gap-1 max-w-[80%]
                              ${msg.role === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`px-4 py-3 rounded-2xl ${
                    msg.role === "user"
                      ? "rounded-tr-sm text-white"
                      : "rounded-tl-sm"
                  } ${msg.isError ? "border border-red-500/30" : ""}`}
                  style={
                    msg.role === "user"
                      ? {
                          background:
                            "linear-gradient(135deg, #6f61ff, #8f87ff)",
                        }
                      : {
                          background: "var(--color-surface-2)",
                          border: "1px solid var(--color-border)",
                          color: "var(--color-text)",
                        }
                  }
                >
                  {msg.role === "user" ? (
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                  ) : (
                    <MessageContent text={msg.text} />
                  )}
                </div>

                {/* Timestamp + model + copy — visible on hover */}
                <div
                  className={`flex items-center gap-2 px-1 opacity-0 group-hover:opacity-100
                                transition-opacity ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  <span
                    className="text-xs"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {formatTime(msg.time)}
                  </span>
                  {msg.model && (
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-md"
                      style={{
                        background: "var(--color-surface-2)",
                        color: "var(--color-text-muted)",
                        border: "1px solid var(--color-border)",
                      }}
                    >
                      {msg.model.split("/").pop()?.split(":")[0] || msg.model}
                    </span>
                  )}
                  {msg.role === "assistant" && !msg.isError && (
                    <button
                      onClick={() => copyMessage(msg.id, msg.text)}
                      className="p-1 rounded-lg hover:bg-[var(--color-surface-2)] transition-colors"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {copiedId === msg.id ? (
                        <Check size={12} className="text-emerald-400" />
                      ) : (
                        <Copy size={12} />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <div
                className="w-9 h-9 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700
                              flex items-center justify-center flex-shrink-0"
              >
                <Sparkles size={16} className="text-white" />
              </div>
              <div
                className="px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-3"
                style={{
                  background: "var(--color-surface-2)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <Loader2 size={15} className="animate-spin text-primary-400" />
                <span
                  className="text-sm"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Thinking...
                </span>
              </div>
            </motion.div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Suggested prompts — only shown before first message */}
        <AnimatePresence>
          {messages.length <= 1 && !loading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="px-4 md:px-6 pb-3 border-t border-[var(--color-border)]"
            >
              <p
                className="text-xs font-semibold mt-3 mb-2"
                style={{ color: "var(--color-text-muted)" }}
              >
                Suggested questions
              </p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_PROMPTS.map((s, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => sendMessage(s.label)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium
                               transition-all hover:scale-105 active:scale-95"
                    style={{
                      background: `${s.color}15`,
                      color: s.color,
                      border: `1px solid ${s.color}30`,
                    }}
                  >
                    <s.icon size={11} />
                    {s.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input bar div — replace your existing one */}
        <div
          className="flex items-end gap-2 p-2 rounded-2xl"
          style={{
            background: "var(--color-surface-2)",
            border: "1px solid var(--color-border)",
          }}
        >
          {/* Paperclip button */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setAttachedFile(file);
                toast.success(`${file.name} attached`);
              }
              e.target.value = "";
            }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-xl transition-all flex-shrink-0 hover:bg-primary-500/10"
            style={{
              color: attachedFile
                ? "var(--color-primary)"
                : "var(--color-text-muted)",
            }}
            title="Attach PYQ PDF"
          >
            <Paperclip size={18} />
          </button>

          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder={
              attachedFile
                ? `Ask about ${attachedFile.name}...`
                : "Ask anything or attach a PYQ PDF..."
            }
            rows={1}
            className="flex-1 bg-transparent px-2 py-2 text-sm outline-none resize-none leading-relaxed"
            style={{
              color: "var(--color-text)",
              maxHeight: "160px",
              minHeight: "40px",
            }}
          />

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => sendMessage()}
            disabled={(!input.trim() && !attachedFile) || loading}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0 disabled:opacity-40"
            style={{ background: "linear-gradient(135deg, #6f61ff, #8f87ff)" }}
          >
            <Send size={16} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
