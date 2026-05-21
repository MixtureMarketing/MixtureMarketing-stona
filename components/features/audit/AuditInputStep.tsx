import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Search, ShieldCheck, Globe, ArrowRight, AlertTriangle } from 'lucide-react';
import Button from '../../common/Button';

interface AuditInputStepProps {
  url: string;
  setUrl: (url: string) => void;
  companyName: string;
  setCompanyName: (name: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  error: string | null;
}

const AuditInputStep: React.FC<AuditInputStepProps> = ({
  url,
  setUrl,
  companyName,
  setCompanyName,
  onSubmit,
  error,
}) => {
  return (
    <motion.div
      key="input"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-5 bg-gradient-to-br from-dark to-secondary p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-blue-200 font-bold text-xs uppercase tracking-widest mb-8">
              <Zap size={14} className="text-yellow-400" /> Mixture Digital Audit 360™
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-8 leading-tight">
              Poznaj prawdę o swojej <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00C853] to-emerald-400">
                stronie WWW
              </span>
            </h1>
            <div className="space-y-6">
              {[
                {
                  icon: Zap,
                  title: 'Wydajność',
                  desc: 'Testujemy Core Web Vitals i szybkość ładowania.',
                },
                {
                  icon: Search,
                  title: 'SEO',
                  desc: 'Sprawdzamy widoczność w Google i strukturę treści.',
                },
                {
                  icon: ShieldCheck,
                  title: 'Bezpieczeństwo',
                  desc: 'Weryfikacja SSL i standardów ochrony danych.',
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                    <item.icon size={24} className="text-success" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">{item.title}</h4>
                    <p className="text-sm text-blue-200/80">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 p-8 md:p-16">
          <div className="max-w-xl mx-auto">
            <div className="mb-10">
              <h2 className="text-3xl font-black text-dark mb-2">Rozpocznij darmowy audyt</h2>
              <p className="text-gray-500 font-medium">
                Podaj adres strony, którą chcesz przeanalizować.
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                    Adres strony WWW
                  </label>
                  <div className="relative group">
                    <Globe
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-secondary transition-colors"
                      size={20}
                    />
                    <input
                      type="url"
                      inputMode="url"
                      autoComplete="url"
                      autoCapitalize="off"
                      autoCorrect="off"
                      spellCheck={false}
                      placeholder="np. twoja-strona.pl"
                      className="w-full pl-12 pr-4 py-5 rounded-2xl border-2 border-gray-100 focus:border-secondary focus:ring-4 focus:ring-secondary/40 outline-none transition-all text-lg font-medium"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      onBlur={(e) => {
                        // Auto-prepend https:// + trim — eliminuje typo 'twoja-strona.pl' bez schematu
                        const v = e.target.value.trim();
                        if (v && !/^https?:\/\//i.test(v)) {
                          setUrl(`https://${v}`);
                        } else if (v !== e.target.value) {
                          setUrl(v);
                        }
                      }}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                    Nazwa Firmy (Opcjonalnie)
                  </label>
                  <div className="relative group">
                    <Search
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-secondary transition-colors"
                      size={20}
                    />
                    <input
                      type="text"
                      autoComplete="organization"
                      autoCapitalize="words"
                      autoCorrect="off"
                      spellCheck={false}
                      placeholder="Wyszukaj firmę w Google..."
                      className="w-full pl-12 pr-4 py-5 rounded-2xl border-2 border-gray-100 focus:border-secondary focus:ring-4 focus:ring-secondary/40 outline-none transition-all text-lg font-medium"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />{' '}
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold flex items-center gap-2 border border-red-100">
                  <AlertTriangle size={18} /> {error}
                </div>
              )}

              <div className="pt-4">
                <Button className="w-full h-16 text-xl justify-center shadow-2xl shadow-[#00C853]/20 hover:scale-[1.02] transition-all rounded-2xl">
                  Sprawdź błędy <ArrowRight className="ml-2" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AuditInputStep;
