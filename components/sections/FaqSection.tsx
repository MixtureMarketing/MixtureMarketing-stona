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
        {/* title="" celowo: StandardFaq ma domyślny props `title = 'Najczęstsze pytania'`
            i renderuje z niego własny <h2 class="sr-only">. Obok widocznego <h2>
            z SectionHeader dawało to DWA nagłówki poziomu 2 o tej samej treści pod
            rząd — czytnik ekranu ogłaszał je dwukrotnie. Pominięcie propsa nie
            wystarczy (default by wskoczył); pusty string wyłącza render. */}
        <StandardFaq items={items} title="" />
      </div>
    </section>
  );
};

export default FaqSection;
