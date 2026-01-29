import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { MessageSquare, AlertCircle, Send } from 'lucide-react';
import { ContactFormData } from './types';
import Input from '../../common/Input';
import Button from '../../common/Button';

interface ContactStep3Props {
  register: UseFormRegister<ContactFormData>;
  errors: FieldErrors<ContactFormData>;
  submitError: string | null;
  isSubmitting: boolean;
  onPrev: () => void;
}

const ContactStep3: React.FC<ContactStep3Props> = ({
  register,
  errors,
  submitError,
  isSubmitting,
  onPrev,
}) => {
  return (
    <div className="animate-fade-in-up space-y-6">
      <Input
        label="Opisz swój cel, największe wyzwanie lub dodatkowe uwagi"
        textarea
        rows={4}
        {...register('message', { required: 'Napisz chociaż jedno zdanie o projekcie.' })}
        error={errors.message?.message}
        icon={<MessageSquare size={18} />}
      />
      {submitError && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-shake">
          <AlertCircle size={20} className="shrink-0" />
          <p className="text-xs font-bold">{submitError}</p>
        </div>
      )}
      <div className="pt-4">
        <Button
          type="submit"
          className="w-full justify-center h-14 text-lg shadow-xl shadow-primary/30"
          isLoading={isSubmitting}
          icon={<Send size={22} />}
        >
          Wyślij zgłoszenie
        </Button>
      </div>
      <button
        type="button"
        onClick={onPrev}
        className="w-full text-center text-xxs font-black uppercase tracking-[0.2em] text-gray-600 hover:text-secondary transition-all py-2"
      >
        Edytuj dane
      </button>
    </div>
  );
};

export default ContactStep3;
