/**
 * Inline wersja ContactModal — ten sam useContactForm hook + step1/2/3,
 * ale renderowany bezposrednio na stronie (bez Modal wrapper).
 * Uzywany na /kontakt jako primary lead capture (BH2 — eliminuje extra
 * klik na "Otworz formularz" w modalu).
 */
import React, { useRef } from 'react';
import TurnstileWidget from './TurnstileWidget';
import type { TurnstileWidgetHandle } from '../../../utils/turnstile';
import { useContactForm } from '../../../hooks/useContactForm';
import { ContactType } from '../../../types';
import { SITE_CONFIG } from '../../../config/site';
import { FORM_CONFIG, getStep2Fallback } from './contactConfig';
import ContactStepper from './ContactStepper';
import ContactStep1 from './ContactStep1';
import ContactStep2 from './ContactStep2';
import ContactStep3 from './ContactStep3';
import ContactSuccess from './ContactSuccess';

interface InlineContactFormProps {
  type?: ContactType;
}

const InlineContactForm: React.FC<InlineContactFormProps> = ({ type = 'general' }) => {
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
  } = formMethods;

  const step2Content = getStep2Fallback(type);
  const currentConfig = FORM_CONFIG[type] || null;

  const turnstileWidget = (
    <TurnstileWidget ref={turnstileRef} siteKey={SITE_CONFIG.contact.turnstileSiteKey} />
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
    <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100">
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
