import { Zap, Search, HelpCircle } from "lucide-react";
import { useLivy } from "../context/LivyContext";

const isMac = typeof window !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0;

export default function TitleBar({ onOpenCommandPalette, onShowShortcuts }) {
  const { activeHost, sessionState } = useLivy();

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
    <div className="flex items-center justify-between h-9 px-3 bg-(--color-bg-primary) border-b border-(--color-border) shrink-0 select-none text-xs text-(--color-text-secondary) z-40">
      {/* Left: Brand logo & name */}
      <div className="flex items-center gap-1.5 font-bold text-(--color-text-primary)">
        <Zap size={14} className="text-(--color-accent) fill-current" />
        <span className="tracking-tight text-[11px]">Livy SQL</span>
      </div>

      {/* Center: Command Center Pill */}
      <div className="flex-1 max-w-[460px] mx-4">
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center justify-between w-full h-6 px-3 bg-(--color-bg-secondary)/40 hover:bg-(--color-bg-secondary)/90 border border-(--color-border)/80 hover:border-(--color-accent)/40 rounded-md text-(--color-text-muted) hover:text-(--color-text-secondary) transition-all cursor-pointer shadow-xs"
        >
          <div className="flex items-center gap-1.5 truncate">
            <Search size={12} className="shrink-0" />
            <span className="truncate text-[10px]">
              livy-ui — Search files or run commands
            </span>
          </div>
          <span className="text-[9px] font-mono bg-(--color-bg-tertiary)/60 px-1.5 py-0.2 rounded border border-(--color-border)/40 text-(--color-text-muted)">
            {isMac ? "⌘P" : "Ctrl+P"}
          </span>
        </button>
      </div>

      {/* Right: Quick connection status & shortcuts */}
      <div className="flex items-center gap-3">
        {/* Connection status snippet */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-(--color-bg-secondary)/30 border border-(--color-border)/40 rounded-md">
          <span className={`w-1.5 h-1.5 rounded-full ${stateColors[sessionState] || "bg-gray-500"}`} />
          <span className="text-[10px] font-mono text-(--color-text-muted) truncate max-w-28">
            {activeHost.name}
          </span>
        </div>

        {/* Keyboard Shortcuts Quick trigger */}
        <button
          onClick={onShowShortcuts}
          className="flex items-center justify-center p-1 rounded hover:bg-(--color-bg-secondary) text-(--color-text-muted) hover:text-(--color-text-secondary) transition-colors cursor-pointer"
          title="Keyboard Shortcuts"
        >
          <HelpCircle size={14} />
        </button>
      </div>
    </div>
  );
}
