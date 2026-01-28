import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useCalculator, ProjectType } from '../../hooks/useCalculator';
import { generatePdf } from '../../services/pdfService';
import { ChevronRight, ChevronLeft, Loader2, CheckCircle2 } from 'lucide-react';
import Button from '../common/Button';
import SectionHeader from '../common/SectionHeader';
import CalculatorProgress from './calculator/CalculatorProgress';
import CalculatorStepType from './calculator/CalculatorStepType';
import CalculatorStepDesign from './calculator/CalculatorStepDesign';
import CalculatorStepFeatures from './calculator/CalculatorStepFeatures';
import CalculatorStepMarketing from './calculator/CalculatorStepMarketing';
import CalculatorStepForm from './calculator/CalculatorStepForm';
import CalculatorSummary from './calculator/CalculatorSummary';

const PriceCalculator: React.FC = () => {
  const { loading, selections, result, updateSelection, toggleFeature, toggleMarketing } =
    useCalculator();

  const location = useLocation();
  const [step, setStep] = useState(1);
  const totalSteps = 5;
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const typeParam = params.get('type');
    if (typeParam && ['landingPage', 'corporate', 'ecommerce', 'webApp'].includes(typeParam)) {
      updateSelection('projectType', typeParam as ProjectType);
      // Clean URL after selection
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [location.search, updateSelection]);

  const nextStep = () => setStep((s) => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Generate PDF
      const pdfBlob = await generatePdf({
        selections,
        result,
        contact: { email },
      });

      // 2. Prepare Form Data
      const formData = new FormData();
      formData.append('email', email);
      formData.append('pdf', pdfBlob, 'wycena_mixture.pdf');
      formData.append('data', JSON.stringify({ selections, result }));

      // 3. Send to Backend
      const response = await fetch('/api/calculator_submit.php', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setIsSuccess(true);
      } else {
        alert('Wystąpił błąd podczas wysyłania. Spróbuj ponownie.');
      }
    } catch (error) {
      console.error('Submission failed:', error);
      alert('Wystąpił błąd krytyczny.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-secondary animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Inicjalizacja systemu wycen...</p>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <section className="py-24 bg-[#F9FAFB]" id="calculator">
        <div className="max-w-screen-md mx-auto px-4 text-center">
          <div className="bg-white rounded-3xl shadow-xl p-12 border border-green-100">
            <div className="inline-flex items-center justify-center p-6 bg-green-100 text-green-600 rounded-full mb-8 animate-bounce">
              <CheckCircle2 size={64} />
            </div>
            <h3 className="text-3xl font-bold text-dark mb-4">Oferta wysłana!</h3>
            <p className="text-lg text-gray-600 mb-8">
              Sprawdź swoją skrzynkę odbiorczą ({email}). Wstępny kosztorys w PDF już tam na Ciebie
              czeka.
            </p>
            <Button onClick={() => window.location.reload()}>Wróć do strony głównej</Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-[#F9FAFB] overflow-hidden" id="calculator">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Smart Calculator"
          subtitle="Transparentna Wycena"
          description="Oszacuj koszt swojego projektu w 2 minuty. Nasz algorytm bazuje na aktualnych stawkach rynkowych i stopniu złożoności."
          className="mb-16"
        />

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          {/* --- LEFT: Wizard Steps --- */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12 relative overflow-hidden">
              <CalculatorProgress currentStep={step} totalSteps={totalSteps} />

              {/* STEP 1: Type */}
              {step === 1 && (
                <CalculatorStepType
                  currentType={selections.projectType}
                  onSelect={(type) => updateSelection('projectType', type)}
                />
              )}

              {/* STEP 2: Design */}
              {step === 2 && (
                <CalculatorStepDesign
                  currentLevel={selections.designLevel}
                  onSelect={(level) => updateSelection('designLevel', level)}
                />
              )}

              {/* STEP 3: Features */}
              {step === 3 && (
                <CalculatorStepFeatures
                  projectType={selections.projectType}
                  selectedFeatures={selections.features}
                  onToggle={toggleFeature}
                />
              )}

              {/* STEP 4: Marketing */}
              {step === 4 && (
                <CalculatorStepMarketing
                  selectedMarketing={selections.marketing}
                  onToggle={toggleMarketing}
                />
              )}

              {/* STEP 5: Lead Form */}
              {step === 5 && (
                <CalculatorStepForm
                  email={email}
                  setEmail={setEmail}
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                />
              )}

              {/* Controls */}
              <div className="mt-12 pt-8 border-t border-gray-100 flex justify-between items-center">
                {step > 1 && step < 5 ? (
                  <button
                    onClick={prevStep}
                    className="flex items-center gap-2 text-gray-500 font-bold hover:text-dark transition-colors"
                  >
                    <ChevronLeft size={20} /> Wstecz
                  </button>
                ) : (
                  <div></div>
                )}

                {step < 5 && (
                  <Button onClick={nextStep} icon={<ChevronRight size={20} />}>
                    Dalej
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* --- RIGHT: Live Summary --- */}
          <CalculatorSummary selections={selections} result={result} />
        </div>
      </div>
    </section>
  );
};

export default PriceCalculator;
