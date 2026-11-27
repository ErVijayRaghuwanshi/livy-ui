import { Zap, Search, Sparkles, Download } from "lucide-react";
import { useLivy } from "../context/LivyContext";
import { usePwaInstall } from "../hooks/usePwaInstall";

const isMac = typeof window !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0;

export default function TitleBar({ onOpenCommandPalette, onOpenComputePanel, isAiPanelOpen, onToggleAiPanel }) {
  const { activeHost, sessionState, isDoris } = useLivy();
  const { canInstall, isStandalone, installApp } = usePwaInstall();

  const stateColors = {
    not_started: "bg-gray-500",
    starting: "bg-yellow-500 animate-pulse",
    idle: "bg-green-500",
    busy: "bg-blue-500 animate-pulse",
    error: "bg-red-500",
    dead: "bg-red-700",
    killed: "bg-red-700",
    shutting_down: "bg-orange-500 animate-pulse",
    success: "bg-green-500",
  };

  return (
    <div className="relative flex items-center justify-between h-10 sm:h-9 px-2.5 sm:px-3 bg-(--color-bg-secondary) border-b border-(--color-border) shrink-0 select-none text-xs text-(--color-text-secondary) z-40 gap-2">
      {/* Left: Brand logo & name */}
      <div className="flex items-center gap-1.5 sm:gap-2 font-semibold text-(--color-text-primary) z-10 shrink-0">
        <Zap size={15} className="text-(--color-accent) fill-current shrink-0" />
        <span className="hidden sm:inline tracking-tight text-[12px] font-medium">Livy UI</span>
      </div>

      {/* Center: Command Center Pill (Flex on mobile, Dead Centered Horizontally on sm+) */}
      <div className="flex-1 min-w-0 max-w-[460px] sm:absolute sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:px-4 z-10 pointer-events-auto">
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center justify-between w-full h-7 sm:h-6.5 px-2.5 sm:px-3 bg-(--color-bg-primary) hover:bg-(--color-bg-tertiary)/60 border border-(--color-border) hover:border-(--color-accent)/40 rounded-lg text-(--color-text-muted) hover:text-(--color-text-primary) transition-all cursor-pointer shadow-xs"
        >
          <div className="flex items-center gap-1.5 truncate">
            <Search size={12} className="shrink-0 text-(--color-text-muted)" />
            <span className="truncate text-[11px]">
              <span className="sm:hidden">Search or commands…</span>
              <span className="hidden sm:inline">Search files or run commands</span>
            </span>
          </div>
          <span className="hidden sm:inline text-[9px] font-mono bg-(--color-bg-tertiary) px-1.5 py-0.5 rounded border border-(--color-border) text-(--color-text-muted) shrink-0">
            {isMac ? "⌘P" : "Ctrl+P"}
          </span>
        </button>
      </div>

      {/* Right: AI Copilot toggle */}
      <div className="flex items-center gap-2 z-10 shrink-0">
        <button
          onClick={onToggleAiPanel}
          className={`flex items-center gap-1.5 px-2.5 sm:px-2 py-1 min-h-[28px] sm:min-h-0 rounded-md border text-[11px] transition-all cursor-pointer ${
            isAiPanelOpen
              ? "bg-purple-950/60 text-purple-300 border-purple-500/50 shadow-[0_0_8px_rgba(168,85,247,0.3)]"
              : "bg-(--color-bg-primary) hover:bg-(--color-bg-tertiary)/60 text-(--color-text-secondary) hover:text-white border-(--color-border)"
          }`}
          title={isMac ? "Toggle Chat (⌘⇧A)" : "Toggle Chat (Ctrl+Shift+A)"}
        >
          <Sparkles size={12} className={isAiPanelOpen ? "text-purple-400" : "text-[#858585]"} />
          <span className="font-medium text-[11px]">Chat</span>
        </button>
      </div>
    </div>
  );
}
