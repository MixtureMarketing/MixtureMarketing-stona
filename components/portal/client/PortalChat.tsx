import React from 'react';
import { MessageSquare, CheckCheck, Check, Send } from 'lucide-react';
import Button from '../../common/Button';
import GlassCard from '../../common/GlassCard';
import { Message } from '../types';

interface PortalChatProps {
  messages: Message[];
  newMessage: string;
  setNewMessage: (m: string) => void;
  onSendMessage: (e: React.FormEvent | React.KeyboardEvent) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  chatContainerRef: React.RefObject<HTMLDivElement>;
  handleChatScroll: () => void;
}

const PortalChat: React.FC<PortalChatProps> = ({
  messages,
  newMessage,
  setNewMessage,
  onSendMessage,
  onKeyDown,
  chatContainerRef,
  handleChatScroll,
}) => {
  return (
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
                <div className={`text-xxs mt-2 flex items-center justify-end gap-1 opacity-60`}>
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
        <form onSubmit={onSendMessage} className="flex gap-4">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Napisz wiadomość..."
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-secondary focus:ring-2 focus:ring-[#E0EFFF] outline-none transition-all"
          />
          <Button icon={<Send size={18} />} className="px-6">
            Wyślij
          </Button>
        </form>
      </div>
    </GlassCard>
  );
};

export default PortalChat;
