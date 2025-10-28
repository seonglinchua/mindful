"use client";

import * as React from "react";
import { X } from "lucide-react";

export type ToastVariant = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  showToast: (message: string, variant?: ToastVariant, duration?: number) => void;
  showConfirm: (message: string, onConfirm: () => void, onCancel?: () => void) => void;
  removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const [confirmState, setConfirmState] = React.useState<{
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
  } | null>(null);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = React.useCallback(
    (message: string, variant: ToastVariant = "info", duration: number = 5000) => {
      const id = Math.random().toString(36).substring(2, 9);
      const toast: Toast = { id, message, variant, duration };

      setToasts((prev) => [...prev, toast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  // Register global toast handler
  React.useEffect(() => {
    setGlobalToastHandler(showToast);
    return () => {
      setGlobalToastHandler(() => {});
    };
  }, [showToast]);

  const showConfirm = React.useCallback(
    (message: string, onConfirm: () => void, onCancel?: () => void) => {
      setConfirmState({
        message,
        onConfirm,
        onCancel: onCancel || (() => {}),
      });
    },
    []
  );

  const handleConfirm = () => {
    if (confirmState) {
      confirmState.onConfirm();
      setConfirmState(null);
    }
  };

  const handleCancel = () => {
    if (confirmState) {
      confirmState.onCancel();
      setConfirmState(null);
    }
  };

  return (
    <ToastContext.Provider value={{ toasts, showToast, showConfirm, removeToast }}>
      {children}

      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>

      {/* Confirm Dialog */}
      {confirmState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Confirm Action
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              {confirmState.message}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const variantStyles = {
    success: "bg-green-600 text-white",
    error: "bg-red-600 text-white",
    info: "bg-blue-600 text-white",
    warning: "bg-yellow-600 text-white",
  };

  return (
    <div
      className={`${variantStyles[toast.variant]} px-4 py-3 rounded-lg shadow-lg flex items-center justify-between gap-3 animate-in slide-in-from-right duration-300`}
    >
      <p className="text-sm font-medium flex-1">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="hover:opacity-80 transition-opacity"
        aria-label="Close notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

// Global toast manager for use outside of React components
let globalToastHandler: ((message: string, variant?: ToastVariant, duration?: number) => void) | null = null;

export function setGlobalToastHandler(handler: (message: string, variant?: ToastVariant, duration?: number) => void) {
  globalToastHandler = handler;
}

export function showGlobalToast(message: string, variant: ToastVariant = "info", duration: number = 5000) {
  if (globalToastHandler) {
    globalToastHandler(message, variant, duration);
  } else {
    console.warn("Global toast handler not initialized. Message:", message);
  }
}
