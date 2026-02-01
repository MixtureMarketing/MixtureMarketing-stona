import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import AnimateOnScroll from '../common/AnimateOnScroll';
import { usePortalData } from './client/usePortalData';
import PortalHeader from './client/PortalHeader';
import PortalProjectList from './client/PortalProjectList';
import PortalProjectDetails from './client/PortalProjectDetails';
import PortalDocuments from './client/PortalDocuments';
import PortalChat from './client/PortalChat';
import PortalSupport from './client/PortalSupport';
import { ProfileModal } from './client/PortalModals';
import { AlertCircle } from 'lucide-react';
import { getStatusColor, getStatusLabel } from '../../utils/portalHelpers';

const PortalDashboard: React.FC = () => {
  const { user, sessionToken, logout, updateUser, isLoading } = useAuth();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const { projects, messages, loadingProjects, error, refreshProjects, refreshMessages } =
    usePortalData();

  // Profile Edit State
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileData, setProfileData] = useState({ name: '', company_name: '' });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Detail View State
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  const [newMessage, setNewMessage] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

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
      const res = await fetch('/api/portal/update_profile.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`,
          'X-Auth-Token': sessionToken || '',
        },
        body: JSON.stringify(profileData),
      });

      if (res.ok) {
        const data = await res.json();
        updateUser(data.user);
        showNotification('Profil zaktualizowany!', 'success');
        setIsProfileModalOpen(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent | React.KeyboardEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !sessionToken) return;

    try {
      const res = await fetch('/api/portal/send_message.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`,
          'X-Auth-Token': sessionToken,
        },
        body: JSON.stringify({ content: newMessage, sender_type: 'client' }),
      });

      if (res.ok) {
        setNewMessage('');
        refreshMessages();
      }
    } catch (e) {
      console.error(e);
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
      }
    } catch (e) {
      console.error(e);
    }
  };

  const activeProjectsCount = projects.filter((p) => p.status !== 'completed').length;

  if (isLoading || !user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <PortalHeader
        user={user}
        onEditProfile={() => setIsProfileModalOpen(true)}
        onLogout={logout}
      />

      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AnimateOnScroll>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-dark mb-2">
                Witaj, {user.name.split(' ')[0]} 👋
              </h1>
              <p className="text-gray-600 text-lg">
                {user.company_name
                  ? `Współpracujemy z ${user.company_name}`
                  : 'Oto Twoje projekty.'}
              </p>
            </div>
            <div className="flex gap-4">
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="text-xl font-black text-dark">{activeProjectsCount} Aktywne</div>
              </div>
            </div>
          </div>
        </AnimateOnScroll>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl mb-8 flex items-center gap-3">
            <AlertCircle size={20} /> {error}
          </div>
        )}

        <PortalProjectList
          projects={projects}
          loading={loadingProjects}
          onSelectProject={setSelectedProjectId}
          getStatusColor={getStatusColor}
          getStatusLabel={getStatusLabel}
        />

        {selectedProject && (
          <PortalProjectDetails
            project={selectedProject}
            onClose={() => setSelectedProjectId(null)}
            refreshProjects={refreshProjects}
          />
        )}

        <PortalDocuments projects={projects} onDownload={handleDownload} />

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <PortalChat
              messages={messages}
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              onSendMessage={handleSendMessage}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage(e)}
              chatContainerRef={chatContainerRef}
              handleChatScroll={() => {}}
            />
          </div>
          <div className="lg:col-span-1">
            <PortalSupport />
          </div>
        </div>
      </main>

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profileData={profileData}
        setProfileData={setProfileData}
        onUpdate={handleUpdateProfile}
        loading={isUpdatingProfile}
      />
    </div>
  );
};

export default PortalDashboard;
