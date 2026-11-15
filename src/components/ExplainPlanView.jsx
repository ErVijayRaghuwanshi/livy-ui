import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import {
  FileText,
  Copy,
  Check,
  Download,
  Search,
  ChevronDown,
  ChevronRight,
  Clock,
  CheckCircle2,
  Table as TableIcon,
  Workflow,
  Database,
  GitMerge,
  Calculator,
  ArrowUpCircle,
  ArrowLeftRight,
  ArrowUpDown,
  Filter,
  Layers,
  WrapText,
  AlignLeft,
  ChevronsUpDown,
  Info,
  X,
  ChevronUp,
  Cpu,
  FolderTree,
  Sparkles
} from "lucide-react";

/**
 * Checks if query data represents an Explain execution plan.
 */
export function isExplainResult(data, sql) {
  if (!data || !data.schema || !data.data) return false;
  const fields = data.schema.fields || [];
  if (fields.length !== 1) return false;

  const field = fields[0];
  const fieldName = String(field.name || field || "").trim();

  // 1. Column name check (e.g. "Explain String(Nereids Planner)", "Explain String", "plan", "EXPLAIN")
  if (/^explain\b/i.test(fieldName) || /^plan$/i.test(fieldName) || /query[-_ ]?plan/i.test(fieldName)) {
    return true;
  }

  // 2. Executed SQL starts with EXPLAIN
  if (sql && /^\s*explain\b/i.test(sql.trim())) {
    return true;
  }

  // 3. Content sniff check on first row
  const firstRow = data.data[0];
  const firstText = Array.isArray(firstRow)
    ? String(firstRow[0] || "")
    : typeof firstRow === "object" && firstRow !== null
    ? String(firstRow[fieldName] ?? Object.values(firstRow)[0] ?? "")
    : String(firstRow || "");

  if (
    /PLAN\s+FRAGMENT/i.test(firstText) ||
    /==\s*(Physical|Parsed|Analyzed|Optimized)\s+Plan\s*==/i.test(firstText) ||
    /AdaptiveSparkPlan/i.test(firstText) ||
    /PhysicalResultSink/i.test(firstText) ||
    /VOlapScanNode/i.test(firstText)
  ) {
    return true;
  }

  return false;
}

/**
 * Normalizes multi-row or single-row explain plan data into a single string.
 */
export function extractPlanText(data) {
  if (!data || !data.data || !Array.isArray(data.data)) return "";
  const fields = data.schema?.fields || [];
  const fieldName = fields[0]?.name || fields[0];

  return data.data
    .map((row) => {
      if (Array.isArray(row)) {
        return row[0] ?? "";
      }
      if (typeof row === "object" && row !== null) {
        if (fieldName && row[fieldName] !== undefined) {
          return row[fieldName] ?? "";
        }
        return Object.values(row)[0] ?? "";
      }
      return String(row ?? "");
    })
    .join("\n");
}

/**
 * Detects the query planner type from the schema field name and plan text.
 */
export function detectPlannerInfo(data, planText = "") {
  const fields = data?.schema?.fields || [];
  const colName = String(fields[0]?.name || fields[0] || "");

  let plannerName = "Execution Plan";
  let engine = "Doris";

  if (/Nereids/i.test(colName) || /Nereids/i.test(planText)) {
    plannerName = "Doris Nereids Planner";
    engine = "Doris";
  } else if (/Legacy/i.test(colName) || (/PLAN FRAGMENT/i.test(planText) && !/Nereids/i.test(colName))) {
    plannerName = "Doris Legacy Planner";
    engine = "Doris";
  } else if (/== Physical Plan ==/i.test(planText) || /AdaptiveSparkPlan/i.test(planText)) {
    plannerName = "Spark Catalyst Planner";
    engine = "Spark";
  } else if (/PLAN FRAGMENT/i.test(planText)) {
    plannerName = "Doris Execution Plan";
    engine = "Doris";
  }

  // Count fragments
  const fragmentMatches = planText.match(/PLAN FRAGMENT \d+/gi);
  const fragmentCount = fragmentMatches ? fragmentMatches.length : null;

  // Count operators
  const scanMatches = planText.match(/(?:VOlapScanNode|PhysicalOlapScan|FileScan|BatchScan|InMemoryTableScan)/gi);
  const joinMatches = planText.match(/(?:VHashJoinNode|PhysicalHashJoin|BroadcastHashJoin|SortMergeJoin|CrossJoin)/gi);
  const aggMatches = planText.match(/(?:VAGGREGATE|PhysicalHashAggregate|HashAggregate|SortAggregate)/gi);

  const lines = planText.split("\n");

  return {
    plannerName,
    engine,
    fragmentCount,
    scanCount: scanMatches ? scanMatches.length : 0,
    joinCount: joinMatches ? joinMatches.length : 0,
    aggCount: aggMatches ? aggMatches.length : 0,
    lineCount: lines.length,
  };
}

/**
 * Operator definitions for syntax highlighting and categorization
 */
const SCAN_OPS = [
  "VOlapScanNode", "OlapScanNode", "PhysicalOlapScan", "EsScanNode", "SchemaScanNode",
  "FileScan", "BatchScan", "Scan", "InMemoryTableScan", "HiveTableScan"
];

const JOIN_OPS = [
  "VHashJoinNode", "HashJoinNode", "PhysicalHashJoin", "BroadcastHashJoin",
  "SortMergeJoin", "ShuffledHashJoin", "CrossJoinNode", "CrossJoin",
  "NestedLoopJoinNode", "NestedLoopJoin", "PhysicalNestedLoopJoin"
];

const AGG_OPS = [
  "VAGGREGATE", "PhysicalHashAggregate", "HashAggregate", "SortAggregate",
  "ObjectHashAggregate", "Aggregate"
];

const SINK_OPS = [
  "VRESULT SINK", "RESULT SINK", "PhysicalResultSink", "DATA STREAM SINK",
  "STREAM DATA SINK", "OLAP TABLE SINK", "TableSink"
];

const EXCHANGE_OPS = [
  "VExchangeNode", "ExchangeNode", "PhysicalDistribute", "BroadcastExchange",
  "Exchange", "ReusedExchange", "STREAM EXCHANGE"
];

const SORT_OPS = [
  "VSortNode", "SortNode", "PhysicalQuickSort", "PhysicalTopN",
  "CollectLimit", "TakeOrderedAndProject", "Sort", "Limit"
];

const FILTER_PROJECT_OPS = [
  "VProjectNode", "ProjectNode", "PhysicalProject",
  "VFilterNode", "FilterNode", "PhysicalFilter", "Filter", "Project"
];

const OTHER_OPS = [
  "AdaptiveSparkPlan", "SubqueryBroadcast", "Window", "Expand",
  "Generate", "InMemoryRelation", "Union", "PhysicalUnion", "VUnionNode"
];

const ALL_OPS = [
  ...SCAN_OPS, ...JOIN_OPS, ...AGG_OPS, ...SINK_OPS,
  ...EXCHANGE_OPS, ...SORT_OPS, ...FILTER_PROJECT_OPS, ...OTHER_OPS
];

const OP_REGEX = new RegExp(`\\b(${ALL_OPS.join("|")})\\b`, "g");

const KEYWORDS = [
  "OUTPUT EXPRS:", "PARTITION:", "PREDICATES:", "TABLE:", "HAS_COLO_PLAN_NODE:",
  "EXCHANGE ID:", "dest dims:", "tuple ids:", "partitions=", "cardinality=",
  "avgRowSize=", "numNodes=", "cost=", "cpu=", "memory=", "network=",
  "UNPARTITIONED", "HASH_PARTITIONED", "RANDOM", "BROADCAST", "STREAM DATA SINK"
];

const KEYWORD_REGEX = new RegExp(`(${KEYWORDS.map(k => k.replace(/[:=]/g, "\\$&")).join("|")})`, "gi");

/**
 * Formats time
 */
function formatElapsed(ms) {
  if (ms == null) return null;
  if (ms < 1000) return `${Math.round(ms)}ms`;
  const secs = ms / 1000;
  if (secs < 60) return `${secs.toFixed(2)}s`;
  const mins = Math.floor(secs / 60);
  const remSecs = (secs % 60).toFixed(1);
  return `${mins}m ${remSecs}s`;
}

/**
 * Parses fragments and execution tree from plan text for Visual Graph view
 */
function parsePlanGraph(planText) {
  const lines = planText.split("\n");
  const fragments = [];
  let currentFrag = null;
  let currentNode = null;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();
    if (!line) continue;

    // Check Fragment Header
    const fragMatch = line.match(/^PLAN FRAGMENT (\d+)(?:\((.*?)\))?/i);
    if (fragMatch) {
      currentFrag = {
        id: fragMatch[1],
        alias: fragMatch[2] || `F${fragMatch[1].padStart(2, "0")}`,
        title: line,
        partition: "UNPARTITIONED",
        sink: null,
        nodes: [],
        lines: [rawLine],
      };
      fragments.push(currentFrag);
      currentNode = null;
      continue;
    }

    if (currentFrag) {
      currentFrag.lines.push(rawLine);

      // Fragment partition info
      const partMatch = line.match(/PARTITION:\s*(.*)/i);
      if (partMatch) {
        currentFrag.partition = partMatch[1].trim();
      }

      // Fragment sink
      const sinkMatch = line.match(/^(VRESULT SINK|RESULT SINK|DATA STREAM SINK|STREAM DATA SINK|OLAP TABLE SINK|PhysicalResultSink)/i);
      if (sinkMatch && !currentFrag.sink) {
        currentFrag.sink = {
          name: sinkMatch[1].trim(),
          isResult: /RESULT/i.test(sinkMatch[1]),
        };
      }

      // Node match: "0:VOlapScanNode(249)" or "1:VExchangeNode" or "PhysicalOlapScan[cdr]"
      const nodeMatch = line.match(/^\s*(?:[|+-]*\s*)?(\d+):([A-Za-z0-9_]+)(?:\((\d+)\))?/);
      if (nodeMatch) {
        currentNode = {
          id: nodeMatch[1],
          type: nodeMatch[2],
          internalId: nodeMatch[3],
          table: null,
          predicates: null,
          cardinality: null,
          rawLines: [line],
        };
        currentFrag.nodes.push(currentNode);
        continue;
      }

      // Spark / Nereids node match
      const sparkNodeMatch = line.match(/^[+-]+\s*([A-Za-z0-9_]+)\s*(.*)/);
      if (sparkNodeMatch && !currentFrag.nodes.some(n => n.rawLines[0] === line)) {
        currentNode = {
          id: String(currentFrag.nodes.length),
          type: sparkNodeMatch[1],
          table: null,
          predicates: sparkNodeMatch[2] || null,
          cardinality: null,
          rawLines: [line],
        };
        currentFrag.nodes.push(currentNode);
        continue;
      }

      // Attributes under current node
      if (currentNode) {
        currentNode.rawLines.push(line);
        const tableMatch = line.match(/^TABLE:\s*(.*?)(?:,|$)/i);
        if (tableMatch) currentNode.table = tableMatch[1].trim();
        const cardMatch = line.match(/cardinality=(\d+)/i);
        if (cardMatch) currentNode.cardinality = cardMatch[1];
        const predMatch = line.match(/^PREDICATES:\s*(.*)/i);
        if (predMatch) currentNode.predicates = predMatch[1].trim();
      }
    }
  }

  // Fallback for single-stage plans without explicit PLAN FRAGMENT
  if (fragments.length === 0 && lines.length > 0) {
    const defaultFrag = {
      id: "0",
      alias: "F00",
      title: "Execution Plan",
      partition: "UNPARTITIONED",
      sink: { name: "Result Output", isResult: true },
      nodes: [],
      lines: lines,
    };

    lines.forEach((l, idx) => {
      const trimmed = l.trim();
      ALL_OPS.forEach((op) => {
        if (trimmed.includes(op)) {
          defaultFrag.nodes.push({
            id: String(idx),
            type: op,
            rawLines: [trimmed],
          });
        }
      });
    });

    if (defaultFrag.nodes.length > 0) {
      fragments.push(defaultFrag);
    }
  }

  return fragments;
}

/**
 * Returns icon and color theme for a plan operator
 */
function getOperatorVisual(opName = "") {
  const lower = opName.toLowerCase();

  if (lower.includes("scan")) {
    return {
      icon: Database,
      badgeBg: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
      category: "Scan",
      color: "text-emerald-400",
      cardBorder: "border-emerald-500/30 hover:border-emerald-400",
    };
  }
  if (lower.includes("join")) {
    return {
      icon: GitMerge,
      badgeBg: "bg-purple-500/15 text-purple-400 border-purple-500/30",
      category: "Join",
      color: "text-purple-400",
      cardBorder: "border-purple-500/30 hover:border-purple-400",
    };
  }
  if (lower.includes("aggregate") || lower.includes("agg")) {
    return {
      icon: Calculator,
      badgeBg: "bg-blue-500/15 text-blue-400 border-blue-500/30",
      category: "Aggregate",
      color: "text-blue-400",
      cardBorder: "border-blue-500/30 hover:border-blue-400",
    };
  }
  if (lower.includes("sink")) {
    return {
      icon: ArrowUpCircle,
      badgeBg: "bg-amber-500/15 text-amber-400 border-amber-500/30",
      category: "Sink",
      color: "text-amber-400",
      cardBorder: "border-amber-500/30 hover:border-amber-400",
    };
  }
  if (lower.includes("exchange") || lower.includes("distribute")) {
    return {
      icon: ArrowLeftRight,
      badgeBg: "bg-rose-500/15 text-rose-400 border-rose-500/30",
      category: "Exchange",
      color: "text-rose-400",
      cardBorder: "border-rose-500/30 hover:border-rose-400",
    };
  }
  if (lower.includes("sort") || lower.includes("limit") || lower.includes("topn")) {
    return {
      icon: ArrowUpDown,
      badgeBg: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
      category: "Sort/Limit",
      color: "text-cyan-400",
      cardBorder: "border-cyan-500/30 hover:border-cyan-400",
    };
  }
  if (lower.includes("filter") || lower.includes("project")) {
    return {
      icon: Filter,
      badgeBg: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
      category: "Filter/Project",
      color: "text-indigo-400",
      cardBorder: "border-indigo-500/30 hover:border-indigo-400",
    };
  }

  return {
    icon: Layers,
    badgeBg: "bg-slate-500/15 text-slate-300 border-slate-500/30",
    category: "Operator",
    color: "text-slate-300",
    cardBorder: "border-slate-500/30 hover:border-slate-400",
  };
}

/**
 * Downloads text file to disk
 */
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

/**
 * Copy button with feedback
 */
function CopyPlanButton({ getText, label = "Copy", className = "" }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = typeof getText === "function" ? getText() : getText;
    if (!text) return;
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs hover:bg-(--color-bg-tertiary) text-(--color-text-secondary) hover:text-(--color-text-primary) transition-colors cursor-pointer ${className}`}
      title="Copy plan to clipboard"
    >
      {copied ? <Check size={12} className="text-(--color-success)" /> : <Copy size={12} />}
      <span>{copied ? "Copied" : label}</span>
    </button>
  );
}

/**
 * Main ExplainPlanView component
 */
export default function ExplainPlanView({
  data,
  planText = "",
  elapsed,
  onClose,
  onMaximizeToggle,
  isMaximized,
  activeWidth = 600,
  currentView = "plan", // 'plan' | 'visual' | 'table'
  onViewChange,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [wrapLines, setWrapLines] = useState(false);
  const [activeSearchIndex, setActiveSearchIndex] = useState(0);
  const [viewDropdownOpen, setViewDropdownOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [collapsedFragments, setCollapsedFragments] = useState({});

  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const planContainerRef = useRef(null);

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

  // Planner metadata analysis
  const plannerInfo = useMemo(() => {
    return detectPlannerInfo(data, planText);
  }, [data, planText]);

  // Visual Graph data
  const planFragments = useMemo(() => {
    return parsePlanGraph(planText);
  }, [planText]);

  const lines = useMemo(() => {
    return planText.split("\n");
  }, [planText]);

  // Group lines into fragment blocks for collapsible navigation
  const fragmentBlocks = useMemo(() => {
    const blocks = [];
    let currentBlock = { id: "intro", title: "", startIdx: 0, lines: [] };

    lines.forEach((line, index) => {
      const match = line.match(/^PLAN FRAGMENT (\d+)(?:\((.*?)\))?/i);
      if (match) {
        if (currentBlock.lines.length > 0) {
          blocks.push(currentBlock);
        }
        currentBlock = {
          id: `frag-${match[1]}`,
          fragId: match[1],
          title: line.trim(),
          startIdx: index,
          lines: [line],
        };
      } else {
        currentBlock.lines.push(line);
      }
    });

    if (currentBlock.lines.length > 0) {
      blocks.push(currentBlock);
    }
    return blocks;
  }, [lines]);

  // Search match indices
  const searchMatches = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const matches = [];
    lines.forEach((l, idx) => {
      if (l.toLowerCase().includes(q)) {
        matches.push(idx);
      }
    });
    return matches;
  }, [lines, searchQuery]);

  const handleNextSearch = () => {
    if (searchMatches.length === 0) return;
    setActiveSearchIndex((prev) => (prev + 1) % searchMatches.length);
  };

  const handlePrevSearch = () => {
    if (searchMatches.length === 0) return;
    setActiveSearchIndex((prev) => (prev - 1 + searchMatches.length) % searchMatches.length);
  };

  // Scroll active search match into view
  useEffect(() => {
    if (searchMatches.length > 0 && planContainerRef.current) {
      const lineIdx = searchMatches[activeSearchIndex];
      const targetEl = planContainerRef.current.querySelector(`[data-line-idx="${lineIdx}"]`);
      if (targetEl) {
        targetEl.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    }
  }, [activeSearchIndex, searchMatches]);

  const toggleCollapse = (blockId) => {
    setCollapsedFragments((prev) => ({
      ...prev,
      [blockId]: !prev[blockId],
    }));
  };

  const collapseAll = () => {
    const all = {};
    fragmentBlocks.forEach((b) => {
      if (b.id !== "intro") all[b.id] = true;
    });
    setCollapsedFragments(all);
  };

  const expandAll = () => {
    setCollapsedFragments({});
  };

  // Highlight a single line of execution plan text
  const renderLineContent = (line, lineIdx) => {
    if (!line) return <span className="text-transparent">.</span>;

    const isCurrentSearchMatch = searchMatches[activeSearchIndex] === lineIdx;
    const isFragmentHeader = /^PLAN FRAGMENT \d+/i.test(line.trim());
    const isPlanHeader = /^== (?:Physical|Parsed|Analyzed|Optimized) Plan ==/i.test(line.trim());

    if (isFragmentHeader) {
      const match = line.match(/^PLAN FRAGMENT (\d+)(?:\((.*?)\))?/i);
      const fragId = match ? match[1] : "0";
      const alias = match && match[2] ? match[2] : `F${fragId.padStart(2, "0")}`;
      return (
        <span className="inline-flex items-center gap-2 font-bold text-(--color-accent) text-xs">
          <span className="px-1.5 py-0.5 rounded bg-(--color-accent)/20 text-(--color-accent) text-[10px] uppercase font-mono">
            {alias}
          </span>
          <span>{line.trim()}</span>
        </span>
      );
    }

    if (isPlanHeader) {
      return (
        <span className="inline-flex items-center gap-1.5 font-bold text-sky-400 text-xs">
          <Sparkles size={12} />
          {line.trim()}
        </span>
      );
    }

    // Split line by search query first if search active
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const lowerLine = line.toLowerCase();
      const parts = [];
      let cursor = 0;
      let matchIdx = lowerLine.indexOf(q, cursor);

      while (matchIdx !== -1) {
        if (matchIdx > cursor) {
          parts.push(highlightSyntax(line.slice(cursor, matchIdx)));
        }
        const matchText = line.slice(matchIdx, matchIdx + q.length);
        parts.push(
          <mark
            key={`search-${matchIdx}`}
            className={`px-0.5 rounded-xs ${
              isCurrentSearchMatch
                ? "bg-amber-400 text-black font-semibold ring-2 ring-amber-500"
                : "bg-amber-400/40 text-inherit"
            }`}
          >
            {matchText}
          </mark>
        );
        cursor = matchIdx + q.length;
        matchIdx = lowerLine.indexOf(q, cursor);
      }

      if (cursor < line.length) {
        parts.push(highlightSyntax(line.slice(cursor)));
      }
      return parts;
    }

    return highlightSyntax(line);
  };

  // Syntax highlighting for operators, keywords, tree indentation
  const highlightSyntax = (text) => {
    const parts = [];
    let lastIdx = 0;

    // Combined regex for operators, keywords, tree symbols, and stats
    const tokenRegex = new RegExp(
      `(${ALL_OPS.join("|")}|${KEYWORDS.map(k => k.replace(/[:=]/g, "\\$&")).join("|")}|\\b(?:cardinality|partitions|cost|cpu|memory|network|avgRowSize|numNodes)=\\S+|\\|\\-\\-\\-\\-|\\|\\-\\-|\\+\\-\\-|\\\\\\-\\-|\\+\\-|\\\\\\-|\\|)`,
      "gi"
    );

    let match;
    while ((match = tokenRegex.exec(text)) !== null) {
      if (match.index > lastIdx) {
        parts.push(<span key={lastIdx}>{text.slice(lastIdx, match.index)}</span>);
      }

      const val = match[0];

      // Operator highlights
      if (SCAN_OPS.some(op => op.toLowerCase() === val.toLowerCase())) {
        parts.push(
          <span key={match.index} className="text-emerald-400 font-semibold">
            {val}
          </span>
        );
      } else if (JOIN_OPS.some(op => op.toLowerCase() === val.toLowerCase())) {
        parts.push(
          <span key={match.index} className="text-purple-400 font-semibold">
            {val}
          </span>
        );
      } else if (AGG_OPS.some(op => op.toLowerCase() === val.toLowerCase())) {
        parts.push(
          <span key={match.index} className="text-blue-400 font-semibold">
            {val}
          </span>
        );
      } else if (SINK_OPS.some(op => op.toLowerCase() === val.toLowerCase())) {
        parts.push(
          <span key={match.index} className="text-amber-400 font-bold">
            {val}
          </span>
        );
      } else if (EXCHANGE_OPS.some(op => op.toLowerCase() === val.toLowerCase())) {
        parts.push(
          <span key={match.index} className="text-rose-400 font-semibold">
            {val}
          </span>
        );
      } else if (SORT_OPS.some(op => op.toLowerCase() === val.toLowerCase())) {
        parts.push(
          <span key={match.index} className="text-cyan-400 font-semibold">
            {val}
          </span>
        );
      } else if (FILTER_PROJECT_OPS.some(op => op.toLowerCase() === val.toLowerCase())) {
        parts.push(
          <span key={match.index} className="text-indigo-400 font-semibold">
            {val}
          </span>
        );
      } else if (KEYWORDS.some(k => k.toLowerCase() === val.toLowerCase())) {
        parts.push(
          <span key={match.index} className="text-(--color-accent) font-medium">
            {val}
          </span>
        );
      } else if (val.includes("=")) {
        // Metric / cost assignment
        parts.push(
          <span key={match.index} className="text-amber-300/90 font-mono text-[11px]">
            {val}
          </span>
        );
      } else if (/^[|\\+\-]+$/.test(val)) {
        // Tree indentation guides
        parts.push(
          <span key={match.index} className="text-(--color-border) opacity-70 select-none">
            {val}
          </span>
        );
      } else {
        parts.push(
          <span key={match.index} className="text-sky-300">
            {val}
          </span>
        );
      }

      lastIdx = tokenRegex.lastIndex;
    }

    if (lastIdx < text.length) {
      parts.push(<span key={lastIdx}>{text.slice(lastIdx)}</span>);
    }
    return parts;
  };

  return (
    <div className="flex flex-col h-full bg-(--color-bg-secondary)">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between border-b border-(--color-border) shrink-0 h-9 bg-(--color-bg-secondary) select-none">
        {/* Left: View selector dropdown and Plan metadata */}
        <div className="flex items-center h-full relative" ref={dropdownRef}>
          <div className="flex items-center gap-1.5 px-3 border-r border-(--color-border) h-full">
            <button
              onClick={() => setViewDropdownOpen(!viewDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-(--color-text-primary) border-b-2 border-(--color-accent) bg-(--color-bg-primary)/40 hover:bg-(--color-bg-primary)/60 transition-colors h-full cursor-pointer"
            >
              {currentView === "visual" ? (
                <Workflow size={12} className="text-(--color-accent)" />
              ) : currentView === "table" ? (
                <TableIcon size={12} className="text-(--color-accent)" />
              ) : (
                <FileText size={12} className="text-(--color-accent)" />
              )}
              {activeWidth >= 380 && (
                <span>
                  {currentView === "visual"
                    ? "Visual Plan"
                    : currentView === "table"
                    ? "Table"
                    : "Explain Plan"}
                </span>
              )}
              <ChevronDown
                size={10}
                className={`text-(--color-text-muted) transition-transform duration-200 ${
                  viewDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          {/* View Dropdown Menu */}
          {viewDropdownOpen && (
            <div className="absolute left-3 top-9 z-50 bg-(--color-bg-secondary) border border-(--color-border) rounded-lg shadow-xl py-1 min-w-48 animate-in fade-in zoom-in-95 duration-100">
              <button
                onClick={() => {
                  onViewChange?.("plan");
                  setViewDropdownOpen(false);
                }}
                className={`flex items-center justify-between w-full text-left px-3 py-2 text-xs transition-colors cursor-pointer ${
                  currentView === "plan"
                    ? "bg-(--color-bg-tertiary) text-(--color-accent) font-semibold"
                    : "text-(--color-text-primary) hover:bg-(--color-bg-tertiary)"
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText size={12} />
                  <span>Explain Plan (Formatted)</span>
                </div>
                {currentView === "plan" && <Check size={12} className="text-(--color-accent)" />}
              </button>

              <button
                onClick={() => {
                  onViewChange?.("visual");
                  setViewDropdownOpen(false);
                }}
                className={`flex items-center justify-between w-full text-left px-3 py-2 text-xs transition-colors cursor-pointer ${
                  currentView === "visual"
                    ? "bg-(--color-bg-tertiary) text-(--color-accent) font-semibold"
                    : "text-(--color-text-primary) hover:bg-(--color-bg-tertiary)"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Workflow size={12} />
                  <span>Visual Plan (DAG Flow)</span>
                </div>
                {currentView === "visual" && <Check size={12} className="text-(--color-accent)" />}
              </button>

              <div className="h-px bg-(--color-border) my-1" />

              <button
                onClick={() => {
                  onViewChange?.("table");
                  setViewDropdownOpen(false);
                }}
                className={`flex items-center justify-between w-full text-left px-3 py-2 text-xs transition-colors cursor-pointer ${
                  currentView === "table"
                    ? "bg-(--color-bg-tertiary) text-(--color-accent) font-semibold"
                    : "text-(--color-text-primary) hover:bg-(--color-bg-tertiary)"
                }`}
              >
                <div className="flex items-center gap-2">
                  <TableIcon size={12} />
                  <span>Raw Table View</span>
                </div>
                {currentView === "table" && <Check size={12} className="text-(--color-accent)" />}
              </button>
            </div>
          )}

          {/* Plan Info Badge & Elapsed */}
          <div className="flex items-center gap-2 px-3 text-[11px] text-(--color-text-secondary) font-medium whitespace-nowrap min-w-0">
            <span className="flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-(--color-accent)/10 text-(--color-accent) font-mono text-[10px] font-semibold border border-(--color-accent)/20">
              <Cpu size={10} />
              {plannerInfo.plannerName}
            </span>

            {activeWidth >= 520 && plannerInfo.fragmentCount != null && (
              <span className="text-(--color-text-muted)">
                {plannerInfo.fragmentCount} {plannerInfo.fragmentCount === 1 ? "Fragment" : "Fragments"}
              </span>
            )}

            {activeWidth >= 620 && (
              <span className="text-(--color-text-muted)">
                {plannerInfo.lineCount} lines
              </span>
            )}

            {elapsed != null && (
              <span className="inline-flex items-center gap-1 text-[10px] text-(--color-text-muted)">
                <Clock size={10} />
                {formatElapsed(elapsed)}
              </span>
            )}
          </div>
        </div>

        {/* Right: Actions, Search, Copy, Download */}
        <div className="flex items-center gap-2 px-3 h-full">
          {/* Plan Search Toggle */}
          {currentView === "plan" && activeWidth >= 400 && (
            <button
              onClick={() => {
                setShowSearch(!showSearch);
                if (!showSearch) {
                  setTimeout(() => searchInputRef.current?.focus(), 50);
                }
              }}
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                showSearch
                  ? "bg-(--color-accent) text-white"
                  : "hover:bg-(--color-bg-tertiary) text-(--color-text-secondary) hover:text-(--color-text-primary)"
              }`}
              title={showSearch ? "Hide plan search" : "Search in plan"}
            >
              <Search size={13} />
            </button>
          )}

          {/* Line Wrap Toggle */}
          {currentView === "plan" && activeWidth >= 460 && (
            <button
              onClick={() => setWrapLines(!wrapLines)}
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                wrapLines
                  ? "bg-(--color-bg-tertiary) text-(--color-accent)"
                  : "hover:bg-(--color-bg-tertiary) text-(--color-text-secondary) hover:text-(--color-text-primary)"
              }`}
              title={wrapLines ? "Disable word wrap" : "Enable word wrap"}
            >
              <WrapText size={13} />
            </button>
          )}

          {/* Expand/Collapse All (only if multiple fragments exist) */}
          {currentView === "plan" && fragmentBlocks.length > 1 && activeWidth >= 500 && (
            <button
              onClick={() => {
                const isAnyCollapsed = Object.values(collapsedFragments).some(Boolean);
                if (isAnyCollapsed) {
                  expandAll();
                } else {
                  collapseAll();
                }
              }}
              className="p-1.5 rounded hover:bg-(--color-bg-tertiary) text-(--color-text-secondary) hover:text-(--color-text-primary) transition-colors cursor-pointer"
              title={Object.values(collapsedFragments).some(Boolean) ? "Expand all fragments" : "Collapse all fragments"}
            >
              <ChevronsUpDown size={13} />
            </button>
          )}

          {/* Copy Button */}
          {activeWidth >= 420 && (
            <CopyPlanButton getText={() => planText} label="Copy Plan" className="h-7" />
          )}

          {/* Download Buttons */}
          {activeWidth >= 520 && (
            <button
              onClick={() => downloadFile(planText, `explain_plan_${Date.now()}.txt`, "text/plain")}
              className="flex items-center gap-1 px-2 py-1 rounded text-[11px] hover:bg-(--color-bg-tertiary) text-(--color-text-secondary) hover:text-(--color-text-primary) transition-colors cursor-pointer h-7"
              title="Download Plan as Text"
            >
              <Download size={12} />
              <span>TXT</span>
            </button>
          )}

          {/* Maximize & Close buttons */}
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
              <X size={13} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>

      {/* In-Plan Search Bar */}
      {currentView === "plan" && showSearch && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-(--color-bg-primary) border-b border-(--color-border) shrink-0 text-xs">
          <Search size={12} className="text-(--color-text-muted) shrink-0" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setActiveSearchIndex(0);
            }}
            placeholder="Search plan (e.g. Scan, Join, table, predicates)..."
            className="flex-1 bg-transparent border-none text-(--color-text-primary) text-xs outline-none placeholder:text-(--color-text-muted)"
          />

          {searchMatches.length > 0 ? (
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[11px] text-(--color-text-muted) font-mono">
                {activeSearchIndex + 1} of {searchMatches.length}
              </span>
              <button
                onClick={handlePrevSearch}
                className="p-1 rounded hover:bg-(--color-bg-tertiary) text-(--color-text-secondary) cursor-pointer"
                title="Previous match"
              >
                <ChevronUp size={12} />
              </button>
              <button
                onClick={handleNextSearch}
                className="p-1 rounded hover:bg-(--color-bg-tertiary) text-(--color-text-secondary) cursor-pointer"
                title="Next match"
              >
                <ChevronDown size={12} />
              </button>
            </div>
          ) : searchQuery.trim() ? (
            <span className="text-[11px] text-(--color-error) font-mono shrink-0">
              No matches
            </span>
          ) : null}

          <button
            onClick={() => {
              setShowSearch(false);
              setSearchQuery("");
            }}
            className="p-1 rounded hover:bg-(--color-bg-tertiary) text-(--color-text-muted) hover:text-(--color-text-primary) cursor-pointer"
            title="Close search"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {currentView === "plan" && (
          <div
            ref={planContainerRef}
            className="h-full overflow-auto font-mono text-xs select-text bg-(--color-bg-primary)"
          >
            <div className="min-w-fit p-3">
              {fragmentBlocks.map((block) => {
                const isCollapsed = collapsedFragments[block.id];
                const isFragment = block.id.startsWith("frag-");

                return (
                  <div key={block.id} className="mb-2">
                    {/* Collapsible Fragment Header Banner */}
                    {isFragment && (
                      <div
                        onClick={() => toggleCollapse(block.id)}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-(--color-bg-secondary) hover:bg-(--color-bg-tertiary)/60 border border-(--color-border) cursor-pointer select-none transition-colors mb-1 group"
                      >
                        <button className="text-(--color-text-muted) group-hover:text-(--color-text-primary) transition-transform">
                          {isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                        </button>
                        <span className="font-bold text-xs text-(--color-accent)">
                          {block.title}
                        </span>
                        {isCollapsed && (
                          <span className="text-[10px] text-(--color-text-muted) italic ml-2">
                            ({block.lines.length} lines collapsed — click to expand)
                          </span>
                        )}
                      </div>
                    )}

                    {/* Block lines */}
                    {!isCollapsed && (
                      <div className="space-y-0.5">
                        {block.lines.map((line, localIdx) => {
                          const globalLineIdx = block.startIdx + localIdx;
                          const isMatch = searchMatches[activeSearchIndex] === globalLineIdx;

                          // Skip duplicate fragment header if already in banner
                          if (isFragment && localIdx === 0) return null;

                          return (
                            <div
                              key={globalLineIdx}
                              data-line-idx={globalLineIdx}
                              className={`flex items-start group hover:bg-(--color-bg-tertiary)/30 rounded-xs transition-colors ${
                                isMatch ? "bg-amber-500/15" : ""
                              }`}
                            >
                              {/* Gutter Line Number */}
                              <span className="w-10 shrink-0 text-right pr-3 select-none text-[11px] text-(--color-text-muted)/50 font-mono group-hover:text-(--color-text-muted)">
                                {globalLineIdx + 1}
                              </span>

                              {/* Plan Code Line */}
                              <div
                                className={`flex-1 text-(--color-text-secondary) leading-5 ${
                                  wrapLines ? "whitespace-pre-wrap break-all" : "whitespace-pre"
                                }`}
                              >
                                {renderLineContent(line, globalLineIdx)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Visual Plan (DAG Flow) View */}
        {currentView === "visual" && (
          <div className="flex h-full overflow-hidden bg-(--color-bg-primary)">
            {/* Stage Canvas */}
            <div className="flex-1 overflow-auto p-6 space-y-8">
              {planFragments.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-(--color-text-muted) text-sm">
                  <Workflow size={32} className="mb-2 opacity-50" />
                  <span>No visual flow nodes detected for this plan.</span>
                  <button
                    onClick={() => onViewChange?.("plan")}
                    className="mt-3 px-3 py-1.5 rounded bg-(--color-accent) text-white text-xs font-semibold cursor-pointer"
                  >
                    View Text Plan
                  </button>
                </div>
              ) : (
                planFragments.map((frag, fIdx) => (
                  <div
                    key={frag.id || fIdx}
                    className="rounded-xl border border-(--color-border) bg-(--color-bg-secondary)/60 p-5 shadow-sm"
                  >
                    {/* Stage Header */}
                    <div className="flex items-center justify-between border-b border-(--color-border) pb-3 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-(--color-accent)/20 text-(--color-accent) text-xs font-bold font-mono">
                          {frag.alias || `F${frag.id.padStart(2, "0")}`}
                        </span>
                        <span className="font-semibold text-sm text-(--color-text-primary)">
                          {frag.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-(--color-bg-tertiary) text-(--color-text-secondary) text-[11px] font-mono border border-(--color-border)">
                          {frag.partition}
                        </span>
                      </div>
                    </div>

                    {/* Stage Pipeline Flow */}
                    <div className="flex flex-col items-center space-y-3">
                      {/* Sink at top (Root destination) */}
                      {frag.sink && (
                        <>
                          <div
                            onClick={() =>
                              setSelectedNode({
                                type: frag.sink.name,
                                title: frag.sink.name,
                                category: "Sink",
                                details: frag.sink,
                                rawLines: [frag.sink.name],
                              })
                            }
                            className="w-full max-w-md p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 hover:border-amber-400 cursor-pointer transition-all shadow-xs flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="p-1.5 rounded-md bg-amber-500/20 text-amber-400">
                                <ArrowUpCircle size={16} />
                              </div>
                              <div>
                                <div className="font-semibold text-xs text-amber-300">
                                  {frag.sink.name}
                                </div>
                                <div className="text-[10px] text-(--color-text-muted)">
                                  {frag.sink.isResult
                                    ? "Client / Coordinator Output"
                                    : "Data Stream Sink"}
                                </div>
                              </div>
                            </div>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold">
                              SINK
                            </span>
                          </div>

                          {/* Connecting arrow */}
                          <div className="flex flex-col items-center text-(--color-text-muted)/60">
                            <div className="w-0.5 h-3 bg-(--color-border)" />
                            <ChevronUp size={14} className="text-(--color-text-muted)" />
                          </div>
                        </>
                      )}

                      {/* Operators in fragment */}
                      {frag.nodes.length === 0 ? (
                        <div className="text-xs text-(--color-text-muted) italic py-2">
                          Direct pass-through operations
                        </div>
                      ) : (
                        frag.nodes.map((node, nIdx) => {
                          const visual = getOperatorVisual(node.type);
                          const Icon = visual.icon;
                          const isSelected = selectedNode?.id === node.id && selectedNode?.type === node.type;

                          return (
                            <div key={node.id || nIdx} className="w-full max-w-md flex flex-col items-center">
                              {nIdx > 0 && (
                                <div className="flex flex-col items-center text-(--color-text-muted)/60 my-1">
                                  <div className="w-0.5 h-3 bg-(--color-border)" />
                                  <ChevronUp size={14} className="text-(--color-text-muted)" />
                                </div>
                              )}

                              <div
                                onClick={() =>
                                  setSelectedNode({
                                    ...node,
                                    category: visual.category,
                                    visual,
                                  })
                                }
                                className={`w-full p-3.5 rounded-lg border ${visual.cardBorder} bg-(--color-bg-primary) cursor-pointer transition-all shadow-xs ${
                                  isSelected ? "ring-2 ring-(--color-accent)" : ""
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className={`p-1.5 rounded-md ${visual.badgeBg}`}>
                                      <Icon size={16} />
                                    </div>
                                    <div className="min-w-0">
                                      <div className="font-semibold text-xs text-(--color-text-primary) truncate">
                                        {node.id ? `${node.id}: ` : ""}
                                        {node.type}
                                      </div>
                                      {node.table && (
                                        <div className="text-[11px] text-emerald-400/90 font-mono flex items-center gap-1 mt-0.5 truncate">
                                          <Database size={10} className="shrink-0" />
                                          <span className="truncate">{node.table}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold shrink-0 ${visual.badgeBg}`}>
                                    {visual.category}
                                  </span>
                                </div>

                                {/* Node metric badges */}
                                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-(--color-border)/50 text-[10.5px] text-(--color-text-muted) font-mono">
                                  {node.cardinality && (
                                    <span>rows: <strong className="text-(--color-text-secondary)">{node.cardinality}</strong></span>
                                  )}
                                  {node.predicates && (
                                    <span className="truncate" title={node.predicates}>
                                      filter: <code className="text-amber-400/90">{node.predicates}</code>
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Selected Node Details Drawer */}
            {selectedNode && (
              <div className="w-80 shrink-0 border-l border-(--color-border) bg-(--color-bg-secondary) flex flex-col h-full animate-in slide-in-from-right-4 duration-150">
                <div className="flex items-center justify-between p-3 border-b border-(--color-border)">
                  <div className="flex items-center gap-2">
                    <Info size={14} className="text-(--color-accent)" />
                    <span className="font-semibold text-xs text-(--color-text-primary)">
                      Node Inspector
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedNode(null)}
                    className="p-1 rounded hover:bg-(--color-bg-tertiary) text-(--color-text-muted) hover:text-(--color-text-primary) cursor-pointer"
                  >
                    <X size={13} />
                  </button>
                </div>

                <div className="flex-1 overflow-auto p-4 space-y-4 text-xs">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-(--color-text-muted) mb-1">
                      Operator
                    </div>
                    <div className="font-mono font-semibold text-sm text-(--color-text-primary)">
                      {selectedNode.type}
                    </div>
                    {selectedNode.category && (
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-mono bg-(--color-accent)/10 text-(--color-accent) border border-(--color-accent)/20">
                        {selectedNode.category}
                      </span>
                    )}
                  </div>

                  {selectedNode.table && (
                    <div>
                      <div className="text-[10px] uppercase font-bold text-(--color-text-muted) mb-1">
                        Target Table
                      </div>
                      <div className="font-mono text-emerald-400 bg-(--color-bg-primary) p-2 rounded border border-(--color-border) break-all">
                        {selectedNode.table}
                      </div>
                    </div>
                  )}

                  {selectedNode.cardinality && (
                    <div>
                      <div className="text-[10px] uppercase font-bold text-(--color-text-muted) mb-1">
                        Estimated Cardinality
                      </div>
                      <div className="font-mono text-(--color-text-primary)">
                        {Number(selectedNode.cardinality).toLocaleString()} rows
                      </div>
                    </div>
                  )}

                  {selectedNode.predicates && (
                    <div>
                      <div className="text-[10px] uppercase font-bold text-(--color-text-muted) mb-1">
                        Predicates / Filter
                      </div>
                      <div className="font-mono text-amber-300 bg-(--color-bg-primary) p-2 rounded border border-(--color-border) break-all">
                        {selectedNode.predicates}
                      </div>
                    </div>
                  )}

                  {selectedNode.rawLines && selectedNode.rawLines.length > 0 && (
                    <div>
                      <div className="text-[10px] uppercase font-bold text-(--color-text-muted) mb-1">
                        Raw Operator Details
                      </div>
                      <pre className="p-2.5 rounded bg-(--color-bg-primary) border border-(--color-border) text-[11px] font-mono text-(--color-text-secondary) whitespace-pre-wrap break-all max-h-64 overflow-auto">
                        {selectedNode.rawLines.join("\n")}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
