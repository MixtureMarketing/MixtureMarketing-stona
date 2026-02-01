import React, { forwardRef } from 'react';
import FieldWrapper from './FieldWrapper';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label: string;
  error?: string;
  textarea?: boolean;
  rows?: number;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  ({ label, error, textarea = false, rows = 4, icon, className = '', id, ...props }, ref) => {
    const generatedId = id || label.toLowerCase().replace(/\s+/g, '-');
    const errorId = `${generatedId}-error`;

    const commonClasses = `
    block w-full ${icon ? 'pl-12' : 'px-4'} pt-7 pb-2
    bg-gray-50/50 text-dark font-bold
    border-b-2 border-gray-200
    focus:outline-none focus:border-transparent focus:bg-white
    placeholder-transparent
    transition-all duration-300
    peer
    ${error ? 'border-red-500 bg-red-50/30' : ''}
  `;

    return (
      <FieldWrapper
        label={label}
        id={generatedId}
        error={error}
        errorId={errorId}
        icon={icon}
        className={className}
      >
        {textarea ? (
          <textarea
            ref={ref as React.ForwardedRef<HTMLTextAreaElement>}
            rows={rows}
            id={generatedId}
            placeholder=" "
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            {...props}
            className={`${commonClasses} resize-none pt-8`}
          />
        ) : (
          <input
            ref={ref as React.ForwardedRef<HTMLInputElement>}
            id={generatedId}
            placeholder=" "
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            {...props}
            className={commonClasses}
          />
        )}
      </FieldWrapper>
    );
  },
);

Input.displayName = 'Input';

export default Input;
