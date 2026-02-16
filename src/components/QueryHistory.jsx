import { useState, useEffect } from "react";
import { X, History, Play, Clock, CheckCircle2, AlertCircle, Ban, Trash2, Search } from "lucide-react";

const HISTORY_KEY = "livy-query-history";
const MAX_HISTORY = 50;

function formatElapsed(ms) {
  if (ms == null) return "";
  if (ms < 1000) return `${Math.round(ms)}ms`;
  const secs = ms / 1000;
  if (secs < 60) return `${secs.toFixed(1)}s`;
  const mins = Math.floor(secs / 60);
  return `${mins}m ${(secs % 60).toFixed(0)}s`;
}

function formatTime(ts) {
  const d = new Date(ts);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  return isToday ? time : `${d.toLocaleDateString([], { month: "short", day: "numeric" })} ${time}`;
}

const statusConfig = {
  ok: { icon: CheckCircle2, color: "text-(--color-success)", label: "OK" },
  error: { icon: AlertCircle, color: "text-(--color-error)", label: "Error" },
  cancelled: { icon: Ban, color: "text-(--color-text-muted)", label: "Cancelled" },
};

export function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

export function addHistoryEntry(entry) {
  const history = getHistory();
  history.unshift({ ...entry, timestamp: Date.now() });
  if (history.length > MAX_HISTORY) history.length = MAX_HISTORY;
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function clearHistory() {
  localStorage.setItem(HISTORY_KEY, "[]");
}

export default function QueryHistory({ isOpen, onClose, onRerun }) {
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (isOpen) {
      setHistory(getHistory());
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = searchTerm
    ? history.filter((h) => h.sql.toLowerCase().includes(searchTerm.toLowerCase()))
    : history;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-(--color-bg-secondary) border border-(--color-border) rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col animate-in zoom-in-95 slide-in-from-bottom-4 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-(--color-border) shrink-0">
          <div className="flex items-center gap-2">
            <History size={16} className="text-(--color-accent)" />
            <h2 className="text-sm font-semibold text-(--color-text-primary)">Query History</h2>
            <span className="text-[10px] text-(--color-text-muted)">({history.length})</span>
          </div>
          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                onClick={() => {
                  clearHistory();
                  setHistory([]);
                }}
                className="flex items-center gap-1 px-2 py-1 text-[11px] text-(--color-text-muted) hover:text-(--color-error) hover:bg-(--color-bg-tertiary) rounded transition-colors"
                title="Clear history"
              >
                <Trash2 size={11} /> Clear
              </button>
            )}
            <button onClick={onClose} className="p-1 rounded hover:bg-(--color-bg-tertiary) transition-colors">
              <X size={16} className="text-(--color-text-secondary)" />
            </button>
          </div>
        </div>

        {/* Search */}
        {history.length > 0 && (
          <div className="px-5 py-2 border-b border-(--color-border) shrink-0">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-(--color-text-muted)" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search queries..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-(--color-bg-primary) text-(--color-text-primary) border border-(--color-border) rounded-lg focus:outline-none focus:border-(--color-accent) placeholder:text-(--color-text-muted)"
                autoFocus
              />
            </div>
          </div>
        )}

        {/* History list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-(--color-text-muted)">
              <History size={32} className="mb-2 opacity-30" />
              <span className="text-xs">{searchTerm ? "No matching queries" : "No query history yet"}</span>
            </div>
          ) : (
            filtered.map((entry, i) => {
              const config = statusConfig[entry.status] || statusConfig.ok;
              const Icon = config.icon;
              return (
                <div
                  key={i}
                  className="flex items-start gap-3 px-5 py-3 border-b border-(--color-border)/30 hover:bg-(--color-bg-tertiary)/30 transition-colors group"
                >
                  <Icon size={14} className={`shrink-0 mt-0.5 ${config.color}`} />
                  <div className="flex-1 min-w-0">
                    <pre className="text-xs font-mono text-(--color-text-primary) whitespace-pre-wrap break-all line-clamp-3">
                      {entry.sql}
                    </pre>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] text-(--color-text-muted)">{formatTime(entry.timestamp)}</span>
                      {entry.elapsed && (
                        <span className="flex items-center gap-0.5 text-[10px] text-(--color-text-muted)">
                          <Clock size={9} /> {formatElapsed(entry.elapsed)}
                        </span>
                      )}
                      {entry.fileName && (
                        <span className="text-[10px] text-(--color-text-muted)">{entry.fileName}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => onRerun(entry.sql)}
                    className="shrink-0 p-1.5 rounded opacity-0 group-hover:opacity-100 text-(--color-text-muted) hover:text-(--color-success) hover:bg-(--color-success)/10 transition-all"
                    title="Insert into editor"
                  >
                    <Play size={12} />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-2 border-t border-(--color-border) shrink-0">
          <p className="text-[10px] text-(--color-text-muted) text-center">
            Last {MAX_HISTORY} queries stored locally · Press <kbd className="px-1 py-0.5 text-[10px] font-mono bg-(--color-bg-primary) border border-(--color-border) rounded">Esc</kbd> to close
          </p>
        </div>
      </div>
    </div>
  );
}
