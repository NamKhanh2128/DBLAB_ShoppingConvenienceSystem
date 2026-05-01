import { useState } from "react";
import { Plus, Mail, Crown, Phone, Calendar, Shield, Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { useToastContext } from "../../context/ToastContext";
import {
  InviteMemberModal,
  EditMemberModal,
  ViewMemberDetailsModal,
  ManagePermissionsModal,
  ConfirmDialog,
} from "../../components/common";

type Member = {
  id: number;
  name: string;
  email: string;
  role: string;
  color: string;
  phone?: string;
  joinedDate?: string;
  avatar?: string;
};

const initialMembers: Member[] = [
  { id: 1, name: "Nguyễn Văn A", email: "vana@email.com", role: "Trưởng nhóm", color: "bg-gradient-gold", phone: "0901234567", joinedDate: "01/01/2025" },
  { id: 2, name: "Trần Thị B", email: "thib@email.com", role: "Thành viên", color: "bg-[#22C55E]", phone: "0912345678", joinedDate: "05/02/2025" },
  { id: 3, name: "Nguyễn Văn C", email: "vanc@email.com", role: "Thành viên", color: "bg-[#3B82F6]", phone: "0923456789", joinedDate: "12/03/2025" },
  { id: 4, name: "Nguyễn Thị D", email: "thid@email.com", role: "Thành viên", color: "bg-[#F97316]", phone: "0934567890", joinedDate: "20/04/2025" },
];

const roleColors: Record<string, string> = {
  "Trưởng nhóm": "bg-[var(--gold)]/10 text-[var(--gold)]",
  "Thành viên": "bg-[var(--card-bg)] text-[var(--text-muted)]",
  "Khách": "bg-[var(--info-light)] text-[var(--info)]",
};

export function FamilyMembers() {
  const { success, error, info } = useToastContext();
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [showInvite, setShowInvite] = useState(false);
  const [editMember, setEditMember] = useState<Member | null>(null);
  const [viewMember, setViewMember] = useState<Member | null>(null);
  const [managePerm, setManagePerm] = useState<Member | null>(null);
  const [deleteMember, setDeleteMember] = useState<Member | null>(null);

  const handleInvite = (data: any) => {
    const newMember: Member = {
      id: Date.now(),
      name: data.name || data.email.split("@")[0],
      email: data.email,
      role: data.role || "Thành viên",
      color: "bg-[var(--purple-deep)]",
      phone: data.phone || "",
      joinedDate: new Date().toLocaleDateString('vi-VN'),
    };
    setMembers(prev => [...prev, newMember]);
    success("✅ Đã mời thành viên!", `Lời mời đã được gửi tới ${data.email}.`);
  };

  const handleEdit = (data: any) => {
    setMembers(prev => prev.map(m =>
      m.id === editMember?.id ? { ...m, name: data.name, email: data.email, phone: data.phone, role: data.role } : m
    ));
    success("✅ Cập nhật thành công!", `Thông tin của ${data.name} đã được cập nhật.`);
    setEditMember(null);
  };

  const handleDelete = () => {
    const memberName = deleteMember?.name;
    setMembers(prev => prev.filter(m => m.id !== deleteMember?.id));
    success(`🗑️ Đã xóa thành viên!`, `${memberName} đã được xóa khỏi nhóm.`);
    setDeleteMember(null);
  };

  const handleManagePermissions = (data: any) => {
    success("✅ Cập nhật quyền thành công!", `Quyền của ${managePerm?.name} đã được cập nhật.`);
    setManagePerm(null);
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[var(--text-dark)] mb-2">
            Thành viên gia đình
          </h1>
          <p className="text-[var(--text-muted)]">
            Quản lý thành viên trong nhóm — {members.length} người 👨‍👩‍👧‍👦
          </p>
        </div>
        <Button
          className="bg-gradient-gold text-white font-semibold shadow-[var(--shadow-btn)] hover-lift rounded-[var(--radius-btn)] px-6 py-6 self-start md:self-auto"
          onClick={() => setShowInvite(true)}
        >
          <Plus className="w-5 h-5 mr-2" strokeWidth={2.5} />
          Mời thành viên
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Tổng thành viên", value: members.length, color: "var(--purple-deep)" },
          { label: "Trưởng nhóm", value: members.filter(m => m.role === "Trưởng nhóm").length, color: "var(--gold)" },
          { label: "Thành viên thường", value: members.filter(m => m.role === "Thành viên").length, color: "var(--success)" },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-[var(--radius)] p-4 shadow-[var(--shadow-card)] text-center hover-lift transition-smooth">
            <p className="text-2xl font-black" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-xs text-[var(--text-muted)] font-medium mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Members Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {members.map((member) => (
          <Card
            key={member.id}
            className="border-none shadow-[var(--shadow-card)] hover:shadow-xl transition-all rounded-[var(--radius)] hover-lift group"
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar className={`w-16 h-16 ${member.color} flex-shrink-0 shadow-md`}>
                  <AvatarFallback className="text-white text-xl font-bold">{member.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="font-bold text-[var(--text-dark)] truncate">{member.name}</h3>
                    {member.role === "Trưởng nhóm" && <Crown className="w-4 h-4 text-[var(--gold)] flex-shrink-0" />}
                  </div>
                  <div className="space-y-1 mb-3">
                    <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                      <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{member.email}</span>
                    </div>
                    {member.phone && (
                      <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                        <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{member.phone}</span>
                      </div>
                    )}
                    {member.joinedDate && (
                      <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                        <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>Tham gia {member.joinedDate}</span>
                      </div>
                    )}
                  </div>
                  <Badge className={`${roleColors[member.role] || 'bg-[var(--card-bg)] text-[var(--text-muted)]'} border-none font-semibold`}>
                    {member.role}
                  </Badge>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4 pt-4 border-t border-[var(--border-light)]">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 rounded-[var(--radius-sm)] hover:border-[var(--gold)] hover:text-[var(--gold)] transition-smooth"
                  onClick={() => setViewMember(member)}
                >
                  <Eye className="w-3.5 h-3.5 mr-1.5" />
                  Xem
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 rounded-[var(--radius-sm)] hover:border-[var(--purple-deep)] hover:text-[var(--purple-deep)] transition-smooth"
                  onClick={() => setEditMember(member)}
                >
                  <Pencil className="w-3.5 h-3.5 mr-1.5" />
                  Sửa
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-[var(--radius-sm)] hover:border-[var(--info)] hover:text-[var(--info)] transition-smooth px-2"
                  onClick={() => setManagePerm(member)}
                  title="Quản lý quyền"
                >
                  <Shield className="w-3.5 h-3.5" />
                </Button>
                {member.role !== "Trưởng nhóm" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="rounded-[var(--radius-sm)] hover:text-[var(--danger)] hover:bg-[var(--danger-light)] transition-smooth px-2"
                    onClick={() => setDeleteMember(member)}
                    title="Xóa thành viên"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modals */}
      <InviteMemberModal
        isOpen={showInvite}
        onClose={() => setShowInvite(false)}
        onInvite={handleInvite}
      />

      {editMember && (
        <EditMemberModal
          isOpen={!!editMember}
          onClose={() => setEditMember(null)}
          onSubmit={handleEdit}
          member={editMember}
        />
      )}

      {viewMember && (
        <ViewMemberDetailsModal
          isOpen={!!viewMember}
          onClose={() => setViewMember(null)}
          member={viewMember}
          onEdit={(member) => {
            setViewMember(null);
            setEditMember(member);
          }}
          onManagePermissions={(member) => {
            setViewMember(null);
            setManagePerm(member);
          }}
        />
      )}

      {managePerm && (
        <ManagePermissionsModal
          isOpen={!!managePerm}
          onClose={() => setManagePerm(null)}
          onSave={handleManagePermissions}
          member={managePerm}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteMember}
        onClose={() => setDeleteMember(null)}
        onConfirm={handleDelete}
        title="Xóa thành viên?"
        message={`Bạn có chắc muốn xóa "${deleteMember?.name}" khỏi nhóm không? Thao tác này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        type="danger"
      />
    </div>
  );
}