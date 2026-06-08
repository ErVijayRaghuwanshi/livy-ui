import { useState, useMemo, useEffect } from "react";
import { Search, FileCode, ChevronDown, ChevronRight } from "lucide-react";
import { useSqlFiles } from "../context/SqlFilesContext";

export default function SearchPanel() {
  const { files, previewFile, setPendingLineReveal } = useSqlFiles();
  const [query, setQuery] = useState(() => {
    return localStorage.getItem("livy-search-query") || "";
  });

  useEffect(() => {
    localStorage.setItem("livy-search-query", query);
  }, [query]);

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    
    const term = query.toLowerCase();
    const results = [];

    files.forEach((file) => {
      const content = file.content || "";
      const lines = content.split("\n");
      const fileMatches = [];

      lines.forEach((lineText, index) => {
        if (lineText.toLowerCase().includes(term)) {
          fileMatches.push({
            lineNumber: index + 1,
            text: lineText.trim(),
          });
        }
      });

      if (fileMatches.length > 0) {
        results.push({
          fileId: file.id,
          fileName: file.name,
          matches: fileMatches,
        });
      }
    });

    return results;
  }, [query, files]);

  // Total match count
  const totalMatchesCount = useMemo(() => {
    return searchResults.reduce((acc, result) => acc + result.matches.length, 0);
  }, [searchResults]);

  // State to track collapsed/expanded state for file groups
  const [collapsedFiles, setCollapsedFiles] = useState({});

  const toggleFileCollapse = (fileId) => {
    setCollapsedFiles((prev) => ({
      ...prev,
      [fileId]: !prev[fileId],
    }));
  };

  const highlightText = (text, highlight) => {
    if (!highlight.trim()) return <span>{text}</span>;
    const regex = new RegExp(`(${highlight.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, "gi");
    const parts = text.split(regex);
    return (
      <span>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <mark key={i} className="bg-(--color-accent)/30 text-(--color-text-primary) px-0.5 rounded font-semibold">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  return (
    <div className="flex flex-col h-full bg-(--color-bg-secondary) select-none">
      {/* Input Header */}
      <div className="p-3 flex flex-col gap-2 border-b border-(--color-border)/35 bg-(--color-bg-secondary)/5">
        <div className="flex items-center gap-2 bg-(--color-bg-primary)/60 border border-(--color-border) rounded-lg px-2.5 py-1.5 focus-within:border-(--color-accent) transition-all">
          <Search size={13} className="text-(--color-text-muted) shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search text in files..."
            className="w-full bg-transparent border-none text-xs text-(--color-text-primary) outline-none placeholder:text-(--color-text-muted)"
          />
        </div>
        {query.trim() && (
          <div className="text-[10px] text-(--color-text-muted) font-medium">
            Found {totalMatchesCount} {totalMatchesCount === 1 ? "result" : "results"} in {searchResults.length} {searchResults.length === 1 ? "file" : "files"}
          </div>
        )}
      </div>

      {/* Results View */}
      <div className="flex-1 overflow-y-auto py-2">
        {!query.trim() ? (
          <div className="px-5 py-8 text-center text-xs text-(--color-text-muted) italic">
            Type something in the box to search across all your SQL files
          </div>
        ) : searchResults.length === 0 ? (
          <div className="px-5 py-8 text-center text-xs text-(--color-text-muted) italic">
            No matches found
          </div>
        ) : (
          <div className="flex flex-col gap-1 px-1">
            {searchResults.map((result) => {
              const isCollapsed = collapsedFiles[result.fileId];
              return (
                <div key={result.fileId} className="flex flex-col">
                  {/* File group header */}
                  <div
                    onClick={() => toggleFileCollapse(result.fileId)}
                    className="flex items-center gap-1 px-2 py-1 hover:bg-(--color-bg-tertiary)/15 rounded-md cursor-pointer transition-colors text-xs font-semibold text-(--color-text-secondary)"
                  >
                    {isCollapsed ? (
                      <ChevronRight size={13} className="text-(--color-text-muted)" />
                    ) : (
                      <ChevronDown size={13} className="text-(--color-text-muted)" />
                    )}
                    <FileCode size={13} className="text-(--color-accent) shrink-0" />
                    <span className="truncate flex-1">{result.fileName}</span>
                    <span className="px-1.5 py-0.2 text-[9px] bg-(--color-bg-tertiary) text-(--color-text-muted) rounded-full font-bold">
                      {result.matches.length}
                    </span>
                  </div>

                  {/* Lines list */}
                  {!isCollapsed && (
                    <div className="flex flex-col pl-4.5 border-l border-(--color-border)/35 ml-3.5 my-0.5">
                      {result.matches.map((match) => (
                        <div
                          key={`${result.fileId}-line-${match.lineNumber}`}
                          onClick={() => {
                            previewFile(result.fileId);
                            setPendingLineReveal(result.fileId, match.lineNumber);
                          }}
                          className="flex items-start gap-2.5 py-1 px-2 hover:bg-(--color-bg-tertiary)/30 rounded text-[11px] cursor-pointer transition-all text-(--color-text-secondary) hover:text-(--color-text-primary)"
                        >
                          <span className="font-mono text-(--color-text-muted) shrink-0 min-w-5 text-right select-none">
                            {match.lineNumber}
                          </span>
                          <span className="font-mono truncate whitespace-nowrap">
                            {highlightText(match.text, query)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
