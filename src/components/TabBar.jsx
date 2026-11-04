import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { Plus, X, FileCode, FileText, Play, Loader2, Settings, Database, HardDrive, Globe, Eye, Columns, Code } from "lucide-react";
import { useSqlFiles, SETTINGS_FILE } from "../context/SqlFilesContext";

const isMac = typeof window !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0;

export default function TabBar({ sidebarCollapsed, setSidebarCollapsed, editorRef }) {
  const {
    files,
    openFiles,
    activeTabId,
    setActiveTab,
    addFile,
    closeFile,
    renameFile,
    reorderFiles,
    dirtyFiles,
    promptCloseFileId,
    setPromptCloseFileId,
    requestCloseFile,
    previewTabId,
    promotePreviewTab,
    markdownViewMode,
    setMarkdownViewMode,
    toggleMarkdownPreview,
  } = useSqlFiles();
  const [running, setRunning] = useState(false);
  const [canRun, setCanRun] = useState(false);
  
  useEffect(() => {
    const interval = setInterval(() => {
      if (editorRef?.current) {
        setRunning(editorRef.current.isRunning?.() || false);
        setCanRun(editorRef.current.canRun?.() || false);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [editorRef]);
  
  const handleRun = () => {
    editorRef?.current?.run();
  };
  
  const handleCancel = () => {
    editorRef?.current?.cancel();
  };
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [inputWidth, setInputWidth] = useState(70);
  const measureRef = useRef(null);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const allFiles = [...files, SETTINGS_FILE];
  const openFilesData = openFiles.map(id => allFiles.find(f => f.id === id)).filter(Boolean);
  const isFinishingRenameRef = useRef(false);

  useLayoutEffect(() => {
    if (renamingId && measureRef.current) {
      const textWidth = measureRef.current.getBoundingClientRect().width;
      setInputWidth(Math.min(Math.max(Math.ceil(textWidth) + 14, 40), 220));
    }
  }, [renameValue, renamingId]);

  const handleStartRename = (file) => {
    if (!file || file.isSpecial || file.id === "settings") return;
    setRenamingId(file.id);
    setRenameValue(file.name);
  };

  const handleFinishRename = (id) => {
    if (isFinishingRenameRef.current) return;
    isFinishingRenameRef.current = true;
    const trimmed = renameValue.trim();
    if (trimmed) {
      const file = allFiles.find((f) => f.id === id);
      if (file && file.name !== trimmed) {
        renameFile(id, trimmed);
      }
    }
    setRenamingId(null);
    setTimeout(() => {
      isFinishingRenameRef.current = false;
    }, 100);
  };

  const handleClose = (e, id) => {
    e.stopPropagation();
    requestCloseFile(id);
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", e.currentTarget);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragEnter = (e, index) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e, toIndex) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== toIndex) {
      reorderFiles(draggedIndex, toIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const activeFile = allFiles.find((f) => f.id === activeTabId);
  const isActiveMarkdown = activeFile?.name?.toLowerCase().endsWith(".md");

  return (
    <div className="flex items-center bg-(--color-bg-workbench) border-b border-(--color-border) shrink-0 overflow-x-auto px-1.5 h-9 gap-1 select-none">
      {!isActiveMarkdown && (
        <div className="flex items-center gap-1 pr-1.5 border-r border-(--color-border)/60 shrink-0">
          {running ? (
            <button
              onClick={handleCancel}
              className="group flex items-center justify-center w-6 h-6 rounded-md bg-(--color-error)/15 text-(--color-error) hover:bg-(--color-error)/25 active:scale-95 transition-all cursor-pointer select-none"
              title="Cancel Query"
            >
              <Loader2 size={12} className="animate-spin text-(--color-error)" />
            </button>
          ) : (
            <button
              onClick={handleRun}
              disabled={!canRun}
              className={`group flex items-center justify-center w-6 h-6 rounded-md transition-all border select-none active:scale-95 ${
                canRun
                  ? "bg-(--color-success)/10 text-(--color-success) border-(--color-success)/30 hover:border-(--color-success)/55 hover:bg-(--color-success)/20 cursor-pointer shadow-xs"
                  : "bg-transparent text-(--color-text-muted) border-transparent opacity-40 cursor-not-allowed pointer-events-none"
              }`}
              title={`Run SQL (${isMac ? "⌘+Enter" : "Ctrl+Enter"})`}
            >
              <Play size={11} className={canRun ? "fill-current" : ""} />
            </button>
          )}
        </div>
      )}
      <div className="flex items-center gap-1 min-w-0">
        {openFilesData.map((file, index) => (
          <div
            key={file.id}
            draggable={renamingId !== file.id}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnter={(e) => handleDragEnter(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            onClick={() => setActiveTab(file.id)}
            onDoubleClick={(e) => {
              e.stopPropagation();
              if (file.isSpecial || file.id === "settings") return;
              if (file.id === previewTabId) {
                promotePreviewTab(file.id);
              }
              handleStartRename(file);
            }}
            className={`group relative flex items-center gap-1.5 px-2.5 h-7 text-xs cursor-pointer rounded-md min-w-0 ${
              renamingId === file.id ? "shrink-0 max-w-none" : "max-w-36 sm:max-w-48"
            } transition-all ${
              draggedIndex === index ? "opacity-50" : ""
            } ${
              dragOverIndex === index ? "ring-2 ring-(--color-accent)" : ""
            } ${
              file.id === activeTabId
                ? "bg-(--color-bg-elevated) text-(--color-text-primary) border border-(--color-border) shadow-xs font-medium"
                : "text-(--color-text-muted) hover:text-(--color-text-primary) hover:bg-(--color-bg-tertiary)/40 border border-transparent"
            }`}
            title={
              file.isSpecial
                ? "Settings"
                : file.isUntitled
                ? `${file.name} (Unsaved)`
                : file.isLocalDisk
                ? `Local Disk: ${file.relativePath || file.name}`
                : `Browser Storage: ${file.name}`
            }
          >
            {file.id === "settings" ? (
              <Settings size={13} className={`shrink-0 ${file.id === activeTabId ? "text-(--color-accent)" : "text-(--color-text-muted)"}`} />
            ) : file.isUntitled ? (
              file.name?.toLowerCase().endsWith(".md") ? (
                <FileText size={13} className={`shrink-0 ${file.id === activeTabId ? "text-sky-400" : "text-sky-400/60"}`} />
              ) : (
                <FileCode size={13} className={`shrink-0 ${file.id === activeTabId ? "text-(--color-accent)" : "text-(--color-text-muted)"}`} />
              )
            ) : file.name?.toLowerCase().endsWith(".md") ? (
              <FileText size={13} className={`shrink-0 ${file.id === activeTabId ? "text-sky-400" : "text-sky-400/60"}`} />
            ) : file.isLocalDisk ? (
              <HardDrive size={13} className={`shrink-0 ${file.id === activeTabId ? "text-emerald-400" : "text-emerald-400/60"}`} />
            ) : (
              <Database size={13} className={`shrink-0 ${file.id === activeTabId ? "text-[#ff7b72]" : "text-[#ff7b72]/60"}`} />
            )}

            {renamingId === file.id ? (
              <div
                className="flex items-center min-w-0"
                onClick={(e) => e.stopPropagation()}
                onDoubleClick={(e) => e.stopPropagation()}
              >
                <input
                  autoFocus
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onFocus={(e) => {
                    const input = e.target;
                    setTimeout(() => {
                      if (document.activeElement === input) {
                        const dotIndex = input.value.lastIndexOf(".");
                        if (dotIndex > 0) {
                          input.setSelectionRange(0, dotIndex);
                        } else {
                          input.select();
                        }
                      }
                    }, 10);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleFinishRename(file.id);
                    }
                    if (e.key === "Escape") {
                      e.preventDefault();
                      isFinishingRenameRef.current = true;
                      setRenamingId(null);
                      setTimeout(() => {
                        isFinishingRenameRef.current = false;
                      }, 100);
                    }
                  }}
                  onBlur={() => handleFinishRename(file.id)}
                  style={{ width: `${inputWidth}px` }}
                  className="h-[20px] bg-(--color-bg-primary) border border-(--color-accent) rounded px-1.5 text-xs text-(--color-text-primary) outline-none box-border leading-none shrink-0"
                />
              </div>
            ) : (
              <span
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  if (file.isSpecial || file.id === "settings") return;
                  if (file.id === previewTabId) {
                    promotePreviewTab(file.id);
                  }
                  handleStartRename(file);
                }}
                className={`truncate ${file.id === previewTabId ? "italic text-(--color-text-secondary)/80" : ""}`}
                title={file.name}
              >
                {file.name}
              </span>
            )}

            <div className="flex items-center ml-auto shrink-0 relative w-4 h-4 justify-center">
              {dirtyFiles[file.id] && (
                <span className="w-1.5 h-1.5 rounded-full bg-white group-hover:hidden transition-all" />
              )}
              <button
                onClick={(e) => handleClose(e, file.id)}
                onDoubleClick={(e) => e.stopPropagation()}
                className={`p-0.5 rounded hover:bg-(--color-bg-tertiary) hover:text-(--color-error) transition-opacity absolute ${
                  dirtyFiles[file.id]
                    ? "opacity-0 group-hover:opacity-100 hidden group-hover:block"
                    : "opacity-0 group-hover:opacity-100"
                }`}
                title="Close tab"
              >
                <X size={11} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => addFile()}
        className="flex items-center justify-center w-6 h-6 rounded-md text-(--color-text-muted) hover:text-(--color-text-primary) hover:bg-(--color-bg-tertiary)/40 transition-colors shrink-0 ml-0.5 cursor-pointer"
        title={`New File (${isMac ? "⌘+⌥+N" : "Ctrl+Alt+N"})`}
        aria-label="New File"
      >
        <Plus size={13} />
      </button>

      {/* Right side editor action controls for Markdown (VS Code style) */}
      {isActiveMarkdown && (
        <div className="ml-auto flex items-center pl-2 shrink-0 pr-1">
          <div className="flex items-center bg-(--color-bg-primary) p-0.5 rounded-md border border-(--color-border)">
            <button
              onClick={() => setMarkdownViewMode("edit")}
              className={`flex items-center justify-center w-6 h-6 rounded transition-colors cursor-pointer ${
                markdownViewMode === "edit"
                  ? "bg-(--color-bg-elevated) text-(--color-text-primary) shadow-2xs"
                  : "text-(--color-text-muted) hover:text-(--color-text-primary)"
              }`}
              title="Edit"
              aria-label="Edit"
            >
              <Code size={13} />
            </button>
            <button
              onClick={() => setMarkdownViewMode("split")}
              className={`flex items-center justify-center w-6 h-6 rounded transition-colors cursor-pointer ${
                markdownViewMode === "split"
                  ? "bg-(--color-bg-elevated) text-(--color-text-primary) shadow-2xs"
                  : "text-(--color-text-muted) hover:text-(--color-text-primary)"
              }`}
              title="Split View"
              aria-label="Split View"
            >
              <Columns size={13} />
            </button>
            <button
              onClick={() => setMarkdownViewMode("preview")}
              className={`flex items-center justify-center w-6 h-6 rounded transition-colors cursor-pointer ${
                markdownViewMode === "preview"
                  ? "bg-(--color-bg-elevated) text-(--color-text-primary) shadow-2xs"
                  : "text-(--color-text-muted) hover:text-(--color-text-primary)"
              }`}
              title="Preview"
              aria-label="Preview"
            >
              <Eye size={13} />
            </button>
          </div>
        </div>
      )}


      {/* Unsaved Changes Tab Close Warning Dialog */}
      {promptCloseFileId && (() => {
        const file = files.find((f) => f.id === promptCloseFileId);
        return (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50" onClick={() => setPromptCloseFileId(null)}>
            <div className="bg-(--color-bg-secondary) border border-(--color-border) rounded-xl shadow-2xl w-full max-w-sm mx-4 animate-in zoom-in-95 slide-in-from-bottom-4 duration-200" onClick={(e) => e.stopPropagation()}>
              <div className="flex flex-col items-center px-6 py-5 text-center">
                <div className="w-10 h-10 rounded-full bg-(--color-warning)/15 flex items-center justify-center mb-3">
                  <X size={20} className="text-(--color-warning)" />
                </div>
                <h3 className="text-sm font-semibold text-(--color-text-primary) mb-1">Unsaved Changes</h3>
                <p className="text-xs text-(--color-text-muted) leading-relaxed">
                  The file <span className="text-(--color-text-primary) font-semibold">"{file?.name}"</span> has unsaved changes. Closing this tab will lose unsaved modifications since your last save.
                </p>
              </div>
              <div className="flex gap-2 px-6 pb-5">
                <button
                  onClick={() => setPromptCloseFileId(null)}
                  className="flex-1 px-3 py-2 text-xs font-medium text-(--color-text-secondary) bg-(--color-bg-tertiary) hover:bg-(--color-bg-primary) rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    closeFile(promptCloseFileId);
                    setPromptCloseFileId(null);
                  }}
                  className="flex-1 px-3 py-2 text-xs font-medium text-white bg-(--color-error) hover:bg-(--color-error)/85 rounded-lg transition-colors dg-spring-btn"
                >
                  Close Anyway
                </button>
              </div>
            </div>
          </div>
        );
      })()}
      {/* Hidden element for measuring rename input width dynamically */}
      <span
        ref={measureRef}
        className="absolute -left-[9999px] -top-[9999px] invisible pointer-events-none select-none text-xs font-normal whitespace-pre"
        aria-hidden="true"
      >
        {renameValue || " "}
      </span>
    </div>
  );
}
