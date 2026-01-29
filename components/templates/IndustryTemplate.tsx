import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { cmsService, SanityIndustry, client } from '../../services/cmsService';
import Seo from '../common/Seo';
import NotFound from '../common/NotFound';
import AmbientBackground from '../common/AmbientBackground';
import {
  Briefcase,
  AlertTriangle,
  CheckCircle,
  Shield,
  MessageCircle,
  Calculator,
  ArrowRight,
} from 'lucide-react';
import Button from '../common/Button';
import { useModal } from '../../context/ModalContext';
import imageUrlBuilder from '@sanity/image-url';
import { SanityImage } from '../../types/sanity';

import AuditTeaser from '../features/audit/AuditTeaser';
import { usePseoData } from '../../hooks/usePseoData';

const builder = imageUrlBuilder(client);
function urlFor(source: SanityImage) {
  return builder.image(source);
}

const IndustryTemplate = () => {
  const { slug } = useParams<{ slug: string }>();
  const {
    data: industry,
    loading,
    error,
  } = usePseoData<SanityIndustry>(slug, cmsService.getIndustryBySlug);
  const { openModal } = useModal();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="pt-32 pb-20 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center mb-20 space-y-6">
            <div className="w-48 h-10 bg-gray-200 animate-pulse rounded-full mx-auto"></div>
            <div className="w-full h-16 bg-gray-200 animate-pulse rounded-xl"></div>
            <div className="w-2/3 h-10 bg-gray-200 animate-pulse rounded-lg mx-auto"></div>
            <div className="flex justify-center gap-4">
              <div className="w-40 h-12 bg-gray-200 animate-pulse rounded-lg"></div>
              <div className="w-40 h-12 bg-gray-200 animate-pulse rounded-lg"></div>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            <div className="h-48 bg-gray-200 animate-pulse rounded-2xl"></div>
            <div className="h-48 bg-gray-200 animate-pulse rounded-2xl"></div>
            <div className="h-48 bg-gray-200 animate-pulse rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !industry) {
    return <NotFound />;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-dark">
      <Seo
        title={`Marketing i Strony WWW dla ${industry.forWho}`}
        description={`Specjalistyczne usługi IT i marketingu dla branży: ${industry.name}. Rozwiązujemy problemy: ${industry.painPoints?.slice(0, 2).join(', ')}.`}
        lcpImage={
          industry.heroImage?.asset?._ref
            ? urlFor(industry.heroImage).width(1200).url()
            : '/assets/images/sygnet.png'
        }
      />

      <AmbientBackground />

      <div className="pt-32 pb-20 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center max-w-4xl mx-auto mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-bold uppercase tracking-wider mb-6">
              <Briefcase size={16} />
              <span>Branża: {industry.name}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-8 text-dark leading-tight">
              Dedykowane rozwiązania IT <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                {industry.forWho}
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Rozumiemy specyfikę Twojego biznesu. Dostarczamy technologie i marketing, które
              odpowiadają na realne wyzwania branży {industry.name}.
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

          {/* Pain Points Section */}
          {industry.painPoints && industry.painPoints.length > 0 && (
            <div className="mb-20">
              <h2 className="text-3xl font-bold text-center mb-12">
                Typowe wyzwania w Twojej branży
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                {industry.painPoints.map((point, index) => (
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

          {/* AUDIT TEASER (Compare) */}
          <div className="mb-20">
            <AuditTeaser
              variant="glass"
              colorScheme="indigo"
              buttonText={`Sprawdź konkurencję w branży: ${industry.name}`}
              placeholder="Wpisz adres strony konkurencji..."
            />
          </div>

          {/* Tech Requirements Section */}
          {industry.techRequirements && industry.techRequirements.length > 0 && (
            <div className="mb-20 bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl font-bold mb-6">Wymagania Techniczne</h2>
                  <p className="text-gray-600 mb-8 text-lg">
                    Twoja branża wymaga specjalistycznych narzędzi. Nasze rozwiązania są gotowe na:
                  </p>
                  <ul className="space-y-4">
                    {industry.techRequirements.map((req, index) => (
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
                    {industry.compliance ||
                      'Nasze systemy spełniają najwyższe standardy bezpieczeństwa i są zgodne z aktualnymi regulacjami prawnymi.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Jargon Section */}
          {industry.jargon && industry.jargon.length > 0 && (
            <div className="mb-20">
              <h2 className="text-2xl font-bold text-center mb-8 text-gray-500 uppercase tracking-widest text-sm">
                Mówimy Twoim językiem
              </h2>
              <div className="flex flex-wrap justify-center gap-4">
                {industry.jargon.map((term, index) => (
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
                Skontaktuj się z nami, aby omówić projekt dla branży {industry.name}.
              </p>
              <Button variant="primary" onClick={() => openModal('consultation')}>
                Umów Rozmowę
              </Button>
            </div>
            {/* Decorative circle */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-primary rounded-full opacity-20 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-secondary rounded-full opacity-40 blur-3xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndustryTemplate;
