import React from 'react';
import { UseFormRegister } from 'react-hook-form';
import { Zap, Package, ExternalLink, ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';
import { ContactFormData, FormConfigGroup, Step2Content } from './types';
import Select from '../../common/Select';
import Input from '../../common/Input';
import Button from '../../common/Button';

interface ContactStep2Props {
  register: UseFormRegister<ContactFormData>;
  currentConfig: FormConfigGroup | null;
  step2Content: Step2Content | null;
  packageName?: string;
  projectTypeFromData?: string;
  submitError: string | null;
  onPrev: () => void;
  onNext: () => void;
}

const ContactStep2: React.FC<ContactStep2Props> = ({
  register,
  currentConfig,
  step2Content,
  packageName,
  projectTypeFromData,
  submitError,
  onPrev,
  onNext,
}) => {
  return (
    <div className="animate-fade-in-up space-y-6">
      <div className="bg-blue-50/30 p-6 rounded-[2rem] border border-primary/20 mb-8">
        <div className="flex items-center gap-3 text-secondary mb-2">
          <Zap size={20} fill="currentColor" />
          <span className="font-bold uppercase tracking-widest text-xs">Szybka Konfiguracja</span>
        </div>
        <p className="text-xs text-dark font-medium leading-relaxed">
          {currentConfig ? currentConfig.description : 'Określ parametry projektu.'}
        </p>
        {packageName && (
          <div className="mt-4 flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-primary/30 shadow-sm inline-flex">
            <Package size={14} className="text-primary" />
            <span className="text-xxs font-bold text-dark uppercase tracking-wider">
              Wybrany pakiet: <span className="text-secondary">{packageName}</span>
            </span>
          </div>
        )}
      </div>

      {currentConfig ? (
        <div className="space-y-4">
          {currentConfig.fields.map((field, idx) => (
            <div key={idx}>
              {field.type === 'select' ? (
                <Select
                  label={field.label}
                  options={field.options || []}
                  {...register(field.name)}
                />
              ) : (
                <Input
                  label={field.label}
                  placeholder={field.placeholder}
                  {...register(field.name)}
                />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {step2Content ? (
            <>
              <Select
                label={step2Content.typeLabel}
                options={step2Content.options}
                {...register('projectType')}
                disabled={!!projectTypeFromData}
                className={projectTypeFromData ? 'opacity-70' : ''}
              />
              <Select
                label="Przewidywany budżet"
                options={[
                  { value: 'low', label: 'do 5 000 PLN' },
                  { value: 'mid', label: '5 000 - 15 000 PLN' },
                  { value: 'high', label: '15 000 - 50 000 PLN' },
                  { value: 'enterprise', label: 'powyżej 50 000 PLN' },
                ]}
                {...register('budget')}
              />
            </>
          ) : (
            <Input
              label="Adres obecnej strony (opcjonalnie)"
              placeholder="https://"
              {...register('website')}
              icon={<ExternalLink size={18} />}
            />
          )}
        </div>
      )}

      {submitError && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-shake">
          <AlertCircle size={20} className="shrink-0" />
          <p className="text-xs font-bold">{submitError}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onPrev}
          icon={<ArrowLeft size={18} />}
          iconPosition="left"
          className="h-14 px-8 font-bold border-2"
        >
          Wstecz
        </Button>
        <Button
          type="button"
          onClick={onNext}
          className="flex-1 justify-center h-14 text-lg shadow-lg"
          icon={<ArrowRight size={20} />}
        >
          Dalej
        </Button>
      </div>
    </div>
  );
};

export default ContactStep2;
