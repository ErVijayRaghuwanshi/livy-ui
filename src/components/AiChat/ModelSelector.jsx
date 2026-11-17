import { useState } from "react";
import {
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Wrench,
  Key,
  Server,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useAi } from "../../context/AiContext";
import { AI_PROVIDERS } from "../../services/ai/llmProvider";

export default function ModelSelector() {
  const {
    provider,
    setProvider,
    hostUrl,
    setHostUrl,
    activeModel,
    setActiveModel,
    availableModels,
    geminiApiKey,
    setGeminiApiKey,
    openaiApiKey,
    setOpenaiApiKey,
    isOnline,
    isCheckingHealth,
    refreshModels,
  } = useAi();

  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [tempKey, setTempKey] = useState("");
  const [showHostConfig, setShowHostConfig] = useState(false);
  const [tempHost, setTempHost] = useState(hostUrl || "http://localhost:11434");

  const currentModelObj = availableModels.find(
    (m) => m.name === activeModel || m.model === activeModel || m.id === activeModel
  );

  const activeKey = provider === "gemini" ? geminiApiKey : openaiApiKey;
  const requiresKey = provider === "gemini" || provider === "openai";

  const handleSaveKey = () => {
    if (provider === "gemini") {
      setGeminiApiKey(tempKey);
    } else if (provider === "openai") {
      setOpenaiApiKey(tempKey);
    }
    setShowKeyConfig(false);
    setTempKey("");
    refreshModels();
  };

  const handleSaveHost = () => {
    if (tempHost.trim() && setHostUrl) {
      setHostUrl(tempHost.trim());
    }
    setShowHostConfig(false);
    refreshModels();
  };

  return (
    <div className="flex flex-col gap-2 p-2.5 bg-(--color-bg-tertiary) border-b border-(--color-border) text-xs select-none">
      {/* Provider Selector Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 bg-(--color-bg-secondary) p-0.5 rounded border border-(--color-border)">
          <button
            onClick={() => setProvider("ollama")}
            className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
              provider === "ollama"
                ? "bg-purple-600 text-white shadow-xs"
                : "text-[#888888] hover:text-white"
            }`}
          >
            ⚡ Ollama
          </button>
          <button
            onClick={() => {
              setProvider("gemini");
              if (!geminiApiKey) setShowKeyConfig(true);
            }}
            className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer flex items-center gap-1 ${
              provider === "gemini"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-[#888888] hover:text-white"
            }`}
          >
            <Sparkles size={10} />
            <span>Google GenAI</span>
          </button>
          <button
            onClick={() => {
              setProvider("openai");
              if (!openaiApiKey) setShowKeyConfig(true);
            }}
            className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
              provider === "openai"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-[#888888] hover:text-white"
            }`}
          >
            OpenAI
          </button>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-1.5">
          <div
            className="flex items-center gap-1 text-[11px]"
            title={
              isOnline
                ? `Ready using ${provider.toUpperCase()}`
                : requiresKey
                ? "API key required"
                : `Unable to reach ${hostUrl}`
            }
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isOnline ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" : "bg-red-500"
              }`}
            />
            <span className={isOnline ? "text-emerald-400" : "text-red-400"}>
              {isOnline ? "Online" : "Needs Key"}
            </span>
          </div>

          <button
            onClick={refreshModels}
            disabled={isCheckingHealth}
            title={`Refresh available ${provider.toUpperCase()} models`}
            className="p-1 rounded hover:bg-(--color-bg-hover) text-[#858585] hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw size={11} className={isCheckingHealth ? "animate-spin text-purple-400" : ""} />
          </button>

          {provider === "ollama" && (
            <button
              onClick={() => {
                setShowHostConfig((prev) => !prev);
                setTempHost(hostUrl);
              }}
              title="Configure Ollama Host URL"
              className={`p-1 rounded transition-colors cursor-pointer ${
                showHostConfig
                  ? "bg-purple-600 text-white"
                  : "hover:bg-(--color-bg-hover) text-[#858585] hover:text-white"
              }`}
            >
              <Server size={12} className={isOnline ? "text-purple-400" : "text-amber-400"} />
            </button>
          )}

          {requiresKey && (
            <button
              onClick={() => {
                setShowKeyConfig((prev) => !prev);
                setTempKey(activeKey);
              }}
              title="Configure API Key"
              className={`p-1 rounded transition-colors cursor-pointer ${
                showKeyConfig
                  ? "bg-purple-600 text-white"
                  : "hover:bg-(--color-bg-hover) text-[#858585] hover:text-white"
              }`}
            >
              <Key size={12} className={activeKey ? "text-emerald-400" : "text-amber-400"} />
            </button>
          )}
        </div>
      </div>

      {/* Inline Ollama Host URL Configuration Drawer */}
      {provider === "ollama" && showHostConfig && (
        <div className="flex flex-col gap-1.5 p-2 rounded bg-(--color-bg-secondary) border border-purple-900/40 text-[11px] animate-fadeIn">
          <div className="flex items-center justify-between text-[#858585]">
            <span className="font-semibold text-purple-300">Ollama Host URL</span>
            <span className="text-[10px] text-[#888888]">{availableModels.length} models detected</span>
          </div>

          <div className="flex items-center gap-1.5">
            <input
              type="text"
              placeholder="http://localhost:11434"
              value={tempHost}
              onChange={(e) => setTempHost(e.target.value)}
              className="flex-1 bg-(--color-bg-primary) text-[#cccccc] px-2 py-1 rounded border border-(--color-border) focus:outline-none focus:border-purple-500 font-mono text-[10px]"
            />
            <button
              onClick={handleSaveHost}
              disabled={!tempHost.trim()}
              className="px-2 py-1 rounded bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-medium text-[10px] transition-colors cursor-pointer"
            >
              Save
            </button>
          </div>
          <span className="text-[9px] text-[#666666]">
            Direct browser connection to local Ollama. Default: http://localhost:11434
          </span>
        </div>
      )}

      {/* Inline API Key Configuration Drawer */}
      {requiresKey && (showKeyConfig || !activeKey) && (
        <div className="flex flex-col gap-1.5 p-2 rounded bg-(--color-bg-secondary) border border-blue-900/40 text-[11px] animate-fadeIn">
          <div className="flex items-center justify-between text-[#858585]">
            <span className="font-semibold text-blue-300">
              {provider === "gemini" ? "Google GenAI API Key" : "OpenAI API Key"}
            </span>
            {provider === "gemini" && (
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-0.5 text-blue-400 hover:text-blue-300 underline"
              >
                <span>Get free key</span>
                <ExternalLink size={10} />
              </a>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <input
              type="password"
              placeholder={provider === "gemini" ? "AIzaSy..." : "sk-..."}
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              className="flex-1 bg-(--color-bg-primary) text-[#cccccc] px-2 py-1 rounded border border-(--color-border) focus:outline-none focus:border-blue-500 font-mono text-[10px]"
            />
            <button
              onClick={handleSaveKey}
              disabled={!tempKey.trim()}
              className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium text-[10px] transition-colors cursor-pointer"
            >
              Save
            </button>
          </div>
          <span className="text-[9px] text-[#666666]">
            Key is stored client-side in browser localStorage only.
          </span>
        </div>
      )}

      {/* Model Selection Dropdown */}
      <div className="flex items-center gap-1.5">
        <div className="relative flex-1">
          <select
            value={activeModel}
            onChange={(e) => setActiveModel(e.target.value)}
            onFocus={refreshModels}
            disabled={availableModels.length === 0}
            className="w-full bg-(--color-bg-secondary) text-[#cccccc] text-xs rounded border border-(--color-border) px-2 py-1.5 pr-6 appearance-none cursor-pointer focus:outline-none focus:border-purple-500 hover:border-[#555555] transition-colors"
          >
            {availableModels.length > 0 ? (
              availableModels.map((m) => {
                const val = m.id || m.model || m.name;
                const label = m.displayName || m.name || val;
                return (
                  <option key={val} value={val}>
                    {label} {m.supportsTools ? " (Tools ✓)" : ""}
                  </option>
                );
              })
            ) : (
              <option value={activeModel}>
                {isOnline ? "No models found" : `${activeModel} (Needs Setup)`}
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
            title="Supports native function calling (open file, write SQL, execute queries)"
          >
            <Wrench size={10} />
            <span>Tools</span>
          </span>
        )}
      </div>
    </div>
  );
}
