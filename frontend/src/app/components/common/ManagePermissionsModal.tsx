import { X, Shield, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import Modal from "./Modal";

interface ManagePermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (permissions: any) => void;
  member?: any;
}

const permissionGroups = [
  {
    name: "Danh sách mua sắm",
    permissions: [
      { id: "shopping_view", label: "Xem danh sách", default: true },
      { id: "shopping_create", label: "Tạo danh sách mới", default: false },
      { id: "shopping_edit", label: "Chỉnh sửa", default: false },
      { id: "shopping_delete", label: "Xóa", default: false },
    ]
  },
  {
    name: "Kho thực phẩm",
    permissions: [
      { id: "inventory_view", label: "Xem kho", default: true },
      { id: "inventory_add", label: "Thêm thực phẩm", default: false },
      { id: "inventory_edit", label: "Chỉnh sửa", default: false },
      { id: "inventory_delete", label: "Xóa", default: false },
    ]
  },
  {
    name: "Kế hoạch ăn uống",
    permissions: [
      { id: "meal_view", label: "Xem kế hoạch", default: true },
      { id: "meal_create", label: "Tạo kế hoạch", default: false },
      { id: "meal_edit", label: "Chỉnh sửa", default: false },
      { id: "meal_delete", label: "Xóa", default: false },
    ]
  },
  {
    name: "Công thức nấu ăn",
    permissions: [
      { id: "recipe_view", label: "Xem công thức", default: true },
      { id: "recipe_create", label: "Tạo công thức", default: false },
      { id: "recipe_edit", label: "Chỉnh sửa", default: false },
      { id: "recipe_delete", label: "Xóa", default: false },
    ]
  },
  {
    name: "Báo cáo",
    permissions: [
      { id: "report_view", label: "Xem báo cáo", default: true },
      { id: "report_export", label: "Xuất báo cáo", default: false },
    ]
  },
  {
    name: "Quản lý thành viên",
    permissions: [
      { id: "member_view", label: "Xem thành viên", default: true },
      { id: "member_invite", label: "Mời thành viên", default: false },
      { id: "member_edit", label: "Chỉnh sửa", default: false },
      { id: "member_remove", label: "Xóa thành viên", default: false },
    ]
  },
];

export function ManagePermissionsModal({
  isOpen,
  onClose,
  onSave,
  member
}: ManagePermissionsModalProps) {
  const [permissions, setPermissions] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    permissionGroups.forEach(group => {
      group.permissions.forEach(perm => {
        initial[perm.id] = member?.permissions?.[perm.id] ?? perm.default;
      });
    });
    return initial;
  });

  const handleToggle = (permId: string) => {
    setPermissions(prev => ({
      ...prev,
      [permId]: !prev[permId]
    }));
  };

  const handleSave = () => {
    onSave(permissions);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Quản lý quyền" size="lg">

      {/* Header */}
      <div style={{ display: "none" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12 border-2 border-white shadow-lg">
              <AvatarFallback className="bg-white text-[var(--purple)] text-lg font-bold">
                {member?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-black">Quản lý quyền hạn</h2>
              <p className="text-white/90 text-sm mt-1">
                {member?.name || "Thành viên"}
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

      {/* Content */}
      <div className="p-6 space-y-6">
        {permissionGroups.map((group) => (
          <div key={group.name} className="space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[var(--purple)]" />
              <h3 className="font-bold text-lg text-[var(--text-dark)]">{group.name}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {group.permissions.map((perm) => (
                <div
                  key={perm.id}
                  className="flex items-center justify-between p-4 bg-[var(--card-bg)] rounded-[var(--radius-sm)] hover:bg-white hover:shadow-sm transition-smooth"
                >
                  <Label
                    htmlFor={perm.id}
                    className="text-sm text-[var(--text-dark)] cursor-pointer flex items-center gap-2"
                  >
                    {permissions[perm.id] && (
                      <div className="w-5 h-5 rounded-full bg-[var(--success)] flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                      </div>
                    )}
                    {perm.label}
                  </Label>
                  <Switch
                    id={perm.id}
                    checked={permissions[perm.id]}
                    onCheckedChange={() => handleToggle(perm.id)}
                    className="data-[state=checked]:bg-[var(--purple)]"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Summary */}
        <div className="p-4 bg-gradient-to-r from-[var(--purple-light)] to-[var(--gold-light)] rounded-[var(--radius-sm)] border-l-4 border-[var(--purple)]">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-[var(--purple)] mt-0.5" />
            <div>
              <p className="font-semibold text-[var(--text-dark)] mb-1">
                Tổng số quyền được cấp
              </p>
              <p className="text-sm text-[var(--text-muted)]">
                {Object.values(permissions).filter(Boolean).length} / {Object.keys(permissions).length} quyền
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2 border-t border-[var(--border-light)]">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 rounded-[var(--radius-btn)] border-[var(--border-light)] hover:bg-[var(--card-bg)] font-semibold"
          >
            Hủy
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 bg-gradient-purple text-white font-semibold rounded-[var(--radius-btn)] shadow-[var(--shadow-btn)] hover-lift transition-smooth"
          >
            <Shield className="w-4 h-4 mr-2" />
            Lưu quyền hạn
          </Button>
        </div>
      </div>
    </Modal>
  );
}
