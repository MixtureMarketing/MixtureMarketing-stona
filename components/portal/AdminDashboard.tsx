/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  Users,
  Briefcase,
  Plus,
  Save,
  Trash2,
  X,
  Edit,
  ExternalLink,
  Send,
  MessageSquare,
  FileText,
  Check,
  CheckCheck,
  FilePlus,
  FileDown,
  Clock,
  Calendar,
  RefreshCw,
  ShieldCheck,
  Activity,
  Smartphone,
  Monitor,
} from 'lucide-react';
import Button from '../common/Button';
import GlassCard from '../common/GlassCard';

interface Client {
  id: string;
  name: string;
  email: string;
  company_name: string;
}

interface MetricLog {
  metric_name: string;
  metric_value: number;
  page_url: string;
  device_type: string;
  created_at: string;
}

interface PerformanceData {
  summary: {
    lcp: { desktop: number; mobile: number };
    cls: { desktop: number; mobile: number };
    inp: { desktop: number; mobile: number };
    ttfb: { desktop: number; mobile: number };
    sample_size: number;
  };
  logs: MetricLog[];
}

interface ProjectDoc {
  id: string;
  name: string;
  file_path: string;
  type: 'invoice' | 'document';
  subtype: string;
  created_at: string;
}

interface Milestone {
  id: string;
  project_id: string;
  title: string;
  description: string;
  due_date: string;
  status: 'pending' | 'accepted' | 'corrections';
  feedback: string;
}

interface Project {
  id: string;
  user_id: string;
  client_name: string;
  company_name?: string;
  name: string;
  type: string;
  status: string;
  progress: number;
  budget: string;
  drive_link: string;
  next_milestone: string;
  next_milestone_date: string;
  documents?: ProjectDoc[];
  milestones?: Milestone[];
}

interface Lead {
  id: string;
  email: string;
  name: string;
  service_type: string;
  package_name?: string;
  status: string;
  created_at: string;
  message: string;
  budget?: string;
  company?: string;
  current_step: number;
  details?: string;
}

interface Message {
  id: string;
  content: string;
  sender_type: 'client' | 'admin';
  created_at: string;
  is_read?: string | number;
}

interface Conversation {
  id: string;
  name: string;
  email: string;
  company_name: string;
  unread_count: number;
}

const AdminDashboard: React.FC = () => {
  const { user, sessionToken, isLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'clients' | 'projects' | 'leads' | 'chat' | 'metrics'>(
    'clients',
  );
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [metricsData, setMetricsData] = useState<PerformanceData | null>(null);

  // Chat State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [adminMessage, setAdminMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [projectSearch, setProjectSearch] = useState('');

  const [loadingData, setLoadingData] = useState(true);

  // Document Upload State
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [uploadDocData, setUploadDocData] = useState({
    project_id: '',
    name: '',
    type: 'document' as 'invoice' | 'document',
    subtype: 'other',
    file: null as File | null,
  });

  // Milestone State
  const [editingMilestone, setEditingMilestone] = useState<any>(null);
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [isSavingMilestone, setIsSavingMilestone] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [viewingLead, setViewingLead] = useState<Lead | null>(null);
  const [replyingTo, setReplyingTo] = useState<Lead | null>(null);
  const [replyMessage, setReplyMessage] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);

  const handleChatScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      isAtBottomRef.current = scrollHeight - scrollTop - clientHeight < 50;
    }
  };

  const handleDownload = async (docId: string, fileName: string) => {
    if (!sessionToken) return;
    try {
      const res = await fetch(`/api/portal/download.php?id=${docId}`, {
        headers: {
          Authorization: `Bearer ${sessionToken}`,
          'X-Auth-Token': sessionToken,
        },
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        alert('Błąd pobierania pliku.');
      }
    } catch (e) {
      console.error(e);
      alert('Błąd połączenia.');
    }
  };

  const filteredConversations = useMemo(
    () =>
      (conversations || []).filter(
        (c) =>
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.company_name?.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [conversations, searchTerm],
  );

  const filteredClients = useMemo(
    () =>
      (clients || []).filter(
        (c) =>
          c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
          c.email.toLowerCase().includes(clientSearch.toLowerCase()) ||
          c.company_name?.toLowerCase().includes(clientSearch.toLowerCase()),
      ),
    [clients, clientSearch],
  );

  const filteredProjects = useMemo(
    () =>
      (projects || []).filter(
        (p) =>
          p.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
          p.client_name?.toLowerCase().includes(projectSearch.toLowerCase()) ||
          p.company_name?.toLowerCase().includes(projectSearch.toLowerCase()),
      ),
    [projects, projectSearch],
  );

  useEffect(() => {
    if (!isLoading) {
      if (!user || user.role !== 'admin') {
        navigate('/portal/dashboard');
      } else {
        fetchData();
        fetchLeads();
        // Polling for new data (every 30s)
        const interval = setInterval(() => {
          fetchData();
          fetchLeads();
        }, 30000);
        return () => clearInterval(interval);
      }
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (activeTab === 'metrics') {
      fetchMetrics();
    }
  }, [activeTab]);

  useEffect(() => {
    const unreadCount = conversations.reduce((acc, conv) => acc + (conv.unread_count || 0), 0);
    if (unreadCount > 0) {
      document.title = `(${unreadCount}) Nowa wiadomość | Admin Panel`;
    } else {
      document.title = 'Admin Panel | Mixture Marketing';
    }
    return () => {
      document.title = 'Mixture Marketing';
    };
  }, [conversations]);

  const fetchData = async () => {
    if (!sessionToken) return;
    try {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${sessionToken}`,
        'X-Auth-Token': sessionToken || '',
      };
      const res = await fetch(`/api/admin/get_all_data.php?t=${Date.now()}`, {
        headers,
      });
      const data = await res.json();
      setClients(data.clients || []);
      setProjects(data.projects || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchLeads = async () => {
    if (!sessionToken) return;
    try {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${sessionToken}`,
        'X-Auth-Token': sessionToken || '',
      };
      const res = await fetch(`/api/admin/get_leads.php?t=${Date.now()}`, {
        headers,
      });
      const data = await res.json();
      setLeads(data.leads || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMetrics = async () => {
    if (!sessionToken) return;
    try {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${sessionToken}`,
        'X-Auth-Token': sessionToken || '',
      };
      const res = await fetch(`/api/admin/get_performance_stats.php?t=${Date.now()}`, {
        headers,
      });
      const data = await res.json();
      setMetricsData(data);
    } catch (e) {
      console.error(e);
    }
  };

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

        const res = await fetch(url, {
          headers,
        });
        const data = await res.json();

        setConversations(data.conversations || []);
        if (userId) {
          setChatMessages(data.messages || []);
        }
      } catch (e) {
        console.error(e);
      }
    },
    [sessionToken],
  );

  useEffect(() => {
    if (activeTab === 'chat') {
      fetchChat(activeChatId);
      const interval = setInterval(() => fetchChat(activeChatId), 5000);
      return () => clearInterval(interval);
    }
  }, [activeTab, activeChatId, fetchChat]);

  useEffect(() => {
    if (activeTab === 'chat' && chatMessages.length > 0 && chatContainerRef.current) {
      const lastMessage = chatMessages[chatMessages.length - 1];
      const isFromMe = lastMessage.sender_type === 'admin';

      if (isAtBottomRef.current || isFromMe) {
        const { scrollHeight, clientHeight } = chatContainerRef.current;
        chatContainerRef.current.scrollTo({
          top: scrollHeight - clientHeight,
          behavior: 'smooth',
        });
      }
    }
  }, [chatMessages.length, activeTab, activeChatId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendAdminMessage(e);
    }
  };

  const sendAdminMessage = async (e: React.FormEvent | React.KeyboardEvent) => {
    e.preventDefault();
    if (!activeChatId || !adminMessage.trim() || !sessionToken) return;

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionToken}`,
        'X-Auth-Token': sessionToken || '',
      };

      const res = await fetch('/api/admin/admin_reply_chat.php', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          user_id: activeChatId,
          content: adminMessage,
        }),
      });

      if (res.ok) {
        setAdminMessage('');
        fetchChat(activeChatId);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleConvertLead = async (leadId: string) => {
    if (!sessionToken) return;
    if (!confirm('Czy na pewno chcesz utworzyć konto klienta dla tego leada?')) return;

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionToken}`,
        'X-Auth-Token': sessionToken || '',
      };

      const res = await fetch('/api/admin/convert_lead.php', {
        method: 'POST',
        headers,
        body: JSON.stringify({ lead_id: leadId }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        fetchLeads();
        fetchData(); // Refresh clients list too
      } else {
        alert(data.message || 'Błąd konwersji');
      }
    } catch (error) {
      console.error(error);
      alert('Błąd połączenia');
    }
  };

  const handleSaveMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMilestone.project_id || !sessionToken) return;
    setIsSavingMilestone(true);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionToken}`,
        'X-Auth-Token': sessionToken || '',
      };

      const res = await fetch('/api/admin/save_milestone.php', {
        method: 'POST',
        headers,
        body: JSON.stringify(editingMilestone),
      });

      if (res.ok) {
        setIsMilestoneModalOpen(false);
        setEditingMilestone(null);
        fetchData();
      } else {
        alert('Błąd zapisu kamienia milowego');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingMilestone(false);
    }
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadDocData.file || !sessionToken) return;
    setIsUploadingDoc(true);

    const formData = new FormData();
    formData.append('project_id', uploadDocData.project_id);
    formData.append('name', uploadDocData.name);
    formData.append('type', uploadDocData.type);
    formData.append('subtype', uploadDocData.subtype);
    formData.append('file', uploadDocData.file);

    try {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${sessionToken}`,
        'X-Auth-Token': sessionToken || '',
      };

      const res = await fetch('/api/admin/upload_document.php', {
        method: 'POST',
        headers,
        body: formData,
      });

      if (res.ok) {
        alert('Plik wgrany pomyślnie.');
        setUploadDocData({
          project_id: '',
          name: '',
          type: 'document',
          subtype: 'other',
          file: null,
        });
        fetchData();
      } else {
        const d = await res.json();
        alert(d.message || 'Błąd wgrywania');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsUploadingDoc(false);
    }
  };

  const handleDeleteDoc = async (id: string) => {
    if (!confirm('Czy na pewno usunąć ten dokument?')) return;
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionToken}`,
        'X-Auth-Token': sessionToken || '',
      };

      const res = await fetch('/api/admin/delete_document.php', {
        method: 'POST',
        headers,
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingTo || !sessionToken) return;

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionToken}`,
        'X-Auth-Token': sessionToken || '',
      };

      const res = await fetch('/api/admin/reply_lead.php', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          lead_id: replyingTo.id,
          email: replyingTo.email,
          message: replyMessage,
        }),
      });

      if (res.ok) {
        setReplyingTo(null);
        setReplyMessage('');
        fetchLeads();
        alert('Odpowiedź wysłana!');
      } else {
        alert('Błąd wysyłania');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionToken) return;
    const endpoint = activeTab === 'clients' ? 'save_client.php' : 'save_project.php';

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionToken}`,
        'X-Auth-Token': sessionToken || '',
      };

      const res = await fetch(`/api/admin/${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(editingItem),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchData();
        setEditingItem(null);
      } else {
        alert('Błąd zapisu');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const openEdit = (item: any = {}) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  if (isLoading || !user) return null;

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black text-dark">Admin Panel</h1>
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('clients')}
              className={`px-4 py-2 rounded-lg font-bold transition-colors ${activeTab === 'clients' ? 'bg-dark text-white' : 'bg-white text-gray-600'}`}
            >
              Klienci
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-4 py-2 rounded-lg font-bold transition-colors ${activeTab === 'projects' ? 'bg-dark text-white' : 'bg-white text-gray-600'}`}
            >
              Projekty
            </button>
            <button
              onClick={() => setActiveTab('leads')}
              className={`px-4 py-2 rounded-lg font-bold transition-colors ${activeTab === 'leads' ? 'bg-dark text-white' : 'bg-white text-gray-600'}`}
            >
              Leady
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-4 py-2 rounded-lg font-bold transition-colors ${activeTab === 'chat' ? 'bg-dark text-white' : 'bg-white text-gray-600'}`}
            >
              Wiadomości
            </button>
            <button
              onClick={() => setActiveTab('metrics')}
              className={`px-4 py-2 rounded-lg font-bold transition-colors flex items-center gap-2 ${activeTab === 'metrics' ? 'bg-dark text-white' : 'bg-white text-gray-600'}`}
            >
              <Activity size={18} /> Wydajność
            </button>
          </div>
        </div>

        {activeTab === 'metrics' && metricsData && (
          <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  label: 'LCP (Largest Contentful Paint)',
                  desc: 'Czas ładowania',
                  key: 'lcp',
                  unit: 'ms',
                  good: 2500,
                },
                {
                  label: 'CLS (Layout Shift)',
                  desc: 'Stabilność wizualna',
                  key: 'cls',
                  unit: '',
                  good: 0.1,
                },
                {
                  label: 'INP (Interaction to Next Paint)',
                  desc: 'Interaktywność',
                  key: 'inp',
                  unit: 'ms',
                  good: 200,
                },
                {
                  label: 'TTFB (Time to First Byte)',
                  desc: 'Szybkość serwera',
                  key: 'ttfb',
                  unit: 'ms',
                  good: 800,
                },
              ].map((m) => {
                const summary = metricsData?.summary;
                const valDesktop = (summary as any)?.[m.key]?.desktop || 0;
                const valMobile = (summary as any)?.[m.key]?.mobile || 0;
                const isGood = valDesktop <= m.good;

                return (
                  <GlassCard key={m.key} className="p-6">
                    <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest mb-1">
                      {m.label}
                    </h3>
                    <div className="text-3xl font-black text-dark mb-2">
                      {valDesktop}
                      <span className="text-base font-normal text-gray-400 ml-1">{m.unit}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-1">
                        <Monitor size={14} className="text-gray-400" />
                        <span
                          className={isGood ? 'text-green-600 font-bold' : 'text-red-500 font-bold'}
                        >
                          {valDesktop}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Smartphone size={14} className="text-gray-400" />
                        <span className="text-gray-600">{valMobile}</span>
                      </div>
                    </div>
                  </GlassCard>
                );
              })}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-dark">Ostatnie Pomiary (RUM)</h3>
                <span className="text-xs text-gray-400">
                  Próba: {metricsData?.summary?.sample_size || 0} zdarzeń
                </span>
              </div>
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 uppercase font-bold text-xs">
                  <tr>
                    <th className="px-6 py-3">Czas</th>
                    <th className="px-6 py-3">Metryka</th>
                    <th className="px-6 py-3">Wartość</th>
                    <th className="px-6 py-3">Urządzenie</th>
                    <th className="px-6 py-3">Strona</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(metricsData?.logs || []).map((log, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-gray-500 text-xs">
                        {new Date(log.created_at).toLocaleString('pl-PL')}
                      </td>
                      <td className="px-6 py-3 font-bold text-dark">{log.metric_name}</td>
                      <td className="px-6 py-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold ${
                            (log.metric_name === 'LCP' && log.metric_value > 2500) ||
                            (log.metric_name === 'CLS' && log.metric_value > 0.1)
                              ? 'bg-red-100 text-red-600'
                              : 'bg-green-100 text-green-600'
                          }`}
                        >
                          {Math.round(log.metric_value * 100) / 100}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-gray-500 capitalize">{log.device_type}</td>
                      <td
                        className="px-6 py-3 text-xs text-gray-400 truncate max-w-[200px]"
                        title={log.page_url}
                      >
                        {log.page_url}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'clients' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="relative w-full md:w-96">
                <input
                  type="text"
                  placeholder="Szukaj klienta (imię, email, firma)..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                />
                <Users className="absolute left-3 top-2.5 text-gray-400" size={18} />
              </div>
              <Button onClick={() => openEdit({})} icon={<Plus size={18} />}>
                Dodaj Klienta
              </Button>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 uppercase font-bold text-xs">
                  <tr>
                    <th className="px-6 py-4">Nazwa</th>
                    <th className="px-6 py-4">Firma</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4 text-right">Akcje</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredClients.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-bold text-dark">{client.name}</td>
                      <td className="px-6 py-4">{client.company_name}</td>
                      <td className="px-6 py-4 text-gray-500">{client.email}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => openEdit(client)}
                          className="text-blue-600 hover:underline"
                        >
                          Edytuj
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredClients.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                        Nie znaleziono klientów spełniających kryteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="relative w-full md:w-96">
                <input
                  type="text"
                  placeholder="Szukaj projektu lub klienta..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  value={projectSearch}
                  onChange={(e) => setProjectSearch(e.target.value)}
                />
                <Briefcase className="absolute left-3 top-2.5 text-gray-400" size={18} />
              </div>
              <Button
                onClick={() => openEdit({ progress: 0, status: 'pending' })}
                icon={<Plus size={18} />}
              >
                Dodaj Projekt
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative group hover:border-primary transition-colors"
                >
                  <button
                    onClick={() => openEdit(project)}
                    className="absolute top-4 right-4 p-2 bg-gray-100 rounded-lg text-gray-500 hover:bg-dark hover:text-white transition-colors"
                  >
                    <Edit size={16} />
                  </button>

                  <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                    {project.client_name}
                  </div>
                  <h3 className="text-lg font-bold text-dark mb-4">{project.name}</h3>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Status:</span>
                      <span className="font-bold">{project.status}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Postęp:</span>
                      <span>{project.progress}%</span>
                    </div>
                  </div>

                  {project.drive_link && (
                    <a
                      href={project.drive_link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-secondary font-bold flex items-center gap-1 hover:underline mb-4"
                    >
                      <ExternalLink size={12} /> Google Drive
                    </a>
                  )}

                  {/* Documents Management Section */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider">
                        Dokumenty i Faktury
                      </h4>
                      <button
                        onClick={() =>
                          setUploadDocData({ ...uploadDocData, project_id: project.id })
                        }
                        className="p-1.5 text-secondary hover:bg-indigo-50 rounded-lg transition-all"
                        title="Dodaj dokument"
                      >
                        <FilePlus size={16} />
                      </button>
                    </div>

                    <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                      {project.documents?.length === 0 ? (
                        <p className="text-xxs text-gray-400 italic">Brak dokumentów</p>
                      ) : (
                        project.documents?.map((doc) => (
                          <div
                            key={doc.id}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded-lg group/doc"
                          >
                            <div className="flex flex-col min-w-0">
                              <span className="text-[11px] font-bold text-dark truncate">
                                {doc.name}
                              </span>
                              <span className="text-xxs uppercase font-medium text-gray-400">
                                {doc.type === 'invoice' ? 'Faktura' : doc.subtype}
                              </span>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover/doc:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleDownload(doc.id, doc.name)}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                title="Pobierz"
                              >
                                <ExternalLink size={12} />
                              </button>
                              <button
                                onClick={() => handleDeleteDoc(doc.id)}
                                className="p-1 text-red-500 hover:bg-red-50 rounded"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Quick Upload Form (visible when project_id matches) */}
                    {uploadDocData.project_id === project.id && (
                      <form
                        onSubmit={handleUploadDocument}
                        className="mt-4 p-3 bg-indigo-50 rounded-xl space-y-3 animate-fade-in"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-xxs font-black uppercase text-secondary">
                            Nowy plik
                          </span>
                          <button
                            type="button"
                            onClick={() => setUploadDocData({ ...uploadDocData, project_id: '' })}
                          >
                            <X size={14} />
                          </button>
                        </div>
                        <input
                          className="w-full text-[11px] p-2 border-0 rounded-lg shadow-sm"
                          placeholder="Nazwa (np. Faktura FV/1/2026)"
                          value={uploadDocData.name}
                          onChange={(e) =>
                            setUploadDocData({ ...uploadDocData, name: e.target.value })
                          }
                          required
                        />
                        <div className="flex gap-2">
                          <select
                            className="flex-1 text-xxs p-2 border-0 rounded-lg shadow-sm bg-white"
                            value={uploadDocData.type}
                            onChange={(e) =>
                              setUploadDocData({ ...uploadDocData, type: e.target.value as any })
                            }
                          >
                            <option value="document">Dokument</option>
                            <option value="invoice">Faktura</option>
                          </select>
                          {uploadDocData.type === 'document' && (
                            <select
                              className="flex-1 text-xxs p-2 border-0 rounded-lg shadow-sm bg-white"
                              value={uploadDocData.subtype}
                              onChange={(e) =>
                                setUploadDocData({ ...uploadDocData, subtype: e.target.value })
                              }
                            >
                              <option value="contract">Umowa</option>
                              <option value="nda">NDA</option>
                              <option value="other">Inny</option>
                            </select>
                          )}
                        </div>
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={(e) =>
                            setUploadDocData({
                              ...uploadDocData,
                              file: e.target.files?.[0] || null,
                            })
                          }
                          className="text-xxs w-full"
                          required
                        />
                        <Button className="w-full py-2 text-xxs" disabled={isUploadingDoc}>
                          {isUploadingDoc ? 'Wgrywanie...' : 'Wgraj PDF'}
                        </Button>
                      </form>
                    )}
                  </div>

                  {/* Milestones Management Section */}
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider">
                        Harmonogram / Kamienie
                      </h4>
                      <button
                        onClick={() => {
                          setEditingMilestone({
                            project_id: project.id,
                            title: '',
                            description: '',
                            due_date: '',
                            status: 'pending',
                          });
                          setIsMilestoneModalOpen(true);
                        }}
                        className="p-1.5 text-instagram hover:bg-red-50 rounded-lg transition-all"
                        title="Dodaj kamień milowy"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <div className="space-y-2">
                      {project.milestones?.length === 0 ? (
                        <p className="text-xxs text-gray-400 italic">Brak kamieni milowych</p>
                      ) : (
                        project.milestones?.map((m) => (
                          <div
                            key={m.id}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded-lg group/mile"
                          >
                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                    m.status === 'accepted'
                                      ? 'bg-green-500'
                                      : m.status === 'corrections'
                                        ? 'bg-red-500'
                                        : 'bg-blue-500'
                                  }`}
                                ></span>
                                <span className="text-[11px] font-bold text-dark truncate">
                                  {m.title}
                                </span>
                              </div>
                              {m.feedback && (
                                <span className="text-xxs text-red-500 font-bold truncate max-w-[150px]">
                                  Uwaga: {m.feedback}
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => {
                                setEditingMilestone(m);
                                setIsMilestoneModalOpen(true);
                              }}
                              className="p-1 text-gray-400 hover:text-dark opacity-0 group-hover/mile:opacity-100"
                            >
                              <Edit size={12} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {filteredProjects.length === 0 && (
                <div className="col-span-full py-12 text-center text-gray-400 bg-white rounded-xl border border-dashed">
                  Nie znaleziono projektów spełniających kryteria.
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- MILESTONE MODAL --- */}
        {isMilestoneModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] backdrop-blur-sm">
            <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-dark">
                  {editingMilestone.id ? 'Edytuj' : 'Dodaj'} Etap Projektu
                </h2>
                <button onClick={() => setIsMilestoneModalOpen(false)}>
                  <X className="text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSaveMilestone} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase block mb-1">
                    Tytuł etapu
                  </label>
                  <input
                    className="w-full p-3 border rounded-lg"
                    placeholder="np. Makieta UX"
                    value={editingMilestone.title || ''}
                    onChange={(e) =>
                      setEditingMilestone({ ...editingMilestone, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase block mb-1">
                    Opis prac
                  </label>
                  <textarea
                    className="w-full p-3 border rounded-lg h-24"
                    placeholder="Co zrobimy w tym etapie..."
                    value={editingMilestone.description || ''}
                    onChange={(e) =>
                      setEditingMilestone({ ...editingMilestone, description: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase block mb-1">
                      Termin
                    </label>
                    <input
                      type="date"
                      className="w-full p-3 border rounded-lg"
                      value={editingMilestone.due_date || ''}
                      onChange={(e) =>
                        setEditingMilestone({ ...editingMilestone, due_date: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase block mb-1">
                      Status
                    </label>
                    <select
                      className="w-full p-3 border rounded-lg bg-white"
                      value={editingMilestone.status || 'pending'}
                      onChange={(e) =>
                        setEditingMilestone({ ...editingMilestone, status: e.target.value })
                      }
                    >
                      <option value="pending">Oczekujący</option>
                      <option value="accepted">Zaakceptowany</option>
                      <option value="corrections">Do poprawy</option>
                    </select>
                  </div>
                </div>

                <Button className="w-full justify-center py-3 mt-4" disabled={isSavingMilestone}>
                  {isSavingMilestone ? 'Zapisywanie...' : 'Zapisz Etap'}
                </Button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'leads' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 uppercase font-bold text-xs">
                  <tr>
                    <th className="px-6 py-4">Data</th>
                    <th className="px-6 py-4">Klient / Usługa</th>
                    <th className="px-6 py-4">Postęp</th>
                    <th className="px-6 py-4">Wiadomość</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Akcje</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {leads.map((lead) => (
                    <tr
                      key={lead.id}
                      className={`hover:bg-gray-50 transition-colors ${lead.status === 'new' ? 'bg-blue-50/30' : ''}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-xs relative">
                        {lead.status === 'new' && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                        )}
                        {new Date(lead.created_at).toLocaleString('pl-PL')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="font-bold text-dark">{lead.name || 'Anonim'}</div>
                          {lead.status === 'new' && (
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400">{lead.email}</div>
                        <div className="text-xxs uppercase font-bold text-primary mt-1">
                          {lead.service_type} {lead.package_name && `• ${lead.package_name}`}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 w-20">
                          <div className="text-xxs font-bold text-gray-400 uppercase">
                            Krok {lead.current_step || 1}/3
                          </div>
                          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${lead.current_step >= 3 ? 'bg-green-500' : 'bg-primary'}`}
                              style={{ width: `${(lead.current_step / 3) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-600 line-clamp-2 max-w-xs">
                          {lead.message || 'Brak treści'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xxs font-bold uppercase ${
                            lead.status === 'new'
                              ? 'bg-blue-100 text-blue-600'
                              : lead.status === 'converted'
                                ? 'bg-purple-100 text-purple-600'
                                : 'bg-green-100 text-green-600'
                          }`}
                        >
                          {lead.status === 'new'
                            ? 'Nowy'
                            : lead.status === 'converted'
                              ? 'KLIENT'
                              : 'Kontakt'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <button
                          onClick={() => setViewingLead(lead)}
                          className="p-2 text-gray-500 hover:text-secondary hover:bg-gray-100 rounded-lg transition-colors"
                          title="Zobacz szczegóły"
                        >
                          <FileText size={16} />
                        </button>
                        {lead.status !== 'converted' && (
                          <button
                            onClick={() => handleConvertLead(lead.id)}
                            className="px-3 py-1 bg-purple-600 text-white rounded-lg text-xs font-bold hover:bg-purple-700 transition-colors"
                            title="Utwórz konto klienta"
                          >
                            Zrób Klienta
                          </button>
                        )}
                        <button
                          onClick={() => setReplyingTo(lead)}
                          className="px-3 py-1 bg-secondary text-white rounded-lg text-xs font-bold hover:bg-dark transition-colors"
                        >
                          Odpisz
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="grid grid-cols-12 gap-6 h-[600px] animate-fade-in">
            {/* Conversations List */}
            <div className="col-span-4 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-gray-100 shrink-0">
                <input
                  type="text"
                  placeholder="Szukaj klienta..."
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-100 outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {filteredConversations.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-sm">Nie znaleziono</div>
                ) : (
                  filteredConversations.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => setActiveChatId(conv.id)}
                      className={`p-4 border-b border-gray-50 cursor-pointer transition-colors hover:bg-gray-50 ${activeChatId === conv.id ? 'bg-indigo-50 border-l-4 border-l-[#3F3D91]' : ''}`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-dark">{conv.name}</span>
                        {conv.unread_count > 0 && (
                          <span className="bg-red-500 text-white text-xxs font-bold px-2 py-0.5 rounded-full">
                            {conv.unread_count}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">{conv.company_name}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Chat Window */}
            <div className="col-span-8 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
              {activeChatId ? (
                <>
                  <div className="p-4 border-b border-gray-100 font-bold text-dark shrink-0">
                    Czat z: {conversations.find((c) => c.id === activeChatId)?.name}
                  </div>
                  <div
                    ref={chatContainerRef}
                    onScroll={handleChatScroll}
                    className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-50/30 custom-scrollbar"
                  >
                    {chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] p-3 rounded-xl text-sm shadow-sm ${
                            msg.sender_type === 'admin'
                              ? 'bg-secondary text-white rounded-br-none'
                              : 'bg-white border border-gray-200 text-gray-700 rounded-bl-none'
                          }`}
                        >
                          {msg.content}
                          <div
                            className={`text-xxs mt-1 flex items-center justify-end gap-1 opacity-60`}
                          >
                            {new Date(msg.created_at).toLocaleTimeString('pl-PL', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                            {msg.sender_type === 'admin' && (
                              <span>
                                {msg.is_read === '1' || (msg as any).is_read === 1 ? (
                                  <CheckCheck size={12} className="text-blue-300" />
                                ) : (
                                  <Check size={12} />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                  <form
                    onSubmit={sendAdminMessage}
                    className="p-4 border-t border-gray-100 flex gap-4 shrink-0"
                  >
                    <input
                      className="flex-1 p-3 border rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none"
                      placeholder="Napisz wiadomość..."
                      value={adminMessage}
                      onChange={(e) => setAdminMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                    <Button icon={<Send size={18} />}>Wyślij</Button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400">
                  Wybierz konwersację z listy
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- LEAD DETAILS MODAL --- */}
        {viewingLead && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white p-8 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-dark">Szczegóły Zgłoszenia</h2>
                <button onClick={() => setViewingLead(null)}>
                  <X className="text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
                    Nadawca
                  </div>
                  <div className="font-bold text-dark">{viewingLead.name}</div>
                  <div className="text-sm text-gray-600">{viewingLead.email}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
                      Usługa
                    </div>
                    <div className="text-sm font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded inline-block">
                      {viewingLead.service_type}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
                      Budżet
                    </div>
                    <div className="text-sm font-bold text-green-600">
                      {viewingLead.budget || '-'}
                    </div>
                  </div>
                </div>

                {viewingLead.company && (
                  <div>
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
                      Firma
                    </div>
                    <div className="text-sm text-gray-700">{viewingLead.company}</div>
                  </div>
                )}

                {/* Dynamic Details from Smart Forms */}
                {viewingLead.details && (
                  <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                    <div className="text-xxs font-black text-secondary uppercase tracking-[0.2em] mb-3">
                      Parametry Szczegółowe
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {Object.entries(JSON.parse(viewingLead.details)).map(([key, val]) => {
                        if (!val || typeof val !== 'string') return null;
                        const label = key
                          .replace(/([A-Z])/g, ' $1')
                          .replace(/^./, (str) => str.toUpperCase());
                        return (
                          <div key={key} className="flex justify-between text-xs">
                            <span className="text-gray-500 font-medium">{label}:</span>
                            <span className="font-bold text-dark">{val}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                    Treść / Opis Celu
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-700 whitespace-pre-wrap border border-gray-200 font-mono">
                    {viewingLead.message}
                  </div>
                </div>

                <div className="text-xs text-gray-400 text-right pt-4 border-t border-gray-100">
                  Data: {new Date(viewingLead.created_at).toLocaleString('pl-PL')}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- REPLY MODAL --- */}
        {replyingTo && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white p-8 rounded-2xl w-full max-w-2xl shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-dark">Odpowiedz na zapytanie</h2>
                  <p className="text-sm text-gray-500">
                    Do: {replyingTo.name} ({replyingTo.email})
                  </p>
                </div>
                <button onClick={() => setReplyingTo(null)}>
                  <X className="text-gray-400" />
                </button>
              </div>

              <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100 italic text-sm text-gray-600">
                "{replyingTo.message}"
              </div>

              <form onSubmit={handleReply} className="space-y-4">
                <textarea
                  className="w-full p-4 border rounded-xl h-48 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  placeholder="Wpisz treść wiadomości do klienta..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  required
                />
                <div className="flex justify-end gap-4">
                  <Button variant="outline" onClick={() => setReplyingTo(null)}>
                    Anuluj
                  </Button>
                  <Button icon={<Send size={18} />}>Wyślij Odpowiedź</Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* --- MODAL --- */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white p-8 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-dark">
                  {editingItem.id ? 'Edytuj' : 'Dodaj'}{' '}
                  {activeTab === 'clients' ? 'Klienta' : 'Projekt'}
                </h2>
                <button onClick={() => setIsModalOpen(false)}>
                  <X className="text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                {activeTab === 'clients' ? (
                  <>
                    <input
                      className="w-full p-3 border rounded-lg"
                      placeholder="Imię i Nazwisko"
                      value={editingItem.name || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                      required
                    />
                    <input
                      className="w-full p-3 border rounded-lg"
                      placeholder="Email"
                      type="email"
                      value={editingItem.email || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, email: e.target.value })}
                      required
                    />
                    <input
                      className="w-full p-3 border rounded-lg"
                      placeholder="Nazwa Firmy"
                      value={editingItem.company_name || ''}
                      onChange={(e) =>
                        setEditingItem({ ...editingItem, company_name: e.target.value })
                      }
                    />
                  </>
                ) : (
                  <>
                    <select
                      className="w-full p-3 border rounded-lg bg-white"
                      value={editingItem.user_id || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, user_id: e.target.value })}
                      required
                    >
                      <option value="">Wybierz Klienta</option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.company_name})
                        </option>
                      ))}
                    </select>
                    <input
                      className="w-full p-3 border rounded-lg"
                      placeholder="Nazwa Projektu"
                      value={editingItem.name || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                      required
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <select
                        className="w-full p-3 border rounded-lg bg-white"
                        value={editingItem.type || 'web'}
                        onChange={(e) => setEditingItem({ ...editingItem, type: e.target.value })}
                      >
                        <option value="web">Web Development</option>
                        <option value="marketing">Marketing</option>
                        <option value="design">Design</option>
                      </select>
                      <input
                        className="w-full p-3 border rounded-lg font-bold text-green-600"
                        placeholder="Budżet (np. 5000 PLN)"
                        value={editingItem.budget || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, budget: e.target.value })}
                      />
                    </div>
                    <select
                      className="w-full p-3 border rounded-lg bg-white"
                      value={editingItem.status || 'pending'}
                      onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value })}
                    >
                      <option value="pending">Oczekujący</option>
                      <option value="in_progress">W trakcie</option>
                      <option value="review">Do akceptacji</option>
                      <option value="completed">Zakończony</option>
                    </select>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-bold text-gray-600">
                        Postęp: {editingItem.progress || 0}%
                      </span>
                      <input
                        type="range"
                        className="flex-1"
                        min="0"
                        max="100"
                        value={editingItem.progress || 0}
                        onChange={(e) =>
                          setEditingItem({ ...editingItem, progress: parseInt(e.target.value) })
                        }
                      />
                    </div>
                    <input
                      className="w-full p-3 border rounded-lg"
                      placeholder="Link do Drive"
                      value={editingItem.drive_link || ''}
                      onChange={(e) =>
                        setEditingItem({ ...editingItem, drive_link: e.target.value })
                      }
                    />
                    <input
                      className="w-full p-3 border rounded-lg"
                      placeholder="Następny krok (tekst)"
                      value={editingItem.next_milestone || ''}
                      onChange={(e) =>
                        setEditingItem({ ...editingItem, next_milestone: e.target.value })
                      }
                    />
                    <input
                      className="w-full p-3 border rounded-lg"
                      type="date"
                      value={editingItem.next_milestone_date || ''}
                      onChange={(e) =>
                        setEditingItem({ ...editingItem, next_milestone_date: e.target.value })
                      }
                    />
                  </>
                )}

                <Button className="w-full justify-center py-3 mt-4" icon={<Save size={18} />}>
                  Zapisz Zmiany
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
