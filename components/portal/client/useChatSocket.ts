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

  // Use a ref to keep the connect function stable and accessible within itself
  const connectRef = useRef<() => void>(() => {});

  const connect = useCallback(() => {
    if (!userId || !sessionToken || socketRef.current?.readyState === WebSocket.OPEN) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const socketUrl = `${protocol}//${host}/api/portal/chat`;

    const ws = new WebSocket(socketUrl);

    ws.onopen = () => {
      console.log('[Chat] WebSocket Connected');
      setIsConnected(true);
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
      reconnectTimeoutRef.current = setTimeout(() => {
        connectRef.current();
      }, 3000);
    };

    ws.onerror = (err) => {
      console.error('[Chat] WebSocket Error', err);
      ws.close();
    };

    socketRef.current = ws;
  }, [userId, sessionToken, onMessageReceived]);

  // Update the ref whenever connect changes
  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      socketRef.current?.close();
    };
  }, [connect]);

  const sendMessage = useCallback(
    (content: string, extraData: Partial<Message> = {}) => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        const payload = {
          content,
          user_id: userId,
          created_at: new Date().toISOString(),
          is_read: 0,
          ...extraData,
        };
        socketRef.current.send(JSON.stringify(payload));
        return true;
      }
      return false;
    },
    [userId],
  );

  return { isConnected, sendMessage };
};
