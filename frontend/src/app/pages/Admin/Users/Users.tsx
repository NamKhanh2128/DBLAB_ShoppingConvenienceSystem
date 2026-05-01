import { useState, useMemo } from "react";
import { Search, Plus, MoreVertical, Edit, Trash2, Eye, Users as UsersIcon, Phone, MapPin, Shield, Ban, RefreshCw, CheckCircle, UserCheck, Download, X } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Card, CardContent } from "../../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { Badge } from "../../../components/ui/badge";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { PageHeader } from "../../../components/common/PageHeader";
import { AddEditUserModal } from "../../../components/common/AddEditUserModal";
import { ConfirmDialog } from "../../../components/common/ConfirmDialog";
import { toast } from "../../../components/common/Toast";
import { useAdmin, AdminUser } from "../../../context/AdminContext";
import { ViewUserModal } from "./ViewUserModal";
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

// Custom Action Modal — bypass Radix Portal z-index issues
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
  const { users, setUsers, addLog } = useAdmin();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [actionUser, setActionUser] = useState<AdminUser | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");

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
  const handleDelete = (u: AdminUser) => { setSelectedUser(u); setDeleteOpen(true); };

  const handleBanToggle = (u: AdminUser) => {
    const isBanned = u.status === "banned";
    setUsers(users.map(x => x.id === u.id ? { ...x, status: isBanned ? "active" : "banned" } : x));
    addLog({ user: "Admin", action: isBanned ? "Bỏ cấm tài khoản" : "Cấm tài khoản", type: "user", status: "warning", description: `${isBanned ? "Bỏ cấm" : "Đã cấm"}: ${u.name}`, ip: "192.168.1.1" });
    toast.success(isBanned ? `Đã bỏ cấm "${u.name}"` : `Đã cấm "${u.name}"`);
  };

  const handleResetPw = (u: AdminUser) => {
    addLog({ user: "Admin", action: "Reset mật khẩu", type: "user", status: "success", description: `Reset mật khẩu: ${u.name}`, ip: "192.168.1.1" });
    toast.success(`Đã gửi email reset tới "${u.email}"`);
  };

  const handleSave = (data: any) => {
    if (modalMode === "add") {
      const newUser: AdminUser = {
        ...data, id: Date.now().toString(), groups: 0,
        avatar: data.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2),
        joinDate: new Date().toISOString().slice(0, 10), lastLogin: "-",
      };
      setUsers([...users, newUser]);
      addLog({ user: "Admin", action: "Thêm người dùng", type: "user", status: "success", description: `Tạo tài khoản: ${newUser.name}`, ip: "192.168.1.1" });
      toast.success("Đã thêm người dùng mới!");
    } else if (selectedUser) {
      setUsers(users.map(u => u.id === selectedUser.id ? { ...u, ...data } : u));
      addLog({ user: "Admin", action: "Cập nhật người dùng", type: "user", status: "success", description: `Cập nhật: ${selectedUser.name}`, ip: "192.168.1.1" });
      toast.success("Đã cập nhật thông tin!");
    }
    setEditOpen(false);
  };

  const confirmDelete = () => {
    if (!selectedUser) return;
    setUsers(users.filter(u => u.id !== selectedUser.id));
    addLog({ user: "Admin", action: "Xóa người dùng", type: "user", status: "warning", description: `Xóa: ${selectedUser.name}`, ip: "192.168.1.1" });
    toast.success(`Đã xóa "${selectedUser.name}"`);
    setDeleteOpen(false);
  };

  const exportCSV = () => {
    const rows = [["ID","Tên","Email","SĐT","Địa chỉ","Vai trò","Trạng thái","Ngày tham gia","Đăng nhập cuối"],
      ...filtered.map(u => [u.id,u.name,u.email,u.phone,u.address,u.role,u.status,u.joinDate,u.lastLogin])];
    const csv = rows.map(r => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = "users.csv"; a.click();
    toast.success("Đã xuất danh sách người dùng!");
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
          <div className="flex gap-2">
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
                  <TableHead className="font-bold text-[var(--text-dark)]">Đăng nhập cuối</TableHead>
                  <TableHead className="font-bold text-[var(--text-dark)]">Trạng thái</TableHead>
                  <TableHead className="font-bold text-[var(--text-dark)] text-right pr-6">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-16 text-[var(--text-muted)]">
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
                    <TableCell className="text-sm text-[var(--text-muted)] font-medium">{user.lastLogin}</TableCell>
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
          <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--border-light)]">
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
      <ConfirmDialog isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={confirmDelete}
        title="Xác nhận xóa người dùng"
        description={`Bạn có chắc muốn xóa "${selectedUser?.name}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa" variant="danger" />
    </div>
  );
}
