"use client";

import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  duration?: number;
  onClose: () => void;
}

export default function Toast({ message, type = "info", duration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [duration, onClose]);

  return (
    <div className={`toast toast-${type === "error" ? "error" : "success"}`}>
      {message}
    </div>
  );
}

export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type });
  };

  const hideToast = () => setToast(null);

  return { toast, showToast, hideToast };
}
