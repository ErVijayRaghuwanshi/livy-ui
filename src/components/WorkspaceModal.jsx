import { useState } from "react";
import {
  FolderOpen,
  FolderPlus,
  GitBranch,
  HardDrive,
  CheckCircle2,
  X,
  FileCode,
  FolderSync,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { useSqlFiles } from "../context/SqlFilesContext";
import { useToast } from "./Toast";

export default function WorkspaceModal({ isOpen, onClose }) {
  const {
    workspace,
    isFsSupported,
    openWorkspaceFolder,
    createNewWorkspaceProject,
    disconnectWorkspace,
    refreshWorkspace,
  } = useSqlFiles();

  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState("open"); // "open" | "create"
  const [templateType, setTemplateType] = useState("git"); // "git" | "standard"
  const [projectName, setProjectName] = useState("spark-sql-workspace");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSelectExisting = async () => {
    setIsLoading(true);
    try {
      const res = await openWorkspaceFolder();
      if (res && res.success) {
        const gitMsg = res.git?.isGit ? ` (Git: ${res.git.branch})` : "";
        addToast("ok", `Loaded ${res.count} files from "${res.name}"${gitMsg}`, null, "Workspace Connected");
        onClose();
      }
    } catch (err) {
      addToast("error", err.message || "Failed to open folder", null, "Folder Sync Error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = async () => {
    setIsLoading(true);
    try {
      const res = await createNewWorkspaceProject({
        templateType,
        projectName: projectName.trim() || "spark-sql-workspace",
      });
      if (res && res.success) {
        addToast(
          "ok",
          `Initialized ${templateType === "git" ? "Git-ready" : "standard"} SQL project "${res.name}"`,
          null,
          "Project Created"
        );
        onClose();
      }
    } catch (err) {
      addToast("error", err.message || "Failed to create project", null, "Project Creation Error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    await disconnectWorkspace();
    addToast("ok", "Disconnected from workspace folder. Restored scratchpad.", null, "Workspace Closed");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-(--color-bg-secondary) border border-(--color-border) rounded-2xl shadow-2xl w-full max-w-lg mx-4 animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-(--color-border)">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-(--color-accent)/10 flex items-center justify-center text-(--color-accent)">
              <HardDrive size={18} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-(--color-text-primary)">
                Local Workspace & Directory Sync
              </h2>
              <p className="text-[11px] text-(--color-text-muted)">
                Work with local directories & Git repositories directly in your browser
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-(--color-text-muted) hover:text-(--color-text-primary) hover:bg-(--color-bg-tertiary) transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Current Active Workspace Status (if connected) */}
        {workspace.isConnected && (
          <div className="mx-5 mt-4 p-3 bg-(--color-bg-primary) border border-(--color-border) rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-md bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircle2 size={16} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-(--color-text-primary) truncate">
                    {workspace.name}
                  </span>
                  {workspace.git?.isGit ? (
                    <span className="flex items-center gap-1 text-[9px] px-1.5 py-0.2 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                      <GitBranch size={9} />
                      {workspace.git.branch || "git"}
                    </span>
                  ) : (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                      Local Folder
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-(--color-text-muted) truncate mt-0.5">
                  ● Changes automatically sync and write to local disk
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleDisconnect}
                className="px-2.5 py-1 text-xs text-(--color-error) hover:bg-(--color-error)/10 rounded-lg transition-colors cursor-pointer font-medium"
              >
                Disconnect
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex px-5 pt-3 border-b border-(--color-border) gap-4 text-xs font-medium">
          <button
            onClick={() => setActiveTab("open")}
            className={`pb-2.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === "open"
                ? "border-(--color-accent) text-(--color-accent)"
                : "border-transparent text-(--color-text-muted) hover:text-(--color-text-primary)"
            }`}
          >
            Select Existing Directory
          </button>
          <button
            onClick={() => setActiveTab("create")}
            className={`pb-2.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "create"
                ? "border-(--color-accent) text-(--color-accent)"
                : "border-transparent text-(--color-text-muted) hover:text-(--color-text-primary)"
            }`}
          >
            <Sparkles size={12} />
            Create Local Project / Repo
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 flex-1 overflow-y-auto">
          {activeTab === "open" ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-(--color-bg-primary) border border-(--color-border) flex items-start gap-3">
                <FolderOpen size={24} className="text-(--color-accent) shrink-0 mt-0.5" />
                <div className="text-xs text-(--color-text-secondary) leading-relaxed">
                  <strong className="text-(--color-text-primary) block mb-1">
                    Choose any local folder or cloned Git repository
                  </strong>
                  Livy UI will scan SQL files, preserve folder hierarchy, and detect Git branches. Edits and auto-saves write straight to your files on disk with zero cloud uploads.
                </div>
              </div>

              <div className="rounded-xl border border-(--color-border)/70 bg-(--color-bg-primary)/40 p-3 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-(--color-text-primary) font-medium text-[11px]">
                  <GitBranch size={13} className="text-blue-400" />
                  <span>Automatic Git Repository Awareness</span>
                </div>
                <p className="text-[11px] text-(--color-text-muted) leading-normal">
                  If the folder contains a <code className="text-blue-400 font-mono">.git</code> configuration, Livy UI reads your active branch and tracks file status in the UI.
                </p>
              </div>

              <button
                onClick={handleSelectExisting}
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-(--color-accent) hover:bg-(--color-accent-hover) text-black rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
              >
                <FolderOpen size={16} />
                <span>{isLoading ? "Opening Directory..." : "Select Local Directory..."}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-(--color-text-primary) mb-1.5">
                  Project / Workspace Name
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. spark-analytics-repo"
                  className="w-full px-3 py-2 text-xs bg-(--color-bg-primary) border border-(--color-border) rounded-lg text-(--color-text-primary) outline-none focus:border-(--color-accent)"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-(--color-text-primary) mb-1.5">
                  Directory Template
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <div
                    onClick={() => setTemplateType("git")}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      templateType === "git"
                        ? "border-(--color-accent) bg-(--color-accent)/10 shadow-xs"
                        : "border-(--color-border) bg-(--color-bg-primary) hover:border-(--color-text-muted)"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <GitBranch size={14} className="text-blue-400" />
                      <span className="text-xs font-semibold text-(--color-text-primary)">
                        Git-Ready Repo
                      </span>
                    </div>
                    <p className="text-[10px] text-(--color-text-muted) leading-snug">
                      Includes <code className="font-mono text-blue-400">.gitignore</code>, README, <code className="font-mono">queries/</code> and <code className="font-mono">ddl/</code> directories.
                    </p>
                  </div>

                  <div
                    onClick={() => setTemplateType("standard")}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      templateType === "standard"
                        ? "border-(--color-accent) bg-(--color-accent)/10 shadow-xs"
                        : "border-(--color-border) bg-(--color-bg-primary) hover:border-(--color-text-muted)"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <FolderPlus size={14} className="text-emerald-400" />
                      <span className="text-xs font-semibold text-(--color-text-primary)">
                        Standard Folder
                      </span>
                    </div>
                    <p className="text-[10px] text-(--color-text-muted) leading-snug">
                      Clean directory structure with <code className="font-mono text-emerald-400">queries/</code> and starter script.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-(--color-bg-primary) border border-(--color-border) rounded-xl text-[11px] text-(--color-text-muted) leading-relaxed">
                Clicking the button below will ask you to select or create a local directory on your computer, and Livy UI will scaffold the template files right inside it.
              </div>

              <button
                onClick={handleCreateNew}
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-(--color-accent) hover:bg-(--color-accent-hover) text-black rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
              >
                <FolderPlus size={16} />
                <span>{isLoading ? "Creating Project..." : "Choose Directory & Initialize"}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
