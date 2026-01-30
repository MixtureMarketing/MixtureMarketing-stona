import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

interface FooterLinksProps {
  title: string;
  links: { label: string; path: string; type?: string }[];
  showSparkles?: boolean;
  showCalculator?: boolean;
  onScroll?: (id: string) => void;
}

const FooterLinks: React.FC<FooterLinksProps> = ({
  title,
  links,
  showSparkles,
  showCalculator,
  onScroll,
}) => {
  return (
    <div className="lg:col-span-2">
      <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white mb-8 flex items-center gap-2">
        {showSparkles && <Sparkles size={14} className="text-primary" />} {title}
      </h3>
      <ul className="space-y-4 text-gray-300 text-sm font-medium">
        {links.map((link, i) => (
          <li key={i}>
            {link.type === 'scroll' ? (
              <button
                onClick={() => onScroll?.(link.path)}
                className="hover:text-white transition-colors text-left"
              >
                {link.label}
              </button>
            ) : (
              <Link
                to={link.path}
                className="hover:text-white transition-colors flex items-center gap-2 group"
              >
                {showSparkles && (
                  <ArrowRight
                    size={12}
                    className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all"
                  />
                )}
                {link.label}
              </Link>
            )}
          </li>
        ))}
        {showCalculator && (
          <li>
            <Link
              to="/offers#calculator"
              className="hover:text-white transition-colors flex items-center gap-2 group"
            >
              <ArrowRight
                size={12}
                className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all"
              />
              Kalkulator Wycen
            </Link>
          </li>
        )}
      </ul>
    </div>
  );
};

export default FooterLinks;
