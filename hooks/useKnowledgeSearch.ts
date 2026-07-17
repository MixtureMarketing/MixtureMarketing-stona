import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { cmsService } from '@/services/cmsService';
import { Article } from '../types';

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
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  // Nawigacja z menu przy już otwartej bazie: param się zmienia bez remountu.
  useEffect(() => {
    const next = urlCategory && CATEGORY_IDS.has(urlCategory) ? urlCategory : 'all';
    setActiveCategoryState(next);
  }, [urlCategory]);

  const setActiveCategory = (id: string) => {
    setActiveCategoryState(id);
    setSearchParams(id === 'all' ? {} : { kategoria: id }, { replace: true });
  };

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const data = await cmsService.getArticles();
        setAllArticles(data);
      } catch (err) {
        console.error('Failed to load articles:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

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
