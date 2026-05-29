import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { adminApi } from "../services/api";

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

interface AdminContextType {
  users: AdminUser[];
  setUsers: (u: AdminUser[]) => void;
  auditLogs: AuditLog[];
  addLog: (log: Omit<AuditLog, "id" | "timestamp">) => void;
  dashStats: any;
  loading: boolean;
  reload: () => Promise<void>;
  cleanupFakeUsers: () => Promise<number>;
}

const AdminContext = createContext<AdminContextType | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [users, setUsersState] = useState<AdminUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [dashStats, setDashStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, statsRes, logsRes] = await Promise.all([
        adminApi.getUsers(),
        adminApi.getDashboard(),
        adminApi.getAuditLogs()
      ]);

      const mappedUsers = (usersRes.data || []).map((u: any) => ({
        id: String(u.MaNguoiDung),
        name: u.HoTen,
        email: u.Email,
        phone: u.DienThoai || '-',
        address: u.DiaChi || '-',
        role: String(u.VaiTro).toLowerCase() as UserRole,
        status: String(u.TrangThai).toLowerCase() as UserStatus,
        groups: u.SoNhom || 0,
        avatar: u.HoTen.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2),
        joinDate: String(u.NgayTao || '').slice(0, 10),
        lastLogin: '-',
      }));

      setUsersState(mappedUsers);
      setDashStats(statsRes.data);
      setAuditLogs(logsRes.data || []);
    } catch (e) {
      console.error("Failed to load admin context data from API:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Wrapper setUsers để tương thích với các lệnh sửa cục bộ trong UI cũ
  const setUsers = (newUsers: AdminUser[]) => {
    setUsersState(newUsers);
  };

  const addLog = async (log: Omit<AuditLog, "id" | "timestamp">) => {
    // Audit logs được lưu trực tiếp ở Backend thông qua các thao tác tương tác API
    // Tuy nhiên chúng ta vẫn giữ hàm này cho tương thích ngược
    const now = new Date();
    const ts = now.toISOString().replace("T", " ").slice(0, 19);
    setAuditLogs(prev => [{ ...log, id: Date.now().toString(), timestamp: ts } as AuditLog, ...prev]);
  };

  const cleanupFakeUsers = async (): Promise<number> => {
    try {
      const res = await adminApi.cleanupFakeUsers();
      await loadData();
      return res.data?.cleanedCount || 0;
    } catch (e) {
      console.error("Failed to cleanup fake accounts:", e);
      return 0;
    }
  };

  return (
    <AdminContext.Provider value={{ 
      users, 
      setUsers, 
      auditLogs, 
      addLog, 
      dashStats, 
      loading, 
      reload: loadData,
      cleanupFakeUsers
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}
