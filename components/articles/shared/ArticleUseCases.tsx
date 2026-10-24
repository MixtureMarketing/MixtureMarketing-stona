import React from 'react';

interface ArticleUseCasesProps {
  title: string;
  items: {
    title: string;
    desc: string;
    icon: React.ReactNode;
  }[];
  accentColor?: string;
}

const ArticleUseCases: React.FC<ArticleUseCasesProps> = ({
  title,
  items,
  accentColor = '#3F3D91',
}) => {
  // Bez tytułu nie renderujemy pustego <h3> (axe: empty-heading), a punkty wchodzą poziom
  // wyżej — inaczej <h4> szedłby bezpośrednio po <h2> sekcji (heading-order).
  const ItemHeading = title ? 'h4' : 'h3';
  return (
    <div className="my-24 bg-gray-50 p-8 md:p-12 rounded-[2rem] not-prose">
      {title && <h3 className="text-2xl font-bold text-dark mb-8">{title}</h3>}
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((item, i) => (
          <li key={i} className="flex gap-4">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${accentColor}1A`, color: accentColor }} // 1A to ~10% opacity
            >
              {item.icon}
            </div>
            <div>
              <ItemHeading className="font-bold text-dark">{item.title}</ItemHeading>
              <p className="text-xs text-gray-600 mt-1">{item.desc}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ArticleUseCases;
