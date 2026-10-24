import { useRef, useState } from 'react';
import MixtureApiClient from '../../../services/apiClient';
import { useNotification } from '../../../context/NotificationContext';
import { useAuth } from '../../../context/AuthContext';
import { Lead, Milestone, Client, Project } from '../types';

/**
 * Komunikat z serwera (400/404/409 niosą czytelne `message`, np. „Pole „Nazwa
 * projektu” jest wymagane.”) albo fallback, gdy błąd jest techniczny.
 */
const serverMessage = (error: unknown, fallback: string) => {
  const raw = error instanceof Error ? error.message : '';
  return raw && !/^(Server responded|Unknown error|Failed to fetch)/.test(raw) ? raw : fallback;
};

interface UseAdminActionsProps {
  sessionToken: string | null;
  refreshData: () => void;
  refreshLeads: () => void;
  refreshChat: () => void;
}

export const useAdminActions = ({
  sessionToken,
  refreshData,
  refreshLeads,
  refreshChat,
}: UseAdminActionsProps) => {
  const { showNotification } = useNotification();
  const { authFetch } = useAuth();
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [isSavingMilestone, setIsSavingMilestone] = useState(false);
  // Każda wiadomość czatu = mail do klienta. Ref blokuje drugi Enter/klik jeszcze
  // przed re-renderem; stan steruje UI (przycisk disabled, pole readOnly).
  const [isSendingChat, setIsSendingChat] = useState(false);
  const sendingChatRef = useRef(false);
  // Odpowiedź leadowi = mail do potencjalnego klienta; podwójny klik wysyłał 2 maile.
  const [isReplying, setIsReplying] = useState(false);
  const replyingRef = useRef(false);

  const sendAdminMessage = async (userId: string, content: string) => {
    if (!userId || !content.trim() || !sessionToken || sendingChatRef.current) return false;
    sendingChatRef.current = true;
    setIsSendingChat(true);
    try {
      const res = await MixtureApiClient.post<{ warning?: string }>(
        '/api/admin/admin_reply_chat',
        { user_id: userId, content },
        sessionToken,
      );
      // Wiadomość zapisana, ale mail do klienta nie wyszedł — admin musi o tym wiedzieć.
      if (res?.warning) showNotification(res.warning, 'warning');
      refreshChat();
      return true;
    } catch (error) {
      console.error(error);
      showNotification(serverMessage(error, 'Nie udało się wysłać wiadomości.'), 'error');
      return false;
    } finally {
      sendingChatRef.current = false;
      setIsSendingChat(false);
    }
  };

  const handleDownload = async (docId: string, fileName: string) => {
    if (!sessionToken) return;
    try {
      const res = await authFetch(`/api/portal/download?id=${docId}`);
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
    if (!sessionToken || !confirm('Czy na pewno usunąć ten dokument?')) return;
    try {
      await MixtureApiClient.post('/api/admin/delete_document', { id }, sessionToken);
      refreshData();
      showNotification('Dokument usunięty.', 'success');
    } catch (e) {
      console.error(e);
      showNotification('Błąd podczas usuwania dokumentu.', 'error');
    }
  };

  const handleUploadDocument = async (uploadDocData: Record<string, unknown>) => {
    if (!uploadDocData.file || !sessionToken) return false;
    setIsUploadingDoc(true);
    const formData = new FormData();
    Object.entries(uploadDocData).forEach(([k, v]) => {
      if (v) formData.append(k, v as string | Blob);
    });

    try {
      await MixtureApiClient.post('/api/admin/upload_document', formData, sessionToken);
      showNotification('Plik wgrany pomyślnie.', 'success');
      refreshData();
      return true;
    } catch (e: unknown) {
      console.error(e);
      const message = e instanceof Error ? e.message : 'Błąd wgrywania';
      showNotification(message, 'error');
      return false;
    } finally {
      setIsUploadingDoc(false);
    }
  };

  const handleSaveMilestone = async (milestone: Milestone) => {
    if (!milestone || !sessionToken) return false;
    setIsSavingMilestone(true);
    try {
      await MixtureApiClient.post('/api/admin/save_milestone', milestone, sessionToken);
      showNotification('Kamień milowy zapisany.', 'success');
      refreshData();
      return true;
    } catch (e) {
      console.error(e);
      showNotification(serverMessage(e, 'Błąd zapisu kamienia milowego.'), 'error');
      return false;
    } finally {
      setIsSavingMilestone(false);
    }
  };

  const handleConvertLead = async (leadId: string) => {
    if (!sessionToken || !confirm('Utworzyć konto klienta?')) return;
    try {
      const res = await MixtureApiClient.post<{ warning?: string }>(
        '/api/admin/convert_lead',
        { lead_id: leadId },
        sessionToken,
      );
      showNotification('Lead skonwertowany!', 'success');
      if (res?.warning) showNotification(res.warning, 'warning');
      refreshLeads();
      refreshData();
    } catch (error) {
      console.error(error);
      showNotification('Błąd konwersji leadu.', 'error');
    }
  };

  const handleReply = async (lead: Lead, message: string) => {
    if (!lead || !message.trim() || !sessionToken || replyingRef.current) return false;
    replyingRef.current = true;
    setIsReplying(true);
    try {
      await MixtureApiClient.post(
        '/api/admin/reply_lead',
        {
          lead_id: lead.id,
          email: lead.email,
          message,
        },
        sessionToken,
      );
      refreshLeads();
      showNotification('Odpowiedź wysłana!', 'success');
      return true;
    } catch (error) {
      console.error(error);
      // 502 email_failed niesie czytelny komunikat („status leada bez zmian”).
      showNotification(serverMessage(error, 'Błąd wysyłania odpowiedzi.'), 'error');
      return false;
    } finally {
      replyingRef.current = false;
      setIsReplying(false);
    }
  };

  const handleSaveItem = async (activeTab: string, item: Partial<Client & Project>) => {
    if (!sessionToken) return false;
    const endpoint = activeTab === 'clients' ? 'save_client' : 'save_project';
    try {
      await MixtureApiClient.post(`/api/admin/${endpoint}`, item, sessionToken);
      refreshData();
      showNotification('Zmiany zapisane.', 'success');
      return true;
    } catch (error) {
      console.error(error);
      showNotification(serverMessage(error, 'Błąd zapisu zmian.'), 'error');
      return false;
    }
  };

  return {
    isUploadingDoc,
    isSavingMilestone,
    isSendingChat,
    isReplying,
    sendAdminMessage,
    handleDownload,
    handleDeleteDoc,
    handleUploadDocument,
    handleSaveMilestone,
    handleConvertLead,
    handleReply,
    handleSaveItem,
  };
};
