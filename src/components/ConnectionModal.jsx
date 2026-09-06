import { useState, useEffect } from "react";
import {
  X,
  Plus,
  Trash2,
  Save,
  Pencil,
  Settings2,
  AlertTriangle,
  Package,
  Server,
  Loader2,
  Sliders,
  Database,
  Search,
  BookOpen,
  HelpCircle,
  Copy,
  Check,
} from "lucide-react";
import { useLivy } from "../context/LivyContext";
import { v4 as uuidv4 } from "uuid";
import { COMMON_CONF_KEYS, SPARK_PRESETS } from "../utils/constants";

const JAR_PRESETS = [
  {
    name: "PostgreSQL JDBC Driver",
    description: "Enables database connections to PostgreSQL clusters",
    url: "https://jdbc.postgresql.org/download/postgresql-42.7.2.jar"
  },
  {
    name: "MySQL JDBC Driver",
    description: "Enables database connections to MySQL clusters",
    url: "https://repo1.maven.org/maven2/com/mysql/mysql-connector-j/8.3.0/mysql-connector-j-8.3.0.jar"
  },
  {
    name: "Delta Lake Core 2.12",
    description: "Delta Lake transactional table management jar",
    url: "https://repo1.maven.org/maven2/io/delta/delta-core_2.12/2.4.0/delta-core_2.12-2.4.0.jar"
  },
  {
    name: "AWS S3 Hadoop Connector",
    description: "Access and query raw datasets directly from AWS S3 storage",
    url: "https://repo1.maven.org/maven2/org/apache/hadoop/hadoop-aws/3.3.4/hadoop-aws-3.3.4.jar"
  }
];

const SPARK_CATEGORIES = [
  { id: "all", label: "All Properties" },
  { id: "resources", label: "Compute Resources" },
  { id: "warehouse", label: "Storage & Hive" },
  { id: "performance", label: "Performance Tuning" }
];

const categoryKeyPatterns = {
  resources: ["memory", "cores", "master", "instances", "executor", "driver"],
  warehouse: ["warehouse", "hive", "metastore", "catalog", "directory", "eventLog", "dir"],
  performance: ["shuffle", "partitions", "dynamicAllocation", "num-rows", "enabled", "compress", "aqe"]
};

const getCategoryForKey = (key) => {
  const k = key.toLowerCase();
  if (categoryKeyPatterns.resources.some(p => k.includes(p))) return "resources";
  if (categoryKeyPatterns.warehouse.some(p => k.includes(p))) return "warehouse";
  if (categoryKeyPatterns.performance.some(p => k.includes(p))) return "performance";
  return "performance";
};

export default function ConnectionModal({ isOpen, onClose }) {
  const {
    hosts,
    activeHostId,
    addHost,
    removeHost,
    updateHost,
    selectHost,
    sessionConf,
    setSessionConf,
    sessionJars,
    setSessionJars
  } = useLivy();

  const [activeTab, setActiveTab] = useState("hosts");

  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [confKey, setConfKey] = useState("");
  const [confValue, setConfValue] = useState("");
  const [jarUrl, setJarUrl] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Spark configuration search & filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Connectivity Test State
  const [testStatus, setTestStatus] = useState({});
  const [testErrorMessage, setTestErrorMessage] = useState({});
  const [latencies, setLatencies] = useState({});

  const [copiedCors, setCopiedCors] = useState(false);

  const parseMemory = (val) => {
    if (!val) return { num: "", unit: "g" };
    const numPart = parseFloat(val);
    const unitPart = val.replace(/[0-9.]/g, "").toLowerCase();
    return {
      num: isNaN(numPart) ? "" : numPart,
      unit: unitPart.includes("m") ? "m" : "g"
    };
  };

  const driverMem = parseMemory(sessionConf["spark.driver.memory"] || "");
  const execMem = parseMemory(sessionConf["spark.executor.memory"] || "");
  const execCores = sessionConf["spark.executor.cores"] || "";
  const shufflePartitions = sessionConf["spark.sql.shuffle.partitions"] || "";
  const dynamicAllocation = sessionConf["spark.dynamicAllocation.enabled"] === "true";

  const updateDriverMemNum = (num) => {
    const unit = parseMemory(sessionConf["spark.driver.memory"]).unit;
    if (num === "") {
      const next = { ...sessionConf };
      delete next["spark.driver.memory"];
      setSessionConf(next);
    } else {
      setSessionConf({ ...sessionConf, "spark.driver.memory": `${num}${unit}` });
    }
  };

  const updateDriverMemUnit = (unit) => {
    const num = parseMemory(sessionConf["spark.driver.memory"]).num || "1";
    setSessionConf({ ...sessionConf, "spark.driver.memory": `${num}${unit}` });
  };

  const updateExecMemNum = (num) => {
    const unit = parseMemory(sessionConf["spark.executor.memory"]).unit;
    if (num === "") {
      const next = { ...sessionConf };
      delete next["spark.executor.memory"];
      setSessionConf(next);
    } else {
      setSessionConf({ ...sessionConf, "spark.executor.memory": `${num}${unit}` });
    }
  };

  const updateExecMemUnit = (unit) => {
    const num = parseMemory(sessionConf["spark.executor.memory"]).num || "1";
    setSessionConf({ ...sessionConf, "spark.executor.memory": `${num}${unit}` });
  };

  const updateExecutorCores = (cores) => {
    if (cores === "" || cores === "0") {
      const next = { ...sessionConf };
      delete next["spark.executor.cores"];
      setSessionConf(next);
    } else {
      setSessionConf({ ...sessionConf, "spark.executor.cores": cores.toString() });
    }
  };

  const updateShufflePartitions = (partitions) => {
    if (partitions === "") {
      const next = { ...sessionConf };
      delete next["spark.sql.shuffle.partitions"];
      setSessionConf(next);
    } else {
      setSessionConf({ ...sessionConf, "spark.sql.shuffle.partitions": partitions.toString() });
    }
  };

  const toggleDynamicAllocation = () => {
    const next = { ...sessionConf };
    if (dynamicAllocation) {
      next["spark.dynamicAllocation.enabled"] = "false";
    } else {
      next["spark.dynamicAllocation.enabled"] = "true";
    }
    setSessionConf(next);
  };

  // Trigger background ping tests for all hosts when opening
  useEffect(() => {
    if (isOpen && hosts.length > 0) {
      hosts.forEach((host) => {
        handleTestConnection(host.id, host.url);
      });
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAdd = () => {
    if (!newName.trim() || !newUrl.trim()) return;
    const newHost = { id: uuidv4(), name: newName.trim(), url: newUrl.trim() };
    addHost(newHost);
    setNewName("");
    setNewUrl("");
    handleTestConnection(newHost.id, newHost.url);
  };

  const handleEdit = (host) => {
    setEditingId(host.id);
    setEditName(host.name);
    setEditUrl(host.url);
  };

  const handleSaveEdit = (id) => {
    if (!editName.trim() || !editUrl.trim()) return;
    updateHost(id, { name: editName.trim(), url: editUrl.trim() });
    setEditingId(null);
    handleTestConnection(id, editUrl.trim());
  };

  const handleTestConnection = async (hostId, url) => {
    setTestStatus((prev) => ({ ...prev, [hostId]: "loading" }));
    setTestErrorMessage((prev) => ({ ...prev, [hostId]: "" }));
    const startTime = performance.now();

    try {
      const cleanUrl = url.replace(/\/+$/, "");
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(`${cleanUrl}/sessions`, {
        signal: controller.signal,
        headers: {
          "Accept": "application/json",
        }
      });
      
      clearTimeout(timeoutId);
      const endTime = performance.now();
      const latency = Math.round(endTime - startTime);

      if (response.ok) {
        setTestStatus((prev) => ({ ...prev, [hostId]: "success" }));
        setLatencies((prev) => ({ ...prev, [hostId]: latency }));
      } else {
        setTestStatus((prev) => ({ ...prev, [hostId]: "error" }));
        setTestErrorMessage((prev) => ({ 
          ...prev, 
          [hostId]: `HTTP Error ${response.status}: ${response.statusText || "Unexpected response"}` 
        }));
      }
    } catch (error) {
      console.error("Livy connection test failed:", error);
      if (error.name === "AbortError") {
        setTestStatus((prev) => ({ ...prev, [hostId]: "error" }));
        setTestErrorMessage((prev) => ({ ...prev, [hostId]: "Request timed out after 6 seconds." }));
      } else {
        setTestStatus((prev) => ({ ...prev, [hostId]: "cors_warning" }));
        setTestErrorMessage((prev) => ({ 
          ...prev, 
          [hostId]: "Network error or CORS block. Ensure Livy is running and has CORS enabled." 
        }));
      }
    }
  };

  const applySparkPreset = (preset) => {
    setSessionConf({ ...sessionConf, ...preset.conf });
  };

  const applyJarPreset = (preset) => {
    if (!sessionJars.includes(preset.url)) {
      setSessionJars([...sessionJars, preset.url]);
    }
  };

  const copyCorsConfig = () => {
    const text = `livy.server.access-control.allow-origin = *\nlivy.server.access-control.allow-methods = GET, POST, OPTIONS, DELETE`;
    navigator.clipboard.writeText(text);
    setCopiedCors(true);
    setTimeout(() => setCopiedCors(false), 2000);
  };

  // Spark filtered items
  const filteredConf = Object.entries(sessionConf).filter(([key, value]) => {
    const matchesSearch = key.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          value.toString().toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || getCategoryForKey(key) === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div className="dg-glassmorphic border border-(--color-border)/50 rounded-2xl shadow-2xl w-full max-w-3xl mx-4 flex flex-col h-[580px] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-200" onClick={(e) => e.stopPropagation()}>
        
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-(--color-border)/60 bg-(--color-bg-secondary)/20">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-base font-bold text-(--color-text-primary) tracking-wide">Workspace Settings</h2>
            <p className="text-[11px] text-(--color-text-muted) font-medium">Configure cluster connections, Apache Spark properties, and runtime packages.</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-(--color-bg-tertiary) text-(--color-text-muted) hover:text-(--color-text-primary) transition-all dg-spring-btn">
            <X size={16} />
          </button>
        </div>

        {/* Workspace Body layout (Sidebar + Content Pane) */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Navigation Sidebar */}
          <div className="w-52 bg-(--color-bg-secondary)/40 border-r border-(--color-border)/40 flex flex-col p-3.5 select-none shrink-0 gap-1">
            <span className="text-[9px] font-bold text-(--color-text-muted) uppercase tracking-widest px-2 mb-1.5">Settings Panels</span>
            <button
              onClick={() => setActiveTab("hosts")}
              className={`flex items-center gap-2.5 py-2 px-3 text-xs font-semibold rounded-lg transition-all duration-150 justify-start ${
                activeTab === "hosts"
                  ? "bg-(--color-accent) text-white shadow-xs"
                  : "text-(--color-text-secondary) hover:bg-(--color-bg-tertiary)/40 hover:text-(--color-text-primary)"
              }`}
            >
              <Server size={14} />
              <span>Livy Connections</span>
            </button>
            <button
              onClick={() => setActiveTab("config")}
              className={`flex items-center gap-2.5 py-2 px-3 text-xs font-semibold rounded-lg transition-all duration-150 justify-start ${
                activeTab === "config"
                  ? "bg-(--color-accent) text-white shadow-xs"
                  : "text-(--color-text-secondary) hover:bg-(--color-bg-tertiary)/40 hover:text-(--color-text-primary)"
              }`}
            >
              <Sliders size={14} />
              <span>Spark Properties</span>
            </button>
            <button
              onClick={() => setActiveTab("jars")}
              className={`flex items-center gap-2.5 py-2 px-3 text-xs font-semibold rounded-lg transition-all duration-150 justify-start ${
                activeTab === "jars"
                  ? "bg-(--color-accent) text-white shadow-xs"
                  : "text-(--color-text-secondary) hover:bg-(--color-bg-tertiary)/40 hover:text-(--color-text-primary)"
              }`}
            >
              <Package size={14} />
              <span>JARs & Libraries</span>
            </button>
            <button
              onClick={() => setActiveTab("cors")}
              className={`flex items-center gap-2.5 py-2 px-3 text-xs font-semibold rounded-lg transition-all duration-150 justify-start mt-auto border border-dashed border-(--color-border)/40 ${
                activeTab === "cors"
                  ? "bg-(--color-warning)/10 border-(--color-warning)/30 text-(--color-warning)"
                  : "text-(--color-text-secondary) hover:bg-(--color-bg-tertiary)/30"
              }`}
            >
              <BookOpen size={14} />
              <span>CORS Assistant</span>
            </button>
          </div>

          {/* Right Main Panel Content */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col bg-(--color-bg-primary)/20">
            
            {/* TAB 1: LIVY ENDPOINTS */}
            {activeTab === "hosts" && (
              <div className="flex flex-col gap-4 animate-in fade-in duration-150">
                <div className="flex flex-col gap-1 border-b border-(--color-border)/15 pb-3">
                  <h3 className="text-sm font-bold text-(--color-text-primary)">Livy Connections</h3>
                  <p className="text-[11px] text-(--color-text-muted) font-medium">Select or add REST endpoint nodes running Apache Livy.</p>
                </div>

                <div className="flex flex-col gap-2.5 max-h-[240px] overflow-y-auto pr-0.5">
                  {hosts.map((host) => (
                    <div
                      key={host.id}
                      className={`group flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                        host.id === activeHostId
                          ? "border-(--color-accent) bg-(--color-accent)/5 shadow-xs"
                          : "border-(--color-border)/50 hover:border-(--color-text-muted) bg-(--color-bg-primary)/20"
                      }`}
                      onClick={() => {
                        if (editingId !== host.id) {
                          selectHost(host.id);
                        }
                      }}
                    >
                      {editingId === host.id ? (
                        <div className="flex-1 flex gap-2" onClick={(e) => e.stopPropagation()}>
                          <input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="flex-1 bg-(--color-bg-primary)/80 border border-(--color-border) rounded-lg px-2.5 py-1.5 text-xs text-(--color-text-primary) outline-none focus:border-(--color-accent) font-medium"
                            placeholder="Label"
                          />
                          <input
                            value={editUrl}
                            onChange={(e) => setEditUrl(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="flex-[2] bg-(--color-bg-primary)/80 border border-(--color-border) rounded-lg px-2.5 py-1.5 text-xs text-(--color-text-primary) font-mono outline-none focus:border-(--color-accent)"
                            placeholder="URL endpoint"
                          />
                          <button
                            onClick={(e) => { e.stopPropagation(); handleSaveEdit(host.id); }}
                            className="p-1.5 rounded-lg hover:bg-(--color-bg-tertiary) text-emerald-400 transition-all dg-spring-btn"
                            title="Save Connection"
                          >
                            <Save size={14} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setEditingId(null); }}
                            className="p-1.5 rounded-lg hover:bg-(--color-bg-tertiary) text-(--color-text-muted) hover:text-(--color-text-primary) transition-all dg-spring-btn"
                            title="Cancel"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-3.5 min-w-0 flex-1">
                            <Server
                              size={15}
                              className={host.id === activeHostId ? "text-(--color-accent)" : "text-(--color-text-muted)"}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 leading-none">
                                <span className="text-xs font-bold text-(--color-text-primary) truncate">{host.name}</span>
                                {host.id === activeHostId && (
                                  <span className="text-[8px] font-bold text-(--color-accent) bg-(--color-accent)/10 border border-(--color-accent)/20 px-1.5 py-0.5 rounded">
                                    ACTIVE
                                  </span>
                                )}
                              </div>
                              <span className="text-[9px] text-(--color-text-muted) font-mono truncate mt-1 block leading-none">{host.url}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            {/* Latency and Status Info */}
                            <div className="flex items-center gap-1.5">
                              {testStatus[host.id] === "loading" && (
                                <Loader2 size={11} className="text-(--color-accent) animate-spin shrink-0" />
                              )}
                              {testStatus[host.id] === "success" && (
                                <span className="text-[9px] font-semibold text-emerald-400 px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md shrink-0">
                                  Connected {latencies[host.id] !== undefined && `(${latencies[host.id]}ms)`}
                                </span>
                              )}
                              {testStatus[host.id] === "error" && (
                                <span className="text-[9px] font-semibold text-rose-400 px-1.5 py-0.5 bg-rose-500/10 border border-rose-500/20 rounded-md shrink-0 cursor-help" title={testErrorMessage[host.id]}>
                                  Offline
                                </span>
                              )}
                              {testStatus[host.id] === "cors_warning" && (
                                <span className="text-[9px] font-semibold text-amber-500 px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-md shrink-0 cursor-help" title={testErrorMessage[host.id]}>
                                  CORS Warning
                                </span>
                              )}
                              
                              {(!testStatus[host.id] || testStatus[host.id] === "idle" || testStatus[host.id] === "error" || testStatus[host.id] === "cors_warning" || testStatus[host.id] === "success") && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleTestConnection(host.id, host.url);
                                  }}
                                  className="px-2 py-1 text-[9px] font-bold text-(--color-text-secondary) hover:text-white bg-(--color-bg-tertiary)/30 hover:bg-(--color-accent) border border-(--color-border)/50 hover:border-(--color-accent) rounded-md transition-all dg-spring-btn cursor-pointer"
                                  title="Ping Connection"
                                >
                                  Ping
                                </button>
                              )}
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(host);
                              }}
                              className="p-1 rounded-lg hover:bg-(--color-bg-tertiary) text-(--color-text-muted) hover:text-(--color-text-primary) transition-colors dg-spring-btn"
                              title="Edit Host Details"
                            >
                              <Pencil size={12} />
                            </button>
                            {host.id !== "default" && (
                              <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setConfirmDeleteId(host.id);
                                }}
                                className="p-1 rounded-lg hover:bg-(--color-bg-tertiary) text-(--color-text-muted) hover:text-rose-400 transition-colors dg-spring-btn"
                                title="Remove Host"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add connection form card */}
                <div className="bg-(--color-bg-primary)/40 border border-(--color-border)/40 p-4 rounded-xl flex flex-col gap-3 mt-1.5">
                  <span className="text-[9px] text-(--color-text-muted) font-bold uppercase tracking-wider">Register Connection Endpoint</span>
                  <div className="flex gap-2.5">
                    <input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Label (e.g., Localhost Cluster)"
                      onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                      className="flex-1 bg-(--color-bg-primary)/70 border border-(--color-border) rounded-lg px-3 py-2 text-xs text-(--color-text-primary) outline-none focus:border-(--color-accent) placeholder:text-(--color-text-muted)/80 font-medium"
                    />
                    <input
                      value={newUrl}
                      onChange={(e) => setNewUrl(e.target.value)}
                      placeholder="http://host:8998"
                      onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                      className="flex-[2] bg-(--color-bg-primary)/70 border border-(--color-border) rounded-lg px-3 py-2 text-xs text-(--color-text-primary) font-mono outline-none focus:border-(--color-accent) placeholder:text-(--color-text-muted)/80"
                    />
                    <button
                      onClick={handleAdd}
                      disabled={!newName.trim() || !newUrl.trim()}
                      className="flex items-center gap-1.5 px-4 py-2 bg-(--color-accent) hover:bg-(--color-accent-hover) disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-colors dg-spring-btn"
                    >
                      <Plus size={14} />
                      <span>Register</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: SPARK PROPERTIES */}
            {activeTab === "config" && (
              <div className="flex flex-col gap-4 animate-in fade-in duration-150">
                <div className="flex flex-col gap-1 border-b border-(--color-border)/15 pb-2.5">
                  <h3 className="text-sm font-bold text-(--color-text-primary)">Spark Properties Configurations</h3>
                  <p className="text-[11px] text-(--color-text-muted) font-medium">Fine-tune memory size, cores, and database warehouse integration rules.</p>
                </div>

                {/* Compute Resources Visual Configuration */}
                <div className="bg-(--color-bg-primary)/40 border border-(--color-border)/40 p-4 rounded-xl flex flex-col gap-3 shadow-xs">
                  <span className="text-[10px] text-(--color-text-muted) font-bold uppercase tracking-wider">Compute Resource Allocation</span>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Driver Memory */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] text-(--color-text-secondary) font-semibold">Driver Memory</label>
                      <div className="flex bg-(--color-bg-primary)/70 border border-(--color-border) rounded-lg overflow-hidden focus-within:border-(--color-accent)">
                        <input
                          type="number"
                          min="1"
                          placeholder="1"
                          value={driverMem.num}
                          onChange={(e) => updateDriverMemNum(e.target.value)}
                          className="w-full bg-transparent px-3 py-1.5 text-xs text-(--color-text-primary) outline-none font-semibold"
                        />
                        <select
                          value={driverMem.unit}
                          onChange={(e) => updateDriverMemUnit(e.target.value)}
                          className="bg-(--color-bg-tertiary)/40 px-2 py-1.5 text-xs text-(--color-text-secondary) border-l border-(--color-border) outline-none font-bold cursor-pointer"
                        >
                          <option value="g">GB</option>
                          <option value="m">MB</option>
                        </select>
                      </div>
                    </div>
                    
                    {/* Executor Memory */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] text-(--color-text-secondary) font-semibold">Executor Memory</label>
                      <div className="flex bg-(--color-bg-primary)/70 border border-(--color-border) rounded-lg overflow-hidden focus-within:border-(--color-accent)">
                        <input
                          type="number"
                          min="1"
                          placeholder="1"
                          value={execMem.num}
                          onChange={(e) => updateExecMemNum(e.target.value)}
                          className="w-full bg-transparent px-3 py-1.5 text-xs text-(--color-text-primary) outline-none font-semibold"
                        />
                        <select
                          value={execMem.unit}
                          onChange={(e) => updateExecMemUnit(e.target.value)}
                          className="bg-(--color-bg-tertiary)/40 px-2 py-1.5 text-xs text-(--color-text-secondary) border-l border-(--color-border) outline-none font-bold cursor-pointer"
                        >
                          <option value="g">GB</option>
                          <option value="m">MB</option>
                        </select>
                      </div>
                    </div>

                    {/* Executor Cores */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] text-(--color-text-secondary) font-semibold flex justify-between">
                        <span>Executor Cores</span>
                        <span className="font-mono text-[10px] text-(--color-accent)">{execCores || "default"}</span>
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="16"
                        value={execCores || "1"}
                        onChange={(e) => updateExecutorCores(e.target.value)}
                        className="w-full h-1.5 bg-(--color-bg-tertiary) rounded-lg appearance-none cursor-pointer accent-(--color-accent) mt-2"
                      />
                    </div>

                    {/* Shuffle Partitions */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] text-(--color-text-secondary) font-semibold">Shuffle Partitions</label>
                      <input
                        type="number"
                        min="1"
                        placeholder="Default (e.g. 200)"
                        value={shufflePartitions}
                        onChange={(e) => updateShufflePartitions(e.target.value)}
                        className="bg-(--color-bg-primary)/70 border border-(--color-border) rounded-lg px-3 py-1.5 text-xs text-(--color-text-primary) outline-none focus:border-(--color-accent) placeholder:text-(--color-text-muted)/80 font-medium"
                      />
                    </div>

                    {/* Dynamic Allocation Toggle */}
                    <div className="flex items-center justify-between col-span-2 bg-(--color-bg-primary)/30 p-2.5 border border-(--color-border)/30 rounded-lg mt-1">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-(--color-text-primary)">Dynamic Resource Allocation</span>
                        <span className="text-[9px] text-(--color-text-muted)">Scale Spark executors dynamically based on workload</span>
                      </div>
                      <button
                        onClick={toggleDynamicAllocation}
                        className={`w-10 h-6 flex items-center rounded-full p-1 transition-all duration-200 cursor-pointer ${
                          dynamicAllocation ? "bg-(--color-accent) justify-end" : "bg-(--color-bg-tertiary) justify-start"
                        }`}
                      >
                        <span className="w-4 h-4 rounded-full bg-white shadow-xs" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Configurations Preset Bar */}
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] text-(--color-text-muted) font-bold uppercase tracking-wider">Load Preset Configuration Templates</span>
                  <div className="grid grid-cols-2 gap-2">
                    {SPARK_PRESETS.map((p) => (
                      <button
                        key={p.name}
                        onClick={() => applySparkPreset(p)}
                        className="flex flex-col text-left p-2.5 rounded-lg border border-(--color-border)/40 bg-(--color-bg-secondary)/15 hover:bg-(--color-bg-tertiary)/20 hover:border-(--color-accent)/30 transition-all cursor-pointer select-none group"
                        title={p.description}
                      >
                        <span className="text-[11px] font-bold text-(--color-text-primary) group-hover:text-(--color-accent) transition-colors">{p.name}</span>
                        <span className="text-[9px] text-(--color-text-muted) line-clamp-1 mt-0.5 leading-tight">{p.description}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Configurations Filter & Search Controls */}
                <div className="flex items-center justify-between gap-3 border-t border-(--color-border)/10 pt-3">
                  <div className="flex bg-(--color-bg-primary)/40 border border-(--color-border)/50 p-0.5 rounded-lg select-none gap-0.5">
                    {SPARK_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${
                          selectedCategory === cat.id
                            ? "bg-(--color-accent)/10 text-(--color-accent) border border-(--color-accent)/25"
                            : "text-(--color-text-muted) hover:text-(--color-text-secondary) border border-transparent"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                  
                  <div className="relative flex-1 max-w-[200px]">
                    <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-(--color-text-muted)" />
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search parameters..."
                      className="w-full bg-(--color-bg-primary)/40 border border-(--color-border)/50 rounded-lg pl-8 pr-2.5 py-1.5 text-xs outline-none focus:border-(--color-accent) text-(--color-text-primary) placeholder:text-(--color-text-muted)/80 font-medium"
                    />
                  </div>
                </div>

                {/* Custom keys list */}
                <div className="flex-1 overflow-y-auto pr-0.5 min-h-[120px] max-h-[180px]">
                  {filteredConf.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {filteredConf.map(([key, value]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between p-2.5 bg-(--color-bg-primary)/30 border border-(--color-border)/40 rounded-xl hover:border-(--color-accent)/30 transition-colors group"
                        >
                          <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                            <span className="text-[9px] text-(--color-accent) font-mono truncate" title={key}>{key}</span>
                            <span className="text-xs text-(--color-text-primary) font-mono truncate font-semibold" title={value}>{value}</span>
                          </div>
                          <button
                            onClick={() => {
                              const next = { ...sessionConf };
                              delete next[key];
                              setSessionConf(next);
                            }}
                            className="p-1 rounded-lg text-(--color-text-muted) hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0 dg-spring-btn"
                            title="Remove Configuration Parameter"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-6 text-center text-xs text-(--color-text-muted) italic border border-dashed border-(--color-border)/40 rounded-xl bg-(--color-bg-primary)/5">
                      No custom configurations match filters. Using cluster defaults.
                    </div>
                  )}
                </div>

                {/* Add configurations form */}
                <div className="bg-(--color-bg-primary)/40 border border-(--color-border)/40 p-4 rounded-xl flex flex-col gap-3 shrink-0">
                  <span className="text-[9px] text-(--color-text-muted) font-bold uppercase tracking-wider">Configure Spark Custom Property</span>
                  <div className="flex gap-2.5">
                    <div className="flex-1 relative">
                      <input
                        value={confKey}
                        onChange={(e) => setConfKey(e.target.value)}
                        placeholder="e.g. spark.executor.memory"
                        list="common-spark-keys"
                        className="w-full bg-(--color-bg-primary)/70 border border-(--color-border) rounded-lg px-3 py-2 text-xs text-(--color-text-primary) font-mono outline-none focus:border-(--color-accent) placeholder:text-(--color-text-muted)/80"
                      />
                      <datalist id="common-spark-keys">
                        {COMMON_CONF_KEYS.filter((k) => !(k in sessionConf)).map((k) => (
                          <option key={k} value={k} />
                        ))}
                      </datalist>
                    </div>
                    <input
                      value={confValue}
                      onChange={(e) => setConfValue(e.target.value)}
                      placeholder="e.g. 2g or 4"
                      className="flex-1 bg-(--color-bg-primary)/70 border border-(--color-border) rounded-lg px-3 py-2 text-xs text-(--color-text-primary) font-mono outline-none focus:border-(--color-accent) placeholder:text-(--color-text-muted)/80"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && confKey.trim() && confValue.trim()) {
                          setSessionConf({ ...sessionConf, [confKey.trim()]: confValue.trim() });
                          setConfKey("");
                          setConfValue("");
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        if (!confKey.trim() || !confValue.trim()) return;
                        setSessionConf({ ...sessionConf, [confKey.trim()]: confValue.trim() });
                        setConfKey("");
                        setConfValue("");
                      }}
                      disabled={!confKey.trim() || !confValue.trim()}
                      className="flex items-center gap-1 px-4 py-2 bg-(--color-accent) hover:bg-(--color-accent-hover) disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-colors dg-spring-btn"
                    >
                      <Plus size={14} />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: JAR FILES & LIBRARIES */}
            {activeTab === "jars" && (
              <div className="flex flex-col gap-4 animate-in fade-in duration-150">
                <div className="flex flex-col gap-1 border-b border-(--color-border)/15 pb-2.5">
                  <h3 className="text-sm font-bold text-(--color-text-primary)">JAR Dependencies & Libraries</h3>
                  <p className="text-[11px] text-(--color-text-muted) font-medium">Add external database connectors and execution libraries directly inside Spark runtime.</p>
                </div>

                {/* Library Presets grid */}
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] text-(--color-text-muted) font-bold uppercase tracking-wider">Quick Add Maven Library Presets</span>
                  <div className="grid grid-cols-2 gap-2">
                    {JAR_PRESETS.map((p) => {
                      const isInstalled = sessionJars.includes(p.url);
                      return (
                        <button
                          key={p.name}
                          onClick={() => applyJarPreset(p)}
                          disabled={isInstalled}
                          className={`flex items-center justify-between p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                            isInstalled 
                              ? "border-(--color-border)/40 bg-(--color-bg-primary)/10 opacity-55 cursor-not-allowed" 
                              : "border-(--color-border)/40 bg-(--color-bg-secondary)/15 hover:bg-(--color-bg-tertiary)/20 hover:border-(--color-accent)/30"
                          }`}
                        >
                          <div className="flex flex-col min-w-0 pr-2">
                            <span className="text-[11px] font-bold text-(--color-text-primary) line-clamp-1">{p.name}</span>
                            <span className="text-[9px] text-(--color-text-muted) line-clamp-1 mt-0.5 leading-tight">{p.description}</span>
                          </div>
                          {isInstalled ? (
                            <span className="text-[8px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded shrink-0">Installed</span>
                          ) : (
                            <span className="text-[8px] font-bold text-(--color-accent) bg-(--color-accent)/10 border border-(--color-accent)/20 px-1.5 py-0.5 rounded shrink-0">Add preset</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* JAR lists */}
                <div className="flex-1 overflow-y-auto pr-0.5 min-h-[120px] max-h-[180px]">
                  {sessionJars.length > 0 ? (
                    <div className="space-y-1.5">
                      {sessionJars.map((jar, index) => {
                        const filename = jar.substring(jar.lastIndexOf("/") + 1);
                        return (
                          <div
                            key={index}
                            className="flex items-center gap-3 px-3.5 py-2.5 bg-(--color-bg-primary)/30 border border-(--color-border)/45 rounded-xl hover:border-(--color-accent)/30 transition-all group"
                          >
                            <Package size={14} className="text-(--color-text-muted) shrink-0" />
                            <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                              <span className="text-xs text-(--color-text-primary) font-mono truncate font-semibold" title={filename}>
                                {filename}
                              </span>
                              <span className="text-[9px] text-(--color-text-muted) font-mono truncate" title={jar}>
                                {jar}
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                const next = sessionJars.filter((_, i) => i !== index);
                                setSessionJars(next);
                              }}
                              className="p-1 rounded-lg text-(--color-text-muted) hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0 dg-spring-btn"
                              title="Remove JAR"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-6 text-center text-xs text-(--color-text-muted) italic border border-dashed border-(--color-border)/40 rounded-xl bg-(--color-bg-primary)/5">
                      No custom JAR file dependencies registered.
                    </div>
                  )}
                </div>

                {/* Add JAR custom form */}
                <div className="bg-(--color-bg-primary)/40 border border-(--color-border)/40 p-4 rounded-xl flex flex-col gap-3 shrink-0">
                  <span className="text-[9px] text-(--color-text-muted) font-bold uppercase tracking-wider">Register Custom JAR Endpoint</span>
                  <div className="flex gap-2.5">
                    <input
                      value={jarUrl}
                      onChange={(e) => setJarUrl(e.target.value)}
                      placeholder="hdfs:///connector.jar, s3a://..., http://..."
                      className="flex-1 bg-(--color-bg-primary)/70 border border-(--color-border) rounded-lg px-3 py-2 text-xs text-(--color-text-primary) font-mono outline-none focus:border-(--color-accent) placeholder:text-(--color-text-muted)/80"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && jarUrl.trim()) {
                          setSessionJars([...sessionJars, jarUrl.trim()]);
                          setJarUrl("");
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        if (!jarUrl.trim()) return;
                        setSessionJars([...sessionJars, jarUrl.trim()]);
                        setJarUrl("");
                      }}
                      disabled={!jarUrl.trim()}
                      className="flex items-center gap-1 px-4.5 py-2 bg-(--color-accent) hover:bg-(--color-accent-hover) disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-colors dg-spring-btn"
                    >
                      <Plus size={14} />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: CORS TROUBLESHOOTING */}
            {activeTab === "cors" && (
              <div className="flex flex-col gap-4 animate-in fade-in duration-150">
                <div className="flex flex-col gap-1 border-b border-(--color-border)/15 pb-3">
                  <h3 className="text-sm font-bold text-(--color-text-primary)">CORS Troubleshooter & Diagnostics</h3>
                  <p className="text-[11px] text-(--color-text-muted) font-medium">Solve browser cross-origin policy blockages connecting with Livy endpoints.</p>
                </div>

                <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl text-xs text-amber-500 flex flex-col gap-2.5 leading-relaxed">
                  <div className="flex items-center gap-2 font-bold">
                    <AlertTriangle size={16} />
                    <span>Livy Server CORS Config Required</span>
                  </div>
                  <p className="text-(--color-text-secondary) text-[11px] leading-relaxed">
                    Browser sandboxed calls will automatically fail unless the host node is instructed to allow foreign requests. You must append these configuration filters inside your node's <code>livy.conf</code> file:
                  </p>

                  <div className="relative">
                    <pre className="p-3 bg-black/40 border border-(--color-border)/35 rounded-lg text-[10px] font-mono text-(--color-text-primary) select-all overflow-x-auto whitespace-pre leading-relaxed">
{`livy.server.access-control.allow-origin = *
livy.server.access-control.allow-methods = GET, POST, OPTIONS, DELETE`}
                    </pre>
                    <button
                      onClick={copyCorsConfig}
                      className="absolute right-2.5 top-2.5 p-1.5 rounded-md bg-(--color-bg-secondary) border border-(--color-border) text-(--color-text-muted) hover:text-(--color-text-primary) transition-all active:scale-95"
                      title="Copy config to clipboard"
                    >
                      {copiedCors ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    </button>
                  </div>

                  <p className="text-[11px] text-(--color-text-secondary) mt-1">
                    After appending the properties, restart your Livy node service by executing:
                  </p>
                  <pre className="p-2.5 bg-black/30 border border-(--color-border)/25 rounded-md text-[10px] font-mono text-(--color-text-secondary)">
                    sudo systemctl restart livy
                  </pre>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Custom Confirm Delete Dialog */}
      {confirmDeleteId && (() => {
        const host = hosts.find((h) => h.id === confirmDeleteId);
        return (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/55" onClick={() => setConfirmDeleteId(null)}>
            <div className="bg-(--color-bg-secondary) border border-(--color-border) rounded-2xl shadow-2xl w-full max-w-sm mx-4 animate-in zoom-in-95 slide-in-from-bottom-4 duration-200" onClick={(e) => e.stopPropagation()}>
              <div className="flex flex-col items-center px-6 py-5 text-center">
                <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center mb-3">
                  <AlertTriangle size={24} className="text-rose-500" />
                </div>
                <h3 className="text-sm font-bold text-(--color-text-primary) mb-1">Remove Host Target</h3>
                <p className="text-xs text-(--color-text-muted) leading-relaxed font-medium">
                  Are you sure you want to remove host <span className="text-(--color-text-primary) font-semibold">"{host?.name}"</span>? Sessions associated with this host will be detached.
                </p>
              </div>
              <div className="flex gap-2.5 px-6 pb-5">
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="flex-1 px-3 py-2 text-xs font-semibold text-(--color-text-secondary) bg-(--color-bg-tertiary)/40 hover:bg-(--color-bg-tertiary)/80 rounded-lg border border-(--color-border)/60 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { removeHost(confirmDeleteId); setConfirmDeleteId(null); }}
                  className="flex-1 px-3 py-2 text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600 rounded-lg transition-colors cursor-pointer"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
