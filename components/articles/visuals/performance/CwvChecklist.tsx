import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

const CwvChecklist = () => {
  const [checked, setChecked] = useState<number[]>([]);
  const items = [
    { id: 1, title: 'LCP: Optymalizacja mediów', desc: 'WebP/AVIF + CDN.' },
    { id: 2, title: 'LCP: Szybki czas odpowiedzi', desc: 'Redis + Caching.' },
    { id: 3, title: 'CLS: Zarezerwuj miejsce', desc: 'Width/Height dla grafik.' },
    { id: 4, title: 'INP: Usuń blokujący JS', desc: 'Mniej skryptów 3rd party.' },
    { id: 5, title: 'INP: Web Workers', desc: 'Logika poza głównym wątkiem.' },
  ];
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden not-prose">
      <div className="bg-dark p-8 text-white text-center">
        <h3 className="text-xl font-bold">SEO Readiness 2025</h3>
        <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${(checked.length / items.length) * 100}%` }}
          ></div>
        </div>
      </div>
      <div className="p-8 space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() =>
              setChecked((prev) =>
                prev.includes(item.id) ? prev.filter((i) => i !== item.id) : [...prev, item.id],
              )
            }
            className={`group p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4 ${checked.includes(item.id) ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-transparent hover:border-gray-200'}`}
          >
            <div
              className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${checked.includes(item.id) ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-gray-300'}`}
            >
              {checked.includes(item.id) && <CheckCircle2 size={14} />}
            </div>
            <div>
              <h5
                className={`font-bold text-sm ${checked.includes(item.id) ? 'text-emerald-900' : 'text-dark'}`}
              >
                {item.title}
              </h5>
              <p className="text-xs text-gray-700 mt-1">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CwvChecklist;
