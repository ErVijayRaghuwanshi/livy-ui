import { useState, useEffect } from "react";
import {
  Cpu,
  RefreshCw,
  Plus,
  Play,
  Square,
  CheckCircle2,
  XCircle,
  Loader2,
  Server,
  Database,
  Wifi,
  Trash2,
  Zap,
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
import { SESSION_STATES, DATA_SOURCE_TYPES } from "../utils/constants";
import { testDorisConnection } from "../services/dorisApi";

export default function ComputePanel({ onClose, onInsertAtCursor, onRunSql, setShowConnectionModal }) {
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
    isDoris,
    isSpark,
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
  const [newEngine, setNewEngine] = useState(DATA_SOURCE_TYPES.DORIS);
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("http://localhost:8030");
  const [newCluster, setNewCluster] = useState("default_cluster");
  const [newDatabase, setNewDatabase] = useState("demo_db");
  const [newUsername, setNewUsername] = useState("root");
  const [newPassword, setNewPassword] = useState("");
  const [addHostError, setAddHostError] = useState(null);

  // Spark Create Session Form State
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [newSessionName, setNewSessionName] = useState("Spark SQL Session");
  const [newSessionKind, setNewSessionKind] = useState("sql");
  const [sessionStarting, setSessionStarting] = useState(false);

  // Ping latencies cache
  const [hostPings, setHostPings] = useState({});
  const [copiedUrl, setCopiedUrl] = useState(false);

  useEffect(() => {
    if (activeHost) {
      testHostPing(activeHost);
    }
  }, [activeHostId]);

  const testHostPing = async (host) => {
    setHostPings((prev) => ({
      ...prev,
      [host.id]: { state: "loading" },
    }));

    const isDorisHost = host.type === DATA_SOURCE_TYPES.DORIS || host.engine === "doris";

    if (isDorisHost) {
      try {
        const res = await testDorisConnection(host);
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
        const res = await fetch(`${host.url.replace(/\/$/, "")}/sessions`, {
          headers: { Accept: "application/json" },
        });
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
    }
    hosts.forEach((h) => testHostPing(h));
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

    const targetHost = hosts.find((h) =>
      targetEngine === "spark"
        ? h.type === DATA_SOURCE_TYPES.SPARK || h.engine === "spark"
        : h.type === DATA_SOURCE_TYPES.DORIS || h.engine === "doris"
    );

    if (targetHost) {
      selectHost(targetHost.id);
      addToast(
        "info",
        `Switched to ${targetHost.name} (${targetEngine === "spark" ? "Spark SQL" : "Apache Doris"})`,
        null,
        "Compute Engine"
      );
    } else {
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
    setAddHostError(null);

    const trimmedUrl = newUrl.trim();
    if (!trimmedUrl) {
      setAddHostError("Endpoint URL cannot be empty");
      return;
    }

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
    addToast("success", `Added and connected to ${hostPayload.name}`, null, "Compute");
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

  // Concise, highly useful Doris introspection commands
  const DORIS_SHORTCUTS = [
    { label: "Storage Backends", sql: "SHOW PROC '/backends';\n", icon: Layers, desc: "BE nodes & disks" },
    { label: "Frontend Nodes", sql: "SHOW PROC '/frontends';\n", icon: Server, desc: "FE master/followers" },
    { label: "Databases", sql: "SHOW DATABASES;\n", icon: Database, desc: "All databases" },
    { label: "Tables", sql: "SHOW TABLES;\n", icon: Boxes, desc: `Tables in ${currentDorisDb}` },
    { label: "AI Resources", sql: "SHOW RESOURCES;\n", icon: Sparkles, desc: "Ollama / LLMs" },
    { label: "Workload Groups", sql: "SHOW WORKLOAD GROUPS;\n", icon: Activity, desc: "CPU/RAM queues" },
    { label: "Active Queries", sql: "SHOW PROCESSLIST;\n", icon: Terminal, desc: "Running client queries" },
  ];

  return (
    <div className="flex flex-col h-full bg-(--color-bg-secondary) select-none overflow-hidden">
      {/* 1. Clean Top Header */}
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
            ENGINE SWITCHER & ACTIVE HERO PILL (COMPACT & UNCLUTTERED)
            ======================================================== */}
        <div className="p-2.5 space-y-2">
          {/* Segmented Engine Switcher */}
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

          {/* Compact Active Connection Card */}
          <div
            className={`p-2.5 rounded-xl border transition-all ${
              isDoris
                ? "bg-cyan-950/20 border-cyan-500/30"
                : "bg-amber-950/20 border-amber-500/30"
            }`}
          >
            {/* Top row: Name, Database, and Ping */}
            <div className="flex items-center justify-between gap-1 mb-1.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-sm shrink-0 select-none">{isDoris ? "🐬" : "⚡"}</span>
                <span className="font-semibold text-xs text-(--color-text-primary) truncate">
                  {activeHost?.name}
                </span>

                {/* Doris Database Quick Dropdown */}
                {isDoris && (
                  <select
                    value={currentDorisDb}
                    onChange={(e) => handleSelectDorisDatabase(e.target.value)}
                    className="text-[10px] font-mono bg-(--color-bg-primary) border border-cyan-500/40 rounded px-1.5 py-0.5 text-cyan-300 outline-none cursor-pointer max-w-[100px] truncate"
                    title="Active Doris Database"
                  >
                    {databases.length > 0 ? (
                      databases.map((db) => (
                        <option key={db.name || db} value={db.name || db}>
                          {db.name || db}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="demo_db">demo_db</option>
                        <option value="information_schema">info_schema</option>
                      </>
                    )}
                  </select>
                )}
              </div>

              {/* Ping Pill */}
              <div className="shrink-0">
                {activePing?.state === "loading" ? (
                  <span className="text-[10px] text-amber-400 font-mono flex items-center gap-1">
                    <Loader2 size={10} className="animate-spin" /> ...
                  </span>
                ) : activePing?.state === "online" ? (
                  <button
                    onClick={() => testHostPing(activeHost)}
                    className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono font-medium hover:underline cursor-pointer"
                    title="Click to re-ping"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {activePing.latency}ms
                  </button>
                ) : (
                  <button
                    onClick={() => testHostPing(activeHost)}
                    className="text-[10px] text-rose-400 hover:underline cursor-pointer"
                    title="Click to retry ping"
                  >
                    Offline
                  </button>
                )}
              </div>
            </div>

            {/* Bottom row: Endpoint URL & Copy */}
            <div className="flex items-center justify-between text-[10px] font-mono text-(--color-text-muted) bg-(--color-bg-primary)/70 px-2 py-1 rounded-md border border-(--color-border)/40">
              <span className="truncate select-all">{activeHost?.url}</span>
              <button
                onClick={() => handleCopyUrl(activeHost?.url)}
                className="ml-1 p-0.5 text-(--color-text-muted) hover:text-white transition-colors cursor-pointer shrink-0"
                title="Copy Endpoint URL"
              >
                {copiedUrl ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================
            SAVED COMPUTE ENDPOINTS (COLLAPSIBLE)
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
                Endpoints ({hosts.length})
              </span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowAddForm((v) => !v);
              }}
              className="p-0.5 rounded hover:bg-(--color-bg-tertiary) text-(--color-text-muted) hover:text-(--color-text-primary) transition-colors cursor-pointer"
              title="Add New Endpoint"
            >
              <Plus size={12} />
            </button>
          </div>

          {expandedSections.endpoints && (
            <div className="p-2 space-y-1">
              {hosts.map((host) => {
                const isActive = host.id === activeHostId;
                const isDorisHost = host.type === DATA_SOURCE_TYPES.DORIS || host.engine === "doris";
                const ping = hostPings[host.id];

                return (
                  <div
                    key={host.id}
                    onClick={() => selectHost(host.id)}
                    className={`group flex items-center justify-between px-2 py-1.5 rounded-lg border transition-all cursor-pointer ${
                      isActive
                        ? "bg-(--color-bg-primary) border-(--color-accent)/40 font-medium"
                        : "bg-transparent border-transparent hover:bg-(--color-bg-primary)/40 hover:border-(--color-border)"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="text-xs shrink-0 select-none">{isDorisHost ? "🐬" : "⚡"}</span>
                      <span className={`text-[11px] truncate ${isActive ? "text-(--color-text-primary) font-semibold" : "text-(--color-text-secondary)"}`}>
                        {host.name}
                      </span>
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-(--color-accent) shrink-0" />}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                      {ping?.state === "online" && (
                        <span className="text-[9px] text-emerald-400/80 font-mono">{ping.latency}ms</span>
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

              {/* Minimal Inline Add Host Form */}
              {showAddForm && (
                <form
                  onSubmit={handleAddHostSubmit}
                  className="mt-1.5 p-2 rounded-lg border border-(--color-accent)/30 bg-(--color-bg-primary) space-y-1.5 animate-in fade-in"
                >
                  <div className="flex items-center justify-between pb-1 border-b border-(--color-border)/30">
                    <span className="text-[9px] font-bold uppercase text-(--color-text-primary)">Add Endpoint</span>
                    <button type="button" onClick={() => setShowAddForm(false)} className="text-(--color-text-muted) text-xs">✕</button>
                  </div>

                  <div className="grid grid-cols-2 gap-1 text-[9px]">
                    <button
                      type="button"
                      onClick={() => {
                        setNewEngine(DATA_SOURCE_TYPES.DORIS);
                        setNewUrl("http://localhost:8030");
                        setNewName("Apache Doris FE");
                      }}
                      className={`py-0.5 rounded text-center ${newEngine === DATA_SOURCE_TYPES.DORIS ? "bg-cyan-500/20 text-cyan-300 font-bold" : "text-(--color-text-muted)"}`}
                    >
                      🐬 Doris
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNewEngine(DATA_SOURCE_TYPES.SPARK);
                        setNewUrl("http://localhost:8998");
                        setNewName("Spark Livy");
                      }}
                      className={`py-0.5 rounded text-center ${newEngine === DATA_SOURCE_TYPES.SPARK ? "bg-amber-500/20 text-amber-300 font-bold" : "text-(--color-text-muted)"}`}
                    >
                      ⚡ Spark
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
                    placeholder="URL (e.g. http://localhost:8030)"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    className="w-full px-2 py-0.5 text-[11px] font-mono rounded bg-(--color-bg-secondary) border border-(--color-border) text-white outline-none"
                    required
                  />

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
            ENGINE TOOLS & SESSIONS (CLEAN & DIRECT)
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

                        {/* Hover Action: Run Immediately */}
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
                      const isAttached = s.id === sessionId;
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
                            <span className={`w-1.5 h-1.5 rounded-full ${s.state === "idle" ? "bg-emerald-400" : "bg-amber-400"}`} />
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
