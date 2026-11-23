import { Download, CheckCircle2 } from "lucide-react";

export default function PwaManagerSection({
  isStandalone,
  canInstall,
  installApp,
}) {
  return (
    <div className="pt-1 max-w-2xl space-y-3">
      <div className="p-4 rounded-xl border border-(--color-border) bg-(--color-bg-secondary) space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-lg shrink-0 ${
                isStandalone
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
              }`}
            >
              <Download size={20} />
            </div>
            <div>
              <div className="text-xs font-semibold text-(--color-text-primary)">
                {isStandalone
                  ? "Desktop App Active (Standalone Mode)"
                  : canInstall
                  ? "Desktop App Ready to Install"
                  : "Progressive Web App (PWA)"}
              </div>
              <div className="text-[11px] text-(--color-text-muted) mt-0.5">
                {isStandalone
                  ? "Livy UI is installed and running as an independent desktop window."
                  : canInstall
                  ? "Install Livy UI to your macOS Dock or Windows Start Menu for a dedicated distraction-free workspace."
                  : "Static assets, offline SQL editing, and worker scripts are cached for offline resilience."}
              </div>
            </div>
          </div>

          {canInstall && !isStandalone && (
            <button
              onClick={installApp}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-(--color-accent) hover:bg-(--color-accent-hover) text-white transition-colors cursor-pointer shadow-sm shrink-0"
            >
              <Download size={13} />
              <span>Install App</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-(--color-border) text-[11px]">
          <div className="p-2.5 rounded bg-(--color-bg-primary) border border-(--color-border)">
            <span className="text-(--color-text-muted) block">App Environment:</span>
            <span className="text-(--color-text-primary) font-medium mt-0.5 block">
              {isStandalone ? "Standalone Desktop" : "Web Browser"}
            </span>
          </div>
          <div className="p-2.5 rounded bg-(--color-bg-primary) border border-(--color-border)">
            <span className="text-(--color-text-muted) block">Offline Support:</span>
            <span className="text-emerald-400 font-medium mt-0.5 block">
              ServiceWorker Active
            </span>
          </div>
          <div className="p-2.5 rounded bg-(--color-bg-primary) border border-(--color-border)">
            <span className="text-(--color-text-muted) block">Theme Color:</span>
            <span className="text-(--color-text-primary) font-medium mt-0.5 block">
              #0f172a (Synchronized)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
