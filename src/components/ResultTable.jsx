import { useState, useEffect, useRef, useCallback } from "react";
import { AlertCircle, Loader2, Table, CheckCircle2, Ban, Clock } from "lucide-react";

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
        <div className="flex items-center gap-2 text-(--color-error) text-sm font-medium mb-2">
          <AlertCircle size={16} />
          Error
          <ElapsedBadge elapsed={result.elapsed} />
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
          <div className="flex items-center gap-2 text-(--color-success) text-xs font-medium mb-2">
            <CheckCircle2 size={14} />
            Query completed
            <ElapsedBadge elapsed={result.elapsed} />
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

const ROW_HEIGHT = 28;
const OVERSCAN = 10;

function JsonTable({ data, elapsed }) {
  const scrollRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewHeight, setViewHeight] = useState(400);

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

  if (!(data && data.schema && data.data)) {
    // Fallback: render as JSON
    return (
      <div className="flex flex-col h-full overflow-auto p-4">
        <div className="flex items-center gap-2 text-(--color-success) text-xs font-medium mb-2">
          <CheckCircle2 size={14} />
          Query completed
        </div>
        <pre className="text-xs text-(--color-text-primary) whitespace-pre-wrap font-mono bg-(--color-bg-primary) rounded-lg p-3 flex-1 overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    );
  }

  const fields = data.schema.fields || [];
  const rows = data.data || [];
  const totalRows = rows.length;

  const startIdx = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
  const visibleCount = Math.ceil(viewHeight / ROW_HEIGHT) + OVERSCAN * 2;
  const endIdx = Math.min(totalRows, startIdx + visibleCount);
  const topPad = startIdx * ROW_HEIGHT;
  const bottomPad = (totalRows - endIdx) * ROW_HEIGHT;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-2 text-(--color-success) text-xs font-medium border-b border-(--color-border) shrink-0">
        <CheckCircle2 size={14} />
        {totalRows} row{totalRows !== 1 ? "s" : ""} returned
        <ElapsedBadge elapsed={elapsed} />
      </div>
      <div className="flex-1 overflow-auto" ref={scrollRef} onScroll={handleScroll}>
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-(--color-bg-tertiary) sticky top-0 z-10">
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
                    className="px-3 py-1.5 text-left border-b border-(--color-border) whitespace-nowrap"
                  >
                    <span className="text-(--color-text-secondary) font-semibold text-xs">{name}</span>
                    {type && (
                      <span className="block text-[10px] font-normal text-(--color-accent) opacity-70 mt-0.5">
                        {type}
                      </span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {topPad > 0 && (
              <tr><td colSpan={fields.length} style={{ height: topPad, padding: 0, border: "none" }} /></tr>
            )}
            {rows.slice(startIdx, endIdx).map((row, i) => (
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
