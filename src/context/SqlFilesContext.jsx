import { createContext, useContext, useReducer, useEffect, useCallback } from "react";
import { getItem, setItem } from "../utils/localStorage";
import { STORAGE_KEYS } from "../utils/constants";
import { v4 as uuidv4 } from "uuid";

const SqlFilesContext = createContext(null);

const defaultFile = {
  id: "default",
  name: "Untitled.sql",
  content: "-- Write your Spark SQL here\nSELECT 1;\n",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const initialState = {
  files: getItem(STORAGE_KEYS.SQL_FILES, [defaultFile]),
  activeTabId: getItem(STORAGE_KEYS.ACTIVE_TAB, "default"),
};

function reducer(state, action) {
  switch (action.type) {
    case "ADD_FILE": {
      const newFile = {
        id: uuidv4(),
        name: action.payload?.name || `Query_${state.files.length + 1}.sql`,
        content: action.payload?.content || "-- Write your Spark SQL here\n",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return {
        ...state,
        files: [...state.files, newFile],
        activeTabId: newFile.id,
      };
    }
    case "REMOVE_FILE": {
      const filtered = state.files.filter((f) => f.id !== action.payload);
      if (filtered.length === 0) {
        return { files: [defaultFile], activeTabId: defaultFile.id };
      }
      const newActiveId =
        state.activeTabId === action.payload
          ? filtered[filtered.length - 1].id
          : state.activeTabId;
      return { ...state, files: filtered, activeTabId: newActiveId };
    }
    case "UPDATE_FILE_CONTENT": {
      const files = state.files.map((f) =>
        f.id === action.payload.id
          ? { ...f, content: action.payload.content, updatedAt: new Date().toISOString() }
          : f
      );
      return { ...state, files };
    }
    case "RENAME_FILE": {
      const files = state.files.map((f) =>
        f.id === action.payload.id ? { ...f, name: action.payload.name, updatedAt: new Date().toISOString() } : f
      );
      return { ...state, files };
    }
    case "SET_ACTIVE_TAB":
      return { ...state, activeTabId: action.payload };
    default:
      return state;
  }
}

export function SqlFilesProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Persist files
  useEffect(() => {
    setItem(STORAGE_KEYS.SQL_FILES, state.files);
  }, [state.files]);

  // Persist active tab
  useEffect(() => {
    setItem(STORAGE_KEYS.ACTIVE_TAB, state.activeTabId);
  }, [state.activeTabId]);

  const activeFile = state.files.find((f) => f.id === state.activeTabId) || state.files[0];

  const addFile = useCallback((payload) => dispatch({ type: "ADD_FILE", payload }), []);
  const removeFile = useCallback((id) => dispatch({ type: "REMOVE_FILE", payload: id }), []);
  const updateContent = useCallback((id, content) => dispatch({ type: "UPDATE_FILE_CONTENT", payload: { id, content } }), []);
  const renameFile = useCallback((id, name) => dispatch({ type: "RENAME_FILE", payload: { id, name } }), []);
  const setActiveTab = useCallback((id) => dispatch({ type: "SET_ACTIVE_TAB", payload: id }), []);

  const value = {
    files: state.files,
    activeTabId: state.activeTabId,
    activeFile,
    addFile,
    removeFile,
    updateContent,
    renameFile,
    setActiveTab,
  };

  return <SqlFilesContext.Provider value={value}>{children}</SqlFilesContext.Provider>;
}

export function useSqlFiles() {
  const ctx = useContext(SqlFilesContext);
  if (!ctx) throw new Error("useSqlFiles must be used within SqlFilesProvider");
  return ctx;
}
