import {
  Layers,
  Wifi,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { DATA_SOURCE_TYPES } from "../../../utils/constants";

export default function DorisManagerSection({
  activeHost,
  settings,
  ping,
  onTestHost,
}) {
  const isCurrentlyDoris =
    activeHost.type === DATA_SOURCE_TYPES.DORIS || activeHost.engine === "doris";

  return (
    <div className="space-y-4 pt-1 max-w-3xl">
      {/* Doris Status Hero Card */}
      <div className="p-4 rounded-xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/20 to-teal-950/10 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-base select-none shrink-0">
              🐬
            </div>
            <div>
              <h4 className="text-xs font-bold text-(--color-text-primary) flex items-center gap-2">
                {activeHost.name}
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  {isCurrentlyDoris ? "Active Compute Engine" : "Configured Endpoint"}
                </span>
              </h4>
              <span className="font-mono text-[11px] text-(--color-text-muted)">
                {activeHost.url}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {ping?.state === "loading" && (
              <span className="flex items-center gap-1 text-xs text-amber-400">
                <Loader2 size={13} className="animate-spin" /> Pinging FE...
              </span>
            )}
            {ping?.state === "online" && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium font-mono">
                <CheckCircle2 size={14} /> FE Connected ({ping.latency}ms)
              </span>
            )}
            {ping?.state === "offline" && (
              <span
                className="flex items-center gap-1 text-xs text-rose-400 font-medium"
                title={ping.error}
              >
                <XCircle size={14} /> Unreachable
              </span>
            )}

            <button
              type="button"
              onClick={() => onTestHost(activeHost)}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded bg-(--color-bg-primary) hover:bg-(--color-bg-tertiary) border border-(--color-border) text-(--color-text-secondary) hover:text-(--color-text-primary) transition-colors cursor-pointer"
            >
              <Wifi size={13} /> Test Ping
            </button>
          </div>
        </div>

        {/* Doris Cluster Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-cyan-500/20 text-xs">
          <div className="p-2 rounded-lg bg-(--color-bg-primary)/60 border border-(--color-border)">
            <span className="text-[10px] text-(--color-text-muted) block">Target Cluster</span>
            <span className="font-mono font-medium text-(--color-text-primary) truncate block">
              {activeHost.cluster || "default_cluster"}
            </span>
          </div>
          <div className="p-2 rounded-lg bg-(--color-bg-primary)/60 border border-(--color-border)">
            <span className="text-[10px] text-(--color-text-muted) block">Active Database</span>
            <span className="font-mono font-medium text-cyan-400 truncate block">
              {activeHost.database || settings["doris.defaultDatabase"] || "demo_db"}
            </span>
          </div>
          <div className="p-2 rounded-lg bg-(--color-bg-primary)/60 border border-(--color-border)">
            <span className="text-[10px] text-(--color-text-muted) block">Default AI Resource</span>
            <span className="font-mono font-medium text-emerald-400 truncate block">
              {settings["doris.defaultAiResource"] || "ollama_gemma2"}
            </span>
          </div>
        </div>
      </div>

      {/* Quick SQL Inspect Actions */}
      <div className="p-3.5 rounded-lg border border-(--color-border) bg-(--color-bg-secondary) space-y-2">
        <h5 className="text-xs font-semibold text-(--color-text-primary) flex items-center gap-1.5">
          <Layers size={13} className="text-cyan-400" /> Doris Cluster Inspection Shortcuts
        </h5>
        <p className="text-[11px] text-(--color-text-muted)">
          Quick administrative statements you can run to inspect backend storage, frontends, or databases:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-xs">
          <div className="p-2 rounded bg-(--color-bg-primary) border border-(--color-border) text-cyan-400">
            SHOW PROC &apos;/backends&apos;;
            <span className="text-[10px] font-sans text-(--color-text-muted) block mt-0.5">
              Inspect BE storage nodes & disks
            </span>
          </div>
          <div className="p-2 rounded bg-(--color-bg-primary) border border-(--color-border) text-cyan-400">
            SHOW PROC &apos;/frontends&apos;;
            <span className="text-[10px] font-sans text-(--color-text-muted) block mt-0.5">
              Inspect FE query coordinators
            </span>
          </div>
          <div className="p-2 rounded bg-(--color-bg-primary) border border-(--color-border) text-cyan-400">
            SHOW DATABASES;
            <span className="text-[10px] font-sans text-(--color-text-muted) block mt-0.5">
              List databases on cluster
            </span>
          </div>
          <div className="p-2 rounded bg-(--color-bg-primary) border border-(--color-border) text-cyan-400">
            SHOW ROUTINE LOAD;
            <span className="text-[10px] font-sans text-(--color-text-muted) block mt-0.5">
              List Kafka streaming ingestion jobs
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
