import { useState, useEffect, useRef } from "react";
import Navbar from "./components/Navbar";
import TabBar from "./components/TabBar";
import SqlEditor from "./components/SqlEditor";
import ResultTable from "./components/ResultTable";
import SchemaExplorer from "./components/SchemaExplorer";
import { GripHorizontal } from "lucide-react";
import { useSqlFiles } from "./context/SqlFilesContext";

const SIDEBAR_CACHE_KEY = "livy-ui-explorer-collapsed";
const DEFAULT_RESULT_HEIGHT = 250;

export default function App() {
  const { activeResult, files, activeTabId, setActiveTab, addFile, removeFile } = useSqlFiles();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_CACHE_KEY);
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [resultHeight, setResultHeight] = useState(DEFAULT_RESULT_HEIGHT);
  const [isDragging, setIsDragging] = useState(false);
  const editorRef = useRef(null);
  const prevResultHeight = useRef(DEFAULT_RESULT_HEIGHT);

  // Persist sidebar collapsed state
  useEffect(() => {
    localStorage.setItem(SIDEBAR_CACHE_KEY, JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

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
  }, [files, activeTabId, setActiveTab, addFile, removeFile]);

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
      <Navbar />

      <div className="flex flex-1 min-h-0">
        {/* Schema Explorer Sidebar */}
        <SchemaExplorer collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

        {/* Main Editor + Results Area */}
        <div className="flex flex-col flex-1 min-h-0 min-w-0">
          <TabBar />
          <SqlEditor ref={editorRef} />

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
    </div>
  );
}
