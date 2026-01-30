import React from 'react';
import { Pizza, UtensilsCrossed, ChefHat, Warehouse } from 'lucide-react';

const RestaurantAnalogyVisual = () => {
  return (
    <div className="bg-white rounded-[3rem] p-8 md:p-12 border border-gray-100 shadow-2xl relative overflow-hidden group">
      <div className="absolute inset-0 bg-slate-50 opacity-50"></div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
        <div className="flex flex-col items-center text-center p-6 bg-white rounded-3xl border border-gray-100 hover:shadow-xl transition-all group/item">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover/item:scale-110 group-hover/item:rotate-3 transition-all">
            <Pizza size={32} />
          </div>
          <div className="text-xxs font-black uppercase text-blue-600 tracking-widest mb-1">
            1. Klient
          </div>
          <h4 className="font-bold text-dark mb-2">Frontend (UI)</h4>
          <p className="text-xxs text-gray-500 leading-relaxed">
            Przegląda menu, wybiera produkty i klika "Zamów". Widzi tylko końcowy efekt.
          </p>
        </div>
        <div className="flex flex-col items-center text-center p-6 bg-white rounded-3xl border border-gray-100 hover:shadow-xl transition-all group/item">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-4 group-hover/item:scale-110 group-hover/item:-rotate-3 transition-all">
            <UtensilsCrossed size={32} />
          </div>
          <div className="text-xxs font-black uppercase text-amber-600 tracking-widest mb-1">
            2. Kelner
          </div>
          <h4 className="font-bold text-dark mb-2">API</h4>
          <p className="text-xxs text-gray-500 leading-relaxed">
            Przekazuje informacje między klientem a kuchnią. Dba o to, by zamówienie dotarło
            bezpiecznie.
          </p>
        </div>
        <div className="flex flex-col items-center text-center p-8 bg-dark text-white rounded-3xl shadow-2xl scale-105 relative z-20 group/item border border-white/10">
          <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center mb-4 animate-pulse shadow-[0_0_20px_rgba(97,182,222,0.4)]">
            <ChefHat size={32} />
          </div>
          <div className="text-xxs font-black uppercase text-primary tracking-widest mb-1">
            3. Kuchnia
          </div>
          <h4 className="font-bold mb-2 text-white text-lg">Backend</h4>
          <p className="text-xxs text-gray-300 leading-relaxed font-medium">
            Tu dzieje się magia. Kucharze (Języki Programowania) przygotowują dane, sprawdzają
            reguły i logikę.
          </p>
        </div>
        <div className="flex flex-col items-center text-center p-6 bg-white rounded-3xl border border-gray-100 hover:shadow-xl transition-all group/item">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover/item:scale-110 transition-all">
            <Warehouse size={32} />
          </div>
          <div className="text-xxs font-black uppercase text-emerald-600 tracking-widest mb-1">
            4. Spiżarnia
          </div>
          <h4 className="font-bold text-dark mb-2">Baza Danych</h4>
          <p className="text-xxs text-gray-500 leading-relaxed">
            Bezpieczny magazyn składników. Przechowuje profile użytkowników, ceny i historię
            zamówień.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RestaurantAnalogyVisual;
