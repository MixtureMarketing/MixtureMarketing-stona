import React from 'react';
import { motion } from 'framer-motion';
import { PortableText, PortableTextComponents } from '@portabletext/react';
import { CheckCircle2, Maximize2 } from 'lucide-react';
import { SanityCaseStudy } from '@/types';
import { SanityImage } from '@/types/sanity';
import CaseStudyStats from './CaseStudyStats';
import CaseStudyGallery from './CaseStudyGallery';
import imageUrlBuilder from '@sanity/image-url';
import { client } from '@/services/cmsService';

const builder = imageUrlBuilder(client);
function urlFor(source: SanityImage) {
  return builder.image(source);
}

interface CaseStudyContentProps {
  project: SanityCaseStudy;
  onAssetClick: (asset: { asset: SanityImage; caption?: string }) => void;
}

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

const CaseStudyContent: React.FC<CaseStudyContentProps> = ({ project, onAssetClick }) => {
  const isMarketing = project.category === 'marketing';

  return (
    <div className="lg:col-span-8">
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

      {isMarketing && project.kpi && <CaseStudyStats stats={project.kpi} />}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-12"
      >
        <div className="flex items-center gap-4 mb-8">
          <span className="text-6xl font-black text-gray-200 select-none">02</span>
          <h2 className="text-2xl font-bold text-dark uppercase tracking-wider">Rozwiązanie</h2>
        </div>
        {project.solution && (
          <div className="prose prose-lg prose-slate max-w-none text-gray-600">
            <PortableText value={project.solution} components={ptComponents} />
          </div>
        )}
      </motion.div>

      {project.gallery && project.gallery.length > 0 && (
        <CaseStudyGallery
          gallery={project.gallery}
          onAssetClick={(asset) => onAssetClick({ asset })}
        />
      )}

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

      {project.designAssets && project.designAssets.length > 0 && (
        <div className="mt-20">
          <h3 className="text-3xl font-black text-dark mb-10 text-center">Materiały Graficzne</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {project.designAssets.map((item, i) => (
              <div
                key={i}
                className="group relative rounded-3xl overflow-hidden shadow-xl cursor-pointer bg-white border border-gray-100 transition-all hover:-translate-y-2 aspect-[3/4]"
                onClick={() => onAssetClick(item)}
              >
                <div className="w-full h-full overflow-hidden relative">
                  <img
                    src={urlFor(item.asset).width(1000).url()}
                    alt={item.caption || 'Design Asset'}
                    className="w-full h-full object-cover object-top transition-transform duration-[2s] ease-in-out group-hover:scale-105"
                  />
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
  );
};

export default CaseStudyContent;
