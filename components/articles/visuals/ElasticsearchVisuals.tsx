/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import {
  Search,
  XCircle,
  CheckCircle2,
  Database,
  Zap,
  ArrowRight,
  BookOpen,
  Book,
  Layers,
  BarChart3,
  Server,
  Shuffle,
  MousePointer2,
  Filter,
  Settings,
  ShoppingCart,
  Star,
} from 'lucide-react';
import AnimateOnScroll from '../../common/AnimateOnScroll';

// --- HERO: SMART SEARCH SIMULATOR ---
export const ElasticHeroSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const target = 'Samung';

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < target.length) {
        setQuery(target.slice(0, i + 1));
        i++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full bg-[#0F172A] rounded-[3rem] p-8 md:p-12 overflow-hidden border border-white/10 shadow-2xl min-h-[500px] flex flex-col items-center justify-center group">
      <div className="absolute inset-0 bg-tech-grid opacity-10"></div>

      <div className="relative z-10 w-full max-w-2xl space-y-12">
        {/* Search Bar UI */}
        <div className="bg-white rounded-2xl p-4 shadow-2xl flex items-center gap-4 border-b-4 border-gray-200">
          <Search className="text-gray-400" size={24} />
          <div className="flex-1 text-2xl font-bold text-dark flex items-center">
            {query}
            <span className="w-1 h-8 bg-secondary ml-1 animate-pulse"></span>
          </div>
          <div className="px-4 py-2 bg-secondary text-white rounded-xl text-xs font-black uppercase tracking-widest">
            Szukaj
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-48">
          {/* Scenario A: SQL */}
          <div
            className={`p-6 rounded-2xl border transition-all duration-500 ${!isTyping ? 'bg-red-500/10 border-red-500/30' : 'bg-white/5 border-white/5 opacity-40'}`}
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-xxs font-black uppercase tracking-widest text-gray-500">
                Zwykła Baza (SQL)
              </span>
              {!isTyping && <XCircle className="text-red-500" size={20} />}
            </div>
            {!isTyping ? (
              <div className="animate-fade-in">
                <p className="text-sm font-bold text-white mb-2 italic">
                  "Nie znaleziono produktów."
                </p>
                <p className="text-xxs text-gray-500 leading-relaxed">
                  SQL szuka dokładnie: <code>WHERE name LIKE '%Samung%'</code>. Brak elastyczności.
                </p>
              </div>
            ) : (
              <div className="h-4 w-32 bg-white/10 rounded-full animate-pulse"></div>
            )}
          </div>

          {/* Scenario B: Elasticsearch */}
          <div
            className={`p-6 rounded-2xl border transition-all duration-500 ${!isTyping ? 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.1)] scale-105' : 'bg-white/5 border-white/5 opacity-40'}`}
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-xxs font-black uppercase tracking-widest text-[#00ED64]">
                Elasticsearch
              </span>
              {!isTyping && <CheckCircle2 className="text-[#00ED64]" size={20} />}
            </div>
            {!isTyping ? (
              <div className="animate-fade-in">
                <p className="text-sm font-bold text-white mb-2">
                  Czy chodziło Ci o:{' '}
                  <span className="text-[#00ED64] underline underline-offset-4 decoration-2">
                    Samsung
                  </span>
                  ?
                </p>
                <p className="text-xs text-[#00ED64] font-black mb-2">(Znaleziono 143 produkty)</p>
                <p className="text-xxs text-gray-500 leading-relaxed">
                  Fuzzy Matching automatycznie koryguje literówki klienta.
                </p>
              </div>
            ) : (
              <div className="h-4 w-32 bg-white/10 rounded-full animate-pulse"></div>
            )}
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 text-xxs font-bold text-gray-600 uppercase tracking-[0.2em] animate-pulse">
        Klient nie kupi tego, czego nie może znaleźć.
      </div>
    </div>
  );
};

// --- INTERACTIVE KILLER FEATURES ---
type FeatureType = 'fuzzy' | 'auto' | 'facet';
type FacetColor = 'biały' | 'czarny' | 'niebieski';
type FacetSize = 'S' | 'M' | 'L';

export const KillerFeaturesInteractive: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState<FeatureType>('fuzzy');

  // Faceted Search State
  const [facetColor, setFacetColor] = useState<FacetColor>('biały');
  const [facetSize, setFacetSize] = useState<FacetSize>('M');

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
      {/* Navigation Tabs */}
      <div className="flex bg-white/5 p-1 overflow-x-auto">
        {(
          [
            { id: 'fuzzy', label: '1. Fuzzy Search (Literówki)', icon: <Shuffle size={14} /> },
            { id: 'auto', label: '2. Autocomplete', icon: <Zap size={14} /> },
            { id: 'facet', label: '3. Faceted Search', icon: <Filter size={14} /> },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFeature(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-4 px-4 rounded-xl text-xxs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeFeature === tab.id ? 'bg-secondary text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Feature Display Area */}
      <div className="p-8 md:p-12 min-h-[400px] flex items-center justify-center relative">
        <div className="absolute inset-0 bg-tech-grid opacity-5 pointer-events-none"></div>

        {/* FUZZY SEARCH DEMO */}
        {activeFeature === 'fuzzy' && (
          <div className="w-full max-w-lg animate-fade-in text-center">
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 mb-8">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-4">
                <Search className="text-gray-400" size={20} />
                <span className="text-2xl font-bold text-gray-800 line-through decoration-red-500 decoration-4">
                  Samsnug
                </span>
                <span className="text-xs text-red-500 font-bold ml-auto px-2 py-1 bg-red-50 rounded">
                  BŁĄD
                </span>
              </div>
              <div className="space-y-3 text-left">
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
            <div className="text-gray-400 text-xs">
              <p className="mb-2">
                Elasticsearch używa <strong>Dystansu Levenshteina</strong>.
              </p>
              <p>
                "Samsnug" wymaga tylko 1 zamiany liter, by stać się "Samsung". To wystarczy, by
                uratować sprzedaż.
              </p>
            </div>
          </div>
        )}

        {/* AUTOCOMPLETE DEMO */}
        {activeFeature === 'auto' && (
          <div className="w-full max-w-lg animate-fade-in text-center">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden relative text-left">
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
                  { text: 'Etui do iPhone', cat: 'Akcesoria', count: 156 },
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
                    <span className="text-xs font-bold text-gray-300 bg-gray-100 px-2 py-1 rounded group-hover:bg-white group-hover:text-secondary">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-gray-400 text-xs mt-8">
              <p>
                Search-as-you-type. Wyniki pojawiają się w{' '}
                <span className="text-secondary font-bold">15ms</span> po każdym naciśnięciu
                klawisza.
              </p>
            </div>
          </div>
        )}

        {/* FACETED SEARCH DEMO */}
        {activeFeature === 'facet' && (
          <div className="w-full max-w-3xl animate-fade-in flex flex-col md:flex-row gap-6">
            {/* Filters Sidebar */}
            <div className="w-full md:w-1/3 bg-white/5 rounded-2xl p-6 border border-white/10 text-left h-fit">
              <div className="mb-8">
                <div className="text-xxs font-black text-secondary uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Filter size={12} /> Kolor
                </div>
                <div className="space-y-3">
                  {(['biały', 'czarny', 'niebieski'] as const).map((color) => (
                    <div
                      key={color}
                      onClick={() => setFacetColor(color)}
                      className={`flex items-center justify-between text-xs cursor-pointer group p-2 rounded-lg transition-all ${facetColor === color ? 'bg-white/10 ring-1 ring-white/20' : 'hover:bg-white/5'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full border border-gray-600 shadow-sm"
                          style={{
                            backgroundColor:
                              color === 'biały'
                                ? '#fff'
                                : color === 'czarny'
                                  ? '#1e293b'
                                  : '#3F3D91',
                          }}
                        ></div>
                        <span
                          className={`capitalize ${facetColor === color ? 'text-white font-bold' : 'text-gray-400'}`}
                        >
                          {color}
                        </span>
                      </div>
                      {facetColor === color && (
                        <CheckCircle2 size={12} className="text-secondary" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xxs font-black text-secondary uppercase tracking-widest mb-4">
                  Rozmiar
                </div>
                <div className="flex flex-wrap gap-2">
                  {(['S', 'M', 'L'] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => setFacetSize(size)}
                      className={`text-xxs px-3 py-1.5 rounded-lg font-bold transition-all ${facetSize === size ? 'bg-secondary text-white shadow-lg scale-105' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results Grid */}
            <div className="flex-1 bg-white rounded-2xl p-6 shadow-2xl border border-gray-100 text-left relative overflow-hidden">
              {/* Background hint */}
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none text-gray-200">
                <ShoppingCart size={100} />
              </div>

              <div className="flex justify-between items-end mb-6 pb-4 border-b border-gray-100 relative z-10">
                <div>
                  <h4 className="text-sm font-bold text-dark">Wyniki Wyszukiwania</h4>
                  <p className="text-xxs text-gray-500 mt-1">
                    Filtry:{' '}
                    <span className="capitalize text-secondary font-bold">{facetColor}</span>,
                    Rozmiar <span className="text-secondary font-bold">{facetSize}</span>
                  </p>
                </div>
                <div className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded text-xxs font-bold">
                  {products.length} produktów
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 relative z-10">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-gray-50 rounded-xl p-4 flex flex-col items-center text-center group cursor-pointer hover:bg-white hover:shadow-lg hover:shadow-blue-900/5 transition-all border border-transparent hover:border-gray-100 duration-300"
                  >
                    <div className="mb-3 transform group-hover:scale-110 transition-transform duration-300">
                      {getTshirtSvg(facetColor)}
                    </div>
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

// --- BOOK INDEX VISUAL ---
export const BookIndexAnalogy: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-16">
      {/* SQL: Full Table Scan */}
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative group overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
          <BookOpen size={120} />
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-xxs font-black uppercase tracking-wider mb-8">
          Baza SQL (Full Table Scan)
        </div>

        <div className="space-y-4 relative z-10">
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col items-center text-center">
            <BookOpen size={32} className="text-gray-400 mb-4 animate-bounce" />
            <p className="text-xs text-gray-600 leading-relaxed">
              To jak czytanie książki <strong>strona po stronie</strong>, by znaleźć konkretne
              słowo. Musisz przeczytać wszystko. Przy milionie produktów to trwa wieki.
            </p>
          </div>
          <div className="flex gap-1 justify-center py-2">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 bg-gray-200 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.1}s` }}
              ></div>
            ))}
          </div>
        </div>
      </div>

      {/* Elasticsearch: Inverted Index */}
      <div className="bg-secondary/5 p-8 rounded-3xl border-2 border-secondary/20 shadow-md relative group overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none group-hover:rotate-6 transition-transform text-secondary">
          <Book size={120} />
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xxs font-black uppercase tracking-wider mb-8 border border-secondary/20">
          Elasticsearch (Inverted Index)
        </div>

        <div className="space-y-4 relative z-10">
          <div className="p-4 bg-white rounded-xl border border-secondary/20 flex flex-col items-center text-center shadow-lg">
            <Zap size={32} className="text-secondary mb-4" />
            <p className="text-xs text-gray-700 leading-relaxed font-medium">
              To jak zajrzenie na koniec książki do <strong>"Indeksu haseł"</strong>. Widzisz hasło
              i numery stron. Trafiasz do celu natychmiastowo.
            </p>
          </div>
          <div className="flex flex-col gap-1 mt-4">
            <div className="flex justify-between text-xxxs font-mono text-gray-400 border-b border-gray-100 pb-1">
              <span>Słowo</span> <span>ID Produktów</span>
            </div>
            <div className="flex justify-between text-xxs font-mono font-bold text-secondary">
              <span>Samsung</span> <span>15, 89, 1240</span>
            </div>
            <div className="flex justify-between text-xxs font-mono font-bold text-secondary">
              <span>iPhone</span> <span>4, 22, 105</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- ARCHITECTURE FLOW ---
export const SearchArchitecture: React.FC = () => {
  return (
    <div className="my-24 p-8 md:p-12 bg-[#0B1120] rounded-[3rem] border border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-tech-grid opacity-5"></div>

      <div className="relative z-10 flex flex-col items-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16 items-center w-full max-w-4xl">
          {/* 1. Main DB */}
          <div className="flex flex-col items-center gap-4 group">
            <div className="w-20 h-20 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center text-gray-500 group-hover:border-secondary transition-all">
              <Database size={32} />
            </div>
            <div className="text-center">
              <div className="text-xs font-bold text-white mb-1">Baza Główna</div>
              <div className="text-xxxs text-gray-600 uppercase tracking-widest font-mono">
                PostgreSQL / SQL
              </div>
            </div>
          </div>

          {/* 2. Sync Logic */}
          <div className="flex flex-col items-center gap-4 relative">
            <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent absolute top-10 hidden md:block"></div>
            <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center shadow-2xl relative z-10">
              <Shuffle size={20} className="text-white animate-spin-slow" />
            </div>
            <div className="text-center">
              <div className="text-xs font-bold text-primary mb-1">Synchronizator</div>
              <div className="text-xxxs text-gray-600 uppercase tracking-widest font-mono">
                Real-time Pipeline
              </div>
            </div>
          </div>

          {/* 3. Elasticsearch */}
          <div className="flex flex-col items-center gap-4 group">
            <div className="w-20 h-20 bg-secondary/20 rounded-2xl border-2 border-secondary flex items-center justify-center text-primary shadow-[0_0_30px_rgba(63,61,145,0.3)] group-hover:scale-105 transition-all">
              <Zap size={32} fill="currentColor" />
            </div>
            <div className="text-center">
              <div className="text-xs font-bold text-white mb-1">Elasticsearch</div>
              <div className="text-xxxs text-primary uppercase tracking-widest font-mono font-black">
                Search Engine
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 p-6 bg-white/5 rounded-2xl border border-white/5 max-w-2xl">
          <p className="text-xs text-gray-400 leading-relaxed text-center m-0">
            <strong>Elasticsearch nie zastępuje Twojej bazy danych.</strong> On z nią współpracuje.
            Główna baza trzyma stany magazynowe i ceny, a Elastic trzyma "kopię" tych danych
            zoptymalizowaną wyłącznie pod błyskawiczne wyszukiwanie i filtrowanie.
          </p>
        </div>
      </div>
    </div>
  );
};
