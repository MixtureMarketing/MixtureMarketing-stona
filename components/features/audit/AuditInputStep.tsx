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

const FEATURES = [
  { icon: Zap, title: 'Wydajność', desc: 'Core Web Vitals i szybkość ładowania.' },
  { icon: Search, title: 'SEO', desc: 'Widoczność w Google i struktura treści.' },
  { icon: ShieldCheck, title: 'Bezpieczeństwo', desc: 'Weryfikacja SSL i ochrony danych.' },
];

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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white rounded-2xl shadow-[0_1px_2px_rgba(16,24,40,0.04),0_24px_60px_-30px_rgba(16,24,40,0.18)] overflow-hidden border border-gray-200"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-5 bg-dark p-10 md:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_20%_10%,rgba(63,61,145,0.5),transparent_55%)]" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 text-blue-100 font-semibold text-[11px] uppercase tracking-[0.08em] mb-8">
              <Zap size={13} className="text-success" /> Mixture Digital Audit 360
            </div>
            <h1 className="text-[34px] md:text-[42px] font-extrabold mb-8 leading-[1.08] tracking-tight text-balance">
              Poznaj prawdę o swojej <span className="text-success">stronie WWW</span>
            </h1>
            <div className="space-y-5">
              {FEATURES.map((item, i) => (
                <div key={i} className="flex gap-3.5">
                  <div className="w-10 h-10 rounded-[10px] bg-white/10 grid place-items-center shrink-0">
                    <item.icon size={20} className="text-success" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[15px] mb-0.5">{item.title}</h4>
                    <p className="text-[13px] text-blue-200/70">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 p-8 md:p-14">
          <div className="max-w-xl mx-auto">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-dark mb-1.5 tracking-tight">
                Rozpocznij darmowy audyt
              </h2>
              <p className="text-gray-500">Podaj adres strony, którą chcesz przeanalizować.</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <label className="block text-[13px] font-semibold text-gray-600 mb-2">
                  Adres strony WWW
                </label>
                <div className="relative group">
                  <Globe
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-secondary transition-colors"
                    size={19}
                  />
                  <input
                    type="url"
                    inputMode="url"
                    autoComplete="url"
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck={false}
                    placeholder="np. twoja-strona.pl"
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:border-secondary focus:ring-4 focus:ring-secondary/15 outline-none transition-all text-[16px]"
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
                <label className="block text-[13px] font-semibold text-gray-600 mb-2">
                  Nazwa firmy{' '}
                  <span className="text-gray-400 font-normal">(opcjonalnie — ocena Google)</span>
                </label>
                <div className="relative group">
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-secondary transition-colors"
                    size={19}
                  />
                  <input
                    type="text"
                    autoComplete="organization"
                    autoCapitalize="words"
                    autoCorrect="off"
                    spellCheck={false}
                    placeholder="np. Mixture Marketing Rzeszów"
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:border-secondary focus:ring-4 focus:ring-secondary/15 outline-none transition-all text-[16px]"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <div className="p-3.5 bg-[#fff1f2] text-[#be123c] rounded-xl text-[13px] font-semibold flex items-center gap-2 border border-[#fecdd3]">
                  <AlertTriangle size={17} /> {error}
                </div>
              )}

              <div className="pt-1">
                <Button className="w-full h-14 text-lg justify-center rounded-xl active:scale-[0.98] transition-transform">
                  Sprawdź błędy <ArrowRight className="ml-2" size={20} />
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
