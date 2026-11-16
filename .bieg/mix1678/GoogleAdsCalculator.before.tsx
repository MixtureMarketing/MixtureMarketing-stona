import React, { useState } from 'react';
import { Info, MousePointerClick, Settings, ShoppingBag } from 'lucide-react';
import { GOOGLE_ADS_CONTENT as CONTENT } from '../../../data/content';

/**
 * Kalkulator arytmetyki kampanii (przeróbka 2026-07-16, krytyka 13/40).
 * Poprzednik („Symulator Zysków") obiecywał „Przewidywany Przychód /
 * Zysk netto" wielką liczbą na granacie — obietnica wyniku przebrana za
 * matematykę. Teraz: liczby wynikają WYŁĄCZNIE z suwaków użytkownika,
 * wiersz „zysku" wyleciał, a zastrzeżenie („to założenia, nie prognoza")
 * jest częścią interfejsu. Paleta marki zamiast kolorów logo Google.
 */
const GoogleAdsCalculator: React.FC = () => {
  const [budget, setBudget] = useState(5000);
  const [cpc, setCpc] = useState(3.5);
  const [convRate, setConvRate] = useState(2.5);
  const [avgOrderValue, setAvgOrderValue] = useState(400);

  const traffic = Math.floor(budget / cpc);
  const leads = Math.floor(traffic * (convRate / 100));
  const cpa = leads > 0 ? (budget / leads).toFixed(2) : '—';
  const orderValue = leads * avgOrderValue;

  const L = CONTENT.calculator.labels;
  const sliders = [
    {
      id: 'budget',
      label: L.budget,
      desc: L.budgetDesc,
      value: budget,
      display: `${budget.toLocaleString('pl-PL')} zł`,
      min: 1000,
      max: 50000,
      step: 500,
      set: setBudget,
    },
    {
      id: 'cpc',
      label: L.cpc,
      desc: L.cpcDesc,
      value: cpc,
      display: `${String(cpc).replace('.', ',')} zł`,
      min: 0.5,
      max: 15,
      step: 0.1,
      set: setCpc,
    },
    {
      id: 'cr',
      label: L.cr,
      desc: L.crDesc,
      value: convRate,
      display: `${String(convRate).replace('.', ',')}%`,
      min: 0.1,
      max: 5,
      step: 0.1,
      set: setConvRate,
    },
    {
      id: 'aov',
      label: L.aov,
      desc: '',
      value: avgOrderValue,
      display: `${avgOrderValue.toLocaleString('pl-PL')} zł`,
      min: 50,
      max: 5000,
      step: 50,
      set: setAvgOrderValue,
    },
  ];

  return (
    <div className="overflow-hidden rounded-3xl border border-gray-200 bg-light-gray shadow-xl">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div className="border-b border-gray-200 bg-white p-8 lg:col-span-5 lg:border-r lg:border-b-0">
          <h3 className="mb-8 flex items-center gap-2 text-xl font-bold text-dark">
            <Settings size={20} className="text-secondary" /> Twoje założenia
          </h3>

          <div className="space-y-8">
            {sliders.map((s) => (
              <div key={s.id}>
                <div className="mb-2 flex justify-between text-sm font-bold text-dark">
                  <label id={`${s.id}-label`}>{s.label}</label>
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
                  aria-labelledby={`${s.id}-label`}
                />
                {s.desc && <p className="mt-2 text-xs text-gray-600">{s.desc}</p>}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-center bg-light-gray p-8 lg:col-span-7">
          <div className="mb-6 grid grid-cols-2 gap-4">
            {[
              {
                label: L.traffic,
                value: traffic.toLocaleString('pl-PL'),
                Icon: MousePointerClick,
              },
              { label: L.leads, value: leads.toLocaleString('pl-PL'), Icon: ShoppingBag },
            ].map(({ label, value, Icon }) => (
              <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="mb-1 text-xs font-bold uppercase text-gray-600">{label}</div>
                <div className="flex items-center gap-2 text-2xl font-black tabular-nums text-dark">
                  {value} <Icon size={16} className="text-secondary" aria-hidden="true" />
                </div>
              </div>
            ))}
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-1 text-xs font-bold uppercase text-gray-600">{L.cpa}</div>
              <div className="text-2xl font-black tabular-nums text-dark">
                {typeof cpa === 'string' && cpa !== '—' ? `${cpa.replace('.', ',')} zł` : cpa}
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-1 text-xs font-bold uppercase text-gray-600">{L.revenue}</div>
              <div className="text-2xl font-black tabular-nums text-dark">
                {orderValue.toLocaleString('pl-PL')} zł
              </div>
            </div>
          </div>

          {/* Zastrzeżenie jest częścią interfejsu — liczby to arytmetyka
              założeń użytkownika, nie prognoza agencji. */}
          <p className="flex items-start gap-2.5 rounded-2xl border border-gray-200 bg-white px-5 py-4 text-sm leading-relaxed text-gray-700">
            <Info size={16} className="mt-0.5 shrink-0 text-secondary" aria-hidden="true" />
            {CONTENT.calculator.disclaimer}
          </p>
        </div>
      </div>
    </div>
  );
};

export default GoogleAdsCalculator;
