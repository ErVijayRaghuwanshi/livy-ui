import SettingsView from "./SettingsView";

export default function SettingsTab({
  theme,
  toggleTheme,
  setShowConnectionModal,
  onOpenAsModal,
  initialCategory = "commonlyUsed",
}) {
  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-(--color-bg-workbench)">
      <SettingsView
        isModal={false}
        onOpenAsModal={onOpenAsModal}
        theme={theme}
        toggleTheme={toggleTheme}
        setShowConnectionModal={setShowConnectionModal}
        initialCategory={initialCategory}
      />
    </div>
  );
}
