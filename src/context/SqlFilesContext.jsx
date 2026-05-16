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

const storedFiles = getItem(STORAGE_KEYS.SQL_FILES, [defaultFile]);
const storedOpenFiles = getItem(STORAGE_KEYS.OPEN_FILES, null);

const initialState = {
  files: storedFiles,
  openFiles: storedOpenFiles || storedFiles.map(f => f.id),
  activeTabId: getItem(STORAGE_KEYS.ACTIVE_TAB, "default"),
  results: {},
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
      const shouldOpen = action.payload?.open !== false;
      return {
        ...state,
        files: [...state.files, newFile],
        openFiles: shouldOpen ? [...state.openFiles, newFile.id] : state.openFiles,
        activeTabId: shouldOpen ? newFile.id : state.activeTabId,
      };
    }
    case "REMOVE_FILE": {
      const filtered = state.files.filter((f) => f.id !== action.payload);
      const filteredOpen = state.openFiles.filter((id) => id !== action.payload);
      const nextResults = { ...state.results };
      delete nextResults[action.payload];
      if (filtered.length === 0) {
        return { files: [defaultFile], openFiles: [defaultFile.id], activeTabId: defaultFile.id, results: {} };
      }
      const newActiveId =
        state.activeTabId === action.payload
          ? (filteredOpen.length > 0 ? filteredOpen[filteredOpen.length - 1] : filtered[0].id)
          : state.activeTabId;
      return { ...state, files: filtered, openFiles: filteredOpen, activeTabId: newActiveId, results: nextResults };
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
    case "SET_RESULT":
      return { ...state, results: { ...state.results, [action.payload.id]: action.payload.result } };
    case "OPEN_FILE": {
      const fileId = action.payload;
      if (state.openFiles.includes(fileId)) {
        return { ...state, activeTabId: fileId };
      }
      return {
        ...state,
        openFiles: [...state.openFiles, fileId],
        activeTabId: fileId,
      };
    }
    case "CLOSE_FILE": {
      const fileId = action.payload;
      const filteredOpen = state.openFiles.filter((id) => id !== fileId);
      if (filteredOpen.length === 0) {
        return state;
      }
      const newActiveId =
        state.activeTabId === fileId
          ? filteredOpen[filteredOpen.length - 1]
          : state.activeTabId;
      return { ...state, openFiles: filteredOpen, activeTabId: newActiveId };
    }
    case "REORDER_FILES": {
      const { fromIndex, toIndex } = action.payload;
      const newOpenFiles = [...state.openFiles];
      const [movedId] = newOpenFiles.splice(fromIndex, 1);
      newOpenFiles.splice(toIndex, 0, movedId);
      return { ...state, openFiles: newOpenFiles };
    }
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

  // Persist open files
  useEffect(() => {
    setItem(STORAGE_KEYS.OPEN_FILES, state.openFiles);
  }, [state.openFiles]);

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
  const setResult = useCallback((id, result) => dispatch({ type: "SET_RESULT", payload: { id, result } }), []);
  const openFile = useCallback((id) => dispatch({ type: "OPEN_FILE", payload: id }), []);
  const closeFile = useCallback((id) => dispatch({ type: "CLOSE_FILE", payload: id }), []);
  const reorderFiles = useCallback((fromIndex, toIndex) => dispatch({ type: "REORDER_FILES", payload: { fromIndex, toIndex } }), []);

  const activeResult = state.results[state.activeTabId] || null;

  const value = {
    files: state.files,
    openFiles: state.openFiles,
    activeTabId: state.activeTabId,
    activeFile,
    activeResult,
    addFile,
    removeFile,
    updateContent,
    renameFile,
    setActiveTab,
    setResult,
    openFile,
    closeFile,
    reorderFiles,
  };

  return <SqlFilesContext.Provider value={value}>{children}</SqlFilesContext.Provider>;
}

export function useSqlFiles() {
  const ctx = useContext(SqlFilesContext);
  if (!ctx) throw new Error("useSqlFiles must be used within SqlFilesProvider");
  return ctx;
}
