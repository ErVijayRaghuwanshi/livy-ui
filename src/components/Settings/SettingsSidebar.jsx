import { ChevronRight, Sparkles } from "lucide-react";

export default function SettingsSidebar({
  categories,
  activeCategory,
  onSelectCategory,
  categoryCounts = {},
  isSearching = false,
  showModifiedOnly = false,
}) {
  return (
    <>
      {/* Mobile horizontal category strip (< 640px) */}
      <div className="flex sm:hidden items-center gap-1.5 px-3 py-2 border-b border-(--color-border) bg-(--color-bg-secondary) overflow-x-auto no-scrollbar shrink-0 select-none">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id && !isSearching && !showModifiedOnly;
          const isCommon = cat.id === "commonlyUsed";
          const Icon = cat.icon;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md transition-colors shrink-0 whitespace-nowrap cursor-pointer ${
                isActive
                  ? "bg-(--color-accent)/15 text-(--color-accent) border border-(--color-accent)/40 font-medium"
                  : "bg-(--color-bg-primary)/60 text-(--color-text-secondary) border border-transparent"
              }`}
            >
              {isCommon ? (
                <Sparkles size={12} className="text-(--color-accent) shrink-0" />
              ) : (
                Icon && <Icon size={12} className="shrink-0" />
              )}
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Desktop/Tablet vertical sidebar (>= 640px) */}
      <div className="w-56 shrink-0 border-r border-(--color-border) bg-(--color-bg-secondary) py-2 overflow-y-auto hidden sm:block select-none">
      <div className="px-3 py-1 text-[11px] font-semibold text-(--color-text-muted) tracking-wider uppercase">
        Preferences
      </div>
      <div className="space-y-0.5 px-1.5 mt-1">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id && !isSearching && !showModifiedOnly;
          const isCommon = cat.id === "commonlyUsed";
          const count = categoryCounts[cat.id];
          const Icon = cat.icon;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center justify-between w-full px-2.5 py-1.5 text-xs rounded-md transition-colors text-left cursor-pointer group ${
                isActive
                  ? "bg-(--color-bg-tertiary) text-(--color-text-primary) font-medium shadow-2xs"
                  : "text-(--color-text-secondary) hover:bg-(--color-bg-tertiary)/60 hover:text-(--color-text-primary)"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                {!isCommon ? (
                  <ChevronRight
                    size={12}
                    className={`shrink-0 transition-transform duration-150 ${
                      isActive
                        ? "rotate-90 text-(--color-accent)"
                        : "text-(--color-text-muted) group-hover:text-(--color-text-primary)"
                    }`}
                  />
                ) : (
                  <Sparkles size={13} className="text-(--color-accent) shrink-0" />
                )}
                {Icon && !isCommon && (
                  <Icon size={13} className="text-(--color-text-muted) group-hover:text-(--color-text-primary) shrink-0" />
                )}
                <span className="truncate">{cat.label}</span>
              </div>

              {count !== undefined && count > 0 && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full transition-colors shrink-0 ${
                    isActive
                      ? "bg-(--color-accent)/20 text-(--color-accent) font-semibold"
                      : "text-(--color-text-muted) group-hover:text-(--color-text-secondary)"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
    </>
  );
}
