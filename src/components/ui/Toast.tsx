"use client";

import { useState, useEffect } from "react";
import { Check, X, AlertCircle, Info } from "lucide-react";

export type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onClose: (id: string) => void;
}

function ToastItem({ toast, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, toast.duration || 3000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onClose]);

  const icons = {
    success: <Check className="w-5 h-5 text-green-600" />,
    error: <X className="w-5 h-5 text-red-600" />,
    info: <Info className="w-5 h-5 text-blue-600" />,
  };

  const bgColors = {
    success: "bg-green-50 border-green-200",
    error: "bg-red-50 border-red-200",
    info: "bg-blue-50 border-blue-200",
  };

  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-lg border ${bgColors[toast.type]} shadow-lg min-w-[300px] max-w-md`}
    >
      {icons[toast.type]}
      <p className="flex-1 text-sm font-medium text-gray-900">{toast.message}</p>
      <button
        onClick={() => onClose(toast.id)}
        className="text-gray-400 hover:text-gray-600 transition-colors"
        style={{ cursor: 'pointer' }}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (type: ToastType, message: string, duration?: number) => {
    const id = Date.now().toString();
    const newToast: Toast = { id, type, message, duration };
    setToasts(prev => [...prev, newToast]);
    return id;
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // 全局方法，供其他组件调用
  useEffect(() => {
    (window as any).toast = {
      success: (message: string, duration?: number) => addToast('success', message, duration),
      error: (message: string, duration?: number) => addToast('error', message, duration),
      info: (message: string, duration?: number) => addToast('info', message, duration),
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onClose={removeToast} />
      ))}
    </div>
  );
}
