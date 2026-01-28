/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { ShieldCheck, Send, Loader2 } from 'lucide-react';
import Button from '../../common/Button';

interface CalculatorStepFormProps {
  email: string;
  setEmail: (email: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

const CalculatorStepForm: React.FC<CalculatorStepFormProps> = ({
  email,
  setEmail,
  onSubmit,
  isSubmitting,
}) => {
  return (
    <div className="animate-fade-in">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center p-4 bg-green-100 text-green-600 rounded-full mb-6">
          <ShieldCheck size={48} />
        </div>
        <h3 className="text-3xl font-bold text-dark mb-4">Twój kosztorys jest gotowy!</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Podaj nam swój adres e-mail, abyśmy mogli wysłać Ci szczegółową ofertę w formacie PDF.
        </p>
      </div>

      <form onSubmit={onSubmit} className="max-w-md mx-auto space-y-4">
        <div className="space-y-2 text-left">
          <label className="text-sm font-bold text-gray-700 ml-1">Adres E-mail</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="np. jan@twoja-firma.pl"
            className="w-full px-6 py-4 rounded-2xl border border-gray-200 focus:border-secondary focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
          />
        </div>
        <Button
          variant="primary"
          className="w-full py-4 text-lg"
          icon={isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Generowanie...' : 'Odbierz Wycenę PDF'}
        </Button>
        <p className="text-xxs text-gray-400 text-center px-4 leading-relaxed">
          Klikając przycisk wyrażasz zgodę na przetwarzanie danych w celu przesłania oferty. Zero
          spamu. Obiecujemy.
        </p>
      </form>
    </div>
  );
};

export default CalculatorStepForm;
