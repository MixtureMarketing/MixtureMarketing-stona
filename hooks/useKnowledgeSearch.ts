import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { cmsService } from '@/services/cmsService';
import { Article } from '../types';
import { useCmsDocument, CMS_LIST_KEY, CMS_DOC } from '@/hooks/useCmsDocument';

const CATEGORY_IDS = new Set(['tech', 'marketing', 'design', 'analytics', 'business']);

/**
 * Wyszukiwarka bazy wiedzy. Kategoria synchronizowana z URL-em
 * (?kategoria=tech|marketing|design|analytics|business) — dzięki temu
 * linki kategorii w mega menu prowadzą do PRZEFILTROWANEJ bazy, a nie do
 * tej samej strony co przycisk „cała baza" (fejk-taksonomia, audyt
 * 2026-07-16). Zmiana kategorii na stronie aktualizuje URL (replace —
 * bez zaśmiecania historii), więc widok da się też udostępnić linkiem.
 */
export const useKnowledgeSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCategory = searchParams.get('kategoria');
  const [activeCategory, setActiveCategoryState] = useState(
    urlCategory && CATEGORY_IDS.has(urlCategory) ? urlCategory : 'all',
  );
  const [searchQuery, setSearchQuery] = useState('');
  // MIX-1589: lista z zrzutu w prerenderowanym HTML (bez żądania do Sanity i bez
  // zwijania 30 kart do 6 szkieletów), a przy jego braku z Sanity — jak /portfolio/.
  // getArticles nie rzuca (błąd Sanity = rejestr), więc stan błędu tu nie wystąpi.
  const { status, data } = useCmsDocument<Article[]>(
    CMS_LIST_KEY,
    cmsService.getArticles,
    CMS_DOC.articleList,
  );
  const allArticles = useMemo(() => data ?? [], [data]);
  const loading = status === 'loading';

  // Nawigacja z menu przy już otwartej bazie: param się zmienia bez remountu.
  useEffect(() => {
    const next = urlCategory && CATEGORY_IDS.has(urlCategory) ? urlCategory : 'all';
    // eslint-disable-next-line react-hooks/set-state-in-effect -- synchronizacja z parametrem URL
    setActiveCategoryState(next);
  }, [urlCategory]);

  const setActiveCategory = (id: string) => {
    setActiveCategoryState(id);
    setSearchParams(id === 'all' ? {} : { kategoria: id }, { replace: true });
  };

  const filteredArticles = useMemo(() => {
    return allArticles.filter((article) => {
      const matchesCategory = activeCategory === 'all' || article.category === activeCategory;
      const matchesSearch =
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [allArticles, activeCategory, searchQuery]);

  return {
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    filteredArticles,
    loading,
  };
};
