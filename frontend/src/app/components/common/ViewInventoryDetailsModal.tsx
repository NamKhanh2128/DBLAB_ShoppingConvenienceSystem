import { X, Calendar, MapPin, Package, AlertTriangle, Tag } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import Modal from "./Modal";

interface ViewInventoryDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  item?: any;
  onEdit?: (item: any) => void;
  onUse?: (item: any) => void;
}

export function ViewInventoryDetailsModal({
  isOpen,
  onClose,
  item,
  onEdit,
  onUse,
}: ViewInventoryDetailsModalProps) {
  if (!item) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chi tiết thực phẩm" size="md">

      {/* Header with Image */}
      <div className="relative h-48 bg-gradient-gold rounded-t-[var(--radius-lg)] overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute top-4 right-4">
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-smooth"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="absolute bottom-4 left-6 text-white">
          <h2 className="text-2xl font-black mb-1">{item.name}</h2>
          <div className="flex items-center gap-2">
            <Badge
              className={`
                  border-none font-semibold
                  ${item.expiryStatus === 'critical'
                  ? 'bg-[#EF4444] text-white'
                  : item.expiryStatus === 'warning'
                    ? 'bg-[#F97316] text-white'
                    : 'bg-white/20 text-white'
                }
                `}
            >
              {item.expiryStatus === 'critical' && <AlertTriangle className="w-3 h-3 mr-1" />}
              {item.expiryStatus === 'critical' ? 'Gấp' : item.expiryStatus === 'warning' ? 'Sắp hết hạn' : 'Tốt'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Quantity */}
        <div className="flex items-start gap-3 p-4 bg-[var(--card-bg)] rounded-[var(--radius-sm)]">
          <Package className="w-5 h-5 text-[var(--gold)] mt-0.5" />
          <div className="flex-1">
            <p className="text-xs text-[var(--text-muted)] mb-1">Số lượng</p>
            <p className="font-semibold text-[var(--text-dark)]">
              {item.quantity} {item.unit}
            </p>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-start gap-3 p-4 bg-[var(--card-bg)] rounded-[var(--radius-sm)]">
          <MapPin className="w-5 h-5 text-[var(--gold)] mt-0.5" />
          <div className="flex-1">
            <p className="text-xs text-[var(--text-muted)] mb-1">Vị trí lưu trữ</p>
            <p className="font-semibold text-[var(--text-dark)]">{item.location}</p>
          </div>
        </div>

        {/* Expiry */}
        <div className="flex items-start gap-3 p-4 bg-[var(--card-bg)] rounded-[var(--radius-sm)]">
          <Calendar className="w-5 h-5 text-[var(--gold)] mt-0.5" />
          <div className="flex-1">
            <p className="text-xs text-[var(--text-muted)] mb-1">Hạn sử dụng</p>
            <p className="font-semibold text-[var(--text-dark)]">Còn {item.expiry}</p>
          </div>
        </div>

        {/* Storage History */}
        <div className="pt-2 border-t border-[var(--border-light)]">
          <h3 className="font-bold text-sm text-[var(--text-dark)] mb-3">Lịch sử lưu trữ</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 rounded-full bg-[var(--gold)]" />
              <span className="text-[var(--text-muted)]">14/04/2026</span>
              <span className="text-[var(--text-dark)]">Thêm vào kho</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 rounded-full bg-gray-300" />
              <span className="text-[var(--text-muted)]">15/04/2026</span>
              <span className="text-[var(--text-dark)]">Chuyển vị trí</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button
            variant="outline"
            className="rounded-[var(--radius-btn)] border-[var(--border-light)] hover:bg-[var(--card-bg)] font-semibold"
            onClick={() => onEdit?.(item)}
          >
            Chỉnh sửa
          </Button>
          <Button
            className="bg-gradient-gold text-[var(--text-dark)] font-bold rounded-[var(--radius-btn)] shadow-lg hover:shadow-xl transition-smooth"
            onClick={() => onUse?.(item)}
          >
            Sử dụng
          </Button>
        </div>

        <Button
          variant="outline"
          onClick={onClose}
          className="w-full rounded-[var(--radius-btn)] border-[var(--border-light)] hover:bg-[var(--card-bg)] font-semibold"
        >
          Đóng
        </Button>
      </div>
    </Modal>
  );
}
