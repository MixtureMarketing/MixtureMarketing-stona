import React from 'react';
import {
  Briefcase,
  ArrowRight,
  Calculator,
  AlertTriangle,
  CheckCircle,
  Shield,
  MessageCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../common/Button';
import { useModal } from '../../../context/ModalContext';
import AuditTeaser from '../../features/audit/AuditTeaser';
import { SanityIndustry } from '../../../services/cmsService';

interface PseoIndustryContentProps {
  data: SanityIndustry;
}

const PseoIndustryContent: React.FC<PseoIndustryContentProps> = ({ data }) => {
  const { openModal } = useModal();
  const navigate = useNavigate();

  return (
    <>
      {/* HERO SECTION */}
      <div className="text-center max-w-4xl mx-auto mb-20">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-bold uppercase tracking-wider mb-6">
          <Briefcase size={16} />
          <span>Branża: {data.name}</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold mb-8 text-dark leading-tight">
          Dedykowane rozwiązania IT <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
            {data.forWho}
          </span>
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          Rozumiemy specyfikę Twojego biznesu. Dostarczamy technologie i marketing, które
          odpowiadają na realne wyzwania branży {data.name}.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button onClick={() => openModal('consultation')} icon={<ArrowRight size={18} />}>
            Darmowa Konsultacja
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate('/offers#calculator')}
            icon={<Calculator size={18} />}
          >
            Wyceń projekt
          </Button>
        </div>
      </div>

      {/* Pain Points */}
      {data.painPoints && data.painPoints.length > 0 && (
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Typowe wyzwania w Twojej branży</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {data.painPoints.map((point, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:border-red-100 transition-colors"
              >
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-600 mb-6">
                  <AlertTriangle size={24} />
                </div>
                <p className="text-lg font-medium text-gray-800">{point}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audit Teaser */}
      <div className="mb-20">
        <AuditTeaser
          variant="glass"
          colorScheme="indigo"
          buttonText={`Sprawdź konkurencję w branży: ${data.name}`}
          placeholder="Wpisz adres strony konkurencji..."
        />
      </div>

      {/* Tech Requirements */}
      {data.techRequirements && data.techRequirements.length > 0 && (
        <div className="mb-20 bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Wymagania Techniczne</h2>
              <p className="text-gray-600 mb-8 text-lg">
                Twoja branża wymaga specjalistycznych narzędzi. Nasze rozwiązania są gotowe na:
              </p>
              <ul className="space-y-4">
                {data.techRequirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="text-green-500 shrink-0 mt-1" size={20} />
                    <span className="text-gray-700 font-medium">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Shield className="text-secondary" />
                Bezpieczeństwo i Compliance
              </h3>
              <p className="text-gray-600 mb-4">
                {data.compliance ||
                  'Nasze systemy spełniają najwyższe standardy bezpieczeństwa i są zgodne z aktualnymi regulacjami prawnymi.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Jargon */}
      {data.jargon && data.jargon.length > 0 && (
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-500 uppercase tracking-widest text-sm">
            Mówimy Twoim językiem
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {data.jargon.map((term, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full font-medium border border-blue-100 flex items-center gap-2"
              >
                <MessageCircle size={14} />
                {term}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="text-center bg-dark rounded-3xl p-12 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Zacznijmy współpracę</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Skontaktuj się z nami, aby omówić projekt dla branży {data.name}.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button variant="primary" onClick={() => openModal('consultation')}>
              Umów Rozmowę
            </Button>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-primary rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-secondary rounded-full opacity-40 blur-3xl"></div>
      </div>
    </>
  );
};

export default PseoIndustryContent;
