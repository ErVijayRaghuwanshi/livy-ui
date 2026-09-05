import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { FileCode, ChevronDown, ChevronRight, CircleMinus, RefreshCw, FilePlus, Loader2, X, PanelLeftClose } from "lucide-react";
import FileExplorer from "./FileExplorer";
import SchemaExplorer from "./SchemaExplorer";
import SearchPanel from "./SearchPanel";
import SettingsPanel from "./SettingsPanel";
import { useSchema } from "../context/SchemaContext";
import { useSqlFiles } from "../context/SqlFilesContext";
import { useLivy } from "../context/LivyContext";
import { SESSION_STATES } from "../utils/constants";

const SidebarTabs = forwardRef(({
  activeTab,
  collapsed,
  setCollapsed,
  onInsertAtCursor,
  width,
  theme,
  toggleTheme,
  showConnectionModal,
  setShowConnectionModal
}, ref) => {
  const { 
    files, 
    openFiles, 
    activeTabId, 
    setActiveTab, 
    closeFile, 
    requestCloseFile, 
    closeAllFiles, 
    addFile, 
    dirtyFiles,
    previewTabId,
    promotePreviewTab
  } = useSqlFiles();

  const { refreshSchema, loading } = useSchema();
  const { sessionId, sessionState } = useLivy();
  const isLivyReady = sessionState === SESSION_STATES.IDLE && sessionId !== null;

  const fileExplorerRef = useRef(null);
  const schemaExplorerRef = useRef(null);

  const [expandedSections, setExpandedSections] = useState(() => {
    const saved = localStorage.getItem("livy-sidebar-expanded-sections");
    return saved ? JSON.parse(saved) : { openEditors: true, files: true };
  });

  useEffect(() => {
    localStorage.setItem("livy-sidebar-expanded-sections", JSON.stringify(expandedSections));
  }, [expandedSections]);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  useImperativeHandle(ref, () => ({
    focusFileSearch: () => {
      setCollapsed(false);
      setExpandedSections((prev) => ({ ...prev, files: true }));
      setTimeout(() => {
        fileExplorerRef.current?.focusSearch();
      }, 100);
    },
    focusSchemaSearch: () => {
      setCollapsed(false);
      setTimeout(() => {
        schemaExplorerRef.current?.focusSearch();
      }, 100);
    },
  }));

  if (collapsed) {
    return null;
  }

  // 1. SETTINGS PANEL TAB
  if (activeTab === "settings") {
    return (
      <div
        style={{ width: `${width}px`, minWidth: `${width}px`, maxWidth: `${width}px` }}
        className="flex flex-col bg-(--color-bg-secondary) rounded-xl border border-(--color-border) shadow-xs shrink-0 overflow-hidden h-full"
      >
        <div className="flex items-center justify-between px-3 py-2 border-b border-(--color-border) bg-(--color-bg-secondary)/10">
          <span className="text-[11px] font-bold text-(--color-text-primary) uppercase tracking-wider">
            Settings
          </span>
          <button
            onClick={() => setCollapsed(true)}
            className="p-1 rounded hover:bg-(--color-bg-tertiary) text-(--color-text-muted) hover:text-(--color-text-secondary) transition-colors cursor-pointer"
            title="Collapse Sidebar (Ctrl+B)"
          >
            <PanelLeftClose size={13} />
          </button>
        </div>
        <SettingsPanel
          theme={theme}
          toggleTheme={toggleTheme}
          showConnectionModal={showConnectionModal}
          setShowConnectionModal={setShowConnectionModal}
        />
      </div>
    );
  }

  // 2. SEARCH PANEL TAB
  if (activeTab === "search") {
    return (
      <div
        style={{ width: `${width}px`, minWidth: `${width}px`, maxWidth: `${width}px` }}
        className="flex flex-col bg-(--color-bg-secondary) rounded-xl border border-(--color-border) shadow-xs shrink-0 overflow-hidden h-full"
      >
        <div className="flex items-center justify-between px-3 py-2 border-b border-(--color-border) bg-(--color-bg-secondary)/10">
          <span className="text-[11px] font-bold text-(--color-text-primary) uppercase tracking-wider">
            Search
          </span>
          <button
            onClick={() => setCollapsed(true)}
            className="p-1 rounded hover:bg-(--color-bg-tertiary) text-(--color-text-muted) hover:text-(--color-text-secondary) transition-colors cursor-pointer"
            title="Collapse Sidebar (Ctrl+B)"
          >
            <PanelLeftClose size={13} />
          </button>
        </div>
        <SearchPanel />
      </div>
    );
  }

  // 3. SCHEMA PANEL TAB (Independent Tab)
  if (activeTab === "schema") {
    return (
      <div
        style={{ width: `${width}px`, minWidth: `${width}px`, maxWidth: `${width}px` }}
        className="flex flex-col bg-(--color-bg-secondary) rounded-xl border border-(--color-border) shadow-xs shrink-0 overflow-hidden h-full"
      >
        <div className="flex items-center justify-between px-3 py-2 border-b border-(--color-border) bg-(--color-bg-secondary)/10">
          <span className="text-[11px] font-bold text-(--color-text-primary) uppercase tracking-wider">
            Schema Explorer
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => refreshSchema()}
              disabled={!isLivyReady || loading._dbs}
              className="p-1 rounded hover:bg-(--color-bg-tertiary) text-(--color-text-muted) hover:text-(--color-accent) transition-colors disabled:opacity-30 cursor-pointer"
              title="Refresh Schema"
            >
              {loading._dbs ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <RefreshCw size={13} />
              )}
            </button>
            <button
              onClick={() => setCollapsed(true)}
              className="p-1 rounded hover:bg-(--color-bg-tertiary) text-(--color-text-muted) hover:text-(--color-text-secondary) transition-colors cursor-pointer"
              title="Collapse Sidebar (Ctrl+B)"
            >
              <PanelLeftClose size={13} />
            </button>
          </div>
        </div>
        <div className="flex-1 min-h-0">
          <SchemaExplorer ref={schemaExplorerRef} onInsertAtCursor={onInsertAtCursor} showHeader={false} />
        </div>
      </div>
    );
  }

  // 4. FILES / EXPLORER PANEL TAB (Default)
  const openFilesData = openFiles.map((id) => files.find((f) => f.id === id)).filter(Boolean);

  return (
    <div
      style={{ width: `${width}px`, minWidth: `${width}px`, maxWidth: `${width}px` }}
      className="flex flex-col bg-(--color-bg-secondary) rounded-xl border border-(--color-border) shadow-xs shrink-0 overflow-hidden h-full"
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-(--color-border) bg-(--color-bg-secondary)/10">
        <span className="text-[11px] font-bold text-(--color-text-primary) uppercase tracking-wider">
          Explorer
        </span>
        <button
          onClick={() => setCollapsed(true)}
          className="p-1 rounded hover:bg-(--color-bg-tertiary) text-(--color-text-muted) hover:text-(--color-text-secondary) transition-colors cursor-pointer"
          title="Collapse Sidebar (Ctrl+B)"
        >
          <PanelLeftClose size={13} />
        </button>
      </div>

      {/* 1. OPEN EDITORS Section */}
      <div className={`flex flex-col border-b border-(--color-border) ${expandedSections.openEditors ? "max-h-[250px] shrink-0" : "h-auto"}`}>
        <div 
          onClick={() => toggleSection("openEditors")}
          className="flex items-center justify-between px-2 py-1.5 bg-(--color-bg-secondary) hover:bg-(--color-bg-tertiary)/15 cursor-pointer select-none group"
        >
          <div className="flex items-center gap-1 min-w-0">
            {expandedSections.openEditors ? <ChevronDown size={14} className="text-(--color-text-muted)" /> : <ChevronRight size={14} className="text-(--color-text-muted)" />}
            <span className="text-[10px] font-bold text-(--color-text-secondary) uppercase tracking-wider truncate">
              Open Editors
            </span>
            {openFilesData.filter(f => dirtyFiles[f.id]).length > 0 ? (
              <span className="ml-1 px-1.5 py-0.5 text-[9px] bg-[#0078d4] text-white rounded font-medium shrink-0">
                {openFilesData.filter(f => dirtyFiles[f.id]).length} unsaved
              </span>
            ) : openFilesData.length > 0 ? (
              <span className="ml-1 px-1.5 py-0.2 text-[9px] bg-(--color-bg-tertiary) text-(--color-text-muted) rounded-full font-semibold shrink-0">
                {openFilesData.length}
              </span>
            ) : null}
          </div>
          {openFilesData.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeAllFiles();
              }}
              className="p-1 rounded hover:bg-(--color-bg-tertiary) text-(--color-text-muted) hover:text-(--color-error) transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
              title="Close All Editors"
            >
              <CircleMinus size={13} />
            </button>
          )}
        </div>

        {expandedSections.openEditors && (
          <div className="overflow-y-auto py-1 border-t border-(--color-border)/35 bg-(--color-bg-secondary)/15 max-h-[200px]">
            {openFilesData.length === 0 ? (
              <div className="px-5 py-3 text-[11px] text-(--color-text-muted) italic text-center">
                No open editors
              </div>
            ) : (
              <div className="flex flex-col">
                {openFilesData.map((file) => {
                  const isActive = activeTabId === file.id;
                  const isDirty = dirtyFiles[file.id];
                  return (
                    <div
                      key={file.id}
                      onClick={() => setActiveTab(file.id)}
                      onDoubleClick={() => promotePreviewTab(file.id)}
                      className={`group flex items-center justify-between px-4 py-1.5 text-xs cursor-pointer select-none transition-colors ${
                        isActive
                          ? "bg-(--color-bg-primary) text-(--color-text-primary) border-l-2 border-l-(--color-accent)"
                          : "text-(--color-text-secondary) hover:bg-(--color-bg-tertiary)/40"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <FileCode size={13} className={`shrink-0 ${isActive ? "text-[#ff7b72]" : "text-[#ff7b72]/60"}`} />
                        <span className={`truncate ${isActive ? "font-semibold text-(--color-text-primary)" : ""} ${file.id === previewTabId ? "italic text-(--color-text-secondary)/80" : ""}`}>
                          {file.name}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-center w-4 h-4 ml-2" onClick={(e) => e.stopPropagation()}>
                        {isDirty && (
                          <span className="w-1.5 h-1.5 rounded-full bg-white group-hover:hidden" />
                        )}
                        <button
                          onClick={() => requestCloseFile(file.id)}
                          className={`p-0.5 rounded hover:bg-(--color-bg-tertiary) text-(--color-text-muted) hover:text-(--color-error) transition-colors cursor-pointer ${
                            isDirty ? "hidden group-hover:flex" : "opacity-0 group-hover:opacity-100 flex"
                          }`}
                          title="Close Tab"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. FILES Section */}
      <div className={`flex flex-col border-b border-(--color-border) ${expandedSections.files ? "flex-1 min-h-[150px]" : "h-auto"}`}>
        <div 
          onClick={() => toggleSection("files")}
          className="flex items-center justify-between px-2 py-1.5 bg-(--color-bg-secondary) hover:bg-(--color-bg-tertiary)/15 cursor-pointer select-none group"
        >
          <div className="flex items-center gap-1">
            {expandedSections.files ? <ChevronDown size={14} className="text-(--color-text-muted)" /> : <ChevronRight size={14} className="text-(--color-text-muted)" />}
            <span className="text-[10px] font-bold text-(--color-text-secondary) uppercase tracking-wider">
              File Explorer
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpandedSections((prev) => ({ ...prev, files: true }));
              addFile();
            }}
            className="p-1 rounded hover:bg-(--color-bg-tertiary) text-(--color-text-muted) hover:text-(--color-accent) transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
            title="New SQL File"
          >
            <FilePlus size={13} />
          </button>
        </div>

        {expandedSections.files && (
          <div className="flex-1 min-h-0 border-t border-(--color-border)/35">
            <FileExplorer ref={fileExplorerRef} onInsertAtCursor={onInsertAtCursor} showHeaderFooter={false} />
          </div>
        )}
      </div>
    </div>
  );
});

SidebarTabs.displayName = "SidebarTabs";

export default SidebarTabs;
