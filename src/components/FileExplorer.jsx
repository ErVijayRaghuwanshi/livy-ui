import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import {
  FileCode,
  FileText,
  Terminal,
  FilePlus,
  Trash2,
  Edit2,
  Search,
  X,
  FolderOpen,
  Folder,
  FolderPlus,
  ChevronRight,
  ChevronDown,
  AlertTriangle,
  HardDrive,
  RefreshCw,
  GitBranch,
  Download,
  Upload,
  Info,
  Sparkles,
  Globe,
  Database,
  ArrowRight,
} from "lucide-react";
import { useSqlFiles } from "../context/SqlFilesContext";
import { useToast } from "./Toast";
import WorkspaceModal from "./WorkspaceModal";

function FileItemIcon({ fileName = "", isActive = false, isOpen = false, size = 13 }) {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".md")) {
    return <FileText size={size} className={`shrink-0 ${isActive ? "text-sky-400" : isOpen ? "text-sky-400/80" : "text-sky-400/60"}`} />;
  }
  if (lower.endsWith(".json")) {
    return <FileCode size={size} className={`shrink-0 ${isActive ? "text-amber-400" : isOpen ? "text-amber-400/80" : "text-amber-400/60"}`} />;
  }
  if (lower.endsWith(".py")) {
    return <FileCode size={size} className={`shrink-0 ${isActive ? "text-blue-400" : isOpen ? "text-blue-400/80" : "text-blue-400/60"}`} />;
  }
  if (lower.endsWith(".sh") || lower.endsWith(".bash")) {
    return <Terminal size={size} className={`shrink-0 ${isActive ? "text-emerald-400" : isOpen ? "text-emerald-400/80" : "text-emerald-400/60"}`} />;
  }
  return (
    <FileCode
      size={size}
      className={`shrink-0 ${
        isActive
          ? "text-[#ff7b72]"
          : isOpen
          ? "text-[#ff7b72]/85"
          : "text-[#ff7b72]/65"
      }`}
    />
  );
}

function stripExtension(name) {
  return name.replace(/\.sql$/i, "");
}

function ensureExtension(name) {
  if (/\.sql$/i.test(name)) return name;
  return name + ".sql";
}

const FileExplorer = forwardRef(({ onInsertAtCursor, showHeaderFooter = true, onOpenWorkspaceModal }, ref) => {
  const {
    files,
    openFiles,
    activeTabId,
    openFile,
    previewFile,
    removeFile,
    renameFile,
    addFile,
    addBrowserFile,
    saveBrowserFileToWorkspace,
    dirtyFiles,
    workspace,
    isFsSupported,
    openWorkspaceFolder,
    reconnectWorkspace,
    refreshWorkspace,
    disconnectWorkspace,
    createWorkspaceFolder,
    deleteWorkspaceFolder,
    addFileToFolder,
    openSingleFile,
    saveCurrentFileAs,
  } = useSqlFiles();

  const { addToast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [showUnsupportedModal, setShowUnsupportedModal] = useState(false);
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);

  const [expandedSections, setExpandedSections] = useState({
    workspace: true,
    browser: true,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleOpenWorkspace = () => {
    if (onOpenWorkspaceModal) {
      onOpenWorkspaceModal();
    } else {
      setShowWorkspaceModal(true);
    }
  };

  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState(null); // { type: 'file'|'folder', id, name, handle, parentHandle }

  const workspaceFiles = files.filter((f) => f.isLocalDisk);
  const browserFiles = files.filter((f) => !f.isLocalDisk);

  const handleCopyToWorkspace = async (file, e) => {
    e?.stopPropagation();
    if (!workspace.isConnected || !workspace.handle) return;
    try {
      await saveBrowserFileToWorkspace(file.id);
      addToast("ok", `Copied "${file.name}" to workspace folder`, null, "Saved to Workspace");
    } catch (err) {
      addToast("error", err.message || "Failed to copy file to workspace", null, "Copy Error");
    }
  };

  // Expanded folders state: map of folder path -> boolean
  const [expandedFolders, setExpandedFolders] = useState({});

  // Inline creation state: { parentHandle, parentPath, type: 'file'|'folder' }
  const [creatingItem, setCreatingItem] = useState(null);
  const [createItemName, setCreateItemName] = useState("");

  const searchInputRef = useRef(null);
  const containerRef = useRef(null);
  const createInputRef = useRef(null);

  useImperativeHandle(ref, () => ({
    focusSearch: () => {
      searchInputRef.current?.focus();
    },
  }));

  const toggleFolder = (folderPath) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderPath]: prev[folderPath] === undefined ? false : !prev[folderPath],
    }));
  };

  const isFolderExpanded = (folderPath) => {
    return expandedFolders[folderPath] !== false; // Default expanded
  };

  const filteredFiles = files.filter((file) =>
    (file.relativePath || file.name).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileClick = (fileId) => {
    setSelectedFileId(fileId);
    previewFile(fileId);
    containerRef.current?.focus();
  };

  const handleFileDoubleClick = (fileId) => {
    openFile(fileId);
  };

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    if (val.trim()) {
      const filtered = files.filter((file) =>
        (file.relativePath || file.name).toLowerCase().includes(val.toLowerCase())
      );
      if (filtered.length > 0) {
        setSelectedFileId(filtered[0].id);
      } else {
        setSelectedFileId(null);
      }
    } else {
      setSelectedFileId(activeTabId || (files.length > 0 ? files[0].id : null));
    }
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

  const handleDeleteFile = (file, e) => {
    e?.stopPropagation();
    if (files.length === 1 && !workspace.isConnected) {
      return;
    }
    setDeleteConfirmTarget({
      type: "file",
      id: file.id,
      name: file.name,
      isLocalDisk: file.isLocalDisk,
    });
  };

  const handleDeleteFolder = (folderNode, e) => {
    e?.stopPropagation();
    setDeleteConfirmTarget({
      type: "folder",
      name: folderNode.name,
      handle: folderNode.handle,
      parentHandle: folderNode.parentHandle,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmTarget) return;

    if (deleteConfirmTarget.type === "file") {
      removeFile(deleteConfirmTarget.id);
      if (selectedFileId === deleteConfirmTarget.id) {
        setSelectedFileId(null);
      }
    } else if (deleteConfirmTarget.type === "folder") {
      try {
        await deleteWorkspaceFolder(deleteConfirmTarget.parentHandle, deleteConfirmTarget.name);
        addToast("ok", `Deleted folder "${deleteConfirmTarget.name}"`, null, "Folder Deleted");
      } catch (err) {
        addToast("error", err.message || "Failed to delete folder", null, "Delete Error");
      }
    }
    setDeleteConfirmTarget(null);
  };

  // Trigger inline creation of a file or folder
  const handleStartCreate = (parentHandle, parentPath, type) => {
    setCreatingItem({ parentHandle, parentPath, type });
    setCreateItemName("");
    if (parentPath && !isFolderExpanded(parentPath)) {
      toggleFolder(parentPath);
    }
    setTimeout(() => {
      createInputRef.current?.focus();
    }, 50);
  };

  const handleFinishCreate = async () => {
    if (!creatingItem) return;
    const trimmed = createItemName.trim();
    if (!trimmed) {
      setCreatingItem(null);
      return;
    }

    if (creatingItem.type === "folder") {
      try {
        await createWorkspaceFolder(creatingItem.parentHandle, trimmed);
        addToast("ok", `Created folder "${trimmed}"`, null, "Folder Created");
      } catch (err) {
        addToast("error", err.message || "Failed to create folder", null, "Creation Error");
      }
    } else {
      const fileName = ensureExtension(trimmed);
      try {
        await addFileToFolder(creatingItem.parentHandle, fileName, "-- Write your Spark SQL here\nSELECT 1;\n");
        addToast("ok", `Created "${fileName}"`, null, "File Created");
      } catch (err) {
        addToast("error", err.message || "Failed to create file", null, "Creation Error");
      }
    }
    setCreatingItem(null);
  };

  const handleReconnect = async () => {
    const success = await reconnectWorkspace();
    if (success) {
      addToast("ok", "Re-connected to local workspace folder", null, "Workspace Reconnected");
    } else {
      addToast("error", "Permission was not granted to access the folder", null, "Access Denied");
    }
  };

  const handleRefresh = async () => {
    await refreshWorkspace();
    addToast("ok", "Synced latest files with local disk", null, "Sync Complete");
  };

  const handleDisconnect = async () => {
    await disconnectWorkspace();
    addToast("ok", "Disconnected from folder. Switched to scratchpad mode.", null, "Folder Closed");
  };

  const handleOpenSingle = async () => {
    if (!isFsSupported) {
      setShowUnsupportedModal(true);
      return;
    }
    try {
      const res = await openSingleFile();
      if (res) {
        addToast("ok", `Opened "${res.name}" from disk`, null, "File Opened");
      }
    } catch (err) {
      addToast("error", err.message || "Failed to open file", null, "File Open Error");
    }
  };

  const handleSaveAs = async (fileId, e) => {
    e?.stopPropagation();
    if (!isFsSupported) {
      setShowUnsupportedModal(true);
      return;
    }
    try {
      const res = await saveCurrentFileAs(fileId);
      if (res) {
        addToast("ok", `Saved "${res.name}" directly to disk`, null, "File Saved to Disk");
      }
    } catch (err) {
      addToast("error", err.message || "Failed to save file to disk", null, "Save Error");
    }
  };

  // Sync selection to active tab on mount or tab switch if search is empty
  useEffect(() => {
    if (!searchQuery && activeTabId) {
      setSelectedFileId(activeTabId);
    }
  }, [activeTabId, searchQuery]);

  const handleKeyDown = (e) => {
    if (!selectedFileId) return;
    const isInsideInput =
      document.activeElement === searchInputRef.current ||
      document.activeElement === createInputRef.current;

    if ((e.key === "Delete" || e.key === "Backspace") && renamingId === null) {
      if (isInsideInput) return;
      e.preventDefault();
      const file = files.find((f) => f.id === selectedFileId);
      if (file) {
        handleDeleteFile(file, e);
      }
    }

    if (e.key === "F2" && renamingId === null) {
      if (isInsideInput) return;
      e.preventDefault();
      const file = files.find((f) => f.id === selectedFileId);
      if (file) {
        handleStartRename(file, e);
      }
    }

    if (e.key === "Enter" && renamingId === null) {
      e.preventDefault();
      handleFileClick(selectedFileId);
    }

    if (e.key === "ArrowDown" && renamingId === null) {
      e.preventDefault();
      const idx = filteredFiles.findIndex((f) => f.id === selectedFileId);
      if (idx < filteredFiles.length - 1) {
        setSelectedFileId(filteredFiles[idx + 1].id);
      }
    }

    if (e.key === "ArrowUp" && renamingId === null) {
      e.preventDefault();
      const idx = filteredFiles.findIndex((f) => f.id === selectedFileId);
      if (idx > 0) {
        setSelectedFileId(filteredFiles[idx - 1].id);
      }
    }
  };

  const isFileOpen = (fileId) => openFiles.includes(fileId);

  // Recursive Tree Node Renderer
  const renderTreeNode = (node, depth = 0) => {
    if (node.kind === "directory") {
      const expanded = isFolderExpanded(node.path);
      const isCreatingInside = creatingItem && creatingItem.parentHandle === node.handle;

      return (
        <div key={node.path || node.name} className="select-none">
          {/* Folder Row */}
          <div
            onClick={() => toggleFolder(node.path)}
            className="group flex items-center gap-1.5 px-2 py-1 text-xs cursor-pointer text-(--color-text-secondary) hover:text-(--color-text-primary) hover:bg-(--color-bg-tertiary)/60 transition-colors rounded-sm"
            style={{ paddingLeft: `${Math.max(depth * 14 + 8, 8)}px` }}
          >
            <span className="shrink-0 text-(--color-text-muted) hover:text-(--color-text-primary)">
              {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
            </span>
            <span className="shrink-0 text-amber-400">
              {expanded ? <FolderOpen size={14} /> : <Folder size={14} />}
            </span>
            <span className="truncate flex-1 font-medium text-[11px]">{node.name}</span>

            {/* Folder Actions on Hover */}
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 shrink-0" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => handleStartCreate(node.handle, node.path, "file")}
                className="p-0.5 rounded hover:bg-(--color-bg-primary) text-(--color-text-muted) hover:text-(--color-accent) transition-colors"
                title="New SQL File in this folder"
              >
                <FilePlus size={11} />
              </button>
              <button
                onClick={() => handleStartCreate(node.handle, node.path, "folder")}
                className="p-0.5 rounded hover:bg-(--color-bg-primary) text-(--color-text-muted) hover:text-amber-400 transition-colors"
                title="New Subfolder in this folder"
              >
                <FolderPlus size={11} />
              </button>
              <button
                onClick={(e) => handleDeleteFolder(node, e)}
                className="p-0.5 rounded hover:bg-(--color-bg-primary) text-(--color-text-muted) hover:text-(--color-error) transition-colors"
                title="Delete Folder"
              >
                <Trash2 size={11} />
              </button>
            </div>
          </div>

          {/* Children (if expanded) */}
          {expanded && (
            <div>
              {/* Inline Create Input inside this folder */}
              {isCreatingInside && (
                <div
                  className="flex items-center gap-1 px-2 py-1 bg-(--color-bg-primary)"
                  style={{ paddingLeft: `${(depth + 1) * 14 + 8}px` }}
                >
                  {creatingItem.type === "folder" ? (
                    <Folder size={13} className="text-amber-400 shrink-0" />
                  ) : (
                    <FileCode size={13} className="text-[#ff7b72] shrink-0" />
                  )}
                  <input
                    ref={createInputRef}
                    value={createItemName}
                    onChange={(e) => setCreateItemName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleFinishCreate();
                      if (e.key === "Escape") setCreatingItem(null);
                    }}
                    onBlur={handleFinishCreate}
                    placeholder={creatingItem.type === "folder" ? "folder_name" : "query_name"}
                    className="flex-1 bg-(--color-bg-secondary) border border-(--color-accent) rounded px-1.5 py-0.5 text-xs text-(--color-text-primary) outline-none"
                  />
                  {creatingItem.type === "file" && (
                    <span className="text-[10px] text-(--color-text-muted)">.sql</span>
                  )}
                </div>
              )}

              {node.children?.map((child) => renderTreeNode(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    // File Node
    const file = node;
    const isSelected = selectedFileId === file.id;
    const isActive = activeTabId === file.id;

    return (
      <div
        key={file.id}
        onClick={() => handleFileClick(file.id)}
        onDoubleClick={() => handleFileDoubleClick(file.id)}
        className={`group flex items-center gap-1.5 px-2 py-1 text-xs cursor-pointer transition-colors ${
          isSelected
            ? "bg-(--color-bg-primary) text-(--color-text-primary)"
            : "text-(--color-text-secondary) hover:bg-(--color-bg-tertiary)/60"
        } ${isActive ? "border-l-2 border-l-(--color-accent)" : ""}`}
        style={{ paddingLeft: `${Math.max(depth * 14 + 8, 8)}px` }}
      >
        <FileItemIcon
          fileName={file.name}
          isActive={isActive}
          isOpen={isFileOpen(file.id)}
          size={13}
        />

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
            <span className="flex-1 truncate text-[11px]">{file.name}</span>

            {/* Disk sync icon badge */}
            {file.isLocalDisk && (
              <span
                className="shrink-0 text-emerald-400/80 group-hover:opacity-100 opacity-60 transition-opacity"
                title="Synced with local disk"
              >
                <HardDrive size={10} />
              </span>
            )}

            {dirtyFiles?.[file.id] && (
              <span
                className="w-1.5 h-1.5 rounded-full bg-white shrink-0 mr-1 group-hover:hidden"
                title="Unsaved changes"
              />
            )}

            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 shrink-0">
              <button
                onClick={(e) => handleSaveAs(file.id, e)}
                className="p-0.5 rounded hover:bg-(--color-bg-primary) text-(--color-text-muted) hover:text-emerald-400 transition-colors"
                title="Save As to Local Disk"
              >
                <Download size={11} />
              </button>
              <button
                onClick={(e) => handleStartRename(file, e)}
                className="p-0.5 rounded hover:bg-(--color-bg-primary) text-(--color-text-muted) hover:text-(--color-accent) transition-colors"
                title="Rename (F2)"
              >
                <Edit2 size={11} />
              </button>
              <button
                onClick={(e) => handleDeleteFile(file, e)}
                className="p-0.5 rounded hover:bg-(--color-bg-primary) text-(--color-text-muted) hover:text-(--color-error) transition-colors"
                title="Delete (Del)"
              >
                <Trash2 size={11} />
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderBrowserFileRow = (file) => {
    const isSelected = selectedFileId === file.id;
    const isActive = activeTabId === file.id;

    return (
      <div
        key={file.id}
        onClick={() => handleFileClick(file.id)}
        onDoubleClick={() => handleFileDoubleClick(file.id)}
        className={`group flex items-center gap-1.5 px-3 py-1.5 text-xs cursor-pointer transition-colors ${
          isSelected
            ? "bg-(--color-bg-primary) text-(--color-text-primary)"
            : "text-(--color-text-secondary) hover:bg-(--color-bg-tertiary)/60"
        } ${isActive ? "border-l-2 border-l-(--color-accent)" : ""}`}
      >
        <FileItemIcon
          fileName={file.name}
          isActive={isActive}
          isOpen={isFileOpen(file.id)}
          size={13}
        />

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
            <span className="flex-1 truncate text-[11px]">{file.name}</span>

            {dirtyFiles?.[file.id] && (
              <span
                className="w-1.5 h-1.5 rounded-full bg-white shrink-0 mr-1 group-hover:hidden"
                title="Unsaved changes"
              />
            )}

            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 shrink-0">
              {workspace.isConnected && (
                <button
                  onClick={(e) => handleCopyToWorkspace(file, e)}
                  className="p-0.5 rounded hover:bg-(--color-bg-primary) text-(--color-text-muted) hover:text-(--color-accent) transition-colors"
                  title="Copy to Workspace Folder"
                >
                  <ArrowRight size={11} />
                </button>
              )}
              <button
                onClick={(e) => handleSaveAs(file.id, e)}
                className="p-0.5 rounded hover:bg-(--color-bg-primary) text-(--color-text-muted) hover:text-emerald-400 transition-colors"
                title="Save As to Local Disk"
              >
                <Download size={11} />
              </button>
              <button
                onClick={(e) => handleStartRename(file, e)}
                className="p-0.5 rounded hover:bg-(--color-bg-primary) text-(--color-text-muted) hover:text-(--color-accent) transition-colors"
                title="Rename (F2)"
              >
                <Edit2 size={11} />
              </button>
              <button
                onClick={(e) => handleDeleteFile(file, e)}
                className="p-0.5 rounded hover:bg-(--color-bg-primary) text-(--color-text-muted) hover:text-(--color-error) transition-colors"
                title="Delete (Del)"
              >
                <Trash2 size={11} />
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className="livy-file-explorer flex flex-col h-full bg-(--color-bg-secondary) focus:outline-none select-none"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Header */}
      {showHeaderFooter && (
        <div className="flex items-center justify-between px-3 py-2 border-b border-(--color-border)">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-xs font-semibold text-(--color-text-secondary) uppercase tracking-wide truncate">
              {workspace.isConnected ? "Explorer" : "Files"}
            </span>
            {workspace.isConnected && (
              <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono shrink-0">
                DISK & BROWSER
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleOpenWorkspace}
              className="p-1 rounded hover:bg-(--color-bg-tertiary) text-(--color-text-muted) hover:text-(--color-accent) transition-colors cursor-pointer"
              title="Open or Create Local Workspace..."
            >
              <FolderOpen size={14} />
            </button>
            {workspace.isConnected && (
              <button
                onClick={() => handleStartCreate(workspace.handle, "", "folder")}
                className="p-1 rounded hover:bg-(--color-bg-tertiary) text-(--color-text-muted) hover:text-amber-400 transition-colors cursor-pointer"
                title="New Folder on Disk"
              >
                <FolderPlus size={14} />
              </button>
            )}
            <button
              onClick={() => {
                if (workspace.isConnected) {
                  handleStartCreate(workspace.handle, "", "file");
                } else {
                  addFile();
                }
              }}
              className="p-1 rounded hover:bg-(--color-bg-tertiary) text-(--color-text-muted) hover:text-(--color-accent) transition-colors cursor-pointer"
              title={workspace.isConnected ? "New SQL File on Disk" : "New File (Ctrl+Shift+N)"}
            >
              <FilePlus size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Connected Workspace Status Banner */}
      {showHeaderFooter && workspace.isConnected && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-(--color-bg-primary) border-b border-(--color-border) text-xs">
          <div
            onClick={handleOpenWorkspace}
            className="flex items-center gap-1.5 min-w-0 flex-1 mr-2 cursor-pointer hover:opacity-80 transition-opacity"
            title={`Workspace: ${workspace.name}${workspace.git?.isGit ? ` (${workspace.git.branch})` : ""}`}
          >
            {workspace.git?.isGit ? (
              <div className="flex items-center gap-1 truncate text-blue-400 font-mono text-[10px]">
                <GitBranch size={12} className="shrink-0" />
                <span className="truncate font-semibold">{workspace.git.branch || "git"}</span>
                <span className="text-(--color-text-muted) truncate">· {workspace.name}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 truncate">
                <HardDrive size={12} className="text-(--color-accent) shrink-0" />
                <span className="font-semibold text-(--color-text-primary) truncate text-[11px]">
                  {workspace.name}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleRefresh}
              disabled={workspace.isSyncing}
              className="p-1 rounded hover:bg-(--color-bg-tertiary) text-(--color-text-muted) hover:text-(--color-accent) transition-colors cursor-pointer"
              title="Sync & reload from disk"
            >
              <RefreshCw size={12} className={workspace.isSyncing ? "animate-spin text-(--color-accent)" : ""} />
            </button>
            <button
              onClick={handleDisconnect}
              className="p-1 rounded hover:bg-(--color-bg-tertiary) text-(--color-text-muted) hover:text-(--color-error) transition-colors cursor-pointer"
              title="Disconnect folder (return to browser scratchpad)"
            >
              <X size={12} />
            </button>
          </div>
        </div>
      )}

      {/* Reconnect Banner */}
      {workspace.needsPermission && (
        <div className="px-3 py-2 bg-amber-500/10 border-b border-amber-500/30 flex flex-col gap-1.5 text-xs">
          <div className="flex items-center gap-1.5 text-amber-400 font-medium">
            <GitBranch size={14} className="shrink-0" />
            <span className="truncate">Folder "{workspace.name}"</span>
          </div>
          <p className="text-[10px] text-(--color-text-muted) leading-tight">
            Browser permission required to sync with your local folder.
          </p>
          <div className="flex gap-1.5 mt-0.5">
            <button
              onClick={handleReconnect}
              className="flex-1 py-1 px-2 text-[10px] font-semibold bg-amber-500 hover:bg-amber-400 text-black rounded transition-colors cursor-pointer"
            >
              Grant Permission
            </button>
            <button
              onClick={handleDisconnect}
              className="py-1 px-2 text-[10px] text-(--color-text-muted) hover:text-(--color-text-primary) rounded hover:bg-(--color-bg-tertiary) transition-colors cursor-pointer"
              title="Forget folder"
            >
              Forget
            </button>
          </div>
        </div>
      )}

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
            placeholder={workspace.isConnected ? "Search workspace files..." : "Search files..."}
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-7 pr-7 py-1 text-xs bg-(--color-bg-primary) border border-(--color-border) rounded text-(--color-text-primary) placeholder-text-(--color-text-muted) outline-none focus:border-(--color-accent)"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearchChange("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-(--color-text-muted) hover:text-(--color-text-primary)"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* File & Folder Tree / List */}
      <div className="flex-1 overflow-y-auto">
        {/* Quick Workspace Connect Banner when working in browser scratchpad */}
        {!workspace.isConnected && !searchQuery && (
          <div className="p-2 border-b border-(--color-border)/35 bg-(--color-bg-secondary)/40">
            <button
              onClick={handleOpenWorkspace}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-(--color-bg-primary) hover:bg-(--color-bg-tertiary) border border-(--color-border) hover:border-(--color-accent)/40 text-left transition-all text-xs group cursor-pointer shadow-2xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1 rounded bg-(--color-accent)/10 text-(--color-accent) group-hover:scale-105 transition-transform shrink-0">
                  <FolderOpen size={13} />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold text-(--color-text-primary) truncate">
                    Open Local Folder / Repo
                  </div>
                  <div className="text-[9px] text-(--color-text-muted) truncate">
                    Sync & auto-save to disk
                  </div>
                </div>
              </div>
              <ChevronRight size={12} className="text-(--color-text-muted) group-hover:text-(--color-accent) transition-colors shrink-0" />
            </button>
          </div>
        )}

        {/* If user is creating file/folder in root */}
        {creatingItem && creatingItem.parentHandle === workspace.handle && (
          <div className="flex items-center gap-1 px-3 py-1 bg-(--color-bg-primary) border-b border-(--color-border)">
            {creatingItem.type === "folder" ? (
              <Folder size={13} className="text-amber-400 shrink-0" />
            ) : (
              <FileCode size={13} className="text-[#ff7b72] shrink-0" />
            )}
            <input
              ref={createInputRef}
              value={createItemName}
              onChange={(e) => setCreateItemName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleFinishCreate();
                if (e.key === "Escape") setCreatingItem(null);
              }}
              onBlur={handleFinishCreate}
              placeholder={creatingItem.type === "folder" ? "folder_name" : "query_name"}
              className="flex-1 bg-(--color-bg-secondary) border border-(--color-accent) rounded px-1.5 py-0.5 text-xs text-(--color-text-primary) outline-none"
            />
            {creatingItem.type === "file" && (
              <span className="text-[10px] text-(--color-text-muted)">.sql</span>
            )}
          </div>
        )}

        {searchQuery ? (
          // If searching, show clean flat filtered view across both disk and browser files
          <div className="py-1">
            {filteredFiles.length === 0 ? (
              <div className="px-5 py-6 text-center text-xs text-(--color-text-muted)">
                No files matching "{searchQuery}"
              </div>
            ) : (
              filteredFiles.map((file) => {
                const isSelected = selectedFileId === file.id;
                const isActive = activeTabId === file.id;
                return (
                  <div
                    key={file.id}
                    onClick={() => handleFileClick(file.id)}
                    onDoubleClick={() => handleFileDoubleClick(file.id)}
                    className={`group flex items-center gap-2 px-3 py-1.5 text-xs cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-(--color-bg-primary) text-(--color-text-primary)"
                        : "text-(--color-text-secondary) hover:bg-(--color-bg-tertiary)"
                    } ${isActive ? "border-l-2 border-l-(--color-accent)" : ""}`}
                  >
                    <FileItemIcon fileName={file.name} isActive={isActive} isOpen={isFileOpen(file.id)} size={13} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="truncate font-medium">{file.name}</span>
                        {file.isLocalDisk ? (
                          <span className="px-1 py-0.2 rounded text-[8px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                            DISK
                          </span>
                        ) : (
                          <span className="px-1 py-0.2 rounded text-[8px] font-mono bg-sky-500/10 text-sky-400 border border-sky-500/20 shrink-0">
                            BROWSER
                          </span>
                        )}
                      </div>
                      {file.relativePath && file.relativePath !== file.name && (
                        <div className="text-[9px] text-(--color-text-muted) truncate font-mono">
                          {file.relativePath}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 shrink-0">
                      {!file.isLocalDisk && workspace.isConnected && (
                        <button
                          onClick={(e) => handleCopyToWorkspace(file, e)}
                          className="p-0.5 rounded hover:bg-(--color-bg-primary) text-(--color-text-muted) hover:text-(--color-accent) transition-colors"
                          title="Copy to Workspace Folder"
                        >
                          <ArrowRight size={11} />
                        </button>
                      )}
                      <button
                        onClick={(e) => handleSaveAs(file.id, e)}
                        className="p-0.5 rounded hover:bg-(--color-bg-primary) text-(--color-text-muted) hover:text-emerald-400 transition-colors"
                        title="Save As to Local Disk"
                      >
                        <Download size={11} />
                      </button>
                      <button
                        onClick={(e) => handleStartRename(file, e)}
                        className="p-0.5 rounded hover:bg-(--color-bg-primary) text-(--color-text-muted) hover:text-(--color-accent) transition-colors"
                        title="Rename (F2)"
                      >
                        <Edit2 size={11} />
                      </button>
                      <button
                        onClick={(e) => handleDeleteFile(file, e)}
                        className="p-0.5 rounded hover:bg-(--color-bg-primary) text-(--color-text-muted) hover:text-(--color-error) transition-colors"
                        title="Delete (Del)"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : workspace.isConnected ? (
          // WORKSPACE CONNECTED: Render Workspace Tree AND Browser Storage Sections
          <div className="flex flex-col">
            {/* SECTION 1: Local Workspace Directory Tree */}
            <div className="border-b border-(--color-border)/40">
              <div
                onClick={() => toggleSection("workspace")}
                className="flex items-center justify-between px-2.5 py-1.5 bg-(--color-bg-secondary)/60 hover:bg-(--color-bg-tertiary)/30 cursor-pointer select-none group"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  {expandedSections.workspace ? (
                    <ChevronDown size={13} className="text-(--color-text-muted) shrink-0" />
                  ) : (
                    <ChevronRight size={13} className="text-(--color-text-muted) shrink-0" />
                  )}
                  <HardDrive size={12} className="text-emerald-400 shrink-0" />
                  <span className="text-[10px] font-bold text-(--color-text-secondary) uppercase tracking-wider truncate">
                    {workspace.name || "WORKSPACE"}
                  </span>
                  {workspace.git?.isGit && (
                    <span className="flex items-center gap-0.5 text-[9px] px-1 py-0.2 rounded bg-blue-500/10 text-blue-400 font-mono shrink-0">
                      <GitBranch size={9} />
                      <span className="truncate max-w-16">{workspace.git.branch || "git"}</span>
                    </span>
                  )}
                  <span className="px-1 py-0.2 text-[9px] bg-(--color-bg-tertiary) text-(--color-text-muted) rounded-full font-semibold shrink-0">
                    {workspaceFiles.length}
                  </span>
                </div>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleStartCreate(workspace.handle, "", "file")}
                    className="p-0.5 rounded hover:bg-(--color-bg-primary) text-(--color-text-muted) hover:text-(--color-accent) transition-colors"
                    title="New SQL File on Disk"
                  >
                    <FilePlus size={12} />
                  </button>
                  <button
                    onClick={() => handleStartCreate(workspace.handle, "", "folder")}
                    className="p-0.5 rounded hover:bg-(--color-bg-primary) text-(--color-text-muted) hover:text-amber-400 transition-colors"
                    title="New Subfolder on Disk"
                  >
                    <FolderPlus size={12} />
                  </button>
                  <button
                    onClick={handleRefresh}
                    disabled={workspace.isSyncing}
                    className="p-0.5 rounded hover:bg-(--color-bg-primary) text-(--color-text-muted) hover:text-(--color-accent) transition-colors"
                    title="Sync / Refresh Disk"
                  >
                    <RefreshCw size={11} className={workspace.isSyncing ? "animate-spin text-(--color-accent)" : ""} />
                  </button>
                </div>
              </div>

              {expandedSections.workspace && (
                <div className="py-1">
                  {workspace.tree?.children?.length ? (
                    workspace.tree.children.map((child) => renderTreeNode(child, 0))
                  ) : (
                    <div className="px-6 py-3 text-[11px] text-(--color-text-muted) italic">
                      Folder contains no SQL files
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* SECTION 2: Browser Storage Files */}
            <div>
              <div
                onClick={() => toggleSection("browser")}
                className="flex items-center justify-between px-2.5 py-1.5 bg-(--color-bg-secondary)/60 hover:bg-(--color-bg-tertiary)/30 cursor-pointer select-none group"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  {expandedSections.browser ? (
                    <ChevronDown size={13} className="text-(--color-text-muted) shrink-0" />
                  ) : (
                    <ChevronRight size={13} className="text-(--color-text-muted) shrink-0" />
                  )}
                  <Globe size={12} className="text-sky-400 shrink-0" />
                  <span className="text-[10px] font-bold text-(--color-text-secondary) uppercase tracking-wider truncate">
                    Browser Storage
                  </span>
                  <span className="px-1 py-0.2 text-[9px] bg-(--color-bg-tertiary) text-(--color-text-muted) rounded-full font-semibold shrink-0">
                    {browserFiles.length}
                  </span>
                </div>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => addBrowserFile()}
                    className="p-0.5 rounded hover:bg-(--color-bg-primary) text-(--color-text-muted) hover:text-(--color-accent) transition-colors"
                    title="New In-Browser SQL File"
                  >
                    <FilePlus size={12} />
                  </button>
                </div>
              </div>

              {expandedSections.browser && (
                <div className="py-1">
                  {browserFiles.length === 0 ? (
                    <div className="px-6 py-3 text-[11px] text-(--color-text-muted) italic flex items-center justify-between">
                      <span>No in-browser files</span>
                      <button
                        onClick={() => addBrowserFile()}
                        className="text-[10px] text-(--color-accent) hover:underline cursor-pointer"
                      >
                        + Create
                      </button>
                    </div>
                  ) : (
                    browserFiles.map(renderBrowserFileRow)
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          // WORKSPACE DISCONNECTED: Browser Storage Files List with Folder Open Option
          <div className="flex flex-col">
            <div
              onClick={() => toggleSection("browser")}
              className="flex items-center justify-between px-2.5 py-1.5 bg-(--color-bg-secondary)/60 hover:bg-(--color-bg-tertiary)/30 cursor-pointer select-none group border-b border-(--color-border)/40"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                {expandedSections.browser ? (
                  <ChevronDown size={13} className="text-(--color-text-muted) shrink-0" />
                ) : (
                  <ChevronRight size={13} className="text-(--color-text-muted) shrink-0" />
                )}
                <Globe size={12} className="text-sky-400 shrink-0" />
                <span className="text-[10px] font-bold text-(--color-text-secondary) uppercase tracking-wider truncate">
                  Browser Storage
                </span>
                <span className="px-1 py-0.2 text-[9px] bg-(--color-bg-tertiary) text-(--color-text-muted) rounded-full font-semibold shrink-0">
                  {browserFiles.length}
                </span>
              </div>
              <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => addBrowserFile()}
                  className="p-0.5 rounded hover:bg-(--color-bg-primary) text-(--color-text-muted) hover:text-(--color-accent) transition-colors cursor-pointer"
                  title="New In-Browser SQL File"
                >
                  <FilePlus size={12} />
                </button>
              </div>
            </div>

            {expandedSections.browser && (
              <div className="py-1">
                {browserFiles.length === 0 ? (
                  <div className="px-6 py-6 text-center text-xs text-(--color-text-muted)">
                    <p className="mb-2">No in-browser files</p>
                    <button
                      onClick={() => addBrowserFile()}
                      className="px-3 py-1 text-xs text-white bg-(--color-accent) rounded-md cursor-pointer hover:bg-(--color-accent-hover)"
                    >
                      Create File
                    </button>
                  </div>
                ) : (
                  browserFiles.map(renderBrowserFileRow)
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      {showHeaderFooter && (
        <div className="flex items-center justify-between px-3 py-1.5 border-t border-(--color-border) text-[10px] text-(--color-text-muted)">
          <div className="truncate">
            {workspace.isConnected ? (
              <span>
                {workspaceFiles.length} disk · {browserFiles.length} browser
              </span>
            ) : (
              <span>
                {browserFiles.length} {browserFiles.length === 1 ? "file" : "files"}
              </span>
            )}
            {searchQuery && ` (filtered from ${files.length})`}
          </div>
          {workspace.isConnected && (
            <span className="text-[9px] text-emerald-400 font-mono truncate ml-1 flex items-center gap-1">
              ● Live Disk Sync
            </span>
          )}
        </div>
      )}

      {/* Confirm Delete Dialog */}
      {deleteConfirmTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setDeleteConfirmTarget(null)}
        >
          <div
            className="bg-(--color-bg-secondary) border border-(--color-border) rounded-2xl shadow-2xl w-full max-w-sm mx-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center px-6 py-5 text-center">
              <div className="w-11 h-11 rounded-full bg-(--color-error)/10 flex items-center justify-center mb-3">
                <AlertTriangle size={22} className="text-(--color-error)" />
              </div>
              <h3 className="text-sm font-semibold text-(--color-text-primary) mb-1">
                Delete {deleteConfirmTarget.type === "folder" ? "Folder" : "File"}
              </h3>
              <p className="text-xs text-(--color-text-muted) leading-relaxed">
                Are you sure you want to delete{" "}
                <span className="text-(--color-text-primary) font-semibold">
                  "{deleteConfirmTarget.name}"
                </span>
                ?
                {deleteConfirmTarget.isLocalDisk || deleteConfirmTarget.type === "folder" ? (
                  <span className="block mt-1 text-amber-400 font-medium">
                    ⚠️ This will permanently remove the {deleteConfirmTarget.type} from your local disk.
                  </span>
                ) : null}
              </p>
            </div>
            <div className="flex gap-2 px-6 pb-5">
              <button
                onClick={() => setDeleteConfirmTarget(null)}
                className="flex-1 px-3 py-2 text-xs font-semibold text-(--color-text-secondary) bg-(--color-bg-tertiary)/40 hover:bg-(--color-bg-tertiary)/80 rounded-lg border border-(--color-border) transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-3 py-2 text-xs font-semibold text-white bg-(--color-error) hover:bg-(--color-error)/90 rounded-lg transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unsupported Browser Info Modal */}
      {showUnsupportedModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setShowUnsupportedModal(false)}
        >
          <div
            className="bg-(--color-bg-secondary) border border-(--color-border) rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-in zoom-in-95 duration-200 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-(--color-accent)/10 flex items-center justify-center shrink-0">
                <Info size={20} className="text-(--color-accent)" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-(--color-text-primary)">
                  Local File System Sync
                </h3>
                <p className="text-xs text-(--color-text-muted)">Browser Compatibility Information</p>
              </div>
            </div>
            <p className="text-xs text-(--color-text-secondary) leading-relaxed mb-3">
              The <strong>File System Access API</strong> enables browser applications to directly read and write files to your local disk (just like Microsoft Clipchamp and VS Code for the Web).
            </p>
            <p className="text-xs text-(--color-text-muted) leading-relaxed mb-4">
              This feature requires a Chromium-based browser such as <strong>Google Chrome, Microsoft Edge, Brave, or Opera</strong>. Safari and Firefox currently restrict native folder picker access for security reasons.
            </p>
            <button
              onClick={() => setShowUnsupportedModal(false)}
              className="w-full py-2 text-xs font-semibold bg-(--color-accent) hover:bg-(--color-accent-hover) text-black rounded-lg transition-colors cursor-pointer"
            >
              Understood
            </button>
          </div>
        </div>
      )}

      {/* Workspace Selector / Creator Modal (fallback if not handled by root) */}
      {!onOpenWorkspaceModal && (
        <WorkspaceModal
          isOpen={showWorkspaceModal}
          onClose={() => setShowWorkspaceModal(false)}
        />
      )}
    </div>
  );
});

FileExplorer.displayName = "FileExplorer";

export default FileExplorer;
