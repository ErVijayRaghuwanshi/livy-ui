import { Folder, Search, Database, Settings } from "lucide-react";
import { useSqlFiles } from "../context/SqlFilesContext";

const isMac = typeof window !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0;

export default function ActivityBar({
  activeTab,
  setActiveTab,
  sidebarCollapsed,
  setSidebarCollapsed,
}) {
  const { openSettingsTab, activeTabId } = useSqlFiles();

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
    <div className="flex flex-col items-center justify-between w-12 h-full bg-(--color-bg-primary) border-r border-(--color-border) py-3 select-none shrink-0 z-40">
      {/* Top Icons */}
      <div className="flex flex-col items-center gap-4 w-full">
        {/* Files Tab */}
        <button
          onClick={() => handleTabClick("files")}
          className={`relative flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 group cursor-pointer ${
            !sidebarCollapsed && activeTab === "files"
              ? "text-(--color-accent) bg-(--color-bg-secondary)/50"
              : "text-(--color-text-muted) hover:text-(--color-text-primary) hover:bg-(--color-bg-secondary)/30"
          }`}
          title={isMac ? "Explorer (Files, Open Editors) (⌘⇧E)" : "Explorer (Files, Open Editors) (Ctrl+Shift+E)"}
        >
          {!sidebarCollapsed && activeTab === "files" && (
            <span className="absolute left-0 top-2 bottom-2 w-0.75 bg-(--color-accent) rounded-r-md" />
          )}
          <Folder size={18} className="transition-transform group-hover:scale-105" />
        </button>

        {/* Search Tab */}
        <button
          onClick={() => handleTabClick("search")}
          className={`relative flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 group cursor-pointer ${
            !sidebarCollapsed && activeTab === "search"
              ? "text-(--color-accent) bg-(--color-bg-secondary)/50"
              : "text-(--color-text-muted) hover:text-(--color-text-primary) hover:bg-(--color-bg-secondary)/30"
          }`}
          title="Search in Files"
        >
          {!sidebarCollapsed && activeTab === "search" && (
            <span className="absolute left-0 top-2 bottom-2 w-0.75 bg-(--color-accent) rounded-r-md" />
          )}
          <Search size={18} className="transition-transform group-hover:scale-105" />
        </button>

        {/* Schema Explorer Tab */}
        <button
          onClick={() => handleTabClick("schema")}
          className={`relative flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 group cursor-pointer ${
            !sidebarCollapsed && activeTab === "schema"
              ? "text-(--color-accent) bg-(--color-bg-secondary)/50"
              : "text-(--color-text-muted) hover:text-(--color-text-primary) hover:bg-(--color-bg-secondary)/30"
          }`}
          title={isMac ? "Schema Explorer (⌘⇧K)" : "Schema Explorer (Ctrl+Shift+K)"}
        >
          {!sidebarCollapsed && activeTab === "schema" && (
            <span className="absolute left-0 top-2 bottom-2 w-0.75 bg-(--color-accent) rounded-r-md" />
          )}
          <Database size={18} className="transition-transform group-hover:scale-105" />
        </button>
      </div>

      {/* Bottom Icons */}
      <div className="flex flex-col items-center w-full">
        {/* Settings Tab */}
        <button
          onClick={() => openSettingsTab()}
          className={`relative flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 group cursor-pointer ${
            activeTabId === "settings"
              ? "text-(--color-accent) bg-(--color-bg-secondary)/50"
              : "text-(--color-text-muted) hover:text-(--color-text-primary) hover:bg-(--color-bg-secondary)/30"
          }`}
          title={isMac ? "Preferences: Open Settings (⌘,)" : "Preferences: Open Settings (Ctrl+,)"}
        >
          {activeTabId === "settings" && (
            <span className="absolute left-0 top-2 bottom-2 w-0.75 bg-(--color-accent) rounded-r-md" />
          )}
          <Settings size={18} className="transition-transform group-hover:rotate-45 duration-300" />
        </button>
      </div>
    </div>
  );
}
