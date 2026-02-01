import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  clean?: boolean; // Jeśli true, usuwa domyślne paddingi, zostawia tylko max-width i centrowanie
}

/**
 * Atomic component for page and section containment.
 * Unifies max-width and horizontal padding across the project.
 */
const Container: React.FC<ContainerProps> = ({ children, className = '', clean = false }) => {
  return (
    <div
      className={`
        max-w-screen-2xl mx-auto 
        ${clean ? '' : 'px-4 sm:px-6 lg:px-8'} 
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Container;
