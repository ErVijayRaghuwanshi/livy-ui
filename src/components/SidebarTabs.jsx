import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { FileCode, Database } from "lucide-react";
import FileExplorer from "./FileExplorer";
import SchemaExplorer from "./SchemaExplorer";
import { useSchema } from "../context/SchemaContext";

const SIDEBAR_TAB_KEY = "livy-sidebar-tab";

const SidebarTabs = forwardRef(({ collapsed, setCollapsed, onInsertAtCursor }, ref) => {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem(SIDEBAR_TAB_KEY) || "files";
  });
  const fileExplorerRef = useRef(null);
  const schemaExplorerRef = useRef(null);
  const { refreshTrigger } = useSchema();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_TAB_KEY, activeTab);
  }, [activeTab]);

  useImperativeHandle(ref, () => ({
    focusFileSearch: () => {
      if (collapsed) {
        setCollapsed(false);
      }
      setActiveTab("files");
      setTimeout(() => {
        fileExplorerRef.current?.focusSearch();
      }, 100);
    },
    focusSchemaSearch: () => {
      if (collapsed) {
        setCollapsed(false);
      }
      setActiveTab("schema");
      setTimeout(() => {
        schemaExplorerRef.current?.focusSearch();
      }, 100);
    },
  }));

  if (collapsed) {
    return null;
  }

  return (
    <div className="flex flex-col w-full sm:w-56 md:w-64 bg-(--color-bg-secondary) border-r border-(--color-border) shrink-0 max-w-full sm:max-w-56 md:max-w-64">
      {/* Tab Switcher */}
      <div className="flex border-b border-(--color-border)">
        <button
          onClick={() => setActiveTab("files")}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium transition-colors ${
            activeTab === "files"
              ? "bg-(--color-bg-primary) text-(--color-text-primary) border-b-2 border-b-(--color-accent)"
              : "text-(--color-text-muted) hover:text-(--color-text-secondary) hover:bg-(--color-bg-tertiary)"
          }`}
        >
          <FileCode size={14} />
          <span>Files</span>
        </button>
        <button
          onClick={() => setActiveTab("schema")}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium transition-colors ${
            activeTab === "schema"
              ? "bg-(--color-bg-primary) text-(--color-text-primary) border-b-2 border-b-(--color-accent)"
              : "text-(--color-text-muted) hover:text-(--color-text-secondary) hover:bg-(--color-bg-tertiary)"
          }`}
        >
          <Database size={14} />
          <span>Schema</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 min-h-0">
        {activeTab === "files" ? (
          <FileExplorer ref={fileExplorerRef} onInsertAtCursor={onInsertAtCursor} />
        ) : (
          <SchemaExplorer ref={schemaExplorerRef} onInsertAtCursor={onInsertAtCursor} refreshTrigger={refreshTrigger} />
        )}
      </div>
    </div>
  );
});

SidebarTabs.displayName = "SidebarTabs";

export default SidebarTabs;
