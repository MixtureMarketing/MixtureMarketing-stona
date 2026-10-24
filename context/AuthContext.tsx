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
import { assertSessionValid, onSessionExpired } from '../utils/sessionExpiry';

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
  /**
   * fetch z nagłówkami sesji. Przy 401/403 z /api/admin|/api/portal wylogowuje
   * (sessionExpired=true → strony portalu wracają do logowania z komunikatem)
   * i rzuca SessionExpiredError.
   */
  authFetch: (url: string, init?: RequestInit) => Promise<Response>;
  /** Ustawione, gdy wylogowanie nastąpiło przez wygaśnięcie sesji (nie ręcznie). */
  sessionExpired: boolean;
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
  const [sessionExpired, setSessionExpired] = useState(false);

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
        setSessionExpired(false);
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

  const clearLocalSession = useCallback(() => {
    setUser(null);
    setSessionToken(null);
    safeRemoveItem('portal_user');
    safeRemoveItem('portal_token');
  }, []);

  // Ręczne wylogowanie: unieważnij sesję także na serwerze (POST /api/auth/logout),
  // inaczej przechwycony token działałby do wygaśnięcia. Best-effort — lokalne
  // wylogowanie następuje od razu i nie zależy od sieci (keepalive: żądanie
  // przeżyje nawigację/zamknięcie karty).
  const logout = useCallback(() => {
    const token = safeGetItem('portal_token');
    clearLocalSession();
    if (!token) return;
    try {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        keepalive: true,
      }).catch(() => {});
    } catch {
      /* brak fetch / błąd synchroniczny — lokalne wylogowanie już się odbyło */
    }
  }, [clearLocalSession]);

  // Każde źródło zapytań (authFetch, MixtureApiClient) zgłasza wygaśnięcie sesji tutaj.
  // Serwer już odrzucił token — wystarczy wyczyścić stan lokalny.
  useEffect(
    () =>
      onSessionExpired(() => {
        clearLocalSession();
        setSessionExpired(true);
      }),
    [clearLocalSession],
  );

  const authFetch = useCallback(
    async (url: string, init: RequestInit = {}) => {
      const headers: Record<string, string> = {
        ...((init.headers as Record<string, string> | undefined) ?? {}),
      };
      if (sessionToken) {
        headers.Authorization = `Bearer ${sessionToken}`;
        headers['X-Auth-Token'] = sessionToken;
      }
      const res = await fetch(url, { ...init, headers });
      return assertSessionValid(url, res);
    },
    [sessionToken],
  );

  const value = useMemo(
    () => ({
      user,
      sessionToken,
      login,
      verifyToken,
      logout,
      authFetch,
      sessionExpired,
      updateUser,
      isLoading,
    }),
    [
      user,
      sessionToken,
      login,
      verifyToken,
      logout,
      authFetch,
      sessionExpired,
      updateUser,
      isLoading,
    ],
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
