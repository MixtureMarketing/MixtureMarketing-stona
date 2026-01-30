import React, { useState } from 'react';
import { AlertTriangle, XCircle } from 'lucide-react';
import Button from '../../../common/Button';

const ClsSimulator = () => {
  const [shifted, setShifted] = useState(false);
  return (
    <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-xl overflow-hidden relative min-h-[300px] flex flex-col justify-center not-prose">
      <div className="text-center mb-8">
        <Button onClick={() => setShifted(!shifted)} variant="outline">
          {shifted ? 'Zresetuj' : 'Kliknij, aby wczytać reklamę'}
        </Button>
      </div>
      <div className="max-w-sm mx-auto w-full bg-gray-50 p-6 rounded-2xl border border-gray-100 relative transition-all duration-300">
        {shifted && (
          <div className="bg-rose-100 border-2 border-rose-200 text-rose-600 p-4 rounded-xl mb-4 animate-fade-in-down flex items-center gap-3">
            <AlertTriangle className="shrink-0" />
            <span className="text-xs font-bold uppercase">
              Twoja reklama załadowała się za późno!
            </span>
          </div>
        )}
        <div className="space-y-2">
          <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
          <div className="h-4 w-full bg-gray-200 rounded"></div>
          <div className="h-10 w-full bg-dark rounded-xl flex items-center justify-center text-white text-xs font-bold">
            PRZYCISK KUP TERAZ
          </div>
        </div>
        {shifted && (
          <div className="absolute -top-4 -right-4 bg-rose-500 text-white p-2 rounded-full shadow-xl animate-bounce">
            <XCircle />
          </div>
        )}
      </div>
    </div>
  );
};

export default ClsSimulator;
