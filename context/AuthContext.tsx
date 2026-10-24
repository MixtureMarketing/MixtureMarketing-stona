/* eslint-disable @typescript-eslint/no-unused-vars */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
  useCallback,
} from 'react';
import { safeGetItem, safeGetJSON, safeRemoveItem, safeSetItem } from '../utils/safeStorage';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  company_name?: string;
}

interface AuthContextType {
  user: User | null;
  sessionToken: string | null;
  login: (email: string) => Promise<boolean>;
  verifyToken: (token: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: User) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // safeStorage: przy zablokowanym storage (SecurityError) AuthProvider —
  // owijający całą aplikację poza ErrorBoundary — nie może rzucić.
  const [user, setUser] = useState<User | null>(() => safeGetJSON<User>('portal_user'));

  const [sessionToken, setSessionToken] = useState<string | null>(() =>
    safeGetItem('portal_token'),
  );

  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email: string) => {
    try {
      const res = await fetch('/api/auth/send_magic_link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      return res.ok;
    } catch (e) {
      console.error(e);
      return false;
    }
  }, []);

  const verifyToken = useCallback(async (token: string) => {
    try {
      const res = await fetch('/api/auth/verify_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setSessionToken(data.session_token);
        safeSetItem('portal_user', JSON.stringify(data.user));
        safeSetItem('portal_token', data.session_token);
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  }, []);

  const updateUser = useCallback((userData: User) => {
    setUser(userData);
    safeSetItem('portal_user', JSON.stringify(userData));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setSessionToken(null);
    safeRemoveItem('portal_user');
    safeRemoveItem('portal_token');
  }, []);

  const value = useMemo(
    () => ({
      user,
      sessionToken,
      login,
      verifyToken,
      logout,
      updateUser,
      isLoading,
    }),
    [user, sessionToken, login, verifyToken, logout, updateUser, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
