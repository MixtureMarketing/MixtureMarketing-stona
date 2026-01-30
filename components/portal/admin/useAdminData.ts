import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Client, Project, Lead, PerformanceData, Conversation, Message } from '../types';

export const useAdminData = (activeTab: string, activeChatId: string | null) => {
  const { sessionToken } = useAuth();

  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [metricsData, setMetricsData] = useState<PerformanceData | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);

  const fetchLeads = useCallback(async () => {
    if (!sessionToken) return;
    try {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${sessionToken}`,
        'X-Auth-Token': sessionToken,
      };
      const res = await fetch(`/api/admin/get_leads.php?t=${Date.now()}`, { headers });
      const data = await res.json();
      setLeads((prev) => (JSON.stringify(prev) !== JSON.stringify(data.leads) ? data.leads : prev));
    } catch (e) {
      console.error(e);
    }
  }, [sessionToken]);

  const fetchMetrics = useCallback(async () => {
    if (!sessionToken) return;
    try {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${sessionToken}`,
        'X-Auth-Token': sessionToken,
      };
      const res = await fetch(`/api/admin/get_performance_stats.php?t=${Date.now()}`, { headers });
      const data = await res.json();
      setMetricsData(data);
    } catch (e) {
      console.error(e);
    }
  }, [sessionToken]);

  const fetchData = useCallback(async () => {
    if (!sessionToken) return;
    try {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${sessionToken}`,
        'X-Auth-Token': sessionToken,
      };
      const res = await fetch(`/api/admin/get_all_data.php?t=${Date.now()}`, { headers });
      const data = await res.json();
      setClients((prev) =>
        JSON.stringify(prev) !== JSON.stringify(data.clients) ? data.clients : prev,
      );
      setProjects((prev) =>
        JSON.stringify(prev) !== JSON.stringify(data.projects) ? data.projects : prev,
      );
    } catch (e) {
      console.error(e);
    }
  }, [sessionToken]);

  const fetchChat = useCallback(
    async (userId: string | null = null) => {
      if (!sessionToken) return;
      try {
        const timestamp = Date.now();
        const url = userId
          ? `/api/admin/get_all_messages.php?user_id=${userId}&t=${timestamp}`
          : `/api/admin/get_all_messages.php?t=${timestamp}`;

        const headers: Record<string, string> = {
          Authorization: `Bearer ${sessionToken}`,
          'X-Auth-Token': sessionToken,
        };

        const res = await fetch(url, { headers });
        const data = await res.json();

        setConversations((prev) =>
          JSON.stringify(prev) !== JSON.stringify(data.conversations) ? data.conversations : prev,
        );
        if (userId) {
          setChatMessages((prev) =>
            JSON.stringify(prev) !== JSON.stringify(data.messages) ? data.messages : prev,
          );
        }
      } catch (e) {
        console.error(e);
      }
    },
    [sessionToken],
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
