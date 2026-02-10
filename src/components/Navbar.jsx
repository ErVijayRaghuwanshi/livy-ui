import { useState, useEffect } from "react"; // Added useEffect
import {
  Server,
  Play,
  Square,
  RefreshCw,
  ChevronDown,
  Settings,
  Zap,
  Loader2,
  Github,
  GitFork,
  Star
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

export default function Navbar() {
  // 1. ALL HOOKS MUST BE AT THE TOP LEVEL OF THE COMPONENT
  const {
    activeHost,
    sessionId,
    sessionState,
    appId,
    loading,
    error,
    startSession,
    stopSession,
    refreshSession,
  } = useLivy();

  const [showModal, setShowModal] = useState(false);
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

  const isActive =
    sessionState === SESSION_STATES.IDLE ||
    sessionState === SESSION_STATES.BUSY;
  const isStarting = sessionState === SESSION_STATES.STARTING;

  return (
    <>
      <nav className="flex items-center justify-between px-4 py-2.5 bg-(--color-bg-secondary) border-b border-(--color-border) shrink-0">
        {/* Left Section */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <Zap size={22} className="text-(--color-accent)" />
            <span className="text-base font-bold tracking-tight text-(--color-text-primary)">
              Livy SQL
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
        <div className="flex items-center gap-3">
          {/* ... keeping your existing right-side controls logic ... */}
          {error && <span className="text-xs text-(--color-error) max-w-48 truncate">{error}</span>}
          
          {appId && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-(--color-bg-primary) rounded-md border border-(--color-border)">
              <span className="text-[10px] text-(--color-text-muted) uppercase tracking-wide">App</span>
              <span className="text-xs text-(--color-text-primary) font-mono">{appId}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-(--color-bg-primary) rounded-md border border-(--color-border)">
            <span className={`w-2 h-2 rounded-full ${stateColors[sessionState] || "bg-gray-500"}`} />
            <span className="text-xs text-(--color-text-secondary) capitalize">
              {sessionState?.replace(/_/g, " ")}
            </span>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-(--color-bg-primary) rounded-md border border-(--color-border) hover:border-(--color-text-muted) transition-colors"
          >
            <Server size={13} className="text-(--color-text-muted)" />
            <span className="text-xs text-(--color-text-secondary) max-w-28 truncate">
              {activeHost.name}
            </span>
            <ChevronDown size={12} className="text-(--color-text-muted)" />
          </button>

          <div className="flex items-center gap-1 border-l border-(--color-border) pl-3">
             {/* ... Start/Stop buttons ... */}
             {!isActive && !isStarting ? (
              <button onClick={startSession} disabled={loading} className="flex items-center gap-1 px-3 py-1.5 bg-(--color-success)/20 text-(--color-success) hover:bg-(--color-success)/30 rounded-md text-xs font-medium transition-colors">
                {loading ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />} Start
              </button>
            ) : (
              <button onClick={stopSession} disabled={loading || isStarting} className="flex items-center gap-1 px-3 py-1.5 bg-(--color-error)/20 text-(--color-error) hover:bg-(--color-error)/30 rounded-md text-xs font-medium transition-colors">
                {loading ? <Loader2 size={13} className="animate-spin" /> : <Square size={13} />} Stop
              </button>
            )}
            
            <button onClick={refreshSession} disabled={loading || !sessionId} className="p-1.5 text-(--color-text-muted) hover:text-(--color-text-primary) rounded-md">
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
      </nav>

      <ConnectionModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}