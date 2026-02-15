import { useRef, useCallback, useState, forwardRef, useImperativeHandle, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { Play, AlignLeft, WrapText, Loader2, Ban } from "lucide-react";
import { format } from "sql-formatter";
import { useSqlFiles } from "../context/SqlFilesContext";
import { useLivy } from "../context/LivyContext";
import { SESSION_STATES, STATEMENT_STATES, POLL_INTERVAL_MS } from "../utils/constants";
import * as livyApi from "../services/livyApi";
import { SPARK_FUNCTIONS_DATA } from "../utils/spark-functions-data";
import { SPARK_SQL_KEYWORDS } from "../utils/spark-keywords-data";
import { SPARK_SQL_SNIPPETS } from "../utils/spark_sql_snippets";
import { useToast } from "./Toast";

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

            // 3. Generate Predefined Code Snippets (NEW!)
      const snippetSuggestions = SPARK_SQL_SNIPPETS.map((snippet) => ({
        label: snippet.label,
        kind: monaco.languages.CompletionItemKind.Snippet, // Marks it as a Snippet icon in the UI
        insertText: snippet.insertText,
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        detail: "Spark SQL Template",
        documentation: snippet.description,
        range,
      }));
      return { suggestions: [...keywordSuggestions, ...functionSuggestions, ...snippetSuggestions] };
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

function parseStatements(content) {
  if (!content) return [];
  const lines = content.split("\n");
  const statements = [];
  let currentSql = "";
  let startLine = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.replace(/--.*$/, "").trim();
    if (!currentSql && !trimmed) {
      startLine = i + 2;
      continue;
    }
    currentSql += (currentSql ? "\n" : "") + line;

    if (trimmed.endsWith(";")) {
      const sql = currentSql.replace(/--.*$/gm, "").trim().replace(/;\s*$/, "").trim();
      if (sql) {
        statements.push({ sql, startLine, endLine: i + 1 });
      }
      currentSql = "";
      startLine = i + 2;
    }
  }

  // Handle trailing statement without semicolon
  const trailing = currentSql.replace(/--.*$/gm, "").trim().replace(/;\s*$/, "").trim();
  if (trailing) {
    statements.push({ sql: trailing, startLine, endLine: lines.length });
  }

  return statements;
}

const ORIGINAL_TITLE = document.title;

function formatElapsedShort(ms) {
  if (ms == null) return "";
  if (ms < 1000) return `${Math.round(ms)}ms`;
  const secs = ms / 1000;
  if (secs < 60) return `${secs.toFixed(1)}s`;
  const mins = Math.floor(secs / 60);
  return `${mins}m ${(secs % 60).toFixed(0)}s`;
}

const SqlEditor = forwardRef(function SqlEditor(props, ref) {
  const { activeFile, updateContent, setResult } = useSqlFiles();
  const { sessionId, sessionState } = useLivy();
  const { addToast } = useToast();
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const [running, setRunning] = useState(false);
  const abortRef = useRef(false);
  const statementsRef = useRef([]);
  const decorationsRef = useRef([]);
  const runningDecorationsRef = useRef([]);
  const handleRunSqlRef = useRef(null);

  // Reset tab title when window regains focus
  useEffect(() => {
    const resetTitle = () => { document.title = ORIGINAL_TITLE; };
    window.addEventListener("focus", resetTitle);
    return () => window.removeEventListener("focus", resetTitle);
  }, []);

  const canRun =
    sessionState === SESSION_STATES.IDLE && sessionId !== null && !running;

  const handleBeforeMount = (monaco) => {
    registerSparkProviders(monaco);
  };

  const updateDecorations = useCallback((editor) => {
    if (!editor) return;
    const content = editor.getValue();
    const stmts = parseStatements(content);
    statementsRef.current = stmts;

    const newDecorations = stmts.map((s) => ({
      range: new monacoRef.current.Range(s.startLine, 1, s.startLine, 1),
      options: {
        isWholeLine: false,
        glyphMarginClassName: "run-glyph",
        glyphMarginHoverMessage: { value: "**Run this statement**" },
      },
    }));

    decorationsRef.current = editor.deltaDecorations(
      decorationsRef.current,
      newDecorations
    );
  }, []);

  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    updateDecorations(editor);

    // Monaco MouseTargetType.GLYPH_MARGIN = 2
    const GLYPH_MARGIN_TYPE = 2;

    editor.onMouseDown((e) => {
      if (e.target.type === GLYPH_MARGIN_TYPE) {
        const lineNumber = e.target.position?.lineNumber;
        if (!lineNumber) return;
        const stmt = statementsRef.current.find(
          (s) => s.startLine === lineNumber
        );
        if (stmt && stmt.sql && handleRunSqlRef.current) {
          handleRunSqlRef.current(stmt.sql, stmt.startLine, stmt.endLine);
        }
      }
    });
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

  const handleMinify = () => {
    if (!editorRef.current) return;
    const value = editorRef.current.getValue();
    const minified = value
      .split("\n")
      .map((line) => line.replace(/--.*$/, "").trim())
      .filter(Boolean)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    editorRef.current.setValue(minified);
    updateContent(activeFile.id, minified);
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

  const setRunningHighlight = useCallback((startLine, endLine) => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;

    const decos = [];
    for (let ln = startLine; ln <= endLine; ln++) {
      decos.push({
        range: new monaco.Range(ln, 1, ln, 1),
        options: {
          isWholeLine: true,
          className: "running-statement-line",
          glyphMarginClassName: ln === startLine ? "running-statement-glyph" : undefined,
        },
      });
    }
    runningDecorationsRef.current = editor.deltaDecorations(
      runningDecorationsRef.current,
      decos
    );
  }, []);

  const clearRunningHighlight = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;
    runningDecorationsRef.current = editor.deltaDecorations(
      runningDecorationsRef.current,
      []
    );
  }, []);

  const handleRunSql = async (sqlOverride, startLine, endLine) => {
    if (!canRun) return;
    const sql = (sqlOverride || getSelectedOrAll()).trim();
    if (!sql) return;

    setRunning(true);
    abortRef.current = false;
    const startTime = performance.now();
    let finalStatus = null;
    let finalError = null;
    setResult(activeFile.id, { status: "running", data: null, error: null, elapsed: null, startTime });

    if (startLine && endLine) {
      setRunningHighlight(startLine, endLine);
    }

    try {
      const stmt = await livyApi.submitStatement(sessionId, sql);
      let stmtId = stmt.id;

      // Poll until complete
      while (true) {
        if (abortRef.current) {
          await livyApi.cancelStatement(sessionId, stmtId);
          finalStatus = "cancelled";
          setResult(activeFile.id, { status: "cancelled", data: null, error: "Query cancelled", elapsed: performance.now() - startTime });
          break;
        }

        const result = await livyApi.getStatement(sessionId, stmtId);

        if (result.state === STATEMENT_STATES.AVAILABLE) {
          const output = result.output;
          if (output.status === "ok") {
            finalStatus = "ok";
            setResult(activeFile.id, { status: "ok", data: output.data, error: null, elapsed: performance.now() - startTime });
          } else {
            finalStatus = "error";
            finalError = output.evalue || output.traceback?.join("\n") || "Unknown error";
            setResult(activeFile.id, {
              status: "error",
              data: null,
              error: finalError,
              elapsed: performance.now() - startTime,
            });
          }
          break;
        }

        if (result.state === STATEMENT_STATES.ERROR || result.state === STATEMENT_STATES.CANCELLED) {
          finalStatus = "error";
          finalError = result.output?.evalue || `Statement ${result.state}`;
          setResult(activeFile.id, {
            status: "error",
            data: null,
            error: finalError,
            elapsed: performance.now() - startTime,
          });
          break;
        }

        await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
      }
    } catch (err) {
      finalStatus = "error";
      finalError = err.message;
      setResult(activeFile.id, { status: "error", data: null, error: err.message, elapsed: performance.now() - startTime });
    } finally {
      clearRunningHighlight();
      setRunning(false);
    }

    // Notify if tab is not focused
    if (!document.hasFocus()) {
      const elapsed = formatElapsedShort(performance.now() - startTime);
      let notifTitle = "";
      let notifBody = "";
      if (finalStatus === "ok") {
        addToast("ok", activeFile?.name || "Query", elapsed);
        document.title = `✅ Query done — ${ORIGINAL_TITLE}`;
        notifTitle = "✅ Query completed";
        notifBody = `${activeFile?.name || "Query"} finished in ${elapsed}`;
      } else if (finalStatus === "error") {
        addToast("error", finalError?.substring(0, 80) || "Unknown error", elapsed);
        document.title = `❌ Query failed — ${ORIGINAL_TITLE}`;
        notifTitle = "❌ Query failed";
        notifBody = finalError?.substring(0, 120) || "Unknown error";
      } else if (finalStatus === "cancelled") {
        addToast("cancelled", activeFile?.name || "Query", elapsed);
        document.title = `⚠️ Cancelled — ${ORIGINAL_TITLE}`;
        notifTitle = "⚠️ Query cancelled";
        notifBody = activeFile?.name || "Query";
      }

      // Browser notification
      if (notifTitle && "Notification" in window) {
        if (Notification.permission === "granted") {
          new Notification(notifTitle, { body: notifBody, icon: "/livy-ui/favicon.ico" });
        } else if (Notification.permission !== "denied") {
          Notification.requestPermission().then((perm) => {
            if (perm === "granted") {
              new Notification(notifTitle, { body: notifBody, icon: "/livy-ui/favicon.ico" });
            }
          });
        }
      }
    }
  };

  handleRunSqlRef.current = handleRunSql;

  const handleRun = () => handleRunSql();

  const handleCancel = () => {
    abortRef.current = true;
  };

  useImperativeHandle(ref, () => ({
    run: handleRun,
    format: handleFormat,
    minify: handleMinify,
  }));

  // Update glyph decorations when content changes
  useEffect(() => {
    if (editorRef.current && monacoRef.current) {
      updateDecorations(editorRef.current);
    }
  }, [activeFile?.content, updateDecorations]);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-(--color-bg-secondary) border-b border-(--color-border) shrink-0">
        {running ? (
          <button
            onClick={handleCancel}
            className="flex items-center gap-1.5 px-3 py-1 bg-(--color-error)/20 text-(--color-error) hover:bg-(--color-error)/30 text-xs font-medium rounded-md transition-colors"
          >
            <Ban size={13} />
            Cancel
          </button>
        ) : (
          <button
            onClick={handleRun}
            disabled={!canRun}
            className="flex items-center gap-1.5 px-3 py-1 bg-(--color-success)/20 text-(--color-success) hover:bg-(--color-success)/30 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium rounded-md transition-colors"
            title="Run SQL (selected text or all)"
          >
            <Play size={13} />
            Run
          </button>
        )}

        <button
          onClick={handleFormat}
          className="flex items-center gap-1.5 px-3 py-1 text-(--color-text-muted) hover:text-(--color-text-primary) hover:bg-(--color-bg-tertiary) text-xs rounded-md transition-colors"
          title="Format SQL (Ctrl+Shift+F)"
        >
          <AlignLeft size={13} />
          Format
        </button>

        <button
          onClick={handleMinify}
          className="flex items-center gap-1.5 px-3 py-1 text-(--color-text-muted) hover:text-(--color-text-primary) hover:bg-(--color-bg-tertiary) text-xs rounded-md transition-colors"
          title="Minify SQL to one line (Ctrl+Shift+M)"
        >
          <WrapText size={13} />
          Minify
        </button>

        {running && (
          <div className="flex items-center gap-1.5 ml-2 text-(--color-warning)">
            <Loader2 size={13} className="animate-spin" />
            <span className="text-xs">Executing...</span>
          </div>
        )}

        <div className="ml-auto text-[10px] text-(--color-text-muted)">
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
            glyphMargin: true,
            glyphMarginWidth: 16,
            lineNumbersMinChars: 2,
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
});

export default SqlEditor;
