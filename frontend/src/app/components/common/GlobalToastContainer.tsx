import { useEffect, useState } from 'react';
import { toastManager, ToastContainer, ToastProps } from './Toast';

export function GlobalToastContainer() {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  useEffect(() => {
    return toastManager.subscribe(setToasts);
  }, []);

  return <ToastContainer toasts={toasts} />;
}