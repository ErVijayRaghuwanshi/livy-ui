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
  PanelRightClose,
  Sliders,
  AlertCircle,
  MessageSquare,
  Zap,
  AtSign,
  X,
  ChevronDown,
  Check,
  Plus,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useAi } from "../../context/AiContext";
import ChatMessage from "./ChatMessage";
import ContextPicker from "./ContextPicker";

export default function AiChatPanel({ onClose, onOpenSettings }) {
  const {
    provider,
    providerLabel,
    activeModel,
    activeModelLabel,
    setActiveModel,
    availableModels,
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
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const textareaRef = useRef(null);
  const modelDropdownRef = useRef(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  // Close model dropdown on click outside
  useEffect(() => {
    if (!isModelDropdownOpen) return;
    const handleClickOutside = (e) => {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(e.target)) {
        setIsModelDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isModelDropdownOpen]);

  // Focus textarea on panel open
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = "38px";
    }
  }, []);

  // Detect user scroll position to show floating scroll-to-bottom button
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    setShowScrollBottom(scrollHeight - scrollTop - clientHeight > 100);
  };

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
      textareaRef.current.style.height = "38px";
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
    e.target.style.height = `${Math.min(Math.max(e.target.scrollHeight, 38), 120)}px`;

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
    ? "Ask anything (read-only)... ⌥M toggles mode"
    : "Describe SQL or edits to perform... ⌥M toggles mode";

  return (
    <div className="flex flex-col h-full bg-(--color-bg-primary) select-none">
      {/* Top Header: Ultra-compact single line (~36px) */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-(--color-border) bg-(--color-bg-secondary) shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles size={14} className="text-purple-400 shrink-0" />
          <span className="font-medium text-xs text-[#e0e0e0] shrink-0">
            Chat
          </span>

          {/* Model Status Pill & Quick Switcher Dropdown */}
          <div className="relative" ref={modelDropdownRef}>
            <button
              type="button"
              onClick={() => setIsModelDropdownOpen((prev) => !prev)}
              title={`Active Model: ${activeModelLabel} (${providerLabel})\nClick to change model or configure in Settings`}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-(--color-bg-primary) border border-(--color-border) hover:border-purple-500/50 text-[10px] text-[#aaaaaa] hover:text-white cursor-pointer transition-colors max-w-[190px]"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  isOnline
                    ? "bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.8)]"
                    : "bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.8)]"
                }`}
              />
              <span className="truncate font-mono">{activeModelLabel}</span>
              <ChevronDown size={10} className="shrink-0 text-[#777777] ml-0.5" />
            </button>

            {/* Quick Model Selector Popover */}
            {isModelDropdownOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-64 rounded-lg bg-[#181818] border border-(--color-border) shadow-2xl z-50 overflow-hidden flex flex-col py-1 animate-fadeIn">
                <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-(--color-border)/60 text-[10px] text-[#888888]">
                  <span className="font-semibold uppercase tracking-wider">{providerLabel}</span>
                  {onOpenSettings && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsModelDropdownOpen(false);
                        onOpenSettings();
                      }}
                      className="text-purple-400 hover:text-purple-300 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Sliders size={10} />
                      <span>Settings</span>
                    </button>
                  )}
                </div>

                <div className="max-h-56 overflow-y-auto py-1">
                  {availableModels && availableModels.length > 0 ? (
                    availableModels.map((m) => {
                      const modelId = m.model || m.id || m.name;
                      const isSelected = modelId === activeModel || m.name === activeModel;
                      return (
                        <button
                          key={modelId}
                          type="button"
                          onClick={() => {
                            setActiveModel(modelId);
                            setIsModelDropdownOpen(false);
                          }}
                          className={`flex items-center justify-between w-full px-2.5 py-1.5 text-left text-xs transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-purple-950/60 text-purple-200 font-medium"
                              : "text-[#cccccc] hover:bg-(--color-bg-hover) hover:text-white"
                          }`}
                        >
                          <span className="truncate font-mono text-[11px]">
                            {m.displayName || m.name || modelId}
                          </span>
                          {isSelected && <Check size={12} className="text-purple-400 shrink-0 ml-1.5" />}
                        </button>
                      );
                    })
                  ) : (
                    <div className="px-3 py-2 text-[11px] text-[#777777] text-center">
                      No models available
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
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
              title="Close Chat Panel (⌘⇧A)"
              className="p-1 rounded text-[#858585] hover:text-white hover:bg-(--color-bg-hover) transition-colors cursor-pointer ml-0.5"
            >
              <PanelRightClose size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Chat Messages Scroll Container */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 select-text relative"
      >
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
              <span className="text-purple-300 font-medium">Thinking...</span>
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

        {/* Floating Scroll-to-Bottom Button (VS Code style) */}
        {showScrollBottom && (
          <button
            type="button"
            onClick={scrollToBottom}
            className="sticky bottom-2 ml-auto mr-2 w-7 h-7 rounded-full bg-[#252525] border border-[#3e3e3e] shadow-xl flex items-center justify-center text-[#aaaaaa] hover:text-white transition-all cursor-pointer z-30 hover:bg-[#333333] animate-fadeIn"
            title="Scroll to bottom"
          >
            <ArrowDown size={13} />
          </button>
        )}
      </div>

      {/* Input Form with Compact Mode & Context Controls */}
      <div className="p-2 border-t border-(--color-border) bg-(--color-bg-secondary) flex flex-col gap-1.5 relative">
        {/* Floating Context Picker Popover */}
        {isContextPickerOpen && (
          <div className="absolute bottom-full left-2 right-2 mb-1.5 z-50">
            <ContextPicker
              onSelect={handleSelectContext}
              onClose={() => setIsContextPickerOpen(false)}
              searchFilter={contextSearchQuery}
            />
          </div>
        )}

        {/* Subtle Ask Mode Action Nudge Banner (only when user asks to edit in Ask Mode) */}
        {agentMode === "ask" &&
          /\b(write|create|save|edit|modify|update|replace|overwrite|insert)\b.*\b(file|sql|script|tab|editor)\b/i.test(
            input
          ) && (
            <div className="flex items-center justify-between px-2 py-1 bg-purple-950/40 border border-purple-700/40 rounded text-[10px] text-purple-200 animate-fadeIn">
              <span className="flex items-center gap-1.5 truncate">
                <Zap size={11} className="text-purple-400 shrink-0" />
                <span>Editing files requires <strong>Code Mode</strong></span>
              </span>
              <button
                type="button"
                onClick={() => setAgentMode("action")}
                className="px-1.5 py-0.5 rounded bg-purple-600 hover:bg-purple-500 text-white font-medium text-[9px] shrink-0 cursor-pointer transition-colors shadow-xs"
              >
                Switch
              </button>
            </div>
          )}

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="flex flex-col bg-(--color-bg-primary) border border-(--color-border) rounded-xl focus-within:border-purple-500/80 focus-within:ring-1 focus-within:ring-purple-500/30 transition-all shadow-sm overflow-hidden">
            {/* Attached Context Pills (VS Code style) */}
            {attachedContexts.length > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 pt-2 pb-1.5 flex-wrap border-b border-(--color-border)/30 bg-(--color-bg-secondary)/20">
                <button
                  type="button"
                  onClick={() => setIsContextPickerOpen(true)}
                  className="flex items-center justify-center w-5 h-5 rounded hover:bg-(--color-bg-hover) text-[#888888] hover:text-white transition-colors cursor-pointer"
                  title="Add context (@)"
                >
                  <Plus size={12} />
                </button>
                {attachedContexts.map((ctx) => (
                  <span
                    key={ctx.id}
                    className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#1e1e1e] border border-[#383838] text-[10px] text-[#cccccc] font-mono shadow-xs"
                  >
                    <span className="text-purple-400">≡</span>
                    <span className="truncate max-w-[130px]">{ctx.label || ctx.name}</span>
                    <button
                      type="button"
                      onClick={() => removeAttachedContext(ctx.id)}
                      className="hover:text-red-400 transition-colors ml-0.5 cursor-pointer text-[#888888]"
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
              rows={1}
              placeholder="Chat with Copilot..."
              className="w-full bg-transparent text-[#e0e0e0] text-xs px-3 pt-2 pb-1 resize-none focus:outline-none placeholder-[#666666] min-h-[38px] max-h-32 leading-relaxed"
            />

            {/* Compact Bottom Toolbar inside Input Container */}
            <div className="flex items-center justify-between px-2.5 pb-2 pt-0.5 select-none">
              <div className="flex items-center gap-1.5">
                {/* Add Context Button (+) */}
                <button
                  type="button"
                  onClick={() => setIsContextPickerOpen((prev) => !prev)}
                  className="flex items-center justify-center w-6 h-6 rounded-md hover:bg-(--color-bg-secondary) text-[#888888] hover:text-white transition-colors cursor-pointer border border-transparent hover:border-(--color-border)"
                  title="Add context (@): Pin SQL files, tables, editor selection, or query results"
                >
                  <Plus size={14} />
                </button>

                {/* Compact Mode Pill (Ask vs Code) */}
                <div className="flex items-center rounded-lg bg-(--color-bg-secondary) border border-(--color-border) p-0.5">
                  <button
                    type="button"
                    onClick={() => setAgentMode("ask")}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium transition-all cursor-pointer ${
                      agentMode === "ask"
                        ? "bg-blue-600/30 text-blue-200 border border-blue-500/40 shadow-xs"
                        : "text-[#777777] hover:text-[#cccccc]"
                    }`}
                    title="Ask Mode: Q&A, explain queries, explore schemas (⌥M)"
                  >
                    <MessageSquare size={10} className={agentMode === "ask" ? "text-blue-400" : ""} />
                    <span>Ask</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAgentMode("action")}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium transition-all cursor-pointer ${
                      agentMode === "action"
                        ? "bg-purple-600/30 text-purple-200 border border-purple-500/40 shadow-xs"
                        : "text-[#777777] hover:text-[#cccccc]"
                    }`}
                    title="Code Mode: Writes & edits files with Staged Diff Review (⌥M)"
                  >
                    <Zap size={10} className={agentMode === "action" ? "text-purple-400" : ""} />
                    <span>Code</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {isStreaming ? (
                  <button
                    type="button"
                    onClick={stopGeneration}
                    title="Stop generation (Esc)"
                    className="flex items-center justify-center w-6 h-6 rounded-md bg-red-600 hover:bg-red-500 text-white transition-colors cursor-pointer shadow-xs"
                  >
                    <Square size={10} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!input.trim() || !isOnline}
                    title="Send message (Enter)"
                    className={`flex items-center justify-center w-6 h-6 rounded-md transition-all cursor-pointer shadow-xs ${
                      input.trim() && isOnline
                        ? "bg-purple-600 hover:bg-purple-500 text-white shadow-purple-900/30"
                        : "bg-transparent text-[#555555] cursor-not-allowed"
                    }`}
                  >
                    <ArrowUp size={13} strokeWidth={2.5} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
