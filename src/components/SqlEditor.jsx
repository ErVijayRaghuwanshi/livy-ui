import { useRef, useCallback, useState } from "react";
import Editor from "@monaco-editor/react";
import { Play, AlignLeft, Loader2, Ban } from "lucide-react";
import { format } from "sql-formatter";
import { useSqlFiles } from "../context/SqlFilesContext";
import { useLivy } from "../context/LivyContext";
import { SESSION_STATES, STATEMENT_STATES, POLL_INTERVAL_MS } from "../utils/constants";
import * as livyApi from "../services/livyApi";
import { SPARK_FUNCTIONS_DATA } from "../utils/spark-functions-data";
import { SPARK_SQL_KEYWORDS } from "../utils/spark-keywords-data";

let providersRegistered = false;

function registerSparkProviders(monaco) {
  if (providersRegistered) return;
  providersRegistered = true;

  // Filter to only named functions (skip operators like !, !=, etc.)
  const namedFunctions = SPARK_FUNCTIONS_DATA.filter((f) =>
    /^[a-z_]/i.test(f.name)
  );

  // Completion provider for functions
  monaco.languages.registerCompletionItemProvider("sql", {
    triggerCharacters: [" ", "(", ",", "."],
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      const functionSuggestions = namedFunctions.map((fn) => ({
        label: fn.name,
        kind: monaco.languages.CompletionItemKind.Function,
        insertText: fn.name.includes("(") ? fn.name : fn.name + "($0)",
        insertTextRules:
          monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        detail: `[${fn.category}] ${fn.usage}`,
        documentation: {
          value: `**${fn.name}**\n\n\`${fn.usage}\`\n\n${fn.description}`,
        },
        range,
      }));

      const keywordSuggestions = SPARK_SQL_KEYWORDS.map((kw) => ({
        label: kw,
        kind: monaco.languages.CompletionItemKind.Keyword,
        insertText: kw,
        detail: "Spark SQL Keyword",
        range,
      }));

      return { suggestions: [...keywordSuggestions, ...functionSuggestions] };
    },
  });

  // Hover provider for functions
  monaco.languages.registerHoverProvider("sql", {
    provideHover: (model, position) => {
      const word = model.getWordAtPosition(position);
      if (!word) return null;

      const match = namedFunctions.find(
        (fn) => fn.name.toLowerCase() === word.word.toLowerCase()
      );
      if (!match) return null;

      return {
        range: new monaco.Range(
          position.lineNumber,
          word.startColumn,
          position.lineNumber,
          word.endColumn
        ),
        contents: [
          { value: `**${match.name}** — *${match.category}*` },
          { value: `\`\`\`sql\n${match.usage}\n\`\`\`` },
          { value: match.description },
        ],
      };
    },
  });
}

export default function SqlEditor({ onResult }) {
  const { activeFile, updateContent } = useSqlFiles();
  const { sessionId, sessionState } = useLivy();
  const editorRef = useRef(null);
  const [running, setRunning] = useState(false);
  const abortRef = useRef(false);

  const canRun =
    sessionState === SESSION_STATES.IDLE && sessionId && !running;

  const handleBeforeMount = (monaco) => {
    registerSparkProviders(monaco);
  };

  const handleEditorMount = (editor) => {
    editorRef.current = editor;
  };

  const handleChange = useCallback(
    (value) => {
      if (activeFile) {
        updateContent(activeFile.id, value || "");
      }
    },
    [activeFile, updateContent]
  );

  const handleFormat = () => {
    if (!editorRef.current) return;
    const value = editorRef.current.getValue();
    try {
      const formatted = format(value, { language: "spark", tabWidth: 2 });
      editorRef.current.setValue(formatted);
      updateContent(activeFile.id, formatted);
    } catch {
      // formatting failed, ignore
    }
  };

  const getSelectedOrAll = () => {
    if (!editorRef.current) return "";
    const selection = editorRef.current.getSelection();
    const model = editorRef.current.getModel();
    if (selection && !selection.isEmpty()) {
      return model.getValueInRange(selection);
    }
    return editorRef.current.getValue();
  };

  const handleRun = async () => {
    if (!canRun) return;
    const sql = getSelectedOrAll().trim();
    if (!sql) return;

    setRunning(true);
    abortRef.current = false;
    const startTime = performance.now();
    onResult({ status: "running", data: null, error: null, elapsed: null, startTime });

    try {
      const stmt = await livyApi.submitStatement(sessionId, sql);
      let stmtId = stmt.id;

      // Poll until complete
      while (true) {
        if (abortRef.current) {
          await livyApi.cancelStatement(sessionId, stmtId);
          onResult({ status: "cancelled", data: null, error: "Query cancelled", elapsed: performance.now() - startTime });
          break;
        }

        const result = await livyApi.getStatement(sessionId, stmtId);

        if (result.state === STATEMENT_STATES.AVAILABLE) {
          const output = result.output;
          if (output.status === "ok") {
            onResult({ status: "ok", data: output.data, error: null, elapsed: performance.now() - startTime });
          } else {
            onResult({
              status: "error",
              data: null,
              error: output.evalue || output.traceback?.join("\n") || "Unknown error",
              elapsed: performance.now() - startTime,
            });
          }
          break;
        }

        if (result.state === STATEMENT_STATES.ERROR || result.state === STATEMENT_STATES.CANCELLED) {
          onResult({
            status: "error",
            data: null,
            error: result.output?.evalue || `Statement ${result.state}`,
            elapsed: performance.now() - startTime,
          });
          break;
        }

        await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
      }
    } catch (err) {
      onResult({ status: "error", data: null, error: err.message, elapsed: performance.now() - startTime });
    } finally {
      setRunning(false);
    }
  };

  const handleCancel = () => {
    abortRef.current = true;
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)] shrink-0">
        {running ? (
          <button
            onClick={handleCancel}
            className="flex items-center gap-1.5 px-3 py-1 bg-[var(--color-error)]/20 text-[var(--color-error)] hover:bg-[var(--color-error)]/30 text-xs font-medium rounded-md transition-colors"
          >
            <Ban size={13} />
            Cancel
          </button>
        ) : (
          <button
            onClick={handleRun}
            disabled={!canRun}
            className="flex items-center gap-1.5 px-3 py-1 bg-[var(--color-success)]/20 text-[var(--color-success)] hover:bg-[var(--color-success)]/30 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium rounded-md transition-colors"
            title="Run SQL (selected text or all)"
          >
            <Play size={13} />
            Run
          </button>
        )}

        <button
          onClick={handleFormat}
          className="flex items-center gap-1.5 px-3 py-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] text-xs rounded-md transition-colors"
          title="Format SQL"
        >
          <AlignLeft size={13} />
          Format
        </button>

        {running && (
          <div className="flex items-center gap-1.5 ml-2 text-[var(--color-warning)]">
            <Loader2 size={13} className="animate-spin" />
            <span className="text-xs">Executing...</span>
          </div>
        )}

        <div className="ml-auto text-[10px] text-[var(--color-text-muted)]">
          {activeFile?.name}
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 min-h-0">
        <Editor
          key={activeFile?.id}
          height="100%"
          defaultLanguage="sql"
          defaultValue={activeFile?.content || ""}
          theme="vs-dark"
          beforeMount={handleBeforeMount}
          onChange={handleChange}
          onMount={handleEditorMount}
          options={{
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
            minimap: { enabled: true },
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            wordWrap: "on",
            automaticLayout: true,
            tabSize: 2,
            suggestOnTriggerCharacters: true,
            quickSuggestions: true,
            padding: { top: 8 },
            renderLineHighlight: "all",
            bracketPairColorization: { enabled: true },
            guides: { bracketPairs: true },
          }}
        />
      </div>
    </div>
  );
}
