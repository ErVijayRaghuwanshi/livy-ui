import SettingsView from "./SettingsView";

export default function SettingsTab({
  theme,
  toggleTheme,
  setShowConnectionModal,
  onOpenAsModal,
}) {
  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-[#181818]">
      <SettingsView
        isModal={false}
        onOpenAsModal={onOpenAsModal}
        theme={theme}
        toggleTheme={toggleTheme}
        setShowConnectionModal={setShowConnectionModal}
      />
    </div>
  );
}
