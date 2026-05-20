import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { useLivy } from "./LivyContext";
import { SESSION_STATES } from "../utils/constants";
import * as livyApi from "../services/livyApi";

const SchemaContext = createContext(null);

export function SchemaProvider({ children }) {
  const { sessionId, sessionState } = useLivy();
  const [databases, setDatabases] = useState([]);
  const [tables, setTables] = useState({});
  const [columns, setColumns] = useState({});
  const [loading, setLoading] = useState({});
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const isReady = sessionState === SESSION_STATES.IDLE && sessionId !== null;

  const tablesRef = useRef(tables);
  tablesRef.current = tables;
  const columnsRef = useRef(columns);
  columnsRef.current = columns;
  const loadingRef = useRef(loading);
  loadingRef.current = loading;

  const loadDatabases = useCallback(async () => {
    if (!isReady) return;
    setLoading((p) => ({ ...p, _dbs: true }));
    try {
      const rows = await livyApi.runSql(sessionId, "SHOW DATABASES");
      const dbNames = rows.map(
        (r) => r.databaseName || r.namespace || Object.values(r)[0]
      );
      setDatabases(dbNames);
      setTables({});
      setColumns({});
    } catch (err) {
      console.error("[SchemaContext] Error loading databases:", err);
    } finally {
      setLoading((p) => ({ ...p, _dbs: false }));
    }
  }, [sessionId, isReady]);

  const loadTables = useCallback(async (db) => {
    if (!isReady) return;
    if (tablesRef.current[db] || loadingRef.current[db]) return;
    setLoading((p) => ({ ...p, [db]: true }));
    try {
      const rows = await livyApi.runSql(
        sessionId,
        `SHOW TABLES IN \`${db}\``
      );
      const tableNames = rows
        .map(
          (r) =>
            r.tableName || Object.values(r)[1] || Object.values(r)[0]
        )
        .filter((name) => name && name.trim() !== "");
      setTables((p) => ({ ...p, [db]: tableNames }));
    } catch (err) {
      console.error(`[SchemaContext] Error loading tables for ${db}:`, err);
      setTables((p) => ({ ...p, [db]: [] }));
    } finally {
      setLoading((p) => ({ ...p, [db]: false }));
    }
  }, [sessionId, isReady]);

  const loadColumns = useCallback(async (db, table) => {
    const key = `${db}.${table}`;
    if (!isReady) return;
    if (columnsRef.current[key] || loadingRef.current[key]) return;
    setLoading((p) => ({ ...p, [key]: true }));
    try {
      const rows = await livyApi.runSql(
        sessionId,
        `DESCRIBE \`${db}\`.\`${table}\``
      );
      const cols = rows
        .filter((r) => {
          const name = r.col_name || Object.values(r)[0];
          return name && !name.startsWith("#") && name.trim() !== "";
        })
        .map((r) => ({
          name: r.col_name || Object.values(r)[0],
          type: r.data_type || Object.values(r)[1] || "",
        }));
      setColumns((p) => ({ ...p, [key]: cols }));
    } catch (err) {
      console.error(`[SchemaContext] Error loading columns for ${key}:`, err);
      setColumns((p) => ({ ...p, [key]: [] }));
    } finally {
      setLoading((p) => ({ ...p, [key]: false }));
    }
  }, [sessionId, isReady]);

  const clearSchema = useCallback(() => {
    setDatabases([]);
    setTables({});
    setColumns({});
    setLoading({});
  }, []);

  const refreshSchema = useCallback(() => {
    console.log('[SchemaContext] refreshSchema called, incrementing trigger');
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // Auto-load databases when session becomes ready
  useEffect(() => {
    if (isReady) {
      loadDatabases();
    } else {
      clearSchema();
    }
  }, [isReady, sessionId, loadDatabases, clearSchema]);

  // Reload schema when refreshTrigger changes
  useEffect(() => {
    if (isReady && refreshTrigger > 0) {
      setTables({});
      setColumns({});
      loadDatabases();
    }
  }, [refreshTrigger, isReady, loadDatabases]);

  // Eagerly pre-load all tables and columns in the background
  useEffect(() => {
    if (!isReady || databases.length === 0) return;

    // Load tables for all databases
    databases.forEach((db) => {
      if (!tablesRef.current[db] && !loadingRef.current[db]) {
        loadTables(db);
      }
    });

    // Load columns for all loaded tables
    Object.entries(tables).forEach(([db, tbls]) => {
      tbls.forEach((tbl) => {
        const key = `${db}.${tbl}`;
        if (!columnsRef.current[key] && !loadingRef.current[key]) {
          loadColumns(db, tbl);
        }
      });
    });
  }, [isReady, databases, tables, loading, loadTables, loadColumns]);

  const value = {
    databases,
    tables,
    columns,
    loading,
    loadDatabases,
    loadTables,
    loadColumns,
    clearSchema,
    refreshSchema,
    refreshTrigger,
  };

  return <SchemaContext.Provider value={value}>{children}</SchemaContext.Provider>;
}

export function useSchema() {
  const ctx = useContext(SchemaContext);
  if (!ctx) throw new Error("useSchema must be used within SchemaProvider");
  return ctx;
}
