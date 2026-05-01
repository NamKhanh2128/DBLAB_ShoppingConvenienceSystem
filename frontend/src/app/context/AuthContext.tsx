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

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await authApi.login(email, password);
      const { user: u, token } = res.data;
      setToken(token);
      setUser(u);
      setUserState(u);
      // Default groupId (will be fetched from family API in production)
      const gid = 1;
      setGroupId(gid);
      localStorage.setItem('groupId', String(gid));
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (hoTen: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      await authApi.register(hoTen, email, password);
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

  // Refresh user on mount if token exists
  useEffect(() => {
    const token = getToken();
    if (token && !user) {
      authApi.me().then(res => {
        setUser(res.data);
        setUserState(res.data);
      }).catch(() => {
        removeToken();
        removeUser();
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
