import React from 'react';

const WINS = [
  {
    t: 'Odchudź zdjęcia',
    d: (
      <>
        Strona jest za ciężka. Użyj <u>TinyPNG.com</u>, aby zmniejszyć grafikę i zyskać ~1 s
        szybkości.
      </>
    ),
  },
  {
    t: 'Odpisz na opinie',
    d: 'Masz opinie bez odpowiedzi. Google promuje aktywne firmy — odpisz choćby proste „Dziękujemy”.',
  },
];

const AuditQuickWins: React.FC = () => (
  <div className="bg-[#f2fbf4] p-6 rounded-2xl border border-[#cdeed6]">
    <h3 className="font-bold text-[#1b5e20] mb-4 flex items-center gap-2.5 text-[15px]">
      Co możesz zrobić dzisiaj — za darmo
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {WINS.map((w, i) => (
        <div key={i} className="flex gap-3.5">
          <div className="w-8 h-8 bg-[#d6f0dc] rounded-lg grid place-items-center text-[#1b5e20] font-bold text-sm shrink-0 tabular-nums">
            {i + 1}
          </div>
          <p className="text-[13px] text-[#245c2c] leading-relaxed">
            <strong className="font-semibold text-[#134a1a]">{w.t}:</strong> {w.d}
          </p>
        </div>
      ))}
    </div>
  </div>
);

export default AuditQuickWins;
