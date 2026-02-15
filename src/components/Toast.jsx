import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { CheckCircle2, AlertCircle, Ban, X } from "lucide-react";

const ToastContext = createContext(null);

const MAX_TOASTS = 3;
const AUTO_DISMISS_MS = 5000;

const TOAST_CONFIG = {
  ok: { icon: CheckCircle2, color: "text-(--color-success)", bg: "bg-(--color-success)/10 border-(--color-success)/30", label: "Query completed" },
  error: { icon: AlertCircle, color: "text-(--color-error)", bg: "bg-(--color-error)/10 border-(--color-error)/30", label: "Query failed" },
  cancelled: { icon: Ban, color: "text-(--color-text-muted)", bg: "bg-(--color-bg-tertiary) border-(--color-border)", label: "Query cancelled" },
};

let toastId = 0;

function Toast({ toast, onDismiss }) {
  const [exiting, setExiting] = useState(false);
  const config = TOAST_CONFIG[toast.type] || TOAST_CONFIG.ok;
  const Icon = config.icon;

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onDismiss(toast.id), 300);
    }, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const handleDismiss = () => {
    setExiting(true);
    setTimeout(() => onDismiss(toast.id), 300);
  };

  return (
    <div
      className={`toast-item ${exiting ? "toast-exit" : "toast-enter"} flex items-start gap-2 px-3 py-2.5 rounded-lg border shadow-lg backdrop-blur-sm min-w-70 max-w-90 cursor-pointer ${config.bg}`}
      onClick={handleDismiss}
    >
      <Icon size={16} className={`shrink-0 mt-0.5 ${config.color}`} />
      <div className="flex-1 min-w-0">
        <div className={`text-xs font-medium ${config.color}`}>{config.label}</div>
        {toast.message && (
          <div className="text-[11px] text-(--color-text-secondary) mt-0.5 truncate">
            {toast.message}
          </div>
        )}
        {toast.elapsed && (
          <div className="text-[10px] text-(--color-text-muted) mt-0.5">
            {toast.elapsed}
          </div>
        )}
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); handleDismiss(); }}
        className="shrink-0 text-(--color-text-muted) hover:text-(--color-text-primary) mt-0.5"
      >
        <X size={12} />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onDismiss={removeToast} />
      ))}
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, message, elapsed) => {
    const id = ++toastId;
    setToasts((prev) => {
      const next = [...prev, { id, type, message, elapsed }];
      // Keep only the latest MAX_TOASTS
      return next.length > MAX_TOASTS ? next.slice(-MAX_TOASTS) : next;
    });
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
