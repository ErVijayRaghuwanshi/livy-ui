import { useState, useEffect, useRef } from "react";
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
    <span className="inline-flex items-center gap-1 text-[10px] text-[var(--color-text-muted)] ml-2">
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
    <span className="inline-flex items-center gap-1 text-xs text-[var(--color-warning)] font-mono ml-2">
      <Clock size={12} />
      {formatElapsed(elapsed)}
    </span>
  );
}

export default function ResultTable({ result }) {
  if (!result) {
    return (
      <div className="flex items-center justify-center h-full text-[var(--color-text-muted)] text-sm">
        <Table size={16} className="mr-2" />
        Run a query to see results
      </div>
    );
  }

  // Running state
  if (result.status === "running") {
    return (
      <div className="flex items-center justify-center h-full text-[var(--color-warning)] text-sm">
        <Loader2 size={16} className="animate-spin mr-2" />
        Executing query...
        {result.startTime && <LiveTimer startTime={result.startTime} />}
      </div>
    );
  }

  // Cancelled
  if (result.status === "cancelled") {
    return (
      <div className="flex items-center justify-center h-full text-[var(--color-text-muted)] text-sm">
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
        <div className="flex items-center gap-2 text-[var(--color-error)] text-sm font-medium mb-2">
          <AlertCircle size={16} />
          Error
          <ElapsedBadge elapsed={result.elapsed} />
        </div>
        <pre className="text-xs text-[var(--color-error)]/80 whitespace-pre-wrap font-mono bg-[var(--color-error)]/5 rounded-lg p-3 w-full">
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
      return renderJsonTable(jsonData, result.elapsed);
    }

    // Render text output
    if (textData) {
      return (
        <div className="flex flex-col h-full overflow-auto p-4">
          <div className="flex items-center gap-2 text-[var(--color-success)] text-xs font-medium mb-2">
            <CheckCircle2 size={14} />
            Query completed
            <ElapsedBadge elapsed={result.elapsed} />
          </div>
          <pre className="text-xs text-[var(--color-text-primary)] whitespace-pre-wrap font-mono bg-[var(--color-bg-primary)] rounded-lg p-3 flex-1 overflow-auto">
            {textData}
          </pre>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center h-full text-[var(--color-success)] text-sm">
        <CheckCircle2 size={16} className="mr-2" />
        Query completed (no output)
        <ElapsedBadge elapsed={result.elapsed} />
      </div>
    );
  }

  return null;
}

function renderJsonTable(data, elapsed) {
  // data can be { schema: { fields: [...] }, data: [...] } for structured results
  if (data && data.schema && data.data) {
    const fields = data.schema.fields || [];
    const rows = data.data || [];

    return (
      <div className="flex flex-col h-full overflow-auto">
        <div className="flex items-center gap-2 px-4 py-2 text-[var(--color-success)] text-xs font-medium border-b border-[var(--color-border)]">
          <CheckCircle2 size={14} />
          {rows.length} row{rows.length !== 1 ? "s" : ""} returned
          <ElapsedBadge elapsed={elapsed} />
        </div>
        <div className="flex-1 overflow-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[var(--color-bg-tertiary)] sticky top-0">
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
                      className="px-3 py-1.5 text-left border-b border-[var(--color-border)] whitespace-nowrap"
                    >
                      <span className="text-[var(--color-text-secondary)] font-semibold text-xs">{name}</span>
                      {type && (
                        <span className="block text-[10px] font-normal text-[var(--color-accent)] opacity-70 mt-0.5">
                          {type}
                        </span>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr
                  key={ri}
                  className="border-b border-[var(--color-border)]/50 hover:bg-[var(--color-bg-tertiary)]/30"
                >
                  {fields.map((field, ci) => (
                    <td
                      key={ci}
                      className="px-3 py-1.5 text-[var(--color-text-primary)] whitespace-nowrap font-mono"
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
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Fallback: render as JSON
  return (
    <div className="flex flex-col h-full overflow-auto p-4">
      <div className="flex items-center gap-2 text-[var(--color-success)] text-xs font-medium mb-2">
        <CheckCircle2 size={14} />
        Query completed
      </div>
      <pre className="text-xs text-[var(--color-text-primary)] whitespace-pre-wrap font-mono bg-[var(--color-bg-primary)] rounded-lg p-3 flex-1 overflow-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
