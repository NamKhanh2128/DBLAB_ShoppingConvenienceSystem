import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  description?: string;
  duration?: number;
  onClose: (id: string) => void;
}

// Toast Manager - Global singleton
class ToastManager {
  private listeners: Set<(toasts: ToastProps[]) => void> = new Set();
  private toasts: ToastProps[] = [];

  subscribe(listener: (toasts: ToastProps[]) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach((listener) => listener([...this.toasts]));
  }

  add(type: ToastType, message: string, description?: string, duration?: number) {
    const id = Math.random().toString(36).substring(7);
    const toast: ToastProps = {
      id,
      type,
      message,
      description,
      duration,
      onClose: (id) => this.remove(id),
    };
    this.toasts.push(toast);
    this.notify();
    return id;
  }

  remove(id: string) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.notify();
  }

  success(message: string, description?: string) {
    return this.add('success', message, description);
  }

  error(message: string, description?: string) {
    return this.add('error', message, description);
  }

  warning(message: string, description?: string) {
    return this.add('warning', message, description);
  }

  info(message: string, description?: string) {
    return this.add('info', message, description);
  }
}

export const toastManager = new ToastManager();

// Export helper functions
export const toast = {
  success: (message: string, description?: string) => toastManager.success(message, description),
  error: (message: string, description?: string) => toastManager.error(message, description),
  warning: (message: string, description?: string) => toastManager.warning(message, description),
  info: (message: string, description?: string) => toastManager.info(message, description),
};

const toastIcons = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const toastStyles = {
  success: {
    bg: 'bg-white',
    border: 'border-l-4 border-[var(--success)]',
    icon: 'text-[var(--success)]',
  },
  error: {
    bg: 'bg-white',
    border: 'border-l-4 border-[var(--danger)]',
    icon: 'text-[var(--danger)]',
  },
  warning: {
    bg: 'bg-white',
    border: 'border-l-4 border-[var(--warning)]',
    icon: 'text-[var(--warning)]',
  },
  info: {
    bg: 'bg-white',
    border: 'border-l-4 border-[var(--info)]',
    icon: 'text-[var(--info)]',
  },
};

export function Toast({ id, type, message, description, duration = 5000, onClose }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);
  const Icon = toastIcons[type];
  const styles = toastStyles[type];

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  };

  return (
    <div
      className={`
        ${styles.bg} ${styles.border}
        rounded-[var(--radius-sm)] p-4 mb-3
        shadow-[var(--shadow-card)]
        flex items-start gap-3
        transition-all duration-300
        ${isExiting ? 'opacity-0 translate-x-full' : 'animate-slide-in-right'}
        hover-lift-sm
        min-w-[320px] max-w-[420px]
      `}
    >
      <Icon className={`${styles.icon} flex-shrink-0`} size={20} />
      
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[var(--text-dark)] text-sm">
          {message}
        </p>
        {description && (
          <p className="text-[var(--text-muted)] text-xs mt-1">
            {description}
          </p>
        )}
      </div>

      <button
        onClick={handleClose}
        className="flex-shrink-0 text-[var(--text-muted)] hover:text-[var(--text-dark)] transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export function ToastContainer({ toasts }: { toasts: ToastProps[] }) {
  return (
    <div className="fixed top-6 right-6 z-[9999] flex flex-col items-end">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>
  );
}