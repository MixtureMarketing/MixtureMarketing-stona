import React from 'react';
import {
  Monitor,
  BarChart3,
  Palette,
  ArrowRight,
  Code,
  Megaphone,
  CheckCircle2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import Button from '../common/Button';
import AmbientBackground from '../common/AmbientBackground';
import GlassCard from '../common/GlassCard';

import { SERVICES_CONTENT as CONTENT } from '../../data/content';

const services = [
  {
    ...CONTENT.items[0],
    icon: <Code size={32} className="group-hover:rotate-12 transition-transform duration-500" />,
    visual: (
      <div className="flex gap-2 p-3 bg-gray-900 rounded-lg w-full font-mono text-xxs text-green-400 opacity-80 mt-4 relative overflow-hidden group-hover:opacity-100 transition-opacity">
        <div className="w-1 h-full bg-green-500/20 absolute left-0 top-0 animate-pulse"></div>
        <div>
          <p>
            <span className="text-purple-400">const</span> profit ={' '}
            <span className="text-yellow-400">true</span>;
          </p>
          <p>
            <span className="text-blue-400">while</span>(alive) {'{'}
          </p>
          <p className="pl-2 animate-pulse">buildAwesomeStuff();</p>
          <p>{'}'}</p>
        </div>
      </div>
    ),
  },
  {
    ...CONTENT.items[1],
    icon: (
      <Megaphone
        size={32}
        className="group-hover:-rotate-12 group-hover:scale-110 transition-all duration-500"
      />
    ),
    visual: (
      <div className="flex items-end gap-1.5 h-16 w-full mt-4 px-2 pb-2 border-b border-gray-200">
        {[30, 50, 40, 70, 90].map((h, i) => (
          <div
            key={i}
            className="flex-1 bg-blue-50 rounded-t-sm group-hover:bg-primary transition-all duration-700"
            style={{ height: `${h}%`, transitionDelay: `${i * 100}ms` }}
          ></div>
        ))}
      </div>
    ),
  },
  {
    ...CONTENT.items[2],
    icon: <Palette size={32} className="group-hover:scale-110 transition-transform duration-500" />,
    visual: (
      <div className="grid grid-cols-2 gap-2 mt-4 w-full relative">
        <div className="h-12 bg-gray-100 rounded-lg border border-gray-200 group-hover:border-primary transition-colors"></div>
        <div className="h-12 bg-secondary rounded-lg opacity-80 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all"></div>
        <div className="h-6 bg-primary rounded-lg col-span-2 opacity-60 group-hover:opacity-80 transition-opacity"></div>
      </div>
    ),
  },
];

const Services: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section id="services" className="py-32 relative bg-gray-50 overflow-hidden">
      <AmbientBackground />

      {/* --- PARALLAX BACKGROUND TEXT --- */}
      <div className="absolute top-20 left-0 w-full overflow-hidden pointer-events-none z-0 opacity-5 select-none">
        <div
          className="text-[20vw] font-black text-dark whitespace-nowrap leading-none tracking-tighter"
          style={{ transform: 'translateX(-10%)' }}
        >
          SERVICES
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-2xl">
            <SectionHeader align="left" title={CONTENT.title} description={CONTENT.description} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-stretch">
          {services.map((service, index) => (
            <AnimateOnScroll
              key={index}
              delay={index * 100}
              className={`h-full ${index === 2 ? 'md:col-span-2 lg:col-span-1' : ''}`}
            >
              <GlassCard
                className={`
                    group p-0 overflow-hidden flex flex-col h-full z-10 transition-all duration-500
                    hover:border-primary hover:shadow-2xl hover:-translate-y-2 cursor-pointer
                `}
                onClick={() => navigate(service.path)}
              >
                {/* Card Header with Icon */}
                <div className="p-6 md:p-8 pb-0">
                  <div className="flex justify-between items-start mb-4 md:mb-6">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center bg-gray-50 text-secondary group-hover:bg-secondary group-hover:text-white transition-colors duration-300">
                      {React.cloneElement(service.icon as React.ReactElement<any>, { size: 24 })}
                    </div>
                    <span className="text-xxs md:text-xs font-black uppercase tracking-widest text-gray-600 bg-gray-50 px-3 py-1 rounded-full group-hover:bg-blue-50 group-hover:text-secondary transition-colors">
                      {service.subtitle}
                    </span>
                  </div>

                  <h3 className="text-xl md:text-2xl font-bold mb-3 text-dark">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm mb-6">{service.desc}</p>
                </div>

                {/* Features List */}
                <div className="px-6 md:px-8 pb-6 flex-grow">
                  <ul className="space-y-2 md:space-y-3">
                    {service.features.map((feat, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-3 text-sm font-medium text-gray-600"
                      >
                        <CheckCircle2 size={14} className="text-primary shrink-0" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Visual Footer area */}
                <div className="mt-auto border-t border-gray-100 bg-gray-50/50 p-6 pt-4 group-hover:bg-white transition-colors">
                  {/* Abstract Mini Visualization */}
                  <div className="mb-4 opacity-50 group-hover:opacity-100 transition-opacity grayscale group-hover:grayscale-0">
                    {service.visual}
                  </div>

                  <Button
                    variant="ghost"
                    className="w-full justify-between group-hover:bg-blue-50 group-hover:text-secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(service.path);
                    }}
                  >
                    <span>{service.button}</span>
                    <ArrowRight
                      size={18}
                      className="transform group-hover:translate-x-1 transition-transform"
                    />
                  </Button>
                </div>
              </GlassCard>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
