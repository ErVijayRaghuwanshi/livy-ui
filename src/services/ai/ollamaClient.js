/**
 * Client-side Ollama HTTP & Streaming Client
 * Interacts directly from browser to Ollama daemon (e.g. http://localhost:11434).
 */

export function cleanHostUrl(rawUrl = "") {
  return (rawUrl || "http://localhost:11434").trim().replace(/\/+$/, "");
}

/**
 * Fetch available models installed in Ollama via /api/tags
 */
export async function fetchOllamaModels(hostUrl = "http://localhost:11434") {
  const base = cleanHostUrl(hostUrl);
  try {
    const res = await fetch(`${base}/api/tags`, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    const data = await res.json();
    const models = (data.models || []).map((m) => ({
      name: m.name || m.model,
      model: m.model || m.name,
      size: m.size,
      details: m.details || {},
      capabilities: m.capabilities || [],
      supportsTools: Array.isArray(m.capabilities) && m.capabilities.includes("tools"),
    }));
    return { ok: true, models };
  } catch (err) {
    console.warn(`[OllamaClient] Failed to fetch models from ${base}:`, err);
    return { ok: false, error: err.message, models: [] };
  }
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
