/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useId } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface AccordionProps {
  title: string;
  children: React.ReactNode;
}

const Accordion: React.FC<AccordionProps> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const id = useId();
  const buttonId = `accordion-button-${id}`;
  const panelId = `accordion-panel-${id}`;

  return (
    <div className="border border-gray-200 rounded-xl bg-white overflow-hidden transition-all duration-300 hover:border-primary/50">
      <button
        id={buttonId}
        className={`w-full flex justify-between items-center p-5 text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary group ${isOpen ? 'bg-gray-50' : 'bg-white'}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={panelId}
      >
        <span
          className={`text-lg font-bold transition-colors ${isOpen ? 'text-secondary' : 'text-dark group-hover:text-secondary'}`}
        >
          {title}
        </span>
        {isOpen ? (
          <ChevronUp className="text-primary" />
        ) : (
          <ChevronDown className="text-gray-600" />
        )}
      </button>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}
        style={{ visibility: isOpen ? 'visible' : 'hidden' }}
      >
        <div className="p-5 pt-2 text-gray-700 leading-relaxed border-t border-gray-100 bg-gray-50/50">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Accordion;
