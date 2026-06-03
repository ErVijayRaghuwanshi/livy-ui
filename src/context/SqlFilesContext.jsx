import { createContext, useContext, useReducer, useEffect, useCallback, useState } from "react";
import { getItem, setItem } from "../utils/localStorage";
import { STORAGE_KEYS } from "../utils/constants";
import { v4 as uuidv4 } from "uuid";

const SqlFilesContext = createContext(null);

const defaultFile = {
  id: "default",
  name: "Untitled.sql",
  content: "-- Write your Spark SQL here\nSELECT 1;\n",
  lastSavedContent: "-- Write your Spark SQL here\nSELECT 1;\n",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const storedFiles = getItem(STORAGE_KEYS.SQL_FILES, [defaultFile]).map(f => ({
  ...f,
  lastSavedContent: f.lastSavedContent || f.content
}));
const storedOpenFiles = getItem(STORAGE_KEYS.OPEN_FILES, null);

const initialState = {
  files: storedFiles,
  openFiles: storedOpenFiles || storedFiles.map(f => f.id),
  activeTabId: getItem(STORAGE_KEYS.ACTIVE_TAB, "default"),
  results: {},
  dirtyFiles: {},
  closedTabsHistory: [],
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
      newFile.lastSavedContent = newFile.content;
      const shouldOpen = action.payload?.open !== false;
      const nextClosedHistory = state.closedTabsHistory.filter((id) => id !== newFile.id);
      return {
        ...state,
        files: [...state.files, newFile],
        openFiles: shouldOpen ? [...state.openFiles, newFile.id] : state.openFiles,
        activeTabId: shouldOpen ? newFile.id : state.activeTabId,
        dirtyFiles: {
          ...state.dirtyFiles,
          [newFile.id]: false,
        },
        closedTabsHistory: nextClosedHistory,
      };
    }
    case "REMOVE_FILE": {
      const filtered = state.files.filter((f) => f.id !== action.payload);
      const filteredOpen = state.openFiles.filter((id) => id !== action.payload);
      const nextResults = { ...state.results };
      delete nextResults[action.payload];
      const nextDirty = { ...state.dirtyFiles };
      delete nextDirty[action.payload];
      const nextClosedHistory = (state.closedTabsHistory || []).filter((id) => id !== action.payload);
      if (filtered.length === 0) {
        return { files: [defaultFile], openFiles: [defaultFile.id], activeTabId: defaultFile.id, results: {}, dirtyFiles: {}, closedTabsHistory: [] };
      }
      const newActiveId =
        state.activeTabId === action.payload
          ? (filteredOpen.length > 0 ? filteredOpen[filteredOpen.length - 1] : null)
          : (filteredOpen.includes(state.activeTabId) ? state.activeTabId : (filteredOpen.length > 0 ? filteredOpen[0] : null));
      return { ...state, files: filtered, openFiles: filteredOpen, activeTabId: newActiveId, results: nextResults, dirtyFiles: nextDirty, closedTabsHistory: nextClosedHistory };
    }
    case "UPDATE_FILE_CONTENT": {
      const files = state.files.map((f) =>
        f.id === action.payload.id
          ? { ...f, content: action.payload.content, updatedAt: new Date().toISOString() }
          : f
      );
      return {
        ...state,
        files,
        dirtyFiles: {
          ...state.dirtyFiles,
          [action.payload.id]: action.payload.isDirty,
        },
      };
    }
    case "CLEAR_ALL_DIRTY": {
      const files = state.files.map(f => ({ ...f, lastSavedContent: f.content }));
      return {
        ...state,
        files,
        dirtyFiles: {},
      };
    }
    case "SAVE_FILE": {
      const files = state.files.map((f) =>
        f.id === action.payload ? { ...f, lastSavedContent: f.content } : f
      );
      return {
        ...state,
        files,
        dirtyFiles: {
          ...state.dirtyFiles,
          [action.payload]: false,
        },
      };
    }
    case "RENAME_FILE": {
      const files = state.files.map((f) =>
        f.id === action.payload.id ? { ...f, name: action.payload.name, updatedAt: new Date().toISOString() } : f
      );
      return { ...state, files };
    }
    case "SET_ACTIVE_TAB":
      return { ...state, activeTabId: action.payload };
    case "SET_RESULT": {
      const { id: fileId, result, executionId } = action.payload;
      const fileResults = state.results[fileId] || { list: [], activeResultId: null };
      
      let newList = [...fileResults.list];
      const existingIdx = newList.findIndex(item => item.id === executionId);
      
      const updatedItem = {
        id: executionId,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        ...result,
      };
      
      if (existingIdx >= 0) {
        newList[existingIdx] = {
          ...newList[existingIdx],
          ...updatedItem
        };
      } else {
        newList.push(updatedItem);
      }
      
      return {
        ...state,
        results: {
          ...state.results,
          [fileId]: {
            list: newList,
            activeResultId: executionId
          }
        }
      };
    }
    case "SELECT_RESULT": {
      const { fileId, executionId } = action.payload;
      const fileResults = state.results[fileId] || { list: [], activeResultId: null };
      return {
        ...state,
        results: {
          ...state.results,
          [fileId]: {
            ...fileResults,
            activeResultId: executionId
          }
        }
      };
    }
    case "DELETE_RESULT": {
      const { fileId, executionId } = action.payload;
      const fileResults = state.results[fileId] || { list: [], activeResultId: null };
      const newList = fileResults.list.filter(item => item.id !== executionId);
      
      let newActiveId = fileResults.activeResultId;
      if (newActiveId === executionId) {
        newActiveId = newList.length > 0 ? newList[newList.length - 1].id : null;
      }
      
      return {
        ...state,
        results: {
          ...state.results,
          [fileId]: {
            list: newList,
            activeResultId: newActiveId
          }
        }
      };
    }
    case "CLEAR_FILE_RESULTS": {
      const fileId = action.payload;
      return {
        ...state,
        results: {
          ...state.results,
          [fileId]: {
            list: [],
            activeResultId: null
          }
        }
      };
    }
    case "CREATE_RESULT_SESSION": {
      const fileId = action.payload;
      const fileResults = state.results[fileId] || { list: [], activeResultId: null };
      const newSessionId = uuidv4();
      const newSession = {
        id: newSessionId,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        status: "idle",
        data: null,
        error: null,
        elapsed: null,
        sql: "New Session"
      };
      return {
        ...state,
        results: {
          ...state.results,
          [fileId]: {
            list: [...fileResults.list, newSession],
            activeResultId: newSessionId
          }
        }
      };
    }
    case "OPEN_FILE": {
      const fileId = action.payload;
      const nextClosedHistory = (state.closedTabsHistory || []).filter((id) => id !== fileId);
      if (state.openFiles.includes(fileId)) {
        return { ...state, activeTabId: fileId, closedTabsHistory: nextClosedHistory };
      }
      return {
        ...state,
        openFiles: [...state.openFiles, fileId],
        activeTabId: fileId,
        closedTabsHistory: nextClosedHistory,
      };
    }
    case "CLOSE_FILE": {
      const fileId = action.payload;
      const filteredOpen = state.openFiles.filter((id) => id !== fileId);
      const newActiveId =
        state.activeTabId === fileId
          ? (filteredOpen.length > 0 ? filteredOpen[filteredOpen.length - 1] : null)
          : state.activeTabId;

      const files = state.files.map((f) => {
        if (f.id === fileId && state.dirtyFiles[fileId]) {
          return { ...f, content: f.lastSavedContent || f.content };
        }
        return f;
      });

      const nextDirty = { ...state.dirtyFiles };
      delete nextDirty[fileId];

      const nextClosedHistory = [
        ...(state.closedTabsHistory || []).filter((id) => id !== fileId),
        fileId
      ];

      return {
        ...state,
        files,
        openFiles: filteredOpen,
        activeTabId: newActiveId,
        dirtyFiles: nextDirty,
        closedTabsHistory: nextClosedHistory,
      };
    }
    case "CLOSE_ALL_FILES": {
      const cleanOpen = state.openFiles.filter(id => !state.dirtyFiles[id]);
      const dirtyOpen = state.openFiles.filter(id => state.dirtyFiles[id]);

      const nextClosedHistory = [
        ...(state.closedTabsHistory || []).filter(id => !cleanOpen.includes(id)),
        ...cleanOpen
      ];

      const newActiveId = dirtyOpen.length > 0 ? dirtyOpen[0] : null;

      return {
        ...state,
        openFiles: dirtyOpen,
        activeTabId: newActiveId,
        closedTabsHistory: nextClosedHistory,
      };
    }
    case "REORDER_FILES": {
      const { fromIndex, toIndex } = action.payload;
      const newOpenFiles = [...state.openFiles];
      const [movedId] = newOpenFiles.splice(fromIndex, 1);
      newOpenFiles.splice(toIndex, 0, movedId);
      return { ...state, openFiles: newOpenFiles };
    }
    case "RESTORE_LAST_CLOSED_TAB": {
      if (!state.closedTabsHistory || state.closedTabsHistory.length === 0) {
        return state;
      }
      const nextClosedHistory = [...state.closedTabsHistory];
      const lastClosedId = nextClosedHistory.pop();

      const exists = state.files.some(f => f.id === lastClosedId);
      const isAlreadyOpen = state.openFiles.includes(lastClosedId);

      if (exists && !isAlreadyOpen) {
        return {
          ...state,
          openFiles: [...state.openFiles, lastClosedId],
          activeTabId: lastClosedId,
          closedTabsHistory: nextClosedHistory,
        };
      }
      return {
        ...state,
        closedTabsHistory: nextClosedHistory,
      };
    }
    default:
      return state;
  }
}

export function SqlFilesProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const [autoSave, setAutoSave] = useState(() => {
    const saved = localStorage.getItem("livy-ui-auto-save");
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem("livy-ui-auto-save", JSON.stringify(autoSave));
    if (autoSave) {
      dispatch({ type: "CLEAR_ALL_DIRTY" });
    }
  }, [autoSave]);

  const toggleAutoSave = useCallback(() => setAutoSave((prev) => !prev), []);

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

  const activeFile = state.openFiles.includes(state.activeTabId)
    ? state.files.find((f) => f.id === state.activeTabId)
    : null;

  const [promptCloseFileId, setPromptCloseFileId] = useState(null);

  const requestCloseFile = useCallback((id) => {
    if (state.dirtyFiles[id]) {
      setPromptCloseFileId(id);
    } else {
      dispatch({ type: "CLOSE_FILE", payload: id });
    }
  }, [state.dirtyFiles]);

  const addFile = useCallback((payload) => dispatch({ type: "ADD_FILE", payload }), []);
  const removeFile = useCallback((id) => dispatch({ type: "REMOVE_FILE", payload: id }), []);
  const updateContent = useCallback((id, content) => {
    dispatch({ type: "UPDATE_FILE_CONTENT", payload: { id, content, isDirty: !autoSave } });
  }, [autoSave]);
  const renameFile = useCallback((id, name) => dispatch({ type: "RENAME_FILE", payload: { id, name } }), []);
  const setActiveTab = useCallback((id) => dispatch({ type: "SET_ACTIVE_TAB", payload: id }), []);
  const setResult = useCallback((id, result, executionId) => dispatch({ type: "SET_RESULT", payload: { id, result, executionId } }), []);
  const selectResult = useCallback((fileId, executionId) => dispatch({ type: "SELECT_RESULT", payload: { fileId, executionId } }), []);
  const deleteResult = useCallback((fileId, executionId) => dispatch({ type: "DELETE_RESULT", payload: { fileId, executionId } }), []);
  const clearFileResults = useCallback((fileId) => dispatch({ type: "CLEAR_FILE_RESULTS", payload: fileId }), []);
  const createResultSession = useCallback((fileId) => dispatch({ type: "CREATE_RESULT_SESSION", payload: fileId }), []);
  const openFile = useCallback((id) => dispatch({ type: "OPEN_FILE", payload: id }), []);
  const closeFile = useCallback((id) => dispatch({ type: "CLOSE_FILE", payload: id }), []);
  const reorderFiles = useCallback((fromIndex, toIndex) => dispatch({ type: "REORDER_FILES", payload: { fromIndex, toIndex } }), []);
  const saveFile = useCallback((id) => dispatch({ type: "SAVE_FILE", payload: id }), []);

  const restoreLastClosedTab = useCallback(() => dispatch({ type: "RESTORE_LAST_CLOSED_TAB" }), []);

  const closeAllFiles = useCallback(() => {
    const dirtyOpen = state.openFiles.filter(id => state.dirtyFiles[id]);
    dispatch({ type: "CLOSE_ALL_FILES" });
    if (dirtyOpen.length > 0) {
      setPromptCloseFileId(dirtyOpen[0]);
    }
  }, [state.openFiles, state.dirtyFiles]);

  const fileResults = state.results[state.activeTabId] || { list: [], activeResultId: null };
  const activeResult = fileResults.list.find(r => r.id === fileResults.activeResultId) || null;
  const activeFileResultsList = fileResults.list;
  const activeResultId = fileResults.activeResultId;

  const value = {
    files: state.files,
    openFiles: state.openFiles,
    activeTabId: state.activeTabId,
    activeFile,
    activeResult,
    activeFileResultsList,
    activeResultId,
    dirtyFiles: state.dirtyFiles,
    autoSave,
    addFile,
    removeFile,
    updateContent,
    renameFile,
    setActiveTab,
    setResult,
    selectResult,
    deleteResult,
    clearFileResults,
    createResultSession,
    openFile,
    closeFile,
    closeAllFiles,
    reorderFiles,
    saveFile,
    toggleAutoSave,
    restoreLastClosedTab,
    closedTabsHistory: state.closedTabsHistory,
    promptCloseFileId,
    setPromptCloseFileId,
    requestCloseFile,
  };

  return <SqlFilesContext.Provider value={value}>{children}</SqlFilesContext.Provider>;
}

export function useSqlFiles() {
  const ctx = useContext(SqlFilesContext);
  if (!ctx) throw new Error("useSqlFiles must be used within SqlFilesProvider");
  return ctx;
}
