import React from 'react';
import { ShoppingCart, XCircle, CheckCircle2, AlertCircle, MousePointer2 } from 'lucide-react';

export const LeakyBucketVisual = () => {
  return (
    <div className="relative bg-white rounded-[3rem] p-8 md:p-12 overflow-hidden border border-gray-100 shadow-2xl flex flex-col items-center group">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]"></div>

      <div className="text-center mb-12 relative z-10">
        <h3 className="text-2xl font-bold text-dark">Efekt "Dziurawego Wiadra"</h3>
        <p className="text-gray-700 text-sm mt-2">Dlaczego reklamy nie przynoszą zysku?</p>
      </div>

      <div className="relative w-full max-w-lg h-[450px] flex flex-col items-center pt-4">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 w-16 h-32 bg-gradient-to-b from-blue-400 to-blue-500 opacity-90 rounded-b-2xl z-20 shadow-[0_10px_30px_rgba(59,130,246,0.4)]">
          <div className="absolute inset-0 bg-white/20 animate-pulse rounded-b-2xl"></div>
          <div className="absolute top-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-xxs font-bold text-white uppercase tracking-widest drop-shadow-md bg-blue-600/50 px-2 py-0.5 rounded-full">
            Ruch / Ads
          </div>
        </div>

        <div className="relative w-64 h-72 z-10 mt-20">
          <div className="absolute inset-0 border-x-4 border-b-4 border-gray-300 rounded-b-[4rem] bg-gradient-to-b from-white to-gray-50 overflow-hidden backdrop-blur-sm shadow-inner">
            <div className="absolute bottom-0 w-full h-[60%] bg-blue-500/10 overflow-hidden">
              <div className="absolute top-0 left-0 w-[200%] h-full">
                <div
                  className="w-full h-8 bg-blue-500 opacity-50 absolute top-0"
                  style={{
                    borderRadius: '50%',
                    animation: 'wave 3s linear infinite',
                  }}
                ></div>
                <div
                  className="w-full h-8 bg-blue-400 opacity-30 absolute top-2"
                  style={{
                    borderRadius: '50%',
                    animation: 'wave 4s linear infinite reverse',
                  }}
                ></div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-b from-blue-400/80 to-blue-600/80 top-4"></div>
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 font-bold text-xs uppercase tracking-widest">
              Twój Sklep
            </div>
          </div>

          <div className="absolute -top-2 left-0 w-full h-8 border-4 border-gray-300 rounded-[50%] bg-gray-50 shadow-sm z-30"></div>

          <div className="absolute top-[40%] -left-1 w-3 h-3 bg-gray-800 rounded-full z-20 shadow-sm"></div>
          <div className="absolute top-[40%] left-0 -translate-x-4 w-24 h-1 bg-gradient-to-r from-blue-400 to-transparent -rotate-12 origin-right"></div>
          <div className="absolute top-[40%] left-[-10px] w-4 h-64 overflow-hidden pointer-events-none">
            <div
              className="w-2 p-2 bg-blue-500 rounded-full absolute top-0 left-0"
              style={{ animation: 'drop-fall 1.5s infinite linear' }}
            ></div>
            <div
              className="w-2 h-2 bg-blue-400 rounded-full absolute top-0 left-0"
              style={{ animation: 'drop-fall 1.5s infinite linear', animationDelay: '0.7s' }}
            ></div>
          </div>
          <div
            className="absolute top-[35%] right-full mr-4 bg-white px-3 py-1 rounded-lg shadow-lg border border-red-100 text-xxs font-bold text-red-500 whitespace-nowrap animate-bounce"
            style={{ animationDuration: '3s' }}
          >
            Brak Mobile
          </div>

          <div className="absolute top-[60%] -right-1 w-3 h-3 bg-gray-800 rounded-full z-20 shadow-sm"></div>
          <div className="absolute top-[60%] right-0 translate-x-4 w-20 h-1 bg-gradient-to-l from-blue-400 to-transparent rotate-6 origin-left"></div>
          <div className="absolute top-[60%] right-[-10px] w-4 h-64 overflow-hidden pointer-events-none">
            <div
              className="w-2 h-2 bg-blue-500 rounded-full absolute top-0 right-0"
              style={{ animation: 'drop-fall 1.2s infinite linear', animationDelay: '0.2s' }}
            ></div>
          </div>
          <div className="absolute top-[55%] left-full ml-4 bg-white px-3 py-1 rounded-lg shadow-lg border border-red-100 text-xxs font-bold text-red-500 whitespace-nowrap">
            Trudny Checkout
          </div>
        </div>

        <div className="mt-4 flex flex-col items-center gap-2 relative z-10">
          <div className="w-20 h-1 bg-gray-200 rounded-full mb-4"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_10px_#22c55e] animate-bounce"></div>
          <div className="bg-green-50 border border-green-200 px-4 py-2 rounded-xl text-center">
            <div className="text-xs font-bold text-green-700 uppercase tracking-wide">Sprzedaż</div>
            <div className="text-xxs text-green-600 font-medium opacity-80">Tylko krople...</div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes wave {
          0% { transform: translateX(0) translateZ(0) scaleY(1); }
          50% { transform: translateX(-25%) translateZ(0) scaleY(0.85); }
          100% { transform: translateX(-50%) translateZ(0) scaleY(1); }
        }
        @keyframes drop-fall {
          0% { transform: translateY(0) scale(1); opacity: 0.8; }
          80% { opacity: 0.8; }
          100% { transform: translateY(200px) scale(0.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export const MobileComparisonVisual = () => {
  return (
    <div className="flex flex-col md:flex-row justify-center gap-12 mt-12">
      <div className="group relative flex flex-col items-center">
        <div className="w-56 h-[400px] bg-gray-900 rounded-[2.5rem] p-3 shadow-2xl relative border-[6px] border-gray-800 ring-1 ring-white/10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-gray-800 rounded-b-xl z-20"></div>
          <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden relative flex flex-col">
            <div className="w-full h-12 bg-gray-50 border-b flex items-center justify-between px-4">
              <div className="w-16 h-2 bg-gray-200 rounded"></div>
            </div>
            <div className="p-4 space-y-3 opacity-50 blur-[0.5px]">
              <div className="w-full h-32 bg-gray-100 rounded-lg"></div>
              <div className="w-3/4 h-2 bg-gray-200 rounded"></div>
              <div className="w-full h-2 bg-gray-200 rounded"></div>
            </div>
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-6 backdrop-blur-sm">
              <div className="bg-white p-4 w-full rounded-xl text-center shadow-2xl relative animate-pulse">
                <div className="absolute -top-3 -right-3 w-6 h-6 bg-gray-800 text-white rounded-full flex items-center justify-center text-xs border-2 border-white shadow-md">
                  ✕
                </div>
                <h3 className="font-bold text-red-600 text-sm mb-2">KUP TERAZ!</h3>
                <p className="text-xxs text-gray-700 mb-3">
                  Zapisz się do newslettera i odbierz rabat!
                </p>
                <button className="bg-red-600 text-white text-xxs font-bold py-2 px-4 rounded w-full">
                  KLIKNIJ TUTAJ
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 flex items-center gap-2 text-red-600 font-bold bg-red-50 px-4 py-2 rounded-full border border-red-100">
          <XCircle size={20} />
          <span className="text-sm">ŹLE</span>
        </div>
      </div>

      <div className="group relative flex flex-col items-center">
        <div className="absolute top-32 right-10 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="relative">
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping absolute"></div>
            <div className="w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-lg relative cursor-help"></div>
            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xxs px-2 py-1 rounded whitespace-nowrap shadow-xl">
              Czytelne zdjęcia
            </div>
          </div>
        </div>
        <div className="w-56 h-[400px] bg-gray-900 rounded-[2.5rem] p-3 shadow-2xl relative border-[6px] border-gray-800 ring-1 ring-white/10 transform group-hover:scale-105 transition-transform duration-500">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-gray-800 rounded-b-xl z-20"></div>
          <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden flex flex-col relative">
            <div className="w-full h-12 bg-white flex items-center justify-between px-4 sticky top-0 z-10 shadow-sm">
              <div className="w-4 h-4 bg-gray-800 rounded-full"></div>
              <div className="w-4 h-4 text-gray-800">
                <ShoppingCart size={16} />
              </div>
            </div>
            <div className="flex-1 overflow-hidden p-0">
              <div className="w-full h-48 bg-gray-50 flex items-center justify-center mb-4">
                <div className="w-24 h-32 bg-white shadow-lg rounded-xl transform -rotate-6 border border-gray-100"></div>
              </div>
              <div className="px-5">
                <h3 className="font-bold text-lg text-gray-900 mb-1">Sneakers Pro</h3>
                <div className="text-emerald-600 font-bold text-sm mb-4">499.00 PLN</div>
                <p className="text-xxs text-gray-600 leading-relaxed">
                  Najlepsze buty do biegania w terenie. Lekkie i wytrzymałe.
                </p>
              </div>
            </div>
            <div className="p-4 bg-white/90 backdrop-blur border-t absolute bottom-0 w-full">
              <button className="w-full bg-[#059669] hover:bg-[#00a844] text-white font-bold py-3 rounded-xl shadow-[0_4px_14px_rgba(0,200,83,0.3)] text-xs flex items-center justify-center gap-2 transition-all active:scale-95">
                <ShoppingCart size={14} /> DODAJ DO KOSZYKA
              </button>
            </div>
          </div>
        </div>
        <div className="mt-6 flex items-center gap-2 text-[#059669] font-bold bg-green-50 px-4 py-2 rounded-full border border-green-100">
          <CheckCircle2 size={20} />
          <span className="text-sm">DOBRZE</span>
        </div>
      </div>
    </div>
  );
};

export const HeatmapVisual = () => {
  return (
    <div className="bg-gray-900 rounded-[2rem] p-2 overflow-hidden relative shadow-2xl border border-gray-800 group h-[400px]">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 z-0"></div>
      <div className="bg-gray-800 px-4 py-3 flex items-center gap-2 rounded-t-[1.5rem] relative z-10 border-b border-gray-700">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        <div className="ml-4 bg-gray-900/50 h-6 w-full max-w-sm rounded-lg border border-gray-700/50"></div>
      </div>
      <div className="bg-white relative h-full w-full p-8 font-sans">
        <div className="flex justify-between items-center mb-8">
          <div className="w-32 h-6 bg-gray-200 rounded"></div>
          <div className="flex gap-4">
            <div className="w-16 h-4 bg-gray-100 rounded"></div>
            <div className="w-16 h-4 bg-gray-100 rounded"></div>
          </div>
        </div>
        <div className="flex gap-8">
          <div className="w-1/2 space-y-4 pt-4">
            <div className="w-3/4 h-8 bg-gray-800 rounded"></div>
            <div className="w-full h-4 bg-gray-200 rounded"></div>
            <div className="w-5/6 h-4 bg-gray-200 rounded"></div>
            <div className="mt-8 relative inline-block">
              <div className="px-8 py-3 bg-blue-600 text-white rounded-lg shadow-lg font-bold text-sm cursor-pointer opacity-90">
                KUP TERAZ
              </div>
              <div
                className="absolute inset-0 bg-red-500 rounded-lg pointer-events-none opacity-0"
                style={{
                  animation: 'ripple 0.5s ease-out forwards',
                  animationDelay: '3s',
                  animationIterationCount: 'infinite',
                }}
              ></div>
            </div>
          </div>
          <div className="w-1/2 h-48 bg-gray-100 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center">
            <div className="text-gray-300 text-4xl font-black opacity-20">IMG</div>
          </div>
        </div>
        <div
          className="absolute top-0 left-0 pointer-events-none z-50 drop-shadow-2xl"
          style={{ animation: 'cursor-path 6s infinite ease-in-out' }}
        >
          <MousePointer2 className="text-black fill-white" size={24} />
          <div
            className="absolute -top-2 -left-2 w-10 h-10 border-2 border-red-500 rounded-full opacity-0"
            style={{ animation: 'ripple 1s infinite', animationDelay: '2.5s' }}
          ></div>
        </div>
      </div>
      <div className="absolute bottom-6 left-6 bg-gray-900/90 backdrop-blur-md text-white p-4 rounded-xl border border-gray-700 shadow-2xl max-w-xs z-40">
        <div className="flex items-center gap-3 mb-2">
          <AlertCircle className="text-red-500" size={20} />
          <span className="font-bold text-sm">Wykryto problem!</span>
        </div>
        <p className="text-xs text-gray-300 leading-relaxed">
          Użytkownik klika w przycisk "Kup Teraz", ale nic się nie dzieje (tzw.{' '}
          <strong className="text-white">Rage Click</strong>). Prawdopodobnie błąd JavaScript.
        </p>
      </div>
      <style>{`
        @keyframes cursor-path {
          0% { transform: translate(20px, 20px); }
          30% { transform: translate(120px, 80px); }
          40% { transform: translate(120px, 80px) scale(0.9); }
          45% { transform: translate(120px, 80px) scale(1); }
          50% { transform: translate(120px, 80px) scale(0.9); }
          55% { transform: translate(120px, 80px) scale(1); }
          60% { transform: translate(122px, 78px) scale(0.9); }
          65% { transform: translate(120px, 80px) scale(1); }
          100% { transform: translate(120px, 80px); }
        }
        @keyframes ripple {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(2.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
};
