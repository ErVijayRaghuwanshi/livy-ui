import { useState, useEffect } from "react";
import {
  Server,
  Plus,
  Trash2,
  Loader2,
  Play,
  Square,
  RefreshCw,
  Sun,
  Moon,
  Github,
  Star,
  GitFork,
  ChevronDown,
  ChevronRight,
  Link,
  Settings2,
} from "lucide-react";
import { useLivy } from "../context/LivyContext";
import { SESSION_STATES } from "../utils/constants";

const stateColors = {
  [SESSION_STATES.NOT_STARTED]: "bg-gray-500",
  [SESSION_STATES.STARTING]: "bg-amber-500 animate-pulse",
  [SESSION_STATES.IDLE]: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]",
  [SESSION_STATES.BUSY]: "bg-sky-500 animate-pulse shadow-[0_0_8px_rgba(56,189,248,0.5)]",
  [SESSION_STATES.ERROR]: "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]",
  [SESSION_STATES.DEAD]: "bg-rose-700",
  [SESSION_STATES.KILLED]: "bg-rose-800",
  [SESSION_STATES.SHUTTING_DOWN]: "bg-orange-500 animate-pulse",
  [SESSION_STATES.SUCCESS]: "bg-emerald-500",
};

const statusBadgeStyles = {
  [SESSION_STATES.NOT_STARTED]: "bg-gray-500/10 text-gray-400 border border-gray-500/20",
  [SESSION_STATES.STARTING]: "bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse",
  [SESSION_STATES.IDLE]: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  [SESSION_STATES.BUSY]: "bg-sky-500/10 text-sky-400 border border-sky-500/20",
  [SESSION_STATES.ERROR]: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
  [SESSION_STATES.DEAD]: "bg-rose-950/20 text-rose-400 border border-rose-800/20",
  [SESSION_STATES.KILLED]: "bg-rose-950/20 text-rose-400 border border-rose-800/20",
  [SESSION_STATES.SHUTTING_DOWN]: "bg-orange-500/10 text-orange-400 border border-orange-500/20 animate-pulse",
  [SESSION_STATES.SUCCESS]: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
};

export default function SettingsPanel({
  theme,
  toggleTheme,
  showConnectionModal,
  setShowConnectionModal,
}) {
  const {
    hosts,
    activeHostId,
    selectHost,
    removeHost,
    sessionId,
    sessionState,
    sessionName,
    appId,
    loading,
    error,
    sessions,
    sessionsLoading,
    startSession,
    stopSession,
    refreshSession,
    fetchSessions,
    attachSession,
  } = useLivy();

  const [expandedSections, setExpandedSections] = useState({
    hosts: true,
    sessions: true,
    appearance: true,
    about: false,
  });

  const [newSessionName, setNewSessionName] = useState("");
  const [repoStats] = useState({ stars: 0, forks: 0, version: "v1.4.5" });

  // Auto-fetch sessions when host changes or at load, and poll every 15 seconds ONLY when window is active and focused
  useEffect(() => {
    fetchSessions();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchSessions();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    const interval = setInterval(() => {
      if (document.visibilityState === "visible" && document.hasFocus()) {
        fetchSessions();
      }
    }, 15000);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [activeHostId, fetchSessions]);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleCreateSession = () => {
    startSession(newSessionName);
    setNewSessionName("");
  };

  const isActive =
    sessionState === SESSION_STATES.IDLE ||
    sessionState === SESSION_STATES.BUSY;
  const isStarting = sessionState === SESSION_STATES.STARTING;

  const sessionLabel =
    sessionId !== null ? sessionName || `Session ${sessionId}` : "No Session";

  return (
    <div className="flex flex-col h-full bg-(--color-bg-secondary) select-none overflow-y-auto">
      {/* 1. LIVY HOSTS SECTION */}
      <div className="flex flex-col border-b border-(--color-border)/60">
        <div
          onClick={() => toggleSection("hosts")}
          className="flex items-center justify-between px-3.5 py-2.5 bg-(--color-bg-secondary) hover:bg-(--color-bg-tertiary)/15 cursor-pointer select-none transition-colors duration-150"
        >
          <div className="flex items-center gap-2 min-w-0">
            <ChevronRight
              size={13}
              className={`text-(--color-text-muted) transition-transform duration-200 ease-in-out ${
                expandedSections.hosts ? "rotate-90" : ""
              }`}
            />
            <span className="text-[10px] font-bold text-(--color-text-secondary) uppercase tracking-wider truncate">
              Livy Hosts
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowConnectionModal(true);
            }}
            className="p-1 rounded-md hover:bg-(--color-bg-tertiary) text-(--color-text-muted) hover:text-(--color-accent) transition-all duration-150 dg-spring-btn"
            title="Manage Connections"
          >
            <Settings2 size={13} />
          </button>
        </div>

        {expandedSections.hosts && (
          <div className="flex flex-col py-2 px-3 border-t border-(--color-border)/20 bg-(--color-bg-secondary)/10 gap-1.5">
            {hosts.map((h) => {
              const isSelected = h.id === activeHostId;
              return (
                <div
                  key={h.id}
                  onClick={() => selectHost(h.id)}
                  className={`group flex items-center justify-between px-2.5 py-2 text-xs rounded-lg cursor-pointer transition-all duration-200 border ${
                    isSelected
                      ? "bg-gradient-to-r from-(--color-accent)/10 to-(--color-accent)/2 border-(--color-accent)/30 text-(--color-text-primary) font-medium shadow-xs"
                      : "text-(--color-text-secondary) hover:bg-(--color-bg-tertiary)/30 border-transparent hover:text-(--color-text-primary)"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Server
                      size={13}
                      className={
                        isSelected ? "text-(--color-accent)" : "text-(--color-text-muted) group-hover:text-(--color-text-secondary)"
                      }
                    />
                    <div className="flex flex-col truncate">
                      <span className="truncate leading-tight">{h.name}</span>
                      <span className="text-[9px] text-(--color-text-muted) font-mono truncate mt-0.5">
                        {h.url}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {isSelected && (
                      <span className="flex h-2 w-2 relative shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-(--color-accent) opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-(--color-accent)"></span>
                      </span>
                    )}
                    {h.id !== "default" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeHost(h.id);
                        }}
                        className="p-1 rounded text-(--color-text-muted) hover:text-(--color-error) hover:bg-(--color-error)/10 transition-colors opacity-0 group-hover:opacity-100 dg-spring-btn"
                        title="Delete Host"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. LIVY SESSIONS SECTION */}
      <div className="flex flex-col border-b border-(--color-border)/60">
        <div
          onClick={() => toggleSection("sessions")}
          className="flex items-center justify-between px-3.5 py-2.5 bg-(--color-bg-secondary) hover:bg-(--color-bg-tertiary)/15 cursor-pointer select-none transition-colors duration-150"
        >
          <div className="flex items-center gap-2 min-w-0">
            <ChevronRight
              size={13}
              className={`text-(--color-text-muted) transition-transform duration-200 ease-in-out ${
                expandedSections.sessions ? "rotate-90" : ""
              }`}
            />
            <span className="text-[10px] font-bold text-(--color-text-secondary) uppercase tracking-wider truncate">
              Session Manager
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              fetchSessions();
            }}
            disabled={sessionsLoading}
            className="p-1 rounded-md hover:bg-(--color-bg-tertiary) text-(--color-text-muted) hover:text-(--color-accent) transition-all duration-150 disabled:opacity-40 dg-spring-btn"
            title="Refresh active sessions list"
          >
            <RefreshCw size={12} className={sessionsLoading ? "animate-spin" : ""} />
          </button>
        </div>

        {expandedSections.sessions && (
          <div className="flex flex-col py-3.5 px-3.5 border-t border-(--color-border)/20 bg-(--color-bg-secondary)/10 gap-4">
            {/* Active Session Info Card */}
            <div className="flex flex-col gap-2.5 bg-(--color-bg-primary)/40 border border-(--color-border)/40 p-3.5 rounded-xl shadow-xs">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="relative flex h-2 w-2 shrink-0 items-center justify-center">
                    {(isActive || isStarting) && (
                      <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${stateColors[sessionState] || "bg-gray-500"}`} />
                    )}
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${stateColors[sessionState] || "bg-gray-500"}`} />
                  </div>
                  <span className="text-xs font-semibold truncate text-(--color-text-primary)">
                    {sessionLabel}
                  </span>
                </div>
                
                <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded-full tracking-wider shrink-0 ${
                  statusBadgeStyles[sessionState] || "bg-gray-500/10 text-gray-400 border border-gray-500/20"
                }`}>
                  {sessionState}
                </span>
              </div>
              
              {appId && (
                <div className="text-[9px] text-(--color-text-muted) font-mono truncate bg-(--color-bg-primary)/60 px-2.5 py-1 rounded-lg border border-(--color-border)/25">
                  App ID: <span className="text-(--color-accent) font-semibold select-all">{appId}</span>
                </div>
              )}

              {/* Session Controls */}
              <div className="flex items-center gap-2 mt-1 border-t border-(--color-border)/15 pt-2.5 justify-end">
                {isStarting ? (
                  <button
                    disabled
                    className="flex-1 flex items-center justify-center h-8 px-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-semibold"
                  >
                    <Loader2 size={13} className="animate-spin mr-1.5" />
                    Starting...
                  </button>
                ) : isActive ? (
                  <button
                    onClick={stopSession}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center h-8 gap-1.5 px-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 hover:border-rose-500/40 text-xs rounded-lg transition-all disabled:opacity-40 cursor-pointer shadow-xs font-semibold dg-spring-btn"
                    title="Stop Active Session"
                  >
                    {loading ? <Loader2 size={12} className="animate-spin" /> : <Square size={11} className="fill-current" />}
                    Stop Session
                  </button>
                ) : (
                  <button
                    onClick={() => startSession()}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center h-8 gap-1.5 px-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/40 text-xs rounded-lg transition-all disabled:opacity-40 cursor-pointer shadow-xs font-semibold dg-spring-btn"
                    title="Start New Session"
                  >
                    {loading ? <Loader2 size={12} className="animate-spin" /> : <Play size={11} className="fill-current" />}
                    Start Session
                  </button>
                )}

                <button
                  onClick={refreshSession}
                  disabled={loading || sessionId === null}
                  className="flex items-center justify-center w-8 h-8 rounded-lg bg-(--color-bg-primary)/40 border border-(--color-border)/40 text-(--color-text-muted) hover:text-(--color-text-primary) hover:border-(--color-accent) active:scale-95 transition-all duration-150 cursor-pointer disabled:opacity-40 shadow-xs dg-spring-btn"
                  title="Refresh Session Status"
                >
                  <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
                </button>
              </div>
            </div>

            {/* Create New Session Form */}
            <div className="flex flex-col gap-1.5 border-t border-(--color-border)/15 pt-3">
              <span className="text-[9px] text-(--color-text-muted) uppercase tracking-wider font-bold">
                Create Session Profile
              </span>
              <div className="flex gap-2">
                <input
                  value={newSessionName}
                  onChange={(e) => setNewSessionName(e.target.value)}
                  placeholder="Optional session name..."
                  className="flex-1 min-w-0 bg-(--color-bg-primary)/40 border border-(--color-border)/50 rounded-lg px-2.5 py-1.5 text-xs text-(--color-text-primary) outline-none focus:border-(--color-accent) focus:ring-1 focus:ring-(--color-accent)/20 placeholder:text-(--color-text-muted)/80 transition-all font-medium"
                  onKeyDown={(e) => e.key === "Enter" && handleCreateSession()}
                />
                <button
                  onClick={handleCreateSession}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-(--color-accent) hover:bg-(--color-accent-hover) text-white rounded-lg text-xs font-semibold transition-all active:scale-95 disabled:opacity-40 cursor-pointer dg-spring-btn"
                >
                  {loading ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                  Create
                </button>
              </div>
            </div>

            {/* Active Sessions List on Host */}
            <div className="flex flex-col gap-2 border-t border-(--color-border)/15 pt-3">
              <span className="text-[9px] text-(--color-text-muted) uppercase tracking-wider font-bold">
                Sessions on Cluster
              </span>
              <div className="flex flex-col gap-1.5">
                {sessionsLoading && sessions.length === 0 ? (
                  <div className="flex items-center justify-center gap-2 py-4 text-(--color-text-muted)">
                    <Loader2 size={12} className="animate-spin" />
                    <span className="text-[11px] font-medium">Loading sessions...</span>
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="py-4 text-center text-[11px] text-(--color-text-muted) italic">
                    No active sessions detected
                  </div>
                ) : (
                  sessions.map((s) => {
                    const isCurrent = s.id === sessionId;
                    const sAlive =
                      s.state === "idle" ||
                      s.state === "busy" ||
                      s.state === "starting";
                    return (
                      <div
                        key={s.id}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border transition-all ${
                          isCurrent
                            ? "bg-(--color-accent-hover)/10 border-(--color-accent)"
                            : sAlive
                            ? "hover:bg-(--color-bg-tertiary)/40 border-transparent hover:border-(--color-border)/40 cursor-pointer"
                            : "border-transparent opacity-40 cursor-not-allowed"
                        }`}
                        onClick={() => !isCurrent && sAlive && attachSession(s.id)}
                      >
                        <span className={`w-2 h-2 rounded-full ${stateColors[s.state] || "bg-gray-500"}`} />
                        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                          <span className="text-xs font-semibold text-(--color-text-primary) truncate">
                            {s.name || `Session ${s.id}`}
                          </span>
                          <span className="text-[9px] text-(--color-text-muted) font-mono uppercase tracking-wide">
                            #{s.id} · {s.state}
                          </span>
                        </div>
                        {!isCurrent && sAlive && (
                          <Link size={11} className="text-(--color-text-muted) hover:text-(--color-text-secondary) shrink-0" />
                        )}
                        {isCurrent && (
                          <span className="text-[8px] font-bold text-(--color-accent) uppercase px-1.5 py-0.5 bg-(--color-accent)/10 border border-(--color-accent)/20 rounded-md">Active</span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. APPEARANCE SECTION */}
      <div className="flex flex-col border-b border-(--color-border)/60">
        <div
          onClick={() => toggleSection("appearance")}
          className="flex items-center justify-between px-3.5 py-2.5 bg-(--color-bg-secondary) hover:bg-(--color-bg-tertiary)/15 cursor-pointer select-none transition-colors duration-150"
        >
          <div className="flex items-center gap-2">
            <ChevronRight
              size={13}
              className={`text-(--color-text-muted) transition-transform duration-200 ease-in-out ${
                expandedSections.appearance ? "rotate-90" : ""
              }`}
            />
            <span className="text-[10px] font-bold text-(--color-text-secondary) uppercase tracking-wider">
              Appearance
            </span>
          </div>
        </div>

        {expandedSections.appearance && (
          <div className="flex flex-col py-3 px-3.5 border-t border-(--color-border)/20 bg-(--color-bg-secondary)/10 gap-2">
            <div className="flex items-center justify-between text-xs text-(--color-text-secondary) font-medium">
              <span>Color Theme</span>
              <div className="flex p-0.5 bg-(--color-bg-primary)/60 border border-(--color-border)/50 rounded-lg select-none">
                <button
                  onClick={() => theme === "dark" && toggleTheme()}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-md transition-all duration-150 cursor-pointer dg-spring-btn ${
                    theme === "light"
                      ? "bg-(--color-accent) text-white shadow-xs"
                      : "text-(--color-text-muted) hover:text-(--color-text-secondary)"
                  }`}
                >
                  <Sun size={11} />
                  <span>Light</span>
                </button>
                <button
                  onClick={() => theme === "light" && toggleTheme()}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-md transition-all duration-150 cursor-pointer dg-spring-btn ${
                    theme === "dark"
                      ? "bg-(--color-accent) text-white shadow-xs"
                      : "text-(--color-text-muted) hover:text-(--color-text-secondary)"
                  }`}
                >
                  <Moon size={11} />
                  <span>Dark</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. ABOUT SECTION */}
      <div className="flex flex-col border-b border-(--color-border)/60">
        <div
          onClick={() => toggleSection("about")}
          className="flex items-center justify-between px-3.5 py-2.5 bg-(--color-bg-secondary) hover:bg-(--color-bg-tertiary)/15 cursor-pointer select-none transition-colors duration-150"
        >
          <div className="flex items-center gap-2">
            <ChevronRight
              size={13}
              className={`text-(--color-text-muted) transition-transform duration-200 ease-in-out ${
                expandedSections.about ? "rotate-90" : ""
              }`}
            />
            <span className="text-[10px] font-bold text-(--color-text-secondary) uppercase tracking-wider">
              About
            </span>
          </div>
        </div>

        {expandedSections.about && (
          <div className="flex flex-col py-3.5 px-3.5 border-t border-(--color-border)/20 bg-(--color-bg-secondary)/10 gap-3 text-xs">
            <div className="flex flex-col gap-2 text-(--color-text-secondary) bg-(--color-bg-primary)/40 border border-(--color-border)/40 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <span>Application</span>
                <span className="font-semibold text-(--color-text-primary)">Livy SQL Editor</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Version</span>
                <span className="font-mono text-(--color-accent) font-bold px-2 py-0.5 bg-(--color-accent)/10 border border-(--color-accent)/20 rounded-md text-[10px]">
                  {repoStats.version}
                </span>
              </div>
            </div>

            <a
              href="https://github.com/ErVijayRaghuwanshi/livy-ui"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 border border-(--color-border)/40 rounded-lg hover:bg-(--color-bg-tertiary)/30 text-(--color-text-secondary) hover:text-(--color-text-primary) hover:border-(--color-accent)/30 transition-all dg-spring-btn font-medium"
            >
              <div className="flex items-center gap-2">
                <Github size={13} />
                <span className="text-[11px] font-semibold">GitHub Repository</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="flex items-center gap-0.5 text-[10px]">
                  <Star size={10} className="fill-current text-yellow-500" /> {repoStats.stars}
                </span>
                <span className="flex items-center gap-0.5 text-[10px]">
                  <GitFork size={10} /> {repoStats.forks}
                </span>
              </div>
            </a>
          </div>
        )}
      </div>

      {error && (
        <div className="m-3 p-3 bg-rose-500/5 border-l-2 border-rose-500 border border-rose-500/10 rounded-r-lg text-xs leading-relaxed max-w-[calc(100%-24px)] break-words animate-in fade-in duration-200">
          <div className="flex items-start gap-2">
            <span className="font-semibold text-rose-500 shrink-0">Livy Error:</span>
            <span className="text-(--color-text-secondary) flex-1">{error}</span>
          </div>
        </div>
      )}
    </div>
  );
}
