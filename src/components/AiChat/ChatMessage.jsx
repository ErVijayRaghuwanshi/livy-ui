import { useState, useMemo } from "react";
import {
  Play,
  FilePlus,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Brain,
  Wrench,
  CheckCircle2,
  XCircle,
  Sparkles,
  User,
  Database,
  Code2,
  Cpu,
  RefreshCw,
  FileSearch,
  FileText,
  AlertTriangle,
  X,
  Table,
} from "lucide-react";
import { marked } from "marked";
import { useAi } from "../../context/AiContext";
import { useSqlFiles } from "../../context/SqlFilesContext";
import { highlightCode, escapeHtml } from "../../utils/syntaxHighlighter";

/**
 * Configure marked with custom code block renderer that adds:
 * - Language tag header
 * - 1-click ▶ Run Query icon button (for SQL code blocks)
 * - 1-click Copy icon button with encoded data-code attribute
 * - Rich syntax highlighting (SQL, JSON) matching VS Code Copilot theme
 */
const customRenderer = {
  code({ text, lang }) {
    const cleanLang = (lang || "").match(/^\S*/)?.[0] || "";
    const isSql =
      !cleanLang ||
      ["sql", "sparksql", "dorisql", "mysql", "hql", "hive", "pgsql", "postgres", "tsql"].includes(cleanLang.toLowerCase()) ||
      /^\s*(SELECT|WITH|SHOW|DESCRIBE|EXPLAIN|CREATE|DROP|ALTER|INSERT)\b/i.test(text.trim());

    const highlightedCode = highlightCode(text, cleanLang || (isSql ? "sql" : ""));
    const encodedCode = encodeURIComponent(text);

    return `<div class="code-block-wrapper my-2 rounded border border-(--color-border) overflow-hidden bg-(--color-bg-secondary)">
  <div class="flex items-center justify-between px-2.5 py-1 bg-[#1c1c1c] border-b border-(--color-border) text-[10px] text-[#888888] font-mono">
    <span class="uppercase font-semibold tracking-wider text-purple-300/80">${cleanLang || (isSql ? "sql" : "code")}</span>
    <div class="flex items-center gap-1">
      ${
        isSql
          ? `<button type="button" class="run-code-btn flex items-center justify-center w-5 h-5 rounded hover:bg-emerald-600/30 text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer" data-code="${encodedCode}" title="Run Query">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
      </button>`
          : ""
      }
      <button type="button" class="copy-code-btn flex items-center justify-center w-5 h-5 rounded hover:bg-(--color-bg-hover) text-[#888888] hover:text-white transition-colors cursor-pointer" data-code="${encodedCode}" title="Copy Code">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>
      </button>
    </div>
  </div>
  <pre class="p-2.5 overflow-x-auto text-[11px] font-mono leading-relaxed m-0! bg-transparent!"><code class="language-${cleanLang || (isSql ? "sql" : "code")}">${highlightedCode}</code></pre>
</div>`;
  },
};

// Apply custom renderer once
marked.use({ renderer: customRenderer });

/**
 * Subagent Tool Badge with collapsible distilled summary
 */
function ToolResultItem({ tr }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { acceptDiff, rejectDiff, hasPendingDiff, getDiffResolution } = useSqlFiles();

  const rawName = (tr.name || "").toLowerCase();
  const subagentType =
    tr.result?.subagent ||
    tr.args?.subagent ||
    (rawName.includes("schema")
      ? "schema_analyst"
      : rawName.includes("sql")
      ? "sql_specialist"
      : rawName.includes("cluster")
      ? "cluster_operator"
      : rawName.includes("subagent")
      ? "subagent"
      : "");

  const isSubAgent = Boolean(subagentType);
  const isDiffReview = tr.name === "write_sql_file" && Boolean(tr.result?.hasPendingDiff);
  const fileId = tr.result?.fileId;
  const isPending = fileId && typeof hasPendingDiff === "function" ? hasPendingDiff(fileId) : false;
  const diffResolution = fileId && typeof getDiffResolution === "function" ? getDiffResolution(fileId) : null;

  let Icon = Wrench;
  let label = tr.name;
  let themeClass = "text-[#cccccc] border-(--color-border) bg-(--color-bg-secondary)";

  if (isDiffReview) {
    Icon = FilePlus;
    label = "Diff Review: " + (tr.result?.fileName || "File");
    if (isPending) {
      themeClass = "text-purple-300 border-purple-700/60 bg-purple-950/30";
    } else if (diffResolution === "discarded") {
      themeClass = "text-[#888888] border-red-900/30 bg-red-950/15";
    } else {
      themeClass = "text-emerald-300 border-emerald-800/40 bg-emerald-950/20";
    }
  } else if (subagentType === "schema_analyst") {
    Icon = Database;
    label = "Schema Analyst";
    themeClass = "text-cyan-300 border-cyan-800/40 bg-cyan-950/20";
  } else if (subagentType === "sql_specialist") {
    Icon = Code2;
    label = "SQL Specialist";
    themeClass = "text-purple-300 border-purple-800/40 bg-purple-950/20";
  } else if (subagentType === "cluster_operator") {
    Icon = Cpu;
    label = "Cluster Operator";
    themeClass = "text-amber-300 border-amber-800/40 bg-amber-950/20";
  } else if (isSubAgent) {
    Icon = Brain;
    label = "Sub-Agent";
    themeClass = "text-blue-300 border-blue-800/40 bg-blue-950/20";
  } else if (tr.name === "run_query") {
    Icon = Play;
    label = "Run Query & Show Result";
    themeClass = "text-emerald-300 border-emerald-800/40 bg-emerald-950/20";
  } else if (tr.name === "write_sql_file") {
    Icon = FilePlus;
    label = "Open SQL Tab";
  } else if (tr.name === "read_active_file") {
    Icon = FileSearch;
    label = "Read Active Tab";
  } else if (tr.name === "open_new_tab" || tr.name === "open_file") {
    Icon = FilePlus;
    label = "Open Editor Tab";
  } else if (tr.name === "write_active_editor") {
    Icon = FileText;
    label = "Write to Editor";
  }

  const hunks = tr.result?.hunks || [];
  const hasDetails = Boolean(tr.result?.summary || tr.result?.error || (hunks && hunks.length > 0));
  const isSuccess = tr.result?.ok !== false;

  return (
    <div className={`flex flex-col rounded border text-[11px] overflow-hidden ${themeClass}`}>
      <div className="flex items-center justify-between px-2.5 py-1.5 gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <Icon size={12} className="shrink-0" />
          <span className="font-semibold font-mono text-[10px] truncate">{label}</span>
          {isDiffReview ? (
            <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-purple-900/60 border border-purple-700/50 text-purple-200">
              <span className="text-emerald-400">+{tr.result.addedLines ?? 0}</span>
              <span className="text-[#777777] mx-0.5">/</span>
              <span className="text-red-400">-{tr.result.removedLines ?? 0}</span>
            </span>
          ) : (
            <>
              {tr.args?.task && (
                <span className="text-[#888888] truncate text-[10px] hidden sm:inline max-w-[180px]">
                  - {tr.args.task}
                </span>
              )}
              {tr.args?.fileName && (
                <span className="text-[#888888] truncate text-[10px]">
                  ({tr.args.fileName})
                </span>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0 text-[10px]">
          {isDiffReview && isPending ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => acceptDiff(fileId)}
                className="flex items-center gap-0.5 px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-[10px] transition-colors cursor-pointer shadow-xs"
                title="Accept proposed changes"
              >
                <Check size={10} />
                <span>Accept</span>
              </button>
              <button
                type="button"
                onClick={() => rejectDiff(fileId)}
                className="flex items-center gap-0.5 px-2 py-0.5 rounded bg-red-950/60 hover:bg-red-900/80 border border-red-700/60 text-red-200 hover:text-white text-[10px] transition-colors cursor-pointer"
                title="Discard proposed changes"
              >
                <X size={10} />
                <span>Discard</span>
              </button>
            </div>
          ) : isDiffReview && diffResolution === "discarded" ? (
            <span className="flex items-center gap-0.5 text-red-400 font-medium">
              <XCircle size={11} />
              <span>Discarded</span>
            </span>
          ) : isDiffReview && diffResolution === "accepted" ? (
            <span className="flex items-center gap-0.5 text-emerald-400 font-medium">
              <CheckCircle2 size={11} />
              <span>Accepted</span>
            </span>
          ) : isSuccess ? (
            <span className="flex items-center gap-0.5 text-emerald-400">
              <CheckCircle2 size={11} />
              <span>{isDiffReview ? "Accepted" : "Done"}</span>
            </span>
          ) : (
            <span className="flex items-center gap-0.5 text-red-400">
              <XCircle size={11} />
              <span>Failed</span>
            </span>
          )}

          {hasDetails && (
            <button
              onClick={() => setIsExpanded((prev) => !prev)}
              className="flex items-center gap-0.5 px-1.5 py-0.5 rounded hover:bg-(--color-bg-hover) text-[#888888] hover:text-white transition-colors cursor-pointer font-sans"
              title={isExpanded ? "Collapse details" : "Expand details / diff"}
            >
              <span>{isExpanded ? "Hide" : isDiffReview ? "Diff" : "Details"}</span>
              {isExpanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
            </button>
          )}
        </div>
      </div>

      {/* Accordion Body with Subagent Summary or Diff Hunks or Input/Output */}
      {isExpanded && hasDetails && (
        <div className="px-2.5 py-2 border-t border-(--color-border) bg-(--color-bg-primary)/70 text-[#bbbbbb] font-mono text-[10px] whitespace-pre-wrap max-h-56 overflow-y-auto select-text leading-relaxed flex flex-col gap-2">
          {hunks && hunks.length > 0 ? (
            <div className="flex flex-col font-mono text-[10px] divide-y divide-(--color-border)/20">
              {hunks.map((h, i) => (
                <div
                  key={i}
                  className={`px-1 py-0.5 ${
                    h.type === "added"
                      ? "bg-emerald-950/40 text-emerald-300"
                      : h.type === "removed"
                      ? "bg-red-950/40 text-red-300"
                      : "text-[#888888]"
                  }`}
                >
                  <span className="inline-block w-4 opacity-60">
                    {h.type === "added" ? "+" : h.type === "removed" ? "-" : " "}
                  </span>
                  <span>{h.text}</span>
                </div>
              ))}
            </div>
          ) : (
            <>
              {tr.args && Object.keys(tr.args).length > 0 && (
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] uppercase font-bold text-[#777777] tracking-wider">Input</span>
                  <pre className="p-1.5 rounded bg-[#161616] border border-(--color-border)/40 text-[#888888] overflow-x-auto m-0! font-mono text-[10px]">
                    {JSON.stringify(tr.args, null, 2)}
                  </pre>
                </div>
              )}
              {(tr.result?.summary || tr.result?.error || tr.result?.output) && (
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] uppercase font-bold text-[#777777] tracking-wider">Output</span>
                  <div className="p-1.5 rounded bg-[#161616] border border-(--color-border)/40 text-[#cccccc] font-mono text-[10px]">
                    {tr.result?.summary || tr.result?.error || tr.result?.output}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function ChatMessage({ message }) {
  const { handleActionCard, retryLastMessage } = useAi();
  const { files, openFile } = useSqlFiles();
  const [showReasoning, setShowReasoning] = useState(false);
  const [copiedFull, setCopiedFull] = useState(false);

  const isUser = message.role === "user";

  const handleBadgeClick = (badge) => {
    if (!badge) return;
    if (badge.type === "file") {
      const rawId = badge.id?.startsWith("file_") ? badge.id.slice(5) : badge.id;
      const target = (files || []).find((f) => f.id === rawId || f.name === badge.label);
      if (target) {
        openFile(target.id);
      }
    }
  };

  const getBadgeIcon = (type) => {
    switch (type) {
      case "file":
        return <FileText size={10} className="text-blue-400 shrink-0" />;
      case "table":
        return <Table size={10} className="text-cyan-400 shrink-0" />;
      case "editor":
        return <Code2 size={10} className="text-purple-400 shrink-0" />;
      case "result":
        return <CheckCircle2 size={10} className="text-emerald-400 shrink-0" />;
      case "cluster":
        return <Cpu size={10} className="text-amber-400 shrink-0" />;
      default:
        return null;
    }
  };

  // Parse markdown for non-user messages
  const parsedHtml = useMemo(() => {
    if (!message.content) return "";
    try {
      return marked.parse(message.content, { breaks: true, gfm: true });
    } catch {
      return escapeHtml(message.content);
    }
  }, [message.content]);

  // Copy full message content
  const handleCopyFull = () => {
    if (!message.content) return;
    navigator.clipboard.writeText(message.content);
    setCopiedFull(true);
    setTimeout(() => setCopiedFull(false), 2000);
  };

  // Event delegation to catch "Run Query" and "Copy" button clicks inside rendered markdown code blocks
  const handleContainerClick = (e) => {
    const runBtn = e.target.closest(".run-code-btn");
    if (runBtn) {
      e.preventDefault();
      e.stopPropagation();
      const encoded = runBtn.getAttribute("data-code");
      if (encoded) {
        const sql = decodeURIComponent(encoded);
        handleActionCard("run", sql);
        const originalHtml = runBtn.innerHTML;
        runBtn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
        setTimeout(() => {
          runBtn.innerHTML = originalHtml;
        }, 1500);
      }
      return;
    }

    const btn = e.target.closest(".copy-code-btn");
    if (btn) {
      e.preventDefault();
      e.stopPropagation();
      const encoded = btn.getAttribute("data-code");
      if (encoded) {
        const code = decodeURIComponent(encoded);
        navigator.clipboard.writeText(code);
        const originalHtml = btn.innerHTML;
        btn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
        setTimeout(() => {
          btn.innerHTML = originalHtml;
        }, 2000);
      }
    }
  };

  // Render User Message (VS Code Copilot style: right-aligned bubble with context anchored above)
  if (isUser) {
    return (
      <div className="flex flex-col items-end gap-1 max-w-full my-1 animate-fadeIn select-text">
        {/* Pinned Context Badges directly above the user bubble */}
        {Array.isArray(message.contextBadges) && message.contextBadges.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap justify-end mb-0.5">
            {message.contextBadges.map((badge, idx) => {
              const isClickable = badge.type === "file";
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleBadgeClick(badge)}
                  disabled={!isClickable}
                  className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#1c1c1c] border border-[#383838] text-[10px] text-[#aaaaaa] font-mono transition-colors ${
                    isClickable
                      ? "hover:border-purple-500/70 hover:text-white cursor-pointer"
                      : "cursor-default"
                  }`}
                  title={isClickable ? `Click to open ${badge.label} in editor tab` : badge.label}
                >
                  <span className="text-purple-400">≡</span>
                  <span className="truncate max-w-[150px]">{badge.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* User Message Bubble on Right */}
        <div className="group relative flex items-center gap-1.5 max-w-[85%]">
          {/* Subtle Hover Action: Copy */}
          <button
            onClick={handleCopyFull}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-[#858585] hover:text-white rounded hover:bg-(--color-bg-hover) cursor-pointer shrink-0"
            title="Copy message"
          >
            {copiedFull ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
          </button>

          <div className="rounded-2xl bg-[#2b2d30] border border-[#3e4044] px-3.5 py-2 text-white text-xs leading-relaxed shadow-xs break-words whitespace-pre-wrap">
            {message.content}
          </div>
        </div>

        {/* Subtle timestamp */}
        {message.timestamp && (
          <span className="text-[9px] text-[#555555] pr-1">
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>
    );
  }

  // Render Assistant Message
  return (
    <div
      onClick={handleContainerClick}
      className={`flex flex-col gap-2 p-3 rounded-xl text-xs leading-relaxed transition-colors mr-1 my-1 ${
        message.isError
          ? "bg-red-950/20 border border-red-800/40 text-red-200"
          : "bg-(--color-bg-secondary)/60 border border-(--color-border)"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between text-[11px] text-[#858585]">
        <div className="flex items-center gap-1.5 font-medium">
          <Sparkles size={13} className="text-purple-400" />
          <span className="text-purple-300 font-semibold">AI Copilot</span>
        </div>

        <div className="flex items-center gap-2">
          {message.timestamp && (
            <span className="text-[10px] text-[#666666]">
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}

          {/* Universal Copy Message Button */}
          {message.content && (
            <button
              onClick={handleCopyFull}
              className="flex items-center gap-1 text-[10px] text-[#858585] hover:text-white transition-colors cursor-pointer px-1 py-0.5 rounded hover:bg-(--color-bg-hover)"
              title="Copy entire response"
            >
              {copiedFull ? (
                <>
                  <Check size={11} className="text-emerald-400" />
                  <span className="text-emerald-400 font-sans">Copied</span>
                </>
              ) : (
                <>
                  <Copy size={11} />
                  <span className="font-sans">Copy</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Reasoning / Thinking Accordion */}
      {message.reasoning && (
        <div className="border border-purple-800/30 rounded-lg bg-purple-950/20 overflow-hidden text-[11px]">
          <button
            onClick={() => setShowReasoning((prev) => !prev)}
            className="flex items-center justify-between w-full px-2.5 py-1.5 text-purple-300 hover:bg-purple-900/30 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-1.5 font-mono text-[10px]">
              <Brain size={12} className="text-purple-400 animate-pulse" />
              <span>Thought Process</span>
            </div>
            {showReasoning ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>
          {showReasoning && (
            <div className="p-2.5 pt-1 border-t border-purple-800/20 text-[#aaaaaa] font-mono whitespace-pre-wrap max-h-48 overflow-y-auto select-text text-[10px]">
              {message.reasoning}
            </div>
          )}
        </div>
      )}

      {/* Subagent & Tool Execution Badges (VS Code style step indicator) */}
      {Array.isArray(message.toolResults) && message.toolResults.length > 0 && (
        <div className="flex flex-col gap-1.5 my-1">
          <div className="text-[10px] text-[#777777] font-medium flex items-center gap-1.5 px-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400/80" />
            <span>Completed {message.toolResults.length} {message.toolResults.length === 1 ? "step" : "steps"}</span>
          </div>
          {message.toolResults.map((tr, idx) => (
            <ToolResultItem key={idx} tr={tr} />
          ))}
        </div>
      )}

      {/* Message Content Body */}
      <div
        className="prose prose-invert max-w-none text-[#cccccc] break-words text-xs [&>p]:mb-2 [&>p:last-child]:mb-0 [&>ul]:pl-4 [&>ol]:pl-4"
        dangerouslySetInnerHTML={{ __html: parsedHtml }}
      />

      {/* 1-Click Retry on Error Messages */}
      {message.isError && (
        <div className="flex items-center gap-2 mt-2 pt-1 border-t border-red-800/30">
          <button
            onClick={() => retryLastMessage(message.id)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-900/40 hover:bg-red-800/60 border border-red-700/50 text-red-200 text-[11px] font-medium transition-colors cursor-pointer shadow-sm"
            title="Retry sending the previous prompt"
          >
            <RefreshCw size={11} />
            <span>Retry Message</span>
          </button>
        </div>
      )}
    </div>
  );
}
