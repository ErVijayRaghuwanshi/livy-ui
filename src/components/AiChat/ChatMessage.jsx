import { useState, useMemo } from "react";
import {
  Play,
  FilePlus,
  ArrowDownToLine,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Brain,
  Wrench,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  User,
} from "lucide-react";
import { marked } from "marked";
import { useAi } from "../../context/AiContext";

export default function ChatMessage({ message }) {
  const { handleActionCard } = useAi();
  const [showReasoning, setShowReasoning] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const isUser = message.role === "user";

  // Parse markdown for non-user messages
  const parsedHtml = useMemo(() => {
    if (!message.content) return "";
    try {
      return marked.parse(message.content, { breaks: true, gfm: true });
    } catch {
      return message.content;
    }
  }, [message.content]);

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div
      className={`flex flex-col gap-2 p-3 rounded-lg text-xs leading-relaxed transition-colors ${
        isUser
          ? "bg-(--color-bg-secondary) border border-(--color-border) ml-4"
          : message.isError
          ? "bg-red-950/20 border border-red-800/40 text-red-200 mr-2"
          : "bg-(--color-bg-tertiary)/60 border border-(--color-border) mr-2"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between text-[11px] text-[#858585]">
        <div className="flex items-center gap-1.5 font-medium">
          {isUser ? (
            <>
              <User size={13} className="text-blue-400" />
              <span className="text-blue-300">You</span>
            </>
          ) : (
            <>
              <Sparkles size={13} className="text-purple-400" />
              <span className="text-purple-300 font-semibold">AI Copilot</span>
            </>
          )}
        </div>
        {message.timestamp && (
          <span className="text-[10px] text-[#666666]">
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>

      {/* Reasoning / Thinking Accordion (e.g. for Nemotron) */}
      {!isUser && message.reasoning && (
        <div className="mt-1 border border-purple-800/30 rounded bg-purple-950/20 overflow-hidden text-[11px]">
          <button
            onClick={() => setShowReasoning((prev) => !prev)}
            className="flex items-center justify-between w-full px-2 py-1.5 text-purple-300 hover:bg-purple-900/30 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-1.5 font-mono text-[10px]">
              <Brain size={12} className="text-purple-400 animate-pulse" />
              <span>Thought Process</span>
            </div>
            {showReasoning ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>
          {showReasoning && (
            <div className="p-2 pt-1 border-t border-purple-800/20 text-[#aaaaaa] font-mono whitespace-pre-wrap max-h-48 overflow-y-auto select-text text-[10px]">
              {message.reasoning}
            </div>
          )}
        </div>
      )}

      {/* Tool Execution Badges */}
      {!isUser && Array.isArray(message.toolResults) && message.toolResults.length > 0 && (
        <div className="flex flex-col gap-1.5 my-1">
          {message.toolResults.map((tr, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between px-2 py-1 rounded bg-(--color-bg-secondary) border border-(--color-border) text-[11px] text-[#cccccc]"
            >
              <div className="flex items-center gap-1.5">
                <Wrench size={11} className="text-purple-400" />
                <span className="font-mono text-purple-300">{tr.name}</span>
                {tr.args?.fileName && (
                  <span className="text-[#888888]">({tr.args.fileName})</span>
                )}
              </div>
              <div className="flex items-center gap-1 text-[10px]">
                {tr.result?.ok ? (
                  <>
                    <CheckCircle2 size={11} className="text-emerald-400" />
                    <span className="text-emerald-400">Success</span>
                  </>
                ) : (
                  <>
                    <XCircle size={11} className="text-red-400" />
                    <span className="text-red-400">Failed</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Message Content Body */}
      {isUser ? (
        <div className="text-white whitespace-pre-wrap break-words">{message.content}</div>
      ) : (
        <div
          className="prose prose-invert max-w-none text-[#cccccc] break-words text-xs [&>p]:mb-2 [&>p:last-child]:mb-0 [&>ul]:pl-4 [&>ol]:pl-4 [&>pre]:bg-(--color-bg-secondary) [&>pre]:p-2 [&>pre]:rounded [&>pre]:border [&>pre]:border-(--color-border) [&>pre]:overflow-x-auto [&>code]:bg-[#2d2d2d] [&>code]:px-1 [&>code]:py-0.5 [&>code]:rounded [&>code]:text-purple-300"
          dangerouslySetInnerHTML={{ __html: parsedHtml }}
        />
      )}

      {/* Action Cards on Extracted SQL Code Blocks */}
      {!isUser && Array.isArray(message.actionCards) && message.actionCards.length > 0 && (
        <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-(--color-border)">
          <div className="text-[10px] font-semibold text-[#858585] uppercase tracking-wider">
            Query Actions:
          </div>
          {message.actionCards.map((sql, idx) => (
            <div
              key={idx}
              className="flex flex-col gap-1.5 p-2 rounded bg-(--color-bg-secondary) border border-purple-900/40"
            >
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-mono text-purple-300 truncate max-w-[180px]">
                  {sql.split("\n")[0].slice(0, 30)}...
                </span>
                <button
                  onClick={() => handleCopy(sql, idx)}
                  className="flex items-center gap-1 text-[10px] text-[#888888] hover:text-white transition-colors cursor-pointer"
                  title="Copy SQL to clipboard"
                >
                  {copiedIndex === idx ? (
                    <>
                      <Check size={11} className="text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={11} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                <button
                  onClick={() => handleActionCard("run", sql)}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-[11px] transition-colors cursor-pointer shadow-sm"
                  title="Execute query immediately on active engine"
                >
                  <Play size={11} />
                  <span>Run Query</span>
                </button>

                <button
                  onClick={() => handleActionCard("new_tab", sql)}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-(--color-bg-hover) hover:bg-[#3d3d3d] text-[#cccccc] hover:text-white border border-(--color-border) text-[11px] transition-colors cursor-pointer"
                  title="Open this SQL in a new editor tab"
                >
                  <FilePlus size={11} />
                  <span>Open in Tab</span>
                </button>

                <button
                  onClick={() => handleActionCard("insert", sql)}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-(--color-bg-hover) hover:bg-[#3d3d3d] text-[#cccccc] hover:text-white border border-(--color-border) text-[11px] transition-colors cursor-pointer"
                  title="Insert SQL into active editor at cursor"
                >
                  <ArrowDownToLine size={11} />
                  <span>Insert</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
