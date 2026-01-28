import React from 'react';
import {
  Shield,
  Lock,
  Eye,
  Server,
  Cookie,
  HelpCircle,
  FileText,
  Globe,
  CheckCircle2,
} from 'lucide-react';
import SectionHeader from '../common/SectionHeader';
import Seo from '../common/Seo';
import { PRIVACY_POLICY_CONTENT as CONTENT } from '../../data/content';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <Seo
        title={CONTENT.seo.title}
        description={CONTENT.seo.description}
        image={CONTENT.seo.image}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <SectionHeader
          title={CONTENT.header.title}
          subtitle={CONTENT.header.subtitle}
          center
          level="h1"
        />

        <div className="mt-12 bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 space-y-10 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-dark mb-4 flex items-center gap-2">
              <Shield size={24} className="text-accent-dark" /> {CONTENT.admin.title}
            </h2>
            {CONTENT.admin.content.map((p, i) => (
              <p
                key={i}
                className={i === 1 ? 'mt-2' : ''}
                dangerouslySetInnerHTML={{ __html: p }}
              />
            ))}
          </section>

          <section>
            <h2 className="text-xl font-bold text-dark mb-4 flex items-center gap-2">
              <FileText size={24} className="text-primary" /> {CONTENT.purpose.title}
            </h2>
            <p className="mb-4">{CONTENT.purpose.intro}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CONTENT.purpose.cards.map((card, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-sm">
                  <span className="font-bold text-dark block mb-1">{card.title}</span>
                  {card.desc}
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-dark mb-4 flex items-center gap-2">
              <Server size={24} className="text-primary" /> {CONTENT.data.title}
            </h2>
            <p className="mb-2">{CONTENT.data.intro}</p>
            <ul className="list-disc pl-5 space-y-1 mb-4">
              {CONTENT.data.list.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <p className="font-bold text-dark mb-2">{CONTENT.data.retention.title}</p>
            <p>{CONTENT.data.retention.text}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-dark mb-4 flex items-center gap-2">
              <Cookie size={24} className="text-primary" /> {CONTENT.cookies.title}
            </h2>
            <p>{CONTENT.cookies.intro}</p>
            <div className="mt-4 space-y-4">
              {CONTENT.cookies.boxes.map((box, i) => (
                <div
                  key={i}
                  className={`p-4 border-l-4 ${box.color === 'blue' ? 'border-primary bg-blue-50' : 'border-instagram bg-pink-50'} text-sm`}
                >
                  <span className="font-bold block text-dark mb-1">{box.title}</span>
                  {box.text}
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-dark mb-4 flex items-center gap-2">
              <Lock size={24} className="text-primary" /> {CONTENT.rights.title}
            </h2>
            <p className="mb-4">{CONTENT.rights.intro}</p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 list-none font-medium text-sm">
              {CONTENT.rights.list.map((item, i) => (
                <li key={i} className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-success" /> {item}
                </li>
              ))}
            </ul>
            <p
              className="mt-6 text-sm"
              dangerouslySetInnerHTML={{ __html: CONTENT.rights.complaint }}
            />
          </section>

          <section>
            <h2 className="text-xl font-bold text-dark mb-4 flex items-center gap-2">
              <Globe size={24} className="text-accent-dark" /> {CONTENT.transfer.title}
            </h2>
            <p>{CONTENT.transfer.text}</p>
          </section>

          <div className="pt-8 border-t border-gray-100 text-xs text-gray-900 flex justify-between items-center">
            <span>Ostatnia aktualizacja: {new Date().toLocaleDateString('pl-PL')}</span>
            <span className="font-mono">{CONTENT.footer.version}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
