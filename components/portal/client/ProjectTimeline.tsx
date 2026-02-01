import React, { useState } from 'react';
import { Check, CheckCheck, RefreshCw } from 'lucide-react';
import Button from '../../common/Button';
import { Project } from '../types';

interface ProjectTimelineProps {
  milestones: Project['milestones'];
  onUpdateMilestone: (
    id: string,
    status: 'accepted' | 'corrections',
    feedback: string,
  ) => Promise<boolean | undefined>;
  isUpdating: boolean;
}

const ProjectTimeline: React.FC<ProjectTimelineProps> = ({
  milestones,
  onUpdateMilestone,
  isUpdating,
}) => {
  const [activeAction, setActiveAction] = useState<{
    id: string;
    type: 'accepted' | 'corrections';
  } | null>(null);
  const [feedback, setFeedback] = useState('');

  if (!milestones || milestones.length === 0) {
    return (
      <div className="p-8 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
        <p className="text-gray-400 text-sm">
          Harmonogram nie został jeszcze dodany do tego projektu.
        </p>
      </div>
    );
  }

  return (
    <div className="relative space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
      {milestones.map((m) => (
        <div key={m.id} className="relative pl-10 group">
          {/* Milestone Dot */}
          <div
            className={`absolute left-0 top-1.5 w-6 h-6 rounded-full border-4 border-white shadow-sm z-10 transition-colors ${
              m.status === 'accepted'
                ? 'bg-green-500'
                : m.status === 'corrections'
                  ? 'bg-red-500'
                  : 'bg-blue-500'
            }`}
          />

          <div
            className={`p-6 rounded-2xl border transition-all ${
              m.status === 'accepted'
                ? 'bg-green-50/30 border-green-100'
                : m.status === 'corrections'
                  ? 'bg-red-50/30 border-red-100'
                  : 'bg-white border-gray-100 shadow-sm'
            }`}
          >
            <div className="flex justify-between items-start mb-2 gap-4">
              <h4 className="font-bold text-dark">{m.title}</h4>
              {m.due_date && (
                <span className="text-xxs font-bold text-gray-400 uppercase bg-gray-50 px-2 py-1 rounded">
                  Termin: {new Date(m.due_date).toLocaleDateString('pl-PL')}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mb-4 leading-relaxed">{m.description}</p>

            {m.feedback && (
              <div className="mb-4 p-3 bg-white/50 rounded-xl border border-dashed border-gray-200 text-xs italic text-gray-600">
                <strong>Twoje uwagi:</strong>
                <br />
                {m.feedback}
              </div>
            )}

            {m.status === 'pending' || m.status === 'corrections' ? (
              <div className="flex gap-3 mt-4">
                {activeAction?.id === m.id ? (
                  <div className="w-full space-y-3 animate-fade-in">
                    <textarea
                      className="w-full p-3 text-xs border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                      placeholder={
                        activeAction.type === 'accepted'
                          ? 'Opcjonalny komentarz (np. Super robota!)'
                          : 'Opisz co wymaga poprawy...'
                      }
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button
                        className="flex-1 py-2 text-xs"
                        onClick={async () => {
                          const success = await onUpdateMilestone(
                            m.id,
                            activeAction.type,
                            feedback,
                          );
                          if (success) {
                            setActiveAction(null);
                            setFeedback('');
                          }
                        }}
                        disabled={isUpdating}
                      >
                        {isUpdating ? 'Zapisywanie...' : 'Wyślij'}
                      </Button>
                      <Button
                        variant="outline"
                        className="py-2 text-xs"
                        onClick={() => setActiveAction(null)}
                      >
                        Anuluj
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setActiveAction({ id: m.id, type: 'accepted' });
                        setFeedback('');
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Check size={14} /> Akceptuję
                    </button>
                    <button
                      onClick={() => {
                        setActiveAction({ id: m.id, type: 'corrections' });
                        setFeedback('');
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 border border-red-200 text-red-600 text-xs font-bold rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <RefreshCw size={14} /> Zgłoś poprawki
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-600 text-xs font-bold">
                <CheckCheck size={16} /> Etap Zaakceptowany
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProjectTimeline;
