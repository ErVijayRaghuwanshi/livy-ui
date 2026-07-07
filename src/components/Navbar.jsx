import { useState, useEffect, useRef } from "react";
import {
  Server,
  Play,
  Square,
  RefreshCw,
  ChevronDown,
  Zap,
  Loader2,
  Github,
  GitFork,
  Star,
  Plus,
  Link,
  Sun,
  Moon,
  WifiOff,
} from "lucide-react";
import { useLivy } from "../context/LivyContext";
import { SESSION_STATES } from "../utils/constants";
import ConnectionModal from "./ConnectionModal";

const stateColors = {
  [SESSION_STATES.NOT_STARTED]: "bg-gray-500",
  [SESSION_STATES.STARTING]: "bg-yellow-500 animate-pulse",
  [SESSION_STATES.IDLE]: "bg-green-500",
  [SESSION_STATES.BUSY]: "bg-blue-500 animate-pulse",
  [SESSION_STATES.ERROR]: "bg-red-500",
  [SESSION_STATES.DEAD]: "bg-red-700",
  [SESSION_STATES.KILLED]: "bg-red-700",
  [SESSION_STATES.SHUTTING_DOWN]: "bg-orange-500 animate-pulse",
  [SESSION_STATES.SUCCESS]: "bg-green-500",
};

export default function Navbar({ theme, toggleTheme, showConnectionModal, setShowConnectionModal }) {
  const {
    activeHost,
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
    isOnline,
    isServerReachable,
  } = useLivy();

  const [showSessionDropdown, setShowSessionDropdown] = useState(false);
  const [newSessionName, setNewSessionName] = useState("");
  const dropdownRef = useRef(null);
  const [repoStats, setRepoStats] = useState({ stars: 0, forks: 0, version: "v1.4.2" });

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    if (!showSessionDropdown) return;
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowSessionDropdown(false);
      }
    };
    const handleKey = (e) => {
      if (e.key === "Escape") setShowSessionDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, [showSessionDropdown]);

  // Fetch sessions when dropdown opens
  useEffect(() => {
    if (showSessionDropdown) {
      fetchSessions();
    }
  }, [showSessionDropdown, fetchSessions]);

  const isActive =
    sessionState === SESSION_STATES.IDLE ||
    sessionState === SESSION_STATES.BUSY;
  const isStarting = sessionState === SESSION_STATES.STARTING;

  const handleCreateSession = () => {
    startSession(newSessionName);
    setNewSessionName("");
    setShowSessionDropdown(false);
  };

  const handleAttach = (id) => {
    attachSession(id);
  };

  const handleStop = () => {
    stopSession();
  };

  const sessionLabel = sessionId !== null
    ? sessionName || `Session ${sessionId}`
    : "No Session";

  return (
    <>
      <nav className="flex items-center justify-between h-14 px-4 bg-(--color-bg-secondary) border-b border-(--color-border) shrink-0 select-none">
        {/* Left Section */}
        <div className="flex items-center gap-2 sm:gap-6">
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            <Zap size={18} className="sm:w-5 sm:h-5 text-(--color-accent)" />
            <span className="text-sm sm:text-base font-bold tracking-tight text-(--color-text-primary)">
              <span className="hidden sm:inline">Livy SQL</span>
              <span className="sm:hidden">Livy</span>
            </span>
          </div>

          {/* GitHub Repo Link with Dynamic Stats */}
          <a
            href="https://github.com/ErVijayRaghuwanshi/livy-ui"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:flex items-center gap-3 px-3 py-1 hover:bg-(--color-bg-tertiary) rounded-md transition-colors group"
          >
            <Github size={20} className="text-(--color-text-muted) group-hover:text-(--color-text-primary)" />
            <div className="flex flex-col leading-tight">
              <span className="text-xs font-semibold text-(--color-text-primary)">
                ErVijayRaghuwanshi/livy-ui
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="flex items-center gap-0.5 text-[10px] text-(--color-text-muted)">
                   <Star size={10} /> {repoStats.stars.toLocaleString()}
                </span>
                <span className="flex items-center gap-0.5 text-[10px] text-(--color-text-muted)">
                   <GitFork size={10} /> {repoStats.forks.toLocaleString()}
                </span>
                <span className="text-[10px] bg-(--color-bg-primary) px-1 rounded border border-(--color-border) text-(--color-text-muted)">
                  {repoStats.version}
                </span>
              </div>
            </div>
          </a>
        </div>

        {/* Right Section (Controls) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Offline/Server Down Warning Badges */}
          {!isOnline && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-500/10 border border-gray-500/25 rounded-md text-gray-400 select-none animate-pulse" title="Your browser is offline. Caching is enabled.">
              <WifiOff size={11} className="shrink-0" />
              <span className="font-semibold uppercase tracking-wider text-[9px] hidden md:inline">Browser Offline</span>
            </div>
          )}

          {isOnline && isServerReachable === false && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-rose-500/10 border border-rose-500/25 rounded-md text-rose-400 select-none animate-pulse" title="Livy backend server is down or unreachable. Check connection.">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
              <span className="font-semibold uppercase tracking-wider text-[9px] hidden md:inline">Server Down</span>
            </div>
          )}

          {error && isServerReachable !== false && (
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-(--color-error)/10 border border-(--color-error)/20 rounded-lg text-xs text-(--color-error) max-w-48 select-none" title={error}>
              <span className="w-1.5 h-1.5 rounded-full bg-(--color-error) animate-pulse shrink-0" />
              <span className="truncate">{error}</span>
            </div>
          )}
          
          {appId && (
            <div className="hidden lg:flex items-center h-8 gap-1.5 px-3 bg-(--color-bg-primary) rounded-lg border border-(--color-border) select-none">
              <span className="text-[10px] text-(--color-text-muted) uppercase tracking-wider font-semibold">App</span>
              <span className="text-xs text-(--color-accent) font-mono font-medium">{appId}</span>
            </div>
          )}

          {/* Host selector */}
          <button
            onClick={() => setShowConnectionModal(true)}
            className="flex items-center h-8 gap-1.5 px-2.5 bg-(--color-bg-primary) rounded-lg border border-(--color-border) hover:border-(--color-accent) hover:text-(--color-text-primary) active:scale-95 transition-all duration-200 cursor-pointer shadow-xs group"
            title={
              !isOnline
                ? "Browser is Offline"
                : isServerReachable === false
                ? "Livy Server is Unreachable (Down)"
                : isServerReachable === null
                ? "Checking connection to Livy server..."
                : `Connected to Livy host (Active: ${activeHost.name})`
            }
          >
            <div className="relative flex items-center justify-center shrink-0">
              <Server size={13} className="text-(--color-text-muted) group-hover:text-(--color-accent) transition-colors" />
              {/* Connected pulse dot */}
              <span className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full border border-(--color-bg-primary) ${
                !isOnline
                  ? "bg-gray-500"
                  : isServerReachable === false
                  ? "bg-rose-500 animate-pulse"
                  : isServerReachable === null
                  ? "bg-amber-500 animate-pulse"
                  : "bg-green-500"
              }`} />
            </div>
            <span className="hidden sm:inline text-xs text-(--color-text-secondary) font-medium max-w-28 truncate group-hover:text-(--color-text-primary) transition-colors">
              {activeHost.name}
            </span>
            <ChevronDown size={12} className="hidden sm:inline text-(--color-text-muted) group-hover:text-(--color-text-primary) transition-colors" />
          </button>

          {/* Session picker dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowSessionDropdown((v) => !v)}
              className={`flex items-center h-8 gap-1.5 px-2.5 rounded-lg border transition-all duration-200 cursor-pointer active:scale-95 shadow-xs ${
                isActive
                  ? "bg-(--color-success)/5 border-(--color-success)/20 hover:border-(--color-success)/40 hover:bg-(--color-success)/10 text-(--color-success)"
                  : isStarting
                  ? "bg-(--color-warning)/5 border-(--color-warning)/20 hover:border-(--color-warning)/40 hover:bg-(--color-warning)/10 text-(--color-warning)"
                  : "bg-(--color-bg-primary) border-(--color-border) hover:border-(--color-accent) hover:text-(--color-text-primary)"
              }`}
            >
              <div className="relative flex h-2 w-2 shrink-0 items-center justify-center">
                {(isActive || isStarting) && (
                  <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${stateColors[sessionState] || "bg-gray-500"}`} />
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${stateColors[sessionState] || "bg-gray-500"}`} />
              </div>
              <span className={`hidden sm:inline text-xs font-semibold max-w-32 truncate ${isActive ? "text-(--color-success)" : isStarting ? "text-(--color-warning)" : "text-(--color-text-secondary)"}`}>
                {sessionLabel}
              </span>
              <ChevronDown size={12} className={`hidden sm:inline ${isActive ? "text-(--color-success)/60" : isStarting ? "text-(--color-warning)/60" : "text-(--color-text-muted)"}`} />
            </button>

            {showSessionDropdown && (
              <div className="absolute right-0 top-full mt-1.5 w-80 backdrop-blur-md bg-(--color-bg-secondary)/85 border border-(--color-border) rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center px-4 py-2.5 border-b border-(--color-border)/60 bg-transparent">
                  <span className="text-[10px] font-bold text-(--color-text-primary) uppercase tracking-wider">Sessions on {activeHost.name}</span>
                </div>

                {/* Session list */}
                <div className="max-h-52 overflow-y-auto">
                  {sessionsLoading && sessions.length === 0 ? (
                    <div className="flex items-center justify-center gap-2 py-8 text-(--color-text-muted)">
                      <Loader2 size={14} className="animate-spin" />
                      <span className="text-xs font-medium">Loading active sessions...</span>
                    </div>
                  ) : sessions.length === 0 ? (
                    <div className="py-8 text-center text-xs text-(--color-text-muted) font-medium">No active sessions found</div>
                  ) : (
                    sessions.map((s) => {
                      const isCurrent = s.id === sessionId;
                      const sAlive = s.state === "idle" || s.state === "busy" || s.state === "starting";
                      return (
                        <div
                          key={s.id}
                          className={`flex items-center gap-3 px-4 py-2.5 transition-all duration-200 border-l-2 ${
                            isCurrent
                              ? "bg-(--color-accent)/5 border-(--color-accent)"
                              : sAlive
                              ? "hover:bg-(--color-bg-tertiary)/40 border-transparent cursor-pointer hover:border-(--color-accent)/30"
                              : "border-transparent opacity-60 cursor-not-allowed"
                          }`}
                          onClick={() => !isCurrent && sAlive && handleAttach(s.id)}
                        >
                          <div className="relative flex h-2 w-2 shrink-0 items-center justify-center">
                            {(s.state === "idle" || s.state === "busy" || s.state === "starting") && (
                              <span className={`absolute inline-flex h-full w-full rounded-full opacity-50 animate-ping ${stateColors[s.state] || "bg-gray-500"}`} />
                            )}
                            <span className={`relative inline-flex rounded-full h-2 w-2 ${stateColors[s.state] || "bg-gray-500"}`} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-(--color-text-primary) truncate">
                                {s.name || `Session ${s.id}`}
                              </span>
                              {isCurrent && (
                                <span className="text-[9px] font-bold text-(--color-accent) bg-(--color-accent)/10 border border-(--color-accent)/20 px-2 py-0.5 rounded-full shrink-0 uppercase tracking-wide">
                                  Attached
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] text-(--color-text-muted) font-mono">#{s.id}</span>
                              <span className="text-[9px] text-(--color-text-muted) font-medium uppercase tracking-wider text-[8px] bg-(--color-bg-primary) border border-(--color-border) px-1 rounded-sm">{s.state}</span>
                              {s.appId && <span className="text-[10px] text-(--color-text-muted) font-mono truncate max-w-[120px]">{s.appId}</span>}
                            </div>
                          </div>
                          {!isCurrent && sAlive && (
                            <Link size={12} className="text-(--color-text-muted) shrink-0 transition-colors" />
                          )}
                          {!sAlive && (
                            <span className="text-[9px] font-bold text-(--color-error) bg-(--color-error)/10 px-1.5 py-0.5 rounded uppercase shrink-0">dead</span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Create new session */}
                <div className="border-t border-(--color-border)/60 px-4 py-3 bg-transparent">
                  <p className="text-[10px] text-(--color-text-muted) mb-2 uppercase tracking-wider font-semibold">New Session</p>
                  <div className="flex gap-2">
                    <input
                      value={newSessionName}
                      onChange={(e) => setNewSessionName(e.target.value)}
                      placeholder="Session name (optional)"
                      className="flex-1 bg-(--color-bg-primary)/60 border border-(--color-border) rounded-lg px-2.5 py-1.5 text-xs text-(--color-text-primary) outline-none focus:border-(--color-accent) placeholder:text-(--color-text-muted) transition-all"
                      onKeyDown={(e) => e.key === "Enter" && handleCreateSession()}
                    />
                    <button
                      onClick={handleCreateSession}
                      disabled={loading}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 bg-(--color-accent) hover:bg-(--color-accent-hover) text-white rounded-lg text-xs font-semibold transition-all shadow-sm shadow-(--color-accent)/20 hover:shadow-md hover:-translate-y-[1px] active:translate-y-0 active:scale-95 disabled:opacity-40 cursor-pointer"
                    >
                      {loading ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                      Create
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-(--color-bg-primary) border border-(--color-border) hover:border-(--color-accent) hover:text-(--color-text-primary) active:scale-95 transition-all duration-200 cursor-pointer group shadow-xs"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? (
              <Sun size={14} className="transition-transform duration-500 group-hover:rotate-45" />
            ) : (
              <Moon size={14} className="transition-transform duration-500 group-hover:-rotate-12" />
            )}
          </button>

          {/* Quick actions group */}
          <div className="flex items-center gap-1 border-l border-(--color-border) pl-3 select-none">
            {isStarting ? (
              <button
                disabled
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-(--color-warning)/10 border border-(--color-warning)/20 text-(--color-warning)"
                title="Starting session..."
              >
                <Loader2 size={15} className="animate-spin" />
              </button>
            ) : isActive ? (
              <button
                onClick={handleStop}
                disabled={loading}
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-(--color-error)/10 border border-(--color-error)/30 text-(--color-error) hover:bg-(--color-error)/20 hover:border-(--color-error)/50 active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-40 shadow-xs"
                title="Stop Session"
              >
                {loading ? <Loader2 size={15} className="animate-spin" /> : <Square size={13} className="fill-current" />}
              </button>
            ) : (
              <button
                onClick={() => startSession()}
                disabled={loading}
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-(--color-success)/10 border border-(--color-success)/30 text-(--color-success) hover:bg-(--color-success)/20 hover:border-(--color-success)/50 active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-40 shadow-xs"
                title="Start Session"
              >
                {loading ? <Loader2 size={15} className="animate-spin" /> : <Play size={13} className="fill-current" />}
              </button>
            )}

            <button
              onClick={refreshSession}
              disabled={loading || sessionId === null}
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-(--color-bg-primary) border border-(--color-border) text-(--color-text-muted) hover:text-(--color-text-primary) hover:border-(--color-accent) active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-40 shadow-xs"
              title="Refresh Session"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
      </nav>

      <ConnectionModal isOpen={showConnectionModal} onClose={() => setShowConnectionModal(false)} />
    </>
  );
}