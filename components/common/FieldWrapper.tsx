import React from 'react';
import { AlertCircle } from 'lucide-react';

interface FieldWrapperProps {
  children: React.ReactNode;
  error?: string;
  errorId?: string;
  className?: string;
}

const FieldWrapper: React.FC<FieldWrapperProps> = ({
  children,
  error,
  errorId,
  className = '',
}) => {
  return (
    <div className={`relative mb-4 group ${className}`}>
      {children}

      {/* Animated Bottom Border */}
      <div
        className={`
          absolute bottom-0 left-1/2 h-[2px] w-0 
          bg-primary
          transition-all duration-300 ease-out 
          -translate-x-1/2 
          peer-focus:w-full
          ${error ? 'bg-red-500 w-full' : ''}
        `}
      />

      {/* Error Message */}
      <div
        className={`
          overflow-hidden transition-all duration-300 ease-in-out
          ${error ? 'max-h-10 opacity-100 mt-1.5' : 'max-h-0 opacity-0 mt-0'}
        `}
      >
        <div
          id={errorId}
          className="flex items-center gap-1.5 text-[11px] font-bold text-red-500 pl-4"
          role="alert"
        >
          <AlertCircle size={13} className="shrink-0" />
          <span>{error}</span>
        </div>
      </div>
    </div>
  );
};

export default FieldWrapper;
