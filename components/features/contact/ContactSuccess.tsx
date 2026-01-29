import React from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { CALENDAR_IFRAME_SRC } from './contactConfig';

interface ContactSuccessProps {
  userName: string;
  onClose: () => void;
}

const ContactSuccess: React.FC<ContactSuccessProps> = ({ userName, onClose }) => {
  return (
    <div className="text-center py-4 px-2 animate-fade-in">
      <div className="flex flex-col items-center justify-center gap-3 mb-8 text-dark">
        <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-2 shadow-inner border border-green-100">
          <CheckCircle2 size={40} className="animate-scale-in" />
        </div>
        <h3 className="text-3xl font-black tracking-tight">
          Dzięki, {userName.split(' ')[0] || 'to wszystko'}!
        </h3>
        <p className="text-gray-700 max-w-md mx-auto font-medium">
          Twój brief trafił do naszego systemu. Wybierz dogodny termin rozmowy poniżej.
        </p>
      </div>
      <div className="w-full h-[400px] md:h-[500px] bg-white rounded-[2rem] overflow-hidden border-2 border-gray-100 shadow-2xl mb-8 group relative text-center flex items-center justify-center">
        <div className="absolute inset-0 bg-tech-grid opacity-5 pointer-events-none"></div>
        <iframe
          src={CALENDAR_IFRAME_SRC}
          style={{ border: 0 }}
          width="100%"
          height="100%"
          frameBorder="0"
          title="Google Calendar Appointment Scheduling"
          className="relative z-10"
        ></iframe>
      </div>
      <button
        onClick={onClose}
        className="group flex items-center gap-2 mx-auto text-gray-600 text-xs hover:text-secondary transition-all font-black uppercase tracking-[0.2em]"
      >
        <span>Zamknij to okno</span>
        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
};

export default ContactSuccess;
