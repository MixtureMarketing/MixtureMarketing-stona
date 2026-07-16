import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { SEO_CONTENT as CONTENT } from '../../../data/content';

/**
 * Kalkulator wartości ruchu organicznego (przeróbka 2026-07-16, krytyka
 * 14/40). Poprzednik zakładał z ręki „Potencjał TOP 3" i CTR 30% —
 * obietnica pozycji przebrana za matematykę. Teraz CTR jest SUWAKIEM
 * użytkownika, a zastrzeżenie („pozycji nie obiecujemy") częścią UI.
 */
const SeoRoiCalculator: React.FC = () => {
  const [volume, setVolume] = useState(1000);
  const [cpc, setCpc] = useState(3.5);
  const [ctr, setCtr] = useState(10);

  const traffic = Math.round(volume * (ctr / 100));
  const equivalent = Math.round(traffic * cpc);
  const L = CONTENT.roi.labels;

  const sliders = [
    {
      id: 'vol',
      label: L.volume,
      value: volume,
      display: volume.toLocaleString('pl-PL'),
      min: 100,
      max: 10000,
      step: 100,
      set: setVolume,
    },
    {
      id: 'cpc',
      label: L.cpc,
      value: cpc,
      display: `${String(cpc).replace('.', ',')} zł`,
      min: 0.5,
      max: 50,
      step: 0.5,
      set: setCpc,
    },
    {
      id: 'ctr',
      label: L.ctr,
      value: ctr,
      display: `${ctr}%`,
      min: 1,
      max: 30,
      step: 1,
      set: setCtr,
    },
  ];

  return (
    <div className="overflow-hidden rounded-3xl border border-gray-200 bg-light-gray shadow-xl">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="space-y-8 border-b border-gray-200 bg-white p-8 lg:border-r lg:border-b-0">
          {sliders.map((s) => (
            <div key={s.id}>
              <div className="mb-2 flex justify-between text-sm font-bold text-dark">
                <label id={`roi-${s.id}-label`}>{s.label}</label>
                <span className="rounded-md border border-blue-100 bg-blue-50 px-3 py-1 tabular-nums text-accent-dark">
                  {s.display}
                </span>
              </div>
              <input
                type="range"
                min={s.min}
                max={s.max}
                step={s.step}
                value={s.value}
                onChange={(e) => s.set(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-secondary"
                aria-labelledby={`roi-${s.id}-label`}
              />
            </div>
          ))}
        </div>

        <div className="flex flex-col justify-center gap-4 p-8">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-1 text-xs font-bold uppercase text-gray-600">{L.traffic}</div>
            <div className="text-3xl font-black tabular-nums text-dark">
              {traffic.toLocaleString('pl-PL')}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-1 text-xs font-bold uppercase text-gray-600">{L.equivalent}</div>
            <div className="text-3xl font-black tabular-nums text-dark">
              {equivalent.toLocaleString('pl-PL')} zł{' '}
              <span className="text-base font-bold text-gray-500">/ mc</span>
            </div>
          </div>
          <p className="flex items-start gap-2.5 rounded-2xl border border-gray-200 bg-white px-5 py-4 text-sm leading-relaxed text-gray-700">
            <Info size={16} className="mt-0.5 shrink-0 text-secondary" aria-hidden="true" />
            {CONTENT.roi.disclaimer}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SeoRoiCalculator;
