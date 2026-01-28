import React from 'react';

interface CalculatorProgressProps {
  currentStep: number;
  totalSteps: number;
}

const CalculatorProgress: React.FC<CalculatorProgressProps> = ({ currentStep, totalSteps }) => {
  return (
    <div className="mb-12">
      <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
        <span>
          Krok {currentStep} z {totalSteps}
        </span>
        <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
      </div>
      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500 ease-out"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

export default CalculatorProgress;
