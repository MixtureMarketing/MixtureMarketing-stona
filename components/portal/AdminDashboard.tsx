import React, { useState, useRef, useEffect, Suspense, lazy } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { useAdminData } from './admin/useAdminData';
import AdminMetrics from './admin/AdminMetrics';
import AdminClients from './admin/AdminClients';
import AdminProjects from './admin/AdminProjects';
import AdminLeads from './admin/AdminLeads';
import AdminChat from './admin/AdminChat';
import { useAdminActions } from './admin/useAdminActions';
import {
  LeadDetailsModal,
  ReplyModal,
  MilestoneModal,
  GenericEditModal,
} from './admin/AdminModals';
import { Client, Project, Lead, Milestone } from './types';

// Moduł wycen — lazy chunk (nie wchodzi do głównego bundla; size-limit).
const QuotesList = lazy(() => import('./admin/estimation/QuotesList'));

type AdminTab = 'clients' | 'projects' | 'leads' | 'chat' | 'metrics' | 'wyceny';
const ADMIN_TABS: readonly AdminTab[] = [
  'clients',
  'projects',
  'leads',
  'chat',
  'metrics',
  'wyceny',
];
const TAB_LABEL: Record<AdminTab, string> = {
  clients: 'Clients',
  projects: 'Projects',
  leads: 'Leads',
  chat: 'Chat',
  metrics: 'Metrics',
  wyceny: 'Wyceny',
};

const AdminDashboard: React.FC = () => {
  const { user, sessionToken, isLoading } = useAuth();
  const navigate = useNavigate();

  // Deep-link ?tab=wyceny (SPA fallback w _redirects) — zakładka z URL, fallback 'clients'.
  const initialTab = ((): AdminTab => {
    if (typeof window === 'undefined') return 'clients';
    const t = new URLSearchParams(window.location.search).get('tab');
    return (ADMIN_TABS as readonly string[]).includes(t ?? '') ? (t as AdminTab) : 'clients';
  })();

  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  const {
    clients,
    projects,
    leads,
    metricsData,
    conversations,
    chatMessages,
    refreshData,
    refreshLeads,
    refreshChat,
  } = useAdminData(activeTab, activeChatId);

  const {
    isUploadingDoc,
    isSavingMilestone,
    sendAdminMessage,
    handleDownload,
    handleDeleteDoc,
    handleUploadDocument,
    handleSaveMilestone,
    handleConvertLead,
    handleReply,
    handleSaveItem,
  } = useAdminActions({
    sessionToken,
    refreshData,
    refreshLeads,
    refreshChat,
  });

  // Search & UI States
  const [searchTerm, setSearchTerm] = useState('');
  const [adminMessage, setAdminMessage] = useState('');

  // Modals & Action States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<Client & Project> | null>(null);
  const [viewingLead, setViewingLead] = useState<Lead | null>(null);
  const [replyingTo, setReplyingTo] = useState<Lead | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [uploadDocData, setUploadDocData] = useState({
    project_id: '',
    name: '',
    type: 'document' as 'invoice' | 'document',
    subtype: 'other',
    file: null as File | null,
  });

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      navigate('/portal/dashboard');
    }
  }, [user, isLoading, navigate]);

  const handleChatScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      isAtBottomRef.current = scrollHeight - scrollTop - clientHeight < 50;
    }
  };

  const onSendAdminMessage = async (e: React.FormEvent | React.KeyboardEvent) => {
    e.preventDefault();
    if (!activeChatId) return;
    const success = await sendAdminMessage(activeChatId, adminMessage);
    if (success) setAdminMessage('');
  };

  const onUploadDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await handleUploadDocument(uploadDocData);
    if (success) {
      setUploadDocData({
        project_id: '',
        name: '',
        type: 'document',
        subtype: 'other',
        file: null,
      });
    }
  };

  const onSaveMilestone = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingMilestone) return;
    const success = await handleSaveMilestone(editingMilestone);
    if (success) {
      setEditingMilestone(null);
      setIsMilestoneModalOpen(false);
    }
  };

  const onReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingTo) return;
    const success = await handleReply(replyingTo, replyMessage);
    if (success) {
      setReplyingTo(null);
      setReplyMessage('');
    }
  };

  const onSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    const success = await handleSaveItem(activeTab, editingItem);
    if (success) {
      setIsModalOpen(false);
      setEditingItem(null);
    }
  };

  if (isLoading || !user) return null;

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black text-dark">Admin Panel</h1>
          <div className="flex gap-4">
            {ADMIN_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-bold transition-colors flex items-center gap-2 ${activeTab === tab ? 'bg-dark text-white' : 'bg-white text-gray-600'}`}
              >
                {tab === 'metrics' && <Activity size={18} />}
                {TAB_LABEL[tab]}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'metrics' && <AdminMetrics metricsData={metricsData} />}
        {activeTab === 'clients' && (
          <AdminClients
            clients={clients}
            onEdit={(c) => {
              setEditingItem(c || {});
              setIsModalOpen(true);
            }}
          />
        )}
        {activeTab === 'projects' && (
          <AdminProjects
            projects={projects}
            onEdit={(p) => {
              setEditingItem(p || {});
              setIsModalOpen(true);
            }}
            onDownload={handleDownload}
            onDeleteDoc={handleDeleteDoc}
            onUploadDoc={onUploadDoc}
            uploadDocData={uploadDocData}
            setUploadDocData={setUploadDocData}
            isUploadingDoc={isUploadingDoc}
            onAddMilestone={(pid) => {
              setEditingMilestone({
                id: '',
                project_id: pid,
                title: '',
                description: '',
                due_date: new Date().toISOString().split('T')[0],
                status: 'pending',
                feedback: '',
              });
              setIsMilestoneModalOpen(true);
            }}
            onEditMilestone={(m) => {
              setEditingMilestone(m);
              setIsMilestoneModalOpen(true);
            }}
          />
        )}
        {activeTab === 'leads' && (
          <AdminLeads
            leads={leads}
            onViewDetails={setViewingLead}
            onConvert={handleConvertLead}
            onReply={setReplyingTo}
          />
        )}
        {activeTab === 'wyceny' && (
          <Suspense fallback={<p className="text-gray-500">Ładowanie modułu wycen…</p>}>
            <QuotesList sessionToken={sessionToken} />
          </Suspense>
        )}
        {activeTab === 'chat' && (
          <AdminChat
            conversations={conversations}
            activeChatId={activeChatId}
            setActiveChatId={setActiveChatId}
            chatMessages={chatMessages}
            adminMessage={adminMessage}
            setAdminMessage={setAdminMessage}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            handleChatScroll={handleChatScroll}
            sendAdminMessage={onSendAdminMessage}
            handleKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && onSendAdminMessage(e)}
            chatContainerRef={chatContainerRef}
          />
        )}

        <GenericEditModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={onSaveItem}
          item={editingItem}
          setItem={setEditingItem}
          activeTab={activeTab}
          clients={clients}
        />
        {viewingLead && (
          <LeadDetailsModal lead={viewingLead} onClose={() => setViewingLead(null)} />
        )}
        {replyingTo && (
          <ReplyModal
            lead={replyingTo}
            onClose={() => setReplyingTo(null)}
            replyMessage={replyMessage}
            setReplyMessage={setReplyMessage}
            onReply={onReply}
          />
        )}
        {isMilestoneModalOpen && (
          <MilestoneModal
            milestone={editingMilestone}
            onClose={() => setIsMilestoneModalOpen(false)}
            onSave={onSaveMilestone}
            setMilestone={setEditingMilestone}
            isSaving={isSavingMilestone}
          />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
