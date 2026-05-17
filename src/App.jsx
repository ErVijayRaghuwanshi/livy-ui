import { useState, useEffect, useRef, useCallback } from "react";
import Navbar from "./components/Navbar";
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

const SIDEBAR_CACHE_KEY = "livy-ui-explorer-collapsed";
const THEME_CACHE_KEY = "livy-ui-theme";
const DEFAULT_RESULT_HEIGHT = 250;

export default function App() {
  const { activeResult, files, activeTabId, setActiveTab, addFile, removeFile } = useSqlFiles();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_CACHE_KEY);
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_CACHE_KEY) || "dark");
  const [resultHeight, setResultHeight] = useState(DEFAULT_RESULT_HEIGHT);
  const [isDragging, setIsDragging] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(null);
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

      // Ctrl+B — toggle sidebar
      if (ctrl && !e.shiftKey && e.key === "b") {
        e.preventDefault();
        setSidebarCollapsed((p) => !p);
        return;
      }

      // Ctrl+` — toggle result panel
      if (ctrl && !e.shiftKey && e.key === "`") {
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

      // Ctrl+Enter — run SQL
      if (ctrl && !e.shiftKey && e.key === "Enter") {
        e.preventDefault();
        editorRef.current?.run();
        return;
      }

      // Ctrl+Shift+F — format SQL
      if (ctrl && e.shiftKey && e.key === "F") {
        e.preventDefault();
        editorRef.current?.format();
        return;
      }

      // Ctrl+Shift+M — minify SQL to one line
      if (ctrl && e.shiftKey && e.key === "M") {
        e.preventDefault();
        editorRef.current?.minify();
        return;
      }

      // Ctrl+Shift+N — new tab
      if (ctrl && e.shiftKey && e.key === "N") {
        e.preventDefault();
        addFile();
        return;
      }

      // Ctrl+Shift+W — close active tab
      if (ctrl && e.shiftKey && e.key === "W") {
        e.preventDefault();
        if (files.length > 1) {
          removeFile(activeTabId);
        }
        return;
      }

      // Ctrl+H — toggle query history
      if (ctrl && !e.shiftKey && e.key === "h") {
        e.preventDefault();
        setShowHistory((p) => !p);

        // hide other two, 
        setShowShortcuts(false);
        setShowConnectionModal(false);
        return;
      }

      // Ctrl+/ — show keyboard shortcuts
      if (ctrl && !e.shiftKey && e.key === "/") {
        e.preventDefault();
        setShowShortcuts((p) => !p);

        // hide other two, 
        setShowHistory(false);
        setShowConnectionModal(false);
        return;
      }

      // Ctrl+Shift+E — focus file explorer
      if (ctrl && e.shiftKey && e.key === "E") {
        e.preventDefault();
        handleFocusFileSearch();
        return;
      }

      // Ctrl+Shift+S — focus schema explorer
      if (ctrl && e.shiftKey && e.key === "S") {
        e.preventDefault();
        handleFocusSchemaSearch();
        return;
      }

      // Ctrl+. — manage Livy hosts
      if (ctrl && !e.shiftKey && e.key === ".") {
        e.preventDefault();
        setShowConnectionModal((p) => !p);

        // hide other two, 
        setShowShortcuts(false);
        setShowHistory(false);
        return;
      }

      // Ctrl+PageDown / Ctrl+PageUp — next/prev tab
      if (ctrl && !e.shiftKey && (e.key === "PageDown" || e.key === "PageUp")) {
        e.preventDefault();
        const idx = files.findIndex((f) => f.id === activeTabId);
        if (e.key === "PageUp") {
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
  }, [files, activeTabId, setActiveTab, addFile, removeFile, handleFocusFileSearch, handleFocusSchemaSearch]);

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
      <Navbar 
        theme={theme} 
        toggleTheme={toggleTheme}
        showConnectionModal={showConnectionModal}
        setShowConnectionModal={setShowConnectionModal}
      />

      <div className="flex flex-1 min-h-0">
        {/* Sidebar with Files and Schema tabs */}
        <SidebarTabs ref={sidebarTabsRef} collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} onInsertAtCursor={handleInsertAtCursor} />

        {/* Main Editor + Results Area */}
        <div className="flex flex-col flex-1 min-h-0 min-w-0">
          <TabBar sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed} editorRef={editorRef} />
          <SqlEditor ref={editorRef} onCursorPositionChange={setCursorPosition} theme={theme} onFocusSchemaSearch={handleFocusSchemaSearch} />

          {/* Resize Handle */}
          <div
            onMouseDown={handleMouseDown}
            className={`flex items-center justify-center h-2 cursor-row-resize shrink-0 transition-colors ${
              isDragging
                ? "bg-(--color-accent)"
                : "bg-(--color-border) hover:bg-(--color-accent)/50"
            }`}
          >
            <GripHorizontal size={14} className="text-(--color-text-muted)" />
          </div>

          {/* Result Panel */}
          <div
            className="shrink-0 bg-(--color-bg-secondary) border-t border-(--color-border)"
            style={{ height: resultHeight }}
          >
            <ResultTable result={activeResult} />
          </div>
        </div>
      </div>
      <StatusBar cursorPosition={cursorPosition} onShowShortcuts={() => setShowShortcuts(true)} onShowHistory={() => setShowHistory(true)} />
    </div>
  );
}
