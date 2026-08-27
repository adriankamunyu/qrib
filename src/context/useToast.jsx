import { useContext } from "react";
import { ToastContext } from "./ToastContextValue";

export function useToast() {
  const ctx = useContext(ToastContext);

  if (!ctx) {
    throw new Error("useToast must be used inside a ToastProvider");
  }

  return ctx;
}
