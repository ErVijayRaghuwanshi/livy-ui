import { useState } from "react";
import {
  Activity,
  RefreshCw,
  Plus,
  Play,
  AlertCircle,
  Trash2,
  Cpu,
  Loader2,
} from "lucide-react";

export default function SparkSessionSection({
  activeHost,
  sessions = [],
  sessionsLoading = false,
  sessionId,
  fetchSessions,
  startSession,
  stopSession,
  killSession,
  attachSession,
  loading: livyLoading,
}) {
  const [showCreateSessionForm, setShowCreateSessionForm] = useState(false);
  const [newSessionName, setNewSessionName] = useState("Default SQL Session");
  const [newSessionKind, setNewSessionKind] = useState("sql");
  const [sessionCreateError, setSessionCreateError] = useState(null);

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

  const handleRetryCleanSession = async () => {
    setSessionCreateError(null);
    try {
      await startSession(newSessionName.trim() || "Spark Session", newSessionKind, {});
      setShowCreateSessionForm(false);
      setNewSessionName("Default SQL Session");
      setNewSessionKind("sql");
    } catch (err) {
      setSessionCreateError(err.message || "Failed to create compute session");
    }
  };

  const stateColors = {
    not_started: "bg-gray-500",
    starting: "bg-yellow-500 animate-pulse",
    idle: "bg-emerald-500",
    busy: "bg-blue-500 animate-pulse",
    error: "bg-rose-500",
    dead: "bg-rose-700",
    killed: "bg-rose-700",
    shutting_down: "bg-amber-500 animate-pulse",
    success: "bg-emerald-500",
  };

  return (
    <div className="space-y-4 pt-1 max-w-3xl">
      {/* Session Manager Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg border border-(--color-border) bg-(--color-bg-secondary)">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-(--color-accent)" />
          <span className="text-xs font-semibold text-(--color-text-primary)">
            Connected Endpoint:{" "}
            <span className="font-mono text-(--color-accent)">{activeHost.name}</span> (
            {activeHost.url})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchSessions()}
            disabled={sessionsLoading}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded bg-(--color-bg-primary) hover:bg-(--color-bg-tertiary) border border-(--color-border) text-(--color-text-secondary) hover:text-(--color-text-primary) transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={12} className={sessionsLoading ? "animate-spin" : ""} />
            Refresh
          </button>

          <button
            onClick={() => {
              setShowCreateSessionForm((prev) => !prev);
              setSessionCreateError(null);
            }}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded bg-(--color-accent) text-white hover:bg-(--color-accent-hover) transition-colors cursor-pointer"
          >
            <Plus size={13} /> {showCreateSessionForm ? "Close Form" : "New Session"}
          </button>
        </div>
      </div>

      {/* Inline Create Session Form */}
      {showCreateSessionForm && (
        <form
          onSubmit={handleCreateSessionSubmit}
          className="p-4 rounded-lg border border-(--color-accent)/40 bg-(--color-accent)/5 space-y-3 animate-in fade-in"
        >
          <h4 className="text-xs font-semibold text-(--color-text-primary) flex items-center gap-1.5">
            <Play size={13} className="text-(--color-accent)" /> Create New Spark / Livy Session
          </h4>

          {sessionCreateError && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono space-y-2 animate-in fade-in">
              <div className="flex items-start gap-2">
                <AlertCircle size={15} className="text-rose-400 shrink-0 mt-0.5" />
                <span className="break-all">{sessionCreateError}</span>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-rose-500/20">
                <button
                  type="button"
                  disabled={livyLoading}
                  onClick={handleRetryCleanSession}
                  className="px-2.5 py-1 text-xs font-semibold rounded bg-rose-500/20 hover:bg-rose-500/30 text-white border border-rose-500/40 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Retry Without Custom Configs
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-(--color-text-muted) mb-1">
                Session Name
              </label>
              <input
                type="text"
                disabled={livyLoading}
                value={newSessionName}
                onChange={(e) => setNewSessionName(e.target.value)}
                placeholder="e.g. Analytics Session 1"
                className="w-full px-3 py-1 text-xs rounded bg-(--color-bg-primary) border border-(--color-border) text-(--color-text-primary) outline-none focus:border-(--color-accent) disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-(--color-text-muted) mb-1">
                Session Kind
              </label>
              <select
                disabled={livyLoading}
                value={newSessionKind}
                onChange={(e) => setNewSessionKind(e.target.value)}
                className="w-full px-3 py-1 text-xs rounded bg-(--color-bg-primary) border border-(--color-border) text-(--color-text-primary) outline-none focus:border-(--color-accent) cursor-pointer font-mono disabled:opacity-50"
              >
                <option value="sql">sql (Spark SQL Session)</option>
                <option value="spark">spark (Scala interactive)</option>
                <option value="pyspark">pyspark (Python interactive)</option>
                <option value="sparkr">sparkr (R interactive)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              disabled={livyLoading}
              onClick={() => setShowCreateSessionForm(false)}
              className="px-3 py-1 text-xs text-(--color-text-muted) hover:text-(--color-text-primary) cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={livyLoading}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded bg-(--color-accent) text-white hover:bg-(--color-accent-hover) disabled:opacity-50 transition-colors cursor-pointer"
            >
              {livyLoading && <Loader2 size={12} className="animate-spin" />}
              <span>{livyLoading ? "Starting Session..." : "Start Session"}</span>
            </button>
          </div>
        </form>
      )}

      {/* Sessions List */}
      {sessionsLoading ? (
        <div className="p-6 text-center text-xs text-(--color-text-muted) flex items-center justify-center gap-2">
          <Loader2 size={14} className="animate-spin text-(--color-accent)" />
          <span>Polling cluster for active sessions...</span>
        </div>
      ) : sessions.length === 0 ? (
        <div className="p-6 text-center text-(--color-text-muted) rounded-lg border border-(--color-border) bg-(--color-bg-secondary)">
          <Cpu size={24} className="mx-auto mb-2 opacity-40 text-(--color-text-muted)" />
          <p className="text-xs font-medium text-(--color-text-secondary)">No active compute sessions found</p>
          <p className="text-[11px] text-(--color-text-muted) mt-1">
            Click &quot;New Session&quot; above to launch a Spark SQL compute session on {activeHost.name}.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {sessions.map((s) => {
            const isAttached = sessionId === s.id;
            return (
              <div
                key={s.id}
                className={`flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg border transition-all ${
                  isAttached
                    ? "bg-(--color-accent)/10 border-(--color-accent)/40"
                    : "bg-(--color-bg-secondary) border-(--color-border)"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      stateColors[s.state] || "bg-gray-500"
                    }`}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-(--color-text-primary)">
                        #{s.id} {s.appId ? `(${s.appId})` : "Session"}
                      </span>
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-(--color-bg-tertiary) text-(--color-text-muted) font-semibold">
                        {s.kind || "sql"}
                      </span>
                      <span className="text-[10px] font-medium capitalize text-(--color-text-secondary)">
                        {s.state}
                      </span>
                      {isAttached && (
                        <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Active Workbench Session
                        </span>
                      )}
                    </div>
                    {s.appInfo && (
                      <div className="text-[10px] font-mono text-(--color-text-muted) mt-0.5">
                        Driver: {s.appInfo.driverLogUrl || "local"}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!isAttached ? (
                    <button
                      onClick={() => attachSession(s.id)}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs rounded bg-(--color-accent)/15 hover:bg-(--color-accent)/25 text-(--color-accent) border border-(--color-accent)/30 transition-colors cursor-pointer font-medium"
                    >
                      Attach
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
  );
}
