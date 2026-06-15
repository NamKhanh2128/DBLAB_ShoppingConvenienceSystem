import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, getToken, setToken, setUser, removeToken, removeUser, getUser } from '../services/api';

interface AuthContextType {
  user: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (hoTen: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: any) => void;
  groupId: number | null;
  setGroupId: (id: number | null) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<any | null>(getUser());
  const [isLoading, setIsLoading] = useState(false);
  const [groupId, setGroupId] = useState<number | null>(() => {
    const g = localStorage.getItem('groupId');
    return g ? Number(g) : null;
  });

  const isAuthenticated = !!user && !!getToken();

  const updateGroupId = (id: number | null) => {
    setGroupId(id);
    if (id !== null) {
      localStorage.setItem('groupId', String(id));
    } else {
      localStorage.removeItem('groupId');
    }
  };

  const persistAuth = (u: any, token: string) => {
    if (!token) return;
    setToken(token);
    setUser(u);
    setUserState(u);
    const gid = u?.MaNhom ?? u?.groupId ?? u?.maNhom ?? Number(localStorage.getItem('groupId')) ?? null;
    if (gid) {
      updateGroupId(Number(gid));
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await authApi.login(email, password);
      const { user: u, token } = res.data;
      persistAuth(u, token);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (hoTen: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const registerRes = await authApi.register(hoTen, email, password);
      const token = registerRes.data?.token;
      const registeredUser = registerRes.data?.user ?? registerRes.data;
      if (token) {
        persistAuth(registeredUser, token);
        return;
      }
      const loginRes = await authApi.login(email, password);
      const { user: u, token: loginToken } = loginRes.data;
      persistAuth(u, loginToken);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    removeToken();
    removeUser();
    localStorage.removeItem('groupId');
    setUserState(null);
    setGroupId(null);
  };

  // Tự động làm mới phiên đăng nhập ngầm khi người dùng F5 tải lại trang
  useEffect(() => {
    const initAuth = async () => {
      try {
        const checkRes = await fetch('http://localhost:5000/api/v1/auth/refresh', { method: 'POST', credentials: 'include' });
        if (checkRes.ok) {
          const refreshData = await checkRes.json();
          if (refreshData?.data?.token) {
            setToken(refreshData.data.token);
            const meRes = await authApi.me();
            const refreshedUser = meRes.data;
            setUser(refreshedUser);
            setUserState(refreshedUser);
            const gid = refreshedUser?.MaNhom ?? refreshedUser?.groupId ?? refreshedUser?.maNhom ?? groupId;
            if (gid) {
              updateGroupId(Number(gid));
            }
            return;
          }
        }
      } catch (e) {
        console.warn('Không thể khôi phục phiên đăng nhập ngầm:', e);
      }

      // Dọn dẹp nếu không thể tự động khôi phục
      if (!getUser()) {
        removeToken();
        removeUser();
        localStorage.removeItem('groupId');
        setUserState(null);
        setGroupId(null);
      }
    };

    initAuth();
  }, []);

  const updateUser = (newUser: any) => {
    setUser(newUser); // localStorage
    setUserState(newUser);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated, login, register, logout, setUser: updateUser, groupId, setGroupId: updateGroupId }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
