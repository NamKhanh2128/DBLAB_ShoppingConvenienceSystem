import { useState } from "react";
import { Modal } from "./Modal";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { UserPlus, Mail, Shield } from "lucide-react";

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (data: { email: string; role: string }) => void;
}

export function InviteMemberModal({
  isOpen,
  onClose,
  onInvite,
}: InviteMemberModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onInvite({ email, role });
    setEmail("");
    setRole("member");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Mời thành viên mới"
      size="md"
      footer={
        <>
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-[var(--radius-sm)] border-[var(--border-light)] hover:bg-[var(--card-bg)] font-semibold"
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-gradient-purple text-white rounded-[var(--radius-sm)] shadow-[var(--shadow-btn)] hover-lift font-semibold"
          >
            <UserPlus className="w-4 h-4 mr-2" strokeWidth={2.5} />
            Gửi lời mời
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-[var(--text-dark)] font-semibold flex items-center gap-2">
            <Mail className="w-4 h-4 text-[var(--purple-deep)]" strokeWidth={2.5} />
            Email *
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            required
            className="h-11 rounded-[var(--radius-sm)] border-[var(--border-light)] focus-visible:border-[var(--purple-deep)] focus-visible:ring-[var(--purple-deep)]"
          />
          <p className="text-sm text-[var(--text-muted)]">
            Lời mời sẽ được gửi đến email này
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="role" className="text-[var(--text-dark)] font-semibold flex items-center gap-2">
            <Shield className="w-4 h-4 text-[var(--purple-deep)]" strokeWidth={2.5} />
            Vai trò *
          </Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="h-11 rounded-[var(--radius-sm)] border-[var(--border-light)] focus:border-[var(--purple-deep)] focus:ring-[var(--purple-deep)]">
              <SelectValue placeholder="Chọn vai trò" />
            </SelectTrigger>
            <SelectContent className="rounded-[var(--radius-sm)]">
              <SelectItem value="admin">
                <div className="flex flex-col items-start">
                  <span className="font-semibold">Quản trị viên</span>
                  <span className="text-xs text-[var(--text-muted)]">
                    Toàn quyền quản lý nhóm
                  </span>
                </div>
              </SelectItem>
              <SelectItem value="member">
                <div className="flex flex-col items-start">
                  <span className="font-semibold">Thành viên</span>
                  <span className="text-xs text-[var(--text-muted)]">
                    Xem và chỉnh sửa danh sách
                  </span>
                </div>
              </SelectItem>
              <SelectItem value="viewer">
                <div className="flex flex-col items-start">
                  <span className="font-semibold">Người xem</span>
                  <span className="text-xs text-[var(--text-muted)]">
                    Chỉ xem, không chỉnh sửa
                  </span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="p-4 rounded-[var(--radius-sm)] bg-purple-50 border border-purple-200">
          <p className="text-sm text-[var(--purple-deep)] font-medium">
            💡 Người được mời sẽ nhận email kèm liên kết để tham gia nhóm của bạn
          </p>
        </div>
      </form>
    </Modal>
  );
}

export default InviteMemberModal;