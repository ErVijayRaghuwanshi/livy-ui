import { Folder, Search, Database, Cpu, Sparkles, Settings } from "lucide-react";

export default function MobileBottomNav({
  activeTab,
  setActiveTab,
  sidebarCollapsed,
  setSidebarCollapsed,
  isSettingsOpen,
  onOpenSettings,
  isAiPanelOpen,
  onToggleAiPanel,
  onCloseAiPanel,
}) {
  const handleSidebarTab = (tab) => {
    if (isAiPanelOpen && onCloseAiPanel) {
      onCloseAiPanel();
    }
    if (sidebarCollapsed) {
      setActiveTab(tab);
      setSidebarCollapsed(false);
    } else if (activeTab === tab) {
      setSidebarCollapsed(true);
    } else {
      setActiveTab(tab);
    }
  };

  const handleAiClick = () => {
    if (!sidebarCollapsed) {
      setSidebarCollapsed(true);
    }
    onToggleAiPanel();
  };

  const items = [
    {
      id: "files",
      label: "Files",
      icon: Folder,
      active: !sidebarCollapsed && activeTab === "files",
      onClick: () => handleSidebarTab("files"),
    },
    {
      id: "search",
      label: "Search",
      icon: Search,
      active: !sidebarCollapsed && activeTab === "search",
      onClick: () => handleSidebarTab("search"),
    },
    {
      id: "schema",
      label: "Schema",
      icon: Database,
      active: !sidebarCollapsed && activeTab === "schema",
      onClick: () => handleSidebarTab("schema"),
    },
    {
      id: "compute",
      label: "Compute",
      icon: Cpu,
      active: !sidebarCollapsed && activeTab === "compute",
      onClick: () => handleSidebarTab("compute"),
    },
    {
      id: "ai",
      label: "AI Chat",
      icon: Sparkles,
      active: isAiPanelOpen,
      isAi: true,
      onClick: handleAiClick,
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      active: isSettingsOpen,
      onClick: onOpenSettings,
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="flex sm:hidden items-center justify-around bg-(--color-bg-secondary) border-t border-(--color-border) shrink-0 select-none z-40 pb-safe"
    >
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            type="button"
            onClick={item.onClick}
            className={`relative flex flex-col items-center justify-center flex-1 min-h-[48px] py-1 gap-0.5 transition-colors cursor-pointer ${
              item.active
                ? item.isAi
                  ? "text-purple-400"
                  : "text-(--color-accent)"
                : "text-(--color-text-muted) active:text-(--color-text-primary)"
            }`}
            aria-label={item.label}
          >
            {item.active && (
              <span
                className={`absolute top-0 left-3 right-3 h-[2px] rounded-b-full ${
                  item.isAi ? "bg-purple-500" : "bg-(--color-accent)"
                }`}
              />
            )}
            <Icon size={18} />
            <span className="text-[9px] font-medium leading-none">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
