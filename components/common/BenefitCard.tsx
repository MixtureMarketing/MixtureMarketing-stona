import React from 'react';

interface BenefitCardProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

const BenefitCard: React.FC<BenefitCardProps> = ({ icon, title, desc }) => (
  <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
    <div
      className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-4 text-xl"
      aria-hidden="true"
    >
      {icon}
    </div>
    <h3 className="font-bold text-lg text-dark mb-2">{title}</h3>
    <p className="text-sm text-gray-700 leading-relaxed">{desc}</p>
  </div>
);

export default BenefitCard;
