import React from 'react';
import { MapPin, Star } from 'lucide-react';
import { getGoogleProfileLinks, type GoogleProfileLinks } from '../../utils/googleProfile';

interface GoogleProfileButtonsProps {
  /** `dark` — ciemne tło (stopka), `light` — jasne (strona kontaktowa). */
  variant?: 'dark' | 'light';
  /** Nadpisanie linków (testy); domyślnie `SITE_CONFIG.google`. */
  links?: GoogleProfileLinks;
  className?: string;
}

const STYLES = {
  dark: 'bg-white/5 text-gray-200 border border-white/10 hover:bg-white/10 hover:text-white',
  light: 'bg-white text-dark border border-gray-200 hover:border-primary/40 hover:text-primary',
} as const;

/**
 * „Zobacz nas w Google” + „Wystaw opinię” (MIX-1020). Każdy przycisk znika, gdy jego link
 * jest pusty; gdy nie ma żadnego linku, nie renderuje się nic (bez pustego kontenera).
 */
const GoogleProfileButtons: React.FC<GoogleProfileButtonsProps> = ({
  variant = 'light',
  links,
  className = '',
}) => {
  const { profileUrl, reviewUrl } = links ?? getGoogleProfileLinks();
  if (!profileUrl && !reviewUrl) return null;

  const base = `inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-all ${STYLES[variant]}`;

  return (
    <div className={`flex flex-wrap gap-3 ${className}`} data-testid="google-profile-buttons">
      {profileUrl && (
        <a
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={base}
          data-google-button="profile"
        >
          <MapPin size={16} aria-hidden="true" />
          Zobacz nas w Google
        </a>
      )}
      {reviewUrl && (
        <a
          href={reviewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={base}
          data-google-button="review"
        >
          <Star size={16} aria-hidden="true" />
          Wystaw opinię
        </a>
      )}
    </div>
  );
};

export default GoogleProfileButtons;
