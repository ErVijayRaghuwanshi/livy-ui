/**
 * Lazy Web Worker for In-Browser Semantic Embeddings (Xenova/all-MiniLM-L6-v2).
 * Only instantiated and downloaded when the user explicitly enables ai.semanticEmbeddings.
 */

let extractorPromise = null;
const MODEL_ID = "Xenova/all-MiniLM-L6-v2";

async function getExtractor() {
  if (!extractorPromise) {
    extractorPromise = (async () => {
      const { pipeline, env } = await import(
        /* @vite-ignore */ "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3/dist/transformers.min.js"
      );
      env.allowLocalModels = false;
      return await pipeline("feature-extraction", MODEL_ID, {
        dtype: "q8",
        progress_callback: (info) => {
          self.postMessage({ type: "progress", info });
        },
      });
    })();
  }
  return extractorPromise;
}

self.onmessage = async (event) => {
  const { id, type, text } = event.data || {};
  if (type !== "embed" || !text) return;

  try {
    const extractor = await getExtractor();
    const output = await extractor(text, { pooling: "mean", normalize: true });
    const vector = Array.from(output.data || []);
    self.postMessage({ type: "result", id, vector, model: MODEL_ID });
  } catch (err) {
    self.postMessage({ type: "error", id, error: err?.message || "Embedding failed" });
  }
};
