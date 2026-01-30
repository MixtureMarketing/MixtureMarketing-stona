import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

const RevenueLossCalculator = () => {
  const [traffic, setTraffic] = useState(10000);
  const [convRate] = useState(2);
  const [orderVal] = useState(250);
  const [loadTime, setLoadTime] = useState(4);

  const secondsOver = Math.max(0, loadTime - 2);
  const potentialRevenue = traffic * (convRate / 100) * orderVal;
  const lossPercentage = secondsOver * 0.07;
  const monthlyLoss = potentialRevenue * lossPercentage;

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-100 not-prose relative overflow-hidden">
      <div className="space-y-8 mb-12">
        <CalculatorSlider
          label="Miesięczny ruch"
          val={traffic}
          setVal={setTraffic}
          min={1000}
          max={100000}
          step={1000}
          unit=""
        />
        <CalculatorSlider
          label="Czas ładowania (s)"
          val={loadTime}
          setVal={setLoadTime}
          min={1}
          max={10}
          step={0.5}
          unit="s"
        />
      </div>
      <div className="bg-dark rounded-[2rem] p-8 text-white text-center shadow-xl">
        <div className="text-xxs font-black uppercase text-primary tracking-widest mb-2">
          Utracone przychody miesięcznie
        </div>
        <div className="text-4xl md:text-5xl font-black text-white mb-4">
          ~{Math.round(monthlyLoss).toLocaleString()} PLN
        </div>
      </div>
      <div className="mt-8 flex items-start gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
        <CheckCircle2 className="text-primary shrink-0" size={20} />
        <p className="text-xs text-blue-800 leading-relaxed m-0">
          Optymalizacja Core Web Vitals może odzyskać te środki bez zwiększania wydatków na reklamy.
        </p>
      </div>
    </div>
  );
};

interface CalculatorSliderProps {
  label: string;
  val: number;
  setVal: (v: number) => void;
  min: number;
  max: number;
  step: number;
  unit: string;
}

const CalculatorSlider = ({ label, val, setVal, min, max, step, unit }: CalculatorSliderProps) => (
  <div>
    <div className="flex justify-between mb-3">
      <label className="text-sm font-bold text-dark">{label}</label>
      <span className="text-primary font-mono font-bold">
        {val}
        {unit}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={val}
      onChange={(e) => setVal(parseFloat(e.target.value))}
      className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#61B6DE]"
    />
  </div>
);

export default RevenueLossCalculator;
