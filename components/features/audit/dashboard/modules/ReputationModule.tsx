import React from 'react';
import { Star } from 'lucide-react';

interface ReputationModuleProps {
  rating: number;
  reviewsCount: number;
}

const ReputationModule: React.FC<ReputationModuleProps> = ({ rating, reviewsCount }) => {
  return (
    <div className="group p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-amber-100 transition-colors"></div>
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
            <Star size={24} />
          </div>
          <div className="flex flex-col items-end">
            <span className="text-lg font-black text-dark leading-none">
              {rating > 0 ? rating : '0.0'}
            </span>
            <span className="text-xxs text-gray-400 font-bold uppercase tracking-widest mt-1">
              Ocena Google
            </span>
          </div>
        </div>
        <h4 className="text-xl font-black text-dark mb-3">Reputacja</h4>
        <p className="text-sm text-gray-500 leading-relaxed font-medium">
          {reviewsCount < 5
            ? 'Brak dowodu społecznego. Klienci boją się zaufać firmie bez opinii.'
            : reviewsCount < 20
              ? 'Solidna podstawa, ale brakuje Ci skali, aby zostać niekwestionowanym liderem rynku.'
              : 'Lider Zaufania. Masz potężną przewagę, którą należy przekuć w większą sprzedaż.'}
        </p>
      </div>
    </div>
  );
};

export default ReputationModule;
