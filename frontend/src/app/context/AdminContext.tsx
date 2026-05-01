import { createContext, useContext, useState, ReactNode } from "react";

export type UserStatus = "active" | "inactive" | "banned";
export type UserRole = "admin" | "moderator" | "user";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: UserRole;
  status: UserStatus;
  groups: number;
  avatar: string;
  joinDate: string;
  lastLogin: string;
  adminNote?: string;
}

export interface AuditLog {
  id: string;
  user: string;
  action: string;
  type: string;
  status: "success" | "error" | "warning";
  description: string;
  ip: string;
  timestamp: string;
}

const initialUsers: AdminUser[] = [
  { id: "1", name: "Nguyễn Văn An", email: "vanan@email.com", phone: "0123456789", address: "Hà Nội", role: "user", status: "active", groups: 2, avatar: "NA", joinDate: "2025-01-15", lastLogin: "2026-04-28" },
  { id: "2", name: "Trần Thị Bích", email: "thib@email.com", phone: "0987654321", address: "Hồ Chí Minh", role: "admin", status: "active", groups: 1, avatar: "TB", joinDate: "2024-08-10", lastLogin: "2026-04-29" },
  { id: "3", name: "Lê Văn Cường", email: "vanc@email.com", phone: "0369852147", address: "Đà Nẵng", role: "user", status: "inactive", groups: 3, avatar: "LC", joinDate: "2025-03-22", lastLogin: "2026-03-10" },
  { id: "4", name: "Phạm Thị Dung", email: "thid@email.com", phone: "0147258369", address: "Cần Thơ", role: "moderator", status: "active", groups: 2, avatar: "PD", joinDate: "2025-05-01", lastLogin: "2026-04-27" },
  { id: "5", name: "Hoàng Văn Em", email: "vane@email.com", phone: "0912345678", address: "Hải Phòng", role: "user", status: "banned", groups: 0, avatar: "HE", joinDate: "2025-07-14", lastLogin: "2026-02-01", adminNote: "Vi phạm điều khoản sử dụng" },
  { id: "6", name: "Vũ Thị Phương", email: "thiph@email.com", phone: "0934567890", address: "Huế", role: "user", status: "active", groups: 4, avatar: "VP", joinDate: "2025-06-30", lastLogin: "2026-04-28" },
  { id: "7", name: "Đặng Minh Quân", email: "minhq@email.com", phone: "0956789012", address: "Nha Trang", role: "moderator", status: "active", groups: 3, avatar: "DQ", joinDate: "2024-12-01", lastLogin: "2026-04-26" },
  { id: "8", name: "Bùi Thị Hoa", email: "thiho@email.com", phone: "0978901234", address: "Đà Lạt", role: "user", status: "inactive", groups: 1, avatar: "BH", joinDate: "2026-01-10", lastLogin: "2026-03-20" },
  { id: "9", name: "Ngô Văn Khoa", email: "vankh@email.com", phone: "0901234567", address: "Vũng Tàu", role: "user", status: "active", groups: 2, avatar: "NK", joinDate: "2026-02-14", lastLogin: "2026-04-29" },
  { id: "10", name: "Lý Thị Lan", email: "thila@email.com", phone: "0923456789", address: "Cần Thơ", role: "admin", status: "active", groups: 5, avatar: "LL", joinDate: "2024-06-01", lastLogin: "2026-04-29" },
  { id: "11", name: "Trịnh Quốc Minh", email: "quocm@email.com", phone: "0945678901", address: "Hà Nội", role: "user", status: "banned", groups: 0, avatar: "TM", joinDate: "2025-09-15", lastLogin: "2026-01-05", adminNote: "Spam hệ thống" },
  { id: "12", name: "Cao Thị Ngân", email: "thin@email.com", phone: "0967890123", address: "Hồ Chí Minh", role: "user", status: "active", groups: 1, avatar: "CN", joinDate: "2026-03-01", lastLogin: "2026-04-28" },
];

const initialLogs: AuditLog[] = [
  { id: "1", user: "Trần Thị Bích", action: "Đăng nhập", type: "auth", status: "success", description: "Đăng nhập thành công vào hệ thống", ip: "192.168.1.100", timestamp: "2026-04-29 01:30:00" },
  { id: "2", user: "Lý Thị Lan", action: "Cập nhật người dùng", type: "user", status: "success", description: "Cập nhật thông tin người dùng: Lê Văn Cường", ip: "192.168.1.101", timestamp: "2026-04-29 01:15:12" },
  { id: "3", user: "Trần Thị Bích", action: "Cấm tài khoản", type: "user", status: "warning", description: "Đã cấm tài khoản: Hoàng Văn Em", ip: "192.168.1.100", timestamp: "2026-04-28 23:00:33" },
  { id: "4", user: "Lê Văn Cường", action: "Tạo công thức", type: "recipe", status: "success", description: "Tạo công thức mới: Canh chua cá lóc", ip: "192.168.1.102", timestamp: "2026-04-28 22:15:08" },
  { id: "5", user: "Đặng Minh Quân", action: "Thay đổi cài đặt", type: "settings", status: "warning", description: "Thay đổi cấu hình hệ thống: Timeout = 3600s", ip: "192.168.1.103", timestamp: "2026-04-28 21:10:22" },
  { id: "6", user: "Lý Thị Lan", action: "Xuất báo cáo", type: "report", status: "success", description: "Xuất báo cáo doanh thu tháng 4", ip: "192.168.1.104", timestamp: "2026-04-28 20:05:54" },
  { id: "7", user: "Admin System", action: "Xóa dữ liệu", type: "data", status: "error", description: "Thất bại khi xóa dữ liệu: Permission denied", ip: "192.168.1.1", timestamp: "2026-04-28 19:00:00" },
  { id: "8", user: "Nguyễn Văn An", action: "Tạo danh sách mua sắm", type: "shopping", status: "success", description: "Tạo danh sách: Tiệc cuối tuần", ip: "192.168.1.105", timestamp: "2026-04-28 18:30:00" },
];

interface AdminContextType {
  users: AdminUser[];
  setUsers: (u: AdminUser[]) => void;
  auditLogs: AuditLog[];
  addLog: (log: Omit<AuditLog, "id" | "timestamp">) => void;
}

const AdminContext = createContext<AdminContextType | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialLogs);

  const addLog = (log: Omit<AuditLog, "id" | "timestamp">) => {
    const now = new Date();
    const ts = now.toISOString().replace("T", " ").slice(0, 19);
    setAuditLogs(prev => [{ ...log, id: Date.now().toString(), timestamp: ts }, ...prev]);
  };

  return (
    <AdminContext.Provider value={{ users, setUsers, auditLogs, addLog }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}
