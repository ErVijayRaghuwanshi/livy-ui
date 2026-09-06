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

  AlertTriangle,

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
      if (defaultOpen && onOpen) {
        onOpen();
      }
    }
  }, [defaultOpen, onOpen]);

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



const SchemaExplorer = forwardRef(function SchemaExplorer({ onInsertAtCursor, refreshTrigger: externalRefreshTrigger, showHeader = true }, ref) {

  const { sessionId, sessionState } = useLivy();

  const {

    databases,

    tables,

    columns,

    loading,

    loadTables,

    loadColumns,

    refreshSchema,

  } = useSchema();



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



  const [dropConfirmTable, setDropConfirmTable] = useState(null);

  const dropTable = useCallback(

    (db, table) => {

      if (!isReady) return;

      setDropConfirmTable({ db, table });

    },

    [isReady]

  );

  const handleConfirmDropTable = async () => {

    if (!dropConfirmTable) return;

    const { db, table } = dropConfirmTable;

    setDropConfirmTable(null);

    try {

      await livyApi.runSql(sessionId, `DROP TABLE IF EXISTS \`${db}\`.\`${table}\``);

      refreshSchema();

    } catch (err) {

      console.error(`[SchemaExplorer] Error dropping ${db}.${table}:`, err);

      setError(`Failed to drop ${table}: ${err.message}`);

    }

  };



  const containerRef = useRef(null);

  return (

    <div
      ref={containerRef}
      className="livy-schema-explorer flex flex-col h-full bg-(--color-bg-secondary) overflow-hidden focus:outline-none"
      tabIndex={0}
    >

      {/* Header */}
      {showHeader && (
        <div className="flex items-center justify-between px-3 py-2 border-b border-(--color-border)">
          <span className="text-xs font-semibold text-(--color-text-secondary) uppercase tracking-wide">
            Schema
          </span>
          <button
            onClick={refreshSchema}
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
      )}



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

              placeholder={`Filter schema...         ${mod}+Shift+K`}

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

                                onCopy={() => copyToClipboard(col.name.includes(" ") ? `\`${col.name}\`` : col.name)}

                                onInsert={onInsertAtCursor ? () => onInsertAtCursor(col.name.includes(" ") ? `\`${col.name}\`` : col.name) : undefined}

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

      {/* Custom Confirm Drop Table Dialog */}
      {dropConfirmTable && (() => {
        const { db, table } = dropConfirmTable;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs animate-in fade-in duration-200" onClick={() => setDropConfirmTable(null)}>
            <div className="bg-(--color-bg-secondary) border border-(--color-border) rounded-2xl shadow-2xl w-full max-w-sm mx-4 animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
              <div className="flex flex-col items-center px-6 py-5 text-center">
                <div className="w-11 h-11 rounded-full bg-(--color-error)/10 flex items-center justify-center mb-3">
                  <AlertTriangle size={22} className="text-(--color-error)" />
                </div>
                <h3 className="text-sm font-semibold text-(--color-text-primary) mb-1">Drop Table</h3>
                <p className="text-xs text-(--color-text-muted) leading-relaxed">
                  Are you sure you want to drop table <span className="text-(--color-text-primary) font-semibold">`{db}`.`{table}`</span>?
                  <span className="block mt-1">This will remove the table from the catalog. If it was created with LOCATION, the underlying data will NOT be deleted.</span>
                </p>
              </div>
              <div className="flex gap-2 px-6 pb-5">
                <button
                  onClick={() => setDropConfirmTable(null)}
                  className="flex-1 px-3 py-2 text-xs font-semibold text-(--color-text-secondary) bg-(--color-bg-tertiary)/40 hover:bg-(--color-bg-tertiary)/80 rounded-lg border border-(--color-border) transition-colors cursor-pointer dg-spring-btn"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDropTable}
                  className="flex-1 px-3 py-2 text-xs font-semibold text-white bg-(--color-error) hover:bg-(--color-error)/90 rounded-lg transition-colors cursor-pointer dg-spring-btn"
                >
                  Drop
                </button>
              </div>
            </div>
          </div>
        );
      })()}

    </div>

  );

});



export default SchemaExplorer;

