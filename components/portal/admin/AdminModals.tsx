import React from 'react';
import { X, FilePlus, Save } from 'lucide-react';
import Button from '../../common/Button';
import { Lead, Client, Project, Milestone, MilestoneStatus } from '../types';
import { useDialogA11y } from '../useDialogA11y';
// LeadDetailsModal w osobnym pliku (limit max-lines); re-eksport dla zgodności importów.
export { default as LeadDetailsModal } from './LeadDetailsModal';

interface ReplyModalProps {
  lead: Lead;
  onClose: () => void;
  replyMessage: string;
  setReplyMessage: (msg: string) => void;
  onReply: (e: React.FormEvent) => void;
  /** Wysyłka w toku — blokuje ponowne „Wyślij Odpowiedź” (każde = mail do leada). */
  isSending?: boolean;
}

export const ReplyModal: React.FC<ReplyModalProps> = ({
  lead,
  onClose,
  replyMessage,
  setReplyMessage,
  onReply,
  isSending = false,
}) => {
  const dialogRef = useDialogA11y<HTMLDivElement>(onClose);
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div
        className="bg-white p-8 rounded-2xl w-full max-w-2xl shadow-2xl outline-none"
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Odpowiedz na zapytanie"
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-dark">Odpowiedz na zapytanie</h2>
            <p className="text-sm text-gray-500">
              Do: {lead.name} ({lead.email})
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Zamknij">
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
            readOnly={isSending}
          />
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSending}>
              Anuluj
            </Button>
            <Button icon={<Save size={18} />} isLoading={isSending} disabled={isSending}>
              {isSending ? 'Wysyłanie…' : 'Wyślij Odpowiedź'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

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
}) => {
  const dialogRef = useDialogA11y<HTMLDivElement>(onClose);
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] backdrop-blur-sm">
      <div
        className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl outline-none"
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Etap projektu"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black text-dark flex items-center gap-2">
            <FilePlus className="text-secondary" size={20} />
            {milestone?.id ? 'Edytuj' : 'Dodaj'} Etap Projektu
          </h2>
          <button type="button" onClick={onClose} aria-label="Zamknij">
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
            <label className="text-xs font-bold text-gray-400 uppercase block mb-1">
              Opis prac
            </label>
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
};

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
  const dialogRef = useDialogA11y<HTMLDivElement>(onClose, isOpen);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div
        className="bg-white p-8 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto outline-none"
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={activeTab === 'clients' ? 'Klient' : 'Projekt'}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-dark">
            {item?.id ? 'Edytuj' : 'Dodaj'} {activeTab === 'clients' ? 'Klienta' : 'Projekt'}
          </h2>
          <button type="button" onClick={onClose} aria-label="Zamknij">
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
