import { useState, useEffect } from "react";
import Modal from "./Modal";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { User, Mail, Phone, MapPin, Shield, FileText } from "lucide-react";

interface UserData {
  id?: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: string;
  status: string;
  adminNote?: string;
}

interface AddEditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: UserData) => void;
  user?: UserData | null;
  mode: "add" | "edit";
  existingEmails?: string[];
}

export function AddEditUserModal({ isOpen, onClose, onSave, user, mode, existingEmails = [] }: AddEditUserModalProps) {
  const [formData, setFormData] = useState<UserData>({ name: "", email: "", phone: "", address: "", role: "user", status: "active", adminNote: "" });
  const [emailError, setEmailError] = useState("");

  useEffect(() => {
    if (user && mode === "edit") setFormData({ adminNote: "", ...user });
    else setFormData({ name: "", email: "", phone: "", address: "", role: "user", status: "active", adminNote: "" });
    setEmailError("");
  }, [user, mode, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "add" && existingEmails.includes(formData.email)) {
      setEmailError("Email này đã được sử dụng!");
      return;
    }
    setEmailError("");
    onSave(formData);
  };

  const set = (k: keyof UserData, v: string) => setFormData(f => ({ ...f, [k]: v }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={mode === "add" ? "Thêm người dùng mới" : "Chỉnh sửa người dùng"} size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} className="rounded-[var(--radius-sm)] border-[var(--border-light)] font-semibold">Hủy</Button>
          <Button onClick={handleSubmit} className="bg-gradient-purple text-white rounded-[var(--radius-sm)] shadow-[var(--shadow-btn)] hover-lift font-semibold">
            {mode === "add" ? "Thêm mới" : "Lưu thay đổi"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="font-semibold flex items-center gap-2"><User className="w-4 h-4 text-[var(--purple-deep)]" />Họ và tên *</Label>
            <Input value={formData.name} onChange={e => set("name", e.target.value)} placeholder="Nguyễn Văn A" required
              className="h-11 rounded-[var(--radius-sm)] border-[var(--border-light)] focus-visible:border-[var(--purple-deep)] focus-visible:ring-[var(--purple-deep)]" />
          </div>
          <div className="space-y-2">
            <Label className="font-semibold flex items-center gap-2"><Mail className="w-4 h-4 text-[var(--purple-deep)]" />Email *</Label>
            <Input type="email" value={formData.email} onChange={e => { set("email", e.target.value); setEmailError(""); }} placeholder="example@email.com" required
              className={`h-11 rounded-[var(--radius-sm)] border-[var(--border-light)] focus-visible:border-[var(--purple-deep)] focus-visible:ring-[var(--purple-deep)] ${emailError ? "border-red-400" : ""}`} />
            {emailError && <p className="text-xs text-red-600 font-semibold">{emailError}</p>}
          </div>
          <div className="space-y-2">
            <Label className="font-semibold flex items-center gap-2"><Phone className="w-4 h-4 text-[var(--purple-deep)]" />Số điện thoại</Label>
            <Input value={formData.phone} onChange={e => set("phone", e.target.value)} placeholder="0123456789"
              className="h-11 rounded-[var(--radius-sm)] border-[var(--border-light)] focus-visible:border-[var(--purple-deep)] focus-visible:ring-[var(--purple-deep)]" />
          </div>
          <div className="space-y-2">
            <Label className="font-semibold flex items-center gap-2"><Shield className="w-4 h-4 text-[var(--purple-deep)]" />Vai trò *</Label>
            <Select value={formData.role} onValueChange={v => set("role", v)}>
              <SelectTrigger className="h-11 rounded-[var(--radius-sm)] border-[var(--border-light)]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Quản trị viên</SelectItem>
                <SelectItem value="moderator">Kiểm duyệt viên</SelectItem>
                <SelectItem value="user">Người dùng</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label className="font-semibold flex items-center gap-2"><MapPin className="w-4 h-4 text-[var(--purple-deep)]" />Địa chỉ</Label>
          <Input value={formData.address} onChange={e => set("address", e.target.value)} placeholder="Nhập địa chỉ"
            className="h-11 rounded-[var(--radius-sm)] border-[var(--border-light)] focus-visible:border-[var(--purple-deep)] focus-visible:ring-[var(--purple-deep)]" />
        </div>
        <div className="space-y-2">
          <Label className="font-semibold">Trạng thái *</Label>
          <Select value={formData.status} onValueChange={v => set("status", v)}>
            <SelectTrigger className="h-11 rounded-[var(--radius-sm)] border-[var(--border-light)]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Đang hoạt động</SelectItem>
              <SelectItem value="inactive">Tạm ngưng</SelectItem>
              <SelectItem value="banned">Bị cấm</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="font-semibold flex items-center gap-2"><FileText className="w-4 h-4 text-[var(--purple-deep)]" />Ghi chú Admin (tùy chọn)</Label>
          <Textarea value={formData.adminNote || ""} onChange={e => set("adminNote", e.target.value)}
            placeholder="Ghi chú nội bộ về người dùng này..." rows={2}
            className="rounded-[var(--radius-sm)] border-[var(--border-light)] focus-visible:border-[var(--purple-deep)] focus-visible:ring-[var(--purple-deep)] resize-none" />
        </div>
      </form>
    </Modal>
  );
}
