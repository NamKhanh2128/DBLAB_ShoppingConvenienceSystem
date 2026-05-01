import { X, AlertTriangle } from 'lucide-react';
import { ReactNode } from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

const typeStyles = {
  danger: {
    icon: 'text-[var(--danger)]',
    bg: 'bg-[var(--danger-light)]',
    button: 'bg-[var(--danger)] hover:bg-[#C0392B]',
  },
  warning: {
    icon: 'text-[var(--warning)]',
    bg: 'bg-[var(--warning-light)]',
    button: 'bg-[var(--warning)] hover:bg-[#D97706]',
  },
  info: {
    icon: 'text-[var(--info)]',
    bg: 'bg-[var(--info-light)]',
    button: 'bg-[var(--info)] hover:bg-[#2563EB]',
  },
};

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  type = 'warning',
  isLoading = false,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const styles = typeStyles[type];

  const handleConfirm = () => {
    onConfirm();
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9997] animate-fade-in"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
        <div
          className="bg-white rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] w-full max-w-md animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-6 pb-4">
            <div className="flex items-start gap-4">
              <div className={`${styles.bg} p-3 rounded-full`}>
                <AlertTriangle className={styles.icon} size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--text-dark)]">
                  {title}
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="text-[var(--text-muted)] hover:text-[var(--text-dark)] transition-colors disabled:opacity-50"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 pb-6">
            <div className="text-[var(--text-muted)] text-sm leading-relaxed ml-16">
              {message}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-[var(--card-bg)] rounded-b-[var(--radius-lg)]">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-2.5 rounded-[var(--radius-btn)] font-semibold text-[var(--text-dark)] hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className={`
                px-6 py-2.5 rounded-[var(--radius-btn)] font-semibold text-white
                ${styles.button}
                shadow-[var(--shadow-btn)] hover-lift
                transition-all disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center gap-2
              `}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default ConfirmDialog;