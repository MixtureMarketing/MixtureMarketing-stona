import React, { useEffect, useState } from 'react';
import { Linkedin, Mail, MapPin, Building2, GraduationCap, Users, Award } from 'lucide-react';
import Seo from '../common/Seo';
import Container from '../common/Container';
import Button from '../common/Button';
import AmbientBackground from '../common/AmbientBackground';
import LazyMap from '../common/LazyMap';
import { useModal } from '../../context/ModalContext';
import { caseStudyService } from '../../services/cms/caseStudyService';
import { client } from '../../services/cms/client';
import imageUrlBuilder from '@sanity/image-url';
import { SanityTeamMember } from '../../types/sanity';
import { SITE_CONFIG } from '../../config/site';

const builder = imageUrlBuilder(client);
const urlFor = (img: SanityTeamMember['image']) =>
  img ? builder.image(img).width(400).height(400).url() : '/assets/images/sygnet.png';

const AboutUs: React.FC = () => {
  const { openModal } = useModal();
  const [team, setTeam] = useState<SanityTeamMember[]>([]);

  useEffect(() => {
    caseStudyService
      .getTeamMembers()
      .then(setTeam)
      .catch(() => setTeam([]));
  }, []);

  // Person schema dla kazdego pracownika - silny sygnal E-E-A-T (Experience+Expertise).
  const personSchemas = team.map((m) => ({
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: m.name,
    jobTitle: m.role,
    worksFor: { '@id': `${SITE_CONFIG.domain}/#organization` },
    image: m.image ? urlFor(m.image) : undefined,
    email: m.email,
    sameAs: m.linkedin ? [m.linkedin] : undefined,
  }));

  return (
    <div className="min-h-screen bg-gray-50 text-dark">
      <Seo
        title="O nas — Zespół Mixture Marketing"
        description="Poznaj zespół Mixture Marketing — agencji marketingowej 360° i software house z Rzeszowa. Łączymy inżynierską precyzję z kreatywnością. Działamy lokalnie na Podkarpaciu i ogólnopolsko."
        canonical="/o-nas/"
        lcpImage="/assets/images/sygnet.png"
        breadcrumbs={[
          { name: 'Strona Główna', item: '/' },
          { name: 'O nas', item: '/o-nas/' },
        ]}
        jsonLd={personSchemas}
      />

      <AmbientBackground />

      <div className="pt-32 pb-20 relative z-10">
        <Container>
          {/* HERO */}
          <div className="max-w-4xl mx-auto text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 text-indigo-800 text-sm font-bold uppercase tracking-wider mb-6">
              <Users size={16} />
              <span>Nasz zespół</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-dark leading-tight">
              Jesteśmy{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                Mixture Marketing
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-4">
              Agencja marketingowa 360° i software house z Rzeszowa. Łączymy inżynierską precyzję
              Software House&apos;u z kreatywnością Agencji Marketingowej.
            </p>
            <p className="text-lg text-gray-500">
              Tworzymy strony, sklepy i aplikacje, prowadzimy performance marketing i projektujemy
              marki — dla firm z Rzeszowa, Podkarpacia i całej Polski.
            </p>
          </div>

          {/* VALUES */}
          <div className="grid md:grid-cols-3 gap-6 mb-20">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center mb-4">
                <Building2 size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Inżynierska precyzja</h3>
              <p className="text-gray-600">
                Każdy projekt traktujemy jak system — z architekturą, dokumentacją, testami i
                metrykami. Bo marketing, który nie da się zmierzyć, nie istnieje.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center mb-4">
                <Award size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Wynik nad vanity metrics</h3>
              <p className="text-gray-600">
                Pracujemy z ROI i ROAS, nie z liczbą polubień. Każda kampania kończy się raportem,
                każda strona ma cel biznesowy.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-orange-100 text-orange-700 rounded-xl flex items-center justify-center mb-4">
                <GraduationCap size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Lokalne korzenie, globalne standardy</h3>
              <p className="text-gray-600">
                Siedziba w Rzeszowie, klienci w całej Polsce. Działamy w ekosystemie Politechniki
                Rzeszowskiej i lokalnej społeczności IT (RzeszowJS, Tech Tuesdays).
              </p>
            </div>
          </div>

          {/* TEAM */}
          {team.length > 0 && (
            <div className="mb-20">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">Poznaj zespół</h2>
              <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto mb-12">
                Ludzie, którzy stoją za każdym projektem. Skontaktuj się bezpośrednio z odpowiednią
                osobą — bez pośredników i call center.
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {team.map((m) => (
                  <article
                    key={m._id}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center"
                  >
                    <img
                      src={urlFor(m.image)}
                      alt={`${m.name}, ${m.role} w Mixture Marketing`}
                      loading="lazy"
                      width={160}
                      height={160}
                      className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                    />
                    <h3 className="text-xl font-bold mb-1">{m.name}</h3>
                    <p className="text-sm text-gray-500 mb-4">{m.role}</p>
                    <div className="flex justify-center gap-3">
                      {m.email && (
                        <a
                          href={`mailto:${m.email}`}
                          aria-label={`Napisz do ${m.name}`}
                          className="w-10 h-10 rounded-full bg-gray-100 hover:bg-primary hover:text-white flex items-center justify-center transition-colors"
                        >
                          <Mail size={18} />
                        </a>
                      )}
                      {m.linkedin && (
                        <a
                          href={m.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`LinkedIn — ${m.name}`}
                          className="w-10 h-10 rounded-full bg-gray-100 hover:bg-[#0A66C2] hover:text-white flex items-center justify-center transition-colors"
                        >
                          <Linkedin size={18} />
                        </a>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* OFFICE / LOCATION */}
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100 mb-20">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-100 text-rose-800 text-xs font-bold uppercase tracking-wider mb-4">
                  <MapPin size={14} />
                  <span>Nasze biuro</span>
                </div>
                <h2 className="text-3xl font-bold mb-4">Rzeszów — gdzie się spotykamy</h2>
                <p className="text-gray-600 mb-2">
                  <strong>{SITE_CONFIG.companyName}</strong>
                </p>
                <p className="text-gray-600 mb-2">
                  {SITE_CONFIG.contact.address.street}
                  <br />
                  {SITE_CONFIG.contact.address.postalCode} {SITE_CONFIG.contact.address.city}
                </p>
                <p className="text-gray-600 mb-1">
                  Telefon:{' '}
                  <a
                    href={`tel:${SITE_CONFIG.contact.phoneFull}`}
                    className="text-primary hover:underline"
                  >
                    {SITE_CONFIG.contact.phone}
                  </a>
                </p>
                <p className="text-gray-600 mb-4">
                  E-mail:{' '}
                  <a
                    href={`mailto:${SITE_CONFIG.contact.email}`}
                    className="text-primary hover:underline"
                  >
                    {SITE_CONFIG.contact.email}
                  </a>
                </p>
                <p className="text-sm text-gray-500">
                  NIP: {SITE_CONFIG.contact.vatID} · Spotkania na żywo w biurze po umówieniu lub w
                  wybranej kawiarni w centrum miasta. Pn–Pt 9:00–17:00.
                </p>
              </div>
              <div className="rounded-2xl overflow-hidden border border-gray-200 aspect-video">
                <LazyMap
                  src="https://www.google.com/maps?q=Al.+J%C3%B3zefa+Pi%C5%82sudskiego+17,+35-074+Rzesz%C3%B3w&output=embed"
                  title="Mapa — siedziba Mixture Marketing w Rzeszowie"
                />
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center bg-dark rounded-3xl p-12 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Porozmawiajmy o Twoim projekcie
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Bezpłatna konsultacja (45-60 min) — online, u Ciebie w siedzibie lub w neutralnej
                lokalizacji w centrum Rzeszowa. Bez zobowiązań i bez sztywnej oferty na siłę.
              </p>
              <Button variant="primary" onClick={() => openModal('general')}>
                Umów konsultację
              </Button>
            </div>
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-primary rounded-full opacity-20 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-secondary rounded-full opacity-40 blur-3xl"></div>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default AboutUs;
