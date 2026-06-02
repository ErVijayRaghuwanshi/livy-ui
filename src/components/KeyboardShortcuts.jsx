import { useEffect } from "react";
import { X, Keyboard } from "lucide-react";

const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
const mod = isMac ? "⌘" : "Ctrl";
const alt = isMac ? "⌥" : "Alt";

const SHORTCUTS = [
  { keys: [`${mod}+Enter`], description: "Run SQL (selected text or all)" },
  { keys: [`${mod}+Shift+F`], description: "Format SQL (statement-by-statement)" },
  { keys: [`${mod}+Shift+M`], description: "Minify SQL (statement-by-statement)" },
  { keys: [`${mod}+S`], description: "Save SQL file" },
  { keys: [`${mod}+Shift+A`], description: "Toggle Auto-Save" },
  { keys: [isMac ? "⌥+Z" : "Alt+Z"], description: "Toggle Word Wrap" },
  { keys: [`${mod}+B`], description: "Toggle sidebar" },
  { keys: [`${mod}+Shift+E`], description: "Focus File Explorer" },
  { keys: [`${mod}+K`], description: "Focus Schema Explorer" },
  { keys: [`${mod}+.`], description: "Manage Livy hosts" },
  { keys: [`${mod}+\``], description: "Toggle result panel" },
  { keys: [isMac ? "⌘+⌥+N" : "Ctrl+Alt+N"], description: "New SQL file" },
  { keys: [isMac ? "⌘+⌥+W" : "Ctrl+Alt+W"], description: "Close active tab" },
  { keys: [`${mod}+PageUp`, isMac ? "⌘+⌥+←" : "Ctrl+Alt+←"], description: "Previous tab" },
  { keys: [`${mod}+PageDown`, isMac ? "⌘+⌥+→" : "Ctrl+Alt+→"], description: "Next tab" },
  { keys: [`${mod}+H`], description: "Query history" },
  { keys: [`${mod}+/`], description: "Show keyboard shortcuts" },
  { keys: ["F2"], description: "Rename file (in File Explorer)" },
  { keys: isMac ? ["Delete", "Backspace"] : ["Del"], description: "Delete file (in File Explorer)" },
  { keys: ["Esc"], description: "Close modals / dropdowns" },
];

export default function KeyboardShortcuts({ isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-(--color-bg-secondary) border border-(--color-border) rounded-xl shadow-2xl w-full max-w-md mx-4 animate-in zoom-in-95 slide-in-from-bottom-4 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-(--color-border)">
          <div className="flex items-center gap-2">
            <Keyboard size={18} className="text-(--color-accent)" />
            <h2 className="text-sm font-semibold text-(--color-text-primary)">Keyboard Shortcuts</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-(--color-bg-tertiary) transition-colors">
            <X size={16} className="text-(--color-text-secondary)" />
          </button>
        </div>

        {/* Shortcuts list */}
        <div className="px-5 py-3 max-h-96 overflow-y-auto">
          {SHORTCUTS.map((shortcut, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-2 border-b border-(--color-border)/30 last:border-0"
            >
              <span className="text-xs text-(--color-text-secondary)">{shortcut.description}</span>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key, j) => (
                  <kbd
                    key={j}
                    className="px-2 py-0.5 text-[11px] font-mono bg-(--color-bg-primary) border border-(--color-border) rounded text-(--color-text-primary)"
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-(--color-border)">
          <p className="text-[10px] text-(--color-text-muted) text-center">
            Press <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-(--color-bg-primary) border border-(--color-border) rounded">Esc</kbd> to close
          </p>
        </div>
      </div>
    </div>
  );
}
