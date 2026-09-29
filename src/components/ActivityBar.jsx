import { Folder, Search, Database, Settings, HardDrive, GitBranch } from "lucide-react";
import { useSqlFiles } from "../context/SqlFilesContext";

const isMac = typeof window !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0;

export default function ActivityBar({
  activeTab,
  setActiveTab,
  sidebarCollapsed,
  setSidebarCollapsed,
  isSettingsOpen,
  onOpenSettings,
  onOpenWorkspaceModal,
}) {
  const { openSettingsTab, activeTabId, workspace } = useSqlFiles();

  const handleTabClick = (tab) => {
    if (sidebarCollapsed) {
      setActiveTab(tab);
      setSidebarCollapsed(false);
    } else if (activeTab === tab) {
      setSidebarCollapsed(true);
    } else {
      setActiveTab(tab);
    }
  };

  return (
    <div className="flex flex-col items-center justify-between w-12 h-full bg-(--color-bg-secondary) border-r border-(--color-border) select-none shrink-0 z-40">
      {/* Top Icons */}
      <div className="flex flex-col items-center w-full">
        {/* Files Tab */}
        <button
          onClick={() => handleTabClick("files")}
          className={`relative flex items-center justify-center w-12 h-12 transition-colors cursor-pointer ${
            !sidebarCollapsed && activeTab === "files"
              ? "text-white"
              : "text-[#858585] hover:text-white"
          }`}
          title={isMac ? "Explorer (Files, Open Editors) (⌘⇧E)" : "Explorer (Files, Open Editors) (Ctrl+Shift+E)"}
        >
          {!sidebarCollapsed && activeTab === "files" && (
            <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-white" />
          )}
          <Folder size={20} />
        </button>

        {/* Search Tab */}
        <button
          onClick={() => handleTabClick("search")}
          className={`relative flex items-center justify-center w-12 h-12 transition-colors cursor-pointer ${
            !sidebarCollapsed && activeTab === "search"
              ? "text-white"
              : "text-[#858585] hover:text-white"
          }`}
          title="Search in Files"
        >
          {!sidebarCollapsed && activeTab === "search" && (
            <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-white" />
          )}
          <Search size={20} />
        </button>

        {/* Schema Explorer Tab */}
        <button
          onClick={() => handleTabClick("schema")}
          className={`relative flex items-center justify-center w-12 h-12 transition-colors cursor-pointer ${
            !sidebarCollapsed && activeTab === "schema"
              ? "text-white"
              : "text-[#858585] hover:text-white"
          }`}
          title={isMac ? "Schema Explorer (⌘⇧K)" : "Schema Explorer (Ctrl+Shift+K)"}
        >
          {!sidebarCollapsed && activeTab === "schema" && (
            <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-white" />
          )}
          <Database size={20} />
        </button>

        {/* Local Workspace / Git Directory Sync */}
        <button
          onClick={onOpenWorkspaceModal}
          className={`relative flex items-center justify-center w-12 h-12 transition-colors cursor-pointer ${
            workspace?.isConnected ? "text-emerald-400 hover:text-emerald-300" : "text-[#858585] hover:text-white"
          }`}
          title={
            workspace?.isConnected
              ? `Local Workspace: ${workspace.name}${workspace.git?.isGit ? ` (${workspace.git.branch})` : ""} — Click to manage`
              : "Open or Create Local Workspace / Git Repo"
          }
        >
          {workspace?.isConnected ? (
            workspace.git?.isGit ? (
              <GitBranch size={19} className="text-blue-400" />
            ) : (
              <HardDrive size={19} className="text-emerald-400" />
            )
          ) : (
            <HardDrive size={19} />
          )}
          {workspace?.isConnected && (
            <span className="absolute bottom-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
          )}
        </button>
      </div>

      {/* Bottom Icons */}
      <div className="flex flex-col items-center w-full pb-1">
        {/* Settings Tab */}
        <button
          onClick={() => {
            if (onOpenSettings) {
              onOpenSettings();
            } else {
              openSettingsTab();
            }
          }}
          className={`relative flex items-center justify-center w-12 h-12 transition-colors cursor-pointer ${
            isSettingsOpen || activeTabId === "settings"
              ? "text-white"
              : "text-[#858585] hover:text-white"
          }`}
          title={isMac ? "Preferences: Open Settings (⌘,)" : "Preferences: Open Settings (Ctrl+,)"}
        >
          {(isSettingsOpen || activeTabId === "settings") && (
            <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-white" />
          )}
          <Settings size={20} className="hover:rotate-45 transition-transform duration-300" />
        </button>
      </div>
    </div>
  );
}
