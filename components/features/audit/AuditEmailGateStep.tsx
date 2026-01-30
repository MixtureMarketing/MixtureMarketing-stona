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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto bg-white rounded-[3rem] shadow-2xl p-12 text-center border border-gray-100 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#00C853] to-emerald-400"></div>

      <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8">
        <ShieldCheck size={40} className="text-success" />
      </div>

      <h2 className="text-3xl font-black text-dark mb-4">Analiza zakończona!</h2>
      <p className="text-gray-600 mb-10 text-lg">
        Twój raport PDF jest gotowy do pobrania. Podaj e-mail, na który mamy go wysłać.
      </p>

      <form onSubmit={onSubmit} className="space-y-6">
        <input
          type="email"
          placeholder="twoj@email.pl"
          className="w-full px-8 py-5 rounded-2xl border-2 border-gray-100 focus:border-secondary focus:ring-4 focus:ring-secondary/10 outline-none transition-all text-xl font-medium text-center"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
        />
        <Button className="w-full h-16 text-xl justify-center rounded-2xl">
          Pokaż raport i wyślij PDF <ArrowRight className="ml-2" />
        </Button>
        <p className="text-xxs text-gray-400 uppercase font-bold tracking-widest">
          Nie wysyłamy spamu. Tylko Twój darmowy raport.
        </p>
      </form>
    </motion.div>
  );
};

export default AuditEmailGateStep;
