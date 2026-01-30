import React from 'react';
import { LucideIcon } from 'lucide-react';
import Button from './Button';

interface StandardCtaProps {
  title: string;
  description: string;
  buttonText: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'white';
  colorScheme?: 'blue' | 'indigo' | 'instagram' | 'success';
  className?: string;
  bgClassName?: string;
}

const StandardCta: React.FC<StandardCtaProps> = ({
  title,
  description,
  buttonText,
  icon: Icon,
  onClick,
  variant = 'primary',
  colorScheme = 'blue',
  className = '',
  bgClassName = '',
}) => {
  const schemeClasses = {
    blue: {
      iconBg: 'bg-blue-50',
      iconText: 'text-secondary',
      btnClass: '',
    },
    indigo: {
      iconBg: 'bg-indigo-50',
      iconText: 'text-secondary',
      btnClass: '',
    },
    instagram: {
      iconBg: 'bg-white border border-instagram/20',
      iconText: 'text-instagram',
      btnClass: '!bg-instagram hover:!bg-[#C13584] border-transparent',
    },
    success: {
      iconBg: 'bg-white/20 backdrop-blur-md',
      iconText: 'text-white',
      btnClass: '!bg-white !text-[#008a3a] hover:!bg-gray-100 border-transparent',
    },
  };

  const currentScheme = schemeClasses[colorScheme] || schemeClasses.blue;

  return (
    <section
      className={`py-24 relative overflow-hidden ${bgClassName} ${colorScheme === 'success' ? '!bg-[#008a3a] text-white' : ''}`}
    >
      <div className="absolute inset-0 bg-tech-grid opacity-5 pointer-events-none"></div>
      <div className={`max-w-4xl mx-auto px-4 text-center relative z-10 ${className}`}>
        <div
          className={`inline-block p-4 rounded-full mb-6 shadow-sm animate-pulse ${currentScheme.iconBg}`}
        >
          <Icon size={32} className={currentScheme.iconText} aria-hidden="true" />
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-6">{title}</h2>
        <p className="text-xl opacity-90 mb-10 font-medium">{description}</p>
        <Button onClick={onClick} variant={variant} size="lg" className={currentScheme.btnClass}>
          {buttonText}
        </Button>
      </div>
    </section>
  );
};

export default StandardCta;
