import React from 'react';
import Container from './Container';

interface SectionWrapperProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
  containerClassName?: string;
  variant?: 'white' | 'gray' | 'light-gray' | 'dark' | 'none';
  padding?: 'none' | 'sm' | 'base' | 'lg';
  overflow?: boolean;
}

/**
 * A universal wrapper for page sections to ensure consistent spacing and themes.
 */
const SectionWrapper: React.FC<SectionWrapperProps> = ({
  children,
  id,
  className = '',
  containerClassName = '',
  variant = 'white',
  padding = 'base',
  overflow = true,
}) => {
  const bgClasses = {
    white: 'bg-white',
    gray: 'bg-light-gray',
    'light-gray': 'bg-light-gray',
    dark: 'bg-deep-dark text-white',
    none: '',
  };

  const paddingClasses = {
    none: 'py-0',
    sm: 'py-10 md:py-16 lg:py-20',
    base: 'py-16 md:py-24 lg:py-32',
    lg: 'py-20 md:py-32 lg:py-48',
  };

  return (
    <section
      id={id}
      className={`relative ${bgClasses[variant]} ${paddingClasses[padding]} ${overflow ? 'overflow-hidden' : ''} ${className}`}
    >
      <Container className={`relative z-10 ${containerClassName}`}>{children}</Container>
    </section>
  );
};

export default SectionWrapper;
