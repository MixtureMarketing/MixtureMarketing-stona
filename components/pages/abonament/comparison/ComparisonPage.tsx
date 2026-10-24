import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, X, Plus, ArrowRight, Phone, Sparkles } from 'lucide-react';
import Seo from '@/components/common/Seo';
import Container from '@/components/common/Container';
import AmbientBackground from '@/components/common/AmbientBackground';
import ScrollRegion from '@/components/common/ScrollRegion';
import MagneticButton from '../MagneticButton';
import { HeroBadge, GhostButton, CompareFaq, faqPageJsonLd } from '../shared';
import type { CellStatus, ComparisonConfig } from './types';

/**
 * Wspólny układ stron porównawczych abonamentu (/abonament/vs-wix/,
 * /abonament/vs-orange-klikai/): hero, karty cen, tabela cech (StatusCell),
 * opcjonalna sekcja dodatkowa, „Kiedy X, kiedy Mixture?", FAQ (widoczne + JSON-LD
 * z tej samej tablicy) i CTA. Treść każdej strony to `ComparisonConfig`.
 */

const STATUS_LABEL: Record<CellStatus, string> = {
  ok: 'Tak',
  mid: 'Częściowo',
  no: 'Nie',
};

const StatusCell: React.FC<{ status: CellStatus; text: string; featured?: boolean }> = ({
  status,
  text,
  featured,
}) => {
  const Icon = status === 'ok' ? CheckCircle2 : status === 'no' ? X : Plus;
  const color =
    status === 'ok' ? 'text-emerald-600' : status === 'no' ? 'text-rose-400' : 'text-amber-500';
  return (
    <td className={`px-4 py-4 ${featured ? 'bg-emerald-50/30' : ''}`}>
      <div className="flex items-start gap-2">
        <Icon
          size={16}
          className={`${color} shrink-0 mt-0.5 ${status === 'mid' ? 'rotate-45' : ''}`}
          aria-hidden="true"
        />
        <span className="sr-only">{STATUS_LABEL[status]}:</span>
        <span className={`text-sm ${featured ? 'font-semibold text-dark' : 'text-gray-700'}`}>
          {text}
        </span>
      </div>
    </td>
  );
};

const PRIMARY_BTN =
  'inline-flex items-center justify-center gap-2 px-7 py-4 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all';
const SECONDARY_BTN =
  'inline-flex items-center justify-center gap-2 px-7 py-4 bg-white text-dark hover:text-emerald-700 font-bold rounded-full border border-gray-200 hover:border-emerald-300 transition-all';

const sectionClass = (muted?: boolean) => `py-20 md:py-28${muted ? ' bg-gray-50/60' : ''}`;

const ComparisonPage: React.FC<{ config: ComparisonConfig }> = ({ config }) => {
  const { seo, hero, plans, table, extraSection, decisions, faq, cta } = config;
  const CompetitorIcon = decisions.competitor.icon;

  const phoneButton = (
    <a href="tel:+48794443551" className={cta.phoneFirst ? PRIMARY_BTN : SECONDARY_BTN}>
      <Phone size={18} aria-hidden="true" />
      +48 794 443 551
    </a>
  );
  const linkButton = (
    <Link to={cta.link.to} className={cta.phoneFirst ? SECONDARY_BTN : PRIMARY_BTN}>
      {cta.link.label} <ArrowRight size={18} aria-hidden="true" />
    </Link>
  );

  return (
    <div className="min-h-screen bg-white text-dark">
      <Seo
        title={seo.title}
        description={seo.description}
        canonical={seo.canonical}
        breadcrumbs={[
          { name: 'Strona Główna', item: '/' },
          { name: 'Strona w abonamencie', item: '/abonament/' },
          { name: seo.breadcrumb, item: seo.canonical },
        ]}
        jsonLd={faqPageJsonLd(faq.items)}
      />

      <AmbientBackground />

      <section className="relative pt-32 pb-16">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <HeroBadge accent="emerald" className="mb-8">
              {hero.badge}
            </HeroBadge>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-dark leading-[1.05] tracking-tight mb-6">
              {hero.title}
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-emerald-600 to-emerald-700">
                {hero.highlight}
              </span>
            </h1>
            <p className="text-xl text-gray-700 leading-relaxed mb-8 max-w-3xl mx-auto">
              {hero.lead}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-xl mx-auto">
              <MagneticButton
                type="button"
                strength={0.3}
                onClick={() => {
                  window.location.href = '/abonament/#pricing';
                }}
                className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-shadow"
              >
                Zobacz pakiety Mixture <ArrowRight size={18} aria-hidden="true" />
              </MagneticButton>
              <GhostButton accent="emerald" href="tel:+48794443551">
                <Phone size={18} aria-hidden="true" />
                Konsultacja
              </GhostButton>
            </div>
          </div>
        </Container>
      </section>

      {/* ============ COMPARISON TABLE ============ */}
      <section className="py-20 md:py-28 bg-gray-50/60">
        <Container>
          <div className="max-w-5xl mx-auto">
            <div className="grid sm:grid-cols-2 gap-4 mb-2" aria-hidden="true">
              <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-t-2xl p-5 shadow-lg relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-emerald-700 text-xxs font-black uppercase tracking-[0.2em] shadow">
                  <Sparkles size={10} aria-hidden="true" />
                  Managed
                </div>
                <p className="text-xs font-black uppercase tracking-[0.15em] text-emerald-100 mb-2 mt-3">
                  Mixture (abonament)
                </p>
                <p className="text-2xl font-extrabold mb-1">od 179 zł / mc</p>
                <p className="text-xs text-emerald-50">{plans.mixtureNote}</p>
              </div>
              <div className="bg-white border-2 border-gray-100 rounded-t-2xl p-5 shadow-sm">
                <p
                  className={`text-xs font-black uppercase tracking-[0.15em] ${plans.competitor.labelColor} mb-2 mt-3`}
                >
                  {plans.competitor.label}
                </p>
                <p className="text-2xl font-extrabold text-dark mb-1">{plans.competitor.price}</p>
                <p className="text-xs text-gray-600">{plans.competitor.note}</p>
              </div>
            </div>

            <ScrollRegion label={table.scrollLabel}>
              <table className="w-full bg-white rounded-b-2xl shadow-sm border border-t-0 border-gray-100">
                <caption className="sr-only">{table.caption}</caption>
                <thead className="sr-only">
                  <tr>
                    <th scope="col">Cecha</th>
                    <th scope="col">Mixture (abonament)</th>
                    <th scope="col">{table.competitorHeader}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {table.rows.map((row) => (
                    <tr
                      key={row.label}
                      className="even:bg-gray-50/50 hover:bg-emerald-50/30 transition-colors"
                    >
                      <th
                        scope="row"
                        className="text-left px-4 py-4 font-semibold text-dark text-xs uppercase tracking-wide w-1/3"
                      >
                        {row.label}
                      </th>
                      <StatusCell {...row.mixture} featured />
                      <StatusCell {...row.competitor} />
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollRegion>

            {table.footnote && (
              <p className="text-xs text-gray-500 text-center mt-4 italic">{table.footnote}</p>
            )}
          </div>
        </Container>
      </section>

      {extraSection}

      {/* ============ DECYZJE — kiedy konkurent, kiedy Mixture ============ */}
      <section className={sectionClass(decisions.muted)}>
        <Container>
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-dark leading-tight mb-4">
              {decisions.heading}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-5 max-w-5xl mx-auto items-stretch">
            <div className="bg-gray-50/60 rounded-2xl p-6 border border-gray-100 opacity-90">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-10 h-10 rounded-xl ${decisions.competitor.iconTone} flex items-center justify-center`}
                >
                  <CompetitorIcon size={18} aria-hidden="true" />
                </div>
                <h3 className="font-bold text-gray-700">{decisions.competitor.heading}</h3>
              </div>
              <ul className="space-y-2.5 text-sm text-gray-700">
                {decisions.competitor.items.map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <CheckCircle2
                      size={14}
                      className={`${decisions.competitor.checkColor} shrink-0 mt-1`}
                      aria-hidden="true"
                    />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative bg-white rounded-2xl p-6 border-2 border-emerald-400 shadow-lg shadow-emerald-500/10 lg:scale-[1.02] lg:-my-1">
              <div className="absolute -top-2.5 right-4 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-700 text-white text-xxs font-black uppercase tracking-[0.15em]">
                Rekomendowane
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Sparkles size={18} aria-hidden="true" />
                </div>
                <h3 className="font-bold text-dark">Wybierz Mixture jeśli…</h3>
              </div>
              <ul className="space-y-2.5 text-sm text-gray-700">
                {decisions.mixtureItems.map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <CheckCircle2
                      size={14}
                      className="text-emerald-600 shrink-0 mt-1"
                      aria-hidden="true"
                    />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      <CompareFaq items={faq.items} className={faq.className} />

      {/* ============ CTA ============ */}
      <section className={sectionClass(cta.muted)}>
        <Container>
          <div className="max-w-3xl mx-auto bg-white rounded-3xl p-10 shadow-sm border border-emerald-100 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-dark mb-4">{cta.heading}</h2>
            <p className="text-gray-600 mb-6">{cta.text}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {cta.phoneFirst ? phoneButton : linkButton}
              {cta.phoneFirst ? linkButton : phoneButton}
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default ComparisonPage;
