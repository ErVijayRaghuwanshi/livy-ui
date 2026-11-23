/**
 * Client-side Ollama HTTP & Streaming Client
 * Interacts directly from browser to Ollama daemon (e.g. http://localhost:11434).
 */

export function cleanHostUrl(rawUrl = "") {
  return (rawUrl || "http://localhost:11434").trim().replace(/\/+$/, "");
}

/**
 * Automatically fetch all available chat/completion models installed in Ollama.
 * Queries native /api/tags and falls back to /v1/models if needed.
 */
export async function fetchOllamaModels(hostUrl = "http://localhost:11434") {
  const base = cleanHostUrl(hostUrl);

  // 1. Primary: Native Ollama /api/tags
  try {
    const res = await fetch(`${base}/api/tags`, {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (res.ok) {
      const data = await res.json();
      const rawList = Array.isArray(data.models) ? data.models : [];

      const models = rawList
        .filter((m) => {
          // Exclude pure embedding models that cannot do chat completions
          const caps = Array.isArray(m.capabilities) ? m.capabilities : [];
          if (caps.length > 0 && caps.includes("embedding") && !caps.includes("completion")) {
            return false;
          }
          const name = (m.name || m.model || "").toLowerCase();
          if (name.includes("embed") || name.includes("bert")) {
            return false;
          }
          return true;
        })
        .map((m) => {
          const rawName = m.name || m.model;
          const paramSize = m.details?.parameter_size ? ` (${m.details.parameter_size})` : "";
          const caps = Array.isArray(m.capabilities) ? m.capabilities : [];
          const supportsTools =
            caps.includes("tools") ||
            rawName.includes("nemotron") ||
            rawName.includes("qwen2.5") ||
            rawName.includes("llama3.1") ||
            rawName.includes("mistral");

          return {
            id: rawName,
            name: `${rawName}${paramSize}`,
            model: rawName,
            displayName: `${rawName}${paramSize}`,
            size: m.size,
            details: m.details || {},
            capabilities: caps,
            supportsTools,
          };
        });

      return { ok: true, models };
    }
  } catch (err) {
    console.warn(`[OllamaClient] /api/tags failed on ${base}, attempting /v1/models fallback:`, err);
  }

  // 2. Fallback: OpenAI-compatible /v1/models
  try {
    const res = await fetch(`${base}/v1/models`, {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (res.ok) {
      const data = await res.json();
      const rawList = Array.isArray(data.data) ? data.data : [];

      const models = rawList
        .filter((m) => !m.id?.toLowerCase().includes("embed"))
        .map((m) => ({
          id: m.id,
          name: m.id,
          model: m.id,
          displayName: m.id,
          supportsTools:
            m.id.includes("nemotron") ||
            m.id.includes("qwen2.5") ||
            m.id.includes("llama3.1") ||
            m.id.includes("mistral"),
        }));

      return { ok: true, models };
    }
  } catch (err2) {
    console.warn(`[OllamaClient] Both endpoints failed on ${base}:`, err2);
  }

  return { ok: false, error: "Unable to connect to Ollama", models: [] };
}

/**
 * Pings Ollama endpoint to verify connectivity & CORS
 */
export async function checkOllamaHealth(hostUrl = "http://localhost:11434") {
  const base = cleanHostUrl(hostUrl);
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${base}/api/tags`, {
      method: "GET",
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return { ok: res.ok, status: res.status };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Streams chat completion using the OpenAI-compatible /v1/chat/completions endpoint
 *
 * @param {Object} params
 * @param {string} params.hostUrl - Ollama base URL
 * @param {string} params.model - Model name (e.g. "nemotron-3-nano:4b")
 * @param {Array} params.messages - [{ role: "system"|"user"|"assistant"|"tool", content, tool_calls, tool_call_id }]
 * @param {Array} [params.tools] - OpenAI tools JSON schema
 * @param {Function} [params.onChunk] - Callback for streaming text delta (content: string)
 * @param {Function} [params.onReasoningChunk] - Callback for streaming thinking/reasoning delta (reasoning: string)
 * @param {AbortSignal} [params.signal] - AbortSignal for user cancellation
 * @returns {Promise<{ content: string, reasoning: string, toolCalls: Array }>}
 */
export async function streamOllamaChat({
  hostUrl = "http://localhost:11434",
  model,
  messages = [],
  tools = null,
  ollamaThinking = "disabled",
  onChunk,
  onReasoningChunk,
  signal,
}) {
  const base = cleanHostUrl(hostUrl);
  const bodyPayload = {
    model,
    messages,
    stream: true,
  };

  if (Array.isArray(tools) && tools.length > 0) {
    bodyPayload.tools = tools;
  }

  // Thinking / Reasoning control for Ollama
  if (ollamaThinking === "disabled" || ollamaThinking === false) {
    bodyPayload.think = false;
    bodyPayload.reasoning_effort = "none";
  } else if (ollamaThinking === "enabled" || ollamaThinking === true) {
    bodyPayload.think = true;
    bodyPayload.reasoning_effort = "medium";
  }

  const response = await fetch(`${base}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify(bodyPayload),
    signal,
  });

  if (!response.ok) {
    let errBody = "";
    try {
      errBody = await response.text();
    } catch {}
    throw new Error(`Ollama Error (${response.status}): ${errBody || response.statusText}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");

  let fullContent = "";
  let fullReasoning = "";
  let accumulatedToolCalls = [];
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop(); // keep partial line for next iteration

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith(":")) continue;
      if (trimmed === "data: [DONE]") continue;

      if (trimmed.startsWith("data: ")) {
        const jsonStr = trimmed.slice(6);
        try {
          const parsed = JSON.parse(jsonStr);
          const choice = parsed.choices?.[0];
          if (!choice) continue;

          const delta = choice.delta || {};

          // 1. Thinking / reasoning tokens (e.g. Nemotron, DeepSeek)
          if (delta.reasoning_content || delta.reasoning) {
            const rChunk = delta.reasoning_content || delta.reasoning;
            fullReasoning += rChunk;
            onReasoningChunk?.(rChunk);
          }

          // 2. Regular message content tokens
          if (delta.content) {
            fullContent += delta.content;
            onChunk?.(delta.content);
          }

          // 3. Streaming tool calls
          if (Array.isArray(delta.tool_calls)) {
            for (const tc of delta.tool_calls) {
              const idx = tc.index ?? accumulatedToolCalls.length;
              if (!accumulatedToolCalls[idx]) {
                accumulatedToolCalls[idx] = {
                  id: tc.id || `call_${idx}_${Date.now()}`,
                  type: tc.type || "function",
                  function: {
                    name: tc.function?.name || "",
                    arguments: tc.function?.arguments || "",
                  },
                };
              } else {
                if (tc.function?.name) {
                  accumulatedToolCalls[idx].function.name += tc.function.name;
                }
                if (tc.function?.arguments) {
                  accumulatedToolCalls[idx].function.arguments += tc.function.arguments;
                }
              }
            }
          }
        } catch {
          // ignore individual chunk parse error and proceed
        }
      }
    }
  }

  // Filter and sanitize completed tool calls
  const validToolCalls = accumulatedToolCalls.filter(
    (tc) => tc && tc.function && tc.function.name
  );

  return {
    content: fullContent,
    reasoning: fullReasoning,
    toolCalls: validToolCalls,
  };
}
