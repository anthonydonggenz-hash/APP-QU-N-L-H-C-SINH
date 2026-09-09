import React, { useEffect } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";

export interface ToastState {
  message: string;
  type: "success" | "error" | "warning" | "info";
  isVisible: boolean;
}

export interface ToastProps {
  toast?: ToastState;
  message?: string;
  type?: "success" | "error" | "warning" | "info";
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, message, type = "success", onClose }) => {
  const activeMessage = toast ? toast.message : message;
  const activeType = toast ? toast.type : type;
  const isVisible = toast ? toast.isVisible : Boolean(message);

  useEffect(() => {
    if (!isVisible) return;
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [isVisible, onClose]);

  if (!isVisible || !activeMessage) return null;

  const styleConfig = {
    success: {
      bg: "bg-emerald-600 text-white shadow-emerald-900/20",
      icon: <CheckCircle2 className="w-5 h-5 flex-shrink-0" />,
    },
    error: {
      bg: "bg-rose-600 text-white shadow-rose-900/20",
      icon: <XCircle className="w-5 h-5 flex-shrink-0" />,
    },
    warning: {
      bg: "bg-amber-500 text-white shadow-amber-900/20",
      icon: <AlertTriangle className="w-5 h-5 flex-shrink-0" />,
    },
    info: {
      bg: "bg-indigo-600 text-white shadow-indigo-900/20",
      icon: <Info className="w-5 h-5 flex-shrink-0" />,
    },
  };

  const current = styleConfig[activeType] || styleConfig.success;

  return (
    <div
      id="app-toast"
      className={`fixed bottom-5 right-5 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl z-50 transition-all duration-200 ${current.bg}`}
      role="alert"
    >
      {current.icon}
      <span className="text-sm font-medium pr-2">{activeMessage}</span>
      <button
        id="toast-close-btn"
        onClick={onClose}
        className="text-white/80 hover:text-white p-1 rounded-lg transition"
        aria-label="Đóng thông báo"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

