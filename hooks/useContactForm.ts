import { useState, useRef, useEffect, RefObject } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactSchema } from '../types/validation';
import { useModal } from '../context/ModalContext';
import { leadService, LeadBase, Lead } from '../services/leadService';
import { ContactType } from '../types';
import type { TurnstileWidgetHandle } from '../utils/turnstile';
import { ContactFormData } from '../components/features/contact/types';
import { isLocalhost } from '../utils/contactFormHelpers';
import { trackEvent } from '../utils/analytics';

export const useContactForm = (
  type: ContactType,
  onClose: () => void,
  turnstileRef?: RefObject<TurnstileWidgetHandle | null>,
) => {
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { additionalData } = useModal();
  const isInitialized = useRef(false);

  const getCaptchaToken = async (): Promise<string> => {
    const handle = turnstileRef?.current;
    if (!handle) throw new Error('TURNSTILE_NOT_READY');
    return handle.getToken();
  };
  const resetCaptcha = () => turnstileRef?.current?.reset();

  const formMethods = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    mode: 'onTouched',
  });

  const { getValues, reset, trigger } = formMethods;

  useEffect(() => {
    if (additionalData?.resumedLead && !isInitialized.current) {
      const lead = additionalData.resumedLead as Lead;
      setLeadId(lead.id);
      reset({
        name: lead.name || '',
        email: lead.email || '',
        phone: lead.phone || '',
        website: lead.website || '',
        budget: lead.budget || '',
        message: lead.message || '',
        privacy: true,
      });
      setStep(additionalData.step ? Number(additionalData.step) : 2);
      isInitialized.current = true;
    }
  }, [additionalData, reset]);

  const nextStep = async () => {
    let fieldsToValidate: Extract<keyof ContactFormData, string>[] = [];
    if (step === 1) fieldsToValidate = ['name', 'email', 'phone', 'privacy'];
    if (step === 2) fieldsToValidate = ['projectType', 'budget', 'website'];

    const isValid = await trigger(fieldsToValidate);
    if (!isValid) return;

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
            const token = await getCaptchaToken();
            const createdLead = await leadService.createLead({
              ...leadData,
              captcha_token: token,
            });
            if (createdLead) {
              setLeadId(createdLead.id);
              setStep(2);
            }
            resetCaptcha();
          } catch (_err) {
            if (isLocalhost()) {
              const createdLead = await leadService.createLead({
                ...leadData,
                captcha_token: 'local_bypass',
              });
              if (createdLead) {
                setLeadId(createdLead.id);
                setStep(2);
              }
            } else {
              setSubmitError('Weryfikacja Turnstile nieudana. Spróbuj ponownie.');
              resetCaptcha();
            }
          }
        }
      } else if (step === 2) {
        if (leadId) await leadService.updateLead(leadId, getValues(), 2);
        setStep(3);
      } else {
        setStep((prev) => prev + 1);
      }
    } catch (_error) {
      setSubmitError('Błąd zapisu danych.');
    } finally {
      setIsLoading(false);
    }
  };

  const prevStep = () => {
    setSubmitError(null);
    setStep((prev) => prev - 1);
  };

  const onSubmit = async (data: ContactFormData) => {
    setSubmitError(null);
    // GA4 key event: form_submit (mierzy intent ukonczenia formularza,
    // niezalenie czy backend zwroci sukces).
    trackEvent('form_submit', {
      contact_type: type,
      step: 3,
      has_existing_lead: !!leadId,
    });
    try {
      let token = leadId ? 'existing_lead_verified' : '';
      if (!token) {
        try {
          token = await getCaptchaToken();
        } catch {
          token = isLocalhost() ? 'local_bypass' : '';
          if (!token) {
            setSubmitError('Błąd weryfikacji bezpieczeństwa.');
            return;
          }
        }
      }
      const finalData = {
        ...data,
        captcha_token: token,
        package_name: additionalData?.package as string,
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
          captcha_token: token,
        });
        if (createdLead) {
          await leadService.updateLead(createdLead.id, finalData, 3);
          await leadService.sendNotification(createdLead.id, 'success');
        }
      }
      setIsSubmitted(true);
      resetCaptcha();
    } catch (_error) {
      setSubmitError('Błąd wysyłania formularza.');
    }
  };

  const handleClose = () => {
    if (leadId && !isSubmitted) {
      leadService.sendNotification(leadId, step === 2 ? 'abandoned_step_1' : 'abandoned_step_2');
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

  return {
    step,
    isSubmitted,
    isLoading,
    submitError,
    formMethods,
    nextStep,
    prevStep,
    onSubmit,
    handleClose,
    setSubmitError,
  };
};
