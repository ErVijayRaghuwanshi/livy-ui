import { useState, useEffect, useRef, useMemo } from "react";
import { Search, FileCode, Terminal, Keyboard } from "lucide-react";
import { useSqlFiles } from "../context/SqlFilesContext";

const isMac = typeof window !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0;

export default function CommandPalette({
  isOpen,
  onClose,
  toggleTheme,
  setSidebarCollapsed,
  setShowShortcuts,
  setShowHistory,
  setShowConnectionModal,
  editorRef,
}) {
  const {
    files,
    activeTabId,
    addFile,
    saveFile,
    restoreLastClosedTab,
    requestCloseFile,
    closeAllFiles,
    setActiveTab,
    previewFile,
  } = useSqlFiles();

  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recents, setRecents] = useState(() => {
    try {
      const saved = localStorage.getItem("livy-ui-command-palette-recents");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const listRef = useRef(null);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      setSearch("");
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedEl = listRef.current.querySelector(".is-selected");
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  // Static list of commands
  const commands = useMemo(() => [
    {
      id: "new-file",
      name: "New SQL File",
      category: "File",
      shortcut: isMac ? "⌘⌥N" : "Ctrl+Alt+N",
      action: () => addFile(),
    },
    {
      id: "save-file",
      name: "Save SQL File",
      category: "File",
      shortcut: isMac ? "⌘S" : "Ctrl+S",
      action: () => saveFile(activeTabId),
    },
    {
      id: "close-active",
      name: "Close Active File",
      category: "File",
      shortcut: isMac ? "⌘⌥W" : "Ctrl+Alt+W",
      action: () => requestCloseFile(activeTabId),
    },
    {
      id: "close-all",
      name: "Close All Files",
      category: "File",
      shortcut: "",
      action: () => closeAllFiles(),
    },
    {
      id: "run-query",
      name: "Run Query",
      category: "Editor",
      shortcut: isMac ? "⌘Enter" : "Ctrl+Enter",
      action: () => editorRef?.current?.run(),
    },
    {
      id: "format-sql",
      name: "Format SQL",
      category: "Editor",
      shortcut: isMac ? "⌘⇧F" : "Ctrl+Shift+F",
      action: () => editorRef?.current?.format(),
    },
    {
      id: "minify-sql",
      name: "Minify SQL (Single Line)",
      category: "Editor",
      shortcut: isMac ? "⌘⇧M" : "Ctrl+Shift+M",
      action: () => editorRef?.current?.minify(),
    },
    {
      id: "restore-tab",
      name: "Restore Last Closed Tab",
      category: "File",
      shortcut: isMac ? "⌘⇧T" : "Ctrl+Shift+T",
      action: () => restoreLastClosedTab(),
    },
    {
      id: "toggle-sidebar",
      name: "Toggle Sidebar",
      category: "View",
      shortcut: isMac ? "⌘B" : "Ctrl+B",
      action: () => setSidebarCollapsed((p) => !p),
    },
    {
      id: "toggle-theme",
      name: "Toggle Color Theme (Light / Dark)",
      category: "Preferences",
      shortcut: "",
      action: () => toggleTheme(),
    },
    {
      id: "manage-hosts",
      name: "Manage Livy Hosts",
      category: "Connection",
      shortcut: isMac ? "⌘." : "Ctrl+.",
      action: () => setShowConnectionModal(true),
    },
    {
      id: "show-history",
      name: "Toggle Query History",
      category: "View",
      shortcut: isMac ? "⌘H" : "Ctrl+H",
      action: () => setShowHistory(true),
    },
    {
      id: "show-shortcuts",
      name: "Show Keyboard Shortcuts",
      category: "Help",
      shortcut: isMac ? "⌘/" : "Ctrl+/",
      action: () => setShowShortcuts(true),
    },
  ], [addFile, saveFile, activeTabId, requestCloseFile, closeAllFiles, editorRef, restoreLastClosedTab, setSidebarCollapsed, toggleTheme, setShowConnectionModal, setShowHistory, setShowShortcuts]);

  // Combined list of filtered items
  const filteredItems = useMemo(() => {
    const isCmdOnly = search.startsWith(">");
    const cleanSearch = isCmdOnly ? search.slice(1).trim().toLowerCase() : search.trim().toLowerCase();

    // Map files to items
    const fileItems = files.map((f) => ({
      id: `file-${f.id}`,
      name: f.name,
      category: "File",
      type: "file",
      fileId: f.id,
    }));

    // Map commands to items
    const cmdItems = commands.map((c) => ({
      ...c,
      type: "command",
    }));

    if (isCmdOnly) {
      const filteredCmds = cleanSearch
        ? cmdItems.filter((c) => c.name.toLowerCase().includes(cleanSearch))
        : cmdItems;

      const categorized = filteredCmds.map((c) => {
        const isRecent = recents.includes(c.id);
        return {
          ...c,
          category: isRecent ? "recently used" : c.category,
          isRecent,
        };
      });

      return [...categorized].sort((a, b) => {
        if (a.isRecent && b.isRecent) return recents.indexOf(a.id) - recents.indexOf(b.id);
        if (a.isRecent) return -1;
        if (b.isRecent) return 1;
        return 0;
      });
    }

    if (!cleanSearch) {
      // 1. Build list of recent items in order
      const recentItems = recents
        .map((id) => {
          if (id.startsWith("file-")) {
            const fId = id.replace("file-", "");
            const f = files.find((file) => file.id === fId);
            if (f) {
              return {
                id,
                name: f.name,
                category: "recently used",
                type: "file",
                fileId: f.id,
                isRecent: true,
              };
            }
          } else {
            const c = commands.find((cmd) => cmd.id === id);
            if (c) {
              return {
                ...c,
                type: "command",
                category: "recently used",
                isRecent: true,
              };
            }
          }
          return null;
        })
        .filter(Boolean);

      // 2. Exclude recents from other lists
      const otherFiles = fileItems.filter((f) => !recents.includes(f.id));
      const otherCmds = cmdItems.filter((c) => !recents.includes(c.id));

      return [...recentItems, ...otherFiles, ...otherCmds];
    }

    // Filter matching files and commands
    const matchingFiles = fileItems.filter((f) =>
      f.name.toLowerCase().includes(cleanSearch)
    );
    const matchingCmds = cmdItems.filter((c) =>
      c.name.toLowerCase().includes(cleanSearch) ||
      c.category.toLowerCase().includes(cleanSearch)
    );

    const combined = [...matchingFiles, ...matchingCmds].map((item) => {
      const isRecent = recents.includes(item.id);
      return {
        ...item,
        category: isRecent ? "recently used" : item.category,
        isRecent,
      };
    });

    return combined.sort((a, b) => {
      if (a.isRecent && b.isRecent) return recents.indexOf(a.id) - recents.indexOf(b.id);
      if (a.isRecent) return -1;
      if (b.isRecent) return 1;
      return a.category.localeCompare(b.category);
    });
  }, [search, files, commands, recents]);

  // Adjust selection out-of-bounds
  useEffect(() => {
    if (selectedIndex >= filteredItems.length) {
      setSelectedIndex(Math.max(0, filteredItems.length - 1));
    }
  }, [filteredItems, selectedIndex]);

  const handleSelect = (item) => {
    // Record to recents
    setRecents((prev) => {
      const updated = [item.id, ...prev.filter((id) => id !== item.id)].slice(0, 5);
      try {
        localStorage.setItem("livy-ui-command-palette-recents", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    onClose();
    if (item.type === "file") {
      previewFile(item.fileId);
    } else if (item.type === "command") {
      item.action();
    }
  };

  // Keyboard navigation inside list
  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(filteredItems.length - 1, prev + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(0, prev - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        handleSelect(filteredItems[selectedIndex]);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/45 pt-[10vh] animate-in fade-in duration-100">
      <div
        ref={containerRef}
        className="w-full max-w-[560px] mx-4 bg-(--color-bg-secondary)/95 backdrop-blur-md border border-(--color-border) rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[380px] animate-in slide-in-from-top-4 duration-200"
      >
        {/* Search input bar */}
        <div className="flex items-center gap-2.5 px-3 py-2 border-b border-(--color-border)/80">
          <Search size={14} className="text-(--color-text-muted) shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='Search files or type ">" to run commands...'
            className="flex-1 bg-transparent border-none text-xs text-(--color-text-primary) outline-none placeholder:text-(--color-text-muted)"
          />
        </div>

        {/* Dynamic Items list */}
        <div ref={listRef} className="flex-1 overflow-y-auto py-1">
          {filteredItems.length === 0 ? (
            <div className="px-5 py-6 text-center text-xs text-(--color-text-muted) italic">
              No matching commands or files found
            </div>
          ) : (() => {
            let prevCategory = null;
            return filteredItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              const showHeader = item.category !== prevCategory;
              prevCategory = item.category;
              return (
                <div key={item.id}>
                  {showHeader && (
                    <div className="px-3 py-1 text-[9px] font-bold text-(--color-text-muted) uppercase tracking-wider select-none bg-(--color-bg-secondary)/45 border-b border-(--color-border)/20 mt-1.5 first:mt-0 mb-1">
                      {item.category}
                    </div>
                  )}
                  <div
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`flex items-center justify-between px-3 py-2 text-xs cursor-pointer select-none transition-all ${
                      isSelected
                        ? "bg-(--color-accent)/15 text-(--color-text-primary) border-l-2 border-l-(--color-accent) is-selected"
                        : "text-(--color-text-secondary) hover:bg-(--color-bg-tertiary)/15"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {item.type === "file" ? (
                        <FileCode size={13} className="text-(--color-accent) shrink-0" />
                      ) : (
                        <Terminal size={13} className="text-(--color-text-muted) shrink-0" />
                      )}
                      <span className={`truncate ${isSelected ? "font-semibold" : ""}`}>
                        {item.name}
                      </span>
                      {item.category !== "recently used" && (
                        <span className="text-[10px] text-(--color-text-muted) font-medium opacity-65 truncate uppercase tracking-wider">
                          {item.category || "File"}
                        </span>
                      )}
                    </div>
                    {item.shortcut && (
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        <span className="text-[9px] font-mono px-1.5 py-0.2 bg-(--color-bg-tertiary)/50 border border-(--color-border)/35 rounded text-(--color-text-muted)">
                          {item.shortcut}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            });
          })()}
        </div>

        {/* Help footer */}
        <div className="px-3 py-1.5 border-t border-(--color-border)/40 bg-(--color-bg-primary)/20 flex items-center justify-between text-[9px] text-(--color-text-muted)">
          <div className="flex items-center gap-1.5">
            <Keyboard size={11} />
            <span>Use ↑↓ to navigate, Enter to run, Esc to close</span>
          </div>
          <span>{filteredItems.length} results</span>
        </div>
      </div>
    </div>
  );
}
