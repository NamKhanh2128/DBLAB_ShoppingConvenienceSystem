import { X, User, Mail, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Avatar, AvatarFallback } from "../ui/avatar";
import Modal from "./Modal";

interface EditMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  member?: any;
}

const roles = [
  { value: "Trưởng nhóm", label: "Trưởng nhóm", color: "from-[var(--gold)] to-[#D4941C]" },
  { value: "Thành viên", label: "Thành viên", color: "from-[var(--purple)] to-[var(--purple-dark)]" },
  { value: "Khách", label: "Khách", color: "from-gray-400 to-gray-500" },
];

export function EditMemberModal({
  isOpen,
  onClose,
  onSubmit,
  member
}: EditMemberModalProps) {
  const [formData, setFormData] = useState({
    name: member?.name || "",
    email: member?.email || "",
    role: member?.role || "Thành viên",
    phone: member?.phone || "",
  });

  useEffect(() => {
    setFormData({
      name: member?.name || "",
      email: member?.email || "",
      role: member?.role || "Thành viên",
      phone: member?.phone || "",
    });
  }, [member, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chỉnh sửa thành viên" size="md">

      {/* Header */}
      <div style={{ display: "none" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <User className="w-6 h-6" />
            <div>
              <h2 className="text-2xl font-black">Chỉnh sửa thành viên</h2>
              <p className="text-white/90 text-sm mt-1">
                Cập nhật thông tin và quyền hạn
              </p>
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

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {/* Avatar Preview */}
        <div className="flex justify-center">
          <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
            <AvatarFallback className="bg-gradient-purple text-white text-2xl font-bold">
              {formData.name.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
        </div>

        <div>
          <Label className="text-[var(--text-dark)] font-semibold mb-2 block">
            Tên thành viên
          </Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="VD: Nguyễn Văn A"
            className="rounded-[var(--radius-sm)] border-[var(--border-light)] focus-visible:ring-[var(--purple)] focus-visible:border-[var(--purple)]"
            required
          />
        </div>

        <div>
          <Label className="text-[var(--text-dark)] font-semibold mb-2 block">
            <Mail className="w-4 h-4 inline mr-1" />
            Email
          </Label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="VD: example@email.com"
            className="rounded-[var(--radius-sm)] border-[var(--border-light)] focus-visible:ring-[var(--purple)] focus-visible:border-[var(--purple)]"
            required
          />
        </div>

        <div>
          <Label className="text-[var(--text-dark)] font-semibold mb-2 block">
            Số điện thoại (tùy chọn)
          </Label>
          <Input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="VD: 0123456789"
            className="rounded-[var(--radius-sm)] border-[var(--border-light)] focus-visible:ring-[var(--purple)] focus-visible:border-[var(--purple)]"
          />
        </div>

        <div>
          <Label className="text-[var(--text-dark)] font-semibold mb-2 block">
            <Shield className="w-4 h-4 inline mr-1" />
            Vai trò
          </Label>
          <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
            <SelectTrigger className="rounded-[var(--radius-sm)] border-[var(--border-light)]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role.value} value={role.value}>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${role.color}`} />
                    {role.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Role Description */}
        <div className="p-4 bg-[var(--card-bg)] rounded-[var(--radius-sm)]">
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            {formData.role === 'Trưởng nhóm' && (
              "Trưởng nhóm có toàn quyền quản lý hệ thống, thêm/xóa thành viên và chỉnh sửa mọi dữ liệu."
            )}
            {formData.role === 'Thành viên' && (
              "Thành viên có thể xem, thêm và chỉnh sửa danh sách mua sắm, kho và kế hoạch ăn."
            )}
            {formData.role === 'Khách' && (
              "Khách chỉ có quyền xem các thông tin, không thể chỉnh sửa hoặc thêm mới."
            )}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1 rounded-[var(--radius-btn)] border-[var(--border-light)] hover:bg-[var(--card-bg)] font-semibold"
          >
            Hủy
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-gradient-purple text-white font-semibold rounded-[var(--radius-btn)] shadow-[var(--shadow-btn)] hover-lift transition-smooth"
          >
            Lưu thay đổi
          </Button>
        </div>
      </form>
    </Modal>
  );
}
