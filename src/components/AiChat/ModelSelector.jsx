import { useState } from "react";
import { Sparkles, RefreshCw, Cpu, CheckCircle2, AlertCircle, Wrench } from "lucide-react";
import { useAi } from "../../context/AiContext";

export default function ModelSelector() {
  const {
    hostUrl,
    activeModel,
    setActiveModel,
    availableModels,
    isOnline,
    isCheckingHealth,
    refreshModels,
  } = useAi();

  const currentModelObj = availableModels.find(
    (m) => m.name === activeModel || m.model === activeModel
  );

  return (
    <div className="flex flex-col gap-2 p-2.5 bg-(--color-bg-tertiary) border-b border-(--color-border) text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-medium text-white">
          <Sparkles size={14} className="text-purple-400" />
          <span>Local Ollama Agent</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-1 text-[11px]"
            title={isOnline ? `Connected to ${hostUrl}` : `Unable to reach ${hostUrl}`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isOnline ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" : "bg-red-500"
              }`}
            />
            <span className={isOnline ? "text-emerald-400" : "text-red-400"}>
              {isOnline ? "Online" : "Offline"}
            </span>
          </div>

          <button
            onClick={refreshModels}
            disabled={isCheckingHealth}
            title="Refresh Ollama models"
            className="p-1 rounded hover:bg-(--color-bg-hover) text-[#858585] hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw size={12} className={isCheckingHealth ? "animate-spin text-purple-400" : ""} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <div className="relative flex-1">
          <select
            value={activeModel}
            onChange={(e) => setActiveModel(e.target.value)}
            disabled={availableModels.length === 0}
            className="w-full bg-(--color-bg-secondary) text-[#cccccc] text-xs rounded border border-(--color-border) px-2 py-1.5 pr-6 appearance-none cursor-pointer focus:outline-none focus:border-purple-500 hover:border-[#555555] transition-colors"
          >
            {availableModels.length > 0 ? (
              availableModels.map((m) => (
                <option key={m.name} value={m.name}>
                  {m.name} {m.supportsTools ? " (Tools ✓)" : ""}
                </option>
              ))
            ) : (
              <option value={activeModel}>
                {isOnline ? "No models found" : `${activeModel} (Offline)`}
              </option>
            )}
          </select>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#858585]">
            ▼
          </div>
        </div>

        {currentModelObj?.supportsTools && (
          <span
            className="flex items-center gap-0.5 px-1.5 py-1 rounded bg-purple-900/40 text-purple-300 border border-purple-700/50 text-[10px]"
            title="This model supports native tool/function calling (opening files, running queries, session management)"
          >
            <Wrench size={10} />
            <span>Tools</span>
          </span>
        )}
      </div>
    </div>
  );
}
