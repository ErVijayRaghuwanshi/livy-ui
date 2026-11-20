/**
 * Declarative Tool Definitions and Client-Side Executors for Sub-Agent Architecture.
 */

import * as dorisApi from "../dorisApi";
import * as livyApi from "../livyApi";

/**
 * Supervisor tool specifications (what the Main Agent can see).
 */
export const SUPERVISOR_TOOLS = [
  {
    type: "function",
    function: {
      name: "run_query",
      description:
        "Executes a SQL query immediately in the workbench and displays the live data grid directly on the user's Result Tab. By default, executes against the user's current active tab without creating new tabs.",
      parameters: {
        type: "object",
        properties: {
          sql: {
            type: "string",
            description: "The complete SQL statement to execute and display on the Result Tab.",
          },
          openInNewTab: {
            type: "boolean",
            description:
              "Set to true ONLY if the user explicitly requested to open in a new tab or new file (e.g. 'open in a new tab', 'create a new tab'). Defaults to false.",
          },
          tabName: {
            type: "string",
            description: "Suggested tab name ONLY if openInNewTab is true (e.g. 'Select_CDR.sql').",
          },
        },
        required: ["sql"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delegate_task",
      description:
        "Delegates a specialized subtask to an isolated subagent with Context Quarantine. The subagent executes in its own isolated context and returns ONLY a concise summary, keeping the main chat lean.",
      parameters: {
        type: "object",
        properties: {
          subagent: {
            type: "string",
            enum: ["schema_analyst", "sql_specialist", "cluster_operator"],
            description:
              "The specialized subagent: 'schema_analyst' (for databases, tables, columns), 'sql_specialist' (for writing/optimizing queries), 'cluster_operator' (for execution & cluster status).",
          },
          task: {
            type: "string",
            description: "Clear, specific prompt or question for the subagent.",
          },
        },
        required: ["subagent", "task"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "write_sql_file",
      description:
        "Writes or updates SQL code in the editor. By default, updates the user's current active tab (mode: 'replace_current'). Only opens a new tab when explicitly requested.",
      parameters: {
        type: "object",
        properties: {
          sql: {
            type: "string",
            description: "The complete, syntactically valid SQL code.",
          },
          mode: {
            type: "string",
            enum: ["replace_current", "append", "new_tab"],
            description:
              "How to write the SQL. Default is 'replace_current' to update the active editor tab. Use 'append' to add to existing code, or 'new_tab' ONLY when the user explicitly asked for a new tab or new file.",
          },
          fileName: {
            type: "string",
            description: "Suggested file name ONLY if mode is 'new_tab' (e.g. 'DailyRevenue.sql').",
          },
        },
        required: ["sql"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "open_file",
      description:
        "Opens an existing SQL file by name into the editor tab bar, or opens a new SQL tab if requested.",
      parameters: {
        type: "object",
        properties: {
          fileName: {
            type: "string",
            description: "Name of the file to open (e.g. 'Useful_CDR_Analytics.sql', 'Untitled-1.sql').",
          },
        },
        required: ["fileName"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "read_active_file",
      description: "Reads the SQL code in the user's active editor tab when asked to explain, debug, format, or optimize their current query.",
      parameters: { type: "object", properties: {} },
    },
  },
];

/**
 * Tools available exclusively to schema_analyst subagent
 */
export const SCHEMA_ANALYST_TOOLS = [
  {
    type: "function",
    function: {
      name: "list_databases",
      description: "Lists all database and schema names in the catalog.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "search_tables",
      description: "Lists table names inside a specific database.",
      parameters: {
        type: "object",
        properties: {
          database: {
            type: "string",
            description: "Database name to inspect (e.g. 'default' or catalog database).",
          },
        },
        required: ["database"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "describe_table",
      description: "Returns column definitions and data types for a specific table.",
      parameters: {
        type: "object",
        properties: {
          database: {
            type: "string",
            description: "Database name containing the table.",
          },
          table: {
            type: "string",
            description: "Table name to inspect.",
          },
        },
        required: ["database", "table"],
      },
    },
  },
];

/**
 * Tools available to sql_specialist subagent
 */
export const SQL_SPECIALIST_TOOLS = [
  {
    type: "function",
    function: {
      name: "describe_table",
      description: "Returns column definitions and data types for a specific table to ensure accurate column references.",
      parameters: {
        type: "object",
        properties: {
          database: { type: "string", description: "Database name containing the table." },
          table: { type: "string", description: "Table name to inspect." },
        },
        required: ["table"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "write_sql_file",
      description: "Writes or updates SQL code in the editor. Defaults to updating the current active tab.",
      parameters: {
        type: "object",
        properties: {
          sql: { type: "string", description: "The complete, syntactically valid SQL code." },
          mode: {
            type: "string",
            enum: ["replace_current", "append", "new_tab"],
            description: "Default is 'replace_current' to update active tab. Use 'new_tab' ONLY if user explicitly asked.",
          },
          fileName: { type: "string", description: "Optional name only if mode is 'new_tab'." },
        },
        required: ["sql"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "read_active_file",
      description: "Reads the SQL code in the user's active editor tab when asked to explain, debug, format, or optimize their current query.",
      parameters: { type: "object", properties: {} },
    },
  },
];

/**
 * Tools available to cluster_operator subagent
 */
export const CLUSTER_OPERATOR_TOOLS = [
  {
    type: "function",
    function: {
      name: "execute_sql",
      description: "Executes a SQL query against the active engine (Doris or Spark) and returns a brief summary.",
      parameters: {
        type: "object",
        properties: {
          sql: { type: "string", description: "The SQL statement to execute." },
        },
        required: ["sql"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_active_sessions",
      description: "Lists all current Apache Livy Spark sessions and their statuses.",
      parameters: { type: "object", properties: {} },
    },
  },
];

/**
 * Executes subagent tool actions directly in the browser environment.
 */
export async function executeSubAgentTool(toolName, args = {}, context = {}) {
  const {
    sqlFiles,
    livyContext,
    schemaContext,
    editorRef,
    activeEngine = "doris",
  } = context;

  const isDoris = livyContext?.isDoris || activeEngine === "doris";
  const activeHost = livyContext?.activeHost || {};
  const sessionId = livyContext?.sessionId;
  const cleanToolName = (toolName || "").replace(/^[^:]+:/, "").trim();

  switch (cleanToolName) {
    case "list_databases": {
      if (isDoris) {
        try {
          const dbs = await dorisApi.getDorisDatabases(activeHost);
          if (Array.isArray(dbs) && dbs.length > 0) {
            return {
              ok: true,
              engine: "Apache Doris",
              databases: dbs,
            };
          }
        } catch {
          // fallback to schemaContext
        }
        const dbs = Array.isArray(schemaContext?.databases)
          ? schemaContext.databases
          : activeHost?.database
          ? [activeHost.database]
          : [];
        return { ok: true, engine: "Apache Doris", databases: dbs };
      } else {
        try {
          if (sessionId != null) {
            const rows = await livyApi.runSql(sessionId, "SHOW DATABASES");
            const dbNames = rows.map((r) => r.databaseName || r.namespace || Object.values(r)[0]);
            return { ok: true, engine: "Apache Spark", databases: dbNames };
          }
        } catch {}
        const dbs = Array.isArray(schemaContext?.databases)
          ? schemaContext.databases
          : activeHost?.database
          ? [activeHost.database]
          : ["default"];
        return { ok: true, engine: "Apache Spark", databases: dbs };
      }
    }

    case "search_tables": {
      const activeDb =
        activeHost?.database ||
        schemaContext?.databases?.[0] ||
        (isDoris ? "" : "default");
      const targetDb = (args.database || "").trim() || activeDb;
      if (isDoris) {
        try {
          const tables = await dorisApi.getDorisTables(targetDb, activeHost);
          return {
            ok: true,
            engine: "Apache Doris",
            database: targetDb,
            tables: (tables || []).map((t) => (typeof t === "string" ? t : t.name || String(t))),
          };
        } catch {
          const tablesMap = schemaContext?.tables || {};
          return { ok: true, engine: "Apache Doris", database: targetDb, tables: tablesMap[targetDb] || [] };
        }
      } else {
        try {
          if (sessionId != null) {
            const rows = await livyApi.runSql(sessionId, `SHOW TABLES IN \`${targetDb}\``);
            const tblNames = rows.map((r) => r.tableName || Object.values(r)[0]);
            return { ok: true, engine: "Apache Spark", database: targetDb, tables: tblNames };
          }
        } catch {}
        const tablesMap = schemaContext?.tables || {};
        return { ok: true, engine: "Apache Spark", database: targetDb, tables: tablesMap[targetDb] || [] };
      }
    }

    case "describe_table": {
      const activeDb =
        activeHost?.database ||
        schemaContext?.databases?.[0] ||
        (isDoris ? "" : "default");
      let targetDb = (args.database || "").trim() || activeDb;
      let targetTable = (args.table || "").replace(/[`"']/g, "").trim();
      if (targetTable.includes(".")) {
        const parts = targetTable.split(".");
        targetDb = parts[0].trim();
        targetTable = parts[1].trim();
      }
      if (!targetTable) throw new Error("Missing 'table' argument.");

      if (isDoris) {
        try {
          const cols = await dorisApi.getDorisColumns(targetDb, targetTable, activeHost);
          if (Array.isArray(cols) && cols.length > 0) {
            return {
              ok: true,
              engine: "Apache Doris",
              database: targetDb,
              table: targetTable,
              columns: cols.map((c) => ({
                name: c.name,
                type: c.type,
                key: c.key || "",
              })),
            };
          }
        } catch (err) {
          console.warn(`[describe_table] dorisApi.getDorisColumns error for ${targetDb}.${targetTable}:`, err);
        }

        // Fallback to schemaContext cache if available
        const colKey = `${targetDb}.${targetTable}`;
        const cachedCols = schemaContext?.columns?.[colKey] || schemaContext?.columns?.[targetTable];
        if (Array.isArray(cachedCols) && cachedCols.length > 0) {
          return {
            ok: true,
            engine: "Apache Doris",
            database: targetDb,
            table: targetTable,
            columns: cachedCols.map((c) => ({
              name: c.name || c.col_name || String(c),
              type: c.type || c.data_type || "varchar",
            })),
          };
        }

        const tablesMap = schemaContext?.tables || {};
        const availableInDb = tablesMap[targetDb] || Object.values(tablesMap)[0] || [];
        const tablesHint = availableInDb.length > 0 ? ` Available tables in '${targetDb}': ${availableInDb.join(", ")}.` : "";
        return { ok: false, error: `Table '${targetTable}' not found in database '${targetDb}'.${tablesHint}` };
      } else {
        try {
          if (sessionId != null) {
            const rows = await livyApi.runSql(sessionId, `DESCRIBE \`${targetDb}\`.\`${targetTable}\``);
            const cols = rows.map((r) => ({
              name: r.col_name || r.name || Object.values(r)[0],
              type: r.data_type || r.type || Object.values(r)[1],
            }));
            return { ok: true, engine: "Apache Spark", database: targetDb, table: targetTable, columns: cols };
          }
        } catch (err) {
          return { ok: false, error: err.message };
        }
        return { ok: false, error: "Spark session not active to describe table." };
      }
    }

    case "run_query": {
      if (context?.agentMode === "ask") {
        return {
          ok: false,
          action: "refused_in_ask_mode",
          error: "Autonomous query execution is disabled in Ask Mode. Output SQL in markdown for user review and manual execution.",
        };
      }
      const { sql, openInNewTab = false, tabName, newTabName } = args;
      if (!sql) throw new Error("Missing 'sql' argument.");

      const hasActiveSqlFile =
        Boolean(sqlFiles?.activeFile) &&
        sqlFiles.activeTabId !== "settings" &&
        !sqlFiles.activeFile.isSpecial;

      // Only open a new tab if explicitly requested (openInNewTab === true) OR if no active SQL tab is open
      const shouldOpenNewTab = openInNewTab === true || !hasActiveSqlFile;

      let targetFileName = sqlFiles?.activeFile?.name;

      if (shouldOpenNewTab) {
        const resolvedName = tabName || newTabName || `Query_${Date.now().toString().slice(-4)}.sql`;
        if (typeof sqlFiles?.addFile === "function") {
          await sqlFiles.addFile({ name: resolvedName, content: sql });
          targetFileName = resolvedName;
          await new Promise((r) => setTimeout(r, 120));
        }
      } else if (hasActiveSqlFile && sqlFiles?.activeTabId) {
        // Reuse current active tab and sync content so editor displays the query being executed
        sqlFiles.updateContent?.(sqlFiles.activeTabId, sql);
      }

      if (editorRef?.current?.runSql) {
        const runRes = await editorRef.current.runSql(sql);
        if (runRes && !runRes.ok) {
          return {
            ok: false,
            action: "execution_failed",
            error: runRes.error || "Query execution failed on cluster.",
            sql,
            fileName: targetFileName,
            suggestion: "Analyze the error message. If it indicates an unknown column or table, describe the table to find the correct columns, then rewrite and rerun the query.",
          };
        }
        return {
          ok: true,
          action: "executed_on_result_tab",
          fileName: targetFileName,
          sql,
          message: `Query executed successfully on '${targetFileName || "active tab"}'. Live results are displayed directly on the Result Tab.`,
        };
      } else {
        return await executeSubAgentTool("execute_sql", { sql }, context);
      }
    }

    case "write_sql_file": {
      if (context?.agentMode === "ask") {
        return {
          ok: false,
          action: "refused_in_ask_mode",
          error: "File editing is disabled in Ask Mode. Switch to Code Mode (⌥M) to allow editing files.",
        };
      }
      const { fileName, sql, mode = "replace_current" } = args;
      if (!sql) throw new Error("Missing 'sql' argument.");

      const hasActiveSqlFile =
        Boolean(sqlFiles?.activeFile) &&
        sqlFiles.activeTabId !== "settings" &&
        !sqlFiles.activeFile.isSpecial;

      // If mode is explicitly 'new_tab' OR there is no active SQL file open, open a new tab
      if (mode === "new_tab" || !hasActiveSqlFile) {
        const resolvedName = fileName || `Query_${Date.now().toString().slice(-4)}.sql`;
        if (typeof sqlFiles?.addFile === "function") {
          const newFile = await sqlFiles.addFile({ name: resolvedName, content: sql });
          const targetId = newFile?.id || (sqlFiles.files || []).find((f) => f.name === resolvedName)?.id || sqlFiles.activeTabId;

          // Stage as a new file diff so the user can Accept or Reject (Discard)
          let diffStats = null;
          if (typeof sqlFiles?.stageDiff === "function" && targetId) {
            diffStats = sqlFiles.stageDiff(targetId, sql, true);
          }

          const addedLines = diffStats?.addedLines ?? sql.split("\n").length;
          return {
            ok: true,
            action: "staged_new_file",
            fileId: targetId,
            fileName: resolvedName,
            hasPendingDiff: true,
            addedLines,
            removedLines: 0,
            hunks: diffStats?.hunks || [],
            message: `Created new tab '${resolvedName}' with proposed code (+${addedLines} lines). Review and Accept or Reject.`,
          };
        }
      }

      // If mode is 'append', stage append diff to active tab
      if (mode === "append" && hasActiveSqlFile) {
        const existing = sqlFiles.activeFile?.content || "";
        const combined = existing.trim() ? `${existing}\n\n${sql}` : sql;

        let diffStats = null;
        if (typeof sqlFiles?.stageDiff === "function") {
          diffStats = sqlFiles.stageDiff(sqlFiles.activeTabId, combined, false);
        } else {
          sqlFiles.updateContent?.(sqlFiles.activeTabId, combined);
        }

        const addedLines = diffStats?.addedLines ?? sql.split("\n").length;
        const removedLines = diffStats?.removedLines ?? 0;
        return {
          ok: true,
          action: "staged_file_edit",
          fileId: sqlFiles.activeTabId,
          fileName: sqlFiles.activeFile?.name,
          hasPendingDiff: true,
          addedLines,
          removedLines,
          hunks: diffStats?.hunks || [],
          message: `Proposed appended changes to '${sqlFiles.activeFile?.name}' (+${addedLines} lines). Review and Accept or Reject.`,
        };
      }

      // Default: stage replacement in current active tab
      if (hasActiveSqlFile) {
        let diffStats = null;
        if (typeof sqlFiles?.stageDiff === "function") {
          diffStats = sqlFiles.stageDiff(sqlFiles.activeTabId, sql, false);
        } else {
          sqlFiles.updateContent?.(sqlFiles.activeTabId, sql);
        }

        const addedLines = diffStats?.addedLines ?? 0;
        const removedLines = diffStats?.removedLines ?? 0;
        return {
          ok: true,
          action: "staged_file_edit",
          fileId: sqlFiles.activeTabId,
          fileName: sqlFiles.activeFile?.name,
          hasPendingDiff: true,
          addedLines,
          removedLines,
          hunks: diffStats?.hunks || [],
          message: `Proposed changes to '${sqlFiles.activeFile?.name}' (+${addedLines} / -${removedLines} lines). Review and Accept or Reject.`,
        };
      }

      return { ok: false, error: "No active editor tab found." };
    }

    case "open_file": {
      if (context?.agentMode === "ask") {
        return {
          ok: false,
          action: "refused_in_ask_mode",
          error: "Opening new files is disabled in Ask Mode. Provide SQL directly in markdown code blocks.",
        };
      }
      const { fileName } = args;
      const files = sqlFiles?.files || [];
      const query = (fileName || "").toLowerCase().trim();

      // 1. Try to match an existing file by name
      let match = null;
      if (query && !["sql file", "sql", "file", "new file", "new sql file"].includes(query)) {
        match = files.find(
          (f) => f.name.toLowerCase() === query || f.name.toLowerCase().includes(query)
        );
      }

      // If user generically asked to open a file and we have existing files, open the last one
      if (!match && files.length > 0 && (!query || ["sql file", "sql", "file"].includes(query))) {
        match = files[files.length - 1];
      }

      if (match) {
        sqlFiles.openFile?.(match.id);
        sqlFiles.setActiveTab?.(match.id);
        return { ok: true, action: "opened_existing_tab", fileName: match.name };
      }

      // 2. If no existing file found or user requested a new/generic SQL file, create and open it
      const resolvedName = fileName && !["sql file", "sql", "file"].includes(query)
        ? (fileName.endsWith(".sql") ? fileName : `${fileName}.sql`)
        : `Untitled-1.sql`;

      if (typeof sqlFiles?.addFile === "function") {
        await sqlFiles.addFile({
          name: resolvedName,
          content: "-- Write your SQL here\nSELECT 1;\n",
        });
        return { ok: true, action: "opened_new_tab", fileName: resolvedName };
      }

      return { ok: false, error: `Could not open or create file '${fileName}'.` };
    }

    case "read_active_file": {
      const active = sqlFiles?.activeFile;
      if (!active) {
        return { ok: false, message: "No active file opened in the editor." };
      }
      const rawContent = active.content || "";
      const isTruncated = rawContent.length > 4000;
      return {
        ok: true,
        fileName: active.name,
        content: isTruncated ? rawContent.slice(0, 4000) : rawContent,
        isTruncated,
        characterCount: rawContent.length,
      };
    }

    case "execute_sql": {
      if (context?.agentMode === "ask") {
        return {
          ok: false,
          action: "refused_in_ask_mode",
          error: "Autonomous SQL execution is disabled in Ask Mode. Provide SQL in markdown.",
        };
      }
      const querySql = (args.sql || sqlFiles?.activeFile?.content || "").trim();
      if (!querySql) throw new Error("No SQL statement provided to execute.");

      // If editorRef is available, trigger workbench run so user's Result Tab updates live
      if (editorRef?.current?.runSql) {
        return await editorRef.current.runSql(querySql);
      }

      const targetFileId = sqlFiles?.activeTabId || "__global__";
      const executionId = `exec_${Date.now()}`;
      const startTime = performance.now();

      sqlFiles?.setResult?.(
        targetFileId,
        {
          status: "running",
          data: null,
          error: null,
          elapsed: null,
          startTime,
          sql: querySql,
        },
        executionId
      );

      if (isDoris) {
        try {
          const res = await dorisApi.executeDorisQuery({
            url: activeHost.url,
            cluster: activeHost.cluster || "default_cluster",
            database: activeHost?.database || schemaContext?.databases?.[0] || "",
            username: activeHost.username || "root",
            password: activeHost.password || "",
            sql: querySql,
          });
          const elapsed = (performance.now() - startTime).toFixed(0);
          const rows = res.data?.["application/json"]?.data || [];

          sqlFiles?.setResult?.(
            targetFileId,
            {
              status: "ok",
              data: res.data,
              error: null,
              elapsed: Number(elapsed),
              sql: querySql,
            },
            executionId
          );

          if (schemaContext?.refreshSchema) {
            schemaContext.refreshSchema();
          }

          return {
            ok: true,
            engine: "Apache Doris",
            elapsedMs: elapsed,
            rowCount: rows.length,
            sample: rows.slice(0, 3),
            message: `Executed successfully (${rows.length} rows, ${elapsed}ms). Live results are displayed on the Result Tab.`,
          };
        } catch (err) {
          const elapsed = (performance.now() - startTime).toFixed(0);
          sqlFiles?.setResult?.(
            targetFileId,
            {
              status: "error",
              data: null,
              error: err.message,
              elapsed: Number(elapsed),
              sql: querySql,
            },
            executionId
          );
          return { ok: false, error: err.message };
        }
      } else {
        if (sessionId == null) {
          const err = new Error("No active Livy Spark session. Please start or attach a session first.");
          sqlFiles?.setResult?.(
            targetFileId,
            {
              status: "error",
              data: null,
              error: err.message,
              elapsed: 0,
              sql: querySql,
            },
            executionId
          );
          throw err;
        }

        try {
          const rows = await livyApi.runSql(sessionId, querySql);
          const elapsed = (performance.now() - startTime).toFixed(0);

          sqlFiles?.setResult?.(
            targetFileId,
            {
              status: "ok",
              data: { "application/json": { data: rows } },
              error: null,
              elapsed: Number(elapsed),
              sql: querySql,
            },
            executionId
          );

          return {
            ok: true,
            engine: "Apache Spark",
            elapsedMs: elapsed,
            rowCount: rows.length,
            sample: rows.slice(0, 3),
            message: `Executed successfully (${rows.length} rows, ${elapsed}ms). Live results are displayed on the Result Tab.`,
          };
        } catch (err) {
          const elapsed = (performance.now() - startTime).toFixed(0);
          sqlFiles?.setResult?.(
            targetFileId,
            {
              status: "error",
              data: null,
              error: err.message,
              elapsed: Number(elapsed),
              sql: querySql,
            },
            executionId
          );
          return { ok: false, error: err.message };
        }
      }
    }

    case "list_active_sessions": {
      try {
        const data = await livyApi.listSessions();
        const sessions = (data.sessions || []).map((s) => ({
          id: s.id,
          state: s.state,
          appId: s.appId,
        }));
        return {
          ok: true,
          total: sessions.length,
          activeSessionId: sessionId,
          sessions,
        };
      } catch (err) {
        return { ok: false, error: err.message };
      }
    }

    default:
      return { ok: false, error: `Unknown tool: ${cleanToolName}` };
  }
}
