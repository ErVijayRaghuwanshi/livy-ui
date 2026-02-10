import { useState, useEffect, useCallback, useRef } from "react";
import {
  Database,
  Table2,
  Columns3,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Loader2,
  PanelLeftClose,
  PanelLeft,
  Copy,
} from "lucide-react";
import { useLivy } from "../context/LivyContext";
import { SESSION_STATES } from "../utils/constants";
import * as livyApi from "../services/livyApi";

function TreeNode({ icon: Icon, label, sublabel, children, onOpen, onCopy }) {
  const [open, setOpen] = useState(false);
  const hasChildren = !!children || !!onOpen;

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next && onOpen) onOpen();
  };

  return (
    <div>
      <div
        className="flex items-center gap-1 px-2 py-1 text-xs cursor-pointer hover:bg-(--color-bg-tertiary) rounded group"
        onClick={toggle}
      >
        {hasChildren ? (
          open ? (
            <ChevronDown size={12} className="shrink-0 text-(--color-text-muted)" />
          ) : (
            <ChevronRight size={12} className="shrink-0 text-(--color-text-muted)" />
          )
        ) : (
          <span className="w-3 shrink-0" />
        )}
        <Icon size={13} className="shrink-0 text-(--color-accent)" />
        <span className="truncate text-(--color-text-primary)">{label}</span>
        {sublabel && (
          <span className="ml-auto text-[10px] text-(--color-text-muted) font-mono shrink-0">
            {sublabel}
          </span>
        )}
        {onCopy && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCopy();
            }}
            className="ml-1 opacity-0 group-hover:opacity-100 text-(--color-text-muted) hover:text-(--color-accent) transition-opacity"
            title="Copy name"
          >
            <Copy size={11} />
          </button>
        )}
      </div>
      {open && children && (
        <div className="ml-3 border-l border-(--color-border)/30 pl-1">
          {children}
        </div>
      )}
    </div>
  );
}

function LoadingNode() {
  return (
    <div className="flex items-center gap-1 px-2 py-1 text-xs text-(--color-text-muted)">
      <Loader2 size={11} className="animate-spin" /> Loading...
    </div>
  );
}

export default function SchemaExplorer() {
  const { sessionId, sessionState } = useLivy();
  const CACHE_KEY_COLLAPSED = "livy-ui-explorer-collapsed";

  // 1. Initialize state from LocalStorage (fall back to true if not found)
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem(CACHE_KEY_COLLAPSED);
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [databases, setDatabases] = useState([]);
  const [tables, setTables] = useState({});
  const [columns, setColumns] = useState({});
  const [loading, setLoading] = useState({});
  const [error, setError] = useState(null);

  // 2. Persist state to LocalStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(CACHE_KEY_COLLAPSED, JSON.stringify(collapsed));
  }, [collapsed]);

  const isReady = sessionState === SESSION_STATES.IDLE && sessionId;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).catch(() => {});
  };

  const loadDatabases = useCallback(async () => {
    if (!isReady) return;
    setLoading((p) => ({ ...p, _dbs: true }));
    setError(null);
    try {
      const rows = await livyApi.runSql(sessionId, "SHOW DATABASES");
      const dbNames = rows.map(
        (r) => r.databaseName || r.namespace || Object.values(r)[0]
      );
      setDatabases(dbNames);
      setTables({});
      setColumns({});
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading((p) => ({ ...p, _dbs: false }));
    }
  }, [sessionId, isReady]);

  const tablesRef = useRef(tables);
  tablesRef.current = tables;
  const columnsRef = useRef(columns);
  columnsRef.current = columns;

  const loadTables = useCallback(
    async (db) => {
      if (!isReady) return;
      if (tablesRef.current[db]) return;
      setLoading((p) => ({ ...p, [db]: true }));
      try {
        const rows = await livyApi.runSql(
          sessionId,
          `SHOW TABLES IN \`${db}\``
        );
        console.log(`[SchemaExplorer] SHOW TABLES IN ${db}:`, rows);
        const tableNames = rows
          .map(
            (r) =>
              r.tableName || Object.values(r)[1] || Object.values(r)[0]
          )
          .filter((name) => name && name.trim() !== "");
        setTables((p) => ({ ...p, [db]: tableNames }));
      } catch (err) {
        console.error(`[SchemaExplorer] Error loading tables for ${db}:`, err);
        setTables((p) => ({ ...p, [db]: [] }));
      } finally {
        setLoading((p) => ({ ...p, [db]: false }));
      }
    },
    [sessionId, isReady]
  );

  const loadColumns = useCallback(
    async (db, table) => {
      const key = `${db}.${table}`;
      if (!isReady) return;
      if (columnsRef.current[key]) return;
      setLoading((p) => ({ ...p, [key]: true }));
      try {
        const rows = await livyApi.runSql(
          sessionId,
          `DESCRIBE \`${db}\`.\`${table}\``
        );
        console.log(`[SchemaExplorer] DESCRIBE ${db}.${table}:`, rows);
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
        console.error(`[SchemaExplorer] Error loading columns for ${key}:`, err);
        setColumns((p) => ({ ...p, [key]: [] }));
      } finally {
        setLoading((p) => ({ ...p, [key]: false }));
      }
    },
    [sessionId, isReady]
  );

  useEffect(() => {
    if (isReady && databases.length === 0) {
      loadDatabases();
    }
  }, [isReady]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setDatabases([]);
    setTables({});
    setColumns({});
    setError(null);
  }, [sessionId]);

  if (collapsed) {
    return (
      <div className="flex flex-col items-center py-2 w-10 shrink-0 bg-(--color-bg-secondary) border-r border-(--color-border)">
        <button
          onClick={() => setCollapsed(false)}
          className="p-1.5 rounded hover:bg-(--color-bg-tertiary) text-(--color-text-muted) hover:text-(--color-text-primary)"
          title="Show Schema Explorer"
        >
          <PanelLeft size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-60 shrink-0 bg-(--color-bg-secondary) border-r border-(--color-border) overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-(--color-border)">
        <span className="text-xs font-semibold text-(--color-text-secondary) uppercase tracking-wider">
          Schema Explorer
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setTables({});
              setColumns({});
              loadDatabases();
            }}
            disabled={!isReady || loading._dbs}
            className="p-1 rounded hover:bg-(--color-bg-tertiary) text-(--color-text-muted) hover:text-(--color-text-primary) disabled:opacity-30"
            title="Refresh"
          >
            {loading._dbs ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <RefreshCw size={13} />
            )}
          </button>
          <button
            onClick={() => setCollapsed(true)}
            className="p-1 rounded hover:bg-(--color-bg-tertiary) text-(--color-text-muted) hover:text-(--color-text-primary)"
            title="Collapse"
          >
            <PanelLeftClose size={13} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto py-1">
        {!isReady && (
          <div className="px-3 py-4 text-xs text-(--color-text-muted) text-center">
            Start a session to explore schema
          </div>
        )}

        {error && (
          <div className="px-3 py-2 text-xs text-(--color-error)">
            {error}
          </div>
        )}

        {isReady && databases.length === 0 && !loading._dbs && !error && (
          <div className="px-3 py-4 text-xs text-(--color-text-muted) text-center">
            No databases found
          </div>
        )}

        {databases.map((db) => (
          <TreeNode
            key={db}
            icon={Database}
            label={db}
            onOpen={() => loadTables(db)}
            onCopy={() => copyToClipboard(db)}
          >
            {loading[db] ? (
              <LoadingNode />
            ) : tables[db] ? (
              tables[db].length === 0 ? (
                <div className="px-2 py-1 text-[10px] text-(--color-text-muted)">
                  No tables
                </div>
              ) : (
                tables[db].map((tbl) => {
                  const key = `${db}.${tbl}`;
                  return (
                    <TreeNode
                      key={tbl}
                      icon={Table2}
                      label={tbl}
                      onOpen={() => loadColumns(db, tbl)}
                      onCopy={() =>
                        copyToClipboard(`\`${db}\`.\`${tbl}\``)
                      }
                    >
                      {loading[key] ? (
                        <LoadingNode />
                      ) : columns[key] ? (
                        columns[key].length === 0 ? (
                          <div className="px-2 py-1 text-[10px] text-(--color-text-muted)">
                            No columns
                          </div>
                        ) : (
                          columns[key].map((col) => (
                            <TreeNode
                              key={col.name}
                              icon={Columns3}
                              label={col.name}
                              sublabel={col.type}
                              onCopy={() => copyToClipboard(col.name)}
                            />
                          ))
                        )
                      ) : null}
                    </TreeNode>
                  );
                })
              )
            ) : null}
          </TreeNode>
        ))}
      </div>
    </div>
  );
}
