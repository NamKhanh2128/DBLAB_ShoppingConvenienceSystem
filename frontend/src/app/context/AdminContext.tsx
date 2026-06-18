import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { adminApi, authApi, setToken, removeToken, removeUser } from "../services/api";

// ─── Type Definitions ─────────────────────────────────────────────────────────

export type UserStatus = "active" | "locked" | "deleted";
export type UserRole = "admin" | "member";

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
  has2FA?: boolean;
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

// Thông tin admin đang đăng nhập (tách biệt với danh sách users)
export interface AdminSession {
  id: number;
  name: string;
  email: string;
  role: string;
}

// ─── Context Type ─────────────────────────────────────────────────────────────

interface AdminContextType {
  // Admin auth state
  adminUser: AdminSession | null;
  isAdminAuthenticated: boolean;
  loginAdmin: (email: string, password: string) => Promise<void>;
  logoutAdmin: () => Promise<void>;

  // Data
  users: AdminUser[];
  setUsers: (u: AdminUser[]) => void;
  auditLogs: AuditLog[];
  addLog: (log: Omit<AuditLog, "id" | "timestamp">) => void;
  dashStats: any;
  reportsStats: any;
  loading: boolean;
  reload: () => Promise<void>;
  cleanupFakeUsers: () => Promise<number>;
}

// ─── Local Storage Key ────────────────────────────────────────────────────────

const ADMIN_SESSION_KEY = "admin_session";

const getAdminSession = (): AdminSession | null => {
  try {
    const s = localStorage.getItem(ADMIN_SESSION_KEY);
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
};

const setAdminSession = (session: AdminSession) => {
  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
};

const removeAdminSession = () => {
  localStorage.removeItem(ADMIN_SESSION_KEY);
};

// ─── Context ──────────────────────────────────────────────────────────────────

const AdminContext = createContext<AdminContextType | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [adminUser, setAdminUser] = useState<AdminSession | null>(getAdminSession());
  const [users, setUsersState] = useState<AdminUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [dashStats, setDashStats] = useState<any>(null);
  const [reportsStats, setReportsStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const isAdminAuthenticated = adminUser !== null;

  // ── Login Admin ─────────────────────────────────────────────────────────────

  const loginAdmin = async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    const { user, token } = res.data;

    // Kiểm tra role phải là ADMIN
    if (!user || user.VaiTro !== "ADMIN") {
      throw new Error("Tài khoản này không có quyền truy cập Admin Panel. Vui lòng sử dụng tài khoản quản trị viên.");
    }

    // Lưu access token vào memory
    setToken(token);

    // Lưu thông tin admin session vào localStorage để F5 không mất đăng nhập
    const session: AdminSession = {
      id: user.MaNguoiDung,
      name: user.HoTen,
      email: user.Email,
      role: user.VaiTro,
    };
    setAdminSession(session);
    setAdminUser(session);
  };

  // ── Logout Admin ─────────────────────────────────────────────────────────────

  const logoutAdmin = async () => {
    try {
      // Gọi API logout để server xóa cookie refreshToken
      await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1"}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Bỏ qua lỗi network, vẫn xóa local state
    }
    removeToken();
    removeUser();
    removeAdminSession();
    setAdminUser(null);
    setUsersState([]);
    setDashStats(null);
    setReportsStats(null);
    setAuditLogs([]);
  };

  // ── Load Admin Data ───────────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    if (!isAdminAuthenticated) return;
    setLoading(true);
    try {
      const [usersRes, statsRes, logsRes, reportsRes] = await Promise.all([
        adminApi.getUsers(),
        adminApi.getDashboard(),
        adminApi.getAuditLogs(),
        adminApi.getReports(),
      ]);

      const mappedUsers = (usersRes.data || []).map((u: any) => ({
        id: String(u.MaNguoiDung),
        name: u.HoTen,
        email: u.Email,
        // ✅ SỬA: Dùng đúng tên cột DB là SoDienThoai (không phải DienThoai)
        phone: u.SoDienThoai || "-",
        // ✅ SỬA: Không có DiaChi trong DB, dùng Bio thay thế
        address: u.Bio || "-",
        // ✅ SỬA: DB lưu 'ADMIN'/'MEMBER', convert sang lowercase để khớp với UserRole type
        role: String(u.VaiTro).toLowerCase() as UserRole,
        // ✅ SỬA: DB lưu 'ACTIVE'/'LOCKED'/'DELETED', convert sang lowercase
        status: String(u.TrangThai).toLowerCase() as UserStatus,
        groups: u.SoNhom || 0,
        avatar: u.HoTen.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2),
        joinDate: String(u.NgayTao || "").slice(0, 10),
        lastLogin: "-",
        has2FA: !!u.IsTwoFactorEnabled,
      }));

      setUsersState(mappedUsers);
      setDashStats(statsRes.data);
      setReportsStats(reportsRes.data);
      setAuditLogs(logsRes.data || []);
    } catch (e) {
      console.error("Failed to load admin context data from API:", e);
    } finally {
      setLoading(false);
    }
  }, [isAdminAuthenticated]);

  useEffect(() => {
    if (isAdminAuthenticated) {
      loadData();
    }
  }, [isAdminAuthenticated, loadData]);

  // ── Helpers ──────────────────────────────────────────────────────────────────

  const setUsers = (newUsers: AdminUser[]) => {
    setUsersState(newUsers);
  };

  const addLog = async (log: Omit<AuditLog, "id" | "timestamp">) => {
    const now = new Date();
    const ts = now.toISOString().replace("T", " ").slice(0, 19);
    setAuditLogs((prev) => [{ ...log, id: Date.now().toString(), timestamp: ts } as AuditLog, ...prev]);
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
    <AdminContext.Provider
      value={{
        adminUser,
        isAdminAuthenticated,
        loginAdmin,
        logoutAdmin,
        users,
        setUsers,
        auditLogs,
        addLog,
        dashStats,
        reportsStats,
        loading,
        reload: loadData,
        cleanupFakeUsers,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}
