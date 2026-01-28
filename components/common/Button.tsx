import React from 'react';
import { Loader2 } from 'lucide-react';
import { COLORS } from '../../types';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'white';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
  href?: string;
  className?: string;
  'aria-label'?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'right',
  isLoading = false,
  href,
  className = '',
  'aria-label': ariaLabel,
  ...props
}) => {
  // Base styles
  // Added rounded-full for pill shape (50px border-radius)
  // Added focus styles for WCAG compliance
  const baseStyles =
    'inline-flex items-center justify-center font-bold rounded-full transition-all duration-300 transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#213261] focus:ring-offset-[#F5F7FA]';

  // Size styles
  const sizeStyles = {
    sm: 'px-6 py-3 text-sm',
    md: 'px-8 py-3 text-base',
    lg: 'px-10 py-4 text-lg',
  };

  // Variant styles
  const variantStyles = {
    // Primary: Gradient 135deg (br), Glow #61B6DE on hover, Lift
    primary: `bg-gradient-to-br from-secondary to-[#5A58AD] text-white shadow-lg hover:shadow-[0_8px_25px_-5px_rgba(97,182,222,0.6)] motion-safe:hover:-translate-y-1 border border-transparent`,

    // Secondary: Transparent bg, Border #3F3D91, Fill on hover
    secondary: `bg-transparent border-2 border-secondary text-secondary hover:bg-secondary hover:text-white hover:shadow-lg motion-safe:hover:-translate-y-1`,

    // Other variants updated for consistency (rounded-full)
    outline: `border-2 border-secondary text-secondary hover:bg-secondary hover:text-white`,
    ghost: `text-secondary hover:text-accent-dark hover:bg-secondary/5`,
    white:
      'bg-white text-secondary hover:bg-gray-50 shadow-lg hover:shadow-xl motion-safe:hover:-translate-y-1',
  };

  // Dynamic styles are mostly handled by Tailwind classes now, but we keep this override mechanism if needed for specific cases
  // Removing strict color overrides for primary to allow gradient to show
  const dynamicStyle = {};

  const combinedClassName = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;

  const content = (
    <>
      {isLoading && <Loader2 className="animate-spin mr-2" size={18} aria-hidden="true" />}

      {/* Icon Slide Left (if icon is on left) */}
      {!isLoading && icon && iconPosition === 'left' && (
        <span
          className="mr-2 transform transition-transform motion-safe:group-hover:-translate-x-1"
          aria-hidden="true"
        >
          {icon}
        </span>
      )}

      {children}

      {/* Icon Slide Right (if icon is on right - default) */}
      {!isLoading && icon && iconPosition === 'right' && (
        <span
          className="ml-2 transform transition-transform motion-safe:group-hover:translate-x-1"
          aria-hidden="true"
        >
          {icon}
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className={`${combinedClassName} group`}
        style={dynamicStyle}
        onClick={props.onClick as React.MouseEventHandler<HTMLAnchorElement>}
        role="button"
        aria-label={ariaLabel}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      className={`${combinedClassName} group`}
      style={dynamicStyle}
      disabled={isLoading || props.disabled}
      aria-label={ariaLabel}
      {...props}
    >
      {content}
    </button>
  );
};

export default Button;
