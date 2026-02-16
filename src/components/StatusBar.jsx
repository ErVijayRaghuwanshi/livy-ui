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
  const { activeHost, sessionId, sessionState } = useLivy();
  const { activeResult, activeFile } = useSqlFiles();

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
          title="Keyboard Shortcuts (Ctrl+/)"
        >
          <Keyboard size={11} />
        </button>
      </div>
    </div>
  );
}
