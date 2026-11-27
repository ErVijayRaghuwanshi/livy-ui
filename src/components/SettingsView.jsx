import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Sparkles,
  FileCode,
  Palette,
  Zap,
  Database,
  Bot,
  Server,
  History,
  AlertTriangle,
  Check,
  Search,
  Info,
} from "lucide-react";
import { useSettings, DEFAULT_SETTINGS } from "../context/SettingsContext";
import { useLivy } from "../context/LivyContext";
import { usePwaInstall } from "../hooks/usePwaInstall";
import { DATA_SOURCE_TYPES } from "../utils/constants";
import { testDorisConnection } from "../services/dorisApi";

// Modular Settings Subcomponents
import SettingsSidebar from "./Settings/SettingsSidebar";
import SettingsHeader from "./Settings/SettingsHeader";
import SettingsRow from "./Settings/SettingsRow";
import JsonSettingsEditor from "./Settings/JsonSettingsEditor";

// Domain Specific Manager Sections
import HostManagerSection from "./Settings/sections/HostManagerSection";
import SparkSessionSection from "./Settings/sections/SparkSessionSection";
import SparkConfSection from "./Settings/sections/SparkConfSection";
import DorisManagerSection from "./Settings/sections/DorisManagerSection";
import PwaManagerSection from "./Settings/sections/PwaManagerSection";
import AboutHistorySection from "./Settings/sections/AboutHistorySection";
import AiSettingsManager from "./AiChat/AiSettingsManager";

export default function SettingsView({
  theme,
  toggleTheme,
  setShowConnectionModal,
  isModal = false,
  onOpenAsTab,
  onOpenAsModal,
  onClose,
  isMaximized = false,
  onToggleMaximize,
  initialCategory = "commonlyUsed",
}) {
  const {
    settings,
    updateSetting,
    updateAllSettings,
    resetToDefaults,
    resetSetting,
    exportSettings,
    importSettings,
  } = useSettings();

  const {
    hosts,
    activeHost,
    activeHostId,
    selectHost,
    addHost,
    removeHost,
    updateHost,
    sessionId,
    sessions,
    sessionsLoading,
    fetchSessions,
    startSession,
    stopSession,
    killSession,
    attachSession,
    sessionConf,
    setSessionConf,
    loading: livyLoading,
    dispatch,
  } = useLivy();

  const { canInstall, isStandalone, installApp } = usePwaInstall();

  const [mode, setMode] = useState("ui"); // 'ui' | 'json'
  const [searchQuery, setSearchQuery] = useState("");
  const [showModifiedOnly, setShowModifiedOnly] = useState(false);
  const [activeCategory, setActiveCategory] = useState(initialCategory || "commonlyUsed");

  useEffect(() => {
    if (initialCategory) {
      setActiveCategory(initialCategory);
    }
  }, [initialCategory]);

  const [jsonText, setJsonText] = useState(() => JSON.stringify(settings, null, 2));
  const [jsonError, setJsonError] = useState(null);
  const [isResetSuccess, setIsResetSuccess] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [pingResults, setPingResults] = useState({});

  // Fetch active sessions when entering compute/connection category
  useEffect(() => {
    if (activeCategory === "compute" || activeCategory === "connection") {
      fetchSessions();
    }
  }, [activeCategory, fetchSessions]);

  const combinedSettings = useMemo(() => {
    return {
      ...settings,
      ...(sessionConf || {}),
      "livy.hosts": hosts,
    };
  }, [settings, sessionConf, hosts]);

  // Sync jsonText whenever settings change in UI mode
  useEffect(() => {
    if (mode === "ui") {
      setJsonText(JSON.stringify(combinedSettings, null, 2));
      setJsonError(null);
    }
  }, [combinedSettings, mode]);

  // Handle JSON Editor changes with Livy hosts bidirectional sync
  const handleJsonChange = useCallback(
    (value) => {
      setJsonText(value || "");
      try {
        const parsed = JSON.parse(value || "{}");
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          const { "livy.hosts": jsonHosts, ...otherSettings } = parsed;
          updateAllSettings(otherSettings);

          // Bi-directional sync for cluster hosts
          if (Array.isArray(jsonHosts) && jsonHosts.length > 0 && dispatch) {
            dispatch({ type: "SET_HOSTS", payload: jsonHosts });
          }

          // Synchronize any spark.* properties with sessionConf
          const sparkEntries = {};
          Object.entries(otherSettings).forEach(([k, v]) => {
            if (k.startsWith("spark.")) {
              const confKey = k === "spark.defaultMaster" ? "spark.master" : k;
              sparkEntries[confKey] = String(v);
            }
          });
          if (Object.keys(sparkEntries).length > 0 && setSessionConf) {
            setSessionConf((prev) => ({ ...prev, ...sparkEntries }));
          }

          setJsonError(null);
        } else {
          setJsonError("JSON content must be a valid key-value object.");
        }
      } catch (err) {
        setJsonError(err.message);
      }
    },
    [updateAllSettings, setSessionConf, dispatch]
  );

  const categories = useMemo(
    () => [
      { id: "commonlyUsed", label: "Commonly Used", icon: Sparkles },
      { id: "editor", label: "Text Editor", icon: FileCode },
      { id: "workbench", label: "Workbench", icon: Palette },
      { id: "compute", label: "Spark & Compute", icon: Zap },
      { id: "doris", label: "Apache Doris", icon: Database },
      { id: "ai", label: "AI & Copilot", icon: Bot },
      { id: "connection", label: "Connection & Hosts", icon: Server },
      { id: "history", label: "Execution & History", icon: History },
      { id: "about", label: "About & History", icon: Info },
    ],
    []
  );

  const settingDefinitions = useMemo(
    () => [
      {
        key: "workbench.colorTheme",
        category: "workbench",
        categoryLabel: "Workbench",
        title: "Color Theme",
        description: "Specifies the visual theme for the workbench interface and Monaco Editor.",
        type: "select",
        commonlyUsed: true,
        options: [
          { label: "Dark Modern", value: "dark" },
          { label: "Light Modern", value: "light" },
        ],
        onChange: (val) => {
          updateSetting("workbench.colorTheme", val);
          if ((val === "dark" && theme !== "dark") || (val === "light" && theme !== "light")) {
            toggleTheme();
          }
        },
      },
      {
        key: "workbench.pwaApp",
        category: "workbench",
        categoryLabel: "Workbench",
        title: "Progressive Web App & Offline",
        description: "Install Livy UI as an independent desktop application on your device and access queries offline with local caching.",
        type: "pwaManager",
        commonlyUsed: true,
      },
      {
        key: "workbench.queryToasts",
        category: "workbench",
        categoryLabel: "Workbench",
        title: "Query Toast Notifications",
        description: "Show non-intrusive toast notifications when a SQL query succeeds or fails, even while the tab is focused.",
        type: "boolean",
      },
      {
        key: "workbench.soundFeedback",
        category: "workbench",
        categoryLabel: "Workbench",
        title: "Query Sound Effects",
        description: "Play a subtle Web Audio chime when a query completes successfully or fails.",
        type: "boolean",
      },
      {
        key: "workbench.hapticFeedback",
        category: "workbench",
        categoryLabel: "Workbench",
        title: "Query Haptic Feedback",
        description: "Trigger subtle device vibration on supported mobile/PWA devices when a query succeeds or fails.",
        type: "boolean",
      },
      {
        key: "editor.fontSize",
        category: "editor",
        categoryLabel: "Editor",
        title: "Font Size",
        description: "Controls the font size in pixels for the SQL Monaco Editor.",
        type: "number",
        commonlyUsed: true,
        min: 10,
        max: 32,
      },
      {
        key: "editor.fontFamily",
        category: "editor",
        categoryLabel: "Editor",
        title: "Font Family",
        description: "Controls the font family list for code rendering.",
        type: "text",
      },
      {
        key: "editor.tabSize",
        category: "editor",
        categoryLabel: "Editor",
        title: "Tab Size",
        description: "The number of spaces a tab is equal to when editing SQL code.",
        type: "select",
        options: [
          { label: "2 spaces", value: 2 },
          { label: "4 spaces", value: 4 },
        ],
      },
      {
        key: "editor.wordWrap",
        category: "editor",
        categoryLabel: "Editor",
        title: "Word Wrap",
        description: "Controls how lines should wrap in the Monaco SQL Editor.",
        type: "select",
        commonlyUsed: true,
        options: [
          { label: "Off (Horizontal Scroll)", value: "off" },
          { label: "On (Wrap long lines)", value: "on" },
        ],
      },
      {
        key: "editor.lineNumbers",
        category: "editor",
        categoryLabel: "Editor",
        title: "Line Numbers",
        description: "Controls the display of line numbers in the editor gutter.",
        type: "select",
        options: [
          { label: "On", value: "on" },
          { label: "Off", value: "off" },
        ],
      },
      {
        key: "editor.minimap.enabled",
        category: "editor",
        categoryLabel: "Editor > Minimap",
        title: "Minimap (File Preview)",
        description: "Controls whether the code outline minimap preview is shown on the right side of the editor.",
        type: "boolean",
        commonlyUsed: true,
      },
      {
        key: "editor.autoSave",
        category: "editor",
        categoryLabel: "Files",
        title: "Auto Save",
        description: "Controls auto save of dirty editors. Choose 'off' to disable auto save, or 'on' to save dirty files automatically.",
        type: "select",
        commonlyUsed: true,
        options: [
          { label: "Off (Manual Cmd+S)", value: "off" },
          { label: "On (Auto-save changes)", value: "on" },
        ],
      },
      {
        key: "editor.bracketPairColorization.enabled",
        category: "editor",
        categoryLabel: "Editor",
        title: "Bracket Pair Colorization",
        description: "Controls whether matching bracket pairs (parentheses, braces, brackets) in SQL queries are color-coded for enhanced visual nesting.",
        type: "boolean",
        commonlyUsed: true,
      },
      {
        key: "editor.formatOnSave",
        category: "editor",
        categoryLabel: "Editor",
        title: "Format On Save",
        description: "Format a SQL query file on save. A formatter must be available, and the editor must not be shutting down.",
        type: "boolean",
        commonlyUsed: true,
      },
      {
        key: "editor.acceptSuggestionOnEnter",
        category: "editor",
        categoryLabel: "Editor",
        title: "Accept Suggestion On Enter",
        description: "Controls whether suggestions should be accepted on Enter, in addition to Tab.",
        type: "select",
        commonlyUsed: true,
        options: [
          { label: "Smart (Only accept suggestions on Enter after typing alphanumeric text)", value: "smart" },
          { label: "On (Always accept suggestions on Enter)", value: "on" },
          { label: "Off (Never accept suggestions on Enter; accept with Tab only)", value: "off" },
        ],
      },
      {
        key: "editor.cursorBlinking",
        category: "editor",
        categoryLabel: "Editor",
        title: "Cursor Blinking",
        description: "Control the animation style of the editor cursor.",
        type: "select",
        options: [
          { label: "Smooth (Fading animation)", value: "smooth" },
          { label: "Blink (Standard blink)", value: "blink" },
          { label: "Solid (Static line)", value: "solid" },
        ],
      },
      {
        key: "editor.renderWhitespace",
        category: "editor",
        categoryLabel: "Editor",
        title: "Render Whitespace",
        description: "Controls how the editor renders whitespace characters.",
        type: "select",
        options: [
          { label: "Selection", value: "selection" },
          { label: "All", value: "all" },
          { label: "None", value: "none" },
        ],
      },
      {
        key: "editor.sqlValidation.enabled",
        category: "editor",
        categoryLabel: "SQL Validation",
        title: "Static SQL Validation",
        description: "Controls real-time static SQL syntax checking and error squigglies in Monaco Editor using ANTLR4 parser.",
        type: "boolean",
        commonlyUsed: true,
      },
      {
        key: "editor.sqlValidation.dialect",
        category: "editor",
        categoryLabel: "SQL Validation",
        title: "SQL Dialect",
        description: "Target SQL parser dialect for real-time syntax checking (Spark SQL, Hive, MySQL, Generic).",
        type: "select",
        options: [
          { label: "Spark SQL (Default / Livy)", value: "spark" },
          { label: "Hive SQL", value: "hive" },
          { label: "Generic SQL", value: "generic" },
          { label: "MySQL", value: "mysql" },
        ],
      },
      {
        key: "livy.sessions",
        category: "compute",
        categoryLabel: "Spark & Compute",
        title: "Spark Session Manager",
        description: "Create, view, attach to, or terminate active Spark / Livy sessions on the connected cluster.",
        type: "sessionManager",
        commonlyUsed: true,
      },
      {
        key: "spark.configurationProperties",
        category: "compute",
        categoryLabel: "Spark Configuration",
        title: "Spark Configuration Properties",
        description: "Manage spark.* key-value properties passed to Livy when starting compute sessions. Add custom properties or apply recommended presets.",
        type: "sparkConfManager",
        commonlyUsed: true,
      },
      {
        key: "spark.defaultMaster",
        category: "compute",
        categoryLabel: "Spark",
        title: "Default Spark Master",
        description: "The default Spark Master connection string used when starting new Livy sessions (e.g. local[*], yarn, k8s).",
        type: "text",
        commonlyUsed: true,
      },
      {
        key: "spark.executor.memory",
        category: "compute",
        categoryLabel: "Spark",
        title: "Executor Memory",
        description: "Amount of memory to allocate per Spark executor process (e.g. 1g, 2g, 4g).",
        type: "text",
        commonlyUsed: true,
      },
      {
        key: "spark.executor.cores",
        category: "compute",
        categoryLabel: "Spark",
        title: "Executor Cores",
        description: "Number of CPU cores to allocate per Spark executor process.",
        type: "number",
        min: 1,
        max: 64,
      },
      {
        key: "spark.driver.memory",
        category: "compute",
        categoryLabel: "Spark",
        title: "Driver Memory",
        description: "Amount of memory to allocate for the Spark driver process.",
        type: "text",
      },
      {
        key: "spark.sql.shuffle.partitions",
        category: "compute",
        categoryLabel: "Spark SQL",
        title: "Shuffle Partitions",
        description: "Default number of partitions to use when shuffling data for joins or aggregations.",
        type: "number",
        min: 1,
        max: 1000,
      },
      {
        key: "spark.dynamicAllocation.enabled",
        category: "compute",
        categoryLabel: "Spark",
        title: "Dynamic Allocation",
        description: "Enable dynamic resource allocation to scale executors up or down automatically based on workload.",
        type: "select",
        options: [
          { label: "Disabled (Fixed Executors)", value: "false" },
          { label: "Enabled (Autoscaling)", value: "true" },
        ],
      },
      {
        key: "spark.sql.warehouse.dir",
        category: "compute",
        categoryLabel: "Spark",
        title: "Warehouse Directory",
        description: "Directory location for managed database and table files.",
        type: "text",
      },
      {
        key: "doris.manager",
        category: "doris",
        categoryLabel: "Apache Doris",
        title: "Doris Frontend & Cluster Status",
        description: "Manage connected Apache Doris Frontend (FE) endpoints, test live API connectivity, and inspect cluster status.",
        type: "dorisManager",
        commonlyUsed: true,
      },
      {
        key: "doris.defaultDatabase",
        category: "doris",
        categoryLabel: "Apache Doris",
        title: "Default Database",
        description: "Default target database in Apache Doris when queries do not explicitly specify a db prefix (e.g. demo_db).",
        type: "text",
        commonlyUsed: true,
      },
      {
        key: "doris.queryTimeout",
        category: "doris",
        categoryLabel: "Apache Doris",
        title: "Query Timeout (seconds)",
        description: "Maximum execution timeout in seconds for queries submitted to the Doris FE HTTP API.",
        type: "number",
        min: 5,
        max: 600,
        commonlyUsed: true,
      },
      {
        key: "doris.defaultAiResource",
        category: "doris",
        categoryLabel: "Apache Doris",
        title: "Default AI Resource",
        description: "The default AI resource name used in built-in Doris AI functions like AI_TRANSLATE, AI_GENERATE, and AI_SUMMARIZE.",
        type: "text",
        commonlyUsed: true,
      },
      {
        key: "doris.enableProfile",
        category: "doris",
        categoryLabel: "Apache Doris",
        title: "Enable Execution Profile",
        description: "Collect detailed execution profile and timeline metrics for Doris queries.",
        type: "boolean",
      },
      {
        key: "ai.manager",
        category: "ai",
        categoryLabel: "AI & Copilot",
        title: "Model & Provider Configuration",
        description: "Manage LLM providers (Local Ollama, Google GenAI Gemini, OpenAI, Custom), host endpoints, API keys, and model parameters.",
        type: "aiManager",
        commonlyUsed: true,
        keywords: "ollama gemini openai custom api key host url model vllm groq openrouter token",
      },
      {
        key: "ai.ollamaThinking",
        category: "ai",
        categoryLabel: "AI & Copilot",
        title: "Ollama Thinking / Reasoning Mode",
        description: "Controls whether Ollama reasoning models (e.g. DeepSeek-R1, QwQ, Nemotron) run their chain-of-thought thinking process. Set to Disabled to drastically speed up response times and bypass thinking tokens.",
        type: "select",
        commonlyUsed: true,
        options: [
          { label: "Disabled (Fastest - Direct response without thinking)", value: "disabled" },
          { label: "Enabled (Show full Thought Process)", value: "enabled" },
          { label: "Model Default (Let Ollama model decide)", value: "auto" },
        ],
      },
      {
        key: "ai.memoryMode",
        category: "ai",
        categoryLabel: "AI & Copilot",
        title: "Conversation Memory Retrieval",
        description: "Controls how older conversation turns are retrieved. Hybrid Vector Memory uses IndexedDB + BM25 search alongside recent turns; Sliding Window keeps only Turn 1 and the last 13 messages.",
        type: "select",
        options: [
          { label: "Hybrid Vector Memory (IndexedDB + BM25)", value: "hybrid-vector" },
          { label: "Sliding Window (Turn 1 Anchor + Recent)", value: "sliding-window" },
        ],
      },
      {
        key: "ai.semanticEmbeddings",
        category: "ai",
        categoryLabel: "AI & Copilot",
        title: "In-Browser Semantic Embeddings (Opt-In)",
        description: "When enabled, lazy-loads a quantized ~23 MB model (all-MiniLM-L6-v2) in a Web Worker for semantic vector search across Ollama & Gemini. Disabled by default so zero extra cache is loaded.",
        type: "boolean",
      },
      {
        key: "ai.agentMode",
        category: "ai",
        categoryLabel: "AI & Copilot",
        title: "Default Agent Mode",
        description: "Controls the default operational mode for AI Copilot when opening chat tabs: 'action' for code generation and review, or 'ask' for advisory assistance.",
        type: "select",
        commonlyUsed: true,
        options: [
          { label: "Action Mode (Code Generation & Review)", value: "action" },
          { label: "Ask Mode (Advisory Q&A & Schema Explanations)", value: "ask" },
        ],
      },
      {
        key: "ai.autoExecute",
        category: "ai",
        categoryLabel: "AI & Copilot",
        title: "Auto-Execute Queries",
        description: "When enabled, the AI agent will automatically run generated SQL queries on the active engine. When disabled, an interactive [Run Query] action button is presented in chat.",
        type: "boolean",
      },
      {
        key: "livy.activeHostUrl",
        category: "connection",
        categoryLabel: "Livy",
        title: "Active Livy Host Endpoint",
        description: "The currently connected Apache Livy / livy-next REST server URL.",
        type: "hostSelector",
        commonlyUsed: true,
      },
      {
        key: "livy.hosts",
        category: "connection",
        categoryLabel: "Livy",
        title: "Managed Clusters",
        description: "Manage, ping, and configure Livy / livy-next cluster endpoints available to connect.",
        type: "hostManager",
      },
      {
        key: "query.historyLimit",
        category: "history",
        categoryLabel: "History",
        title: "Query History Max Retention",
        description: "Maximum number of executed SQL statements retained in the Query History panel.",
        type: "number",
        min: 10,
        max: 500,
      },
      {
        key: "query.autoFormatOnRun",
        category: "history",
        categoryLabel: "Query",
        title: "Auto-Format SQL On Run",
        description: "Automatically format SQL query code when submitting for execution.",
        type: "boolean",
      },
      {
        key: "about.info",
        category: "about",
        categoryLabel: "About & History",
        title: "Author & History of Livy UI",
        description: "Learn about the creator, repository, and release timeline of Livy UI from its initial Spark SQL release to Dual-Engine & AI Copilot.",
        type: "aboutHistory",
        keywords: "author vijay raghuwanshi history changelog version release github about",
      },
    ],
    [theme, toggleTheme, updateSetting]
  );

  // Test Host Ping / Connection
  const handleTestHost = useCallback(
    async (host) => {
      setPingResults((prev) => ({ ...prev, [host.id]: { state: "loading" } }));
      const isDorisHost = host.type === DATA_SOURCE_TYPES.DORIS || host.engine === "doris";

      if (isDorisHost) {
        try {
          const dbToUse = host.database || settings["doris.defaultDatabase"] || "demo_db";
          const res = await testDorisConnection({ ...host, database: dbToUse });
          if (res.success) {
            setPingResults((prev) => ({
              ...prev,
              [host.id]: { state: "online", latency: Math.round(res.elapsed) },
            }));
          } else {
            setPingResults((prev) => ({
              ...prev,
              [host.id]: { state: "offline", error: res.error },
            }));
          }
        } catch (err) {
          setPingResults((prev) => ({
            ...prev,
            [host.id]: { state: "offline", error: err.message },
          }));
        }
      } else {
        const start = performance.now();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);
        try {
          const res = await fetch(`${host.url.replace(/\/$/, "")}/sessions`, {
            headers: { Accept: "application/json" },
            signal: controller.signal,
          });
          clearTimeout(timeoutId);
          const elapsed = Math.round(performance.now() - start);
          if (res.ok) {
            setPingResults((prev) => ({
              ...prev,
              [host.id]: { state: "online", latency: elapsed },
            }));
          } else {
            setPingResults((prev) => ({
              ...prev,
              [host.id]: { state: "offline", error: `HTTP ${res.status}` },
            }));
          }
        } catch (err) {
          clearTimeout(timeoutId);
          setPingResults((prev) => ({
            ...prev,
            [host.id]: {
              state: "offline",
              error: err.name === "AbortError" ? "Connection timeout" : err.message || "Unreachable",
            },
          }));
        }
      }
    },
    [settings]
  );

  const getSettingValue = useCallback(
    (key, type) => {
      if (key === "spark.defaultMaster") {
        return (
          sessionConf?.["spark.master"] ??
          sessionConf?.["spark.defaultMaster"] ??
          settings[key] ??
          DEFAULT_SETTINGS[key]
        );
      }
      if (key.startsWith("spark.") && sessionConf?.[key] !== undefined) {
        return type === "number"
          ? parseInt(sessionConf[key], 10) || 0
          : String(sessionConf[key]);
      }
      return settings[key] ?? DEFAULT_SETTINGS[key];
    },
    [settings, sessionConf]
  );

  const handleSettingChange = useCallback(
    (key, val) => {
      updateSetting(key, val);
      if (key.startsWith("spark.") && setSessionConf) {
        const confKey = key === "spark.defaultMaster" ? "spark.master" : key;
        setSessionConf((prev) => ({
          ...prev,
          [confKey]: String(val),
        }));
      }
    },
    [updateSetting, setSessionConf]
  );

  const handleResetSingleSetting = useCallback(
    (key) => {
      resetSetting(key);
      if (key.startsWith("spark.") && setSessionConf) {
        const confKey = key === "spark.defaultMaster" ? "spark.master" : key;
        setSessionConf((prev) => {
          const next = { ...prev };
          delete next[confKey];
          delete next[key];
          return next;
        });
      }
    },
    [resetSetting, setSessionConf]
  );

  const isSettingModified = useCallback(
    (def) => {
      if (
        def.type === "sparkConfManager" ||
        def.type === "sessionManager" ||
        def.type === "hostManager" ||
        def.type === "dorisManager" ||
        def.type === "aiManager" ||
        def.type === "pwaManager" ||
        def.type === "aboutHistory"
      ) {
        return false;
      }
      const current = getSettingValue(def.key, def.type);
      const defVal = DEFAULT_SETTINGS[def.key];
      if (current === undefined) return false;
      return String(current) !== String(defVal);
    },
    [getSettingValue]
  );

  // Modified count across all definitions
  const modifiedCount = useMemo(() => {
    return settingDefinitions.filter(isSettingModified).length;
  }, [settingDefinitions, isSettingModified]);

  // Compute item counts per category
  const categoryCounts = useMemo(() => {
    const counts = {};
    settingDefinitions.forEach((def) => {
      counts[def.category] = (counts[def.category] || 0) + 1;
      if (def.commonlyUsed) {
        counts.commonlyUsed = (counts.commonlyUsed || 0) + 1;
      }
    });
    return counts;
  }, [settingDefinitions]);

  // Filter settings by search query, category, and modified filter
  const filteredDefinitions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const isSpecialModified = query.includes("@modified") || showModifiedOnly;
    const isSpecialCommon = query.includes("@common");
    const cleanQuery = query.replace(/@modified|@common/g, "").trim();

    return settingDefinitions.filter((def) => {
      if (isSpecialModified && !isSettingModified(def)) {
        return false;
      }
      if (isSpecialCommon && !def.commonlyUsed) {
        return false;
      }

      if (cleanQuery) {
        const matchesSearch =
          def.title.toLowerCase().includes(cleanQuery) ||
          def.key.toLowerCase().includes(cleanQuery) ||
          def.description.toLowerCase().includes(cleanQuery) ||
          (def.categoryLabel && def.categoryLabel.toLowerCase().includes(cleanQuery)) ||
          (def.keywords && def.keywords.toLowerCase().includes(cleanQuery));
        return matchesSearch;
      }

      if (isSpecialModified) return true;

      const matchesCategory =
        activeCategory === "commonlyUsed" ? def.commonlyUsed : def.category === activeCategory;
      return matchesCategory;
    });
  }, [settingDefinitions, activeCategory, searchQuery, showModifiedOnly, isSettingModified]);

  const confirmReset = () => {
    resetToDefaults();
    if (setSessionConf) setSessionConf({});
    setShowResetModal(false);
    setIsResetSuccess(true);
    setTimeout(() => setIsResetSuccess(false), 3000);
  };

  const handleExport = () => {
    exportSettings({
      hosts,
      sessionConf: sessionConf || {},
    });
  };

  const handleImport = (fileContent) => {
    const res = importSettings(fileContent);
    if (res.success) {
      if (Array.isArray(res.raw?.hosts) && dispatch) {
        dispatch({ type: "SET_HOSTS", payload: res.raw.hosts });
      }
      if (res.raw?.sessionConf && setSessionConf) {
        setSessionConf(res.raw.sessionConf);
      }
      setIsResetSuccess(true);
      setTimeout(() => setIsResetSuccess(false), 3000);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-(--color-bg-workbench) text-(--color-text-primary) select-none overflow-hidden font-sans">
      {/* 1. Header & Search Subheader */}
      <SettingsHeader
        mode={mode}
        setMode={setMode}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        showModifiedOnly={showModifiedOnly}
        setShowModifiedOnly={setShowModifiedOnly}
        modifiedCount={modifiedCount}
        filteredCount={filteredDefinitions.length}
        onResetAll={() => setShowResetModal(true)}
        onExportSettings={handleExport}
        onImportSettings={handleImport}
        isModal={isModal}
        isMaximized={isMaximized}
        onToggleMaximize={onToggleMaximize}
        onClose={onClose}
        onOpenAsTab={onOpenAsTab}
        onOpenAsModal={onOpenAsModal}
      />

      {/* 2. Main Content Area */}
      {mode === "ui" ? (
        <div className="flex flex-col sm:flex-row flex-1 min-h-0 overflow-hidden bg-(--color-bg-workbench)">
          {/* Left Category Sidebar */}
          <SettingsSidebar
            categories={categories}
            activeCategory={activeCategory}
            onSelectCategory={(catId) => {
              setActiveCategory(catId);
              setSearchQuery("");
              setShowModifiedOnly(false);
            }}
            categoryCounts={categoryCounts}
            isSearching={Boolean(searchQuery.trim())}
            showModifiedOnly={showModifiedOnly}
          />

          {/* Right Settings Rows */}
          <div className="flex-1 bg-(--color-bg-primary) overflow-y-auto px-4 sm:px-8 py-4 sm:py-6 space-y-6 sm:space-y-7">
            {isResetSuccess && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs animate-in fade-in">
                <Check size={15} />
                <span>Settings have been successfully updated!</span>
              </div>
            )}

            {filteredDefinitions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center text-(--color-text-muted)">
                <Search size={36} className="mb-3 opacity-40 text-(--color-text-muted)" />
                <p className="text-sm font-medium text-(--color-text-secondary)">No matching settings found</p>
                <p className="text-xs text-(--color-text-muted) mt-1">
                  Try checking your spelling or clearing search filters.
                </p>
              </div>
            ) : (
              filteredDefinitions.map((def) => {
                const currentValue = getSettingValue(def.key, def.type);
                const modified = isSettingModified(def);

                return (
                  <SettingsRow
                    key={def.key}
                    def={def}
                    currentValue={currentValue}
                    modified={modified}
                    onReset={handleResetSingleSetting}
                    onOpenJson={() => setMode("json")}
                    onChange={(val) => {
                      if (def.onChange) {
                        def.onChange(val);
                      } else {
                        handleSettingChange(def.key, val);
                      }
                    }}
                  >
                    {/* Host Selector */}
                    {def.type === "hostSelector" && (
                      <div className="flex flex-wrap items-center gap-3">
                        <select
                          value={activeHostId}
                          onChange={(e) => {
                            selectHost(e.target.value);
                            const selected = hosts.find((h) => h.id === e.target.value);
                            if (selected) {
                              updateSetting("livy.activeHostUrl", selected.url);
                            }
                          }}
                          className="px-3 py-1.5 text-xs rounded-md bg-(--color-bg-tertiary) border border-(--color-border) text-(--color-text-primary) focus:outline-none focus:border-(--color-accent) cursor-pointer font-mono"
                        >
                          {hosts.map((h) => (
                            <option key={h.id} value={h.id}>
                              {h.name} ({h.url})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Spark Session Manager */}
                    {def.type === "sessionManager" && (
                      <SparkSessionSection
                        activeHost={activeHost}
                        sessions={sessions}
                        sessionsLoading={sessionsLoading}
                        sessionId={sessionId}
                        fetchSessions={fetchSessions}
                        startSession={startSession}
                        stopSession={stopSession}
                        killSession={killSession}
                        attachSession={attachSession}
                        loading={livyLoading}
                      />
                    )}

                    {/* Spark Configuration Key-Value Editor & Presets */}
                    {def.type === "sparkConfManager" && (
                      <SparkConfSection
                        sessionConf={sessionConf}
                        setSessionConf={setSessionConf}
                        updateSetting={updateSetting}
                      />
                    )}

                    {/* Apache Doris Manager */}
                    {def.type === "dorisManager" && (
                      <DorisManagerSection
                        activeHost={activeHost}
                        settings={settings}
                        ping={pingResults[activeHost.id]}
                        onTestHost={handleTestHost}
                      />
                    )}

                    {/* AI & Copilot Manager */}
                    {def.type === "aiManager" && <AiSettingsManager />}

                    {/* PWA & Desktop App Manager */}
                    {def.type === "pwaManager" && (
                      <PwaManagerSection
                        isStandalone={isStandalone}
                        canInstall={canInstall}
                        installApp={installApp}
                      />
                    )}

                    {/* Author & Project History */}
                    {def.type === "aboutHistory" && <AboutHistorySection />}

                    {/* Full Host Manager */}
                    {def.type === "hostManager" && (
                      <HostManagerSection
                        hosts={hosts}
                        activeHostId={activeHostId}
                        selectHost={(id) => {
                          selectHost(id);
                          const h = hosts.find((item) => item.id === id);
                          if (h) updateSetting("livy.activeHostUrl", h.url);
                        }}
                        addHost={addHost}
                        removeHost={removeHost}
                        updateHost={updateHost}
                        pingResults={pingResults}
                        onTestHost={handleTestHost}
                      />
                    )}
                  </SettingsRow>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* JSON Mode: Monaco Editor showing settings.json */
        <JsonSettingsEditor
          jsonText={jsonText}
          jsonError={jsonError}
          onChange={handleJsonChange}
          theme={theme}
          editorSettings={settings}
        />
      )}

      {/* Reset Confirmation Dialog */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-(--color-bg-secondary) border border-(--color-border) rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
                <AlertTriangle size={22} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-(--color-text-primary)">
                  Reset All Settings to Defaults?
                </h3>
                <p className="text-xs text-(--color-text-muted) mt-1 leading-relaxed">
                  Are you sure you want to restore all user settings to default values? Your custom font sizes, theme choices, Spark cluster configurations, and query history limits will be restored.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-(--color-border)">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-3 py-1.5 text-xs font-medium rounded bg-(--color-bg-tertiary) hover:bg-(--color-bg-primary) text-(--color-text-secondary) hover:text-(--color-text-primary) border border-(--color-border) transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmReset}
                className="px-3 py-1.5 text-xs font-medium rounded bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer shadow-xs"
              >
                Reset All Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
