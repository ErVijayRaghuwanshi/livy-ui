import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { fetchOllamaModels, checkOllamaHealth } from "../services/ai/ollamaClient";
import {
  AI_PROVIDERS,
  GEMINI_MODELS,
  OPENAI_MODELS,
  fetchGeminiModels,
  fetchOpenAiModels,
  getProviderConfig,
} from "../services/ai/llmProvider";
import { runAgentConversation } from "../services/ai/agentRunner";
import { useSqlFiles } from "./SqlFilesContext";
import { useLivy } from "./LivyContext";
import { useSchema } from "./SchemaContext";
import { useSettings } from "./SettingsContext";
import { v4 as uuidv4 } from "uuid";

const AiContext = createContext(null);
const STORAGE_KEY_CHAT_HISTORY = "livy_ai_chat_history";

const DEFAULT_WELCOME_MESSAGE = {
  id: "welcome",
  role: "assistant",
  content: `Hello! I'm your **Livy & Doris AI Copilot**.

I can help you:
- 📝 **Write SQL** for Apache Spark or Apache Doris
- 📂 **Create & Open Files** in your editor
- ▶️ **Execute Queries** and view live results
- 🔍 **Inspect Schemas** & table catalogs automatically via specialized subagents

Select your provider in the header above to begin!`,
  timestamp: new Date().toISOString(),
};

export function AiProvider({ children, editorRef }) {
  const { settings, updateSetting } = useSettings();
  const sqlFiles = useSqlFiles();
  const livyContext = useLivy();
  const schemaContext = useSchema();

  // Active provider
  const provider = settings["ai.provider"] || "ollama";
  const hostUrl = settings["ai.hostUrl"] || "http://localhost:11434";
  const geminiApiKey = settings["ai.geminiApiKey"] || "";
  const openaiApiKey = settings["ai.openaiApiKey"] || "";
  const customUrl = settings["ai.customUrl"] || "http://localhost:8000/v1";
  const customApiKey = settings["ai.customApiKey"] || "";

  // Dynamic model lists per provider
  const [ollamaModels, setOllamaModels] = useState([]);
  const [geminiModels, setGeminiModels] = useState(GEMINI_MODELS);
  const [openaiModels, setOpenaiModels] = useState(OPENAI_MODELS);

  const [isOllamaOnline, setIsOllamaOnline] = useState(false);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  // Active model depending on provider
  const activeModel =
    provider === "gemini"
      ? settings["ai.geminiModel"] || "gemini-3.8-flash"
      : provider === "openai"
      ? settings["ai.openaiModel"] || "gpt-4o-mini"
      : settings["ai.defaultModel"] || "nemotron-3-nano:4b";

  // Resolved list of models
  const availableModels =
    provider === "gemini"
      ? geminiModels.map((m) => ({ name: m.id || m.name, model: m.id || m.model, displayName: m.name, supportsTools: m.supportsTools ?? true }))
      : provider === "openai"
      ? openaiModels.map((m) => ({ name: m.id || m.name, model: m.id || m.model, displayName: m.name, supportsTools: m.supportsTools ?? true }))
      : provider === "custom"
      ? [{ name: "default", model: "default", displayName: "default", supportsTools: true }]
      : ollamaModels;

  // Status indicator
  const isOnline =
    provider === "gemini"
      ? Boolean(geminiApiKey.trim())
      : provider === "openai"
      ? Boolean(openaiApiKey.trim())
      : provider === "custom"
      ? true
      : isOllamaOnline;

  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CHAT_HISTORY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [DEFAULT_WELCOME_MESSAGE];
  });

  const [isStreaming, setIsStreaming] = useState(false);
  const [isWarmingUp, setIsWarmingUp] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [streamingReasoning, setStreamingReasoning] = useState("");
  const [activeTool, setActiveTool] = useState(null);

  const abortControllerRef = useRef(null);

  // Persist chat messages to localStorage (last 30 turns)
  useEffect(() => {
    try {
      const toSave = messages.slice(-30);
      localStorage.setItem(STORAGE_KEY_CHAT_HISTORY, JSON.stringify(toSave));
    } catch {}
  }, [messages]);

  // Determine active engine (doris or spark)
  const activeEngine = sqlFiles?.activeFile?.engine || (sqlFiles?.dorisMode ? "doris" : "spark");

  // Fetch models dynamically depending on selected provider
  const refreshModels = useCallback(async () => {
    setIsCheckingHealth(true);

    if (provider === "ollama") {
      const health = await checkOllamaHealth(hostUrl);
      setIsOllamaOnline(health.ok);
      if (health.ok) {
        const { models } = await fetchOllamaModels(hostUrl);
        setOllamaModels(models);
        if (models.length > 0) {
          const current = settings["ai.defaultModel"];
          const exists = models.some((m) => m.model === current || m.name === current || m.id === current);
          if (!exists) {
            updateSetting("ai.defaultModel", models[0].model || models[0].id || models[0].name);
          }
        }
      } else {
        setOllamaModels([]);
      }
    } else if (provider === "gemini") {
      if (geminiApiKey.trim()) {
        const res = await fetchGeminiModels(geminiApiKey);
        if (res.ok && res.models.length > 0) {
          setGeminiModels(res.models);
          const current = settings["ai.geminiModel"];
          const exists = res.models.some((m) => m.id === current || m.name === current);
          if (!exists || current === "gemini-2.0-flash") {
            const first = res.models[0].id;
            updateSetting("ai.geminiModel", first);
          }
        }
      }
    } else if (provider === "openai") {
      if (openaiApiKey.trim()) {
        const res = await fetchOpenAiModels(openaiApiKey);
        if (res.ok && res.models.length > 0) {
          setOpenaiModels(res.models);
          const current = settings["ai.openaiModel"];
          const exists = res.models.some((m) => m.id === current || m.name === current);
          if (!exists) {
            updateSetting("ai.openaiModel", res.models[0].id);
          }
        }
      }
    }

    setIsCheckingHealth(false);
  }, [provider, hostUrl, geminiApiKey, openaiApiKey, settings, updateSetting]);

  // Refresh when provider or keys change
  useEffect(() => {
    refreshModels();
  }, [refreshModels]);

  // Auto-refresh models whenever user focuses the browser window (e.g. after pulling a model in terminal)
  useEffect(() => {
    const handleFocus = () => {
      refreshModels();
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [refreshModels]);

  // Set provider helper
  const setProvider = useCallback(
    (newProvider) => {
      updateSetting("ai.provider", newProvider);
    },
    [updateSetting]
  );

  // Set model helper
  const setModel = useCallback(
    (modelName) => {
      if (provider === "gemini") {
        updateSetting("ai.geminiModel", modelName);
      } else if (provider === "openai") {
        updateSetting("ai.openaiModel", modelName);
      } else {
        updateSetting("ai.defaultModel", modelName);
      }
    },
    [provider, updateSetting]
  );

  // Stop active streaming generation
  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    setActiveTool(null);
  }, []);

  // Clear chat history
  const clearChat = useCallback(() => {
    stopGeneration();
    setMessages([DEFAULT_WELCOME_MESSAGE]);
    try {
      localStorage.removeItem(STORAGE_KEY_CHAT_HISTORY);
    } catch {}
    setStreamingContent("");
    setStreamingReasoning("");
    setActiveTool(null);
    setIsWarmingUp(false);
  }, [stopGeneration]);

  // Send a message and trigger the agent loop
  const sendMessage = useCallback(
    async (text) => {
      const userText = String(text || "").trim();
      if (!userText || isStreaming) return;

      const userMessage = {
        id: uuidv4(),
        role: "user",
        content: userText,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsStreaming(true);
      setIsWarmingUp(false);
      setStreamingContent("");
      setStreamingReasoning("");
      setActiveTool(null);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      // Check if selected model supports tools
      const currentModelObj = availableModels.find(
        (m) => m.name === activeModel || m.model === activeModel || m.id === activeModel
      );
      const supportsTools = currentModelObj?.supportsTools ?? true;

      // Build context bridge
      const runnerContext = {
        sqlFiles,
        livyContext,
        schemaContext,
        editorRef,
        activeEngine,
      };

      // Sliding Context Window: retain only the last 8 messages (4 user + 4 assistant)
      const historyPayload = messages
        .filter((m) => m.id !== "welcome" && !m.isError)
        .slice(-8)
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      let accumulatedText = "";
      let accumulatedReasoning = "";

      try {
        const result = await runAgentConversation({
          provider,
          hostUrl,
          geminiApiKey,
          openaiApiKey,
          customUrl,
          customApiKey,
          model: activeModel,
          prompt: userText,
          supportsTools,
          history: historyPayload,
          context: runnerContext,
          onChunk: (chunk) => {
            accumulatedText += chunk;
            setStreamingContent((prev) => prev + chunk);
          },
          onReasoningChunk: (rChunk) => {
            accumulatedReasoning += rChunk;
            setStreamingReasoning((prev) => prev + rChunk);
          },
          onToolCall: (toolCallInfo) => {
            setActiveTool(toolCallInfo);
          },
          onWarmingUp: (status) => {
            setIsWarmingUp(status);
          },
          signal: controller.signal,
        });

        const assistantMessage = {
          id: uuidv4(),
          role: "assistant",
          content: result.content || accumulatedText,
          reasoning: result.reasoning || accumulatedReasoning,
          toolResults: result.toolResults,
          actionCards: result.actionCards,
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        if (err.name === "AbortError") {
          console.log("[AiContext] User aborted generation");
        } else {
          console.error("[AiContext] Agent error:", err);
          let helpHint = "";
          if (provider === "gemini") {
            helpHint = "Please make sure your Google GenAI API key is valid in Copilot settings.";
          } else if (provider === "ollama") {
            helpHint = `Please verify Ollama is running at ${hostUrl} and model '${activeModel}' is installed.`;
          }

          const errorMessage = {
            id: uuidv4(),
            role: "assistant",
            content: `⚠️ **Agent Error (${provider.toUpperCase()})**: ${err.message}\n\n${helpHint}`,
            isError: true,
            timestamp: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, errorMessage]);
        }
      } finally {
        setIsStreaming(false);
        setIsWarmingUp(false);
        setActiveTool(null);
        abortControllerRef.current = null;
      }
    },
    [
      isStreaming,
      availableModels,
      activeModel,
      messages,
      sqlFiles,
      livyContext,
      schemaContext,
      editorRef,
      activeEngine,
      provider,
      hostUrl,
      geminiApiKey,
      openaiApiKey,
      customUrl,
      customApiKey,
    ]
  );

  // 1-Click retry for failed messages
  const retryLastMessage = useCallback(
    (failedMessageId) => {
      let promptToRetry = "";
      if (failedMessageId) {
        const idx = messages.findIndex((m) => m.id === failedMessageId);
        if (idx > 0 && messages[idx - 1]?.role === "user") {
          promptToRetry = messages[idx - 1].content;
          setMessages((prev) => prev.filter((m) => m.id !== failedMessageId));
        }
      }
      if (!promptToRetry) {
        const lastUser = [...messages].reverse().find((m) => m.role === "user");
        promptToRetry = lastUser?.content || "";
      }
      if (promptToRetry) {
        sendMessage(promptToRetry);
      }
    },
    [messages, sendMessage]
  );

  // Execute action card from chat UI
  const handleActionCard = useCallback(
    (actionType, sql, cardIndex, messageId) => {
      if (!sql) return;

      switch (actionType) {
        case "run": {
          if (editorRef?.current?.runSql) {
            editorRef.current.runSql(sql);
          }
          break;
        }
        case "new_tab": {
          // Check if an existing open tab already contains this exact query
          const existingFile = (sqlFiles?.files || []).find(
            (f) => f.content && f.content.trim() === sql.trim()
          );

          if (existingFile) {
            sqlFiles.setActiveTab?.(existingFile.id);
            sqlFiles.openFile?.(existingFile.id);
          } else {
            const name = `Query_${new Date().toISOString().slice(11, 19).replace(/:/g, "")}.sql`;
            sqlFiles?.addFile({ name, content: sql });
          }

          // Mark action card as opened in message state for persistence
          if (messageId != null && cardIndex != null) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === messageId
                  ? {
                      ...m,
                      openedCards: {
                        ...(m.openedCards || {}),
                        [cardIndex]: true,
                      },
                    }
                  : m
              )
            );
          }
          break;
        }
        case "insert": {
          if (editorRef?.current?.insertText) {
            editorRef.current.insertText(sql);
          } else if (sqlFiles?.activeTabId) {
            const current = sqlFiles.activeFile?.content || "";
            sqlFiles.updateContent(
              sqlFiles.activeTabId,
              current ? `${current}\n\n${sql}` : sql
            );
          }
          break;
        }
        default:
          break;
      }
    },
    [editorRef, sqlFiles]
  );

  const providerLabel =
    provider === "gemini"
      ? "Google GenAI (Gemini)"
      : provider === "openai"
      ? "OpenAI"
      : provider === "custom"
      ? "Custom API"
      : "Local Ollama";

  const activeModelObj = availableModels.find(
    (m) => m.name === activeModel || m.model === activeModel || m.id === activeModel
  );
  const activeModelLabel = activeModelObj?.displayName || activeModelObj?.name || activeModel || "Default Model";

  const value = {
    provider,
    providerLabel,
    setProvider,
    hostUrl,
    setHostUrl: (url) => updateSetting("ai.hostUrl", url),
    geminiApiKey,
    openaiApiKey,
    setGeminiApiKey: (key) => updateSetting("ai.geminiApiKey", key),
    setOpenaiApiKey: (key) => updateSetting("ai.openaiApiKey", key),
    activeModel,
    activeModelLabel,
    setActiveModel: setModel,
    availableModels,
    isOnline,
    isCheckingHealth,
    refreshModels,
    messages,
    activeEngine,
    isStreaming,
    isWarmingUp,
    streamingContent,
    streamingReasoning,
    activeTool,
    sendMessage,
    retryLastMessage,
    stopGeneration,
    clearChat,
    handleActionCard,
  };

  return <AiContext.Provider value={value}>{children}</AiContext.Provider>;
}

export function useAi() {
  const ctx = useContext(AiContext);
  if (!ctx) throw new Error("useAi must be used within AiProvider");
  return ctx;
}
