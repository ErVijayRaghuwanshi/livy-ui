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
} from "lucide-react";
import { useAi } from "../../context/AiContext";
import ModelSelector from "./ModelSelector";
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

export default function AiChatPanel() {
  const {
    messages,
    isStreaming,
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

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, streamingReasoning, activeTool]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!input.trim() || isStreaming) return;
    sendMessage(input);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    // Auto-adjust height
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  return (
    <div className="flex flex-col h-full bg-(--color-bg-primary) select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-(--color-border) bg-(--color-bg-secondary)">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-purple-400" />
          <span className="font-semibold text-xs text-white uppercase tracking-wider">
            AI Copilot
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={clearChat}
            title="Clear Chat History"
            className="p-1 rounded text-[#858585] hover:text-white hover:bg-(--color-bg-hover) transition-colors cursor-pointer"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Model & Connection Selector */}
      <ModelSelector />

      {/* Chat Messages Scroll Container */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 select-text">
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
          <div className="relative flex items-end bg-(--color-bg-primary) border border-(--color-border) rounded-md focus-within:border-purple-500 transition-colors">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={isStreaming}
              rows={1}
              placeholder={
                isOnline
                  ? "Ask AI to write SQL, open files, or run queries..."
                  : "Ollama is offline. Start Ollama to chat..."
              }
              className="flex-1 bg-transparent text-[#cccccc] text-xs px-3 py-2 pr-10 resize-none focus:outline-none placeholder-[#555555] max-h-32 min-h-[36px]"
            />

            <div className="absolute right-1.5 bottom-1.5 flex items-center">
              {isStreaming ? (
                <button
                  type="button"
                  onClick={stopGeneration}
                  title="Stop generation"
                  className="p-1 rounded bg-red-600 hover:bg-red-500 text-white transition-colors cursor-pointer"
                >
                  <Square size={13} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim() || !isOnline}
                  title="Send message (Enter)"
                  className="p-1.5 rounded bg-purple-600 hover:bg-purple-500 disabled:bg-[#333333] disabled:text-[#666666] text-white transition-colors cursor-pointer"
                >
                  <Send size={13} />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-[#666666] px-1">
            <span>Enter to send • Shift+Enter for newline</span>
            <span>Local Ollama</span>
          </div>
        </form>
      </div>
    </div>
  );
}
