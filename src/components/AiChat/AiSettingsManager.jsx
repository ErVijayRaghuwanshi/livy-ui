import { useState } from "react";
import {
  Sparkles,
  RefreshCw,
  Key,
  Server,
  ExternalLink,
  Wrench,
  Cpu,
  Layers,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Terminal,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { useAi } from "../../context/AiContext";
import { useSettings } from "../../context/SettingsContext";

function formatBytes(bytes) {
  if (!bytes || typeof bytes !== "number") return "";
  const gb = bytes / (1024 * 1024 * 1024);
  return `${gb.toFixed(1)} GB`;
}

export default function AiSettingsManager() {
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

  const { settings, updateSetting } = useSettings();

  const [tempHost, setTempHost] = useState(hostUrl || "http://localhost:11434");
  const [showKeyPassword, setShowKeyPassword] = useState(false);

  const customUrl = settings["ai.customUrl"] || "http://localhost:8000/v1";
  const customApiKey = settings["ai.customApiKey"] || "";

  const currentModelObj = availableModels.find(
    (m) => m.name === activeModel || m.model === activeModel || m.id === activeModel
  );

  const handleSaveHost = () => {
    if (tempHost.trim() && setHostUrl) {
      setHostUrl(tempHost.trim());
    }
    refreshModels();
  };

  return (
    <div className="flex flex-col gap-5 max-w-3xl pt-1">
      {/* 1. Provider Tabs */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-(--color-text-primary) uppercase tracking-wider">
          AI Provider
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* Ollama */}
          <button
            type="button"
            onClick={() => setProvider("ollama")}
            className={`flex flex-col gap-1 p-3 rounded-lg border text-left transition-all cursor-pointer ${
              provider === "ollama"
                ? "bg-purple-950/30 border-purple-500 text-purple-200 shadow-xs"
                : "bg-(--color-bg-secondary) border-(--color-border) hover:border-(--color-border-subtle) text-(--color-text-muted) hover:text-(--color-text-primary)"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs flex items-center gap-1.5 text-purple-300">
                ⚡ Ollama
              </span>
              {provider === "ollama" && <span className="w-2 h-2 rounded-full bg-purple-400" />}
            </div>
            <span className="text-[11px] text-(--color-text-muted)">
              Local, private, on-device (zero token cost)
            </span>
          </button>

          {/* Google GenAI */}
          <button
            type="button"
            onClick={() => setProvider("gemini")}
            className={`flex flex-col gap-1 p-3 rounded-lg border text-left transition-all cursor-pointer ${
              provider === "gemini"
                ? "bg-blue-950/30 border-blue-500 text-blue-200 shadow-xs"
                : "bg-(--color-bg-secondary) border-(--color-border) hover:border-(--color-border-subtle) text-(--color-text-muted) hover:text-(--color-text-primary)"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs flex items-center gap-1.5 text-blue-300">
                <Sparkles size={12} />
                <span>Google GenAI</span>
              </span>
              {provider === "gemini" && <span className="w-2 h-2 rounded-full bg-blue-400" />}
            </div>
            <span className="text-[11px] text-(--color-text-muted)">
              Gemini 3.8 / 2.5 Flash (free cloud API key)
            </span>
          </button>

          {/* OpenAI */}
          <button
            type="button"
            onClick={() => setProvider("openai")}
            className={`flex flex-col gap-1 p-3 rounded-lg border text-left transition-all cursor-pointer ${
              provider === "openai"
                ? "bg-emerald-950/30 border-emerald-500 text-emerald-200 shadow-xs"
                : "bg-(--color-bg-secondary) border-(--color-border) hover:border-(--color-border-subtle) text-(--color-text-muted) hover:text-(--color-text-primary)"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs flex items-center gap-1.5 text-emerald-300">
                OpenAI
              </span>
              {provider === "openai" && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
            </div>
            <span className="text-[11px] text-(--color-text-muted)">
              GPT-4o / GPT-4o Mini / o3-mini
            </span>
          </button>

          {/* Custom */}
          <button
            type="button"
            onClick={() => setProvider("custom")}
            className={`flex flex-col gap-1 p-3 rounded-lg border text-left transition-all cursor-pointer ${
              provider === "custom"
                ? "bg-zinc-800 border-zinc-500 text-zinc-200 shadow-xs"
                : "bg-(--color-bg-secondary) border-(--color-border) hover:border-(--color-border-subtle) text-(--color-text-muted) hover:text-(--color-text-primary)"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs flex items-center gap-1.5 text-zinc-300">
                Custom API
              </span>
              {provider === "custom" && <span className="w-2 h-2 rounded-full bg-zinc-400" />}
            </div>
            <span className="text-[11px] text-(--color-text-muted)">
              vLLM, Groq, OpenRouter, or local server
            </span>
          </button>
        </div>
      </div>

      {/* 2. Status Banner */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-(--color-bg-secondary) border border-(--color-border) text-xs">
        <div className="flex items-center gap-2.5">
          <span
            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
              isOnline
                ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"
            }`}
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-(--color-text-primary)">
                {isOnline ? "Connected & Ready" : "Configuration Required"}
              </span>
              <span className="text-[10px] text-(--color-text-muted) font-mono">
                ({provider.toUpperCase()})
              </span>
            </div>
            <p className="text-[11px] text-(--color-text-muted) mt-0.5">
              {provider === "ollama"
                ? isOnline
                  ? `${availableModels.length} local models detected at ${hostUrl}`
                  : `Cannot connect to Ollama at ${hostUrl}. Ensure Ollama daemon is active.`
                : provider === "gemini"
                ? isOnline
                  ? "Google GenAI API key active."
                  : "Google GenAI API key required to connect."
                : provider === "openai"
                ? isOnline
                  ? "OpenAI API key active."
                  : "OpenAI API key required to connect."
                : "Custom OpenAI-compatible endpoint."}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={refreshModels}
          disabled={isCheckingHealth}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-(--color-bg-primary) hover:bg-(--color-bg-tertiary) text-(--color-text-secondary) hover:text-(--color-text-primary) border border-(--color-border) transition-colors cursor-pointer text-xs"
        >
          <RefreshCw size={12} className={isCheckingHealth ? "animate-spin text-purple-400" : ""} />
          <span>{isCheckingHealth ? "Checking..." : "Refresh Models"}</span>
        </button>
      </div>

      {/* 3. Provider Specific Settings */}

      {/* A. Ollama Specific Settings */}
      {provider === "ollama" && (
        <div className="flex flex-col gap-3 p-4 rounded-lg bg-(--color-bg-secondary) border border-purple-900/30">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-purple-300">Ollama Host URL</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="http://localhost:11434"
                value={tempHost}
                onChange={(e) => setTempHost(e.target.value)}
                className="flex-1 bg-(--color-bg-primary) text-(--color-text-primary) px-3 py-1.5 rounded border border-(--color-border) focus:outline-none focus:border-purple-500 font-mono text-xs"
              />
              <button
                type="button"
                onClick={handleSaveHost}
                className="px-3 py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs transition-colors cursor-pointer"
              >
                Save & Test
              </button>
            </div>
            <span className="text-[11px] text-(--color-text-muted)">
              Connects directly from browser via client-side fetch. Default: http://localhost:11434
            </span>
          </div>

          {/* Model Selection */}
          <div className="flex flex-col gap-1.5 pt-2 border-t border-(--color-border)">
            <label className="text-xs font-semibold text-(--color-text-primary)">Active Ollama Model</label>
            <select
              value={activeModel}
              onChange={(e) => setActiveModel(e.target.value)}
              disabled={availableModels.length === 0}
              className="w-full bg-(--color-bg-primary) text-(--color-text-primary) px-3 py-2 rounded border border-(--color-border) focus:outline-none focus:border-purple-500 font-mono text-xs cursor-pointer"
            >
              {availableModels.length > 0 ? (
                availableModels.map((m) => {
                  const val = m.id || m.model || m.name;
                  const label = m.displayName || m.name || val;
                  const sizeBadge = m.size ? ` • ${formatBytes(m.size)}` : "";
                  const toolsBadge = m.supportsTools ? " [Tools ✓]" : "";
                  return (
                    <option key={val} value={val}>
                      {label}
                      {sizeBadge}
                      {toolsBadge}
                    </option>
                  );
                })
              ) : (
                <option value={activeModel}>
                  {isOnline ? "No models found" : `${activeModel} (Needs Ollama Connection)`}
                </option>
              )}
            </select>

            {/* Model Capability Pills */}
            <div className="flex items-center gap-2 flex-wrap pt-1 text-[11px]">
              {currentModelObj?.supportsTools && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-purple-900/30 text-purple-300 border border-purple-700/40">
                  <Wrench size={11} />
                  <span>Tools Supported</span>
                </span>
              )}
              {currentModelObj?.details?.parameter_size && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-blue-900/30 text-blue-300 border border-blue-700/40 font-mono">
                  <Cpu size={11} />
                  <span>{currentModelObj.details.parameter_size} params</span>
                </span>
              )}
              {currentModelObj?.size && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-(--color-bg-tertiary) text-(--color-text-secondary) border border-(--color-border) font-mono">
                  <HardDrive size={11} />
                  <span>{formatBytes(currentModelObj.size)}</span>
                </span>
              )}
              {currentModelObj?.details?.quantization_level && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-(--color-bg-tertiary) text-(--color-text-muted) border border-(--color-border) font-mono">
                  <Layers size={11} />
                  <span>{currentModelObj.details.quantization_level}</span>
                </span>
              )}
            </div>

            {/* Terminal Command Tip */}
            <div className="flex items-start gap-2 p-2.5 rounded bg-(--color-bg-primary) border border-(--color-border) text-[11px] text-(--color-text-muted) mt-1 font-mono">
              <Terminal size={13} className="text-purple-400 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5">
                <span className="text-(--color-text-secondary)">Pull recommended tool-capable models in your terminal:</span>
                <span className="text-purple-300 select-all font-semibold">ollama run nemotron-3-nano:4b</span>
                <span className="text-purple-300 select-all font-semibold">ollama pull qwen2.5-coder</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* B. Google GenAI Specific Settings */}
      {provider === "gemini" && (
        <div className="flex flex-col gap-3 p-4 rounded-lg bg-(--color-bg-secondary) border border-blue-900/30">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-blue-300">
                Google GenAI (Gemini) API Key
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 underline"
              >
                <span>Get free API key from Google AI Studio</span>
                <ExternalLink size={10} />
              </a>
            </div>

            <div className="relative flex items-center">
              <input
                type={showKeyPassword ? "text" : "password"}
                placeholder="AIzaSy..."
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                className="w-full bg-(--color-bg-primary) text-(--color-text-primary) px-3 py-1.5 pr-8 rounded border border-(--color-border) focus:outline-none focus:border-blue-500 font-mono text-xs"
              />
              <button
                type="button"
                onClick={() => setShowKeyPassword((prev) => !prev)}
                className="absolute right-2 text-(--color-text-muted) hover:text-(--color-text-primary) cursor-pointer"
                title={showKeyPassword ? "Hide API Key" : "Show API Key"}
              >
                {showKeyPassword ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
            <span className="text-[11px] text-(--color-text-muted)">
              Key is stored client-side in browser localStorage only. Never sent to any intermediate server.
            </span>
          </div>

          {/* Model Selection */}
          <div className="flex flex-col gap-1.5 pt-2 border-t border-(--color-border)">
            <label className="text-xs font-semibold text-(--color-text-primary)">Gemini Model</label>
            <select
              value={activeModel}
              onChange={(e) => setActiveModel(e.target.value)}
              className="w-full bg-(--color-bg-primary) text-(--color-text-primary) px-3 py-2 rounded border border-(--color-border) focus:outline-none focus:border-blue-500 font-mono text-xs cursor-pointer"
            >
              {availableModels.map((m) => {
                const val = m.id || m.model || m.name;
                const label = m.displayName || m.name || val;
                return (
                  <option key={val} value={val}>
                    {label} {m.supportsTools ? " (Tools ✓)" : ""}
                  </option>
                );
              })}
            </select>
            <span className="text-[11px] text-(--color-text-muted)">
              Supports multi-subagent task delegation, function calling, and cryptographic thought signatures.
            </span>
          </div>
        </div>
      )}

      {/* C. OpenAI Specific Settings */}
      {provider === "openai" && (
        <div className="flex flex-col gap-3 p-4 rounded-lg bg-(--color-bg-secondary) border border-emerald-900/30">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-emerald-300">OpenAI API Key</label>
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 underline"
              >
                <span>Get API key from OpenAI Platform</span>
                <ExternalLink size={10} />
              </a>
            </div>

            <div className="relative flex items-center">
              <input
                type={showKeyPassword ? "text" : "password"}
                placeholder="sk-..."
                value={openaiApiKey}
                onChange={(e) => setOpenaiApiKey(e.target.value)}
                className="w-full bg-(--color-bg-primary) text-(--color-text-primary) px-3 py-1.5 pr-8 rounded border border-(--color-border) focus:outline-none focus:border-emerald-500 font-mono text-xs"
              />
              <button
                type="button"
                onClick={() => setShowKeyPassword((prev) => !prev)}
                className="absolute right-2 text-(--color-text-muted) hover:text-(--color-text-primary) cursor-pointer"
                title={showKeyPassword ? "Hide API Key" : "Show API Key"}
              >
                {showKeyPassword ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
            <span className="text-[11px] text-(--color-text-muted)">
              Key is stored client-side in browser localStorage only.
            </span>
          </div>

          {/* Model Selection */}
          <div className="flex flex-col gap-1.5 pt-2 border-t border-(--color-border)">
            <label className="text-xs font-semibold text-(--color-text-primary)">OpenAI Model</label>
            <select
              value={activeModel}
              onChange={(e) => setActiveModel(e.target.value)}
              className="w-full bg-(--color-bg-primary) text-(--color-text-primary) px-3 py-2 rounded border border-(--color-border) focus:outline-none focus:border-emerald-500 font-mono text-xs cursor-pointer"
            >
              {availableModels.map((m) => {
                const val = m.id || m.model || m.name;
                const label = m.displayName || m.name || val;
                return (
                  <option key={val} value={val}>
                    {label} {m.supportsTools ? " (Tools ✓)" : ""}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      )}

      {/* D. Custom API Specific Settings */}
      {provider === "custom" && (
        <div className="flex flex-col gap-3 p-4 rounded-lg bg-(--color-bg-secondary) border border-(--color-border)">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-zinc-300">Custom Base URL</label>
            <input
              type="text"
              placeholder="http://localhost:8000/v1"
              value={customUrl}
              onChange={(e) => updateSetting("ai.customUrl", e.target.value)}
              className="w-full bg-(--color-bg-primary) text-(--color-text-primary) px-3 py-1.5 rounded border border-(--color-border) focus:outline-none focus:border-zinc-500 font-mono text-xs"
            />
            <span className="text-[11px] text-(--color-text-muted)">
              OpenAI-compatible /chat/completions base endpoint.
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-zinc-300">
              Custom API Key (Optional)
            </label>
            <input
              type="password"
              placeholder="Bearer token or API key"
              value={customApiKey}
              onChange={(e) => updateSetting("ai.customApiKey", e.target.value)}
              className="w-full bg-(--color-bg-primary) text-(--color-text-primary) px-3 py-1.5 rounded border border-(--color-border) focus:outline-none focus:border-zinc-500 font-mono text-xs"
            />
          </div>
        </div>
      )}

      {/* 4. Subagent Engine Architecture Info */}
      <div className="flex items-start gap-3 p-3.5 rounded-lg bg-purple-950/20 border border-purple-800/30 text-xs">
        <Zap size={16} className="text-purple-400 shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1 leading-relaxed">
          <span className="font-semibold text-purple-300">
            Multi-Subagent Engine with Context Quarantine
          </span>
          <p className="text-[11px] text-[#aaaaaa]">
            Livy UI uses a modular multi-agent supervisor architecture. Heavy database dumps and schema introspection runs inside quarantined subagent scopes (<code className="text-cyan-300">schema_analyst</code>, <code className="text-purple-300">sql_specialist</code>, <code className="text-amber-300">cluster_operator</code>).
            Only distilled 3-line summaries return to the supervisor, reducing token consumption by <strong>75%–85%</strong> per turn. Chat history payload is capped to the 8 most recent turns.
          </p>
        </div>
      </div>
    </div>
  );
}
