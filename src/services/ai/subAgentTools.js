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
      description: "Finds and switches to an existing open SQL tab in the editor.",
      parameters: {
        type: "object",
        properties: {
          fileName: {
            type: "string",
            description: "Name of the file to switch to.",
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
            description: "Database name to inspect (e.g. 'demo_db', 'default').",
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
          return {
            ok: true,
            engine: "Apache Doris",
            databases: Array.isArray(dbs) && dbs.length > 0 ? dbs : ["demo_db"],
          };
        } catch {
          const dbs = Array.isArray(schemaContext?.databases) ? schemaContext.databases : ["demo_db"];
          return { ok: true, engine: "Apache Doris", databases: dbs };
        }
      } else {
        try {
          if (sessionId != null) {
            const rows = await livyApi.runSql(sessionId, "SHOW DATABASES");
            const dbNames = rows.map((r) => r.databaseName || r.namespace || Object.values(r)[0]);
            return { ok: true, engine: "Apache Spark", databases: dbNames };
          }
        } catch {}
        const dbs = Array.isArray(schemaContext?.databases) ? schemaContext.databases : ["default"];
        return { ok: true, engine: "Apache Spark", databases: dbs };
      }
    }

    case "search_tables": {
      const targetDb = (args.database || "").trim() || (isDoris ? "demo_db" : "default");
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
      let targetDb = (args.database || "").trim() || activeHost?.database || (isDoris ? "demo_db" : "default");
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
          await sqlFiles.addFile({ name: resolvedName, content: sql });
          return { ok: true, action: "opened_new_tab", fileName: resolvedName };
        }
      }

      // If mode is 'append', append SQL to active tab
      if (mode === "append" && hasActiveSqlFile) {
        const existing = sqlFiles.activeFile?.content || "";
        const combined = existing.trim() ? `${existing}\n\n${sql}` : sql;
        sqlFiles.updateContent?.(sqlFiles.activeTabId, combined);
        return { ok: true, action: "appended_to_current_tab", fileName: sqlFiles.activeFile?.name };
      }

      // Default: replace content in current active tab
      if (hasActiveSqlFile) {
        sqlFiles.updateContent?.(sqlFiles.activeTabId, sql);
        return { ok: true, action: "updated_active_tab", fileName: sqlFiles.activeFile?.name };
      }

      return { ok: false, error: "No active editor tab found." };
    }

    case "open_file": {
      const { fileName } = args;
      const files = sqlFiles?.files || [];
      const query = (fileName || "").toLowerCase().trim();
      const match = files.find(
        (f) => f.name.toLowerCase() === query || f.name.toLowerCase().includes(query)
      );

      if (match) {
        sqlFiles.setActiveTab?.(match.id);
        return { ok: true, opened: match.name };
      }
      return { ok: false, error: `File '${fileName}' not found in open tabs.` };
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
      const querySql = (args.sql || sqlFiles?.activeFile?.content || "").trim();
      if (!querySql) throw new Error("No SQL statement provided to execute.");

      // If editorRef is available, trigger workbench run so user's Result Tab updates live
      if (editorRef?.current?.runSql) {
        editorRef.current.runSql(querySql);
      }

      if (isDoris) {
        const start = performance.now();
        const res = await dorisApi.executeDorisQuery({
          url: activeHost.url,
          cluster: activeHost.cluster || "default_cluster",
          database: activeHost.database || "demo_db",
          username: activeHost.username || "root",
          password: activeHost.password || "",
          sql: querySql,
        });
        const elapsed = (performance.now() - start).toFixed(0);
        const rows = res.data?.["application/json"]?.data || [];
        return {
          ok: true,
          engine: "Apache Doris",
          elapsedMs: elapsed,
          rowCount: rows.length,
          sample: rows.slice(0, 3),
        };
      } else {
        if (sessionId == null) {
          throw new Error("No active Livy Spark session. Please start or attach a session first.");
        }
        const start = performance.now();
        const rows = await livyApi.runSql(sessionId, querySql);
        const elapsed = (performance.now() - start).toFixed(0);
        return {
          ok: true,
          engine: "Apache Spark",
          elapsedMs: elapsed,
          rowCount: rows.length,
          sample: rows.slice(0, 3),
        };
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
