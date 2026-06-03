import { useState, useEffect } from "react";
import { Plus, X, FileCode, Play, Loader2 } from "lucide-react";
import { useSqlFiles } from "../context/SqlFilesContext";

function stripExtension(name) {
  return name.replace(/\.sql$/i, "");
}

function ensureExtension(name) {
  if (/\.sql$/i.test(name)) return name;
  return name + ".sql";
}

export default function TabBar({ sidebarCollapsed, setSidebarCollapsed, editorRef }) {
  const { files, openFiles, activeTabId, setActiveTab, addFile, closeFile, renameFile, reorderFiles, dirtyFiles, promptCloseFileId, setPromptCloseFileId, requestCloseFile } = useSqlFiles();
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
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const openFilesData = openFiles.map(id => files.find(f => f.id === id)).filter(Boolean);

  const handleStartRename = (file) => {
    setRenamingId(file.id);
    setRenameValue(stripExtension(file.name));
  };

  const handleFinishRename = (id) => {
    const trimmed = renameValue.trim();
    if (trimmed) {
      renameFile(id, ensureExtension(trimmed));
    }
    setRenamingId(null);
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

  return (
    <div className="flex items-center bg-(--color-bg-secondary) border-b border-(--color-border) shrink-0 overflow-x-auto">
      <div className="flex items-center gap-1.5 px-3 py-2 border-r border-(--color-border) shrink-0">
        {running ? (
          <button
            onClick={handleCancel}
            className="group flex items-center justify-center w-5 h-5 rounded bg-(--color-error)/15 text-(--color-error) hover:bg-(--color-error)/25 active:scale-95 transition-all cursor-pointer select-none"
            title="Cancel Query"
          >
            <Loader2 size={12} className="animate-spin text-(--color-error)" />
          </button>
        ) : (
          <button
            onClick={handleRun}
            disabled={!canRun}
            className={`group flex items-center justify-center w-5 h-5 rounded transition-all border select-none active:scale-95 ${
              canRun
                ? "bg-(--color-success)/10 text-(--color-success) border-(--color-success)/30 hover:border-(--color-success)/55 hover:bg-(--color-success)/15 cursor-pointer shadow-xs"
                : "bg-transparent text-(--color-text-muted) border-(--color-border)/50 opacity-40 cursor-not-allowed pointer-events-none"
            }`}
            title="Run SQL (Ctrl+Enter)"
          >
            <Play size={10} className={canRun ? "fill-current" : ""} />
          </button>
        )}
      </div>
      <div className="flex items-center min-w-0">
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
            className={`group flex items-center gap-1.5 px-2 sm:px-3 py-2 text-xs cursor-pointer border-r border-(--color-border) min-w-0 max-w-32 sm:max-w-48 transition-colors ${draggedIndex === index ? "opacity-50" : ""} ${
              dragOverIndex === index ? "border-l-2 border-l-(--color-accent)" : ""
            } ${
              file.id === activeTabId
                ? "bg-(--color-bg-primary) text-(--color-text-primary) border-b-2 border-b-(--color-accent)"
                : "text-(--color-text-muted) hover:text-(--color-text-secondary) hover:bg-(--color-bg-primary)/50"
            }`}
          >
            <FileCode size={13} className="shrink-0 text-(--color-accent)" />

            {renamingId === file.id ? (
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <input
                  autoFocus
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleFinishRename(file.id);
                    if (e.key === "Escape") setRenamingId(null);
                  }}
                  onBlur={() => handleFinishRename(file.id)}
                  className="w-24 bg-(--color-bg-primary) border border-(--color-accent) rounded px-1 py-0.5 text-xs text-(--color-text-primary) outline-none"
                />
                <span className="text-[10px] text-(--color-text-muted)">.sql</span>
              </div>
            ) : (
              <span
                className="truncate hidden sm:inline"
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  handleStartRename(file);
                }}
              >
                {file.name}
              </span>
            )}

            <div className="flex items-center ml-auto shrink-0 relative w-4 h-4 justify-center">
              {dirtyFiles[file.id] && (
                <span className="w-1.5 h-1.5 rounded-full bg-(--color-warning) dg-pulse-amber group-hover:hidden transition-all" />
              )}
              <button
                onClick={(e) => handleClose(e, file.id)}
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
        className="flex items-center gap-1 px-2 sm:px-3 py-2 text-(--color-text-muted) hover:text-(--color-text-primary) hover:bg-(--color-bg-primary)/50 transition-colors shrink-0"
        title="New SQL File (Ctrl+Shift+N)"
      >
        <Plus size={14} />
      </button>

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
    </div>
  );
}
