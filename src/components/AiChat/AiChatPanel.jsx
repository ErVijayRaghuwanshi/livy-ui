import { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Send,
  Square,
  Trash2,
  Brain,
  Wrench,
  Loader2,
  Terminal,
  Database,
  Cpu,
  FileCode,
  PanelRightClose,
  Sliders,
  AlertCircle,
} from "lucide-react";
import { useAi } from "../../context/AiContext";
import ChatMessage from "./ChatMessage";

const SUGGESTIONS = [
  {
    label: "Top 5 Doris Customers",
    prompt: "Write an Apache Doris aggregation query to find top 5 customers by revenue from orders table, put it in a new file, and run it.",
    icon: Database,
  },
  {
    label: "List Livy Sessions",
    prompt: "List all active Livy sessions and check their states.",
    icon: Cpu,
  },
  {
    label: "Spark HDFS Parquet Query",
    prompt: "Write an Apache Spark SQL query to read parquet files directly from HDFS path 'hdfs://namenode/data/analytics/' and summarize counts.",
    icon: FileCode,
  },
];

export default function AiChatPanel({ onClose, onOpenSettings }) {
  const {
    provider,
    providerLabel,
    activeModelLabel,
    activeEngine,
    hostUrl,
    messages,
    isStreaming,
    isWarmingUp,
    streamingContent,
    streamingReasoning,
    activeTool,
    sendMessage,
    stopGeneration,
    clearChat,
    isOnline,
  } = useAi();

  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Focus textarea on panel open
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = "46px";
    }
  }, []);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, streamingReasoning, activeTool, isWarmingUp]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!input.trim() || isStreaming) return;
    sendMessage(input);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "46px";
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "Escape") {
      if (isStreaming) {
        stopGeneration();
      }
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(Math.max(e.target.scrollHeight, 46), 130)}px`;
  };

  const placeholderText = !isOnline
    ? provider === "ollama"
      ? `Ollama offline at ${hostUrl}...`
      : `API key required in Settings...`
    : "Ask AI to write SQL, run queries, or inspect tables...";

  return (
    <div className="flex flex-col h-full bg-(--color-bg-primary) select-none">
      {/* Top Header: Ultra-compact single line (~36px) */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-(--color-border) bg-(--color-bg-secondary) shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles size={15} className="text-purple-400 shrink-0" />
          <span className="font-semibold text-xs text-white uppercase tracking-wider shrink-0">
            AI Copilot
          </span>

          {/* Model Status Pill: Clicking opens AI Settings */}
          <button
            type="button"
            onClick={onOpenSettings}
            title={`Active Model: ${activeModelLabel} (${providerLabel})\nStatus: ${isOnline ? "Online" : "Needs Setup"}\nClick to configure in Settings`}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-(--color-bg-primary) border border-(--color-border) hover:border-purple-500/50 text-[10px] text-[#aaaaaa] hover:text-white cursor-pointer transition-colors truncate max-w-[170px]"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                isOnline
                  ? "bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.8)]"
                  : "bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.8)]"
              }`}
            />
            <span className="truncate font-mono">{activeModelLabel}</span>
          </button>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Quick Settings Gear Button */}
          {onOpenSettings && (
            <button
              type="button"
              onClick={onOpenSettings}
              title="Configure AI Providers & Models in Settings"
              className="p-1 rounded text-[#858585] hover:text-white hover:bg-(--color-bg-hover) transition-colors cursor-pointer"
            >
              <Sliders size={13} />
            </button>
          )}

          {/* Clear Chat History */}
          <button
            type="button"
            onClick={clearChat}
            title="Clear Chat History"
            className="p-1 rounded text-[#858585] hover:text-white hover:bg-(--color-bg-hover) transition-colors cursor-pointer"
          >
            <Trash2 size={13} />
          </button>

          {/* Close Panel */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              title="Close AI Copilot Panel (⌘⇧A)"
              className="p-1 rounded text-[#858585] hover:text-white hover:bg-(--color-bg-hover) transition-colors cursor-pointer ml-0.5"
            >
              <PanelRightClose size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Chat Messages Scroll Container */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 select-text">
        {/* Offline / Setup Needed Callout */}
        {!isOnline && messages.length <= 1 && (
          <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-600/40 text-amber-200 text-xs flex flex-col gap-2 mr-2 animate-fadeIn">
            <div className="flex items-center gap-2 font-medium">
              <AlertCircle size={14} className="text-amber-400 shrink-0" />
              <span>{provider === "ollama" ? "Ollama is Offline" : "API Key Required"}</span>
            </div>
            <p className="text-[11px] text-amber-300/80 leading-relaxed">
              {provider === "ollama"
                ? `Cannot connect to Ollama at ${hostUrl}. Ensure your local Ollama daemon is running or update your endpoint in Settings.`
                : `A valid API key is required to generate responses with ${providerLabel}.`}
            </p>
            {onOpenSettings && (
              <button
                type="button"
                onClick={onOpenSettings}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/50 text-amber-100 text-[11px] font-medium transition-colors cursor-pointer w-fit"
              >
                <Sliders size={12} />
                <span>Configure in Settings</span>
              </button>
            )}
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {/* Live Streaming Message Display */}
        {isStreaming && (
          <div className="flex flex-col gap-2 p-3 rounded-lg bg-(--color-bg-tertiary)/60 border border-(--color-border) text-xs leading-relaxed mr-2 animate-fadeIn">
            <div className="flex items-center gap-1.5 font-medium text-[11px] text-[#858585]">
              <Sparkles size={13} className="text-purple-400 animate-spin" />
              <span className="text-purple-300 font-semibold">AI Copilot Thinking...</span>
            </div>

            {/* Streaming Reasoning / Thinking */}
            {streamingReasoning && (
              <div className="border border-purple-800/30 rounded bg-purple-950/20 p-2 text-[#aaaaaa] font-mono text-[10px] whitespace-pre-wrap max-h-36 overflow-y-auto">
                <div className="flex items-center gap-1 text-purple-400 mb-1 font-semibold">
                  <Brain size={11} className="animate-pulse" />
                  <span>Reasoning:</span>
                </div>
                {streamingReasoning}
              </div>
            )}

            {/* Warming Up / VRAM Model Load State */}
            {isWarmingUp && !streamingContent && (
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded bg-amber-950/30 border border-amber-600/40 text-[11px] text-amber-300 animate-pulse">
                <Loader2 size={12} className="animate-spin text-amber-400 shrink-0" />
                <span>Loading model weights into memory... Response will start shortly.</span>
              </div>
            )}

            {/* Active Tool Execution Pill */}
            {activeTool && (
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded bg-purple-950/40 border border-purple-700/50 text-[11px] text-purple-200">
                <Loader2 size={12} className="animate-spin text-purple-400" />
                <span>
                  Executing tool: <strong className="font-mono text-purple-300">{activeTool.name}</strong>
                  {activeTool.args?.fileName ? ` (${activeTool.args.fileName})` : ""}
                </span>
              </div>
            )}

            {/* Streaming Content */}
            {streamingContent && (
              <div className="text-[#cccccc] whitespace-pre-wrap font-sans text-xs">
                {streamingContent}
                <span className="inline-block w-1.5 h-3 ml-0.5 bg-purple-400 animate-pulse align-middle" />
              </div>
            )}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestion Chips (when chat has only welcome message) */}
      {messages.length <= 1 && (
        <div className="p-2 border-t border-(--color-border) bg-(--color-bg-secondary)/50 flex flex-col gap-1.5">
          <span className="text-[10px] uppercase font-semibold text-[#666666] px-1">
            Suggested Prompts:
          </span>
          <div className="flex flex-col gap-1">
            {SUGGESTIONS.map((item, i) => {
              const Icon = item.icon;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => sendMessage(item.prompt)}
                  disabled={!isOnline || isStreaming}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded bg-(--color-bg-secondary) hover:bg-(--color-bg-hover) text-[#aaaaaa] hover:text-white border border-(--color-border) text-[11px] text-left transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Icon size={12} className="text-purple-400 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Input Form */}
      <div className="p-2.5 border-t border-(--color-border) bg-(--color-bg-secondary)">
        <form onSubmit={handleSubmit} className="flex flex-col gap-1.5">
          <div className="flex flex-col bg-(--color-bg-primary) border border-(--color-border) rounded-lg focus-within:border-purple-500/80 focus-within:ring-1 focus-within:ring-purple-500/30 transition-all shadow-sm overflow-hidden">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={isStreaming}
              rows={2}
              placeholder={placeholderText}
              className="w-full bg-transparent text-[#e0e0e0] text-xs px-3 pt-2.5 pb-1 resize-none focus:outline-none placeholder-[#555555] min-h-[46px] max-h-32 leading-relaxed"
            />

            <div className="flex items-center justify-between px-2.5 pb-2 pt-0.5 select-none">
              <span className="text-[10px] text-[#666666] flex items-center gap-1">
                <span>Enter ↵ to send</span>
                <span className="text-[#444444]">•</span>
                <span>Shift+Enter for newline</span>
              </span>

              <div className="flex items-center gap-1 shrink-0">
                {isStreaming ? (
                  <button
                    type="button"
                    onClick={stopGeneration}
                    title="Stop generation (Esc)"
                    className="flex items-center justify-center w-7 h-7 rounded-md bg-red-600 hover:bg-red-500 text-white transition-colors cursor-pointer shadow-sm"
                  >
                    <Square size={12} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!input.trim() || !isOnline}
                    title="Send message (Enter)"
                    className="flex items-center justify-center w-7 h-7 rounded-md bg-purple-600 hover:bg-purple-500 disabled:bg-[#282828] disabled:text-[#555555] text-white transition-all cursor-pointer disabled:cursor-not-allowed shadow-sm"
                  >
                    <Send size={12} />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-[#666666] px-1 select-none">
            <span className="truncate max-w-[140px] text-[#777777]">
              {activeEngine === "doris" ? "⚡ Doris SQL" : "✨ Spark SQL"}
            </span>
            <span className="truncate max-w-[160px] font-mono text-[#777777]">{providerLabel}</span>
          </div>
        </form>
      </div>
    </div>
  );
}
