import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import { Activity } from 'lucide-react';
import { useAdminData } from './admin/useAdminData';
import AdminMetrics from './admin/AdminMetrics';
import AdminClients from './admin/AdminClients';
import AdminProjects from './admin/AdminProjects';
import AdminLeads from './admin/AdminLeads';
import AdminChat from './admin/AdminChat';
import {
  LeadDetailsModal,
  ReplyModal,
  MilestoneModal,
  GenericEditModal,
} from './admin/AdminModals';
import { Client, Project, Lead, Milestone } from './types';

const AdminDashboard: React.FC = () => {
  const { user, sessionToken, isLoading } = useAuth();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [activeTab, setActiveTab] = useState<'clients' | 'projects' | 'leads' | 'chat' | 'metrics'>(
    'clients',
  );
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
  const [isSavingMilestone, setIsSavingMilestone] = useState(false);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
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

  const sendAdminMessage = async (e: React.FormEvent | React.KeyboardEvent) => {
    e.preventDefault();
    if (!activeChatId || !adminMessage.trim() || !sessionToken) return;
    try {
      const res = await fetch('/api/admin/admin_reply_chat.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`,
          'X-Auth-Token': sessionToken,
        },
        body: JSON.stringify({ user_id: activeChatId, content: adminMessage }),
      });
      if (res.ok) {
        setAdminMessage('');
        refreshChat();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDownload = async (docId: string, fileName: string) => {
    if (!sessionToken) return;
    try {
      const res = await fetch(`/api/portal/download.php?id=${docId}`, {
        headers: { Authorization: `Bearer ${sessionToken}`, 'X-Auth-Token': sessionToken },
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
        showNotification('Błąd pobierania pliku.', 'error');
      }
    } catch (e) {
      console.error(e);
      showNotification('Błąd połączenia.', 'error');
    }
  };

  const handleDeleteDoc = async (id: string) => {
    if (!confirm('Czy na pewno usunąć ten dokument?')) return;
    try {
      const res = await fetch('/api/admin/delete_document.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`,
          'X-Auth-Token': sessionToken || '',
        },
        body: JSON.stringify({ id }),
      });
      if (res.ok) refreshData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadDocData.file || !sessionToken) return;
    setIsUploadingDoc(true);
    const formData = new FormData();
    Object.entries(uploadDocData).forEach(([k, v]) => {
      if (v) formData.append(k, v);
    });
    try {
      const res = await fetch('/api/admin/upload_document.php', {
        method: 'POST',
        headers: { Authorization: `Bearer ${sessionToken}`, 'X-Auth-Token': sessionToken || '' },
        body: formData,
      });
      if (res.ok) {
        showNotification('Plik wgrany pomyślnie.', 'success');
        setUploadDocData({
          project_id: '',
          name: '',
          type: 'document',
          subtype: 'other',
          file: null,
        });
        refreshData();
      } else {
        const d = await res.json();
        showNotification(d.message || 'Błąd wgrywania', 'error');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsUploadingDoc(false);
    }
  };

  const handleSaveMilestone = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingMilestone || !sessionToken) return;
    setIsSavingMilestone(true);
    try {
      const res = await fetch('/api/admin/save_milestone.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`,
          'X-Auth-Token': sessionToken || '',
        },
        body: JSON.stringify(editingMilestone),
      });
      if (res.ok) {
        showNotification('Kamień milowy zapisany.', 'success');
        setEditingMilestone(null);
        setIsMilestoneModalOpen(false);
        refreshData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingMilestone(false);
    }
  };

  const handleConvertLead = async (leadId: string) => {
    if (!sessionToken || !confirm('Utworzyć konto klienta?')) return;
    try {
      const res = await fetch('/api/admin/convert_lead.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`,
          'X-Auth-Token': sessionToken || '',
        },
        body: JSON.stringify({ lead_id: leadId }),
      });
      if (res.ok) {
        showNotification('Lead skonwertowany!', 'success');
        refreshLeads();
        refreshData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingTo || !sessionToken) return;
    try {
      const res = await fetch('/api/admin/reply_lead.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`,
          'X-Auth-Token': sessionToken || '',
        },
        body: JSON.stringify({
          lead_id: replyingTo.id,
          email: replyingTo.email,
          message: replyMessage,
        }),
      });
      if (res.ok) {
        setReplyingTo(null);
        setReplyMessage('');
        refreshLeads();
        showNotification('Odpowiedź wysłana!', 'success');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionToken) return;
    const endpoint = activeTab === 'clients' ? 'save_client.php' : 'save_project.php';
    try {
      const res = await fetch(`/api/admin/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`,
          'X-Auth-Token': sessionToken || '',
        },
        body: JSON.stringify(editingItem),
      });
      if (res.ok) {
        setIsModalOpen(false);
        refreshData();
        setEditingItem(null);
        showNotification('Zmiany zapisane.', 'success');
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading || !user) return null;

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black text-dark">Admin Panel</h1>
          <div className="flex gap-4">
            {(['clients', 'projects', 'leads', 'chat', 'metrics'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-bold transition-colors flex items-center gap-2 ${activeTab === tab ? 'bg-dark text-white' : 'bg-white text-gray-600'}`}
              >
                {tab === 'metrics' && <Activity size={18} />}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
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
            onUploadDoc={handleUploadDocument}
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
            sendAdminMessage={sendAdminMessage}
            handleKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendAdminMessage(e)}
            chatContainerRef={chatContainerRef}
          />
        )}

        <GenericEditModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveItem}
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
            onReply={handleReply}
          />
        )}
        {isMilestoneModalOpen && (
          <MilestoneModal
            milestone={editingMilestone}
            onClose={() => setIsMilestoneModalOpen(false)}
            onSave={handleSaveMilestone}
            setMilestone={setEditingMilestone}
            isSaving={isSavingMilestone}
          />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
