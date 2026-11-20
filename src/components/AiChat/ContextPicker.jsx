import { useState, useEffect, useRef, useMemo } from "react";
import {
  FileText,
  Database,
  Code2,
  Table,
  CheckCircle2,
  Cpu,
  Layers,
  Search,
  X,
} from "lucide-react";
import { useSqlFiles } from "../../context/SqlFilesContext";
import { useSchema } from "../../context/SchemaContext";
import { useLivy } from "../../context/LivyContext";

export default function ContextPicker({ onSelect, onClose, searchFilter = "" }) {
  const { files, activeFile, activeResult } = useSqlFiles();
  const { tables, schemas } = useSchema();
  const { activeHost, activeEngine } = useLivy();

  const [query, setQuery] = useState(searchFilter);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setQuery(searchFilter);
  }, [searchFilter]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const activeDatabase = activeHost?.database || "demo_db";
  const discoveredTables = useMemo(() => {
    const list = tables?.[activeDatabase] || [];
    if (list.length > 0) return list;
    const all = Object.values(tables || {}).flat();
    return Array.from(new Set(all));
  }, [tables, activeDatabase]);

  // Build candidate items
  const allCandidates = useMemo(() => {
    const items = [];

    // 1. Special Contexts
    items.push({
      id: "ctx_editor",
      type: "editor",
      category: "Editor",
      label: "Active Editor / Selection",
      description: activeFile?.name ? `Code from ${activeFile.name}` : "Current editor code",
      icon: Code2,
      color: "text-purple-400",
    });

    if (activeResult) {
      items.push({
        id: "ctx_result",
        type: "result",
        category: "Result",
        label: "Latest Query Result",
        description: activeResult.status === "error" ? "Execution error message" : "Last executed data grid sample",
        icon: CheckCircle2,
        color: "text-emerald-400",
      });
    }

    items.push({
      id: "ctx_cluster",
      type: "cluster",
      category: "Cluster",
      label: "Cluster & Session Context",
      description: `${activeEngine === "doris" ? "Doris" : "Spark"} • ${activeDatabase}`,
      icon: Cpu,
      color: "text-amber-400",
    });

    // 2. Open / Workspace Files
    (files || []).forEach((f) => {
      if (f.id === "settings" || f.isSpecial) return;
      items.push({
        id: `file_${f.id}`,
        type: "file",
        category: "Files",
        label: f.name,
        name: f.name,
        description: f.isLocalDisk ? "Local workspace file" : "Editor tab",
        icon: FileText,
        color: "text-blue-400",
      });
    });

    // 3. Discovered Catalog Tables
    discoveredTables.forEach((t) => {
      items.push({
        id: `table_${t}`,
        type: "table",
        category: "Tables",
        label: t,
        name: t,
        description: `Table in ${activeDatabase}`,
        icon: Table,
        color: "text-cyan-400",
      });
    });

    return items;
  }, [files, activeFile, activeResult, activeEngine, activeDatabase, discoveredTables]);

  // Filter items
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^@/, "");
    if (!q) return allCandidates;
    return allCandidates.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        item.category.toLowerCase().includes(q)
    );
  }, [allCandidates, query]);

  // Clamp selection index
  useEffect(() => {
    setSelectedIndex(0);
  }, [filtered.length]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        onSelect(filtered[selectedIndex]);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      className="flex flex-col bg-(--color-bg-secondary) border border-purple-800/60 rounded-lg shadow-2xl overflow-hidden z-50 text-xs w-full max-h-72 animate-fadeIn"
    >
      {/* Header Search Bar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-(--color-border) bg-(--color-bg-primary)">
        <Search size={13} className="text-purple-400 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type to filter files, tables, editor context..."
          className="w-full bg-transparent text-white text-xs focus:outline-none placeholder-[#666666]"
        />
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-[#666666] hover:text-white transition-colors cursor-pointer"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* List Items */}
      <div className="overflow-y-auto max-h-56 p-1 flex flex-col gap-0.5 select-none">
        {filtered.length === 0 ? (
          <div className="p-3 text-center text-[#777777] text-[11px]">
            No matching files or tables found.
          </div>
        ) : (
          filtered.map((item, idx) => {
            const Icon = item.icon;
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item)}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded text-left transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-purple-900/40 border border-purple-700/50 text-white"
                    : "hover:bg-(--color-bg-hover) text-[#cccccc] border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Icon size={13} className={`shrink-0 ${item.color}`} />
                  <span className="font-mono text-[11px] truncate font-medium">{item.label}</span>
                </div>
                <span className="text-[10px] text-[#777777] shrink-0 font-sans ml-2">
                  {item.category}
                </span>
              </button>
            );
          })
        )}
      </div>

      {/* Footer Instructions */}
      <div className="flex items-center justify-between px-3 py-1 bg-(--color-bg-primary) border-t border-(--color-border) text-[10px] text-[#666666]">
        <span>↑↓ Navigate • ↵ Select</span>
        <span>Esc to close</span>
      </div>
    </div>
  );
}
