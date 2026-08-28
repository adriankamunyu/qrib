import { useCallback, useState } from "react";
import { ToastContext } from "./ToastContextValue";

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "info") => {
    const id = Date.now() + Math.random();

    setToasts((currentToasts) => [
      ...currentToasts,
      { id, message, type },
    ]);

    setTimeout(() => {
      setToasts((currentToasts) =>
        currentToasts.filter((toast) => toast.id !== id)
      );
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div className="fixed right-5 top-5 z-[100] flex w-[320px] flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-lg border px-4 py-3 text-sm font-semibold shadow-lg animate-[fadeIn_0.2s_ease-out] ${
              toast.type === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : toast.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-slate-700 bg-slate-800 text-white"
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}