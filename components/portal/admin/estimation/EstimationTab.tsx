import React, { useState } from 'react';
import { FileText, Plus } from 'lucide-react';
import QuotesList from './QuotesList';
import QuoteWizard from './QuoteWizard';

// Wejście zakładki „Wyceny": lista + „Nowa wycena" + kreator (krok Platforma, f1a).
interface Props {
  sessionToken: string | null;
}

const EstimationTab: React.FC<Props> = ({ sessionToken }) => {
  const [view, setView] = useState<'list' | 'wizard'>('list');
  const [refreshKey, setRefreshKey] = useState(0);

  if (view === 'wizard') {
    return (
      <QuoteWizard
        sessionToken={sessionToken}
        onCreated={() => setRefreshKey((k) => k + 1)}
        onCancel={() => setView('list')}
      />
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-black text-dark flex items-center gap-2">
          <FileText size={20} /> Wyceny
        </h2>
        <button
          type="button"
          onClick={() => setView('wizard')}
          className="px-4 py-2 rounded-lg font-bold bg-dark text-white flex items-center gap-2"
        >
          <Plus size={18} /> Nowa wycena
        </button>
      </div>
      <QuotesList sessionToken={sessionToken} refreshKey={refreshKey} />
    </div>
  );
};

export default EstimationTab;
