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
import { useSqlFiles } from "./context/SqlFilesContext";
import { ToastContainer } from "./components/Toast";
import WelcomeScreen from "./components/WelcomeScreen";
import BounceGame from "./components/BounceGame";
import SnakeGame from "./components/SnakeGame";
import SettingsTab from "./components/SettingsTab";
import SettingsModal from "./components/SettingsModal";
import { useSettings } from "./context/SettingsContext";

const SIDEBAR_CACHE_KEY = "livy-ui-explorer-collapsed";
const THEME_CACHE_KEY = "livy-ui-theme";
const DEFAULT_RESULT_HEIGHT = 250;

export default function App() {
  const { activeFile, activeResult, files, activeTabId, setActiveTab, addFile, removeFile, saveFile, restoreLastClosedTab, closedTabsHistory, requestCloseFile, openSettingsTab, clearFileResults } = useSqlFiles();

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
  const { settings } = useSettings();
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(null);
  const [syntaxErrors, setSyntaxErrors] = useState([]);

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
    setSidebarCollapsed(false);
    setActiveSidebarTab("schema");
    setTimeout(() => {
      sidebarTabsRef.current?.focusSchemaSearch();
    }, 50);
  }, [setActiveSidebarTab, setSidebarCollapsed]);

  const handleFocusFileSearch = useCallback(() => {
    setSidebarCollapsed(false);
    setActiveSidebarTab("files");
    setTimeout(() => {
      sidebarTabsRef.current?.focusFileSearch();
    }, 50);
  }, [setActiveSidebarTab, setSidebarCollapsed]);

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

      // Ctrl+P / Cmd+P — Toggle Custom Command Palette
      if (ctrl && !e.altKey && !e.shiftKey && (e.key.toLowerCase() === "p" || e.code === "KeyP")) {
        e.preventDefault();
        setCommandPaletteInitialQuery("");
        setShowCommandPalette((p) => !p);
        return;
      }

      // Ctrl+Shift+P / Cmd+Shift+P — Trigger Monaco Editor Command Palette
      if (ctrl && !e.altKey && e.shiftKey && (e.key.toLowerCase() === "p" || e.code === "KeyP")) {
        e.preventDefault();
        setShowCommandPalette(false);
        editorRef.current?.triggerCommandPalette();
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

      // Ctrl+H — toggle query history (on Mac, Cmd+H hides the window, so we must use Ctrl+H)
      if (e.ctrlKey && !e.altKey && !e.shiftKey && (e.key.toLowerCase() === "h" || e.code === "KeyH")) {
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

      // Ctrl+, / Cmd+, — open Settings overlay modal
      if (ctrl && !e.altKey && !e.shiftKey && e.key === ",") {
        e.preventDefault();
        setIsSettingsOpen((p) => !p);
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

      // Ctrl+S / Cmd+S — save SQL (format on save if enabled, clear dirty state)
      if (ctrl && !e.altKey && !e.shiftKey && (e.key.toLowerCase() === "s" || e.code === "KeyS")) {
        e.preventDefault();
        if (settings["editor.formatOnSave"]) {
          editorRef.current?.format();
        }
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
    const wasCollapsed = sidebarCollapsed;
    const startWidth = wasCollapsed ? 0 : sidebarWidth;
    let dragged = false;

    const onMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      if (Math.abs(deltaX) > 3) {
        dragged = true;
      }
      const targetWidth = wasCollapsed ? deltaX : startWidth + deltaX;
      if (targetWidth < 60) {
        if (!wasCollapsed) {
          setSidebarCollapsed(true);
        }
      } else {
        setSidebarCollapsed(false);
        const newWidth = Math.min(Math.max(targetWidth, 180), 600);
        setSidebarWidth(newWidth);
        localStorage.setItem("livy-sidebar-width", newWidth.toString());
      }
    };

    const onMouseUp = () => {
      setIsSidebarDragging(false);
      if (!dragged && wasCollapsed) {
        setSidebarCollapsed(false);
      }
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
      const targetWidth = startWidth + deltaX;
      if (targetWidth < 80) {
        setSidebarCollapsed(true);
      } else {
        setSidebarCollapsed(false);
        const newWidth = Math.min(Math.max(targetWidth, 180), 600);
        setSidebarWidth(newWidth);
        localStorage.setItem("livy-sidebar-width", newWidth.toString());
      }

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
    if (sidebarCollapsed) {
      setSidebarCollapsed(false);
    } else {
      setSidebarWidth(240);
      localStorage.setItem("livy-sidebar-width", "240");
    }
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
    <div className="flex flex-col h-screen overflow-hidden bg-(--color-bg-workbench)">
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
        onOpenSettings={() => setIsSettingsOpen(true)}
        editorRef={editorRef}
        onTriggerBounce={handleTriggerBounce}
        onTriggerSnake={handleTriggerSnake}
      />
      <ConnectionModal isOpen={showConnectionModal} onClose={() => setShowConnectionModal(false)} />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onOpenAsTab={() => {
          setIsSettingsOpen(false);
          openSettingsTab();
        }}
        theme={theme}
        toggleTheme={toggleTheme}
        setShowConnectionModal={setShowConnectionModal}
      />
      <TitleBar
        onOpenCommandPalette={() => {
          setCommandPaletteInitialQuery("");
          setShowCommandPalette(true);
        }}
      />

      <div className={`flex flex-1 min-h-0 bg-(--color-bg-workbench) ${isSidebarDragging ? "select-none" : ""}`}>
        {/* Activity Bar on the far left */}
        <ActivityBar
          activeTab={activeSidebarTab}
          setActiveTab={setActiveSidebarTab}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          isSettingsOpen={isSettingsOpen}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* Floating Workspace Islands Container */}
        <div className="flex flex-1 min-h-0 min-w-0 p-[2px] gap-0 overflow-hidden">
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

          <div
            onMouseDown={handleSidebarMouseDown}
            onDoubleClick={handleSidebarDoubleClick}
            className={`dg-sidebar-resize-handle group ${isSidebarDragging || isCornerHovered ? "is-dragging" : ""}`}
            title={sidebarCollapsed ? "Click or drag to expand sidebar" : "Drag to resize sidebar width, double-click to reset"}
          >
            {/* Hit area */}
            <div className="absolute -inset-x-2 inset-y-0 z-10" />

            {/* Thin blue line - visible only on hover or dragging */}
            <div
              className={`h-full w-[2px] rounded-full transition-opacity duration-150 ${
                isSidebarDragging || isCornerHovered
                  ? "bg-(--color-accent) opacity-100"
                  : "bg-(--color-accent) opacity-0 group-hover:opacity-100"
              }`}
            />

            {/* VS Code authentic 3-dot sash hint (vertical grip between sidebar and editor) */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-[3px] pointer-events-none">
              <div
                className={`w-[2.5px] h-[2.5px] rounded-full transition-colors duration-150 ${
                  isSidebarDragging || isCornerHovered ? "bg-white" : "bg-[#6e6e6e] group-hover:bg-white"
                }`}
              />
              <div
                className={`w-[2.5px] h-[2.5px] rounded-full transition-colors duration-150 ${
                  isSidebarDragging || isCornerHovered ? "bg-white" : "bg-[#6e6e6e] group-hover:bg-white"
                }`}
              />
              <div
                className={`w-[2.5px] h-[2.5px] rounded-full transition-colors duration-150 ${
                  isSidebarDragging || isCornerHovered ? "bg-white" : "bg-[#6e6e6e] group-hover:bg-white"
                }`}
              />
            </div>
          </div>

          {/* Main Workspace Column (Editor Island + Terminal Island) */}
          <div className="flex flex-col flex-1 min-h-0 min-w-0 gap-0 overflow-hidden">
            {/* Top Island: Editor Card */}
            <div className="flex flex-col flex-1 min-h-0 min-w-0 rounded-xl border border-(--color-border) bg-(--color-bg-primary) shadow-xs overflow-hidden">
              <TabBar sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed} editorRef={editorRef} />
              
              {activeFile ? (
                activeFile.id === "settings" ? (
                  <SettingsTab
                    theme={theme}
                    toggleTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
                    setShowConnectionModal={setShowConnectionModal}
                    onOpenAsModal={() => setIsSettingsOpen(true)}
                  />
                ) : activeGames[activeFile.id] === 'bounce' ? (
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
                  <SqlEditor
                    ref={editorRef}
                    onCursorPositionChange={setCursorPosition}
                    onSyntaxErrorsChange={setSyntaxErrors}
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
                )
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

            {/* Horizontal Resize Handle between Editor Island and Terminal Island */}
            {activeFile && !activeGames[activeFile.id] && activeFile.id !== "settings" && resultHeight > 0 && (
              <div
                onMouseDown={handleMouseDown}
                onDoubleClick={() => setResultHeight(DEFAULT_RESULT_HEIGHT)}
                className={`relative h-[2px] shrink-0 cursor-row-resize z-30 flex items-center justify-center select-none group ${
                  isDragging || isCornerHovered ? "is-dragging" : ""
                }`}
                title="Drag to resize results panel height, double-click to reset"
              >
                {/* Hit area */}
                <div className="absolute -inset-y-2 inset-x-0 z-10" />

                {/* Thin blue line - visible only on hover or dragging */}
                <div
                  className={`w-full h-[2px] rounded-full transition-opacity duration-150 ${
                    isDragging || isCornerHovered
                      ? "bg-(--color-accent) opacity-100"
                      : "bg-(--color-accent) opacity-0 group-hover:opacity-100"
                  }`}
                />

                {/* VS Code authentic 3-dot sash hint (pure visual grip, exactly matching VS Code) */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center gap-[3px] pointer-events-none">
                  <div
                    className={`w-[2.5px] h-[2.5px] rounded-full transition-colors duration-150 ${
                      isDragging || isCornerHovered ? "bg-white" : "bg-[#6e6e6e] group-hover:bg-white"
                    }`}
                  />
                  <div
                    className={`w-[2.5px] h-[2.5px] rounded-full transition-colors duration-150 ${
                      isDragging || isCornerHovered ? "bg-white" : "bg-[#6e6e6e] group-hover:bg-white"
                    }`}
                  />
                  <div
                    className={`w-[2.5px] h-[2.5px] rounded-full transition-colors duration-150 ${
                      isDragging || isCornerHovered ? "bg-white" : "bg-[#6e6e6e] group-hover:bg-white"
                    }`}
                  />
                </div>

                {/* 2D Cross-Section Corner Resizer (Intersection of Sidebar and Results handles) - only visible on hover */}
                {!sidebarCollapsed && (
                  <div
                    onMouseDown={handleCornerMouseDown}
                    onMouseEnter={() => setIsCornerHovered(true)}
                    onMouseLeave={() => setIsCornerHovered(false)}
                    className="absolute -left-[9px] top-1/2 -translate-y-1/2 w-4 h-4 cursor-all-scroll z-50 flex items-center justify-center group/corner"
                    title="Drag to resize sidebar width and results height simultaneously"
                  >
                    <div
                      className={`w-2.5 h-2.5 rounded-full transition-all duration-150 border border-(--color-bg-workbench) ${
                        isCornerHovered || (isDragging && isSidebarDragging)
                          ? "bg-(--color-accent) scale-125 ring-2 ring-(--color-accent)/50 shadow-md opacity-100"
                          : "bg-(--color-accent) opacity-0 group-hover/corner:opacity-100 group-hover:opacity-75 scale-110"
                      }`}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Bottom Island: Detached Terminal / Results Panel */}
            {activeFile && !activeGames[activeFile.id] && activeFile.id !== "settings" && resultHeight > 0 && (
              <div
                className="flex flex-col shrink-0 rounded-xl border border-(--color-border) bg-(--color-bg-secondary) shadow-xs overflow-hidden"
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
          </div>
        </div>
      </div>
      <StatusBar
        cursorPosition={cursorPosition}
        syntaxErrors={syntaxErrors}
        onJumpToFirstError={() => editorRef.current?.jumpToFirstSyntaxError()}
        onShowShortcuts={() => setShowShortcuts(true)}
        onShowHistory={() => setShowHistory(true)}
      />
    </div>
  );
}
