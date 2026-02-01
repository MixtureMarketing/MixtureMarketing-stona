import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';
import MixtureApiClient from '../../../services/apiClient';

/**
 * Custom hook for project-related actions in the Client Portal.
 * Handles milestone updates and file downloads.
 */
export const useProjectActions = (refreshProjects: () => void) => {
  const { sessionToken } = useAuth();
  const { showNotification } = useNotification();
  const [isUpdating, setIsUpdating] = useState(false);

  const updateMilestone = async (
    milestoneId: string,
    status: 'accepted' | 'corrections',
    feedback: string = '',
  ) => {
    if (!sessionToken) return;
    setIsUpdating(true);

    try {
      await MixtureApiClient.post(
        '/api/portal/update_milestone.php',
        {
          id: milestoneId,
          status,
          feedback,
        },
        sessionToken,
      );

      refreshProjects();
      showNotification('Decyzja została zapisana.', 'success');
      return true;
    } catch (_error) {
      showNotification('Błąd podczas zapisywania decyzji.', 'error');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const downloadFile = async (docId: string, fileName: string) => {
    if (!sessionToken) return;

    try {
      const response = await fetch(`/api/portal/download.php?id=${docId}`, {
        headers: {
          Authorization: `Bearer ${sessionToken}`,
          'X-Auth-Token': sessionToken,
        },
      });

      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (_error) {
      showNotification('Błąd podczas pobierania pliku.', 'error');
    }
  };

  return {
    updateMilestone,
    downloadFile,
    isUpdating,
  };
};
