import Editor from "@monaco-editor/react";
import { AlertCircle } from "lucide-react";

export default function JsonSettingsEditor({
  jsonText,
  jsonError,
  onChange,
  theme = "dark",
  editorSettings = {},
}) {
  const monacoTheme = theme === "light" ? "vs" : "vscode-dark-custom";

  return (
    <div className="flex flex-col flex-1 min-h-0 relative bg-(--color-bg-primary)">
      {jsonError && (
        <div className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 border-b border-rose-500/30 text-rose-400 text-xs shrink-0 font-mono">
          <AlertCircle size={14} className="shrink-0" />
          <span>Syntax Error: {jsonError}</span>
        </div>
      )}

      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language="json"
          theme={monacoTheme}
          value={jsonText}
          onChange={onChange}
          options={{
            fontSize: editorSettings["editor.fontSize"] || 14,
            fontFamily: editorSettings["editor.fontFamily"] || "'JetBrains Mono', monospace",
            tabSize: editorSettings["editor.tabSize"] || 2,
            wordWrap: editorSettings["editor.wordWrap"] || "on",
            minimap: { enabled: false },
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            formatOnPaste: true,
            formatOnType: true,
          }}
        />
      </div>

      <div className="flex items-center justify-between px-4 py-1.5 border-t border-(--color-border) bg-(--color-bg-secondary) text-xs text-(--color-text-muted) font-mono shrink-0 select-none">
        <span>settings.json</span>
        <span>Language: JSON</span>
      </div>
    </div>
  );
}
