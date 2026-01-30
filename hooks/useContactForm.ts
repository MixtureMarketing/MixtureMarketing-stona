import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactSchema } from '../types/validation';
import { useModal } from '../context/ModalContext';
import { leadService, LeadBase, Lead } from '../services/leadService';
import { ContactType } from '../types';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { ContactFormData } from '../components/features/contact/types';

export const useContactForm = (type: ContactType, onClose: () => void) => {
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { additionalData } = useModal();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const isInitialized = useRef(false);

  const formMethods = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    mode: 'onTouched',
  });

  const { getValues, reset, trigger } = formMethods;

  const executeRecaptchaWithTimeout = async (action: string) => {
    if (!executeRecaptcha) throw new Error('RECAPTCHA_NOT_READY');
    return Promise.race([
      executeRecaptcha(action),
      new Promise<string>((_, reject) =>
        setTimeout(() => reject(new Error('RECAPTCHA_TIMEOUT')), 8000),
      ),
    ]);
  };

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
      reset(initialValues);
      setStep(additionalData.step ? Number(additionalData.step) : 2);
      isInitialized.current = true;
    }
  }, [additionalData, reset]);

  const nextStep = async () => {
    let fieldsToValidate: Extract<keyof ContactFormData, string>[] = [];
    if (step === 1) fieldsToValidate = ['name', 'email', 'phone', 'privacy'];
    if (step === 2) fieldsToValidate = ['projectType', 'budget', 'website']; // Simplified, specific config handled in component

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
            } catch (_err) {
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
                setSubmitError('Weryfikacja reCAPTCHA nieudana.');
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
          token = window.location.hostname === 'localhost' ? 'local_bypass' : '';
          if (!token) {
            setSubmitError('Błąd weryfikacji bezpieczeństwa.');
            return;
          }
        }
      }
      const finalData = {
        ...data,
        recaptcha_token: token,
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
          recaptcha_token: token,
        });
        if (createdLead) {
          await leadService.updateLead(createdLead.id, finalData, 3);
          await leadService.sendNotification(createdLead.id, 'success');
        }
      }
      setIsSubmitted(true);
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
