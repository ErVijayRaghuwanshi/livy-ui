import { useState } from "react";
import {
  Server,
  Play,
  Square,
  RefreshCw,
  ChevronDown,
  Settings,
  Zap,
  Loader2,
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

  const isActive =
    sessionState === SESSION_STATES.IDLE ||
    sessionState === SESSION_STATES.BUSY;
  const isStarting = sessionState === SESSION_STATES.STARTING;

  return (
    <>
      <nav className="flex items-center justify-between px-4 py-2.5 bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)] shrink-0">
        {/* Left: Logo */}
        <div className="flex items-center gap-2.5">
          <Zap size={22} className="text-[var(--color-accent)]" />
          <span className="text-base font-bold tracking-tight text-[var(--color-text-primary)]">
            Livy SQL
          </span>
        </div>

        {/* Right: Connection info + controls */}
        <div className="flex items-center gap-3">
          {/* Error message */}
          {error && (
            <span className="text-xs text-[var(--color-error)] max-w-48 truncate" title={error}>
              {error}
            </span>
          )}

          {/* App ID */}
          {appId && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[var(--color-bg-primary)] rounded-md border border-[var(--color-border)]">
              <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide">App</span>
              <span className="text-xs text-[var(--color-text-primary)] font-mono">{appId}</span>
            </div>
          )}

          {/* Session ID */}
          {sessionId && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[var(--color-bg-primary)] rounded-md border border-[var(--color-border)]">
              <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide">Sess</span>
              <span className="text-xs text-[var(--color-text-primary)] font-mono">{sessionId}</span>
            </div>
          )}

          {/* Session Status */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[var(--color-bg-primary)] rounded-md border border-[var(--color-border)]">
            <span className={`w-2 h-2 rounded-full ${stateColors[sessionState] || "bg-gray-500"}`} />
            <span className="text-xs text-[var(--color-text-secondary)] capitalize">
              {sessionState.replace(/_/g, " ")}
            </span>
          </div>

          {/* Host selector */}
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[var(--color-bg-primary)] rounded-md border border-[var(--color-border)] hover:border-[var(--color-text-muted)] transition-colors"
          >
            <Server size={13} className="text-[var(--color-text-muted)]" />
            <span className="text-xs text-[var(--color-text-secondary)] max-w-28 truncate">
              {activeHost.name}
            </span>
            <ChevronDown size={12} className="text-[var(--color-text-muted)]" />
          </button>

          {/* Session controls */}
          <div className="flex items-center gap-1 border-l border-[var(--color-border)] pl-3">
            {!isActive && !isStarting ? (
              <button
                onClick={startSession}
                disabled={loading}
                className="flex items-center gap-1 px-3 py-1.5 bg-[var(--color-success)]/20 text-[var(--color-success)] hover:bg-[var(--color-success)]/30 disabled:opacity-40 text-xs font-medium rounded-md transition-colors"
                title="Start Session"
              >
                {loading ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />}
                Start
              </button>
            ) : (
              <button
                onClick={stopSession}
                disabled={loading || isStarting}
                className="flex items-center gap-1 px-3 py-1.5 bg-[var(--color-error)]/20 text-[var(--color-error)] hover:bg-[var(--color-error)]/30 disabled:opacity-40 text-xs font-medium rounded-md transition-colors"
                title="Stop Session"
              >
                {loading ? <Loader2 size={13} className="animate-spin" /> : <Square size={13} />}
                Stop
              </button>
            )}

            <button
              onClick={refreshSession}
              disabled={loading || !sessionId}
              className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] disabled:opacity-40 rounded-md transition-colors"
              title="Refresh Session"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>

            <button
              onClick={() => setShowModal(true)}
              className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] rounded-md transition-colors"
              title="Connection Settings"
            >
              <Settings size={14} />
            </button>
          </div>
        </div>
      </nav>

      <ConnectionModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
