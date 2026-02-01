import React from 'react';
import { Loader2 } from 'lucide-react';

const baseStyles =
  'inline-flex items-center justify-center font-bold rounded-full transition-all duration-300 transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#213261] focus:ring-offset-[#F5F7FA]';

const sizeStyles = {
  sm: 'px-6 py-3 text-sm',
  md: 'px-8 py-3 text-base',
  lg: 'px-10 py-4 text-lg',
};

const variantStyles = {
  primary: `bg-gradient-to-br from-secondary to-[#5A58AD] text-white shadow-lg hover:shadow-[0_8px_25px_-5px_rgba(97,182,222,0.6)] motion-safe:hover:-translate-y-1 border border-transparent`,
  secondary: `bg-transparent border-2 border-secondary text-secondary hover:bg-secondary hover:text-white hover:shadow-lg motion-safe:hover:-translate-y-1`,
  outline: `border-2 border-secondary text-secondary hover:bg-secondary hover:text-white`,
  ghost: `text-secondary hover:text-accent-dark hover:bg-secondary/5`,
  white:
    'bg-white text-secondary hover:bg-gray-50 shadow-lg hover:shadow-xl motion-safe:hover:-translate-y-1',
};

type BaseProps = {
  variant?: keyof typeof variantStyles;
  size?: keyof typeof sizeStyles;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
  className?: string;
  'aria-label'?: string;
  children?: React.ReactNode;
};

type AnchorProps = BaseProps & React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };
type ButtonElementProps = BaseProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: never };
type ButtonProps = AnchorProps | ButtonElementProps;

const Button: React.FC<ButtonProps> = (props) => {
  const {
    children,
    variant = 'primary',
    size = 'md',
    icon,
    iconPosition = 'right',
    isLoading = false,
    className = '',
    'aria-label': ariaLabel,
    ...rest
  } = props;

  const combinedClassName = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;

  const content = (
    <>
      {isLoading && <Loader2 className="animate-spin mr-2" size={18} aria-hidden="true" />}
      {!isLoading && icon && iconPosition === 'left' && (
        <span
          className="mr-2 transform transition-transform motion-safe:group-hover:-translate-x-1"
          aria-hidden="true"
        >
          {icon}
        </span>
      )}
      {children}
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

  if (props.href) {
    const { href, ...anchorRest } = rest as React.AnchorHTMLAttributes<HTMLAnchorElement>;
    return (
      <a
        href={href}
        className={`${combinedClassName} group`}
        role="button"
        aria-label={ariaLabel}
        {...anchorRest}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      className={`${combinedClassName} group`}
      disabled={isLoading || (props as React.ButtonHTMLAttributes<HTMLButtonElement>).disabled}
      aria-label={ariaLabel}
      {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {content}
    </button>
  );
};

export default Button;
