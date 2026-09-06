import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { AlertCircle, Loader2, Table, CheckCircle2, Ban, Clock, FileText, Copy, Check, Download, Search, X, FilterX, Hash, Type, Calendar, ToggleLeft, Binary, List, Braces, ChevronDown, Trash2, Plus, History } from "lucide-react";
import { useSqlFiles } from "../context/SqlFilesContext";
import { useSchema } from "../context/SchemaContext";

export function inferColumnType(field, sampleRows = [], colIndex = 0, schemaColumns = {}) {
  const rawType = field?.type
    ? typeof field.type === "string"
      ? field.type
      : field.type.type || JSON.stringify(field.type)
    : "";
  const name = String(field?.name || field || "").trim();

  // 1. Check if column exists in SchemaContext catalog columns (exact or case-insensitive match)
  if (schemaColumns && typeof schemaColumns === "object") {
    for (const cols of Object.values(schemaColumns)) {
      if (Array.isArray(cols)) {
        const match = cols.find((c) => c.name && c.name.toLowerCase() === name.toLowerCase());
        if (match && match.type) {
          return match.type.toLowerCase();
        }
      }
    }
  }

  // 2. Extract non-null sample values for this column
  const values = sampleRows
    .slice(0, 30)
    .map((row) => {
      if (!row) return undefined;
      return row[name] !== undefined ? row[name] : Array.isArray(row) ? row[colIndex] : undefined;
    })
    .filter((v) => v !== null && v !== undefined && v !== "");

  if (values.length === 0) {
    return rawType || "string";
  }

  // 3. Inspect values for timestamps (15-16 digit microsecond numbers, 13-digit millisecond numbers, ISO timestamp strings)
  const isMicrosecondTimestamp = values.every((v) => {
    const num = Number(v);
    return !isNaN(num) && num > 1e14 && num < 2e15; // e.g. 1742710461000000
  });
  const isMillisecondTimestamp = values.every((v) => {
    const num = Number(v);
    return !isNaN(num) && num > 1e11 && num < 2e12; // e.g. 1742710461000
  });
  const isIsoTimestamp = values.every((v) => {
    return typeof v === "string" && /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}/.test(v);
  });
  const nameLooksLikeTimestamp = /timestamp|time|_at$|ts$|created_at|updated_at|date_time/i.test(name);
  const nameLooksLikeDate = /date$|_date$|^date/i.test(name);

  if (
    isMicrosecondTimestamp ||
    isMillisecondTimestamp ||
    isIsoTimestamp ||
    (nameLooksLikeTimestamp && values.every((v) => !isNaN(Number(v)) || !isNaN(Date.parse(v))))
  ) {
    return "timestamp";
  }

  // 4. Inspect values for date (YYYY-MM-DD or days since epoch e.g. 15000-35000 with date name)
  const isIsoDate = values.every((v) => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v));
  const isEpochDayNumber =
    (nameLooksLikeDate || rawType === "date") &&
    values.every((v) => {
      const num = Number(v);
      return Number.isInteger(num) && num > 10000 && num < 50000;
    });
  if (isIsoDate || isEpochDayNumber) {
    return "date";
  }

  // 5. Inspect numeric types (Integer vs BigInt vs Double/Decimal)
  const allNumeric = values.every(
    (v) => typeof v === "number" || (!isNaN(Number(v)) && typeof v === "string" && v.trim() !== "")
  );
  if (allNumeric) {
    const hasDecimals = values.some((v) => {
      const num = Number(v);
      return !Number.isInteger(num) || String(v).includes(".");
    });
    if (hasDecimals) {
      return "double";
    }
    const hasBigInt = values.some((v) => {
      const num = Number(v);
      return num > 2147483647 || num < -2147483648;
    });
    if (hasBigInt) {
      return "bigint";
    }
    return rawType.includes("int") || rawType === "integer" ? rawType : "integer";
  }

  // 6. Boolean
  const allBoolean = values.every((v) => typeof v === "boolean" || v === "true" || v === "false");
  if (allBoolean) {
    return "boolean";
  }

  // 7. Arrays and Structs
  if (values.some((v) => Array.isArray(v))) {
    return "array";
  }
  if (values.some((v) => typeof v === "object" && v !== null)) {
    return "struct";
  }

  return rawType || "string";
}

export function formatCellValue(value, inferredType) {
  if (value === null || value === undefined) {
    return { text: "NULL", isNull: true };
  }

  if (typeof value === "object") {
    return { text: JSON.stringify(value), isNull: false };
  }

  const strVal = String(value);

  if (inferredType === "timestamp") {
    const num = Number(value);
    if (!isNaN(num) && num > 1e14 && num < 2e15) {
      // Microseconds epoch -> ms
      const d = new Date(Math.floor(num / 1000));
      if (!isNaN(d.getTime())) {
        return { text: d.toISOString().replace("T", " ").replace(/\.\d+Z$/, ""), isNull: false };
      }
    } else if (!isNaN(num) && num > 1e11 && num < 2e12) {
      // Milliseconds epoch
      const d = new Date(num);
      if (!isNaN(d.getTime())) {
        return { text: d.toISOString().replace("T", " ").replace(/\.\d+Z$/, ""), isNull: false };
      }
    }
  }

  if (inferredType === "date") {
    const num = Number(value);
    if (Number.isInteger(num) && num > 10000 && num < 50000) {
      // Days since epoch
      const d = new Date(num * 86400000);
      if (!isNaN(d.getTime())) {
        return { text: d.toISOString().slice(0, 10), isNull: false };
      }
    }
  }

  return { text: strVal, isNull: false };
}

function getDataTypeIcon(type) {
  if (!type) return null;
  const lowerType = type.toLowerCase();
  
  // String types
  if (lowerType.includes('string') || lowerType.includes('char') || lowerType.includes('varchar') || 
      lowerType.includes('text')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
        <path fill="currentColor" fillRule="evenodd" d="M6.25 1h2.174a2.126 2.126 0 0 1 1.81 3.243 2.126 2.126 0 0 1-1.36 3.761H6.25a.75.75 0 0 1-.75-.75V1.75A.75.75 0 0 1 6.25 1M7 6.504V5.252h1.874a.626.626 0 1 1 0 1.252zm2.05-3.378c0 .345-.28.625-.625.626H7.001L7 2.5h1.424c.346 0 .626.28.626.626M3.307 6a.75.75 0 0 1 .697.473L6.596 13H4.982l-.238-.6H1.855l-.24.6H0l2.61-6.528A.75.75 0 0 1 3.307 6m-.003 2.776.844 2.124H2.455z" clipRule="evenodd"></path>
        <path fill="currentColor" d="M12.5 15a2.5 2.5 0 0 0 2.5-2.5h-1.5a1 1 0 1 1-2 0v-1.947c0-.582.472-1.053 1.053-1.053.523 0 .947.424.947.947v.053H15v-.053A2.447 2.447 0 0 0 12.553 8 2.553 2.553 0 0 0 10 10.553V12.5a2.5 2.5 0 0 0 2.5 2.5"></path>
      </svg>
    );
  }
  
  // BigInt/Long types
  if (lowerType.includes('bigint') || lowerType.includes('long')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
        <path fill="currentColor" d="M7.889 1A2.39 2.39 0 0 0 5.5 3.389H7c0-.491.398-.889.889-.889h.371a.74.74 0 0 1 .292 1.42l-1.43.613A2.68 2.68 0 0 0 5.5 6.992V8h5V6.5H7.108c.12-.26.331-.472.604-.588l1.43-.613A2.24 2.24 0 0 0 8.26 1zM2.75 6a1.5 1.5 0 0 1-1.5 1.5H1V9h.25c.546 0 1.059-.146 1.5-.401V11.5H1V13h5v-1.5H4.25V6zM10 12.85A2.15 2.15 0 0 0 12.15 15h.725a2.125 2.125 0 0 0 1.617-3.504 2.138 2.138 0 0 0-1.656-3.521l-.713.008A2.15 2.15 0 0 0 10 10.133v.284h1.5v-.284a.65.65 0 0 1 .642-.65l.712-.009a.638.638 0 1 1 .008 1.276H12v1.5h.875a.625.625 0 1 1 0 1.25h-.725a.65.65 0 0 1-.65-.65v-.267H10z"></path>
      </svg>
    );
  }
  
  // Timestamp types (more specific, check first)
  if (lowerType.includes('timestamp')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
        <path fill="currentColor" fillRule="evenodd" d="M4.5 0v2H1.75a.75.75 0 0 0-.75.75v11.5c0 .414.336.75.75.75H6v-1.5H2.5V7H15V2.75a.75.75 0 0 0-.75-.75H11.5V0H10v2H6V0zm9 5.5v-2h-11v2z" clipRule="evenodd"></path>
        <path fill="currentColor" d="M10.25 10.5V12c0 .199.079.39.22.53l1 1 1.06-1.06-.78-.78V10.5z"></path>
        <path fill="currentColor" fillRule="evenodd" d="M7 12a4 4 0 1 1 8 0 4 4 0 0 1-8 0m4-2.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5" clipRule="evenodd"></path>
      </svg>
    );
  }
  
  // Date/Time types
  if (lowerType.includes('date') || lowerType.includes('time')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
        <path fill="currentColor" d="M8.5 10.25a1.75 1.75 0 1 1 3.5 0 1.75 1.75 0 0 1-3.5 0"></path>
        <path fill="currentColor" fillRule="evenodd" d="M10 2H6V0H4.5v2H1.75a.75.75 0 0 0-.75.75v11.5c0 .414.336.75.75.75h12.5a.75.75 0 0 0 .75-.75V2.75a.75.75 0 0 0-.75-.75H11.5V0H10zM2.5 3.5v2h11v-2zm0 10V7h11v6.5z" clipRule="evenodd"></path>
      </svg>
    );
  }
  
  // Double/Float/Decimal types
  if (lowerType.includes('double') || lowerType.includes('float') || lowerType.includes('decimal')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
        <path fill="currentColor" d="M0 5.25A2.25 2.25 0 0 0 2.25 3h1.5v8.5H6V13H0v-1.5h2.25V6c-.627.471-1.406.75-2.25.75zM10 5.75A2.75 2.75 0 0 1 12.75 3h.39a2.86 2.86 0 0 1 1.57 5.252l-2.195 1.44a2.25 2.25 0 0 0-1.014 1.808H16V13h-6v-1.426a3.75 3.75 0 0 1 1.692-3.135l2.194-1.44A1.36 1.36 0 0 0 13.14 4.5h-.389c-.69 0-1.25.56-1.25 1.25V6H10zM8 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2"></path>
      </svg>
    );
  }
  
  // Integer types (default numeric)
  if (lowerType.includes('int') || lowerType.includes('short') || lowerType.includes('byte') || lowerType.includes('number')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
        <path fill="currentColor" d="M7.889 1A2.39 2.39 0 0 0 5.5 3.389H7c0-.491.398-.889.889-.889h.371a.74.74 0 0 1 .292 1.42l-1.43.613A2.68 2.68 0 0 0 5.5 6.992V8h5V6.5H7.108c.12-.26.331-.472.604-.588l1.43-.613A2.24 2.24 0 0 0 8.26 1zM2.75 6a1.5 1.5 0 0 1-1.5 1.5H1V9h.25c.546 0 1.059-.146 1.5-.401V11.5H1V13h5v-1.5H4.25V6zM10 12.85A2.15 2.15 0 0 0 12.15 15h.725a2.125 2.125 0 0 0 1.617-3.504 2.138 2.138 0 0 0-1.656-3.521l-.713.008A2.15 2.15 0 0 0 10 10.133v.284h1.5v-.284a.65.65 0 0 1 .642-.65l.712-.009a.638.638 0 1 1 .008 1.276H12v1.5h.875a.625.625 0 1 1 0 1.25h-.725a.65.65 0 0 1-.65-.65v-.267H10z"></path>
      </svg>
    );
  }
  
  // Boolean types
  if (lowerType.includes('bool')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
        <path fill="currentColor" d="m5.5 2 1.06 1.06-3.53 3.531L1 4.561 2.06 3.5l.97.97zM15.03 4.53h-7v-1.5h7zM1.03 14.53v-1.5h14v1.5zM8.03 9.53h7v-1.5h-7zM6.56 8.06 5.5 7 3.03 9.47l-.97-.97L1 9.56l2.03 2.031z"></path>
      </svg>
    );
  }
  
  // Binary types
  if (lowerType.includes('binary') || lowerType.includes('blob')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
        <path fill="currentColor" fillRule="evenodd" d="M1 3a2 2 0 1 1 4 0v2a2 2 0 1 1-4 0zm2-.5a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 1 0V3a.5.5 0 0 0-.5-.5m3.378-.628c.482 0 .872-.39.872-.872h1.5v4.25H10v1.5H6v-1.5h1.25V3.206c-.27.107-.564.166-.872.166H6v-1.5zm5 0c.482 0 .872-.39.872-.872h1.5v4.25H15v1.5h-4v-1.5h1.25V3.206c-.27.107-.564.166-.872.166H11v-1.5zM6 11a2 2 0 1 1 4 0v2a2 2 0 1 1-4 0zm2-.5a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 1 0v-2a.5.5 0 0 0-.5-.5m-6.622-.378c.482 0 .872-.39.872-.872h1.5v4.25H5V15H1v-1.5h1.25v-2.044c-.27.107-.564.166-.872.166H1v-1.5zm10 0c.482 0 .872-.39.872-.872h1.5v4.25H15V15h-4v-1.5h1.25v-2.044c-.27.107-.564.166-.872.166H11v-1.5z" clipRule="evenodd"></path>
      </svg>
    );
  }
  
  // Array types
  if (lowerType.includes('array')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
        <path fill="currentColor" fillRule="evenodd" d="M2.004 9.602a2.751 2.751 0 1 0 3.371 3.47 2.751 2.751 0 0 0 5.25 0 2.751 2.751 0 1 0 3.371-3.47A2.75 2.75 0 0 0 11.25 7h-2.5v-.604a2.751 2.751 0 1 0-1.5 0V7h-2.5a2.75 2.75 0 0 0-2.746 2.602M2.75 11a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5m4.5-2.5h-2.5a1.25 1.25 0 0 0-1.242 1.106 2.76 2.76 0 0 1 1.867 1.822A2.76 2.76 0 0 1 7.25 9.604zm1.5 0v1.104c.892.252 1.6.942 1.875 1.824a2.76 2.76 0 0 1 1.867-1.822A1.25 1.25 0 0 0 11.25 8.5zM12 12.25a1.25 1.25 0 1 1 2.5 0 1.25 1.25 0 0 1-2.5 0m-5.25 0a1.25 1.25 0 1 0 2.5 0 1.25 1.25 0 0 0-2.5 0M8 5a1.25 1.25 0 1 1 0-2.5A1.25 1.25 0 0 1 8 5" clipRule="evenodd"></path>
      </svg>
    );
  }
  
  // Struct/Map/Complex types (same icon as array in Databricks)
  if (lowerType.includes('struct') || lowerType.includes('map') || lowerType.includes('object')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
        <path fill="currentColor" fillRule="evenodd" d="M2.004 9.602a2.751 2.751 0 1 0 3.371 3.47 2.751 2.751 0 0 0 5.25 0 2.751 2.751 0 1 0 3.371-3.47A2.75 2.75 0 0 0 11.25 7h-2.5v-.604a2.751 2.751 0 1 0-1.5 0V7h-2.5a2.75 2.75 0 0 0-2.746 2.602M2.75 11a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5m4.5-2.5h-2.5a1.25 1.25 0 0 0-1.242 1.106 2.76 2.76 0 0 1 1.867 1.822A2.76 2.76 0 0 1 7.25 9.604zm1.5 0v1.104c.892.252 1.6.942 1.875 1.824a2.76 2.76 0 0 1 1.867-1.822A1.25 1.25 0 0 0 11.25 8.5zM12 12.25a1.25 1.25 0 1 1 2.5 0 1.25 1.25 0 0 1-2.5 0m-5.25 0a1.25 1.25 0 1 0 2.5 0 1.25 1.25 0 0 0-2.5 0M8 5a1.25 1.25 0 1 1 0-2.5A1.25 1.25 0 0 1 8 5" clipRule="evenodd"></path>
      </svg>
    );
  }
  
  // Default - use string icon
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path fill="currentColor" fillRule="evenodd" d="M6.25 1h2.174a2.126 2.126 0 0 1 1.81 3.243 2.126 2.126 0 0 1-1.36 3.761H6.25a.75.75 0 0 1-.75-.75V1.75A.75.75 0 0 1 6.25 1M7 6.504V5.252h1.874a.626.626 0 1 1 0 1.252zm2.05-3.378c0 .345-.28.625-.625.626H7.001L7 2.5h1.424c.346 0 .626.28.626.626M3.307 6a.75.75 0 0 1 .697.473L6.596 13H4.982l-.238-.6H1.855l-.24.6H0l2.61-6.528A.75.75 0 0 1 3.307 6m-.003 2.776.844 2.124H2.455z" clipRule="evenodd"></path>
      <path fill="currentColor" d="M12.5 15a2.5 2.5 0 0 0 2.5-2.5h-1.5a1 1 0 1 1-2 0v-1.947c0-.582.472-1.053 1.053-1.053.523 0 .947.424.947.947v.053H15v-.053A2.447 2.447 0 0 0 12.553 8 2.553 2.553 0 0 0 10 10.553V12.5a2.5 2.5 0 0 0 2.5 2.5"></path>
    </svg>
  );
}

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
    <span className="inline-flex items-center gap-1 text-[10px] text-(--color-text-muted) ml-2 whitespace-nowrap shrink-0">
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
    <span className="inline-flex items-center gap-1 text-xs text-(--color-warning) font-mono ml-2 whitespace-nowrap shrink-0">
      <Clock size={12} />
      {formatElapsed(elapsed)}
    </span>
  );
}

function CopyButton({ getText, className = "", hideText = false }) {
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
      {!hideText && (copied ? "Copied" : "Copy")}
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

function DownloadButtons({ getCsv, getJson, className = "", hideText = false }) {
  return (
    <span className={`flex items-center gap-1 ${className}`}>
      {getCsv && (
        <button
          onClick={() => downloadFile(getCsv(), `result_${Date.now()}.csv`, "text/csv")}
          className="flex items-center gap-1 px-2 py-1 rounded text-[11px] hover:bg-(--color-bg-tertiary) text-(--color-text-muted) hover:text-(--color-text-primary) transition-colors cursor-pointer"
          title="Download CSV"
        >
          <Download size={12} /> {!hideText && "CSV"}
        </button>
      )}
      {getJson && (
        <button
          onClick={() => downloadFile(getJson(), `result_${Date.now()}.json`, "application/json")}
          className="flex items-center gap-1 px-2 py-1 rounded text-[11px] hover:bg-(--color-bg-tertiary) text-(--color-text-muted) hover:text-(--color-text-primary) transition-colors cursor-pointer"
          title="Download JSON"
        >
          <Download size={12} /> {!hideText && "JSON"}
        </button>
      )}
    </span>
  );
}

function ActiveResultView({ result, onClose, onMaximizeToggle, isMaximized, containerWidth }) {
  if (!result) {
    return (
      <div className="flex items-center justify-center h-full text-(--color-text-muted) text-sm select-none">
        <Table size={16} className="mr-2 animate-pulse" />
        Run a query to see results
      </div>
    );
  }

  // Running state
  if (result.status === "running") {
    return (
      <div className="flex flex-col h-full bg-(--color-bg-secondary)">
        <div className="flex items-center justify-between border-b border-(--color-border) shrink-0 h-9 px-3 bg-(--color-bg-secondary) select-none">
          <div className="flex items-center h-full">
            <div className="flex items-center gap-1.5 px-3 border-r border-(--color-border) h-full">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-(--color-warning)">
                <Loader2 size={12} className="animate-spin" />
                Executing...
              </span>
            </div>
            {result.startTime && <LiveTimer startTime={result.startTime} />}
          </div>
          <div className="flex items-center gap-2 h-full">
            {onMaximizeToggle && (
              <button
                onClick={onMaximizeToggle}
                className="p-1 rounded hover:bg-(--color-bg-tertiary) text-(--color-text-secondary) transition-colors cursor-pointer"
                title={isMaximized ? "Restore Height" : "Maximize Panel"}
              >
                {isMaximized ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14h6v6M20 10h-6V4M14 10l7-7M10 14l-7 7"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                )}
              </button>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 rounded hover:bg-(--color-bg-tertiary) text-(--color-text-secondary) hover:text-red-500 transition-colors cursor-pointer"
                title="Close Panel (Ctrl+`)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            )}
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center text-(--color-warning) text-sm font-mono select-none">
          <Loader2 size={16} className="animate-spin mr-2" />
          Executing query...
        </div>
      </div>
    );
  }

  // Cancelled
  if (result.status === "cancelled") {
    return (
      <div className="flex flex-col h-full bg-(--color-bg-secondary)">
        <div className="flex items-center justify-between border-b border-(--color-border) shrink-0 h-9 px-3 bg-(--color-bg-secondary) select-none">
          <div className="flex items-center h-full">
            <div className="flex items-center gap-1.5 px-3 border-r border-(--color-border) h-full">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-(--color-text-muted)">
                <Ban size={12} />
                Cancelled
              </span>
            </div>
            <ElapsedBadge elapsed={result.elapsed} />
          </div>
          <div className="flex items-center gap-2 h-full">
            {onMaximizeToggle && (
              <button
                onClick={onMaximizeToggle}
                className="p-1 rounded hover:bg-(--color-bg-tertiary) text-(--color-text-secondary) transition-colors cursor-pointer"
                title={isMaximized ? "Restore Height" : "Maximize Panel"}
              >
                {isMaximized ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14h6v6M20 10h-6V4M14 10l7-7M10 14l-7 7"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                )}
              </button>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 rounded hover:bg-(--color-bg-tertiary) text-(--color-text-secondary) hover:text-red-500 transition-colors cursor-pointer"
                title="Close Panel (Ctrl+`)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            )}
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center text-(--color-text-muted) text-sm select-none">
          <Ban size={16} className="mr-2" />
          Query cancelled
        </div>
      </div>
    );
  }

  // Error
  if (result.status === "error") {
    return (
      <div className="flex flex-col h-full bg-(--color-bg-secondary)">
        <div className="flex items-center justify-between border-b border-(--color-border) shrink-0 h-9 px-3 bg-(--color-bg-secondary) select-none">
          <div className="flex items-center h-full">
            <div className="flex items-center gap-1.5 px-3 border-r border-(--color-border) h-full">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-(--color-error) whitespace-nowrap">
                <AlertCircle size={12} />
                Error
              </span>
            </div>
            <ElapsedBadge elapsed={result.elapsed} />
          </div>
          <div className="flex items-center gap-2 h-full">
            {containerWidth >= 380 && (
              <CopyButton getText={() => result.error} className="hover:bg-(--color-bg-tertiary) h-7" hideText={containerWidth < 480} />
            )}
            {(onMaximizeToggle || onClose) && <div className="h-4 w-px bg-(--color-border) mx-1" />}
            {onMaximizeToggle && (
              <button
                onClick={onMaximizeToggle}
                className="p-1 rounded hover:bg-(--color-bg-tertiary) text-(--color-text-secondary) transition-colors cursor-pointer"
                title={isMaximized ? "Restore Height" : "Maximize Panel"}
              >
                {isMaximized ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14h6v6M20 10h-6V4M14 10l7-7M10 14l-7 7"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                )}
              </button>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 rounded hover:bg-(--color-bg-tertiary) text-(--color-text-secondary) hover:text-red-500 transition-colors cursor-pointer"
                title="Close Panel (Ctrl+`)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <pre className="text-xs text-(--color-error)/85 whitespace-pre-wrap font-mono bg-(--color-error)/5 rounded-lg p-3 w-full">
            {result.error}
          </pre>
        </div>
      </div>
    );
  }

  // Success - parse result data
  if (result.status === "ok" && result.data) {
    const textData = result.data["text/plain"];
    const jsonData = result.data["application/json"];

    // Try to render as a table if we have structured JSON data
    if (jsonData) {
      return <JsonTable data={jsonData} elapsed={result.elapsed} onClose={onClose} onMaximizeToggle={onMaximizeToggle} isMaximized={isMaximized} activeWidth={containerWidth} />;
    }

    // Render text output
    if (textData) {
      return (
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between border-b border-(--color-border) shrink-0 h-9 bg-(--color-bg-secondary) select-none">
            <div className="flex items-center h-full">
              <div className="flex items-center gap-1.5 px-3 border-r border-(--color-border) h-full">
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-(--color-text-primary) border-b-2 border-(--color-accent) bg-(--color-bg-primary)/40 transition-colors h-full">
                  <FileText size={12} className="text-(--color-accent)" />
                  <span>Text Output</span>
                </button>
              </div>
              <div className="flex items-center gap-2 px-3 text-[11px] text-(--color-text-muted)">
                <ElapsedBadge elapsed={result.elapsed} />
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 h-full">
              {containerWidth >= 380 && (
                <>
                  <CopyButton getText={() => textData} className="hover:bg-(--color-bg-tertiary) h-7" hideText={containerWidth < 480} />
                  <DownloadButtons getCsv={() => textData} className="h-7" hideText={containerWidth < 480} />
                </>
              )}
              {(onMaximizeToggle || onClose) && <div className="h-4 w-px bg-(--color-border) mx-1" />}
              {onMaximizeToggle && (
                <button
                  onClick={onMaximizeToggle}
                  className="p-1 rounded hover:bg-(--color-bg-tertiary) text-(--color-text-secondary) transition-colors cursor-pointer"
                  title={isMaximized ? "Restore Height" : "Maximize Panel"}
                >
                  {isMaximized ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14h6v6M20 10h-6V4M14 10l7-7M10 14l-7 7"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                  )}
                </button>
              )}
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-1 rounded hover:bg-(--color-bg-tertiary) text-(--color-text-secondary) hover:text-red-500 transition-colors cursor-pointer"
                  title="Close Panel (Ctrl+`)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              )}
            </div>
          </div>
          <div className="grow overflow-auto p-4">
            <pre className="text-xs text-(--color-text-primary) whitespace-pre-wrap font-mono bg-(--color-bg-primary) rounded-lg p-3">
              {textData}
            </pre>
          </div>
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

export default function ResultTable({ onClose, onMaximizeToggle, isMaximized }) {
  const { activeFileResultsList, activeResultId, selectResult, deleteResult, renameResult, clearFileResults, createResultSession, activeTabId } = useSqlFiles();
  const activeViewRef = useRef(null);
  const [activeWidth, setActiveWidth] = useState(500);

  const [renamingItemId, setRenamingItemId] = useState(null);
  const [renameItemValue, setRenameItemValue] = useState("");

  const handleStartRenameItem = useCallback((e, item, defaultName) => {
    e.stopPropagation();
    setRenamingItemId(item.id);
    setRenameItemValue(item.customName || item.commentName || defaultName);
  }, []);

  const handleFinishRenameItem = useCallback((id) => {
    const trimmed = renameItemValue.trim();
    if (trimmed) {
      renameResult(activeTabId, id, trimmed);
    }
    setRenamingItemId(null);
  }, [renameItemValue, activeTabId, renameResult]);

  useEffect(() => {
    const el = activeViewRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setActiveWidth(entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const [historyVisible, setHistoryVisible] = useState(() => {
    try {
      const saved = localStorage.getItem("livy-result-history-visible");
      return saved !== null ? JSON.parse(saved) : true;
    } catch (e) {
      return true;
    }
  });

  const toggleHistory = useCallback(() => {
    setHistoryVisible(prev => {
      const next = !prev;
      try {
        localStorage.setItem("livy-result-history-visible", JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  }, []);

  const list = activeFileResultsList || [];
  const activeResult = list.find(r => r.id === activeResultId) || null;

  if (list.length === 0) {
    return (
      <div className="flex flex-col h-full bg-(--color-bg-secondary)">
        <div className="flex items-center justify-between border-b border-(--color-border) shrink-0 h-9 px-3 bg-(--color-bg-secondary) select-none">
          <div className="flex items-center h-full">
            <span className="text-xs font-semibold text-(--color-text-secondary)">No Results</span>
          </div>
          <div className="flex items-center gap-2 h-full">
            {onMaximizeToggle && (
              <button
                onClick={onMaximizeToggle}
                className="p-1 rounded hover:bg-(--color-bg-tertiary) text-(--color-text-secondary) transition-colors cursor-pointer"
                title={isMaximized ? "Restore Height" : "Maximize Panel"}
              >
                {isMaximized ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14h6v6M20 10h-6V4M14 10l7-7M10 14l-7 7"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                )}
              </button>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 rounded hover:bg-(--color-bg-tertiary) text-(--color-text-secondary) hover:text-red-500 transition-colors cursor-pointer"
                title="Close Panel (Ctrl+`)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            )}
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center text-(--color-text-muted) text-sm select-none">
          <Table size={16} className="mr-2 animate-pulse" />
          Run a query to see results
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-(--color-bg-secondary) overflow-hidden relative">
      {/* Left panel: Active result display */}
      <div ref={activeViewRef} className="flex-1 min-w-0 h-full overflow-hidden relative">
        {activeResult && activeResult.status !== "idle" ? (
          <ActiveResultView
            result={activeResult}
            onClose={onClose}
            onMaximizeToggle={onMaximizeToggle}
            isMaximized={isMaximized}
            containerWidth={activeWidth}
          />
        ) : (
          <div className="flex flex-col h-full bg-(--color-bg-secondary)">
            <div className="flex items-center justify-between border-b border-(--color-border) shrink-0 h-9 px-3 bg-(--color-bg-secondary) select-none">
              <div className="flex items-center h-full">
                <span className="text-xs font-semibold text-(--color-text-secondary)">
                  {activeResult ? "New Run Session" : "No Active Result"}
                </span>
              </div>
              <div className="flex items-center gap-2 h-full">
                {onMaximizeToggle && (
                  <button
                    onClick={onMaximizeToggle}
                    className="p-1 rounded hover:bg-(--color-bg-tertiary) text-(--color-text-secondary) transition-colors cursor-pointer"
                    title={isMaximized ? "Restore Height" : "Maximize Panel"}
                  >
                    {isMaximized ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14h6v6M20 10h-6V4M14 10l7-7M10 14l-7 7"/></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                    )}
                  </button>
                )}
                {onClose && (
                  <button
                    onClick={onClose}
                    className="p-1 rounded hover:bg-(--color-bg-tertiary) text-(--color-text-secondary) hover:text-red-500 transition-colors cursor-pointer"
                    title="Close Panel (Ctrl+`)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                )}
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center text-(--color-text-muted) text-sm select-none">
              <Table size={16} className="mr-2 animate-pulse" />
              {activeResult ? "Run a query in this session to see results" : "Select a query execution to view results"}
            </div>
          </div>
        )}
      </div>

      {/* Right panel: VS Code terminal style selector */}
      {historyVisible ? (
        <div className="w-[180px] shrink-0 border-l border-(--color-border) bg-(--color-bg-secondary) flex flex-col h-full overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-(--color-border) text-[10px] font-bold text-(--color-text-secondary) tracking-wider uppercase bg-(--color-bg-secondary) select-none h-9 shrink-0">
            <span>Run History</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => createResultSession(activeTabId)}
                className="p-1 rounded hover:bg-(--color-bg-tertiary) text-(--color-text-secondary) hover:text-(--color-text-primary) transition-colors cursor-pointer flex items-center justify-center"
                title="New run session"
              >
                <Plus size={12} />
              </button>
              <button
                onClick={() => clearFileResults(activeTabId)}
                className="p-1 rounded hover:bg-(--color-bg-tertiary) text-(--color-text-secondary) hover:text-red-500 transition-colors cursor-pointer flex items-center justify-center"
                title="Clear run history"
              >
                <Trash2 size={12} />
              </button>
              <button
                onClick={toggleHistory}
                className="p-1 rounded hover:bg-(--color-bg-tertiary) text-(--color-text-secondary) hover:text-red-500 transition-colors cursor-pointer flex items-center justify-center"
                title="Collapse run history"
              >
                <X size={12} />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto py-1">
            {list.map((item, idx) => {
              const isActive = item.id === activeResultId;
              const defaultName = `Run #${idx + 1}`;
              const commentName = item.commentName;
              const displayName = item.customName || commentName || item.sql || "Empty query";
              const isCustomOrComment = !!(item.customName || commentName);

              return (
                <div
                  key={item.id}
                  onClick={() => selectResult(activeTabId, item.id)}
                  className={`group flex items-center justify-between px-3 py-1.5 cursor-pointer text-xs select-none transition-colors border-l-2 ${
                    isActive
                      ? "bg-(--color-bg-tertiary) text-(--color-text-primary) border-(--color-accent)"
                      : "text-(--color-text-secondary) border-transparent hover:bg-(--color-bg-tertiary)/50 hover:text-(--color-text-primary)"
                  }`}
                  onDoubleClick={(e) => handleStartRenameItem(e, item, defaultName)}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {/* Status Icon */}
                    {item.status === "idle" && <Table size={12} className="text-(--color-text-muted) shrink-0" />}
                    {item.status === "running" && <Loader2 size={12} className="animate-spin text-(--color-warning) shrink-0" />}
                    {item.status === "ok" && <Check size={12} className="text-(--color-success) shrink-0" />}
                    {item.status === "error" && <AlertCircle size={12} className="text-(--color-error) shrink-0" />}
                    {item.status === "cancelled" && <Ban size={12} className="text-(--color-text-muted) shrink-0" />}

                    <div className="flex flex-col min-w-0 leading-tight flex-1">
                      <span className="font-semibold text-[9px] text-(--color-text-muted) flex items-center gap-1">
                        <span>{defaultName}</span>
                        <span>•</span>
                        <span>{item.timestamp}</span>
                      </span>
                      {renamingItemId === item.id ? (
                        <input
                          autoFocus
                          value={renameItemValue}
                          onChange={(e) => setRenameItemValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleFinishRenameItem(item.id);
                            if (e.key === "Escape") setRenamingItemId(null);
                          }}
                          onBlur={() => handleFinishRenameItem(item.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full bg-(--color-bg-primary) border border-(--color-accent) rounded px-1 py-0.5 text-[10.5px] text-(--color-text-primary) outline-none mt-0.5"
                        />
                      ) : (
                        <span
                          className={`truncate text-[10.5px] mt-0.5 ${
                            isCustomOrComment 
                              ? "font-sans font-medium text-(--color-text-primary)" 
                              : "font-mono text-(--color-text-secondary)"
                          }`}
                          title={item.sql || "Empty query"}
                        >
                          {displayName}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Delete button, visible on hover */}
                  {renamingItemId !== item.id && (
                    <div className="opacity-0 group-hover:opacity-100 flex items-center shrink-0 ml-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteResult(activeTabId, item.id);
                        }}
                        className="p-0.5 rounded hover:bg-(--color-bg-primary) text-(--color-text-secondary) hover:text-red-500 transition-all cursor-pointer flex items-center justify-center"
                        title="Remove from history"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <button
          onClick={toggleHistory}
          className="w-7 shrink-0 border-l border-(--color-border) bg-(--color-bg-secondary) hover:bg-(--color-bg-tertiary)/40 cursor-pointer flex flex-col items-center py-3 gap-2.5 transition-colors select-none group focus:outline-none"
          title="Show Run History"
        >
          <History size={12} className="text-(--color-text-muted) group-hover:text-(--color-text-primary) transition-colors" />
          <span 
            className="text-[9px] font-bold text-(--color-text-muted) group-hover:text-(--color-text-primary) tracking-widest uppercase select-none transition-colors"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            History
          </span>
        </button>
      )}
    </div>
  );
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

function ExplainPlan({ planText, elapsed, onClose, onMaximizeToggle, isMaximized, containerWidth }) {
  const lines = planText.split("\n");

  return (
    <div className="flex flex-col h-full bg-(--color-bg-secondary)">
      <div className="flex items-center justify-between border-b border-(--color-border) shrink-0 h-9 bg-(--color-bg-secondary) select-none">
        {/* Left cluster: Tabs and elapsed time */}
        <div className="flex items-center h-full">
          <div className="flex items-center gap-1.5 px-3 border-r border-(--color-border) h-full">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-(--color-text-primary) border-b-2 border-(--color-accent) bg-(--color-bg-primary)/40 transition-colors h-full">
              <FileText size={12} className="text-(--color-accent)" />
              <span>Plan</span>
            </button>
          </div>
          <div className="flex items-center gap-2 px-3 text-[11px] text-(--color-text-muted)">
            <ElapsedBadge elapsed={elapsed} />
          </div>
        </div>

        {/* Right cluster: actions and resize controls */}
        <div className="flex items-center gap-2 px-3 h-full">
          {containerWidth >= 380 && (
            <>
              <CopyButton getText={() => planText} className="hover:bg-(--color-bg-tertiary) h-7" hideText={containerWidth < 480} />
              <DownloadButtons getCsv={() => planText} className="h-7" hideText={containerWidth < 480} />
            </>
          )}
          {(onMaximizeToggle || onClose) && <div className="h-4 w-px bg-(--color-border) mx-1" />}
          {onMaximizeToggle && (
            <button
              onClick={onMaximizeToggle}
              className="p-1 rounded hover:bg-(--color-bg-tertiary) text-(--color-text-secondary) transition-colors cursor-pointer"
              title={isMaximized ? "Restore Height" : "Maximize Panel"}
            >
              {isMaximized ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14h6v6M20 10h-6V4M14 10l7-7M10 14l-7 7"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
              )}
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-(--color-bg-tertiary) text-(--color-text-secondary) hover:text-red-500 transition-colors cursor-pointer"
              title="Close Panel (Ctrl+`)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          )}
        </div>
      </div>
      <div className="grow overflow-auto p-4">
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

function estimateInitialColumnWidths(data) {
  if (!data || !data.schema || !data.schema.fields) return {};
  const fields = data.schema.fields || [];
  const rows = data.data || [];
  
  const initialWidths = {};
  fields.forEach((field, i) => {
    const name = String(field.name || field);
    // Estimate width based on header text (approx 8px per char + padding for icons/borders)
    let maxLen = name.length * 8 + 65;
    
    // Sample first 15 rows of data for this field
    const sampleRows = rows.slice(0, 15);
    sampleRows.forEach((row) => {
      const val = row[field.name || field] !== undefined
        ? String(row[field.name || field])
        : Array.isArray(row)
          ? String(row[i] ?? "")
          : "";
      const len = val.length * 7 + 28;
      if (len > maxLen) {
        maxLen = len;
      }
    });
    
    // Constrain width to reasonable pixel ranges
    initialWidths[i] = Math.min(350, Math.max(120, maxLen));
  });
  return initialWidths;
}

function JsonTable({ data, elapsed, onClose, onMaximizeToggle, isMaximized, activeWidth = 500 }) {
  const headerScrollRef = useRef(null);
  const scrollRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewHeight, setViewHeight] = useState(400);
  const [colWidths, setColWidths] = useState(() => estimateInitialColumnWidths(data));

  useEffect(() => {
    setColWidths(estimateInitialColumnWidths(data));
  }, [data]);
  const resizingRef = useRef(null);
  const [columnFilters, setColumnFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const debouncedFilters = useDebounce(columnFilters, 300);

  // Sorting state variables
  const [sortColIndex, setSortColIndex] = useState(null);
  const [sortDirection, setSortDirection] = useState(null); // 'asc' | 'desc' | null

  // Dropdown visualization menu state variables
  const [viewDropdownOpen, setViewDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setViewDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    if (headerScrollRef.current) {
      headerScrollRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  }, []);

  if (isExplainResult(data)) {
    const planText = Array.isArray(data.data[0]) ? data.data[0][0] : data.data[0].plan;
    return <ExplainPlan planText={planText} elapsed={elapsed} onClose={onClose} onMaximizeToggle={onMaximizeToggle} isMaximized={isMaximized} containerWidth={activeWidth} />;
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

  const schemaContext = useSchema();
  const schemaColumns = schemaContext?.columns || {};

  const inferredTypes = useMemo(() => {
    return fields.map((field, i) => inferColumnType(field, rows, i, schemaColumns));
  }, [fields, rows, schemaColumns]);

  const totalTableWidth = useMemo(() => {
    let sum = 48; // locked index column #
    fields.forEach((_, i) => {
      sum += colWidths[i] || 150;
    });
    return sum;
  }, [fields, colWidths]);
  
  // Custom sorting and filtering logic
  const filteredRows = useMemo(() => {
    const activeFilters = Object.entries(debouncedFilters).filter(([_, value]) => value.trim() !== '');
    let result = rows;
    if (activeFilters.length > 0) {
      result = rows.filter(row => {
        return activeFilters.every(([colIndex, filterValue]) => {
          const field = fields[parseInt(colIndex)];
          const cellValue = row[field.name || field] !== undefined 
            ? String(row[field.name || field]) 
            : Array.isArray(row) ? String(row[parseInt(colIndex)] ?? '') : '';
          
          try {
            const regex = new RegExp(filterValue, 'i');
            return regex.test(cellValue);
          } catch (e) {
            return cellValue.toLowerCase().includes(filterValue.toLowerCase());
          }
        });
      });
    }

    if (sortColIndex !== null && sortDirection) {
      const field = fields[sortColIndex];
      const fieldName = field.name || field;
      const isAsc = sortDirection === 'asc';

      result = [...result].sort((a, b) => {
        let valA = a[fieldName] !== undefined ? a[fieldName] : Array.isArray(a) ? a[sortColIndex] : undefined;
        let valB = b[fieldName] !== undefined ? b[fieldName] : Array.isArray(b) ? b[sortColIndex] : undefined;

        if (valA === undefined || valA === null) return isAsc ? 1 : -1;
        if (valB === undefined || valB === null) return isAsc ? -1 : 1;

        // Try numeric comparison
        const numA = Number(valA);
        const numB = Number(valB);
        if (!isNaN(numA) && !isNaN(numB)) {
          return isAsc ? numA - numB : numB - numA;
        }

        // String locale comparison
        const strA = String(valA);
        const strB = String(valB);
        return isAsc ? strA.localeCompare(strB) : strB.localeCompare(strA);
      });
    }

    return result;
  }, [rows, debouncedFilters, fields, sortColIndex, sortDirection]);
  
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

  const handleSort = (colIndex) => {
    if (sortColIndex === colIndex) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortColIndex(null);
        setSortDirection(null);
      }
    } else {
      setSortColIndex(colIndex);
      setSortDirection('asc');
    }
  };

  const autoFitColumn = useCallback((colIndex) => {
    const field = fields[colIndex];
    const fieldName = field.name || field;
    const name = String(fieldName);
    
    // Estimate width based on header text (approx 8px per char + padding/icons/sort arrow)
    let maxLen = name.length * 8 + 65;
    
    // Sample rows in filtered dataset to find max contents (cap at 1000 rows for instant performance)
    const scanLimit = Math.min(filteredRows.length, 1000);
    for (let ri = 0; ri < scanLimit; ri++) {
      const row = filteredRows[ri];
      const val = row[fieldName] !== undefined
        ? String(row[fieldName])
        : Array.isArray(row)
          ? String(row[colIndex] ?? "")
          : "";
      // Approx 7px per character + 28px padding
      const len = val.length * 7 + 28;
      if (len > maxLen) {
        maxLen = len;
      }
    }
    
    // Constrain width to reasonable pixel ranges: min 80, max 500
    const finalWidth = Math.min(500, Math.max(80, maxLen));
    setColWidths((prev) => ({ ...prev, [colIndex]: finalWidth }));
  }, [fields, filteredRows]);

  return (
    <div className="flex flex-col h-full bg-(--color-bg-secondary)">
      {/* Databricks Premium Tabs & Controls Bar */}
      <div className="flex items-center justify-between border-b border-(--color-border) shrink-0 h-9 bg-(--color-bg-secondary) select-none">
        {/* Left cluster: Tabs and row count */}
        <div className="flex items-center h-full relative" ref={dropdownRef}>
          <div className="flex items-center gap-1.5 px-3 border-r border-(--color-border) h-full">
            <button 
              onClick={() => setViewDropdownOpen(!viewDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-(--color-text-primary) border-b-2 border-(--color-accent) bg-(--color-bg-primary)/40 hover:bg-(--color-bg-primary)/60 transition-colors h-full cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 16 16" aria-hidden="true" focusable="false" className="text-(--color-accent)"><path fill="currentColor" fill-rule="evenodd" d="M1 1.75A.75.75 0 0 1 1.75 1h12.5a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75H1.75a.75.75 0 0 1-.75-.75zm1.5.75v2.5h11V2.5zm0 4v2.5h11V6.5zm0 4v3h11v-3z" clipRule="evenodd"></path></svg>
              {activeWidth >= 380 && <span>Table</span>}
              <ChevronDown size={10} className={`text-(--color-text-muted) transition-transform duration-200 ${viewDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {viewDropdownOpen && (
            <div className="absolute left-3 top-9 z-50 bg-(--color-bg-secondary) border border-(--color-border) rounded-lg shadow-xl py-1 min-w-45 animate-in fade-in zoom-in-95 duration-100">
              <button 
                onClick={() => setViewDropdownOpen(false)}
                className="flex items-center justify-between w-full text-left px-3 py-2 text-xs text-(--color-text-primary) hover:bg-(--color-bg-tertiary) transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 16 16" aria-hidden="true" focusable="false" className="text-(--color-accent)"><path fill="currentColor" fill-rule="evenodd" d="M1 1.75A.75.75 0 0 1 1.75 1h12.5a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75H1.75a.75.75 0 0 1-.75-.75zm1.5.75v2.5h11V2.5zm0 4v2.5h11V6.5zm0 4v3h11v-3z" clipRule="evenodd"></path></svg>
                  <span>Table View</span>
                </div>
                <Check size={12} className="text-(--color-accent)" />
              </button>
              
              <div className="h-px bg-(--color-border) my-1" />
              
              <div className="px-3 py-1.5 text-[10px] font-semibold text-(--color-text-muted) uppercase tracking-wider">
                Visualizations
              </div>

              <button 
                disabled 
                className="flex items-center justify-between w-full text-left px-3 py-2 text-xs text-(--color-text-muted) hover:bg-(--color-bg-tertiary)/30 transition-colors cursor-not-allowed opacity-60"
              >
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-(--color-text-muted)"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                  <span>Bar Chart</span>
                </div>
                <span className="text-[9px] bg-(--color-bg-primary) border border-(--color-border) px-1 rounded-sm text-(--color-text-muted)">Soon</span>
              </button>

              <button 
                disabled 
                className="flex items-center justify-between w-full text-left px-3 py-2 text-xs text-(--color-text-muted) hover:bg-(--color-bg-tertiary)/30 transition-colors cursor-not-allowed opacity-60"
              >
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-(--color-text-muted)"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
                  <span>Line Chart</span>
                </div>
                <span className="text-[9px] bg-(--color-bg-primary) border border-(--color-border) px-1 rounded-sm text-(--color-text-muted)">Soon</span>
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 px-3 text-[11px] text-(--color-text-secondary) font-medium whitespace-nowrap truncate min-w-0">
            <CheckCircle2 size={12} className="text-(--color-success) shrink-0" />
            {hasActiveFilters ? (
              <div className="flex items-center gap-1.5 whitespace-nowrap shrink-0">
                <span>
                  {filteredCount}/{totalRows} rows
                  {activeWidth >= 460 && ` · ${fields.length} cols`}
                </span>
                <button
                  onClick={clearAllFilters}
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-(--color-bg-tertiary) hover:bg-(--color-bg-primary) text-(--color-text-muted) hover:text-(--color-text-primary) transition-colors cursor-pointer shrink-0"
                  title="Clear all filters"
                >
                  <FilterX size={9} />
                  {activeWidth >= 420 && <span>Clear</span>}
                </button>
              </div>
            ) : (
              <span className="whitespace-nowrap shrink-0">
                {totalRows} rows
                {activeWidth >= 460 && ` · ${fields.length} cols`}
              </span>
            )}
            <ElapsedBadge elapsed={elapsed} />
          </div>
        </div>

        {/* Right cluster: Search/Filter and Download actions */}
        <div className="flex items-center gap-2 px-3 h-full">
          {/* Search filter button */}
          {activeWidth >= 380 && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                showFilters
                  ? 'bg-(--color-accent) text-white'
                  : 'hover:bg-(--color-bg-tertiary) text-(--color-text-secondary) hover:text-(--color-text-primary)'
              }`}
              title={showFilters ? "Hide column filters" : "Show column filters"}
            >
              <Search size={13} />
            </button>
          )}

          {activeWidth >= 380 && (() => {
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
                  const raw = row[f.name || f] !== undefined ? row[f.name || f] : Array.isArray(row) ? (row[ci] ?? "") : "";
                  const formatted = formatCellValue(raw, inferredTypes[ci]).text;
                  return csvEscape(formatted);
                }).join(",")
              ).join("\n");
              return header + "\n" + body;
            };
            const buildJson = () => {
              return JSON.stringify(filteredRows.map((row) => {
                const obj = {};
                fields.forEach((f, ci) => {
                  const name = f.name || f;
                  const raw = row[name] !== undefined ? row[name] : Array.isArray(row) ? (row[ci] ?? "") : "";
                  obj[name] = formatCellValue(raw, inferredTypes[ci]).text;
                });
                return obj;
              }), null, 2);
            };
            return (
              <>
                <CopyButton getText={buildCsv} className="hover:bg-(--color-bg-tertiary) h-7" hideText={activeWidth < 520} />
                <DownloadButtons getCsv={buildCsv} getJson={buildJson} className="h-7" hideText={activeWidth < 520} />
              </>
            );
          })()}

          {/* Panel Layout Controls */}
          {(onMaximizeToggle || onClose) && <div className="h-4 w-px bg-(--color-border) mx-1" />}

          {onMaximizeToggle && (
            <button
              onClick={onMaximizeToggle}
              className="p-1.5 rounded hover:bg-(--color-bg-tertiary) text-(--color-text-secondary) hover:text-(--color-text-primary) transition-colors cursor-pointer"
              title={isMaximized ? "Restore Height" : "Maximize Panel"}
            >
              {isMaximized ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14h6v6M20 10h-6V4M14 10l7-7M10 14l-7 7"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
              )}
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded hover:bg-(--color-bg-tertiary) text-(--color-text-secondary) hover:text-red-500 transition-colors cursor-pointer"
              title="Close Panel (Ctrl+`)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          )}
        </div>
      </div>

      {/* Table Header Wrapper (Scrolls horizontally, hidden scrollbars) */}
      <div 
        ref={headerScrollRef} 
        className="overflow-x-hidden overflow-y-hidden shrink-0 bg-(--color-bg-tertiary) border-b border-(--color-border)"
        style={{ width: "100%" }}
      >
        <table className="text-xs" style={{ tableLayout: "fixed", width: totalTableWidth }}>
          <colgroup>
            <col style={{ width: 48 }} />
            {fields.map((_, i) => (
              <col key={i} style={{ width: colWidths[i] || 150 }} />
            ))}
          </colgroup>
          <thead>
            <tr className="bg-(--color-bg-tertiary) select-none">
              <th className="px-2 py-1.5 text-center border-r border-(--color-border) text-(--color-text-muted) font-semibold select-none w-12 min-w-12 shadow-[2px_0_5px_rgba(0,0,0,0.04)] dg-sticky-index-header">
                #
              </th>
              {fields.map((field, i) => {
                const name = field.name || field;
                const rawType = field.type
                  ? typeof field.type === "string"
                    ? field.type
                    : field.type.type || JSON.stringify(field.type)
                  : null;
                const inferredType = inferredTypes[i] || rawType || "string";
                const typeIcon = getDataTypeIcon(inferredType);
                
                const isSorted = sortColIndex === i;
                const sortIcon = isSorted ? (
                  sortDirection === 'asc' ? (
                    <svg className="text-(--color-accent)" xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
                  ) : (
                    <svg className="text-(--color-accent)" xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
                  )
                ) : (
                  <svg className="text-(--color-text-muted) opacity-0 group-hover/th:opacity-60 transition-opacity" xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 9-3-3-3 3M9 15l3 3 3-3"/></svg>
                );

                return (
                  <th
                    key={i}
                    className="px-2 py-1.5 text-left border-r border-(--color-border)/35 relative group/th cursor-pointer hover:bg-(--color-bg-primary)/25"
                    onClick={(e) => {
                      if (e.target.closest('.dg--header-resizeHandle') || e.target.closest('input')) return;
                      handleSort(i);
                    }}
                  >
                    <div className="flex items-center gap-1.5 mb-1 justify-between">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="text-(--color-text-secondary) font-semibold text-xs whitespace-nowrap">{name}</span>
                        {typeIcon && (
                          <span 
                            className="inline-flex items-center justify-center w-4.5 h-4.5 text-[11px] rounded bg-(--color-bg-primary) border border-(--color-border) text-(--color-text-muted) shrink-0 select-none hover:bg-(--color-bg-secondary) hover:text-(--color-text-secondary) transition-colors"
                            title={`${inferredType.toUpperCase()} · ${name}`}
                          >
                            {typeIcon}
                          </span>
                        )}
                      </div>
                      <span className="mr-1.5 shrink-0">{sortIcon}</span>
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
                            className="absolute right-1 p-1 sm:p-0.5 rounded hover:bg-(--color-bg-tertiary) text-(--color-text-muted) hover:text-(--color-text-primary) touch-manipulation cursor-pointer"
                            title="Clear filter"
                          >
                            <X size={9} />
                          </button>
                        )}
                      </div>
                    )}
                    <div
                      className="absolute -right-1.5 top-0 bottom-0 w-3 cursor-col-resize opacity-0 group-hover/th:opacity-100 hover:bg-(--color-accent)/40 transition-opacity dg--header-resizeHandle z-30"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const startX = e.clientX;
                        const th = e.currentTarget.parentElement;
                        const startWidth = th.offsetWidth;
                        resizingRef.current = i;
                        
                        // Prevent selection and set cursor globally during drag
                        document.body.style.cursor = 'col-resize';
                        document.body.style.userSelect = 'none';
                        
                        const onMove = (me) => {
                          const delta = me.clientX - startX;
                          const newWidth = Math.max(60, startWidth + delta);
                          setColWidths((prev) => ({ ...prev, [i]: newWidth }));
                        };
                        const onUp = () => {
                          resizingRef.current = null;
                          document.body.style.cursor = '';
                          document.body.style.userSelect = '';
                          document.removeEventListener("mousemove", onMove);
                          document.removeEventListener("mouseup", onUp);
                        };
                        document.addEventListener("mousemove", onMove);
                        document.addEventListener("mouseup", onUp);
                      }}
                      onDoubleClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        autoFitColumn(i);
                      }}
                    />
                  </th>
                );
              })}
            </tr>
          </thead>
        </table>
      </div>

      {/* Table Body Container (Scrollable) */}
      <div className="flex-1 overflow-auto" ref={scrollRef} onScroll={handleScroll}>
        <table className="text-xs" style={{ tableLayout: "fixed", width: totalTableWidth }}>
          <colgroup>
            {/* Locked index column col width */}
            <col style={{ width: 48 }} />
            {fields.map((_, i) => (
              <col key={i} style={{ width: colWidths[i] || 150 }} />
            ))}
          </colgroup>
          <tbody>
            {topPad > 0 && (
              <tr><td colSpan={fields.length + 1} style={{ height: topPad, padding: 0, border: "none" }} /></tr>
            )}
            {filteredRows.slice(startIdx, endIdx).map((row, i) => (
              <tr
                key={startIdx + i}
                className="border-b border-(--color-border)/50 hover:bg-(--color-bg-tertiary)/30 group/tr"
                style={{ height: ROW_HEIGHT }}
              >
                {/* Sticky row index body cell */}
                <td className="px-2 py-1.5 text-center border-r border-(--color-border)/50 text-(--color-text-muted) font-mono w-12 min-w-12 select-none shadow-[2px_0_5px_rgba(0,0,0,0.04)] transition-colors dg-sticky-index-cell">
                  {startIdx + i + 1}
                </td>
                {fields.map((field, ci) => {
                  const rawVal = row[field.name || field] !== undefined
                    ? row[field.name || field]
                    : Array.isArray(row)
                      ? row[ci]
                      : null;
                  
                  const { text: cellValue, isNull } = formatCellValue(rawVal, inferredTypes[ci]);
                  const filterValue = columnFilters[ci];
                  let cellContent = cellValue;
                  
                  if (isNull) {
                    cellContent = (
                      <span className="text-(--color-text-muted)/40 italic font-sans text-[11px] select-none">
                        NULL
                      </span>
                    );
                  } else if (filterValue && filterValue.trim() !== '') {
                    try {
                      const regex = new RegExp(`(${filterValue})`, 'gi');
                      const parts = cellValue.split(regex);
                      cellContent = parts.map((part, idx) => {
                        if (regex.test(part)) {
                          return <mark key={idx} className="bg-(--color-warning)/30 text-(--color-text-primary) rounded px-0.5">{part}</mark>;
                        }
                        return part;
                      });
                    } catch (e) {
                      // Invalid regex, fall back to simple string highlighting
                      const lowerCell = cellValue.toLowerCase();
                      const lowerFilter = filterValue.toLowerCase();
                      const idx = lowerCell.indexOf(lowerFilter);
                      if (idx !== -1) {
                        cellContent = (
                          <>
                            {cellValue.substring(0, idx)}
                            <mark className="bg-(--color-warning)/30 text-(--color-text-primary) rounded px-0.5">
                              {cellValue.substring(idx, idx + filterValue.length)}
                            </mark>
                            {cellValue.substring(idx + filterValue.length)}
                          </>
                        );
                      }
                    }
                  }
                  
                  return (
                    <td
                      key={ci}
                      className="px-3 py-1.5 text-(--color-text-primary) truncate font-mono border-r border-(--color-border)/35"
                      title={isNull ? "NULL" : rawVal !== cellValue ? `${cellValue} (raw: ${rawVal})` : cellValue}
                    >
                      {cellContent}
                    </td>
                  );
                })}
              </tr>
            ))}
            {bottomPad > 0 && (
              <tr><td colSpan={fields.length + 1} style={{ height: bottomPad, padding: 0, border: "none" }} /></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
