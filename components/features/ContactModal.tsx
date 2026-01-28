import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import {
  Send,
  CheckCircle2,
  User,
  Mail,
  Phone,
  ArrowRight,
  ArrowLeft,
  MessageSquare,
  Briefcase,
  Zap,
  AlertCircle,
  Package,
  ExternalLink,
} from 'lucide-react';
import { useModal } from '../../context/ModalContext';
import { leadService, LeadBase, Lead } from '../../services/leadService';
import { ContactType } from '../../types';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: ContactType;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  website_verify?: string; // Honeypot
  website?: string;
  projectType?: string;
  budget?: string;
  deadline?: string;
  message: string;
  privacy: boolean;
  package_name?: string;
  // Dynamic fields
  goal?: string;
  assets?: string;
  traffic?: string;
  scope?: string;
  integrations?: string;
  history?: string;
  tech?: string;
  features?: string;
  users?: string;
  process?: string;
  area?: string;
  appStage?: string;
  auditScope?: string;
}

// SMART FORM CONFIGURATION
const FORM_CONFIG: Record<
  string,
  {
    title: string;
    description: string;
    fields: {
      name: keyof FormData;
      label: string;
      type: 'select' | 'input';
      options?: { value: string; label: string }[];
      placeholder?: string;
    }[];
  }
> = {
  // --- WEB DEVELOPMENT ---
  landing: {
    title: 'Szczegóły Landing Page',
    description: 'Landing ma realizować jeden, konkretny cel. Jaki?',
    fields: [
      {
        name: 'goal',
        label: 'Główny cel strony',
        type: 'select',
        options: [
          { value: 'leads', label: 'Pozyskiwanie kontaktów (Lead Gen)' },
          { value: 'sales', label: 'Sprzedaż produktu (Sales Page)' },
          { value: 'event', label: 'Rejestracja na webinar / event' },
          { value: 'app', label: 'Promocja aplikacji mobilnej' },
        ],
      },
      {
        name: 'assets',
        label: 'Materiały (Teksty/Zdjęcia)',
        type: 'select',
        options: [
          { value: 'ready', label: 'Mam gotowe wszystkie materiały' },
          { value: 'copy', label: 'Potrzebuję copywritingu i tekstów' },
          { value: 'mix', label: 'Mam część, resztę zrobimy razem' },
        ],
      },
      {
        name: 'traffic',
        label: 'Planowane źródło ruchu',
        type: 'select',
        options: [
          { value: 'ads', label: 'Płatne kampanie (Google/Meta Ads)' },
          { value: 'social', label: 'Social Media / Mailing' },
          { value: 'seo', label: 'Ruch organiczny (SEO)' },
          { value: 'unknown', label: 'Nie mam jeszcze planu' },
        ],
      },
    ],
  },
  ecommerce: {
    title: 'Parametry Sklepu',
    description: 'Sklep to nie tylko wygląd, to logistyka. Określmy skalę.',
    fields: [
      {
        name: 'scope',
        label: 'Wielkość asortymentu',
        type: 'select',
        options: [
          { value: 'micro', label: 'Do 50 produktów' },
          { value: 'mid', label: '50 - 1000 produktów' },
          { value: 'large', label: '1000+ produktów (Hurtownia)' },
        ],
      },
      {
        name: 'integrations',
        label: 'Kluczowe integracje',
        type: 'select',
        options: [
          { value: 'basic', label: 'Podstawowe (Płatności, Kurier)' },
          { value: 'erp', label: 'System ERP (Subiekt, Comarch, SAP)' },
          { value: 'market', label: 'Baselinker / Allegro / Amazon' },
        ],
      },
      {
        name: 'history',
        label: 'Status projektu',
        type: 'select',
        options: [
          { value: 'new', label: 'Buduję nowy sklep od zera' },
          { value: 'migration', label: 'Migracja (np. z Shoper/SaaS)' },
          { value: 'redesign', label: 'Przebudowa obecnego sklepu' },
        ],
      },
    ],
  },
  corporate: {
    title: 'Serwis Korporacyjny',
    description: 'Strona firmowa to wizytówka i narzędzie rekrutacji.',
    fields: [
      {
        name: 'area',
        label: 'Zasięg terytorialny',
        type: 'select',
        options: [
          { value: 'pl', label: 'Tylko Polska' },
          { value: 'eu', label: 'Europa (EN + inne języki)' },
          { value: 'global', label: 'Globalny (Multilanguage)' },
        ],
      },
      {
        name: 'features',
        label: 'Moduły specjalne',
        type: 'select',
        options: [
          { value: 'none', label: 'Brak (Strona wizerunkowa)' },
          { value: 'hr', label: 'Kariera / Oferty pracy / ATS' },
          { value: 'b2b', label: 'Strefa Partnera (Logowanie)' },
          { value: 'investor', label: 'Relacje Inwestorskie (Giełda)' },
        ],
      },
      {
        name: 'tech',
        label: 'Zarządzanie treścią',
        type: 'select',
        options: [
          { value: 'wordpress', label: 'WordPress (Samodzielna edycja)' },
          { value: 'headless', label: 'Headless CMS (Bezpieczeństwo)' },
          { value: 'support', label: 'Stała opieka agencji' },
        ],
      },
    ],
  },
  custom: {
    title: 'Aplikacja Dedykowana',
    description: 'Software szyty na miarę. Zdefiniujmy ramy projektu.',
    fields: [
      {
        name: 'appStage',
        label: 'Na jakim jesteś etapie?',
        type: 'select',
        options: [
          { value: 'idea', label: 'Mam pomysł i wizję' },
          { value: 'spec', label: 'Mam specyfikację / makiety' },
          { value: 'mvp', label: 'Mam MVP, chcę skalować' },
        ],
      },
      {
        name: 'process',
        label: 'Główny proces do cyfryzacji',
        type: 'select',
        options: [
          { value: 'b2b', label: 'Sprzedaż / Zamówienia B2B' },
          { value: 'internal', label: 'Zarządzanie firmą / pracownikami' },
          { value: 'saas', label: 'Produkt dla klientów (SaaS)' },
        ],
      },
      {
        name: 'budget',
        label: 'Wstępny budżet (Widełki)',
        type: 'select',
        options: [
          { value: 'mvp', label: 'MVP (30k - 60k PLN)' },
          { value: 'growth', label: 'Growth (60k - 150k PLN)' },
          { value: 'enterprise', label: 'Enterprise (150k PLN +)' },
        ],
      },
    ],
  },

  // --- MARKETING ---
  ads: {
    title: 'Kampanie Reklamowe',
    description: 'Efektywny marketing zaczyna się od matematyki.',
    fields: [
      {
        name: 'budget',
        label: 'Miesięczny budżet mediowy (na kliki)',
        type: 'select',
        options: [
          { value: 'start', label: '2 000 - 5 000 PLN' },
          { value: 'growth', label: '5 000 - 15 000 PLN' },
          { value: 'scale', label: '15 000 PLN +' },
          { value: 'unknown', label: 'Nie wiem, doradźcie mi' },
        ],
      },
      {
        name: 'goal',
        label: 'Co promujemy?',
        type: 'select',
        options: [
          { value: 'services', label: 'Usługi (Lead Generation)' },
          { value: 'ecommerce', label: 'Sklep (E-commerce)' },
          { value: 'app', label: 'Aplikację / SaaS' },
        ],
      },
      {
        name: 'area',
        label: 'Obszar działań',
        type: 'select',
        options: [
          { value: 'local', label: 'Lokalnie (Miasto/Województwo)' },
          { value: 'national', label: 'Cała Polska' },
          { value: 'global', label: 'Zagranica / Global' },
        ],
      },
    ],
  },
  seo: {
    title: 'Pozycjonowanie (SEO)',
    description: 'Darmowy ruch z Google to inwestycja długoterminowa.',
    fields: [
      {
        name: 'website',
        label: 'Adres strony do pozycjonowania',
        type: 'input',
        placeholder: 'https://',
      },
      {
        name: 'history',
        label: 'Historia domeny',
        type: 'select',
        options: [
          { value: 'new', label: 'Nowa domena (świeża)' },
          { value: 'existing', label: 'Istniejąca, pozycjonowana wcześniej' },
          { value: 'penalty', label: 'Po spadkach / karach Google' },
        ],
      },
      {
        name: 'auditScope',
        label: 'Zasięg',
        type: 'select',
        options: [
          { value: 'local', label: 'Lokalne SEO (Mapy)' },
          { value: 'national', label: 'Szerokie (Sklep/Portal)' },
          { value: 'content', label: 'Content Marketing (Blog)' },
        ],
      },
    ],
  },

  // --- DESIGN ---
  branding: {
    title: 'Branding i Design',
    description: 'Wizerunek buduje zaufanie i uzasadnia cenę.',
    fields: [
      {
        name: 'scope',
        label: 'Zakres prac',
        type: 'select',
        options: [
          { value: 'logo', label: 'Tylko Logo + Podstawy' },
          { value: 'identity', label: 'Pełna Identyfikacja (Brand Book)' },
          { value: 'rebranding', label: 'Rebranding (Zmiana wizerunku)' },
        ],
      },
      {
        name: 'assets',
        label: 'Co jest gotowe?',
        type: 'select',
        options: [
          { value: 'name', label: 'Mam nazwę firmy' },
          { value: 'strategy', label: 'Mam strategię marki' },
          { value: 'nothing', label: 'Nic, startuję od zera' },
        ],
      },
    ],
  },
};

const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose, type }) => {
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { additionalData } = useModal();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const isInitialized = React.useRef(false);

  // Helper: reCAPTCHA with timeout
  const executeRecaptchaWithTimeout = async (action: string) => {
    if (!executeRecaptcha) {
      console.warn('reCAPTCHA not ready. Host:', window.location.hostname);
      throw new Error('RECAPTCHA_NOT_READY');
    }

    return Promise.race([
      executeRecaptcha(action),
      new Promise<string>((_, reject) =>
        setTimeout(() => {
          console.error('reCAPTCHA Timeout on host:', window.location.hostname);
          reject(new Error('RECAPTCHA_TIMEOUT'));
        }, 8000),
      ),
    ]);
  };

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  // Determine specific config based on additionalData.specificType
  const specificType = additionalData?.specificType as string | undefined;
  const currentConfig =
    specificType && FORM_CONFIG[specificType] ? FORM_CONFIG[specificType] : null;
  const packageName = additionalData?.package as string | undefined;

  const CALENDAR_IFRAME_SRC =
    'https://calendar.google.com/calendar/appointments/schedules/AcZssZ3BjudwE3-s8uOf_UCGGuNEPZ2We5uAymq1F2rZ1BRU23QreOwcAT6-XwOqeY1QAcD7S_0JL1p3?gv=true';

  // Handle Resumed Lead
  useEffect(() => {
    if (additionalData?.resumedLead && !isInitialized.current) {
      const lead = additionalData.resumedLead as Lead;
      setLeadId(lead.id);

      const initialValues: Partial<FormData> = {
        name: lead.name || '',
        email: lead.email || '',
        phone: lead.phone || '',
        website: lead.website || '',
        budget: lead.budget || '',
        message: lead.message || '',
        privacy: true,
      };

      Object.keys(lead).forEach((key) => {
        if (!['id', 'name', 'email', 'phone', 'website', 'budget', 'message'].includes(key)) {
          // @ts-ignore - dynamic mapping
          initialValues[key] = lead[key];
        }
      });

      reset(initialValues);
      const targetStep = additionalData.step ? Number(additionalData.step) : 2;
      setStep(targetStep);
      isInitialized.current = true;
    }
  }, [additionalData, reset]);

  const nextStep = async () => {
    setSubmitError(null);
    let fieldsToValidate: (keyof FormData)[] = [];
    if (step === 1) fieldsToValidate = ['name', 'email', 'phone', 'privacy'];

    if (step === 2) {
      if (currentConfig) {
        fieldsToValidate = currentConfig.fields.map((f) => f.name);
      } else {
        fieldsToValidate = ['projectType', 'budget', 'website'];
      }
    }

    const isValid = await trigger(fieldsToValidate);

    if (isValid) {
      setIsLoading(true);
      setSubmitError(null);

      try {
        if (step === 1) {
          const values = getValues();
          const leadData: LeadBase = {
            name: values.name,
            email: values.email,
            phone: values.phone,
            service_interest: type,
          };

          if (leadId) {
            await leadService.updateLead(leadId, values, 1);
            setStep(2);
          } else {
            try {
              const token = await executeRecaptchaWithTimeout('create_lead');
              const createdLead = await leadService.createLead({
                ...leadData,
                recaptcha_token: token,
              });

              if (createdLead) {
                setLeadId(createdLead.id);
                setStep(2);
              }
            } catch (err: any) {
              if (err.message === 'RECAPTCHA_TIMEOUT') {
                if (window.location.hostname === 'localhost') {
                  const createdLead = await leadService.createLead({
                    ...leadData,
                    recaptcha_token: 'local_bypass',
                  });
                  if (createdLead) {
                    setLeadId(createdLead.id);
                    setStep(2);
                  }
                } else {
                  setSubmitError(
                    'Weryfikacja bezpieczeństwa (reCAPTCHA) trwała zbyt długo. Odśwież stronę.',
                  );
                }
              } else {
                throw err;
              }
            }
          }
        } else if (step === 2) {
          if (!leadId) {
            setStep(3);
            return;
          }
          const values = getValues();
          await leadService.updateLead(leadId, values, 2);
          setStep(3);
        } else {
          setStep((prev) => prev + 1);
        }
      } catch (error: any) {
        console.error('Form Step Error:', error);
        setSubmitError('Wystąpił błąd podczas zapisywania danych. Spróbuj ponownie.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const prevStep = () => {
    setSubmitError(null);
    setStep((prev) => prev - 1);
  };

  const onSubmit = async (data: FormData) => {
    setSubmitError(null);
    try {
      let token = leadId ? 'existing_lead_verified' : '';
      if (!token) {
        try {
          token = await executeRecaptchaWithTimeout('submit_form');
        } catch (e: any) {
          if (window.location.hostname === 'localhost') {
            token = 'local_bypass';
          } else {
            setSubmitError('Nie można zweryfikować bezpieczeństwa.');
            return;
          }
        }
      }

      // Inject Package info into dedicated field
      const finalData = {
        ...data,
        recaptcha_token: token,
        package_name: packageName,
      };

      if (leadId) {
        await leadService.updateLead(leadId, finalData, 3);
        await leadService.sendNotification(leadId, 'success');
      } else {
        const createdLead = await leadService.createLead({
          name: data.name,
          email: data.email,
          phone: data.phone,
          service_interest: type,
          recaptcha_token: token,
        });
        if (createdLead) {
          await leadService.updateLead(createdLead.id, finalData, 3);
          await leadService.sendNotification(createdLead.id, 'success');
        }
      }
      setIsSubmitted(true);
    } catch (error) {
      console.error('Failed to submit form:', error);
      setSubmitError('Nie udało się wysłać zgłoszenia. Sprawdź połączenie.');
    }
  };

  const handleClose = () => {
    if (leadId && !isSubmitted) {
      if (step === 2) leadService.sendNotification(leadId, 'abandoned_step_1');
      else if (step === 3) leadService.sendNotification(leadId, 'abandoned_step_2');
    }
    onClose();
    setTimeout(() => {
      setStep(1);
      setIsSubmitted(false);
      setLeadId(null);
      setSubmitError(null);
      isInitialized.current = false;
    }, 300);
  };

  // Generic Step 2 fallback
  const getStep2Content = () => {
    switch (type) {
      case 'web':
        return {
          title: 'Szczegóły Projektu WWW',
          typeLabel: 'Typ rozwiązania',
          options: [
            { value: 'landing', label: 'Landing Page' },
            { value: 'corporate', label: 'Strona Firmowa' },
            { value: 'ecommerce', label: 'Sklep Internetowy' },
            { value: 'custom', label: 'System Dedykowany / Web App' },
          ],
        };
      case 'marketing':
        return {
          title: 'Twoje Cele Marketingowe',
          typeLabel: 'Główny kanał',
          options: [
            { value: 'google', label: 'Google Ads' },
            { value: 'meta', label: 'Facebook / Instagram Ads' },
            { value: 'seo', label: 'SEO / Pozycjonowanie' },
            { value: 'full', label: 'Kompleksowa Obsługa 360' },
          ],
        };
      case 'design':
        return {
          title: 'Kierunek Designu',
          typeLabel: 'Zakres prac',
          options: [
            { value: 'branding', label: 'Branding / Logo' },
            { value: 'uiux', label: 'UI/UX Design' },
            { value: 'print', label: 'Materiały Drukowane' },
          ],
        };
      default:
        return null;
    }
  };

  const step2Content = getStep2Content();

  if (isSubmitted) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Zgłoszenie wysłane!" maxWidth="max-w-3xl">
        <div className="text-center py-4 px-2 animate-fade-in">
          <div className="flex flex-col items-center justify-center gap-3 mb-8 text-dark">
            <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-2 shadow-inner border border-green-100">
              <CheckCircle2 size={40} className="animate-scale-in" />
            </div>
            <h3 className="text-3xl font-black tracking-tight">
              Dzięki, {getValues('name')?.split(' ')[0] || 'to wszystko'}!
            </h3>
            <p className="text-gray-700 max-w-md mx-auto font-medium">
              Twój brief trafił do naszego systemu. Wybierz dogodny termin rozmowy poniżej.
            </p>
          </div>
          <div className="w-full h-[400px] md:h-[500px] bg-white rounded-[2rem] overflow-hidden border-2 border-gray-100 shadow-2xl mb-8 group relative text-center flex items-center justify-center">
            <div className="absolute inset-0 bg-tech-grid opacity-5 pointer-events-none"></div>
            <iframe
              src={CALENDAR_IFRAME_SRC}
              style={{ border: 0 }}
              width="100%"
              height="100%"
              frameBorder="0"
              title="Google Calendar Appointment Scheduling"
              className="relative z-10"
            ></iframe>
          </div>
          <button
            onClick={handleClose}
            className="group flex items-center gap-2 mx-auto text-gray-600 text-xs hover:text-secondary transition-all font-black uppercase tracking-[0.2em]"
          >
            <span>Zamknij to okno</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        step === 1
          ? 'Rozpocznijmy współpracę'
          : step === 2
            ? currentConfig?.title || step2Content?.title || 'Szczegóły'
            : 'Ostatni krok'
      }
    >
      <div className="flex justify-between items-center mb-6 md:mb-12 px-4 relative max-w-md mx-auto">
        <div className="absolute top-5 left-0 w-full h-[2px] bg-gray-100 -z-10" />
        <div
          className="absolute top-5 left-0 h-[2px] bg-primary -z-10 transition-all duration-500 ease-out"
          style={{ width: `${((step - 1) / 2) * 100}%` }}
        />
        {[
          { id: 1, label: 'Kontakt', icon: User },
          { id: 2, label: 'Projekt', icon: Briefcase },
          { id: 3, label: 'Cel', icon: MessageSquare },
        ].map((s) => {
          const isActive = step >= s.id;
          const isCurrent = step === s.id;
          return (
            <div
              key={s.id}
              className="flex flex-col items-center gap-2 md:gap-3 bg-white px-2 md:px-4 relative"
            >
              <div
                className={`w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl flex items-center justify-center border-2 transition-all duration-500 ${isActive ? 'bg-dark border-dark text-white shadow-lg' : 'bg-white border-gray-200 text-gray-300'} ${isCurrent ? 'ring-4 ring-primary/20 scale-110 -translate-y-1' : ''}`}
              >
                {isActive && step > s.id ? (
                  <CheckCircle2 size={16} className="md:w-[18px]" />
                ) : (
                  <s.icon size={16} className="md:w-[18px]" />
                )}
              </div>
              <span
                className={`text-xxs md:text-xxs font-black uppercase tracking-widest ${isActive ? 'text-dark' : 'text-gray-300'}`}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-8 md:px-4 pb-4">
        {/* STEP 1 */}
        {step === 1 && (
          <div className="animate-fade-in-up space-y-6">
            <div className="text-center mb-8">
              {leadId ? (
                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl mb-4 animate-fade-in">
                  <p className="text-emerald-700 text-sm font-bold flex items-center justify-center gap-2">
                    <CheckCircle2 size={18} /> Posiadamy już Twoje dane kontaktowe
                  </p>
                  <p className="text-emerald-600 text-[11px] mt-1">
                    Możesz je edytować poniżej lub przejść od razu do szczegółów projektu.
                  </p>
                </div>
              ) : (
                <p className="text-gray-700 text-sm font-medium leading-relaxed">
                  Wypełnij ten krok, abyśmy mogli zapisać Twoje zgłoszenie. <br />
                  <span className="text-primary font-bold">
                    Zajmie Ci to mniej niż 30 sekund.
                  </span>
                </p>
              )}
            </div>
            <Input
              label="Imię i Nazwisko"
              {...register('name', { required: 'Jak mamy się do Ciebie zwracać?' })}
              error={errors.name?.message}
              icon={<User size={18} />}
            />
            <div style={{ display: 'none' }} aria-hidden="true">
              <input {...register('website_verify')} tabIndex={-1} autoComplete="off" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Email"
                type="email"
                {...register('email', {
                  required: 'Potrzebujemy emaila, by wysłać wycenę.',
                  pattern: { value: /^\S+@\S+$/i, message: 'To nie wygląda na poprawny email.' },
                })}
                error={errors.email?.message}
                icon={<Mail size={18} />}
              />
              <Input label="Telefon" type="tel" {...register('phone')} icon={<Phone size={18} />} />
            </div>
            <div className="pt-2 bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <label className="flex items-start gap-4 cursor-pointer group">
                <div className="relative flex items-center mt-1">
                  <input
                    type="checkbox"
                    {...register('privacy', {
                      required: 'Musisz wyrazić zgodę przed rozpoczęciem.',
                    })}
                    className="peer h-6 w-6 cursor-pointer appearance-none rounded-lg border-2 border-gray-200 shadow-sm transition-all checked:border-secondary checked:bg-secondary hover:border-primary"
                  />
                  <CheckCircle2
                    size={14}
                    className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                  />
                </div>
                <span className="text-[11px] text-gray-700 leading-relaxed group-hover:text-gray-700 transition-colors font-medium">
                  Akceptuję{' '}
                  <a
                    href="/privacy-policy"
                    target="_blank"
                    className="text-primary hover:underline font-bold"
                  >
                    Politykę Prywatności
                  </a>{' '}
                  i wyrażam zgodę na przetwarzanie danych.
                </span>
              </label>
              {errors.privacy && (
                <div className="flex items-center gap-1.5 text-xxs font-bold text-red-500 mt-2 pl-10 animate-shake">
                  <AlertCircle size={12} />
                  <span>{errors.privacy.message}</span>
                </div>
              )}
            </div>
            {submitError && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-shake">
                <AlertCircle size={20} className="shrink-0" />
                <p className="text-xs font-bold">{submitError}</p>
              </div>
            )}
            <Button
              type="button"
              onClick={nextStep}
              className="w-full justify-center h-14 text-lg shadow-xl shadow-secondary/20"
              icon={<ArrowRight size={22} />}
              isLoading={isLoading}
            >
              Zapisz i przejdź dalej
            </Button>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="animate-fade-in-up space-y-6">
            <div className="bg-blue-50/30 p-6 rounded-[2rem] border border-primary/20 mb-8">
              <div className="flex items-center gap-3 text-secondary mb-2">
                <Zap size={20} fill="currentColor" />
                <span className="font-bold uppercase tracking-widest text-xs">
                  Szybka Konfiguracja
                </span>
              </div>
              <p className="text-xs text-dark font-medium leading-relaxed">
                {currentConfig ? currentConfig.description : 'Określ parametry projektu.'}
              </p>
              {packageName && (
                <div className="mt-4 flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-primary/30 shadow-sm inline-flex">
                  <Package size={14} className="text-primary" />
                  <span className="text-xxs font-bold text-dark uppercase tracking-wider">
                    Wybrany pakiet: <span className="text-secondary">{packageName}</span>
                  </span>
                </div>
              )}
            </div>

            {currentConfig ? (
              <div className="space-y-4">
                {currentConfig.fields.map((field, idx) => (
                  <div key={idx}>
                    {field.type === 'select' ? (
                      <Select
                        label={field.label}
                        options={field.options || []}
                        {...register(field.name)}
                      />
                    ) : (
                      <Input
                        label={field.label}
                        placeholder={field.placeholder}
                        {...register(field.name)}
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {step2Content ? (
                  <>
                    <Select
                      label={step2Content.typeLabel}
                      options={step2Content.options}
                      {...register('projectType')}
                      disabled={!!additionalData?.projectType}
                      className={additionalData?.projectType ? 'opacity-70' : ''}
                    />
                    <Select
                      label="Przewidywany budżet"
                      options={[
                        { value: 'low', label: 'do 5 000 PLN' },
                        { value: 'mid', label: '5 000 - 15 000 PLN' },
                        { value: 'high', label: '15 000 - 50 000 PLN' },
                        { value: 'enterprise', label: 'powyżej 50 000 PLN' },
                      ]}
                      {...register('budget')}
                    />
                  </>
                ) : (
                  <Input
                    label="Adres obecnej strony (opcjonalnie)"
                    placeholder="https://"
                    {...register('website')}
                    icon={<ExternalLink size={18} />}
                  />
                )}
              </div>
            )}

            {submitError && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-shake">
                <AlertCircle size={20} className="shrink-0" />
                <p className="text-xs font-bold">{submitError}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                icon={<ArrowLeft size={18} />}
                iconPosition="left"
                className="h-14 px-8 font-bold border-2"
              >
                Wstecz
              </Button>
              <Button
                type="button"
                onClick={nextStep}
                className="flex-1 justify-center h-14 text-lg shadow-lg"
                icon={<ArrowRight size={20} />}
              >
                Dalej
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="animate-fade-in-up space-y-6">
            <Input
              label="Opisz swój cel, największe wyzwanie lub dodatkowe uwagi"
              textarea
              rows={4}
              {...register('message', { required: 'Napisz chociaż jedno zdanie o projekcie.' })}
              error={errors.message?.message}
              icon={<MessageSquare size={18} />}
            />
            {submitError && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-shake">
                <AlertCircle size={20} className="shrink-0" />
                <p className="text-xs font-bold">{submitError}</p>
              </div>
            )}
            <div className="pt-4">
              <Button
                type="submit"
                className="w-full justify-center h-14 text-lg shadow-xl shadow-primary/30"
                isLoading={isSubmitting}
                icon={<Send size={22} />}
              >
                Wyślij zgłoszenie
              </Button>
            </div>
            <button
              type="button"
              onClick={prevStep}
              className="w-full text-center text-xxs font-black uppercase tracking-[0.2em] text-gray-600 hover:text-secondary transition-all py-2"
            >
              Edytuj dane
            </button>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default ContactModal;
