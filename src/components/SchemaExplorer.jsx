import { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from "react";

import {

  Database,

  Table2,

  Columns3,

  ChevronRight,

  ChevronDown,

  RefreshCw,

  Loader2,

  Copy,

  Check,

  Trash2,

  Search,

  X,

  TextCursorInput,

} from "lucide-react";

import { useLivy } from "../context/LivyContext";

import { useSchema } from "../context/SchemaContext";

import { SESSION_STATES } from "../utils/constants";

import * as livyApi from "../services/livyApi";

const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;

const mod = isMac ? "⌘" : "Ctrl";



function TreeNode({ icon: Icon, label, sublabel, children, onOpen, onCopy, onInsert, onDelete, defaultOpen = false }) {

  const [open, setOpen] = useState(defaultOpen);

  const prevDefaultOpen = useRef(defaultOpen);

  



  useEffect(() => {

    if (defaultOpen !== prevDefaultOpen.current) {

      setOpen(defaultOpen);

      prevDefaultOpen.current = defaultOpen;

    }

  }, [defaultOpen]);

  const [copied, setCopied] = useState(false);

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

        {onDelete && (

          <button

            onClick={(e) => {

              e.stopPropagation();

              onDelete();

            }}

            className="ml-auto opacity-0 group-hover:opacity-100 text-(--color-text-muted) hover:text-(--color-error) transition-opacity"

            title="Drop table"

          >

            <Trash2 size={11} />

          </button>

        )}

        {onInsert && (

          <button

            onClick={(e) => {

              e.stopPropagation();

              onInsert();

            }}

            className={`${onDelete ? "" : "ml-auto"} opacity-0 group-hover:opacity-100 text-(--color-text-muted) hover:text-(--color-accent) transition-opacity`}

            title="Insert into editor"

          >

            <TextCursorInput size={11} />

          </button>

        )}

        {onCopy && (

          <button

            onClick={(e) => {

              e.stopPropagation();

              onCopy();

              setCopied(true);

              setTimeout(() => setCopied(false), 1500);

            }}

            className={`ml-1 ${copied ? "opacity-100" : "opacity-0 group-hover:opacity-100"} text-(--color-text-muted) hover:text-(--color-accent) transition-opacity`}

            title="Copy name"

          >

            {copied ? <Check size={11} className="text-(--color-success)" /> : <Copy size={11} />}

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



const SchemaExplorer = forwardRef(function SchemaExplorer({ onInsertAtCursor, refreshTrigger: externalRefreshTrigger }, ref) {

  const { sessionId, sessionState } = useLivy();

  const { databases: contextDatabases, tables: contextTables, columns: contextColumns, updateDatabases, updateTables, updateColumns, refreshTrigger: contextRefreshTrigger, clearSchema } = useSchema();



  const [databases, setDatabases] = useState([]);

  const [tables, setTables] = useState({});

  const [columns, setColumns] = useState({});

  const [loading, setLoading] = useState({});

  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  const searchInputRef = useRef(null);



  const isReady = sessionState === SESSION_STATES.IDLE && sessionId !== null;



  const copyToClipboard = (text) => {

    navigator.clipboard.writeText(text).catch(() => {});

  };



  useImperativeHandle(ref, () => ({

    focusSearch: () => {

      searchInputRef.current?.focus();

    },

  }));



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

      updateDatabases(dbNames);

      setTables({});

      setColumns({});

    } catch (err) {

      setError(err.message);

    } finally {

      setLoading((p) => ({ ...p, _dbs: false }));

    }

  }, [sessionId, isReady, updateDatabases]);



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

        updateTables(db, tableNames);

      } catch (err) {

        console.error(`[SchemaExplorer] Error loading tables for ${db}:`, err);

        setTables((p) => ({ ...p, [db]: [] }));

      } finally {

        setLoading((p) => ({ ...p, [db]: false }));

      }

    },

    [sessionId, isReady, updateTables]

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

        updateColumns(db, table, cols);

      } catch (err) {

        console.error(`[SchemaExplorer] Error loading columns for ${key}:`, err);

        setColumns((p) => ({ ...p, [key]: [] }));

      } finally {

        setLoading((p) => ({ ...p, [key]: false }));

      }

    },

    [sessionId, isReady, updateColumns]

  );



  const dropTable = useCallback(

    async (db, table) => {

      if (!isReady) return;

      if (!window.confirm(`Drop table \`${db}\`.\`${table}\`?\n\nThis will remove the table from the catalog. If it was created with LOCATION, the underlying data will NOT be deleted.`)) return;

      const key = `${db}.${table}`;

      setLoading((p) => ({ ...p, [key]: true }));

      try {

        await livyApi.runSql(sessionId, `DROP TABLE IF EXISTS \`${db}\`.\`${table}\``);

        setTables((p) => ({

          ...p,

          [db]: (p[db] || []).filter((t) => t !== table),

        }));

        setColumns((p) => {

          const next = { ...p };

          delete next[key];

          return next;

        });

      } catch (err) {

        console.error(`[SchemaExplorer] Error dropping ${key}:`, err);

        setError(`Failed to drop ${table}: ${err.message}`);

      } finally {

        setLoading((p) => ({ ...p, [key]: false }));

      }

    },

    [sessionId, isReady]

  );



  // Auto-load databases when session becomes ready

  useEffect(() => {

    if (isReady) {

      loadDatabases();

    }

  }, [isReady, sessionId, loadDatabases]);



  // Reload schema when refreshTrigger changes (triggered by DDL operations)

  useEffect(() => {

    if (isReady && externalRefreshTrigger > 0) {

      console.log('[SchemaExplorer] Refresh trigger detected, reloading schema:', externalRefreshTrigger);

      setTables({});

      setColumns({});

      loadDatabases();

    }

  }, [externalRefreshTrigger, isReady, loadDatabases]);



  // Auto-load all tables and columns when user starts searching

  useEffect(() => {

    if (!searchTerm || !isReady || databases.length === 0) return;



    // Load tables for all databases that haven't been loaded yet

    databases.forEach((db) => {

      if (!tablesRef.current[db] && !loading[db]) {

        loadTables(db);

      }

    });



    // Load columns for all loaded tables that haven't been loaded yet

    Object.entries(tablesRef.current).forEach(([db, tbls]) => {

      tbls.forEach((tbl) => {

        const key = `${db}.${tbl}`;

        if (!columnsRef.current[key] && !loading[key]) {

          loadColumns(db, tbl);

        }

      });

    });

  }, [searchTerm, isReady, databases, tables, loading, loadTables, loadColumns]); // eslint-disable-line react-hooks/exhaustive-deps



  useEffect(() => {

    setDatabases([]);

    setTables({});

    setColumns({});

    setError(null);

    clearSchema();

  }, [sessionId, clearSchema]);



  return (

    <div className="flex flex-col h-full bg-(--color-bg-secondary) overflow-hidden)">

      {/* Header */}

      <div className="flex items-center justify-between px-3 py-2 border-b border-(--color-border)">

        <span className="text-xs font-semibold text-(--color-text-secondary) uppercase tracking-wide">

          Schema

        </span>

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

      </div>



      {/* Search */}

      {isReady && databases.length > 0 && (

        <div className="px-2 py-1.5 border-b border-(--color-border)">

          <div className="relative">

            <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-(--color-text-muted)" />

            <input

              ref={searchInputRef}

              type="text"

              value={searchTerm}

              onChange={(e) => setSearchTerm(e.target.value)}

              placeholder={`Filter schema...               ${mod}+K`}

              className="w-full pl-7 pr-7 py-1 text-xs bg-(--color-bg-primary) text-(--color-text-primary) border border-(--color-border) rounded focus:outline-none focus:border-(--color-accent) placeholder:text-(--color-text-muted)"

            />

            {searchTerm && (

              <button

                onClick={() => setSearchTerm("")}

                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-(--color-text-muted) hover:text-(--color-text-primary)"

              >

                <X size={12} />

              </button>

            )}

          </div>

        </div>

      )}



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



        {isReady && databases.length === 0 && loading._dbs && (

          <div className="flex items-center justify-center gap-2 px-3 py-6 text-xs text-(--color-text-muted)">

            <Loader2 size={14} className="animate-spin" />

            Loading databases...

          </div>

        )}



        {isReady && databases.length === 0 && !loading._dbs && !error && (

          <div className="px-3 py-4 text-xs text-(--color-text-muted) text-center">

            No databases found

          </div>

        )}



        {databases.map((db) => {

          const term = searchTerm.toLowerCase();

          const dbMatch = !term || db.toLowerCase().includes(term);

          const dbTables = tables[db] || [];



          // Filter tables: show if table name matches or any of its columns match

          const filteredTables = term

            ? dbTables.filter((tbl) => {

                if (tbl.toLowerCase().includes(term)) return true;

                const colKey = `${db}.${tbl}`;

                const cols = columns[colKey] || [];

                return cols.some((c) => c.name.toLowerCase().includes(term) || c.type.toLowerCase().includes(term));

              })

            : dbTables;



          // Skip this database if searching and nothing matches

          if (term && !dbMatch && filteredTables.length === 0) return null;



          const forceDbOpen = term && (filteredTables.length > 0 || dbMatch);



          return (

            <TreeNode

              key={db}

              icon={Database}

              label={db}

              onOpen={() => loadTables(db)}

              onCopy={() => copyToClipboard(db)}

              onInsert={onInsertAtCursor ? () => onInsertAtCursor(db) : undefined}

              defaultOpen={!!forceDbOpen}

            >

              {loading[db] ? (

                <LoadingNode />

              ) : tables[db] ? (

                filteredTables.length === 0 ? (

                  <div className="px-2 py-1 text-[10px] text-(--color-text-muted)">

                    {term ? "No matches" : "No tables"}

                  </div>

                ) : (

                  filteredTables.map((tbl) => {

                    const colKey = `${db}.${tbl}`;

                    const tblMatch = !term || tbl.toLowerCase().includes(term);

                    const cols = columns[colKey] || [];



                    const filteredCols = term

                      ? cols.filter((c) => c.name.toLowerCase().includes(term) || c.type.toLowerCase().includes(term))

                      : cols;



                    const forceTblOpen = term && (filteredCols.length > 0 || tblMatch);



                    return (

                      <TreeNode

                        key={tbl}

                        icon={Table2}

                        label={tbl}

                        onOpen={() => loadColumns(db, tbl)}

                        onCopy={() =>

                          copyToClipboard(`\`${db}\`.\`${tbl}\``)

                        }

                        onInsert={onInsertAtCursor ? () => onInsertAtCursor(`\`${db}\`.\`${tbl}\``) : undefined}

                        onDelete={() => dropTable(db, tbl)}

                        defaultOpen={!!forceTblOpen}

                      >

                        {loading[colKey] ? (

                          <LoadingNode />

                        ) : columns[colKey] ? (

                          (term ? filteredCols : cols).length === 0 ? (

                            <div className="px-2 py-1 text-[10px] text-(--color-text-muted)">

                              {term ? "No matches" : "No columns"}

                            </div>

                          ) : (

                            (term ? filteredCols : cols).map((col) => (

                              <TreeNode

                                key={col.name}

                                icon={Columns3}

                                label={col.name}

                                sublabel={col.type}

                                onCopy={() => copyToClipboard(col.name)}

                                onInsert={onInsertAtCursor ? () => onInsertAtCursor(col.name) : undefined}

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

          );

        })}

      </div>

    </div>

  );

});



export default SchemaExplorer;

