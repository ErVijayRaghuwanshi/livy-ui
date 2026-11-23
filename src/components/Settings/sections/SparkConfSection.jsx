import { useState } from "react";
import {
  Sliders,
  Sparkles,
  Plus,
  Trash2,
  Search,
  CheckCircle2,
} from "lucide-react";
import { COMMON_CONF_KEYS, SPARK_PRESETS } from "../../../utils/constants";

export default function SparkConfSection({
  sessionConf = {},
  setSessionConf,
  updateSetting,
}) {
  const [newSparkKey, setNewSparkKey] = useState("");
  const [newSparkValue, setNewSparkValue] = useState("");
  const [sparkConfFilter, setSparkConfFilter] = useState("");
  const [sparkActionMsg, setSparkActionMsg] = useState(null);

  const confEntries = Object.entries(sessionConf || {});
  const filteredConfEntries = confEntries.filter(([k, v]) => {
    if (!sparkConfFilter.trim()) return true;
    const q = sparkConfFilter.toLowerCase();
    return k.toLowerCase().includes(q) || String(v).toLowerCase().includes(q);
  });

  const handleApplyPreset = (preset) => {
    const next = { ...sessionConf, ...preset.conf };
    setSessionConf(next);
    Object.entries(preset.conf).forEach(([k, v]) => {
      if (k === "spark.master") updateSetting("spark.defaultMaster", v);
    });
    setSparkActionMsg(`Applied "${preset.name}" preset`);
    setTimeout(() => setSparkActionMsg(null), 3000);
  };

  const handleAddSparkProperty = (e) => {
    e?.preventDefault();
    const k = newSparkKey.trim();
    const v = newSparkValue.trim();
    if (!k) return;
    const next = { ...sessionConf, [k]: v };
    setSessionConf(next);
    if (k === "spark.master") updateSetting("spark.defaultMaster", v);
    setNewSparkKey("");
    setNewSparkValue("");
    setSparkActionMsg(`Added "${k}"`);
    setTimeout(() => setSparkActionMsg(null), 3000);
  };

  const handleUpdateSparkProperty = (k, v) => {
    const next = { ...sessionConf, [k]: v };
    setSessionConf(next);
    if (k === "spark.master") updateSetting("spark.defaultMaster", v);
  };

  const handleDeleteSparkProperty = (k) => {
    const next = { ...sessionConf };
    delete next[k];
    setSessionConf(next);
    setSparkActionMsg(`Removed "${k}"`);
    setTimeout(() => setSparkActionMsg(null), 3000);
  };

  const handleClearAllSparkConf = () => {
    setSessionConf({});
    setSparkActionMsg("Cleared all custom Spark configurations");
    setTimeout(() => setSparkActionMsg(null), 3000);
  };

  return (
    <div className="space-y-4 pt-1 max-w-3xl">
      {/* Top action status or preset feedback */}
      {sparkActionMsg && (
        <div className="flex items-center gap-2 p-2 px-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs animate-in fade-in">
          <CheckCircle2 size={13} className="shrink-0" />
          <span>{sparkActionMsg}</span>
        </div>
      )}

      {/* Quick Presets Bar */}
      <div className="p-3 rounded-lg border border-(--color-border) bg-(--color-bg-secondary) space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-(--color-text-primary)">
            <Sparkles size={14} className="text-(--color-accent)" />
            <span>Recommended Configuration Presets</span>
          </div>
          <span className="text-[11px] text-(--color-text-muted)">1-Click cluster optimization</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1">
          {SPARK_PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className="flex flex-col text-left p-2 rounded bg-(--color-bg-primary) hover:bg-(--color-bg-tertiary) border border-(--color-border) hover:border-(--color-accent) transition-all cursor-pointer group"
              title={preset.description}
            >
              <span className="text-xs font-semibold text-(--color-text-primary) group-hover:text-(--color-accent) transition-colors truncate">
                {preset.name}
              </span>
              <span className="text-[10px] text-(--color-text-muted) line-clamp-2 mt-0.5 leading-snug">
                {preset.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Properties Table / Card */}
      <div className="rounded-lg border border-(--color-border) bg-(--color-bg-secondary) overflow-hidden">
        {/* Table Header / Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 border-b border-(--color-border) bg-(--color-bg-tertiary)/50">
          <div className="flex items-center gap-2">
            <Sliders size={14} className="text-(--color-accent)" />
            <span className="text-xs font-semibold text-(--color-text-primary)">Active Spark Properties</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-(--color-accent)/15 text-(--color-accent) border border-(--color-accent)/30 font-semibold">
              {confEntries.length} {confEntries.length === 1 ? "property" : "properties"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {confEntries.length > 2 && (
              <div className="relative flex items-center">
                <Search size={11} className="absolute left-2 text-(--color-text-muted) pointer-events-none" />
                <input
                  type="text"
                  value={sparkConfFilter}
                  onChange={(e) => setSparkConfFilter(e.target.value)}
                  placeholder="Filter properties..."
                  className="pl-6 pr-2 py-1 text-[11px] rounded bg-(--color-bg-primary) border border-(--color-border) text-(--color-text-primary) focus:outline-none focus:border-(--color-accent) w-36 sm:w-44 font-mono placeholder:font-sans"
                />
              </div>
            )}
            {confEntries.length > 0 && (
              <button
                type="button"
                onClick={handleClearAllSparkConf}
                className="flex items-center gap-1 px-2 py-1 text-[11px] rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors cursor-pointer"
                title="Remove all custom Spark configurations"
              >
                <Trash2 size={11} />
                <span>Clear All</span>
              </button>
            )}
          </div>
        </div>

        {/* Properties List / Rows */}
        {confEntries.length === 0 ? (
          <div className="p-6 text-center text-(--color-text-muted) space-y-1.5">
            <p className="text-xs font-medium text-(--color-text-secondary)">No custom Spark properties configured.</p>
            <p className="text-[11px] text-(--color-text-muted)">
              New compute sessions will launch using default cluster configurations. Select a preset above or add custom properties below.
            </p>
          </div>
        ) : filteredConfEntries.length === 0 ? (
          <div className="p-4 text-center text-xs text-(--color-text-muted)">
            No properties match &quot;{sparkConfFilter}&quot;
          </div>
        ) : (
          <div className="divide-y divide-(--color-border)">
            {filteredConfEntries.map(([k, v]) => (
              <div
                key={k}
                className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 p-2.5 px-3 hover:bg-(--color-bg-tertiary)/50 transition-colors group"
              >
                <div className="min-w-0 flex-1 sm:max-w-[45%]">
                  <div className="font-mono text-xs font-semibold text-(--color-text-primary) truncate" title={k}>
                    {k}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
                  <input
                    type="text"
                    value={v}
                    onChange={(e) => handleUpdateSparkProperty(k, e.target.value)}
                    className="w-full max-w-[240px] px-2.5 py-1 text-xs rounded bg-(--color-bg-primary) border border-(--color-border) text-(--color-text-primary) font-mono focus:outline-none focus:border-(--color-accent)"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteSparkProperty(k)}
                    className="p-1 text-(--color-text-muted) hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors cursor-pointer shrink-0"
                    title={`Delete ${k}`}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Custom Spark Property Form */}
      <div className="p-3.5 rounded-lg border border-(--color-border) bg-(--color-bg-secondary) space-y-2">
        <h5 className="text-xs font-semibold text-(--color-text-primary) flex items-center gap-1.5">
          <Plus size={13} className="text-(--color-accent)" /> Add Spark Property
        </h5>
        <form onSubmit={handleAddSparkProperty} className="space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            <div className="sm:col-span-3">
              <input
                type="text"
                list="common-spark-keys"
                value={newSparkKey}
                onChange={(e) => setNewSparkKey(e.target.value)}
                placeholder="Property Key (e.g. spark.sql.shuffle.partitions)"
                className="w-full px-3 py-1.5 text-xs rounded bg-(--color-bg-primary) border border-(--color-border) text-(--color-text-primary) focus:outline-none focus:border-(--color-accent) font-mono placeholder:font-sans placeholder:text-(--color-text-muted)"
              />
              <datalist id="common-spark-keys">
                {COMMON_CONF_KEYS.map((ck) => (
                  <option key={ck} value={ck} />
                ))}
              </datalist>
            </div>

            <div className="sm:col-span-2 flex items-center gap-2">
              <input
                type="text"
                value={newSparkValue}
                onChange={(e) => setNewSparkValue(e.target.value)}
                placeholder="Value (e.g. 16 or 4g)"
                className="flex-1 px-3 py-1.5 text-xs rounded bg-(--color-bg-primary) border border-(--color-border) text-(--color-text-primary) focus:outline-none focus:border-(--color-accent) font-mono placeholder:font-sans placeholder:text-(--color-text-muted)"
              />
              <button
                type="submit"
                disabled={!newSparkKey.trim()}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded bg-(--color-accent) text-white hover:bg-(--color-accent-hover) disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0"
              >
                <Plus size={13} />
                <span>Add</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
