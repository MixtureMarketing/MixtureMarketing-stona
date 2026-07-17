import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { User, Mail, Phone, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ContactFormData } from './types';
import Input from '../../common/Input';
import Button from '../../common/Button';

interface ContactStep1Props {
  register: UseFormRegister<ContactFormData>;
  errors: FieldErrors<ContactFormData>;
  leadId: string | null;
  submitError: string | null;
  isLoading: boolean;
  onNext: () => void;
}

const ContactStep1: React.FC<ContactStep1Props> = ({
  register,
  errors,
  leadId,
  submitError,
  isLoading,
  onNext,
}) => {
  return (
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
            <span className="text-secondary font-bold">Zajmie Ci to mniej niż 30 sekund.</span>
          </p>
        )}
      </div>
      <Input
        label="Imię i Nazwisko"
        autoComplete="name"
        autoCapitalize="words"
        autoCorrect="off"
        spellCheck={false}
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
          inputMode="email"
          autoComplete="email"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          {...register('email', {
            required: 'Potrzebujemy emaila, by wysłać wycenę.',
            pattern: { value: /^\S+@\S+$/i, message: 'To nie wygląda na poprawny email.' },
          })}
          error={errors.email?.message}
          icon={<Mail size={18} />}
        />
        <Input
          label="Telefon (opcjonalnie)"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          {...register('phone')}
          icon={<Phone size={18} />}
        />
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
              className="text-secondary hover:underline font-bold"
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
        onClick={onNext}
        className="w-full justify-center h-14 text-lg shadow-xl shadow-secondary/20"
        icon={<ArrowRight size={22} />}
        isLoading={isLoading}
      >
        Zapisz i przejdź dalej
      </Button>
    </div>
  );
};

export default ContactStep1;
