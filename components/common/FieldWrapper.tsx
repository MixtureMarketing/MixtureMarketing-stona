import React from 'react';
import { AlertCircle } from 'lucide-react';

interface FieldWrapperProps {
  children: React.ReactNode;
  label: string;
  id: string;
  error?: string;
  errorId?: string;
  icon?: React.ReactNode;
  className?: string;
}

/**
 * FormFieldEngine: The core wrapper for all input-like components.
 * Manages Layout, Floating Labels, Icons, and Error states.
 */
const FieldWrapper: React.FC<FieldWrapperProps> = ({
  children,
  label,
  id,
  error,
  errorId,
  icon,
  className = '',
}) => {
  return (
    <div className={`relative mb-4 group ${className}`}>
      {/* Icon Slot */}
      {icon && (
        <div className="absolute left-4 top-[2.1rem] -translate-y-1/2 text-gray-600 group-focus-within:text-primary group-focus-within:scale-110 transition-all duration-300 pointer-events-none z-10">
          {icon}
        </div>
      )}

      {children}

      {/* Floating Label */}
      <label
        htmlFor={id}
        className={`
          absolute ${icon ? 'left-12' : 'left-4'} top-5
          text-gray-600 text-sm font-bold uppercase tracking-wider
          transition-all duration-300
          origin-[0]
          peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0
          peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-primary
          scale-75 -translate-y-4
          pointer-events-none
          ${error ? 'text-red-500' : ''}
        `}
      >
        {label}
      </label>

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
