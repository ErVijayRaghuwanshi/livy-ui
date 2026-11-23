import { useRef } from "react";
import {
  Sliders,
  Code,
  ExternalLink,
  Maximize2,
  Minimize2,
  X,
  Search,
  RotateCcw,
  Download,
  Upload,
  CheckCircle2,
  Filter,
} from "lucide-react";

export default function SettingsHeader({
  mode,
  setMode,
  searchQuery,
  setSearchQuery,
  showModifiedOnly,
  setShowModifiedOnly,
  modifiedCount = 0,
  filteredCount = 0,
  onResetAll,
  onExportSettings,
  onImportSettings,
  isModal = false,
  isMaximized = false,
  onToggleMaximize,
  onClose,
  onOpenAsTab,
  onOpenAsModal,
}) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (content && onImportSettings) {
        onImportSettings(content);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="flex flex-col shrink-0 border-b border-(--color-border) bg-(--color-bg-secondary) select-none">
      {/* 1. Window / Modal Top Bar */}
      <div className="flex items-center justify-between h-10 px-4 border-b border-(--color-border)/50 bg-(--color-bg-secondary)">
        {/* Left: Window title */}
        <div className="flex items-center gap-2">
          <Sliders size={15} className="text-(--color-accent)" />
          <span className="text-xs font-semibold text-(--color-text-primary) tracking-wide">
            Settings
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          {/* Export Settings */}
          {onExportSettings && (
            <button
              onClick={onExportSettings}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs text-(--color-text-secondary) hover:text-(--color-text-primary) hover:bg-(--color-bg-tertiary) transition-colors cursor-pointer"
              title="Export Settings as JSON file"
            >
              <Download size={13} />
              <span className="hidden md:inline text-[11px]">Export</span>
            </button>
          )}

          {/* Import Settings */}
          {onImportSettings && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs text-(--color-text-secondary) hover:text-(--color-text-primary) hover:bg-(--color-bg-tertiary) transition-colors cursor-pointer"
                title="Import Settings from JSON file"
              >
                <Upload size={13} />
                <span className="hidden md:inline text-[11px]">Import</span>
              </button>
            </>
          )}

          {/* {} Open JSON Button */}
          <button
            onClick={() => setMode((m) => (m === "ui" ? "json" : "ui"))}
            className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
              mode === "json"
                ? "bg-(--color-accent)/20 text-(--color-accent) font-medium"
                : "text-(--color-text-secondary) hover:text-(--color-text-primary) hover:bg-(--color-bg-tertiary)"
            }`}
            title={mode === "ui" ? "Open Settings (JSON)" : "Open Settings (UI)"}
          >
            <Code size={14} />
          </button>

          {/* Open as Tab Button (Modal mode) */}
          {isModal && onOpenAsTab && (
            <button
              onClick={onOpenAsTab}
              className="p-1.5 rounded text-xs text-(--color-text-secondary) hover:text-(--color-text-primary) hover:bg-(--color-bg-tertiary) transition-colors cursor-pointer"
              title="Open in Editor Tab"
            >
              <ExternalLink size={14} />
            </button>
          )}

          {/* Open as Floating Modal Button (Tab mode) */}
          {!isModal && onOpenAsModal && (
            <button
              onClick={onOpenAsModal}
              className="p-1.5 rounded text-xs text-(--color-text-secondary) hover:text-(--color-text-primary) hover:bg-(--color-bg-tertiary) transition-colors cursor-pointer"
              title="Open as Floating Overlay"
            >
              <ExternalLink size={14} />
            </button>
          )}

          {/* Maximize Toggle Button (Modal mode) */}
          {isModal && onToggleMaximize && (
            <button
              onClick={onToggleMaximize}
              className="p-1.5 rounded text-xs text-(--color-text-secondary) hover:text-(--color-text-primary) hover:bg-(--color-bg-tertiary) transition-colors cursor-pointer"
              title={isMaximized ? "Restore Window" : "Maximize Window"}
            >
              {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
          )}

          {/* Close Button (Modal mode) */}
          {isModal && onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded text-xs text-(--color-text-secondary) hover:text-white hover:bg-(--color-error) transition-colors cursor-pointer ml-1"
              title="Close (Esc)"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* 2. Search & Filter Subheader (UI Mode) */}
      {mode === "ui" && (
        <div className="px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px] max-w-xl">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-(--color-text-muted) pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search settings (e.g. font, spark, doris, ai, @modified)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 text-xs rounded-md bg-(--color-bg-primary) border border-(--color-border) text-(--color-text-primary) placeholder:text-(--color-text-muted) focus:outline-none focus:border-(--color-accent) transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-(--color-text-muted) hover:text-(--color-text-primary) p-0.5 cursor-pointer"
                title="Clear search"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Quick Filter Pills & Actions */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {/* Modified Settings Filter Pill */}
            <button
              onClick={() => setShowModifiedOnly((prev) => !prev)}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md border transition-all cursor-pointer ${
                showModifiedOnly
                  ? "bg-(--color-accent)/15 border-(--color-accent)/40 text-(--color-accent) font-medium"
                  : "bg-(--color-bg-primary) border-(--color-border) text-(--color-text-secondary) hover:text-(--color-text-primary)"
              }`}
              title="Filter to settings modified from defaults"
            >
              <Filter size={11} />
              <span>Modified</span>
              {modifiedCount > 0 && (
                <span className="text-[10px] font-mono px-1 py-0.2 rounded-full bg-(--color-accent)/20 font-semibold">
                  {modifiedCount}
                </span>
              )}
            </button>

            {/* Results count indicator */}
            {(searchQuery || showModifiedOnly) && (
              <span className="text-xs text-(--color-text-muted)">
                {filteredCount} {filteredCount === 1 ? "setting" : "settings"} found
              </span>
            )}

            {/* Reset Defaults */}
            <button
              onClick={onResetAll}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-(--color-text-secondary) hover:text-(--color-text-primary) hover:bg-(--color-bg-tertiary) border border-(--color-border) rounded-md transition-colors cursor-pointer"
              title="Reset all settings to default values"
            >
              <RotateCcw size={12} />
              <span className="hidden sm:inline">Reset Defaults</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
