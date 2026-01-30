import React from 'react';
import { Loader2 } from 'lucide-react';
import { baseStyles, sizeStyles, variantStyles } from './ButtonStyles';

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
