import React from 'react';
import { CheckCircle2, MapPin, Navigation } from 'lucide-react';
import AnimateOnScroll from '../../common/AnimateOnScroll';
import SectionHeader from '../../common/SectionHeader';
import SectionWrapper from '../../common/SectionWrapper';
import { SEO_CONTENT as CONTENT } from '../../../data/content';

const SeoLocalSection: React.FC = () => {
  return (
    <SectionWrapper variant="white">
      <div className="flex flex-col lg:flex-row gap-16 items-center">
        <div className="lg:w-1/2">
          <SectionHeader
            align="left"
            title={CONTENT.localSeo.title}
            description={CONTENT.localSeo.description}
          />
          <ul className="space-y-4 mt-8">
            <li className="flex items-center gap-3">
              <MapPin size={20} className="text-success" />
              <span className="font-medium text-gray-700">{CONTENT.localSeo.items[0]}</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 size={20} className="text-success" />
              <span className="font-medium text-gray-700">{CONTENT.localSeo.items[1]}</span>
            </li>
            <li className="flex items-center gap-3">
              <Navigation size={20} className="text-success" />
              <span className="font-medium text-gray-700">{CONTENT.localSeo.items[2]}</span>
            </li>
          </ul>
        </div>

        <div className="lg:w-1/2 w-full flex justify-center">
          <AnimateOnScroll delay={200}>
            <div className="bg-[#F8F9FA] p-4 rounded-2xl shadow-xl border border-gray-200 w-full max-w-sm relative overflow-hidden">
              <div className="bg-[#E5E7EB] w-full h-48 rounded-xl mb-4 relative overflow-hidden">
                <div
                  className="absolute inset-0 opacity-50"
                  style={{
                    backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)',
                    backgroundSize: '10px 10px',
                  }}
                ></div>

                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-success drop-shadow-lg animate-bounce">
                  <MapPin size={40} fill="currentColor" />
                </div>
                <div className="absolute top-1/3 left-1/4 text-gray-600">
                  <MapPin size={24} />
                </div>
                <div className="absolute bottom-1/3 right-1/4 text-gray-600">
                  <MapPin size={24} />
                </div>

                <div
                  className="absolute top-10 left-1/2 ml-4 bg-white p-2 rounded shadow-lg flex items-center gap-1 animate-fade-in-up"
                  style={{ animationDelay: '1s' }}
                >
                  <div className="flex text-[#F4B400] text-xxs">★★★★★</div>
                  <span className="text-xxs font-bold text-gray-600">(142)</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-white rounded-lg border border-success shadow-sm flex gap-3 items-center">
                  <div className="w-10 h-10 bg-success rounded text-white flex items-center justify-center font-bold">
                    TY
                  </div>
                  <div>
                    <div className="font-bold text-dark text-sm">Twoja Firma</div>
                    <div className="flex text-[#F4B400] text-xxs">★★★★★ (142)</div>
                  </div>
                </div>
                <div className="p-2 opacity-50 flex gap-3 items-center">
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                  <div className="h-2 w-32 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default SeoLocalSection;
