/**
 * Inline wersja ContactModal — ten sam useContactForm hook + step1/2/3,
 * ale renderowany bezposrednio na stronie (bez Modal wrapper).
 * Uzywany na /kontakt jako primary lead capture (BH2 — eliminuje extra
 * klik na "Otworz formularz" w modalu).
 */
import React, { useEffect, useRef } from 'react';
import TurnstileWidget from './TurnstileWidget';
import type { TurnstileWidgetHandle } from '../../../utils/turnstile';
import { useContactForm } from '../../../hooks/useContactForm';
import { useModal } from '../../../context/ModalContext';
import { ContactType } from '../../../types';
import { SITE_CONFIG } from '../../../config/site';
import { FORM_CONFIG, getStep2Fallback } from './contactConfig';
import ContactStepper from './ContactStepper';
import ContactStep1 from './ContactStep1';
import ContactStep2 from './ContactStep2';
import ContactStep3 from './ContactStep3';
import ContactSuccess from './ContactSuccess';
import type { CalculatorHandoff } from '../calculator/calculatorHandoff';

interface InlineContactFormProps {
  type?: ContactType;
  /** MIX-1815: konfiguracja z ekranu wyniku /wycena/ (już sprawdzona przez readHandoff). */
  calculatorConfig?: CalculatorHandoff | null;
}

const InlineContactForm: React.FC<InlineContactFormProps> = ({
  type = 'general',
  calculatorConfig = null,
}) => {
  const turnstileRef = useRef<TurnstileWidgetHandle>(null);
  // onClose nie ma sensu w inline kontekscie — pass no-op (Success render zostaje na stronie)
  const noop = () => {};

  const {
    step,
    isSubmitted,
    isLoading,
    submitError,
    formMethods,
    nextStep,
    prevStep,
    onSubmit,
    handleClose,
  } = useContactForm(type, noop, turnstileRef);

  const {
    formState: { errors, isSubmitting },
    register,
    handleSubmit,
    getValues,
    setValue,
  } = formMethods;

  // MIX-1815: konfiguracja z /wycena/ wpisana raz do wiadomości (krok 3) i e-maila (krok 1).
  // Wznowiony lead (resumedLead, pełny reset w useContactForm) ma pierwszeństwo.
  const { additionalData } = useModal();
  const prefilled = useRef(false);
  const preMsg = calculatorConfig?.text ?? '';
  const preEmail = calculatorConfig?.email ?? '';
  useEffect(() => {
    if (prefilled.current || additionalData?.resumedLead || !preMsg) return;
    prefilled.current = true;
    setValue('message', preMsg);
    if (preEmail) setValue('email', preEmail);
  }, [preMsg, preEmail, additionalData, setValue]);

  const step2Content = getStep2Fallback(type);
  const currentConfig = FORM_CONFIG[type] || null;

  // Turnstile (api.js ~85 kB) dopiero przy pierwszej interakcji z formularzem, nie przy
  // wejściu na /contact/; wysyłka i tak poczeka na skrypt (getToken w trybie defer).
  // Ten sam wzorzec co PublicCalculator / AuditWizard.
  const prepareCaptcha = () => turnstileRef.current?.prepare?.();

  const turnstileWidget = (
    <TurnstileWidget ref={turnstileRef} siteKey={SITE_CONFIG.contact.turnstileSiteKey} defer />
  );

  if (isSubmitted) {
    return (
      <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100">
        {turnstileWidget}
        <ContactSuccess userName={getValues('name')} onClose={handleClose} />
      </div>
    );
  }

  return (
    <div
      className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100"
      onFocusCapture={prepareCaptcha}
      onPointerDownCapture={prepareCaptcha}
    >
      {turnstileWidget}
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-dark mb-2">
          {step === 1
            ? 'Rozpocznijmy współpracę'
            : step === 2
              ? currentConfig?.title || step2Content?.title || 'Szczegóły projektu'
              : 'Ostatni krok'}
        </h2>
        <p className="text-sm text-gray-600">
          Wypełnij formularz — odpowiemy w 24h. Twoje dane wprowadzone w pierwszym kroku zachowamy
          (możesz wrócić później).
        </p>
      </div>

      {calculatorConfig && (
        <div
          data-testid="contact-calculator-config"
          className="mb-6 rounded-2xl border border-primary/30 bg-primary/5 p-4"
        >
          <p className="text-sm font-bold text-dark">Twoja konfiguracja z kalkulatora</p>
          <p className="text-sm text-gray-700 mb-2">
            Wpisaliśmy ją do wiadomości w ostatnim kroku. Możesz ją tam poprawić.
          </p>
          <p className="whitespace-pre-line break-words text-sm text-gray-800">
            {calculatorConfig.text}
          </p>
        </div>
      )}

      <ContactStepper step={step} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-8 pb-4">
        {step === 1 && (
          <ContactStep1
            register={register}
            errors={errors}
            leadId={null}
            submitError={submitError}
            isLoading={isLoading}
            onNext={nextStep}
          />
        )}

        {step === 2 && (
          <ContactStep2
            register={register}
            currentConfig={currentConfig}
            step2Content={step2Content}
            packageName={undefined}
            projectTypeFromData={undefined}
            submitError={submitError}
            onPrev={prevStep}
            onNext={nextStep}
          />
        )}

        {step === 3 && (
          <ContactStep3
            register={register}
            errors={errors}
            submitError={submitError}
            isSubmitting={isSubmitting}
            onPrev={prevStep}
          />
        )}
      </form>
    </div>
  );
};

export default InlineContactForm;
