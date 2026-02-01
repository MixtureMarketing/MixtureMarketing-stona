import React from 'react';
import BaseCard from './BaseCard';

interface BenefitCardProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

const BenefitCard: React.FC<BenefitCardProps> = ({ icon, title, desc }) => (
  <BaseCard variant="solid" hover="lift" padding="md">
    <div
      className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-4 text-xl text-secondary shadow-sm"
      aria-hidden="true"
    >
      {icon}
    </div>
    <h3 className="font-bold text-lg text-dark mb-2">{title}</h3>
    <p className="text-sm text-gray-700 leading-relaxed">{desc}</p>
  </BaseCard>
);

export default BenefitCard;
