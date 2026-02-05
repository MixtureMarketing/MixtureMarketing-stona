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

import MixtureApiClient from '../services/apiClient';

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
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('portal_user');
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (e) {
        console.error('Failed to parse stored user', e);
        return null;
      }
    }
    return null;
  });

  const [sessionToken, setSessionToken] = useState<string | null>(() => {
    return localStorage.getItem('portal_token');
  });

  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email: string) => {
    try {
      await MixtureApiClient.post('/api/auth/send_magic_link', { email });
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }, []);

  const verifyToken = useCallback(async (token: string) => {
    try {
      const data = await MixtureApiClient.post<{ user: User; session_token: string }>(
        '/api/auth/verify_token',
        { token },
      );

      setUser(data.user);
      setSessionToken(data.session_token);
      localStorage.setItem('portal_user', JSON.stringify(data.user));
      localStorage.setItem('portal_token', data.session_token);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }, []);


  const updateUser = useCallback((userData: User) => {
    setUser(userData);
    localStorage.setItem('portal_user', JSON.stringify(userData));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setSessionToken(null);
    localStorage.removeItem('portal_user');
    localStorage.removeItem('portal_token');
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
