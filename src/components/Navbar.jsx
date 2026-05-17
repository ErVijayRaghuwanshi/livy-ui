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
  } = useLivy();

  const [showSessionDropdown, setShowSessionDropdown] = useState(false);
  const [newSessionName, setNewSessionName] = useState("");
  const dropdownRef = useRef(null);
  const [repoStats, setRepoStats] = useState({ stars: 0, forks: 0, version: "v1.0.0" });

  // 2. FETCH GITHUB DATA WITH CACHING
  useEffect(() => {
    const fetchStats = async () => {
      const cacheKey = 'github-stats-livy';
      const cachedData = localStorage.getItem(cacheKey);
      
      // If we have data less than 1 hour old, use it
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        if (Date.now() - parsed.timestamp < 3600000) {
          setRepoStats(parsed.data);
          return;
        }
      }

      try {
        const [repoRes, releaseRes] = await Promise.all([
          fetch("https://api.github.com/repos/ErVijayRaghuwanshi/livy-ui"),
          fetch("https://api.github.com/repos/ErVijayRaghuwanshi/livy-ui/releases/latest")
        ]);

        const repoData = await repoRes.json();
        const releaseData = await releaseRes.json();

        const newData = {
          stars: repoData.stargazers_count || 0,
          forks: repoData.forks_count || 0,
          version: releaseData.tag_name || "v1.0.0"
        };

        setRepoStats(newData);
        localStorage.setItem(cacheKey, JSON.stringify({ 
          timestamp: Date.now(), 
          data: newData 
        }));
      } catch (e) {
        console.error("GitHub stats fetch failed", e);
      }
    };

    fetchStats();
  }, []);

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
      <nav className="flex items-center justify-between px-2 sm:px-4 py-2 sm:py-2.5 bg-(--color-bg-secondary) border-b border-(--color-border) shrink-0">
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
        <div className="flex items-center gap-1.5 sm:gap-3">
          {error && <span className="hidden md:block text-xs text-(--color-error) max-w-48 truncate" title={error}>{error}</span>}
          
          {appId && (
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-(--color-bg-primary) rounded-md border border-(--color-border)">
              <span className="text-[10px] text-(--color-text-muted) uppercase tracking-wide">App</span>
              <span className="text-xs text-(--color-text-primary) font-mono">{appId}</span>
            </div>
          )}

          {/* Host selector */}
          <button
            onClick={() => setShowConnectionModal(true)}
            className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-1.5 bg-(--color-bg-primary) rounded-md border border-(--color-border) hover:border-(--color-text-muted) transition-colors"
            title="Manage Livy Hosts (Cmd+.)"
          >
            <Server size={13} className="text-(--color-text-muted)" />
            <span className="hidden sm:inline text-xs text-(--color-text-secondary) max-w-28 truncate">
              {activeHost.name}
            </span>
            <ChevronDown size={12} className="hidden sm:inline text-(--color-text-muted)" />
          </button>

          {/* Session picker dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowSessionDropdown((v) => !v)}
              className={`flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-1.5 rounded-md border transition-colors ${
                isActive
                  ? "bg-(--color-success)/10 border-(--color-success)/30 hover:border-(--color-success)/50"
                  : isStarting
                  ? "bg-(--color-warning)/10 border-(--color-warning)/30"
                  : "bg-(--color-bg-primary) border-(--color-border) hover:border-(--color-text-muted)"
              }`}
            >
              <span className={`w-2 h-2 rounded-full shrink-0 ${stateColors[sessionState] || "bg-gray-500"}`} />
              <span className="hidden sm:inline text-xs text-(--color-text-secondary) max-w-32 truncate">
                {sessionLabel}
              </span>
              <ChevronDown size={12} className="hidden sm:inline text-(--color-text-muted)" />
            </button>

            {showSessionDropdown && (
              <div className="absolute right-0 top-full mt-1 w-80 bg-(--color-bg-secondary) border border-(--color-border) rounded-lg shadow-2xl z-50 overflow-hidden">
                {/* Header */}
                <div className="flex items-center px-3 py-2 border-b border-(--color-border)">
                  <span className="text-xs font-semibold text-(--color-text-primary)">Sessions on {activeHost.name}</span>
                </div>

                {/* Session list */}
                <div className="max-h-52 overflow-y-auto">
                  {sessionsLoading && sessions.length === 0 ? (
                    <div className="flex items-center justify-center gap-2 py-6 text-(--color-text-muted)">
                      <Loader2 size={14} className="animate-spin" />
                      <span className="text-xs">Loading sessions...</span>
                    </div>
                  ) : sessions.length === 0 ? (
                    <div className="py-6 text-center text-xs text-(--color-text-muted)">No active sessions</div>
                  ) : (
                    sessions.map((s) => {
                      const isCurrent = s.id === sessionId;
                      const sAlive = s.state === "idle" || s.state === "busy" || s.state === "starting";
                      return (
                        <div
                          key={s.id}
                          className={`flex items-center gap-2 px-3 py-2 transition-colors ${
                            isCurrent
                              ? "bg-(--color-accent)/10 border-l-2 border-(--color-accent)"
                              : sAlive
                              ? "hover:bg-(--color-bg-tertiary) border-l-2 border-transparent cursor-pointer"
                              : "border-l-2 border-transparent opacity-60 cursor-not-allowed"
                          }`}
                          onClick={() => !isCurrent && sAlive && handleAttach(s.id)}
                        >
                          <span className={`w-2 h-2 rounded-full shrink-0 ${stateColors[s.state] || "bg-gray-500"}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-medium text-(--color-text-primary) truncate">
                                {s.name || `Session ${s.id}`}
                              </span>
                              {isCurrent && (
                                <span className="text-[9px] font-medium text-(--color-accent) bg-(--color-accent)/20 px-1.5 py-0 rounded-full shrink-0">
                                  ATTACHED
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-(--color-text-muted) font-mono">#{s.id}</span>
                              <span className="text-[10px] text-(--color-text-muted) capitalize">{s.state}</span>
                              {s.appId && <span className="text-[10px] text-(--color-text-muted) font-mono truncate">{s.appId}</span>}
                            </div>
                          </div>
                          {!isCurrent && sAlive && (
                            <Link size={12} className="text-(--color-text-muted) shrink-0" />
                          )}
                          {!sAlive && (
                            <span className="text-[9px] text-(--color-error) shrink-0">dead</span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Create new session */}
                <div className="border-t border-(--color-border) px-3 py-2.5">
                  <p className="text-[10px] text-(--color-text-muted) mb-1.5 uppercase tracking-wide font-medium">New Session</p>
                  <div className="flex gap-1.5">
                    <input
                      value={newSessionName}
                      onChange={(e) => setNewSessionName(e.target.value)}
                      placeholder="Session name (optional)"
                      className="flex-1 bg-(--color-bg-primary) border border-(--color-border) rounded px-2 py-1.5 text-xs text-(--color-text-primary) outline-none focus:border-(--color-accent) placeholder:text-(--color-text-muted)"
                      onKeyDown={(e) => e.key === "Enter" && handleCreateSession()}
                    />
                    <button
                      onClick={handleCreateSession}
                      disabled={loading}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-(--color-success)/20 text-(--color-success) hover:bg-(--color-success)/30 rounded text-xs font-medium transition-colors disabled:opacity-40"
                    >
                      {loading ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
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
            className="p-1 sm:p-1.5 rounded-md hover:bg-(--color-bg-tertiary) transition-colors"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun size={14} className="sm:w-4 sm:h-4" /> : <Moon size={14} className="sm:w-4 sm:h-4" />}
          </button>

          {/* Quick actions */}
          <div className="flex items-center gap-1 border-l border-(--color-border) pl-3">
            {isStarting ? (
              <button
                disabled
                className="p-1.5 bg-(--color-warning)/10 text-(--color-warning) rounded-md"
                title="Starting session..."
              >
                <Loader2 size={15} className="animate-spin" />
              </button>
            ) : isActive ? (
              <button
                onClick={handleStop}
                disabled={loading}
                className="p-1.5 bg-(--color-error)/15 text-(--color-error) hover:bg-(--color-error)/25 rounded-md transition-colors disabled:opacity-40"
                title="Stop Session"
              >
                {loading ? <Loader2 size={15} className="animate-spin" /> : <Square size={15} />}
              </button>
            ) : (
              <button
                onClick={() => startSession()}
                disabled={loading}
                className="p-1.5 bg-(--color-success)/15 text-(--color-success) hover:bg-(--color-success)/25 rounded-md transition-colors disabled:opacity-40"
                title="Start Session"
              >
                {loading ? <Loader2 size={15} className="animate-spin" /> : <Play size={15} />}
              </button>
            )}

            <button
              onClick={refreshSession}
              disabled={loading || sessionId === null}
              className="p-1.5 text-(--color-text-muted) hover:text-(--color-text-primary) rounded-md disabled:opacity-40 transition-colors"
              title="Refresh Session"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
      </nav>

      <ConnectionModal isOpen={showConnectionModal} onClose={() => setShowConnectionModal(false)} />
    </>
  );
}