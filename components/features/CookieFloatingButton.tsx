import React from 'react';
import { Cookie } from 'lucide-react';

interface CookieFloatingButtonProps {
  onClick: () => void;
}

const CookieFloatingButton: React.FC<CookieFloatingButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="cookie-floating-btn fixed bottom-4 left-4 z-[90] p-3 bg-white text-secondary rounded-full shadow-lg border border-gray-100 hover:scale-110 transition-[transform,bottom] duration-300 group"
      aria-label="Ustawienia plików cookies"
    >
      <Cookie size={24} className="group-hover:rotate-12 transition-transform" />
      <span className="sr-only">Ustawienia Cookies</span>
      <span className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1 bg-dark text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        Ustawienia prywatności
      </span>
    </button>
  );
};

export default CookieFloatingButton;
