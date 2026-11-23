import { useState } from "react";
import {
  Server,
  Wifi,
  Trash2,
  Edit2,
  Check,
  X,
  Plus,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { DATA_SOURCE_TYPES } from "../../../utils/constants";

export default function HostManagerSection({
  hosts,
  activeHostId,
  selectHost,
  addHost,
  removeHost,
  updateHost,
  pingResults = {},
  onTestHost,
}) {
  const [editingHostId, setEditingHostId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [editCluster, setEditCluster] = useState("");
  const [editDb, setEditDb] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editPassword, setEditPassword] = useState("");

  // Add Host Form State
  const [newHostType, setNewHostType] = useState(DATA_SOURCE_TYPES.SPARK);
  const [newHostName, setNewHostName] = useState("");
  const [newHostUrl, setNewHostUrl] = useState("http://localhost:8998");
  const [newHostCluster, setNewHostCluster] = useState("default_cluster");
  const [newHostDb, setNewHostDb] = useState("demo_db");
  const [newHostUsername, setNewHostUsername] = useState("root");
  const [newHostPassword, setNewHostPassword] = useState("");

  const handleStartEdit = (host) => {
    setEditingHostId(host.id);
    setEditName(host.name);
    setEditUrl(host.url);
    setEditCluster(host.cluster || "");
    setEditDb(host.database || "");
    setEditUsername(host.username || "");
    setEditPassword(host.password || "");
  };

  const handleSaveEdit = (hostId) => {
    const name = editName.trim();
    let url = editUrl.trim();
    if (!name || !url) return;
    if (!/^https?:\/\//i.test(url)) {
      url = "http://" + url;
    }
    const updates = { name, url };
    if (editCluster) updates.cluster = editCluster.trim();
    if (editDb) updates.database = editDb.trim();
    if (editUsername) updates.username = editUsername.trim();
    if (editPassword !== undefined) updates.password = editPassword;
    updateHost(hostId, updates);
    setEditingHostId(null);
  };

  const handleAddHostSubmit = (e) => {
    e.preventDefault();
    const isDorisNew = newHostType === DATA_SOURCE_TYPES.DORIS;
    const name = newHostName.trim() || (isDorisNew ? "Doris FE Cluster" : "Livy Cluster");
    let url = newHostUrl.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) {
      url = "http://" + url;
    }
    const newHost = {
      id: uuidv4(),
      name,
      url,
      type: newHostType,
      engine: newHostType,
    };
    if (isDorisNew) {
      newHost.cluster = newHostCluster.trim() || "default_cluster";
      newHost.database = newHostDb.trim() || "demo_db";
      newHost.username = newHostUsername.trim() || "root";
      newHost.password = newHostPassword;
    }
    addHost(newHost);
    setNewHostName("");
    setNewHostUrl(isDorisNew ? "http://localhost:8030" : "http://localhost:8998");
  };

  return (
    <div className="space-y-4 pt-1 max-w-3xl">
      {/* Hosts List */}
      <div className="space-y-2">
        {hosts.map((host) => {
          const isActive = host.id === activeHostId;
          const isEditing = editingHostId === host.id;
          const isDorisHost = host.type === DATA_SOURCE_TYPES.DORIS || host.engine === "doris";
          const pingState = pingResults[host.id];

          return (
            <div
              key={host.id}
              onClick={() => {
                if (!isEditing && !isActive) {
                  selectHost(host.id);
                }
              }}
              className={`flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg border transition-all ${
                isActive
                  ? "bg-(--color-accent)/10 border-(--color-accent)/40"
                  : "bg-(--color-bg-secondary) border-(--color-border) hover:border-(--color-border-subtle) hover:bg-(--color-bg-tertiary)/60 cursor-pointer"
              }`}
            >
              {isEditing ? (
                <div
                  className="flex flex-1 flex-wrap items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Host Name"
                    className="px-2.5 py-1 text-xs rounded bg-(--color-bg-primary) border border-(--color-border) text-(--color-text-primary) outline-none"
                  />
                  <input
                    type="text"
                    value={editUrl}
                    onChange={(e) => setEditUrl(e.target.value)}
                    placeholder="URL"
                    className="flex-1 px-2.5 py-1 text-xs rounded bg-(--color-bg-primary) border border-(--color-border) text-(--color-text-primary) font-mono outline-none"
                  />
                  {isDorisHost && (
                    <>
                      <input
                        type="text"
                        value={editCluster}
                        onChange={(e) => setEditCluster(e.target.value)}
                        placeholder="Cluster"
                        className="w-28 px-2 py-1 text-xs rounded bg-(--color-bg-primary) border border-(--color-border) text-(--color-text-primary) outline-none"
                      />
                      <input
                        type="text"
                        value={editDb}
                        onChange={(e) => setEditDb(e.target.value)}
                        placeholder="Database"
                        className="w-28 px-2 py-1 text-xs rounded bg-(--color-bg-primary) border border-(--color-border) text-(--color-text-primary) outline-none"
                      />
                      <input
                        type="text"
                        value={editUsername}
                        onChange={(e) => setEditUsername(e.target.value)}
                        placeholder="User"
                        className="w-20 px-2 py-1 text-xs rounded bg-(--color-bg-primary) border border-(--color-border) text-(--color-text-primary) outline-none"
                      />
                      <input
                        type="password"
                        value={editPassword}
                        onChange={(e) => setEditPassword(e.target.value)}
                        placeholder="Password"
                        className="w-24 px-2 py-1 text-xs rounded bg-(--color-bg-primary) border border-(--color-border) text-(--color-text-primary) outline-none"
                      />
                    </>
                  )}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleSaveEdit(host.id)}
                      className="p-1 rounded text-emerald-400 hover:bg-emerald-500/10 cursor-pointer"
                      title="Save"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      onClick={() => setEditingHostId(null)}
                      className="p-1 rounded text-(--color-text-muted) hover:bg-(--color-bg-tertiary) cursor-pointer"
                      title="Cancel"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-base select-none shrink-0">
                    {isDorisHost ? "🐬" : "⚡"}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-(--color-text-primary) truncate">
                        {host.name}
                      </span>
                      {isActive && (
                        <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-(--color-accent)/20 text-(--color-accent) border border-(--color-accent)/30">
                          Active
                        </span>
                      )}
                      <span
                        className={`text-[9px] font-bold uppercase px-1 py-0.2 rounded ${
                          isDorisHost
                            ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/25"
                            : "bg-amber-500/15 text-amber-400 border border-amber-500/25"
                        }`}
                      >
                        {isDorisHost ? "Doris" : "Spark"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-(--color-text-muted) font-mono truncate">
                      <span>{host.url}</span>
                      {isDorisHost && host.database && (
                        <span>• db: {host.database}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {!isEditing && (
                <div
                  className="flex items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Ping status badge */}
                  {(pingState?.state === "loading" || pingState === "loading") && (
                    <span className="flex items-center gap-1 text-[11px] text-amber-400">
                      <Loader2 size={12} className="animate-spin" /> Ping...
                    </span>
                  )}
                  {(pingState?.state === "online" || pingState === "online") && (
                    <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                      <CheckCircle2 size={12} /> {pingState?.latency ? `${pingState.latency}ms` : "Online"}
                    </span>
                  )}
                  {(pingState?.state === "offline" || pingState === "offline") && (
                    <span
                      className="flex items-center gap-1 text-[11px] text-rose-400 font-medium"
                      title={pingState?.error || "Endpoint is unreachable"}
                    >
                      <XCircle size={12} /> Offline
                    </span>
                  )}

                  <button
                    onClick={() => onTestHost(host)}
                    disabled={pingState?.state === "loading" || pingState === "loading"}
                    className="p-1 rounded text-(--color-text-muted) hover:text-(--color-text-primary) hover:bg-(--color-bg-tertiary) transition-colors cursor-pointer disabled:opacity-40"
                    title="Test endpoint connection"
                  >
                    <Wifi size={13} className={pingState?.state === "loading" ? "animate-pulse text-amber-400" : ""} />
                  </button>
                  <button
                    onClick={() => handleStartEdit(host)}
                    className="p-1 rounded text-(--color-text-muted) hover:text-(--color-text-primary) hover:bg-(--color-bg-tertiary) transition-colors cursor-pointer"
                    title="Edit endpoint details"
                  >
                    <Edit2 size={13} />
                  </button>
                  {hosts.length > 1 && (
                    <button
                      onClick={() => removeHost(host.id)}
                      className="p-1 rounded text-(--color-text-muted) hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Remove cluster endpoint"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Host Form */}
      <div className="p-3.5 rounded-lg border border-(--color-border) bg-(--color-bg-secondary) space-y-3">
        <h5 className="text-xs font-semibold text-(--color-text-primary) flex items-center gap-1.5">
          <Server size={13} className="text-(--color-accent)" /> Add New Cluster Endpoint
        </h5>

        <form onSubmit={handleAddHostSubmit} className="space-y-3">
          {/* Engine Selector */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setNewHostType(DATA_SOURCE_TYPES.SPARK);
                setNewHostUrl("http://localhost:8998");
                setNewHostName("Local Spark Cluster");
              }}
              className={`flex items-center justify-center gap-1.5 py-1 px-2.5 rounded text-xs font-semibold border transition-all cursor-pointer ${
                newHostType === DATA_SOURCE_TYPES.SPARK
                  ? "bg-blue-500/20 text-blue-400 border-blue-500/40"
                  : "bg-(--color-bg-primary) border-(--color-border) text-(--color-text-muted) hover:text-(--color-text-primary)"
              }`}
            >
              <span>⚡</span> Spark SQL (Livy)
            </button>
            <button
              type="button"
              onClick={() => {
                setNewHostType(DATA_SOURCE_TYPES.DORIS);
                setNewHostUrl("http://localhost:8030");
                setNewHostName("Local Doris FE");
              }}
              className={`flex items-center justify-center gap-1.5 py-1 px-2.5 rounded text-xs font-semibold border transition-all cursor-pointer ${
                newHostType === DATA_SOURCE_TYPES.DORIS
                  ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/40"
                  : "bg-(--color-bg-primary) border-(--color-border) text-(--color-text-muted) hover:text-(--color-text-primary)"
              }`}
            >
              <span>🐬</span> Apache Doris (FE)
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder={newHostType === DATA_SOURCE_TYPES.DORIS ? "Doris Cluster Name" : "Spark Cluster Name"}
              value={newHostName}
              onChange={(e) => setNewHostName(e.target.value)}
              className="px-3 py-1.5 text-xs rounded bg-(--color-bg-primary) border border-(--color-border) text-(--color-text-primary) outline-none focus:border-(--color-accent)"
            />
            <input
              type="text"
              placeholder={newHostType === DATA_SOURCE_TYPES.DORIS ? "http://localhost:8030" : "http://localhost:8998"}
              value={newHostUrl}
              onChange={(e) => setNewHostUrl(e.target.value)}
              className="flex-1 min-w-48 px-3 py-1.5 text-xs rounded bg-(--color-bg-primary) border border-(--color-border) text-(--color-text-primary) font-mono outline-none focus:border-(--color-accent)"
              required
            />
          </div>

          {newHostType === DATA_SOURCE_TYPES.DORIS && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-(--color-border)">
              <input
                type="text"
                placeholder="Cluster (default_cluster)"
                value={newHostCluster}
                onChange={(e) => setNewHostCluster(e.target.value)}
                className="px-2.5 py-1 text-xs rounded bg-(--color-bg-primary) border border-(--color-border) text-(--color-text-primary) outline-none"
              />
              <input
                type="text"
                placeholder="Database (demo_db)"
                value={newHostDb}
                onChange={(e) => setNewHostDb(e.target.value)}
                className="px-2.5 py-1 text-xs rounded bg-(--color-bg-primary) border border-(--color-border) text-(--color-text-primary) outline-none"
              />
              <input
                type="text"
                placeholder="Username (root)"
                value={newHostUsername}
                onChange={(e) => setNewHostUsername(e.target.value)}
                className="px-2.5 py-1 text-xs rounded bg-(--color-bg-primary) border border-(--color-border) text-(--color-text-primary) outline-none"
              />
              <input
                type="password"
                placeholder="Password"
                value={newHostPassword}
                onChange={(e) => setNewHostPassword(e.target.value)}
                className="px-2.5 py-1 text-xs rounded bg-(--color-bg-primary) border border-(--color-border) text-(--color-text-primary) outline-none"
              />
            </div>
          )}

          <button
            type="submit"
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded bg-(--color-accent) text-white hover:bg-(--color-accent-hover) transition-colors cursor-pointer"
          >
            <Plus size={13} /> Add Host
          </button>
        </form>
      </div>
    </div>
  );
}
