import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Project, Message } from '../types';
import { asArray, SessionExpiredError } from '../../../utils/sessionExpiry';

export const usePortalData = () => {
  const { user, sessionToken, authFetch } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // authFetch: przy wygasłej sesji wylogowuje (PortalDashboard wraca do logowania
  // z komunikatem „Sesja wygasła”) i rzuca SessionExpiredError — wtedy NIE
  // pokazujemy „Błąd ładowania”. Listy z API zawsze przez asArray.
  const fetchProjects = useCallback(async () => {
    if (!sessionToken) return;
    try {
      const res = await authFetch(`/api/portal/dashboard?t=${Date.now()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setProjects(asArray<Project>(data?.projects));
      setError(null);
    } catch (e) {
      if (e instanceof SessionExpiredError) return;
      console.error('Projects Fetch Error:', e);
      setError('Błąd ładowania projektów.');
    } finally {
      setLoadingProjects(false);
    }
  }, [sessionToken, authFetch]);

  const fetchMessages = useCallback(async () => {
    if (!sessionToken) return;
    try {
      const res = await authFetch(`/api/portal/get_messages?t=${Date.now()}`);
      if (!res.ok) return;
      const data = await res.json();
      const serverMessages = asArray<Message>(data?.messages);
      // Podmiana przy KAŻDEJ zmianie treści listy — także samego `is_read`
      // (wcześniej tylko długość/id ostatniej: tytuł „(1) Nowa wiadomość” nie gasł,
      // a podwójny ptaszek „przeczytane” nie dochodził). Bez zmiany zostaje ta sama
      // referencja, więc polling co 5 s nie re-renderuje czatu.
      setMessages((prev) =>
        JSON.stringify(prev) === JSON.stringify(serverMessages) ? prev : serverMessages,
      );
    } catch (e) {
      console.error(e);
    }
  }, [sessionToken, authFetch]);

  useEffect(() => {
    if (sessionToken && user?.role !== 'admin') {
      Promise.resolve().then(() => {
        fetchProjects();
        fetchMessages();
      });

      const interval = setInterval(() => {
        if (document.hidden) return;
        fetchMessages();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [fetchProjects, fetchMessages, sessionToken, user?.role]);

  return {
    projects,
    messages,
    loadingProjects,
    error,
    refreshProjects: fetchProjects,
    refreshMessages: fetchMessages,
  };
};
