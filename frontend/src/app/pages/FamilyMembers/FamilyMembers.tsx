import { useState, useEffect, useCallback } from "react";
import { Plus, Mail, Crown, Phone, Calendar, Shield, Eye, Pencil, Trash2, Copy, Loader2, RefreshCw, Info, Bell } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { useToastContext } from "../../context/ToastContext";
import { getInitials, getMemberColor } from "../../utils/avatar";
import {
  InviteMemberModal,
  EditMemberModal,
  ViewMemberDetailsModal,
  ManagePermissionsModal,
  ConfirmDialog,
} from "../../components/common";
import { useAuth } from "../../context/AuthContext";
import { familyApi } from "../../services/api";

const roleColors: Record<string, string> = {
  "Trưởng nhóm": "bg-[var(--gold)]/10 text-[var(--gold)]",
  "LEADER": "bg-[var(--gold)]/10 text-[var(--gold)]",
  "Thành viên": "bg-[var(--card-bg)] text-[var(--text-muted)]",
  "MEMBER": "bg-[var(--card-bg)] text-[var(--text-muted)]",
  "Khách": "bg-[var(--info-light)] text-[var(--info)]",
  "VIEWER": "bg-[var(--info-light)] text-[var(--info)]",
};

const mapRole = (role: string) => {
  if (!role) return "Thành viên";
  if (role === "LEADER" || role === "leader") return "Trưởng nhóm";
  if (role === "MEMBER" || role === "member") return "Thành viên";
  if (role === "VIEWER" || role === "viewer") return "Khách";
  return role;
};

function mapMember(raw: any) {
  const name = raw.HoTen ?? raw.hoTen ?? raw.name ?? "Thành viên";
  return {
    id: raw.MaNguoiDung ?? raw.userId ?? raw.id,
    name: name,
    email: raw.Email ?? raw.email ?? "",
    role: mapRole(raw.VaiTroNhom ?? raw.role ?? raw.VaiTro ?? "MEMBER"),
    color: getMemberColor(name), // Avatar động HSL
    phone: raw.SoDienThoai ?? raw.phone ?? "",
    joinedDate: raw.NgayThamGia
      ? new Date(raw.NgayThamGia).toLocaleDateString("vi-VN")
      : raw.joinedDate ?? "",
  };
}

export function FamilyMembers() {
  const { success, error, info } = useToastContext();
  const { user, groupId } = useAuth();

  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [editMember, setEditMember] = useState<any | null>(null);
  const [viewMember, setViewMember] = useState<any | null>(null);
  const [managePerm, setManagePerm] = useState<any | null>(null);
  const [deleteMember, setDeleteMember] = useState<any | null>(null);
  const [transferLead, setTransferLead] = useState<any | null>(null);
  const [generatingInvite, setGeneratingInvite] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  // OCC & Realtime Activity State
  const [familyInfo, setFamilyInfo] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const fetchFamilyInfoAndLogs = useCallback(async () => {
    if (!groupId) return;
    try {
      // Lấy thông tin nhóm gia đình để phục vụ OCC
      const famRes = await familyApi.getMyFamilies();
      const currentFamily = famRes.data?.find((f: any) => f.MaNhom === groupId);
      if (currentFamily) {
        setFamilyInfo(currentFamily);
        setEditName(currentFamily.TenNhom);
        setEditDesc(currentFamily.MoTa || "");
      }

      // Lấy nhật ký hoạt động realtime của gia đình
      const logRes = await familyApi.getNotifications(groupId);
      setNotifications(logRes.data || []);
    } catch (e) {
      console.warn("Không thể lấy thông tin nhóm hoặc nhật ký hoạt động:", e);
    }
  }, [groupId]);

  const fetchMembers = useCallback(async () => {
    if (!groupId) return;
    setLoading(true);
    try {
      const res = await familyApi.getMembers(groupId);
      const raw = res.data || [];
      const mapped = raw.map(mapMember);
      const currentUserId = user?.MaNguoiDung ?? user?.id;
      if (currentUserId) {
        mapped.sort((a: any, b: any) => {
          if (a.id === currentUserId) return -1;
          if (b.id === currentUserId) return 1;
          return 0;
        });
      }
      setMembers(mapped);
      await fetchFamilyInfoAndLogs();
    } catch (e: any) {
      if (user) {
        setMembers([{
          id: user.MaNguoiDung ?? user.id,
          name: user.HoTen ?? user.hoTen ?? "Tôi",
          email: user.Email ?? user.email ?? "",
          role: "Trưởng nhóm",
          color: getMemberColor(user.HoTen ?? "Tôi"),
          phone: user.SoDienThoai ?? "",
          joinedDate: "",
        }]);
      }
    } finally {
      setLoading(false);
    }
  }, [groupId, user, fetchFamilyInfoAndLogs]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleInvite = async (_data: any) => {
    if (!groupId) {
      error("Lỗi", "Bạn chưa thuộc nhóm nào. Hãy tạo hoặc tham gia nhóm trước.");
      return;
    }
    setGeneratingInvite(true);
    try {
      const res = await familyApi.generateInvite(groupId, 1);
      const code = res.data?.MaCode ?? res.data?.inviteCode ?? res.data?.code ?? "";
      setInviteCode(code);
      setShowInvite(false);
      success(
        "✅ Đã tạo mã mời!",
        `Mã mời: ${code}. Gửi mã này cho thành viên mới để họ tham gia nhóm.`
      );
      await fetchMembers();
    } catch (e: any) {
      error("Lỗi tạo mã mời", e.message || "Không thể tạo mã mời. Vui lòng thử lại.");
    } finally {
      setGeneratingInvite(false);
    }
  };

  const handleEdit = (_data: any) => {
    success("✅ Cập nhật thành công!", `Thông tin đã được cập nhật.`);
    setEditMember(null);
    fetchMembers();
  };

  const handleDelete = async () => {
    if (!deleteMember || !groupId) return;
    try {
      await familyApi.removeMember(groupId, deleteMember.id);
      success(`🗑️ Đã xóa thành viên!`, `${deleteMember.name} đã được xóa khỏi nhóm.`);
      await fetchMembers();
    } catch (e: any) {
      error("Lỗi xóa thành viên", e.message);
    } finally {
      setDeleteMember(null);
    }
  };

  const handleTransferLeadership = async () => {
    if (!transferLead || !groupId) return;
    try {
      await familyApi.transferLeadership(groupId, transferLead.id);
      success("👑 Chuyển giao chủ hộ thành công!", `Quyền Trưởng nhóm đã được chuyển nhượng thành công cho ${transferLead.name}.`);
      await fetchMembers();
    } catch (e: any) {
      error("Lỗi chuyển giao chủ hộ", e.message || "Không thể chuyển nhượng quyền chủ hộ.");
    } finally {
      setTransferLead(null);
    }
  };

  const handleUpdateFamilyInfoOCC = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupId || !familyInfo) return;
    try {
      const lastSeen = familyInfo.NgayCapNhat || familyInfo.ngayCapNhat || new Date().toISOString();
      await familyApi.updateInfo(groupId, {
        name: editName,
        description: editDesc,
        lastSeenUpdatedAt: lastSeen
      });
      success("✅ Cập nhật thông tin thành công!", "Thông tin nhóm gia đình đã được lưu lại.");
      setIsEditingInfo(false);
      await fetchMembers();
    } catch (e: any) {
      error("Lỗi cập nhật", e.message || "Dữ liệu đã bị thay đổi bởi người khác. Vui lòng tải lại.");
    }
  };

  const handleManagePermissions = (_data: any) => {
    success("✅ Cập nhật quyền thành công!", `Quyền của ${managePerm?.name} đã được cập nhật.`);
    setManagePerm(null);
  };

  const handleCopyInviteCode = () => {
    if (!inviteCode) return;
    navigator.clipboard.writeText(inviteCode);
    info("📋 Đã sao chép!", `Mã mời "${inviteCode}" đã được sao chép vào clipboard.`);
  };

  // Xác minh quyền chủ hộ của người dùng hiện tại
  const currentUserObj = members.find(m => m.id === (user?.MaNguoiDung ?? user?.id));
  const isCurrentUserLeader = currentUserObj?.role === "Trưởng nhóm";

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
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="border-[var(--border-light)] text-[var(--text-muted)] hover:border-[var(--purple-deep)] hover:text-[var(--purple-deep)] rounded-[var(--radius-btn)] font-semibold transition-smooth self-start md:self-auto"
            onClick={fetchMembers}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
          <Button
            className="bg-gradient-gold text-white font-semibold shadow-[var(--shadow-btn)] hover-lift rounded-[var(--radius-btn)] px-6 py-6 self-start md:self-auto"
            onClick={() => setShowInvite(true)}
            disabled={generatingInvite || !groupId}
          >
            {generatingInvite ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Plus className="w-5 h-5 mr-2" strokeWidth={2.5} />
            )}
            Mời thành viên
          </Button>
        </div>
      </div>

      {/* Invite code banner */}
      {inviteCode && (
        <div className="flex items-center justify-between p-4 bg-[var(--gold)]/10 border border-[var(--gold)]/30 rounded-[var(--radius)] gap-4">
          <div>
            <p className="font-semibold text-[var(--text-dark)]">🔑 Mã mời hiện tại</p>
            <p className="text-sm text-[var(--text-muted)] mt-0.5">
              Chia sẻ mã này cho thành viên mới để họ tham gia nhóm
            </p>
            <code className="mt-1 inline-block text-lg font-black text-[var(--gold)] tracking-widest">{inviteCode}</code>
          </div>
          <Button
            variant="outline"
            className="border-[var(--gold)] text-[var(--gold)] hover:bg-[var(--gold)] hover:text-white rounded-[var(--radius-sm)] font-semibold shrink-0"
            onClick={handleCopyInviteCode}
          >
            <Copy className="w-4 h-4 mr-2" />
            Sao chép
          </Button>
        </div>
      )}

      {!groupId && (
        <div className="p-4 bg-[var(--warning-light)] border border-[var(--warning)]/30 rounded-[var(--radius)]">
          <p className="font-semibold text-[var(--warning)]">⚠️ Bạn chưa thuộc nhóm nào</p>
          <p className="text-sm text-[var(--text-muted)] mt-1">Hãy tạo hoặc tham gia một nhóm gia đình để quản lý thành viên.</p>
        </div>
      )}

      {/* Grid Layout chính */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* CỘT TRÁI - CHI TIẾT & DANH SÁCH THÀNH VIÊN */}
        <div className="lg:col-span-2 space-y-6">
          
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

          {/* Loading */}
          {loading && (
            <div className="flex justify-center items-center py-8 bg-white rounded-[var(--radius)] shadow-[var(--shadow-card)]">
              <Loader2 className="w-6 h-6 animate-spin text-[var(--purple-deep)] mr-3" />
              <span className="text-[var(--text-muted)]">Đang tải thành viên...</span>
            </div>
          )}

          {/* Members Cards Grid */}
          {!loading && (
            <div className="grid md:grid-cols-2 gap-6">
              {members.map((member) => (
                <Card
                  key={member.id}
                  className="border-none shadow-[var(--shadow-card)] hover:shadow-xl transition-all rounded-[var(--radius)] hover-lift group"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-16 h-16 flex-shrink-0 shadow-md">
                        <AvatarFallback 
                          className="text-white text-xl font-bold" 
                          style={{ backgroundColor: member.color }}
                        >
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <h3 className="font-bold text-[var(--text-dark)] truncate">{member.name}</h3>
                          {(member.role === "Trưởng nhóm" || member.role === "LEADER") && <Crown className="w-4 h-4 text-[var(--gold)] flex-shrink-0" />}
                          {member.id === (user?.MaNguoiDung ?? user?.id) && (
                            <Badge className="bg-[var(--purple-deep)]/10 text-[var(--purple-deep)] border-none text-xs font-semibold">Bạn</Badge>
                          )}
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
                      
                      {/* Chuyển chủ hộ (Chỉ Leader mới được thấy nút này cho các thành viên khác) */}
                      {isCurrentUserLeader && member.role !== "Trưởng nhóm" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-[var(--radius-sm)] hover:border-[var(--gold)] hover:text-[var(--gold)] transition-smooth px-2"
                          onClick={() => setTransferLead(member)}
                          title="Chuyển nhượng quyền chủ hộ"
                        >
                          <Crown className="w-3.5 h-3.5 text-[var(--gold)]" />
                        </Button>
                      )}

                      {member.role !== "Trưởng nhóm" && member.id !== (user?.MaNguoiDung ?? user?.id) && (
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

              {members.length === 0 && !loading && (
                <div className="col-span-2 text-center py-16">
                  <p className="font-semibold text-[var(--text-muted)]">Chưa có thành viên nào</p>
                  <p className="text-sm text-[var(--text-muted)] mt-1">Mời thành viên vào nhóm để bắt đầu</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* CỘT PHẢI - OCC EDIT PANEL & REALTIME ACTIVITY LOG */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Cấu hình Nhóm gia đình - OCC Control */}
          {familyInfo && (
            <Card className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)] bg-white overflow-hidden">
              <CardHeader className="bg-gradient-gold p-4 text-white">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Cấu hình gia đình
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                {!isEditingInfo ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wider block">Tên gia đình</label>
                      <p className="text-lg font-black text-[var(--text-dark)] mt-0.5">{familyInfo.TenNhom}</p>
                    </div>
                    <div>
                      <label className="text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wider block">Mô tả</label>
                      <p className="text-sm text-[var(--text-dark)] mt-0.5 whitespace-pre-wrap">{familyInfo.MoTa || "Không có mô tả."}</p>
                    </div>
                    
                    {isCurrentUserLeader && (
                      <Button 
                        variant="outline"
                        className="w-full border-[var(--gold)] text-[var(--gold)] hover:bg-[var(--gold)] hover:text-white rounded-[var(--radius-sm)] font-bold mt-2"
                        onClick={() => setIsEditingInfo(true)}
                      >
                        <Pencil className="w-4 h-4 mr-2" />
                        Chỉnh sửa
                      </Button>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleUpdateFamilyInfoOCC} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[var(--text-dark)]">Tên gia đình</label>
                      <input 
                        type="text" 
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[var(--text-dark)]">Mô tả</label>
                      <textarea 
                        value={editDesc}
                        onChange={e => setEditDesc(e.target.value)}
                        className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--gold)] min-h-[80px]"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        type="submit" 
                        className="flex-1 bg-gradient-gold text-white font-bold"
                      >
                        Lưu
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => setIsEditingInfo(false)}
                      >
                        Hủy
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          )}

          {/* Nhật ký hoạt động Realtime */}
          <Card className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)] bg-white overflow-hidden">
            <CardHeader className="border-b border-[var(--border-light)] p-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-[var(--text-dark)]">
                <Bell className="w-5 h-5 text-[var(--purple-deep)]" />
                Nhật ký hoạt động
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 max-h-[400px] overflow-y-auto space-y-3 custom-scrollbar">
              {notifications.map((notif) => (
                <div key={notif.Id} className="flex items-start gap-3 p-3 bg-[var(--card-bg)] rounded-xl border border-[var(--border-light)]">
                  <div className="w-2 h-2 bg-[var(--purple-deep)] rounded-full mt-1.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[var(--text-dark)] font-medium leading-relaxed">{notif.NoiDung}</p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-1 font-medium">
                      {new Date(notif.NgayTao).toLocaleString("vi-VN")}
                    </p>
                  </div>
                </div>
              ))}

              {notifications.length === 0 && (
                <div className="text-center py-8 text-sm text-[var(--text-muted)] font-medium">
                  Chưa có nhật ký hoạt động nào.
                </div>
              )}
            </CardContent>
          </Card>

        </div>
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

      <ConfirmDialog
        isOpen={!!transferLead}
        onClose={() => setTransferLead(null)}
        onConfirm={handleTransferLeadership}
        title="Chuyển nhượng quyền chủ hộ?"
        message={`Bạn có chắc muốn chuyển quyền Trưởng nhóm cho "${transferLead?.name}" không? Bạn sẽ trở thành Thành viên thường và mất toàn bộ quyền quản trị gia đình.`}
        confirmText="Xác nhận"
        cancelText="Hủy"
        type="warning"
      />
    </div>
  );
}