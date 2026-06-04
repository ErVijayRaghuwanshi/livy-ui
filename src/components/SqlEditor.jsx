import { useRef, useCallback, useState, forwardRef, useImperativeHandle, useEffect } from "react";
import { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
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
import { v4 as uuidv4 } from "uuid";

// Configure Monaco to use local files instead of CDN
loader.config({ monaco });

// Helper to detect DDL operations that should trigger schema refresh
function isDDLOperation(sql) {
  const ddlKeywords = /\b(CREATE\s+(TABLE|VIEW|DATABASE|SCHEMA|INDEX|FUNCTION)|DROP\s+(TABLE|VIEW|DATABASE|SCHEMA|INDEX|FUNCTION)|ALTER\s+TABLE|TRUNCATE\s+TABLE)\b/i;
  return ddlKeywords.test(sql);
}

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

function registerSparkProviders(monaco, schemaDataRef) {
  // Filter to only named functions (skip operators like !, !=, etc.)
  const namedFunctions = SPARK_FUNCTIONS_DATA.filter((f) =>
    /^[a-z_]/i.test(f.name)
  );

  // Completion provider for functions, keywords, snippets, and schema
  const completionProvider = monaco.languages.registerCompletionItemProvider("sql", {
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

      const uniqueKeywords = Array.from(new Set(SPARK_SQL_KEYWORDS));
      const keywordSuggestions = uniqueKeywords.map((kw) => ({
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
      
      if (schemaDataRef && schemaDataRef.current) {
        const { databases, tables, columns } = schemaDataRef.current;

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
      
      // Extract unique words from the current document for autocomplete
      const documentText = model.getValue();
      const wordRegex = /\b[a-zA-Z_][a-zA-Z0-9_]*\b/g;
      const docWords = new Set();
      let wordMatch;
      while ((wordMatch = wordRegex.exec(documentText)) !== null) {
        const w = wordMatch[0];
        if (
          w.length > 2 && 
          !uniqueKeywords.includes(w.toUpperCase()) && 
          !namedFunctions.some((f) => f.name.toLowerCase() === w.toLowerCase())
        ) {
          docWords.add(w);
        }
      }

      const wordSuggestions = Array.from(docWords).map((w) => ({
        label: w,
        kind: monaco.languages.CompletionItemKind.Text,
        insertText: w,
        detail: "Word in Document",
        range,
      }));

      // Combine all suggestions
      const allSuggestions = [
        ...keywordSuggestions,
        ...functionSuggestions,
        ...snippetSuggestions,
        ...schemaSuggestions,
        ...wordSuggestions
      ];

      // Final strict deduplication by label and kind to guarantee zero duplicates
      const seen = new Set();
      const uniqueSuggestions = [];
      for (const item of allSuggestions) {
        const key = `${item.label}\n${item.kind}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueSuggestions.push(item);
        }
      }

      return { suggestions: uniqueSuggestions };
    },
  });

  // Hover provider for functions
  const hoverProvider = monaco.languages.registerHoverProvider("sql", {
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

  return [completionProvider, hoverProvider];
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

function splitSqlStatements(sql) {
  const statements = [];
  let current = "";
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inBacktick = false;
  let inSingleLineComment = false;
  let inMultiLineComment = false;

  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];
    const nextChar = sql[i + 1];

    if (inSingleLineComment) {
      if (char === "\n" || char === "\r") {
        inSingleLineComment = false;
      }
      current += char;
    } else if (inMultiLineComment) {
      if (char === "*" && nextChar === "/") {
        inMultiLineComment = false;
        current += "*/";
        i++;
      } else {
        current += char;
      }
    } else if (inSingleQuote) {
      if (char === "'" && sql[i - 1] !== "\\") {
        inSingleQuote = false;
      }
      current += char;
    } else if (inDoubleQuote) {
      if (char === '"' && sql[i - 1] !== "\\") {
        inDoubleQuote = false;
      }
      current += char;
    } else if (inBacktick) {
      if (char === "`" && sql[i - 1] !== "\\") {
        inBacktick = false;
      }
      current += char;
    } else if (char === "-" && nextChar === "-") {
      inSingleLineComment = true;
      current += "--";
      i++;
    } else if (char === "/" && nextChar === "*") {
      inMultiLineComment = true;
      current += "/*";
      i++;
    } else if (char === "'") {
      inSingleQuote = true;
      current += char;
    } else if (char === '"') {
      inDoubleQuote = true;
      current += char;
    } else if (char === "`") {
      inBacktick = true;
      current += char;
    } else if (char === ";") {
      statements.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  if (current) {
    statements.push(current);
  }
  return statements;
}

function stripComments(sql) {
  let result = sql.replace(/\/\*[\s\S]*?\*\//g, "");
  result = result.split("\n").map(line => line.replace(/--.*$/, "")).join("\n");
  return result;
}

const SqlEditor = forwardRef(function SqlEditor({
  onCursorPositionChange,
  theme,
  onFocusSchemaSearch,
  onFocusFileSearch,
  onToggleSidebar,
  onToggleResultPanel,
  onNewTab,
  onCloseTab,
  onToggleQueryHistory,
  onToggleShortcuts,
  onToggleConnectionModal,
  onPrevTab,
  onNextTab,
  onRestoreTab,
  onToggleCommandPalette,
}, ref) {
  const { activeFile, updateContent, setResult, saveFile, toggleAutoSave, activeResultId, pendingLineReveal, clearPendingLineReveal } = useSqlFiles();
  const activeFileRef = useRef(activeFile);
  const toggleAutoSaveRef = useRef(toggleAutoSave);

  useEffect(() => {
    activeFileRef.current = activeFile;
  }, [activeFile]);

  useEffect(() => {
    toggleAutoSaveRef.current = toggleAutoSave;
  }, [toggleAutoSave]);

  const { sessionId, sessionState } = useLivy();
  const schemaContext = useSchema();
  const schemaDataRef = useRef({ databases: [], tables: {}, columns: {} });
  const { addToast } = useToast();
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const viewStatesRef = useRef({});
  const [monacoInstance, setMonacoInstance] = useState(null);
  const [running, setRunning] = useState(false);
  const [wordWrap, setWordWrap] = useState(() => localStorage.getItem('livy-ui-word-wrap') !== 'off');
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

  // Persist word wrap preference
  useEffect(() => {
    localStorage.setItem('livy-ui-word-wrap', wordWrap ? 'on' : 'off');
  }, [wordWrap]);

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

  // Manage Monaco completion and hover providers in a React-friendly lifecycle
  useEffect(() => {
    if (!monacoInstance) return;

    const providers = registerSparkProviders(monacoInstance, schemaDataRef);

    return () => {
      providers.forEach((p) => p.dispose());
    };
  }, [monacoInstance]);

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
    setMonacoInstance(monaco);

    updateDecorations(editor);

    // Restore view state if it exists
    if (activeFile?.id) {
      const savedState = viewStatesRef.current[activeFile.id];
      if (savedState) {
        editor.restoreViewState(savedState);
      }
    }

    // Check for pending line reveal immediately on mount
    if (pendingLineReveal && pendingLineReveal.fileId === activeFile?.id) {
      const { lineNumber } = pendingLineReveal;
      setTimeout(() => {
        editor.revealLineInCenter(lineNumber);
        editor.setPosition({ lineNumber, column: 1 });
        editor.focus();
        clearPendingLineReveal();
      }, 50);
    }

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
      id: "save-sql",
      label: "Save SQL",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
      run: () => {
        if (activeFileRef.current) {
          saveFile(activeFileRef.current.id);
        }
      },
    });

    editor.addAction({
      id: "run-sql-monaco",
      label: "Run SQL",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
      run: () => {
        handleRunSqlRef.current?.();
      },
    });

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

    // Word wrap toggle action (changed to Alt+Z / ⌥+Z for VS Code consistency)
    editor.addAction({
      id: "toggle-word-wrap",
      label: "Toggle Word Wrap",
      keybindings: [monaco.KeyMod.Alt | monaco.KeyCode.KeyZ],
      contextMenuGroupId: "1_sql",
      contextMenuOrder: 3,
      run: () => {
        setWordWrap(prev => !prev);
      },
    });

    // Auto-Save toggle action
    editor.addAction({
      id: "toggle-auto-save",
      label: "Toggle Auto-Save",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyA],
      contextMenuGroupId: "1_sql",
      contextMenuOrder: 4,
      run: () => {
        toggleAutoSaveRef.current?.();
      },
    });

    // Override Monaco's Cmd+Shift+K to focus schema search
    editor.addAction({
      id: "focus-schema-search",
      label: "Focus Schema Search",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyK],
      run: () => {
        onFocusSchemaSearch?.();
      },
    });

    // Focus File Explorer Search
    editor.addAction({
      id: "focus-file-search-action",
      label: "Focus File Explorer",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyE],
      run: () => {
        onFocusFileSearch?.();
      },
    });

    // Toggle Command Palette
    editor.addAction({
      id: "toggle-command-palette-action",
      label: "Toggle Command Palette",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyP],
      run: () => {
        onToggleCommandPalette?.();
      },
    });

    // Toggle Sidebar
    editor.addAction({
      id: "toggle-sidebar-action",
      label: "Toggle Sidebar",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyB],
      run: () => {
        onToggleSidebar?.();
      },
    });

    // Toggle Result Panel
    editor.addAction({
      id: "toggle-result-panel-action",
      label: "Toggle Result Panel",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Backquote],
      run: () => {
        onToggleResultPanel?.();
      },
    });

    // New Tab (Ctrl+Alt+N / Cmd+Option+N)
    editor.addAction({
      id: "new-tab-action",
      label: "New Tab",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt | monaco.KeyCode.KeyN],
      run: () => {
        onNewTab?.();
      },
    });

    // Close Tab (Ctrl+Alt+W / Cmd+Option+W)
    editor.addAction({
      id: "close-tab-action",
      label: "Close Tab",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt | monaco.KeyCode.KeyW],
      run: () => {
        onCloseTab?.();
      },
    });

    // Restore Last Closed Tab (Ctrl+Shift+T / Cmd+Shift+T or Ctrl+Alt+T / Cmd+Option+T)
    editor.addAction({
      id: "restore-last-closed-tab-action",
      label: "Restore Last Closed Tab",
      keybindings: [
        monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyT,
        monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt | monaco.KeyCode.KeyT
      ],
      run: () => {
        onRestoreTab?.();
      },
    });

    // Previous Tab
    editor.addAction({
      id: "prev-tab-action-arrow",
      label: "Previous Tab (Arrow)",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt | monaco.KeyCode.LeftArrow],
      run: () => {
        onPrevTab?.();
      },
    });
    editor.addAction({
      id: "prev-tab-action-pgup",
      label: "Previous Tab",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.PageUp],
      run: () => {
        onPrevTab?.();
      },
    });

    // Next Tab
    editor.addAction({
      id: "next-tab-action-arrow",
      label: "Next Tab (Arrow)",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt | monaco.KeyCode.RightArrow],
      run: () => {
        onNextTab?.();
      },
    });
    editor.addAction({
      id: "next-tab-action-pgdn",
      label: "Next Tab",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.PageDown],
      run: () => {
        onNextTab?.();
      },
    });

    // Toggle Query History
    editor.addAction({
      id: "toggle-query-history-action",
      label: "Toggle Query History",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyH],
      run: () => {
        onToggleQueryHistory?.();
      },
    });

    // Toggle Keyboard Shortcuts
    editor.addAction({
      id: "toggle-shortcuts-action",
      label: "Toggle Keyboard Shortcuts",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Slash],
      run: () => {
        onToggleShortcuts?.();
      },
    });

    // Manage Livy Hosts Modal
    editor.addAction({
      id: "toggle-connection-modal-action",
      label: "Manage Livy Hosts",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Period],
      run: () => {
        onToggleConnectionModal?.();
      },
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
      const parts = splitSqlStatements(text);
      const formattedParts = parts.map((part) => {
        const trimmed = part.trim();
        if (!trimmed) return "";
        const withoutComments = stripComments(trimmed).trim();
        if (!withoutComments) return trimmed;
        try {
          return format(trimmed, { language: "spark", tabWidth: 2 });
        } catch {
          return trimmed;
        }
      });
      const formatted = formattedParts.filter(p => p !== "").join(";\n\n") + (text.trim().endsWith(";") ? ";" : "");
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
    try {
      const parts = splitSqlStatements(text);
      const minifiedParts = parts
        .map((part) => {
          const trimmed = part.trim();
          if (!trimmed) return "";
          const withoutComments = stripComments(trimmed).trim();
          if (!withoutComments) return "";
          return withoutComments
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean)
            .join(" ")
            .replace(/\s+/g, " ")
            .trim();
        })
        .filter(Boolean);
      const minified = minifiedParts.join(";\n") + (minifiedParts.length > 0 ? ";" : "");
      editor.executeEdits("minify-sql", [{ range, text: minified }]);
      editor.pushUndoStop();
    } catch { /* ignore */ }
  };

  const handleFormat = () => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;
    const value = editor.getValue();
    try {
      const parts = splitSqlStatements(value);
      const formattedParts = parts.map((part) => {
        const trimmed = part.trim();
        if (!trimmed) return "";
        const withoutComments = stripComments(trimmed).trim();
        if (!withoutComments) return trimmed;
        try {
          return format(trimmed, { language: "spark", tabWidth: 2 });
        } catch {
          return trimmed;
        }
      });
      const formatted = formattedParts.filter(p => p !== "").join(";\n\n") + (value.trim().endsWith(";") ? ";" : "");
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
    try {
      const parts = splitSqlStatements(value);
      const minifiedParts = parts
        .map((part) => {
          const trimmed = part.trim();
          if (!trimmed) return "";
          const withoutComments = stripComments(trimmed).trim();
          if (!withoutComments) return "";
          return withoutComments
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean)
            .join(" ")
            .replace(/\s+/g, " ")
            .trim();
        })
        .filter(Boolean);
      const minified = minifiedParts.join(";\n") + (minifiedParts.length > 0 ? ";" : "");
      const fullRange = editor.getModel().getFullModelRange();
      editor.executeEdits("minify-sql", [{ range: fullRange, text: minified }]);
      editor.pushUndoStop();
    } catch {
      // minify failed, ignore
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
    const executionId = activeResultId || uuidv4();
    setResult(activeFile.id, { status: "running", data: null, error: null, elapsed: null, startTime, sql }, executionId);

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
          setResult(activeFile.id, { status: "cancelled", data: null, error: "Query cancelled", elapsed: performance.now() - startTime, sql }, executionId);
          break;
        }

        const result = await livyApi.getStatement(sessionId, stmtId);

        if (result.state === STATEMENT_STATES.AVAILABLE) {
          const output = result.output;
          if (output.status === "ok") {
            finalStatus = "ok";
            setResult(activeFile.id, { status: "ok", data: output.data, error: null, elapsed: performance.now() - startTime, sql }, executionId);
            
            // Trigger schema refresh if this was a DDL operation
            if (isDDLOperation(sql)) {
              schemaContext.refreshSchema();
            }
          } else {
            finalStatus = "error";
            finalError = output.evalue || output.traceback?.join("\n") || "Unknown error";
            setResult(activeFile.id, {
              status: "error",
              data: null,
              error: finalError,
              elapsed: performance.now() - startTime,
              sql,
            }, executionId);
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
            sql,
          }, executionId);
          break;
        }

        await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
      }
    } catch (err) {
      finalStatus = "error";
      finalError = err.message;
      setResult(activeFile.id, { status: "error", data: null, error: err.message, elapsed: performance.now() - startTime, sql }, executionId);
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
    cancel: handleCancel,
    runSql: (sql) => handleRunSql(sql),
    format: handleFormat,
    isRunning: () => running,
    canRun: () => canRun,
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

  // Handle pending line reveals when the editor is already active
  useEffect(() => {
    if (editorRef.current && pendingLineReveal && pendingLineReveal.fileId === activeFile?.id) {
      const editor = editorRef.current;
      const { lineNumber } = pendingLineReveal;
      
      const timer = setTimeout(() => {
        editor.revealLineInCenter(lineNumber);
        editor.setPosition({ lineNumber, column: 1 });
        editor.focus();
        clearPendingLineReveal();
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [pendingLineReveal, activeFile?.id, clearPendingLineReveal]);

  // Save editor view state before the active file changes/unmounts
  useEffect(() => {
    const fileId = activeFile?.id;
    return () => {
      if (editorRef.current && fileId) {
        try {
          const state = editorRef.current.saveViewState();
          viewStatesRef.current[fileId] = state;
        } catch (e) {
          console.error("Failed to save Monaco view state:", e);
        }
      }
    };
  }, [activeFile?.id]);

  return (
    <div className="flex flex-col flex-1 min-h-0">
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
              className={`flex items-center gap-2 w-full px-3 py-1.5 text-xs transition-colors ${
                canRun
                  ? 'text-(--color-text-secondary) hover:bg-(--color-bg-tertiary) hover:text-(--color-success) cursor-pointer'
                  : 'text-(--color-text-muted) cursor-not-allowed opacity-50'
              }`}
              onClick={() => {
                if (!canRun) return;
                const { stmt } = glyphPopup;
                setGlyphPopup(null);
                handleRunSqlRef.current?.(stmt.sql, stmt.startLine, stmt.endLine);
              }}
              disabled={!canRun}
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
            wordWrap: wordWrap ? "on" : "off",
            automaticLayout: true,
            tabSize: 2,
            suggestOnTriggerCharacters: true,
            quickSuggestions: true,
            wordBasedSuggestions: "off",
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
