import React, { useState } from 'react';
import { Share2, MessageSquare, Activity, Send } from 'lucide-react';
import Button from '../../../common/Button';

const PubSubDemo = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  const publish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input) return;
    const newMsg = input;
    setInput('');
    setSending(true);
    setTimeout(() => {
      setMessages((prev) => [newMsg, ...prev.slice(0, 5)]);
      setSending(false);
    }, 400);
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden flex flex-col md:flex-row">
      <div className="flex-1 p-8 bg-gray-50 border-r border-gray-100 flex flex-col">
        <div className="flex items-center gap-3 mb-6 text-dark">
          <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-200">
            <Share2 size={20} />
          </div>
          <div>
            <h3 className="font-bold text-lg">Publisher</h3>
            <p className="text-xs text-gray-600">Nadawca wiadomości</p>
          </div>
        </div>
        <form onSubmit={publish} className="relative">
          <label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 block">
            Payload (Channel: 'news')
          </label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Wpisz wiadomość..."
            className="w-full px-4 py-4 rounded-xl border border-gray-200 mb-4 focus:outline-none focus:border-primary bg-white shadow-sm"
          />
          <Button type="submit" className="w-full justify-center py-4" disabled={!input}>
            {sending ? 'Wysyłanie...' : 'Opublikuj (Publish)'} <Send size={16} className="ml-2" />
          </Button>
        </form>
      </div>
      <div className="flex-1 p-8 bg-[#1e293b] text-white flex flex-col relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full blur-[100px] opacity-10 pointer-events-none"></div>
        <div className="flex items-center gap-3 mb-6 relative z-10">
          <div className="p-2 bg-white/10 rounded-lg border border-white/10">
            <MessageSquare size={20} />
          </div>
          <div>
            <h3 className="font-bold text-lg">Subscriber</h3>
            <p className="text-xs text-gray-600">Odbiorca (Real-time)</p>
          </div>
        </div>
        <div className="flex-grow bg-[#0F172A]/50 rounded-xl p-4 border border-white/5 relative overflow-y-auto h-64 shadow-inner">
          {messages.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-700 gap-2 opacity-50">
              <Activity size={32} />
              Nasłuchiwanie kanału 'news'...
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className="flex gap-3 items-start animate-fade-in-up">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-xxs font-bold text-white shrink-0 mt-1">
                    MSG
                  </div>
                  <div className="bg-white/10 px-4 py-3 rounded-2xl rounded-tl-none border border-white/10 text-sm backdrop-blur-sm">
                    {msg}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PubSubDemo;
