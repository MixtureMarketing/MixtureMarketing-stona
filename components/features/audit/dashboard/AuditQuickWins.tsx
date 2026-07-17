import React from 'react';

interface AuditQuickWinsProps {
  lcp: number;
  imagesNoAlt: number;
  hasAnalytics: boolean;
}

/**
 * Quick-winy z REALNEGO pomiaru (2026-07-17): poprzednia wersja pokazywała
 * każdemu te same dwa wpisy („strona za ciężka", „opinie bez odpowiedzi")
 * niezależnie od wyniku — w tym poradę o opiniach, których backend w ogóle
 * nie mierzy. Teraz wpis pojawia się tylko, gdy pomiar go uzasadnia.
 */
const AuditQuickWins: React.FC<AuditQuickWinsProps> = ({ lcp, imagesNoAlt, hasAnalytics }) => {
  const wins: Array<{ t: string; d: React.ReactNode }> = [];

  if (lcp > 2.5) {
    wins.push({
      t: 'Odchudź stronę',
      d: (
        <>
          Twoje zmierzone LCP to {lcp.toFixed(1).replace('.', ',')} s (próg Google: 2,5 s).
          Najczęstszy winowajca to zdjęcia — zmniejsz je np. w <u>TinyPNG.com</u>.
        </>
      ),
    });
  }
  if (imagesNoAlt > 0) {
    wins.push({
      t: 'Uzupełnij opisy ALT',
      d: `${imagesNoAlt} ${imagesNoAlt === 1 ? 'zdjęcie nie ma' : 'zdjęć nie ma'} opisu alternatywnego — Google i czytniki ekranu ich „nie widzą”.`,
    });
  }
  if (!hasAnalytics) {
    wins.push({
      t: 'Podepnij analitykę',
      d: 'Nie wykryliśmy GA4 — bez analityki nie wiesz, skąd przychodzą klienci i co porzucają.',
    });
  }

  if (wins.length === 0) return null;

  return (
    <div className="bg-[#f2fbf4] p-6 rounded-2xl border border-[#cdeed6]">
      <h3 className="font-bold text-[#1b5e20] mb-4 flex items-center gap-2.5 text-[15px]">
        Co możesz zrobić dzisiaj — za darmo
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {wins.slice(0, 2).map((w, i) => (
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
};

export default AuditQuickWins;
