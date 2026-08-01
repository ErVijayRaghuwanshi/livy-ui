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
} from "lucide-react";
import { useSettings, DEFAULT_SETTINGS } from "../context/SettingsContext";
import { useLivy } from "../context/LivyContext";

export default function SettingsTab({ theme, toggleTheme, setShowConnectionModal }) {
  const { settings, updateSetting, updateAllSettings, resetToDefaults } = useSettings();
  const { hosts, activeHostId, selectHost } = useLivy();

  const [mode, setMode] = useState("ui"); // 'ui' | 'json'
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [jsonText, setJsonText] = useState(() => JSON.stringify(settings, null, 2));
  const [jsonError, setJsonError] = useState(null);
  const [isSavedSuccess, setIsSavedSuccess] = useState(false);

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
    { id: "all", label: "All Settings", icon: Sliders },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "editor", label: "Editor", icon: FileCode },
    { id: "compute", label: "Spark & Compute", icon: Zap },
    { id: "connection", label: "Connection & Hosts", icon: Server },
    { id: "history", label: "Execution & History", icon: History },
  ];

  const settingDefinitions = [
    {
      key: "workbench.colorTheme",
      category: "appearance",
      title: "Color Theme",
      description: "Specifies the visual theme for the workbench interface and Monaco Editor.",
      type: "select",
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
      title: "Font Size",
      description: "Controls the font size in pixels for the SQL Monaco Editor.",
      type: "number",
      min: 10,
      max: 32,
    },
    {
      key: "editor.tabSize",
      category: "editor",
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
      title: "Word Wrap",
      description: "Controls how lines should wrap in the Monaco SQL Editor.",
      type: "select",
      options: [
        { label: "Off (Horizontal Scroll)", value: "off" },
        { label: "On (Wrap long lines)", value: "on" },
      ],
    },
    {
      key: "editor.lineNumbers",
      category: "editor",
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
      title: "Minimap Enabled",
      description: "Controls whether the code outline minimap is shown on the right side of the editor.",
      type: "boolean",
    },
    {
      key: "editor.autoSave",
      category: "editor",
      title: "Auto Save",
      description: "Automatically save dirty SQL tab files as you type.",
      type: "select",
      options: [
        { label: "Off (Manual Cmd+S)", value: "off" },
        { label: "On (Auto-save changes)", value: "on" },
      ],
    },
    {
      key: "editor.cursorBlinking",
      category: "editor",
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
      key: "spark.defaultMaster",
      category: "compute",
      title: "Default Spark Master",
      description: "The default Spark Master connection string used when starting new Livy sessions.",
      type: "text",
    },
    {
      key: "spark.executor.memory",
      category: "compute",
      title: "Executor Memory",
      description: "Amount of memory to allocate per Spark executor process (e.g. 1g, 2g, 4g).",
      type: "text",
    },
    {
      key: "spark.executor.cores",
      category: "compute",
      title: "Executor Cores",
      description: "Number of CPU cores to allocate per Spark executor.",
      type: "number",
      min: 1,
      max: 64,
    },
    {
      key: "spark.driver.memory",
      category: "compute",
      title: "Driver Memory",
      description: "Amount of memory to allocate for the Spark driver process.",
      type: "text",
    },
    {
      key: "spark.sql.shuffle.partitions",
      category: "compute",
      title: "Spark SQL Shuffle Partitions",
      description: "Default number of partitions to use when shuffling data for joins or aggregations.",
      type: "number",
      min: 1,
      max: 1000,
    },
    {
      key: "livy.activeHostUrl",
      category: "connection",
      title: "Active Livy Host Endpoint",
      description: "The currently connected Apache Livy / livy-next REST server URL.",
      type: "hostSelector",
    },
    {
      key: "query.historyLimit",
      category: "history",
      title: "Query History Max Retention",
      description: "Maximum number of executed SQL statements retained in the Query History panel.",
      type: "number",
      min: 10,
      max: 500,
    },
  ];

  // Filter settings by search query and selected category
  const filteredDefinitions = useMemo(() => {
    return settingDefinitions.filter((def) => {
      const matchesCategory = activeCategory === "all" || def.category === activeCategory;
      const query = searchQuery.trim().toLowerCase();
      if (!query) return matchesCategory;
      const matchesSearch =
        def.title.toLowerCase().includes(query) ||
        def.key.toLowerCase().includes(query) ||
        def.description.toLowerCase().includes(query) ||
        def.category.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const handleReset = () => {
    resetToDefaults();
    setIsSavedSuccess(true);
    setTimeout(() => setIsSavedSuccess(false), 2000);
  };

  return (
    <div className="flex flex-col h-full w-full bg-(--color-bg-primary) text-(--color-text-primary) overflow-hidden select-none">
      {/* Settings Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-(--color-border) bg-(--color-bg-secondary)/30 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Sliders size={20} className="text-(--color-accent)" />
            <h1 className="text-lg font-semibold tracking-tight">Settings</h1>
          </div>
          <span className="text-xs px-2 py-0.5 rounded bg-(--color-bg-tertiary) text-(--color-text-muted) border border-(--color-border)">
            {mode === "ui" ? "UI Mode" : "settings.json"}
          </span>
        </div>

        {/* Search Bar & View Mode Toggle */}
        <div className="flex items-center gap-3">
          {mode === "ui" && (
            <div className="relative w-64 md:w-80">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-(--color-text-muted)"
              />
              <input
                type="text"
                placeholder="Search settings (e.g. font, theme, spark)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md bg-(--color-bg-primary) border border-(--color-border) text-(--color-text-primary) placeholder-(--color-text-muted) focus:outline-none focus:border-(--color-accent) transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-(--color-text-muted) hover:text-(--color-text-primary)"
                >
                  ✕
                </button>
              )}
            </div>
          )}

          {/* Mode Switcher Buttons */}
          <div className="flex items-center bg-(--color-bg-secondary) rounded-md border border-(--color-border) p-0.5">
            <button
              onClick={() => setMode("ui")}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded transition-all cursor-pointer ${
                mode === "ui"
                  ? "bg-(--color-accent) text-white shadow-xs"
                  : "text-(--color-text-muted) hover:text-(--color-text-primary)"
              }`}
              title="Form UI View"
            >
              <Sliders size={13} />
              UI
            </button>
            <button
              onClick={() => setMode("json")}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded transition-all cursor-pointer ${
                mode === "json"
                  ? "bg-(--color-accent) text-white shadow-xs"
                  : "text-(--color-text-muted) hover:text-(--color-text-primary)"
              }`}
              title="Open Settings (JSON)"
            >
              <Code size={13} />
              JSON ({`{}`})
            </button>
          </div>

          {/* Reset Defaults Button */}
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-(--color-bg-secondary) hover:bg-(--color-bg-tertiary) text-(--color-text-secondary) hover:text-(--color-text-primary) border border-(--color-border) transition-colors cursor-pointer"
            title="Reset all settings to default values"
          >
            <RotateCcw size={13} />
            Reset Defaults
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {mode === "ui" ? (
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Category Sidebar */}
          <div className="w-56 shrink-0 border-r border-(--color-border) bg-(--color-bg-secondary)/10 p-3 overflow-y-auto hidden md:block">
            <div className="text-[11px] font-semibold text-(--color-text-muted) uppercase tracking-wider px-3 mb-2">
              Categories
            </div>
            <div className="space-y-0.5">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center gap-2.5 w-full px-3 py-2 text-xs rounded-md font-medium transition-colors text-left cursor-pointer ${
                      isActive
                        ? "bg-(--color-bg-tertiary) text-(--color-accent) font-semibold"
                        : "text-(--color-text-muted) hover:text-(--color-text-primary) hover:bg-(--color-bg-secondary)/40"
                    }`}
                  >
                    <Icon size={15} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Settings Options List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {isSavedSuccess && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs animate-in fade-in">
                <Check size={16} />
                <span>Settings have been reset to default values!</span>
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
                    className="p-4 rounded-lg border border-(--color-border) bg-(--color-bg-secondary)/20 hover:border-(--color-border)/80 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-semibold text-(--color-text-primary)">
                          {def.title}
                        </h3>
                        <code className="text-[11px] text-(--color-text-muted) font-mono bg-(--color-bg-tertiary) px-1.5 py-0.5 rounded mt-1 inline-block">
                          {def.key}
                        </code>
                        <p className="text-xs text-(--color-text-muted) mt-1.5 leading-relaxed">
                          {def.description}
                        </p>
                      </div>
                    </div>

                    {/* Setting Value Input Controls */}
                    <div className="pt-2 border-t border-(--color-border)/50">
                      {def.type === "select" && (
                        <select
                          value={currentValue}
                          onChange={(e) => {
                            const val = def.options[0]?.value === number ? parseInt(e.target.value, 10) : e.target.value;
                            if (def.onChange) {
                              def.onChange(val);
                            } else {
                              updateSetting(def.key, val);
                            }
                          }}
                          className="px-3 py-1.5 text-xs rounded-md bg-(--color-bg-primary) border border-(--color-border) text-(--color-text-primary) focus:outline-none focus:border-(--color-accent) cursor-pointer"
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
                          className="w-32 px-3 py-1.5 text-xs rounded-md bg-(--color-bg-primary) border border-(--color-border) text-(--color-text-primary) focus:outline-none focus:border-(--color-accent)"
                        />
                      )}

                      {def.type === "text" && (
                        <input
                          type="text"
                          value={currentValue}
                          onChange={(e) => updateSetting(def.key, e.target.value)}
                          className="w-full md:w-96 px-3 py-1.5 text-xs rounded-md bg-(--color-bg-primary) border border-(--color-border) text-(--color-text-primary) focus:outline-none focus:border-(--color-accent) font-mono"
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
                            className="px-3 py-1.5 text-xs rounded-md bg-(--color-bg-primary) border border-(--color-border) text-(--color-text-primary) focus:outline-none focus:border-(--color-accent) cursor-pointer font-mono"
                          >
                            {hosts.map((h) => (
                              <option key={h.id} value={h.id}>
                                {h.name} ({h.url})
                              </option>
                            ))}
                          </select>

                          <button
                            onClick={() => setShowConnectionModal(true)}
                            className="px-3 py-1.5 text-xs font-medium rounded-md bg-(--color-accent) text-white hover:bg-(--color-accent)/90 transition-colors cursor-pointer"
                          >
                            Manage Connection Hosts...
                          </button>
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
        /* JSON Mode (Monaco Editor settings.json) */
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

          <div className="flex items-center justify-between px-4 py-2 border-t border-(--color-border) bg-(--color-bg-secondary)/30 text-xs text-(--color-text-muted) font-mono shrink-0">
            <span>File: settings.json</span>
            <span>Language: JSON</span>
          </div>
        </div>
      )}
    </div>
  );
}
