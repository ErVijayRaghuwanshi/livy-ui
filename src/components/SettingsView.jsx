import { useState, useEffect, useMemo, useCallback } from "react";
import Editor from "@monaco-editor/react";
import {
  Search,
  Code,
  Sliders,
  Palette,
  FileCode,
  Zap,
  Server,
  History,
  RotateCcw,
  Check,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Sparkles,
  AlertTriangle,
  Plus,
  Trash2,
  Wifi,
  Edit2,
  CheckCircle2,
  XCircle,
  Loader2,
  Activity,
  RefreshCw,
  Play,
  Maximize2,
  Minimize2,
  X,
  Filter,
} from "lucide-react";
import { useSettings, DEFAULT_SETTINGS } from "../context/SettingsContext";
import { useLivy } from "../context/LivyContext";
import { v4 as uuidv4 } from "uuid";

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
}) {
  const { settings, updateSetting, updateAllSettings, resetToDefaults, resetSetting } = useSettings();
  const {
    hosts,
    activeHost,
    activeHostId,
    selectHost,
    addHost,
    removeHost,
    updateHost,
    sessionId,
    sessionState,
    sessions,
    sessionsLoading,
    fetchSessions,
    startSession,
    stopSession,
    killSession,
    attachSession,
    loading: livyLoading,
  } = useLivy();

  const [mode, setMode] = useState("ui"); // 'ui' | 'json'
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("commonlyUsed");
  const [jsonText, setJsonText] = useState(() => JSON.stringify(settings, null, 2));
  const [jsonError, setJsonError] = useState(null);
  const [isResetSuccess, setIsResetSuccess] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  // Host Manager Form State
  const [newHostName, setNewHostName] = useState("");
  const [newHostUrl, setNewHostUrl] = useState("http://localhost:8998");
  const [editingHostId, setEditingHostId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [pingResults, setPingResults] = useState({}); // { [hostId]: 'loading' | 'online' | 'offline' }

  // Session Manager Form State
  const [showCreateSessionForm, setShowCreateSessionForm] = useState(false);
  const [newSessionName, setNewSessionName] = useState("Default SQL Session");
  const [newSessionKind, setNewSessionKind] = useState("sql");
  const [sessionCreateError, setSessionCreateError] = useState(null);

  // Fetch active sessions when entering compute/connection category
  useEffect(() => {
    if (activeCategory === "compute" || activeCategory === "connection") {
      fetchSessions();
    }
  }, [activeCategory, fetchSessions]);

  const combinedSettings = useMemo(() => {
    return {
      ...settings,
      "livy.hosts": hosts,
    };
  }, [settings, hosts]);

  // Sync jsonText whenever settings change in UI mode
  useEffect(() => {
    if (mode === "ui") {
      setJsonText(JSON.stringify(combinedSettings, null, 2));
      setJsonError(null);
    }
  }, [combinedSettings, mode]);

  // Handle JSON Editor changes
  const handleJsonChange = useCallback(
    (value) => {
      setJsonText(value || "");
      try {
        const parsed = JSON.parse(value || "{}");
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          const { "livy.hosts": jsonHosts, ...otherSettings } = parsed;
          updateAllSettings(otherSettings);
          setJsonError(null);
        } else {
          setJsonError("JSON content must be a valid key-value object.");
        }
      } catch (err) {
        setJsonError(err.message);
      }
    },
    [updateAllSettings]
  );

  const categories = [
    { id: "commonlyUsed", label: "Commonly Used", icon: Sparkles },
    { id: "editor", label: "Text Editor", icon: FileCode },
    { id: "workbench", label: "Workbench", icon: Palette },
    { id: "compute", label: "Spark & Compute", icon: Zap },
    { id: "connection", label: "Connection & Hosts", icon: Server },
    { id: "history", label: "Execution & History", icon: History },
  ];

  const settingDefinitions = [
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
      description: "Controls whether suggestions should be accepted on Enter, in addition to Tab. Helps avoid ambiguity between inserting new lines or accepting suggestions (e.g. after commas).",
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
  ];

  // Test Host Ping / Connection
  const handleTestHost = async (host) => {
    setPingResults((prev) => ({ ...prev, [host.id]: "loading" }));
    try {
      const res = await fetch(`${host.url.replace(/\/$/, "")}/sessions`, {
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        setPingResults((prev) => ({ ...prev, [host.id]: "online" }));
      } else {
        setPingResults((prev) => ({ ...prev, [host.id]: "offline" }));
      }
    } catch {
      setPingResults((prev) => ({ ...prev, [host.id]: "offline" }));
    }
  };

  // Add Host Form Handler
  const handleAddHostSubmit = (e) => {
    e.preventDefault();
    const name = newHostName.trim() || "New Livy Cluster";
    let url = newHostUrl.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) {
      url = "http://" + url;
    }
    const newHost = { id: uuidv4(), name, url };
    addHost(newHost);
    setNewHostName("");
    setNewHostUrl("http://localhost:8998");
  };

  // Save Edit Host Handler
  const handleSaveEditHost = (hostId) => {
    const name = editName.trim();
    let url = editUrl.trim();
    if (!name || !url) return;
    if (!/^https?:\/\//i.test(url)) {
      url = "http://" + url;
    }
    updateHost(hostId, { name, url });
    setEditingHostId(null);
  };

  // Create Session Submit Handler
  const handleCreateSessionSubmit = async (e) => {
    e.preventDefault();
    setSessionCreateError(null);
    try {
      await startSession(newSessionName.trim() || "Spark Session", newSessionKind);
      setShowCreateSessionForm(false);
      setNewSessionName("Default SQL Session");
      setNewSessionKind("sql");
    } catch (err) {
      setSessionCreateError(err.message || "Failed to create compute session");
    }
  };

  // Filter settings by search query and selected category
  const filteredDefinitions = useMemo(() => {
    return settingDefinitions.filter((def) => {
      const matchesCategory =
        activeCategory === "commonlyUsed" ? def.commonlyUsed : def.category === activeCategory;
      const query = searchQuery.trim().toLowerCase();
      if (!query) return matchesCategory;
      const matchesSearch =
        def.title.toLowerCase().includes(query) ||
        def.key.toLowerCase().includes(query) ||
        def.description.toLowerCase().includes(query) ||
        (def.categoryLabel && def.categoryLabel.toLowerCase().includes(query));
      return matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const handleReset = () => {
    setShowResetModal(true);
  };

  const confirmReset = () => {
    resetToDefaults();
    setShowResetModal(false);
    setIsResetSuccess(true);
    setTimeout(() => setIsResetSuccess(false), 3000);
  };

  const isSettingModified = (def) => {
    const current = settings[def.key];
    const defVal = DEFAULT_SETTINGS[def.key];
    if (current === undefined) return false;
    return current !== defVal;
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#181818] text-[#cccccc] select-none overflow-hidden font-sans">
      {/* 1. Window / Modal Top Bar */}
      <div className="flex items-center justify-between h-10 px-4 border-b border-[#2b2b2b] bg-[#181818] shrink-0">
        {/* Left: Window title with Settings icon */}
        <div className="flex items-center gap-2">
          <Sliders size={15} className="text-[#0078d4]" />
          <span className="text-xs font-semibold text-[#e0e0e0] tracking-wide">Settings</span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          {/* {} Open JSON Button */}
          <button
            onClick={() => setMode((m) => (m === "ui" ? "json" : "ui"))}
            className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
              mode === "json"
                ? "bg-[#0078d4]/20 text-[#0078d4] font-medium"
                : "text-[#9d9d9d] hover:text-white hover:bg-[#2b2b2b]"
            }`}
            title={mode === "ui" ? "Open Settings (JSON)" : "Open Settings (UI)"}
          >
            <Code size={14} />
          </button>

          {/* Open as Tab Button (Modal mode) */}
          {isModal && onOpenAsTab && (
            <button
              onClick={onOpenAsTab}
              className="p-1.5 rounded text-xs text-[#9d9d9d] hover:text-white hover:bg-[#2b2b2b] transition-colors cursor-pointer"
              title="Open in Editor Tab (Turn into tab)"
            >
              <ExternalLink size={14} />
            </button>
          )}

          {/* Open as Floating Modal Button (Tab mode) */}
          {!isModal && onOpenAsModal && (
            <button
              onClick={onOpenAsModal}
              className="p-1.5 rounded text-xs text-[#9d9d9d] hover:text-white hover:bg-[#2b2b2b] transition-colors cursor-pointer"
              title="Open as Floating Overlay"
            >
              <ExternalLink size={14} />
            </button>
          )}

          {/* Maximize Toggle Button (Modal mode) */}
          {isModal && onToggleMaximize && (
            <button
              onClick={onToggleMaximize}
              className="p-1.5 rounded text-xs text-[#9d9d9d] hover:text-white hover:bg-[#2b2b2b] transition-colors cursor-pointer"
              title={isMaximized ? "Restore Window" : "Maximize Window"}
            >
              {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
          )}

          {/* Close Button (Modal mode) */}
          {isModal && onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded text-xs text-[#9d9d9d] hover:text-white hover:bg-[#c42b1c] transition-colors cursor-pointer ml-1"
              title="Close (Esc)"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* 2. Search Subheader */}
      {mode === "ui" && (
        <div className="px-6 py-2.5 border-b border-[#2b2b2b] bg-[#181818] flex items-center justify-between gap-4 shrink-0">
          {/* Search Box with VS Code placeholder and icons */}
          <div className="relative flex-1 max-w-xl">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#858585] pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search settings (↑↓ for history)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-16 py-1.5 text-xs rounded-md bg-[#252526] border border-[#3c3c3c] text-white placeholder-[#858585] focus:outline-none focus:border-[#0078d4] focus:ring-1 focus:ring-[#0078d4] transition-all"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-xs text-[#858585] hover:text-white p-0.5 cursor-pointer"
                  title="Clear search"
                >
                  <X size={12} />
                </button>
              )}
              <div className="text-[#858585] p-0.5" title="Filter Settings">
                <Filter size={12} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {searchQuery && (
              <span className="text-xs text-[#858585]">
                {filteredDefinitions.length} {filteredDefinitions.length === 1 ? "setting" : "settings"} found
              </span>
            )}
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-[#858585] hover:text-white hover:bg-[#2b2b2b] border border-[#333] hover:border-[#444] rounded transition-colors cursor-pointer"
              title="Reset all settings to default values"
            >
              <RotateCcw size={12} />
              <span>Reset Defaults</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Main Body */}
      {mode === "ui" ? (
        <div className="flex flex-1 min-h-0 overflow-hidden bg-[#181818]">
          {/* Left Category Sidebar (Tree View with Chevrons) */}
          <div className="w-56 shrink-0 border-r border-[#2b2b2b] bg-[#181818] py-2 overflow-y-auto hidden sm:block">
            <div className="px-3 py-1 text-[11px] font-semibold text-[#858585] tracking-wider uppercase">
              Preferences
            </div>
            <div className="space-y-0.5 px-1.5">
              {categories.map((cat) => {
                const isActive = activeCategory === cat.id && !searchQuery;
                const isCommon = cat.id === "commonlyUsed";
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.id);
                      setSearchQuery("");
                    }}
                    className={`flex items-center justify-between w-full px-2.5 py-1.5 text-xs rounded transition-colors text-left cursor-pointer group ${
                      isActive
                        ? "bg-[#2a2d2e] text-white font-medium"
                        : "text-[#cccccc] hover:bg-[#242424] hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {!isCommon ? (
                        <ChevronRight
                          size={13}
                          className={`shrink-0 transition-transform ${
                            isActive ? "rotate-90 text-[#0078d4]" : "text-[#858585] group-hover:text-white"
                          }`}
                        />
                      ) : (
                        <Sparkles size={13} className="text-[#0078d4] shrink-0" />
                      )}
                      <span className="truncate">{cat.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Settings Content: Authentic Unboxed Rows */}
          <div className="flex-1 bg-[#1e1e1e] overflow-y-auto px-6 sm:px-8 py-6 space-y-7">
            {isResetSuccess && (
              <div className="flex items-center gap-2 p-3 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs animate-in fade-in">
                <Check size={15} />
                <span>All settings have been successfully reset to defaults!</span>
              </div>
            )}

            {filteredDefinitions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center text-[#858585]">
                <Search size={36} className="mb-3 opacity-40" />
                <p className="text-sm font-medium text-[#cccccc]">No matching settings found</p>
                <p className="text-xs text-[#858585] mt-1">
                  Try checking your spelling or adjusting your search query.
                </p>
              </div>
            ) : (
              filteredDefinitions.map((def) => {
                const currentValue = settings[def.key] ?? DEFAULT_SETTINGS[def.key];
                const modified = isSettingModified(def);

                return (
                  <div
                    key={def.key}
                    className={`group relative pl-3.5 pr-2 transition-all space-y-2 border-l-2 ${
                      modified ? "border-l-[#0078d4]" : "border-l-transparent hover:border-l-[#3c3c3c]"
                    }`}
                  >
                    {/* Setting Title Line (VS Code style: Category in muted, Title in white) */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center flex-wrap gap-1.5 text-xs">
                        <span className="text-[#858585] font-medium">{def.categoryLabel}:</span>
                        <span className="text-white font-semibold">{def.title}</span>
                        {modified && (
                          <span className="text-[10px] text-[#0078d4] bg-[#0078d4]/10 px-1.5 py-0.2 rounded border border-[#0078d4]/30 font-medium">
                            Modified
                          </span>
                        )}
                      </div>

                      {/* Right Controls: inline reset + edit in JSON */}
                      <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                        {modified && (
                          <button
                            onClick={() => resetSetting(def.key)}
                            className="flex items-center gap-1 text-[11px] text-[#858585] hover:text-[#0078d4] transition-colors cursor-pointer"
                            title="Reset this setting to default value"
                          >
                            <RotateCcw size={11} />
                            <span>Reset</span>
                          </button>
                        )}
                        <button
                          onClick={() => setMode("json")}
                          className="flex items-center gap-1 text-[11px] text-[#6e6e6e] hover:text-[#cccccc] transition-colors cursor-pointer"
                          title={`Edit ${def.key} in settings.json`}
                        >
                          <Code size={11} />
                          <span>settings.json</span>
                        </button>
                      </div>
                    </div>

                    {/* Setting Description */}
                    <p className="text-xs text-[#9d9d9d] leading-relaxed max-w-2xl">
                      {def.description}
                    </p>

                    {/* Setting Input Control */}
                    <div className="pt-1">
                      {def.type === "select" && (
                        <select
                          value={currentValue}
                          onChange={(e) => {
                            const val =
                              typeof def.options[0]?.value === "number"
                                ? parseInt(e.target.value, 10)
                                : e.target.value;
                            if (def.onChange) {
                              def.onChange(val);
                            } else {
                              updateSetting(def.key, val);
                            }
                          }}
                          className="px-3 py-1.5 text-xs rounded bg-[#2b2b2b] border border-[#3c3c3c] text-white focus:outline-none focus:border-[#0078d4] cursor-pointer"
                        >
                          {def.options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      )}

                      {def.type === "number" && (
                        <input
                          type="number"
                          min={def.min}
                          max={def.max}
                          value={currentValue}
                          onChange={(e) =>
                            updateSetting(def.key, parseInt(e.target.value, 10) || def.min)
                          }
                          className="w-28 px-3 py-1.5 text-xs rounded bg-[#2b2b2b] border border-[#3c3c3c] text-white focus:outline-none focus:border-[#0078d4]"
                        />
                      )}

                      {def.type === "text" && (
                        <input
                          type="text"
                          value={currentValue}
                          onChange={(e) => updateSetting(def.key, e.target.value)}
                          className="w-full max-w-md px-3 py-1.5 text-xs rounded bg-[#2b2b2b] border border-[#3c3c3c] text-white focus:outline-none focus:border-[#0078d4] font-mono"
                        />
                      )}

                      {def.type === "boolean" && (
                        <label className="flex items-center gap-2.5 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={!!currentValue}
                            onChange={(e) => updateSetting(def.key, e.target.checked)}
                            className="w-4 h-4 rounded border-[#3c3c3c] bg-[#2b2b2b] text-[#0078d4] focus:ring-0 cursor-pointer accent-[#0078d4]"
                          />
                          <span className="text-xs text-white">
                            {currentValue ? "Enabled" : "Disabled"}
                          </span>
                        </label>
                      )}

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
                            className="px-3 py-1.5 text-xs rounded bg-[#2b2b2b] border border-[#3c3c3c] text-white focus:outline-none focus:border-[#0078d4] cursor-pointer font-mono"
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
                        <div className="space-y-4 pt-1 max-w-3xl">
                          {/* Session Manager Top Bar */}
                          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg border border-[#333333] bg-[#252526]">
                            <div className="flex items-center gap-2">
                              <Activity size={16} className="text-[#0078d4]" />
                              <span className="text-xs font-semibold text-white">
                                Connected Endpoint:{" "}
                                <span className="font-mono text-[#0078d4]">{activeHost.name}</span> (
                                {activeHost.url})
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => fetchSessions()}
                                disabled={sessionsLoading}
                                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded bg-[#2b2b2b] hover:bg-[#333] border border-[#3c3c3c] text-[#cccccc] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                              >
                                <RefreshCw size={12} className={sessionsLoading ? "animate-spin" : ""} />
                                Refresh
                              </button>

                              <button
                                onClick={() => {
                                  setShowCreateSessionForm((prev) => !prev);
                                  setSessionCreateError(null);
                                }}
                                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded bg-[#0078d4] text-white hover:bg-[#0078d4]/90 transition-colors cursor-pointer"
                              >
                                <Plus size={13} />{" "}
                                {showCreateSessionForm ? "Close Form" : "New Session"}
                              </button>
                            </div>
                          </div>

                          {/* Inline Create Session Form */}
                          {showCreateSessionForm && (
                            <form
                              onSubmit={handleCreateSessionSubmit}
                              className="p-4 rounded-lg border border-[#0078d4]/40 bg-[#0078d4]/5 space-y-3 animate-in fade-in"
                            >
                              <h4 className="text-xs font-semibold text-white flex items-center gap-1.5">
                                <Play size={13} className="text-[#0078d4]" /> Create New Spark / Livy Session
                              </h4>

                              {sessionCreateError && (
                                <div className="flex items-start gap-2 p-2.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono animate-in fade-in">
                                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                                  <span className="break-all">{sessionCreateError}</span>
                                </div>
                              )}

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[11px] font-medium text-[#858585] mb-1">
                                    Session Name
                                  </label>
                                  <input
                                    type="text"
                                    disabled={livyLoading}
                                    value={newSessionName}
                                    onChange={(e) => setNewSessionName(e.target.value)}
                                    placeholder="e.g. Analytics Session 1"
                                    className="w-full px-3 py-1 text-xs rounded bg-[#1e1e1e] border border-[#3c3c3c] text-white outline-none focus:border-[#0078d4] disabled:opacity-50"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[11px] font-medium text-[#858585] mb-1">
                                    Session Kind
                                  </label>
                                  <select
                                    disabled={livyLoading}
                                    value={newSessionKind}
                                    onChange={(e) => setNewSessionKind(e.target.value)}
                                    className="w-full px-3 py-1 text-xs rounded bg-[#1e1e1e] border border-[#3c3c3c] text-white outline-none focus:border-[#0078d4] cursor-pointer font-mono disabled:opacity-50"
                                  >
                                    <option value="sql">sql (Spark SQL)</option>
                                    <option value="pyspark">pyspark (Python Spark)</option>
                                    <option value="spark">spark (Scala Spark)</option>
                                  </select>
                                </div>
                              </div>

                              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#333333]">
                                <button
                                  type="button"
                                  disabled={livyLoading}
                                  onClick={() => {
                                    setShowCreateSessionForm(false);
                                    setSessionCreateError(null);
                                  }}
                                  className="px-3 py-1 text-xs rounded bg-[#2b2b2b] text-[#858585] hover:text-white cursor-pointer disabled:opacity-50"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="submit"
                                  disabled={livyLoading}
                                  className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded bg-[#0078d4] text-white hover:bg-[#0078d4]/90 transition-colors cursor-pointer disabled:opacity-50"
                                >
                                  {livyLoading ? (
                                    <Loader2 size={13} className="animate-spin" />
                                  ) : (
                                    <Play size={13} />
                                  )}
                                  {livyLoading ? "Starting Session..." : "Start Session"}
                                </button>
                              </div>
                            </form>
                          )}

                          {/* Active Sessions List */}
                          {sessions.length === 0 ? (
                            <div className="p-6 text-center rounded-lg border border-dashed border-[#333] bg-[#252526] text-[#858585] space-y-2">
                              <Server size={24} className="mx-auto opacity-40" />
                              <p className="text-xs font-medium">No active sessions found on this host.</p>
                              <p className="text-[11px] text-[#858585]">
                                Click "New Session" above or run a query to start an interactive Spark SQL session automatically.
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {sessions.map((s) => {
                                const isAttached = sessionId === s.id;
                                return (
                                  <div
                                    key={s.id}
                                    className={`flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg border ${
                                      isAttached
                                        ? "bg-emerald-500/10 border-emerald-500/40"
                                        : "bg-[#252526] border-[#333]"
                                    }`}
                                  >
                                    <div className="flex items-center gap-3 min-w-0">
                                      <div className="w-7 h-7 rounded bg-[#1e1e1e] border border-[#3c3c3c] flex items-center justify-center font-mono text-xs font-bold text-white shrink-0">
                                        #{s.id}
                                      </div>
                                      <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs font-semibold text-white font-mono">
                                            {s.name || `Session #${s.id}`}
                                          </span>
                                          <span className="text-[10px] uppercase font-mono font-bold px-1.5 py-0.2 rounded bg-[#1e1e1e] text-[#0078d4] border border-[#3c3c3c]">
                                            {s.kind || "sql"}
                                          </span>
                                          <span
                                            className={`text-[10px] font-semibold px-1.5 py-0.2 rounded uppercase ${
                                              s.state === "idle" || s.state === "busy"
                                                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                                : s.state === "starting"
                                                ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                                                : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                                            }`}
                                          >
                                            {s.state}
                                          </span>
                                          {isAttached && (
                                            <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-emerald-500 text-white">
                                              Attached (Active)
                                            </span>
                                          )}
                                        </div>
                                        <span className="text-[11px] font-mono text-[#858585] truncate block mt-0.5">
                                          App ID: {s.appId || "Initializing / Local"}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      {!isAttached ? (
                                        <button
                                          onClick={() => attachSession(s.id)}
                                          className="flex items-center gap-1 px-2.5 py-1 text-xs rounded bg-[#0078d4]/10 hover:bg-[#0078d4]/20 text-[#0078d4] border border-[#0078d4]/30 transition-colors cursor-pointer font-medium"
                                        >
                                          <Check size={12} /> Attach
                                        </button>
                                      ) : (
                                        <button
                                          onClick={() => stopSession()}
                                          className="flex items-center gap-1 px-2.5 py-1 text-xs rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-colors cursor-pointer font-medium"
                                        >
                                          Disconnect
                                        </button>
                                      )}

                                      <button
                                        onClick={() => killSession(s.id)}
                                        className="flex items-center gap-1 px-2.5 py-1 text-xs rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors cursor-pointer font-medium"
                                        title="Terminate Session on Server"
                                      >
                                        <Trash2 size={12} /> Terminate
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Full Host Manager Section */}
                      {def.type === "hostManager" && (
                        <div className="space-y-4 pt-1 max-w-3xl">
                          {/* Hosts List */}
                          <div className="space-y-2">
                            {hosts.map((host) => {
                              const isActive = host.id === activeHostId;
                              const isEditing = editingHostId === host.id;
                              const pingState = pingResults[host.id];

                              return (
                                <div
                                  key={host.id}
                                  onClick={() => {
                                    if (!isEditing && !isActive) {
                                      selectHost(host.id);
                                      updateSetting("livy.activeHostUrl", host.url);
                                    }
                                  }}
                                  className={`flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg border transition-all ${
                                    isActive
                                      ? "bg-[#0078d4]/10 border-[#0078d4]/40"
                                      : "bg-[#252526] border-[#333] hover:border-[#444] hover:bg-[#2a2a2c] cursor-pointer"
                                  }`}
                                >
                                  {isEditing ? (
                                    <div
                                      className="flex flex-1 items-center gap-2"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        placeholder="Host Name"
                                        className="px-2.5 py-1 text-xs rounded bg-[#1e1e1e] border border-[#3c3c3c] text-white outline-none"
                                      />
                                      <input
                                        type="text"
                                        value={editUrl}
                                        onChange={(e) => setEditUrl(e.target.value)}
                                        placeholder="http://localhost:8998"
                                        className="flex-1 px-2.5 py-1 text-xs rounded bg-[#1e1e1e] border border-[#3c3c3c] text-white font-mono outline-none"
                                      />
                                      <button
                                        onClick={() => handleSaveEditHost(host.id)}
                                        className="px-2.5 py-1 text-xs rounded bg-emerald-600 text-white font-medium cursor-pointer"
                                      >
                                        Save
                                      </button>
                                      <button
                                        onClick={() => setEditingHostId(null)}
                                        className="px-2.5 py-1 text-xs rounded bg-[#333] text-[#858585] cursor-pointer"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  ) : (
                                    <>
                                      <div className="flex items-center gap-3 min-w-0">
                                        <div
                                          className={`w-4 h-4 rounded-full flex items-center justify-center border transition-colors shrink-0 ${
                                            isActive
                                              ? "border-[#0078d4] bg-[#0078d4] text-white"
                                              : "border-[#3c3c3c] bg-[#1e1e1e]"
                                          }`}
                                        >
                                          {isActive && <Check size={10} strokeWidth={3} />}
                                        </div>
                                        <Server size={15} className="text-[#0078d4] shrink-0" />
                                        <div className="min-w-0">
                                          <div className="flex items-center gap-2">
                                            <span className="text-xs font-semibold text-white truncate">
                                              {host.name}
                                            </span>
                                            {isActive && (
                                              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                                Active Host
                                              </span>
                                            )}
                                          </div>
                                          <span className="text-[11px] font-mono text-[#858585] truncate block">
                                            {host.url}
                                          </span>
                                        </div>
                                      </div>

                                      {/* Host Actions */}
                                      <div className="flex items-center gap-2">
                                        {pingState === "loading" && (
                                          <span className="flex items-center gap-1 text-[11px] text-amber-400">
                                            <Loader2 size={12} className="animate-spin" /> Ping...
                                          </span>
                                        )}
                                        {pingState === "online" && (
                                          <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                                            <CheckCircle2 size={12} /> Connected
                                          </span>
                                        )}
                                        {pingState === "offline" && (
                                          <span className="flex items-center gap-1 text-[11px] text-rose-400 font-medium">
                                            <XCircle size={12} /> Unreachable
                                          </span>
                                        )}

                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleTestHost(host);
                                          }}
                                          className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-[#2b2b2b] hover:bg-[#333] border border-[#3c3c3c] text-[#cccccc] hover:text-white transition-colors cursor-pointer"
                                          title="Test API Connection"
                                        >
                                          <Wifi size={12} /> Test
                                        </button>

                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingHostId(host.id);
                                            setEditName(host.name);
                                            setEditUrl(host.url);
                                          }}
                                          className="p-1 rounded text-[#858585] hover:text-white hover:bg-[#333] cursor-pointer"
                                          title="Edit Host"
                                        >
                                          <Edit2 size={13} />
                                        </button>

                                        {host.id !== "default" && (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              removeHost(host.id);
                                            }}
                                            className="p-1 rounded text-[#858585] hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                                            title="Delete Host"
                                          >
                                            <Trash2 size={13} />
                                          </button>
                                        )}
                                      </div>
                                    </>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* Add Host Form */}
                          <form
                            onSubmit={handleAddHostSubmit}
                            className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#333]"
                          >
                            <input
                              type="text"
                              placeholder="Host Name (e.g. Staging Cluster)"
                              value={newHostName}
                              onChange={(e) => setNewHostName(e.target.value)}
                              className="px-3 py-1.5 text-xs rounded bg-[#1e1e1e] border border-[#3c3c3c] text-white outline-none focus:border-[#0078d4]"
                            />
                            <input
                              type="text"
                              placeholder="http://localhost:8998"
                              value={newHostUrl}
                              onChange={(e) => setNewHostUrl(e.target.value)}
                              className="flex-1 min-w-48 px-3 py-1.5 text-xs rounded bg-[#1e1e1e] border border-[#3c3c3c] text-white font-mono outline-none focus:border-[#0078d4]"
                            />
                            <button
                              type="submit"
                              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded bg-[#0078d4] text-white hover:bg-[#0078d4]/90 transition-colors cursor-pointer"
                            >
                              <Plus size={13} /> Add Host
                            </button>
                          </form>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* JSON Mode: Monaco Editor showing settings.json */
        <div className="flex flex-col flex-1 min-h-0 relative bg-[#1e1e1e]">
          {jsonError && (
            <div className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 border-b border-rose-500/30 text-rose-400 text-xs shrink-0 font-mono">
              <AlertCircle size={14} className="shrink-0" />
              <span>Syntax Error: {jsonError}</span>
            </div>
          )}

          <div className="flex-1 min-h-0">
            <Editor
              height="100%"
              language="json"
              theme="vs-dark"
              value={jsonText}
              onChange={handleJsonChange}
              options={{
                fontSize: settings["editor.fontSize"] || 14,
                tabSize: settings["editor.tabSize"] || 2,
                wordWrap: settings["editor.wordWrap"] || "on",
                minimap: { enabled: false },
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                automaticLayout: true,
                formatOnPaste: true,
                formatOnType: true,
              }}
            />
          </div>

          <div className="flex items-center justify-between px-4 py-1.5 border-t border-[#2b2b2b] bg-[#181818] text-xs text-[#858585] font-mono shrink-0">
            <span>settings.json</span>
            <span>Language: JSON</span>
          </div>
        </div>
      )}

      {/* Reset Confirmation Dialog */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-[#1f1f1f] border border-[#333] rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
                <AlertTriangle size={22} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">
                  Reset All Settings to Defaults?
                </h3>
                <p className="text-xs text-[#858585] mt-1 leading-relaxed">
                  Are you sure you want to restore all user settings to default values? Your custom font sizes, theme choices, Spark cluster configurations, and query history limits will be restored.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#333]">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-3 py-1.5 text-xs font-medium rounded bg-[#2b2b2b] hover:bg-[#333] text-[#cccccc] hover:text-white border border-[#3c3c3c] transition-colors cursor-pointer"
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
