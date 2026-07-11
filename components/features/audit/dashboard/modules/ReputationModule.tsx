import React from 'react';
import { Star } from 'lucide-react';
import { cardCls, IconTile } from '../ui';

interface ReputationModuleProps {
  rating: number;
  reviewsCount: number;
}

const ReputationModule: React.FC<ReputationModuleProps> = ({ rating, reviewsCount }) => {
  const full = Math.round(rating);
  return (
    <div className={`${cardCls} h-full p-5`}>
      <div className="flex items-start justify-between mb-3.5">
        <IconTile tone="amber">
          <Star size={20} />
        </IconTile>
        <div className="text-right">
          <div className="text-lg font-extrabold text-dark leading-none tabular-nums">
            {rating > 0 ? rating.toFixed(1).replace('.', ',') : '0,0'}
          </div>
          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.06em] mt-1">
            Ocena Google
          </div>
        </div>
      </div>
      <h4 className="text-[15px] font-bold text-dark mb-1.5">Reputacja</h4>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-amber-500 text-sm tracking-[1px]" aria-hidden>
          {'★'.repeat(full)}
          <span className="text-gray-200">{'★'.repeat(5 - full)}</span>
        </span>
        <span className="text-[12px] text-gray-400 tabular-nums">{reviewsCount} opinii</span>
      </div>
      <p className="text-[12.5px] text-gray-500 leading-relaxed">
        {reviewsCount < 5
          ? 'Brak dowodu społecznego. Klienci boją się zaufać firmie bez opinii.'
          : reviewsCount < 20
            ? 'Solidna podstawa, ale brakuje skali, by zostać liderem rynku.'
            : 'Lider zaufania. Masz przewagę, którą warto przekuć w sprzedaż.'}
      </p>
    </div>
  );
};

export default ReputationModule;
