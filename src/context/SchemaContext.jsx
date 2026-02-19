import { createContext, useContext, useState, useCallback } from "react";

const SchemaContext = createContext(null);

export function SchemaProvider({ children }) {
  const [databases, setDatabases] = useState([]);
  const [tables, setTables] = useState({});
  const [columns, setColumns] = useState({});

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

  const value = {
    databases,
    tables,
    columns,
    updateDatabases,
    updateTables,
    updateColumns,
    clearSchema,
  };

  return <SchemaContext.Provider value={value}>{children}</SchemaContext.Provider>;
}

export function useSchema() {
  const ctx = useContext(SchemaContext);
  if (!ctx) throw new Error("useSchema must be used within SchemaProvider");
  return ctx;
}
