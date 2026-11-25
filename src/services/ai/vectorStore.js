/**
 * Client-Side IndexedDB Vector & BM25 Memory Store for Livy UI AI Copilot.
 * Zero external dependencies. Supports:
 * - Instant BM25 / TF-IDF lexical retrieval (works with 0 downloads & offline)
 * - Cosine similarity over Float32Array embeddings (when opt-in semantic embeddings are enabled)
 */

const DB_NAME = "livy-ui-vector-memory";
const DB_VERSION = 1;
const STORE_NAME = "messages";

let dbPromise = null;

function openVectorDb() {
  if (typeof indexedDB === "undefined") {
    return Promise.resolve(null);
  }
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve) => {
    try {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
          store.createIndex("turnIndex", "turnIndex", { unique: false });
          store.createIndex("timestamp", "timestamp", { unique: false });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });

  return dbPromise;
}

function tokenize(text = "") {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 2);
}

function computeBm25Scores(queryTokens, docs) {
  if (queryTokens.length === 0 || docs.length === 0) return new Map();

  const k1 = 1.5;
  const b = 0.75;
  const docTokensList = docs.map((d) => tokenize(d.content));
  const avgDl = docTokensList.reduce((sum, t) => sum + t.length, 0) / docs.length || 1;

  const df = new Map();
  for (const tokens of docTokensList) {
    const unique = new Set(tokens);
    for (const t of unique) {
      df.set(t, (df.get(t) || 0) + 1);
    }
  }

  const scores = new Map();
  const N = docs.length;

  docs.forEach((doc, idx) => {
    const tokens = docTokensList[idx];
    const dl = tokens.length || 1;
    const tf = new Map();
    for (const t of tokens) {
      tf.set(t, (tf.get(t) || 0) + 1);
    }

    let score = 0;
    for (const qt of queryTokens) {
      const f = tf.get(qt) || 0;
      if (f === 0) continue;
      const n = df.get(qt) || 0;
      const idf = Math.log(1 + (N - n + 0.5) / (n + 0.5));
      score += idf * ((f * (k1 + 1)) / (f + k1 * (1 - b + b * (dl / avgDl))));
    }
    scores.set(doc.id, score);
  });

  return scores;
}

function cosineSimilarity(a, b) {
  if (!a || !b || a.length !== b.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom > 0 ? dot / denom : 0;
}

export async function upsertMessageVector(record) {
  const db = await openVectorDb();
  if (!db || !record?.id || !record?.content) return false;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.put({
        id: record.id,
        turnIndex: record.turnIndex ?? 0,
        role: record.role || "user",
        content: String(record.content).slice(0, 6000),
        timestamp: record.timestamp || new Date().toISOString(),
        embedding: record.embedding ? Array.from(record.embedding) : null,
        embeddingModel: record.embeddingModel || null,
      });
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

export async function getAllStoredMessages() {
  const db = await openVectorDb();
  if (!db) return [];

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(Array.isArray(req.result) ? req.result : []);
      req.onerror = () => resolve([]);
    } catch {
      resolve([]);
    }
  });
}

/**
 * Hybrid search across IndexedDB messages using BM25 + optional cosine similarity.
 */
export async function searchMemory(
  query,
  { topK = 4, excludeIds = new Set(), queryEmbedding = null, embeddingModel = null } = {}
) {
  const allDocs = await getAllStoredMessages();
  const candidates = allDocs.filter((d) => d && d.id && !excludeIds.has(d.id) && d.content);
  if (candidates.length === 0) return [];

  const queryTokens = tokenize(query);
  const bm25Map = computeBm25Scores(queryTokens, candidates);
  let maxBm25 = 0;
  for (const val of bm25Map.values()) {
    if (val > maxBm25) maxBm25 = val;
  }

  const scored = candidates.map((doc) => {
    const rawBm25 = bm25Map.get(doc.id) || 0;
    const normBm25 = maxBm25 > 0 ? rawBm25 / maxBm25 : 0;

    let sim = 0;
    if (
      queryEmbedding &&
      Array.isArray(doc.embedding) &&
      doc.embedding.length === queryEmbedding.length &&
      (!embeddingModel || doc.embeddingModel === embeddingModel)
    ) {
      sim = Math.max(0, cosineSimilarity(queryEmbedding, doc.embedding));
    }

    // Blend cosine similarity (70%) + BM25 (30%) when vector is available, otherwise pure BM25
    const score = sim > 0 ? 0.7 * sim + 0.3 * normBm25 : normBm25;
    return { doc, score };
  });

  return scored
    .filter((item) => item.score > 0.08)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((item) => item.doc);
}

export async function clearMemory() {
  const db = await openVectorDb();
  if (!db) return false;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).clear();
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}
