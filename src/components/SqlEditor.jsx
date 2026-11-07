import { useRef, useCallback, useState, forwardRef, useImperativeHandle, useEffect } from "react";
import { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import Editor from "@monaco-editor/react";
import { Play, Loader2, Ban, AlignLeft, WrapText } from "lucide-react";
import MarkdownPreview from "./MarkdownPreview";
import { format } from "sql-formatter";
import { useSqlFiles } from "../context/SqlFilesContext";
import { useLivy } from "../context/LivyContext";
import { useSchema } from "../context/SchemaContext";
import { SESSION_STATES, STATEMENT_STATES, POLL_INTERVAL_MS } from "../utils/constants";
import * as livyApi from "../services/livyApi";
import { executeDorisQuery } from "../services/dorisApi";
import { SPARK_FUNCTIONS_DATA } from "../utils/spark-functions-data";
import { SPARK_SQL_KEYWORDS } from "../utils/spark-keywords-data";
import { SPARK_SQL_SNIPPETS } from "../utils/spark_sql_snippets";
import { DORIS_DATA_TYPES } from "../utils/doris-data-types-data";
import { DORIS_SQL_KEYWORDS } from "../utils/doris-keywords-data";
import { DORIS_FUNCTIONS_DATA } from "../utils/doris-functions-data";
import { DORIS_SQL_SNIPPETS } from "../utils/doris-snippets-data";
import { useToast } from "./Toast";
import { addHistoryEntry } from "./QueryHistory";
import { useSettings } from "../context/SettingsContext";
import { v4 as uuidv4 } from "uuid";
import { validateSql } from "../services/sqlValidator";
import expand, { extract } from "emmet";

// Configure Monaco to use local files instead of CDN
loader.config({ monaco });

import { language as sqlLanguage } from "monaco-editor/esm/vs/basic-languages/sql/sql.js";

// Extend SQL tokenizer to support Spark & Doris SQL backticked identifiers
if (sqlLanguage && sqlLanguage.tokenizer) {
  if (!sqlLanguage.tokenizer.quotedIdentifier) {
    if (Array.isArray(sqlLanguage.tokenizer.complexIdentifiers)) {
      sqlLanguage.tokenizer.complexIdentifiers.unshift([
        /`/,
        { token: "identifier.quote", next: "@quotedIdentifier" }
      ]);
    }
    sqlLanguage.tokenizer.quotedIdentifier = [
      [/[^`]+/, "identifier.quote"],
      [/``/, "identifier.quote"],
      [/`/, { token: "identifier.quote", next: "@pop" }]
    ];
  }
}

// Extend SQL tokenizer for Doris-specific keywords and AI functions
if (sqlLanguage && Array.isArray(sqlLanguage.keywords)) {
  const existingKw = new Set(sqlLanguage.keywords);
  const extraDorisKeywords = [
    "DUPLICATE", "AGGREGATE", "DISTRIBUTED", "BUCKETS", "PROPERTIES",
    "LARGEINT", "DATEV2", "DATETIMEV2", "QUANTILE_STATE", "AGG_STATE",
    "BITMAP", "HLL", "RESOURCE", "WORKLOAD", "ROUTINE", "INVERTED",
    "NGRAM_BF", "COMPACT", "SYNC", "REPLICATION_NUM", "STORAGE_POLICY"
  ];
  extraDorisKeywords.forEach((kw) => {
    if (!existingKw.has(kw)) sqlLanguage.keywords.push(kw);
  });
}
if (sqlLanguage && Array.isArray(sqlLanguage.builtinFunctions)) {
  const existingFn = new Set(sqlLanguage.builtinFunctions);
  const extraDorisFunctions = [
    "AI_TRANSLATE", "AI_GENERATE", "AI_SUMMARIZE", "AI_EXTRACT", "AI_FILTER",
    "AI_SENTIMENT", "AI_CLASSIFY", "AI_FIXGRAMMAR", "AI_MASK", "AI_SIMILARITY", "AI_AGG",
    "TO_BITMAP", "BITMAP_UNION", "BITMAP_COUNT", "BITMAP_AND", "BITMAP_OR", "BITMAP_XOR",
    "BITMAP_NOT", "BITMAP_CONTAINS", "BITMAP_TO_ARRAY", "BITMAP_FROM_STRING", "BITMAP_EMPTY",
    "HLL_UNION_AGG", "HLL_CARDINALITY", "HLL_EMPTY", "HLL_HASH",
    "JSONB_EXTRACT", "JSONB_EXTRACT_INT", "JSONB_EXTRACT_STRING", "JSONB_PARSE", "JSONB_EXISTS",
    "QUANTILE_PERCENT", "QUANTILE_UNION", "PERCENTILE_APPROX",
    "TO_IPV4", "TO_IPV6", "IPV4_NUM_TO_STRING", "IPV4_STRING_TO_NUM"
  ];
  extraDorisFunctions.forEach((fn) => {
    if (!existingFn.has(fn)) sqlLanguage.builtinFunctions.push(fn);
  });
}

export function getLanguageForFile(fileName = "") {
  const lower = (fileName || "").toLowerCase();
  if (lower.endsWith(".sql") || lower.endsWith(".sparksql") || lower.endsWith(".hql") || lower.endsWith(".dorisql")) return "sql";
  if (lower.endsWith(".md") || lower.endsWith(".markdown")) return "markdown";
  if (lower.endsWith(".json")) return "json";
  if (lower.endsWith(".py")) return "python";
  if (lower.endsWith(".sh") || lower.endsWith(".bash")) return "shell";
  if (!lower || lower.startsWith("untitled") || !lower.includes(".")) return "sql";
  return "plaintext";
}

export function isSqlFileName(fileName = "") {
  return getLanguageForFile(fileName) === "sql";
}

export const VSCODE_DARK_CUSTOM = "vscode-dark-custom";

monaco.editor.defineTheme(VSCODE_DARK_CUSTOM, {
  base: "vs-dark",
  inherit: true,
  rules: [
    // SQL Keywords (SELECT, FROM, WHERE, AND, AS, JOIN, ON, IS, NOT, NULL, IN, WITH, DATE, etc.) -> Coral Red / Salmon
    { token: "keyword", foreground: "ff7b72", fontStyle: "normal" },
    { token: "keyword.sql", foreground: "ff7b72", fontStyle: "normal" },
    { token: "operator", foreground: "ff7b72" },
    { token: "operator.sql", foreground: "ff7b72" },

    // Builtin functions (concat, date, sum, count, etc.) -> Warm Golden Yellow
    { token: "predefined", foreground: "dcdcaa" },
    { token: "predefined.sql", foreground: "dcdcaa" },

    // Strings ('98', '2026-01-01', 'RULE') -> Light Ice Blue
    { token: "string", foreground: "a5d6ff" },
    { token: "string.sql", foreground: "a5d6ff" },
    { token: "string.quote", foreground: "a5d6ff" },

    // Numbers (98, 99, 7) -> Sky Blue
    { token: "number", foreground: "79c0ff" },
    { token: "number.sql", foreground: "79c0ff" },

    // Identifiers / Columns / Field references (MOBILENUMBER, VPN_TOR, etc.) -> Sky Blue
    { token: "identifier", foreground: "79c0ff" },
    { token: "identifier.sql", foreground: "79c0ff" },

    // Backticked complex identifiers (`hdfs://...`) -> Light Ice Blue
    { token: "identifier.quote", foreground: "a5d6ff" },

    // Comments -> Muted Gray
    { token: "comment", foreground: "8b949e", fontStyle: "italic" },
    { token: "comment.sql", foreground: "8b949e", fontStyle: "italic" },

    // Delimiters (brackets, commas, semicolons, dots) -> Light Gray
    { token: "delimiter", foreground: "bcbebf" },
    { token: "delimiter.sql", foreground: "bcbebf" },
    { token: "delimiter.parenthesis", foreground: "bcbebf" },
    { token: "delimiter.parenthesis.sql", foreground: "bcbebf" },
  ],
  colors: {
    "editor.background": "#121314",
    "editor.foreground": "#bcbebf",
    "editorCursor.foreground": "#ffffff",
    "editorLineNumber.foreground": "#707070",
    "editorLineNumber.activeForeground": "#ffffff",
    "editor.lineHighlightBackground": "#191a1b80",
    "editor.lineHighlightBorder": "#28292a",
    "editor.selectionBackground": "#264f7880",
    "editor.inactiveSelectionBackground": "#3a3d4140",
    "editor.selectionHighlightBackground": "#add6ff1a",
    "editorGutter.background": "#121314",
    "minimap.background": "#121314",
    "minimapSlider.background": "#ffffff10",
    "minimapSlider.hoverBackground": "#ffffff1a",
    "minimapSlider.activeBackground": "#ffffff25",
    "editorWidget.background": "#18191a",
    "editorWidget.border": "#2c2d2e",
    "editorSuggestWidget.background": "#18191a",
    "editorSuggestWidget.border": "#2c2d2e",
    "editorSuggestWidget.foreground": "#bcbebf",
    "editorSuggestWidget.selectedBackground": "#2c2d2e",
    "editorSuggestWidget.highlightForeground": "#79c0ff",
    "editorHoverWidget.background": "#18191a",
    "editorHoverWidget.border": "#2c2d2e",
    "scrollbarSlider.background": "#42424240",
    "scrollbarSlider.hoverBackground": "#4f4f4f70",
    "scrollbarSlider.activeBackground": "#6e6e6e80",
  },
});

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

function registerSqlProviders(monaco, schemaDataRef, isDorisRef) {
  // Filter named functions
  const sparkNamedFunctions = SPARK_FUNCTIONS_DATA.filter((f) =>
    /^[a-z_]/i.test(f.name)
  );
  const dorisNamedFunctions = DORIS_FUNCTIONS_DATA.filter((f) =>
    /^[a-z_]/i.test(f.name)
  );

  const uniqueSparkKeywords = Array.from(new Set(SPARK_SQL_KEYWORDS));
  const uniqueDorisKeywords = Array.from(new Set(DORIS_SQL_KEYWORDS));

  // Completion provider for functions, data types, keywords, snippets, and schema
  const completionProvider = monaco.languages.registerCompletionItemProvider("sql", {
    triggerCharacters: [".", " "],
    provideCompletionItems: (model, position, completionContext) => {
      const isDoris = isDorisRef?.current ?? false;
      const lineContent = model.getLineContent(position.lineNumber);
      const textBeforeCursor = lineContent.substring(0, position.column - 1);

      // Only suppress autocomplete when user literally just typed a comma or open paren (without manual invocation)
      const isManualInvoke = completionContext && completionContext.triggerKind === 0;
      if (!isManualInvoke && (textBeforeCursor.endsWith(",") || textBeforeCursor.endsWith("("))) {
        return { suggestions: [] };
      }

      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      const sqlContext = getSqlContext(model, position);

      // Functions suggestions based on active compute
      const activeFunctions = isDoris ? dorisNamedFunctions : sparkNamedFunctions;
      const functionSuggestions = activeFunctions.map((fn) => ({
        label: fn.name,
        kind: monaco.languages.CompletionItemKind.Function,
        insertText: fn.name.includes("(") ? fn.name : fn.name + "($0)",
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        detail: `[${isDoris ? "Doris " : ""}${fn.category}] ${fn.usage}`,
        documentation: {
          value: `**${fn.name}** (${fn.category})\n\n\`${fn.usage}\`\n\n${fn.description}${fn.example ? `\n\n*Example:*\n\`\`\`sql\n${fn.example}\n\`\`\`` : ""}`,
        },
        range,
      }));

      // Doris Data Types suggestions (when on Doris)
      const dataTypeSuggestions = isDoris
        ? DORIS_DATA_TYPES.map((dt) => ({
            label: dt.name,
            kind: monaco.languages.CompletionItemKind.TypeParameter,
            insertText: dt.syntax.includes("(") ? dt.syntax.replace(/\([^)]+\)/, "($0)") : dt.name,
            insertTextRules: dt.syntax.includes("(") ? monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet : undefined,
            detail: `[Doris Data Type] ${dt.size}`,
            documentation: {
              value: `**${dt.name}** — *${dt.category}*\n\n**Syntax:** \`${dt.syntax}\`\n\n**Size:** ${dt.size} | **Range:** ${dt.range}\n\n${dt.description}\n\n*Example:*\n\`\`\`sql\n${dt.example}\n\`\`\``,
            },
            range,
          }))
        : [];

      // Keyword suggestions based on active compute
      const activeKeywords = isDoris ? uniqueDorisKeywords : uniqueSparkKeywords;
      const keywordSuggestions = activeKeywords.map((kw) => ({
        label: kw,
        kind: monaco.languages.CompletionItemKind.Keyword,
        insertText: kw,
        detail: isDoris ? "Doris SQL Keyword" : "Spark SQL Keyword",
        range,
      }));

      // Snippet suggestions based on active compute
      const activeSnippets = isDoris ? DORIS_SQL_SNIPPETS : SPARK_SQL_SNIPPETS;
      const snippetSuggestions = activeSnippets.map((snippet) => ({
        label: snippet.label,
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertText: snippet.insertText,
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        detail: isDoris ? "Doris SQL Template" : "Spark SQL Template",
        documentation: snippet.description,
        range,
      }));

      // Schema-based suggestions
      const schemaSuggestions = [];
      
      if (schemaDataRef && schemaDataRef.current) {
        const { databases, tables, columns } = schemaDataRef.current;

        // Check if cursor is right after an identifier + dot (e.g. "default." or "users.")
        const dotMatch = textBeforeCursor.match(/`?([a-zA-Z0-9_]+)`?\.\s*$/);
        const prefixIdentifier = dotMatch ? dotMatch[1].toLowerCase() : null;

        // Database suggestions (suggest when not after a dot)
        if (!prefixIdentifier && databases && databases.length > 0) {
          databases.forEach((db) => {
            schemaSuggestions.push({
              label: db,
              kind: monaco.languages.CompletionItemKind.Module,
              insertText: db,
              detail: "Database",
              documentation: `Database: ${db}`,
              range,
              sortText: "0_" + db,
            });
          });
        }

        // Table suggestions
        if (tables && Object.keys(tables).length > 0 && (!prefixIdentifier || sqlContext === 'table' || sqlContext === 'any')) {
          Object.entries(tables).forEach(([db, tableList]) => {
            const isDbMatch = prefixIdentifier && db.toLowerCase() === prefixIdentifier;
            if (prefixIdentifier && !isDbMatch) return;

            tableList.forEach((tbl) => {
              const insertText = tbl.includes(" ") ? `\`${tbl}\`` : tbl;
              schemaSuggestions.push({
                label: isDbMatch ? tbl : `${db}.${tbl}`,
                kind: monaco.languages.CompletionItemKind.Class,
                insertText: insertText,
                detail: `Table in ${db}`,
                documentation: `Table: ${tbl}\nDatabase: ${db}`,
                range,
                sortText: "1_" + tbl,
              });
              if (!prefixIdentifier) {
                schemaSuggestions.push({
                  label: tbl,
                  kind: monaco.languages.CompletionItemKind.Class,
                  insertText: insertText,
                  detail: `Table in ${db}`,
                  documentation: `Table: ${tbl}\nDatabase: ${db}`,
                  range,
                  sortText: "1_" + tbl,
                });
              }
            });
          });
        }

        // Column suggestions
        if (columns && Object.keys(columns).length > 0 && (!prefixIdentifier || sqlContext === 'column' || sqlContext === 'any')) {
          Object.entries(columns).forEach(([key, columnList]) => {
            const [db, tbl] = key.split('.');
            const isTableMatch = prefixIdentifier && (tbl.toLowerCase() === prefixIdentifier || key.toLowerCase() === prefixIdentifier);
            if (prefixIdentifier && !isTableMatch) return;

            columnList.forEach((col) => {
              const insertText = col.name.includes(" ") ? `\`${col.name}\`` : col.name;
              schemaSuggestions.push({
                label: col.name,
                kind: monaco.languages.CompletionItemKind.Field,
                insertText: insertText,
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
          !activeKeywords.includes(w.toUpperCase()) && 
          !activeFunctions.some((f) => f.name.toLowerCase() === w.toLowerCase())
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
        ...dataTypeSuggestions,
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

  // Hover provider for functions & data types
  const hoverProvider = monaco.languages.registerHoverProvider("sql", {
    provideHover: (model, position) => {
      const isDoris = isDorisRef?.current ?? false;
      const word = model.getWordAtPosition(position);
      if (!word) return null;
      const term = word.word.toLowerCase();

      if (isDoris) {
        // 1. Check Doris Functions
        const fnMatch = dorisNamedFunctions.find(
          (fn) => fn.name.toLowerCase() === term
        );
        if (fnMatch) {
          return {
            range: new monaco.Range(
              position.lineNumber,
              word.startColumn,
              position.lineNumber,
              word.endColumn
            ),
            contents: [
              { value: `**${fnMatch.name}** — *Doris ${fnMatch.category} Function*` },
              { value: `\`\`\`sql\n${fnMatch.usage}\n\`\`\`` },
              { value: fnMatch.description },
              ...(fnMatch.example ? [{ value: `*Example:*\n\`\`\`sql\n${fnMatch.example}\n\`\`\`` }] : []),
            ],
          };
        }

        // 2. Check Doris Data Types
        const dtMatch = DORIS_DATA_TYPES.find(
          (dt) => dt.name.toLowerCase() === term
        );
        if (dtMatch) {
          return {
            range: new monaco.Range(
              position.lineNumber,
              word.startColumn,
              position.lineNumber,
              word.endColumn
            ),
            contents: [
              { value: `**${dtMatch.name}** — *Doris ${dtMatch.category} Data Type*` },
              { value: `\`\`\`sql\n${dtMatch.syntax}\n\`\`\`` },
              { value: `**Size:** ${dtMatch.size} | **Range:** ${dtMatch.range}\n\n${dtMatch.description}` },
              { value: `*Example:*\n\`\`\`sql\n${dtMatch.example}\n\`\`\`` },
            ],
          };
        }
      } else {
        // Spark Mode: Check Spark Functions
        const match = sparkNamedFunctions.find(
          (fn) => fn.name.toLowerCase() === term
        );
        if (match) {
          return {
            range: new monaco.Range(
              position.lineNumber,
              word.startColumn,
              position.lineNumber,
              word.endColumn
            ),
            contents: [
              { value: `**${match.name}** — *Spark ${match.category}*` },
              { value: `\`\`\`sql\n${match.usage}\n\`\`\`` },
              { value: match.description },
            ],
          };
        }
      }

      return null;
    },
  });

  return [completionProvider, hoverProvider];
}

const MARKDOWN_SNIPPETS = [
  // Headings
  {
    label: "h1",
    filterText: "# h1 heading1 title",
    detail: "# Heading 1",
    documentation: "Insert top-level heading (H1)",
    insertText: "# ${1:Heading 1}\n$0",
    kind: "Snippet",
    sortText: "01_h1",
  },
  {
    label: "h2",
    filterText: "## h2 heading2 section",
    detail: "## Heading 2",
    documentation: "Insert section heading (H2)",
    insertText: "## ${1:Heading 2}\n$0",
    kind: "Snippet",
    sortText: "02_h2",
  },
  {
    label: "h3",
    filterText: "### h3 heading3 sub",
    detail: "### Heading 3",
    documentation: "Insert subsection heading (H3)",
    insertText: "### ${1:Heading 3}\n$0",
    kind: "Snippet",
    sortText: "03_h3",
  },
  {
    label: "h4",
    filterText: "#### h4 heading4",
    detail: "#### Heading 4",
    documentation: "Insert H4 heading",
    insertText: "#### ${1:Heading 4}\n$0",
    kind: "Snippet",
    sortText: "04_h4",
  },
  {
    label: "h5",
    filterText: "##### h5 heading5",
    detail: "##### Heading 5",
    documentation: "Insert H5 heading",
    insertText: "##### ${1:Heading 5}\n$0",
    kind: "Snippet",
    sortText: "05_h5",
  },
  {
    label: "h6",
    filterText: "###### h6 heading6",
    detail: "###### Heading 6",
    documentation: "Insert H6 heading",
    insertText: "###### ${1:Heading 6}\n$0",
    kind: "Snippet",
    sortText: "06_h6",
  },

  // Text Formatting
  {
    label: "bold",
    filterText: "bold ** strong",
    detail: "**Bold Text**",
    documentation: "Make selected or placeholder text bold",
    insertText: "**${1:bold text}**$0",
    kind: "Snippet",
    sortText: "10_bold",
  },
  {
    label: "italic",
    filterText: "italic * em emphasis",
    detail: "*Italic Text*",
    documentation: "Make selected or placeholder text italic",
    insertText: "*${1:italic text}*$0",
    kind: "Snippet",
    sortText: "11_italic",
  },
  {
    label: "strikethrough",
    filterText: "strikethrough ~~ strike delete",
    detail: "~~Strikethrough~~",
    documentation: "Strikethrough text",
    insertText: "~~${1:strikethrough text}~~$0",
    kind: "Snippet",
    sortText: "12_strikethrough",
  },
  {
    label: "code-inline",
    filterText: "code inline ` backtick",
    detail: "`inline code`",
    documentation: "Inline code formatted with backticks",
    insertText: "`$1`$0",
    kind: "Snippet",
    sortText: "13_code_inline",
  },
  {
    label: "link",
    filterText: "link [ url href",
    detail: "[Text](url)",
    documentation: "Hyperlink with label and URL",
    insertText: "[${1:link text}](${2:https://})$0",
    kind: "Snippet",
    sortText: "14_link",
  },
  {
    label: "image",
    filterText: "image ![ img pic photo",
    detail: "![Alt](url)",
    documentation: "Embedded markdown image",
    insertText: "![${1:alt text}](${2:url})$0",
    kind: "Snippet",
    sortText: "15_image",
  },

  // Code Blocks & Livy / Spark SQL Integration
  {
    label: "codeblock",
    filterText: "codeblock ``` fence block",
    detail: "```language ... ```",
    documentation: "Fenced code block with language specifier",
    insertText: "```${1:sql}\n${2}\n```\n$0",
    kind: "Snippet",
    sortText: "20_codeblock",
  },
  {
    label: "sql-block",
    filterText: "sql ```sql query spark query",
    detail: "```sql Spark SQL Query Block",
    documentation: "Fenced Spark SQL code block",
    insertText: "```sql\nSELECT ${1:*}\nFROM ${2:table_name}\nLIMIT ${3:100};\n```\n$0",
    kind: "Snippet",
    sortText: "21_sql_block",
  },
  {
    label: "python-block",
    filterText: "python ```python pyspark py",
    detail: "```python PySpark Code Block",
    documentation: "Fenced Python / PySpark code block",
    insertText: "```python\n${1:df = spark.read.table(\"table_name\")}\n${2:df.show(10)}\n```\n$0",
    kind: "Snippet",
    sortText: "22_python_block",
  },
  {
    label: "json-block",
    filterText: "json ```json data",
    detail: "```json JSON Data Block",
    documentation: "Fenced JSON data block",
    insertText: "```json\n{\n  \"${1:key}\": \"${2:value}\"\n}\n```\n$0",
    kind: "Snippet",
    sortText: "23_json_block",
  },
  {
    label: "bash-block",
    filterText: "bash ```bash shell sh script",
    detail: "```bash Shell Script Block",
    documentation: "Fenced Bash / Shell script block",
    insertText: "```bash\n${1:echo \"Hello Spark\"}\n```\n$0",
    kind: "Snippet",
    sortText: "24_bash_block",
  },
  {
    label: "mermaid-block",
    filterText: "mermaid ```mermaid diagram chart graph",
    detail: "```mermaid Diagram Block",
    documentation: "Mermaid flowchart diagram block",
    insertText: "```mermaid\nflowchart TD\n    A[${1:Start}] --> B[${2:Process}]\n    B --> C[${3:Finish}]\n```\n$0",
    kind: "Snippet",
    sortText: "25_mermaid_block",
  },

  // Tables
  {
    label: "table-3col",
    filterText: "table table3 grid columns",
    detail: "Table (3 Columns)",
    documentation: "Markdown table with 3 columns and header",
    insertText: "| ${1:Header 1} | ${2:Header 2} | ${3:Header 3} |\n| --- | --- | --- |\n| ${4:Value 1} | ${5:Value 2} | ${6:Value 3} |\n$0",
    kind: "Snippet",
    sortText: "30_table3",
  },
  {
    label: "table-2col",
    filterText: "table table2 kv keyvalue",
    detail: "Table (2 Columns / Key-Value)",
    documentation: "Markdown table with 2 columns",
    insertText: "| ${1:Property} | ${2:Description} |\n| --- | --- |\n| ${3:Key} | ${4:Value} |\n$0",
    kind: "Snippet",
    sortText: "31_table2",
  },

  // Lists & Tasks
  {
    label: "task-item",
    filterText: "task - [ ] todo check checkbox",
    detail: "- [ ] Task Item (Unchecked)",
    documentation: "GitHub task list item",
    insertText: "- [ ] ${1:Task description}\n$0",
    kind: "Snippet",
    sortText: "40_task",
  },
  {
    label: "task-done",
    filterText: "task - [x] done completed",
    detail: "- [x] Task Item (Completed)",
    documentation: "Completed task list item",
    insertText: "- [x] ${1:Completed task}\n$0",
    kind: "Snippet",
    sortText: "41_task_done",
  },
  {
    label: "bullet-list",
    filterText: "ul bullet list - * item",
    detail: "- Bullet List Item",
    documentation: "Unordered list item",
    insertText: "- ${1:List item}\n$0",
    kind: "Snippet",
    sortText: "42_bullet",
  },
  {
    label: "numbered-list",
    filterText: "ol number list 1. item",
    detail: "1. Numbered List Item",
    documentation: "Ordered list items",
    insertText: "1. ${1:First item}\n2. ${2:Second item}\n$0",
    kind: "Snippet",
    sortText: "43_numbered",
  },

  // GitHub Flavored Markdown Callouts / Alerts
  {
    label: "alert-note",
    filterText: "note alert callout > [!NOTE]",
    detail: "> [!NOTE] Alert Callout",
    documentation: "GitHub alert callout for neutral notes or context",
    insertText: "> [!NOTE]\n> ${1:Information or background context.}\n$0",
    kind: "Snippet",
    sortText: "50_note",
  },
  {
    label: "alert-tip",
    filterText: "tip alert callout > [!TIP]",
    detail: "> [!TIP] Alert Callout",
    documentation: "GitHub alert callout for helpful advice or performance tips",
    insertText: "> [!TIP]\n> ${1:Helpful suggestion or optimization tip.}\n$0",
    kind: "Snippet",
    sortText: "51_tip",
  },
  {
    label: "alert-important",
    filterText: "important alert callout > [!IMPORTANT]",
    detail: "> [!IMPORTANT] Alert Callout",
    documentation: "GitHub alert callout for crucial prerequisites or steps",
    insertText: "> [!IMPORTANT]\n> ${1:Essential information for this procedure.}\n$0",
    kind: "Snippet",
    sortText: "52_important",
  },
  {
    label: "alert-warning",
    filterText: "warning alert callout > [!WARNING]",
    detail: "> [!WARNING] Alert Callout",
    documentation: "GitHub alert callout for breaking changes or gotchas",
    insertText: "> [!WARNING]\n> ${1:Warning: proceeding may have unexpected side effects.}\n$0",
    kind: "Snippet",
    sortText: "53_warning",
  },
  {
    label: "alert-caution",
    filterText: "caution alert callout > [!CAUTION]",
    detail: "> [!CAUTION] Alert Callout",
    documentation: "GitHub alert callout for destructive or high-risk operations",
    insertText: "> [!CAUTION]\n> ${1:Caution: data loss or irreversible operation risk.}\n$0",
    kind: "Snippet",
    sortText: "54_caution",
  },

  // Quotes, Dividers & Details
  {
    label: "blockquote",
    filterText: "quote blockquote >",
    detail: "> Blockquote",
    documentation: "Quotation block",
    insertText: "> ${1:Quotation or cited text.}\n$0",
    kind: "Snippet",
    sortText: "60_quote",
  },
  {
    label: "divider",
    filterText: "hr divider horizontal rule --- ***",
    detail: "--- Horizontal Rule",
    documentation: "Horizontal dividing line",
    insertText: "---\n\n$0",
    kind: "Snippet",
    sortText: "61_hr",
  },
  {
    label: "details",
    filterText: "details collapsible summary dropdown",
    detail: "<details> Collapsible Section",
    documentation: "Collapsible disclosure block with summary header",
    insertText: "<details>\n<summary>${1:Click to expand details}</summary>\n\n${2:Hidden details and logs go here.}\n\n</details>\n$0",
    kind: "Snippet",
    sortText: "62_details",
  },

  // Math (KaTeX / LaTeX)
  {
    label: "math-block",
    filterText: "math latex formula katex $$",
    detail: "$$ Math Block $$",
    documentation: "Display math equation block with LaTeX",
    insertText: "$$\n${1:E = mc^2}\n$$\n$0",
    kind: "Snippet",
    sortText: "70_math_block",
  },
  {
    label: "math-inline",
    filterText: "math inline latex $",
    detail: "$ inline math $",
    documentation: "Inline mathematical notation",
    insertText: "$${1:x}$$0",
    kind: "Snippet",
    sortText: "71_math_inline",
  },

  // Runbook / Spark Document Template
  {
    label: "runbook-template",
    filterText: "runbook template documentation spark note",
    detail: "Spark SQL Runbook Template",
    documentation: "Complete template for query runbooks, analyses, and SOPs",
    insertText: "# ${1:Document Title}\n\n## Overview\n${2:Brief summary of the purpose and objectives.}\n\n## Environment\n- **Target Database**: \`${3:default}\`\n- **Engine**: Spark SQL (Livy)\n\n## Step 1: Query Execution\n```sql\nSELECT * FROM ${4:my_table} LIMIT 100;\n```\n\n## Notes & Verification\n- [ ] ${5:Verify record count matches expectations}\n- [ ] ${6:Check for NULL or invalid values}\n\n$0",
    kind: "Snippet",
    sortText: "80_runbook",
  },
];

const HTML_TAGS = new Set([
  "a", "abbr", "address", "article", "aside", "audio", "b", "base", "bdi", "bdo",
  "blockquote", "body", "br", "button", "canvas", "caption", "cite", "code", "col",
  "colgroup", "data", "datalist", "dd", "del", "details", "dfn", "dialog", "div",
  "dl", "dt", "em", "embed", "fieldset", "figcaption", "figure", "footer", "form",
  "h1", "h2", "h3", "h4", "h5", "h6", "header", "hgroup", "hr", "html", "i",
  "iframe", "img", "input", "ins", "kbd", "label", "legend", "li", "link", "main",
  "map", "mark", "menu", "meta", "meter", "nav", "noscript", "object", "ol",
  "optgroup", "option", "output", "p", "picture", "pre", "progress", "q", "rp",
  "rt", "ruby", "s", "samp", "script", "search", "section", "select", "slot",
  "small", "source", "span", "strong", "style", "sub", "summary", "sup", "table",
  "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "time", "title",
  "tr", "track", "u", "ul", "var", "video", "wbr"
]);

const COMMON_EMMET_ALIASES = new Set([
  "bq", "btn", "hdr", "ftr", "art", "sect", "fig", "figc", "str"
]);

function isValidMarkdownEmmet(abbr, linePrefix = "") {
  if (!abbr || abbr.trim().length === 0) return false;
  // Don't treat markdown headers like '# heading' as Emmet
  if (/^\s*#+\s*$/.test(linePrefix)) return false;
  // Don't treat markdown blockquotes '> text' as Emmet
  if (/^\s*>\s*$/.test(linePrefix) && !abbr.includes(">")) return false;
  // Don't treat markdown list items '- item' as Emmet
  if (/^\s*[-*+]\s+$/.test(linePrefix) && !abbr.includes(">") && !abbr.includes("*")) return false;

  // Has Emmet structural operators: >, +, *, ^, [, ], (, ), {, }
  if (/[>+*^()[\]{}]/.test(abbr)) return true;
  // Has class or id notation: div.alert, .card, span#main
  if (/\.[a-zA-Z]/.test(abbr) || /^[a-zA-Z0-9_-]+#[a-zA-Z]/.test(abbr)) return true;
  // Lorem generator
  if (/^lorem\d*$/i.test(abbr)) return true;

  const lower = abbr.toLowerCase();
  const isTag = HTML_TAGS.has(lower) || COMMON_EMMET_ALIASES.has(lower);
  if (!isTag) return false;

  // For a standalone tag name (e.g. kbd, div, table, p), only treat as Emmet if it is at the beginning of the line (or only whitespace before it)
  // This prevents accidental expansion when typing regular prose (e.g., "press enter on the table")
  return /^\s*$/.test(linePrefix);
}

const EMMET_SNIPPET_CONFIG = {
  options: {
    "output.field": (index, placeholder) => `\${${index}${placeholder ? ":" + placeholder : ""}}`,
    "output.indent": "  ",
  },
};

const EMMET_PREVIEW_CONFIG = {
  options: {
    "output.field": (index, placeholder) => placeholder || "",
    "output.indent": "  ",
  },
};

function expandEmmetAtCursor(editor, monacoInstance) {
  if (!editor || !monacoInstance) return false;
  const pos = editor.getPosition();
  const model = editor.getModel();
  if (!pos || !model || pos.column <= 1) return false;

  const lineContent = model.getLineContent(pos.lineNumber);

  // Cursor must not be in the middle of a token
  if (pos.column - 1 < lineContent.length) {
    const nextChar = lineContent[pos.column - 1];
    if (/[a-zA-Z0-9_*+>#.[\]{}:$-]/.test(nextChar)) {
      return false;
    }
  }

  const extracted = extract(lineContent, pos.column - 1);
  if (!extracted || !extracted.abbreviation) return false;

  const linePrefix = lineContent.slice(0, extracted.start);
  if (!isValidMarkdownEmmet(extracted.abbreviation, linePrefix)) return false;

  try {
    const expanded = expand(extracted.abbreviation, EMMET_SNIPPET_CONFIG);
    if (!expanded) return false;

    const range = new monacoInstance.Range(
      pos.lineNumber,
      extracted.start + 1,
      pos.lineNumber,
      extracted.end + 1
    );

    const snippetController = editor.getContribution("snippetController2");
    if (snippetController && typeof snippetController.insert === "function") {
      snippetController.insert(expanded, range);
    } else {
      editor.executeEdits("emmet", [{
        range,
        text: expand(extracted.abbreviation, EMMET_PREVIEW_CONFIG),
      }]);
    }
    return true;
  } catch (err) {
    console.warn("[Emmet] Abbreviation expansion error:", err);
    return false;
  }
}

function registerMarkdownProviders(monaco) {
  const completionProvider = monaco.languages.registerCompletionItemProvider("markdown", {
    triggerCharacters: ["#", "[", "`", "-", ">", "|", "*", "!", ":", "$", "<", "+", ".", "{", "}", "(", ")", "]"],
    provideCompletionItems: (model, position) => {
      const lineContent = model.getLineContent(position.lineNumber);
      const textBeforeCursor = lineContent.substring(0, position.column - 1);
      const word = model.getWordUntilPosition(position);

      const defaultRange = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      const headingMatch = textBeforeCursor.match(/^(\s*)(#{1,6})$/);
      const quoteMatch = textBeforeCursor.match(/^(\s*)(>)$/);
      const dashMatch = textBeforeCursor.match(/^(\s*)(-)$/);

      const suggestions = [];

      // Native Emmet expansion for Markdown
      try {
        const extracted = extract(lineContent, position.column - 1);
        if (extracted) {
          const linePrefix = lineContent.slice(0, extracted.start);
          if (isValidMarkdownEmmet(extracted.abbreviation, linePrefix)) {
            const expandedSnippet = expand(extracted.abbreviation, EMMET_SNIPPET_CONFIG);
            const previewText = expand(extracted.abbreviation, EMMET_PREVIEW_CONFIG);
            if (expandedSnippet) {
              suggestions.push({
                label: extracted.abbreviation,
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: expandedSnippet,
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                detail: "Emmet Abbreviation",
                documentation: {
                  value: "```html\n" + previewText + "\n```",
                },
                range: {
                  startLineNumber: position.lineNumber,
                  endLineNumber: position.lineNumber,
                  startColumn: extracted.start + 1,
                  endColumn: extracted.end + 1,
                },
                sortText: "00_" + extracted.abbreviation,
              });
            }
          }
        }
      } catch {
        // ignore incomplete emmet abbreviations during typing
      }

      for (const snippet of MARKDOWN_SNIPPETS) {
        let insertText = snippet.insertText;
        let range = defaultRange;

        if (headingMatch && snippet.label.startsWith("h") && !snippet.label.includes("-")) {
          const hashCount = headingMatch[2].length;
          const targetLevel = parseInt(snippet.label.slice(1), 10);
          if (targetLevel === hashCount) {
            range = {
              startLineNumber: position.lineNumber,
              endLineNumber: position.lineNumber,
              startColumn: headingMatch[1].length + 1,
              endColumn: position.column,
            };
          }
        } else if (quoteMatch && (snippet.label.startsWith("alert-") || snippet.label === "blockquote")) {
          range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: quoteMatch[1].length + 1,
            endColumn: position.column,
          };
        } else if (dashMatch && (snippet.label.startsWith("task") || snippet.label === "bullet-list")) {
          range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: dashMatch[1].length + 1,
            endColumn: position.column,
          };
        }

        suggestions.push({
          label: snippet.label,
          filterText: snippet.filterText || snippet.label,
          kind: monaco.languages.CompletionItemKind[snippet.kind || "Snippet"],
          insertText,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: snippet.detail,
          documentation: {
            value: typeof snippet.documentation === "string" ? snippet.documentation : snippet.documentation?.value || "",
          },
          range,
          sortText: snippet.sortText || ("1_" + snippet.label),
        });
      }

      // Word completions from the current document
      const documentText = model.getValue();
      const wordRegex = /\b[a-zA-Z_][a-zA-Z0-9_-]*\b/g;
      const docWords = new Set();
      let wordMatch;
      while ((wordMatch = wordRegex.exec(documentText)) !== null) {
        const w = wordMatch[0];
        if (w.length > 2 && !w.startsWith("http")) {
          docWords.add(w);
        }
      }

      docWords.forEach((w) => {
        suggestions.push({
          label: w,
          kind: monaco.languages.CompletionItemKind.Text,
          insertText: w,
          detail: "Word in Document",
          range: defaultRange,
          sortText: "9_" + w,
        });
      });

      return { suggestions };
    },
  });

  const hoverProvider = monaco.languages.registerHoverProvider("markdown", {
    provideHover: (model, position) => {
      const lineContent = model.getLineContent(position.lineNumber);

      if (lineContent.includes("[!NOTE]")) {
        return {
          contents: [
            { value: "**Markdown Note Callout**" },
            { value: "Highlights useful information or background context." },
          ],
        };
      }
      if (lineContent.includes("[!TIP]")) {
        return {
          contents: [
            { value: "**Markdown Tip Callout**" },
            { value: "Helpful advice or optimization suggestion." },
          ],
        };
      }
      if (lineContent.includes("[!IMPORTANT]")) {
        return {
          contents: [
            { value: "**Markdown Important Callout**" },
            { value: "Crucial information required for success." },
          ],
        };
      }
      if (lineContent.includes("[!WARNING]")) {
        return {
          contents: [
            { value: "**Markdown Warning Callout**" },
            { value: "Urgent warning to avoid problems or breaking changes." },
          ],
        };
      }
      if (lineContent.includes("[!CAUTION]")) {
        return {
          contents: [
            { value: "**Markdown Caution Callout**" },
            { value: "Advises about destructive or high-risk actions." },
          ],
        };
      }
      if (lineContent.trim().startsWith("```sql")) {
        return {
          contents: [
            { value: "**Spark SQL Code Block**" },
            { value: "Spark SQL syntax block inside Markdown." },
          ],
        };
      }
      if (lineContent.trim().startsWith("```mermaid")) {
        return {
          contents: [
            { value: "**Mermaid Diagram Block**" },
            { value: "Renders as an interactive diagram in the Preview pane." },
          ],
        };
      }
      return null;
    },
  });

  return [completionProvider, hoverProvider];
}

function hasSqlCode(sql) {
  if (!sql) return false;
  return sql.replace(/--.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "").trim().length > 0;
}

function parseStatements(content) {
  if (!content) return [];
  const lines = content.split("\n");
  const statements = [];
  let currentSql = "";
  let startLine = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip leading empty lines for a statement
    if (!currentSql && line.trim() === "") {
      startLine = i + 2;
      continue;
    }

    currentSql += (currentSql ? "\n" : "") + line;

    // Detect if statement ends with semicolon by stripping single-line comments on this line
    const trimmedLine = line.replace(/--.*$/, "").trim();
    if (trimmedLine.endsWith(";")) {
      const sql = currentSql.trim().replace(/;\s*$/, "").trim();
      if (hasSqlCode(sql)) {
        statements.push({ sql, startLine, endLine: i + 1 });
      }
      currentSql = "";
      startLine = i + 2;
    }
  }

  // Handle trailing statement without semicolon
  const trailing = currentSql.trim().replace(/;\s*$/, "").trim();
  if (hasSqlCode(trailing)) {
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

export const SQL_PARAM_TYPES = {
  custom: [
    { regex: String.raw`\$\{[\w.-]+\}` },
    { regex: String.raw`\{\{[\w\s.|'"-]+\}\}` },
    { regex: String.raw`\$[a-zA-Z0-9_]+` },
    { regex: String.raw`:[a-zA-Z0-9_]+` },
    { regex: String.raw`@[a-zA-Z0-9_]+` },
  ],
  positional: true,
};

/**
 * Formats a SQL statement using sql-formatter with support for parameter placeholders
 * ($var, ${var}, {{var}}, :var, @var) and a safe masking fallback for complex templating.
 *
 * @param {string} statement - Single SQL statement to format
 * @param {number} [tabWidth=2] - Indentation width
 * @returns {string} - Formatted SQL statement
 */
export function formatSqlStatement(statement, tabWidth = 2, language = "spark") {
  const trimmed = statement.trim();
  if (!trimmed) return "";

  const dialect = language || "spark";

  // 1. Primary: format directly using sql-formatter configured with custom paramTypes
  try {
    return format(trimmed, {
      language: dialect,
      tabWidth,
      paramTypes: SQL_PARAM_TYPES,
    });
  } catch {
    // 2. Fallback: mask custom placeholders outside strings and comments, format, and restore
    try {
      const placeholderMap = new Map();
      let counter = 0;
      const placeholderRegex = /('(?:''|[^'])*'|"(?:""|[^"])*"|`(?:``|[^`])*`|--[^\r\n]*|\/\*[\s\S]*?\*\/)|(\$\{[\w.-]+\}|\{\{[\s\S]*?\}\}|\$[a-zA-Z0-9_]+|:[a-zA-Z0-9_]+|@[a-zA-Z0-9_]+)/g;

      const masked = trimmed.replace(placeholderRegex, (match, literal, placeholder) => {
        if (literal || !placeholder) return match;
        const key = `__LIVY_PARAM_${counter++}__`;
        placeholderMap.set(key, placeholder);
        return key;
      });

      let formattedMasked = format(masked, {
        language: dialect,
        tabWidth,
        paramTypes: SQL_PARAM_TYPES,
      });

      for (const [key, original] of placeholderMap.entries()) {
        formattedMasked = formattedMasked.split(key).join(original);
      }
      return formattedMasked;
    } catch {
      // If formatting still fails (e.g. invalid syntax), safely return trimmed original
      return trimmed;
    }
  }
}

/**
 * Minifies a single SQL statement by compressing redundant whitespace while strictly
 * preserving comments (leading line/block comments, inline comments, and standalone comments)
 * and string literals.
 *
 * @param {string} statement - Single SQL statement to minify
 * @returns {string} - Minified SQL statement
 */
export function minifySqlStatement(statement) {
  const trimmed = statement.trim();
  if (!trimmed) return "";

  const tokens = [];
  let i = 0;
  const len = trimmed.length;

  while (i < len) {
    const ch = trimmed[i];
    const next = trimmed[i + 1];

    if (ch === "-" && next === "-") {
      let end = trimmed.indexOf("\n", i + 2);
      if (end === -1) end = len;
      tokens.push({ type: "line-comment", text: trimmed.slice(i, end).trim() });
      i = end;
    } else if (ch === "/" && next === "*") {
      let end = trimmed.indexOf("*/", i + 2);
      if (end === -1) end = len;
      else end += 2;
      tokens.push({ type: "block-comment", text: trimmed.slice(i, end) });
      i = end;
    } else if (ch === "'") {
      let j = i + 1;
      while (j < len) {
        if (trimmed[j] === "'") {
          if (trimmed[j + 1] === "'") {
            j += 2;
          } else {
            j++;
            break;
          }
        } else if (trimmed[j] === "\\") {
          j += 2;
        } else {
          j++;
        }
      }
      tokens.push({ type: "string", text: trimmed.slice(i, j) });
      i = j;
    } else if (ch === '"') {
      let j = i + 1;
      while (j < len) {
        if (trimmed[j] === '"') {
          if (trimmed[j + 1] === '"') {
            j += 2;
          } else {
            j++;
            break;
          }
        } else if (trimmed[j] === "\\") {
          j += 2;
        } else {
          j++;
        }
      }
      tokens.push({ type: "string", text: trimmed.slice(i, j) });
      i = j;
    } else if (ch === "`") {
      let j = i + 1;
      while (j < len) {
        if (trimmed[j] === "`") {
          if (trimmed[j + 1] === "`") {
            j += 2;
          } else {
            j++;
            break;
          }
        } else if (trimmed[j] === "\\") {
          j += 2;
        } else {
          j++;
        }
      }
      tokens.push({ type: "string", text: trimmed.slice(i, j) });
      i = j;
    } else if (/\s/.test(ch)) {
      while (i < len && /\s/.test(trimmed[i])) {
        i++;
      }
      tokens.push({ type: "space", text: " " });
    } else {
      let j = i;
      while (
        j < len &&
        !/\s/.test(trimmed[j]) &&
        trimmed[j] !== "'" &&
        trimmed[j] !== '"' &&
        trimmed[j] !== "`" &&
        !(trimmed[j] === "-" && trimmed[j + 1] === "-") &&
        !(trimmed[j] === "/" && trimmed[j + 1] === "*")
      ) {
        j++;
      }
      tokens.push({ type: "code", text: trimmed.slice(i, j) });
      i = j;
    }
  }

  // Find index of first executable code or string token
  const firstCodeIndex = tokens.findIndex((t) => t.type === "code" || t.type === "string");
  if (firstCodeIndex === -1) {
    // Statement consists entirely of comments: preserve them all
    return tokens
      .filter((t) => t.type === "line-comment" || t.type === "block-comment")
      .map((t) => t.text)
      .join("\n");
  }

  const leadingComments = [];
  for (let k = 0; k < firstCodeIndex; k++) {
    if (tokens[k].type === "line-comment" || tokens[k].type === "block-comment") {
      leadingComments.push(tokens[k].text);
    }
  }

  const bodyParts = [];
  for (let k = firstCodeIndex; k < tokens.length; k++) {
    const tok = tokens[k];
    if (tok.type === "line-comment") {
      bodyParts.push("\n" + tok.text + "\n");
    } else if (tok.type === "block-comment") {
      bodyParts.push(" " + tok.text + " ");
    } else if (tok.type === "space") {
      bodyParts.push(" ");
    } else {
      bodyParts.push(tok.text);
    }
  }

  let body = bodyParts.join("");
  body = body
    .split("\n")
    .map((line) => line.trim().replace(/[ \t]+/g, " "))
    .filter(Boolean)
    .join("\n");

  if (leadingComments.length > 0) {
    return leadingComments.join("\n") + "\n" + body;
  }
  return body;
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
  onSwitchToTab,
  onRestoreTab,
  onToggleCommandPalette,
  onTriggerBounce,
  onTriggerSnake,
  onSyntaxErrorsChange,
}, ref) {
  const {
    activeFile,
    files,
    openFiles,
    updateContent,
    setResult,
    saveFile,
    toggleAutoSave,
    activeResultId,
    pendingLineReveal,
    clearPendingLineReveal,
    markdownViewMode,
  } = useSqlFiles();
  const activeFileRef = useRef(activeFile);
  const toggleAutoSaveRef = useRef(toggleAutoSave);
  const onPrevTabRef = useRef(onPrevTab);
  const onNextTabRef = useRef(onNextTab);
  const onSwitchToTabRef = useRef(onSwitchToTab);
  const onRestoreTabRef = useRef(onRestoreTab);
  const onNewTabRef = useRef(onNewTab);
  const onCloseTabRef = useRef(onCloseTab);
  const onToggleQueryHistoryRef = useRef(onToggleQueryHistory);
  const onToggleShortcutsRef = useRef(onToggleShortcuts);
  const onToggleConnectionModalRef = useRef(onToggleConnectionModal);
  const onToggleCommandPaletteRef = useRef(onToggleCommandPalette);
  const onFocusSchemaSearchRef = useRef(onFocusSchemaSearch);
  const onFocusFileSearchRef = useRef(onFocusFileSearch);
  const onToggleSidebarRef = useRef(onToggleSidebar);
  const onToggleResultPanelRef = useRef(onToggleResultPanel);
  const onTriggerBounceRef = useRef(onTriggerBounce);
  const onTriggerSnakeRef = useRef(onTriggerSnake);

  // Monaco model caching for undo history preservation
  const modelsRef = useRef(new Map());
  const closedModelsRef = useRef(new Map());
  const prevActiveFileIdRef = useRef(null);
  const handleChangeRef = useRef(null);
  const isApplyingExternalUpdateRef = useRef(false);

  // Synchronized scrolling refs between Monaco editor and Markdown preview
  const previewContainerRef = useRef(null);
  const isSyncingFromPreviewRef = useRef(false);
  const isSyncingFromEditorRef = useRef(false);
  const syncEditorTimerRef = useRef(null);
  const syncPreviewTimerRef = useRef(null);
  const markdownViewModeRef = useRef(markdownViewMode);

  useEffect(() => {
    markdownViewModeRef.current = markdownViewMode;
  }, [markdownViewMode]);

  useEffect(() => {
    return () => {
      clearTimeout(syncEditorTimerRef.current);
      clearTimeout(syncPreviewTimerRef.current);
    };
  }, []);

  const handlePreviewScroll = useCallback((e) => {
    if (isSyncingFromEditorRef.current) return;
    if (markdownViewModeRef.current !== "split") return;

    const editor = editorRef.current;
    if (!editor) return;

    const previewEl = e.currentTarget;
    const previewScrollTop = previewEl.scrollTop;
    const previewScrollHeight = previewEl.scrollHeight;
    const previewClientHeight = previewEl.clientHeight;
    const maxPreviewScroll = previewScrollHeight - previewClientHeight;

    const editorScrollHeight = editor.getScrollHeight();
    const editorClientHeight = editor.getLayoutInfo()?.height || 0;
    const maxEditorScroll = editorScrollHeight - editorClientHeight;

    if (maxPreviewScroll > 0 && maxEditorScroll > 0) {
      const ratio = Math.max(0, Math.min(1, previewScrollTop / maxPreviewScroll));
      isSyncingFromPreviewRef.current = true;
      editor.setScrollTop(ratio * maxEditorScroll);

      clearTimeout(syncPreviewTimerRef.current);
      syncPreviewTimerRef.current = setTimeout(() => {
        isSyncingFromPreviewRef.current = false;
      }, 60);
    }
  }, []);

  useEffect(() => {
    activeFileRef.current = activeFile;
  }, [activeFile]);

  useEffect(() => {
    toggleAutoSaveRef.current = toggleAutoSave;
  }, [toggleAutoSave]);

  useEffect(() => {
    onPrevTabRef.current = onPrevTab;
    onNextTabRef.current = onNextTab;
    onSwitchToTabRef.current = onSwitchToTab;
    onRestoreTabRef.current = onRestoreTab;
    onNewTabRef.current = onNewTab;
    onCloseTabRef.current = onCloseTab;
    onToggleQueryHistoryRef.current = onToggleQueryHistory;
    onToggleShortcutsRef.current = onToggleShortcuts;
    onToggleConnectionModalRef.current = onToggleConnectionModal;
    onToggleCommandPaletteRef.current = onToggleCommandPalette;
    onFocusSchemaSearchRef.current = onFocusSchemaSearch;
    onFocusFileSearchRef.current = onFocusFileSearch;
    onToggleSidebarRef.current = onToggleSidebar;
    onToggleResultPanelRef.current = onToggleResultPanel;
    onTriggerBounceRef.current = onTriggerBounce;
    onTriggerSnakeRef.current = onTriggerSnake;
  });

  const { sessionId, sessionState, isOnline, isServerReachable, isDoris, isSpark, activeHost } = useLivy();
  const isDorisRef = useRef(isDoris);
  useEffect(() => {
    isDorisRef.current = isDoris;
  }, [isDoris]);
  const schemaContext = useSchema();
  const schemaDataRef = useRef({ databases: [], tables: {}, columns: {} });
  const { addToast } = useToast();
  const { settings, updateSetting } = useSettings();
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const onSyntaxErrorsChangeRef = useRef(onSyntaxErrorsChange);
  onSyntaxErrorsChangeRef.current = onSyntaxErrorsChange;
  const scheduleSqlValidationRef = useRef(null);
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const viewStatesRef = useRef({});
  const [monacoInstance, setMonacoInstance] = useState(null);
  const [running, setRunning] = useState(false);
  const dorisAbortRef = useRef(null);
  const [wordWrap, setWordWrap] = useState(() => {
    const saved = localStorage.getItem('livy-ui-word-wrap');
    if (saved !== null) return saved !== 'off';
    return settings["editor.wordWrap"] !== "off";
  });

  const toggleWordWrap = useCallback(() => {
    setWordWrap((prev) => {
      const next = !prev;
      const nextVal = next ? "on" : "off";
      localStorage.setItem('livy-ui-word-wrap', nextVal);
      updateSetting("editor.wordWrap", nextVal);
      if (editorRef.current) {
        editorRef.current.updateOptions({ wordWrap: nextVal });
      }
      return next;
    });
  }, [updateSetting]);

  // Keep editor word wrap updated when settings change externally
  useEffect(() => {
    if (settings["editor.wordWrap"]) {
      const isWrapOn = settings["editor.wordWrap"] !== "off";
      setWordWrap(isWrapOn);
      localStorage.setItem('livy-ui-word-wrap', settings["editor.wordWrap"]);
      if (editorRef.current) {
        editorRef.current.updateOptions({ wordWrap: settings["editor.wordWrap"] });
      }
    }
  }, [settings["editor.wordWrap"]]);

  const [glyphPopup, setGlyphPopup] = useState(null);
  const glyphPopupRef = useRef(null);
  const abortRef = useRef(false);
  const statementsRef = useRef([]);
  const decorationsRef = useRef([]);
  const runningDecorationsRef = useRef([]);
  const handleRunSqlRef = useRef(null);
  const handleFormatRef = useRef(null);
  const handleMinifyRef = useRef(null);
  const handleValidateRef = useRef(null);
  const toggleSqlValidationRef = useRef(null);
  const toggleWordWrapRef = useRef(null);

  // SQL Static Validation state & refs
  const lastSyntaxErrorsRef = useRef([]);
  const validateDebounceTimerRef = useRef(null);

  const runSqlValidation = useCallback((model) => {
    if (!model || model.isDisposed() || !monacoRef.current) return;

    // Only validate SQL files
    const fileName = activeFileRef.current?.name || "";
    const isSqlFile = isSqlFileName(fileName);
    if (!isSqlFile || model.getLanguageId() !== "sql") {
      monacoRef.current.editor.setModelMarkers(model, "sql-validator", []);
      lastSyntaxErrorsRef.current = [];
      onSyntaxErrorsChangeRef.current?.([]);
      return;
    }

    const currentSettings = settingsRef.current || {};
    const isValidationEnabled = currentSettings["editor.sqlValidation.enabled"] ?? true;
    if (!isValidationEnabled) {
      monacoRef.current.editor.setModelMarkers(model, "sql-validator", []);
      lastSyntaxErrorsRef.current = [];
      onSyntaxErrorsChangeRef.current?.([]);
      return;
    }

    const sql = model.getValue();
    const isCurrentDoris = isDorisRef?.current ?? isDoris;
    const dialect = isCurrentDoris ? "mysql" : (currentSettings["editor.sqlValidation.dialect"] || "spark");
    const result = validateSql(sql, dialect);

    if (model.isDisposed()) return;

    if (result.isValid || result.errors.length === 0) {
      monacoRef.current.editor.setModelMarkers(model, "sql-validator", []);
      lastSyntaxErrorsRef.current = [];
      onSyntaxErrorsChangeRef.current?.([]);
    } else {
      const markers = result.errors.map((err) => ({
        startLineNumber: Math.max(1, err.startLine),
        startColumn: Math.max(1, err.startCol),
        endLineNumber: Math.max(1, err.endLine),
        endColumn: Math.max(err.startCol + 1, err.endCol),
        message: err.message,
        severity: monacoRef.current.MarkerSeverity.Error,
      }));
      monacoRef.current.editor.setModelMarkers(model, "sql-validator", markers);
      lastSyntaxErrorsRef.current = result.errors;
      onSyntaxErrorsChangeRef.current?.(result.errors);
    }
  }, []);

  const scheduleSqlValidation = useCallback((model, immediate = false) => {
    if (validateDebounceTimerRef.current) {
      clearTimeout(validateDebounceTimerRef.current);
      validateDebounceTimerRef.current = null;
    }

    const currentSettings = settingsRef.current || {};
    const isValidationEnabled = currentSettings["editor.sqlValidation.enabled"] ?? true;
    if (!isValidationEnabled) {
      if (model && !model.isDisposed() && monacoRef.current) {
        monacoRef.current.editor.setModelMarkers(model, "sql-validator", []);
      }
      lastSyntaxErrorsRef.current = [];
      onSyntaxErrorsChangeRef.current?.([]);
      return;
    }

    if (immediate) {
      runSqlValidation(model);
    } else {
      validateDebounceTimerRef.current = setTimeout(() => {
        runSqlValidation(model);
      }, 350);
    }
  }, [runSqlValidation]);

  scheduleSqlValidationRef.current = scheduleSqlValidation;

  const toggleSqlValidation = useCallback(() => {
    const isCurrentlyEnabled = settingsRef.current?.["editor.sqlValidation.enabled"] ?? true;
    const nextVal = !isCurrentlyEnabled;
    updateSetting("editor.sqlValidation.enabled", nextVal);

    if (validateDebounceTimerRef.current) {
      clearTimeout(validateDebounceTimerRef.current);
      validateDebounceTimerRef.current = null;
    }

    if (!nextVal) {
      if (monacoRef.current) {
        modelsRef.current.forEach((mod) => {
          if (mod && !mod.isDisposed()) {
            monacoRef.current.editor.setModelMarkers(mod, "sql-validator", []);
          }
        });
      }
      lastSyntaxErrorsRef.current = [];
      onSyntaxErrorsChangeRef.current?.([]);
      addToast("cancelled", "Real-time SQL validation is now disabled", null, "SQL Validation: OFF");
    } else {
      if (editorRef.current) {
        const model = editorRef.current.getModel();
        if (model) {
          scheduleSqlValidationRef.current?.(model, true);
        }
      }
      addToast("ok", "Real-time SQL validation is now enabled", null, "SQL Validation: ON");
    }
    return nextVal;
  }, [updateSetting, addToast]);

  const handleValidate = useCallback(() => {
    const editor = editorRef.current;
    if (!editor || !monacoRef.current) return;
    const model = editor.getModel();
    if (!model || model.isDisposed()) return;

    const currentSettings = settingsRef.current || {};

    const fileName = activeFileRef.current?.name || "";
    const isSqlFile = isSqlFileName(fileName);
    if (!isSqlFile) {
      addToast("info", "Validation is only supported for SQL files", null, "Validation Skipped");
      return;
    }

    const isValidationEnabled = currentSettings["editor.sqlValidation.enabled"] ?? true;
    if (!isValidationEnabled) {
      addToast("cancelled", "SQL validation is currently turned OFF. Enable it to see syntax diagnostics.", null, "Validation Disabled");
      return;
    }

    const sql = model.getValue();
    if (!sql.trim()) {
      addToast("ok", "SQL editor is empty", null, "SQL Validation");
      return;
    }

    const isCurrentDoris = isDorisRef?.current ?? isDoris;
    const dialect = isCurrentDoris ? "mysql" : (currentSettings["editor.sqlValidation.dialect"] || "spark");
    const result = validateSql(sql, dialect);

    if (result.isValid || result.errors.length === 0) {
      monacoRef.current.editor.setModelMarkers(model, "sql-validator", []);
      lastSyntaxErrorsRef.current = [];
      onSyntaxErrorsChangeRef.current?.([]);
      addToast("ok", `SQL syntax is valid (${dialect.toUpperCase()})`, null, "SQL Validation");
    } else {
      const markers = result.errors.map((err) => ({
        startLineNumber: Math.max(1, err.startLine),
        startColumn: Math.max(1, err.startCol),
        endLineNumber: Math.max(1, err.endLine),
        endColumn: Math.max(err.startCol + 1, err.endCol),
        message: err.message,
        severity: monacoRef.current.MarkerSeverity.Error,
      }));
      monacoRef.current.editor.setModelMarkers(model, "sql-validator", markers);
      lastSyntaxErrorsRef.current = result.errors;
      onSyntaxErrorsChangeRef.current?.(result.errors);

      const first = result.errors[0];
      editor.revealLineInCenter(first.startLine);
      editor.setPosition({ lineNumber: first.startLine, column: first.startCol });
      editor.focus();
      addToast(
        "error",
        `Line ${first.startLine}: ${first.message || "Syntax error"}`,
        null,
        `SQL Validation (${result.errors.length} error${result.errors.length === 1 ? "" : "s"})`
      );
    }
  }, [addToast]);

  // Re-run or clear validation when settings or active compute change
  useEffect(() => {
    if (editorRef.current) {
      const currentModel = editorRef.current.getModel();
      if (currentModel) {
        scheduleSqlValidation(currentModel, true);
      }
    }
  }, [settings["editor.sqlValidation.enabled"], settings["editor.sqlValidation.dialect"], isDoris, scheduleSqlValidation]);

  // Clean up debounce timer on unmount
  useEffect(() => {
    return () => {
      if (validateDebounceTimerRef.current) {
        clearTimeout(validateDebounceTimerRef.current);
      }
    };
  }, []);

  // Reset tab title when window regains focus
  useEffect(() => {
    const resetTitle = () => { document.title = ORIGINAL_TITLE; };
    window.addEventListener("focus", resetTitle);
    return () => window.removeEventListener("focus", resetTitle);
  }, []);

  const isMarkdownFile =
    activeFile?.name?.toLowerCase().endsWith(".md") ||
    activeFile?.name?.toLowerCase().endsWith(".markdown");

  const canRun =
    !isMarkdownFile &&
    !running &&
    (isDoris
      ? isServerReachable !== false
      : sessionState === SESSION_STATES.IDLE &&
        sessionId !== null &&
        (isServerReachable === true || (isOnline && isServerReachable === null)));

  // Trigger Monaco layout recalculation on markdown view mode changes and initial sync
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.layout();

      if (markdownViewMode === "split" && isMarkdownFile) {
        setTimeout(() => {
          const editor = editorRef.current;
          const previewEl = previewContainerRef.current;
          if (!editor || !previewEl) return;

          const editorScrollHeight = editor.getScrollHeight();
          const editorClientHeight = editor.getLayoutInfo()?.height || 0;
          const maxEditorScroll = editorScrollHeight - editorClientHeight;

          const previewScrollHeight = previewEl.scrollHeight;
          const previewClientHeight = previewEl.clientHeight;
          const maxPreviewScroll = previewScrollHeight - previewClientHeight;

          if (maxEditorScroll > 0 && maxPreviewScroll > 0) {
            const ratio = Math.max(0, Math.min(1, editor.getScrollTop() / maxEditorScroll));
            previewEl.scrollTop = ratio * maxPreviewScroll;
          }
        }, 50);
      }
    }
  }, [markdownViewMode, isMarkdownFile]);

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

    const sqlProviders = registerSqlProviders(monacoInstance, schemaDataRef, isDorisRef);
    const markdownProviders = registerMarkdownProviders(monacoInstance);

    return () => {
      sqlProviders.forEach((p) => p.dispose());
      markdownProviders.forEach((p) => p.dispose());
    };
  }, [monacoInstance]);

  const updateDecorations = useCallback((editor) => {
    if (!editor) return;
    const isMd = activeFileRef.current?.name?.toLowerCase().endsWith(".md");
    if (isMd) {
      decorationsRef.current = editor.deltaDecorations(decorationsRef.current, []);
      statementsRef.current = [];
      return;
    }
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

  const handleBeforeMount = useCallback((monacoInstance) => {
    if (sqlLanguage) {
      try {
        monacoInstance.languages.setMonarchTokensProvider("sql", sqlLanguage);
      } catch (err) {
        console.warn("[SqlEditor] Failed to set monarch tokens provider:", err);
      }
    }
  }, []);

  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    setMonacoInstance(monaco);

    // Initialize model for active file
    if (activeFileRef.current) {
      let model = modelsRef.current.get(activeFileRef.current.id);
      if (!model) {
        const closedItem = closedModelsRef.current.get(activeFileRef.current.id);
        if (closedItem) {
          model = closedItem.model;
          closedModelsRef.current.delete(activeFileRef.current.id);
          modelsRef.current.set(activeFileRef.current.id, model);
        }
      }
      const targetLang = getLanguageForFile(activeFileRef.current.name);
      if (!model) {
        model = monaco.editor.createModel(
          activeFileRef.current.content,
          targetLang,
          monaco.Uri.parse(`inmemory://model-${activeFileRef.current.id}.${targetLang === "markdown" ? "md" : targetLang}`)
        );
        model.onDidChangeContent(() => {
          if (isApplyingExternalUpdateRef.current) return;
          const val = model.getValue();
          if (activeFileRef.current && val === activeFileRef.current.content) return;
          handleChangeRef.current?.(val);
          scheduleSqlValidationRef.current?.(model, false);
        });
        modelsRef.current.set(activeFileRef.current.id, model);
      } else {
        if (model.getLanguageId() !== targetLang) {
          monaco.editor.setModelLanguage(model, targetLang);
        }
      }
      editor.setModel(model);
      prevActiveFileIdRef.current = activeFileRef.current.id;
      if (targetLang === "sql") {
        scheduleSqlValidationRef.current?.(model, true);
      } else {
        monaco.editor.setModelMarkers(model, "sql-validator", []);
        lastSyntaxErrorsRef.current = [];
        onSyntaxErrorsChangeRef.current?.([]);
      }
    }

    updateDecorations(editor);

    // Register native Emmet abbreviation expansion action (Cmd+E / Ctrl+E)
    editor.addAction({
      id: "emmet.expandAbbreviation",
      label: "Emmet: Expand Abbreviation",
      keybindings: [
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyE,
      ],
      precondition: "!editorReadonly",
      run: (ed) => {
        expandEmmetAtCursor(ed, monaco);
      },
    });

    // Native Emmet Tab expansion (matches VS Code emmet.triggerExpansionOnTab)
    editor.addCommand(
      monaco.KeyCode.Tab,
      () => {
        // 1. If text is selected (range selection), do standard indent
        const selection = editor.getSelection();
        if (selection && !selection.isEmpty()) {
          editor.trigger("keyboard", "editor.action.indentLines");
          return;
        }

        // 2. If editing a markdown / html file, attempt Emmet expansion on Tab
        const activeName = activeFileRef.current?.name?.toLowerCase() || "";
        const isEmmetFile =
          activeName.endsWith(".md") ||
          activeName.endsWith(".markdown") ||
          activeName.endsWith(".html") ||
          activeName.endsWith(".htm");

        if (isEmmetFile) {
          const expanded = expandEmmetAtCursor(editor, monaco);
          if (expanded) return;
        }

        // 3. Otherwise, perform standard tab indentation
        editor.trigger("keyboard", "tab");
      },
      "!suggestWidgetVisible && !inSnippetMode"
    );

    // Restore view state if it exists
    if (activeFileRef.current?.id) {
      const savedState = viewStatesRef.current[activeFileRef.current.id];
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

    // Track scroll changes to save view state and sync to Markdown preview
    editor.onDidScrollChange((e) => {
      const currentId = activeFileRef.current?.id;
      if (currentId && editorRef.current) {
        const state = editorRef.current.saveViewState();
        if (state) {
          viewStatesRef.current[currentId] = state;
        }
      }

      // Synchronize scroll to Markdown preview in split view mode
      if (e.scrollTopChanged && !isSyncingFromPreviewRef.current) {
        const isMd =
          activeFileRef.current?.name?.toLowerCase().endsWith(".md") ||
          activeFileRef.current?.name?.toLowerCase().endsWith(".markdown");

        if (isMd && markdownViewModeRef.current === "split") {
          const previewEl = previewContainerRef.current;
          if (previewEl) {
            const editorScrollHeight = editor.getScrollHeight();
            const editorClientHeight = editor.getLayoutInfo()?.height || 0;
            const maxEditorScroll = editorScrollHeight - editorClientHeight;

            const previewScrollHeight = previewEl.scrollHeight;
            const previewClientHeight = previewEl.clientHeight;
            const maxPreviewScroll = previewScrollHeight - previewClientHeight;

            if (maxEditorScroll > 0 && maxPreviewScroll > 0) {
              const ratio = Math.max(0, Math.min(1, editor.getScrollTop() / maxEditorScroll));
              isSyncingFromEditorRef.current = true;
              previewEl.scrollTop = ratio * maxPreviewScroll;

              clearTimeout(syncEditorTimerRef.current);
              syncEditorTimerRef.current = setTimeout(() => {
                isSyncingFromEditorRef.current = false;
              }, 60);
            }
          }
        }
      }
    });

    // Track cursor position
    editor.onDidChangeCursorPosition((e) => {
      if (onCursorPositionChange) {
        onCursorPositionChange({ lineNumber: e.position.lineNumber, column: e.position.column });
      }
      const currentId = activeFileRef.current?.id;
      if (currentId && editorRef.current) {
        const state = editorRef.current.saveViewState();
        if (state) {
          viewStatesRef.current[currentId] = state;
        }
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
      contextMenuGroupId: "1_sql",
      contextMenuOrder: 0.5,
      run: () => {
        handleRunSqlRef.current?.();
      },
    });

    editor.addAction({
      id: "format-sql",
      label: "Format SQL",
      keybindings: [
        monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF,
        monaco.KeyMod.Alt | monaco.KeyMod.Shift | monaco.KeyCode.KeyF,
      ],
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

    // Toggle SQL Validation action in right click menu
    editor.addAction({
      id: "toggle-sql-validation",
      label: "Toggle SQL Validation",
      keybindings: [monaco.KeyMod.Alt | monaco.KeyMod.Shift | monaco.KeyCode.KeyV],
      contextMenuGroupId: "1_sql",
      contextMenuOrder: 3,
      run: () => {
        toggleSqlValidationRef.current?.();
      },
    });

    // Word wrap toggle action (changed to Alt+Z / ⌥+Z for VS Code consistency)
    editor.addAction({
      id: "toggle-word-wrap",
      label: "Toggle Word Wrap",
      keybindings: [monaco.KeyMod.Alt | monaco.KeyCode.KeyZ],
      contextMenuGroupId: "1_sql",
      contextMenuOrder: 4,
      run: () => {
        toggleWordWrapRef.current?.();
      },
    });

    // Auto-Save toggle action
    editor.addAction({
      id: "toggle-auto-save",
      label: "Toggle Auto-Save",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyA],
      contextMenuGroupId: "1_sql",
      contextMenuOrder: 5,
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
        onFocusSchemaSearchRef.current?.();
      },
    });

    // Focus File Explorer Search
    editor.addAction({
      id: "focus-file-search-action",
      label: "Focus File Explorer",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyE],
      run: () => {
        onFocusFileSearchRef.current?.();
      },
    });

    // Toggle Command Palette
    editor.addAction({
      id: "toggle-command-palette-action",
      label: "Toggle Command Palette",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyP],
      run: () => {
        onToggleCommandPaletteRef.current?.();
      },
    });

    // Toggle Sidebar
    editor.addAction({
      id: "toggle-sidebar-action",
      label: "Toggle Sidebar",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyB],
      run: () => {
        onToggleSidebarRef.current?.();
      },
    });

    // Toggle Result Panel
    editor.addAction({
      id: "toggle-result-panel-action",
      label: "Toggle Result Panel",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Backquote],
      run: () => {
        onToggleResultPanelRef.current?.();
      },
    });

    // New Tab (Ctrl+Alt+N / Cmd+Option+N)
    editor.addAction({
      id: "new-tab-action",
      label: "New Tab",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt | monaco.KeyCode.KeyN],
      run: () => {
        onNewTabRef.current?.();
      },
    });

    // Close Tab (Ctrl+Alt+W / Cmd+Option+W)
    editor.addAction({
      id: "close-tab-action",
      label: "Close Tab",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt | monaco.KeyCode.KeyW],
      run: () => {
        onCloseTabRef.current?.();
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
        onRestoreTabRef.current?.();
      },
    });

    // Previous Tab
    editor.addAction({
      id: "prev-tab-action-pgup",
      label: "Previous Tab",
      keybindings: [
        monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt | monaco.KeyCode.LeftArrow,
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.PageUp,
        monaco.KeyMod.WinCtrl | monaco.KeyMod.Shift | monaco.KeyCode.Tab,
        monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.BracketLeft,
        monaco.KeyMod.Alt | monaco.KeyCode.BracketLeft,
        monaco.KeyMod.Alt | monaco.KeyCode.PageUp
      ],
      run: () => {
        onPrevTabRef.current?.();
      },
    });

    // Next Tab
    editor.addAction({
      id: "next-tab-action-pgdn",
      label: "Next Tab",
      keybindings: [
        monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt | monaco.KeyCode.RightArrow,
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.PageDown,
        monaco.KeyMod.WinCtrl | monaco.KeyCode.Tab,
        monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.BracketRight,
        monaco.KeyMod.Alt | monaco.KeyCode.BracketRight,
        monaco.KeyMod.Alt | monaco.KeyCode.PageDown
      ],
      run: () => {
        onNextTabRef.current?.();
      },
    });

    // Direct numerical tab switches Alt+1 to Alt+9
    for (let i = 1; i <= 9; i++) {
      editor.addAction({
        id: `switch-tab-${i}`,
        label: `Switch to Tab ${i}`,
        keybindings: [monaco.KeyMod.Alt | (monaco.KeyCode.KEY_1 + (i - 1))],
        run: () => {
          onSwitchToTabRef.current?.(i - 1);
        },
      });
    }

    // Toggle Query History
    editor.addAction({
      id: "toggle-query-history-action",
      label: "Toggle Query History",
      keybindings: [monaco.KeyMod.WinCtrl | monaco.KeyCode.KeyH],
      run: () => {
        onToggleQueryHistoryRef.current?.();
      },
    });

    // Toggle Keyboard Shortcuts
    editor.addAction({
      id: "toggle-shortcuts-action",
      label: "Toggle Keyboard Shortcuts",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Slash],
      run: () => {
        onToggleShortcutsRef.current?.();
      },
    });

    // Manage Livy Hosts Modal
    editor.addAction({
      id: "toggle-connection-modal-action",
      label: "Manage Livy Hosts",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Period],
      run: () => {
        onToggleConnectionModalRef.current?.();
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
      if (activeFileRef.current) {
        if (value === activeFileRef.current.content) return;
        updateContent(activeFileRef.current.id, value || "");
      }
    },
    [updateContent]
  );

  useEffect(() => {
    handleChangeRef.current = handleChange;
  }, [handleChange]);

  // Tab Switch Effect
  useEffect(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco || !activeFile) return;

    // Save previous active file's view state
    if (prevActiveFileIdRef.current && prevActiveFileIdRef.current !== activeFile.id) {
      const currentModel = editor.getModel();
      if (currentModel) {
        viewStatesRef.current[prevActiveFileIdRef.current] = editor.saveViewState();
      }
    }
    prevActiveFileIdRef.current = activeFile.id;

    // Get or create model
    let newModel = modelsRef.current.get(activeFile.id);
    if (!newModel) {
      const closedItem = closedModelsRef.current.get(activeFile.id);
      if (closedItem) {
        newModel = closedItem.model;
        closedModelsRef.current.delete(activeFile.id);
        modelsRef.current.set(activeFile.id, newModel);
      }
    }

    const targetLang = getLanguageForFile(activeFile.name);

    if (!newModel) {
      newModel = monaco.editor.createModel(
        activeFile.content,
        targetLang,
        monaco.Uri.parse(`inmemory://model-${activeFile.id}.${targetLang === "markdown" ? "md" : targetLang}`)
      );
      newModel.onDidChangeContent(() => {
        if (isApplyingExternalUpdateRef.current) return;
        const val = newModel.getValue();
        if (activeFileRef.current && val === activeFileRef.current.content) return;
        handleChangeRef.current?.(val);
        scheduleSqlValidationRef.current?.(newModel, false);
      });
      modelsRef.current.set(activeFile.id, newModel);
    } else {
      if (newModel.getLanguageId() !== targetLang) {
        monaco.editor.setModelLanguage(newModel, targetLang);
      }
    }

    // Synchronize content if changed externally (e.g. initial load, external reload)
    if (newModel.getValue() !== activeFile.content) {
      isApplyingExternalUpdateRef.current = true;
      newModel.setValue(activeFile.content);
      isApplyingExternalUpdateRef.current = false;
    }

    // Set model and restore view state
    editor.setModel(newModel);

    const savedState = viewStatesRef.current[activeFile.id];
    if (savedState) {
      editor.restoreViewState(savedState);
    } else {
      editor.setPosition({ lineNumber: 1, column: 1 });
    }

    if (targetLang === "sql") {
      scheduleSqlValidationRef.current?.(newModel, true);
    } else {
      monaco.editor.setModelMarkers(newModel, "sql-validator", []);
      lastSyntaxErrorsRef.current = [];
      onSyntaxErrorsChangeRef.current?.([]);
    }
    updateDecorations(editor);
    editor.focus();
  }, [activeFile?.id, activeFile?.name, updateDecorations]);

  // Sync Monaco language mode if active file is renamed or toggled
  useEffect(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco || !activeFile) return;

    const currentModel = editor.getModel();
    if (!currentModel || currentModel.isDisposed()) return;

    const targetLang = getLanguageForFile(activeFile.name);
    if (currentModel.getLanguageId() !== targetLang) {
      monaco.editor.setModelLanguage(currentModel, targetLang);
      if (targetLang !== "sql") {
        monaco.editor.setModelMarkers(currentModel, "sql-validator", []);
        lastSyntaxErrorsRef.current = [];
        onSyntaxErrorsChangeRef.current?.([]);
      }
      updateDecorations(editor);
    }
  }, [activeFile?.name, updateDecorations]);

  // External Content Syncer Effect (Active Model)
  useEffect(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco || !activeFile) return;

    const currentModel = editor.getModel();
    if (currentModel && currentModel.getValue() !== activeFile.content) {
      isApplyingExternalUpdateRef.current = true;
      const viewState = editor.saveViewState();
      currentModel.setValue(activeFile.content);
      if (viewState) {
        editor.restoreViewState(viewState);
      }
      isApplyingExternalUpdateRef.current = false;
    }
  }, [activeFile?.content]);

  // Synchronize non-active open models in background when files change externally
  useEffect(() => {
    if (!files) return;
    for (const f of files) {
      if (f.id === activeFile?.id) continue;
      const model = modelsRef.current.get(f.id);
      if (model && model.getValue() !== f.content) {
        isApplyingExternalUpdateRef.current = true;
        model.setValue(f.content);
        isApplyingExternalUpdateRef.current = false;
      }
    }
  }, [files, activeFile?.id]);

  // Closed Tabs Tracker & Retention Cleaner Effect
  useEffect(() => {
    if (!openFiles) return;
    const openSet = new Set(openFiles);

    // Track newly closed files
    for (const [id, model] of modelsRef.current.entries()) {
      if (!openSet.has(id)) {
        if (!closedModelsRef.current.has(id)) {
          closedModelsRef.current.set(id, {
            model,
            closedAt: Date.now()
          });
        }
        modelsRef.current.delete(id);
      }
    }

    // Pruning expired closed models (1 hour retention)
    const now = Date.now();
    for (const [id, item] of closedModelsRef.current.entries()) {
      if (now - item.closedAt > 3600000) {
        item.model.dispose();
        closedModelsRef.current.delete(id);
      }
    }
  }, [openFiles]);

  // Component Unmount Cleanup Effect
  useEffect(() => {
    return () => {
      // Clean up all models to prevent memory leaks
      for (const model of modelsRef.current.values()) {
        model.dispose();
      }
      for (const item of closedModelsRef.current.values()) {
        item.model.dispose();
      }
    };
  }, []);

  const formatRange = (startLine, endLine) => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;
    const model = editor.getModel();
    const range = new monaco.Range(startLine, 1, endLine, model.getLineMaxColumn(endLine));
    const text = model.getValueInRange(range);
    try {
      const parts = splitSqlStatements(text);
      const dialectLang = isDoris ? "mysql" : "spark";
      const formattedParts = parts.map((part) => {
        const trimmed = part.trim();
        if (!trimmed) return "";
        const withoutComments = stripComments(trimmed).trim();
        if (!withoutComments) return trimmed;
        return formatSqlStatement(trimmed, 2, dialectLang);
      });
      const formatted = formattedParts.filter(p => p !== "").join(";\n\n") + (text.trim().endsWith(";") ? ";" : "");
      editor.executeEdits("format-sql", [{ range, text: formatted }]);
      editor.pushUndoStop();
      if (!(settingsRef.current?.["editor.sqlValidation.enabled"] ?? true)) {
        monaco.editor.setModelMarkers(model, "sql-validator", []);
      }
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
          return minifySqlStatement(trimmed);
        })
        .filter(Boolean);
      const minified = minifiedParts.join(";\n\n") + (text.trim().endsWith(";") ? ";" : "");
      editor.executeEdits("minify-sql", [{ range, text: minified }]);
      editor.pushUndoStop();
      if (!(settingsRef.current?.["editor.sqlValidation.enabled"] ?? true)) {
        monaco.editor.setModelMarkers(model, "sql-validator", []);
      }
    } catch { /* ignore */ }
  };

  const handleFormat = () => {
    if (isMarkdownFile) return;
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;
    const value = editor.getValue();
    try {
      const parts = splitSqlStatements(value);
      const dialectLang = isDoris ? "mysql" : "spark";
      const formattedParts = parts.map((part) => {
        const trimmed = part.trim();
        if (!trimmed) return "";
        const withoutComments = stripComments(trimmed).trim();
        if (!withoutComments) return trimmed;
        return formatSqlStatement(trimmed, 2, dialectLang);
      });
      const formatted = formattedParts.filter(p => p !== "").join(";\n\n") + (value.trim().endsWith(";") ? ";" : "");
      const fullRange = editor.getModel().getFullModelRange();
      editor.executeEdits("format-sql", [{ range: fullRange, text: formatted }]);
      editor.pushUndoStop();
      if (!(settingsRef.current?.["editor.sqlValidation.enabled"] ?? true)) {
        monaco.editor.setModelMarkers(editor.getModel(), "sql-validator", []);
      }
    } catch {
      // formatting failed, ignore
    }
  };

  const handleMinify = () => {
    if (isMarkdownFile) return;
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
          return minifySqlStatement(trimmed);
        })
        .filter(Boolean);
      const minified = minifiedParts.join(";\n\n") + (value.trim().endsWith(";") ? ";" : "");
      const fullRange = editor.getModel().getFullModelRange();
      editor.executeEdits("minify-sql", [{ range: fullRange, text: minified }]);
      editor.pushUndoStop();
      if (!(settingsRef.current?.["editor.sqlValidation.enabled"] ?? true)) {
        monaco.editor.setModelMarkers(editor.getModel(), "sql-validator", []);
      }
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

    const fileName = activeFileRef.current?.name || "";
    const isSqlFile = isSqlFileName(fileName);
    if (!isSqlFile) {
      addToast("info", "Cannot execute non-SQL file as a SQL query", null, "SQL Execution");
      return;
    }

    let sql = "";
    let finalStartLine = startLine;
    let finalEndLine = endLine;

    if (sqlOverride) {
      sql = sqlOverride.trim();
    } else {
      const editor = editorRef.current;
      if (editor) {
        const selection = editor.getSelection();
        if (selection && !selection.isEmpty()) {
          sql = editor.getModel().getValueInRange(selection).trim();
        } else {
          const position = editor.getPosition();
          if (position) {
            const line = position.lineNumber;
            const stmt = statementsRef.current.find(
              (s) => line >= s.startLine && line <= s.endLine
            );
            if (stmt && stmt.sql) {
              sql = stmt.sql.trim();
              finalStartLine = stmt.startLine;
              finalEndLine = stmt.endLine;
            }
          }
        }
      }
      if (!sql) {
        sql = getSelectedOrAll().trim();
      }
    }

    if (!sql) return;

    // Check for secret bounce game activation
    const cleanSql = sql.trim().toLowerCase().replace(/;$/, "");
    if (
      cleanSql === "bounce" ||
      cleanSql === "/bounce" ||
      cleanSql === "play bounce" ||
      cleanSql === "select 'bounce'"
    ) {
      onTriggerBounceRef.current?.();
      return;
    }

    // Check for secret snake game activation
    if (
      cleanSql === "snake" ||
      cleanSql === "/snake" ||
      cleanSql === "play snake" ||
      cleanSql === "select 'snake'"
    ) {
      onTriggerSnakeRef.current?.();
      return;
    }

    setRunning(true);
    abortRef.current = false;
    const startTime = performance.now();
    let finalStatus = null;
    let finalError = null;
    const executionId = activeResultId || uuidv4();
    setResult(activeFile.id, { status: "running", data: null, error: null, elapsed: null, startTime, sql }, executionId);

    if (finalStartLine && finalEndLine) {
      setRunningHighlight(finalStartLine, finalEndLine);
    }

    if (isDoris) {
      const controller = new AbortController();
      dorisAbortRef.current = controller;
      try {
        const res = await executeDorisQuery({
          url: activeHost?.url || "http://localhost:8030",
          cluster: activeHost?.cluster || "default_cluster",
          database: activeHost?.database || "",
          username: activeHost?.username || "root",
          password: activeHost?.password || "",
          sql,
          signal: controller.signal,
        });

        finalStatus = "ok";
        setResult(
          activeFile.id,
          {
            status: "ok",
            data: res.data,
            error: null,
            elapsed: res.elapsed || (performance.now() - startTime),
            sql,
          },
          executionId
        );

        // Trigger schema refresh if this was a DDL operation
        if (isDDLOperation(sql)) {
          schemaContext.refreshSchema();
        }
      } catch (err) {
        if (err.name === "AbortError" || abortRef.current) {
          finalStatus = "cancelled";
          setResult(
            activeFile.id,
            {
              status: "cancelled",
              data: null,
              error: "Query cancelled",
              elapsed: performance.now() - startTime,
              sql,
            },
            executionId
          );
        } else {
          finalStatus = "error";
          finalError = err.message || "Doris query execution failed";
          setResult(
            activeFile.id,
            {
              status: "error",
              data: null,
              error: finalError,
              elapsed: performance.now() - startTime,
              sql,
            },
            executionId
          );
        }
      } finally {
        dorisAbortRef.current = null;
        clearRunningHighlight();
        setRunning(false);
        if (finalStatus) {
          addHistoryEntry({
            sql: sql.length > 500 ? sql.substring(0, 500) + "..." : sql,
            status: finalStatus,
            elapsed: performance.now() - startTime,
            fileName: activeFile?.name,
            engine: "doris",
          });
        }
      }
    } else {
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
            engine: "spark",
          });
        }
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
  handleValidateRef.current = handleValidate;
  toggleSqlValidationRef.current = toggleSqlValidation;
  toggleWordWrapRef.current = toggleWordWrap;

  const handleRun = () => handleRunSql();

  const handleCancel = () => {
    abortRef.current = true;
    if (dorisAbortRef.current) {
      dorisAbortRef.current.abort();
      dorisAbortRef.current = null;
    }
  };

  useImperativeHandle(ref, () => ({
    run: handleRun,
    cancel: handleCancel,
    runSql: (sql) => handleRunSql(sql),
    format: handleFormat,
    isRunning: () => running,
    canRun: () => canRun,
    minify: handleMinify,
    validate: handleValidate,
    toggleSqlValidation,
    isSqlValidationEnabled: () => settings["editor.sqlValidation.enabled"] ?? true,
    toggleWordWrap,
    isWordWrap: () => wordWrap,
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
    triggerCommandPalette: () => {
      const editor = editorRef.current;
      if (!editor) return;
      editor.focus();
      editor.trigger('keyboard', 'editor.action.quickCommand');
    },
    triggerEmmet: () => {
      expandEmmetAtCursor(editorRef.current, monacoRef.current);
    },
    jumpToFirstSyntaxError: () => {
      const editor = editorRef.current;
      if (!editor || lastSyntaxErrorsRef.current.length === 0) return;
      const first = lastSyntaxErrorsRef.current[0];
      editor.revealLineInCenter(first.startLine);
      editor.setPosition({ lineNumber: first.startLine, column: first.startCol });
      editor.focus();
    },
    getSyntaxErrors: () => lastSyntaxErrorsRef.current,
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

  // Monaco view state is saved continuously via editor event listeners to avoid unmount/disposal races

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Editor & Preview Workspace Area */}
      <div className="flex-1 min-h-0 relative flex">
        {/* Monaco Editor Container */}
        <div
          className={`h-full relative min-h-0 ${
            !isMarkdownFile
              ? "w-full"
              : markdownViewMode === "edit"
              ? "w-full"
              : markdownViewMode === "split"
              ? "w-1/2 border-r border-(--color-border)"
              : "hidden"
          }`}
        >
          {/* Glyph popup menu (SQL only) */}
          {glyphPopup && !isMarkdownFile && (
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
            height="100%"
            defaultLanguage={getLanguageForFile(activeFile?.name)}
            theme={theme === "light" ? "light" : VSCODE_DARK_CUSTOM}
            beforeMount={handleBeforeMount}
            onMount={handleEditorMount}
            options={{
              fontSize: settings["editor.fontSize"] || 14,
              fontFamily: settings["editor.fontFamily"] || "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
              glyphMargin: !isMarkdownFile,
              glyphMarginWidth: isMarkdownFile ? 0 : 16,
              lineNumbersMinChars: 2,
              minimap: {
                enabled: settings["editor.minimap.enabled"] ?? true,
                side: "right",
                showSlider: "mouseover",
                renderCharacters: true,
                maxColumn: 120,
              },
              lineNumbers: settings["editor.lineNumbers"] || "on",
              scrollBeyondLastLine: false,
              wordWrap: isMarkdownFile ? "on" : (wordWrap ? "on" : "off"),
              automaticLayout: true,
              tabSize: settings["editor.tabSize"] || 2,
              cursorBlinking: settings["editor.cursorBlinking"] || "smooth",
              renderWhitespace: settings["editor.renderWhitespace"] || "selection",
              suggestOnTriggerCharacters: true,
              acceptSuggestionOnEnter: settings["editor.acceptSuggestionOnEnter"] || "smart",
              tabCompletion: "on",
              quickSuggestions: { other: true, comments: true, strings: true },
              wordBasedSuggestions: "currentDocument",
              suggest: {
                showKeywords: true,
                showFunctions: true,
                showSnippets: true,
                showClasses: true,
                showModules: true,
                showFields: true,
                showWords: true,
              },
              padding: { top: 8 },
              renderLineHighlight: "all",
              bracketPairColorization: { enabled: true },
              guides: { bracketPairs: true },
            }}
          />
        </div>

        {/* Markdown Preview Container */}
        {isMarkdownFile && (markdownViewMode === "split" || markdownViewMode === "preview") && (
          <div
            className={`h-full min-h-0 overflow-hidden bg-(--color-bg-primary) ${
              markdownViewMode === "split" ? "w-1/2" : "w-full"
            }`}
          >
            <MarkdownPreview
              content={activeFile?.content || ""}
              theme={theme}
              scrollRef={previewContainerRef}
              onScroll={handlePreviewScroll}
            />
          </div>
        )}
      </div>
    </div>
  );
});

export default SqlEditor;
