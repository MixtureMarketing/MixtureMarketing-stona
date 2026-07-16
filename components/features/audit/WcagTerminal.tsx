import React from 'react';
import { Terminal, Palette, ShieldAlert } from 'lucide-react';
import AnimateOnScroll from '../../common/AnimateOnScroll';
import Container from '../../common/Container';
import { VISUAL_AUDIT_CONTENT as CONTENT } from '../../../data/content/services/design/visual-audit';

/**
 * Sekcja WCAG z dowodem zamiast atrapy (2026-07-16): wcześniej kręcił się tu
 * zapętlony, wymyślony log skanera („Score: 64/100" strony, która nie istnieje).
 * Teraz pokazujemy REALNY, datowany wynik axe-core dla tej właśnie podstrony —
 * każdy może go powtórzyć w DevTools. Dane w CONTENT.wcag.axeProof.
 */
const WcagTerminal: React.FC = () => {
  return (
    <Container className="relative z-10">
      <div className="flex flex-col lg:flex-row gap-16 items-center">
        <div className="lg:w-1/2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 border border-success/20 text-success text-xs font-bold uppercase tracking-wider mb-6">
            <ShieldAlert size={14} aria-hidden="true" /> {CONTENT.wcag.badge}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {CONTENT.wcag.title.line1}
            <br />
            {CONTENT.wcag.title.line2}
          </h2>
          <p className="text-gray-300 text-lg mb-8 leading-relaxed">{CONTENT.wcag.description}</p>

          <div className="space-y-4">
            {CONTENT.wcag.features.map((feature, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/5"
              >
                <div className="mt-1 text-primary">
                  {i === 0 ? (
                    <Terminal size={20} aria-hidden="true" />
                  ) : (
                    <Palette size={20} aria-hidden="true" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">{feature.title}</h3>
                  <p className="text-xs text-gray-300">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:w-1/2 w-full">
          <AnimateOnScroll delay={200}>
            <div className="bg-[#1E293B] rounded-xl shadow-2xl border border-[#334155] overflow-hidden font-mono text-xs">
              <div className="bg-[#0F172A] px-4 py-2 flex items-center gap-2 border-b border-[#334155]">
                <div className="w-3 h-3 rounded-full bg-[#334155]"></div>
                <div className="w-3 h-3 rounded-full bg-[#334155]"></div>
                <div className="ml-2 text-white/50">{CONTENT.wcag.axeProof.heading}</div>
              </div>

              <div className="p-6 md:p-8">
                <div className="text-primary mb-6 break-words">
                  $ {CONTENT.wcag.axeProof.command}
                </div>

                <dl className="space-y-3 mb-8">
                  {CONTENT.wcag.axeProof.lines.map((line) => (
                    <div
                      key={line.label}
                      className="flex items-baseline justify-between gap-4 border-b border-white/5 pb-3"
                    >
                      <dt className="text-gray-300 uppercase tracking-widest text-xxs">
                        {line.label}
                      </dt>
                      <dd
                        className={`font-black text-base ${line.value === '0' ? 'text-success' : 'text-white'}`}
                      >
                        {line.value}
                      </dd>
                    </div>
                  ))}
                </dl>

                <p className="text-gray-300 leading-relaxed font-sans text-sm">
                  {CONTENT.wcag.axeProof.note}
                </p>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </div>
    </Container>
  );
};

export default WcagTerminal;
