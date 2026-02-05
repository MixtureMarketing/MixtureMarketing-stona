import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import MixtureApiClient from '../../../services/apiClient';
import { Project, Message } from '../types';

export const usePortalData = () => {
  const { user, sessionToken } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    if (!sessionToken) return;
    try {
      const data = await MixtureApiClient.get<{ projects: Project[] }>(
        `/api/portal/dashboard?t=${Date.now()}`,
        sessionToken,
      );
      setProjects(data.projects || []);
    } catch (e) {
      console.error('Projects Fetch Error:', e);
      setError('Błąd ładowania projektów.');
    } finally {
      setLoadingProjects(false);
    }
  }, [sessionToken]);

  const fetchMessages = useCallback(async () => {
    if (!sessionToken) return;
    try {
      const data = await MixtureApiClient.get<{ messages: Message[] }>(
        `/api/portal/get_messages?t=${Date.now()}`,
        sessionToken,
      );
      
      setMessages((prev) => {
        if (data.messages.length !== prev.length) {
          return data.messages;
        }
        if (data.messages.length > 0 && prev.length > 0) {
          const lastServer = data.messages[data.messages.length - 1];
          const lastLocal = prev[prev.length - 1];
          if (lastServer.id !== lastLocal.id) return data.messages;
        }
        return prev;
      });
    } catch (e) {
      console.error(e);
    }
  }, [sessionToken]);


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
