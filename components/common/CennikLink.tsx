import React from 'react';
import { Link } from 'react-router-dom';
import { isCennikEnabled } from '../../config/flags';
import { CENNIK_PATH } from '../../data/content/pages/cennik';

/**
 * Odnośnik do /cennik/ w artykułach bazy wiedzy (MIX-1855). Tylko przy VITE_MM_CENNIK=1:
 * wyłączony = nic w DOM (HTML artykułu bez zmian), bo adres /cennik/ prowadziłby wtedy przez
 * 301 na /offers/. Linkujemy do strony, nie powielamy jej treści.
 */
const CennikLink: React.FC = () => {
  if (!isCennikEnabled()) return null;
  return (
    <p className="mt-12 text-gray-700" data-cennik-link>
      Aktualne widełki cen stron WWW, kampanii, SEO i designu znajdziesz w{' '}
      <Link to={CENNIK_PATH} className="text-accent-dark hover:underline font-semibold">
        cenniku Mixture Marketing
      </Link>
      .
    </p>
  );
};

export default CennikLink;
