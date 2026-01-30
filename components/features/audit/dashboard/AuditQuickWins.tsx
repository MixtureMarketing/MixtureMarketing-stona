import React from 'react';

const AuditQuickWins: React.FC = () => {
  return (
    <div className="bg-[#E8F5E9] p-8 rounded-3xl border border-green-200 shadow-inner mt-8">
      <h3 className="font-black text-[#1B5E20] mb-6 flex items-center gap-3 text-lg">
        🎁 Co możesz zrobić dzisiaj (za darmo)?
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex gap-4">
          <div className="w-10 h-10 bg-green-200 rounded-xl flex shrink-0 items-center justify-center text-green-800 font-black shadow-sm">
            1
          </div>
          <p className="text-sm text-green-900 leading-relaxed italic">
            <strong>Odchudź zdjęcia:</strong> Twoja strona jest za ciężka. Użyj <u>TinyPNG.com</u>,
            aby zmniejszyć grafikę i zyskać 1s szybkości.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="w-10 h-10 bg-green-200 rounded-xl flex shrink-0 items-center justify-center text-green-800 font-black shadow-sm">
            2
          </div>
          <p className="text-sm text-green-900 leading-relaxed italic">
            <strong>Odpisz na opinie:</strong> Masz opinie bez odpowiedzi. Google promuje aktywne
            firmy. Odpisz im proste "Dziękujemy!".
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuditQuickWins;
