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

  const inFlightRef = useRef(new Set());

  const loadDatabases = useCallback(async () => {
    if (!isReady) return;
    if (inFlightRef.current.has("_dbs")) return;
    inFlightRef.current.add("_dbs");
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
      inFlightRef.current.delete("_dbs");
      setLoading((p) => ({ ...p, _dbs: false }));
    }
  }, [sessionId, isReady]);

  const loadTables = useCallback(async (db) => {
    if (!isReady) return;
    if (tablesRef.current[db] || loadingRef.current[db] || inFlightRef.current.has(`db:${db}`)) return;
    inFlightRef.current.add(`db:${db}`);
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
      inFlightRef.current.delete(`db:${db}`);
      setLoading((p) => ({ ...p, [db]: false }));
    }
  }, [sessionId, isReady]);

  const loadColumns = useCallback(async (db, table) => {
    const key = `${db}.${table}`;
    if (!isReady) return;
    if (columnsRef.current[key] || loadingRef.current[key] || inFlightRef.current.has(`col:${key}`)) return;
    inFlightRef.current.add(`col:${key}`);
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
      inFlightRef.current.delete(`col:${key}`);
      setLoading((p) => ({ ...p, [key]: false }));
    }
  }, [sessionId, isReady]);

  const clearSchema = useCallback(() => {
    inFlightRef.current.clear();
    setDatabases([]);
    setTables({});
    setColumns({});
    setLoading({});
  }, []);

  const refreshSchema = useCallback(() => {
    console.log('[SchemaContext] refreshSchema called, incrementing trigger');
    inFlightRef.current.clear();
    setTables({});
    setColumns({});
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
