import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
  ReactNode,
} from 'react';
import { api, getToken, setToken, clearToken } from '@/lib/api';
import type { AuthUser } from '@/types/api';

const GUEST_KEY = 'audiobook_guest_mode';

interface AuthContextValue {
  user: AuthUser | null;
  isGuest: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  enterGuestMode: () => void;
  enterLoggedInMode: (user: AuthUser) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const init = async () => {
      const guestFlag = localStorage.getItem(GUEST_KEY) === '1';
      if (guestFlag) {
        setIsGuest(true);
        setLoading(false);
        return;
      }

      const token = getToken();
      if (token) {
        try {
          const userData = await api.get<AuthUser>('/auth/me');
          setUser(userData);
        } catch {
          clearToken();
        }
      }
      setLoading(false);
    };

    init();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await api.post<{ user: AuthUser; accessToken: string }>(
      '/auth/login',
      { email, password },
    );
    setToken(result.accessToken);
    setUser(result.user);
    setIsGuest(false);
    localStorage.removeItem(GUEST_KEY);
  }, []);

  const signup = useCallback(async (email: string, password: string) => {
    const result = await api.post<{ user: AuthUser; accessToken: string }>(
      '/auth/signup',
      { email, password },
    );
    setToken(result.accessToken);
    setUser(result.user);
    setIsGuest(false);
    localStorage.removeItem(GUEST_KEY);
  }, []);

  const logout = useCallback(async () => {
    if (isGuest) {
      setIsGuest(false);
      localStorage.removeItem(GUEST_KEY);
      return;
    }
    clearToken();
    setUser(null);
  }, [isGuest]);

  const enterGuestMode = useCallback(() => {
    setIsGuest(true);
    setUser(null);
    clearToken();
    localStorage.setItem(GUEST_KEY, '1');
  }, []);

  const enterLoggedInMode = useCallback((u: AuthUser) => {
    setUser(u);
    setIsGuest(false);
    localStorage.removeItem(GUEST_KEY);
  }, []);

  const value: AuthContextValue = {
    user,
    isGuest,
    loading,
    login,
    signup,
    logout,
    enterGuestMode,
    enterLoggedInMode,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
