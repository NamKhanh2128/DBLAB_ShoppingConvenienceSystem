import { X, User, Mail, Phone, Shield, Calendar, Activity } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Separator } from "../ui/separator";
import Modal from "./Modal";

interface ViewMemberDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  member?: any;
  onEdit?: (member: any) => void;
  onManagePermissions?: (member: any) => void;
}

export function ViewMemberDetailsModal({
  isOpen,
  onClose,
  member,
  onEdit,
  onManagePermissions,
}: ViewMemberDetailsModalProps) {
  if (!member) return null;

  const activities = [
    { date: "16/04/2026", action: "Thêm danh sách mua sắm", time: "14:30" },
    { date: "15/04/2026", action: "Cập nhật kho thực phẩm", time: "09:15" },
    { date: "14/04/2026", action: "Tạo kế hoạch ăn uống", time: "20:45" },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Thông tin thành viên" size="md">

      {/* Header */}
      <div style={{ display: "none" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-black">Chi tiết thành viên</h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-smooth"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Avatar & Name */}
        <div className="flex items-center gap-4">
          <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
            <AvatarFallback className="bg-white text-[var(--purple)] text-2xl font-bold">
              {member.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-xl font-black text-white mb-1">{member.name || "Nguyễn Văn A"}</h3>
            <Badge
              className={`
                  border-none font-semibold
                  ${member.role === 'admin'
                  ? 'bg-white/20 text-white'
                  : 'bg-[var(--gold)] text-white'
                }
                `}
            >
              <Shield className="w-3 h-3 mr-1" />
              {member.role === 'admin' ? 'Quản trị viên' : member.role === 'viewer' ? 'Người xem' : 'Thành viên'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Contact Info */}
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-4 bg-[var(--card-bg)] rounded-[var(--radius-sm)]">
            <Mail className="w-5 h-5 text-[var(--purple)] mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-[var(--text-muted)] mb-1">Email</p>
              <p className="font-semibold text-[var(--text-dark)]">{member.email || "example@email.com"}</p>
            </div>
          </div>

          {member.phone && (
            <div className="flex items-start gap-3 p-4 bg-[var(--card-bg)] rounded-[var(--radius-sm)]">
              <Phone className="w-5 h-5 text-[var(--purple)] mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-[var(--text-muted)] mb-1">Số điện thoại</p>
                <p className="font-semibold text-[var(--text-dark)]">{member.phone}</p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3 p-4 bg-[var(--card-bg)] rounded-[var(--radius-sm)]">
            <Calendar className="w-5 h-5 text-[var(--purple)] mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-[var(--text-muted)] mb-1">Tham gia</p>
              <p className="font-semibold text-[var(--text-dark)]">{member.joinDate || "01/01/2026"}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Recent Activities */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-5 h-5 text-[var(--purple)]" />
            <h3 className="font-bold text-lg text-[var(--text-dark)]">Hoạt động gần đây</h3>
          </div>

          <div className="space-y-2">
            {activities.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-[var(--card-bg)] rounded-[var(--radius-sm)] hover:bg-white hover:shadow-sm transition-smooth">
                <div className="w-2 h-2 rounded-full bg-[var(--purple)] mt-2" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[var(--text-dark)] font-medium">{activity.action}</p>
                  <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mt-1">
                    <span>{activity.date}</span>
                    <span>•</span>
                    <span>{activity.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="text-center p-4 bg-gradient-to-br from-[var(--purple-light)] to-[var(--purple-light)] rounded-[var(--radius-sm)]">
            <p className="text-2xl font-black text-[var(--purple)] mb-1">24</p>
            <p className="text-xs text-[var(--text-muted)]">Danh sách</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-[var(--gold-light)] to-[var(--gold-light)] rounded-[var(--radius-sm)]">
            <p className="text-2xl font-black text-[var(--gold)] mb-1">156</p>
            <p className="text-xs text-[var(--text-muted)]">Món ăn</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-[var(--success-light)] to-[var(--success-light)] rounded-[var(--radius-sm)]">
            <p className="text-2xl font-black text-[var(--success)] mb-1">89</p>
            <p className="text-xs text-[var(--text-muted)]">Công thức</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-[var(--border-light)]">
          <Button
            variant="outline"
            className="flex-1 rounded-[var(--radius-btn)] border-[var(--border-light)] hover:bg-[var(--card-bg)] font-semibold"
            onClick={() => onEdit?.(member)}
          >
            Chỉnh sửa
          </Button>
          <Button
            className="flex-1 bg-gradient-purple text-white font-semibold rounded-[var(--radius-btn)] shadow-[var(--shadow-btn)] hover-lift transition-smooth"
            onClick={() => onManagePermissions?.(member)}
          >
            Quản lý quyền
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
    </Modal >
  );
}