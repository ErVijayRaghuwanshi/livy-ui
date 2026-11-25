/**
 * Lazy Client for In-Browser Semantic Embeddings.
 * Zero network or worker overhead unless explicitly enabled via Settings (ai.semanticEmbeddings).
 */

export const SEMANTIC_EMBEDDING_MODEL = "Xenova/all-MiniLM-L6-v2";

let workerInstance = null;
let requestIdCounter = 0;
const pendingRequests = new Map();

function ensureWorker() {
  if (typeof Worker === "undefined") return null;
  if (!workerInstance) {
    workerInstance = new Worker(new URL("./embeddingWorker.js", import.meta.url), {
      type: "module",
    });
    workerInstance.onmessage = (e) => {
      const { type, id, vector, error } = e.data || {};
      if (type === "result" && pendingRequests.has(id)) {
        const { resolve } = pendingRequests.get(id);
        pendingRequests.delete(id);
        resolve(vector);
      } else if (type === "error" && pendingRequests.has(id)) {
        const { resolve } = pendingRequests.get(id);
        pendingRequests.delete(id);
        console.warn("[EmbeddingClient]", error);
        resolve(null);
      }
    };
    workerInstance.onerror = () => {
      for (const { resolve } of pendingRequests.values()) {
        resolve(null);
      }
      pendingRequests.clear();
    };
  }
  return workerInstance;
}

/**
 * Generates a normalized 384-dim embedding vector ONLY when enabled.
 * Resolves to null if disabled or if worker fails, allowing seamless BM25 fallback.
 */
export function generateEmbedding(text, enabled = false) {
  if (!enabled || !text || !String(text).trim()) {
    return Promise.resolve(null);
  }
  const worker = ensureWorker();
  if (!worker) return Promise.resolve(null);

  return new Promise((resolve) => {
    const id = ++requestIdCounter;
    const timeout = setTimeout(() => {
      if (pendingRequests.has(id)) {
        pendingRequests.delete(id);
        resolve(null);
      }
    }, 15000);

    pendingRequests.set(id, {
      resolve: (vec) => {
        clearTimeout(timeout);
        resolve(vec);
      },
    });

    worker.postMessage({
      id,
      type: "embed",
      text: String(text).slice(0, 2000),
    });
  });
}

export function terminateEmbeddingWorker() {
  if (workerInstance) {
    workerInstance.terminate();
    workerInstance = null;
  }
  pendingRequests.clear();
}
