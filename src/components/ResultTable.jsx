import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { AlertCircle, Loader2, Table, CheckCircle2, Ban, Clock, FileText, Copy, Check, Download, Search, X, FilterX } from "lucide-react";

function formatElapsed(ms) {
  if (ms == null) return null;
  if (ms < 1000) return `${Math.round(ms)}ms`;
  const secs = ms / 1000;
  if (secs < 60) return `${secs.toFixed(2)}s`;
  const mins = Math.floor(secs / 60);
  const remSecs = (secs % 60).toFixed(1);
  return `${mins}m ${remSecs}s`;
}

function ElapsedBadge({ elapsed }) {
  const text = formatElapsed(elapsed);
  if (!text) return null;
  return (
    <span className="inline-flex items-center gap-1 text-[10px] text-(--color-text-muted) ml-2">
      <Clock size={10} />
      {text}
    </span>
  );
}

function LiveTimer({ startTime }) {
  const [now, setNow] = useState(performance.now());
  const rafRef = useRef(null);

  useEffect(() => {
    const tick = () => {
      setNow(performance.now());
      rafRef.current = setTimeout(tick, 100);
    };
    rafRef.current = setTimeout(tick, 100);
    return () => clearTimeout(rafRef.current);
  }, []);

  const elapsed = now - startTime;
  return (
    <span className="inline-flex items-center gap-1 text-xs text-(--color-warning) font-mono ml-2">
      <Clock size={12} />
      {formatElapsed(elapsed)}
    </span>
  );
}

function CopyButton({ getText, className = "" }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = typeof getText === "function" ? getText() : getText;
    if (!text) return;
    const onSuccess = () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(onSuccess);
    } else {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      onSuccess();
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] hover:bg-(--color-bg-tertiary) text-(--color-text-muted) hover:text-(--color-text-primary) transition-colors cursor-pointer ${className}`}
      title="Copy to clipboard"
    >
      {copied ? <Check size={12} className="text-(--color-success)" /> : <Copy size={12} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function DownloadButtons({ getCsv, getJson, className = "" }) {
  return (
    <span className={`flex items-center gap-1 ${className}`}>
      {getCsv && (
        <button
          onClick={() => downloadFile(getCsv(), `result_${Date.now()}.csv`, "text/csv")}
          className="flex items-center gap-1 px-2 py-1 rounded text-[11px] hover:bg-(--color-bg-tertiary) text-(--color-text-muted) hover:text-(--color-text-primary) transition-colors cursor-pointer"
          title="Download CSV"
        >
          <Download size={12} /> CSV
        </button>
      )}
      {getJson && (
        <button
          onClick={() => downloadFile(getJson(), `result_${Date.now()}.json`, "application/json")}
          className="flex items-center gap-1 px-2 py-1 rounded text-[11px] hover:bg-(--color-bg-tertiary) text-(--color-text-muted) hover:text-(--color-text-primary) transition-colors cursor-pointer"
          title="Download JSON"
        >
          <Download size={12} /> JSON
        </button>
      )}
    </span>
  );
}

export default function ResultTable({ result }) {
  if (!result) {
    return (
      <div className="flex items-center justify-center h-full text-(--color-text-muted) text-sm">
        <Table size={16} className="mr-2" />
        Run a query to see results
      </div>
    );
  }

  // Running state
  if (result.status === "running") {
    return (
      <div className="flex items-center justify-center h-full text-(--color-warning) text-sm">
        <Loader2 size={16} className="animate-spin mr-2" />
        Executing query...
        {result.startTime && <LiveTimer startTime={result.startTime} />}
      </div>
    );
  }

  // Cancelled
  if (result.status === "cancelled") {
    return (
      <div className="flex items-center justify-center h-full text-(--color-text-muted) text-sm">
        <Ban size={16} className="mr-2" />
        Query cancelled
        <ElapsedBadge elapsed={result.elapsed} />
      </div>
    );
  }

  // Error
  if (result.status === "error") {
    return (
      <div className="flex flex-col items-start p-4 h-full overflow-auto">
        <div className="flex items-center gap-2 text-(--color-error) text-sm font-medium mb-2 w-full">
          <AlertCircle size={16} />
          Error
          <ElapsedBadge elapsed={result.elapsed} />
          <CopyButton getText={() => result.error} className="ml-auto" />
        </div>
        <pre className="text-xs text-(--color-error)/80 whitespace-pre-wrap font-mono bg-(--color-error)/5 rounded-lg p-3 w-full">
          {result.error}
        </pre>
      </div>
    );
  }

  // Success - parse result data
  if (result.status === "ok" && result.data) {
    // Livy returns data in different formats
    // text/plain is the most common for SQL results
    const textData = result.data["text/plain"];
    const jsonData = result.data["application/json"];

    // Try to render as a table if we have structured JSON data
    if (jsonData) {
      return <JsonTable data={jsonData} elapsed={result.elapsed} />;
    }

    // Render text output
    if (textData) {
      return (
        <div className="flex flex-col h-full overflow-auto p-4">
          <div className="flex items-center gap-2 text-(--color-success) text-xs font-medium mb-2 w-full">
            <CheckCircle2 size={14} />
            Query completed
            <ElapsedBadge elapsed={result.elapsed} />
            <CopyButton getText={() => textData} className="ml-auto" />
            <DownloadButtons getCsv={() => textData} />
          </div>
          <pre className="text-xs text-(--color-text-primary) whitespace-pre-wrap font-mono bg-(--color-bg-primary) rounded-lg p-3 flex-1 overflow-auto">
            {textData}
          </pre>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center h-full text-(--color-success) text-sm">
        <CheckCircle2 size={16} className="mr-2" />
        Query completed (no output)
        <ElapsedBadge elapsed={result.elapsed} />
      </div>
    );
  }

  return null;
}

const PLAN_OPERATORS = [
  "AdaptiveSparkPlan", "Project", "Filter", "BroadcastHashJoin", "SortMergeJoin",
  "ShuffledHashJoin", "CartesianProduct", "Exchange", "BroadcastExchange",
  "ObjectHashAggregate", "HashAggregate", "SortAggregate", "Sort", "Generate",
  "FileScan", "Scan", "SubqueryBroadcast", "ReusedExchange", "Union",
  "TakeOrderedAndProject", "CollectLimit", "Window", "Expand",
  "InMemoryTableScan", "InMemoryRelation", "BatchScan",
];

const PLAN_OP_REGEX = new RegExp(`\\b(${PLAN_OPERATORS.join("|")})\\b`, "g");

function highlightPlanLine(line) {
  const parts = [];
  let lastIndex = 0;
  let match;
  const regex = new RegExp(PLAN_OP_REGEX.source, "g");
  while ((match = regex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={lastIndex}>{line.slice(lastIndex, match.index)}</span>);
    }
    parts.push(
      <span key={match.index} className="text-(--color-accent) font-bold">
        {match[0]}
      </span>
    );
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < line.length) {
    parts.push(<span key={lastIndex}>{line.slice(lastIndex)}</span>);
  }
  return parts;
}

function ExplainPlan({ planText, elapsed }) {
  const lines = planText.split("\n");

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-2 text-(--color-accent) text-xs font-medium border-b border-(--color-border) shrink-0">
        <FileText size={14} />
        Execution Plan
        <ElapsedBadge elapsed={elapsed} />
        <CopyButton getText={() => planText} className="ml-auto" />
        <DownloadButtons getCsv={() => planText} />
      </div>
      <div className="flex-1 overflow-auto p-4">
        <pre className="text-xs font-mono leading-5 text-(--color-text-secondary) whitespace-pre overflow-x-auto">
          {lines.map((line, i) => (
            <div key={i}>{highlightPlanLine(line)}</div>
          ))}
        </pre>
      </div>
    </div>
  );
}

function isExplainResult(data) {
  if (!data || !data.schema || !data.data) return false;
  const fields = data.schema.fields || [];
  if (fields.length !== 1) return false;
  const field = fields[0];
  return field.name === "plan" && field.type === "string" && data.data.length === 1;
}

const ROW_HEIGHT = 28;
const OVERSCAN = 10;

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

function JsonTable({ data, elapsed }) {
  const scrollRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewHeight, setViewHeight] = useState(400);
  const [colWidths, setColWidths] = useState({});
  const resizingRef = useRef(null);
  const [columnFilters, setColumnFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const debouncedFilters = useDebounce(columnFilters, 300);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setViewHeight(entry.contentRect.height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const handleScroll = useCallback((e) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  if (isExplainResult(data)) {
    const planText = Array.isArray(data.data[0]) ? data.data[0][0] : data.data[0].plan;
    return <ExplainPlan planText={planText} elapsed={elapsed} />;
  }

  if (!(data && data.schema && data.data)) {
    // Fallback: render as JSON
    return (
      <div className="flex flex-col h-full overflow-auto p-4">
        <div className="flex items-center gap-2 text-(--color-success) text-xs font-medium mb-2 w-full">
          <CheckCircle2 size={14} />
          Query completed
          <CopyButton getText={() => JSON.stringify(data, null, 2)} className="ml-auto" />
        </div>
        <pre className="text-xs text-(--color-text-primary) whitespace-pre-wrap font-mono bg-(--color-bg-primary) rounded-lg p-3 flex-1 overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    );
  }

  const fields = data.schema.fields || [];
  const rows = data.data || [];
  
  const filteredRows = useMemo(() => {
    const activeFilters = Object.entries(debouncedFilters).filter(([_, value]) => value.trim() !== '');
    if (activeFilters.length === 0) return rows;
    
    return rows.filter(row => {
      return activeFilters.every(([colIndex, filterValue]) => {
        const field = fields[parseInt(colIndex)];
        const cellValue = row[field.name || field] !== undefined 
          ? String(row[field.name || field]) 
          : Array.isArray(row) ? String(row[parseInt(colIndex)] ?? '') : '';
        
        // Try regex first, fall back to case-insensitive string match if invalid regex
        try {
          const regex = new RegExp(filterValue, 'i');
          return regex.test(cellValue);
        } catch (e) {
          // Invalid regex, fall back to simple string match
          return cellValue.toLowerCase().includes(filterValue.toLowerCase());
        }
      });
    });
  }, [rows, debouncedFilters, fields]);
  
  const totalRows = rows.length;
  const filteredCount = filteredRows.length;
  const hasActiveFilters = Object.values(columnFilters).some(v => v.trim() !== '');

  const startIdx = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
  const visibleCount = Math.ceil(viewHeight / ROW_HEIGHT) + OVERSCAN * 2;
  const endIdx = Math.min(filteredCount, startIdx + visibleCount);
  const topPad = startIdx * ROW_HEIGHT;
  const bottomPad = (filteredCount - endIdx) * ROW_HEIGHT;
  
  const handleFilterChange = (colIndex, value) => {
    setColumnFilters(prev => ({ ...prev, [colIndex]: value }));
  };
  
  const clearAllFilters = () => {
    setColumnFilters({});
  };
  
  const clearFilter = (colIndex) => {
    setColumnFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[colIndex];
      return newFilters;
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-2 text-(--color-success) text-xs font-medium border-b border-(--color-border) shrink-0">
        <CheckCircle2 size={14} />
        {hasActiveFilters ? (
          <>
            {filteredCount} of {totalRows} row{totalRows !== 1 ? "s" : ""}, {fields.length} column{fields.length !== 1 ? "s" : ""}
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1 px-2 py-1 sm:py-0.5 ml-2 rounded text-[10px] bg-(--color-bg-tertiary) hover:bg-(--color-bg-primary) text-(--color-text-muted) hover:text-(--color-text-primary) transition-colors touch-manipulation"
              title="Clear all filters"
            >
              <FilterX size={10} />
              <span className="hidden sm:inline">Clear filters</span>
              <span className="sm:hidden">Clear</span>
            </button>
          </>
        ) : (
          <>{totalRows} row{totalRows !== 1 ? "s" : ""}, {fields.length} column{fields.length !== 1 ? "s" : ""} returned</>
        )}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1 px-2 py-1 sm:py-0.5 ml-2 rounded text-[10px] transition-colors touch-manipulation ${
            showFilters
              ? 'bg-(--color-accent) text-white'
              : 'bg-(--color-bg-tertiary) hover:bg-(--color-bg-primary) text-(--color-text-muted) hover:text-(--color-text-primary)'
          }`}
          title={showFilters ? "Hide filters" : "Show filters"}
        >
          <Search size={10} />
          <span className="hidden sm:inline">{showFilters ? "Hide" : "Show"} filters</span>
          <span className="sm:hidden">{showFilters ? "Hide" : "Show"}</span>
        </button>
        <ElapsedBadge elapsed={elapsed} />
        {(() => {
          const buildCsv = () => {
            const csvEscape = (v) => {
              const s = String(v);
              return s.includes(",") || s.includes('"') || s.includes("\n")
                ? '"' + s.replace(/"/g, '""') + '"'
                : s;
            };
            const header = fields.map((f) => csvEscape(f.name || f)).join(",");
            const body = filteredRows.map((row) =>
              fields.map((f, ci) => {
                const val = row[f.name || f] !== undefined ? row[f.name || f] : Array.isArray(row) ? (row[ci] ?? "") : "";
                return csvEscape(val);
              }).join(",")
            ).join("\n");
            return header + "\n" + body;
          };
          const buildJson = () => {
            return JSON.stringify(filteredRows.map((row) => {
              const obj = {};
              fields.forEach((f, ci) => {
                const name = f.name || f;
                obj[name] = row[name] !== undefined ? row[name] : Array.isArray(row) ? (row[ci] ?? "") : "";
              });
              return obj;
            }), null, 2);
          };
          return (
            <>
              <CopyButton getText={buildCsv} className="ml-auto" />
              <DownloadButtons getCsv={buildCsv} getJson={buildJson} />
            </>
          );
        })()}
      </div>
      <div className="flex-1 overflow-auto" ref={scrollRef} onScroll={handleScroll}>
        <table className="text-xs" style={{ tableLayout: Object.keys(colWidths).length > 0 ? "fixed" : "auto", width: Object.keys(colWidths).length > 0 ? undefined : "100%" }}>
          {Object.keys(colWidths).length > 0 && (
            <colgroup>
              {fields.map((_, i) => (
                <col key={i} style={{ width: colWidths[i] || 150 }} />
              ))}
            </colgroup>
          )}
          <thead>
            <tr className="bg-(--color-bg-tertiary) sticky top-0 z-20">
              {fields.map((field, i) => {
                const name = field.name || field;
                const type = field.type
                  ? typeof field.type === "string"
                    ? field.type
                    : field.type.type || JSON.stringify(field.type)
                  : null;
                return (
                  <th
                    key={i}
                    className="px-2 py-1.5 text-left border-b border-(--color-border) relative group/th"
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-(--color-text-secondary) font-semibold text-xs whitespace-nowrap">{name}</span>
                      {type && (
                        <span className="inline-flex items-center px-1 py-0.5 text-[9px] font-mono bg-(--color-accent)/10 text-(--color-accent) rounded border border-(--color-accent)/20">
                          {type}
                        </span>
                      )}
                    </div>
                    {showFilters && (
                      <div className="relative flex items-center">
                        <Search size={9} className="absolute left-1.5 text-(--color-text-muted) pointer-events-none" />
                        <input
                          type="text"
                          value={columnFilters[i] || ''}
                          onChange={(e) => handleFilterChange(i, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                              clearFilter(i);
                              e.target.blur();
                            }
                          }}
                          placeholder="Filter..."
                          className="w-full pl-5 pr-5 py-1 sm:py-0.5 text-[10px] sm:text-[10px] bg-(--color-bg-primary) text-(--color-text-primary) border border-(--color-border) rounded focus:outline-none focus:border-(--color-accent) placeholder:text-(--color-text-muted) touch-manipulation"
                        />
                        {columnFilters[i] && (
                          <button
                            onClick={() => clearFilter(i)}
                            className="absolute right-1 p-1 sm:p-0.5 rounded hover:bg-(--color-bg-tertiary) text-(--color-text-muted) hover:text-(--color-text-primary) touch-manipulation"
                            title="Clear filter"
                          >
                            <X size={9} />
                          </button>
                        )}
                      </div>
                    )}
                    <div
                      className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize opacity-0 group-hover/th:opacity-100 hover:bg-(--color-accent)/40 transition-opacity"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        const startX = e.clientX;
                        const th = e.target.parentElement;
                        const startWidth = th.offsetWidth;
                        resizingRef.current = i;
                        const onMove = (me) => {
                          const delta = me.clientX - startX;
                          const newWidth = Math.max(60, startWidth + delta);
                          setColWidths((prev) => ({ ...prev, [i]: newWidth }));
                        };
                        const onUp = () => {
                          resizingRef.current = null;
                          document.removeEventListener("mousemove", onMove);
                          document.removeEventListener("mouseup", onUp);
                        };
                        document.addEventListener("mousemove", onMove);
                        document.addEventListener("mouseup", onUp);
                      }}
                    />
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {topPad > 0 && (
              <tr><td colSpan={fields.length} style={{ height: topPad, padding: 0, border: "none" }} /></tr>
            )}
            {filteredRows.slice(startIdx, endIdx).map((row, i) => (
              <tr
                key={startIdx + i}
                className="border-b border-(--color-border)/50 hover:bg-(--color-bg-tertiary)/30"
                style={{ height: ROW_HEIGHT }}
              >
                {fields.map((field, ci) => (
                  <td
                    key={ci}
                    className="px-3 py-1.5 text-(--color-text-primary) whitespace-nowrap font-mono"
                  >
                    {row[field.name || field] !== undefined
                      ? String(row[field.name || field])
                      : Array.isArray(row)
                        ? String(row[ci] ?? "")
                        : ""}
                  </td>
                ))}
              </tr>
            ))}
            {bottomPad > 0 && (
              <tr><td colSpan={fields.length} style={{ height: bottomPad, padding: 0, border: "none" }} /></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
