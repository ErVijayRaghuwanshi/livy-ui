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
  Check,
  Loader2,
} from "lucide-react";
import { useLivy } from "../context/LivyContext";
import { v4 as uuidv4 } from "uuid";

const COMMON_CONF_KEYS = [
  "spark.sql.warehouse.dir",
  "spark.sql.extensions",
  "spark.hadoop.hive.metastore.uris",
  "spark.executor.memory",
  "spark.executor.cores",
  "spark.driver.memory",
  "spark.dynamicAllocation.enabled",
  "spark.sql.shuffle.partitions",
  "livy.rsc.sql.num-rows",
  "spark.eventLog.enabled",
  "spark.eventLog.dir"
];

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

  // Connectivity Test State
  const [testStatus, setTestStatus] = useState({});
  const [testErrorMessage, setTestErrorMessage] = useState({});

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
    addHost({ id: uuidv4(), name: newName.trim(), url: newUrl.trim() });
    setNewName("");
    setNewUrl("");
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
  };

  const handleTestConnection = async (hostId, url) => {
    setTestStatus((prev) => ({ ...prev, [hostId]: "loading" }));
    setTestErrorMessage((prev) => ({ ...prev, [hostId]: "" }));

    try {
      const cleanUrl = url.replace(/\/+$/, "");
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(`/api/sessions`, {
        signal: controller.signal,
        headers: {
          "Accept": "application/json",
          "X-Livy-Target": cleanUrl,
        }
      });
      
      clearTimeout(timeoutId);

      if (response.ok) {
        setTestStatus((prev) => ({ ...prev, [hostId]: "success" }));
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div className="dg-glassmorphic border border-(--color-border)/50 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-200" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-(--color-border)">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-base font-semibold text-(--color-text-primary)">Connection Manager</h2>
            <p className="text-[11px] text-(--color-text-muted)">Configure Livy host nodes, environment JAR dependencies, and Spark parameters.</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-(--color-bg-tertiary) text-(--color-text-muted) hover:text-(--color-text-primary) transition-colors dg-spring-btn">
            <X size={16} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex px-6 border-b border-(--color-border) bg-(--color-bg-secondary)/30 select-none">
          <button
            onClick={() => setActiveTab("hosts")}
            className={`flex items-center gap-2 py-3 px-1 text-xs font-semibold border-b-2 transition-all duration-155 cursor-pointer ${
              activeTab === "hosts"
                ? "border-(--color-accent) text-(--color-text-primary)"
                : "border-transparent text-(--color-text-muted) hover:text-(--color-text-secondary)"
            }`}
          >
            <Server size={14} />
            <span>Livy Hosts</span>
          </button>
          <button
            onClick={() => setActiveTab("config")}
            className={`flex items-center gap-2 py-3 px-1 ml-6 text-xs font-semibold border-b-2 transition-all duration-155 cursor-pointer ${
              activeTab === "config"
                ? "border-(--color-accent) text-(--color-text-primary)"
                : "border-transparent text-(--color-text-muted) hover:text-(--color-text-secondary)"
            }`}
          >
            <Settings2 size={14} />
            <span>Spark Config</span>
          </button>
          <button
            onClick={() => setActiveTab("jars")}
            className={`flex items-center gap-2 py-3 px-1 ml-6 text-xs font-semibold border-b-2 transition-all duration-155 cursor-pointer ${
              activeTab === "jars"
                ? "border-(--color-accent) text-(--color-text-primary)"
                : "border-transparent text-(--color-text-muted) hover:text-(--color-text-secondary)"
            }`}
          >
            <Package size={14} />
            <span>JARs & Libraries</span>
          </button>
        </div>

        {/* Scrollable Container Area */}
        <div className="flex-1 overflow-y-auto p-6 min-h-[300px]">
          
          {/* TAB 1: LIVY HOSTS */}
          {activeTab === "hosts" && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-200">
              
              {/* Host List */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] text-(--color-text-muted) font-semibold uppercase tracking-wider">Active Connection Endpoints</span>
                {hosts.map((host) => (
                  <div
                    key={host.id}
                    className={`group flex items-center justify-between p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                      host.id === activeHostId
                        ? "border-(--color-accent) bg-(--color-accent)/5 shadow-xs"
                        : "border-(--color-border) hover:border-(--color-text-muted) bg-(--color-bg-primary)/20"
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
                          className="flex-1 bg-(--color-bg-primary) border border-(--color-border) rounded-lg px-3 py-1.5 text-xs text-(--color-text-primary) outline-none focus:border-(--color-accent)"
                          placeholder="Host Label"
                        />
                        <input
                          value={editUrl}
                          onChange={(e) => setEditUrl(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="flex-2 bg-(--color-bg-primary) border border-(--color-border) rounded-lg px-3 py-1.5 text-xs text-(--color-text-primary) font-mono outline-none focus:border-(--color-accent)"
                          placeholder="http://url"
                        />
                        <button
                          onClick={(e) => { e.stopPropagation(); handleSaveEdit(host.id); }}
                          className="p-2 rounded-lg hover:bg-(--color-bg-tertiary) text-(--color-success) transition-all dg-spring-btn"
                          title="Save Host"
                        >
                          <Save size={14} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditingId(null); }}
                          className="p-2 rounded-lg hover:bg-(--color-bg-tertiary) text-(--color-text-muted) hover:text-(--color-text-primary) transition-all dg-spring-btn"
                          title="Cancel"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <Server
                            size={16}
                            className={host.id === activeHostId ? "text-(--color-accent)" : "text-(--color-text-muted)"}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-(--color-text-primary) truncate">{host.name}</span>
                              {host.id === activeHostId && (
                                <span className="text-[8px] font-bold text-(--color-accent) bg-(--color-accent)/10 border border-(--color-accent)/20 px-2 py-0.5 rounded-full">
                                  ACTIVE
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-(--color-text-muted) font-mono truncate mt-0.5 block">{host.url}</span>
                          </div>
                        </div>

                        {/* Host controls */}
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          
                          {/* Latency feedback */}
                          <div className="flex items-center gap-1.5">
                            {testStatus[host.id] === "loading" && (
                              <Loader2 size={12} className="text-(--color-accent) animate-spin animate-duration-1000" />
                            )}
                            {testStatus[host.id] === "success" && (
                              <span className="text-[10px] font-semibold text-(--color-success) px-2 py-0.5 bg-(--color-success)/10 border border-(--color-success)/20 rounded-md shrink-0">
                                Connected
                              </span>
                            )}
                            {testStatus[host.id] === "error" && (
                              <span className="text-[10px] font-semibold text-(--color-error) px-2 py-0.5 bg-(--color-error)/10 border border-(--color-error)/20 rounded-md shrink-0 cursor-help" title={testErrorMessage[host.id]}>
                                Error
                              </span>
                            )}
                            {testStatus[host.id] === "cors_warning" && (
                              <span className="text-[10px] font-semibold text-(--color-warning) px-2 py-0.5 bg-(--color-warning)/10 border border-(--color-warning)/20 rounded-md shrink-0 cursor-help" title={testErrorMessage[host.id]}>
                                Warning (CORS)
                              </span>
                            )}
                            
                            {(!testStatus[host.id] || testStatus[host.id] === "idle" || testStatus[host.id] === "error" || testStatus[host.id] === "cors_warning" || testStatus[host.id] === "success") && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTestConnection(host.id, host.url);
                                }}
                                className="px-2.5 py-1 text-[10px] font-semibold text-(--color-text-secondary) hover:text-white bg-(--color-bg-tertiary)/40 hover:bg-(--color-accent) border border-(--color-border) hover:border-(--color-accent) rounded-lg transition-all dg-spring-btn cursor-pointer"
                                title="Ping connection endpoint"
                              >
                                Test
                              </button>
                            )}
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(host);
                            }}
                            className="p-1.5 rounded-lg hover:bg-(--color-bg-tertiary) text-(--color-text-muted) hover:text-(--color-text-primary) transition-colors dg-spring-btn"
                            title="Edit Host"
                          >
                            <Pencil size={13} />
                          </button>
                          {host.id !== "default" && (
                            <button
                              onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmDeleteId(host.id);
                              }}
                              className="p-1.5 rounded-lg hover:bg-(--color-bg-tertiary) text-(--color-text-muted) hover:text-(--color-error) transition-colors dg-spring-btn"
                              title="Remove Host"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* CORS Troubleshooting alert */}
              {Object.values(testStatus).some(status => status === "cors_warning") && (
                <div className="p-4 bg-(--color-warning)/5 border border-(--color-warning)/20 rounded-xl text-xs text-(--color-warning) flex flex-col gap-2 animate-in fade-in duration-200">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <AlertTriangle size={15} />
                    <span>Livy Server CORS Warning</span>
                  </div>
                  <p className="text-(--color-text-secondary) text-[11px] leading-relaxed">
                    Browser security policies block queries unless CORS is explicitly enabled. Insert these filters in <code>livy.conf</code> on the cluster node:
                  </p>
                  <pre className="p-2.5 bg-black/40 border border-(--color-border)/30 rounded-lg text-[10px] font-mono text-slate-300 select-all overflow-x-auto whitespace-pre">
{`livy.server.access-control.allow-origin = *
livy.server.access-control.allow-methods = GET, POST, OPTIONS, DELETE`}
                  </pre>
                </div>
              )}

              {/* Add Host Form */}
              <div className="bg-(--color-bg-primary)/30 border border-(--color-border)/50 p-4 rounded-xl mt-1 flex flex-col gap-3">
                <span className="text-[10px] text-(--color-text-muted) font-semibold uppercase tracking-wider">Add Connection Target</span>
                <div className="flex gap-2.5">
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Host Name (e.g. Production Cluster)"
                    onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                    className="flex-1 bg-(--color-bg-primary) border border-(--color-border) rounded-lg px-3 py-2 text-xs text-(--color-text-primary) outline-none focus:border-(--color-accent) placeholder:text-(--color-text-muted)"
                  />
                  <input
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="http://host:8998"
                    onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                    className="flex-2 bg-(--color-bg-primary) border border-(--color-border) rounded-lg px-3 py-2 text-xs text-(--color-text-primary) font-mono outline-none focus:border-(--color-accent) placeholder:text-(--color-text-muted)"
                  />
                  <button
                    onClick={handleAdd}
                    disabled={!newName.trim() || !newUrl.trim()}
                    className="flex items-center gap-1 px-4 py-2 bg-(--color-accent) hover:bg-(--color-accent-hover) disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-colors dg-spring-btn"
                  >
                    <Plus size={14} />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SPARK PROPERTIES */}
          {activeTab === "config" && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-200">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-(--color-text-muted) font-semibold uppercase tracking-wider">Session Properties Configuration</span>
                <p className="text-[11px] text-(--color-text-muted)">Define custom key-value settings parameters sent to Spark when starting a Livy interactive session.</p>
              </div>

              {/* Config list */}
              {Object.keys(sessionConf).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-0.5">
                  {Object.entries(sessionConf).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between p-2.5 bg-(--color-bg-primary)/40 border border-(--color-border)/50 rounded-xl hover:border-(--color-accent)/30 transition-colors group"
                    >
                      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                        <span className="text-[10px] text-(--color-accent) font-mono truncate" title={key}>{key}</span>
                        <span className="text-xs text-(--color-text-primary) font-mono truncate" title={value}>{value}</span>
                      </div>
                      <button
                        onClick={() => {
                          const next = { ...sessionConf };
                          delete next[key];
                          setSessionConf(next);
                        }}
                        className="p-1 rounded-lg text-(--color-text-muted) hover:text-(--color-error) hover:bg-(--color-error)/10 transition-colors shrink-0 dg-spring-btn"
                        title="Remove Configuration"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-(--color-text-muted) italic border border-dashed border-(--color-border) rounded-xl bg-(--color-bg-primary)/10">
                  No custom Spark configurations added. Using cluster defaults.
                </div>
              )}

              {/* Add Property Form */}
              <div className="bg-(--color-bg-primary)/30 border border-(--color-border)/50 p-4 rounded-xl flex flex-col gap-3 mt-1">
                <span className="text-[10px] text-(--color-text-muted) font-semibold uppercase tracking-wider">Add Spark Parameter</span>
                <div className="flex gap-2.5">
                  <div className="flex-1 relative">
                    <input
                      value={confKey}
                      onChange={(e) => setConfKey(e.target.value)}
                      placeholder="spark.executor.memory"
                      list="common-spark-keys"
                      className="w-full bg-(--color-bg-primary) border border-(--color-border) rounded-lg px-3 py-2 text-xs text-(--color-text-primary) font-mono outline-none focus:border-(--color-accent) placeholder:text-(--color-text-muted)"
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
                    placeholder="e.g. 4g, 2, or value"
                    className="flex-1 bg-(--color-bg-primary) border border-(--color-border) rounded-lg px-3 py-2 text-xs text-(--color-text-primary) font-mono outline-none focus:border-(--color-accent) placeholder:text-(--color-text-muted)"
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

          {/* TAB 3: JAR FILES */}
          {activeTab === "jars" && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-200">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-(--color-text-muted) font-semibold uppercase tracking-wider">Session JAR Dependencies</span>
                <p className="text-[11px] text-(--color-text-muted)">Load external classes and connector archives (e.g. delta-core, postgres-connector) inside the Spark environment.</p>
              </div>

              {/* JAR list */}
              {sessionJars.length > 0 ? (
                <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-0.5">
                  {sessionJars.map((jar, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 px-3 py-2.5 bg-(--color-bg-primary)/40 border border-(--color-border)/50 rounded-xl hover:border-(--color-accent)/30 transition-all group"
                    >
                      <Package size={15} className="text-(--color-text-muted) shrink-0" />
                      <span className="text-xs text-(--color-text-primary) font-mono truncate min-w-0 flex-1" title={jar}>
                        {jar}
                      </span>
                      <button
                        onClick={() => {
                          const next = sessionJars.filter((_, i) => i !== index);
                          setSessionJars(next);
                        }}
                        className="p-1 rounded-lg text-(--color-text-muted) hover:text-(--color-error) hover:bg-(--color-error)/10 transition-colors shrink-0 dg-spring-btn"
                        title="Remove JAR"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-(--color-text-muted) italic border border-dashed border-(--color-border) rounded-xl bg-(--color-bg-primary)/10">
                  No custom JAR dependencies defined.
                </div>
              )}

              {/* Add JAR file Form */}
              <div className="bg-(--color-bg-primary)/30 border border-(--color-border)/50 p-4 rounded-xl flex flex-col gap-3 mt-1">
                <span className="text-[10px] text-(--color-text-muted) font-semibold uppercase tracking-wider">Add JAR Endpoint</span>
                <div className="flex gap-2.5">
                  <input
                    value={jarUrl}
                    onChange={(e) => setJarUrl(e.target.value)}
                    placeholder="hdfs:///path/connector.jar, s3a://..., http://..."
                    className="flex-1 bg-(--color-bg-primary) border border-(--color-border) rounded-lg px-3 py-2 text-xs text-(--color-text-primary) font-mono outline-none focus:border-(--color-accent) placeholder:text-(--color-text-muted)"
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
                    className="flex items-center gap-1 px-4 py-2 bg-(--color-accent) hover:bg-(--color-accent-hover) disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-colors dg-spring-btn"
                  >
                    <Plus size={14} />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Custom Confirm Delete Dialog */}
      {confirmDeleteId && (() => {
        const host = hosts.find((h) => h.id === confirmDeleteId);
        return (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50" onClick={() => setConfirmDeleteId(null)}>
            <div className="bg-(--color-bg-secondary) border border-(--color-border) rounded-2xl shadow-2xl w-full max-w-sm mx-4 animate-in zoom-in-95 slide-in-from-bottom-4 duration-200" onClick={(e) => e.stopPropagation()}>
              <div className="flex flex-col items-center px-6 py-5 text-center">
                <div className="w-11 h-11 rounded-full bg-(--color-error)/10 flex items-center justify-center mb-3">
                  <AlertTriangle size={22} className="text-(--color-error)" />
                </div>
                <h3 className="text-sm font-semibold text-(--color-text-primary) mb-1">Remove Connection</h3>
                <p className="text-xs text-(--color-text-muted) leading-relaxed">
                  Are you sure you want to remove host <span className="text-(--color-text-primary) font-semibold">"{host?.name}"</span>? Sessions associated with this host will be detached.
                </p>
              </div>
              <div className="flex gap-2 px-6 pb-5">
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="flex-1 px-3 py-2 text-xs font-semibold text-(--color-text-secondary) bg-(--color-bg-tertiary)/40 hover:bg-(--color-bg-tertiary)/80 rounded-lg border border-(--color-border) transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { removeHost(confirmDeleteId); setConfirmDeleteId(null); }}
                  className="flex-1 px-3 py-2 text-xs font-semibold text-white bg-(--color-error) hover:bg-(--color-error)/90 rounded-lg transition-colors cursor-pointer"
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
