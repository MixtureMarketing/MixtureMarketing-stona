import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { COLORS } from '../../types';
import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import Button from '../common/Button';
import Input from '../common/Input';
import { SITE_CONFIG } from '../../config/site';
import { leadService } from '../../services/leadService';

interface FormData {
  name: string;
  company?: string;
  email: string;
  message: string;
}

const Contact: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setSubmitError(null);
    try {
      // 1. Create Lead
      const lead = await leadService.createLead({
        name: data.name,
        email: data.email,
        service_interest: 'contact_form',
      });

      if (lead && lead.id) {
        // 2. Update Lead with details
        await leadService.updateLead(lead.id, {
          company: data.company,
          message: data.message,
        });

        setIsSubmitted(true);
        reset();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitError('Wystąpił błąd podczas wysyłania wiadomości. Spróbuj ponownie.');
    }
  };

  return (
    <section id="contact" className="py-24 bg-white border-t border-gray-100">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title={
            <>
              Masz pomysł na projekt?
              <br />
              <span style={{ color: COLORS.primary }}>Porozmawiajmy o nim.</span>
            </>
          }
          description="Wypełnij formularz lub skontaktuj się z nami bezpośrednio. Przygotujemy darmową analizę i plan działania dla Twojego biznesu."
          className="mb-16"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="space-y-8 flex flex-col justify-center">
            <AnimateOnScroll delay={100}>
              <div className="bg-[#F9FAFB] p-8 rounded-2xl border border-gray-100">
                <h3 className="font-bold text-xl mb-6 text-dark">Dane kontaktowe</h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 text-secondary">
                      <Mail size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-dark text-sm uppercase tracking-wide">Email</h3>
                      <a
                        href={`mailto:${SITE_CONFIG.contact.email}`}
                        className="text-gray-600 hover:text-primary transition-colors text-lg"
                      >
                        {SITE_CONFIG.contact.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 text-secondary">
                      <Phone size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-dark text-sm uppercase tracking-wide">
                        Telefon
                      </h3>
                      <a
                        href={`tel:${SITE_CONFIG.contact.phoneFull}`}
                        className="text-gray-600 hover:text-primary transition-colors text-lg"
                      >
                        {SITE_CONFIG.contact.phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 text-secondary">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-dark text-sm uppercase tracking-wide">Biuro</h3>
                      <p className="text-gray-600 text-lg">
                        {SITE_CONFIG.contact.address.street}
                        <br />
                        {SITE_CONFIG.contact.address.postalCode} {SITE_CONFIG.contact.address.city}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          </div>

          <AnimateOnScroll delay={200}>
            <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100 relative overflow-hidden min-h-[500px] flex flex-col justify-center">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full translate-x-1/3 -translate-y-1/3"></div>

              {isSubmitted ? (
                <div className="text-center space-y-6 animate-fade-in py-10">
                  <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto shadow-inner border border-green-100">
                    <CheckCircle2 size={40} className="animate-scale-in" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-dark mb-2">Wiadomość wysłana!</h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      Dziękujemy za kontakt. Nasz zespół przeanalizuje Twoje zgłoszenie i
                      skontaktuje się z Tobą w ciągu 24 godzin.
                    </p>
                  </div>
                  <Button
                    onClick={() => setIsSubmitted(false)}
                    variant="outline"
                    className="mx-auto"
                  >
                    Wyślij kolejną wiadomość
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-2 relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Imię i Nazwisko"
                      type="text"
                      {...register('name', { required: 'To pole jest wymagane' })}
                      error={errors.name?.message}
                    />
                    <Input
                      label="Firma"
                      type="text"
                      {...register('company')}
                      error={errors.company?.message}
                    />
                  </div>

                  <Input
                    label="Email"
                    type="email"
                    {...register('email', {
                      required: 'Email jest wymagany',
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: 'Niepoprawny format emaila',
                      },
                    })}
                    error={errors.email?.message}
                  />

                  <Input
                    label="Wiadomość"
                    textarea
                    rows={4}
                    {...register('message', { required: 'Wiadomość nie może być pusta' })}
                    error={errors.message?.message}
                  />

                  {submitError && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-shake mb-4">
                      <AlertCircle size={20} className="shrink-0" />
                      <p className="text-xs font-bold">{submitError}</p>
                    </div>
                  )}

                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      className="w-full"
                      icon={<Send size={18} />}
                      isLoading={isSubmitting}
                    >
                      Wyślij Wiadomość
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  );
};

export default Contact;
