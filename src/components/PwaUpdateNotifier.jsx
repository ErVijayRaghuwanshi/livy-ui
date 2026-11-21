import { useEffect, useState, useRef } from "react";
import { RefreshCw, DownloadCloud, X } from "lucide-react";
import { registerSW } from "virtual:pwa-register";

export default function PwaUpdateNotifier() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const updateSWRef = useRef(null);

  useEffect(() => {
    try {
      updateSWRef.current = registerSW({
        onNeedRefresh() {
          setNeedRefresh(true);
        },
        onOfflineReady() {
          setOfflineReady(true);
          setTimeout(() => setOfflineReady(false), 4000);
        },
      });
    } catch (err) {
      console.warn("[PWA] Service worker registration error:", err);
    }
  }, []);

  const handleUpdate = () => {
    if (typeof updateSWRef.current === "function") {
      updateSWRef.current(true);
    } else {
      window.location.reload();
    }
  };

  if (!needRefresh && !offlineReady) return null;

  return (
    <div className="fixed bottom-8 right-6 z-50 flex flex-col gap-2 pointer-events-auto">
      {needRefresh && (
        <div className="flex items-start gap-3 p-3.5 bg-slate-900/95 border border-blue-500/30 rounded-xl shadow-2xl backdrop-blur-md max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 shrink-0">
            <RefreshCw size={18} className="animate-spin" style={{ animationDuration: "3s" }} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-semibold text-white">Update Available</h4>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
              A newer version of Livy UI is ready. Reload to apply updates.
            </p>
            <div className="flex items-center gap-2 mt-2.5">
              <button
                onClick={handleUpdate}
                className="px-2.5 py-1 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-md shadow-sm transition-colors cursor-pointer"
              >
                Reload & Update
              </button>
              <button
                onClick={() => setNeedRefresh(false)}
                className="px-2 py-1 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                Later
              </button>
            </div>
          </div>
          <button
            onClick={() => setNeedRefresh(false)}
            className="text-slate-400 hover:text-white p-0.5 transition-colors cursor-pointer"
            title="Dismiss"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {offlineReady && !needRefresh && (
        <div className="flex items-center gap-2.5 px-3 py-2 bg-emerald-950/90 border border-emerald-500/30 text-emerald-300 text-xs rounded-lg shadow-xl backdrop-blur-md animate-in fade-in duration-300">
          <DownloadCloud size={16} className="text-emerald-400 shrink-0" />
          <span>Livy UI is ready to work offline</span>
        </div>
      )}
    </div>
  );
}
