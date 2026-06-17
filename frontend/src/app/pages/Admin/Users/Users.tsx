import { useState, useMemo } from "react";
import { Search, Plus, MoreVertical, Edit, Trash2, Eye, Users as UsersIcon, Phone, MapPin, Shield, Ban, RefreshCw, CheckCircle, UserCheck, Download, AlertTriangle } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Card, CardContent } from "../../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { Badge } from "../../../components/ui/badge";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { PageHeader } from "../../../components/common/PageHeader";
import { AddEditUserModal } from "../../../components/common/AddEditUserModal";
import { toast } from "../../../components/common/Toast";
import { useAdmin, AdminUser } from "../../../context/AdminContext";
import { ViewUserModal } from "./ViewUserModal";
import { adminApi } from "../../../services/api";
import Modal from "../../../components/common/Modal";

const PAGE_SIZE = 8;

const roleConfig: Record<string, { label: string; cls: string }> = {
  admin: { label: "Quản trị viên", cls: "bg-purple-100 text-purple-700 border-purple-200" },
  moderator: { label: "Kiểm duyệt", cls: "bg-blue-100 text-blue-700 border-blue-200" },
  user: { label: "Người dùng", cls: "bg-gray-100 text-gray-600 border-gray-200" },
};

const statusConfig: Record<string, { label: string; cls: string }> = {
  active: { label: "Hoạt động", cls: "bg-green-100 text-green-700 border-green-200" },
  inactive: { label: "Tạm ngưng", cls: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  banned: { label: "Bị cấm", cls: "bg-red-100 text-red-700 border-red-200" },
};

const filterTabs = [
  { key: "all", label: "Tất cả" },
  { key: "admin", label: "Admin" },
  { key: "moderator", label: "Kiểm duyệt" },
  { key: "user", label: "Người dùng" },
  { key: "active", label: "Hoạt động" },
  { key: "inactive", label: "Tạm ngưng" },
  { key: "banned", label: "Bị cấm" },
];

function UserActionModal({
  user, onClose, onView, onEdit, onBan, onReset, onDelete,
}: {
  user: AdminUser | null; onClose: () => void;
  onView: () => void; onEdit: () => void;
  onBan: () => void; onReset: () => void; onDelete: () => void;
}) {
  if (!user) return null;
  const isBanned = user.status === "banned";

  const actions = [
    { icon: Eye, label: "Xem chi tiết", color: "text-[var(--purple-deep)]", bg: "hover:bg-purple-50", onClick: onView },
    { icon: Edit, label: "Chỉnh sửa", color: "text-blue-600", bg: "hover:bg-blue-50", onClick: onEdit },
    { icon: RefreshCw, label: "Reset mật khẩu", color: "text-green-600", bg: "hover:bg-green-50", onClick: onReset },
    {
      icon: isBanned ? UserCheck : Ban,
      label: isBanned ? "Bỏ cấm tài khoản" : "Cấm tài khoản",
      color: isBanned ? "text-green-700" : "text-orange-600",
      bg: isBanned ? "hover:bg-green-50" : "hover:bg-orange-50",
      onClick: onBan,
    },
    { icon: Trash2, label: "Xóa người dùng", color: "text-red-600", bg: "hover:bg-red-50", onClick: onDelete },
  ];

  return (
    <Modal isOpen={!!user} onClose={onClose} title={`Thao tác: ${user.name}`} size="sm">
      <div className="p-2 space-y-1">
        {actions.map(({ icon: Icon, label, color, bg, onClick }) => (
          <button
            key={label}
            onClick={() => { onClick(); onClose(); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-[var(--radius-sm)] transition-smooth ${bg} text-left`}
          >
            <Icon className={`w-5 h-5 ${color} flex-shrink-0`} strokeWidth={2.5} />
            <span className={`font-semibold text-sm ${color}`}>{label}</span>
          </button>
        ))}
      </div>
    </Modal>
  );
}

export function Users() {
  const { users, reload } = useAdmin();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [actionUser, setActionUser] = useState<AdminUser | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [resetPwResult, setResetPwResult] = useState<{ user: AdminUser; tempPassword: string } | null>(null);

  const filtered = useMemo(() => {
    return users.filter(u => {
      const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.phone.includes(search);
      const matchTab = activeTab === "all" ? true :
        ["admin", "moderator", "user"].includes(activeTab) ? u.role === activeTab :
        u.status === activeTab;
      return matchSearch && matchTab;
    });
  }, [users, search, activeTab]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter(u => u.status === "active").length,
    banned: users.filter(u => u.status === "banned").length,
    admins: users.filter(u => u.role === "admin").length,
  }), [users]);

  const handleAdd = () => { setSelectedUser(null); setModalMode("add"); setEditOpen(true); };
  const handleEdit = (u: AdminUser) => { setSelectedUser(u); setModalMode("edit"); setEditOpen(true); };
  const handleView = (u: AdminUser) => { setSelectedUser(u); setViewOpen(true); };
  const handleDelete = (u: AdminUser) => { setSelectedUser(u); setDeleteConfirmText(""); setDeleteOpen(true); };

  const handleBanToggle = async (u: AdminUser) => {
    try {
      const isBanned = u.status === "banned";
      const nextStatus = isBanned ? "ACTIVE" : "BANNED";
      await adminApi.updateStatus(Number(u.id), nextStatus);
      await reload();
      toast.success(isBanned ? `Đã bỏ cấm tài khoản "${u.name}"` : `Đã khóa tài khoản "${u.name}"`);
    } catch (e: any) {
      toast.error(e.message || "Thao tác thất bại");
    }
  };

  const handleResetPw = async (u: AdminUser) => {
    try {
      const res = await adminApi.resetPassword(Number(u.id));
      setResetPwResult({ user: u, tempPassword: res.data.tempPassword });
    } catch (e: any) {
      toast.error(e.message || "Reset mật khẩu thất bại");
    }
  };

  const handleSave = async (data: any) => {
    try {
      if (modalMode === "add") {
        toast.info("Vui lòng đăng ký tài khoản qua cổng xác thực công cộng để đảm bảo tính toàn vẹn bảo mật.");
      } else if (selectedUser) {
        // Cập nhật vai trò nếu thay đổi
        if (data.role && data.role.toUpperCase() !== selectedUser.role.toUpperCase()) {
          await adminApi.updateRole(Number(selectedUser.id), data.role.toUpperCase());
        }
        // Cập nhật trạng thái nếu thay đổi
        if (data.status && data.status.toUpperCase() !== selectedUser.status.toUpperCase()) {
          await adminApi.updateStatus(Number(selectedUser.id), data.status.toUpperCase());
        }
        await reload();
        toast.success("Cập nhật thông tin tài khoản thành công!");
      }
      setEditOpen(false);
    } catch (e: any) {
      toast.error(e.message || "Cập nhật tài khoản thất bại");
    }
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;
    if (deleteConfirmText !== "XÓA") {
      toast.error("Vui lòng nhập chính xác từ XÓA để xác nhận");
      return;
    }
    try {
      await adminApi.deleteUser(Number(selectedUser.id));
      await reload();
      toast.success(`Đã xóa mềm thành công người dùng "${selectedUser.name}"`);
      setDeleteOpen(false);
      setDeleteConfirmText("");
    } catch (e: any) {
      toast.error(e.message || "Xóa người dùng thất bại");
    }
  };

  const exportCSV = () => {
    const rows = [["ID","Tên","Email","SĐT","Địa chỉ","Vai trò","Trạng thái","Ngày tham gia"],
      ...filtered.map(u => [u.id,u.name,u.email,u.phone,u.address,u.role,u.status,u.joinDate])];
    const csv = "\uFEFF" + rows.map(r => r.join(",")).join("\n"); // Excel UTF-8 BOM
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "danh_sach_nguoi_dung.csv"; 
    a.click();
    toast.success("Đã xuất danh sách người dùng thành công!");
  };

  const statCards = [
    { label: "Tổng người dùng", value: stats.total, icon: UsersIcon, color: "from-[var(--purple-deep)] to-[var(--purple-light)]" },
    { label: "Đang hoạt động", value: stats.active, icon: CheckCircle, color: "from-green-500 to-green-400" },
    { label: "Bị cấm", value: stats.banned, icon: Ban, color: "from-red-500 to-red-400" },
    { label: "Quản trị viên", value: stats.admins, icon: Shield, color: "from-[var(--gold)] to-yellow-400" },
  ];

  return (
    <div className="space-y-6 animate-slide-up">
      <PageHeader
        title="Quản lý người dùng"
        description={`${stats.total} người dùng trong hệ thống`}
        icon={UsersIcon}
        action={
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={exportCSV} className="rounded-[var(--radius-sm)] border-[var(--border-light)] font-semibold">
              <Download className="w-4 h-4 mr-2" />Xuất CSV
            </Button>
            <Button onClick={handleAdd} className="bg-gradient-purple text-white rounded-[var(--radius-sm)] shadow-[var(--shadow-btn)] hover-lift font-semibold">
              <Plus className="w-5 h-5 mr-2" strokeWidth={2.5} />Thêm người dùng
            </Button>
          </div>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <Card key={i} className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)] bg-white">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-[12px] bg-gradient-to-br ${s.color} flex items-center justify-center shadow-md flex-shrink-0`}>
                  <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-2xl font-black text-[var(--text-dark)]">{s.value}</p>
                  <p className="text-xs font-semibold text-[var(--text-muted)]">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Search + Filter */}
      <Card className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)] bg-white">
        <CardContent className="p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
            <Input placeholder="Tìm theo tên, email, số điện thoại..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="pl-10 h-11 rounded-[var(--radius-sm)] border-[var(--border-light)] focus-visible:ring-[var(--purple-deep)]" />
          </div>
          <div className="flex flex-wrap gap-2">
            {filterTabs.map(tab => (
              <button key={tab.key} onClick={() => { setActiveTab(tab.key); setPage(1); }}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-smooth ${activeTab === tab.key ? "bg-gradient-purple text-white shadow-[var(--shadow-btn)]" : "bg-[var(--card-bg)] text-[var(--text-muted)] hover:bg-white hover:text-[var(--text-dark)]"}`}>
                {tab.label}
                <span className="ml-1.5 opacity-70">
                  ({tab.key === "all" ? users.length : ["admin","moderator","user"].includes(tab.key) ? users.filter(u => u.role === tab.key).length : users.filter(u => u.status === tab.key).length})
                </span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)] bg-white">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-[var(--border-light)] hover:bg-transparent bg-[var(--card-bg)]">
                  <TableHead className="font-bold text-[var(--text-dark)] pl-6">Người dùng</TableHead>
                  <TableHead className="font-bold text-[var(--text-dark)]">Liên hệ</TableHead>
                  <TableHead className="font-bold text-[var(--text-dark)]">Vai trò</TableHead>
                  <TableHead className="font-bold text-[var(--text-dark)]">Nhóm</TableHead>
                  <TableHead className="font-bold text-[var(--text-dark)]">Ngày tham gia</TableHead>
                  <TableHead className="font-bold text-[var(--text-dark)]">Trạng thái</TableHead>
                  <TableHead className="font-bold text-[var(--text-dark)] text-right pr-6">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-16 text-[var(--text-muted)]">
                      <UsersIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />Không tìm thấy người dùng
                    </TableCell>
                  </TableRow>
                )}
                {paginated.map(user => (
                  <TableRow key={user.id} className="border-[var(--border-light)] hover:bg-[var(--card-bg)] transition-smooth">
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        <Avatar className={`w-10 h-10 border-2 ${user.status === "banned" ? "border-red-200" : "border-[var(--purple-light)]"}`}>
                          <AvatarFallback className={`font-bold text-sm ${user.status === "banned" ? "bg-red-100 text-red-600" : "bg-gradient-purple text-white"}`}>
                            {user.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold text-[var(--text-dark)]">{user.name}</p>
                          <p className="text-sm text-[var(--text-muted)]">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <p className="text-sm font-semibold text-[var(--text-dark)] flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-[var(--purple-deep)]" />{user.phone}
                        </p>
                        <p className="text-xs text-[var(--text-muted)] flex items-center gap-1.5">
                          <MapPin className="w-3 h-3" />{user.address}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${roleConfig[user.role]?.cls} rounded-full px-3 py-1 font-semibold text-xs`}>
                        {roleConfig[user.role]?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-[var(--purple-deep)]">{user.groups}</span>
                      <span className="text-xs text-[var(--text-muted)] ml-1">nhóm</span>
                    </TableCell>
                    <TableCell className="text-sm text-[var(--text-muted)] font-medium">{user.joinDate}</TableCell>
                    <TableCell>
                      <Badge className={`${statusConfig[user.status]?.cls} rounded-full px-3 py-1 font-semibold text-xs`}>
                        {statusConfig[user.status]?.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Button
                        variant="ghost" size="icon"
                        onClick={() => setActionUser(user)}
                        className="rounded-[8px] hover:bg-[var(--card-bg)] text-[var(--text-muted)] hover:text-[var(--purple-deep)]"
                      >
                        <MoreVertical className="w-4 h-4" strokeWidth={2.5} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--border-light)] flex-wrap gap-4">
            <p className="text-sm text-[var(--text-muted)]">
              Hiển thị {Math.min((page-1)*PAGE_SIZE+1, filtered.length)}–{Math.min(page*PAGE_SIZE, filtered.length)} / {filtered.length} người dùng
            </p>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)} className="rounded-[8px] border-[var(--border-light)] font-semibold">‹ Trước</Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-[8px] text-sm font-bold transition-smooth ${p === page ? "bg-gradient-purple text-white shadow-[var(--shadow-btn)]" : "text-[var(--text-muted)] hover:bg-[var(--card-bg)]"}`}>{p}</button>
              ))}
              <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="rounded-[8px] border-[var(--border-light)] font-semibold">Sau ›</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Modal (replaces Dropdown to avoid z-index issues) */}
      <UserActionModal
        user={actionUser}
        onClose={() => setActionUser(null)}
        onView={() => handleView(actionUser!)}
        onEdit={() => handleEdit(actionUser!)}
        onBan={() => handleBanToggle(actionUser!)}
        onReset={() => handleResetPw(actionUser!)}
        onDelete={() => handleDelete(actionUser!)}
      />

      <ViewUserModal isOpen={viewOpen} onClose={() => setViewOpen(false)} user={selectedUser}
        onEdit={u => { setViewOpen(false); handleEdit(u); }}
        onBanToggle={u => { setViewOpen(false); handleBanToggle(u); }}
        onDelete={u => { setViewOpen(false); handleDelete(u); }}
      />
      <AddEditUserModal isOpen={editOpen} onClose={() => setEditOpen(false)} onSave={handleSave}
        user={selectedUser} mode={modalMode} existingEmails={users.map(u => u.email)} />

      {/* Modal hiển thị mật khẩu tạm thời sau khi reset */}
      <Modal
        isOpen={!!resetPwResult}
        onClose={() => setResetPwResult(null)}
        title="Reset mật khẩu thành công"
        size="sm"
      >
        <div className="space-y-4 p-1">
          <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-xl text-green-900 text-sm">
            <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Mật khẩu đã được đặt lại!</p>
              <p className="text-xs text-green-700 mt-0.5">
                Vui lòng gửi mật khẩu tạm thời này cho người dùng <strong>{resetPwResult?.user.name}</strong> và yêu cầu đổi ngay sau khi đăng nhập.
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Mật khẩu tạm thời</p>
            <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg border border-gray-200">
              <code className="flex-1 font-mono text-lg font-black text-[var(--purple-deep)] tracking-widest">
                {resetPwResult?.tempPassword}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(resetPwResult?.tempPassword || "");
                  toast.success("Đã sao chép mật khẩu!");
                }}
                className="rounded-lg text-xs"
              >
                Sao chép
              </Button>
            </div>
          </div>
          <Button onClick={() => setResetPwResult(null)} className="w-full bg-gradient-purple text-white font-bold rounded-lg">
            Đã hiểu
          </Button>
        </div>
      </Modal>

      {/* Giao diện Xác nhận xóa 2 lớp cực kỳ an toàn */}
      <Modal
        isOpen={deleteOpen} 
        onClose={() => { setDeleteOpen(false); setDeleteConfirmText(""); }} 
        title="Xác nhận xóa tài khoản nguy hiểm"
        size="sm"
      >
        <div className="space-y-4 p-1">
          <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-900 text-sm">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Hành động này cực kỳ nguy hiểm!</p>
              <p className="text-xs text-red-700 mt-0.5">Tài khoản sẽ bị xóa mềm và không thể truy cập hệ thống. Các liên kết giỏ hàng sẽ bị vô hiệu hóa.</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-700">
              Bạn có chắc chắn muốn xóa người dùng <strong>"{selectedUser?.name}"</strong>?
            </p>
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-black text-gray-500 block">
                Nhập chữ <span className="text-red-600 font-extrabold bg-red-50 px-1.5 py-0.5 rounded">XÓA</span> để xác nhận:
              </label>
              <Input 
                placeholder="Gõ XÓA" 
                value={deleteConfirmText}
                onChange={e => setDeleteConfirmText(e.target.value)}
                className="rounded-lg border-gray-300 focus-visible:ring-red-500 focus-visible:border-red-500 font-bold"
              />
            </div>
          </div>

          <div className="flex gap-2.5 pt-2">
            <Button 
              variant="outline" 
              onClick={() => { setDeleteOpen(false); setDeleteConfirmText(""); }}
              className="flex-1 rounded-lg"
            >
              Hủy
            </Button>
            <Button 
              onClick={confirmDelete}
              disabled={deleteConfirmText !== "XÓA"}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white font-bold rounded-lg shadow-sm"
            >
              Xóa người dùng
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
