import { FilePlus, Search, Database, Keyboard, Sparkles, Terminal, History, RotateCcw } from "lucide-react";

const isMac = typeof window !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0;
const mod = isMac ? "⌘" : "Ctrl";
const alt = isMac ? "⌥" : "Alt";

export default function WelcomeScreen({ onCreateFile, onFocusFiles, onFocusSchema, onShowShortcuts, onShowHistory, onRestoreTab, hasClosedTabs }) {
  const actions = [
    {
      icon: FilePlus,
      label: "New SQL File",
      shortcut: [mod, alt, "N"],
      onClick: onCreateFile,
    },
    {
      icon: Search,
      label: "Focus File Explorer",
      shortcut: [mod, "Shift", "E"],
      onClick: onFocusFiles,
    },
    {
      icon: Database,
      label: "Focus Schema Explorer",
      shortcut: [mod, "Shift", "K"],
      onClick: onFocusSchema,
    },
    {
      icon: History,
      label: "Query History",
      shortcut: [mod, "H"],
      onClick: onShowHistory,
    },
    {
      icon: Keyboard,
      label: "Keyboard Shortcuts",
      shortcut: [mod, "/"],
      onClick: onShowShortcuts,
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-(--color-bg-primary) to-(--color-bg-secondary)/80 text-center animate-in fade-in duration-300">
      <div className="relative mb-6 flex items-center justify-center">
        {/* Glow effect */}
        <div className="absolute w-24 h-24 rounded-full bg-(--color-accent)/20 blur-xl animate-pulse" />
        <div className="relative p-5 rounded-2xl bg-(--color-bg-secondary)/60 border border-(--color-border) shadow-xl flex items-center justify-center">
          <Terminal size={48} className="text-(--color-accent)" />
        </div>
      </div>

      <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-(--color-text-primary) flex items-center gap-2 mb-2">
        Welcome to Livy SQL Editor <Sparkles size={16} className="text-(--color-warning) animate-bounce" />
      </h1>
      <p className="text-xs text-(--color-text-muted) max-w-sm mb-8 leading-relaxed">
        Start a Spark SQL session, query data catalogs, and manage files. Create a new tab or focus the explorers to begin.
      </p>

      {/* Quick Action Commands */}
      <div className="w-full max-w-sm flex flex-col gap-2.5">
        {actions.map((action, idx) => {
          const Icon = action.icon;
          return (
            <button
              key={idx}
              onClick={action.onClick}
              className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-(--color-bg-secondary)/40 hover:bg-(--color-bg-tertiary)/75 border border-(--color-border)/40 hover:border-(--color-accent)/30 text-left transition-all active:scale-[0.99] group shadow-sm cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-(--color-bg-primary) border border-(--color-border)/30 text-(--color-text-secondary) group-hover:text-(--color-accent) transition-colors">
                  <Icon size={14} />
                </div>
                <span className="text-xs font-medium text-(--color-text-secondary) group-hover:text-(--color-text-primary) transition-colors">
                  {action.label}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {action.shortcut.map((key, kIdx) => (
                  <kbd
                    key={kIdx}
                    className="px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-(--color-bg-primary) border border-(--color-border) text-(--color-text-muted) rounded"
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
