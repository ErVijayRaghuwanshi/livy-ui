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
      description: "Creates a new SQL tab in the editor or updates the active tab.",
      parameters: {
        type: "object",
        properties: {
          fileName: {
            type: "string",
            description: "Suggested file name (e.g. 'DailyRevenue.sql')",
          },
          sql: {
            type: "string",
            description: "The complete, syntactically valid SQL code.",
          },
          mode: {
            type: "string",
            enum: ["new_tab", "replace_current"],
            description: "Whether to open a new tab or replace current active tab.",
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
      name: "write_sql_file",
      description: "Creates a new editor tab or updates current active tab with SQL.",
      parameters: {
        type: "object",
        properties: {
          fileName: { type: "string" },
          sql: { type: "string" },
          mode: { type: "string", enum: ["new_tab", "replace_current"] },
        },
        required: ["sql"],
      },
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
      const targetDb = (args.database || "").trim() || (isDoris ? "demo_db" : "default");
      const targetTable = (args.table || "").trim();
      if (!targetTable) throw new Error("Missing 'table' argument.");

      if (isDoris) {
        try {
          const cols = await dorisApi.getDorisColumns(targetDb, targetTable, activeHost);
          return {
            ok: true,
            engine: "Apache Doris",
            database: targetDb,
            table: targetTable,
            columns: (cols || []).map((c) => ({
              name: c.name,
              type: c.type,
              key: c.key || "",
            })),
          };
        } catch (err) {
          return { ok: false, error: err.message };
        }
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

    case "write_sql_file": {
      const { fileName, sql, mode = "new_tab" } = args;
      if (!sql) throw new Error("Missing 'sql' argument.");
      const resolvedName = fileName || `Query_${Date.now().toString().slice(-4)}.sql`;

      if (mode === "replace_current" && sqlFiles?.activeFileId) {
        sqlFiles.updateFileContent?.(sqlFiles.activeFileId, sql);
        return { ok: true, action: "replaced_current_tab", fileName: sqlFiles.activeFile?.name };
      }

      if (typeof sqlFiles?.createFile === "function") {
        const newFile = sqlFiles.createFile(resolvedName, sql);
        if (newFile?.id) sqlFiles.setActiveFileId(newFile.id);
        return { ok: true, action: "opened_new_tab", fileName: resolvedName };
      }

      return { ok: true, fileName: resolvedName, action: "prepared" };
    }

    case "open_file": {
      const { fileName } = args;
      const files = sqlFiles?.files || [];
      const query = (fileName || "").toLowerCase().trim();
      const match = files.find(
        (f) => f.name.toLowerCase() === query || f.name.toLowerCase().includes(query)
      );

      if (match) {
        sqlFiles.setActiveFileId(match.id);
        return { ok: true, opened: match.name };
      }
      return { ok: false, error: `File '${fileName}' not found in open tabs.` };
    }

    case "execute_sql": {
      const querySql = (args.sql || sqlFiles?.activeFile?.content || "").trim();
      if (!querySql) throw new Error("No SQL statement provided to execute.");

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
