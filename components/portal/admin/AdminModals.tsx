import React from 'react';
import { X, FilePlus, Save } from 'lucide-react';
import Button from '../../common/Button';
import { Lead, Client, Project, Milestone, MilestoneStatus } from '../types';

interface LeadDetailsModalProps {
  lead: Lead;
  onClose: () => void;
}

export const LeadDetailsModal: React.FC<LeadDetailsModalProps> = ({ lead, onClose }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
    <div className="bg-white p-8 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-dark">Szczegóły Zgłoszenia</h2>
        <button onClick={onClose}>
          <X className="text-gray-400" />
        </button>
      </div>
      <div className="space-y-4">
        <div>
          <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
            Nadawca
          </div>
          <div className="font-bold text-dark">{lead.name}</div>
          <div className="text-sm text-gray-600">{lead.email}</div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
              Usługa
            </div>
            <div className="text-sm font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded inline-block">
              {lead.service_type}
            </div>
          </div>
          <div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
              Budżet
            </div>
            <div className="text-sm font-bold text-green-600">{lead.budget || '-'}</div>
          </div>
        </div>
        {lead.company && (
          <div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
              Firma
            </div>
            <div className="text-sm text-gray-700">{lead.company}</div>
          </div>
        )}
        {lead.details && (
          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
            <div className="text-xxs font-black text-secondary uppercase tracking-[0.2em] mb-3">
              Parametry Szczegółowe
            </div>
            <div className="grid grid-cols-1 gap-2">
              {Object.entries(JSON.parse(lead.details)).map(([key, val]) => {
                if (!val || typeof val !== 'string') return null;
                const label = key
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, (str) => str.toUpperCase());
                return (
                  <div key={key} className="flex justify-between text-xs">
                    <span className="text-gray-500 font-medium">{label}:</span>
                    <span className="font-bold text-dark">{val}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <div>
          <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
            Treść / Opis Celu
          </div>
          <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-700 whitespace-pre-wrap border border-gray-200 font-mono">
            {lead.message}
          </div>
        </div>
        <div className="text-xs text-gray-400 text-right pt-4 border-t border-gray-100">
          Data: {new Date(lead.created_at).toLocaleString('pl-PL')}
        </div>
      </div>
    </div>
  </div>
);

interface ReplyModalProps {
  lead: Lead;
  onClose: () => void;
  replyMessage: string;
  setReplyMessage: (msg: string) => void;
  onReply: (e: React.FormEvent) => void;
}

export const ReplyModal: React.FC<ReplyModalProps> = ({
  lead,
  onClose,
  replyMessage,
  setReplyMessage,
  onReply,
}) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
    <div className="bg-white p-8 rounded-2xl w-full max-w-2xl shadow-2xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-dark">Odpowiedz na zapytanie</h2>
          <p className="text-sm text-gray-500">
            Do: {lead.name} ({lead.email})
          </p>
        </div>
        <button onClick={onClose}>
          <X className="text-gray-400" />
        </button>
      </div>
      <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100 italic text-sm text-gray-600">
        "{lead.message}"
      </div>
      <form onSubmit={onReply} className="space-y-4">
        <textarea
          className="w-full p-4 border rounded-xl h-48 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
          placeholder="Wpisz treść wiadomości do klienta..."
          value={replyMessage}
          onChange={(e) => setReplyMessage(e.target.value)}
          required
        />
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={onClose}>
            Anuluj
          </Button>
          <Button icon={<Save size={18} />}>Wyślij Odpowiedź</Button>
        </div>
      </form>
    </div>
  </div>
);

interface MilestoneModalProps {
  milestone: Milestone | null;
  onClose: () => void;
  onSave: (e: React.FormEvent) => void;
  setMilestone: (m: Milestone) => void;
  isSaving: boolean;
}

export const MilestoneModal: React.FC<MilestoneModalProps> = ({
  milestone,
  onClose,
  onSave,
  setMilestone,
  isSaving,
}) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] backdrop-blur-sm">
    <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-black text-dark flex items-center gap-2">
          <FilePlus className="text-secondary" size={20} />
          {milestone?.id ? 'Edytuj' : 'Dodaj'} Etap Projektu
        </h2>
        <button onClick={onClose}>
          <X className="text-gray-400" />
        </button>
      </div>
      <form onSubmit={onSave} className="space-y-4">
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase block mb-1">
            Tytuł etapu
          </label>
          <input
            className="w-full p-3 border rounded-lg"
            placeholder="np. Makieta UX"
            value={milestone?.title || ''}
            onChange={(e) => setMilestone({ ...milestone, title: e.target.value } as Milestone)}
            required
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Opis prac</label>
          <textarea
            className="w-full p-3 border rounded-lg h-24"
            placeholder="Co zrobimy w tym etapie..."
            value={milestone?.description || ''}
            onChange={(e) =>
              setMilestone({ ...milestone, description: e.target.value } as Milestone)
            }
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Termin</label>
            <input
              type="date"
              className="w-full p-3 border rounded-lg"
              value={milestone?.due_date || ''}
              onChange={(e) =>
                setMilestone({ ...milestone, due_date: e.target.value } as Milestone)
              }
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Status</label>
            <select
              className="w-full p-3 border rounded-lg bg-white"
              value={milestone?.status || 'pending'}
              onChange={(e) =>
                setMilestone({
                  ...milestone,
                  status: e.target.value as MilestoneStatus,
                } as Milestone)
              }
            >
              <option value="pending">Oczekujący</option>
              <option value="accepted">Zaakceptowany</option>
              <option value="corrections">Do poprawy</option>
            </select>
          </div>
        </div>
        <Button className="w-full justify-center py-3 mt-4" disabled={isSaving}>
          {isSaving ? 'Zapisywanie...' : 'Zapisz Etap'}
        </Button>
      </form>
    </div>
  </div>
);

interface GenericEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (e: React.FormEvent) => void;
  item: Partial<Client & Project> | null;
  setItem: (item: Partial<Client & Project>) => void;
  activeTab: string;
  clients: Client[];
}

export const GenericEditModal: React.FC<GenericEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  item,
  setItem,
  activeTab,
  clients,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white p-8 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-dark">
            {item?.id ? 'Edytuj' : 'Dodaj'} {activeTab === 'clients' ? 'Klienta' : 'Projekt'}
          </h2>
          <button onClick={onClose}>
            <X className="text-gray-400" />
          </button>
        </div>
        <form onSubmit={onSave} className="space-y-4">
          {activeTab === 'clients' ? (
            <>
              <input
                className="w-full p-3 border rounded-lg"
                placeholder="Imię i Nazwisko"
                value={item?.name || ''}
                onChange={(e) => setItem({ ...item, name: e.target.value })}
                required
              />
              <input
                className="w-full p-3 border rounded-lg"
                placeholder="Email"
                type="email"
                value={item?.email || ''}
                onChange={(e) => setItem({ ...item, email: e.target.value })}
                required
              />
              <input
                className="w-full p-3 border rounded-lg"
                placeholder="Nazwa Firmy"
                value={item?.company_name || ''}
                onChange={(e) => setItem({ ...item, company_name: e.target.value })}
              />
            </>
          ) : (
            <>
              <select
                className="w-full p-3 border rounded-lg bg-white"
                value={item?.user_id || ''}
                onChange={(e) => setItem({ ...item, user_id: e.target.value })}
                required
              >
                <option value="">Wybierz Klienta</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.company_name})
                  </option>
                ))}
              </select>
              <input
                className="w-full p-3 border rounded-lg"
                placeholder="Nazwa Projektu"
                value={item?.name || ''}
                onChange={(e) => setItem({ ...item, name: e.target.value })}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <select
                  className="w-full p-3 border rounded-lg bg-white"
                  value={item?.type || 'web'}
                  onChange={(e) => setItem({ ...item, type: e.target.value })}
                >
                  <option value="web">Web Development</option>
                  <option value="marketing">Marketing</option>
                  <option value="design">Design</option>
                </select>
                <input
                  className="w-full p-3 border rounded-lg font-bold text-green-600"
                  placeholder="Budżet (np. 5000 PLN)"
                  value={item?.budget || ''}
                  onChange={(e) => setItem({ ...item, budget: e.target.value })}
                />
              </div>
              <select
                className="w-full p-3 border rounded-lg bg-white"
                value={item?.status || 'pending'}
                onChange={(e) => setItem({ ...item, status: e.target.value })}
              >
                <option value="pending">Oczekujący</option>
                <option value="in_progress">W trakcie</option>
                <option value="review">Do akceptacji</option>
                <option value="completed">Zakończony</option>
              </select>
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-gray-600">
                  Postęp: {item?.progress || 0}%
                </span>
                <input
                  type="range"
                  className="flex-1"
                  min="0"
                  max="100"
                  value={item?.progress || 0}
                  onChange={(e) => setItem({ ...item, progress: parseInt(e.target.value) })}
                />
              </div>
              <input
                className="w-full p-3 border rounded-lg"
                placeholder="Link do Drive"
                value={item?.drive_link || ''}
                onChange={(e) => setItem({ ...item, drive_link: e.target.value })}
              />
              <input
                className="w-full p-3 border rounded-lg"
                placeholder="Następny krok (tekst)"
                value={item?.next_milestone || ''}
                onChange={(e) => setItem({ ...item, next_milestone: e.target.value })}
              />
              <input
                className="w-full p-3 border rounded-lg"
                type="date"
                value={item?.next_milestone_date || ''}
                onChange={(e) => setItem({ ...item, next_milestone_date: e.target.value })}
              />
            </>
          )}
          <Button className="w-full justify-center py-3 mt-4" icon={<Save size={18} />}>
            Zapisz Zmiany
          </Button>
        </form>
      </div>
    </div>
  );
};
