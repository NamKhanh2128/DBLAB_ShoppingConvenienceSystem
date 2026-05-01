import { ReactNode, useEffect, useState, useRef, useId } from "react";
import { createPortal } from "react-dom"; // 🔥 THÊM IMPORT NÀY
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  footer?: ReactNode;
  showCloseButton?: boolean;
  icon?: ReactNode;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  footer,
  showCloseButton = true,
  icon,
}: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  // Đảm bảo Portal chỉ chạy trên Client-side (tránh lỗi nếu dùng SSR/Next.js)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Focus management: trap focus inside modal when opened
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      modalRef.current?.focus();
    }
    return () => {
      previousActiveElement.current?.focus();
    };
  }, [isOpen]);

  // 🔒 Lock scroll body
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // ⌨️ ESC để đóng
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const sizeMap: Record<string, string> = {
    sm: "540px",
    md: "380px", // Bóp từ 540px xuống 460px cho vừa vặn
    lg: "540px",
    xl: "640px",
  };

  // 🔥 GÓI TOÀN BỘ GIAO DIỆN VÀO MỘT BIẾN
  const modalContent = (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999, // Đảm bảo cao nhất
        backgroundColor: "rgba(30, 20, 50, 0.45)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: sizeMap[size],
          maxHeight: "calc(100vh - 40px)",
          backgroundColor: "#fff",
          borderRadius: 18,
          boxShadow: "0 24px 80px rgba(100, 60, 160, 0.22)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          animation: "modalIn 0.25s ease-out",
        }}
      >
        {/* HEADER */}
        {(title || showCloseButton) && (
          <div style={{ /* (Giữ nguyên style Header của bạn) */ display: "flex", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #eee", flexShrink: 0 }}>
            <h2 id={titleId} style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>{title}</h2>
            {showCloseButton && (
              <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                style={{ border: "none", background: "transparent", cursor: "pointer" }}
              >
                <X size={18} color="#666" />
              </button>
            )}
          </div>
        )}

        {/* BODY */}
        <div id={descriptionId} className="modal-body-scroll" style={{ padding: "20px", overflowY: "auto", flex: 1 }}>
          {children}
        </div>

        {/* FOOTER */}
        {footer && (
          <div style={{ padding: "14px 20px", borderTop: "1px solid #eee", flexShrink: 0 }}>
            {footer}
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes modalIn {
            from { opacity: 0; transform: translateY(20px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          .modal-body-scroll::-webkit-scrollbar { width: 6px; }
          .modal-body-scroll::-webkit-scrollbar-track { background: transparent; }
          .modal-body-scroll::-webkit-scrollbar-thumb { background: #dbdbdb; border-radius: 10px; }
        `}
      </style>
    </div>
  );

  // 🔥 DÙNG CREATEPORTAL ĐỂ RENDER RA THẲNG BODY
  return createPortal(modalContent, document.body);
}

export default Modal;