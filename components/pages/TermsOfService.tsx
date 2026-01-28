/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import {
  Shield,
  Lock,
  FileText,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Server,
  ShieldAlert,
  Scale,
  Copyright,
  Gavel,
} from 'lucide-react';
import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import Seo from '../common/Seo';
import { TERMS_CONTENT } from '../../data/content';

const TermsOfService: React.FC = () => {
  const { seo, header, sections, footer } = TERMS_CONTENT;

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <Seo title={seo.title} description={seo.description} image={seo.image} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <SectionHeader title={header.title} subtitle={header.subtitle} center level="h1" />

        <div className="mt-12 bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 space-y-10 text-gray-700 leading-relaxed font-sans">
          {/* 1. Postanowienia Ogólne */}
          <section>
            <h2 className="text-xl font-bold text-dark mb-4 flex items-center gap-2">
              <FileText size={24} className="text-accent-dark" /> {sections.general.title}
            </h2>
            {sections.general.content.map((p, i) => (
              <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
            ))}
          </section>

          {/* 2. Rodzaje i zakres usług */}
          <section>
            <h2 className="text-xl font-bold text-dark mb-4 flex items-center gap-2">
              <Server size={24} className="text-primary" /> {sections.services.title}
            </h2>
            <p className="mb-2 text-sm font-bold text-secondary uppercase tracking-wider">
              {sections.services.intro}
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm md:text-base">
              {sections.services.list.map((item, i) => (
                <li key={i}>
                  <strong>{item.bold}</strong> {item.text}
                </li>
              ))}
            </ul>
            <p className="mt-4 p-4 bg-[#F0F7FF] rounded-2xl border border-primary/20 text-sm">
              {sections.services.outro}
            </p>
          </section>

          {/* 3. Obowiązki Użytkownika */}
          <section>
            <h2 className="text-xl font-bold text-dark mb-4 flex items-center gap-2">
              <ShieldAlert size={24} className="text-primary" /> {sections.userObligations.title}
            </h2>
            <p className="mb-2">{sections.userObligations.intro}</p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {sections.userObligations.list.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </section>

          {/* 4. Wymagania Techniczne */}
          <section>
            <h2 className="text-xl font-bold text-dark mb-4 flex items-center gap-2">
              <AlertCircle size={24} className="text-primary" /> {sections.technical.title}
            </h2>
            <p>{sections.technical.intro}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              {sections.technical.grid.map((col, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-xl text-xs font-mono">
                  {col.map((line, j) => (
                    <React.Fragment key={j}>
                      {line}
                      <br />
                    </React.Fragment>
                  ))}
                </div>
              ))}
            </div>
          </section>

          {/* 5. Reklamacje i Rekonstrukcja */}
          <section>
            <h2 className="text-xl font-bold text-dark mb-4 flex items-center gap-2">
              <Scale size={24} className="text-primary" /> {sections.complaints.title}
            </h2>
            <p className="mb-4" dangerouslySetInnerHTML={{ __html: sections.complaints.intro }} />
            <div className="p-5 bg-[#F9FAFB] rounded-2xl border border-gray-100 space-y-2 text-sm">
              {sections.complaints.steps.map((step, i) => (
                <p key={i} dangerouslySetInnerHTML={{ __html: step }} />
              ))}
            </div>
          </section>

          {/* 6. Własność Intelektualna */}
          <section>
            <h2 className="text-xl font-bold text-dark mb-4 flex items-center gap-2">
              <Copyright size={24} className="text-primary" /> {sections.ip.title}
            </h2>
            <p>{sections.ip.text}</p>
          </section>

          {/* 7. Pozasądowe Rozwiązywanie Sporów */}
          <section>
            <h2 className="text-xl font-bold text-dark mb-4 flex items-center gap-2">
              <Gavel size={24} className="text-primary" /> {sections.disputes.title}
            </h2>
            <p>
              {sections.disputes.text}
              <a
                href={sections.disputes.link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#2563EB] underline hover:text-blue-800 ml-1"
              >
                {sections.disputes.link.label}
              </a>
            </p>
          </section>

          <div className="pt-8 border-t border-gray-100 text-xs text-gray-900 flex flex-col md:flex-row justify-between gap-2">
            <span>Ostatnia aktualizacja: {new Date().toLocaleDateString('pl-PL')}</span>
            <span className="font-mono">{footer.omnibus}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
