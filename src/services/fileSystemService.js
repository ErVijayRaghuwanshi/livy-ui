import { v4 as uuidv4 } from "uuid";

const DB_NAME = "livy-ui-fs";
const STORE_NAME = "workspace_handles";
const DB_VERSION = 1;

/**
 * Checks if the browser supports the File System Access API
 */
export function isFileSystemAccessSupported() {
  return (
    typeof window !== "undefined" &&
    "showDirectoryPicker" in window &&
    "showOpenFilePicker" in window &&
    "showSaveFilePicker" in window
  );
}

/**
 * Open IndexedDB instance for handle persistence
 */
function openDB() {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !("indexedDB" in window)) {
      return reject(new Error("IndexedDB is not supported"));
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Persist the workspace directory handle into IndexedDB
 */
export async function saveWorkspaceHandleToIDB(handle) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(handle, "active_workspace");
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error("Failed to save workspace handle to IndexedDB:", err);
  }
}

/**
 * Retrieve the persisted workspace directory handle from IndexedDB
 */
export async function getWorkspaceHandleFromIDB() {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get("active_workspace");
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("Failed to get workspace handle from IndexedDB:", err);
    return null;
  }
}

/**
 * Remove the persisted workspace directory handle from IndexedDB
 */
export async function clearWorkspaceHandleFromIDB() {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete("active_workspace");
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("Failed to clear workspace handle from IndexedDB:", err);
  }
}

/**
 * Verify or request permission on a handle (directory or file)
 */
export async function verifyPermission(handle, readWrite = true) {
  if (!handle) return false;
  const options = { mode: readWrite ? "readwrite" : "read" };
  try {
    const current = await handle.queryPermission(options);
    if (current === "granted") {
      return true;
    }
    const requested = await handle.requestPermission(options);
    return requested === "granted";
  } catch (err) {
    console.warn("Permission check/request failed:", err);
    return false;
  }
}

/**
 * Query permission status without prompting
 */
export async function queryPermissionStatus(handle, readWrite = true) {
  if (!handle) return "denied";
  try {
    return await handle.queryPermission({ mode: readWrite ? "readwrite" : "read" });
  } catch (err) {
    return "denied";
  }
}

/**
 * Detect if a directory handle is a Git repository and extract the current branch
 */
export async function detectGitRepository(dirHandle) {
  if (!dirHandle) return { isGit: false, branch: null };
  try {
    const gitDir = await dirHandle.getDirectoryHandle(".git");
    const headHandle = await gitDir.getFileHandle("HEAD");
    const headFile = await headHandle.getFile();
    const text = (await headFile.text()).trim();

    let branch = "HEAD";
    if (text.startsWith("ref: refs/heads/")) {
      branch = text.replace("ref: refs/heads/", "").trim();
    } else if (text.length >= 7) {
      branch = text.substring(0, 7); // detached commit sha
    }

    return {
      isGit: true,
      branch,
    };
  } catch (err) {
    // .git might not exist or browser security policy may restrict reading .git folder
    return {
      isGit: false,
      branch: null,
      error: err.name,
    };
  }
}

const IGNORED_DIRS = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  "target",
  ".idea",
  ".vscode",
  ".next",
  ".cache",
  ".parcel-cache",
  ".system_generated",
]);

/**
 * Recursively reads directory tree and flat files list
 */
export async function readDirectoryTreeAndFiles(dirHandle, pathPrefix = "", maxDepth = 4, existingFiles = []) {
  const flatFiles = [];
  const existingMap = new Map();
  if (Array.isArray(existingFiles)) {
    for (const f of existingFiles) {
      if (!f) continue;
      if (f.relativePath) existingMap.set(f.relativePath, f.id);
      if (f.path) existingMap.set(f.path, f.id);
      if (f.name) existingMap.set(f.name, f.id);
    }
  }

  async function traverse(currentDirHandle, currentPath, depth) {
    const children = [];
    if (depth > maxDepth) return children;

    const entries = [];
    for await (const [name, entry] of currentDirHandle.entries()) {
      entries.push({ name, entry });
    }

    // Sort folders first, then files alphabetically
    entries.sort((a, b) => {
      if (a.entry.kind === b.entry.kind) {
        return a.name.localeCompare(b.name);
      }
      return a.entry.kind === "directory" ? -1 : 1;
    });

    for (const { name, entry } of entries) {
      const nextPath = currentPath ? `${currentPath}/${name}` : name;

      if (entry.kind === "directory") {
        if (!IGNORED_DIRS.has(name) && !name.startsWith(".")) {
          const subChildren = await traverse(entry, nextPath, depth + 1);
          children.push({
            id: `dir-${nextPath}`,
            name,
            kind: "directory",
            path: nextPath,
            handle: entry,
            parentHandle: currentDirHandle,
            children: subChildren,
          });
        }
      } else if (entry.kind === "file") {
        const lower = name.toLowerCase();
        if (
          lower.endsWith(".sql") ||
          lower.endsWith(".sparksql") ||
          lower.endsWith(".hql") ||
          lower.endsWith(".py") ||
          lower.endsWith(".md") ||
          lower.endsWith(".txt")
        ) {
          try {
            const file = await entry.getFile();
            const content = await file.text();
            const stableId = existingMap.get(nextPath) || existingMap.get(name) || `file-${nextPath}`;
            const fileObj = {
              id: stableId,
              name,
              relativePath: nextPath,
              path: nextPath,
              kind: "file",
              content,
              lastSavedContent: content,
              isLocalDisk: true,
              fileHandle: entry,
              parentDirHandle: currentDirHandle,
              lastModified: file.lastModified,
              createdAt: new Date(file.lastModified).toISOString(),
              updatedAt: new Date(file.lastModified).toISOString(),
            };
            children.push(fileObj);
            flatFiles.push(fileObj);
          } catch (e) {
            console.warn(`Could not read file ${name}:`, e);
          }
        }
      }
    }

    return children;
  }

  const rootChildren = await traverse(dirHandle, pathPrefix, 1);
  return {
    flatFiles,
    tree: {
      name: dirHandle.name,
      kind: "directory",
      path: "",
      handle: dirHandle,
      children: rootChildren,
    },
  };
}

/**
 * Backwards compatibility helper
 */
export async function readDirectoryRecursive(dirHandle, pathPrefix = "", maxDepth = 4, existingFiles = []) {
  const result = await readDirectoryTreeAndFiles(dirHandle, pathPrefix, maxDepth, existingFiles);
  return result.flatFiles;
}

/**
 * Write string content to a FileSystemFileHandle
 */
export async function writeFileToHandle(fileHandle, content) {
  if (!fileHandle) throw new Error("No file handle provided");
  const writable = await fileHandle.createWritable();
  await writable.write(content);
  await writable.close();
  try {
    const file = await fileHandle.getFile();
    return file.lastModified;
  } catch (err) {
    return Date.now();
  }
}

/**
 * Create a new file in a directory handle and write initial content
 */
export async function createFileInDirectory(dirHandle, fileName, content = "-- Write your Spark SQL here\nSELECT 1;\n") {
  if (!dirHandle) throw new Error("No directory handle provided");
  const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
  await writeFileToHandle(fileHandle, content);
  return fileHandle;
}

/**
 * Create a new directory inside a parent directory handle
 */
export async function createDirectoryInDirectory(parentDirHandle, dirName) {
  if (!parentDirHandle) throw new Error("No parent directory handle provided");
  return await parentDirHandle.getDirectoryHandle(dirName, { create: true });
}

/**
 * Delete a file in a directory handle
 */
export async function deleteFileFromDirectory(dirHandle, fileName) {
  if (!dirHandle) throw new Error("No directory handle provided");
  await dirHandle.removeEntry(fileName);
}

/**
 * Delete a directory in a directory handle recursively
 */
export async function deleteDirectoryFromDirectory(parentDirHandle, dirName) {
  if (!parentDirHandle) throw new Error("No parent directory handle provided");
  await parentDirHandle.removeEntry(dirName, { recursive: true });
}

/**
 * Rename a file in a directory handle (creates new file, copies content, removes old)
 */
export async function renameFileInDirectory(dirHandle, oldName, newName, content) {
  if (!dirHandle) throw new Error("No directory handle provided");
  if (oldName === newName) return null;

  const newHandle = await dirHandle.getFileHandle(newName, { create: true });
  await writeFileToHandle(newHandle, content);

  try {
    await dirHandle.removeEntry(oldName);
  } catch (err) {
    console.warn(`Could not remove old file "${oldName}" during rename:`, err);
  }

  return newHandle;
}

/**
 * Initialize a SQL workspace template in a chosen directory
 */
export async function initializeWorkspaceTemplate(dirHandle, { templateType = "standard", projectName = "spark-sql-workspace" } = {}) {
  if (!dirHandle) throw new Error("No directory handle provided");

  // Create queries directory
  const queriesDir = await dirHandle.getDirectoryHandle("queries", { create: true });
  await createFileInDirectory(
    queriesDir,
    "01_sample_query.sql",
    `-- Spark SQL Sample Query
-- Run this against your Livy server session

SELECT 
  current_date() AS today,
  current_timestamp() AS now,
  'Hello from Livy UI Local Sync' AS greeting;
`
  );

  // If Git template, add .gitignore, ddl folder, and README.md
  if (templateType === "git") {
    const ddlDir = await dirHandle.getDirectoryHandle("ddl", { create: true });
    await createFileInDirectory(
      ddlDir,
      "schema_setup.sql",
      `-- Spark DDL Table Setup
-- CREATE DATABASE IF NOT EXISTS analytics;
-- USE analytics;

CREATE TABLE IF NOT EXISTS sample_metrics (
  id BIGINT,
  event_time TIMESTAMP,
  metric_name STRING,
  metric_value DOUBLE
) USING parquet;
`
    );

    const gitignoreHandle = await dirHandle.getFileHandle(".gitignore", { create: true });
    await writeFileToHandle(
      gitignoreHandle,
      `# Livy UI & Local Development
.DS_Store
*.tmp
results/
.spark-staging/
`
    );

    const readmeHandle = await dirHandle.getFileHandle("README.md", { create: true });
    await writeFileToHandle(
      readmeHandle,
      `# ${projectName}

Spark SQL workspace created and synchronized with [Livy UI](https://github.com/ErVijayRaghuwanshi/livy-ui).

## Directory Structure
- \`queries/\` - Interactive analytical queries and reports
- \`ddl/\` - Table definitions, schemas, and migrations
`
    );
  } else {
    const readmeHandle = await dirHandle.getFileHandle("README.md", { create: true });
    await writeFileToHandle(
      readmeHandle,
      `# ${projectName}

Spark SQL workspace managed with Livy UI.
`
    );
  }
}

/**
 * Prompt user to select a local directory and read its SQL files & tree
 */
export async function openLocalWorkspace() {
  if (!("showDirectoryPicker" in window)) {
    throw new Error("File System Access API (showDirectoryPicker) is not supported in this browser.");
  }
  const dirHandle = await window.showDirectoryPicker({
    mode: "readwrite",
  });
  await saveWorkspaceHandleToIDB(dirHandle);

  const gitInfo = await detectGitRepository(dirHandle);
  const { flatFiles, tree } = await readDirectoryTreeAndFiles(dirHandle);

  return {
    dirHandle,
    name: dirHandle.name,
    files: flatFiles,
    tree,
    git: gitInfo,
  };
}

/**
 * Prompt user to pick a single local file
 */
export async function openSingleLocalFile() {
  if (!("showOpenFilePicker" in window)) {
    throw new Error("File System Access API (showOpenFilePicker) is not supported in this browser.");
  }
  const [fileHandle] = await window.showOpenFilePicker({
    types: [
      {
        description: "SQL Files (*.sql, *.sparksql, *.hql)",
        accept: {
          "text/sql": [".sql", ".sparksql", ".hql"],
          "text/plain": [".sql", ".txt"],
        },
      },
    ],
    multiple: false,
  });

  const file = await fileHandle.getFile();
  const content = await file.text();
  return {
    id: uuidv4(),
    name: file.name,
    relativePath: file.name,
    path: file.name,
    content,
    lastSavedContent: content,
    isLocalDisk: true,
    fileHandle,
    lastModified: file.lastModified,
    createdAt: new Date(file.lastModified).toISOString(),
    updatedAt: new Date(file.lastModified).toISOString(),
  };
}

/**
 * Prompt user to save as a local file on disk
 */
export async function saveFileAsLocalDisk(suggestedName, content) {
  if (!("showSaveFilePicker" in window)) {
    throw new Error("File System Access API (showSaveFilePicker) is not supported in this browser.");
  }
  const fileHandle = await window.showSaveFilePicker({
    suggestedName: suggestedName || "query.sql",
    types: [
      {
        description: "SQL File (*.sql)",
        accept: {
          "text/sql": [".sql"],
        },
      },
    ],
  });

  await writeFileToHandle(fileHandle, content);
  const file = await fileHandle.getFile();
  return {
    name: file.name,
    fileHandle,
  };
}
