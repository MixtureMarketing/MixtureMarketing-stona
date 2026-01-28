/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import Button from './Button';
import SectionHeader from './SectionHeader';
import Seo from './Seo';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <Seo
        title="404 - Nie znaleziono strony"
        description="Przepraszamy, ale strona której szukasz nie istnieje lub została przeniesiona."
      />
      <div className="mb-8">
        <div className="text-9xl font-black text-gray-100 absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none select-none">
          404
        </div>
        <div className="relative z-10">
          <SectionHeader
            level="h1"
            title="UPS! ZGUBIŁEŚ SIĘ?"
            subtitle="Błąd 404"
            description="Strona, której szukasz, nie istnieje lub została przeniesiona pod inny adres."
          />
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 relative z-10">
        <Button onClick={() => navigate('/')} icon={<Home size={18} />}>
          Wróć do strony głównej
        </Button>
        <Button variant="secondary" onClick={() => navigate(-1)} icon={<ArrowLeft size={18} />}>
          Poprzednia strona
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
