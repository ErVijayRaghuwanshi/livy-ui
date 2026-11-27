import { FilePlus, FileText, Keyboard, Sparkles, Terminal, History, RotateCcw, ChevronRight } from "lucide-react";

const isMac = typeof window !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0;
const mod = isMac ? "⌘" : "Ctrl";
const alt = isMac ? "⌥" : "Alt";

export default function WelcomeScreen({
  onCreateFile,
  onCreateMarkdownFile,
  onShowShortcuts,
  onShowHistory,
  onRestoreTab,
  hasClosedTabs,
}) {
  const actions = [
    {
      icon: FilePlus,
      label: "New SQL File",
      shortcut: [mod, alt, "N"],
      onClick: onCreateFile,
      highlight: true,
    },
    {
      icon: FileText,
      label: "New Markdown Document",
      shortcut: [mod, alt, "M"],
      onClick: onCreateMarkdownFile,
    },
    ...(hasClosedTabs && onRestoreTab
      ? [
          {
            icon: RotateCcw,
            label: "Reopen Closed Tab",
            shortcut: [mod, "Shift", "T"],
            onClick: onRestoreTab,
          },
        ]
      : []),
    {
      icon: History,
      label: "Query History",
      shortcut: ["Ctrl", "H"],
      onClick: onShowHistory,
    },
    {
      icon: Keyboard,
      label: "Keyboard Shortcuts",
      shortcut: ["?"],
      onClick: onShowShortcuts,
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center p-4 sm:p-6 overflow-y-auto bg-gradient-to-b from-(--color-bg-primary) to-(--color-bg-secondary)/80 text-center select-none animate-in fade-in duration-300">
      <div className="w-full max-w-sm sm:max-w-md my-auto flex flex-col items-center py-2">
        <div className="relative mb-4 sm:mb-6 flex items-center justify-center">
          {/* Glow effect */}
          <div className="absolute w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-(--color-accent)/20 blur-xl animate-pulse" />
          <div className="relative p-4 sm:p-5 rounded-2xl bg-(--color-bg-secondary)/60 border border-(--color-border) shadow-xl flex items-center justify-center">
            <Terminal className="w-9 h-9 sm:w-12 sm:h-12 text-(--color-accent)" />
          </div>
        </div>

        <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-(--color-text-primary) flex items-center justify-center flex-wrap gap-1.5 sm:gap-2 mb-2">
          <span>Welcome to Livy SQL Editor</span>
          <Sparkles size={16} className="text-(--color-warning) animate-bounce shrink-0" />
        </h1>
        <p className="text-xs sm:text-sm text-(--color-text-muted) max-w-sm sm:max-w-md mb-6 sm:mb-8 leading-relaxed">
          Start a Spark or Doris SQL session, explore data catalogs, and manage files. Create a new tab or open the sidebar to begin.
        </p>

        {/* Quick Action Commands */}
        <div className="w-full flex flex-col gap-2.5">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                type="button"
                onClick={action.onClick}
                className={`flex items-center justify-between w-full min-h-[48px] px-3.5 sm:px-4 py-3 rounded-xl border text-left transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent)/60 group shadow-sm cursor-pointer ${
                  action.highlight
                    ? "bg-(--color-accent)/10 hover:bg-(--color-accent)/15 border-(--color-accent)/40"
                    : "bg-(--color-bg-secondary)/40 hover:bg-(--color-bg-tertiary)/75 border-(--color-border)/40 hover:border-(--color-accent)/30"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`p-2 rounded-lg border shrink-0 transition-colors ${
                      action.highlight
                        ? "bg-(--color-accent)/20 border-(--color-accent)/30 text-(--color-accent)"
                        : "bg-(--color-bg-primary) border-(--color-border)/30 text-(--color-text-secondary) group-hover:text-(--color-accent)"
                    }`}
                  >
                    <Icon size={16} />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-(--color-text-secondary) group-hover:text-(--color-text-primary) transition-colors truncate">
                    {action.label}
                  </span>
                </div>
                <div className="hidden sm:flex items-center gap-1 shrink-0 ml-2">
                  {action.shortcut.map((key, kIdx) => (
                    <kbd
                      key={kIdx}
                      className="px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-(--color-bg-primary) border border-(--color-border) text-(--color-text-muted) rounded"
                    >
                      {key}
                    </kbd>
                  ))}
                </div>
                <ChevronRight size={15} className="sm:hidden shrink-0 ml-2 text-(--color-text-muted) opacity-70" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
