import React, { useState } from 'react';
import { ExternalLink, TrendingUp, Users, Clock, ArrowRight, Filter } from 'lucide-react';
import { COLORS } from '../../types';
import AnimateOnScroll from '../common/AnimateOnScroll';
import GlassCard from '../common/GlassCard';
import Button from '../common/Button';
import Image from '../common/Image';
import { PORTFOLIO_CONTENT as CONTENT } from '../../data/content';

const iconMap: Record<string, React.ReactNode> = {
  TrendingUp: <TrendingUp size={16} />,
  Clock: <Clock size={16} />,
  Users: <Users size={16} />,
};

const Portfolio: React.FC = () => {
  const [filter, setFilter] = useState('all');

  const filteredProjects =
    filter === 'all' ? CONTENT.projects : CONTENT.projects.filter((p) => p.type === filter);

  return (
    <section id="portfolio" className="py-24 bg-[#F9FAFB]">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8">
          <div className="max-w-2xl">
            <AnimateOnScroll>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-secondary text-xs font-bold uppercase tracking-wider mb-4">
                {CONTENT.hero.badge}
              </div>
              <h2
                className="text-3xl md:text-4xl font-bold mb-4"
                style={{ color: COLORS.secondary }}
              >
                {CONTENT.hero.title}
              </h2>
              <p className="text-gray-600 text-lg">{CONTENT.hero.description}</p>
            </AnimateOnScroll>
          </div>

          <div className="flex flex-wrap gap-2 md:mb-1">
            {CONTENT.filters.map((btn) => (
              <button
                key={btn.id}
                onClick={() => setFilter(btn.id)}
                className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                  filter === btn.id
                    ? 'bg-dark text-white shadow-md'
                    : 'bg-white text-gray-600 border border-gray-100 hover:border-primary hover:text-dark'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-all duration-500">
          {filteredProjects.map((project, index) => (
            <AnimateOnScroll key={project.title} delay={index * 100}>
              <GlassCard className="overflow-hidden h-full group p-0 border-0 hover:shadow-[0_20px_50px_rgba(97,182,222,0.15)] transition-all duration-500 flex flex-col relative">
                {/* Inner Glow Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-secondary/0 group-hover:from-primary/5 group-hover:to-secondary/5 pointer-events-none transition-all duration-500"></div>

                <div className="relative h-64 overflow-hidden">
                  <div className="absolute inset-0 bg-dark/40 group-hover:bg-dark/10 transition-colors duration-500 z-10"></div>

                  {/* Floating Metric Badge */}
                  <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-md px-4 py-2 rounded-lg shadow-lg flex items-center gap-3 transform translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-secondary">
                      {iconMap[project.metricIcon]}
                    </div>
                    <div>
                      <p className="text-lg font-bold text-dark leading-none">
                        {project.metric}
                      </p>
                      <p className="text-xxs text-gray-700 font-bold uppercase">
                        {project.metricLabel}
                      </p>
                    </div>
                  </div>

                  <Image
                    src={project.image}
                    alt={project.altText}
                    width={600}
                    height={400}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out grayscale-[20%] group-hover:grayscale-0"
                  />
                </div>

                <div className="p-8 relative flex-grow flex flex-col">
                  {/* Decorative line */}
                  <div className="absolute top-0 left-0 w-0 h-1 bg-primary group-hover:w-full transition-all duration-500"></div>

                  <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2">
                    {project.category}
                  </p>
                  <h3 className="text-xl font-bold mb-3 text-dark">{project.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-grow">
                    {project.description}
                  </p>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-600">
                      {CONTENT.card.businessResult}
                    </span>
                    <span className="text-secondary font-bold text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform cursor-pointer">
                      {CONTENT.card.details} <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </GlassCard>
            </AnimateOnScroll>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Button
            variant="ghost"
            href="#contact"
            className="hover:bg-white border-transparent hover:border-gray-200"
          >
            {CONTENT.cta.button} <ArrowRight size={18} className="ml-2 animate-bounce-x" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Portfolio;
