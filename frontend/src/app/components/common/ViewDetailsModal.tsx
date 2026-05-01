import { Modal } from "./Modal";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Calendar, User, Mail, Phone, MapPin, Tag, Package } from "lucide-react";

interface DetailItem {
  label: string;
  value: string | number;
  icon?: any;
  type?: "text" | "badge" | "date";
  badgeVariant?: "default" | "success" | "warning" | "danger";
}

interface ViewDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  details: DetailItem[];
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ViewDetailsModal({
  isOpen,
  onClose,
  title,
  details,
  onEdit,
  onDelete,
}: ViewDetailsModalProps) {
  const getBadgeClass = (variant?: string) => {
    switch (variant) {
      case "success":
        return "bg-green-100 text-green-700 border-green-200";
      case "warning":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "danger":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-purple-100 text-[var(--purple-deep)] border-purple-200";
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            {onDelete && (
              <Button
                variant="outline"
                onClick={onDelete}
                className="rounded-[var(--radius-sm)] border-red-200 text-red-600 hover:bg-red-50 font-semibold"
              >
                Xóa
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="rounded-[var(--radius-sm)] border-[var(--border-light)] hover:bg-[var(--card-bg)] font-semibold"
            >
              Đóng
            </Button>
            {onEdit && (
              <Button
                onClick={onEdit}
                className="bg-gradient-purple text-white rounded-[var(--radius-sm)] shadow-[var(--shadow-btn)] hover-lift font-semibold"
              >
                Chỉnh sửa
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {details.map((detail, index) => {
          const Icon = detail.icon;
          return (
            <div
              key={index}
              className="flex items-start gap-4 p-4 rounded-[var(--radius-sm)] bg-[var(--card-bg)] hover:bg-gray-50 transition-smooth"
            >
              {Icon && (
                <div className="w-10 h-10 bg-gradient-purple rounded-[10px] flex items-center justify-center flex-shrink-0 shadow-md">
                  <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--text-muted)] mb-1">
                  {detail.label}
                </p>
                {detail.type === "badge" ? (
                  <Badge
                    className={`${getBadgeClass(detail.badgeVariant)} rounded-full px-3 py-1 font-semibold`}
                  >
                    {detail.value}
                  </Badge>
                ) : detail.type === "date" ? (
                  <p className="text-base font-bold text-[var(--text-dark)] flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[var(--purple-deep)]" />
                    {detail.value}
                  </p>
                ) : (
                  <p className="text-base font-bold text-[var(--text-dark)] break-words">
                    {detail.value}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
