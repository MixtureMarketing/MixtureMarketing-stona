/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import {
  Star,
  Quote,
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  Users,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import GlassCard from '../common/GlassCard';
import Image from '../common/Image';

import { CLIENTS_CONTENT as CONTENT } from '../../data/content';

const testimonials = [
  {
    ...CONTENT.testimonials[0],
    id: 1,
    metricIcon: <TrendingUp size={20} />,
  },
  {
    ...CONTENT.testimonials[1],
    id: 2,
    metricIcon: <Users size={20} />,
  },
  {
    ...CONTENT.testimonials[2],
    id: 3,
    metricIcon: <CheckCircle2 size={20} />,
  },
];

const Clients: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
      setIsAnimating(false);
    }, 300);
  };

  const handlePrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setActiveIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
      setIsAnimating(false);
    }, 300);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 8000);
    return () => clearInterval(interval);
  }, [activeIndex]);

  const activeTestimonial = testimonials[activeIndex];

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
      <div className="absolute -left-20 top-40 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"></div>
      <div className="absolute right-0 bottom-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl"></div>

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* LEFT COLUMN: Header & Nav */}
          <div className="lg:col-span-5">
            <AnimateOnScroll>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0F7FF] text-dark text-xs font-bold uppercase tracking-wider mb-6">
                <Star size={14} className="text-[#F4B400]" fill="currentColor" /> {CONTENT.badge}
              </div>
              <SectionHeader
                align="left"
                title={CONTENT.title}
                description={CONTENT.description}
                className="mb-8"
              />

              <div className="flex gap-4">
                <button
                  onClick={handlePrev}
                  className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center text-gray-700 hover:border-secondary hover:text-secondary hover:bg-white transition-all active:scale-95"
                  aria-label="Poprzednia opinia"
                >
                  <ArrowLeft size={20} />
                </button>
                <button
                  onClick={handleNext}
                  className="w-12 h-12 rounded-full bg-dark text-white flex items-center justify-center hover:bg-secondary shadow-lg shadow-secondary/20 transition-all active:scale-95"
                  aria-label="Następna opinia"
                >
                  <ArrowRight size={20} />
                </button>
              </div>
            </AnimateOnScroll>
          </div>

          {/* RIGHT COLUMN: Dynamic Card */}
          <div className="lg:col-span-7">
            <AnimateOnScroll delay={200}>
              <div
                className={`transition-opacity duration-300 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
              >
                <GlassCard className="p-8 md:p-10 border-t-4 border-t-[#61B6DE] relative">
                  {/* Giant Quote Mark */}
                  <div className="absolute top-4 right-8 text-[#E0EFFF] opacity-50">
                    <Quote size={80} fill="currentColor" />
                  </div>

                  <div className="relative z-10">
                    {/* Problem / Solution Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-sm">
                      <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                        <div className="text-red-500 font-bold text-xs uppercase tracking-wider mb-1 flex items-center gap-2">
                          {CONTENT.labels.challenge}
                        </div>
                        <p className="text-gray-700 leading-snug">{activeTestimonial.challenge}</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                        <div className="text-green-600 font-bold text-xs uppercase tracking-wider mb-1 flex items-center gap-2">
                          {CONTENT.labels.solution}
                        </div>
                        <p className="text-gray-700 leading-snug">{activeTestimonial.solution}</p>
                      </div>
                    </div>

                    {/* Main Quote */}
                    <blockquote className="text-xl md:text-2xl font-medium text-dark mb-8 leading-relaxed">
                      "{activeTestimonial.quote}"
                    </blockquote>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-t border-gray-100 pt-6">
                      {/* Author Info */}
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-dark to-secondary flex items-center justify-center text-white font-bold text-lg shadow-md shrink-0">
                          {activeTestimonial.author.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-dark text-sm md:text-base">
                            {activeTestimonial.author}
                          </div>
                          <div className="text-xxs md:text-xs text-gray-700">
                            {activeTestimonial.role}
                          </div>
                          <div className="text-xxs md:text-xs font-bold text-primary">
                            {activeTestimonial.company}
                          </div>
                        </div>
                      </div>

                      {/* Key Metric Badge */}
                      <div className="bg-dark text-white px-4 py-2.5 md:px-5 md:py-3 rounded-xl shadow-lg flex items-center gap-3 md:gap-4 w-full md:w-auto">
                        <div className="p-1.5 md:p-2 bg-white/10 rounded-lg text-primary shrink-0">
                          {React.cloneElement(
                            activeTestimonial.metricIcon as React.ReactElement<any>,
                            {
                              size: 18,
                              className: 'text-primary',
                            },
                          )}
                        </div>
                        <div>
                          <div className="text-lg md:text-xl font-bold leading-none mb-1">
                            {activeTestimonial.result}
                          </div>
                          <div className="text-xxs md:text-xxs text-gray-300 uppercase tracking-widest leading-none">
                            {activeTestimonial.resultDesc}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </AnimateOnScroll>
          </div>
        </div>

        {/* Client Logos Strip */}
        <div className="mt-20 pt-10 border-t border-gray-100">
          <h3 className="sr-only">{CONTENT.labels.trusted}</h3>
          <ul className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-60 grayscale transition-all duration-500 hover:grayscale-0 hover:opacity-80 list-none p-0">
            <li>
              <Image
                src="https://via.placeholder.com/150x40?text=ALPHATECH"
                alt="Logo klienta AlphaTech"
                width={150}
                height={40}
                className="h-8 w-auto"
              />
            </li>
            <li>
              <Image
                src="https://via.placeholder.com/150x40?text=OMEGA+GROUP"
                alt="Logo klienta Omega Group"
                width={150}
                height={40}
                className="h-8 w-auto"
              />
            </li>
            <li>
              <Image
                src="https://via.placeholder.com/150x40?text=NEXTGEN"
                alt="Logo klienta NextGen"
                width={150}
                height={40}
                className="h-8 w-auto"
              />
            </li>
            <li>
              <Image
                src="https://via.placeholder.com/150x40?text=SOLARIUS"
                alt="Logo klienta Solarius"
                width={150}
                height={40}
                className="h-8 w-auto"
              />
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default Clients;
