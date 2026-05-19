import { createContext, useContext, useState, useCallback } from "react";

const SchemaContext = createContext(null);

export function SchemaProvider({ children }) {
  const [databases, setDatabases] = useState([]);
  const [tables, setTables] = useState({});
  const [columns, setColumns] = useState({});
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const updateDatabases = useCallback((dbs) => {
    setDatabases(dbs);
  }, []);

  const updateTables = useCallback((dbName, tableList) => {
    setTables((prev) => ({ ...prev, [dbName]: tableList }));
  }, []);

  const updateColumns = useCallback((dbName, tableName, columnList) => {
    const key = `${dbName}.${tableName}`;
    setColumns((prev) => ({ ...prev, [key]: columnList }));
  }, []);

  const clearSchema = useCallback(() => {
    setDatabases([]);
    setTables({});
    setColumns({});
  }, []);

  const refreshSchema = useCallback(() => {
    console.log('[SchemaContext] refreshSchema called, incrementing trigger');
    setRefreshTrigger(prev => {
      const newTrigger = prev + 1;
      console.log('[SchemaContext] refreshTrigger incremented to:', newTrigger);
      return newTrigger;
    });
  }, []);

  const value = {
    databases,
    tables,
    columns,
    updateDatabases,
    updateTables,
    updateColumns,
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
