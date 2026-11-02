import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

const ToastCtx = createContext(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({ message: "", icon: "check_circle" });
  const [visible, setVisible] = useState(false);
  const timer = useRef(null);

  const notify = useCallback((message, icon = "check_circle") => {
    clearTimeout(timer.current);
    setToast({ message, icon });
    setVisible(true);
    timer.current = setTimeout(() => setVisible(false), 3200);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <ToastCtx.Provider value={notify}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className={`fixed bottom-6 right-6 z-[60] flex max-w-[90vw] items-center gap-2 rounded-xl bg-inverse-surface px-space-md py-3 text-inverse-on-surface shadow-xl transition-all duration-300 ${
          visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-20 opacity-0"
        }`}
      >
        <span className={`material-symbols-outlined text-[20px] ${toast.icon === "error" || toast.icon === "warning" ? "text-error-container" : "text-primary-container"}`}>
          {toast.icon}
        </span>
        <span className="font-label-md text-label-md">{toast.message}</span>
      </div>
    </ToastCtx.Provider>
  );
}
