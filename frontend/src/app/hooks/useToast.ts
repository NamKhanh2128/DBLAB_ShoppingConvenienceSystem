import { useState, useCallback } from 'react';
import { ToastProps, ToastType } from '../components/common/Toast';

let toastCounter = 0;

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = useCallback((
    type: ToastType,
    message: string,
    description?: string,
    duration?: number
  ) => {
    const id = `toast-${++toastCounter}`;
    const newToast: ToastProps = {
      id,
      type,
      message,
      description,
      duration,
      onClose: (toastId) => {
        setToasts((prev) => prev.filter((t) => t.id !== toastId));
      },
    };

    setToasts((prev) => [...prev, newToast]);
    return id;
  }, []);

  const success = useCallback(
    (message: string, description?: string) => addToast('success', message, description),
    [addToast]
  );

  const error = useCallback(
    (message: string, description?: string) => addToast('error', message, description),
    [addToast]
  );

  const warning = useCallback(
    (message: string, description?: string) => addToast('warning', message, description),
    [addToast]
  );

  const info = useCallback(
    (message: string, description?: string) => addToast('info', message, description),
    [addToast]
  );

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    toast: addToast,
    success,
    error,
    warning,
    info,
    dismiss,
    dismissAll,
  };
}
