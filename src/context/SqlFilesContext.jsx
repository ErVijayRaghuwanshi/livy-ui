import { createContext, useContext, useReducer, useEffect, useCallback, useState, useRef } from "react";
import { getItem, setItem, removeItem } from "../utils/localStorage";
import { STORAGE_KEYS } from "../utils/constants";
import { v4 as uuidv4 } from "uuid";
import {
  isFileSystemAccessSupported,
  getWorkspaceHandleFromIDB,
  saveWorkspaceHandleToIDB,
  clearWorkspaceHandleFromIDB,
  verifyPermission,
  queryPermissionStatus,
  detectGitRepository,
  readDirectoryTreeAndFiles,
  readDirectoryRecursive,
  writeFileToHandle,
  createFileInDirectory,
  createDirectoryInDirectory,
  deleteFileFromDirectory,
  deleteDirectoryFromDirectory,
  renameFileInDirectory,
  initializeWorkspaceTemplate,
  openLocalWorkspace,
  openSingleLocalFile,
  saveFileAsLocalDisk,
} from "../services/fileSystemService";

const SqlFilesContext = createContext(null);

const defaultFile = {
  id: "default",
  name: "Untitled.sql",
  content: "-- Write your Spark SQL here\nSELECT 1;\n",
  lastSavedContent: "-- Write your Spark SQL here\nSELECT 1;\n",
  isLocalDisk: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

function extractSqlComment(sql) {
  if (!sql) return "";
  const trimmed = sql.trim();
  
  // Try matching single-line comment "--"
  if (trimmed.startsWith("--")) {
    const firstLine = trimmed.split("\n")[0];
    return firstLine.substring(2).trim();
  }
  
  // Try matching multi-line comment "/* ... */"
  if (trimmed.startsWith("/*")) {
    const endIdx = trimmed.indexOf("*/");
    if (endIdx !== -1) {
      const commentContent = trimmed.substring(2, endIdx);
      return commentContent
        .split("\n")
        .map(line => line.trim().replace(/^\*+\s*/, "").trim())
        .filter(Boolean)
        .join(" ")
        .trim();
    }
  }
  
  return "";
}

export const SETTINGS_FILE_ID = "settings";
export const SETTINGS_FILE = {
  id: SETTINGS_FILE_ID,
  name: "Settings",
  isSpecial: true,
  isReadOnly: true,
};

// Recover any previously backed up scratchpad files if available
const storedScratchpad = getItem(STORAGE_KEYS.SCRATCHPAD_FILES, null);
let initialBrowserFiles = getItem(STORAGE_KEYS.SQL_FILES, [defaultFile]);

if (Array.isArray(storedScratchpad) && storedScratchpad.length > 0) {
  const existingIds = new Set(initialBrowserFiles.map((f) => f.id));
  for (const sf of storedScratchpad) {
    if (!existingIds.has(sf.id)) {
      initialBrowserFiles.push({ ...sf, isLocalDisk: false });
    }
  }
}

initialBrowserFiles = initialBrowserFiles.map((f) => ({
  ...f,
  lastSavedContent: f.lastSavedContent || f.content,
  isLocalDisk: false,
}));

if (initialBrowserFiles.length === 0) {
  initialBrowserFiles = [defaultFile];
}

const storedOpenFiles = getItem(STORAGE_KEYS.OPEN_FILES, null);

const initialState = {
  files: initialBrowserFiles,
  openFiles: Array.isArray(storedOpenFiles) ? storedOpenFiles : [initialBrowserFiles[0].id],
  activeTabId: (Array.isArray(storedOpenFiles) && storedOpenFiles.length === 0)
    ? null
    : getItem(STORAGE_KEYS.ACTIVE_TAB, initialBrowserFiles[0]?.id || null),
  results: {},
  dirtyFiles: {},
  closedTabsHistory: [],
  pendingLineReveal: null,
  previewTabId: getItem(STORAGE_KEYS.PREVIEW_TAB, null),
  workspace: {
    name: null,
    handle: null,
    tree: null,
    git: { isGit: false, branch: null },
    isConnected: false,
    needsPermission: false,
    isSyncing: false,
    error: null,
  },
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_WORKSPACE":
      return { ...state, workspace: action.payload };

    case "UPDATE_WORKSPACE":
      return { ...state, workspace: { ...state.workspace, ...action.payload } };

    case "SET_WORKSPACE_FILES": {
      const { files, openFiles, activeTabId, dirtyFiles, previewTabId } = action.payload;
      return {
        ...state,
        files,
        openFiles: openFiles || (files.length > 0 ? [files[0].id] : []),
        activeTabId: activeTabId || (files.length > 0 ? files[0].id : null),
        dirtyFiles: dirtyFiles !== undefined ? dirtyFiles : state.dirtyFiles,
        previewTabId: previewTabId !== undefined ? previewTabId : state.previewTabId,
      };
    }

    case "MERGE_WORKSPACE_FILES": {
      const { diskFiles, openFiles: explicitOpen, activeTabId: explicitActive } = action.payload;
      // Preserve all current in-browser storage files
      const browserFiles = state.files.filter((f) => !f.isLocalDisk);
      const combinedFiles = [...diskFiles, ...browserFiles];

      const availableIds = new Set(combinedFiles.map((f) => f.id));
      const nextOpenFiles = explicitOpen || state.openFiles.filter((id) => availableIds.has(id));
      if (nextOpenFiles.length === 0 && combinedFiles.length > 0) {
        nextOpenFiles.push(diskFiles[0]?.id || combinedFiles[0].id);
      }
      const nextActiveId = explicitActive || (availableIds.has(state.activeTabId)
        ? state.activeTabId
        : (nextOpenFiles.length > 0 ? nextOpenFiles[0] : (diskFiles[0]?.id || combinedFiles[0]?.id)));

      return {
        ...state,
        files: combinedFiles,
        openFiles: nextOpenFiles,
        activeTabId: nextActiveId,
      };
    }

    case "DISCONNECT_WORKSPACE_FILES": {
      // Retain all in-browser storage files
      let browserFiles = state.files.filter((f) => !f.isLocalDisk);
      if (browserFiles.length === 0) {
        browserFiles = [defaultFile];
      }
      const availableIds = new Set(browserFiles.map((f) => f.id));
      const nextOpenFiles = state.openFiles.filter((id) => availableIds.has(id));
      if (nextOpenFiles.length === 0) {
        nextOpenFiles.push(browserFiles[0].id);
      }
      const nextActiveId = availableIds.has(state.activeTabId)
        ? state.activeTabId
        : nextOpenFiles[0];

      return {
        ...state,
        files: browserFiles,
        openFiles: nextOpenFiles,
        activeTabId: nextActiveId,
      };
    }

    case "ADD_FILE_COMPLETE": {
      const newFile = {
        id: action.payload.id || uuidv4(),
        name: action.payload.name,
        content: action.payload.content,
        lastSavedContent: action.payload.content,
        isLocalDisk: !!action.payload.isLocalDisk,
        fileHandle: action.payload.fileHandle || null,
        parentDirHandle: action.payload.parentDirHandle || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const shouldOpen = action.payload.open !== false;
      const nextClosedHistory = (state.closedTabsHistory || []).filter((id) => id !== newFile.id);
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

    case "ADD_LOADED_FILE": {
      const newFile = action.payload;
      const shouldOpen = true;
      const nextClosedHistory = (state.closedTabsHistory || []).filter((id) => id !== newFile.id);
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

    case "ATTACH_DISK_HANDLE": {
      const { id, name, fileHandle, parentDirHandle, relativePath } = action.payload;
      const files = state.files.map((f) =>
        f.id === id
          ? {
              ...f,
              name: name || f.name,
              relativePath: relativePath || (f.relativePath ? f.relativePath.replace(/[^/]+$/, name || f.name) : (name || f.name)),
              path: relativePath || (f.path ? f.path.replace(/[^/]+$/, name || f.name) : (name || f.name)),
              isLocalDisk: true,
              fileHandle: fileHandle || f.fileHandle,
              parentDirHandle: parentDirHandle || f.parentDirHandle,
              lastSavedContent: f.content,
            }
          : f
      );
      return {
        ...state,
        files,
        dirtyFiles: {
          ...state.dirtyFiles,
          [id]: false,
        },
      };
    }

    case "ADD_FILE": {
      const newFile = {
        id: uuidv4(),
        name: action.payload?.name || `Query_${state.files.length + 1}.sql`,
        content: action.payload?.content || "-- Write your Spark SQL here\n",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isLocalDisk: false,
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
      const isPreviewActive = state.previewTabId === action.payload;
      const nextPreviewTabId = isPreviewActive ? null : state.previewTabId;
      if (filtered.length === 0) {
        return { files: [defaultFile], openFiles: [defaultFile.id], activeTabId: defaultFile.id, results: {}, dirtyFiles: {}, closedTabsHistory: [], previewTabId: null };
      }
      const newActiveId =
        state.activeTabId === action.payload
          ? (filteredOpen.length > 0 ? filteredOpen[filteredOpen.length - 1] : null)
          : (filteredOpen.includes(state.activeTabId) ? state.activeTabId : (filteredOpen.length > 0 ? filteredOpen[0] : null));
      return { ...state, files: filtered, openFiles: filteredOpen, activeTabId: newActiveId, results: nextResults, dirtyFiles: nextDirty, closedTabsHistory: nextClosedHistory, previewTabId: nextPreviewTabId };
    }

    case "UPDATE_FILE_CONTENT": {
      const files = state.files.map((f) =>
        f.id === action.payload.id
          ? { ...f, content: action.payload.content, updatedAt: new Date().toISOString() }
          : f
      );
      const isPreviewActive = state.previewTabId === action.payload.id;
      return {
        ...state,
        files,
        dirtyFiles: {
          ...state.dirtyFiles,
          [action.payload.id]: action.payload.isDirty,
        },
        previewTabId: isPreviewActive ? null : state.previewTabId,
      };
    }

    case "UPDATE_FILE_FROM_DISK": {
      const { id, content, updatedAt } = action.payload;
      const files = state.files.map((f) =>
        f.id === id
          ? {
              ...f,
              content,
              lastSavedContent: content,
              updatedAt: updatedAt || new Date().toISOString(),
            }
          : f
      );
      return {
        ...state,
        files,
        dirtyFiles: {
          ...state.dirtyFiles,
          [id]: false,
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

    case "OPEN_SETTINGS_TAB": {
      const isOpen = state.openFiles.includes(SETTINGS_FILE_ID);
      return {
        ...state,
        openFiles: isOpen ? state.openFiles : [...state.openFiles, SETTINGS_FILE_ID],
        activeTabId: SETTINGS_FILE_ID,
      };
    }

    case "SET_RESULT": {
      const { id: fileId, result, executionId } = action.payload;
      const fileResults = state.results[fileId] || { list: [], activeResultId: null };
      
      let newList = [...fileResults.list];
      const existingIdx = newList.findIndex(item => item.id === executionId);
      
      const updatedItem = {
        id: executionId,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        ...result,
        commentName: result.sql ? extractSqlComment(result.sql) : "",
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

    case "RENAME_RESULT": {
      const { fileId, executionId, name } = action.payload;
      const fileResults = state.results[fileId] || { list: [], activeResultId: null };
      const newList = fileResults.list.map(item =>
        item.id === executionId ? { ...item, customName: name } : item
      );
      return {
        ...state,
        results: {
          ...state.results,
          [fileId]: {
            ...fileResults,
            list: newList
          }
        }
      };
    }

    case "OPEN_FILE": {
      const fileId = action.payload;
      const nextClosedHistory = (state.closedTabsHistory || []).filter((id) => id !== fileId);
      const isCurrentlyPreview = state.previewTabId === fileId;
      const nextPreviewTabId = isCurrentlyPreview ? null : state.previewTabId;
      if (state.openFiles.includes(fileId)) {
        return { ...state, activeTabId: fileId, previewTabId: nextPreviewTabId, closedTabsHistory: nextClosedHistory };
      }
      return {
        ...state,
        openFiles: [...state.openFiles, fileId],
        activeTabId: fileId,
        previewTabId: nextPreviewTabId,
        closedTabsHistory: nextClosedHistory,
      };
    }

    case "PREVIEW_FILE": {
      const fileId = action.payload;
      const nextClosedHistory = (state.closedTabsHistory || []).filter((id) => id !== fileId);
      if (state.openFiles.includes(fileId)) {
        return { ...state, activeTabId: fileId, closedTabsHistory: nextClosedHistory };
      }
      let nextOpenFiles = [...state.openFiles];
      if (state.previewTabId && state.openFiles.includes(state.previewTabId)) {
        const idx = state.openFiles.indexOf(state.previewTabId);
        nextOpenFiles[idx] = fileId;
      } else {
        nextOpenFiles.push(fileId);
      }
      return {
        ...state,
        openFiles: nextOpenFiles,
        activeTabId: fileId,
        previewTabId: fileId,
        closedTabsHistory: nextClosedHistory,
      };
    }

    case "PROMOTE_PREVIEW_TAB": {
      const fileId = action.payload;
      if (state.previewTabId === fileId) {
        return { ...state, previewTabId: null };
      }
      return state;
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

      const nextPreviewTabId = state.previewTabId === fileId ? null : state.previewTabId;

      return {
        ...state,
        files,
        openFiles: filteredOpen,
        activeTabId: newActiveId,
        dirtyFiles: nextDirty,
        closedTabsHistory: nextClosedHistory,
        previewTabId: nextPreviewTabId,
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
      const isPreviewDirty = state.previewTabId && state.dirtyFiles[state.previewTabId];
      const nextPreviewTabId = isPreviewDirty ? state.previewTabId : null;

      return {
        ...state,
        openFiles: dirtyOpen,
        activeTabId: newActiveId,
        closedTabsHistory: nextClosedHistory,
        previewTabId: nextPreviewTabId,
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

    case "SET_PENDING_LINE_REVEAL":
      return { ...state, pendingLineReveal: action.payload };

    case "CLEAR_PENDING_LINE_REVEAL":
      return { ...state, pendingLineReveal: null };

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

  const diskSaveTimeoutsRef = useRef({});
  const fileLastModifiedRef = useRef({});
  const isDiskCheckingRef = useRef(false);
  const lastDirCheckTimeRef = useRef(0);
  const filesRef = useRef(state.files);
  filesRef.current = state.files;

  const isFsSupported = isFileSystemAccessSupported();

  // Try to restore saved workspace handle from IndexedDB on startup
  useEffect(() => {
    if (!isFsSupported) return;

    let isMounted = true;

    async function checkSavedWorkspace() {
      const handle = await getWorkspaceHandleFromIDB();
      if (!handle || !isMounted) return;

      const status = await queryPermissionStatus(handle);
      if (status === "granted") {
        try {
          const git = await detectGitRepository(handle);
          const { flatFiles, tree } = await readDirectoryTreeAndFiles(handle, "", 4, state.files);
          for (const f of flatFiles) {
            if (f.lastModified && f.id) {
              fileLastModifiedRef.current[f.id] = f.lastModified;
            }
          }
          if (!isMounted) return;
          dispatch({
            type: "SET_WORKSPACE",
            payload: {
              name: handle.name,
              handle,
              tree,
              git,
              isConnected: true,
              needsPermission: false,
              isSyncing: false,
              error: null,
            },
          });
          if (flatFiles.length > 0) {
            dispatch({
              type: "MERGE_WORKSPACE_FILES",
              payload: {
                diskFiles: flatFiles,
              },
            });
          }
        } catch (err) {
          console.warn("Failed to auto-load workspace directory from IDB:", err);
        }
      } else {
        // Needs user gesture to prompt permission
        dispatch({
          type: "SET_WORKSPACE",
          payload: {
            name: handle.name,
            handle,
            tree: null,
            git: { isGit: false, branch: null },
            isConnected: false,
            needsPermission: true,
            isSyncing: false,
            error: null,
          },
        });
      }
    }

    checkSavedWorkspace();

    return () => {
      isMounted = false;
    };
  }, [isFsSupported]);

  useEffect(() => {
    localStorage.setItem("livy-ui-auto-save", JSON.stringify(autoSave));
    if (autoSave) {
      dispatch({ type: "CLEAR_ALL_DIRTY" });
    }
  }, [autoSave]);

  const toggleAutoSave = useCallback(() => setAutoSave((prev) => !prev), []);

  // Persist only in-browser files to localStorage (never store disk files which require live handles)
  useEffect(() => {
    const browserFiles = state.files
      .filter((f) => !f.isLocalDisk)
      .map(({ fileHandle, parentDirHandle, ...rest }) => rest);
    setItem(STORAGE_KEYS.SQL_FILES, browserFiles.length > 0 ? browserFiles : [defaultFile]);
  }, [state.files]);

  // Persist open files
  useEffect(() => {
    setItem(STORAGE_KEYS.OPEN_FILES, state.openFiles);
  }, [state.openFiles]);

  // Persist active tab
  useEffect(() => {
    setItem(STORAGE_KEYS.ACTIVE_TAB, state.activeTabId);
  }, [state.activeTabId]);

  // Persist preview tab
  useEffect(() => {
    if (state.previewTabId !== null) {
      setItem(STORAGE_KEYS.PREVIEW_TAB, state.previewTabId);
    } else {
      removeItem(STORAGE_KEYS.PREVIEW_TAB);
    }
  }, [state.previewTabId]);

  const allFiles = [...state.files, SETTINGS_FILE];
  const activeFile =
    state.openFiles.length > 0
      ? (state.openFiles.includes(state.activeTabId)
          ? allFiles.find((f) => f.id === state.activeTabId)
          : allFiles.find((f) => state.openFiles.includes(f.id))) || null
      : null;

  // Automatically heal active tab if previous disk file ID is not yet available (e.g. pending permission on startup)
  useEffect(() => {
    if (state.openFiles.length > 0) {
      const isActiveValid = state.openFiles.includes(state.activeTabId) && allFiles.some((f) => f.id === state.activeTabId);
      if (!isActiveValid) {
        const firstValidOpen = state.openFiles.find((id) => allFiles.some((f) => f.id === id));
        if (firstValidOpen) {
          dispatch({ type: "SET_ACTIVE_TAB", payload: firstValidOpen });
        } else if (state.activeTabId !== null) {
          dispatch({ type: "SET_ACTIVE_TAB", payload: null });
        }
      }
    } else if (state.activeTabId !== null) {
      dispatch({ type: "SET_ACTIVE_TAB", payload: null });
    }
  }, [state.files, state.openFiles, state.activeTabId]);

  const [promptCloseFileId, setPromptCloseFileId] = useState(null);

  const requestCloseFile = useCallback((id) => {
    if (!id) return;
    if (state.dirtyFiles[id]) {
      setPromptCloseFileId(id);
    } else {
      dispatch({ type: "CLOSE_FILE", payload: id });
    }
  }, [state.dirtyFiles]);

  // Debounced auto-save directly to disk
  const triggerDiskSave = useCallback((fileId, content) => {
    const file = filesRef.current.find((f) => f.id === fileId);
    if (!file || !file.fileHandle) return;

    if (diskSaveTimeoutsRef.current[fileId]) {
      clearTimeout(diskSaveTimeoutsRef.current[fileId]);
    }

    diskSaveTimeoutsRef.current[fileId] = setTimeout(async () => {
      try {
        const lastModified = await writeFileToHandle(file.fileHandle, content);
        fileLastModifiedRef.current[fileId] = lastModified;
      } catch (err) {
        console.warn(`Auto-save to disk failed for ${file.name}:`, err);
      }
    }, 600);
  }, []);

  const updateContent = useCallback((id, content) => {
    dispatch({ type: "UPDATE_FILE_CONTENT", payload: { id, content, isDirty: !autoSave } });
    if (autoSave) {
      triggerDiskSave(id, content);
    }
  }, [autoSave, triggerDiskSave]);

  const saveFile = useCallback(async (id) => {
    const file = filesRef.current.find((f) => f.id === id);
    dispatch({ type: "SAVE_FILE", payload: id });

    if (file?.fileHandle) {
      if (diskSaveTimeoutsRef.current[id]) {
        clearTimeout(diskSaveTimeoutsRef.current[id]);
      }
      try {
        const lastModified = await writeFileToHandle(file.fileHandle, file.content);
        fileLastModifiedRef.current[id] = lastModified;
      } catch (err) {
        console.error(`Save to disk failed for ${file.name}:`, err);
      }
    }
  }, []);

  // Open Local Workspace Folder
  const openWorkspaceFolder = useCallback(async () => {
    try {
      const { dirHandle, name, files: loadedFiles, tree, git } = await openLocalWorkspace();

      let activeFiles = loadedFiles;
      let activeTree = tree;

      if (activeFiles.length === 0) {
        // If empty folder, create an initial main.sql
        const initialHandle = await createFileInDirectory(dirHandle, "main.sql", "-- Write your Spark SQL here\nSELECT 1;\n");
        const initialFile = {
          id: uuidv4(),
          name: "main.sql",
          relativePath: "main.sql",
          path: "main.sql",
          content: "-- Write your Spark SQL here\nSELECT 1;\n",
          lastSavedContent: "-- Write your Spark SQL here\nSELECT 1;\n",
          isLocalDisk: true,
          fileHandle: initialHandle,
          parentDirHandle: dirHandle,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        activeFiles = [initialFile];
        activeTree = {
          name: dirHandle.name,
          kind: "directory",
          path: "",
          handle: dirHandle,
          children: [initialFile],
        };
      }

      for (const f of activeFiles) {
        if (f.lastModified && f.id) {
          fileLastModifiedRef.current[f.id] = f.lastModified;
        }
      }

      dispatch({
        type: "SET_WORKSPACE",
        payload: {
          name,
          handle: dirHandle,
          tree: activeTree,
          git,
          isConnected: true,
          needsPermission: false,
          isSyncing: false,
          error: null,
        },
      });

      dispatch({
        type: "MERGE_WORKSPACE_FILES",
        payload: {
          diskFiles: activeFiles,
          openFiles: activeFiles.length > 0 ? [activeFiles[0].id] : undefined,
          activeTabId: activeFiles.length > 0 ? activeFiles[0].id : undefined,
        },
      });

      return { success: true, count: activeFiles.length, name, git };
    } catch (err) {
      if (err.name === "AbortError") {
        return { aborted: true };
      }
      console.error("Failed to open local workspace:", err);
      throw err;
    }
  }, []);

  // Create New Local SQL Project / Repo
  const createNewWorkspaceProject = useCallback(async ({ templateType = "git", projectName = "spark-sql-workspace" } = {}) => {
    try {
      const dirHandle = await window.showDirectoryPicker({ mode: "readwrite" });
      await initializeWorkspaceTemplate(dirHandle, { templateType, projectName });
      await saveWorkspaceHandleToIDB(dirHandle);

      const git = await detectGitRepository(dirHandle);
      const { flatFiles, tree } = await readDirectoryTreeAndFiles(dirHandle);

      for (const f of flatFiles) {
        if (f.lastModified && f.id) {
          fileLastModifiedRef.current[f.id] = f.lastModified;
        }
      }

      dispatch({
        type: "SET_WORKSPACE",
        payload: {
          name: dirHandle.name,
          handle: dirHandle,
          tree,
          git,
          isConnected: true,
          needsPermission: false,
          isSyncing: false,
          error: null,
        },
      });

      dispatch({
        type: "MERGE_WORKSPACE_FILES",
        payload: {
          diskFiles: flatFiles,
          openFiles: flatFiles.length > 0 ? [flatFiles[0].id] : undefined,
          activeTabId: flatFiles.length > 0 ? flatFiles[0].id : undefined,
        },
      });

      return { success: true, count: flatFiles.length, name: dirHandle.name, git };
    } catch (err) {
      if (err.name === "AbortError") return { aborted: true };
      console.error("Create new workspace project failed:", err);
      throw err;
    }
  }, []);

  // Reconnect Workspace (grant permission on stored handle)
  const reconnectWorkspace = useCallback(async () => {
    if (!state.workspace.handle) return false;
    try {
      const granted = await verifyPermission(state.workspace.handle, true);
      if (!granted) {
        return false;
      }
      const git = await detectGitRepository(state.workspace.handle);
      const { flatFiles: loadedFiles, tree } = await readDirectoryTreeAndFiles(
        state.workspace.handle,
        "",
        4,
        state.files
      );

      for (const f of loadedFiles) {
        if (f.lastModified && f.id) {
          fileLastModifiedRef.current[f.id] = f.lastModified;
        }
      }

      dispatch({
        type: "SET_WORKSPACE",
        payload: {
          ...state.workspace,
          tree,
          git,
          isConnected: true,
          needsPermission: false,
        },
      });
      if (loadedFiles.length > 0) {
        dispatch({
          type: "MERGE_WORKSPACE_FILES",
          payload: {
            diskFiles: loadedFiles,
          },
        });
      }
      return true;
    } catch (err) {
      console.error("Reconnect workspace failed:", err);
      return false;
    }
  }, [state.workspace, state.files]);

  // Refresh Workspace (re-read from disk and keep browser storage files intact)
  const refreshWorkspace = useCallback(async () => {
    if (!state.workspace.handle || !state.workspace.isConnected) return;
    try {
      dispatch({ type: "UPDATE_WORKSPACE", payload: { isSyncing: true } });
      const { flatFiles: diskFiles, tree } = await readDirectoryTreeAndFiles(
        state.workspace.handle,
        "",
        4,
        state.files
      );
      const git = await detectGitRepository(state.workspace.handle);

      const existingById = new Map(state.files.map((f) => [f.id, f]));
      const existingByPath = new Map();
      for (const f of state.files) {
        if (!f) continue;
        if (f.relativePath) existingByPath.set(f.relativePath, f);
        if (f.path) existingByPath.set(f.path, f);
        existingByPath.set(f.name, f);
      }

      const nextDiskFiles = diskFiles.map((df) => {
        const existing = existingById.get(df.id) || existingByPath.get(df.relativePath) || existingByPath.get(df.name);
        if (existing) {
          const isDirty = !!state.dirtyFiles[existing.id];
          return {
            ...df,
            id: existing.id,
            content: isDirty ? existing.content : df.content,
            lastSavedContent: df.content,
            createdAt: existing.createdAt || df.createdAt,
            updatedAt: df.updatedAt,
          };
        }
        return df;
      });

      for (const f of nextDiskFiles) {
        if (f.lastModified && f.id) {
          fileLastModifiedRef.current[f.id] = f.lastModified;
        }
      }

      // Preserve all current in-browser storage files!
      const browserFiles = state.files.filter((f) => !f.isLocalDisk);
      const combinedFiles = [...nextDiskFiles, ...browserFiles];

      const availableIds = new Set(combinedFiles.map((f) => f.id));
      const nextOpenFiles = state.openFiles.filter((id) => availableIds.has(id));
      const nextActiveId = availableIds.has(state.activeTabId)
        ? state.activeTabId
        : (nextOpenFiles.length > 0 ? nextOpenFiles[0] : (nextDiskFiles[0]?.id || combinedFiles[0]?.id || null));

      dispatch({
        type: "UPDATE_WORKSPACE",
        payload: { tree, git, isSyncing: false },
      });

      dispatch({
        type: "SET_WORKSPACE_FILES",
        payload: {
          files: combinedFiles.length > 0 ? combinedFiles : [defaultFile],
          openFiles: nextOpenFiles.length > 0 ? nextOpenFiles : (combinedFiles[0] ? [combinedFiles[0].id] : [defaultFile.id]),
          activeTabId: nextActiveId || defaultFile.id,
          dirtyFiles: state.dirtyFiles,
          previewTabId: state.previewTabId,
        },
      });
    } catch (err) {
      console.error("Refresh workspace failed:", err);
      dispatch({ type: "UPDATE_WORKSPACE", payload: { isSyncing: false } });
    }
  }, [state.workspace, state.files, state.dirtyFiles, state.openFiles, state.activeTabId, state.previewTabId]);

  // Bi-directional external disk change detector
  const checkFilesForExternalChanges = useCallback(async () => {
    if (isDiskCheckingRef.current) return;
    if (!state.workspace.handle || !state.workspace.isConnected) return;
    isDiskCheckingRef.current = true;

    try {
      const diskFiles = state.files.filter((f) => f.fileHandle && f.isLocalDisk);

      for (const file of diskFiles) {
        // If file currently has unsaved in-memory typing in Livy UI, don't overwrite user's typing
        if (state.dirtyFiles[file.id]) continue;

        try {
          const diskFile = await file.fileHandle.getFile();
          const lastModified = diskFile.lastModified;
          const knownTimestamp = fileLastModifiedRef.current[file.id];

          if (!knownTimestamp) {
            fileLastModifiedRef.current[file.id] = lastModified;
            const newContent = await diskFile.text();
            if (newContent !== file.content) {
              dispatch({
                type: "UPDATE_FILE_FROM_DISK",
                payload: {
                  id: file.id,
                  content: newContent,
                  updatedAt: new Date(lastModified).toISOString(),
                },
              });
            }
            continue;
          }

          if (lastModified !== knownTimestamp) {
            fileLastModifiedRef.current[file.id] = lastModified;
            const newContent = await diskFile.text();

            if (newContent !== file.content) {
              dispatch({
                type: "UPDATE_FILE_FROM_DISK",
                payload: {
                  id: file.id,
                  content: newContent,
                  updatedAt: new Date(lastModified).toISOString(),
                },
              });
            }
          }
        } catch (fileErr) {
          // File may have been removed or handle expired
        }
      }

      // Check directory additions, removals, or git branch switches every 5 seconds
      const now = Date.now();
      if (now - lastDirCheckTimeRef.current > 5000) {
        lastDirCheckTimeRef.current = now;

        const git = await detectGitRepository(state.workspace.handle);
        if (git.isGit && git.branch !== state.workspace.git?.branch) {
          dispatch({
            type: "UPDATE_WORKSPACE",
            payload: { git },
          });
        }

        const { flatFiles: currentDiskFiles } = await readDirectoryTreeAndFiles(
          state.workspace.handle,
          "",
          4,
          state.files
        );

        const currentDiskStateFiles = state.files.filter((f) => f.isLocalDisk);
        const currentPaths = new Set(currentDiskStateFiles.map((f) => f.relativePath || f.name));
        const diskPaths = new Set(currentDiskFiles.map((f) => f.relativePath || f.name));

        const hasStructureChanged =
          currentPaths.size !== diskPaths.size ||
          [...diskPaths].some((p) => !currentPaths.has(p));

        if (hasStructureChanged) {
          await refreshWorkspace();
        }
      }
    } catch (err) {
      // Ignore background check errors
    } finally {
      isDiskCheckingRef.current = false;
    }
  }, [state.workspace.handle, state.workspace.isConnected, state.files, state.dirtyFiles, refreshWorkspace]);

  // 1. Bi-directional sync on window focus and visibility change
  useEffect(() => {
    if (!state.workspace.isConnected) return;

    const handleFocus = () => {
      checkFilesForExternalChanges();
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        checkFilesForExternalChanges();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [state.workspace.isConnected, checkFilesForExternalChanges]);

  // 2. Continuous lightweight background polling interval (every 1.5 seconds)
  useEffect(() => {
    if (!state.workspace.isConnected || !state.workspace.handle) return;

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        checkFilesForExternalChanges();
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [state.workspace.isConnected, state.workspace.handle, checkFilesForExternalChanges]);

  // 3. Native FileSystemObserver when supported by browser
  useEffect(() => {
    if (!state.workspace.isConnected || !state.workspace.handle) return;
    if (typeof window.FileSystemObserver === "undefined") return;

    let observer = null;
    try {
      observer = new window.FileSystemObserver(() => {
        checkFilesForExternalChanges();
      });
      observer.observe(state.workspace.handle, { recursive: true });
    } catch (err) {
      console.debug("FileSystemObserver not active, using polling/focus fallback:", err);
    }

    return () => {
      try {
        observer?.disconnect();
      } catch (e) {}
    };
  }, [state.workspace.isConnected, state.workspace.handle, checkFilesForExternalChanges]);

  // Create subfolder in workspace
  const createWorkspaceFolder = useCallback(async (parentDirHandle, folderName) => {
    const parent = parentDirHandle || state.workspace.handle;
    if (!parent) return;
    await createDirectoryInDirectory(parent, folderName);
    await refreshWorkspace();
  }, [state.workspace.handle, refreshWorkspace]);

  // Delete subfolder in workspace
  const deleteWorkspaceFolder = useCallback(async (parentDirHandle, folderName) => {
    const parent = parentDirHandle || state.workspace.handle;
    if (!parent) return;
    await deleteDirectoryFromDirectory(parent, folderName);
    await refreshWorkspace();
  }, [state.workspace.handle, refreshWorkspace]);

  // Add file to specific folder or root
  const addFileToFolder = useCallback(async (parentDirHandle, fileName, content) => {
    const parent = parentDirHandle || state.workspace.handle;
    const name = fileName || `Query_${state.files.length + 1}.sql`;
    const text = content || "-- Write your Spark SQL here\nSELECT 1;\n";
    const newId = uuidv4();

    let fileHandle = null;
    let isLocalDisk = false;

    if (state.workspace.isConnected && parent) {
      try {
        fileHandle = await createFileInDirectory(parent, name, text);
        isLocalDisk = true;
      } catch (err) {
        console.warn("Could not create file on disk:", err);
      }
    }

    dispatch({
      type: "ADD_FILE_COMPLETE",
      payload: {
        id: newId,
        name,
        content: text,
        isLocalDisk,
        fileHandle,
        parentDirHandle: parent,
        open: true,
      },
    });

    await refreshWorkspace();
  }, [state.workspace, state.files.length, refreshWorkspace]);

  // Disconnect Workspace (cleanly detaches local disk files while retaining all in-browser files)
  const disconnectWorkspace = useCallback(async () => {
    await clearWorkspaceHandleFromIDB();
    dispatch({
      type: "SET_WORKSPACE",
      payload: {
        name: null,
        handle: null,
        isConnected: false,
        needsPermission: false,
        isSyncing: false,
        error: null,
      },
    });
    dispatch({
      type: "DISCONNECT_WORKSPACE_FILES",
    });
  }, []);

  // Open single local file from disk
  const openSingleFile = useCallback(async () => {
    try {
      const fileData = await openSingleLocalFile();
      dispatch({ type: "ADD_LOADED_FILE", payload: fileData });
      return fileData;
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Open single file failed:", err);
      }
    }
  }, []);

  // Save As Local File on Disk
  const saveCurrentFileAs = useCallback(async (fileId) => {
    const targetId = fileId || state.activeTabId;
    const file = filesRef.current.find((f) => f.id === targetId);
    if (!file) return;

    try {
      const result = await saveFileAsLocalDisk(file.name, file.content);
      dispatch({
        type: "ATTACH_DISK_HANDLE",
        payload: {
          id: targetId,
          name: result.name,
          fileHandle: result.fileHandle,
        },
      });
      return result;
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Save file as disk failed:", err);
      }
    }
  }, [state.activeTabId]);

  // Add File (integrates with local disk if target is workspace, or browser storage if target is browser or disconnected)
  const addFile = useCallback(async (payload) => {
    const target = payload?.target; // 'browser' | 'workspace'
    const isBrowserTarget = target === "browser" || !state.workspace.isConnected || !state.workspace.handle;

    const fileName = payload?.name || `Query_${state.files.length + 1}.sql`;
    const content = payload?.content || "-- Write your Spark SQL here\nSELECT 1;\n";
    const newId = uuidv4();

    let fileHandle = null;
    let isLocalDisk = false;
    let parentDirHandle = null;

    if (!isBrowserTarget && state.workspace.isConnected && state.workspace.handle) {
      const parent = payload?.parentDirHandle || state.workspace.handle;
      try {
        fileHandle = await createFileInDirectory(parent, fileName, content);
        isLocalDisk = true;
        parentDirHandle = parent;
      } catch (err) {
        console.warn("Could not create file on disk:", err);
      }
    }

    dispatch({
      type: "ADD_FILE_COMPLETE",
      payload: {
        id: newId,
        name: fileName,
        content,
        isLocalDisk,
        fileHandle,
        parentDirHandle,
        open: payload?.open,
      },
    });

    if (isLocalDisk) {
      await refreshWorkspace();
    }
  }, [state.workspace, state.files.length, refreshWorkspace]);

  // Explicitly add an in-browser storage file
  const addBrowserFile = useCallback((payload) => {
    return addFile({ ...payload, target: "browser" });
  }, [addFile]);

  // Copy/save an in-browser file directly into the local workspace folder
  const saveBrowserFileToWorkspace = useCallback(async (fileId, targetFolderHandle) => {
    const file = filesRef.current.find((f) => f.id === fileId);
    if (!file || !state.workspace.isConnected || !state.workspace.handle) return null;
    const parent = targetFolderHandle || state.workspace.handle;

    // Check if a disk file with the same name already exists in workspace to avoid silent overwrite
    const existingDiskNames = new Set(
      state.files.filter((f) => f.isLocalDisk).map((f) => f.name.toLowerCase())
    );

    let targetName = file.name;
    if (existingDiskNames.has(targetName.toLowerCase())) {
      const base = file.name.replace(/\.sql$/i, "");
      let counter = 1;
      while (existingDiskNames.has(`${base}_copy${counter > 1 ? counter : ""}.sql`.toLowerCase())) {
        counter++;
      }
      targetName = `${base}_copy${counter > 1 ? counter : ""}.sql`;
    }

    try {
      const fileHandle = await createFileInDirectory(parent, targetName, file.content);
      await refreshWorkspace();
      return { fileHandle, name: targetName };
    } catch (err) {
      console.error("Failed to copy browser file to workspace:", err);
      throw err;
    }
  }, [state.files, state.workspace, refreshWorkspace]);

  // Remove File (deletes from local disk if in workspace mode and updates tree)
  const removeFile = useCallback(async (id) => {
    const file = state.files.find((f) => f.id === id);
    if (file?.isLocalDisk && (file.parentDirHandle || state.workspace.handle)) {
      try {
        await deleteFileFromDirectory(file.parentDirHandle || state.workspace.handle, file.name);
      } catch (err) {
        console.warn("Could not delete file from disk:", err);
      }
    }
    dispatch({ type: "REMOVE_FILE", payload: id });
    if (file?.isLocalDisk) {
      await refreshWorkspace();
    }
  }, [state.files, state.workspace.handle, refreshWorkspace]);

  // Rename File (renames on local disk if in workspace mode and keeps tree/path synced)
  const renameFile = useCallback(async (id, name) => {
    const file = state.files.find((f) => f.id === id);
    if (file?.isLocalDisk && (file.parentDirHandle || state.workspace.handle)) {
      try {
        const newHandle = await renameFileInDirectory(
          file.parentDirHandle || state.workspace.handle,
          file.name,
          name,
          file.content
        );
        if (newHandle) {
          const dirPrefix = file.relativePath && file.relativePath.includes("/")
            ? file.relativePath.substring(0, file.relativePath.lastIndexOf("/") + 1)
            : "";
          const newRelativePath = `${dirPrefix}${name}`;

          dispatch({
            type: "ATTACH_DISK_HANDLE",
            payload: { id, name, fileHandle: newHandle, relativePath: newRelativePath },
          });
          await refreshWorkspace();
          return;
        }
      } catch (err) {
        console.warn("Could not rename file on disk:", err);
      }
    }
    dispatch({ type: "RENAME_FILE", payload: { id, name } });
  }, [state.files, state.workspace.handle, refreshWorkspace]);

  const setActiveTab = useCallback((id) => dispatch({ type: "SET_ACTIVE_TAB", payload: id }), []);
  const setResult = useCallback((id, result, executionId) => dispatch({ type: "SET_RESULT", payload: { id, result, executionId } }), []);
  const selectResult = useCallback((fileId, executionId) => dispatch({ type: "SELECT_RESULT", payload: { fileId, executionId } }), []);
  const deleteResult = useCallback((fileId, executionId) => dispatch({ type: "DELETE_RESULT", payload: { fileId, executionId } }), []);
  const renameResult = useCallback((fileId, executionId, name) => dispatch({ type: "RENAME_RESULT", payload: { fileId, executionId, name } }), []);
  const clearFileResults = useCallback((fileId) => dispatch({ type: "CLEAR_FILE_RESULTS", payload: fileId }), []);
  const createResultSession = useCallback((fileId) => dispatch({ type: "CREATE_RESULT_SESSION", payload: fileId }), []);
  const openFile = useCallback((id) => dispatch({ type: "OPEN_FILE", payload: id }), []);
  const openSettingsTab = useCallback(() => dispatch({ type: "OPEN_SETTINGS_TAB" }), []);
  const previewFile = useCallback((id) => dispatch({ type: "PREVIEW_FILE", payload: id }), []);
  const promotePreviewTab = useCallback((id) => dispatch({ type: "PROMOTE_PREVIEW_TAB", payload: id }), []);
  const closeFile = useCallback((id) => {
    if (!id) return;
    dispatch({ type: "CLOSE_FILE", payload: id });
  }, []);
  const reorderFiles = useCallback((fromIndex, toIndex) => dispatch({ type: "REORDER_FILES", payload: { fromIndex, toIndex } }), []);

  const restoreLastClosedTab = useCallback(() => dispatch({ type: "RESTORE_LAST_CLOSED_TAB" }), []);

  const setPendingLineReveal = useCallback((fileId, lineNumber) => {
    dispatch({ type: "SET_PENDING_LINE_REVEAL", payload: { fileId, lineNumber } });
  }, []);

  const clearPendingLineReveal = useCallback(() => {
    dispatch({ type: "CLEAR_PENDING_LINE_REVEAL" });
  }, []);

  const closeAllFiles = useCallback(() => {
    const dirtyOpen = state.openFiles.filter(id => state.dirtyFiles[id]);
    dispatch({ type: "CLOSE_ALL_FILES" });
    if (dirtyOpen.length > 0) {
      setPromptCloseFileId(dirtyOpen[0]);
    }
  }, [state.openFiles, state.dirtyFiles]);

  const fileResults = (state.activeTabId && state.results[state.activeTabId]) || { list: [], activeResultId: null };
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
    pendingLineReveal: state.pendingLineReveal,
    previewTabId: state.previewTabId,
    workspace: state.workspace,
    isFsSupported,
    setPendingLineReveal,
    clearPendingLineReveal,
    previewFile,
    promotePreviewTab,
    addFile,
    removeFile,
    updateContent,
    renameFile,
    setActiveTab,
    setResult,
    selectResult,
    deleteResult,
    renameResult,
    clearFileResults,
    createResultSession,
    openFile,
    openSettingsTab,
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
    addBrowserFile,
    saveBrowserFileToWorkspace,
    // File system sync methods
    openWorkspaceFolder,
    createNewWorkspaceProject,
    reconnectWorkspace,
    refreshWorkspace,
    disconnectWorkspace,
    createWorkspaceFolder,
    deleteWorkspaceFolder,
    addFileToFolder,
    openSingleFile,
    saveCurrentFileAs,
  };

  return <SqlFilesContext.Provider value={value}>{children}</SqlFilesContext.Provider>;
}

export function useSqlFiles() {
  const ctx = useContext(SqlFilesContext);
  if (!ctx) throw new Error("useSqlFiles must be used within SqlFilesProvider");
  return ctx;
}
