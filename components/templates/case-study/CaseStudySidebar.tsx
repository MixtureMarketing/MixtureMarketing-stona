import React from 'react';
import {
  ExternalLink,
  Code2,
  Cpu,
  PenTool,
  Zap,
  Server,
  ShoppingBag,
  MapPin,
  CreditCard,
  Layout,
  Globe,
  Database,
  Terminal,
  LineChart,
  Download,
} from 'lucide-react';
import { SanityCaseStudy } from '@/types';
import { SanityImage } from '@/types/sanity';
import AuditTeaser from '@/components/features/audit/AuditTeaser';
import imageUrlBuilder from '@sanity/image-url';
import { client } from '@/services/cmsService';

const builder = imageUrlBuilder(client);
function urlFor(source: SanityImage) {
  return builder.image(source);
}

const getIconForTech = (name: string) => {
  const normalized = name.toLowerCase();
  if (normalized.includes('react') || normalized.includes('next')) return <Code2 size={16} />;
  if (normalized.includes('vue')) return <Code2 size={16} />;
  if (normalized.includes('type')) return <Terminal size={16} />;
  if (normalized.includes('css') || normalized.includes('tailwind')) return <Layout size={16} />;
  if (normalized.includes('cms') || normalized.includes('word') || normalized.includes('sanity'))
    return <Database size={16} />;
  if (normalized.includes('shop')) return <ShoppingBag size={16} />;
  if (normalized.includes('php') || normalized.includes('lara')) return <Server size={16} />;
  if (normalized.includes('node') || normalized.includes('go')) return <Cpu size={16} />;
  if (normalized.includes('stripe') || normalized.includes('pay')) return <CreditCard size={16} />;
  if (normalized.includes('google') || normalized.includes('map')) return <MapPin size={16} />;
  if (normalized.includes('analy')) return <LineChart size={16} />;

  return <Zap size={16} />;
};

interface CaseStudySidebarProps {
  project: SanityCaseStudy;
}

const CaseStudySidebar: React.FC<CaseStudySidebarProps> = ({ project }) => {
  const isWeb = project.category === 'web';
  const isMarketing = project.category === 'marketing';
  const isDesign = project.category === 'design';

  return (
    <aside className="lg:col-span-4">
      <div className="sticky top-28 space-y-8">
        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100">
          <h3 className="text-lg font-black text-dark uppercase tracking-widest mb-8 border-b border-gray-100 pb-4">
            Specyfikacja
          </h3>

          {isWeb && (
            <div className="space-y-8">
              {project.websiteUrl && (
                <a
                  href={project.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative block w-full overflow-hidden rounded-xl bg-dark text-white p-4 text-center font-bold hover:shadow-lg hover:shadow-blue-900/20 transition-all"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Zobacz Online <ExternalLink size={18} />
                  </span>
                  <div className="absolute inset-0 bg-secondary translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </a>
              )}

              {project.performanceScore && (
                <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-4">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-gray-200"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                      />
                      <path
                        className="text-green-500 drop-shadow-sm"
                        strokeDasharray={`${project.performanceScore}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                      />
                    </svg>
                    <span className="absolute text-lg font-black text-green-600">
                      {project.performanceScore}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-dark">PageSpeed Insights</p>
                    <p className="text-xs text-gray-500">Wydajność Mobile</p>
                  </div>
                </div>
              )}

              {project.techStack && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-3">Technologie</p>
                  <div className="flex flex-wrap gap-2">
                    {project.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold border border-blue-100"
                      >
                        {getIconForTech(tech)} {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {project.integrations && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-3">Integracje</p>
                  <div className="flex flex-wrap gap-2">
                    {project.integrations.map((tech) => (
                      <span
                        key={tech}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-100"
                      >
                        {getIconForTech(tech)} {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {isDesign && (
            <div className="space-y-6">
              {project.tools && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-3">Narzędzia</p>
                  <div className="flex flex-wrap gap-2">
                    {project.tools.map((t) => (
                      <span
                        key={t}
                        className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-xs font-bold border border-purple-100 flex items-center gap-1.5"
                      >
                        <PenTool size={14} /> {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {project.typography && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-3">Typografia</p>
                  <div className="text-sm font-medium text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    {project.typography}
                  </div>
                </div>
              )}
              {project.downloads && (
                <div className="pt-6 border-t border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-3">
                    Pliki do pobrania
                  </p>
                  <div className="space-y-3">
                    {project.downloads.map((file, i) => (
                      <a
                        key={i}
                        href={file.asset.url}
                        target="_blank"
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                        rel="noreferrer"
                      >
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-secondary shadow-sm">
                          <Download size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-dark group-hover:text-secondary transition-colors">
                            {file.description || 'Pobierz'}
                          </p>
                          <p className="text-xxs text-gray-400">PDF Document</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {isMarketing && project.platforms && (
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase mb-3">Platformy</p>
              <div className="flex flex-wrap gap-2">
                {project.platforms.map((p) => (
                  <span
                    key={p}
                    className="px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg text-xs font-bold border border-orange-100 flex items-center gap-1.5"
                  >
                    <Globe size={14} /> {p}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {project.credits && project.credits.length > 0 && (
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">
              Zespół Projektowy
            </h4>
            <div className="space-y-4">
              {project.credits.map((person) => (
                <div key={person._id} className="flex items-center gap-3 group">
                  {person.image ? (
                    <img
                      src={urlFor(person.image).width(100).height(100).url()}
                      alt={person.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md grayscale group-hover:grayscale-0 transition-all"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-sm">
                      {person.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-dark">{person.name}</p>
                    <p className="text-xs text-gray-500">{person.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <AuditTeaser
          layout="compact"
          variant="light"
          buttonText="Analizuj stronę"
          placeholder="Wpisz adres www..."
        />
      </div>
    </aside>
  );
};

export default CaseStudySidebar;
