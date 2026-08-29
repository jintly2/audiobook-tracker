import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
  ReactNode,
} from 'react';
import { supabase } from '@/lib/supabase';
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

  // 初始化：检查 session 或游客模式
  useEffect(() => {
    const init = async () => {
      // 先检查游客模式
      const guestFlag = localStorage.getItem(GUEST_KEY) === '1';
      if (guestFlag) {
        setIsGuest(true);
        setLoading(false);
        return;
      }

      // 检查 Supabase session
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        setUser({
          id: data.session.user.id,
          email: data.session.user.email,
        });
      }
      setLoading(false);
    };

    init();

    // 监听 auth 状态变化
    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email,
          });
          setIsGuest(false);
          localStorage.removeItem(GUEST_KEY);
        } else {
          setUser(null);
        }
      },
    );

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  }, []);

  const signup = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
  }, []);

  const logout = useCallback(async () => {
    if (isGuest) {
      setIsGuest(false);
      localStorage.removeItem(GUEST_KEY);
      return;
    }
    await supabase.auth.signOut();
    setUser(null);
  }, [isGuest]);

  const enterGuestMode = useCallback(() => {
    setIsGuest(true);
    setUser(null);
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
