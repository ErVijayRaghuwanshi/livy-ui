import { useState } from "react";
import { Plus, X, FileCode, Pencil, Check } from "lucide-react";
import { useSqlFiles } from "../context/SqlFilesContext";

export default function TabBar() {
  const { files, activeTabId, setActiveTab, addFile, removeFile, renameFile } = useSqlFiles();
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  const handleStartRename = (e, file) => {
    e.stopPropagation();
    setRenamingId(file.id);
    setRenameValue(file.name);
  };

  const handleFinishRename = (id) => {
    if (renameValue.trim()) {
      renameFile(id, renameValue.trim());
    }
    setRenamingId(null);
  };

  const handleClose = (e, id) => {
    e.stopPropagation();
    if (files.length === 1) return;
    removeFile(id);
  };

  return (
    <div className="flex items-center bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)] shrink-0 overflow-x-auto">
      <div className="flex items-center min-w-0">
        {files.map((file) => (
          <div
            key={file.id}
            onClick={() => setActiveTab(file.id)}
            className={`group flex items-center gap-1.5 px-3 py-2 text-xs cursor-pointer border-r border-[var(--color-border)] min-w-0 max-w-48 transition-colors ${
              file.id === activeTabId
                ? "bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] border-b-2 border-b-[var(--color-accent)]"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-primary)]/50"
            }`}
          >
            <FileCode size={13} className="shrink-0 text-[var(--color-accent)]" />

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
                  className="w-24 bg-[var(--color-bg-primary)] border border-[var(--color-accent)] rounded px-1 py-0.5 text-xs text-[var(--color-text-primary)] outline-none"
                />
                <button onClick={() => handleFinishRename(file.id)} className="p-0.5">
                  <Check size={11} className="text-[var(--color-success)]" />
                </button>
              </div>
            ) : (
              <>
                <span className="truncate">{file.name}</span>
                <button
                  onClick={(e) => handleStartRename(e, file)}
                  className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-[var(--color-bg-tertiary)] transition-opacity"
                >
                  <Pencil size={10} className="text-[var(--color-text-muted)]" />
                </button>
              </>
            )}

            {files.length > 1 && (
              <button
                onClick={(e) => handleClose(e, file.id)}
                className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-error)] transition-opacity ml-auto"
              >
                <X size={11} />
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={() => addFile()}
        className="flex items-center gap-1 px-3 py-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-primary)]/50 transition-colors shrink-0"
        title="New SQL File"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
