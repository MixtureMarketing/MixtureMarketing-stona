import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactSchema } from '../../types/validation';
import Modal from '../common/Modal';
import { useModal } from '../../context/ModalContext';
import { leadService, LeadBase, Lead } from '../../services/leadService';
import { ContactType } from '../../types';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

import { ContactFormData } from './contact/types';
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
    formState: { errors, isSubmitting },
    getValues,
    register,
    handleSubmit,
    reset,
    trigger,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    mode: 'onTouched',
  });

  // Determine specific config based on additionalData.specificType
  const specificType = additionalData?.specificType as string | undefined;
  const currentConfig =
    specificType && FORM_CONFIG[specificType] ? FORM_CONFIG[specificType] : null;
  const packageName = additionalData?.package as string | undefined;

  // Handle Resumed Lead
  useEffect(() => {
    if (additionalData?.resumedLead && !isInitialized.current) {
      const lead = additionalData.resumedLead as Lead;
      setLeadId(lead.id);

      const initialValues: Partial<ContactFormData> = {
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
          // @ts-expect-error - dynamic mapping
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
    let fieldsToValidate: Extract<keyof ContactFormData, string>[] = [];
    if (step === 1) fieldsToValidate = ['name', 'email', 'phone', 'privacy'];

    if (step === 2) {
      if (currentConfig) {
        fieldsToValidate = currentConfig.fields.map(
          (f) => f.name as Extract<keyof ContactFormData, string>,
        );
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
            } catch (err) {
              if (err instanceof Error && err.message === 'RECAPTCHA_TIMEOUT') {
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
          try {
            await leadService.updateLead(leadId, values, 2);
            setStep(3);
          } catch (error) {
            console.error('Error updating lead step 2:', error);
            setStep(3); // Proceed anyway
          }
        } else {
          setStep((prev) => prev + 1);
        }
      } catch (error) {
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

  const onSubmit = async (data: ContactFormData) => {
    setSubmitError(null);
    try {
      let token = leadId ? 'existing_lead_verified' : '';
      if (!token) {
        try {
          token = await executeRecaptchaWithTimeout('submit_form');
        } catch {
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
            leadId={leadId}
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
