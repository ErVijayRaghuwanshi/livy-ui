import { useState, useEffect } from "react";
import { X, Plus, Trash2, Save, Pencil, Settings2, AlertTriangle, Package } from "lucide-react";
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
];

export default function ConnectionModal({ isOpen, onClose }) {
  const { hosts, activeHostId, addHost, removeHost, updateHost, selectHost, sessionConf, setSessionConf, sessionJars, setSessionJars } = useLivy();
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [confKey, setConfKey] = useState("");
  const [confValue, setConfValue] = useState("");
  const [jarUrl, setJarUrl] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-(--color-bg-secondary) border border-(--color-border) rounded-xl shadow-2xl w-full max-w-lg mx-4 animate-in zoom-in-95 slide-in-from-bottom-4 duration-200" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-(--color-border)">
          <h2 className="text-lg font-semibold text-(--color-text-primary)">Manage Livy Hosts</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-(--color-bg-tertiary) transition-colors">
            <X size={18} className="text-(--color-text-secondary)" />
          </button>
        </div>

        {/* Host List */}
        <div className="px-5 py-4 max-h-64 overflow-y-auto space-y-2">
          {hosts.map((host) => (
            <div
              key={host.id}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors cursor-pointer ${
                host.id === activeHostId
                  ? "border-(--color-accent) bg-(--color-accent)/10"
                  : "border-(--color-border) hover:border-(--color-text-muted)"
              }`}
              onClick={() => selectHost(host.id)}
            >
              {editingId === host.id ? (
                <div className="flex-1 flex gap-2">
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 bg-(--color-bg-primary) border border-(--color-border) rounded px-2 py-1 text-sm text-(--color-text-primary) outline-none focus:border-(--color-accent)"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <input
                    value={editUrl}
                    onChange={(e) => setEditUrl(e.target.value)}
                    className="flex-1 bg-(--color-bg-primary) border border-(--color-border) rounded px-2 py-1 text-sm text-(--color-text-primary) outline-none focus:border-(--color-accent)"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button
                    onClick={(e) => { e.stopPropagation(); handleSaveEdit(host.id); }}
                    className="p-1 rounded hover:bg-(--color-bg-tertiary)"
                  >
                    <Save size={14} className="text-(--color-success)" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-(--color-text-primary) truncate">{host.name}</p>
                    <p className="text-xs text-(--color-text-muted) truncate">{host.url}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {host.id === activeHostId && (
                      <span className="text-[10px] font-medium text-(--color-accent) bg-(--color-accent)/20 px-2 py-0.5 rounded-full">
                        ACTIVE
                      </span>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEdit(host); }}
                      className="p-1 rounded hover:bg-(--color-bg-tertiary) text-(--color-text-muted) hover:text-(--color-text-primary)"
                      title="Edit host"
                    >
                      <Pencil size={14} />
                    </button>
                    {host.id !== "default" && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(host.id); }}
                        className="p-1 rounded hover:bg-(--color-bg-tertiary) text-(--color-text-muted) hover:text-(--color-error)"
                        title="Remove host"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Add New Host */}
        <div className="px-5 py-4 border-t border-(--color-border)">
          <p className="text-xs text-(--color-text-muted) mb-2 font-medium uppercase tracking-wide">Add New Host</p>
          <div className="flex gap-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Name"
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              className="flex-1 bg-(--color-bg-primary) border border-(--color-border) rounded-lg px-3 py-2 text-sm text-(--color-text-primary) outline-none focus:border-(--color-accent) placeholder:text-(--color-text-muted)"
            />
            <input
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="http://host:8998"
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              className="flex-1 bg-(--color-bg-primary) border border-(--color-border) rounded-lg px-3 py-2 text-sm text-(--color-text-primary) outline-none focus:border-(--color-accent) placeholder:text-(--color-text-muted)"
            />
            <button
              onClick={handleAdd}
              disabled={!newName.trim() || !newUrl.trim()}
              className="flex items-center gap-1 px-3 py-2 bg-(--color-accent) hover:bg-(--color-accent-hover) disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus size={14} />
              Add
            </button>
          </div>
        </div>

        {/* Session Configuration */}
        <div className="px-5 py-4 border-t border-(--color-border)">
          <div className="flex items-center gap-1.5 mb-3">
            <Settings2 size={13} className="text-(--color-text-muted)" />
            <p className="text-xs text-(--color-text-muted) font-medium uppercase tracking-wide">
              Session Configuration
            </p>
          </div>
          <p className="text-[10px] text-(--color-text-muted) mb-3">
            Spark properties applied when starting a new session (e.g. Hive metastore, executor memory).
          </p>

          {/* Existing config entries */}
          {Object.keys(sessionConf).length > 0 && (
            <div className="space-y-1.5 mb-3 max-h-32 overflow-y-auto">
              {Object.entries(sessionConf).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center gap-2 px-2.5 py-1.5 bg-(--color-bg-primary) rounded-md border border-(--color-border) group"
                >
                  <span className="text-xs text-(--color-accent) font-mono truncate min-w-0 flex-1">
                    {key}
                  </span>
                  <span className="text-[10px] text-(--color-text-muted)">=</span>
                  <span className="text-xs text-(--color-text-primary) font-mono truncate min-w-0 flex-1">
                    {value}
                  </span>
                  <button
                    onClick={() => {
                      const next = { ...sessionConf };
                      delete next[key];
                      setSessionConf(next);
                    }}
                    className="p-0.5 rounded opacity-0 group-hover:opacity-100 text-(--color-text-muted) hover:text-(--color-error) transition-opacity"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add config entry */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                value={confKey}
                onChange={(e) => setConfKey(e.target.value)}
                placeholder="spark.property.name"
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
              placeholder="value"
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
              className="flex items-center gap-1 px-3 py-2 bg-(--color-accent) hover:bg-(--color-accent-hover) disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium rounded-lg transition-colors"
            >
              <Plus size={12} />
              Add
            </button>
          </div>
        </div>

        {/* JAR Files */}
        <div className="px-5 py-4 border-t border-(--color-border)">
          <div className="flex items-center gap-1.5 mb-3">
            <Package size={13} className="text-(--color-text-muted)" />
            <p className="text-xs text-(--color-text-muted) font-medium uppercase tracking-wide">
              JAR Files
            </p>
          </div>
          <p className="text-[10px] text-(--color-text-muted) mb-3">
            URLs of JAR files to be used in this session (e.g., hdfs://, s3://, http://, file://).
          </p>

          {/* Existing JAR entries */}
          {sessionJars.length > 0 && (
            <div className="space-y-1.5 mb-3 max-h-32 overflow-y-auto">
              {sessionJars.map((jar, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-2.5 py-1.5 bg-(--color-bg-primary) rounded-md border border-(--color-border) group"
                >
                  <span className="text-xs text-(--color-text-primary) font-mono truncate min-w-0 flex-1">
                    {jar}
                  </span>
                  <button
                    onClick={() => {
                      const next = sessionJars.filter((_, i) => i !== index);
                      setSessionJars(next);
                    }}
                    className="p-0.5 rounded opacity-0 group-hover:opacity-100 text-(--color-text-muted) hover:text-(--color-error) transition-opacity"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add JAR entry */}
          <div className="flex gap-2">
            <input
              value={jarUrl}
              onChange={(e) => setJarUrl(e.target.value)}
              placeholder="hdfs://namenode/path/to/jar"
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
              className="flex items-center gap-1 px-3 py-2 bg-(--color-accent) hover:bg-(--color-accent-hover) disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium rounded-lg transition-colors"
            >
              <Plus size={12} />
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Custom Confirm Delete Dialog */}
      {confirmDeleteId && (() => {
        const host = hosts.find((h) => h.id === confirmDeleteId);
        return (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50" onClick={() => setConfirmDeleteId(null)}>
            <div className="bg-(--color-bg-secondary) border border-(--color-border) rounded-xl shadow-2xl w-full max-w-sm mx-4 animate-in zoom-in-95 slide-in-from-bottom-4 duration-200" onClick={(e) => e.stopPropagation()}>
              <div className="flex flex-col items-center px-6 py-5 text-center">
                <div className="w-10 h-10 rounded-full bg-(--color-error)/15 flex items-center justify-center mb-3">
                  <AlertTriangle size={20} className="text-(--color-error)" />
                </div>
                <h3 className="text-sm font-semibold text-(--color-text-primary) mb-1">Remove Host</h3>
                <p className="text-xs text-(--color-text-muted)">
                  Are you sure you want to remove <span className="text-(--color-text-primary) font-medium">"{host?.name}"</span>? This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-2 px-6 pb-5">
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="flex-1 px-3 py-2 text-xs font-medium text-(--color-text-secondary) bg-(--color-bg-tertiary) hover:bg-(--color-bg-primary) rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { removeHost(confirmDeleteId); setConfirmDeleteId(null); }}
                  className="flex-1 px-3 py-2 text-xs font-medium text-white bg-(--color-error) hover:bg-(--color-error)/80 rounded-lg transition-colors"
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
