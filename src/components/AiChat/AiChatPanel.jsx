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
  MessageSquare,
  Zap,
  AtSign,
  X,
} from "lucide-react";
import { useAi } from "../../context/AiContext";
import ChatMessage from "./ChatMessage";
import ContextPicker from "./ContextPicker";

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
    agentMode,
    setAgentMode,
    attachedContexts,
    addAttachedContext,
    removeAttachedContext,
    clearAttachedContexts,
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
  const [isContextPickerOpen, setIsContextPickerOpen] = useState(false);
  const [contextSearchQuery, setContextSearchQuery] = useState("");
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
    setIsContextPickerOpen(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = "46px";
    }
  };

  const handleKeyDown = (e) => {
    // Option/Alt + M toggles agentMode
    if (e.altKey && (e.key === "m" || e.key === "M")) {
      e.preventDefault();
      setAgentMode(agentMode === "ask" ? "action" : "ask");
      return;
    }

    if (e.key === "Enter" && !e.shiftKey) {
      if (isContextPickerOpen) return; // Allow context picker to handle Enter
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "Escape") {
      if (isContextPickerOpen) {
        setIsContextPickerOpen(false);
        return;
      }
      if (isStreaming) {
        stopGeneration();
      }
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInput(val);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(Math.max(e.target.scrollHeight, 46), 130)}px`;

    // Detect inline @ mention trigger
    const atMatch = val.match(/@([a-zA-Z0-9_\-\.]*)$/);
    if (atMatch) {
      setContextSearchQuery(atMatch[1]);
      setIsContextPickerOpen(true);
    } else if (isContextPickerOpen && !val.includes("@")) {
      setIsContextPickerOpen(false);
    }
  };

  const handleSelectContext = (item) => {
    addAttachedContext(item);
    setIsContextPickerOpen(false);
    setInput((prev) => prev.replace(/@[a-zA-Z0-9_\-\.]*$/, "").trimEnd() + " ");
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const placeholderText = !isOnline
    ? provider === "ollama"
      ? `Ollama offline at ${hostUrl}...`
      : `API key required in Settings...`
    : agentMode === "ask"
    ? "Ask questions, explain queries, explore schemas (read-only)..."
    : "Describe SQL to build, edit files, or execute queries...";

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

      {/* Input Form with Mode Switcher & Context Bar */}
      <div className="p-2.5 border-t border-(--color-border) bg-(--color-bg-secondary) flex flex-col gap-2 relative">
        {/* Floating Context Picker Popover */}
        {isContextPickerOpen && (
          <div className="absolute bottom-full left-2.5 right-2.5 mb-2 z-50">
            <ContextPicker
              onSelect={handleSelectContext}
              onClose={() => setIsContextPickerOpen(false)}
              searchFilter={contextSearchQuery}
            />
          </div>
        )}

        {/* Toolbar: Segmented Mode Switcher & Add Context */}
        <div className="flex items-center justify-between text-xs select-none">
          {/* Segmented Mode Switcher */}
          <div className="flex items-center rounded-lg bg-(--color-bg-primary) border border-(--color-border) p-0.5 shadow-xs">
            <button
              type="button"
              onClick={() => setAgentMode("ask")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                agentMode === "ask"
                  ? "bg-blue-600/30 text-blue-200 border border-blue-500/40 shadow-xs"
                  : "text-[#888888] hover:text-[#cccccc]"
              }`}
              title="Ask Mode: Q&A, explain queries, explore schemas. Advisory only, does not alter files. (⌥M)"
            >
              <MessageSquare size={12} className={agentMode === "ask" ? "text-blue-400" : ""} />
              <span>Ask</span>
            </button>

            <button
              type="button"
              onClick={() => setAgentMode("action")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                agentMode === "action"
                  ? "bg-purple-600/30 text-purple-200 border border-purple-500/40 shadow-xs"
                  : "text-[#888888] hover:text-[#cccccc]"
              }`}
              title="Code Mode: Autonomous agent. Writes and edits files with Staged Diff Review (Accept/Reject). (⌥M)"
            >
              <Zap size={12} className={agentMode === "action" ? "text-purple-400" : ""} />
              <span>Code</span>
            </button>
          </div>

          {/* Add Context Button */}
          <button
            type="button"
            onClick={() => setIsContextPickerOpen((prev) => !prev)}
            className="flex items-center gap-1 px-2 py-1 rounded-md bg-(--color-bg-primary) hover:bg-(--color-bg-hover) text-[#aaaaaa] hover:text-white border border-(--color-border) text-[11px] transition-colors cursor-pointer"
            title="Add context (@): Pin SQL files, tables, editor selection, or query results"
          >
            <AtSign size={12} className="text-purple-400" />
            <span>Add Context</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-1.5">
          <div className="flex flex-col bg-(--color-bg-primary) border border-(--color-border) rounded-lg focus-within:border-purple-500/80 focus-within:ring-1 focus-within:ring-purple-500/30 transition-all shadow-sm overflow-hidden">
            {/* Attached Context Chips */}
            {attachedContexts.length > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 pt-2 flex-wrap border-b border-(--color-border)/40 pb-1.5 bg-(--color-bg-secondary)/30">
                {attachedContexts.map((ctx) => (
                  <span
                    key={ctx.id}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-950/60 border border-purple-700/60 text-[10px] text-purple-200 font-mono"
                  >
                    <span className="truncate max-w-[140px]">{ctx.label || ctx.name}</span>
                    <button
                      type="button"
                      onClick={() => removeAttachedContext(ctx.id)}
                      className="hover:text-red-400 transition-colors ml-0.5 cursor-pointer"
                      title="Remove context"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}

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
                <span>Type @ for context</span>
                <span className="text-[#444444]">•</span>
                <span>⌥M toggles mode</span>
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
            <span className="truncate max-w-[160px] text-[#777777] flex items-center gap-1">
              <span>{activeEngine === "doris" ? "⚡ Doris" : "✨ Spark"}</span>
              <span className="text-[#444444]">•</span>
              <span className={agentMode === "ask" ? "text-blue-400 font-medium" : "text-purple-400 font-medium"}>
                {agentMode === "ask" ? "Ask Mode" : "Code Mode"}
              </span>
            </span>
            <span className="truncate max-w-[160px] font-mono text-[#777777]">{providerLabel}</span>
          </div>
        </form>
      </div>
    </div>
  );
}
