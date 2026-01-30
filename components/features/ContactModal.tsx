import React from 'react';
import Modal from '../common/Modal';
import { useModal } from '../../context/ModalContext';
import { ContactType } from '../../types';
import { useContactForm } from '../../hooks/useContactForm';

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
  } = useContactForm(type, handleCloseInternal);

  // We need a middleman to handle the lead notification logic if needed,
  // but hook handles it. The hook expects onClose to be passed.
  function handleCloseInternal() {
    onClose();
  }

  const {
    formState: { errors, isSubmitting },
    register,
    handleSubmit,
    getValues,
  } = formMethods;

  // Determine specific config based on additionalData.specificType
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
            leadId={null} // Lead ID handled in hook
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
