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
  if (!image) return `${baseUrl}/assets/images/sygnet.png`;
  return image.startsWith('http') ? image : `${baseUrl}${image}`;
};
