import { useState, useEffect, useRef, useCallback } from "react";
import TitleBar from "./components/TitleBar";
import ActivityBar from "./components/ActivityBar";
import CommandPalette from "./components/CommandPalette";
import ConnectionModal from "./components/ConnectionModal";
import TabBar from "./components/TabBar";
import SqlEditor from "./components/SqlEditor";
import ResultTable from "./components/ResultTable";
import SidebarTabs from "./components/SidebarTabs";
import KeyboardShortcuts from "./components/KeyboardShortcuts";
import QueryHistory from "./components/QueryHistory";
import StatusBar from "./components/StatusBar";
import { GripHorizontal } from "lucide-react";
import { useSqlFiles } from "./context/SqlFilesContext";
import { ToastContainer } from "./components/Toast";
import WelcomeScreen from "./components/WelcomeScreen";
import BounceGame from "./components/BounceGame";
import SnakeGame from "./components/SnakeGame";

const SIDEBAR_CACHE_KEY = "livy-ui-explorer-collapsed";
const THEME_CACHE_KEY = "livy-ui-theme";
const DEFAULT_RESULT_HEIGHT = 250;

export default function App() {
  const { activeFile, activeResult, files, activeTabId, setActiveTab, addFile, removeFile, saveFile, restoreLastClosedTab, closedTabsHistory, requestCloseFile } = useSqlFiles();

  const [activeGames, setActiveGames] = useState({});
  const [pendingGame, setPendingGame] = useState(null); // 'bounce' | 'snake' | null

  const handleTriggerBounce = useCallback(() => {
    if (activeTabId) {
      setActiveGames((prev) => ({ ...prev, [activeTabId]: 'bounce' }));
    } else {
      setPendingGame('bounce');
      addFile({ name: "Retro Bounce.sql" });
    }
  }, [activeTabId, addFile]);

  const handleTriggerSnake = useCallback(() => {
    if (activeTabId) {
      setActiveGames((prev) => ({ ...prev, [activeTabId]: 'snake' }));
    } else {
      setPendingGame('snake');
      addFile({ name: "Retro Snake.sql" });
    }
  }, [activeTabId, addFile]);

  useEffect(() => {
    if (pendingGame && activeTabId) {
      setActiveGames((prev) => ({ ...prev, [activeTabId]: pendingGame }));
      setPendingGame(null);
    }
  }, [activeTabId, pendingGame]);

  const [activeSidebarTab, setActiveSidebarTab] = useState(() => {
    return localStorage.getItem("livy-active-sidebar-tab") || "files";
  });
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [commandPaletteInitialQuery, setCommandPaletteInitialQuery] = useState("");

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_CACHE_KEY);
    if (saved !== null) return JSON.parse(saved);
    // Default to collapsed on mobile (< 768px)
    return typeof window !== 'undefined' && window.innerWidth < 768 ? true : false;
  });
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_CACHE_KEY) || "dark");
  const [resultHeight, setResultHeight] = useState(DEFAULT_RESULT_HEIGHT);
  const [isDragging, setIsDragging] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(null);

  // Sidebar resizing states
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem("livy-sidebar-width");
    if (saved !== null) {
      const val = parseInt(saved, 10);
      if (!isNaN(val) && val >= 180 && val <= 600) return val;
    }
    return 240; // Default width
  });
  const [isSidebarDragging, setIsSidebarDragging] = useState(false);
  const [isCornerHovered, setIsCornerHovered] = useState(false);

  const editorRef = useRef(null);
  const sidebarTabsRef = useRef(null);
  const prevResultHeight = useRef(DEFAULT_RESULT_HEIGHT);

  const handleInsertAtCursor = useCallback((text) => {
    editorRef.current?.insertText(text);
  }, []);

  const handleFocusSchemaSearch = useCallback(() => {
    sidebarTabsRef.current?.focusSchemaSearch();
  }, []);

  const handleFocusFileSearch = useCallback(() => {
    sidebarTabsRef.current?.focusFileSearch();
  }, []);

  // Persist sidebar collapsed state
  useEffect(() => {
    localStorage.setItem(SIDEBAR_CACHE_KEY, JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  // Persist active sidebar tab
  useEffect(() => {
    localStorage.setItem("livy-active-sidebar-tab", activeSidebarTab);
  }, [activeSidebarTab]);

  // Apply theme class to root
  useEffect(() => {
    localStorage.setItem(THEME_CACHE_KEY, theme);
    if (theme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      const ctrl = e.ctrlKey || e.metaKey;

      // Ctrl+P / Cmd+P or Ctrl+Shift+P / Cmd+Shift+P — Toggle Command Palette
      if (ctrl && !e.altKey && (e.key.toLowerCase() === "p" || e.code === "KeyP")) {
        e.preventDefault();
        if (e.shiftKey) {
          setCommandPaletteInitialQuery(">");
        } else {
          setCommandPaletteInitialQuery("");
        }
        setShowCommandPalette((p) => !p);
        return;
      }

      // Ctrl+B / Cmd+B — toggle sidebar
      if (ctrl && !e.altKey && !e.shiftKey && (e.key.toLowerCase() === "b" || e.code === "KeyB")) {
        e.preventDefault();
        setSidebarCollapsed((p) => !p);
        return;
      }

      // Ctrl+` / Cmd+` — toggle result panel
      if (ctrl && !e.altKey && !e.shiftKey && e.key === "`") {
        e.preventDefault();
        setResultHeight((h) => {
          if (h > 0) {
            prevResultHeight.current = h;
            return 0;
          }
          return prevResultHeight.current || DEFAULT_RESULT_HEIGHT;
        });
        return;
      }

      // Ctrl+Enter / Cmd+Enter — run SQL
      if (ctrl && !e.altKey && !e.shiftKey && e.key === "Enter") {
        e.preventDefault();
        editorRef.current?.run();
        return;
      }

      // Ctrl+Shift+F / Cmd+Shift+F — format SQL
      if (ctrl && !e.altKey && e.shiftKey && (e.key.toLowerCase() === "f" || e.code === "KeyF")) {
        e.preventDefault();
        editorRef.current?.format();
        return;
      }

      // Ctrl+Shift+M / Cmd+Shift+M — minify SQL to one line
      if (ctrl && !e.altKey && e.shiftKey && (e.key.toLowerCase() === "m" || e.code === "KeyM")) {
        e.preventDefault();
        editorRef.current?.minify();
        return;
      }

      // Ctrl+Alt+N / Cmd+Option+N — new tab (VS Code-like browser override)
      if (ctrl && e.altKey && !e.shiftKey && (e.key.toLowerCase() === "n" || e.code === "KeyN")) {
        e.preventDefault();
        addFile();
        return;
      }

      // Ctrl+Alt+W / Cmd+Option+W — close active tab (VS Code-like browser override)
      if (ctrl && e.altKey && !e.shiftKey && (e.key.toLowerCase() === "w" || e.code === "KeyW")) {
        e.preventDefault();
        requestCloseFile(activeTabId);
        return;
      }

      // Ctrl+H / Cmd+H — toggle query history
      if (ctrl && !e.altKey && !e.shiftKey && (e.key.toLowerCase() === "h" || e.code === "KeyH")) {
        e.preventDefault();
        setShowHistory((p) => !p);

        // hide other two
        setShowShortcuts(false);
        setShowConnectionModal(false);
        return;
      }

      // Shift+/ (or '?') — show keyboard shortcuts
      const isInput = e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.closest(".monaco-editor");
      if (!ctrl && !e.altKey && e.shiftKey && e.key === "/" && !isInput) {
        e.preventDefault();
        setShowShortcuts((p) => !p);
        setShowHistory(false);
        setShowConnectionModal(false);
        return;
      }

      // Ctrl+Shift+E / Cmd+Shift+E — focus file explorer
      if (ctrl && !e.altKey && e.shiftKey && (e.key.toLowerCase() === "e" || e.code === "KeyE")) {
        e.preventDefault();
        setActiveSidebarTab("files");
        handleFocusFileSearch();
        return;
      }

      // Ctrl+Shift+K / Cmd+Shift+K — focus schema explorer search
      if (ctrl && !e.altKey && e.shiftKey && (e.key.toLowerCase() === "k" || e.code === "KeyK")) {
        e.preventDefault();
        setActiveSidebarTab("schema");
        handleFocusSchemaSearch();
        return;
      }

      // Ctrl+Shift+T / Cmd+Shift+T or Ctrl+Alt+T / Cmd+Option+T — restore last closed tab
      const isRestoreTab = 
        (ctrl && !e.altKey && e.shiftKey && (e.key.toLowerCase() === "t" || e.code === "KeyT")) ||
        (ctrl && e.altKey && !e.shiftKey && (e.key.toLowerCase() === "t" || e.code === "KeyT"));
      if (isRestoreTab) {
        e.preventDefault();
        restoreLastClosedTab();
        return;
      }

      // Ctrl+. / Cmd+. — manage Livy hosts
      if (ctrl && !e.altKey && !e.shiftKey && e.key === ".") {
        e.preventDefault();
        setShowConnectionModal((p) => !p);

        // hide other two
        setShowShortcuts(false);
        setShowHistory(false);
        return;
      }

      // Ctrl+S / Cmd+S — save SQL (clear dirty state)
      if (ctrl && !e.altKey && !e.shiftKey && (e.key.toLowerCase() === "s" || e.code === "KeyS")) {
        e.preventDefault();
        saveFile(activeTabId);
        return;
      }

      // Alt + [1-9] to switch directly to tab 1-9 (browser-safe shortcut, works on Mac Option+1-9 too)
      if (e.altKey && !ctrl && !e.shiftKey && e.code.startsWith("Digit")) {
        const digitStr = e.code.slice(5);
        if (digitStr >= "1" && digitStr <= "9") {
          e.preventDefault();
          const tabIndex = parseInt(digitStr, 10) - 1;
          if (tabIndex < files.length) {
            setActiveTab(files[tabIndex].id);
          }
          return;
        }
      }

      // Next / Prev Tab Switchers:
      // - Ctrl+PageDown / Ctrl+PageUp or Cmd+Option+ArrowRight / Cmd+Option+ArrowLeft
      // - Ctrl+Tab (next), Ctrl+Shift+Tab (prev) (explicitly ctrlKey only to not block macOS Cmd+Tab app switch)
      // - Ctrl+Shift+[ / Cmd+Shift+[ (prev), Ctrl+Shift+] / Cmd+Shift+] (next)
      // - Alt+[ (prev), Alt+] (next) (browser-safe alternative)
      // - Alt+PageUp (prev), Alt+PageDown (next) (browser-safe alternative)
      const isPrevTab =
        (ctrl && !e.shiftKey && e.key === "PageUp") ||
        (ctrl && e.altKey && !e.shiftKey && e.key === "ArrowLeft") ||
        (e.ctrlKey && !e.metaKey && e.shiftKey && e.key === "Tab") ||
        (ctrl && e.shiftKey && (e.key === "[" || e.key === "{" || e.code === "BracketLeft")) ||
        (e.altKey && !ctrl && !e.shiftKey && (e.key === "[" || e.key === "{" || e.code === "BracketLeft")) ||
        (e.altKey && !ctrl && !e.shiftKey && e.key === "PageUp");

      const isNextTab =
        (ctrl && !e.shiftKey && e.key === "PageDown") ||
        (ctrl && e.altKey && !e.shiftKey && e.key === "ArrowRight") ||
        (e.ctrlKey && !e.metaKey && !e.shiftKey && e.key === "Tab") ||
        (ctrl && e.shiftKey && (e.key === "]" || e.key === "}" || e.code === "BracketRight")) ||
        (e.altKey && !ctrl && !e.shiftKey && (e.key === "]" || e.key === "}" || e.code === "BracketRight")) ||
        (e.altKey && !ctrl && !e.shiftKey && e.key === "PageDown");

      if (isPrevTab || isNextTab) {
        e.preventDefault();
        const idx = files.findIndex((f) => f.id === activeTabId);
        if (isPrevTab) {
          const prev = (idx - 1 + files.length) % files.length;
          setActiveTab(files[prev].id);
        } else {
          const next = (idx + 1) % files.length;
          setActiveTab(files[next].id);
        }
        return;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [files, activeTabId, setActiveTab, addFile, removeFile, handleFocusFileSearch, handleFocusSchemaSearch, saveFile, restoreLastClosedTab, requestCloseFile, setActiveSidebarTab, setShowCommandPalette]);

  // Resizable result panel
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    const startY = e.clientY;
    const startHeight = resultHeight;

    const onMouseMove = (moveEvent) => {
      const delta = startY - moveEvent.clientY;
      const newHeight = Math.min(Math.max(startHeight + delta, 100), window.innerHeight - 200);
      setResultHeight(newHeight);
    };

    const onMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  // Sidebar drag resizer handlers
  const handleSidebarMouseDown = (e) => {
    e.preventDefault();
    setIsSidebarDragging(true);
    const startX = e.clientX;
    const startWidth = sidebarWidth;

    const onMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      // Constraint to [180, 600] pixels
      const newWidth = Math.min(Math.max(startWidth + deltaX, 180), 600);
      setSidebarWidth(newWidth);
      localStorage.setItem("livy-sidebar-width", newWidth.toString());
    };

    const onMouseUp = () => {
      setIsSidebarDragging(false);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const handleCornerMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSidebarDragging(true);
    setIsDragging(true);
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = sidebarWidth;
    const startHeight = resultHeight;

    const onMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.min(Math.max(startWidth + deltaX, 180), 600);
      setSidebarWidth(newWidth);
      localStorage.setItem("livy-sidebar-width", newWidth.toString());

      const deltaY = startY - moveEvent.clientY;
      const newHeight = Math.min(Math.max(startHeight + deltaY, 100), window.innerHeight - 200);
      setResultHeight(newHeight);
    };

    const onMouseUp = () => {
      setIsSidebarDragging(false);
      setIsDragging(false);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const handleSidebarDoubleClick = () => {
    setSidebarWidth(240);
    localStorage.setItem("livy-sidebar-width", "240");
  };

  const handleCloseResultPanel = useCallback(() => {
    setResultHeight((h) => {
      if (h > 0) {
        prevResultHeight.current = h;
      }
      return 0;
    });
  }, []);

  const handleToggleMaximizeResultPanel = useCallback(() => {
    setResultHeight((h) => {
      const maxHeight = window.innerHeight - 200;
      if (h >= maxHeight - 10) {
        return prevResultHeight.current || DEFAULT_RESULT_HEIGHT;
      } else {
        prevResultHeight.current = h;
        return maxHeight;
      }
    });
  }, []);

  const isResultMaximized = resultHeight >= window.innerHeight - 210 && resultHeight > 0;

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <ToastContainer />
      <KeyboardShortcuts isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
      <QueryHistory
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        onRerun={(sql) => {
          setShowHistory(false);
          editorRef.current?.runSql(sql);
        }}
      />
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        initialSearch={commandPaletteInitialQuery}
        toggleTheme={toggleTheme}
        setSidebarCollapsed={setSidebarCollapsed}
        setShowShortcuts={setShowShortcuts}
        setShowHistory={setShowHistory}
        setShowConnectionModal={setShowConnectionModal}
        editorRef={editorRef}
        onTriggerBounce={handleTriggerBounce}
        onTriggerSnake={handleTriggerSnake}
      />
      <ConnectionModal isOpen={showConnectionModal} onClose={() => setShowConnectionModal(false)} />
      <TitleBar
        onOpenCommandPalette={() => {
          setCommandPaletteInitialQuery("");
          setShowCommandPalette(true);
        }}
      />

      <div className={`flex flex-1 min-h-0 ${isSidebarDragging ? "select-none" : ""}`}>
        {/* Activity Bar on the far left */}
        <ActivityBar
          activeTab={activeSidebarTab}
          setActiveTab={setActiveSidebarTab}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
        />

        {/* Sidebar tabs */}
        <SidebarTabs
          ref={sidebarTabsRef}
          activeTab={activeSidebarTab}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          onInsertAtCursor={handleInsertAtCursor}
          width={sidebarWidth}
          theme={theme}
          toggleTheme={toggleTheme}
          showConnectionModal={showConnectionModal}
          setShowConnectionModal={setShowConnectionModal}
        />

        {!sidebarCollapsed && (
          <div
            onMouseDown={handleSidebarMouseDown}
            onDoubleClick={handleSidebarDoubleClick}
            className={`dg-sidebar-resize-handle ${isSidebarDragging || isCornerHovered ? "is-dragging" : ""}`}
            title="Drag to resize, double-click to reset"
          />
        )}

        {/* Main Editor + Results Area */}
        <div className="flex flex-col flex-1 min-h-0 min-w-0">
          <TabBar sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed} editorRef={editorRef} />
          
          {activeFile ? (
            <>
              {activeGames[activeFile.id] === 'bounce' ? (
                <BounceGame
                  onClose={() => {
                    setActiveGames((prev) => ({ ...prev, [activeFile.id]: null }));
                  }}
                  theme={theme}
                />
              ) : activeGames[activeFile.id] === 'snake' ? (
                <SnakeGame
                  onClose={() => {
                    setActiveGames((prev) => ({ ...prev, [activeFile.id]: null }));
                  }}
                />
              ) : (
                <>
                  <SqlEditor
                    ref={editorRef}
                    onCursorPositionChange={setCursorPosition}
                    theme={theme}
                    onFocusSchemaSearch={handleFocusSchemaSearch}
                    onFocusFileSearch={handleFocusFileSearch}
                    onToggleCommandPalette={() => setShowCommandPalette((p) => !p)}
                    onToggleSidebar={() => setSidebarCollapsed((p) => !p)}
                    onToggleResultPanel={() => {
                      setResultHeight((h) => {
                        if (h > 0) {
                          prevResultHeight.current = h;
                          return 0;
                        }
                        return prevResultHeight.current || DEFAULT_RESULT_HEIGHT;
                      });
                    }}
                    onNewTab={addFile}
                    onCloseTab={() => {
                      requestCloseFile(activeTabId);
                    }}
                    onToggleQueryHistory={() => {
                      setShowHistory((p) => !p);
                      setShowShortcuts(false);
                      setShowConnectionModal(false);
                    }}
                    onToggleShortcuts={() => {
                      setShowShortcuts((p) => !p);
                      setShowHistory(false);
                      setShowConnectionModal(false);
                    }}
                    onToggleConnectionModal={() => {
                      setShowConnectionModal((p) => !p);
                      setShowShortcuts(false);
                      setShowHistory(false);
                    }}
                    onPrevTab={() => {
                      const idx = files.findIndex((f) => f.id === activeTabId);
                      const prev = (idx - 1 + files.length) % files.length;
                      setActiveTab(files[prev].id);
                    }}
                    onNextTab={() => {
                      const idx = files.findIndex((f) => f.id === activeTabId);
                      const next = (idx + 1) % files.length;
                      setActiveTab(files[next].id);
                    }}
                    onSwitchToTab={(index) => {
                      if (index < files.length) {
                        setActiveTab(files[index].id);
                      }
                    }}
                    onRestoreTab={restoreLastClosedTab}
                    onTriggerBounce={handleTriggerBounce}
                    onTriggerSnake={handleTriggerSnake}
                  />

                  {/* Resize Handle */}
                  {resultHeight > 0 && (
                    <div
                      onMouseDown={handleMouseDown}
                      className={`relative h-[4px] -mb-[4px] cursor-row-resize shrink-0 z-30 transition-colors ${
                        isDragging || isCornerHovered
                          ? "bg-(--color-accent)"
                          : "bg-transparent hover:bg-(--color-accent)/50"
                      }`}
                    >
                      {/* Corner Resizer (Intersection of sidebar and results handles) */}
                      {!sidebarCollapsed && (
                        <div
                          onMouseDown={handleCornerMouseDown}
                          onMouseEnter={() => setIsCornerHovered(true)}
                          onMouseLeave={() => setIsCornerHovered(false)}
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 -ml-[10px] cursor-all-scroll z-50 bg-transparent"
                          title="Drag to resize sidebar width and results height simultaneously"
                        />
                      )}
                    </div>
                  )}

                  {/* Result Panel */}
                  {resultHeight > 0 && (
                    <div
                      className="shrink-0 bg-(--color-bg-secondary) border-t border-(--color-border) overflow-hidden"
                      style={{ height: resultHeight }}
                    >
                      <ResultTable 
                        result={activeResult} 
                        onClose={handleCloseResultPanel}
                        onMaximizeToggle={handleToggleMaximizeResultPanel}
                        isMaximized={isResultMaximized}
                      />
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <WelcomeScreen
              onCreateFile={() => addFile()}
              onFocusFiles={handleFocusFileSearch}
              onFocusSchema={handleFocusSchemaSearch}
              onShowShortcuts={() => setShowShortcuts(true)}
              onShowHistory={() => setShowHistory(true)}
              onRestoreTab={restoreLastClosedTab}
              hasClosedTabs={closedTabsHistory && closedTabsHistory.length > 0}
            />
          )}
        </div>
      </div>
      <StatusBar cursorPosition={cursorPosition} onShowShortcuts={() => setShowShortcuts(true)} onShowHistory={() => setShowHistory(true)} />
    </div>
  );
}
