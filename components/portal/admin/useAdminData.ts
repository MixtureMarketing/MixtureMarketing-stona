import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Client, Project, Lead, PerformanceData, Conversation, Message } from '../types';
import { asArray } from '../../../utils/sessionExpiry';

export const useAdminData = (activeTab: string, activeChatId: string | null) => {
  const { sessionToken, authFetch } = useAuth();

  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [metricsData, setMetricsData] = useState<PerformanceData | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);

  // authFetch: przy wygasłej sesji wylogowuje i rzuca SessionExpiredError (łapane
  // niżej). Każda lista z API przechodzi przez asArray — 403/500/obiekt błędu nigdy
  // nie wpisze `undefined` w stan (wcześniej leads.map rzucał → ErrorBoundary).
  const getJson = useCallback(
    async (url: string) => {
      const res = await authFetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status} (${url})`);
      return res.json();
    },
    [authFetch],
  );

  const fetchLeads = useCallback(async () => {
    if (!sessionToken) return;
    try {
      const data = await getJson(`/api/admin/get_leads?t=${Date.now()}`);
      const next = asArray<Lead>(data?.leads);
      setLeads((prev) => (JSON.stringify(prev) !== JSON.stringify(next) ? next : prev));
    } catch (e) {
      console.error(e);
    }
  }, [sessionToken, getJson]);

  const fetchMetrics = useCallback(async () => {
    if (!sessionToken) return;
    try {
      const data = await getJson(`/api/admin/get_performance_stats?t=${Date.now()}`);
      setMetricsData(data && typeof data === 'object' ? data : null);
    } catch (e) {
      console.error(e);
    }
  }, [sessionToken, getJson]);

  const fetchData = useCallback(async () => {
    if (!sessionToken) return;
    try {
      const data = await getJson(`/api/admin/get_all_data?t=${Date.now()}`);
      const nextClients = asArray<Client>(data?.clients);
      const nextProjects = asArray<Project>(data?.projects);
      setClients((prev) =>
        JSON.stringify(prev) !== JSON.stringify(nextClients) ? nextClients : prev,
      );
      setProjects((prev) =>
        JSON.stringify(prev) !== JSON.stringify(nextProjects) ? nextProjects : prev,
      );
    } catch (e) {
      console.error(e);
    }
  }, [sessionToken, getJson]);

  const fetchChat = useCallback(
    async (userId: string | null = null) => {
      if (!sessionToken) return;
      try {
        const timestamp = Date.now();
        const url = userId
          ? `/api/admin/get_all_messages?user_id=${userId}&t=${timestamp}`
          : `/api/admin/get_all_messages?t=${timestamp}`;

        const data = await getJson(url);
        const nextConversations = asArray<Conversation>(data?.conversations);
        setConversations((prev) =>
          JSON.stringify(prev) !== JSON.stringify(nextConversations) ? nextConversations : prev,
        );
        if (userId) {
          const nextMessages = asArray<Message>(data?.messages);
          setChatMessages((prev) =>
            JSON.stringify(prev) !== JSON.stringify(nextMessages) ? nextMessages : prev,
          );
        }
      } catch (e) {
        console.error(e);
      }
    },
    [sessionToken, getJson],
  );

  // Use a single effect for general data polling
  useEffect(() => {
    if (!sessionToken) return;

    // Trigger initial fetch asynchronously
    Promise.resolve().then(() => {
      fetchData();
      fetchLeads();
    });

    const interval = setInterval(() => {
      fetchData();
      fetchLeads();
    }, 30000);

    return () => clearInterval(interval);
  }, [sessionToken, fetchData, fetchLeads]);

  // Handle tab-specific data
  useEffect(() => {
    if (!sessionToken) return;

    if (activeTab === 'metrics') {
      Promise.resolve().then(fetchMetrics);
    }

    let chatInterval: ReturnType<typeof setInterval>;
    if (activeTab === 'chat') {
      Promise.resolve().then(() => fetchChat(activeChatId));
      chatInterval = setInterval(() => fetchChat(activeChatId), 5000);
    }

    return () => {
      if (chatInterval) clearInterval(chatInterval);
    };
  }, [activeTab, activeChatId, sessionToken, fetchMetrics, fetchChat]);

  return {
    clients,
    projects,
    leads,
    metricsData,
    conversations,
    chatMessages,
    refreshData: fetchData,
    refreshLeads: fetchLeads,
    refreshChat: () => fetchChat(activeChatId),
  };
};
