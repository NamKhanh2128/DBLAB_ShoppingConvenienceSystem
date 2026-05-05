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

  const persistAuth = (u: any, token: string) => {
    if (!token) return;
    setToken(token);
    setUser(u);
    setUserState(u);
    const gid = u?.MaNhom ?? u?.groupId ?? u?.maNhom ?? Number(localStorage.getItem('groupId')) ?? null;
    if (gid) {
      setGroupId(Number(gid));
      localStorage.setItem('groupId', String(gid));
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

  // Refresh user on mount if token exists without clearing the persisted user during reloads
  useEffect(() => {
    const token = getToken();
    if (token) {
      authApi.me().then(res => {
        const refreshedUser = res.data;
        setUser(refreshedUser);
        setUserState(refreshedUser);
        const gid = refreshedUser?.MaNhom ?? refreshedUser?.groupId ?? refreshedUser?.maNhom ?? groupId;
        if (gid) {
          setGroupId(Number(gid));
          localStorage.setItem('groupId', String(gid));
        }
      }).catch(() => {
        if (!getUser()) {
          removeToken();
          removeUser();
          localStorage.removeItem('groupId');
          setUserState(null);
          setGroupId(null);
        }
      });
    }
  }, []);

  const updateUser = (newUser: any) => {
    setUser(newUser); // localStorage
    setUserState(newUser);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated, login, register, logout, setUser: updateUser, groupId }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
