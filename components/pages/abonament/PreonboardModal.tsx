/* eslint-disable max-lines -- modal z form + walidacja + 2-step API + error handling */
import React, { useEffect, useRef, useState } from 'react';
import { X, Loader2, AlertTriangle, ShieldCheck, ArrowRight, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { trackEvent } from '../../../utils/analytics';

export type AbonamentTier = 'starter' | 'standard' | 'premium' | 'professional';

interface TierConfig {
  id: AbonamentTier;
  name: string;
  price: number;
  priceGross: number;
  ctaPriceLabel: string;
  hint?: string;
}

// Track 25 (2026-05-19): ceny 149/199/299 → 179/249/349 + Professional 549.
const TIERS: Record<AbonamentTier, TierConfig> = {
  starter: { id: 'starter', name: 'Starter', price: 179, priceGross: 220, ctaPriceLabel: '179 zł' },
  standard: {
    id: 'standard',
    name: 'Standard',
    price: 249,
    priceGross: 306,
    ctaPriceLabel: '249 zł',
  },
  premium: { id: 'premium', name: 'Premium', price: 349, priceGross: 429, ctaPriceLabel: '349 zł' },
  professional: {
    id: 'professional',
    name: 'Professional',
    price: 549,
    priceGross: 675,
    ctaPriceLabel: '549 zł',
    hint: 'B2B regulowane (prawnik / lekarz / księgowy)',
  },
};

// Konfiguracja wstrzykiwana przy build z .env.local (Vite inline'uje env vars).
// CF Pages dashboard musi miec te same wartosci w Environment Variables.
const HUB =
  (import.meta.env.VITE_MM_HUB_URL as string | undefined) || 'https://api.mixturemarketing.pl';
const PANEL_URL = 'https://panel.mixturemarketing.pl/login';
const PREONBOARD_KEY = import.meta.env.VITE_MM_PREONBOARD_KEY as string | undefined;
const CONSENT_TEXT_VERSION = 'v1.0';

interface PreonboardModalProps {
  tier: AbonamentTier | null;
  onClose: () => void;
}

// PL phone auto-mask: parsuje cokolwiek user wpisze, normalizuje do +48 + 9 cyfr.
// "600 100 200" → "+48600100200", "+48 600-100-200" → "+48600100200", "48 6001..." → "+486001..."
const normalizePhone = (raw: string): string => {
  const digitsOnly = raw.replace(/\D/g, '');
  if (!digitsOnly) return '';
  // Jesli zaczyna sie od 48 i ma 11 cyfr — to PL z prefiksem.
  if (digitsOnly.startsWith('48') && digitsOnly.length === 11) return '+' + digitsOnly;
  // Jesli ma 9 cyfr — dodaj +48.
  if (digitsOnly.length === 9) return '+48' + digitsOnly;
  // Inne — uzytkownik wpisal cos miedzynarodowego, zachowaj + jesli byl.
  return raw.trim().startsWith('+')
    ? '+' + digitsOnly
    : digitsOnly.length > 9
      ? '+' + digitsOnly
      : '+48' + digitsOnly;
};
const isValidPhoneE164 = (v: string) => /^\+\d{8,15}$/.test(v);

// Display formatter: "+48600100200" → "+48 600 100 200" (user-friendly podgląd)
const formatPhoneDisplay = (v: string): string => {
  const norm = v.replace(/\s/g, '');
  if (norm.startsWith('+48') && norm.length >= 6) {
    const rest = norm.slice(3);
    return '+48 ' + rest.replace(/(\d{3})(?=\d)/g, '$1 ').trim();
  }
  return v;
};

interface ErrorBody {
  ok: false;
  error?: { code?: string; message?: string };
}
interface OkBody<T> {
  ok: true;
  data: T;
}

// H1: draft persistence — przeżywa errors sieciowe, Stripe cancel, accidental close
const DRAFT_KEY = 'mm_preonboard_draft';
interface DraftShape {
  businessName: string;
  email: string;
  phone: string;
  nip: string;
  consentMarketing: boolean;
  selectedTier: AbonamentTier | null;
}
const readDraft = (): Partial<DraftShape> => {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Partial<DraftShape>;
  } catch {
    return {};
  }
};
const writeDraft = (d: Partial<DraftShape>) => {
  try {
    const current = readDraft();
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ ...current, ...d }));
  } catch {
    /* ignore quota / private mode */
  }
};
const clearDraft = () => {
  try {
    sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    /* ignore */
  }
};

// H2: inline validators (zwracają komunikat lub null gdy OK)
const validateBusinessName = (v: string): string | null => {
  if (!v.trim()) return 'Podaj nazwę firmy.';
  if (v.trim().length > 200) return 'Nazwa firmy jest za długa (max 200 znaków).';
  return null;
};
const validateEmail = (v: string): string | null => {
  if (!v.trim()) return 'Wpisz adres email.';
  if (!v.includes('@')) return 'Brak znaku @. Np. biuro@twojafirma.pl';
  if (!v.includes('.')) return 'Brak kropki w domenie. Np. biuro@twojafirma.pl';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Sprawdź format. Np. biuro@twojafirma.pl';
  return null;
};
const validatePhone = (v: string): string | null => {
  const digits = v.replace(/\D/g, '');
  if (digits.length === 0) return 'Wpisz numer telefonu. Np. 600 100 200.';
  if (digits.length < 9) return `${digits.length}/9 cyfr — w Polsce numer ma 9 cyfr.`;
  // pełna normalizacja — sprawdzi +48 logikę
  return null;
};
const validateNip = (v: string): string | null => {
  if (v.length === 0) return 'Wpisz NIP firmy — potrzebny do faktury VAT.';
  if (v.length < 10) return `${v.length}/10 cyfr — w PL NIP ma 10 cyfr.`;
  if (!/^\d{10}$/.test(v)) return 'NIP to 10 cyfr (bez myślników).';
  return null;
};

const PreonboardModal: React.FC<PreonboardModalProps> = ({ tier, onClose }) => {
  // H1: hydratacja z sessionStorage — przeżywa Stripe cancel + accidental close
  const draft = readDraft();
  const [selectedTier, setSelectedTier] = useState<AbonamentTier | null>(
    tier || draft.selectedTier || null,
  );
  const [businessName, setBusinessName] = useState(draft.businessName || '');
  const [email, setEmail] = useState(draft.email || '');
  const [phone, setPhone] = useState(draft.phone || '+48 ');
  const [nip, setNip] = useState(draft.nip || '');
  const [consentProcessing, setConsentProcessing] = useState(false); // świadomy opt-in, nie persistujemy
  const [consentMarketing, setConsentMarketing] = useState(draft.consentMarketing || false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCta, setErrorCta] = useState<'panel' | null>(null);
  // H2: per-pole errors widoczne pod inputem (touched=true po blur)
  const [fieldErrors, setFieldErrors] = useState<{
    businessName?: string;
    email?: string;
    phone?: string;
    nip?: string;
  }>({});
  const dialogRef = useRef<HTMLDialogElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Sync selectedTier gdy prop się zmieni (np. user kliknął inny tier card)
  useEffect(() => {
    if (tier) setSelectedTier(tier);
  }, [tier]);

  // H1: zapisuj draft do sessionStorage przy każdej zmianie (poza consentProcessing — wymaga świadomego klik per session)
  useEffect(() => {
    writeDraft({ businessName, email, phone, nip, consentMarketing, selectedTier });
  }, [businessName, email, phone, nip, consentMarketing, selectedTier]);

  // Native <dialog>: showModal() daje za darmo focus trap, ESC, inert background, Top Layer.
  // Defensive guard: jsdom (vitest) nie implementuje showModal/close — fallback ustawia
  // `open` attribute, zachowuje funkcjonalnosc komponentu w testach bez crashy.
  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    if (tier && !dlg.open) {
      if (typeof dlg.showModal === 'function') {
        dlg.showModal();
      } else {
        dlg.setAttribute('open', '');
      }
      // Mały delay żeby screen reader zdążył odczytać dialog title przed focusem inputu
      const t = setTimeout(() => firstInputRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
    if (!tier && dlg.open) {
      if (typeof dlg.close === 'function') {
        dlg.close();
      } else {
        dlg.removeAttribute('open');
      }
    }
  }, [tier]);

  if (!tier || !selectedTier) return null;
  const tierCfg = TIERS[selectedTier];

  const handlePhoneChange = (raw: string) => {
    // Pozwalamy uzytkownikowi pisac swobodnie, ale czyscimy znaki niepoprawne.
    const cleaned = raw.replace(/[^\d+\s]/g, '');
    setPhone(cleaned);
  };

  const handleNipChange = (raw: string) => {
    // Tylko cyfry, max 10
    const digitsOnly = raw.replace(/\D/g, '').slice(0, 10);
    setNip(digitsOnly);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setErrorCta(null);
    const tier = selectedTier as AbonamentTier;
    trackEvent('submit_preonboard_attempt', { tier });

    // H2: walidacja wszystkich pól na raz przy submit, błędy widoczne inline pod każdym
    const phoneNormalized = normalizePhone(phone);
    const newFieldErrors = {
      businessName: validateBusinessName(businessName) || undefined,
      email: validateEmail(email) || undefined,
      phone:
        validatePhone(phone) ||
        (isValidPhoneE164(phoneNormalized) ? undefined : 'Numer wygląda dziwnie.'),
      nip: validateNip(nip) || undefined,
    };
    setFieldErrors(newFieldErrors);

    const firstError = Object.entries(newFieldErrors).find(([, v]) => v);
    if (firstError) {
      trackEvent('preonboard_error', {
        tier,
        error_code: 'VALIDATION',
        field: firstError[0],
      });
      // Focus pierwszego pola z błędem
      const fieldId = `pb-${firstError[0].replace('businessName', 'business')}`;
      const el = document.getElementById(fieldId) as HTMLInputElement | null;
      el?.focus();
      return;
    }

    if (!consentProcessing) {
      trackEvent('preonboard_error', { tier, error_code: 'VALIDATION', field: 'consent' });
      return setError('Aby kontynuować, zaakceptuj regulamin i zgodę na przetwarzanie danych.');
    }

    if (!PREONBOARD_KEY) {
      trackEvent('preonboard_error', { tier, error_code: 'NO_KEY' });
      setError('Konfiguracja płatności w toku. Skontaktuj się z nami: info@mixturemarketing.pl');
      return;
    }

    setSubmitting(true);
    try {
      // ===== 1. Preonboard =====
      const preRes = await fetch(`${HUB}/api/admin/preonboard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-BP-Preonboard-Key': PREONBOARD_KEY,
        },
        body: JSON.stringify({
          business_name: businessName.trim(),
          email: email.trim(),
          phone: phoneNormalized,
          nip,
          tier,
          consent_processing: consentProcessing,
          consent_marketing: consentMarketing,
          consent_text_version: CONSENT_TEXT_VERSION,
        }),
      });

      const preJson = (await preRes.json().catch(() => ({}))) as
        | OkBody<{ client_id: string; already_exists?: boolean }>
        | ErrorBody;

      if (!preRes.ok || preJson.ok !== true) {
        const errCode = (preJson as ErrorBody).error?.code;
        const errMsg = (preJson as ErrorBody).error?.message || '';
        trackEvent('preonboard_error', {
          tier,
          error_code: errCode || 'HTTP_' + preRes.status,
          http_status: preRes.status,
        });

        if (errMsg.toLowerCase().includes('nip')) {
          setErrorCta('panel');
          throw new Error(
            'Ten NIP jest już zarejestrowany w naszym systemie. Jeśli to Twoja firma — zaloguj się do panelu klienta.',
          );
        }
        if (errCode === 'RATE_LIMITED' || preRes.status === 429) {
          throw new Error('Za dużo prób w krótkim czasie. Spróbuj ponownie za godzinę.');
        }
        if (errCode === 'VALIDATION_ERROR' || preRes.status === 422) {
          throw new Error(errMsg || 'Sprawdź poprawność wypełnionych pól.');
        }
        if (errCode?.startsWith('AUTH_') || preRes.status === 401 || preRes.status === 403) {
          throw new Error(
            'Konfiguracja płatności jest tymczasowo niedostępna. Napisz: info@mixturemarketing.pl',
          );
        }
        if (!navigator.onLine) {
          throw new Error('Brak połączenia z internetem. Sprawdź sieć i spróbuj ponownie.');
        }
        throw new Error(errMsg || `Nie udało się utworzyć konta (HTTP ${preRes.status}).`);
      }

      const clientId = preJson.data.client_id;
      if (!clientId)
        throw new Error('Hub nie zwrócił client_id. Skontaktuj się: info@mixturemarketing.pl');

      // ===== 2. Stripe Checkout =====
      // UTM persistence: jeśli sessionStorage ma zapisane utm, przekaż do Stripe success URL.
      const utmStored = (() => {
        try {
          return sessionStorage.getItem('mm_utm') || '';
        } catch {
          return '';
        }
      })();
      const successPath = utmStored
        ? `/abonament/dziekujemy?sid={CHECKOUT_SESSION_ID}&${utmStored}`
        : '/abonament/dziekujemy?sid={CHECKOUT_SESSION_ID}';

      const checkoutRes = await fetch(`${HUB}/api/admin/stripe/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-BP-Preonboard-Key': PREONBOARD_KEY,
        },
        body: JSON.stringify({
          client_id: clientId,
          tier,
          customer_email: email.trim(),
          success_path: successPath,
          cancel_path: '/abonament?stripe=canceled',
        }),
      });

      const checkoutJson = (await checkoutRes.json().catch(() => ({}))) as
        | OkBody<{ url: string; session_id?: string }>
        | ErrorBody;

      if (!checkoutRes.ok || checkoutJson.ok !== true) {
        const errMsg = (checkoutJson as ErrorBody).error?.message || '';
        trackEvent('preonboard_error', {
          tier,
          error_code: 'CHECKOUT_FAILED',
          http_status: checkoutRes.status,
        });
        throw new Error(
          errMsg || `Nie udało się rozpocząć płatności (HTTP ${checkoutRes.status}).`,
        );
      }

      const url = checkoutJson.data.url;
      if (!url)
        throw new Error('Brak adresu Stripe Checkout. Skontaktuj się: info@mixturemarketing.pl');

      trackEvent('stripe_redirect', {
        tier,
        client_id: clientId,
        price_pln: tierCfg.price,
      });

      // ===== 3. Redirect do Stripe =====
      clearDraft(); // H1: user dotarł do Stripe — draft niepotrzebny
      window.location.href = url;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Nieznany błąd. Spróbuj ponownie.';
      setError(message);
      setSubmitting(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => {
        // Backdrop click: native dialog::backdrop nie jest dzieckiem, więc target === dialog element
        // gdy kliknięto poza wewnętrzny kontener.
        if (e.target === dialogRef.current) onClose();
      }}
      aria-labelledby="preonboard-title"
      aria-describedby="preonboard-desc"
      className="preonboard-dialog fixed inset-0 m-0 p-0 w-full h-full max-w-none max-h-none bg-transparent open:flex hidden items-end sm:items-center justify-center sm:p-4 backdrop:bg-dark/60 backdrop:backdrop-blur-sm"
    >
      <div className="relative bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden focus:outline-none">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-emerald-600 to-emerald-700 text-white p-6 sm:p-8">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
            aria-label="Zamknij okno"
          >
            <X size={18} aria-hidden="true" />
          </button>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-100 mb-2">
            Pakiet · {tierCfg.name}
          </p>
          <h2
            id="preonboard-title"
            className="text-2xl sm:text-3xl font-extrabold leading-tight mb-1"
          >
            {tierCfg.price} zł / mc netto
          </h2>
          <p className="text-xs text-emerald-100/80 mb-2">
            ({tierCfg.priceGross} zł brutto · faktura VAT w panelu)
          </p>
          <p id="preonboard-desc" className="text-sm text-emerald-50">
            4 pola. 60 sekund. Płatność kartą przez Stripe.
          </p>
        </div>

        {/* Brak klucza preonboard? — gate przed formularzem */}
        {!PREONBOARD_KEY && (
          <div className="p-6 sm:p-8">
            <div
              className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm"
              role="alert"
            >
              <AlertTriangle size={18} className="shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="font-bold mb-1">Płatności online uruchamiamy wkrótce</p>
                <p>
                  Aby zarezerwować pakiet już teraz, napisz:{' '}
                  <a
                    href={`mailto:info@mixturemarketing.pl?subject=Rezerwacja%20pakietu%20${tierCfg.name}`}
                    className="font-semibold underline"
                  >
                    info@mixturemarketing.pl
                  </a>{' '}
                  lub zadzwoń{' '}
                  <a href="tel:+48794443551" className="font-semibold underline">
                    +48 794 443 551
                  </a>
                  . Przyjmiemy Cię ręcznie do programu pilotażowego.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form (rendered tylko gdy mamy klucz) */}
        {PREONBOARD_KEY && (
          <form
            onSubmit={handleSubmit}
            className="p-6 sm:p-8 space-y-4 max-h-[70vh] overflow-y-auto"
          >
            {/* Tier select — uzytkownik moze zmienic pakiet po otwarciu modalu */}
            <div>
              <label htmlFor="pb-tier" className="block text-sm font-semibold text-dark mb-1.5">
                Wybrany pakiet{' '}
                <span className="text-rose-500" aria-label="wymagane">
                  *
                </span>
              </label>
              <select
                id="pb-tier"
                required
                value={selectedTier || ''}
                onChange={(e) => setSelectedTier(e.target.value as AbonamentTier)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-colors text-dark bg-white"
              >
                <option value="" disabled>
                  — wybierz pakiet —
                </option>
                <option value="starter">Starter — 179 zł/mc (mikrofirmy)</option>
                <option value="standard">Standard — 249 zł/mc (rozwijające się)</option>
                <option value="premium">Premium — 349 zł/mc (wielolokalizacyjne)</option>
                <option value="professional">Professional — 549 zł/mc (B2B regulowane)</option>
              </select>
              {tierCfg.hint && <p className="text-xs text-gray-500 mt-1">{tierCfg.hint}</p>}
            </div>

            <div>
              <label htmlFor="pb-business" className="block text-sm font-semibold text-dark mb-1.5">
                Nazwa firmy{' '}
                <span className="text-rose-500" aria-label="wymagane">
                  *
                </span>
              </label>
              <input
                ref={firstInputRef}
                id="pb-business"
                type="text"
                required
                maxLength={200}
                value={businessName}
                onChange={(e) => {
                  setBusinessName(e.target.value);
                  if (fieldErrors.businessName)
                    setFieldErrors((p) => ({ ...p, businessName: undefined }));
                }}
                onBlur={() =>
                  setFieldErrors((p) => ({
                    ...p,
                    businessName: validateBusinessName(businessName) || undefined,
                  }))
                }
                aria-invalid={!!fieldErrors.businessName}
                aria-describedby={fieldErrors.businessName ? 'pb-business-err' : undefined}
                className={`w-full px-4 py-3 rounded-xl border focus:ring-2 transition-colors text-dark ${fieldErrors.businessName ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20' : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20'}`}
                placeholder="np. Ślusarstwo Kowalski"
                autoComplete="organization"
                autoCapitalize="words"
                autoCorrect="off"
                spellCheck="false"
              />
              {fieldErrors.businessName && (
                <p
                  id="pb-business-err"
                  className="text-xs text-rose-600 mt-1.5 flex items-center gap-1.5"
                  role="alert"
                >
                  <AlertTriangle size={12} aria-hidden="true" />
                  {fieldErrors.businessName}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="pb-email" className="block text-sm font-semibold text-dark mb-1.5">
                Email{' '}
                <span className="text-rose-500" aria-label="wymagane">
                  *
                </span>
              </label>
              <input
                id="pb-email"
                type="email"
                inputMode="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: undefined }));
                }}
                onBlur={() =>
                  setFieldErrors((p) => ({
                    ...p,
                    email: validateEmail(email) || undefined,
                  }))
                }
                aria-invalid={!!fieldErrors.email}
                aria-describedby={fieldErrors.email ? 'pb-email-err' : undefined}
                className={`w-full px-4 py-3 rounded-xl border focus:ring-2 transition-colors text-dark ${fieldErrors.email ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20' : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20'}`}
                placeholder="biuro@twojafirma.pl"
                autoComplete="email"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck="false"
              />
              {fieldErrors.email && (
                <p
                  id="pb-email-err"
                  className="text-xs text-rose-600 mt-1.5 flex items-center gap-1.5"
                  role="alert"
                >
                  <AlertTriangle size={12} aria-hidden="true" />
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="pb-phone" className="block text-sm font-semibold text-dark mb-1.5">
                Telefon{' '}
                <span className="text-rose-500" aria-label="wymagane">
                  *
                </span>
              </label>
              <input
                id="pb-phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => {
                  handlePhoneChange(e.target.value);
                  if (fieldErrors.phone) setFieldErrors((p) => ({ ...p, phone: undefined }));
                }}
                onBlur={() => {
                  setPhone((p) => formatPhoneDisplay(normalizePhone(p)) || p);
                  setFieldErrors((p) => ({
                    ...p,
                    phone: validatePhone(phone) || undefined,
                  }));
                }}
                aria-invalid={!!fieldErrors.phone}
                aria-describedby={fieldErrors.phone ? 'pb-phone-err' : 'pb-phone-hint'}
                className={`w-full px-4 py-3 rounded-xl border focus:ring-2 transition-colors text-dark ${fieldErrors.phone ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20' : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20'}`}
                placeholder="600 100 200"
                autoComplete="tel"
                inputMode="tel"
              />
              {fieldErrors.phone ? (
                <p
                  id="pb-phone-err"
                  className="text-xs text-rose-600 mt-1.5 flex items-center gap-1.5"
                  role="alert"
                >
                  <AlertTriangle size={12} aria-hidden="true" />
                  {fieldErrors.phone}
                </p>
              ) : (
                <p id="pb-phone-hint" className="text-xs text-gray-500 mt-1">
                  Wystarczy 9 cyfr polskiego numeru. Automatycznie dodamy +48.
                </p>
              )}
            </div>

            <div>
              <label htmlFor="pb-nip" className="block text-sm font-semibold text-dark mb-1.5">
                NIP{' '}
                <span className="text-rose-500" aria-label="wymagane">
                  *
                </span>
              </label>
              <input
                id="pb-nip"
                type="text"
                required
                inputMode="numeric"
                pattern="[0-9]{10}"
                value={nip}
                onChange={(e) => {
                  handleNipChange(e.target.value);
                  if (fieldErrors.nip) setFieldErrors((p) => ({ ...p, nip: undefined }));
                }}
                onBlur={() =>
                  setFieldErrors((p) => ({
                    ...p,
                    nip: validateNip(nip) || undefined,
                  }))
                }
                aria-invalid={!!fieldErrors.nip}
                aria-describedby={fieldErrors.nip ? 'pb-nip-err' : 'pb-nip-hint'}
                className={`w-full px-4 py-3 rounded-xl border focus:ring-2 transition-colors text-dark font-mono ${fieldErrors.nip ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20' : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20'}`}
                placeholder="1234567890"
                maxLength={10}
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck="false"
              />
              {fieldErrors.nip ? (
                <p
                  id="pb-nip-err"
                  className="text-xs text-rose-600 mt-1.5 flex items-center gap-1.5"
                  role="alert"
                >
                  <AlertTriangle size={12} aria-hidden="true" />
                  {fieldErrors.nip}
                </p>
              ) : (
                <p id="pb-nip-hint" className="text-xs text-gray-500 mt-1">
                  {nip.length}/10 cyfr · potrzebny do faktury VAT
                </p>
              )}
            </div>

            {/* Consents — WCAG 2.5.8 target size: label ma py-2 dla większej tap area */}
            <div className="space-y-1 pt-2">
              <label className="flex items-start gap-3 cursor-pointer text-sm text-gray-700 py-2 px-1 rounded-lg hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  required
                  checked={consentProcessing}
                  onChange={(e) => setConsentProcessing(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>
                  Akceptuję{' '}
                  <Link to="/terms/" target="_blank" className="text-emerald-700 hover:underline">
                    regulamin
                  </Link>{' '}
                  i zgadzam się na przetwarzanie danych zgodnie z{' '}
                  <Link
                    to="/privacy-policy/"
                    target="_blank"
                    className="text-emerald-700 hover:underline"
                  >
                    polityką prywatności
                  </Link>
                  .{' '}
                  <span className="text-rose-500" aria-label="wymagane">
                    *
                  </span>
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer text-sm text-gray-700 py-2 px-1 rounded-lg hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={consentMarketing}
                  onChange={(e) => setConsentMarketing(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>Wyrażam zgodę na kontakt marketingowy (opcjonalnie).</span>
              </label>
            </div>

            {error && (
              <div
                className="flex flex-col gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm"
                role="alert"
                aria-live="polite"
                aria-atomic="true"
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle size={18} className="shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{error}</span>
                </div>
                {errorCta === 'panel' && (
                  <a
                    href={PANEL_URL}
                    className="self-start inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-full text-xs transition-colors"
                  >
                    <LogIn size={14} aria-hidden="true" />
                    Zaloguj się do panelu klienta
                    <ArrowRight size={14} aria-hidden="true" />
                  </a>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold rounded-full px-8 py-4 shadow-lg hover:shadow-[0_8px_25px_-5px_rgba(4,120,87,0.5)] transition-all motion-safe:hover:-translate-y-0.5 motion-safe:focus-visible:-translate-y-0.5 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                  Przekierowuję do Stripe...
                </>
              ) : (
                <>
                  Zapłać {tierCfg.ctaPriceLabel} kartą
                  <ArrowRight size={18} aria-hidden="true" />
                </>
              )}
            </button>

            {/* H3: Trust micro-copy + payment marks tuż pod CTA (NN/g: +10-15% konwersji) */}
            <div className="pt-2 space-y-2">
              <ul className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-gray-600">
                <li className="flex items-center gap-1.5">
                  <ShieldCheck size={12} className="text-emerald-600" aria-hidden="true" />
                  Anulujesz w panelu — 1 klikiem
                </li>
                <li aria-hidden="true" className="text-gray-300">
                  ·
                </li>
                <li>Faktura VAT 1. dnia mc</li>
                <li aria-hidden="true" className="text-gray-300">
                  ·
                </li>
                <li>Bez opłaty aktywacyjnej</li>
              </ul>
              <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xxs text-gray-400">
                <span>Płatność: Stripe · 256-bit SSL</span>
                <span aria-hidden="true">·</span>
                <span className="font-semibold tracking-wide">VISA</span>
                <span aria-hidden="true">·</span>
                <span className="font-semibold tracking-wide">Mastercard</span>
                <span aria-hidden="true">·</span>
                <span className="font-semibold tracking-wide">BLIK</span>
                <span aria-hidden="true">·</span>
                <span className="font-semibold tracking-wide">Apple Pay</span>
              </p>
            </div>
          </form>
        )}
      </div>
    </dialog>
  );
};

export default PreonboardModal;
export { TIERS };
