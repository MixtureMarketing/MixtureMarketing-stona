import { useLocation } from 'react-router-dom';

export const useCanonicalUrl = (canonical?: string) => {
  const location = useLocation();
  const baseUrl = 'https://mixturemarketing.pl';
  let pathname = location.pathname;
  if (pathname !== '/' && !pathname.endsWith('/')) {
    pathname += '/';
  }
  return canonical || `${baseUrl}${pathname}${location.search}`;
};

export const getOgImage = (image?: string) => {
  const baseUrl = 'https://mixturemarketing.pl';
  // Use a dedicated 1200x630 banner for social media as default
  if (!image) return `${baseUrl}/assets/images/og-main.png`;
  return image.startsWith('http') ? image : `${baseUrl}${image}`;
};
