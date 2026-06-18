import { X, Calendar, MapPin, Package, AlertTriangle, Tag, Edit, Check } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import Modal from "./Modal";

interface ViewInventoryDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  item?: any;
  onEdit?: (item: any) => void;
  onUse?: (item: any) => void;
  itemLogs?: any[];
}

const ACTION_LABELS: Record<string, string> = {
  THEM_MOI: "Thêm vào kho",
  CAP_NHAT: "Cập nhật",
  TIEU_THU: "Sử dụng / Nấu ăn",
  XOA: "Xóa khỏi kho",
};

export function ViewInventoryDetailsModal({
  isOpen,
  onClose,
  item,
  onEdit,
  onUse,
  itemLogs,
}: ViewInventoryDetailsModalProps) {
  if (!item) return null;

  const hasMultipleBatches = item.batches && item.batches.length > 1;

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
        <div className="flex items-start gap-3 p-4 bg-[var(--purple-pale)]/30 border border-[var(--border-purple)] rounded-xl shadow-sm hover:border-[var(--purple-primary)] transition-all duration-200">
          <Package className="w-5 h-5 text-[var(--purple-deep)] mt-0.5" />
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">Số lượng</p>
            <p className="font-extrabold text-[var(--text-dark)]">
              {item.quantity} {item.unit}
            </p>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-start gap-3 p-4 bg-[var(--purple-pale)]/30 border border-[var(--border-purple)] rounded-xl shadow-sm hover:border-[var(--purple-primary)] transition-all duration-200">
          <MapPin className="w-5 h-5 text-[var(--purple-deep)] mt-0.5" />
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">Vị trí lưu trữ</p>
            <p className="font-extrabold text-[var(--text-dark)]">{item.location}</p>
          </div>
        </div>

        {/* Expiry */}
        <div className="flex items-start gap-3 p-4 bg-[var(--purple-pale)]/30 border border-[var(--border-purple)] rounded-xl shadow-sm hover:border-[var(--purple-primary)] transition-all duration-200">
          <Calendar className="w-5 h-5 text-[var(--purple-deep)] mt-0.5" />
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">Hạn sử dụng</p>
            <p className="font-extrabold text-[var(--text-dark)]">Còn {item.expiry || item.expiryText}</p>
          </div>
        </div>

        {/* List of Batches if Multiple */}
        {hasMultipleBatches && (
          <div className="pt-2 border-t border-[var(--border-purple)]">
            <h3 className="font-bold text-sm text-[var(--text-dark)] mb-3">Các lô hàng thực tế</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {item.batches.map((batch: any, idx: number) => (
                <div key={batch.id} className="flex items-center justify-between bg-white border border-[var(--border-purple)] rounded-xl p-3 shadow-sm hover:border-[var(--purple-primary)] transition-smooth">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-xs text-[var(--text-dark)]">Lô {idx + 1}: {batch.quantity} {batch.unit}</span>
                      <Badge className={`text-[9px] font-semibold border-none py-0.5 px-1.5 ${batch.expiryBadge}`}>
                        {batch.expiryIcon} {batch.expiryText}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-[var(--text-muted)] font-semibold">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        {batch.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        HSD: {batch.expiryDate || "Không có"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2.5 text-[10px] border-[var(--border-purple)] hover:bg-[var(--purple-pale)]/30 hover:text-[var(--purple-deep)] font-bold flex items-center gap-1"
                      onClick={() => onEdit?.(batch)}
                    >
                      <Edit className="w-3 h-3" />
                      Sửa
                    </Button>
                    <Button
                      size="sm"
                      className="h-7 px-2.5 text-[10px] bg-gradient-gold text-[var(--text-dark)] hover:shadow-md font-bold flex items-center gap-1 border-none"
                      onClick={() => onUse?.(batch)}
                    >
                      <Check className="w-3 h-3" />
                      Dùng
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Storage History */}
        <div className="pt-2 border-t border-[var(--border-purple)]">
          <h3 className="font-bold text-sm text-[var(--text-dark)] mb-3">Lịch sử lưu trữ</h3>
          {itemLogs && itemLogs.length > 0 ? (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {itemLogs.map((log: any, idx: number) => (
                <div key={idx} className="flex items-start gap-3 text-sm">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${idx === 0 ? "bg-[var(--gold)]" : "bg-gray-300"}`} />
                  <span className="text-[var(--text-muted)] whitespace-nowrap">
                    {log.NgayThucHien ? new Date(log.NgayThucHien).toLocaleDateString("vi-VN") : "—"}
                  </span>
                  <span className="text-[var(--text-dark)]">
                    {ACTION_LABELS[log.HanhDong] || log.HanhDong}
                    {log.SoLuongTruoc != null && log.SoLuongSau != null &&
                      ` (${log.SoLuongTruoc} → ${log.SoLuongSau} ${log.DonVi || ""})`}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[var(--text-muted)] italic">Chưa có lịch sử lưu trữ</p>
          )}
        </div>

        {/* Actions for Single Item */}
        {!hasMultipleBatches && (
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button
              variant="outline"
              className="rounded-[var(--radius-btn)] border-[var(--border-purple)] hover:bg-[var(--purple-pale)]/30 hover:text-[var(--purple-deep)] font-semibold transition-all"
              onClick={() => onEdit?.(item.batches?.[0] || item)}
            >
              Chỉnh sửa
            </Button>
            <Button
              className="bg-gradient-gold text-[var(--text-dark)] font-bold rounded-[var(--radius-btn)] shadow-lg hover:shadow-xl transition-smooth border-none"
              onClick={() => onUse?.(item.batches?.[0] || item)}
            >
              Sử dụng
            </Button>
          </div>
        )}

        <Button
          variant="outline"
          onClick={onClose}
          className="w-full rounded-[var(--radius-btn)] border-[var(--border-purple)] hover:bg-[var(--purple-pale)]/30 hover:text-[var(--purple-deep)] font-semibold transition-all"
        >
          Đóng
        </Button>
      </div>
    </Modal>
  );
}
