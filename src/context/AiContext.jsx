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

const DEFAULT_WELCOME_MESSAGE = {
  id: "welcome",
  role: "assistant",
  content: `Hello! I'm your **Livy & Doris AI Copilot**.

I can help you:
- 📝 **Write SQL** for Apache Spark or Apache Doris
- 📂 **Create & Open Files** in your editor
- ▶️ **Execute Queries** and view live results
- ⚡ **Inspect Livy Sessions** and cluster health

Select **Local Ollama** or **Google GenAI (Gemini)** in the header above to begin!`,
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

  const [messages, setMessages] = useState(() => [DEFAULT_WELCOME_MESSAGE]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [streamingReasoning, setStreamingReasoning] = useState("");
  const [activeTool, setActiveTool] = useState(null);

  const abortControllerRef = useRef(null);

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
    setStreamingContent("");
    setStreamingReasoning("");
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

      // History formatted for OpenAI-compatible endpoint
      const historyPayload = messages
        .filter((m) => m.id !== "welcome")
        .concat(userMessage)
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
        setStreamingContent("");
        setStreamingReasoning("");
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

  // Execute action card from chat UI
  const handleActionCard = useCallback(
    (actionType, sql) => {
      if (!sql) return;

      switch (actionType) {
        case "run": {
          if (editorRef?.current?.runSql) {
            editorRef.current.runSql(sql);
          }
          break;
        }
        case "new_tab": {
          const name = `Query_${new Date().toISOString().slice(11, 19).replace(/:/g, "")}.sql`;
          sqlFiles?.addFile({ name, content: sql });
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

  const value = {
    provider,
    setProvider,
    hostUrl,
    setHostUrl: (url) => updateSetting("ai.hostUrl", url),
    geminiApiKey,
    openaiApiKey,
    setGeminiApiKey: (key) => updateSetting("ai.geminiApiKey", key),
    setOpenaiApiKey: (key) => updateSetting("ai.openaiApiKey", key),
    activeModel,
    setActiveModel: setModel,
    availableModels,
    isOnline,
    isCheckingHealth,
    refreshModels,
    messages,
    isStreaming,
    streamingContent,
    streamingReasoning,
    activeTool,
    sendMessage,
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
