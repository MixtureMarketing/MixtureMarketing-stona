import { useState, useEffect, useCallback, useRef } from 'react';
import { Message } from '../types';

interface UseAdminChatSocketProps {
  activeUserId: string | null;
  sessionToken: string | null;
  onMessageReceived: () => void;
}

export const useAdminChatSocket = ({ activeUserId, sessionToken, onMessageReceived }: UseAdminChatSocketProps) => {
  const socketRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    if (!activeUserId || !sessionToken) return;

    if (socketRef.current) {
      socketRef.current.close();
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socketUrl = `${protocol}//${window.location.host}/api/portal/chat?userId=${activeUserId}`;

    const ws = new WebSocket(socketUrl);

    ws.onmessage = () => {
      onMessageReceived();
    };

    socketRef.current = ws;
  }, [activeUserId, sessionToken, onMessageReceived]);

  useEffect(() => {
    connect();
    return () => socketRef.current?.close();
  }, [connect]);

  const sendMessage = useCallback((content: string) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        content,
        user_id: activeUserId,
        sender_type: 'admin',
        created_at: new Date().toISOString()
      }));
      return true;
    }
    return false;
  }, [activeUserId]);

  return { sendMessage };
};
