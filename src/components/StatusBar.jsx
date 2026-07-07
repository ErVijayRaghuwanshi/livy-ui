import { useLivy } from "../context/LivyContext";
import { SESSION_STATES } from "../utils/constants";
import { useSqlFiles } from "../context/SqlFilesContext";
import { Keyboard, History } from "lucide-react";

const stateLabels = {
  [SESSION_STATES.NOT_STARTED]: "No Session",
  [SESSION_STATES.STARTING]: "Starting…",
  [SESSION_STATES.IDLE]: "Idle",
  [SESSION_STATES.BUSY]: "Busy",
  [SESSION_STATES.ERROR]: "Error",
  [SESSION_STATES.DEAD]: "Dead",
  [SESSION_STATES.KILLED]: "Killed",
  [SESSION_STATES.SHUTTING_DOWN]: "Shutting Down",
  [SESSION_STATES.SUCCESS]: "Success",
};

const stateColors = {
  [SESSION_STATES.NOT_STARTED]: "bg-gray-500",
  [SESSION_STATES.STARTING]: "bg-yellow-500",
  [SESSION_STATES.IDLE]: "bg-green-500",
  [SESSION_STATES.BUSY]: "bg-blue-500",
  [SESSION_STATES.ERROR]: "bg-red-500",
  [SESSION_STATES.DEAD]: "bg-red-700",
  [SESSION_STATES.KILLED]: "bg-red-700",
  [SESSION_STATES.SHUTTING_DOWN]: "bg-orange-500",
  [SESSION_STATES.SUCCESS]: "bg-green-500",
};

export default function StatusBar({ cursorPosition, onShowShortcuts, onShowHistory }) {
  const { activeHost, sessionId, sessionState, isOnline, isServerReachable } = useLivy();
  const { activeResult, activeFile, autoSave, toggleAutoSave } = useSqlFiles();

  const rowCount = activeResult?.status === "ok" && activeResult?.data?.["application/json"]
    ? activeResult.data["application/json"].data?.length ?? null
    : null;

  return (
    <div className="flex items-center justify-between px-3 py-0.5 bg-(--color-bg-secondary) border-t border-(--color-border) shrink-0 text-[11px] text-(--color-text-muted) select-none">
      {/* Left */}
      <div className="flex items-center gap-3">
        {/* Session state */}
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${stateColors[sessionState] || "bg-gray-500"}`} />
          <span>
            {sessionId !== null ? `Session #${sessionId}` : "No Session"}
            {" · "}
            {stateLabels[sessionState] || sessionState}
          </span>
        </div>

        {/* Host */}
        <span className="text-(--color-text-muted)/70">{activeHost.name}</span>

        {/* Connection status */}
        <div className="flex items-center gap-1.5" title={
          !isOnline
            ? "Browser Offline: running on cached PWA app shell"
            : isServerReachable === false
            ? "Livy Server down/unreachable"
            : "Livy Server connected"
        }>
          <span className={`w-1.5 h-1.5 rounded-full ${
            !isOnline
              ? "bg-gray-500"
              : isServerReachable === false
              ? "bg-rose-500 animate-pulse"
              : isServerReachable === null
              ? "bg-amber-500 animate-pulse"
              : "bg-green-500"
          }`} />
          <span className="text-[10px] text-(--color-text-muted)/70">
            {!isOnline ? "Offline" : isServerReachable === false ? "Server Down" : "Connected"}
          </span>
        </div>

        {/* Row count */}
        {rowCount !== null && (
          <span>{rowCount} row{rowCount !== 1 ? "s" : ""}</span>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Cursor position */}
        {cursorPosition && (
          <span className="font-mono">
            Ln {cursorPosition.lineNumber}, Col {cursorPosition.column}
          </span>
        )}

        {/* Auto-Save Toggle */}
        <button
          onClick={toggleAutoSave}
          className="flex items-center gap-1.5 px-1.5 py-0.5 rounded-sm hover:text-(--color-text-primary) hover:bg-(--color-bg-tertiary)/40 transition-all cursor-pointer"
          title={`Auto-Save: ${autoSave ? "ON" : "OFF"} (Click to toggle)`}
        >
          <span className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${autoSave ? "bg-blue-400 shadow-[0_0_6px_rgba(96,165,250,0.6)] animate-pulse" : "bg-gray-500"}`} />
          <span>Auto-Save: <span className={autoSave ? "text-blue-400 font-medium" : "text-(--color-text-muted)"}>{autoSave ? "ON" : "OFF"}</span></span>
        </button>

        {/* Query history */}
        <button
          onClick={onShowHistory}
          className="flex items-center gap-1 hover:text-(--color-text-primary) transition-colors"
          title="Query History (Ctrl+Shift+H)"
        >
          <History size={11} />
        </button>

        {/* Keyboard shortcuts hint */}
        <button
          onClick={onShowShortcuts}
          className="flex items-center gap-1 hover:text-(--color-text-primary) transition-colors"
          title="Keyboard Shortcuts (?)"
        >
          <Keyboard size={11} />
        </button>
      </div>
    </div>
  );
}
