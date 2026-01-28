import React, { forwardRef } from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string; label: string }[];
  error?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, className = '', id, value, ...props }, ref) => {
    const generatedId = id || label.toLowerCase().replace(/\s+/g, '-');
    const errorId = `${generatedId}-error`;

    return (
      <div className={`relative mb-4 group ${className}`}>
        <select
          id={generatedId}
          ref={ref}
          value={value}
          className={`
          block w-full px-4 pt-7 pb-2
          bg-gray-50/50 text-dark font-bold
          border-b-2 border-gray-200
          focus:outline-none focus:border-transparent focus:bg-white
          appearance-none cursor-pointer
          transition-all duration-300
          peer
          ${error ? 'border-red-500 bg-red-50/30' : ''}
        `}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Custom Chevron */}
        <div className="absolute right-4 top-[2.1rem] -translate-y-1/2 pointer-events-none text-gray-600 group-focus-within:text-primary group-focus-within:scale-110 transition-all duration-300">
          <ChevronDown size={20} />
        </div>

        {/* Floating Label */}
        <label
          htmlFor={generatedId}
          className={`
          absolute left-4 top-1.5
          text-xxs font-black uppercase tracking-widest text-gray-600
          transition-all duration-300
          peer-focus:text-primary
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
  },
);

Select.displayName = 'Select';

export default Select;
