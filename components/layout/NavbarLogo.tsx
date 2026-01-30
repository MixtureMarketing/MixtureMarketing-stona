import React from 'react';

interface NavbarLogoProps {
  onClick: () => void;
}

const NavbarLogo: React.FC<NavbarLogoProps> = ({ onClick }) => {
  return (
    <div
      className="flex-shrink-0 flex items-center cursor-pointer group"
      onClick={onClick}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      aria-label="Mixture Marketing - Strona Główna"
    >
      <img
        src="/assets/images/logo.svg"
        alt="Logo Mixture Marketing"
        className="h-10 w-auto transition-transform group-hover:scale-105 duration-300"
        width="102"
        height="40"
        fetchPriority="high"
        loading="eager"
      />
    </div>
  );
};

export default NavbarLogo;
