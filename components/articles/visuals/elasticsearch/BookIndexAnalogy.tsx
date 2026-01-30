import React from 'react';
import { BookOpen, Book, Zap } from 'lucide-react';

const BookIndexAnalogy = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-16">
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative group overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
          <BookOpen size={120} />
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-xxs font-black uppercase tracking-wider mb-8">
          Baza SQL (Full Table Scan)
        </div>
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-center">
          <BookOpen size={32} className="mx-auto mb-4 text-gray-400 animate-bounce" />
          <p className="text-xs text-gray-600 leading-relaxed">
            To jak czytanie książki <strong>strona po stronie</strong>, by znaleźć konkretne słowo.
            Musisz przeczytać wszystko.
          </p>
        </div>
      </div>
      <div className="bg-secondary/5 p-8 rounded-3xl border-2 border-secondary/20 shadow-md relative group overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none text-secondary">
          <Book size={120} />
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xxs font-black uppercase tracking-wider mb-8 border border-secondary/20">
          Elasticsearch (Inverted Index)
        </div>
        <div className="p-4 bg-white rounded-xl border border-secondary/20 text-center shadow-lg">
          <Zap size={32} className="mx-auto mb-4 text-secondary" />
          <p className="text-xs text-gray-700 leading-relaxed font-medium">
            To jak zajrzenie na koniec książki do <strong>"Indeksu haseł"</strong>. Widzisz hasło i
            numery stron. Trafiasz do celu natychmiastowo.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookIndexAnalogy;
