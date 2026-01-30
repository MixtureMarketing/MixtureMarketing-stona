import React, { useState } from 'react';
import { Shuffle, Zap, Filter, Search, CheckCircle2, Star } from 'lucide-react';

type FeatureType = 'fuzzy' | 'auto' | 'facet';
type FacetColor = 'biały' | 'czarny' | 'niebieski';

const KillerFeaturesInteractive = () => {
  const [activeFeature, setActiveFeature] = useState<FeatureType>('fuzzy');
  const [facetColor, setFacetColor] = useState<FacetColor>('biały');

  const products = [
    { id: 1, name: 'T-Shirt Basic', price: '49 zł', rating: 4.8 },
    { id: 2, name: 'V-Neck Premium', price: '79 zł', rating: 4.5 },
    { id: 3, name: 'Longsleeve', price: '89 zł', rating: 4.9 },
    { id: 4, name: 'Sport Active', price: '59 zł', rating: 4.7 },
  ];

  const getColorHex = (c: FacetColor) => {
    if (c === 'biały') return '#FFFFFF';
    if (c === 'czarny') return '#1e293b';
    return '#3F3D91';
  };

  const getTshirtSvg = (color: FacetColor) => (
    <svg
      viewBox="0 0 24 24"
      fill={getColorHex(color)}
      className={`w-12 h-12 drop-shadow-md transition-all duration-500 ${color === 'biały' ? 'stroke-gray-300' : 'stroke-none'}`}
      strokeWidth="1"
    >
      <path d="M20.38 3.55L16 5.25V3H8V5.25L3.62 3.55C3.24 3.4 2.82 3.56 2.62 3.9L2.08 4.84C1.88 5.18 1.96 5.61 2.27 5.86L6 8.88V20C6 20.55 6.45 21 7 21H17C17.55 21 18 20.55 18 20V8.88L21.73 5.86C22.04 5.61 22.12 5.18 21.92 4.84L21.38 3.9C21.18 3.56 20.76 3.4 20.38 3.55ZM12 6C13.1 6 14 5.1 14 4V3H10V4C10 5.1 10.9 6 12 6Z" />
    </svg>
  );

  return (
    <div className="my-16 bg-[#0B1120] rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl">
      <div className="flex bg-white/5 p-1 overflow-x-auto">
        {(
          [
            { id: 'fuzzy', label: '1. Fuzzy Search', icon: <Shuffle size={14} /> },
            { id: 'auto', label: '2. Autocomplete', icon: <Zap size={14} /> },
            { id: 'facet', label: '3. Faceted Search', icon: <Filter size={14} /> },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFeature(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-4 px-4 rounded-xl text-xxs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeFeature === tab.id ? 'bg-secondary text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>
      <div className="p-8 md:p-12 min-h-[400px] flex items-center justify-center relative">
        {activeFeature === 'fuzzy' && (
          <div className="w-full max-w-lg animate-fade-in text-center">
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 mb-8">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-4">
                <Search className="text-gray-400" size={20} />
                <span className="text-2xl font-bold text-gray-800 line-through decoration-red-500 decoration-4">
                  Samsnug
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-emerald-600 font-bold text-xs shadow-sm">
                    S23
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-800">Samsung Galaxy S23</div>
                    <div className="text-xxs text-gray-500">Elektronika</div>
                  </div>
                </div>
                <span className="text-xxs font-bold text-emerald-600 bg-white px-2 py-1 rounded">
                  Match 92%
                </span>
              </div>
            </div>
          </div>
        )}
        {activeFeature === 'auto' && (
          <div className="w-full max-w-lg animate-fade-in text-center">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden text-left">
              <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50">
                <Search className="text-secondary" size={20} />
                <span className="text-lg font-bold text-gray-800">
                  ipho<span className="animate-pulse text-secondary">|</span>
                </span>
              </div>
              <div className="divide-y divide-gray-50">
                {[
                  { text: 'iPhone 15 Pro', cat: 'Telefony', count: 12 },
                  { text: 'iPhone 14', cat: 'Telefony', count: 8 },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="p-3 hover:bg-blue-50 cursor-pointer flex justify-between items-center group transition-colors"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-700 group-hover:text-secondary">
                        <span className="font-black">ipho</span>
                        {item.text.slice(4)}
                      </span>
                      <span className="text-xxs text-gray-400 uppercase tracking-wider">
                        {item.cat}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-gray-300 bg-gray-100 px-2 py-1 rounded group-hover:text-secondary">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {activeFeature === 'facet' && (
          <div className="w-full max-w-3xl animate-fade-in flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/3 bg-white/5 rounded-2xl p-6 border border-white/10 text-left">
              <div className="text-xxs font-black text-secondary uppercase tracking-widest mb-4 flex items-center gap-2">
                <Filter size={12} /> Kolor
              </div>
              <div className="space-y-3">
                {(['biały', 'czarny', 'niebieski'] as const).map((color) => (
                  <div
                    key={color}
                    onClick={() => setFacetColor(color)}
                    className={`flex items-center justify-between text-xs cursor-pointer p-2 rounded-lg transition-all ${facetColor === color ? 'bg-white/10' : 'hover:bg-white/5'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full border border-gray-600"
                        style={{
                          backgroundColor:
                            color === 'biały' ? '#fff' : color === 'czarny' ? '#1e293b' : '#3F3D91',
                        }}
                      ></div>
                      <span
                        className={`capitalize ${facetColor === color ? 'text-white' : 'text-gray-400'}`}
                      >
                        {color}
                      </span>
                    </div>
                    {facetColor === color && <CheckCircle2 size={12} className="text-secondary" />}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1 bg-white rounded-2xl p-6 shadow-2xl text-left">
              <div className="grid grid-cols-2 gap-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-gray-50 rounded-xl p-4 flex flex-col items-center text-center hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-gray-100"
                  >
                    {getTshirtSvg(facetColor)}
                    <h5 className="text-xs font-bold text-gray-700 mb-1">{product.name}</h5>
                    <div className="mt-auto w-full flex items-center justify-between pt-2 border-t border-gray-200">
                      <span className="text-xxs font-black text-secondary">{product.price}</span>
                      <div className="flex text-xxxs text-amber-400 gap-0.5">
                        <Star size={8} fill="currentColor" />
                        <span>{product.rating}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KillerFeaturesInteractive;
