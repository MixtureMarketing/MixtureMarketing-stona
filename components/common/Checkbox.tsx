import React, { forwardRef } from 'react';
import { CheckCircle2 } from 'lucide-react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: React.ReactNode;
  error?: string;
}

/**
 * Standardized Checkbox component for Mixture Marketing forms.
 * Integrates seamlessly with React Hook Form and standard error styling.
 */
const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className={`pt-2 ${className}`}>
        <label className="flex items-start gap-4 cursor-pointer group">
          <div className="relative flex items-center mt-1">
            <input
              type="checkbox"
              ref={ref}
              className="peer h-6 w-6 cursor-pointer appearance-none rounded-lg border-2 border-gray-200 shadow-sm transition-all checked:border-secondary checked:bg-secondary hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              {...props}
            />
            <CheckCircle2
              size={14}
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
            />
          </div>
          <span className="text-[11px] text-gray-700 leading-relaxed group-hover:text-dark transition-colors font-medium">
            {label}
          </span>
        </label>

        {/* Error Message - Standardized Style */}
        <div
          className={`
            overflow-hidden transition-all duration-300 ease-in-out
            ${error ? 'max-h-10 opacity-100 mt-2' : 'max-h-0 opacity-0 mt-0'}
          `}
        >
          <div className="flex items-center gap-1.5 text-xxs font-bold text-red-500 pl-10 animate-shake">
            <span>{error}</span>
          </div>
        </div>
      </div>
    );
  },
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
