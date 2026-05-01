import { useState } from "react";
import { X, User, Mail, Phone, MapPin, Shield, Calendar, Clock, Users as UsersIcon, Ban, Edit, Trash2, UserCheck, RefreshCw, Activity, ShoppingCart, ChefHat } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import Modal from "../../../components/common/Modal";
import { AdminUser } from "../../../context/AdminContext";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: AdminUser | null;
  onEdit: (u: AdminUser) => void;
  onBanToggle: (u: AdminUser) => void;
  onDelete: (u: AdminUser) => void;
}

const roleConfig: Record<string, { label: string; cls: string }> = {
  admin: { label: "Quản trị viên", cls: "bg-purple-100 text-purple-700" },
  moderator: { label: "Kiểm duyệt", cls: "bg-blue-100 text-blue-700" },
  user: { label: "Người dùng", cls: "bg-gray-100 text-gray-600" },
};
const statusConfig: Record<string, { label: string; cls: string }> = {
  active: { label: "Hoạt động", cls: "bg-green-100 text-green-700" },
  inactive: { label: "Tạm ngưng", cls: "bg-yellow-100 text-yellow-700" },
  banned: { label: "Bị cấm", cls: "bg-red-100 text-red-700" },
};

const mockActivity = [
  { icon: ShoppingCart, text: "Tạo danh sách mua sắm mới", time: "2 giờ trước", color: "bg-purple-100 text-purple-600" },
  { icon: ChefHat, text: "Thêm công thức: Phở bò Hà Nội", time: "1 ngày trước", color: "bg-yellow-100 text-yellow-600" },
  { icon: Activity, text: "Cập nhật kho thực phẩm", time: "3 ngày trước", color: "bg-green-100 text-green-600" },
];

export function ViewUserModal({ isOpen, onClose, user, onEdit, onBanToggle, onDelete }: Props) {
  const [tab, setTab] = useState<"info" | "activity">("info");
  if (!user) return null;

  const isBanned = user.status === "banned";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chi tiết người dùng" size="lg">
      <div className="p-6 space-y-5">
        {/* Avatar + name header */}
        <div className="flex items-center gap-5 p-5 bg-gradient-to-br from-[var(--card-bg)] to-white rounded-[var(--radius-sm)] border border-[var(--border-light)]">
          <Avatar className={`w-20 h-20 border-4 ${isBanned ? "border-red-200" : "border-[var(--purple-light)]"} shadow-lg`}>
            <AvatarFallback className={`text-2xl font-black ${isBanned ? "bg-red-100 text-red-600" : "bg-gradient-purple text-white"}`}>
              {user.avatar}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-2xl font-black text-[var(--text-dark)]">{user.name}</h2>
            <p className="text-[var(--text-muted)] text-sm mt-0.5">{user.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={`${roleConfig[user.role]?.cls} rounded-full px-3 py-1 font-semibold text-xs`}>
                {roleConfig[user.role]?.label}
              </Badge>
              <Badge className={`${statusConfig[user.status]?.cls} rounded-full px-3 py-1 font-semibold text-xs`}>
                {statusConfig[user.status]?.label}
              </Badge>
              <Badge className="bg-[var(--card-bg)] text-[var(--text-muted)] rounded-full px-3 py-1 font-semibold text-xs">
                {user.groups} nhóm
              </Badge>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-[var(--card-bg)] rounded-[var(--radius-sm)]">
          {(["info", "activity"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-[8px] text-sm font-semibold transition-smooth ${tab === t ? "bg-white shadow-sm text-[var(--purple-deep)]" : "text-[var(--text-muted)] hover:text-[var(--text-dark)]"}`}>
              {t === "info" ? "📋 Thông tin" : "📊 Hoạt động"}
            </button>
          ))}
        </div>

        {tab === "info" && (
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Mail, label: "Email", value: user.email },
              { icon: Phone, label: "Số điện thoại", value: user.phone },
              { icon: MapPin, label: "Địa chỉ", value: user.address },
              { icon: Shield, label: "Vai trò", value: roleConfig[user.role]?.label },
              { icon: Calendar, label: "Ngày tham gia", value: user.joinDate },
              { icon: Clock, label: "Đăng nhập cuối", value: user.lastLogin },
              { icon: UsersIcon, label: "Số nhóm", value: `${user.groups} nhóm` },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3 p-3 bg-[var(--card-bg)] rounded-[var(--radius-sm)]">
                <div className="w-9 h-9 bg-gradient-purple rounded-[8px] flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[var(--text-muted)]">{label}</p>
                  <p className="text-sm font-bold text-[var(--text-dark)]">{value}</p>
                </div>
              </div>
            ))}
            {user.adminNote && (
              <div className="col-span-2 p-3 bg-yellow-50 border border-yellow-200 rounded-[var(--radius-sm)]">
                <p className="text-xs font-bold text-yellow-700 mb-1">📝 Ghi chú Admin</p>
                <p className="text-sm text-yellow-800">{user.adminNote}</p>
              </div>
            )}
          </div>
        )}

        {tab === "activity" && (
          <div className="space-y-3">
            {mockActivity.map((a, i) => {
              const Icon = a.icon;
              return (
                <div key={i} className="flex items-center gap-3 p-3 bg-[var(--card-bg)] rounded-[var(--radius-sm)]">
                  <div className={`w-9 h-9 ${a.color} rounded-[8px] flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-4 h-4" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[var(--text-dark)]">{a.text}</p>
                  </div>
                  <span className="text-xs text-[var(--text-muted)] font-medium">{a.time}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-[var(--border-light)]">
          <Button onClick={() => onEdit(user)} className="flex-1 bg-gradient-purple text-white rounded-[var(--radius-btn)] font-semibold hover-lift">
            <Edit className="w-4 h-4 mr-2" />Chỉnh sửa
          </Button>
          <Button onClick={() => onBanToggle(user)} variant="outline"
            className={`flex-1 rounded-[var(--radius-btn)] font-semibold ${isBanned ? "border-green-400 text-green-600 hover:bg-green-50" : "border-orange-400 text-orange-600 hover:bg-orange-50"}`}>
            {isBanned ? <><UserCheck className="w-4 h-4 mr-2" />Bỏ cấm</> : <><Ban className="w-4 h-4 mr-2" />Cấm TK</>}
          </Button>
          <Button onClick={() => onDelete(user)} variant="outline" className="flex-1 rounded-[var(--radius-btn)] border-red-300 text-red-600 hover:bg-red-50 font-semibold">
            <Trash2 className="w-4 h-4 mr-2" />Xóa
          </Button>
          <Button variant="outline" onClick={onClose} className="flex-1 rounded-[var(--radius-btn)] font-semibold">Đóng</Button>
        </div>
      </div>
    </Modal>
  );
}
