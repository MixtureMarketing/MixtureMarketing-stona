import React, { useRef } from 'react';
import { Send, CheckCheck, Check } from 'lucide-react';
import Button from '../../common/Button';
import { Conversation, Message } from '../types';

interface AdminChatProps {
  conversations: Conversation[];
  activeChatId: string | null;
  setActiveChatId: (id: string | null) => void;
  chatMessages: Message[];
  adminMessage: string;
  setAdminMessage: (msg: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  handleChatScroll: () => void;
  sendAdminMessage: (e: React.FormEvent | React.KeyboardEvent) => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  chatContainerRef: React.RefObject<HTMLDivElement>;
}

const AdminChat: React.FC<AdminChatProps> = ({
  conversations,
  activeChatId,
  setActiveChatId,
  chatMessages,
  adminMessage,
  setAdminMessage,
  searchTerm,
  setSearchTerm,
  handleChatScroll,
  sendAdminMessage,
  handleKeyDown,
  chatContainerRef,
}) => {
  const chatEndRef = useRef<HTMLDivElement>(null);

  const filteredConversations = (conversations || []).filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.company_name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="grid grid-cols-12 gap-6 h-[600px] animate-fade-in">
      {/* Conversations List */}
      <div className="col-span-4 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-100 shrink-0">
          <input
            type="text"
            placeholder="Szukaj klienta..."
            className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-100 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">Nie znaleziono</div>
          ) : (
            filteredConversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setActiveChatId(conv.id)}
                className={`p-4 border-b border-gray-50 cursor-pointer transition-colors hover:bg-gray-50 ${activeChatId === conv.id ? 'bg-indigo-50 border-l-4 border-l-[#3F3D91]' : ''}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-dark">{conv.name}</span>
                  {conv.unread_count > 0 && (
                    <span className="bg-red-500 text-white text-xxs font-bold px-2 py-0.5 rounded-full">
                      {conv.unread_count}
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500">{conv.company_name}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className="col-span-8 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
        {activeChatId ? (
          <>
            <div className="p-4 border-b border-gray-100 font-bold text-dark shrink-0">
              Czat z: {conversations.find((c) => c.id === activeChatId)?.name}
            </div>
            <div
              ref={chatContainerRef}
              onScroll={handleChatScroll}
              className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-50/30 custom-scrollbar"
            >
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-xl text-sm shadow-sm ${
                      msg.sender_type === 'admin'
                        ? 'bg-secondary text-white rounded-br-none'
                        : 'bg-white border border-gray-200 text-gray-700 rounded-bl-none'
                    }`}
                  >
                    {msg.content}
                    <div className={`text-xxs mt-1 flex items-center justify-end gap-1 opacity-60`}>
                      {new Date(msg.created_at).toLocaleTimeString('pl-PL', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {msg.sender_type === 'admin' && (
                        <span>
                          {msg.is_read === '1' || Number(msg.is_read) === 1 ? (
                            <CheckCheck size={12} className="text-blue-300" />
                          ) : (
                            <Check size={12} />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <form
              onSubmit={sendAdminMessage}
              className="p-4 border-t border-gray-100 flex gap-4 shrink-0"
            >
              <input
                className="flex-1 p-3 border rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none"
                placeholder="Napisz wiadomość..."
                value={adminMessage}
                onChange={(e) => setAdminMessage(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <Button icon={<Send size={18} />}>Wyślij</Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Wybierz konwersację z listy
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChat;
