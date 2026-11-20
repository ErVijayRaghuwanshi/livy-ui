import { useState, useEffect, useMemo } from "react";
import {
  Cpu,
  RefreshCw,
  Plus,
  Play,
  Loader2,
  Server,
  Database,
  Trash2,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  Sparkles,
  Layers,
  Copy,
  Check,
  Activity,
  Terminal,
  Settings2,
  Boxes,
} from "lucide-react";
import { useLivy } from "../context/LivyContext";
import { useSettings } from "../context/SettingsContext";
import { useSchema } from "../context/SchemaContext";
import { useToast } from "./Toast";
import { DATA_SOURCE_TYPES } from "../utils/constants";
import { testDorisConnection } from "../services/dorisApi";

export default function ComputePanel({ onClose, onInsertAtCursor, onRunSql, setShowConnectionModal }) {
  const {
    hosts,
    activeHost,
    activeHostId,
    selectHost,
    switchEngine,
    addHost,
    removeHost,
    updateHost,
    sessionId,
    sessions,
    sessionsLoading,
    fetchSessions,
    startSession,
    killSession,
    attachSession,
    refreshSession,
    isDoris,
    isSpark,
    isServerReachable,
  } = useLivy();

  const { settings, updateSetting } = useSettings();
  const { databases = [], refreshSchema } = useSchema();
  const { addToast } = useToast();

  const [expandedSections, setExpandedSections] = useState({
    endpoints: true,
    tools: true,
  });

  const toggleSection = (key) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Add Host Inline Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEngine, setNewEngine] = useState(isDoris ? DATA_SOURCE_TYPES.DORIS : DATA_SOURCE_TYPES.SPARK);
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState(isDoris ? "http://localhost:8030" : "http://localhost:8998");
  const [newCluster, setNewCluster] = useState("default_cluster");
  const [newDatabase, setNewDatabase] = useState("demo_db");
  const [newUsername, setNewUsername] = useState("root");
  const [newPassword, setNewPassword] = useState("");

  // Spark Create Session Form State
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [newSessionName, setNewSessionName] = useState("Spark SQL Session");
  const [newSessionKind, setNewSessionKind] = useState("sql");
  const [sessionStarting, setSessionStarting] = useState(false);

  // Ping latencies cache
  const [hostPings, setHostPings] = useState({});
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Filter hosts strictly by engine to prevent cross-engine pollution
  const sparkHosts = useMemo(
    () => hosts.filter((h) => h.type === DATA_SOURCE_TYPES.SPARK || h.engine === "spark" || (!h.type && !h.engine)),
    [hosts]
  );
  const dorisHosts = useMemo(
    () => hosts.filter((h) => h.type === DATA_SOURCE_TYPES.DORIS || h.engine === "doris"),
    [hosts]
  );

  const currentEngineHosts = isDoris ? dorisHosts : sparkHosts;

  useEffect(() => {
    if (activeHost) {
      testHostPing(activeHost);
    }
    currentEngineHosts.forEach((h) => {
      if (h.id !== activeHostId) {
        testHostPing(h);
      }
    });
  }, [activeHostId, currentEngineHosts.length, isDoris]);

  const testHostPing = async (host) => {
    if (!host) return;
    setHostPings((prev) => ({
      ...prev,
      [host.id]: { state: "loading" },
    }));

    const isDorisHost = host.type === DATA_SOURCE_TYPES.DORIS || host.engine === "doris";

    if (isDorisHost) {
      try {
        const dbToUse = host.database || settings["doris.defaultDatabase"] || "demo_db";
        const res = await testDorisConnection({ ...host, database: dbToUse });
        if (res.success) {
          setHostPings((prev) => ({
            ...prev,
            [host.id]: { state: "online", latency: Math.round(res.elapsed) },
          }));
        } else {
          setHostPings((prev) => ({
            ...prev,
            [host.id]: { state: "offline", error: res.error },
          }));
        }
      } catch (err) {
        setHostPings((prev) => ({
          ...prev,
          [host.id]: { state: "offline", error: err.message },
        }));
      }
    } else {
      const start = performance.now();
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const res = await fetch(`${host.url.replace(/\/$/, "")}/sessions`, {
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        const elapsed = Math.round(performance.now() - start);
        if (res.ok) {
          setHostPings((prev) => ({
            ...prev,
            [host.id]: { state: "online", latency: elapsed },
          }));
        } else {
          setHostPings((prev) => ({
            ...prev,
            [host.id]: { state: "offline", error: `HTTP ${res.status}` },
          }));
        }
      } catch (err) {
        setHostPings((prev) => ({
          ...prev,
          [host.id]: { state: "offline", error: err.message },
        }));
      }
    }
  };

  const handleRefreshAll = async () => {
    if (isSpark) {
      fetchSessions();
      if (sessionId !== null) {
        refreshSession(sessionId);
      }
    }
    currentEngineHosts.forEach((h) => testHostPing(h));
    refreshSchema?.();
  };

  const handleCopyUrl = (url) => {
    if (!url) return;
    navigator.clipboard?.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 1200);
  };

  const handleEngineSwitch = (targetEngine) => {
    if ((targetEngine === "spark" && isSpark) || (targetEngine === "doris" && isDoris)) {
      return;
    }

    const switchedHost = switchEngine(targetEngine);
    if (!switchedHost) {
      setNewEngine(targetEngine === "spark" ? DATA_SOURCE_TYPES.SPARK : DATA_SOURCE_TYPES.DORIS);
      setNewUrl(targetEngine === "spark" ? "http://localhost:8998" : "http://localhost:8030");
      setNewName(targetEngine === "spark" ? "Spark Livy Cluster" : "Apache Doris FE");
      setShowAddForm(true);
      setExpandedSections((prev) => ({ ...prev, endpoints: true }));
    }
  };

  const handleSelectDorisDatabase = (dbName) => {
    if (!dbName) return;
    updateHost(activeHost.id, { database: dbName });
    updateSetting("doris.defaultDatabase", dbName);
    addToast("info", `Target database set to '${dbName}'`, null, "Apache Doris");
  };

  const handleAddHostSubmit = async (e) => {
    e.preventDefault();
    const trimmedUrl = newUrl.trim();
    if (!trimmedUrl) return;

    const hostPayload = {
      id: `host-${Date.now()}`,
      name: newName.trim() || (newEngine === DATA_SOURCE_TYPES.DORIS ? "Apache Doris FE" : "Spark Livy Cluster"),
      url: trimmedUrl,
      type: newEngine,
      engine: newEngine,
    };

    if (newEngine === DATA_SOURCE_TYPES.DORIS) {
      hostPayload.cluster = newCluster.trim() || "default_cluster";
      hostPayload.database = newDatabase.trim() || "demo_db";
      hostPayload.username = newUsername.trim() || "root";
      hostPayload.password = newPassword;
    }

    addHost(hostPayload);
    selectHost(hostPayload.id);
    setShowAddForm(false);
    setNewName("");
    setNewUrl(newEngine === DATA_SOURCE_TYPES.DORIS ? "http://localhost:8030" : "http://localhost:8998");
    addToast("success", `Added ${hostPayload.name}`, null, "Compute");
  };

  const handleCreateSparkSession = async (e) => {
    e.preventDefault();
    setSessionStarting(true);
    try {
      await startSession(newSessionName, newSessionKind);
      setShowCreateSession(false);
      addToast("success", `Launched session '${newSessionName}'`, null, "Spark");
    } catch (err) {
      addToast("error", err.message || "Failed to launch session", null, "Spark");
    } finally {
      setSessionStarting(false);
    }
  };

  const quickInsertSql = (sql) => {
    if (onInsertAtCursor) {
      onInsertAtCursor(sql);
      addToast("info", "Query inserted at cursor", null, "Editor");
    }
  };

  const quickRunSql = (sql) => {
    if (onRunSql) {
      onRunSql(sql);
      addToast("info", `Executing ${sql.trim().split("\n")[0]}`, null, "SQL Runner");
    } else if (onInsertAtCursor) {
      onInsertAtCursor(sql);
    }
  };

  const currentDorisDb = activeHost?.database || settings["doris.defaultDatabase"] || "demo_db";
  const activePing = hostPings[activeHost?.id];

  // Concise, useful Doris introspection commands
  const DORIS_SHORTCUTS = [
    { label: "Storage Backends", sql: "SHOW PROC '/backends';\n", icon: Layers },
    { label: "Frontend Nodes", sql: "SHOW PROC '/frontends';\n", icon: Server },
    { label: "Databases", sql: "SHOW DATABASES;\n", icon: Database },
    { label: "Tables", sql: "SHOW TABLES;\n", icon: Boxes },
    { label: "AI Resources", sql: "SHOW RESOURCES;\n", icon: Sparkles },
    { label: "Workload Groups", sql: "SHOW WORKLOAD GROUPS;\n", icon: Activity },
    { label: "Active Queries", sql: "SHOW PROCESSLIST;\n", icon: Terminal },
  ];

  return (
    <div className="flex flex-col h-full bg-(--color-bg-secondary) select-none overflow-hidden">
      {/* 1. Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-(--color-border) shrink-0">
        <div className="flex items-center gap-1.5">
          <Cpu size={13} className="text-(--color-accent)" />
          <span className="text-[11px] font-bold text-(--color-text-primary) uppercase tracking-wider">
            Compute
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleRefreshAll}
            className="p-1 rounded hover:bg-(--color-bg-tertiary) text-(--color-text-muted) hover:text-(--color-text-primary) transition-colors cursor-pointer"
            title="Refresh Compute Status"
          >
            <RefreshCw size={12} className={sessionsLoading ? "animate-spin" : ""} />
          </button>
          {setShowConnectionModal && (
            <button
              onClick={() => setShowConnectionModal(true)}
              className="p-1 rounded hover:bg-(--color-bg-tertiary) text-(--color-text-muted) hover:text-(--color-text-primary) transition-colors cursor-pointer"
              title="Manage Connections"
            >
              <Settings2 size={12} />
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-(--color-bg-tertiary) text-(--color-text-muted) hover:text-(--color-text-primary) transition-colors cursor-pointer"
              title="Close Panel"
            >
              <PanelLeftClose size={12} />
            </button>
          )}
        </div>
      </div>

      {/* 2. Scrollable Body */}
      <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-(--color-border)/30 text-xs">
        {/* ========================================================
            ENGINE SWITCHER (SPARK VS DORIS)
            ======================================================== */}
        <div className="p-2.5">
          <div className="grid grid-cols-2 p-0.5 bg-(--color-bg-primary) rounded-lg border border-(--color-border) gap-0.5">
            <button
              type="button"
              onClick={() => handleEngineSwitch("spark")}
              className={`flex items-center justify-center gap-1.5 py-1 px-2 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                isSpark
                  ? "bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-2xs"
                  : "text-(--color-text-muted) hover:text-(--color-text-primary)"
              }`}
            >
              <span>⚡</span>
              <span>Spark</span>
              {isSpark && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />}
            </button>

            <button
              type="button"
              onClick={() => handleEngineSwitch("doris")}
              className={`flex items-center justify-center gap-1.5 py-1 px-2 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                isDoris
                  ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-2xs"
                  : "text-(--color-text-muted) hover:text-(--color-text-primary)"
              }`}
            >
              <span>🐬</span>
              <span>Doris</span>
              {isDoris && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />}
            </button>
          </div>
        </div>

        {/* ========================================================
            ENDPOINTS SECTION (STRICTLY SEGREGATED & UN-DUPLICATED)
            ======================================================== */}
        <div className="flex flex-col">
          <div
            onClick={() => toggleSection("endpoints")}
            className="flex items-center justify-between px-3 py-1.5 bg-(--color-bg-secondary)/70 hover:bg-(--color-bg-tertiary)/30 cursor-pointer select-none group"
          >
            <div className="flex items-center gap-1.5">
              {expandedSections.endpoints ? (
                <ChevronDown size={12} className="text-(--color-text-muted)" />
              ) : (
                <ChevronRight size={12} className="text-(--color-text-muted)" />
              )}
              <span className="text-[10px] font-bold text-(--color-text-secondary) uppercase tracking-wider">
                {isDoris ? "Doris Endpoints" : "Spark Endpoints"} ({currentEngineHosts.length})
              </span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setNewEngine(isDoris ? DATA_SOURCE_TYPES.DORIS : DATA_SOURCE_TYPES.SPARK);
                setNewUrl(isDoris ? "http://localhost:8030" : "http://localhost:8998");
                setNewName(isDoris ? "Apache Doris FE" : "Spark Livy Cluster");
                setShowAddForm((v) => !v);
              }}
              className="p-0.5 rounded hover:bg-(--color-bg-tertiary) text-(--color-text-muted) hover:text-(--color-text-primary) transition-colors cursor-pointer"
              title={`Add ${isDoris ? "Doris" : "Spark"} Endpoint`}
            >
              <Plus size={12} />
            </button>
          </div>

          {expandedSections.endpoints && (
            <div className="p-2.5 space-y-2">
              {currentEngineHosts.map((host) => {
                const isActive = host.id === activeHostId;
                const ping = hostPings[host.id];

                // If active host: render full connection card
                if (isActive) {
                  return (
                    <div
                      key={host.id}
                      className={`p-2.5 rounded-xl border transition-all ${
                        isDoris
                          ? "bg-cyan-950/20 border-cyan-500/30"
                          : "bg-amber-950/20 border-amber-500/30"
                      }`}
                    >
                      {/* Top row: Name and Ping */}
                      <div className="flex items-center justify-between gap-1.5 mb-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-sm shrink-0 select-none">{isDoris ? "🐬" : "⚡"}</span>
                          <span className="font-semibold text-xs text-(--color-text-primary) truncate">
                            {host.name}
                          </span>
                          {!isDoris && sessionId !== null && (
                            <span className="text-[9px] font-semibold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.2 rounded shrink-0">
                              #{sessionId}
                            </span>
                          )}
                        </div>

                        {/* Ping Pill */}
                        <div className="shrink-0">
                          {ping?.state === "loading" ? (
                            <span className="text-[10px] text-amber-400 font-mono flex items-center gap-1">
                              <Loader2 size={10} className="animate-spin" /> ...
                            </span>
                          ) : ping?.state === "online" ? (
                            <button
                              onClick={() => testHostPing(host)}
                              className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono font-medium hover:underline cursor-pointer"
                              title="Click to re-ping latency"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              {ping.latency}ms
                            </button>
                          ) : isServerReachable === true ? (
                            <button
                              onClick={() => testHostPing(host)}
                              className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono font-medium hover:underline cursor-pointer"
                              title="Connected · Click to measure latency"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              Online
                            </button>
                          ) : (
                            <button
                              onClick={() => testHostPing(host)}
                              className="text-[10px] text-rose-400 hover:underline cursor-pointer font-medium"
                              title={ping?.error || "Offline · Click to retry ping"}
                            >
                              Offline
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Dedicated Database Row (for Doris) */}
                      {isDoris && (
                        <div className="flex items-center justify-between gap-2 mb-2 px-2 py-1 bg-(--color-bg-primary)/40 rounded-md border border-(--color-border)/30 text-[10px]">
                          <span className="text-(--color-text-muted) font-medium shrink-0">Database:</span>
                          <select
                            value={currentDorisDb}
                            onChange={(e) => handleSelectDorisDatabase(e.target.value)}
                            className="text-[10px] font-mono bg-transparent text-cyan-300 outline-none cursor-pointer truncate max-w-[140px] text-right font-medium"
                            title="Active Doris Database"
                          >
                            {databases.length > 0 ? (
                              databases.map((db) => (
                                <option
                                  key={db.name || db}
                                  value={db.name || db}
                                  className="bg-(--color-bg-secondary) text-(--color-text-primary)"
                                >
                                  {db.name || db}
                                </option>
                              ))
                            ) : (
                              <>
                                <option value="demo_db" className="bg-(--color-bg-secondary) text-(--color-text-primary)">
                                  demo_db
                                </option>
                                <option
                                  value="information_schema"
                                  className="bg-(--color-bg-secondary) text-(--color-text-primary)"
                                >
                                  info_schema
                                </option>
                              </>
                            )}
                          </select>
                        </div>
                      )}

                      {/* Bottom row: Endpoint URL & Copy */}
                      <div className="flex items-center justify-between text-[10px] font-mono text-(--color-text-muted) bg-(--color-bg-primary)/70 px-2 py-1 rounded-md border border-(--color-border)/40">
                        <span className="truncate select-all">{host.url}</span>
                        <button
                          onClick={() => handleCopyUrl(host.url)}
                          className="ml-1 p-0.5 text-(--color-text-muted) hover:text-white transition-colors cursor-pointer shrink-0"
                          title="Copy Endpoint URL"
                        >
                          {copiedUrl ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                        </button>
                      </div>
                    </div>
                  );
                }

                // If non-active host: render compact switchable row
                return (
                  <div
                    key={host.id}
                    onClick={() => selectHost(host.id)}
                    className="group flex items-center justify-between px-2 py-1.5 rounded-lg border border-transparent hover:bg-(--color-bg-primary)/40 hover:border-(--color-border) transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="text-xs shrink-0 select-none">{isDoris ? "🐬" : "⚡"}</span>
                      <span className="text-[11px] text-(--color-text-secondary) group-hover:text-(--color-text-primary) truncate">
                        {host.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                      {ping?.state === "online" && (
                        <span className="text-[9px] text-emerald-400/80 font-mono">{ping.latency}ms</span>
                      )}
                      {ping?.state === "loading" && (
                        <span className="text-[9px] text-amber-400/80 font-mono">...</span>
                      )}

                      {host.id !== "default" && host.id !== "default-doris" && (
                        <button
                          onClick={() => removeHost(host.id)}
                          className="opacity-0 group-hover:opacity-100 p-0.5 text-(--color-text-muted) hover:text-rose-400 transition-all cursor-pointer"
                          title="Delete Host"
                        >
                          <Trash2 size={11} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Inline Add Host Form */}
              {showAddForm && (
                <form
                  onSubmit={handleAddHostSubmit}
                  className="p-2 rounded-lg border border-(--color-accent)/30 bg-(--color-bg-primary) space-y-1.5 animate-in fade-in"
                >
                  <div className="flex items-center justify-between pb-1 border-b border-(--color-border)/30">
                    <span className="text-[9px] font-bold uppercase text-(--color-text-primary)">
                      Add {isDoris ? "Doris" : "Spark"} Endpoint
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="text-(--color-text-muted) hover:text-white text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <input
                    type="text"
                    placeholder="Endpoint name..."
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-2 py-0.5 text-[11px] rounded bg-(--color-bg-secondary) border border-(--color-border) text-white outline-none"
                  />
                  <input
                    type="text"
                    placeholder={isDoris ? "URL (e.g. http://localhost:8030)" : "URL (e.g. http://localhost:8998)"}
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    className="w-full px-2 py-0.5 text-[11px] font-mono rounded bg-(--color-bg-secondary) border border-(--color-border) text-white outline-none"
                    required
                  />

                  {isDoris && (
                    <div className="grid grid-cols-2 gap-1 text-[10px]">
                      <input
                        type="text"
                        placeholder="Database (demo_db)"
                        value={newDatabase}
                        onChange={(e) => setNewDatabase(e.target.value)}
                        className="px-1.5 py-0.5 rounded bg-(--color-bg-secondary) border border-(--color-border) text-white outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Username (root)"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        className="px-1.5 py-0.5 rounded bg-(--color-bg-secondary) border border-(--color-border) text-white outline-none"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-1 text-[11px] font-semibold rounded bg-(--color-accent) text-white hover:bg-(--color-accent-hover) cursor-pointer"
                  >
                    Save Endpoint
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* ========================================================
            ENGINE TOOLS & SESSIONS SECTION (CLEAN & DIRECT)
            ======================================================== */}
        <div className="flex flex-col">
          <div
            onClick={() => toggleSection("tools")}
            className="flex items-center justify-between px-3 py-1.5 bg-(--color-bg-secondary)/70 hover:bg-(--color-bg-tertiary)/30 cursor-pointer select-none group"
          >
            <div className="flex items-center gap-1.5">
              {expandedSections.tools ? (
                <ChevronDown size={12} className="text-(--color-text-muted)" />
              ) : (
                <ChevronRight size={12} className="text-(--color-text-muted)" />
              )}
              <span className="text-[10px] font-bold text-(--color-text-secondary) uppercase tracking-wider">
                {isDoris ? "Doris Quick Tools" : `Spark Sessions (${sessions.length})`}
              </span>
            </div>

            {isSpark && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCreateSession((v) => !v);
                }}
                className="p-0.5 rounded hover:bg-(--color-bg-tertiary) text-(--color-text-muted) hover:text-(--color-text-primary) transition-colors cursor-pointer"
                title="Create Spark Session"
              >
                <Plus size={12} />
              </button>
            )}
          </div>

          {expandedSections.tools && (
            <div className="p-2 space-y-1">
              {/* DORIS SHORTCUTS LIST */}
              {isDoris ? (
                <div className="space-y-1">
                  {DORIS_SHORTCUTS.map((item) => {
                    const IconComp = item.icon;
                    return (
                      <div
                        key={item.label}
                        className="group flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-(--color-bg-primary) border border-transparent hover:border-(--color-border)/60 transition-colors"
                      >
                        <div
                          onClick={() => quickInsertSql(item.sql)}
                          className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer"
                          title="Click to insert query"
                        >
                          <IconComp size={12} className="text-cyan-400 shrink-0" />
                          <span className="text-[11px] text-(--color-text-secondary) group-hover:text-white truncate">
                            {item.label}
                          </span>
                        </div>

                        {onRunSql && (
                          <button
                            onClick={() => quickRunSql(item.sql)}
                            className="opacity-0 group-hover:opacity-100 flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500 hover:text-black transition-all cursor-pointer"
                            title="Run query immediately"
                          >
                            <Play size={8} className="fill-current" />
                            <span>Run</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* SPARK SESSIONS */
                <div className="space-y-1.5">
                  {showCreateSession && (
                    <form
                      onSubmit={handleCreateSparkSession}
                      className="p-2 rounded-lg border border-amber-500/30 bg-(--color-bg-primary) space-y-1.5 mb-1.5 animate-in fade-in"
                    >
                      <input
                        type="text"
                        placeholder="Session name..."
                        value={newSessionName}
                        onChange={(e) => setNewSessionName(e.target.value)}
                        className="w-full px-2 py-0.5 text-xs rounded bg-(--color-bg-secondary) border border-(--color-border) text-white outline-none"
                      />
                      <button
                        type="submit"
                        disabled={sessionStarting}
                        className="w-full py-1 text-xs font-semibold rounded bg-(--color-accent) text-white hover:bg-(--color-accent-hover) cursor-pointer"
                      >
                        {sessionStarting ? "Launching..." : "Launch Session"}
                      </button>
                    </form>
                  )}

                  {sessions.length === 0 ? (
                    <div className="text-center py-3 text-(--color-text-muted) text-[11px]">
                      No active sessions.
                      <button
                        onClick={() => setShowCreateSession(true)}
                        className="block mx-auto mt-1.5 px-2 py-0.5 text-[10px] font-medium rounded bg-(--color-bg-tertiary) hover:bg-(--color-accent) text-white transition-colors cursor-pointer"
                      >
                        + Launch Session
                      </button>
                    </div>
                  ) : (
                    sessions.map((s) => {
                      const isAttached = Number(s.id) === Number(sessionId) || String(s.id) === String(sessionId);
                      return (
                        <div
                          key={s.id}
                          className={`flex items-center justify-between px-2 py-1.5 rounded-lg border transition-all ${
                            isAttached
                              ? "bg-(--color-bg-primary) border-amber-500/40"
                              : "bg-transparent border-transparent hover:bg-(--color-bg-primary)/40 hover:border-(--color-border)"
                          }`}
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="font-semibold text-xs text-(--color-text-primary)">
                              #{s.id}
                            </span>
                            <span className="text-[10px] text-(--color-text-muted) truncate">
                              {s.name || s.kind}
                            </span>
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                s.state === "idle"
                                  ? "bg-emerald-400"
                                  : s.state === "busy"
                                  ? "bg-blue-400 animate-pulse"
                                  : s.state === "starting"
                                  ? "bg-amber-400 animate-pulse"
                                  : "bg-rose-400"
                              }`}
                              title={`State: ${s.state}`}
                            />
                          </div>

                          <div className="flex items-center gap-1">
                            {!isAttached ? (
                              <button
                                onClick={() => attachSession(s.id)}
                                className="px-1.5 py-0.5 text-[9px] rounded bg-(--color-bg-tertiary) hover:bg-amber-600 text-white cursor-pointer"
                              >
                                Attach
                              </button>
                            ) : (
                              <span className="text-[9px] text-amber-400 font-semibold">Active</span>
                            )}
                            <button
                              onClick={() => killSession(s.id)}
                              className="p-0.5 text-(--color-text-muted) hover:text-rose-400 cursor-pointer"
                              title="Kill Session"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
