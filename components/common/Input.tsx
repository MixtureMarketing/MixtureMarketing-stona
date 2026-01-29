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

    const inputProps = {
      id: generatedId,
      className: commonClasses,
      placeholder: ' ',
      'aria-invalid': !!error,
      'aria-describedby': error ? errorId : undefined,
      ...props,
    };

    return (
      <FieldWrapper error={error} errorId={errorId} className={className}>
        {/* Icon */}
        {icon && (
          <div className="absolute left-4 top-[2.1rem] -translate-y-1/2 text-gray-600 group-focus-within:text-primary group-focus-within:scale-110 transition-all duration-300 pointer-events-none z-10">
            {icon}
          </div>
        )}

        {/* Input Field */}
        {textarea ? (
          <textarea
            ref={ref as React.ForwardedRef<HTMLTextAreaElement>}
            rows={rows}
            {...(inputProps as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
            className={`${commonClasses} resize-none pt-8`}
          />
        ) : (
          <input
            ref={ref as React.ForwardedRef<HTMLInputElement>}
            {...(inputProps as React.InputHTMLAttributes<HTMLInputElement>)}
          />
        )}

        {/* Floating Label */}
        <label
          htmlFor={generatedId}
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
      </FieldWrapper>
    );
  },
);

Input.displayName = 'Input';

export default Input;
