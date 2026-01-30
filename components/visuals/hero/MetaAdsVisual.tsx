import React from 'react';
import { Heart, MessageSquare, Share2 } from 'lucide-react';

export const MetaAdsHeroVisual: React.FC = () => {
  return (
    <div className="w-full relative h-[500px] flex justify-center items-center overflow-hidden mask-fade-y">
      <div className="absolute inset-0 bg-gradient-to-t from-light-gray via-transparent to-light-gray z-10 pointer-events-none"></div>

      <div className="w-[320px] relative animate-infinite-scroll-y opacity-80 hover:opacity-100 transition-opacity duration-500">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="mb-6 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transform transition-transform hover:scale-[1.02]"
          >
            <div className="flex items-center gap-3 p-3">
              <div className="w-8 h-8 bg-gradient-to-tr from-yellow-400 to-purple-600 rounded-full p-[2px]">
                <div className="w-full h-full bg-white rounded-full border-2 border-transparent overflow-hidden">
                  <div className="w-full h-full bg-gray-200"></div>
                </div>
              </div>
              <div>
                <div className="h-2 w-24 bg-gray-800 rounded mb-1"></div>
                <div className="h-1.5 w-12 bg-gray-300 rounded"></div>
              </div>
            </div>
            <div className="h-48 bg-gray-100 relative">
              {item === 2 ? (
                <div className="absolute inset-0 flex items-center justify-center bg-instagram/10 text-instagram font-bold">
                  REKLAMA WIDEO
                </div>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200"></div>
              )}
            </div>
            <div className="p-3">
              <div className="flex justify-between mb-3 text-gray-600">
                <div className="flex gap-3">
                  <Heart size={20} />
                  <MessageSquare size={20} />
                </div>
                <Share2 size={20} />
              </div>
              {item === 2 && (
                <div className="bg-blue-50 text-secondary text-xs font-bold p-2 rounded-lg text-center mb-2">
                  Kup Teraz
                </div>
              )}
              <div className="h-2 w-3/4 bg-gray-200 rounded mb-2"></div>
              <div className="h-2 w-1/2 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes scroll-y {
            0% { transform: translateY(0); }
            100% { transform: translateY(-50%); }
        }
        .animate-infinite-scroll-y {
            animation: scroll-y 20s linear infinite;
        }
        .mask-fade-y {
            mask-image: linear-gradient(to bottom, transparent, black 10%, black 90%, transparent);
            -webkit-mask-image: linear-gradient(to bottom, transparent, black 10%, black 90%, transparent);
        }
      `}</style>
    </div>
  );
};
