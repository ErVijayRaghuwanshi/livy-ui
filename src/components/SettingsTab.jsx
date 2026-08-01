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
} from "lucide-react";
import { useSettings, DEFAULT_SETTINGS } from "../context/SettingsContext";
import { useLivy } from "../context/LivyContext";
import { v4 as uuidv4 } from "uuid";

export default function SettingsTab({ theme, toggleTheme, setShowConnectionModal }) {
  const { settings, updateSetting, updateAllSettings, resetToDefaults } = useSettings();
  const {
    hosts,
    activeHostId,
    selectHost,
    addHost,
    removeHost,
    updateHost,
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

  // Sync jsonText whenever settings change in UI mode
  useEffect(() => {
    if (mode === "ui") {
      setJsonText(JSON.stringify(settings, null, 2));
      setJsonError(null);
    }
  }, [settings, mode]);

  // Handle JSON Editor changes
  const handleJsonChange = useCallback(
    (value) => {
      setJsonText(value || "");
      try {
        const parsed = JSON.parse(value || "{}");
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          updateAllSettings(parsed);
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
      breadcrumb: "Workbench > Appearance > Color Theme",
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
      breadcrumb: "Text Editor > Font > Font Size",
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
      breadcrumb: "Text Editor > Font > Font Family",
      title: "Font Family",
      description: "Controls the font family list for code rendering.",
      type: "text",
    },
    {
      key: "editor.tabSize",
      category: "editor",
      title: "Tab Size",
      breadcrumb: "Text Editor > Formatting > Tab Size",
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
      breadcrumb: "Text Editor > Display > Word Wrap",
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
      breadcrumb: "Text Editor > Display > Line Numbers",
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
      breadcrumb: "Text Editor > Display > Minimap",
      title: "Minimap Enabled",
      description: "Controls whether the code outline minimap is shown on the right side of the editor.",
      type: "boolean",
    },
    {
      key: "editor.autoSave",
      category: "editor",
      breadcrumb: "Text Editor > Files > Auto Save",
      title: "Auto Save",
      description: "Automatically save dirty SQL tab files as you type.",
      type: "select",
      commonlyUsed: true,
      options: [
        { label: "Off (Manual Cmd+S)", value: "off" },
        { label: "On (Auto-save changes)", value: "on" },
      ],
    },
    {
      key: "editor.cursorBlinking",
      category: "editor",
      breadcrumb: "Text Editor > Cursor > Cursor Blinking",
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
      breadcrumb: "Text Editor > Display > Render Whitespace",
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
      key: "spark.defaultMaster",
      category: "compute",
      breadcrumb: "Spark & Compute > Cluster > Default Master URL",
      title: "Default Spark Master",
      description: "The default Spark Master connection string used when starting new Livy sessions.",
      type: "text",
      commonlyUsed: true,
    },
    {
      key: "spark.executor.memory",
      category: "compute",
      breadcrumb: "Spark & Compute > Resource Allocation > Executor Memory",
      title: "Executor Memory",
      description: "Amount of memory to allocate per Spark executor process (e.g. 1g, 2g, 4g).",
      type: "text",
      commonlyUsed: true,
    },
    {
      key: "spark.executor.cores",
      category: "compute",
      breadcrumb: "Spark & Compute > Resource Allocation > Executor Cores",
      title: "Executor Cores",
      description: "Number of CPU cores to allocate per Spark executor.",
      type: "number",
      min: 1,
      max: 64,
    },
    {
      key: "spark.driver.memory",
      category: "compute",
      breadcrumb: "Spark & Compute > Resource Allocation > Driver Memory",
      title: "Driver Memory",
      description: "Amount of memory to allocate for the Spark driver process.",
      type: "text",
    },
    {
      key: "spark.sql.shuffle.partitions",
      category: "compute",
      breadcrumb: "Spark & Compute > Performance > Shuffle Partitions",
      title: "Spark SQL Shuffle Partitions",
      description: "Default number of partitions to use when shuffling data for joins or aggregations.",
      type: "number",
      min: 1,
      max: 1000,
    },
    {
      key: "spark.dynamicAllocation.enabled",
      category: "compute",
      breadcrumb: "Spark & Compute > Scaling > Dynamic Allocation",
      title: "Dynamic Allocation",
      description: "Enable dynamic resource allocation to scale executors up or down based on workload.",
      type: "select",
      options: [
        { label: "Disabled (Fixed Executors)", value: "false" },
        { label: "Enabled (Autoscaling)", value: "true" },
      ],
    },
    {
      key: "spark.sql.warehouse.dir",
      category: "compute",
      breadcrumb: "Spark & Compute > Storage > Warehouse Directory",
      title: "Warehouse Directory",
      description: "Directory location for managed database and table files.",
      type: "text",
    },
    {
      key: "livy.activeHostUrl",
      category: "connection",
      breadcrumb: "Connection & Hosts > Livy Server > Active Host Endpoint",
      title: "Active Livy Host Endpoint",
      description: "The currently connected Apache Livy / livy-next REST server URL.",
      type: "hostSelector",
      commonlyUsed: true,
    },
    {
      key: "livy.hosts",
      category: "connection",
      breadcrumb: "Connection & Hosts > Managed Clusters > Livy Hosts",
      title: "Managed Livy Host Endpoints",
      description: "Manage, ping, and configure Livy / livy-next cluster endpoints available to connect.",
      type: "hostManager",
    },
    {
      key: "query.historyLimit",
      category: "history",
      breadcrumb: "Execution & History > Query History > Max Retention",
      title: "Query History Max Retention",
      description: "Maximum number of executed SQL statements retained in the Query History panel.",
      type: "number",
      min: 10,
      max: 500,
    },
    {
      key: "query.autoFormatOnRun",
      category: "history",
      breadcrumb: "Execution & History > Query Execution > Auto Format",
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
        def.breadcrumb.toLowerCase().includes(query);
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

  const handleEditInJson = () => {
    setMode("json");
  };

  return (
    <div className="flex flex-col h-full w-full bg-(--color-bg-primary) text-(--color-text-primary) overflow-hidden select-none">
      {/* VS Code Settings Header Toolbar */}
      <div className="flex items-center justify-between gap-4 px-6 py-3 border-b border-(--color-border) bg-(--color-bg-secondary)/30 shrink-0">
        <div className="flex items-center gap-2">
          <Sliders size={18} className="text-(--color-accent)" />
          <h1 className="text-sm font-semibold tracking-tight">Settings</h1>
        </div>

        {/* Search Input Bar (VS Code Center Search) */}
        {mode === "ui" && (
          <div className="relative flex-1 max-w-xl mx-4">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-(--color-text-muted)"
            />
            <input
              type="text"
              placeholder="Search settings (e.g. font, theme, spark, host, memory)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-1 text-xs rounded bg-(--color-bg-primary) border border-(--color-border) text-(--color-text-primary) placeholder-(--color-text-muted) focus:outline-none focus:border-(--color-accent) transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-(--color-text-muted) hover:text-(--color-text-primary)"
              >
                ✕
              </button>
            )}
          </div>
        )}

        {/* Header Right Action Icons (VS Code {} icon button to open JSON) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode((m) => (m === "ui" ? "json" : "ui"))}
            className={`p-1.5 rounded transition-colors cursor-pointer border ${
              mode === "json"
                ? "bg-(--color-accent)/20 border-(--color-accent) text-(--color-accent)"
                : "bg-(--color-bg-secondary) border-(--color-border) text-(--color-text-muted) hover:text-(--color-text-primary) hover:bg-(--color-bg-tertiary)"
            }`}
            title={mode === "ui" ? "Open Settings (JSON)" : "Open Settings (UI)"}
          >
            <Code size={15} />
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded bg-(--color-bg-secondary) hover:bg-(--color-bg-tertiary) text-(--color-text-secondary) hover:text-(--color-text-primary) border border-(--color-border) transition-colors cursor-pointer"
            title="Reset all settings to default values"
          >
            <RotateCcw size={12} />
            Reset Defaults
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {mode === "ui" ? (
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Left Category Sidebar */}
          <div className="w-56 shrink-0 border-r border-(--color-border) bg-(--color-bg-secondary)/10 p-3 overflow-y-auto hidden md:block">
            <div className="text-[11px] font-semibold text-(--color-text-muted) uppercase tracking-wider px-3 mb-2">
              User Settings
            </div>
            <div className="space-y-0.5">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id && !searchQuery;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.id);
                      setSearchQuery("");
                    }}
                    className={`flex items-center gap-2.5 w-full px-3 py-2 text-xs rounded font-medium transition-colors text-left cursor-pointer ${
                      isActive
                        ? "bg-(--color-bg-tertiary) text-(--color-accent) font-semibold"
                        : "text-(--color-text-muted) hover:text-(--color-text-primary) hover:bg-(--color-bg-secondary)/40"
                    }`}
                  >
                    <Icon size={14} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Settings Options List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {isResetSuccess && (
              <div className="flex items-center gap-2 p-3 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs animate-in fade-in">
                <Check size={15} />
                <span>All settings have been reset to defaults!</span>
              </div>
            )}

            {filteredDefinitions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-(--color-text-muted)">
                <Search size={32} className="mb-2 opacity-50" />
                <p className="text-sm font-medium">No matching settings found</p>
                <p className="text-xs text-(--color-text-muted)/80 mt-1">
                  Try adjusting your search query or category filter.
                </p>
              </div>
            ) : (
              filteredDefinitions.map((def) => {
                const currentValue = settings[def.key] ?? DEFAULT_SETTINGS[def.key];
                return (
                  <div
                    key={def.key}
                    className="p-4 rounded-md border border-(--color-border) bg-(--color-bg-secondary)/20 hover:border-(--color-border)/80 transition-all space-y-2.5"
                  >
                    {/* VS Code Breadcrumb Path */}
                    <div className="flex items-center justify-between text-[11px] text-(--color-text-muted)">
                      <div className="flex items-center gap-1 font-mono">
                        <span>{def.breadcrumb}</span>
                      </div>

                      {/* Edit in settings.json link */}
                      <button
                        onClick={handleEditInJson}
                        className="flex items-center gap-1 text-(--color-text-muted) hover:text-(--color-accent) transition-colors cursor-pointer"
                        title={`Edit ${def.key} in settings.json`}
                      >
                        <Code size={12} />
                        <span>Edit in settings.json</span>
                      </button>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-(--color-text-primary)">
                        {def.title}
                      </h3>
                      <p className="text-xs text-(--color-text-muted) mt-1 leading-relaxed">
                        {def.description}
                      </p>
                    </div>

                    {/* Setting Value Input Controls */}
                    <div className="pt-2">
                      {def.type === "select" && (
                        <select
                          value={currentValue}
                          onChange={(e) => {
                            const val = typeof def.options[0]?.value === "number" ? parseInt(e.target.value, 10) : e.target.value;
                            if (def.onChange) {
                              def.onChange(val);
                            } else {
                              updateSetting(def.key, val);
                            }
                          }}
                          className="px-3 py-1 text-xs rounded bg-(--color-bg-primary) border border-(--color-border) text-(--color-text-primary) focus:outline-none focus:border-(--color-accent) cursor-pointer"
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
                          onChange={(e) => updateSetting(def.key, parseInt(e.target.value, 10) || def.min)}
                          className="w-32 px-3 py-1 text-xs rounded bg-(--color-bg-primary) border border-(--color-border) text-(--color-text-primary) focus:outline-none focus:border-(--color-accent)"
                        />
                      )}

                      {def.type === "text" && (
                        <input
                          type="text"
                          value={currentValue}
                          onChange={(e) => updateSetting(def.key, e.target.value)}
                          className="w-full md:w-96 px-3 py-1 text-xs rounded bg-(--color-bg-primary) border border-(--color-border) text-(--color-text-primary) focus:outline-none focus:border-(--color-accent) font-mono"
                        />
                      )}

                      {def.type === "boolean" && (
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={!!currentValue}
                            onChange={(e) => updateSetting(def.key, e.target.checked)}
                            className="w-4 h-4 rounded border-(--color-border) text-(--color-accent) focus:ring-0 cursor-pointer"
                          />
                          <span className="text-xs font-medium text-(--color-text-secondary)">
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
                            className="px-3 py-1 text-xs rounded bg-(--color-bg-primary) border border-(--color-border) text-(--color-text-primary) focus:outline-none focus:border-(--color-accent) cursor-pointer font-mono"
                          >
                            {hosts.map((h) => (
                              <option key={h.id} value={h.id}>
                                {h.name} ({h.url})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Full Host Manager Section */}
                      {def.type === "hostManager" && (
                        <div className="space-y-4 pt-1">
                          {/* Hosts List Table */}
                          <div className="space-y-2">
                            {hosts.map((host) => {
                              const isActive = host.id === activeHostId;
                              const isEditing = editingHostId === host.id;
                              const pingState = pingResults[host.id];

                              return (
                                <div
                                  key={host.id}
                                  className={`flex flex-wrap items-center justify-between gap-3 p-3 rounded border ${
                                    isActive
                                      ? "bg-(--color-accent)/10 border-(--color-accent)/40"
                                      : "bg-(--color-bg-primary) border-(--color-border)"
                                  }`}
                                >
                                  {isEditing ? (
                                    <div className="flex flex-1 items-center gap-2">
                                      <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        placeholder="Host Name"
                                        className="px-2 py-1 text-xs rounded bg-(--color-bg-secondary) border border-(--color-border) text-(--color-text-primary) outline-none"
                                      />
                                      <input
                                        type="text"
                                        value={editUrl}
                                        onChange={(e) => setEditUrl(e.target.value)}
                                        placeholder="http://localhost:8998"
                                        className="flex-1 px-2 py-1 text-xs rounded bg-(--color-bg-secondary) border border-(--color-border) text-(--color-text-primary) font-mono outline-none"
                                      />
                                      <button
                                        onClick={() => handleSaveEditHost(host.id)}
                                        className="px-2.5 py-1 text-xs rounded bg-emerald-600 text-white font-medium cursor-pointer"
                                      >
                                        Save
                                      </button>
                                      <button
                                        onClick={() => setEditingHostId(null)}
                                        className="px-2.5 py-1 text-xs rounded bg-(--color-bg-tertiary) text-(--color-text-muted) cursor-pointer"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  ) : (
                                    <>
                                      <div className="flex items-center gap-2.5 min-w-0">
                                        <Server size={15} className="text-(--color-accent) shrink-0" />
                                        <div className="min-w-0">
                                          <div className="flex items-center gap-2">
                                            <span className="text-xs font-semibold text-(--color-text-primary) truncate">
                                              {host.name}
                                            </span>
                                            {isActive && (
                                              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                                Active Host
                                              </span>
                                            )}
                                          </div>
                                          <span className="text-[11px] font-mono text-(--color-text-muted) truncate block">
                                            {host.url}
                                          </span>
                                        </div>
                                      </div>

                                      {/* Host Action Buttons */}
                                      <div className="flex items-center gap-2">
                                        {/* Test Ping Result Badge */}
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
                                          onClick={() => handleTestHost(host)}
                                          className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-(--color-bg-secondary) hover:bg-(--color-bg-tertiary) border border-(--color-border) text-(--color-text-secondary) hover:text-(--color-text-primary) transition-colors cursor-pointer"
                                          title="Test API Connection"
                                        >
                                          <Wifi size={12} /> Test
                                        </button>

                                        {!isActive && (
                                          <button
                                            onClick={() => {
                                              selectHost(host.id);
                                              updateSetting("livy.activeHostUrl", host.url);
                                            }}
                                            className="px-2 py-1 text-xs rounded bg-(--color-accent)/10 hover:bg-(--color-accent)/20 text-(--color-accent) border border-(--color-accent)/30 transition-colors cursor-pointer"
                                          >
                                            Select
                                          </button>
                                        )}

                                        <button
                                          onClick={() => {
                                            setEditingHostId(host.id);
                                            setEditName(host.name);
                                            setEditUrl(host.url);
                                          }}
                                          className="p-1 rounded text-(--color-text-muted) hover:text-(--color-text-primary) hover:bg-(--color-bg-tertiary) cursor-pointer"
                                          title="Edit Host"
                                        >
                                          <Edit2 size={13} />
                                        </button>

                                        {host.id !== "default" && (
                                          <button
                                            onClick={() => removeHost(host.id)}
                                            className="p-1 rounded text-(--color-text-muted) hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer"
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

                          {/* Add Host Inline Form */}
                          <form
                            onSubmit={handleAddHostSubmit}
                            className="flex flex-wrap items-center gap-2 pt-2 border-t border-(--color-border)"
                          >
                            <input
                              type="text"
                              placeholder="Host Name (e.g. Staging Spark Cluster)"
                              value={newHostName}
                              onChange={(e) => setNewHostName(e.target.value)}
                              className="px-3 py-1.5 text-xs rounded bg-(--color-bg-primary) border border-(--color-border) text-(--color-text-primary) outline-none focus:border-(--color-accent)"
                            />
                            <input
                              type="text"
                              placeholder="http://localhost:8998"
                              value={newHostUrl}
                              onChange={(e) => setNewHostUrl(e.target.value)}
                              className="flex-1 min-w-48 px-3 py-1.5 text-xs rounded bg-(--color-bg-primary) border border-(--color-border) text-(--color-text-primary) font-mono outline-none focus:border-(--color-accent)"
                            />
                            <button
                              type="submit"
                              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded bg-(--color-accent) text-white hover:bg-(--color-accent)/90 transition-colors cursor-pointer"
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
        /* JSON Mode (settings.json Monaco Editor) */
        <div className="flex flex-col flex-1 min-h-0 relative">
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
              theme={theme === "dark" ? "vs-dark" : "light"}
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

          <div className="flex items-center justify-between px-4 py-1.5 border-t border-(--color-border) bg-(--color-bg-secondary)/30 text-xs text-(--color-text-muted) font-mono shrink-0">
            <span>settings.json</span>
            <span>Language: JSON</span>
          </div>
        </div>
      )}

      {/* Reset Settings Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-(--color-bg-primary) border border-(--color-border) rounded-lg shadow-2xl max-w-md w-full p-6 space-y-4">
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
                className="px-3 py-1.5 text-xs font-medium rounded bg-(--color-bg-secondary) hover:bg-(--color-bg-tertiary) text-(--color-text-secondary) hover:text-(--color-text-primary) border border-(--color-border) transition-colors cursor-pointer"
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
