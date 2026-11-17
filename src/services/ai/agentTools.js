/**
 * Declarative Tool Definitions and Client-Side Executors for Livy UI AI Agent.
 */

import { listSessions, getSession } from "../livyApi";
import { getDorisDatabases, getDorisTables } from "../dorisApi";

/**
 * OpenAI-compatible tool specifications provided to the model.
 */
export const TOOL_DEFINITIONS = [
  {
    type: "function",
    function: {
      name: "write_sql_file",
      description: "Creates a new SQL file tab or updates the current active editor tab with the generated SQL query.",
      parameters: {
        type: "object",
        properties: {
          fileName: {
            type: "string",
            description: "Suggested file name (e.g. 'DailyRevenue.sql', 'TopUsers.sql')",
          },
          sql: {
            type: "string",
            description: "The complete, syntactically valid SQL code.",
          },
          mode: {
            type: "string",
            enum: ["new_tab", "replace_current", "append"],
            description: "Whether to open a new tab, replace active tab content, or append.",
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
      description: "Finds and opens an existing SQL file by name in the editor tab bar.",
      parameters: {
        type: "object",
        properties: {
          fileName: {
            type: "string",
            description: "Name of the file to open (e.g. 'Untitled-1', 'sales.sql')",
          },
        },
        required: ["fileName"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "execute_sql",
      description: "Executes a SQL query against the currently active engine (Apache Spark SQL via Livy or Apache Doris MPP) and populates the Result Table.",
      parameters: {
        type: "object",
        properties: {
          sql: {
            type: "string",
            description: "The SQL statement to execute. If omitted, executes the SQL in the active editor tab.",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_active_sessions",
      description: "Lists all current Apache Livy Spark sessions and their statuses (idle, starting, busy, dead).",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_schema_info",
      description: "Returns currently loaded databases and tables from the catalog schema explorer.",
      parameters: {
        type: "object",
        properties: {
          database: {
            type: "string",
            description: "Optional database name to filter for.",
          },
        },
      },
    },
  },
];

/**
 * Executes a tool call directly in the browser environment.
 *
 * @param {string} toolName
 * @param {Object} args
 * @param {Object} context - Bridge to workbench state and APIs
 * @returns {Promise<Object>} Result object to feed back into conversation
 */
export async function executeTool(toolName, args = {}, context = {}) {
  const {
    sqlFiles, // from useSqlFiles()
    editorRef, // ref to SqlEditor
    schemaContext, // from useSchema()
    livyContext, // from useLivy()
  } = context;

  const cleanToolName = (toolName || "").replace(/^[^:]+:/, "").trim();

  switch (cleanToolName) {
    case "write_sql_file": {
      const { fileName, sql, mode = "replace_current" } = args;
      if (!sql) throw new Error("Missing 'sql' argument.");

      const hasActiveSqlFile =
        Boolean(sqlFiles?.activeFile) &&
        sqlFiles.activeTabId !== "settings" &&
        !sqlFiles.activeFile.isSpecial;

      if (mode === "append" && hasActiveSqlFile) {
        const existing = sqlFiles.activeFile?.content || "";
        const combined = existing.trim() ? `${existing}\n\n${sql}` : sql;
        sqlFiles.updateContent?.(sqlFiles.activeTabId, combined);
        return {
          ok: true,
          message: `Appended SQL to active tab '${sqlFiles.activeFile?.name || sqlFiles.activeTabId}'.`,
          fileId: sqlFiles.activeTabId,
        };
      }

      if (mode === "replace_current" && hasActiveSqlFile) {
        sqlFiles.updateContent?.(sqlFiles.activeTabId, sql);
        return {
          ok: true,
          message: `Updated content in active tab '${sqlFiles.activeFile?.name || sqlFiles.activeTabId}'.`,
          fileId: sqlFiles.activeTabId,
        };
      }

      const defaultName = fileName || `Query_${new Date().toISOString().slice(11, 19).replace(/:/g, "")}.sql`;
      if (sqlFiles?.addFile) {
        sqlFiles.addFile({
          name: defaultName.endsWith(".sql") ? defaultName : `${defaultName}.sql`,
          content: sql,
        });
        return {
          ok: true,
          message: `Created and opened new tab '${defaultName}'.`,
          fileName: defaultName,
        };
      }

      return { ok: false, error: "SqlFilesContext not available." };
    }

    case "open_file": {
      const { fileName } = args;
      if (!fileName) throw new Error("Missing 'fileName' argument.");

      const target = (sqlFiles?.files || []).find(
        (f) =>
          f.name.toLowerCase() === fileName.toLowerCase() ||
          f.id === fileName
      );

      if (target) {
        sqlFiles.openFile(target.id);
        sqlFiles.setActiveTab(target.id);
        return { ok: true, message: `Opened file '${target.name}'.`, fileId: target.id };
      }

      return {
        ok: false,
        message: `File '${fileName}' not found in current workspace. Available files: ${
          (sqlFiles?.files || []).map((f) => f.name).join(", ") || "none"
        }`,
      };
    }

    case "execute_sql": {
      const { sql } = args;
      const queryToRun = sql || sqlFiles?.activeFile?.content;

      if (!queryToRun || !queryToRun.trim()) {
        return { ok: false, message: "No SQL query provided or active in editor to execute." };
      }

      if (editorRef?.current?.runSql) {
        // Run asynchronously via SqlEditor imperative handle
        editorRef.current.runSql(queryToRun);
        return {
          ok: true,
          message: "Query submitted to active execution engine. Results will populate in the Result Table.",
        };
      }

      return { ok: false, message: "SqlEditor runner is not attached." };
    }

    case "list_active_sessions": {
      try {
        const data = await listSessions();
        const sessions = (data.sessions || []).map((s) => ({
          id: s.id,
          state: s.state,
          kind: s.kind,
          appId: s.appId,
          sparkUiUrl: s.appInfo?.sparkUiUrl,
        }));
        return {
          ok: true,
          total: data.total || sessions.length,
          sessions,
        };
      } catch (err) {
        return { ok: false, error: err.message };
      }
    }

    case "get_schema_info": {
      const { database } = args;
      const isDoris = livyContext?.isDoris || context.activeEngine === "doris";

      // 1. Try querying active Doris FE directly if in Doris mode
      if (isDoris) {
        try {
          const hostConfig = livyContext?.activeHost || {};
          let dbs = await getDorisDatabases(hostConfig);
          if (!Array.isArray(dbs) || dbs.length === 0) {
            dbs = Array.isArray(schemaContext?.databases) ? schemaContext.databases : [];
          }

          if (database) {
            const tbls = await getDorisTables(database, hostConfig);
            return {
              ok: true,
              engine: "Apache Doris",
              database,
              tables: (tbls || []).map((t) => (typeof t === "string" ? t : t.name || String(t))),
            };
          }

          // If no specific database requested, fetch tables for all available databases
          const tablesByDatabase = {};
          await Promise.all(
            dbs.slice(0, 10).map(async (db) => {
              try {
                const tbls = await getDorisTables(db, hostConfig);
                tablesByDatabase[db] = (tbls || []).map((t) =>
                  typeof t === "string" ? t : t.name || String(t)
                );
              } catch {
                tablesByDatabase[db] = [];
              }
            })
          );

          return {
            ok: true,
            engine: "Apache Doris",
            availableDatabases: dbs,
            tablesByDatabase,
          };
        } catch (err) {
          console.warn("[AgentTools] Direct Doris schema fetch error:", err);
        }
      }

      // 2. Fetch from SchemaContext
      const dbs = Array.isArray(schemaContext?.databases) ? schemaContext.databases : [];
      const tablesMap = schemaContext?.tables || {};

      if (database) {
        const dbTables = tablesMap[database] || [];
        return {
          ok: true,
          database,
          tables: dbTables.map((t) => (typeof t === "string" ? t : t.name || String(t))),
        };
      }

      // Return overview of all loaded databases and their tables
      const summary = {};
      for (const db of dbs) {
        const dbName = typeof db === "string" ? db : db.name || String(db);
        summary[dbName] = (tablesMap[dbName] || []).map((t) => (typeof t === "string" ? t : t.name || String(t)));
      }

      return {
        ok: true,
        engine: isDoris ? "Apache Doris" : "Apache Spark",
        databases: dbs.map((d) => (typeof d === "string" ? d : d.name || String(d))),
        tablesByDatabase: summary,
      };
    }

    default:
      return { ok: false, error: `Unknown tool: ${cleanToolName}` };
  }
}
