import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home as HomeIcon } from 'lucide-react';
import { BREADCRUMBS_PATH_MAP as pathMap } from '../../config/breadcrumbs';
import Container from './Container';

// Schema BreadcrumbList renderuje Seo.tsx na podstawie prop `breadcrumbs`.
// Komponent jest wylacznie warstwa wizualna - nie emituje wlasnego JSON-LD,
// zeby uniknac duplikatu schema na stronach przekazujacych breadcrumbs do Seo.
interface BreadcrumbsProps {
  /** `dark` — biel na granatowych hero (domyślne szarości znikają na deep-dark). */
  tone?: 'light' | 'dark';
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ tone = 'light' }) => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);
  const dark = tone === 'dark';
  const linkCls = dark ? 'text-white/70 hover:text-white' : 'text-gray-700 hover:text-secondary';
  const crumbCls = dark ? 'text-white/80 hover:text-white' : 'text-gray-800 hover:text-secondary';

  return (
    <>
      <nav
        aria-label="Breadcrumb"
        className={`text-sm font-medium py-4 relative z-20 ${dark ? 'text-white/70' : 'text-gray-700'}`}
      >
        <Container>
          <ol className="flex items-center space-x-2">
            <li>
              <Link to="/" className={`flex items-center transition-colors ${linkCls}`}>
                <HomeIcon size={16} className="mr-1" aria-hidden="true" /> Strona Główna
              </Link>
            </li>
            {pathnames.map((name, index) => {
              const routeTo = `/${pathnames.slice(0, index + 1).join('/')}/`;
              const isLast = index === pathnames.length - 1;
              const displayName = pathMap[routeTo.slice(0, -1)] || name.replace(/-/g, ' ');
              return (
                <li key={name} className="flex items-center">
                  <ChevronRight
                    size={16}
                    className={dark ? 'text-white/50 mx-2' : 'text-gray-600 mx-2'}
                    aria-hidden="true"
                  />
                  {isLast ? (
                    <span
                      className={`font-bold ${dark ? 'text-white' : 'text-gray-800'}`}
                      aria-current="page"
                    >
                      {displayName}
                    </span>
                  ) : (
                    <Link to={routeTo} className={`transition-colors ${crumbCls}`}>
                      {displayName}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </Container>
      </nav>
    </>
  );
};

export default Breadcrumbs;
