import { X, Calendar, User, DollarSign, Package, Tag, CheckCircle2 } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import Modal from "./Modal";

interface ViewShoppingItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item?: any;
}

export function ViewShoppingItemModal({
  isOpen,
  onClose,
  item
}: ViewShoppingItemModalProps) {
  if (!item) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chi tiết mặt hàng" size="md">

      {/* Header */}
      <div style={{ display: "none" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{item.emoji}</span>
            <div>
              <h2 className="text-2xl font-black">{item.name}</h2>
              <p className="text-white/90 text-sm">Chi tiết món mua</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-smooth"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Status */}
        <div className="flex items-center justify-center">
          <Badge
            className={`
              px-4 py-2 text-sm font-semibold border-none
              ${item.done
                ? 'bg-[var(--success-light)] text-[var(--success)]'
                : 'bg-[var(--warning-light)] text-[var(--warning)]'
              }
            `}
          >
            {item.done ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Đã mua
              </>
            ) : (
              <>
                <Package className="w-4 h-4 mr-2" />
                Chưa mua
              </>
            )}
          </Badge>
        </div>

        {/* Details */}
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-4 bg-[var(--card-bg)] rounded-[var(--radius-sm)]">
            <Package className="w-5 h-5 text-[var(--gold)] mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-[var(--text-muted)] mb-1">Số lượng</p>
              <p className="font-semibold text-[var(--text-dark)]">{item.quantity}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-[var(--card-bg)] rounded-[var(--radius-sm)]">
            <DollarSign className="w-5 h-5 text-[var(--gold)] mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-[var(--text-muted)] mb-1">Giá tiền</p>
              <p className="font-semibold text-[var(--text-dark)]">{item.price}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-[var(--card-bg)] rounded-[var(--radius-sm)]">
            <Tag className="w-5 h-5 text-[var(--gold)] mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-[var(--text-muted)] mb-1">Danh mục</p>
              <p className="font-semibold text-[var(--text-dark)]">{item.category}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-[var(--card-bg)] rounded-[var(--radius-sm)]">
            <User className="w-5 h-5 text-[var(--gold)] mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-[var(--text-muted)] mb-1">Người phụ trách</p>
              <p className="font-semibold text-[var(--text-dark)]">{item.assignee}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full rounded-[var(--radius-btn)] border-[var(--border-light)] hover:bg-[var(--card-bg)] font-semibold"
          >
            Đóng
          </Button>
        </div>
      </div>
    </Modal>
  );
}