import { useState, useRef, forwardRef, useImperativeHandle } from "react";
import {
  FileCode,
  FilePlus,
  Trash2,
  Edit2,
  Search,
  X,
  FolderOpen,
  File,
} from "lucide-react";
import { useSqlFiles } from "../context/SqlFilesContext";

const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;

function stripExtension(name) {
  return name.replace(/\.sql$/i, "");
}

function ensureExtension(name) {
  if (/\.sql$/i.test(name)) return name;
  return name + ".sql";
}

const FileExplorer = forwardRef(({ onInsertAtCursor }, ref) => {
  const { files, openFiles, activeTabId, openFile, removeFile, renameFile, addFile } = useSqlFiles();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const searchInputRef = useRef(null);

  useImperativeHandle(ref, () => ({
    focusSearch: () => {
      searchInputRef.current?.focus();
    },
  }));

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileClick = (fileId) => {
    setSelectedFileId(fileId);
    openFile(fileId);
  };

  const handleStartRename = (file, e) => {
    e?.stopPropagation();
    setRenamingId(file.id);
    setRenameValue(stripExtension(file.name));
    setSelectedFileId(file.id);
  };

  const handleFinishRename = (id) => {
    const trimmed = renameValue.trim();
    if (trimmed) {
      renameFile(id, ensureExtension(trimmed));
    }
    setRenamingId(null);
  };

  const handleDelete = (fileId, e) => {
    e?.stopPropagation();
    if (files.length === 1) {
      return;
    }
    if (confirm("Are you sure you want to delete this file?")) {
      removeFile(fileId);
      if (selectedFileId === fileId) {
        setSelectedFileId(null);
      }
    }
  };

  const handleCreateFile = () => {
    addFile();
  };

  const handleKeyDown = (e) => {
    if (!selectedFileId) return;

    if (e.key === "Delete" && renamingId === null) {
      e.preventDefault();
      const file = files.find((f) => f.id === selectedFileId);
      if (file) {
        handleDelete(selectedFileId);
      }
    }

    if (e.key === "F2" && renamingId === null) {
      e.preventDefault();
      const file = files.find((f) => f.id === selectedFileId);
      if (file) {
        handleStartRename(file);
      }
    }

    if (e.key === "Enter" && renamingId === null) {
      e.preventDefault();
      handleFileClick(selectedFileId);
    }
  };

  const isFileOpen = (fileId) => openFiles.includes(fileId);

  return (
    <div className="flex flex-col h-full bg-(--color-bg-secondary)" onKeyDown={handleKeyDown} tabIndex={0}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-(--color-border)">
        <span className="text-xs font-semibold text-(--color-text-secondary) uppercase tracking-wide">
          Files
        </span>
        <button
          onClick={handleCreateFile}
          className="p-1 rounded hover:bg-(--color-bg-tertiary) text-(--color-text-muted) hover:text-(--color-accent) transition-colors"
          title="New File (Ctrl+Shift+N)"
        >
          <FilePlus size={14} />
        </button>
      </div>

      {/* Search */}
      <div className="px-2 py-2 border-b border-(--color-border)">
        <div className="relative">
          <Search
            size={12}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-(--color-text-muted)"
          />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-7 pr-7 py-1 text-xs bg-(--color-bg-primary) border border-(--color-border) rounded text-(--color-text-primary) placeholder-text-(--color-text-muted) outline-none focus:border-(--color-accent)"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-(--color-text-muted) hover:text-(--color-text-primary)"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto">
        {filteredFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center px-4">
            <FolderOpen size={32} className="text-(--color-text-muted) mb-2" />
            <p className="text-xs text-(--color-text-muted) mb-2">
              {searchQuery ? "No files found" : "No files yet"}
            </p>
            {!searchQuery && (
              <button
                onClick={handleCreateFile}
                className="text-xs text-(--color-accent) hover:text-(--color-accent-hover) transition-colors"
              >
                Create your first file
              </button>
            )}
          </div>
        ) : (
          <div className="py-1">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                onClick={() => handleFileClick(file.id)}
                className={`group flex items-center gap-2 px-3 py-1.5 text-xs cursor-pointer transition-colors ${
                  selectedFileId === file.id
                    ? "bg-(--color-bg-primary) text-(--color-text-primary)"
                    : "text-(--color-text-secondary) hover:bg-(--color-bg-tertiary)"
                } ${
                  activeTabId === file.id
                    ? "border-l-2 border-l-(--color-accent)"
                    : ""
                }`}
              >
                {isFileOpen(file.id) ? (
                  <FileCode size={14} className="shrink-0 text-(--color-accent)" />
                ) : (
                  <File size={14} className="shrink-0 text-(--color-text-muted)" />
                )}

                {renamingId === file.id ? (
                  <div className="flex items-center gap-1 flex-1" onClick={(e) => e.stopPropagation()}>
                    <input
                      autoFocus
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleFinishRename(file.id);
                        if (e.key === "Escape") setRenamingId(null);
                      }}
                      onBlur={() => handleFinishRename(file.id)}
                      className="flex-1 bg-(--color-bg-primary) border border-(--color-accent) rounded px-1 py-0.5 text-xs text-(--color-text-primary) outline-none"
                    />
                    <span className="text-[10px] text-(--color-text-muted)">.sql</span>
                  </div>
                ) : (
                  <>
                    <span className="flex-1 truncate">{file.name}</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                      <button
                        onClick={(e) => handleStartRename(file, e)}
                        className="p-0.5 rounded hover:bg-(--color-bg-primary) text-(--color-text-muted) hover:text-(--color-accent) transition-colors"
                        title="Rename (F2)"
                      >
                        <Edit2 size={11} />
                      </button>
                      {files.length > 1 && (
                        <button
                          onClick={(e) => handleDelete(file.id, e)}
                          className="p-0.5 rounded hover:bg-(--color-bg-primary) text-(--color-text-muted) hover:text-(--color-error) transition-colors"
                          title="Delete (Del)"
                        >
                          <Trash2 size={11} />
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-1.5 border-t border-(--color-border) text-[10px] text-(--color-text-muted)">
        {filteredFiles.length} {filteredFiles.length === 1 ? "file" : "files"}
        {searchQuery && ` (filtered from ${files.length})`}
      </div>
    </div>
  );
});

FileExplorer.displayName = "FileExplorer";

export default FileExplorer;
