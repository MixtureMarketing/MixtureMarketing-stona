import { useState, useEffect, useCallback, useRef } from 'react';
import { Message } from '../types';

interface UseChatSocketProps {
  userId: string | number | undefined;
  sessionToken: string | null;
  onMessageReceived: (msg: Message) => void;
}

export const useChatSocket = ({ userId, sessionToken, onMessageReceived }: UseChatSocketProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (!userId || !sessionToken || socketRef.current?.readyState === WebSocket.OPEN) return;

    // Determine protocol based on environment
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    // Cloudflare Pages uses same host for API
    const socketUrl = `${protocol}//${host}/api/portal/chat`;

    const ws = new WebSocket(socketUrl);

    ws.onopen = () => {
      console.log('[Chat] WebSocket Connected');
      setIsConnected(true);
      // We don't need to send auth here if middleware handles it via cookies or we can use subprotocol
      // But standard way for Pages Functions is to check Authorization header on initial upgrade
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessageReceived(data);
      } catch (err) {
        console.error('[Chat] Failed to parse message', err);
      }
    };

    ws.onclose = () => {
      console.log('[Chat] WebSocket Disconnected. Retrying...');
      setIsConnected(false);
      reconnectTimeoutRef.current = setTimeout(connect, 3000);
    };

    ws.onerror = (err) => {
      console.error('[Chat] WebSocket Error', err);
      ws.close();
    };

    socketRef.current = ws;
  }, [userId, sessionToken, onMessageReceived]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      socketRef.current?.close();
    };
  }, [connect]);

  const sendMessage = useCallback((content: string, extraData: Partial<Message> = {}) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const payload = {
        content,
        user_id: userId,
        created_at: new Date().toISOString(),
        is_read: 0,
        ...extraData
      };
      socketRef.current.send(JSON.stringify(payload));
      return true;
    }
    return false;
  }, [userId]);

  return { isConnected, sendMessage };
};
