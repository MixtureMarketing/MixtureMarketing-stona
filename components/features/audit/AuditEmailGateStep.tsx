import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import Button from '../../common/Button';

interface AuditEmailGateStepProps {
  email: string;
  setEmail: (email: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const AuditEmailGateStep: React.FC<AuditEmailGateStepProps> = ({ email, setEmail, onSubmit }) => {
  return (
    <motion.div
      key="email-gate"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-xl mx-auto bg-white rounded-2xl shadow-[0_1px_2px_rgba(16,24,40,0.04),0_24px_60px_-30px_rgba(16,24,40,0.18)] p-10 md:p-12 text-center border border-gray-200"
    >
      <div className="w-16 h-16 bg-[#e7f8ee] rounded-2xl grid place-items-center mx-auto mb-6">
        <ShieldCheck size={32} className="text-success" />
      </div>

      <h2 className="text-2xl font-bold text-dark mb-2.5 tracking-tight">Analiza zakończona</h2>
      <p className="text-gray-500 mb-8">
        Raport PDF jest gotowy. Podaj e-mail, na który mamy go wysłać.
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="twoj@email.pl"
          className="w-full px-6 py-4 rounded-xl border border-gray-200 focus:border-secondary focus:ring-4 focus:ring-secondary/15 outline-none transition-all text-lg text-center"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
        />
        <Button className="w-full h-14 text-lg justify-center rounded-xl active:scale-[0.98] transition-transform">
          Pokaż raport i wyślij PDF <ArrowRight className="ml-2" size={20} />
        </Button>
        <p className="text-[11px] text-gray-400 font-medium">
          Nie wysyłamy spamu. Tylko Twój darmowy raport.
        </p>
      </form>
    </motion.div>
  );
};

export default AuditEmailGateStep;
