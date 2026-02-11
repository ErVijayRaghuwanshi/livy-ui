import { useState } from "react";
import { Plus, X, FileCode } from "lucide-react";
import { useSqlFiles } from "../context/SqlFilesContext";

function stripExtension(name) {
  return name.replace(/\.sql$/i, "");
}

function ensureExtension(name) {
  if (/\.sql$/i.test(name)) return name;
  return name + ".sql";
}

export default function TabBar() {
  const { files, activeTabId, setActiveTab, addFile, removeFile, renameFile } = useSqlFiles();
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");

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
    if (files.length === 1) return;
    removeFile(id);
  };

  return (
    <div className="flex items-center bg-(--color-bg-secondary) border-b border-(--color-border) shrink-0 overflow-x-auto">
      <div className="flex items-center min-w-0">
        {files.map((file) => (
          <div
            key={file.id}
            onClick={() => setActiveTab(file.id)}
            className={`group flex items-center gap-1.5 px-3 py-2 text-xs cursor-pointer border-r border-(--color-border) min-w-0 max-w-48 transition-colors ${
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
                className="truncate"
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  handleStartRename(file);
                }}
              >
                {file.name}
              </span>
            )}

            {files.length > 1 && (
              <button
                onClick={(e) => handleClose(e, file.id)}
                className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-(--color-bg-tertiary) hover:text-(--color-error) transition-opacity ml-auto"
              >
                <X size={11} />
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={() => addFile()}
        className="flex items-center gap-1 px-3 py-2 text-(--color-text-muted) hover:text-(--color-text-primary) hover:bg-(--color-bg-primary)/50 transition-colors shrink-0"
        title="New SQL File (Ctrl+Shift+N)"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
