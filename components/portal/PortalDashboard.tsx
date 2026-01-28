/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  LogOut,
  FolderOpen,
  Clock,
  Calendar,
  ExternalLink,
  RefreshCw,
  Home,
  Layout,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Send,
  ShieldCheck,
  User as UserIcon,
  X,
  Save,
  FileText,
  Check,
  CheckCheck,
  FileDown,
} from 'lucide-react';
import Button from '../common/Button';
import GlassCard from '../common/GlassCard';
import AnimateOnScroll from '../common/AnimateOnScroll';
import LazyHydrate from '../common/LazyHydrate';

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

interface Message {
  id: string;
  content: string;
  sender_type: 'client' | 'admin';
  created_at: string;
  is_read?: string | number;
}

interface Project {
  id: string;
  name: string;
  type: string;
  status: 'pending' | 'in_progress' | 'review' | 'completed';
  progress: number;
  budget: string;
  drive_link: string;
  next_milestone: string;
  next_milestone_date: string;
  documents?: ProjectDoc[];
  milestones?: Milestone[];
}

const PortalDashboard: React.FC = () => {
  const { user, sessionToken, logout, updateUser, isLoading } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Profile Edit State
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileData, setProfileData] = useState({ name: '', company_name: '' });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Detail View State
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const selectedProject = projects.find((p) => p.id === selectedProjectId);
  const [isUpdatingMilestone, setIsUpdatingMilestone] = useState(false);
  const [milestoneFeedback, setMilestoneFeedback] = useState('');
  const [activeMilestoneAction, setActiveMilestoneAction] = useState<{
    id: string;
    type: 'accepted' | 'corrections';
  } | null>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);

  // Initialize profile data
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        company_name: user.company_name || '',
      });
    }
  }, [user]);

  // Redirect Logic
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        navigate('/portal');
      } else if (user.role === 'admin') {
        navigate('/portal/admin');
      }
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    const unreadCount = messages.filter(
      (m) => m.sender_type === 'admin' && (m.is_read === '0' || m.is_read === 0 || !m.is_read),
    ).length;
    if (unreadCount > 0) {
      document.title = `(${unreadCount}) Nowa wiadomość | Portal`;
    } else {
      document.title = 'Panel Klienta | Mixture Marketing';
    }
    return () => {
      document.title = 'Mixture Marketing';
    };
  }, [messages]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionToken) return;
    setIsUpdatingProfile(true);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionToken}`,
        'X-Auth-Token': sessionToken || '',
      };
      const res = await fetch('/api/portal/update_profile.php', {
        method: 'POST',
        headers,
        body: JSON.stringify(profileData),
      });

      if (res.ok) {
        const data = await res.json();
        updateUser(data.user);
        setIsProfileModalOpen(false);
      } else {
        alert('Błąd podczas aktualizacji profilu.');
      }
    } catch (e) {
      console.error(e);
      alert('Błąd połączenia.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUpdateMilestone = async (
    milestoneId: string,
    status: 'accepted' | 'corrections',
    feedback: string = '',
  ) => {
    if (!sessionToken) return;
    setIsUpdatingMilestone(true);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionToken}`,
        'X-Auth-Token': sessionToken || '',
      };
      const res = await fetch('/api/portal/update_milestone.php', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          id: milestoneId,
          status,
          feedback,
        }),
      });

      if (res.ok) {
        fetchProjects(); // Refresh all data
        setActiveMilestoneAction(null);
        setMilestoneFeedback('');
      } else {
        alert('Błąd podczas aktualizacji statusu.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdatingMilestone(false);
    }
  };

  // Fetch Projects Logic
  const fetchProjects = useCallback(async () => {
    if (!sessionToken) return;
    try {
      const res = await fetch(`/api/portal/dashboard.php?t=${Date.now()}`, {
        headers: {
          Authorization: `Bearer ${sessionToken}`,
          'X-Auth-Token': sessionToken,
        },
      });
      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      setProjects(data.projects || []); // Default to empty array
    } catch (e) {
      console.error('Projects Fetch Error:', e);
      setError('Błąd ładowania projektów.');
    } finally {
      setLoadingProjects(false);
    }
  }, [sessionToken]);

  // Fetch Messages Logic
  const fetchMessages = useCallback(async () => {
    if (!sessionToken) return;
    try {
      // Add timestamp to bypass all levels of caching (Browser, CDN, Proxy)
      const res = await fetch(`/api/portal/get_messages.php?t=${Date.now()}`, {
        headers: {
          Authorization: `Bearer ${sessionToken}`,
          'X-Auth-Token': sessionToken,
        },
      });
      const data = await res.json();
      if (res.ok) {
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
      }
    } catch (e) {
      console.error(e);
    }
  }, [sessionToken]);

  // Initial Fetch & Polling
  useEffect(() => {
    if (sessionToken && user?.role !== 'admin') {
      fetchProjects();
      fetchMessages(); // Initial fetch

      const interval = setInterval(() => {
        if (document.hidden) return; // Optymalizacja: nie odpytuj gdy karta nieaktywna
        fetchMessages();
      }, 5000); // Poll every 5s

      return () => clearInterval(interval);
    }
  }, [fetchProjects, fetchMessages, sessionToken, user?.role]);

  // Handle Scroll to track if user is at bottom
  const handleChatScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      isAtBottomRef.current = scrollHeight - scrollTop - clientHeight < 50;
    }
  };

  // Smart Scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      const isFromMe = lastMessage.sender_type === 'client';

      if (isAtBottomRef.current || isFromMe) {
        const { scrollHeight, clientHeight } = chatContainerRef.current;
        chatContainerRef.current.scrollTo({
          top: scrollHeight - clientHeight,
          behavior: 'smooth',
        });
      }
    }
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleSendMessage = async (e: React.FormEvent | React.KeyboardEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !sessionToken) return;

    // Optimistic UI
    const tempId = 'temp-' + Date.now();
    const tempMsg: Message = {
      id: tempId,
      content: newMessage,
      sender_type: 'client',
      created_at: new Date().toISOString(),
    };

    // Add temp message immediately
    setMessages((prev) => [...prev, tempMsg]);
    setNewMessage('');
    isAtBottomRef.current = true; // Force scroll for my own message

    try {
      const res = await fetch('/api/portal/send_message.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`,
          'X-Auth-Token': sessionToken,
        },
        body: JSON.stringify({
          content: tempMsg.content,
          sender_type: 'client',
        }),
      });

      if (res.ok) {
        // Force refresh from server to get real ID and confirm save
        fetchMessages();
      }
    } catch (e) {
      console.error(e);
      alert('Nie udało się wysłać wiadomości.');
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
        alert('Błąd pobierania pliku. Może nie masz uprawnień?');
      }
    } catch (e) {
      console.error(e);
      alert('Błąd połączenia.');
    }
  };

  if (isLoading || !user) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'in_progress':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'review':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Zakończony';
      case 'in_progress':
        return 'W trakcie';
      case 'review':
        return 'Do akceptacji';
      default:
        return 'Oczekujący';
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Dzień dobry';
    if (hour < 18) return 'Dzień dobry';
    return 'Dobry wieczór';
  };

  const activeProjectsCount = projects.filter((p) => p.status !== 'completed').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-dark rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-105 transition-transform">
                M
              </div>
              <div className="hidden md:block">
                <span className="block font-bold text-dark leading-none">Mixture</span>
                <span className="text-xxs font-bold text-gray-400 uppercase tracking-widest">
                  Portal
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            {user.role === 'admin' && (
              <Link
                to="/portal/admin"
                className="hidden md:flex items-center gap-2 text-sm font-bold text-instagram hover:text-[#C2185B] transition-colors bg-red-50 px-3 py-1 rounded-lg border border-red-100"
              >
                <ShieldCheck size={16} /> Panel Admina
              </Link>
            )}
            <Link
              to="/"
              className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-secondary transition-colors"
            >
              <Home size={18} /> Strona główna
            </Link>
            <div className="h-8 w-px bg-gray-200 hidden md:block"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold text-dark">{user.name}</div>
                <div className="text-xxs text-gray-500">{user.email}</div>
              </div>
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="p-2 text-gray-400 hover:text-secondary hover:bg-indigo-50 rounded-lg transition-all"
                title="Edytuj profil"
              >
                <UserIcon size={20} />
              </button>
              <button
                onClick={logout}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                title="Wyloguj się"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AnimateOnScroll>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-dark mb-2">
                {getGreeting()}, {user.name.split(' ')[0]} 👋
              </h1>
              <p className="text-gray-600 text-lg">
                {user.company_name
                  ? `Współpracujemy z ${user.company_name}`
                  : 'Oto podsumowanie Twoich projektów.'}
              </p>
            </div>

            <div className="flex gap-4">
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <Layout size={20} />
                </div>
                <div>
                  <div className="text-xxs uppercase font-bold text-gray-400 tracking-wider">
                    Aktywne
                  </div>
                  <div className="text-xl font-black text-dark">{activeProjectsCount}</div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <div className="text-xxs uppercase font-bold text-gray-400 tracking-wider">
                    Ukończone
                  </div>
                  <div className="text-xl font-black text-dark">
                    {projects.length - activeProjectsCount}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AnimateOnScroll>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl mb-8 flex items-center gap-3">
            <AlertCircle size={20} /> {error}
          </div>
        )}

        {/* Projects Grid */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-dark">Twoje Projekty</h2>
            <div className="h-px flex-1 bg-gray-100 mx-8 hidden md:block"></div>
          </div>

          {loadingProjects ? (
            <div className="flex flex-col items-center justify-center py-20">
              <RefreshCw className="animate-spin text-secondary mb-4" size={32} />
              <p className="text-gray-400 font-medium">Ładowanie projektów...</p>
            </div>
          ) : projects.length === 0 ? (
            <AnimateOnScroll>
              <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                  <FolderOpen size={40} />
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">Brak aktywnych projektów</h3>
                <p className="text-500 max-w-md mx-auto mb-8">
                  Wygląda na to, że nie masz jeszcze przypisanych żadnych projektów. Jeśli uważasz,
                  że to błąd, skontaktuj się z nami.
                </p>
                <Button
                  onClick={() => (window.location.href = 'mailto:kontakt@mixturemarketing.pl')}
                >
                  Skontaktuj się z opiekunem
                </Button>
              </div>
            </AnimateOnScroll>
          ) : (
            <LazyHydrate minHeight="400px">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {projects.map((project, index) => (
                  <AnimateOnScroll key={project.id} delay={index * 100} className="h-full">
                    <GlassCard
                      onClick={() => setSelectedProjectId(project.id)}
                      className="p-0 bg-white border border-gray-100 flex flex-col h-full hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
                    >
                      {/* Card Header */}
                      <div className="p-6 border-b border-gray-50 bg-gradient-to-b from-gray-50/50 to-white">
                        <div className="flex justify-between items-start mb-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xxs font-bold uppercase border tracking-wide ${getStatusColor(project.status)}`}
                          >
                            {getStatusLabel(project.status)}
                          </span>
                          {project.type === 'web' && (
                            <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-1 rounded">
                              WEB
                            </span>
                          )}
                          {project.type === 'marketing' && (
                            <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-1 rounded">
                              ADS
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-bold text-dark group-hover:text-secondary transition-colors line-clamp-2">
                          {project.name}
                        </h3>
                      </div>

                      {/* Progress Section */}
                      <div className="p-6 flex-grow">
                        <div className="mb-6">
                          <div className="flex justify-between text-xs font-medium text-gray-500 mb-2">
                            <span>Postęp realizacji</span>
                            <span className="text-secondary font-bold">{project.progress}%</span>
                          </div>
                          <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-1000 ease-out"
                              style={{ width: `${project.progress}%` }}
                            ></div>
                          </div>
                        </div>

                        {project.next_milestone && (
                          <div className="bg-[#F8FAFC] p-4 rounded-xl border border-gray-100 group-hover:border-[#E0EFFF] transition-colors">
                            <div className="flex items-center gap-2 text-xs font-bold text-secondary mb-2 uppercase tracking-wide">
                              <Clock size={12} /> Następny krok
                            </div>
                            <div className="text-sm font-medium text-gray-700 mb-2">
                              {project.next_milestone}
                            </div>
                            {project.next_milestone_date && (
                              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                <Calendar size={12} />
                                <span>
                                  Termin:{' '}
                                  {new Date(project.next_milestone_date).toLocaleDateString(
                                    'pl-PL',
                                  )}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Footer Actions */}
                      <div className="p-4 bg-gray-50/50 border-t border-gray-100 mt-auto">
                        <div className="flex items-center justify-center gap-2 w-full py-3 bg-white border border-gray-200 text-secondary rounded-xl font-bold text-sm hover:bg-secondary hover:text-white hover:border-secondary transition-all shadow-sm">
                          Zobacz szczegóły <ExternalLink size={12} />
                        </div>
                      </div>
                    </GlassCard>
                  </AnimateOnScroll>
                ))}
              </div>
            </LazyHydrate>
          )}
        </div>

        {/* --- PROJECT DETAILS MODAL --- */}
        {selectedProject && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-md p-4 overflow-y-auto">
            <AnimateOnScroll className="w-full max-w-4xl my-auto">
              <div className="bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Modal Header */}
                <div className="p-8 border-b border-gray-100 flex justify-between items-start bg-gradient-to-r from-gray-50 to-white">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xxs font-bold uppercase border tracking-wide ${getStatusColor(selectedProject.status)}`}
                      >
                        {getStatusLabel(selectedProject.status)}
                      </span>
                      <span className="text-xs font-mono text-gray-400 uppercase">
                        {selectedProject.type}
                      </span>
                    </div>
                    <h2 className="text-3xl font-black text-dark">{selectedProject.name}</h2>
                  </div>
                  <button
                    onClick={() => setSelectedProjectId(null)}
                    className="p-3 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left Column: Progress & Timeline */}
                    <div className="lg:col-span-2 space-y-10">
                      {/* Visual Progress */}
                      <div>
                        <h3 className="text-sm font-black uppercase text-gray-400 tracking-widest mb-6">
                          Harmonogram Projektu
                        </h3>

                        <div className="relative space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                          {selectedProject.milestones && selectedProject.milestones.length > 0 ? (
                            selectedProject.milestones.map((m, idx) => (
                              <div key={m.id} className="relative pl-10 group">
                                {/* Timeline Dot */}
                                <div
                                  className={`absolute left-0 top-1.5 w-6 h-6 rounded-full border-4 border-white shadow-sm z-10 transition-colors ${
                                    m.status === 'accepted'
                                      ? 'bg-green-500'
                                      : m.status === 'corrections'
                                        ? 'bg-red-500'
                                        : 'bg-blue-500'
                                  }`}
                                ></div>

                                <div
                                  className={`p-6 rounded-2xl border transition-all ${
                                    m.status === 'accepted'
                                      ? 'bg-green-50/30 border-green-100'
                                      : m.status === 'corrections'
                                        ? 'bg-red-50/30 border-red-100'
                                        : 'bg-white border-gray-100 shadow-sm'
                                  }`}
                                >
                                  <div className="flex justify-between items-start mb-2 gap-4">
                                    <h4 className="font-bold text-dark">{m.title}</h4>
                                    {m.due_date && (
                                      <span className="text-xxs font-bold text-gray-400 uppercase bg-gray-50 px-2 py-1 rounded">
                                        Termin: {new Date(m.due_date).toLocaleDateString('pl-PL')}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                                    {m.description}
                                  </p>

                                  {m.feedback && (
                                    <div className="mb-4 p-3 bg-white/50 rounded-xl border border-dashed border-gray-200 text-xs italic text-gray-600">
                                      <strong>Twoje uwagi:</strong>
                                      <br />
                                      {m.feedback}
                                    </div>
                                  )}

                                  {/* Actions */}
                                  {m.status === 'pending' || m.status === 'corrections' ? (
                                    <div className="flex gap-3 mt-4">
                                      {activeMilestoneAction?.id === m.id ? (
                                        <div className="w-full space-y-3 animate-fade-in">
                                          <textarea
                                            className="w-full p-3 text-xs border rounded-xl focus:ring-2 focus:ring-indigo-50 outline-none"
                                            placeholder={
                                              activeMilestoneAction.type === 'accepted'
                                                ? 'Opcjonalny komentarz (np. Super robota!)'
                                                : 'Opisz co wymaga poprawy...'
                                            }
                                            value={milestoneFeedback}
                                            onChange={(e) => setMilestoneFeedback(e.target.value)}
                                            rows={3}
                                          />
                                          <div className="flex gap-2">
                                            <Button
                                              className="flex-1 py-2 text-xs"
                                              onClick={() =>
                                                handleUpdateMilestone(
                                                  m.id,
                                                  activeMilestoneAction.type,
                                                  milestoneFeedback,
                                                )
                                              }
                                              disabled={isUpdatingMilestone}
                                            >
                                              {isUpdatingMilestone ? 'Zapisywanie...' : 'Wyślij'}
                                            </Button>
                                            <Button
                                              variant="outline"
                                              className="py-2 text-xs"
                                              onClick={() => setActiveMilestoneAction(null)}
                                            >
                                              Anuluj
                                            </Button>
                                          </div>
                                        </div>
                                      ) : (
                                        <>
                                          <button
                                            onClick={() => {
                                              setActiveMilestoneAction({
                                                id: m.id,
                                                type: 'accepted',
                                              });
                                              setMilestoneFeedback('');
                                            }}
                                            className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition-colors"
                                          >
                                            <Check size={14} /> Akceptuję
                                          </button>
                                          <button
                                            onClick={() => {
                                              setActiveMilestoneAction({
                                                id: m.id,
                                                type: 'corrections',
                                              });
                                              setMilestoneFeedback('');
                                            }}
                                            className="flex items-center gap-1.5 px-4 py-2 border border-red-200 text-red-600 text-xs font-bold rounded-lg hover:bg-red-50 transition-colors"
                                          >
                                            <RefreshCw size={14} /> Zgłoś poprawki
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2 text-green-600 text-xs font-bold">
                                      <CheckCheck size={16} /> Etap Zaakceptowany
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-8 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                              <p className="text-gray-400 text-sm">
                                Harmonogram nie został jeszcze dodany do tego projektu.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Info & Resources */}
                    <div className="space-y-10">
                      <div>
                        <h3 className="text-sm font-black uppercase text-gray-400 tracking-widest mb-4">
                          Podsumowanie
                        </h3>
                        <div className="bg-[#F8FAFC] rounded-2xl p-6 space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">Postęp</span>
                            <span className="text-sm font-bold text-secondary">
                              {selectedProject.progress}%
                            </span>
                          </div>
                          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 transition-all duration-1000"
                              style={{ width: `${selectedProject.progress}%` }}
                            ></div>
                          </div>
                          <div className="pt-4 grid grid-cols-2 gap-4">
                            <div>
                              <span className="text-xxs uppercase font-bold text-gray-400 block mb-1">
                                Typ projektu
                              </span>
                              <span className="text-sm font-bold text-dark uppercase">
                                {selectedProject.type}
                              </span>
                            </div>
                            {selectedProject.budget && (
                              <div>
                                <span className="text-xxs uppercase font-bold text-gray-400 block mb-1">
                                  Wartość
                                </span>
                                <span className="text-sm font-black text-green-600">
                                  {selectedProject.budget}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-black uppercase text-gray-400 tracking-widest mb-4">
                          Pliki Projektowe
                        </h3>
                        <div className="space-y-2">
                          {selectedProject.documents && selectedProject.documents.length > 0 ? (
                            selectedProject.documents.map((doc) => (
                              <button
                                key={doc.id}
                                onClick={() => handleDownload(doc.id, doc.name)}
                                className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:border-blue-200 hover:shadow-sm transition-all group w-full text-left"
                              >
                                <div className="flex items-center gap-3">
                                  <FileDown
                                    size={16}
                                    className="text-gray-400 group-hover:text-blue-500"
                                  />
                                  <span className="text-xs font-bold text-dark truncate max-w-[120px]">
                                    {doc.name}
                                  </span>
                                </div>
                                <span className="text-xxs font-bold text-gray-300 uppercase">
                                  {doc.type}
                                </span>
                              </button>
                            ))
                          ) : (
                            <p className="text-xs text-gray-400 italic">Brak wgranych plików.</p>
                          )}
                        </div>
                      </div>

                      <div className="bg-dark rounded-2xl p-6 text-white">
                        <h4 className="text-sm font-bold mb-2 text-primary">Pomoc techniczna</h4>
                        <p className="text-[11px] text-gray-300 mb-4 leading-relaxed">
                          Masz pytania do harmonogramu? Napisz do nas na czacie lub zadzwoń
                          bezpośrednio.
                        </p>
                        <Button
                          variant="outline"
                          className="w-full text-white border-white/20 hover:bg-white/10 py-2 text-xs"
                          onClick={() => setSelectedProjectId(null)}
                        >
                          Wróć do czatu
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        )}
        {/* --- INVOICES & DOCUMENTS --- */}
        <AnimateOnScroll className="mb-16">
          <LazyHydrate minHeight="300px">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Invoices Column */}
              <GlassCard className="bg-white border border-gray-100 p-8 flex flex-col h-full">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-dark">Faktury i Rozliczenia</h2>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                      Bieżące płatności
                    </p>
                  </div>
                </div>

                <div className="space-y-3 flex-1">
                  {projects.flatMap((p) => p.documents || []).filter((d) => d.type === 'invoice')
                    .length === 0 ? (
                    <div className="py-10 text-center border-2 border-dashed border-gray-50 rounded-2xl">
                      <p className="text-sm text-gray-400 italic">Brak wystawionych faktur</p>
                    </div>
                  ) : (
                    projects
                      .flatMap((p) => p.documents || [])
                      .filter((d) => d.type === 'invoice')
                      .map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-blue-50 transition-colors group"
                        >
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-dark">{doc.name}</span>
                            <span className="text-xxs text-gray-400">
                              {new Date(doc.created_at).toLocaleDateString('pl-PL')}
                            </span>
                          </div>
                          <button
                            onClick={() => handleDownload(doc.id, doc.name)}
                            className="p-2 bg-white text-blue-600 rounded-xl shadow-sm hover:scale-110 transition-transform cursor-pointer"
                            title="Pobierz fakturę"
                          >
                            <FileDown size={18} />
                          </button>
                        </div>
                      ))
                  )}
                </div>
              </GlassCard>

              {/* Documents Column */}
              <GlassCard className="bg-white border border-gray-100 p-8 flex flex-col h-full">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-dark">Umowy i Dokumenty</h2>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                      Formalności i NDA
                    </p>
                  </div>
                </div>

                <div className="space-y-3 flex-1">
                  {projects.flatMap((p) => p.documents || []).filter((d) => d.type === 'document')
                    .length === 0 ? (
                    <div className="py-10 text-center border-2 border-dashed border-gray-50 rounded-2xl">
                      <p className="text-sm text-gray-400 italic">Brak dokumentów projektowych</p>
                    </div>
                  ) : (
                    projects
                      .flatMap((p) => p.documents || [])
                      .filter((d) => d.type === 'document')
                      .map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-purple-50 transition-colors group"
                        >
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-dark">{doc.name}</span>
                              <span className="text-xxs px-1.5 py-0.5 bg-white text-purple-600 border border-purple-100 rounded-md font-bold uppercase">
                                {doc.subtype}
                              </span>
                            </div>
                            <span className="text-xxs text-gray-400">
                              {new Date(doc.created_at).toLocaleDateString('pl-PL')}
                            </span>
                          </div>
                          <button
                            onClick={() => handleDownload(doc.id, doc.name)}
                            className="p-2 bg-white text-purple-600 rounded-xl shadow-sm hover:scale-110 transition-transform cursor-pointer"
                            title="Pobierz dokument"
                          >
                            <FileDown size={18} />
                          </button>
                        </div>
                      ))
                  )}
                </div>
              </GlassCard>
            </div>
          </LazyHydrate>
        </AnimateOnScroll>

        {/* --- CHAT SECTION --- */}

        <LazyHydrate minHeight="600px">
          <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <GlassCard className="bg-white border border-gray-100 overflow-hidden flex flex-col h-[600px]">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#F9FAFB]">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg text-secondary">
                      <MessageSquare size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-dark">Wsparcie i Kontakt</h3>
                      <p className="text-xs text-gray-500">Twój bezpośredni kanał komunikacji</p>
                    </div>
                  </div>
                </div>

                <div
                  ref={chatContainerRef}
                  onScroll={handleChatScroll}
                  className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-4 bg-white"
                >
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-400 py-10 text-sm">
                      Tutaj pojawi się historia Twoich wiadomości.
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender_type === 'client' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                            msg.sender_type === 'client'
                              ? 'bg-secondary text-white rounded-br-none'
                              : 'bg-[#F0F2F5] text-dark rounded-bl-none'
                          }`}
                        >
                          {msg.content}
                          <div
                            className={`text-xxs mt-2 flex items-center justify-end gap-1 opacity-60`}
                          >
                            {new Date(msg.created_at).toLocaleTimeString('pl-PL', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                            {msg.sender_type === 'client' && (
                              <span>
                                {msg.is_read === '1' || msg.is_read === 1 ? (
                                  <CheckCheck size={12} className="text-blue-300" />
                                ) : (
                                  <Check size={12} />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-4 border-t border-gray-100 bg-white">
                  <form onSubmit={handleSendMessage} className="flex gap-4">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Napisz wiadomość..."
                      className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-secondary focus:ring-2 focus:ring-[#E0EFFF] outline-none transition-all"
                    />
                    <Button icon={<Send size={18} />} className="px-6">
                      Wyślij
                    </Button>
                  </form>
                </div>
              </GlassCard>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-dark rounded-3xl p-8 text-white relative overflow-hidden h-full">
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary rounded-full blur-[60px] opacity-20"></div>
                <h3 className="text-xl font-bold mb-4">Potrzebujesz pilnej pomocy?</h3>
                <p className="text-gray-300 text-sm mb-8 leading-relaxed">
                  Jesteśmy dostępni w dni robocze od 9:00 do 17:00. W sprawach krytycznych (awarie)
                  reagujemy 24/7 dla klientów z aktywnym pakietem SLA.
                </p>
                <a
                  href="tel:+48794443551"
                  className="block bg-white/10 hover:bg-white/20 transition-colors p-4 rounded-xl mb-4 border border-white/10"
                >
                  <div className="text-xs text-primary font-bold uppercase tracking-wider mb-1">
                    Infolinia
                  </div>
                  <div className="text-xl font-black">+48 794 443 551</div>
                </a>
                <a
                  href="mailto:info@mixturemarketing.pl"
                  className="block bg-white/10 hover:bg-white/20 transition-colors p-4 rounded-xl border border-white/10"
                >
                  <div className="text-xs text-primary font-bold uppercase tracking-wider mb-1">
                    Email
                  </div>
                  <div className="text-lg font-bold">info@mixturemarketing.pl</div>
                </a>
              </div>
            </div>
          </div>
        </LazyHydrate>
      </main>

      {/* --- PROFILE MODAL --- */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <AnimateOnScroll className="w-full max-w-md">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-xl font-bold text-dark">Edytuj swój profil</h3>
                <button
                  onClick={() => setIsProfileModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleUpdateProfile} className="p-8 space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Imię i Nazwisko
                  </label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-secondary focus:ring-2 focus:ring-indigo-50 outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Nazwa Firmy
                  </label>
                  <input
                    type="text"
                    value={profileData.company_name}
                    onChange={(e) =>
                      setProfileData({ ...profileData, company_name: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-secondary focus:ring-2 focus:ring-indigo-50 outline-none transition-all"
                    placeholder="Opcjonalnie"
                  />
                </div>

                <div className="pt-4 flex gap-4">
                  <Button
                    variant="outline"
                    type="button"
                    className="flex-1 justify-center"
                    onClick={() => setIsProfileModalOpen(false)}
                  >
                    Anuluj
                  </Button>
                  <Button
                    icon={
                      isUpdatingProfile ? (
                        <RefreshCw className="animate-spin" size={18} />
                      ) : (
                        <Save size={18} />
                      )
                    }
                    className="flex-1 justify-center"
                    disabled={isUpdatingProfile}
                  >
                    {isUpdatingProfile ? 'Zapisywanie...' : 'Zapisz zmiany'}
                  </Button>
                </div>
              </form>
            </div>
          </AnimateOnScroll>
        </div>
      )}
    </div>
  );
};

export default PortalDashboard;
