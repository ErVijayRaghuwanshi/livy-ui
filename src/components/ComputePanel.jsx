import { useState, useEffect, useMemo } from "react";
import {
  Cpu,
  RefreshCw,
  Plus,
  Play,
  CheckCircle2,
  XCircle,
  Loader2,
  Server,
  Database,
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
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  PlayCircle,
  Radio,
  HardDrive,
  Flame,
  Info,
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
    switchEngine,
    addHost,
    removeHost,
    updateHost,
    sessionId,
    sessionState,
    sessions,
    sessionsLoading,
    fetchSessions,
    startSession,
    killSession,
    attachSession,
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
    otherEndpoints: false,
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
  const [isTestingNewHost, setIsTestingNewHost] = useState(false);
  const [newHostTestResult, setNewHostTestResult] = useState(null);
  const [addHostError, setAddHostError] = useState(null);

  // Spark Create Session Form State
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [newSessionName, setNewSessionName] = useState("Spark SQL Session");
  const [newSessionKind, setNewSessionKind] = useState("sql");
  const [sessionStarting, setSessionStarting] = useState(false);
  const [confirmKillId, setConfirmKillId] = useState(null);

  // Ping latencies cache
  const [hostPings, setHostPings] = useState({});
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Filter hosts by engine for segregation
  const sparkHosts = useMemo(
    () => hosts.filter((h) => h.type === DATA_SOURCE_TYPES.SPARK || h.engine === "spark" || (!h.type && !h.engine)),
    [hosts]
  );
  const dorisHosts = useMemo(
    () => hosts.filter((h) => h.type === DATA_SOURCE_TYPES.DORIS || h.engine === "doris"),
    [hosts]
  );

  const currentEngineHosts = isDoris ? dorisHosts : sparkHosts;
  const otherEngineHosts = isDoris ? sparkHosts : dorisHosts;

  useEffect(() => {
    if (activeHost) {
      testHostPing(activeHost);
    }
    hosts.forEach((h) => {
      if (h.id !== activeHostId) {
        testHostPing(h);
      }
    });
  }, [activeHostId, hosts.length]);

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
        const timeoutId = setTimeout(() => controller.abort(), 6000);
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
    }
    hosts.forEach((h) => testHostPing(h));
    refreshSchema?.();
    addToast("info", "Refreshed compute & endpoints status", null, "Compute");
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
    if (switchedHost) {
      addToast(
        "info",
        `Switched workbench to ${targetEngine === "spark" ? "Apache Spark (Livy)" : "Apache Doris (MPP)"}`,
        null,
        "Compute Engine"
      );
    } else {
      // If no host exists for this engine yet, open add host form
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

  const handleOpenAddForm = (engineType) => {
    const targetEngine = engineType || (isDoris ? DATA_SOURCE_TYPES.DORIS : DATA_SOURCE_TYPES.SPARK);
    setNewEngine(targetEngine);
    setNewName(targetEngine === DATA_SOURCE_TYPES.DORIS ? "Apache Doris FE" : "Spark Livy Cluster");
    setNewUrl(targetEngine === DATA_SOURCE_TYPES.DORIS ? "http://localhost:8030" : "http://localhost:8998");
    setNewHostTestResult(null);
    setAddHostError(null);
    setShowAddForm(true);
    setExpandedSections((prev) => ({ ...prev, endpoints: true }));
  };

  const handleTestNewEndpoint = async () => {
    setIsTestingNewHost(true);
    setNewHostTestResult(null);
    setAddHostError(null);

    const trimmedUrl = newUrl.trim();
    if (!trimmedUrl) {
      setNewHostTestResult({ ok: false, error: "Please enter a valid URL." });
      setIsTestingNewHost(false);
      return;
    }

    try {
      if (newEngine === DATA_SOURCE_TYPES.DORIS) {
        const res = await testDorisConnection({
          url: trimmedUrl,
          database: newDatabase.trim() || "demo_db",
          username: newUsername.trim() || "root",
          password: newPassword,
          cluster: newCluster.trim() || "default_cluster",
        });
        if (res.success) {
          setNewHostTestResult({ ok: true, latency: Math.round(res.elapsed) });
        } else {
          setNewHostTestResult({ ok: false, error: res.error || "Connection failed" });
        }
      } else {
        const start = performance.now();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);
        const res = await fetch(`${trimmedUrl.replace(/\/$/, "")}/sessions`, {
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        const elapsed = Math.round(performance.now() - start);
        if (res.ok) {
          setNewHostTestResult({ ok: true, latency: elapsed });
        } else {
          setNewHostTestResult({ ok: false, error: `HTTP ${res.status}` });
        }
      }
    } catch (err) {
      setNewHostTestResult({ ok: false, error: err.message || "Endpoint unreachable" });
    } finally {
      setIsTestingNewHost(false);
    }
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
    setNewHostTestResult(null);
    addToast("success", `Added and connected to ${hostPayload.name}`, null, "Compute");
  };

  const handleQuickLaunchPreset = async (name, kind) => {
    setSessionStarting(true);
    try {
      await startSession(name, kind);
      addToast("success", `Launched ${kind === "pyspark" ? "PySpark" : "Spark SQL"} session`, null, "Spark");
    } catch (err) {
      addToast("error", err.message || "Failed to launch session", null, "Spark");
    } finally {
      setSessionStarting(false);
    }
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

  const handleKillSession = async (id) => {
    try {
      await killSession(id);
      setConfirmKillId(null);
      addToast("info", `Terminated session #${id}`, null, "Spark");
    } catch (err) {
      addToast("error", err.message || "Failed to kill session", null, "Spark");
    }
  };

  const quickInsertSql = (sql) => {
    if (onInsertAtCursor) {
      onInsertAtCursor(sql);
      addToast("info", "Query inserted into editor", null, "Editor");
    }
  };

  const quickRunSql = (sql) => {
    if (onRunSql) {
      onRunSql(sql);
      addToast("info", `Executing: ${sql.trim().split("\n")[0]}`, null, "SQL Runner");
    } else if (onInsertAtCursor) {
      onInsertAtCursor(sql);
    }
  };

  const currentDorisDb = activeHost?.database || settings["doris.defaultDatabase"] || "demo_db";
  const activePing = hostPings[activeHost?.id];

  // Session stats for Spark
  const idleSessionsCount = sessions.filter((s) => s.state === SESSION_STATES.IDLE).length;
  const busySessionsCount = sessions.filter((s) => s.state === SESSION_STATES.BUSY).length;

  // Categorized Doris Introspection Tools
  const DORIS_GROUPS = [
    {
      groupTitle: "Cluster Topology & Nodes",
      items: [
        {
          label: "Frontend Nodes (FE)",
          desc: "FE master/follower status, IPs, and query ports",
          sql: "SHOW FRONTENDS;\n",
          icon: Server,
        },
        {
          label: "Storage Backends (BE)",
          desc: "BE storage nodes, disk usage, and tablet distribution",
          sql: "SHOW PROC '/backends';\n",
          icon: Layers,
        },
      ],
    },
    {
      groupTitle: "Databases & Catalogs",
      items: [
        {
          label: "All Databases",
          desc: "List all databases in active cluster catalog",
          sql: "SHOW DATABASES;\n",
          icon: Database,
        },
        {
          label: `Tables in ${currentDorisDb}`,
          desc: `List tables and views in '${currentDorisDb}'`,
          sql: "SHOW TABLES;\n",
          icon: Boxes,
        },
      ],
    },
    {
      groupTitle: "Monitoring & Workloads",
      items: [
        {
          label: "Active Queries (Processlist)",
          desc: "Inspect currently executing client queries & duration",
          sql: "SHOW PROCESSLIST;\n",
          icon: Terminal,
        },
        {
          label: "Workload Groups",
          desc: "CPU/RAM resource isolation queues & limits",
          sql: "SHOW WORKLOAD GROUPS;\n",
          icon: Activity,
        },
        {
          label: "AI & Model Resources",
          desc: "Integrated Ollama, vLLM, and external AI models",
          sql: "SHOW RESOURCES;\n",
          icon: Sparkles,
        },
      ],
    },
  ];

  return (
    <div className="flex flex-col h-full bg-(--color-bg-secondary) select-none overflow-hidden">
      {/* 1. Header Bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-(--color-border) shrink-0 bg-(--color-bg-secondary)/60">
        <div className="flex items-center gap-1.5 min-w-0">
          <Cpu size={13} className="text-(--color-accent) shrink-0" />
          <span className="text-[11px] font-bold text-(--color-text-primary) uppercase tracking-wider truncate">
            Compute
          </span>
          <span
            className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded shrink-0 border ${
              isDoris
                ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                : "bg-amber-500/10 text-amber-400 border-amber-500/30"
            }`}
          >
            {isDoris ? "🐬 Doris MPP" : "⚡ Spark Livy"}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handleRefreshAll}
            className="p-1 rounded hover:bg-(--color-bg-tertiary) text-(--color-text-muted) hover:text-(--color-text-primary) transition-colors cursor-pointer"
            title="Refresh All Compute Status & Telemetry"
          >
            <RefreshCw size={12} className={sessionsLoading ? "animate-spin text-amber-400" : ""} />
          </button>
          {setShowConnectionModal && (
            <button
              onClick={() => setShowConnectionModal(true)}
              className="p-1 rounded hover:bg-(--color-bg-tertiary) text-(--color-text-muted) hover:text-(--color-text-primary) transition-colors cursor-pointer"
              title="Advanced Connection Settings"
            >
              <Settings2 size={12} />
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-(--color-bg-tertiary) text-(--color-text-muted) hover:text-(--color-text-primary) transition-colors cursor-pointer"
              title="Collapse Panel"
            >
              <PanelLeftClose size={12} />
            </button>
          )}
        </div>
      </div>

      {/* 2. Scrollable Content Body */}
      <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-(--color-border)/30 text-xs">
        {/* ========================================================
            ENGINE SWITCHER & ACTIVE HERO CARD
            ======================================================== */}
        <div className="p-2.5 space-y-2">
          {/* Modern Segmented Engine Switcher */}
          <div className="grid grid-cols-2 p-1 bg-(--color-bg-primary) rounded-xl border border-(--color-border) gap-1 shadow-2xs">
            <button
              type="button"
              onClick={() => handleEngineSwitch("spark")}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                isSpark
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs"
                  : "text-(--color-text-muted) hover:text-(--color-text-primary) hover:bg-(--color-bg-secondary)/50"
              }`}
            >
              <span className="text-xs">⚡</span>
              <span>Spark</span>
              <span
                className={`text-[9px] px-1 py-0.2 rounded-full font-mono ${
                  isSpark ? "bg-amber-500/30 text-amber-200" : "bg-(--color-bg-tertiary) text-(--color-text-muted)"
                }`}
              >
                {sparkHosts.length}
              </span>
              {isSpark && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 animate-pulse" />}
            </button>

            <button
              type="button"
              onClick={() => handleEngineSwitch("doris")}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                isDoris
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs"
                  : "text-(--color-text-muted) hover:text-(--color-text-primary) hover:bg-(--color-bg-secondary)/50"
              }`}
            >
              <span className="text-xs">🐬</span>
              <span>Doris</span>
              <span
                className={`text-[9px] px-1 py-0.2 rounded-full font-mono ${
                  isDoris ? "bg-cyan-500/30 text-cyan-200" : "bg-(--color-bg-tertiary) text-(--color-text-muted)"
                }`}
              >
                {dorisHosts.length}
              </span>
              {isDoris && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 animate-pulse" />}
            </button>
          </div>

          {/* Engine Concept Subtitle Banner */}
          <div
            className={`px-2 py-1 rounded-md text-[10px] leading-tight flex items-start gap-1.5 border ${
              isDoris
                ? "bg-cyan-950/20 text-cyan-300/80 border-cyan-500/20"
                : "bg-amber-950/20 text-amber-300/80 border-amber-500/20"
            }`}
          >
            <Info size={11} className="shrink-0 mt-0.5 opacity-80" />
            <span>
              {isDoris ? (
                <>
                  <strong className="text-cyan-300 font-semibold">Apache Doris MPP:</strong> Serverless direct
                  queries. Instant sub-second execution on real-time tables without starting sessions.
                </>
              ) : (
                <>
                  <strong className="text-amber-300 font-semibold">Apache Spark (Livy):</strong> Distributed big
                  data. Queries execute inside dedicated Spark sessions (SQL or PySpark).
                </>
              )}
            </span>
          </div>

          {/* Active Compute Hero Card */}
          <div
            className={`p-2.5 rounded-xl border transition-all ${
              isDoris
                ? "bg-cyan-950/15 border-cyan-500/30 hover:border-cyan-500/50"
                : "bg-amber-950/15 border-amber-500/30 hover:border-amber-500/50"
            }`}
          >
            {/* Header: Name, Attached Engine badge, Ping */}
            <div className="flex items-center justify-between gap-1.5 mb-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-sm shrink-0 select-none">{isDoris ? "🐬" : "⚡"}</span>
                <span className="font-bold text-xs text-(--color-text-primary) truncate">
                  {activeHost?.name}
                </span>
                <span
                  className={`text-[9px] font-semibold px-1.5 py-0.2 rounded border shrink-0 ${
                    isDoris
                      ? "text-cyan-300 bg-cyan-500/20 border-cyan-500/40"
                      : "text-amber-300 bg-amber-500/20 border-amber-500/40"
                  }`}
                >
                  Active Engine
                </span>
              </div>

              {/* Ping Latency Pill */}
              <div className="shrink-0">
                {activePing?.state === "loading" ? (
                  <span className="text-[10px] text-amber-400 font-mono flex items-center gap-1">
                    <Loader2 size={10} className="animate-spin" /> pinging
                  </span>
                ) : activePing?.state === "online" ? (
                  <button
                    onClick={() => testHostPing(activeHost)}
                    className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono font-medium hover:underline cursor-pointer"
                    title="Click to re-ping latency"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {activePing.latency}ms
                  </button>
                ) : isServerReachable === true ? (
                  <button
                    onClick={() => testHostPing(activeHost)}
                    className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono font-medium hover:underline cursor-pointer"
                    title="Connected · Click to measure latency"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Online
                  </button>
                ) : (
                  <button
                    onClick={() => testHostPing(activeHost)}
                    className="flex items-center gap-1 text-[10px] text-rose-400 hover:underline cursor-pointer font-medium"
                    title={activePing?.error || "Offline · Click to retry ping"}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    Offline
                  </button>
                )}
              </div>
            </div>

            {/* Spark Session Status Banner in Hero Card */}
            {isSpark && (
              <div className="mb-2 p-1.5 rounded-lg bg-(--color-bg-primary)/70 border border-(--color-border)/50 flex items-center justify-between gap-1 text-[10px]">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="text-(--color-text-muted)">Workbench:</span>
                  {sessionId !== null ? (
                    <span className="flex items-center gap-1 font-semibold text-amber-300 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Session #{sessionId} ({sessionState})
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 font-medium text-amber-400/90">
                      <AlertTriangle size={10} className="shrink-0 text-amber-400" />
                      No Session Attached
                    </span>
                  )}
                </div>

                {sessionId === null && (
                  <button
                    onClick={() => handleQuickLaunchPreset("Spark SQL Session", "sql")}
                    disabled={sessionStarting}
                    className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-amber-500/20 hover:bg-amber-500 hover:text-black text-amber-300 transition-colors cursor-pointer shrink-0"
                  >
                    {sessionStarting ? "Starting..." : "+ Quick Launch"}
                  </button>
                )}
              </div>
            )}

            {/* Doris Database Row */}
            {isDoris && (
              <div className="flex items-center justify-between gap-2 mb-2 px-2 py-1 bg-(--color-bg-primary)/70 rounded-md border border-(--color-border)/40 text-[10px]">
                <div className="flex items-center gap-1 text-(--color-text-muted) font-medium shrink-0">
                  <Database size={10} className="text-cyan-400" />
                  <span>Database:</span>
                </div>
                <div className="flex items-center gap-1 min-w-0">
                  <select
                    value={currentDorisDb}
                    onChange={(e) => handleSelectDorisDatabase(e.target.value)}
                    className="text-[10px] font-mono bg-transparent text-cyan-300 outline-none cursor-pointer truncate max-w-[130px] text-right font-medium"
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
                          information_schema
                        </option>
                      </>
                    )}
                  </select>
                  <button
                    onClick={() => refreshSchema?.()}
                    className="p-0.5 text-(--color-text-muted) hover:text-cyan-300 transition-colors cursor-pointer"
                    title="Refresh databases"
                  >
                    <RefreshCw size={9} />
                  </button>
                </div>
              </div>
            )}

            {/* URL Row & Copy */}
            <div className="flex items-center justify-between text-[10px] font-mono text-(--color-text-muted) bg-(--color-bg-primary)/90 px-2 py-1 rounded-md border border-(--color-border)/40">
              <span className="truncate select-all" title={activeHost?.url}>
                {activeHost?.url}
              </span>
              <button
                onClick={() => handleCopyUrl(activeHost?.url)}
                className="ml-1 p-0.5 text-(--color-text-muted) hover:text-white transition-colors cursor-pointer shrink-0"
                title="Copy Endpoint URL"
              >
                {copiedUrl ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
              </button>
            </div>

            {/* Telemetry Chips */}
            <div className="mt-2 pt-1.5 border-t border-(--color-border)/30 flex items-center justify-between text-[9px] text-(--color-text-muted)">
              {isDoris ? (
                <>
                  <span>
                    Cluster: <span className="text-(--color-text-secondary) font-mono">{activeHost?.cluster || "default"}</span>
                  </span>
                  <span>
                    User: <span className="text-(--color-text-secondary) font-mono">{activeHost?.username || "root"}</span>
                  </span>
                  <span className="text-cyan-400/90 font-medium">MPP Direct</span>
                </>
              ) : (
                <>
                  <span>
                    Sessions: <span className="text-(--color-text-secondary) font-mono">{sessions.length}</span>
                  </span>
                  <span>
                    Idle: <span className="text-emerald-400 font-mono">{idleSessionsCount}</span>
                  </span>
                  <button
                    onClick={() => setShowConnectionModal?.(true)}
                    className="text-amber-400 hover:underline cursor-pointer"
                  >
                    Config Presets →
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================
            ENGINE-SEGREGATED ENDPOINTS LIST
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
                {isDoris ? `Doris Clusters (${dorisHosts.length})` : `Spark Endpoints (${sparkHosts.length})`}
              </span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleOpenAddForm(isDoris ? DATA_SOURCE_TYPES.DORIS : DATA_SOURCE_TYPES.SPARK);
              }}
              className="p-0.5 rounded hover:bg-(--color-bg-tertiary) text-(--color-text-muted) hover:text-(--color-text-primary) transition-colors cursor-pointer"
              title={`Add New ${isDoris ? "Doris Cluster" : "Spark Livy Endpoint"}`}
            >
              <Plus size={12} />
            </button>
          </div>

          {expandedSections.endpoints && (
            <div className="p-2 space-y-1">
              {currentEngineHosts.map((host) => {
                const isActive = host.id === activeHostId;
                const ping = hostPings[host.id];

                return (
                  <div
                    key={host.id}
                    onClick={() => selectHost(host.id)}
                    className={`group flex items-center justify-between px-2 py-1.5 rounded-lg border transition-all cursor-pointer ${
                      isActive
                        ? isDoris
                          ? "bg-(--color-bg-primary) border-cyan-500/40 font-medium"
                          : "bg-(--color-bg-primary) border-amber-500/40 font-medium"
                        : "bg-transparent border-transparent hover:bg-(--color-bg-primary)/40 hover:border-(--color-border)"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="text-xs shrink-0 select-none">{isDoris ? "🐬" : "⚡"}</span>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[11px] truncate ${
                              isActive ? "text-(--color-text-primary) font-semibold" : "text-(--color-text-secondary)"
                            }`}
                          >
                            {host.name}
                          </span>
                          {isActive && (
                            <span
                              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                isDoris ? "bg-cyan-400" : "bg-amber-400"
                              }`}
                            />
                          )}
                        </div>
                        <span className="text-[9px] font-mono text-(--color-text-muted)/70 truncate max-w-[170px]">
                          {host.url.replace(/^https?:\/\//, "")}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                      {isActive && (
                        <span
                          className={`text-[9px] font-semibold px-1.5 py-0.2 rounded border ${
                            isDoris
                              ? "text-cyan-400 bg-cyan-500/15 border-cyan-500/30"
                              : "text-amber-400 bg-amber-500/15 border-amber-500/30"
                          }`}
                        >
                          Attached
                        </span>
                      )}

                      {ping?.state === "online" && (
                        <span className="text-[9px] text-emerald-400/80 font-mono">{ping.latency}ms</span>
                      )}
                      {ping?.state === "loading" && <span className="text-[9px] text-amber-400/80 font-mono">...</span>}
                      {ping?.state === "offline" && <span className="text-[9px] text-rose-400/80 font-mono">offline</span>}

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
                  className="mt-1.5 p-2.5 rounded-xl border border-(--color-accent)/30 bg-(--color-bg-primary) space-y-2 animate-in fade-in"
                >
                  <div className="flex items-center justify-between pb-1 border-b border-(--color-border)/30">
                    <span className="text-[10px] font-bold uppercase text-(--color-text-primary)">
                      Add {newEngine === DATA_SOURCE_TYPES.DORIS ? "Doris FE Cluster" : "Spark Livy Endpoint"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="text-(--color-text-muted) hover:text-white text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Engine Toggle inside Form */}
                  <div className="grid grid-cols-2 gap-1 text-[10px]">
                    <button
                      type="button"
                      onClick={() => {
                        setNewEngine(DATA_SOURCE_TYPES.SPARK);
                        setNewUrl("http://localhost:8998");
                        setNewName("Spark Livy");
                        setNewHostTestResult(null);
                      }}
                      className={`py-1 rounded-md text-center transition-colors cursor-pointer ${
                        newEngine === DATA_SOURCE_TYPES.SPARK
                          ? "bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40"
                          : "text-(--color-text-muted) hover:bg-(--color-bg-secondary)"
                      }`}
                    >
                      ⚡ Spark (8998)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNewEngine(DATA_SOURCE_TYPES.DORIS);
                        setNewUrl("http://localhost:8030");
                        setNewName("Apache Doris FE");
                        setNewHostTestResult(null);
                      }}
                      className={`py-1 rounded-md text-center transition-colors cursor-pointer ${
                        newEngine === DATA_SOURCE_TYPES.DORIS
                          ? "bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40"
                          : "text-(--color-text-muted) hover:bg-(--color-bg-secondary)"
                      }`}
                    >
                      🐬 Doris (8030)
                    </button>
                  </div>

                  <input
                    type="text"
                    placeholder="Endpoint name (e.g. Production Cluster)"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-2 py-1 text-[11px] rounded bg-(--color-bg-secondary) border border-(--color-border) text-white outline-none focus:border-(--color-accent)"
                  />
                  <input
                    type="text"
                    placeholder={
                      newEngine === DATA_SOURCE_TYPES.DORIS
                        ? "HTTP URL (e.g. http://localhost:8030)"
                        : "Livy URL (e.g. http://localhost:8998)"
                    }
                    value={newUrl}
                    onChange={(e) => {
                      setNewUrl(e.target.value);
                      setNewHostTestResult(null);
                    }}
                    className="w-full px-2 py-1 text-[11px] font-mono rounded bg-(--color-bg-secondary) border border-(--color-border) text-white outline-none focus:border-(--color-accent)"
                    required
                  />

                  {newEngine === DATA_SOURCE_TYPES.DORIS && (
                    <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                      <div>
                        <label className="text-(--color-text-muted) block mb-0.5">Database</label>
                        <input
                          type="text"
                          value={newDatabase}
                          onChange={(e) => setNewDatabase(e.target.value)}
                          className="w-full px-1.5 py-0.5 font-mono text-[10px] rounded bg-(--color-bg-secondary) border border-(--color-border) text-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-(--color-text-muted) block mb-0.5">Cluster</label>
                        <input
                          type="text"
                          value={newCluster}
                          onChange={(e) => setNewCluster(e.target.value)}
                          className="w-full px-1.5 py-0.5 font-mono text-[10px] rounded bg-(--color-bg-secondary) border border-(--color-border) text-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-(--color-text-muted) block mb-0.5">Username</label>
                        <input
                          type="text"
                          value={newUsername}
                          onChange={(e) => setNewUsername(e.target.value)}
                          className="w-full px-1.5 py-0.5 font-mono text-[10px] rounded bg-(--color-bg-secondary) border border-(--color-border) text-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-(--color-text-muted) block mb-0.5">Password</label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Optional"
                          className="w-full px-1.5 py-0.5 font-mono text-[10px] rounded bg-(--color-bg-secondary) border border-(--color-border) text-white outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Test Status Feedback */}
                  {newHostTestResult && (
                    <div
                      className={`px-2 py-1 rounded text-[10px] flex items-center gap-1.5 ${
                        newHostTestResult.ok
                          ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                          : "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                      }`}
                    >
                      {newHostTestResult.ok ? (
                        <>
                          <CheckCircle2 size={11} className="shrink-0 text-emerald-400" />
                          <span>Reachable ({newHostTestResult.latency}ms)</span>
                        </>
                      ) : (
                        <>
                          <XCircle size={11} className="shrink-0 text-rose-400" />
                          <span className="truncate">{newHostTestResult.error}</span>
                        </>
                      )}
                    </div>
                  )}

                  {addHostError && (
                    <div className="text-[10px] text-rose-400 px-1">{addHostError}</div>
                  )}

                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={handleTestNewEndpoint}
                      disabled={isTestingNewHost}
                      className="py-1 text-[10px] font-medium rounded bg-(--color-bg-tertiary) hover:bg-(--color-bg-primary) text-(--color-text-secondary) hover:text-white border border-(--color-border) cursor-pointer transition-colors"
                    >
                      {isTestingNewHost ? "Testing..." : "Test Ping"}
                    </button>
                    <button
                      type="submit"
                      className="py-1 text-[10px] font-semibold rounded bg-(--color-accent) text-white hover:bg-(--color-accent-hover) cursor-pointer transition-colors"
                    >
                      Save Endpoint
                    </button>
                  </div>
                </form>
              )}

              {/* Collapsible Cross-Engine Switcher Accordion */}
              <div className="pt-1.5 mt-1 border-t border-(--color-border)/30">
                <div
                  onClick={() => toggleSection("otherEndpoints")}
                  className="flex items-center justify-between text-[10px] text-(--color-text-muted) hover:text-(--color-text-secondary) cursor-pointer select-none py-0.5"
                >
                  <span>
                    {isDoris
                      ? `Saved Spark Livy Endpoints (${sparkHosts.length})`
                      : `Saved Doris Clusters (${dorisHosts.length})`}
                  </span>
                  {expandedSections.otherEndpoints ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                </div>

                {expandedSections.otherEndpoints && (
                  <div className="mt-1 space-y-1 pl-1">
                    {otherEngineHosts.map((h) => (
                      <div
                        key={h.id}
                        onClick={() => {
                          selectHost(h.id);
                          addToast(
                            "info",
                            `Switched active compute to ${h.name} (${isDoris ? "Spark" : "Doris"})`,
                            null,
                            "Compute"
                          );
                        }}
                        className="flex items-center justify-between px-2 py-1 rounded bg-(--color-bg-primary)/40 hover:bg-(--color-bg-primary) border border-transparent hover:border-(--color-border) text-[10px] cursor-pointer"
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <span>{isDoris ? "⚡" : "🐬"}</span>
                          <span className="truncate text-(--color-text-secondary)">{h.name}</span>
                        </div>
                        <span className="text-[9px] text-(--color-accent) font-semibold">Switch →</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ========================================================
            ENGINE TOOLS & SESSIONS SECTION
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
                {isDoris ? "Doris Tools & Diagnostics" : `Spark Sessions (${sessions.length})`}
              </span>
            </div>

            {isSpark && (
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setShowCreateSession((v) => !v)}
                  className="p-0.5 rounded hover:bg-(--color-bg-tertiary) text-(--color-text-muted) hover:text-(--color-text-primary) transition-colors cursor-pointer"
                  title="Create Custom Session"
                >
                  <Plus size={12} />
                </button>
              </div>
            )}
          </div>

          {expandedSections.tools && (
            <div className="p-2 space-y-2">
              {/* DORIS INTROSPECTION TOOLS */}
              {isDoris ? (
                <div className="space-y-2.5">
                  {/* Cluster Quick Snapshot */}
                  <div className="grid grid-cols-3 gap-1 p-1.5 rounded-lg bg-(--color-bg-primary)/60 border border-(--color-border)/40 text-center">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-(--color-text-muted)">Databases</span>
                      <span className="text-xs font-mono font-bold text-cyan-300">{databases.length || "—"}</span>
                    </div>
                    <div className="flex flex-col border-x border-(--color-border)/30">
                      <span className="text-[9px] text-(--color-text-muted)">Active DB</span>
                      <span className="text-xs font-mono font-semibold text-(--color-text-primary) truncate px-1" title={currentDorisDb}>
                        {currentDorisDb}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] text-(--color-text-muted)">Query Mode</span>
                      <span className="text-xs font-semibold text-emerald-400">MPP Direct</span>
                    </div>
                  </div>

                  {/* Categorized Tools */}
                  {DORIS_GROUPS.map((group) => (
                    <div key={group.groupTitle} className="space-y-1">
                      <div className="px-1 text-[9px] font-bold text-(--color-text-muted) uppercase tracking-wider">
                        {group.groupTitle}
                      </div>

                      {group.items.map((item) => {
                        const IconComp = item.icon;
                        return (
                          <div
                            key={item.label}
                            className="group flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-(--color-bg-primary) border border-transparent hover:border-(--color-border)/60 transition-colors"
                          >
                            <div
                              onClick={() => quickInsertSql(item.sql)}
                              className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer"
                              title="Click to insert query into active editor"
                            >
                              <IconComp size={13} className="text-cyan-400 shrink-0" />
                              <div className="flex flex-col min-w-0">
                                <span className="text-[11px] font-medium text-(--color-text-primary) group-hover:text-white truncate">
                                  {item.label}
                                </span>
                                <span className="text-[9px] text-(--color-text-muted) truncate">{item.desc}</span>
                              </div>
                            </div>

                            {/* Direct Run Query Button */}
                            <button
                              onClick={() => quickRunSql(item.sql)}
                              className="opacity-0 group-hover:opacity-100 flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500 hover:text-black transition-all cursor-pointer shrink-0 ml-1"
                              title="Execute query immediately and view result table"
                            >
                              <Play size={8} className="fill-current" />
                              <span>Run</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              ) : (
                /* SPARK SESSIONS & LAUNCHER */
                <div className="space-y-2">
                  {/* Session Overview Stats */}
                  <div className="grid grid-cols-3 gap-1 p-1.5 rounded-lg bg-(--color-bg-primary)/60 border border-(--color-border)/40 text-center">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-(--color-text-muted)">Total</span>
                      <span className="text-xs font-mono font-bold text-amber-300">{sessions.length}</span>
                    </div>
                    <div className="flex flex-col border-x border-(--color-border)/30">
                      <span className="text-[9px] text-(--color-text-muted)">Idle (Ready)</span>
                      <span className="text-xs font-mono font-bold text-emerald-400">{idleSessionsCount}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] text-(--color-text-muted)">Busy</span>
                      <span className="text-xs font-mono font-bold text-blue-400">{busySessionsCount}</span>
                    </div>
                  </div>

                  {/* Quick Launch Presets */}
                  <div className="space-y-1">
                    <div className="px-1 text-[9px] font-bold text-(--color-text-muted) uppercase tracking-wider">
                      Quick Launch Presets
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => handleQuickLaunchPreset("Spark SQL Session", "sql")}
                        disabled={sessionStarting}
                        className="p-1.5 rounded-lg border border-amber-500/30 hover:border-amber-500/60 bg-amber-950/20 hover:bg-amber-950/40 text-left transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-1.5 font-semibold text-[11px] text-amber-300">
                          <Zap size={11} className="text-amber-400 fill-current" />
                          <span>Spark SQL</span>
                        </div>
                        <span className="text-[9px] text-(--color-text-muted) block mt-0.5 leading-tight">
                          Interactive SQL queries
                        </span>
                      </button>

                      <button
                        onClick={() => handleQuickLaunchPreset("PySpark Session", "pyspark")}
                        disabled={sessionStarting}
                        className="p-1.5 rounded-lg border border-amber-500/30 hover:border-amber-500/60 bg-amber-950/20 hover:bg-amber-950/40 text-left transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-1.5 font-semibold text-[11px] text-amber-300">
                          <Terminal size={11} className="text-amber-400" />
                          <span>PySpark</span>
                        </div>
                        <span className="text-[9px] text-(--color-text-muted) block mt-0.5 leading-tight">
                          Python DataFrame runtime
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Custom Session Inline Form */}
                  {showCreateSession && (
                    <form
                      onSubmit={handleCreateSparkSession}
                      className="p-2.5 rounded-xl border border-amber-500/40 bg-(--color-bg-primary) space-y-2 animate-in fade-in"
                    >
                      <div className="flex items-center justify-between pb-1 border-b border-(--color-border)/30">
                        <span className="text-[10px] font-bold uppercase text-amber-300">Launch Custom Session</span>
                        <button
                          type="button"
                          onClick={() => setShowCreateSession(false)}
                          className="text-(--color-text-muted) hover:text-white text-xs cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>

                      <input
                        type="text"
                        placeholder="Session name..."
                        value={newSessionName}
                        onChange={(e) => setNewSessionName(e.target.value)}
                        className="w-full px-2 py-1 text-xs rounded bg-(--color-bg-secondary) border border-(--color-border) text-white outline-none focus:border-amber-500"
                        required
                      />

                      <div className="grid grid-cols-2 gap-1.5">
                        <select
                          value={newSessionKind}
                          onChange={(e) => setNewSessionKind(e.target.value)}
                          className="px-2 py-1 text-[11px] rounded bg-(--color-bg-secondary) border border-(--color-border) text-white outline-none cursor-pointer"
                        >
                          <option value="sql">kind: sql (Spark SQL)</option>
                          <option value="pyspark">kind: pyspark (Python)</option>
                          <option value="spark">kind: spark (Scala)</option>
                          <option value="sparkr">kind: sparkr (R)</option>
                        </select>

                        <button
                          type="submit"
                          disabled={sessionStarting}
                          className="py-1 text-xs font-semibold rounded bg-amber-500 text-black hover:bg-amber-400 cursor-pointer transition-colors"
                        >
                          {sessionStarting ? "Launching..." : "Launch Session"}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Active Sessions List */}
                  <div className="space-y-1">
                    <div className="px-1 text-[9px] font-bold text-(--color-text-muted) uppercase tracking-wider">
                      Active Spark Sessions
                    </div>

                    {sessions.length === 0 ? (
                      <div className="p-3 text-center rounded-lg border border-dashed border-(--color-border)/60 bg-(--color-bg-primary)/40 text-(--color-text-muted) text-[11px]">
                        <span>No active Livy sessions.</span>
                        <p className="text-[10px] text-(--color-text-muted)/80 mt-1">
                          Spark SQL requires a running session. Choose a preset above to launch one.
                        </p>
                      </div>
                    ) : (
                      sessions.map((s) => {
                        const isAttached = s.id === sessionId;
                        const isConfirmingKill = confirmKillId === s.id;

                        return (
                          <div
                            key={s.id}
                            className={`flex flex-col p-2 rounded-lg border transition-all ${
                              isAttached
                                ? "bg-(--color-bg-primary) border-amber-500/50 shadow-xs"
                                : "bg-(--color-bg-primary)/40 border-(--color-border)/40 hover:border-(--color-border)"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="font-bold text-xs text-amber-300 font-mono">#{s.id}</span>
                                <span className="text-[11px] font-medium text-(--color-text-primary) truncate">
                                  {s.name || s.kind}
                                </span>
                                <span className="text-[9px] px-1 py-0.2 rounded bg-(--color-bg-tertiary) text-(--color-text-muted) font-mono">
                                  {s.kind}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    s.state === "idle"
                                      ? "bg-emerald-400 animate-pulse"
                                      : s.state === "busy"
                                      ? "bg-blue-400 animate-spin"
                                      : s.state === "starting"
                                      ? "bg-amber-400 animate-pulse"
                                      : "bg-rose-400"
                                  }`}
                                />
                                <span className="text-[10px] font-mono text-(--color-text-secondary) capitalize">
                                  {s.state}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-(--color-border)/30 text-[10px]">
                              <span className="text-(--color-text-muted) font-mono truncate max-w-[140px]">
                                {s.appId || "Local Driver"}
                              </span>

                              <div className="flex items-center gap-1">
                                {!isAttached ? (
                                  <button
                                    onClick={() => attachSession(s.id)}
                                    className="px-2 py-0.5 text-[10px] font-semibold rounded bg-amber-500/20 hover:bg-amber-500 hover:text-black text-amber-300 cursor-pointer transition-colors"
                                  >
                                    Attach
                                  </button>
                                ) : (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30">
                                    Attached to Editor
                                  </span>
                                )}

                                {isConfirmingKill ? (
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => handleKillSession(s.id)}
                                      className="px-1.5 py-0.5 text-[9px] font-semibold rounded bg-rose-600 text-white cursor-pointer"
                                    >
                                      Kill
                                    </button>
                                    <button
                                      onClick={() => setConfirmKillId(null)}
                                      className="px-1 py-0.5 text-[9px] text-(--color-text-muted) hover:text-white cursor-pointer"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setConfirmKillId(s.id)}
                                    className="p-1 text-(--color-text-muted) hover:text-rose-400 cursor-pointer transition-colors"
                                    title="Kill Session"
                                  >
                                    <Trash2 size={11} />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
