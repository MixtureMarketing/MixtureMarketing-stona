import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import FieldWrapper from './FieldWrapper';

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
      <FieldWrapper
        label={label}
        id={generatedId}
        error={error}
        errorId={errorId}
        className={className}
      >
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
      </FieldWrapper>
    );
  },
);

Select.displayName = 'Select';

export default Select;
