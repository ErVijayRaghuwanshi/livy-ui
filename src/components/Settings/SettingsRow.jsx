import { RotateCcw, Code } from "lucide-react";

export default function SettingsRow({
  def,
  currentValue,
  modified,
  onReset,
  onOpenJson,
  onChange,
  children,
}) {
  const isComplexManager = [
    "sparkConfManager",
    "sessionManager",
    "hostManager",
    "dorisManager",
    "aiManager",
    "pwaManager",
  ].includes(def.type);

  return (
    <div
      className={`group relative pl-3.5 pr-2 transition-all space-y-2 border-l-2 ${
        modified
          ? "border-l-(--color-accent)"
          : "border-l-transparent hover:border-l-(--color-border)"
      }`}
    >
      {/* Setting Title Line */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center flex-wrap gap-1.5 text-xs">
          <span className="text-(--color-text-muted) font-medium">{def.categoryLabel}:</span>
          <span className="text-(--color-text-primary) font-semibold">{def.title}</span>
          {modified && (
            <span className="text-[10px] text-(--color-accent) bg-(--color-accent)/10 px-1.5 py-0.2 rounded border border-(--color-accent)/30 font-medium">
              Modified
            </span>
          )}
        </div>

        {/* Right Controls: inline reset + edit in JSON */}
        <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
          {modified && onReset && (
            <button
              onClick={() => onReset(def.key)}
              className="flex items-center gap-1 text-[11px] text-(--color-text-muted) hover:text-(--color-accent) transition-colors cursor-pointer"
              title="Reset this setting to default value"
            >
              <RotateCcw size={11} />
              <span>Reset</span>
            </button>
          )}
          {!isComplexManager && onOpenJson && (
            <button
              onClick={onOpenJson}
              className="flex items-center gap-1 text-[11px] text-(--color-text-muted) hover:text-(--color-text-primary) transition-colors cursor-pointer"
              title={`Edit ${def.key} in settings.json`}
            >
              <Code size={11} />
              <span>settings.json</span>
            </button>
          )}
        </div>
      </div>

      {/* Setting Description */}
      {def.description && (
        <p className="text-xs text-(--color-text-secondary) leading-relaxed max-w-2xl">
          {def.description}
        </p>
      )}

      {/* Setting Input Control */}
      <div className="pt-1">
        {def.type === "select" && (
          <select
            value={currentValue ?? ""}
            onChange={(e) => {
              const val =
                typeof def.options?.[0]?.value === "number"
                  ? parseInt(e.target.value, 10)
                  : e.target.value;
              onChange(val);
            }}
            className="px-3 py-1.5 text-xs rounded-md bg-(--color-bg-tertiary) border border-(--color-border) text-(--color-text-primary) focus:outline-none focus:border-(--color-accent) cursor-pointer"
          >
            {def.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}

        {def.type === "number" && (
          <input
            type="number"
            min={def.min}
            max={def.max}
            value={currentValue ?? def.min ?? 0}
            onChange={(e) => onChange(parseInt(e.target.value, 10) || def.min || 0)}
            className="w-28 px-3 py-1.5 text-xs rounded-md bg-(--color-bg-tertiary) border border-(--color-border) text-(--color-text-primary) focus:outline-none focus:border-(--color-accent)"
          />
        )}

        {(def.type === "text" || def.type === "password") && (
          <input
            type={def.type === "password" ? "password" : "text"}
            value={currentValue ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full max-w-md px-3 py-1.5 text-xs rounded-md bg-(--color-bg-tertiary) border border-(--color-border) text-(--color-text-primary) focus:outline-none focus:border-(--color-accent) font-mono"
          />
        )}

        {def.type === "boolean" && (
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={Boolean(currentValue)}
              onChange={(e) => onChange(e.target.checked)}
              className="w-4 h-4 rounded border-(--color-border) bg-(--color-bg-tertiary) text-(--color-accent) focus:ring-0 cursor-pointer accent-(--color-accent)"
            />
            <span className="text-xs text-(--color-text-primary)">
              {currentValue ? "Enabled" : "Disabled"}
            </span>
          </label>
        )}

        {/* Custom Complex Manager Children */}
        {children}
      </div>
    </div>
  );
}
