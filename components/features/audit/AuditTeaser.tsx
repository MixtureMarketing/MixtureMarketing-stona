import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Zap, ArrowRight, ShieldCheck, Globe, Sparkles } from 'lucide-react';
import Button from '../../common/Button';

interface AuditTeaserProps {
  placeholder?: string;
  buttonText?: string;
  className?: string;
  initialUrl?: string;
  variant?: 'light' | 'dark' | 'glass';
  colorScheme?: 'emerald' | 'blue' | 'indigo';
  layout?: 'default' | 'compact';
}

const AuditTeaser: React.FC<AuditTeaserProps> = ({
  placeholder = 'Wpisz adres...',
  buttonText = 'Analizuj',
  className = '',
  initialUrl = '',
  variant = 'light',
  colorScheme = 'emerald',
  layout = 'default',
}) => {
  const [url, setUrl] = useState(initialUrl);
  const navigate = useNavigate();

  const isCompact = layout === 'compact';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    let cleanUrl = url.trim();
    if (!cleanUrl.startsWith('http')) {
      cleanUrl = `https://${cleanUrl}`;
    }
    navigate(`/audyt-360?url=${encodeURIComponent(cleanUrl)}`);
  };

  const schemeClasses = {
    emerald: {
      primary: '#10b981',
      secondary: '#059669',
      accent: 'from-emerald-400 to-teal-500',
      glow: 'bg-emerald-500/10',
      badge: 'bg-emerald-500/10 text-emerald-600',
      text: 'text-emerald-500',
      inputFocus: 'focus:border-emerald-500/50 focus:ring-emerald-500/5',
    },
    blue: {
      primary: '#4285F4',
      secondary: '#1a73e8',
      accent: 'from-[#4285F4] to-[#34A853]',
      glow: 'bg-blue-500/10',
      badge: 'bg-blue-500/10 text-blue-600',
      text: 'text-blue-500',
      inputFocus: 'focus:border-blue-500/50 focus:ring-blue-500/5',
    },
    indigo: {
      primary: '#6366f1',
      secondary: '#4f46e5',
      accent: 'from-indigo-400 to-purple-500',
      glow: 'bg-indigo-500/10',
      badge: 'bg-indigo-500/10 text-indigo-600',
      text: 'text-indigo-500',
      inputFocus: 'focus:border-indigo-500/50 focus:ring-indigo-500/5',
    },
  };

  const currentScheme = schemeClasses[colorScheme];

  const containerClasses = 
    variant === 'glass'
      ? 'bg-white/80 backdrop-blur-2xl border-white shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)]'
      : variant === 'dark'
        ? 'bg-[#0B1120] border-white/10 text-white shadow-2xl'
        : 'bg-white border-gray-100 shadow-xl';

  const titleColor = variant === 'dark' ? 'text-white' : 'text-dark';

  return (
    <div
      className={`rounded-[2.5rem] p-1 border transition-all duration-500 ${containerClasses} ${className} ${isCompact ? 'rounded-3xl' : 'sm:p-2'}`}
    >
      <div className={`relative overflow-hidden rounded-[2.2rem] ${isCompact ? 'p-6 rounded-[1.4rem]' : 'px-6 py-10 sm:p-10'}`}>
        {/* Abstract Background Elements */}
        {!isCompact && (
          <>
            <div className={`absolute -top-24 -right-24 w-64 h-64 ${currentScheme.glow} rounded-full blur-[80px] pointer-events-none`}></div>
            <div className={`absolute -bottom-24 -left-24 w-64 h-64 ${currentScheme.glow} rounded-full blur-[80px] pointer-events-none`}></div>
          </>
        )}
        
        <div className="relative z-10">
          <div className={`flex flex-col gap-4 ${isCompact ? 'mb-6' : 'lg:flex-row lg:items-end justify-between lg:gap-8 mb-10'}`}>
            <div className={isCompact ? 'w-full' : 'max-w-xl'}>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border border-current/10 bg-white/50 backdrop-blur-sm shadow-sm ${isCompact ? 'mb-4' : 'mb-6'}`}>
                <Sparkles size={14} className={currentScheme.text} />
                <span className="text-xxs font-black uppercase tracking-[0.2em] text-gray-500">
                  {isCompact ? 'Darmowy Audyt' : 'Darmowy Audyt Digital 360™'}
                </span>
              </div>

              <h3 className={`font-black leading-[1.1] tracking-tight ${titleColor} ${isCompact ? 'text-xl' : 'text-3xl sm:text-4xl md:text-5xl'}`}>
                {isCompact ? (
                  <>Analiza Twojej <span className={`text-transparent bg-clip-text bg-gradient-to-r ${currentScheme.accent}`}>Strony WWW</span></>
                ) : (
                  <>
                    Odkryj błędy na <br />
                    <span className={`text-transparent bg-clip-text bg-gradient-to-r ${currentScheme.accent}`}>
                      Twojej stronie WWW
                    </span>
                  </>
                )}
              </h3>
            </div>

            {!isCompact && (
              <div className="hidden lg:block pb-2">
                <div className="flex flex-col items-end gap-2 text-right">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xxs font-bold text-gray-600 shadow-sm">
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-emerald-500 flex items-center justify-center text-xxs font-bold text-white shadow-sm">
                      +4k
                    </div>
                  </div>
                  <p className="text-xxs font-bold text-gray-400 uppercase tracking-widest">Zaufali nam liderzy branży</p>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="relative group/form">
            <div className={`flex flex-col gap-3 p-2 bg-gray-50/50 border border-gray-100 rounded-[1.8rem] backdrop-blur-sm transition-all group-focus-within/form:bg-white group-focus-within/form:shadow-2xl group-focus-within/form:shadow-black/5 ${!isCompact && 'md:flex-row'}`}>
              <div className="relative flex-1 flex items-center">
                <div className="absolute left-5 text-gray-400 group-focus-within/form:text-current transition-colors" style={{ color: url ? currentScheme.primary : undefined }}>
                  <Globe size={isCompact ? 18 : 22} />
                </div>
                <input
                  type="text"
                  placeholder={placeholder}
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className={`w-full bg-transparent pr-6 py-5 outline-none font-medium text-dark placeholder:text-gray-400 ${isCompact ? 'pl-12 text-sm' : 'pl-14 text-lg'}`}
                  required
                />
              </div>
              <button
                type="submit"
                className={`w-full bg-dark text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-all hover:bg-secondary active:scale-[0.98] shadow-lg shadow-[#213261]/20 hover:shadow-[#213261]/30 group/btn ${isCompact ? 'py-4 text-sm' : 'md:w-auto px-8 py-5 text-lg'}`}
              >
                <span>{buttonText}</span>
                <ArrowRight size={isCompact ? 16 : 20} className="group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </form>

          {!isCompact && (
            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
              <div className="flex items-center gap-2.5 text-xs font-bold text-gray-500 uppercase tracking-wide">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <ShieldCheck size={16} />
                </div>
                Bezpieczna analiza
              </div>
              <div className="flex items-center gap-2.5 text-xs font-bold text-gray-500 uppercase tracking-wide">
                <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                  <Zap size={16} />
                </div>
                Wynik w 60 sekund
              </div>
              <div className="hidden sm:flex items-center gap-2.5 text-xs font-bold text-gray-500 uppercase tracking-wide">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <Search size={16} />
                </div>
                Analiza 20+ czynników
              </div>
            </div>
          )}

          {isCompact && (
             <p className="mt-4 text-center text-xxs font-bold text-gray-400 uppercase tracking-widest">
                Bezpłatnie • Wynik w 60s
             </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditTeaser;