import React from 'react';
import { CheckCircle2, User, Briefcase, MessageSquare } from 'lucide-react';

interface ContactStepperProps {
  step: number;
}

const steps = [
  { id: 1, label: 'Kontakt', icon: User },
  { id: 2, label: 'Projekt', icon: Briefcase },
  { id: 3, label: 'Cel', icon: MessageSquare },
];

const ContactStepper: React.FC<ContactStepperProps> = ({ step }) => {
  return (
    <div className="flex justify-between items-center mb-6 md:mb-12 px-4 relative max-w-md mx-auto">
      <div className="absolute top-5 left-0 w-full h-[2px] bg-gray-100 -z-10" />
      <div
        className="absolute top-5 left-0 h-[2px] bg-primary -z-10 transition-all duration-500 ease-out"
        style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
      />
      {steps.map((s) => {
        const isActive = step >= s.id;
        const isCurrent = step === s.id;
        return (
          <div
            key={s.id}
            className="flex flex-col items-center gap-2 md:gap-3 bg-white px-2 md:px-4 relative"
          >
            <div
              className={`w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl flex items-center justify-center border-2 transition-all duration-500 ${
                isActive
                  ? 'bg-dark border-dark text-white shadow-lg'
                  : 'bg-white border-gray-200 text-gray-300'
              } ${isCurrent ? 'ring-4 ring-primary/20 scale-110 -translate-y-1' : ''}`}
            >
              {isActive && step > s.id ? (
                <CheckCircle2 size={16} className="md:w-[18px]" />
              ) : (
                <s.icon size={16} className="md:w-[18px]" />
              )}
            </div>
            <span
              className={`text-xxs md:text-xxs font-black uppercase tracking-widest ${
                isActive ? 'text-dark' : 'text-gray-300'
              }`}
            >
              {s.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default ContactStepper;
