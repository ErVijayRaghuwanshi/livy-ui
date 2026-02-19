import { useRef, useCallback, useState, forwardRef, useImperativeHandle, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { Play, Loader2, Ban, AlignLeft, WrapText } from "lucide-react";
import { format } from "sql-formatter";
import { useSqlFiles } from "../context/SqlFilesContext";
import { useLivy } from "../context/LivyContext";
import { useSchema } from "../context/SchemaContext";
import { SESSION_STATES, STATEMENT_STATES, POLL_INTERVAL_MS } from "../utils/constants";
import * as livyApi from "../services/livyApi";
import { SPARK_FUNCTIONS_DATA } from "../utils/spark-functions-data";
import { SPARK_SQL_KEYWORDS } from "../utils/spark-keywords-data";
import { SPARK_SQL_SNIPPETS } from "../utils/spark_sql_snippets";
import { useToast } from "./Toast";
import { addHistoryEntry } from "./QueryHistory";

let providersRegistered = false;

// Helper to detect SQL context for intelligent suggestions
function getSqlContext(model, position) {
  const lineContent = model.getLineContent(position.lineNumber);
  const textBeforeCursor = lineContent.substring(0, position.column - 1).toUpperCase();
  const allTextBefore = model.getValueInRange({
    startLineNumber: 1,
    startColumn: 1,
    endLineNumber: position.lineNumber,
    endColumn: position.column,
  }).toUpperCase();

  // Check if we're after SELECT, WHERE, GROUP BY, ORDER BY, HAVING, etc.
  const columnContextKeywords = /\b(SELECT|WHERE|GROUP\s+BY|ORDER\s+BY|HAVING|ON|AND|OR|SET|VALUES)\s*$/;
  const tableContextKeywords = /\b(FROM|JOIN|LEFT\s+JOIN|RIGHT\s+JOIN|INNER\s+JOIN|OUTER\s+JOIN|FULL\s+JOIN|INTO|UPDATE|TABLE)\s*$/;
  
  if (tableContextKeywords.test(textBeforeCursor)) {
    return 'table';
  }
  if (columnContextKeywords.test(textBeforeCursor)) {
    return 'column';
  }
  
  return 'any';
}

function registerSparkProviders(monaco, schemaData) {
  if (providersRegistered) return;
  providersRegistered = true;

  // Filter to only named functions (skip operators like !, !=, etc.)
  const namedFunctions = SPARK_FUNCTIONS_DATA.filter((f) =>
    /^[a-z_]/i.test(f.name)
  );

  // Completion provider for functions, keywords, snippets, and schema
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

      const context = getSqlContext(model, position);

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

      const snippetSuggestions = SPARK_SQL_SNIPPETS.map((snippet) => ({
        label: snippet.label,
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertText: snippet.insertText,
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        detail: "Spark SQL Template",
        documentation: snippet.description,
        range,
      }));

      // Schema-based suggestions
      const schemaSuggestions = [];
      
      if (schemaData && schemaData.current) {
        const { databases, tables, columns } = schemaData.current;

        // Database suggestions
        if (databases && databases.length > 0) {
          databases.forEach((db) => {
            schemaSuggestions.push({
              label: db,
              kind: monaco.languages.CompletionItemKind.Module,
              insertText: `\`${db}\``,
              detail: "Database",
              documentation: `Database: ${db}`,
              range,
              sortText: "0_" + db,
            });
          });
        }

        // Table suggestions (show in table context or any context)
        if (tables && Object.keys(tables).length > 0 && (context === 'table' || context === 'any')) {
          Object.entries(tables).forEach(([db, tableList]) => {
            tableList.forEach((tbl) => {
              schemaSuggestions.push({
                label: `${db}.${tbl}`,
                kind: monaco.languages.CompletionItemKind.Class,
                insertText: `\`${db}\`.\`${tbl}\``,
                detail: `Table in ${db}`,
                documentation: `Table: ${tbl}\nDatabase: ${db}`,
                range,
                sortText: "1_" + tbl,
              });
            });
          });
        }

        // Column suggestions (show in column context)
        if (columns && Object.keys(columns).length > 0 && (context === 'column' || context === 'any')) {
          Object.entries(columns).forEach(([key, columnList]) => {
            const [db, tbl] = key.split('.');
            columnList.forEach((col) => {
              schemaSuggestions.push({
                label: col.name,
                kind: monaco.languages.CompletionItemKind.Field,
                insertText: col.name,
                detail: `${col.type} (${db}.${tbl})`,
                documentation: `Column: ${col.name}\nType: ${col.type}\nTable: ${db}.${tbl}`,
                range,
                sortText: "2_" + col.name,
              });
            });
          });
        }
      }

      return { suggestions: [...keywordSuggestions, ...functionSuggestions, ...snippetSuggestions, ...schemaSuggestions] };
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

const SqlEditor = forwardRef(function SqlEditor({ onCursorPositionChange, theme }, ref) {
  const { activeFile, updateContent, setResult } = useSqlFiles();
  const { sessionId, sessionState } = useLivy();
  const schemaContext = useSchema();
  const schemaDataRef = useRef({ databases: [], tables: {}, columns: {} });
  const { addToast } = useToast();
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const [running, setRunning] = useState(false);
  const [glyphPopup, setGlyphPopup] = useState(null);
  const glyphPopupRef = useRef(null);
  const abortRef = useRef(false);
  const statementsRef = useRef([]);
  const decorationsRef = useRef([]);
  const runningDecorationsRef = useRef([]);
  const handleRunSqlRef = useRef(null);
  const handleFormatRef = useRef(null);
  const handleMinifyRef = useRef(null);

  // Reset tab title when window regains focus
  useEffect(() => {
    const resetTitle = () => { document.title = ORIGINAL_TITLE; };
    window.addEventListener("focus", resetTitle);
    return () => window.removeEventListener("focus", resetTitle);
  }, []);

  const canRun =
    sessionState === SESSION_STATES.IDLE && sessionId !== null && !running;

  // Keep schema data ref updated
  useEffect(() => {
    if (schemaContext) {
      schemaDataRef.current = {
        databases: schemaContext.databases,
        tables: schemaContext.tables,
        columns: schemaContext.columns,
      };
    }
  }, [schemaContext]);

  const handleBeforeMount = (monaco) => {
    registerSparkProviders(monaco, schemaDataRef);
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

    // Track cursor position
    editor.onDidChangeCursorPosition((e) => {
      if (onCursorPositionChange) {
        onCursorPositionChange({ lineNumber: e.position.lineNumber, column: e.position.column });
      }
    });

    // Monaco MouseTargetType.GLYPH_MARGIN = 2
    const GLYPH_MARGIN_TYPE = 2;

    // Context menu actions
    editor.addAction({
      id: "format-sql",
      label: "Format SQL",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF],
      contextMenuGroupId: "1_sql",
      contextMenuOrder: 1,
      run: () => handleFormatRef.current?.(),
    });
    editor.addAction({
      id: "minify-sql",
      label: "Minify SQL",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyM],
      contextMenuGroupId: "1_sql",
      contextMenuOrder: 2,
      run: () => handleMinifyRef.current?.(),
    });

    editor.onMouseDown((e) => {
      if (e.target.type === GLYPH_MARGIN_TYPE) {
        const lineNumber = e.target.position?.lineNumber;
        if (!lineNumber) return;
        const stmt = statementsRef.current.find(
          (s) => s.startLine === lineNumber
        );
        if (stmt && stmt.sql) {
          e.event.preventDefault();
          e.event.stopPropagation();
          const editorDom = editor.getDomNode();
          const rect = editorDom.getBoundingClientRect();
          const top = editor.getTopForLineNumber(lineNumber) - editor.getScrollTop() + rect.top;
          const left = rect.left;
          setGlyphPopup({ stmt, top, left });
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

  const formatRange = (startLine, endLine) => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;
    const model = editor.getModel();
    const range = new monaco.Range(startLine, 1, endLine, model.getLineMaxColumn(endLine));
    const text = model.getValueInRange(range);
    try {
      const formatted = format(text, { language: "spark", tabWidth: 2 });
      editor.executeEdits("format-sql", [{ range, text: formatted }]);
      editor.pushUndoStop();
    } catch { /* ignore */ }
  };

  const minifyRange = (startLine, endLine) => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;
    const model = editor.getModel();
    const range = new monaco.Range(startLine, 1, endLine, model.getLineMaxColumn(endLine));
    const text = model.getValueInRange(range);
    const minified = text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    editor.executeEdits("minify-sql", [{ range, text: minified }]);
    editor.pushUndoStop();
  };

  const handleFormat = () => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;
    const value = editor.getValue();
    try {
      const formatted = format(value, { language: "spark", tabWidth: 2 });
      const fullRange = editor.getModel().getFullModelRange();
      editor.executeEdits("format-sql", [{ range: fullRange, text: formatted }]);
      editor.pushUndoStop();
    } catch {
      // formatting failed, ignore
    }
  };

  const handleMinify = () => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;
    const value = editor.getValue();
    const minified = value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    const fullRange = editor.getModel().getFullModelRange();
    editor.executeEdits("minify-sql", [{ range: fullRange, text: minified }]);
    editor.pushUndoStop();
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
      // Record in query history
      if (finalStatus) {
        addHistoryEntry({
          sql: sql.length > 500 ? sql.substring(0, 500) + "..." : sql,
          status: finalStatus,
          elapsed: performance.now() - startTime,
          fileName: activeFile?.name,
        });
      }
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
  handleFormatRef.current = handleFormat;
  handleMinifyRef.current = handleMinify;

  const handleRun = () => handleRunSql();

  const handleCancel = () => {
    abortRef.current = true;
  };

  useImperativeHandle(ref, () => ({
    run: handleRun,
    runSql: (sql) => handleRunSql(sql),
    format: handleFormat,
    minify: handleMinify,
    insertText: (text) => {
      const editor = editorRef.current;
      if (!editor) return;
      const position = editor.getPosition();
      editor.executeEdits("insert-schema", [{
        range: new monacoRef.current.Range(position.lineNumber, position.column, position.lineNumber, position.column),
        text,
      }]);
      editor.focus();
    },
  }));

  // Close glyph popup on outside click or Escape
  useEffect(() => {
    if (!glyphPopup) return;
    let rafId;
    const handleClick = (e) => {
      if (glyphPopupRef.current && !glyphPopupRef.current.contains(e.target)) {
        setGlyphPopup(null);
      }
    };
    const handleKey = (e) => {
      if (e.key === "Escape") setGlyphPopup(null);
    };
    // Delay attaching so the opening click doesn't immediately close the popup
    rafId = requestAnimationFrame(() => {
      document.addEventListener("mousedown", handleClick);
      document.addEventListener("keydown", handleKey);
    });
    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [glyphPopup]);

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
      <div className="flex-1 min-h-0 relative">
        {/* Glyph popup menu */}
        {glyphPopup && (
          <div
            ref={glyphPopupRef}
            onMouseDown={(e) => e.stopPropagation()}
            className="fixed z-50 bg-(--color-bg-secondary) border border-(--color-border) rounded-lg shadow-2xl py-1 min-w-35 animate-in fade-in zoom-in-95 duration-100"
            style={{ top: glyphPopup.top, left: glyphPopup.left + 20 }}
          >
            <button
              className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-(--color-text-secondary) hover:bg-(--color-bg-tertiary) hover:text-(--color-success) transition-colors"
              onClick={() => {
                const { stmt } = glyphPopup;
                setGlyphPopup(null);
                handleRunSqlRef.current?.(stmt.sql, stmt.startLine, stmt.endLine);
              }}
            >
              <Play size={12} /> Run
            </button>
            <button
              className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-(--color-text-secondary) hover:bg-(--color-bg-tertiary) hover:text-(--color-accent) transition-colors"
              onClick={() => {
                const { stmt } = glyphPopup;
                setGlyphPopup(null);
                formatRange(stmt.startLine, stmt.endLine);
              }}
            >
              <AlignLeft size={12} /> Format
            </button>
            <button
              className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-(--color-text-secondary) hover:bg-(--color-bg-tertiary) hover:text-(--color-accent) transition-colors"
              onClick={() => {
                const { stmt } = glyphPopup;
                setGlyphPopup(null);
                minifyRange(stmt.startLine, stmt.endLine);
              }}
            >
              <WrapText size={12} /> Minify
            </button>
          </div>
        )}
        <Editor
          key={activeFile?.id}
          height="100%"
          defaultLanguage="sql"
          defaultValue={activeFile?.content || ""}
          theme={theme === "light" ? "light" : "vs-dark"}
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
