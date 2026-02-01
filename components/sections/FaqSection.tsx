import React from 'react';
import SectionHeader from '../common/SectionHeader';
import StandardFaq, { FaqItem } from '../common/StandardFaq';

interface FaqSectionProps {
  title: string;
  subtitle?: string;
  description?: string;
  items: FaqItem[];
  bgClassName?: string;
}

const FaqSection: React.FC<FaqSectionProps> = ({
  title,
  subtitle,
  description,
  items,
  bgClassName = 'bg-white',
}) => {
  return (
    <section className={`py-24 relative z-10 ${bgClassName}`}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title={title}
          subtitle={subtitle}
          description={description}
          className="mb-12"
        />
        <StandardFaq items={items} />
      </div>
    </section>
  );
};

export default FaqSection;
