import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { fetchOllamaModels, checkOllamaHealth } from "../services/ai/ollamaClient";
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

Try asking:
- *"Write a Doris aggregation query to find top 5 customers from orders"*
- *"Create a file called 'SparkMetrics.sql' with a sample query and run it"*
- *"List all running Livy sessions"*`,
  timestamp: new Date().toISOString(),
};

export function AiProvider({ children, editorRef }) {
  const { settings, updateSetting } = useSettings();
  const sqlFiles = useSqlFiles();
  const livyContext = useLivy();
  const schemaContext = useSchema();

  const hostUrl = settings["ai.hostUrl"] || "http://localhost:11434";
  const [activeModel, setActiveModel] = useState(
    () => settings["ai.defaultModel"] || "nemotron-3-nano:4b"
  );
  const [availableModels, setAvailableModels] = useState([]);
  const [isOnline, setIsOnline] = useState(false);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  const [messages, setMessages] = useState(() => [DEFAULT_WELCOME_MESSAGE]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [streamingReasoning, setStreamingReasoning] = useState("");
  const [activeTool, setActiveTool] = useState(null);

  const abortControllerRef = useRef(null);

  // Determine active engine (doris or spark)
  const activeEngine = sqlFiles?.activeFile?.engine || (sqlFiles?.dorisMode ? "doris" : "spark");

  // Fetch installed Ollama models
  const refreshModels = useCallback(async () => {
    setIsCheckingHealth(true);
    const health = await checkOllamaHealth(hostUrl);
    setIsOnline(health.ok);

    if (health.ok) {
      const { models } = await fetchOllamaModels(hostUrl);
      setAvailableModels(models);
      if (models.length > 0) {
        // If current model isn't in the list, default to first available
        setActiveModel((current) => {
          const exists = models.some((m) => m.name === current || m.model === current);
          if (!exists) {
            const first = models[0].name;
            updateSetting("ai.defaultModel", first);
            return first;
          }
          return current;
        });
      }
    } else {
      setAvailableModels([]);
    }
    setIsCheckingHealth(false);
  }, [hostUrl, updateSetting]);

  useEffect(() => {
    refreshModels();
  }, [refreshModels]);

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
        (m) => m.name === activeModel || m.model === activeModel
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
          hostUrl,
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
          const errorMessage = {
            id: uuidv4(),
            role: "assistant",
            content: `⚠️ **Agent Error**: ${err.message}\n\nPlease verify that Ollama is running at \`${hostUrl}\` and model \`${activeModel}\` is available.`,
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
      hostUrl,
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
    hostUrl,
    activeModel,
    setActiveModel: (m) => {
      setActiveModel(m);
      updateSetting("ai.defaultModel", m);
    },
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
