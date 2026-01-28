/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PortableText, PortableTextComponents } from '@portabletext/react';
import { cmsService } from '@/services/cmsService';
import { SanityCaseStudy } from '@/types';
import { SanityImage } from '@/types/sanity';
import Seo from '@/components/common/Seo';
import NotFound from '@/components/common/NotFound';
import AuditTeaser from '@/components/features/audit/AuditTeaser';
import Button from '@/components/common/Button';
import {
  Calendar,
  User,
  ArrowRight,
  ExternalLink,
  Code2,
  Cpu,
  BarChart3,
  PenTool,
  CheckCircle2,
  Download,
  Zap,
  Server,
  ShoppingBag,
  MapPin,
  CreditCard,
  Layout,
  Box,
  Globe,
  Database,
  Terminal,
  Smartphone,
  Facebook,
  Linkedin,
  Instagram,
  Youtube,
  Megaphone,
  LineChart,
  X,
  Maximize2,
} from 'lucide-react';
import {
  motion,
  AnimatePresence,
  useInView,
  useSpring,
  useTransform,
  useScroll,
} from 'framer-motion';
import imageUrlBuilder from '@sanity/image-url';
import { client } from '@/services/cmsService';
import RelatedArticles from '../articles/RelatedArticles';
import LazyHydrate from '../common/LazyHydrate';

const builder = imageUrlBuilder(client);
function urlFor(source: any) {
  return builder.image(source);
}

// --- UTILS ---
const CountUp = ({ value, label }: { value: string; label: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  // Extract number if present
  const numberMatch = value.match(/[\d.]+/);
  const numericValue = numberMatch ? parseFloat(numberMatch[0]) : 0;
  const suffix = value.replace(/[\d.]/, ''); // Simple suffix extraction, might need refinement

  // We'll just display the string for now to support complex formats like "+120%"
  // but animate the container opacity/y

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="bg-white/50 backdrop-blur-sm border border-white/50 p-6 rounded-2xl text-center relative group overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative z-10">
        <div className="text-4xl md:text-5xl font-black text-dark mb-2 bg-clip-text text-transparent bg-gradient-to-r from-dark to-secondary">
          {value}
        </div>
        <div className="text-xs font-bold uppercase tracking-widest text-gray-500">{label}</div>
      </div>
    </motion.div>
  );
};

// Icon mapping helper
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

const CaseStudyTemplate = () => {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<SanityCaseStudy | null>(null);
  const [nextProject, setNextProject] = useState<SanityCaseStudy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeAsset, setActiveAsset] = useState<{ asset: SanityImage; caption?: string } | null>(
    null,
  );
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        // Parallel fetch: Current project + All projects (for next link)
        const [current, all] = await Promise.all([
          cmsService.getCaseStudyBySlug(slug),
          cmsService.getCaseStudies(), // Lightweight list
        ]);

        if (current) {
          setProject(current);

          // Find next project
          const currentIndex = all.findIndex((p) => p.slug === slug);
          if (currentIndex !== -1 && currentIndex < all.length - 1) {
            setNextProject(all[currentIndex + 1]);
          } else if (all.length > 0 && all[0].slug !== slug) {
            // Loop back to start if it's the last one, or just pick first distinct
            setNextProject(all[0]);
          } else {
            setNextProject(null);
          }
        } else {
          setError(true);
        }
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-dark"></div>
      </div>
    );
  }

  if (error || !project) return <NotFound />;

  const isWeb = project.category === 'web';
  const isMarketing = project.category === 'marketing';
  const isDesign = project.category === 'design';

  // Portable Text Components
  const ptComponents: PortableTextComponents = {
    block: {
      h3: ({ children }: { children?: React.ReactNode }) => (
        <h3 className="text-2xl md:text-3xl font-bold mt-12 mb-6 tracking-tight">{children}</h3>
      ),
      normal: ({ children }: { children?: React.ReactNode }) => (
        <p className="mb-6 text-lg md:text-xl leading-relaxed font-light opacity-90">{children}</p>
      ),
      blockquote: ({ children }: { children?: React.ReactNode }) => (
        <blockquote className="border-l-4 border-primary pl-6 py-4 my-10 italic text-xl md:text-2xl bg-white/5 p-6 rounded-r-2xl">
          {children}
        </blockquote>
      ),
    },
    list: {
      bullet: ({ children }: { children?: React.ReactNode }) => (
        <ul className="list-none space-y-4 mb-10">
          {React.Children.map(children, (child) => (
            <li className="flex gap-4 items-start text-lg">
              <CheckCircle2 size={24} className="text-success shrink-0 mt-1" />
              <span>{child}</span>
            </li>
          ))}
        </ul>
      ),
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 text-dark selection:bg-primary selection:text-white">
      <Seo
        title={`${project.title} - Case Study Mixture Marketing`}
        description={project.excerpt || `Zobacz realizację dla klienta ${project.client}`}
        lcpImage={project.mainImage ? urlFor(project.mainImage).width(1200).url() : undefined}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: project.title,
          image: project.mainImage ? [urlFor(project.mainImage).width(1200).url()] : [],
          datePublished: project.date,
          author: {
            '@type': 'Organization',
            name: 'Mixture Marketing',
          },
          publisher: {
            '@type': 'Organization',
            name: 'Mixture Marketing',
            logo: {
              '@type': 'ImageObject',
              url: 'https://mixturemarketing.pl/assets/images/sygnet.png',
            },
          },
          description: project.excerpt,
        }}
      />

      {/* --- ASSET MODAL --- */}
      <AnimatePresence>
        {activeAsset && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-xl overflow-y-auto cursor-zoom-out"
            onClick={() => setActiveAsset(null)}
          >
            <div className="min-h-screen w-full flex flex-col items-center justify-center py-10 px-4">
              <button
                onClick={() => setActiveAsset(null)}
                className="fixed top-6 right-6 z-[1010] p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-md border border-white/10"
              >
                <X size={24} />
              </button>

              <motion.div
                initial={{ scale: 0.9, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 50 }}
                className="w-full max-w-6xl bg-white rounded-lg overflow-hidden shadow-2xl relative cursor-default"
                onClick={(e) => e.stopPropagation()}
              >
                {activeAsset.caption && (
                  <div className="bg-dark text-white p-4 text-center font-bold text-sm">
                    {activeAsset.caption}
                  </div>
                )}
                <img
                  src={urlFor(activeAsset.asset).width(1920).url()}
                  alt={activeAsset.caption || 'Design Preview'}
                  className="w-full h-auto block"
                />
              </motion.div>
              <p className="mt-8 text-white/50 text-xs font-bold uppercase tracking-[0.2em]">
                Przewiń aby zobaczyć całość
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- HERO SECTION (Text Separate from Image) --- */}
      <header className="pt-32 pb-12 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="max-w-5xl mx-auto text-center mb-16"
          >
            {/* Category Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 text-dark text-xs font-bold uppercase tracking-widest mb-8 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              {project.category} / {project.subcategory?.[0] || 'Realizacja'}
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-dark mb-8 leading-tight">
              {project.title}
            </h1>

            {/* Excerpt */}
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto font-light leading-relaxed mb-10">
              {project.excerpt}
            </p>

            {/* Meta Data (Client & Date) */}
            <div className="inline-flex flex-wrap justify-center gap-6 bg-white p-2 pr-6 rounded-full shadow-lg border border-gray-100">
              {project.client && (
                <div className="flex items-center gap-3 pl-2">
                  {project.clientLogo ? (
                    <div className="w-10 h-10 rounded-full bg-white p-1 shadow-sm overflow-hidden border border-gray-100">
                      <img
                        src={urlFor(project.clientLogo).width(64).url()}
                        alt={project.client}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-dark text-white flex items-center justify-center">
                      <User size={18} />
                    </div>
                  )}
                  <span className="font-bold text-dark">{project.client}</span>
                </div>
              )}
              <div className="w-px h-10 bg-gray-200 hidden sm:block"></div>
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                <Calendar size={16} /> {project.date || '2024'}
              </div>
            </div>
          </motion.div>

          {/* MAIN IMAGE (Separate) */}
          {project.mainImage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-[1600px] mx-auto rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white"
            >
              <img
                src={urlFor(project.mainImage).width(1600).url()}
                alt={project.title}
                className="w-full h-auto object-cover"
                fetchPriority="high"
              />
            </motion.div>
          )}
        </div>
      </header>

      {/* --- CONTENT GRID --- */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pb-32 relative z-20 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          {/* LEFT: STORY & CONTENT */}
          <div className="lg:col-span-8">
            {/* Challenge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-gray-200/50 mb-12 border border-white"
            >
              <div className="flex items-center gap-4 mb-8">
                <span className="text-6xl font-black text-gray-100 select-none">01</span>
                <h2 className="text-2xl font-bold text-dark uppercase tracking-wider">Wyzwanie</h2>
              </div>
              {project.challenge && (
                <div className="prose prose-lg prose-slate max-w-none">
                  <PortableText value={project.challenge} components={ptComponents} />
                </div>
              )}
            </motion.div>

            {/* KPI SECTION (Marketing) */}
            {isMarketing && project.kpi && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12">
                {project.kpi.map((k, i) => (
                  <CountUp key={i} value={k.value} label={k.label} />
                ))}
              </div>
            )}

            {/* Solution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <div className="flex items-center gap-4 mb-8">
                <span className="text-6xl font-black text-gray-200 select-none">02</span>
                <h2 className="text-2xl font-bold text-dark uppercase tracking-wider">
                  Rozwiązanie
                </h2>
              </div>
              {project.solution && (
                <div className="prose prose-lg prose-slate max-w-none text-gray-600">
                  <PortableText value={project.solution} components={ptComponents} />
                </div>
              )}
            </motion.div>

            {/* GALLERY GRID */}
            {project.gallery && project.gallery.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-16">
                {project.gallery.map((img: SanityImage, i: number) => (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    key={i}
                    className={`rounded-3xl overflow-hidden shadow-lg cursor-pointer group ${
                      i % 3 === 0 ? 'md:col-span-2' : ''
                    }`}
                    onClick={() => setActiveAsset({ asset: img })}
                  >
                    <div className="overflow-hidden relative">
                      <img
                        src={urlFor(img).width(1200).url()}
                        alt={`Galeria ${i}`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Maximize2 className="text-white drop-shadow-md" size={32} />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Result */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-dark text-white rounded-[2.5rem] p-8 md:p-12 shadow-xl mb-12 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-secondary rounded-full blur-[100px] opacity-50 -mr-20 -mt-20"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <span className="text-6xl font-black text-white/10 select-none">03</span>
                  <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Efekt</h2>
                </div>
                {project.result && (
                  <div className="prose prose-lg prose-invert max-w-none text-white">
                    <PortableText value={project.result} components={ptComponents} />
                  </div>
                )}
              </div>
            </motion.div>

            {/* Design Assets */}
            {project.designAssets && project.designAssets.length > 0 && (
              <div className="mt-20">
                <h3 className="text-3xl font-black text-dark mb-10 text-center">
                  Materiały Graficzne
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {project.designAssets.map((item, i) => (
                    <div
                      key={i}
                      className="group relative rounded-3xl overflow-hidden shadow-xl cursor-pointer bg-white border border-gray-100 transition-all hover:-translate-y-2 aspect-[3/4]"
                      onClick={() => setActiveAsset(item)}
                    >
                      <div className="w-full h-full overflow-hidden relative">
                        <img
                          src={urlFor(item.asset).width(1000).url()}
                          alt={item.caption || 'Design Asset'}
                          className="w-full h-full object-cover object-top transition-transform duration-[2s] ease-in-out group-hover:scale-105"
                        />
                        {/* Gradient Overlay at bottom to indicate cut-off */}
                        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                      </div>

                      <div className="absolute inset-0 bg-gradient-to-t from-dark via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-8">
                        <p className="text-white font-bold text-lg flex items-center gap-2">
                          <Maximize2 size={20} /> Zobacz w pełnej rozdzielczości
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: SIDEBAR (SPECS) */}
          <aside className="lg:col-span-4">
            <div className="sticky top-28 space-y-8">
              {/* INFO CARD */}
              <div className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100">
                <h3 className="text-lg font-black text-dark uppercase tracking-widest mb-8 border-b border-gray-100 pb-4">
                  Specyfikacja
                </h3>

                {/* WEB SPECS */}
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
                        <p className="text-xs font-bold text-gray-400 uppercase mb-3">
                          Technologie
                        </p>
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

                {/* DESIGN SPECS */}
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

                {/* MARKETING SPECS */}
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

              {/* TEAM CREDITS */}
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
        </div>
      </main>

      {/* Related Content (Articles & Other Case Studies) */}
      <LazyHydrate minHeight="400px">
        <RelatedArticles currentSlug={slug || ''} category={project.category} />
      </LazyHydrate>

      {/* --- NEXT PROJECT NAVIGATION --- */}
      {nextProject && (
        <section
          className="bg-dark py-24 relative overflow-hidden group cursor-pointer"
          onClick={() => navigate(`/portfolio/${nextProject.slug}`)}
        >
          {/* Bg Image Overlay */}
          {nextProject.mainImage && (
            <div className="absolute inset-0 opacity-20 group-hover:opacity-10 transition-opacity duration-700">
              <img
                src={urlFor(nextProject.mainImage).width(1920).url()}
                alt=""
                className="w-full h-full object-cover grayscale mix-blend-multiply"
              />
            </div>
          )}

          <div className="container mx-auto px-4 relative z-10 text-center">
            <p className="text-white/60 text-sm font-bold uppercase tracking-[0.3em] mb-4">
              Następny Projekt
            </p>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 group-hover:scale-105 transition-transform duration-500">
              {nextProject.title}
            </h2>
            <div className="inline-flex items-center gap-3 px-8 py-4 bg-white text-dark rounded-full font-bold text-lg group-hover:bg-primary group-hover:text-white transition-colors">
              Zobacz Case Study <ArrowRight size={20} />
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default CaseStudyTemplate;
