import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { ECOMMERCE_CONTENT as CONTENT } from '../../../../data/content';

interface ConfiguratorControlsProps {
  configColor: 'red' | 'blue' | 'black' | 'emerald';
  setConfigColor: (c: 'red' | 'blue' | 'black' | 'emerald') => void;
  configMaterial: 'mesh' | 'leather';
  setConfigMaterial: (m: 'mesh' | 'leather') => void;
  configHeadrest: boolean;
  setConfigHeadrest: (h: boolean) => void;
  configArmrests: boolean;
  setConfigArmrests: (a: boolean) => void;
  configBase: 'plastic' | 'chrome';
  setConfigBase: (b: 'plastic' | 'chrome') => void;
  getConfigPrice: () => number;
  getColorHex: (color: string) => string;
  onCta: () => void;
}

const ConfiguratorControls: React.FC<ConfiguratorControlsProps> = ({
  configColor,
  setConfigColor,
  configMaterial,
  setConfigMaterial,
  configHeadrest,
  setConfigHeadrest,
  configArmrests,
  setConfigArmrests,
  configBase,
  setConfigBase,
  getConfigPrice,
  getColorHex,
  onCta,
}) => {
  return (
    <div className="flex-1 flex flex-col">
      <div className="mb-6 pb-4 border-b border-gray-100 flex justify-between items-end">
        <div>
          <h3 className="font-black text-xl text-dark tracking-tight">
            {CONTENT.configurator.controls.title}
          </h3>
          <p className="text-xxs uppercase font-bold text-primary tracking-widest">
            {CONTENT.configurator.controls.subtitle}
          </p>
        </div>
        <div className="text-right">
          <div className="text-xxs text-gray-600 font-bold uppercase mb-1">
            {CONTENT.configurator.controls.priceLabel}
          </div>
          <div className="text-2xl font-black text-dark flex items-baseline gap-1">
            {getConfigPrice()} <span className="text-xs">PLN</span>
          </div>
        </div>
      </div>

      <div className="space-y-6 flex-grow overflow-y-auto pr-2 custom-scrollbar max-h-[350px]">
        <div>
          <label className="text-xxs font-black uppercase tracking-widest text-gray-400 block mb-3">
            Kolor Obicia
          </label>
          <div className="flex gap-3">
            {(['black', 'blue', 'red', 'emerald'] as const).map((c) => (
              <button
                key={c}
                onClick={() => setConfigColor(c)}
                className={`w-10 h-10 rounded-full border-2 transition-all ${configColor === c ? 'border-secondary scale-110 shadow-lg' : 'border-transparent'}`}
                style={{ backgroundColor: getColorHex(c) }}
              />
            ))}
          </div>
        </div>
        <div>
          <label className="text-xxs font-black uppercase tracking-widest text-gray-400 block mb-3">
            Materiał
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'mesh', label: 'Mesh Air' },
              { id: 'leather', label: 'Premium Leather' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setConfigMaterial(m.id as 'mesh' | 'leather')}
                className={`py-2 px-4 rounded-xl text-xs font-bold border-2 transition-all ${configMaterial === m.id ? 'border-secondary bg-blue-50 text-secondary' : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <label className="text-xxs font-black uppercase tracking-widest text-gray-400 block mb-1">
            Dodatki
          </label>
          <button
            onClick={() => setConfigHeadrest(!configHeadrest)}
            className="w-full flex justify-between items-center p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition-all"
          >
            <span className="text-xs font-bold">Zagłówek Regulowany</span>
            <div
              className={`w-10 h-5 rounded-full transition-colors relative ${configHeadrest ? 'bg-success' : 'bg-gray-300'}`}
            >
              <div
                className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${configHeadrest ? 'left-6' : 'left-1'}`}
              />
            </div>
          </button>
          <button
            onClick={() => setConfigArmrests(!configArmrests)}
            className="w-full flex justify-between items-center p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition-all"
          >
            <span className="text-xs font-bold">Podłokietniki 4D</span>
            <div
              className={`w-10 h-5 rounded-full transition-colors relative ${configArmrests ? 'bg-success' : 'bg-gray-300'}`}
            >
              <div
                className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${configArmrests ? 'left-6' : 'left-1'}`}
              />
            </div>
          </button>
        </div>
        <div>
          <label className="text-xxs font-black uppercase tracking-widest text-gray-400 block mb-3">
            Podstawa Jezdna
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'plastic', label: 'Polimer' },
              { id: 'chrome', label: 'Chrom / Aluminium' },
            ].map((b) => (
              <button
                key={b.id}
                onClick={() => setConfigBase(b.id as 'plastic' | 'chrome')}
                className={`py-2 px-4 rounded-xl text-xs font-bold border-2 transition-all ${configBase === b.id ? 'border-secondary bg-blue-50 text-secondary' : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-8">
          <button
            onClick={onCta}
            className="w-full bg-dark text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-secondary transition-all flex items-center justify-center gap-3 shadow-xl group"
          >
            <ShoppingCart size={16} className="group-hover:rotate-12 transition-transform" />
            {CONTENT.configurator.controls.button}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfiguratorControls;
