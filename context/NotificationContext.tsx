import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  /** Trwa animacja wyjścia — po EXIT_MS wpis znika z listy. */
  leaving?: boolean;
}

// Animacje toastów w CSS (animate-toast-in/out w index.css), nie framer-motion:
// provider jest na każdej stronie, a framer-motion (~116 kB) wciągał się przez niego
// do eagerowego index.js. Czas wyjścia = długość animacji toastOut.
const EXIT_MS = 200;

interface NotificationContextType {
  showNotification: (message: string, type?: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, leaving: true } : n)));
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, EXIT_MS);
  }, []);

  const showNotification = useCallback(
    (message: string, type: NotificationType = 'info') => {
      const id = Math.random().toString(36).substring(2, 9);
      setNotifications((prev) => [...prev, { id, message, type }]);

      // Auto remove after 5 seconds
      setTimeout(() => removeNotification(id), 5000);
    },
    [removeNotification],
  );

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="text-success" size={20} />;
      case 'error':
        return <AlertCircle className="text-red-500" size={20} />;
      case 'warning':
        return <AlertTriangle className="text-amber-500" size={20} />;
      default:
        return <Info className="text-primary" size={20} />;
    }
  };

  const getBgColor = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-100';
      case 'error':
        return 'bg-red-50 border-red-100';
      case 'warning':
        return 'bg-amber-50 border-amber-100';
      default:
        return 'bg-blue-50 border-blue-100';
    }
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <div className="fixed bottom-8 right-4 md:right-8 z-[100] flex flex-col gap-3 w-full max-w-[400px] pointer-events-none">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-xl border ${
              n.leaving ? 'animate-toast-out' : 'animate-toast-in'
            } ${getBgColor(n.type)}`}
          >
            <div className="shrink-0 mt-0.5">{getIcon(n.type)}</div>
            <div className="flex-grow">
              <p className="text-sm font-bold text-dark leading-snug">{n.message}</p>
            </div>
            <button
              onClick={() => removeNotification(n.id)}
              className="shrink-0 text-gray-400 hover:text-dark transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
