/**
 * Unified Multi-Provider Client for Browser LLM Invocations
 * Supports:
 * - Local Ollama (localhost:11434)
 * - Google GenAI / Gemini (https://generativelanguage.googleapis.com/v1beta/openai)
 * - OpenAI (https://api.openai.com/v1)
 * - Custom OpenAI-compatible endpoints (Groq, OpenRouter, vLLM)
 */

import { cleanHostUrl } from "./ollamaClient";

export const AI_PROVIDERS = [
  { id: "ollama", label: "Local Ollama", badge: "Localhost", requiresKey: false },
  { id: "gemini", label: "Google GenAI (Gemini)", badge: "Cloud", requiresKey: true },
  { id: "openai", label: "OpenAI", badge: "Cloud", requiresKey: true },
  { id: "custom", label: "Custom OpenAI API", badge: "Custom", requiresKey: false },
];

export const GEMINI_MODELS = [
  { id: "gemini-3.8-flash", name: "Gemini 3.8 Flash (Latest)", supportsTools: true },
  { id: "gemini-3.8-pro", name: "Gemini 3.8 Pro", supportsTools: true },
  { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", supportsTools: true },
  { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", supportsTools: true },
  { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", supportsTools: true },
];

export const OPENAI_MODELS = [
  { id: "gpt-4o-mini", name: "GPT-4o Mini (Fast & Cheap)", supportsTools: true },
  { id: "gpt-4o", name: "GPT-4o (Full Flagship)", supportsTools: true },
  { id: "o3-mini", name: "o3 Mini (Reasoning)", supportsTools: true },
];

/**
 * Dynamically fetches all available Gemini models using the user's API key
 */
export async function fetchGeminiModels(apiKey = "") {
  const key = (apiKey || "").trim();
  if (!key) return { ok: false, error: "Missing Gemini API key", models: GEMINI_MODELS };

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`, {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      let errBody = "";
      try {
        const json = await res.json();
        errBody = json.error?.message || res.statusText;
      } catch {
        errBody = res.statusText;
      }
      throw new Error(`HTTP ${res.status}: ${errBody}`);
    }

    const data = await res.json();
    const rawList = Array.isArray(data.models) ? data.models : [];

    // Filter models supporting generateContent and prioritize chat/code models
    const filtered = rawList
      .filter((m) => {
        const methods = m.supportedGenerationMethods || [];
        return (
          methods.includes("generateContent") &&
          !m.name?.includes("embedding") &&
          !m.name?.includes("aqa") &&
          !m.name?.includes("imagen")
        );
      })
      .map((m) => {
        const cleanId = (m.name || "").replace(/^models\//, "");
        const label = m.displayName ? `${m.displayName} (${cleanId})` : cleanId;
        return {
          id: cleanId,
          name: label,
          model: cleanId,
          supportsTools: true,
        };
      });

    // Sort so modern flash/pro models appear at the top
    filtered.sort((a, b) => {
      if (a.id.includes("flash") && !b.id.includes("flash")) return -1;
      if (!a.id.includes("flash") && b.id.includes("flash")) return 1;
      return b.id.localeCompare(a.id);
    });

    return { ok: true, models: filtered.length > 0 ? filtered : GEMINI_MODELS };
  } catch (err) {
    console.warn("[Gemini] Failed to fetch dynamic models, using fallbacks:", err);
    return { ok: false, error: err.message, models: GEMINI_MODELS };
  }
}

/**
 * Dynamically fetches all available OpenAI models using the user's API key
 */
export async function fetchOpenAiModels(apiKey = "") {
  const key = (apiKey || "").trim();
  if (!key) return { ok: false, error: "Missing OpenAI API key", models: OPENAI_MODELS };

  try {
    const res = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${key}`,
      },
    });

    if (!res.ok) {
      let errBody = "";
      try {
        const json = await res.json();
        errBody = json.error?.message || res.statusText;
      } catch {
        errBody = res.statusText;
      }
      throw new Error(`HTTP ${res.status}: ${errBody}`);
    }

    const data = await res.json();
    const rawList = Array.isArray(data.data) ? data.data : [];

    const filtered = rawList
      .filter((m) => {
        const id = m.id || "";
        return (
          (id.startsWith("gpt-") || id.startsWith("o1") || id.startsWith("o3")) &&
          !id.includes("realtime") &&
          !id.includes("audio") &&
          !id.includes("instruct")
        );
      })
      .map((m) => ({
        id: m.id,
        name: m.id,
        model: m.id,
        supportsTools: true,
      }));

    filtered.sort((a, b) => b.id.localeCompare(a.id));

    return { ok: true, models: filtered.length > 0 ? filtered : OPENAI_MODELS };
  } catch (err) {
    console.warn("[OpenAI] Failed to fetch dynamic models, using fallbacks:", err);
    return { ok: false, error: err.message, models: OPENAI_MODELS };
  }
}

/**
 * Returns endpoint URL, headers, and model defaults for selected provider
 */
export function getProviderConfig({
  provider = "ollama",
  hostUrl = "http://localhost:11434",
  geminiApiKey = "",
  openaiApiKey = "",
  customUrl = "",
  customApiKey = "",
}) {
  switch (provider) {
    case "gemini": {
      const key = (geminiApiKey || "").trim();
      return {
        url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        requiresKey: true,
        hasKey: Boolean(key),
        defaultModel: "gemini-3.8-flash",
      };
    }

    case "openai": {
      const key = (openaiApiKey || "").trim();
      return {
        url: "https://api.openai.com/v1/chat/completions",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        requiresKey: true,
        hasKey: Boolean(key),
        defaultModel: "gpt-4o-mini",
      };
    }

    case "custom": {
      const base = cleanHostUrl(customUrl || "http://localhost:8000/v1");
      const key = (customApiKey || "").trim();
      const headers = { "Content-Type": "application/json" };
      if (key) headers["Authorization"] = `Bearer ${key}`;
      return {
        url: `${base}/chat/completions`,
        headers,
        requiresKey: false,
        hasKey: Boolean(key),
        defaultModel: "default",
      };
    }

    case "ollama":
    default: {
      const base = cleanHostUrl(hostUrl || "http://localhost:11434");
      return {
        url: `${base}/v1/chat/completions`,
        headers: {
          "Content-Type": "application/json",
        },
        requiresKey: false,
        hasKey: true,
        defaultModel: "nemotron-3-nano:4b",
      };
    }
  }
}

/**
 * Streams chat completions across any supported LLM provider using OpenAI-compatible SSE format.
 */
export async function streamUnifiedChat({
  provider = "ollama",
  hostUrl,
  geminiApiKey,
  openaiApiKey,
  customUrl,
  customApiKey,
  model,
  messages = [],
  tools = null,
  onChunk,
  onReasoningChunk,
  signal,
}) {
  const config = getProviderConfig({
    provider,
    hostUrl,
    geminiApiKey,
    openaiApiKey,
    customUrl,
    customApiKey,
  });

  if (config.requiresKey && !config.hasKey) {
    throw new Error(
      `Missing API Key for ${provider.toUpperCase()}. Please configure your API key in the AI Copilot settings.`
    );
  }

  const bodyPayload = {
    model: model || config.defaultModel,
    messages,
    stream: true,
  };

  if (Array.isArray(tools) && tools.length > 0) {
    bodyPayload.tools = tools;
  }

  const response = await fetch(config.url, {
    method: "POST",
    headers: {
      ...config.headers,
      Accept: "text/event-stream",
    },
    body: JSON.stringify(bodyPayload),
    signal,
  });

  if (!response.ok) {
    let errBody = "";
    try {
      errBody = await response.text();
      // Try parsing JSON error
      const errJson = JSON.parse(errBody);
      if (errJson.error?.message) {
        errBody = errJson.error.message;
      } else if (Array.isArray(errJson) && errJson[0]?.error?.message) {
        errBody = errJson[0].error.message;
      }
    } catch {}
    throw new Error(
      `${provider.toUpperCase()} Error (${response.status}): ${errBody || response.statusText}`
    );
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
    buffer = lines.pop();

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

          // Thinking / reasoning tokens
          if (delta.reasoning_content || delta.reasoning) {
            const rChunk = delta.reasoning_content || delta.reasoning;
            fullReasoning += rChunk;
            onReasoningChunk?.(rChunk);
          }

          // Content tokens
          if (delta.content) {
            fullContent += delta.content;
            onChunk?.(delta.content);
          }

          // Streaming tool calls
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
          // ignore chunk parse errors
        }
      }
    }
  }

  const validToolCalls = accumulatedToolCalls.filter(
    (tc) => tc && tc.function && tc.function.name
  );

  return {
    content: fullContent,
    reasoning: fullReasoning,
    toolCalls: validToolCalls,
  };
}
