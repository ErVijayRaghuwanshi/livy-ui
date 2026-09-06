import { useState, useEffect, useRef } from "react";
import SettingsView from "./SettingsView";

export default function SettingsModal({
  isOpen,
  onClose,
  onOpenAsTab,
  theme,
  toggleTheme,
  setShowConnectionModal,
}) {
  const [isMaximized, setIsMaximized] = useState(false);
  const modalContainerRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape" || e.code === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-2 sm:p-4 md:p-6 animate-in fade-in duration-150"
      onClick={(e) => {
        if (modalContainerRef.current && !modalContainerRef.current.contains(e.target)) {
          onClose();
        }
      }}
    >
      <div
        ref={modalContainerRef}
        className={`flex flex-col bg-[#181818] text-[#cccccc] shadow-2xl overflow-hidden transition-all duration-200 ${
          isMaximized
            ? "w-full h-full rounded-none border-none"
            : "w-[90vw] max-w-[1120px] h-[82vh] max-h-[850px] rounded-xl border border-[#2b2b2b]"
        }`}
      >
        <SettingsView
          isModal={true}
          isMaximized={isMaximized}
          onToggleMaximize={() => setIsMaximized((m) => !m)}
          onClose={onClose}
          onOpenAsTab={onOpenAsTab}
          theme={theme}
          toggleTheme={toggleTheme}
          setShowConnectionModal={setShowConnectionModal}
        />
      </div>
    </div>
  );
}
