import React, { useState } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';
import Modal from '../common/Modal';
import { useModal } from '../../context/ModalContext';
import { ContactType } from '../../types';
import { useContactForm } from '../../hooks/useContactForm';
import { SITE_CONFIG } from '../../config/site';

import { FORM_CONFIG, getStep2Fallback } from './contact/contactConfig';
import ContactStepper from './contact/ContactStepper';
import ContactStep1 from './contact/ContactStep1';
import ContactStep2 from './contact/ContactStep2';
import ContactStep3 from './contact/ContactStep3';
import ContactSuccess from './contact/ContactSuccess';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: ContactType;
}

const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose, type }) => {
  const { additionalData } = useModal();
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  return (
    <>
      <ContactModalContent
        isOpen={isOpen}
        onClose={onClose}
        type={type}
        additionalData={additionalData}
        turnstileToken={turnstileToken}
      />
      {isOpen && (
        <div className="hidden">
          <Turnstile
            siteKey={SITE_CONFIG.contact.recaptchaSiteKey} // We reuse the key name for now, but you should update it in site.ts
            onSuccess={(token) => setTurnstileToken(token)}
          />
        </div>
      )}
    </>
  );
};

const ContactModalContent: React.FC<
  ContactModalProps & { 
    additionalData: Record<string, unknown> | null;
    turnstileToken: string | null;
  }
> = ({ isOpen, onClose, type, additionalData, turnstileToken }) => {
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
  } = useContactForm(type, onClose, turnstileToken); 
 // Note: handleCloseInternal logic simplified here for brevity, assuming hook handles closing or we pass onClose directly

  const {
    formState: { errors, isSubmitting },
    register,
    handleSubmit,
    getValues,
  } = formMethods;

  // ... config logic ...
  const specificType = additionalData?.specificType as string | undefined;
  const currentConfig =
    specificType && FORM_CONFIG[specificType] ? FORM_CONFIG[specificType] : null;
  const packageName = additionalData?.package as string | undefined;

  const step2Content = getStep2Fallback(type);

  if (isSubmitted) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Zgłoszenie wysłane!" maxWidth="max-w-3xl">
        <ContactSuccess userName={getValues('name')} onClose={handleClose} />
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
      <ContactStepper step={step} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-8 md:px-4 pb-4">
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
            packageName={packageName}
            projectTypeFromData={additionalData?.projectType as string}
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
    </Modal>
  );
};

export default ContactModal;
